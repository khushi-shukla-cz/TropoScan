import numpy as np
from PIL import Image

def create_overlay(image_path, mask_path, output_path):
    image = Image.open(image_path).convert("RGB").resize((256, 256))
    mask = Image.open(mask_path).convert("L").resize((256, 256))
    
    image_arr = np.array(image)
    mask_arr = np.array(mask)

    # Make a red overlay where mask is white (255)
    red_overlay = np.zeros_like(image_arr)
    red_overlay[..., 0] = 255  # Red channel

    combined = np.where(mask_arr[..., None] > 128, red_overlay, image_arr)
    result = Image.fromarray(combined.astype(np.uint8))
    result.save(output_path)

    return output_path