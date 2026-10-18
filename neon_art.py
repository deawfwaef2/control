"""Rebuild M8 CONTROLLED state variants from committed clean plates + device.

Nine clean plates were newly generated in Japanese cel-anime style. Akira,
Veil and Misa retain the existing oblique clean artwork. ALL twelve controlled
variants are explicit composites, not claimed to be twelve additional redraws.
Raw generation PNGs are not needed: build_game.py only reads finished WebPs.
Coordinates are hand-checked in art-neon.json. Very side-on poses intentionally
show a perspective-compressed device, not a frontal implant pasted onto a back.
"""
from pathlib import Path
import json
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'assets'


def import_device(source):
    """Keep dark graphite plates opaque; remove only the navy backdrop.
    Pillow fromarray masks must be copied before ImageDraw.floodfill writes.
    """
    image = Image.open(source).convert('RGBA')
    a = np.asarray(image).astype(int)
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    background = (r < 12) & (g < 14) & (b < 40) & (b > r + 10)
    mask = Image.fromarray((background * 255).astype('uint8')).copy()
    ImageDraw.floodfill(mask, (0, 0), 127)
    alpha = mask.point(lambda value: 0 if value == 127 else 255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(.4))
    image.putalpha(alpha)
    image = image.crop(alpha.getbbox())
    image.thumbnail((620, 900), Image.Resampling.LANCZOS)
    image.save(ASSETS/'device.webp', 'WEBP', quality=94, method=6)


def perspective(src, quad, size):
    w, h = src.size
    corners = [(0, 0), (w, 0), (w, h), (0, h)]
    matrix, values = [], []
    for (x, y), (u, v) in zip(quad, corners):
        matrix.extend([[x, y, 1, 0, 0, 0, -u*x, -u*y],
                       [0, 0, 0, x, y, 1, -v*x, -v*y]])
        values.extend([u, v])
    coefficients = np.linalg.solve(np.array(matrix), np.array(values))
    return src.transform(size, Image.Transform.PERSPECTIVE, coefficients,
                         Image.Resampling.BICUBIC, fillcolor=(0, 0, 0, 0))


def eye_light(image, eyes):
    halo = Image.new('RGBA', image.size)
    tight = Image.new('RGBA', image.size)
    h, t = ImageDraw.Draw(halo), ImageDraw.Draw(tight)
    for x, y, rx, ry in eyes:
        h.ellipse((x-rx*3.1, y-ry*2.8, x+rx*3.1, y+ry*2.8), fill=(255, 12, 57, 110))
        t.ellipse((x-rx*1.45, y-ry*1.35, x+rx*1.45, y+ry*1.35), fill=(255, 31, 77, 145))
    image = Image.alpha_composite(image, halo.filter(ImageFilter.GaussianBlur(8)))
    image = Image.alpha_composite(image, tight.filter(ImageFilter.GaussianBlur(2.7)))
    core = Image.new('RGBA', image.size)
    d = ImageDraw.Draw(core)
    for x, y, rx, ry in eyes:
        d.ellipse((x-rx, y-ry, x+rx, y+ry), fill=(242, 17, 54, 230), outline=(160, 5, 28, 225), width=1)
        d.ellipse((x-rx*.59, y-ry*.68, x+rx*.59, y+ry*.68), fill=(255, 117, 151, 238))
        d.ellipse((x-1.4, y-ry*.52, x+1.4, y+ry*.52), fill=(255, 237, 243, 250))
        d.ellipse((x+rx*.2, y-ry*.55, x+rx*.48, y-ry*.2), fill=(255, 248, 250, 245))
    return Image.alpha_composite(image, core)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--device-source', type=Path, help='optional raw generated prop PNG')
    args = parser.parse_args()
    if args.device_source:
        import_device(args.device_source)
    manifest = json.loads((ROOT/'art-neon.json').read_text())
    device = Image.open(ASSETS/'device.webp').convert('RGBA')
    for cid, entry in manifest['portraits'].items():
        clean = Image.open(ASSETS/f'{cid}.webp').convert('RGBA')
        prop = perspective(device, entry['device_quad'], clean.size)
        alpha = prop.getchannel('A')
        shadow = Image.new('RGBA', clean.size, (0, 0, 0, 0))
        shadow.putalpha(ImageChops.offset(alpha.point(lambda a: int(a*.6)), 2, 3).filter(ImageFilter.GaussianBlur(3)))
        image = Image.alpha_composite(clean, shadow)
        pixels = np.asarray(prop)
        r, g, b = [pixels[:, :, i].astype(float) for i in range(3)]
        glow_mask = Image.fromarray(np.where((r>100)&(r>g*1.3), pixels[:, :, 3]*.40, 0).astype('uint8'))
        glow = Image.new('RGBA', clean.size, (255, 14, 53, 0))
        glow.putalpha(glow_mask.filter(ImageFilter.GaussianBlur(13)))
        image = Image.alpha_composite(image, glow)
        image = Image.alpha_composite(image, prop)
        image = eye_light(image, entry['eyes'])
        image.convert('RGB').save(ASSETS/f'{cid}_infected.webp', 'WEBP', quality=92, method=6)
    print('Composited 12 controlled portraits: perspective chest mounts + luminous eyes.')


if __name__ == '__main__':
    main()
