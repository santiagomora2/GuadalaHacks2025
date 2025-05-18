import pandas as pd
import ast
from PIL import Image
from torchvision import transforms
from tqdm import tqdm
import numpy as np
import requests
import math
import os

# Obtener API KEY desde variables de entorno
API_KEY = os.environ.get('API_KEY', 'wEmGiRQk7GrIqqwGGmhK-Qjmdg-KkkUFXOGAjfjzsoQ')

# Función para calcular puntos perpendiculares
def punto_y_perpendicular(coords, percent, side='R'):
    """
    Calcula el punto que se encuentra en un porcentaje específico de una ruta 
    y genera un vector unitario perpendicular en ese punto.
    """
    percent = percent/100 if percent > 1 else percent

    # Validación básica de entradas
    if len(coords) < 2:
        raise ValueError("Se necesitan al menos dos coordenadas para definir una ruta.")
    if not (0 <= percent <= 1):
        raise ValueError("El porcentaje debe estar entre 0 y 1.")
    
    # Convertir coordenadas a arrays de numpy para facilitar operaciones vectoriales
    coords = [np.array(p) for p in coords]

    # Obtener el nodo inicial de la ruta
    nodo_inicial = coords[0]

    # Calcular las distancias entre cada par consecutivo de puntos (segmentos de ruta)
    distancias = [np.linalg.norm(coords[i+1] - coords[i]) for i in range(len(coords) - 1)]
    total = sum(distancias)  # longitud total de la ruta
    d_objetivo = percent * total  # distancia acumulada objetivo

    acumulado = 0  # acumulador para las distancias recorridas

    # Recorremos los segmentos para encontrar en cuál cae el punto objetivo
    for i, d in enumerate(distancias):
        if acumulado + d >= d_objetivo:
            # Calcular cuánto porcentaje del segmento recorrer para alcanzar d_objetivo
            t = (d_objetivo - acumulado) / d
            punto = coords[i] + t * (coords[i+1] - coords[i])  # interpolación lineal

            # Calcular vector dirección unitario del segmento
            v = coords[i+1] - coords[i]
            v_unit = v / np.linalg.norm(v)

            # Calcular vector perpendicular hacia el lado especificado
            if side == 'R':
                perpendicular = np.array([v_unit[1], -v_unit[0]])
            elif side == 'L':
                perpendicular = np.array([-v_unit[1], v_unit[0]])
            else:
                raise ValueError("El parámetro 'side' debe ser 'R' o 'L'.")

            return {
                'punto': tuple(punto),
                'perpendicular': tuple(perpendicular),
                'nodo_inicial': nodo_inicial
            }

        acumulado += d

    # Si llegamos aquí, el porcentaje es 1.0 exacto -> último punto de la ruta
    v = coords[-1] - coords[-2]
    v_unit = v / np.linalg.norm(v)
    if side == 'R':
        perpendicular = np.array([v_unit[1], -v_unit[0]])
    elif side == 'L':
        perpendicular = np.array([-v_unit[1], v_unit[0]])

    return {
        'punto': tuple(coords[-1]),
        'perpendicular': tuple(perpendicular),
        'nodo_inicial': nodo_inicial
    }


# Funciones para manejo de tiles y coordenadas
def lat_lon_to_tile(lat, lon, zoom):
    """Convierte latitud y longitud a índices de tile (x, y) en un nivel de zoom dado."""
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    n = 2.0 ** zoom
    x = int((lon_rad - (-math.pi)) / (2 * math.pi) * n)
    y = int((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * n)
    return (x, y)

def tile_coords_to_lat_lon(x, y, zoom):
    """Convierte índices de tile (x, y) a latitud y longitud."""
    n = 2.0 ** zoom
    lon_deg = x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1-2 * y/n)))
    lat_def = math.degrees(lat_rad)
    return (lat_def, lon_deg)

def get_tile_bounds(x, y, zoom):
    """Obtiene los límites de un tile en coordenadas geográficas."""
    lat1, lon1 = tile_coords_to_lat_lon(x,y,zoom)
    lat2, lon2 = tile_coords_to_lat_lon(x+1, y, zoom)
    lat3, lon3 = tile_coords_to_lat_lon(x+1,y+1,zoom)
    lat4, lon4 = tile_coords_to_lat_lon(x,y+1,zoom)
    return (lat1, lon1), (lat2, lon2), (lat3, lon3), (lat4, lon4)

def create_wkt_polygon(bounds):
    """Crea un polígono WKT a partir de límites."""
    (lat1, lon1), (lat2, lon2), (lat3, lon3), (lat4, lon4) = bounds
    wkt = f"POLYGON(({lon1} {lat1}, {lon2} {lat2}, {lon3} {lat3}, {lon4} {lat4}, {lon1} {lat1}))"
    return wkt

def get_satellite_tile(lat, lon, zoom, tile_format, tile_size, api_key, output_path):
    """Obtiene un tile de satélite para las coordenadas dadas."""
    x, y = lat_lon_to_tile(lat, lon, zoom)
    
    # Construir la URL para la API de tiles de mapas
    url = f'https://maps.hereapi.com/v3/base/mc/{zoom}/{x}/{y}/{tile_format}&style=satellite.day&size={tile_size}?apiKey={api_key}'
    
    # Hacer la petición
    response = requests.get(url)
    
    # Verificar si la petición fue exitosa
    if response.status_code == 200:
        # Guardar el tile en un archivo
        with open(output_path, 'wb') as file:
            file.write(response.content)
        return True
    else:
        print(f"Error al obtener tile: {response.status_code}, URL: {url}")
        return False