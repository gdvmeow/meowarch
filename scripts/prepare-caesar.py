#!/usr/bin/env python3
"""Prepare the supplied Caesar HEIC as a full-frame, metadata-free web image.

Requires libheif's heif-convert, ImageMagick 7 and Pillow with LittleCMS.
The source stays read-only. Tone-only processing leaves the full pixel geometry
unchanged; it does not redraw, retouch, crop or resample the drawing.
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
        neutral = Path(directory) / 'neutral.miff'
        paper = Path(directory) / 'paper.miff'
        toned = Path(directory) / 'toned.png'
        clean_source = Path(directory) / 'srgb.png'
        clean.save(clean_source, 'PNG')
        # Estimate only a low-frequency paper illumination field. The drawing's
        # pixels themselves are never resampled, warped or selectively erased.
        subprocess.run(['magick', str(clean_source), '-colorspace', 'Gray',
                        '-depth', '16', str(neutral)], check=True)
        subprocess.run(['magick', str(neutral), '-resize', '10%',
                        '-morphology', 'Dilate', 'Disk:10', '-blur', '0x6',
                        '-resize', '2296x3061!', str(paper)], check=True)
        subprocess.run(['magick', str(neutral), str(paper), '-compose', 'DivideSrc',
                        '-composite', '-gamma', '0.7', '-evaluate', 'Add', '1.4%',
                        '-clamp', '-colorspace', 'sRGB', '-depth', '8', '-strip',
                        str(toned)], check=True)
        args.output.mkdir(parents=True, exist_ok=True)
        target = args.output / 'caesar-study-white.webp'
        with Image.open(toned) as result:
            prepared_pixels = Image.frombytes('RGB', result.size, result.convert('RGB').tobytes())
        prepared_pixels.save(target, 'WEBP', quality=95, method=6)
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
        'processing': 'Full frame at native resolution. HEIC decoded with libheif; embedded Display P3 profile converted to sRGB. Neutral grayscale, smooth paper illumination normalization and a gentle nonlinear curve whiten paper while preserving faint pencil marks. RGB WebP quality 95, method 6. EXIF, GPS and XMP metadata removed. No crop, resampling of the drawing, geometric transform, retouching or generation. The original HEIC is unchanged and remains outside public assets.',
        'toneCorrection': {
            'paperField': 'Grayscale luminance, 10% field resolution, dilate Disk:10, Gaussian blur sigma 6, interpolate field to native dimensions.',
            'normalization': 'Native-resolution grayscale divided by smooth paper field.',
            'gamma': 0.7,
            'whiteLiftPercent': 1.4,
            'geometry': '2296 x 3061, full frame, no drawing resampling or geometric transform.',
            'review': 'Full sheet and enlarged forehead, crown and neck compared with the previous uncorrected publication; faint construction lines remain visible.',
        },
        'assets': [{
            'src': target.name, 'width': clean.width, 'height': clean.height,
            'sha256': sha256(target),
        }],
    }, ensure_ascii=False, indent=2) + '\n')
    print(f'{target}: {clean.width} x {clean.height}, {target.stat().st_size} bytes')


if __name__ == '__main__':
    main()
