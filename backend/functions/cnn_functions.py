import torch
import pandas as pd
import ast
from PIL import Image
from torchvision import transforms
import numpy as np
import requests
import math
import os

# Import functions 
from functions.satellite_functions import punto_y_perpendicular, get_satellite_tile

# Set enviorment variables
API_KEY = os.environ.get('API_KEY', 'wEmGiRQk7GrIqqwGGmhK-Qjmdg-KkkUFXOGAjfjzsoQ')
DATA_DIR = os.environ.get('DATA_DIR', '../data')
TEMP_DIR = os.environ.get('TEMP_DIR', 'temp')
MODEL_PATH = os.environ.get('MODEL_PATH', 'models/modelo_camellones.pth')

# Set satellite images parameters
ZOOM_LEVEL = int(os.environ.get('SATELLITE_ZOOM_LEVEL', 19))
TILE_FORMAT = os.environ.get('SATELLITE_TILE_FORMAT', 'png')
TILE_SIZE = int(os.environ.get('SATELLITE_TILE_SIZE', 256))

# Class definition convolutional neural network
class CamellonCNN(torch.nn.Module):
    def __init__(self):
        super(CamellonCNN, self).__init__()
        self.net = torch.nn.Sequential(
            #Convolutional layers
            torch.nn.Conv2d(3, 32, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Conv2d(32, 64, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Conv2d(64, 128, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            #Linear layers
            torch.nn.Flatten(),
            torch.nn.Linear(128 * 16 * 16, 64), torch.nn.ReLU(),
            torch.nn.Linear(64, 1),
            torch.nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)
    
def predecir(df):
    """
    Predict if found ridge is empty or contains building, based on a pretrained CNN, for every row in a dataframe containing the POI´s LineString, 
    percentage of route, side of POI to LineString

    Input: DataFrame with columns POI_ID, PERCFREF, geometry, 

    Output: DataFrame with predicted labels, 0 for empty ridge, 1 for ridge containing POI

    """
    # Ajustar ruta del modelo - si es relativa, hacerla absoluta
    model_path = MODEL_PATH
    if not os.path.isabs(model_path):
        # Si la ruta es relativa, buscar en el directorio actual y luego ir hacia arriba
        script_dir = os.path.dirname(os.path.abspath(__file__))
        potential_paths = [
            os.path.join(script_dir, model_path),                     # backend/functions/models/...
            os.path.join(os.path.dirname(script_dir), model_path),    # backend/models/...
            os.path.join(os.path.dirname(os.path.dirname(script_dir)), model_path)  # root/models/...
        ]
        
        for path in potential_paths:
            if os.path.exists(path):
                model_path = path
                break
    
    # Verificar que el modelo existe
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"No se encontró el modelo en la ruta: {model_path}. Rutas probadas: {potential_paths}")
    
    print(f"Usando modelo en: {model_path}")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = CamellonCNN()
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)
    model.eval()
    
    # Configuración de transformación para las imágenes
    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
    ])
    
    resultados = {}
    #Iterate DataFrame to predict for each row
    for _, row in df.iterrows():
        try:
            
            pid = row['POI_ID']
            coords = ast.literal_eval(row['geometry']) if isinstance(row['geometry'], str) else row['geometry']
            percent = float(row['PERCFRREF'])
            side = row['POI_ST_SD']
            nombre = row['POI_NAME']
            
            # Obtener punto y vector perpendicular
            punto_info = punto_y_perpendicular(coords, percent, side=side)
            lon, lat = punto_info['punto']
            
            # Obtener imagen de satélite
            tile_path = os.path.join(TEMP_DIR, f"satellite_tile_{pid}.png")
            if get_satellite_tile(lat, lon, ZOOM_LEVEL, TILE_FORMAT, TILE_SIZE, API_KEY, tile_path):
                # Procesar imagen y realizar predicción
                img = Image.open(tile_path).convert('RGB')
                img_tensor = transform(img).unsqueeze(0).to(device)
                
                with torch.no_grad():
                    output = model(img_tensor)
                    pred_label = int((output > 0.5).float().item())
                
                # Guardar resultados
                resultados[pid] = {
                    'x_cord': lon,
                    'y_cord': lat,
                    'POI_NAME': nombre,
                    'label': pred_label
                }
            else:
                # En caso de error al obtener la imagen
                resultados[pid] = {
                    'x_cord': lon,
                    'y_cord': lat,
                    'POI_NAME': nombre,
                    'label': None,
                    'error': 'No se pudo obtener la imagen de satélite'
                }
        except Exception as e:
            # En caso de error en el procesamiento
            resultados[row.get('POI_ID', 'unknown')] = {
                'error': str(e)
            }
    
    return resultados
