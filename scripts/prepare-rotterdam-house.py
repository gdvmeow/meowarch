#!/usr/bin/env python3
"""Extract the complete Rotterdam sheet and a complete elevation detail."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
from PIL import Image

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, default=Path('public/assets'))
    parser.add_argument('--metadata', type=Path, default=Path('content/scan-imports/rotterdam-house.json'))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    assets = []
    with tempfile.TemporaryDirectory(prefix='rotterdam-sheet-') as directory:
        prefix = Path(directory) / 'scan'
        subprocess.run(['pdfimages', '-png', str(args.source), str(prefix)], check=True)
        scans = sorted(Path(directory).glob('scan-*.png'))
        if len(scans) != 1:
            raise ValueError('Expected exactly one embedded scanned sheet')
        with Image.open(scans[0]) as source:
            image = source.convert('RGB')
        if image.size != (1978, 2630):
            raise ValueError(f'Unexpected sheet dimensions: {image.size}')
        for name, box in [
            ('rotterdam-house-sheet.webp', (0, 0, 1978, 2630)),
            ('rotterdam-house-elevation.webp', (558, 373, 1424, 2591)),
        ]:
            prepared = image.crop(box)
            target = args.output / name
            prepared.save(target, 'WEBP', quality=95, method=6)
            assets.append({
                'src': name, 'width': prepared.width, 'height': prepared.height,
                'cropBox': list(box), 'sha256': sha256(target),
            })
    args.metadata.parent.mkdir(parents=True, exist_ok=True)
    args.metadata.write_text(json.dumps({
        'sourceFile': args.source.name,
        'sourceSha256': sha256(args.source),
        'sourcePages': 1,
        'projectId': 'two-family-house-rotterdam',
        'sourceTitle': 'TWO-FAMILY HOUSE IN ROTTERDAM',
        'processing': 'Native-resolution embedded image; RGB WebP quality 95, method 6. Full sheet plus complete elevation crop. No resizing, colour correction, retouching or generation. Original PDF is unchanged and remains outside public assets.',
        'assets': assets,
    }, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    main()
