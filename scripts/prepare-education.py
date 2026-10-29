"""Install the three reviewed, redacted certificate raster pages.

Input is the approved derivative directory, never the original PDF. Pinned
hashes ensure no unreviewed personal page can accidentally replace these files.
The original three-page PDF remains private and unchanged.
"""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
from PIL import Image


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reviewed_directory", type=Path)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    manifest = json.loads((root / "content/scan-imports/education.json").read_text())
    assert manifest["sourcePages"] == 3 and manifest["publicPages"] == [1, 2, 3]
    for page in manifest["publicAssets"]:
        source = args.reviewed_directory / page["src"]
        if hashlib.sha256(source.read_bytes()).hexdigest() != page["sha256"]:
            raise ValueError(f"Unreviewed certificate bytes: {source.name}")
        with Image.open(source) as image:
            if image.format != "WEBP" or image.size != (page["width"], page["height"]):
                raise ValueError("Unexpected certificate format or dimensions")
            if image.getexif() or any(key in image.info for key in ("exif", "xmp", "icc_profile")):
                raise ValueError("Certificate must contain pixels without source metadata")
        shutil.copyfile(source, root / "public/assets" / page["src"])
    print("Installed 3 approved certificate pages; original PDF untouched.")


if __name__ == "__main__":
    main()
