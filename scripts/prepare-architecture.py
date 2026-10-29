"""Extract and conservatively prepare four supplied architecture presentation sheets.

Requires Pillow, NumPy and Poppler. The input PDFs remain unchanged.
    python3 scripts/prepare-architecture.py "/path/to/Telegram Desktop"
"""

import argparse
from pathlib import Path
import subprocess
import tempfile
import unicodedata

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SHEETS = (
    {"file": "Отсканированные документы (2).pdf", "id": "single-storey-house", "size": (2786, 1714), "power": 1.15},
    {"file": "ПЛАН ПЕРЕКРЫТИЯ М 1100.pdf", "id": "house-construction", "size": (2075, 2694), "power": 1.2, "cover": (20, 10, 800, 810)},
    {"file": "ПЛАН 2-ГО ЭТАЖА.pdf", "id": "low-rise-house", "size": (3053, 2101), "power": 1.07, "cover": (1555, 1135, 3035, 2080)},
    {"file": "ПОМЕЩЕНИЙ.pdf", "id": "folded-roof-cafe", "size": (1765, 2333), "power": 1.06, "cover": (12, 12, 1753, 1000)},
)


def repair_vertical_strip(image, centers, half_width):
    """Interpolate a narrow scanner gap from its two existing edges."""
    pixels = np.asarray(image).copy()
    for y, x in centers:
        left, right = x - half_width, x + half_width
        a = np.median(pixels[y, left - 3:left], axis=0)
        b = np.median(pixels[y, right + 1:right + 4], axis=0)
        for column in range(left, right + 1):
            fraction = (column - left + 1) / (right - left + 2)
            pixels[y, column] = np.rint(a * (1 - fraction) + b * fraction)
    return Image.fromarray(pixels)


def remove_blank_margin_hardware(image):
    # The right hanging clip lies entirely on unmarked paper. Clone adjacent
    # paper locally; the illustration, lettering and drawn site plan are kept.
    box = (1475, 0, 1550, 210)
    patch = image.crop((box[0] + 100, box[1], box[2] + 100, box[3]))
    mask = Image.new("L", patch.size)
    draw = ImageDraw.Draw(mask)
    draw.rectangle((5, 0, 70, 205), fill=255)
    image.paste(patch, box[:2], mask.filter(ImageFilter.GaussianBlur(2)))
    # Only the thin left suspension wire is replaced, retaining the diagonal
    # site-plan strokes on either side of it.
    return repair_vertical_strip(image, [(y, round(248 - y * .025)) for y in range(122)], 5)


def prepare(path, destination, spec):
    with Image.open(path) as source:
        image = source.convert("RGB")
    if image.size != spec["size"]:
        raise ValueError(f"Unexpected source dimensions for {spec['id']}: {image.size}")
    if spec["id"] == "low-rise-house":
        # A photographed join between two sheets, not an architectural line.
        for start, end, half_width in [(0, 500, 5), (500, 1000, 4), (1000, image.height, 3)]:
            image = repair_vertical_strip(image, [(y, round(1546 - y * .0035)) for y in range(start, end)], half_width)
    if spec["id"] == "folded-roof-cafe":
        image = remove_blank_margin_hardware(image)
    if spec["id"] == "single-storey-house":
        box = (495, 1361, 544, 1410)
        patch = image.crop(box)
        mask = Image.new("L", patch.size)
        ImageDraw.Draw(mask).ellipse((14, 14, 32, 32), fill=255)
        image.paste(patch.filter(ImageFilter.MedianFilter(21)), box[:2], mask.filter(ImageFilter.GaussianBlur(.7)))
    curve = [round(255 * (value / 255) ** spec["power"]) for value in range(256)]
    image = image.point(curve * 3)
    sheet = image.crop((12, 12, image.width - 12, image.height - 12))
    sheet.save(destination / f"{spec['id']}-sheet.webp", "WEBP", quality=94, method=6)
    print(f"{spec['id']}-sheet.webp: {sheet.width} x {sheet.height}")
    if spec.get("cover"):
        cover = image.crop(spec["cover"])
        if spec["id"] == "low-rise-house":
            # Remove a clipped neighbouring plan from the cover's paper margin.
            # The complete original composition remains on the project page.
            paper = image.crop((1600, 12, 2040, 237))
            y, x = np.mgrid[:paper.height, :paper.width]
            feather = np.minimum(np.clip((paper.width - 1 - x) / 64, 0, 1), np.clip((paper.height - 1 - y) / 64, 0, 1))
            cover.paste(paper, (0, 0), Image.fromarray(np.rint(feather * 255).astype("uint8")))
        cover.thumbnail((1600, 1200), Image.Resampling.LANCZOS)
        cover.save(destination / f"{spec['id']}-cover.webp", "WEBP", quality=92, method=6)
        print(f"{spec['id']}-cover.webp: {cover.width} x {cover.height}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_directory", type=Path)
    args = parser.parse_args()
    files = {unicodedata.normalize("NFC", p.name): p for p in args.source_directory.glob("*.pdf")}
    destination = ROOT / "public/assets"
    with tempfile.TemporaryDirectory(prefix="architecture-scans-") as temporary:
        for spec in SHEETS:
            source = files[spec["file"]]
            prefix = Path(temporary) / spec["id"]
            subprocess.run(["pdfimages", "-png", str(source), str(prefix)], check=True)
            scans = sorted(Path(temporary).glob(f"{spec['id']}-*.png"))
            if len(scans) != 1:
                raise ValueError(f"Expected one scanned sheet in {source.name}")
            prepare(scans[0], destination, spec)


if __name__ == "__main__":
    main()
