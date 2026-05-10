#!/usr/bin/env python3
"""
scripts/generate-web-icons.py
Generates PWA and OG image assets from assets/favicon.svg into public/.
Run: python3 scripts/generate-web-icons.py
Requires: pip3 install cairosvg pillow --break-system-packages
"""
import os

try:
    import cairosvg
except ImportError:
    print("Installing cairosvg..."); os.system("pip3 install cairosvg pillow --break-system-packages")
    import cairosvg

from PIL import Image

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
PUBLIC = os.path.join(ROOT, "public")
os.makedirs(PUBLIC, exist_ok=True)
SVG    = os.path.join(ASSETS, "favicon.svg")

with open(SVG, "rb") as f:
    svg_bytes = f.read()

for size, name in [(180, "apple-touch-icon"), (192, "icon-192"), (512, "icon-512"), (1024, "icon-1024")]:
    out = os.path.join(PUBLIC, f"{name}.png")
    cairosvg.svg2png(bytestring=svg_bytes, write_to=out, output_width=size, output_height=size)
    print(f"  public/{name}.png ({size}x{size})")

# OG image: 1200x630
icon = Image.open(os.path.join(PUBLIC, "icon-512.png")).convert("RGBA")
icon = icon.resize((260, 260), Image.LANCZOS)
og   = Image.new("RGB", (1200, 630), "#EEF5FF")
og.paste(icon, ((1200 - 260) // 2, (630 - 260) // 2), icon)
og.save(os.path.join(PUBLIC, "og-image.png"))
print("  public/og-image.png (1200x630)")

print("\nDone — commit public/ directory.")
