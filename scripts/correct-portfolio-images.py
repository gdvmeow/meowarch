#!/usr/bin/env python3
"""Make deterministic, full-frame tonal corrections; never overwrite source assets.

Run after prepare-awards.py and before prepare-previews.py. This is ordinary
white balance, exposure, a sampled paper illumination field, levels and mild
sharpening. No generation, inpainting, tracing, text replacement or upscaling.
"""
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rgb(path):
    with Image.open(path) as source:
        return source.convert('RGB')


def levels(values, black, white, power):
    return np.clip((values - black) / (white - black), 0, 1) ** power * 252


def pixels(values):
    return Image.fromarray(np.rint(np.clip(values, 0, 255)).astype('uint8')).convert('RGB')


def correct_photo(source):
    # Pencil on neutral paper: remove the warm room-light cast, open exposure,
    # keep the complete photograph including its real cast shadow and surroundings.
    gray = np.asarray(ImageOps.grayscale(source), dtype=float)
    return pixels(levels(gray, 22, 168, .88)).filter(ImageFilter.UnsharpMask(1.1, 65, 3))


def correct_scan(source):
    gray = np.asarray(ImageOps.grayscale(source), dtype=float)
    height, width = gray.shape
    # Blank 65px paper margins determine the broad illumination, never the
    # shaded pencil drawing. Smooth vertically so paper grain is not amplified.
    edges = []
    for strip in [gray[:, :65], gray[:, -65:]]:
        edge = np.percentile(strip, 75, axis=1)
        edge = np.convolve(np.pad(edge, (70, 70), mode='edge'), np.ones(141) / 141, mode='valid')
        edges.append(edge)
    x = np.linspace(0, 1, width)[None, :]
    field = edges[0][:, None] * (1 - x) + edges[1][:, None] * x
    # The blank top margin captures the curved warm patch that a left/right
    # interpolation alone cannot measure. Fade this correction out gradually.
    top = np.percentile(gray[25:105], 70, axis=0)
    top = np.convolve(np.pad(top, (90, 90), mode='edge'), np.ones(181) / 181, mode='valid')
    residual = top - np.median(field[25:105], axis=0)
    weight = np.exp(-(np.arange(height) / (height * .20)) ** 2)
    field = field + weight[:, None] * residual[None, :]
    neutral = gray * 252 / np.maximum(field, 180)
    return pixels(levels(neutral, 72, 252, 1.08)).filter(ImageFilter.UnsharpMask(1.1, 65, 3))


def soften_laminate(image):
    # A small edge-preserving filter lowers laminate grain while retaining text
    # boundaries. It averages existing neighbours only and reconstructs nothing.
    values = np.asarray(image, dtype=float)
    height, width = values.shape[:2]
    padded = np.pad(values, ((2, 2), (2, 2), (0, 0)), mode='edge')
    total, weights = np.zeros_like(values), np.zeros((height, width, 1))
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            neighbour = padded[2+dy:2+dy+height, 2+dx:2+dx+width]
            difference = np.sum((neighbour-values) ** 2, axis=-1, keepdims=True)
            weight = np.exp(-difference / (2 * 22**2 * 3) - (dx*dx+dy*dy) / (2 * 1.4**2))
            total += neighbour * weight
            weights += weight
    return pixels(.7 * total / weights + .3 * values)


def correct_diploma(source):
    values = np.asarray(source, dtype=float)
    height, width = values.shape[:2]
    # Sample real paper around the content, not the coloured seal or signatures.
    # A very broad smooth RGB field compensates uneven room light and glare.
    # The printed illustration, border, seal, signatures and all text are retained.
    patches = [(.1,.07),(.3,.07),(.5,.07),(.7,.07),(.87,.07),
               (.1,.2),(.3,.2),(.7,.2),(.87,.2),(.1,.45),(.87,.45),
               (.13,.65),(.87,.65),(.1,.86),(.87,.86),(.3,.90),(.7,.90)]
    coordinates, paper = [], []
    for x, y in patches:
        px, py = int(x * width), int(y * height)
        patch = values[py-9:py+9, px-9:px+9]
        coordinates.append([1, x, y, x*x, x*y, y*y, x*x*x, x*x*y, x*y*y, y*y*y])
        paper.append(np.percentile(patch, 80, axis=(0, 1)))
    coefficients = np.linalg.lstsq(np.asarray(coordinates), np.asarray(paper), rcond=None)[0]
    y, x = np.mgrid[0:height, 0:width]
    x, y = x / width, y / height
    field = np.stack([np.ones_like(x), x, y, x*x, x*y, y*y, x*x*x, x*x*y, x*y*y, y*y*y], axis=-1) @ coefficients
    balanced = values * 228 / np.clip(field, 125, 245)
    return soften_laminate(pixels(levels(balanced, 40, 230, .9))).filter(ImageFilter.UnsharpMask(.8, 75, 4))


def main():
    specs = [
        ('antinous.jpg', 'antinous-neutral.webp', correct_photo,
         'Neutral grayscale, levels 22/168, gamma exponent 0.88, mild unsharp mask 1.1px/65%/3. Full photograph retained.'),
        ('antinous-scan.webp', 'antinous-scan-neutral.webp', correct_scan,
         'Neutral grayscale; smooth blank-paper illumination compensation; levels 72/252, gamma exponent 1.08; mild unsharp mask 1.1px/65%/3. Full sheet retained.'),
        ('awards/on-our-land-diploma-2024.webp', 'awards/on-our-land-diploma-2024-neutral.webp', correct_diploma,
         'Broad sampled-paper RGB illumination/white-balance compensation; levels 40/230, gamma exponent 0.9; small edge-preserving laminate-grain reduction; mild unsharp mask 0.8px/75%/4. Full frame, printed colours and all text retained. Residual laminate reflections are not reconstructed.'),
    ]
    entries, mapping = [], {}
    for original, target, correct, description in specs:
        path = ASSETS / original
        original_hash = digest(path)
        source = rgb(path)
        prepared = correct(source)
        if source.size != prepared.size:
            raise ValueError(f'Unexpected geometry change: {original}')
        # Pixel-only WebP has no EXIF/XMP/ICC/source document metadata.
        prepared = Image.frombytes('RGB', prepared.size, prepared.tobytes())
        destination = ASSETS / target
        prepared.save(destination, 'WEBP', quality=95, method=6)
        if digest(path) != original_hash:
            raise ValueError(f'Source changed: {original}')
        metadata = {'src': target, 'width': prepared.width, 'height': prepared.height, 'sha256': digest(destination)}
        mapping[original] = metadata
        entries.append({'original': original, 'originalSha256': original_hash,
                        'processing': description, **metadata})
    manifest = {
        'processing': 'User-requested ordinary tonal corrections. Source assets remain byte-for-byte unchanged. No crop, rotation, perspective warp, resize, generated detail, retouching, inpainting or text replacement. Display derivatives and previews use separate filenames.',
        'script': 'scripts/correct-portfolio-images.py',
        'assets': entries,
    }
    (ROOT / 'content/image-corrections.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'src/imageCorrections.js').write_text(
        '// Separate, full-frame tonal derivatives. The source assets are unchanged.\n'
        'export const imageCorrections = ' + json.dumps(mapping, ensure_ascii=False, indent=2) + ';\n\n'
        'export function displayImage(image) {\n'
        '  return { ...image, ...(imageCorrections[image.src] ?? {}) };\n'
        '}\n')
    print(f'Prepared {len(entries)} separate display derivatives; all source hashes verified unchanged.')


if __name__ == '__main__':
    main()
