#!/usr/bin/env python3
"""Generate clean and darkened high-glow infected WebP portraits for all 18 Mecha-Girls.
Infected state darkens the character figure markedly so the glowing red chest-center
mechanical spider and glowing red eyes pop with dramatic chiaroscuro contrast.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
SPEC_PATH = ROOT / "art-neon.json"


def load_spec() -> dict:
    return json.loads(SPEC_PATH.read_text(encoding="utf-8"))


def find_perspective_coeffs(src_pts, dst_pts):
    matrix = []
    rhs = []
    for (x, y), (u, v) in zip(dst_pts, src_pts):
        matrix.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        matrix.append([0, 0, 0, x, y, 1, -v * x, -v * y])
        rhs.extend([u, v])
    n = 8
    for i in range(n):
        pivot = max(range(i, n), key=lambda r: abs(matrix[r][i]))
        matrix[i], matrix[pivot] = matrix[pivot], matrix[i]
        rhs[i], rhs[pivot] = rhs[pivot], rhs[i]
        div = matrix[i][i]
        for j in range(i, n):
            matrix[i][j] /= div
        rhs[i] /= div
        for r in range(n):
            if r != i:
                factor = matrix[r][i]
                for j in range(i, n):
                    matrix[r][j] -= factor * matrix[i][j]
                rhs[r] -= factor * rhs[i]
    return rhs


def remove_dark_backdrop(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = max(r, g, b)
            red_bias = r - max(g, b)
            if lum < 24 and red_bias < 12:
                px[x, y] = (r, g, b, 0)
            elif lum < 52 and red_bias < 18:
                alpha = int((lum - 24) / 28 * a)
                px[x, y] = (r, g, b, max(0, min(a, alpha)))
    return rgba


def quad_center(quad):
    return (
        sum(p[0] for p in quad) / 4.0,
        sum(p[1] for p in quad) / 4.0,
    )


def draw_chest_veins(size, quad) -> Image.Image:
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = quad_center(quad)
    w = max(p[0] for p in quad) - min(p[0] for p in quad)
    h = max(p[1] for p in quad) - min(p[1] for p in quad)
    rays = [
        (-0.68, -0.58), (-0.34, -0.78), (0.34, -0.78), (0.68, -0.58),
        (-0.85, -0.14), (0.85, -0.14), (-0.70, 0.44), (0.70, 0.44),
        (-0.28, 0.82), (0.28, 0.82), (0.0, -0.88), (0.0, 0.88),
    ]
    for dx, dy in rays:
        p1 = (cx + dx * w * 0.16, cy + dy * h * 0.16)
        p2 = (cx + dx * w * 0.44 + dy * 10, cy + dy * h * 0.42 - dx * 8)
        p3 = (cx + dx * w * 0.72, cy + dy * h * 0.68)
        draw.line([p1, p2, p3], fill=(255, 28, 56, 215), width=5)
        draw.line([p1, p2, p3], fill=(255, 190, 200, 155), width=2)
    return layer.filter(ImageFilter.GaussianBlur(1.5))


def draw_red_eyes(size, eyes) -> Image.Image:
    glow = Image.new("RGBA", size, (0, 0, 0, 0))
    core = Image.new("RGBA", size, (0, 0, 0, 0))
    flare = Image.new("RGBA", size, (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cdraw = ImageDraw.Draw(core)
    fdraw = ImageDraw.Draw(flare)
    for x, y, ew, eh in eyes:
        gdraw.ellipse((x - ew * 2.4, y - eh * 2.2, x + ew * 2.4, y + eh * 2.2), fill=(255, 12, 38, 235))
        gdraw.ellipse((x - ew * 1.4, y - eh * 1.3, x + ew * 1.4, y + eh * 1.3), fill=(255, 60, 85, 255))
        fdraw.line([(x - ew * 2.6, y), (x + ew * 2.6, y)], fill=(255, 95, 120, 210), width=3)
        cdraw.ellipse((x - ew * 0.78, y - eh * 0.68, x + ew * 0.78, y + eh * 0.68), fill=(255, 95, 115, 255))
        cdraw.ellipse((x - ew * 0.38, y - eh * 0.36, x + ew * 0.38, y + eh * 0.36), fill=(255, 245, 248, 255))
    glow = glow.filter(ImageFilter.GaussianBlur(9))
    flare = flare.filter(ImageFilter.GaussianBlur(2.5))
    core = core.filter(ImageFilter.GaussianBlur(1.0))
    return Image.alpha_composite(Image.alpha_composite(glow, flare), core)


def warp_device(device_img: Image.Image, canvas_size, quad) -> Image.Image:
    src = [(0, 0), (device_img.width, 0), (device_img.width, device_img.height), (0, device_img.height)]
    coeffs = find_perspective_coeffs(src, [tuple(p) for p in quad])
    return device_img.transform(canvas_size, Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)


def make_infected(clean: Image.Image, device_img: Image.Image, cfg: dict) -> Image.Image:
    w, h = clean.size
    # Darken the character figure substantially ("显得人物更暗一点") so the glowing
    # chest-center spider and glowing red eyes pop dramatically against the dark silhouette.
    desat = ImageEnhance.Color(clean).enhance(0.45)
    base = ImageEnhance.Brightness(desat).enhance(0.48)
    base = ImageEnhance.Contrast(base).enhance(1.22).convert("RGBA")

    # Deep cold-cyberpunk shadow wash + dark vignette, with a bright crimson point-light
    # radiating strictly from the chest-center spider device.
    quad = cfg["device_quad"]
    cx, cy = quad_center(quad)
    qw = max(p[0] for p in quad) - min(p[0] for p in quad)
    qh = max(p[1] for p in quad) - min(p[1] for p in quad)

    # Darken outer portrait further while illuminating chest area with eerie red bounce light
    dark_mask = Image.new("RGBA", (w, h), (4, 6, 14, 115))
    light_cut = ImageDraw.Draw(dark_mask)
    light_cut.ellipse((cx - qw * 0.95, cy - qh * 0.85, cx + qw * 0.95, cy + qh * 0.85), fill=(28, 4, 10, 45))
    dark_mask = dark_mask.filter(ImageFilter.GaussianBlur(36))
    base = Image.alpha_composite(base, dark_mask)

    # Intense red bloom radiating from the chest-center spider
    chest_glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(chest_glow)
    gdraw.ellipse((cx - qw * 0.88, cy - qh * 0.82, cx + qw * 0.88, cy + qh * 0.82), fill=(255, 10, 36, 165))
    gdraw.ellipse((cx - qw * 0.52, cy - qh * 0.50, cx + qw * 0.52, cy + qh * 0.50), fill=(255, 48, 72, 225))
    chest_glow = chest_glow.filter(ImageFilter.GaussianBlur(26))
    base = Image.alpha_composite(base, chest_glow)

    veins = draw_chest_veins((w, h), quad)
    base = Image.alpha_composite(base, veins)

    warped = warp_device(device_img, (w, h), quad)
    alpha = warped.split()[3]
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow_alpha = alpha.filter(ImageFilter.GaussianBlur(8))
    shadow.putalpha(ImageEnhance.Brightness(shadow_alpha).enhance(0.92))
    base = Image.alpha_composite(base, ImageChops.offset(shadow, 0, 6))
    base = Image.alpha_composite(base, warped)

    # Super-bright glowing ruby core dead-center on the spider + specular energy rings
    core_bloom = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(core_bloom)
    cdraw.ellipse((cx - qw * 0.24, cy - qh * 0.22, cx + qw * 0.24, cy + qh * 0.22), fill=(255, 30, 58, 235))
    cdraw.ellipse((cx - qw * 0.12, cy - qh * 0.11, cx + qw * 0.12, cy + qh * 0.11), fill=(255, 165, 180, 255))
    cdraw.ellipse((cx - qw * 0.055, cy - qh * 0.055, cx + qw * 0.055, cy + qh * 0.055), fill=(255, 250, 252, 255))
    core_bloom = core_bloom.filter(ImageFilter.GaussianBlur(6))
    base = Image.alpha_composite(base, core_bloom)

    eyes = draw_red_eyes((w, h), cfg["eyes"])
    base = Image.alpha_composite(base, eyes)
    return base.convert("RGB")


def main():
    spec = load_spec()
    device_path = ASSETS / "device.webp"
    device_raw = Image.open(device_path).convert("RGBA")
    device_clean = remove_dark_backdrop(device_raw)
    device_clean = ImageEnhance.Contrast(device_clean).enhance(1.28)
    device_clean = ImageEnhance.Brightness(device_clean).enhance(1.12)

    for char_id, cfg in spec["portraits"].items():
        clean_path = ASSETS / f"{char_id}.webp"
        out_path = ASSETS / f"{char_id}_infected.webp"
        clean_img = Image.open(clean_path).convert("RGB")
        infected = make_infected(clean_img, device_clean, cfg)
        infected.save(out_path, "WEBP", quality=90, method=6)
        print(f"composited {out_path.name} ({infected.size[0]}x{infected.size[1]})")


if __name__ == "__main__":
    main()
