#!/usr/bin/env python3
"""Prepare the three practice photos without changing framing or colours."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps

PHOTOS = [
    ('IMG_2790.jpeg', 'practice-house-model.webp'),
    ('IMG_2792.jpeg', 'practice-sochi-facades.webp'),
    ('IMG_2788.jpeg', 'practice-workspace.webp'),
]

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Directory containing the original JPEGs')
    parser.add_argument('--output', type=Path, default=Path('public/assets'))
    parser.add_argument('--metadata', type=Path, default=Path('content/scan-imports/practice-2026.json'))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    photos = []
    for original, asset in PHOTOS:
        source = args.source / original
        with Image.open(source) as image:
            photo = ImageOps.exif_transpose(image).convert('RGB')
            target = args.output / asset
            photo.save(target, 'WEBP', quality=94, method=6)
            photos.append({
                'sourceFile': original, 'sourceSha256': sha256(source),
                'asset': asset, 'width': photo.width, 'height': photo.height,
                'processedSha256': sha256(target),
            })
    args.metadata.parent.mkdir(parents=True, exist_ok=True)
    args.metadata.write_text(json.dumps({
        'period': '2026-05/2026-06',
        'processing': 'EXIF orientation only, full frame, RGB WebP quality 94; no crop, colour correction or generation. Original JPEGs remain unchanged outside public assets.',
        'photos': photos,
    }, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    main()
