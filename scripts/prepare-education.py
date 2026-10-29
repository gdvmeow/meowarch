"""Extract only the reviewed public cover of the education certificate.

The original PDF and its two personal pages are never published or modified.
Requires Pillow and Poppler. Output contains pixels only, without PDF text
or source metadata. See content/scan-imports/education.json.
"""

import argparse
from pathlib import Path
import subprocess
import tempfile

from PIL import Image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    with tempfile.TemporaryDirectory(prefix="education-cover-") as temporary:
        prefix = Path(temporary) / "cover"
        subprocess.run(["pdfimages", "-f", "1", "-l", "1", "-png", str(args.pdf.resolve()), str(prefix)], check=True)
        scans = sorted(Path(temporary).glob("cover-*.png"))
        if len(scans) != 1:
            raise ValueError("Expected exactly one cover image on page 1")
        with Image.open(scans[0]) as original:
            if original.size != (1687, 2179):
                raise ValueError("Unexpected certificate cover dimensions")
            original.convert("RGB").crop((12, 12, 1675, 2167)).save(
                root / "public/assets/education-certificate.webp", "WEBP", quality=94, method=6)


if __name__ == "__main__":
    main()
