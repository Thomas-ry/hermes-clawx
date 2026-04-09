from __future__ import annotations

from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BUILD_DIR = ROOT / "apps" / "desktop" / "build"
PUBLIC_DIR = ROOT / "apps" / "desktop" / "public"


def draw_icon(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    radius = max(24, size // 5)
    background = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    background_draw = ImageDraw.Draw(background)

    for y in range(size):
        blend = y / max(1, size - 1)
        red = int(22 + 16 * blend)
        green = int(27 + 56 * blend)
        blue = int(44 + 112 * blend)
        background_draw.rounded_rectangle(
            (0, y, size, y + 1),
            radius=radius,
            fill=(red, green, blue, 255),
        )

    image.alpha_composite(background)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    margin = int(size * 0.14)
    glow_draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=int(size * 0.18),
        outline=(255, 173, 92, 180),
        width=max(3, size // 48),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(6, size // 32)))
    image.alpha_composite(glow)

    accent = (255, 177, 92, 255)
    accent_soft = (255, 220, 184, 255)

    claw_width = max(10, size // 26)
    claw_height = int(size * 0.34)
    start_y = int(size * 0.22)
    columns = [0.31, 0.46, 0.61]
    for index, center_ratio in enumerate(columns):
        center_x = int(size * center_ratio)
        top = start_y - index * max(6, size // 64)
        bottom = top + claw_height
        draw.rounded_rectangle(
            (center_x - claw_width // 2, top, center_x + claw_width // 2, bottom),
            radius=claw_width // 2,
            fill=accent,
        )
        draw.polygon(
            [
                (center_x - claw_width // 2, top + claw_width),
                (center_x + claw_width // 2, top + claw_width),
                (center_x, top - int(size * 0.08)),
            ],
            fill=accent_soft,
        )

    bar_top = int(size * 0.66)
    bar_height = max(16, size // 12)
    bar_left = int(size * 0.24)
    bar_right = int(size * 0.76)
    draw.rounded_rectangle(
        (bar_left, bar_top, bar_right, bar_top + bar_height),
        radius=bar_height // 2,
        fill=accent,
    )

    stem_width = max(14, size // 10)
    stem_height = int(size * 0.2)
    stem_left = int(size * 0.48) - stem_width // 2
    draw.rounded_rectangle(
        (stem_left, bar_top, stem_left + stem_width, bar_top + stem_height),
        radius=stem_width // 3,
        fill=accent,
    )

    notch = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    notch_draw = ImageDraw.Draw(notch)
    notch_draw.polygon(
        [
            (int(size * 0.52), bar_top + int(size * 0.03)),
            (int(size * 0.74), bar_top - int(size * 0.14)),
            (int(size * 0.79), bar_top - int(size * 0.08)),
            (int(size * 0.58), bar_top + int(size * 0.08)),
        ],
        fill=(14, 18, 32, 255),
    )
    image.alpha_composite(notch)

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.ellipse(
        (int(size * 0.24), int(size * 0.78), int(size * 0.76), int(size * 0.9)),
        fill=(0, 0, 0, 70),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=max(4, size // 48)))
    image.alpha_composite(shadow)

    return image


def write_pngs() -> Path:
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    base = draw_icon(1024)
    png_path = BUILD_DIR / "icon.png"
    base.save(png_path)
    base.resize((256, 256), Image.LANCZOS).save(PUBLIC_DIR / "clawt-icon.png")
    base.resize((256, 256), Image.LANCZOS).save(
        BUILD_DIR / "icon.ico",
        format="ICO",
        sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)],
    )
    return png_path


def write_icns(png_path: Path) -> None:
    iconutil = shutil.which("iconutil")
    if not iconutil:
        return

    iconset = BUILD_DIR / "icon.iconset"
    if iconset.exists():
        shutil.rmtree(iconset)
    iconset.mkdir(parents=True, exist_ok=True)

    base = Image.open(png_path)
    sizes = [16, 32, 64, 128, 256, 512]
    for size in sizes:
        resized = base.resize((size, size), Image.LANCZOS)
        resized.save(iconset / f"icon_{size}x{size}.png")
        if size <= 512:
            resized_retina = base.resize((size * 2, size * 2), Image.LANCZOS)
            resized_retina.save(iconset / f"icon_{size}x{size}@2x.png")

    subprocess.run([iconutil, "-c", "icns", str(iconset), "-o", str(BUILD_DIR / "icon.icns")], check=True)
    shutil.rmtree(iconset)


def main() -> None:
    png_path = write_pngs()
    write_icns(png_path)
    print(f"Generated icons in {BUILD_DIR}")


if __name__ == "__main__":
    main()
