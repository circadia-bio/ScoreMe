#!/usr/bin/env python3
"""
scripts/generate-web-icons.py
Generates PWA and OG image assets from assets/favicon.svg.
Run once: python3 scripts/generate-web-icons.py
Requires: pip install cairosvg pillow
"""
import os, sys

try:
    import cairosvg
except ImportError:
    print("Installing cairosvg..."); os.system("pip3 install cairosvg pillow --break-system-packages")
    import cairosvg

from PIL import Image

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
SVG    = os.path.join(ASSETS, "favicon.svg")

with open(SVG, "rb") as f:
    svg_bytes = f.read()

for size, name in [(180, "apple-touch-icon"), (192, "icon-192"), (512, "icon-512"), (1024, "icon-1024")]:
    out = os.path.join(ASSETS, f"{name}.png")
    cairosvg.svg2png(bytestring=svg_bytes, write_to=out, output_width=size, output_height=size)
    print(f"  {name}.png ({size}×{size})")

# OG image: 1200×630, light brand background with centred icon
icon = Image.open(os.path.join(ASSETS, "icon-512.png")).convert("RGBA")
icon = icon.resize((260, 260), Image.LANCZOS)
og   = Image.new("RGB", (1200, 630), "#EEF5FF")
og.paste(icon, ((1200 - 260) // 2, (630 - 260) // 2), icon)
og.save(os.path.join(ASSETS, "og-image.png"))
print("  og-image.png (1200×630)")

print("\nDone. Commit assets/ and web/index.html changes.")
