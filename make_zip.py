"""Build the CrazyGames submission ZIP (game files only, no SW/manifest needed in portal iframe)."""
import os
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "dist")
os.makedirs(OUT, exist_ok=True)
dest = os.path.join(OUT, "abyss-drop-crazygames.zip")

FILES = [
    "index.html",
    "manifest.webmanifest",
    "sw.js",
    "icon-192.png",
    "icon-512.png",
    "icon-512-maskable.png",
]

with zipfile.ZipFile(dest, "w", zipfile.ZIP_DEFLATED) as z:
    for f in FILES:
        z.write(os.path.join(ROOT, "game", f), f)

size = os.path.getsize(dest)
print(f"wrote {dest} ({size/1024:.0f} KB)")
