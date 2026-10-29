"""Prepare reviewed, unique scans from the 24-page portfolio dump.

Only deterministic pixel correction is used. Requires Pillow, NumPy and
Poppler. Original PDFs and extracted scans are never overwritten.
"""

import argparse
import json
from pathlib import Path
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SCANS = [
    {"page": 5, "asset": "towered-cathedral", "power": 1.18, "gray": True},
    {"page": 7, "asset": "arcaded-facade", "power": 1.4, "gray": True},
    {"page": 9, "asset": "portal-facade", "power": 1.45, "gray": True, "rotate": True},
    {"page": 10, "asset": "three-domed-church", "power": 1.2, "gray": True, "rotate": True},
    {"page": 11, "asset": "rotunda", "power": 1.3, "gray": True, "rotate": True},
    {"page": 12, "asset": "graphic-textures", "power": 1.02, "gray": True},
    {"page": 13, "asset": "line-landscape", "power": 1.03, "gray": True, "rotate": True},
    {"page": 15, "asset": "garden-site-plan", "power": 1.04},
    {"page": 16, "asset": "projection-study", "power": 1.8, "gray": True, "rotate": True, "local_paper": True},
    {"page": 17, "asset": "geometric-solids", "power": 1.65, "gray": True, "rotate": True, "local_paper": True},
    {"page": 18, "asset": "residential-section", "power": 1.55, "gray": True, "rotate": True, "local_paper": True},
    {"page": 19, "asset": "residential-floor-plan", "power": 1.55, "gray": True, "rotate": True, "local_paper": True},
    {"page": 20, "asset": "drawing-studio", "power": 1.2, "gray": True},
    {"page": 21, "asset": "faceted-head", "power": 1.2, "gray": True},
    {"page": 23, "asset": "head-muscles", "power": 1.3, "gray": True},
    {"page": 24, "asset": "skull-studies", "power": 1.25, "gray": True},
]


def background_correction(image):
    """Fit illumination using unmarked paper along the sheet's margins.

    A smooth quadratic surface changes exposure/white balance only. It does
    not infer texture, draw lines, sharpen edges, or filter the artwork.
    """
    pixels = np.asarray(image, dtype=np.float32)
    height, width = pixels.shape[:2]
    samples, values = [], []
    for y in np.linspace(.035, .965, 18):
        for x in np.linspace(.035, .965, 18):
            if .1 < x < .9 and .1 < y < .9:
                continue
            cx, cy = round(x * (width - 1)), round(y * (height - 1))
            patch = pixels[max(0, cy - 10):cy + 11, max(0, cx - 10):cx + 11]
            samples.append([1, x, y, x * x, x * y, y * y])
            values.append(np.percentile(patch.reshape(-1, 3), 90, axis=0))
    matrix, values = np.array(samples), np.array(values)
    coefficients = np.linalg.lstsq(matrix, values, rcond=None)[0]
    # Reject samples obscured by a signature, frame or dark scanner border.
    for _ in range(3):
        residual = np.mean(values - matrix @ coefficients, axis=1)
        keep = residual > -max(10, float(np.std(residual) * 1.5))
        coefficients = np.linalg.lstsq(matrix[keep], values[keep], rcond=None)[0]
    y, x = np.mgrid[:height, :width].astype(np.float32)
    x /= max(1, width - 1)
    y /= max(1, height - 1)
    illumination = sum(term[..., None] * coefficient for term, coefficient in zip(
        [np.ones_like(x), x, y, x * x, x * y, y * y], coefficients))
    corrected = pixels / np.maximum(illumination, 32) * 251
    return Image.fromarray(np.clip(np.rint(corrected), 0, 255).astype("uint8"))


def repair_hair_in_blank_margin(image):
    # A thin curved fibre below the arcade, above/beside the author's name.
    # The mask follows the fibre; the architecture and signature are excluded.
    points = [(32, 2018), (90, 2024), (135, 2031), (170, 2041), (200, 2041),
              (225, 2040), (255, 2029), (280, 2015), (310, 1997), (330, 1985),
              (345, 1987), (375, 2005), (410, 2021), (445, 2042), (465, 2062),
              (480, 2083), (492, 2111), (504, 2152), (518, 2198), (529, 2237)]
    # Refine the path within this reviewed blank-paper band. The fibre is
    # darker than its immediate paper; the signature lies outside the band.
    gray = np.asarray(image.convert("L").filter(ImageFilter.GaussianBlur(1.2)))
    anchors_x, anchors_y = np.array(points).T
    traced = []
    for x in range(points[0][0], points[-1][0] + 1):
        expected = round(float(np.interp(x, anchors_x, anchors_y)))
        top, bottom = max(1940, expected - 28), min(image.height, expected + 29)
        y = top + int(np.argmin(gray[top:bottom, x]))
        traced.append((x, y))
    mask = Image.new("L", image.size)
    ImageDraw.Draw(mask).line(traced, fill=255, width=9, joint="curve")
    # Median-filter only a small blank-paper patch inside that explicit mask.
    box = (10, 1940, 550, image.height)
    patch = image.crop(box)
    image.paste(patch.filter(ImageFilter.MedianFilter(17)), box[:2], mask.crop(box).filter(ImageFilter.GaussianBlur(.7)))
    return image


def level_technical_paper(image):
    """Remove broad scanner shadows on sparse technical sheets.

    Local 90th-percentile paper samples estimate a low-frequency exposure
    field. Division adjusts existing pixels; no line or surface is painted.
    This is deliberately limited to the four sparse construction drawings.
    """
    values = np.asarray(image, dtype=np.float32)
    height, width = values.shape
    columns, rows = 16, 24
    samples = np.empty((rows, columns), dtype=np.float32)
    for row in range(rows):
        for column in range(columns):
            patch = values[round(row * height / rows):round((row + 1) * height / rows),
                           round(column * width / columns):round((column + 1) * width / columns)]
            samples[row, column] = np.percentile(patch, 90)
    field = Image.fromarray(samples).resize(image.size, Image.Resampling.BICUBIC)
    corrected = values / np.maximum(np.asarray(field), 128) * 250
    return Image.fromarray(np.clip(np.rint(corrected), 0, 255).astype("uint8"))


def prepare(path, destination, spec):
    with Image.open(path) as source:
        image = source.convert("RGB")
    image = background_correction(image)
    if spec["page"] == 7:
        image = repair_hair_in_blank_margin(image)
    if spec.get("gray"):
        image = image.convert("L")
    if spec.get("local_paper"):
        image = level_technical_paper(image)
    curve = [round(255 * (value / 255) ** spec["power"]) for value in range(256)]
    image = image.point(curve if image.mode == "L" else curve * 3)
    if spec.get("rotate"):
        image = image.transpose(Image.Transpose.ROTATE_90)
    image = image.crop((12, 12, image.width - 12, image.height - 12))
    output = destination / f"{spec['asset']}.webp"
    image.save(output, "WEBP", quality=94, method=6)
    return {"page": spec["page"], "src": output.name, "width": image.width, "height": image.height}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--metadata", type=Path)
    args = parser.parse_args()
    metadata = []
    with tempfile.TemporaryDirectory(prefix="portfolio-dump-") as temporary:
        prefix = Path(temporary) / "scan"
        subprocess.run(["pdfimages", "-all", str(args.pdf.resolve()), str(prefix)], check=True)
        scans = sorted(Path(temporary).glob("scan-*.jpg"))
        if len(scans) != 24:
            raise ValueError(f"Expected 24 original scans, found {len(scans)}")
        for spec in SCANS:
            result = prepare(scans[spec["page"] - 1], ROOT / "public/assets", spec)
            metadata.append(result)
            print(json.dumps(result), flush=True)
    if args.metadata:
        args.metadata.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
