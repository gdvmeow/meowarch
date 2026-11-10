#!/usr/bin/env python3
"""Prepare all six reviewed images from the three November portfolio inputs.

The four-page PDF contains four awards. The JPEG is a fifth award. The other
PDF is an Antinous drawing, not an award; it belongs to the existing project.
Original files remain outside the repository and are never modified.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
from PIL import Image


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def save_image(source, target):
    with Image.open(source) as image:
        pixels = image.convert('RGB')
    # A new pixel-only image drops EXIF, XMP and document metadata.
    pixels = Image.frombytes('RGB', pixels.size, pixels.tobytes())
    target.parent.mkdir(parents=True, exist_ok=True)
    pixels.save(target, 'WEBP', quality=95, method=6)
    return {'src': str(target.relative_to(ROOT / 'public/assets')), 'width': pixels.width,
            'height': pixels.height, 'sha256': digest(target)}


ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_directory', type=Path)
    args = parser.parse_args()
    specs = [
        ('Муниципальное_бюджетное_учреждение.pdf', [
            ('art-school-letter-2024', 'award'),
            ('we-together-certificate', 'award'),
            ('we-together-diploma-2024', 'award'),
            ('spring-palette-diploma-2023', 'award'),
        ]),
        ('photo_2026-11-09_19-34-37.jpg', [('on-our-land-diploma-2024', 'award')]),
        ('Отсканированные документы.pdf', [('antinous-scan', 'artwork')]),
    ]
    sources, awards, drawing = [], [], None
    with tempfile.TemporaryDirectory(prefix='meowarch-awards-') as temp:
        for number, (name, entries) in enumerate(specs):
            source = args.source_directory / name
            paths = [source]
            if source.suffix == '.pdf':
                prefix = Path(temp) / f'source-{number}'
                subprocess.run(['pdfimages', '-png', str(source), str(prefix)], check=True)
                paths = sorted(Path(temp).glob(f'source-{number}-*.png'))
            if len(paths) != len(entries):
                raise ValueError(f'Unexpected image count in {name}: {len(paths)}')
            source_entry = {'file': name, 'sha256': digest(source), 'pages': len(paths), 'images': []}
            for page, (path, (identifier, kind)) in enumerate(zip(paths, entries), 1):
                relative = f'awards/{identifier}.webp' if kind == 'award' else f'{identifier}.webp'
                asset = save_image(path, ROOT / 'public/assets' / relative)
                entry = {'id': identifier, 'sourcePage': page, 'kind': kind, **asset}
                source_entry['images'].append(entry)
                if kind == 'award':
                    awards.append({key: entry[key] for key in ['id', 'src', 'width', 'height', 'sha256']})
                else:
                    drawing = entry
            sources.append(source_entry)
    manifest = {
        'sourceFileCount': 3, 'reviewedImageCount': 6, 'awardCount': 5,
        'processing': 'Native-resolution full-frame RGB WebP, quality 95. No crop, resizing, colour correction, retouching or generation. Pixel-only derivatives contain no EXIF, XMP, hidden text or source document metadata. Original files are unchanged and stay outside Git and public assets.',
        'classification': 'Four awards in the four-page PDF, one diploma in the JPEG, and one Antinous drawing in the single-page PDF. The drawing is attached to the existing Antinous project and is not described as an award.',
        'sources': sources,
    }
    (ROOT / 'content/scan-imports/awards-2026-11.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'src/awardDocuments.js').write_text('// Five individually reviewed awards. Source inventory: content/scan-imports/awards-2026-11.json.\nexport const awardDocuments = ' + json.dumps(awards, ensure_ascii=False, indent=2) + ';\n\nexport const antinousScan = ' + json.dumps({key: drawing[key] for key in ['src', 'width', 'height', 'sha256']}, indent=2) + ';\n')
    print(f'Prepared {len(awards)} awards and one Antinous scan from all three inputs.')


if __name__ == '__main__':
    main()
