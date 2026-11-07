#!/usr/bin/env python3
"""Prepare every supplied Lyublino file; never modify source files.

Usage: python3 scripts/prepare-lyublino.py /path/to/project
Requires Pillow, heif-convert and Poppler. The HEIC is published as a
metadata-free JPEG, not as the camera original containing private geotags.
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageCms
import hashlib, io, json, shutil, subprocess, sys, tempfile, zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1]).resolve()
OUT = ROOT / 'public/assets/lyublino'
FILES = OUT / 'files'
FILES.mkdir(parents=True, exist_ok=True)
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
manifest = {'projectId': 'lyublino-restoration', 'sourceFileCount': 15,
            'publicationNote': 'All source content is represented. The HEIC is converted to a metadata-free JPEG; its original remains unchanged outside the repository. The exact PNG duplicate has a separate download, not a repeated gallery plate.',
            'sourceFiles': [], 'assets': []}

def save_asset(im, name, edge=2400, quality=88):
    im = ImageOps.exif_transpose(im).convert('RGB')
    im.thumbnail((edge, edge), Image.Resampling.LANCZOS)
    target = OUT / (name + '.webp')
    im.save(target, 'WEBP', quality=quality, method=6)
    meta = {'src': 'lyublino/' + target.name, 'width': im.width, 'height': im.height,
            'bytes': target.stat().st_size, 'sha256': sha(target)}
    manifest['assets'].append(meta)
    return meta

with tempfile.TemporaryDirectory(prefix='lyublino-') as temp:
    temp = Path(temp)
    pdfs = [('вт проект.pdf', 'project-sheet', 6000), ('базовый этаж.pdf', 'ground-floor', 3200), ('фасад 1.pdf', 'front-elevation', 3200)]
    for source_name, slug, edge in pdfs:
        p = SOURCE / source_name
        subprocess.run(['pdftoppm','-f','1','-singlefile','-scale-to',str(edge),'-png',str(p),str(temp / slug)], check=True)
        im = Image.open(temp / (slug + '.png')).convert('RGB')
        full = save_asset(im.copy(), slug + '-full', edge, 94)
        preview = save_asset(im.copy(), slug, 2400, 89)
        preview['fullSrc'] = full['src']
        if slug == 'project-sheet':
            # Exact fragments of the complete PDF. All labels/watermarks remain.
            w,h = im.size
            for detail, box in [('render',(.055,.106,.641,.302)), ('site-plan',(.667,.103,.959,.327)), ('first-floor',(.025,.337,.628,.526)), ('typical-section',(.0,.563,.630,.754)), ('section',(.679,.549,.938,.754)), ('elevations',(.035,.804,.995,.996))]:
                crop = tuple(round((w if i%2 == 0 else h)*v) for i,v in enumerate(box))
                save_asset(im.crop(crop), detail, 3000, 93)
                manifest['assets'][-1]['source'] = source_name
                manifest['assets'][-1]['cropBox'] = list(crop)
            save_asset(im.crop(tuple(round(v) for v in (.055*w,.106*h,.641*w,.302*h))), 'cover', 1480, 89)
        dest = FILES / (slug + '.pdf')
        shutil.copyfile(p, dest)
        manifest['sourceFiles'].append({'source':source_name,'sourceSha256':sha(p),'sourceBytes':p.stat().st_size,'download':'lyublino/files/'+dest.name,'downloadName':source_name,'downloadSha256':sha(dest),'downloadBytes':dest.stat().st_size,'preview':preview['src'],'stage':'presentation','pages':1,'transformation':'unchanged'})

    heic = SOURCE / 'клоузура.HEIC'
    subprocess.run(['heif-convert', str(heic), str(temp / 'clausura.jpg')], check=True, stdout=subprocess.DEVNULL)
    im = ImageOps.exif_transpose(Image.open(temp / 'clausura.jpg'))
    if im.info.get('icc_profile'):
        im = ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(im.info['icc_profile'])), ImageCms.createProfile('sRGB'), outputMode='RGB')
    else: im = im.convert('RGB')
    clean = FILES / 'clausura.jpg'
    im.save(clean, 'JPEG', quality=98, subsampling=0)
    full = save_asset(im.copy(), 'clausura-full', 4000, 94)
    preview = save_asset(im.copy(), 'clausura', 2200, 90)
    preview['fullSrc'] = full['src']
    manifest['sourceFiles'].append({'source':heic.name,'sourceSha256':sha(heic),'sourceBytes':heic.stat().st_size,'download':'lyublino/files/'+clean.name,'downloadName':'клоузура.jpg','downloadSha256':sha(clean),'downloadBytes':clean.stat().st_size,'preview':preview['src'],'stage':'clausura','transformation':'HEIC to JPEG; sRGB; all EXIF/XMP and private geotags removed'})
    screenshots = sorted((SOURCE / 'скрины с ренги').glob('*.png'), key=lambda p: ('копия' in p.name, p.name))
    seen = {}
    for p in screenshots:
        digest = sha(p)
        is_duplicate = digest in seen
        slug = f'renga-{len(seen)+1:02d}' if not is_duplicate else 'renga-05-copy'
        dest = FILES / (slug + '.png')
        shutil.copyfile(p,dest)
        if not is_duplicate:
            preview = save_asset(Image.open(p),slug,2400,92)
            seen[digest] = preview['src']
        else: preview = {'src':seen[digest]}
        entry = {'source':str(p.relative_to(SOURCE)),'sourceSha256':digest,'sourceBytes':p.stat().st_size,'download':'lyublino/files/'+dest.name,'downloadName':p.name,'downloadSha256':sha(dest),'downloadBytes':dest.stat().st_size,'preview':preview['src'],'stage':'renga','transformation':'unchanged','duplicate':is_duplicate}
        if is_duplicate: entry['duplicateOf'] = next(e['source'] for e in manifest['sourceFiles'] if e['sourceSha256'] == digest)
        manifest['sourceFiles'].append(entry)
    assert len(manifest['sourceFiles']) == 15
    assert set(e['source'] for e in manifest['sourceFiles']) == set(str(p.relative_to(SOURCE)) for p in SOURCE.rglob('*') if p.is_file())
    archive = OUT / 'lyublino-materials.zip'
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for entry in manifest['sourceFiles']:
            name = entry['source'] if entry['stage'] != 'clausura' else 'клоузура.jpg'
            z.write(ROOT / 'public/assets' / entry['download'], name)
    manifest['archive'] = {'src':'lyublino/'+archive.name,'bytes':archive.stat().st_size,'sha256':sha(archive),'entries':15}
    (ROOT / 'content/scan-imports/lyublino.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(f'Prepared {len(manifest["sourceFiles"])} source files and {len(manifest["assets"])} web assets; archive {archive.stat().st_size:,} bytes.')
