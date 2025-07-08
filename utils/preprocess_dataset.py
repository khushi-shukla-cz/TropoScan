import os
from PIL import Image
import numpy as np

RAW_DIR = "data/raw"
IMG_OUT = "data/images"
MASK_OUT = "data/masks"

os.makedirs(IMG_OUT, exist_ok=True)
os.makedirs(MASK_OUT, exist_ok=True)

# Threshold below which we consider 'deep convection' cloud cluster
CLOUD_THRESHOLD = 100

def create_mask(arr, threshold=CLOUD_THRESHOLD):
    return (arr < threshold).astype(np.uint8) * 255

for fname in os.listdir(RAW_DIR):
    if not fname.endswith(".jpg"): continue

    img_path = os.path.join(RAW_DIR, fname)
    im = Image.open(img_path).convert("L")
    im = im.resize((256, 256))
    im.save(os.path.join(IMG_OUT, fname))

    arr = np.array(im)
    mask = create_mask(arr)
    Image.fromarray(mask).save(os.path.join(MASK_OUT, fname))

print("✅ Preprocessing complete. Images + masks ready.")
