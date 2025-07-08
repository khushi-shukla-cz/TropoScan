# File: test_full_pipeline.py

from utils.predict_mask import load_model, predict_mask
from utils.generate_overlay import create_overlay
from utils.risk_score import calculate_risk
from PIL import Image
import os

# Load model
model_path = "model/unet_insat.pt"
model = load_model(model_path)

# Pick a test image
sample_image = "data/images/37.jpg"  # change this to any available file
pred_mask_path = "data/masks/predicted_sample.png"
overlay_path = "data/samples/overlay_sample.png"

# Predict mask
mask_img = predict_mask(model, sample_image)
mask_img.save(pred_mask_path)
print(f"✅ Saved predicted mask to {pred_mask_path}")

# Generate overlay
create_overlay(sample_image, pred_mask_path, overlay_path)
print(f"🖼️ Overlay saved to {overlay_path}")

# Calculate risk
level, percent = calculate_risk(pred_mask_path)
print(f"🧠 Risk Assessment: {level} ({percent:.2f}% cloud coverage)")

# Show result
Image.open(overlay_path).show()
