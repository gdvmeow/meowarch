#!/usr/bin/env python3
"""Build full-frame responsive card previews without changing any original asset."""
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    result = subprocess.run(['node', '--input-type=module', '-e',
        "import {projects} from './src/data.js'; console.log(JSON.stringify(projects.map(p => p.cover ?? p.images[0])))"],
        cwd=ROOT, check=True, text=True, capture_output=True)
    covers = {image['src']: image for image in json.loads(result.stdout)}
    mapping, entries = {}, []
    preview_directory = ASSETS / 'previews'
    preview_directory.mkdir(parents=True, exist_ok=True)
    for source, image in covers.items():
        original = ASSETS / source
        original_hash = digest(original)
        with Image.open(original) as opened:
            pixels = opened.convert('RGB')
            if pixels.size != (image['width'], image['height']):
                raise ValueError(f'Unexpected dimensions: {source}')
        stem = Path(source).with_suffix('').as_posix().replace('/', '-')
        variants = []
        for width in [400, 800, 1200, 1600]:
            if width >= pixels.width:
                continue
            height = round(pixels.height * width / pixels.width)
            prepared = pixels.resize((width, height), Image.Resampling.LANCZOS)
            prepared = Image.frombytes('RGB', prepared.size, prepared.tobytes())
            target = preview_directory / f'{stem}-{width}.webp'
            prepared.save(target, 'WEBP', quality=90, method=6)
            variants.append({'src': target.relative_to(ASSETS).as_posix(), 'width': width, 'height': height,
                             'bytes': target.stat().st_size, 'sha256': digest(target)})
        if digest(original) != original_hash:
            raise ValueError(f'Original asset changed: {source}')
        mapping[source] = [{'src': variant['src'], 'width': variant['width']} for variant in variants]
        entries.append({'original': source, 'width': pixels.width, 'height': pixels.height,
                        'originalBytes': original.stat().st_size, 'originalSha256': original_hash,
                        'variants': variants})
    # The already-published Lyublino cover is a wide, complete project rendering.
    social_source = ASSETS / 'lyublino/cover.webp'
    with Image.open(social_source) as opened:
        social = opened.convert('RGB')
        social = social.resize((1200, round(social.height * 1200 / social.width)), Image.Resampling.LANCZOS)
    social = Image.frombytes('RGB', social.size, social.tobytes())
    social_path = ASSETS / 'social-preview.jpg'
    social.save(social_path, 'JPEG', quality=94, optimize=True, progressive=True)
    manifest = {'processing': 'Full-frame LANCZOS previews at widths below the original only; WebP quality 90. No crop, colour correction, retouching or generation. Every original remains byte-for-byte unchanged and is used on the project page and in the viewer. Previews and social JPEG contain no source metadata.',
                'assets': entries, 'social': {'source': 'lyublino/cover.webp', 'sourceSha256': digest(social_source),
                'src': 'social-preview.jpg', 'width': social.width, 'height': social.height, 'sha256': digest(social_path)}}
    (ROOT / 'content/responsive-previews.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'src/imagePreviews.js').write_text('// Full-frame derivatives for card images only. Original project images are unchanged.\nexport const imagePreviews = ' + json.dumps(mapping, ensure_ascii=False, indent=2) + ';\n')
    original_bytes = sum(entry['originalBytes'] for entry in entries)
    small_bytes = sum(entry['variants'][0]['bytes'] if entry['variants'] else entry['originalBytes'] for entry in entries)
    print(f'{len(entries)} covers: originals {original_bytes:,} bytes; 400px previews {small_bytes:,} bytes ({(1-small_bytes/original_bytes)*100:.1f}% less).')


if __name__ == '__main__':
    main()
