"""Import new generated plates and replace the rejected large-spider design.
Source PNGs are disposable staging material, not required by build_game.py.
Generated portrait edits: Lark, Misa, Noct. Other state variants are explicitly
composited from generated clean portraits and the generated compact injector.
Only the compressed, finished assets are necessary to rebuild the offline game.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import argparse

ROOT = Path(__file__).resolve().parent
RAW = ROOT / 'art-incoming'
ASSETS = ROOT / 'assets'
NEW_CAST = ['iris', 'sera', 'vega', 'ruby', 'june', 'psalm']
# Per-portrait sternum coordinates, full footprint as a fraction of frame width,
# and device rotation. No device is placed on a face or uncovered skin.
ANCHORS = {
    'lyra': (.385, .770, .155, -16),
    'akira': (.670, .755, .155, -10),
    'veil': (.400, .795, .155, -18),
    'iris': (.500, .735, .155, 0),
    'sera': (.500, .580, .145, 0),
    'vega': (.500, .735, .155, 0),
    'ruby': (.500, .735, .155, 0),
    'june': (.500, .735, .155, 0),
    'psalm': (.500, .735, .155, 0),
}


def compact_image(source, target, size=(768, 1024), quality=88):
    im = Image.open(source).convert('RGB')
    im = ImageOps.fit(im, size)
    im.save(target, 'WEBP', quality=quality, method=6)


def extract_device():
    im = Image.open(RAW / 'control-p30.png').convert('RGBA')
    # Flood only connected dark backdrop. Preserve enclosed red glass / circuitry.
    mask = Image.new('L', im.size)
    values = []
    for r, g, b, a in im.getdata():
        values.append(255 if max(r, g, b) < 29 and max(r, g, b)-min(r, g, b) < 16 else 0)
    mask.putdata(values)
    ImageDraw.floodfill(mask, (0, 0), 127, thresh=0)
    alpha = mask.point(lambda p: 0 if p == 127 else 255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(.35))
    im.putalpha(alpha)
    im = im.crop(alpha.getbbox())
    im.thumbnail((620, 800), Image.Resampling.LANCZOS)
    im.save(ASSETS / 'device.webp', 'WEBP', quality=92, method=6)
    return im


def composite_state(cid, device):
    im = Image.open(ASSETS / f'{cid}.webp').convert('RGBA')
    w, h = im.size
    ax, ay, fraction, angle = ANCHORS[cid]
    prop = device.copy()
    width = round(w * fraction)
    prop = prop.resize((width, round(width * prop.height / prop.width)), Image.Resampling.LANCZOS)
    prop = prop.rotate(angle, Image.Resampling.BICUBIC, expand=True)
    x, y = round(ax*w-prop.width/2), round(ay*h-prop.height/2)
    shadow = Image.new('RGBA', im.size)
    shadow.paste((0, 0, 0, 0), (0, 0, w, h))
    shape = Image.new('RGBA', prop.size, (0, 0, 0, 0))
    shape.putalpha(prop.getchannel('A').point(lambda a: int(a*.75)))
    shadow.alpha_composite(shape, (x+2, y+4))
    shadow = shadow.filter(ImageFilter.GaussianBlur(3.5))
    im = Image.alpha_composite(im, shadow)
    glow = Image.new('RGBA', im.size)
    d = ImageDraw.Draw(glow)
    d.ellipse((ax*w-width*.65, ay*h-width*.8, ax*w+width*.65, ay*h+width*.8), fill=(180, 15, 28, 22))
    im = Image.alpha_composite(im, glow.filter(ImageFilter.GaussianBlur(15)))
    im.alpha_composite(prop, (x, y))
    im.convert('RGB').save(ASSETS / f'{cid}_infected.webp', 'WEBP', quality=89, method=6)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cast', action='store_true', help='also import six new clean character plates')
    args = parser.parse_args()
    device = extract_device() if (RAW/'control-p30.png').exists() else Image.open(ASSETS/'device.webp').convert('RGBA')
    for cid in ['lark', 'misa', 'noct']:
        source = RAW / f'{cid}_p30.png'
        if source.exists(): compact_image(source, ASSETS/f'{cid}_infected.webp')
    for cid in ['lyra', 'akira', 'veil']: composite_state(cid, device)
    if args.cast:
        for cid in NEW_CAST:
            source = RAW / f'{cid}.png'
            if source.exists(): compact_image(source, ASSETS/f'{cid}.webp')
            if not (ASSETS/f'{cid}.webp').exists(): raise FileNotFoundError(source)
            composite_state(cid, device)
    print('Finished compressed assets:', len(list(ASSETS.glob('*.webp'))))


if __name__ == '__main__': main()
