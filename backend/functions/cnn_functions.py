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

# Utilizar variables de entorno
API_KEY = os.environ.get('API_KEY', 'eVp5bxaGV_HO246C7MkTPsgR1jTzYzuy3CO76Fk9ESI')
DATA_DIR = os.environ.get('DATA_DIR', '../data')
TEMP_DIR = os.environ.get('TEMP_DIR', 'temp')
MODEL_PATH = os.environ.get('MODEL_PATH', '../models/modelo_camellones.pth')
MODEL_SIDES_PATH = os.environ.get('MODEL_SIDES_PATH', '../models/modelo_sides.pth')

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

class SidesCNN(torch.nn.Module):
    def __init__(self):
        super(SidesCNN, self).__init__()
        self.net = torch.nn.Sequential(
            torch.nn.Conv2d(3, 32, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Conv2d(32, 64, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Conv2d(64, 128, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Flatten(),
            torch.nn.Linear(128 * 16 * 16, 64), torch.nn.ReLU(),
            torch.nn.Linear(64, 1),
            torch.nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)

class SidesCNN(torch.nn.Module):
    def __init__(self):
        super(SidesCNN, self).__init__()
        self.net = torch.nn.Sequential(
            torch.nn.Conv2d(3, 32, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Conv2d(32, 64, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Conv2d(64, 128, kernel_size=3, padding=1), torch.nn.ReLU(), torch.nn.MaxPool2d(2),
            torch.nn.Flatten(),
            torch.nn.Linear(128 * 16 * 16, 64), torch.nn.ReLU(),
            torch.nn.Linear(64, 1),
            torch.nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)

def classify_sides(image):
    """
    Clasifica si una imagen satelital pertenece al lado correcto usando una CNN.

    Parámetros:
    - image: imagen satelital como PIL.Image

    Retorna:
    - True si pertenece al lado correcto, False si no
    """
    try:
        # Ajustar ruta del modelo - si es relativa, hacerla absoluta
        model_sides_path = MODEL_SIDES_PATH
        if not os.path.isabs(model_sides_path):
            # Si la ruta es relativa, buscar en el directorio actual y luego ir hacia arriba
            script_dir = os.path.dirname(os.path.abspath(__file__))
            potential_paths = [
                os.path.join(script_dir, model_sides_path),                     # functions/models/...
                os.path.join(os.path.dirname(script_dir), model_sides_path),    # backend/models/...
                os.path.join(os.path.dirname(os.path.dirname(script_dir)), model_sides_path)  # root/models/...
            ]
            
            for path in potential_paths:
                if os.path.exists(path):
                    model_sides_path = path
                    break

        # Verificar que el modelo existe
        if not os.path.exists(model_sides_path):
            print(f"No se encontró el modelo sides en ninguna ruta probada: {potential_paths}")
            return False

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model_s = SidesCNN()
        model_s.load_state_dict(torch.load(model_sides_path, map_location=device))
        model_s.to(device)
        model_s.eval()

        # Transformaciones necesarias
        transform = transforms.Compose([
            transforms.Resize((128, 128)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
        ])

        input_tensor = transform(image).unsqueeze(0)  # Añade batch dim

        # Predicción
        with torch.no_grad():
            output = model_s(input_tensor)
            prediction = output.item() > 0.5  # Asumiendo salida sigmoid y binaria

        return prediction

    except Exception as e:
        print(f"Error en classify_sides: {str(e)}")
        return False

def obtener_imagenes_adyacentes(coords, percent_poi, orientation, distancia_metros=15):
    """
    Obtiene imágenes adyacentes al POI y verifica si alguna está en el lado correcto usando una CNN.

    Retorna:
    - Diccionario con 'status' y la coordenada si alguna imagen es válida.
    """
    try:
        # Validación básica
        if len(coords) < 2:
            return {"error": "Se necesitan al menos 2 coordenadas"}
        if not (0 <= percent_poi <= 100):
            return {"error": "percent_poi debe estar entre 0 y 100"}
        if orientation not in ['R', 'L']:
            return {"error": "orientation debe ser 'R' o 'L'"}

        # Necesitamos ajustar el formato de coordenadas - si vienen como (lon, lat) convertir a (lat, lon)
        # para las funciones de procesamiento geometrico
        flipped_coords = coords
        if isinstance(coords[0], (list, tuple)) and len(coords[0]) == 2:
            # Verificar si las coordenadas parecen estar en formato (lon, lat)
            # Esto es una aproximación basada en el rango típico de coordenadas
            if all(-180 <= coord[0] <= 180 and -90 <= coord[1] <= 90 for coord in coords):
                # Si parece (lon, lat), invertir a (lat, lon) para el punto_y_perpendicular
                flipped_coords = [(coord[1], coord[0]) for coord in coords]

        # 1. Calcular punto del POI y vector perpendicular
        resultado = punto_y_perpendicular(flipped_coords, percent_poi, orientation)
        punto_poi = resultado['punto']
        vector_perpendicular = resultado['perpendicular']

        # 2. Convertir metros a grados
        lat_rad = math.radians(punto_poi[0])  # punto_poi es (lat, lon)
        m_per_deg_lat = 111320
        m_per_deg_lon = m_per_deg_lat * math.cos(lat_rad)

        distancia_grados_lat = distancia_metros / m_per_deg_lat
        distancia_grados_lon = distancia_metros / m_per_deg_lon

        # 3. Calcular puntos adyacentes
        punto_derecha = (
            punto_poi[0] + vector_perpendicular[0] * distancia_grados_lat,
            punto_poi[1] + vector_perpendicular[1] * distancia_grados_lon
        )

        punto_izquierda = (
            punto_poi[0] - vector_perpendicular[0] * distancia_grados_lat,
            punto_poi[1] - vector_perpendicular[1] * distancia_grados_lon
        )

        # 4. Obtener imágenes y clasificar
        try:
            # get_satellite_tile espera (lat, lon)
            image_derecha = get_satellite_tile(punto_derecha[0], punto_derecha[1], 
                                          ZOOM_LEVEL, TILE_FORMAT, TILE_SIZE, API_KEY, None)
            right_valid = classify_sides(image_derecha) if image_derecha else False
        except Exception as e:
            print(f"Error obteniendo o clasificando lado derecho: {e}")
            right_valid = False

        try:
            image_izquierda = get_satellite_tile(punto_izquierda[0], punto_izquierda[1], 
                                            ZOOM_LEVEL, TILE_FORMAT, TILE_SIZE, API_KEY, None)
            left_valid = classify_sides(image_izquierda) if image_izquierda else False
        except Exception as e:
            print(f"Error obteniendo o clasificando lado izquierdo: {e}")
            left_valid = False

        # 5. Evaluar resultado
        if right_valid:
            return {"status": "2. Wrong Location", "data": (punto_derecha[0], punto_derecha[1])}
        elif left_valid:
            return {"status": "2. Wrong Location", "data": (punto_izquierda[0], punto_izquierda[1])}
        else:
            return {"status": "1. POI non-existent", "data": (punto_poi[0], punto_poi[1])}

    except Exception as e:
        print(f"Error en obtener_imagenes_adyacentes: {str(e)}")
        return {"status": "Error", "error": str(e)}

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
            imagen = get_satellite_tile(lat, lon, ZOOM_LEVEL, TILE_FORMAT, TILE_SIZE, API_KEY, tile_path)
            
            if imagen:
                # Procesar imagen y realizar predicción
                if os.path.exists(tile_path):
                    img = Image.open(tile_path).convert('RGB')
                    img_tensor = transform(img).unsqueeze(0).to(device)
                else:
                    # Si no se guardó el archivo, usar la imagen directamente
                    img_tensor = transform(imagen).unsqueeze(0).to(device)
                
                with torch.no_grad():
                    output = model(img_tensor)
                    pred_label = int((output > 0.5).float().item())
                
                # Si el modelo principal detecta un camellón
                if pred_label == 1:
                    # Guardar resultados con la etiqueta de excepción de regla
                    resultados[pid] = {
                        'x_cord': lon,
                        'y_cord': lat,
                        'POI_NAME': nombre,
                        'label': '4. Rule exception'
                    }
                else:
                    # Si no detecta camellón, probar con los lados adyacentes
                    sides_response = obtener_imagenes_adyacentes(coords, percent, side)
                    
                    if sides_response.get("status") == "2. Wrong Location":
                        # Si encuentra una ubicación alternativa
                        resultados[pid] = {
                            'x_cord': sides_response['data'][0],
                            'y_cord': sides_response['data'][1],
                            'POI_NAME': nombre,
                            'label': sides_response['status']
                        }
                    else:
                        # Si no encuentra ninguna ubicación válida
                        resultados[pid] = {
                            'x_cord': lon,
                            'y_cord': lat,
                            'POI_NAME': nombre,
                            'label': sides_response.get('status', '1. POI non-existent')
                        }
            else:
                # En caso de error al obtener la imagen
                resultados[pid] = {
                    'x_cord': lon,
                    'y_cord': lat,
                    'POI_NAME': nombre,
                    'label': '3. Invalid location',
                    'error': 'No se pudo obtener la imagen de satélite'
                }
        except Exception as e:
            # En caso de error en el procesamiento
            resultados[row.get('POI_ID', 'unknown')] = {
                'x_cord': lon if 'lon' in locals() else None,
                'y_cord': lat if 'lat' in locals() else None,
                'POI_NAME': nombre if 'nombre' in locals() else None,
                'error': str(e),
                'label': 'Error'
            }
    
    return resultados
