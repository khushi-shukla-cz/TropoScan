import torch
from PIL import Image
import numpy as np
import torchvision.transforms as T
from model.unet import UNet

def load_model(model_path):
    model = UNet()
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    return model

def predict_mask(model, image_path):
    transform = T.Compose([
        T.Grayscale(),
        T.Resize((256, 256)),
        T.ToTensor()
    ])
    img = Image.open(image_path)
    img_tensor = transform(img).unsqueeze(0)  # shape: [1, 1, 256, 256]

    with torch.no_grad():
        pred = model(img_tensor)

    pred_mask = (pred.squeeze().numpy() > 0.5).astype(np.uint8) * 255
    return Image.fromarray(pred_mask.astype(np.uint8))