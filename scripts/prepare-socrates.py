"""Prepare the two supplied scans without generating or redrawing artwork.

Requires Pillow and Poppler's pdfimages. Run with the original two-page PDF:
    python3 scripts/prepare-socrates.py /path/to/source.pdf
"""

import argparse
import math
from pathlib import Path
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SCANS = (
    {"size": (1674, 2189), "power": 1.55, "speck": (131, 593, 5), "top": 24},
    {"size": (1527, 2035), "power": 1.35, "speck": (817, 1070, 9), "top": 12},
)


def prepare(source, destination, spec):
    with Image.open(source) as image:
        if image.size != spec["size"]:
            raise ValueError(f"Unexpected scan dimensions: {image.size}")
        gray = image.convert("L")

    # Remove only the inspected dust speck. No filtering of the drawing itself.
    x, y, radius = spec["speck"]
    box = (x - 24, y - 24, x + 25, y + 25)
    patch = gray.crop(box)
    repaired = patch.filter(ImageFilter.MedianFilter(21))
    mask = Image.new("L", patch.size)
    ImageDraw.Draw(mask).ellipse((24 - radius, 24 - radius, 24 + radius, 24 + radius), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(.7))
    gray.paste(repaired, box[:2], mask)

    # A monotonic tone curve deepens the existing graphite, with no clipped
    # black point, sharpening, invented detail, or erased construction lines.
    curve = [round(255 * math.pow(value / 255, spec["power"])) for value in range(256)]
    gray = gray.point(curve)
    # Trim the narrow scanned sheet edges, keeping the complete drawing.
    gray = gray.crop((12, spec["top"], gray.width - 12, gray.height - 12))
    gray.save(destination, "WEBP", quality=95, method=6)
    print(f"{destination.relative_to(ROOT)}: {gray.width} x {gray.height}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    if not args.pdf.is_file():
        parser.error("The source PDF does not exist")
    destination = ROOT / "public/assets"
    with tempfile.TemporaryDirectory(prefix="socrates-scans-") as temporary:
        prefix = Path(temporary) / "scan"
        subprocess.run(["pdfimages", "-png", str(args.pdf.resolve()), str(prefix)], check=True)
        scans = sorted(Path(temporary).glob("scan-*.png"))
        if len(scans) != len(SCANS):
            raise ValueError("Expected exactly two scanned images")
        for index, (scan, spec) in enumerate(zip(scans, SCANS), start=1):
            prepare(scan, destination / f"socrates-{index:02}.webp", spec)


if __name__ == "__main__":
    main()
