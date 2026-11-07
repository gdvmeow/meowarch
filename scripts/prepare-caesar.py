#!/usr/bin/env python3
"""Prepare the supplied Caesar HEIC as a full-frame, metadata-free web image.

Requires libheif's heif-convert and Pillow with LittleCMS support.
The source is read-only: no redrawing, retouching, crop or tonal adjustments.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tempfile

from PIL import Image, ImageCms


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, default=Path('public/assets'))
    parser.add_argument('--metadata', type=Path, default=Path('content/scan-imports/caesar.json'))
    args = parser.parse_args()
    source_hash = sha256(args.source)
    with tempfile.TemporaryDirectory(prefix='caesar-sheet-') as directory:
        decoded = Path(directory) / 'source.png'
        subprocess.run(['heif-convert', str(args.source.resolve()), str(decoded)], check=True)
        with Image.open(decoded) as source:
            if source.size != (2296, 3061):
                raise ValueError(f'Unexpected source dimensions: {source.size}')
            if not source.info.get('icc_profile'):
                raise ValueError('Expected the source colour profile')
            source_profile = ImageCms.ImageCmsProfile(io.BytesIO(source.info['icc_profile']))
            image = ImageCms.profileToProfile(
                source, source_profile, ImageCms.createProfile('sRGB'), outputMode='RGB',
            )
        # Fresh pixel storage excludes source EXIF, GPS and XMP metadata.
        clean = Image.frombytes('RGB', image.size, image.tobytes())
        args.output.mkdir(parents=True, exist_ok=True)
        target = args.output / 'caesar-study.webp'
        clean.save(target, 'WEBP', quality=95, method=6)
    if sha256(args.source) != source_hash:
        raise ValueError('The original source changed during preparation')
    with Image.open(target) as prepared:
        if prepared.size != (2296, 3061) or prepared.getexif() or any(
            key in prepared.info for key in ('exif', 'xmp')
        ):
            raise ValueError('Unexpected output dimensions or private metadata')
    args.metadata.parent.mkdir(parents=True, exist_ok=True)
    args.metadata.write_text(json.dumps({
        'sourceFile': args.source.name,
        'sourceSha256': source_hash,
        'projectId': 'caesar-study',
        'sourceTitle': 'Цезарь',
        'processing': 'Full frame at native resolution. HEIC decoded with libheif; embedded Display P3 profile converted to sRGB; RGB WebP quality 95, method 6. EXIF, GPS and XMP metadata removed. No crop, resizing, tonal adjustment, retouching or generation. The original HEIC is unchanged and remains outside public assets.',
        'assets': [{
            'src': target.name, 'width': clean.width, 'height': clean.height,
            'sha256': sha256(target),
        }],
    }, ensure_ascii=False, indent=2) + '\n')
    print(f'{target}: {clean.width} x {clean.height}, {target.stat().st_size} bytes')


if __name__ == '__main__':
    main()
