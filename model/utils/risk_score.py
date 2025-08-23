import numpy as np
from PIL import Image

def calculate_risk(mask_path):
    mask = Image.open(mask_path).convert("L").resize((256, 256))
    mask_array = np.array(mask)

    total = mask_array.size
    cloudy = (mask_array > 128).sum()
    coverage = (cloudy / total) * 100

    if coverage > 15:
        level = "HIGH"
    elif coverage > 5:
        level = "MODERATE"
    else:
        level = "LOW"

    return level, round(coverage, 2)