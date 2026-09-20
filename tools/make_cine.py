#!/usr/bin/env python3
"""Build cinematic intro clips from the painted stills."""
from __future__ import annotations

import math
import os
import random
import subprocess
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ART = os.path.join(ROOT, "art")
TMP = "/tmp/lw-cine-frames"
W, H = 1280, 720
FPS = 24
DUR = 7.5
FRAMES = int(FPS * DUR)
BAR = 40


def ease(t: float) -> float:
    return t * t * (3 - 2 * t)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def crop_cam(src: Image.Image, zoom: float, panx: float, pany: float) -> Image.Image:
    sw, sh = src.size
    z = max(1.001, zoom)
    cw, ch = int(sw / z), int(sh / z)
    cw = min(sw, max(W, cw))
    ch = min(sh, max(H, ch))
    maxx = max(0, sw - cw)
    maxy = max(0, sh - ch)
    x = int(maxx * min(1, max(0, panx)))
    y = int(maxy * min(1, max(0, pany)))
    return src.crop((x, y, x + cw, y + ch)).resize((W, H), Image.Resampling.LANCZOS)


def grain(im: Image.Image, amount: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    px = im.load()
    step = 3
    for y in range(0, H, step):
        for x in range(0, W, step):
            d = rng.randint(-amount, amount)
            r, g, b = px[x, y][:3]
            c = (max(0, min(255, r + d)), max(0, min(255, g + d)), max(0, min(255, b + d)))
            for yy in range(y, min(H, y + step)):
                for xx in range(x, min(W, x + step)):
                    px[xx, yy] = c
    return im


def fog(im: Image.Image, t: float, strength: float = 0.22) -> Image.Image:
    overlay = Image.new("RGB", (W, H), (180, 190, 205))
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    shift = int((t * 180) % 220) - 40
    for i in range(6):
        y = 80 + i * 90 + int(math.sin(t * 3 + i) * 18)
        d.ellipse((-120 + shift + i * 40, y, 500 + shift + i * 70, y + 140), fill=int(40 + i * 12))
        d.ellipse((600 + shift - i * 30, y - 20, W + 80, y + 160), fill=int(28 + i * 10))
    overlay = Image.composite(overlay, im, ImageEnhance.Brightness(mask).enhance(strength * 2.4))
    return Image.blend(im, overlay, strength)


def letterbox(im: Image.Image) -> Image.Image:
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, BAR), fill=(6, 6, 8))
    d.rectangle((0, H - BAR, W, H), fill=(6, 6, 8))
    return im


def vignette(im: Image.Image, amt: float = 0.45) -> Image.Image:
    dark = Image.new("RGB", (W, H), (0, 0, 0))
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((-80, -60, W + 80, H + 60), fill=int(255 * (1 - amt)))
    mask = mask.filter(ImageFilter.GaussianBlur(48))
    mask = ImageOps.invert(mask)
    return Image.composite(dark, im, mask)


def lamp_glow(im: Image.Image, cx: int, cy: int, radius: int, pulse: float) -> Image.Image:
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    a = int(38 + 28 * pulse)
    for i in range(5, 0, -1):
        r = int(radius * i / 5)
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 210, 140, int(a * (6 - i) / 8)))
    base = im.convert("RGBA")
    return Image.alpha_composite(base, glow).convert("RGB")


def static_burst(im: Image.Image, seed: int) -> Image.Image:
    rng = random.Random(seed)
    out = im.copy()
    px = out.load()
    for y in range(0, H, 2):
        if rng.random() < 0.35:
            shade = rng.randint(20, 230)
            for x in range(W):
                px[x, y] = (shade, shade, shade)
    return out


CLIPS = [
    {
        "src": "cine_02_juno.png",
        "out": "cine_02_juno",
        "zoom": (1.02, 1.2),
        "panx": (0.16, 0.32),
        "pany": (0.5, 0.18),
        "fx": "juno",
    },
    {
        "src": "cine_tape_msg.png",
        "out": "cine_tape_msg",
        "zoom": (1.02, 1.16),
        "panx": (0.45, 0.55),
        "pany": (0.55, 0.62),
        "fx": "tape",
    },
    {
        "src": "cine_gone.png",
        "out": "cine_gone",
        "zoom": (1.04, 1.14),
        "panx": (0.35, 0.5),
        "pany": (0.4, 0.32),
        "fx": "juno",
    },
    {
        "src": "cine_01_harbor.png",
        "out": "cine_01_harbor",
        "zoom": (1.04, 1.16),
        "panx": (0.15, 0.72),
        "pany": (0.38, 0.28),
        "fx": "harbor",
    },
    {
        "src": "cine_03_tape.png",
        "out": "cine_03_tape",
        "zoom": (1.02, 1.16),
        "panx": (0.12, 0.42),
        "pany": (0.2, 0.35),
        "fx": "tape",
    },
    {
        "src": "cine_06_home.png",
        "out": "cine_06_home",
        "zoom": (1.04, 1.16),
        "panx": (0.35, 0.62),
        "pany": (0.45, 0.38),
        "fx": "home",
    },
]


def apply_fx(im: Image.Image, kind: str, t: float, i: int) -> Image.Image:
    if kind == "harbor":
        im = fog(im, t, 0.18)
        pulse = 0.55 + 0.45 * abs(math.sin(t * 9))
        im = lamp_glow(im, 1088, 118, 70, pulse)
        if i % 17 == 0:
            im = ImageEnhance.Brightness(im).enhance(1.04)
    elif kind == "juno":
        im = fog(im, t * 0.7, 0.2)
        im = lamp_glow(im, 690, 268, 46, 0.5 + 0.4 * abs(math.sin(t * 7)))
    elif kind == "tape":
        im = ImageEnhance.Color(im).enhance(0.85)
        if i in (48, 49, 110, 111, 112, 150):
            im = static_burst(im, 900 + i)
        elif i % 23 == 0:
            im = ImageEnhance.Contrast(im).enhance(1.15)
    elif kind == "locker":
        im = ImageEnhance.Color(im).enhance(1.05)
        d = ImageDraw.Draw(im)
        rng = random.Random(i * 3)
        for _ in range(10):
            x, y = rng.randint(200, 900), rng.randint(80, 520)
            d.point((x, y), fill=(255, 250, 230))
    elif kind == "pier":
        im = fog(im, t * 0.5 + 0.2, 0.12)
        im = lamp_glow(im, 548, 268, 40, 0.45 + 0.35 * abs(math.sin(t * 6)))
    elif kind == "home":
        warm = ImageEnhance.Color(im).enhance(1.08)
        im = Image.blend(im, warm, t)
        im = ImageEnhance.Brightness(im).enhance(1.0 + 0.06 * t)
    im = vignette(im, 0.2)
    im = grain(im, 7 if kind != "tape" else 11, 1000 + i)
    return letterbox(im)


def encode(name: str, folder: str) -> None:
    mp4 = os.path.join(ART, name + ".mp4")
    webm = os.path.join(ART, name + ".webm")
    pattern = os.path.join(folder, "f%04d.jpg")
    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            pattern,
            "-vf",
            "fade=t=in:st=0:d=0.55,fade=t=out:st=6.55:d=0.9",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-crf",
            "26",
            "-preset",
            "fast",
            "-movflags",
            "+faststart",
            "-an",
            mp4,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    subprocess.check_call(
        [
            "ffmpeg",
            "-y",
            "-i",
            mp4,
            "-c:v",
            "libvpx-vp9",
            "-crf",
            "36",
            "-b:v",
            "0",
            "-row-mt",
            "1",
            "-an",
            webm,
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print("wrote", name, os.path.getsize(mp4), os.path.getsize(webm))


def render_clip(clip: dict) -> None:
    src = Image.open(os.path.join(ART, clip["src"])).convert("RGB")
    if src.size != (W, H):
        src = src.resize((W, H), Image.Resampling.LANCZOS)
    # work from a larger plate so zooms stay sharp
    plate = src.resize((int(W * 1.28), int(H * 1.28)), Image.Resampling.LANCZOS)
    folder = os.path.join(TMP, clip["out"])
    os.makedirs(folder, exist_ok=True)
    z0, z1 = clip["zoom"]
    x0, x1 = clip["panx"]
    y0, y1 = clip["pany"]
    for i in range(FRAMES):
        t = ease(i / (FRAMES - 1))
        frame = crop_cam(plate, lerp(z0, z1, t), lerp(x0, x1, t), lerp(y0, y1, t))
        frame = apply_fx(frame, clip["fx"], t, i)
        frame.save(os.path.join(folder, f"f{i:04d}.jpg"), quality=86, optimize=True)
    encode(clip["out"], folder)


def main() -> int:
    os.makedirs(TMP, exist_ok=True)
    only = sys.argv[1:]
    clips = [c for c in CLIPS if not only or c["out"] in only]
    for c in clips:
        print("rendering", c["out"])
        render_clip(c)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
