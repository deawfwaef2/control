"""Generate and composite natural, high-precision 2D anime controlled portraits.
Preserves crisp facial features while rendering:
1. Luminous crimson anime irises at the exact pixel-verified iris coordinates (with catchlight).
2. The RE5-style glowing red mechanical spider anchored dead-center on the chest armor.
"""
from pathlib import Path
import json
import math
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
SPEC_PATH = ROOT / "art-neon.json"


def remove_dark_backdrop(rgba: Image.Image) -> Image.Image:
    """Convert the dark background of device.webp into clean alpha."""
    out = Image.new("RGBA", rgba.size)
    src = rgba.load()
    dst = out.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = src[x, y]
            lum = max(r, g, b)
            red_dom = max(0, r - max(g, b))
            edge_dx = min(x, w - 1 - x) / max(1.0, w * 0.12)
            edge_dy = min(y, h - 1 - y) / max(1.0, h * 0.12)
            edge = min(1.0, edge_dx, edge_dy)
            if lum < 22 and red_dom < 12:
                alpha = 0
            elif lum < 56 and red_dom < 24:
                alpha = int((lum - 22) / 34.0 * 210 * edge)
            else:
                alpha = int(min(255, max(lum * 2.2, 185 + red_dom)) * edge)
            dst[x, y] = (r, g, b, max(0, min(255, alpha)))
    return out


def add_eye_emission(base_rgba: Image.Image, eyes) -> Image.Image:
    """Recolor each anime iris at its exact (x, y, rx, ry) into luminous crimson with a crisp white catchlight."""
    w, h = base_rgba.size
    out = base_rgba.copy()
    pix = out.load()

    # Subtle crimson iris sheen strictly inside the eye socket
    sheen = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheen)
    for x, y, rx, ry in eyes:
        sd.ellipse(
            (x - rx * 0.95, y - ry * 0.85, x + rx * 0.95, y + ry * 0.85),
            fill=(255, 18, 48, 175),
        )
    sheen = sheen.filter(ImageFilter.GaussianBlur(radius=2.2))
    out = Image.alpha_composite(out, sheen)
    pix = out.load()

    for x, y, rx, ry in eyes:
        irx = max(8.0, float(rx) * 1.05)
        iry = max(7.0, float(ry) * 1.05)
        x0 = max(0, int(x - irx - 2))
        x1 = min(w - 1, int(x + irx + 2))
        y0 = max(0, int(y - iry - 2))
        y1 = min(h - 1, int(y + iry + 2))
        for py in range(y0, y1 + 1):
            for px in range(x0, x1 + 1):
                dx = (px - x) / irx
                dy = (py - y) / iry
                d2 = dx * dx + dy * dy
                if d2 > 1.0:
                    continue
                dist = math.sqrt(d2)
                r, g, b, a = pix[px, py]
                # Strength smoothly tapers at the outer edge of the iris
                wgt = (1.0 - dist) ** 0.55
                # Inner ruby ring vs darker crimson pupil center
                if dist < 0.34:
                    tr, tg, tb = 225, 14, 34
                else:
                    tr, tg, tb = 255, 22, 48
                nr = int(r * (1.0 - wgt * 0.88) + tr * (wgt * 0.88))
                ng = int(g * (1.0 - wgt * 0.86) + tg * (wgt * 0.86))
                nb = int(b * (1.0 - wgt * 0.86) + tb * (wgt * 0.86))
                pix[px, py] = (
                    max(0, min(255, nr)),
                    max(0, min(255, ng)),
                    max(0, min(255, nb)),
                    255,
                )

    # Crisp anime catchlight + lower crimson crescent inside each iris
    hi = ImageDraw.Draw(out)
    for x, y, rx, ry in eyes:
        hx = x - rx * 0.32
        hy = y - ry * 0.30
        hi.ellipse((hx - 2.2, hy - 1.8, hx + 2.2, hy + 1.8), fill=(255, 245, 248, 245))
        hi.ellipse((x - rx * 0.35, y + ry * 0.15, x + rx * 0.35, y + ry * 0.52), fill=(255, 85, 110, 185))

    return out


def make_infected(clean_img: Image.Image, device_rgba: Image.Image, cfg: dict) -> Image.Image:
    w, h = clean_img.size
    # Keep facial features crisp and attractive with subtle dark-ambient atmosphere
    darkened = ImageEnhance.Brightness(clean_img).enhance(0.76)
    darkened = ImageEnhance.Color(darkened).enhance(0.84)
    darkened = ImageEnhance.Contrast(darkened).enhance(1.06)
    base = darkened.convert("RGBA")

    quad = cfg["device_quad"]
    xs = [p[0] for p in quad]
    ys = [p[1] for p in quad]
    x0, x1 = int(min(xs)), int(max(xs))
    y0, y1 = int(min(ys)), int(max(ys))
    cx = (x0 + x1) // 2
    cy = (y0 + y1) // 2
    bw = max(40, x1 - x0)
    bh = max(40, y1 - y0)

    # Subtle contact shadow under the chest spider
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse(
        (cx - int(bw * 0.44), cy - int(bh * 0.42), cx + int(bw * 0.44), cy + int(bh * 0.44)),
        fill=(6, 2, 5, 145),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=14))
    base = Image.alpha_composite(base, shadow)

    # Focused ruby glow around the spider's central core on the chest
    chest_glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(chest_glow)
    gd.ellipse(
        (cx - int(bw * 0.38), cy - int(bh * 0.36), cx + int(bw * 0.38), cy + int(bh * 0.36)),
        fill=(255, 22, 56, 95),
    )
    gd.ellipse(
        (cx - int(bw * 0.18), cy - int(bh * 0.18), cx + int(bw * 0.18), cy + int(bh * 0.18)),
        fill=(255, 65, 95, 140),
    )
    chest_glow = chest_glow.filter(ImageFilter.GaussianBlur(radius=16))
    base = Image.alpha_composite(base, chest_glow)

    # Paste the mechanical spider dead-center on the chest
    dev_resized = device_rgba.resize((bw, bh), Image.Resampling.LANCZOS)
    dev_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dev_layer.paste(dev_resized, (x0, y0), dev_resized)
    base = Image.alpha_composite(base, dev_layer)

    # Bright ruby core highlight at the center of the spider carapace
    core_hi = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(core_hi)
    cr = max(9, int(min(bw, bh) * 0.085))
    cd.ellipse((cx - cr * 1.7, cy - cr * 1.7, cx + cr * 1.7, cy + cr * 1.7), fill=(255, 35, 68, 130))
    cd.ellipse((cx - cr * 0.75, cy - cr * 0.75, cx + cr * 0.75, cy + cr * 0.75), fill=(255, 225, 235, 215))
    core_hi = core_hi.filter(ImageFilter.GaussianBlur(radius=3.2))
    base = Image.alpha_composite(base, core_hi)

    # Recolor the exact irises to glowing crimson
    base = add_eye_emission(base, cfg["eyes"])
    return base.convert("RGB")


def main():
    spec = json.loads(SPEC_PATH.read_text(encoding="utf-8"))
    device_path = ASSETS / "device.webp"
    device_raw = Image.open(device_path).convert("RGBA")
    device_clean = remove_dark_backdrop(device_raw)
    device_clean = ImageEnhance.Contrast(device_clean).enhance(1.22)
    device_clean = ImageEnhance.Brightness(device_clean).enhance(1.08)

    for char_id, cfg in spec["portraits"].items():
        clean_path = ASSETS / f"{char_id}.webp"
        out_path = ASSETS / f"{char_id}_infected.webp"
        clean_img = Image.open(clean_path).convert("RGB")
        infected = make_infected(clean_img, device_clean, cfg)
        infected.save(out_path, "WEBP", quality=80, method=6)
        print(f"composited {out_path.name} ({infected.size[0]}x{infected.size[1]})")


if __name__ == "__main__":
    main()
