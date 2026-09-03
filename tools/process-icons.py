#!/usr/bin/env python3
"""
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: process-icons.py
  EXPECTED PROJECT PATH: /tools/process-icons.py
  ROLE: Owner icon law pipeline — crop non-white bbox, pad to square with
        corner-pixel fill, rounded-rect mask (radius 0.22), resize 256,
        quantize 256 colors. Prevents squish and enforces the flat icon style.
  RESTORE/LOAD NOTE: Dev tool, not shipped to browsers. Run with Pillow installed.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "site-icons" / "raw"
OUT = ROOT / "assets" / "site-icons"


def process(raw_path: Path, out_path: Path, size: int = 256, radius_ratio: float = 0.22) -> None:
    image = Image.open(raw_path).convert("RGB")
    # 1. Crop the non-white bounding box (generated art usually sits on white margins).
    gray = ImageOps.grayscale(image)
    mask = gray.point(lambda p: 255 if p < 245 else 0)
    bbox = mask.getbbox()
    if bbox:
        image = image.crop(bbox)
    # 2. Pad to square using the corner-pixel fill so edges stay edge-to-edge color.
    corner = image.getpixel((0, 0))
    side = max(image.size)
    square = Image.new("RGB", (side, side), corner)
    square.paste(image, ((side - image.width) // 2, (side - image.height) // 2))
    # 3. Rounded-rect mask (radius 0.22 of final side), then resize + quantize.
    radius = int(side * radius_ratio)
    rounded = Image.new("L", (side, side), 0)
    ImageDraw.Draw(rounded).rounded_rectangle([0, 0, side - 1, side - 1], radius=radius, fill=255)
    rgba = square.convert("RGBA")
    rgba.putalpha(rounded)
    final = rgba.resize((size, size), Image.LANCZOS).convert("P", palette=Image.ADAPTIVE, colors=256)
    final.save(out_path, optimize=True)
    print(f"  {out_path.name} <- {raw_path.name} ({image.width}x{image.height} crop, corner {corner})")


def main() -> None:
    names = sys.argv[1:]
    raws = sorted(RAW.glob("*.png")) if not names else [RAW / n for n in names]
    if not raws:
        print("No raw icons found.")
        return
    for raw in raws:
        out_name = raw.name.replace("-raw.png", ".png")
        process(raw, OUT / out_name)


if __name__ == "__main__":
    main()
