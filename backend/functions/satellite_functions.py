import pandas as pd
import ast
from PIL import Image
from torchvision import transforms
import numpy as np
import requests
import math
import os
import io

# Obtener API KEY desde variables de entorno
API_KEY = os.environ.get('API_KEY', os.environ.get('REACT_APP_HERE_API_KEY'))

# Función para calcular puntos perpendiculares
def punto_y_perpendicular(coords, percent, side='R'):
    """
    Calculate the point of interest coordinates and the perpendicular normal vector to the direction vector based on linked nodes and the percentage of linestring to POI and side of POI 

    Input: LineString (route polygon as set of nodes, using latitude and longitude), percentage of POI location on route, side 

    Output: Coordinates of POI, perpendicular normal vector, link reference node

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
    """
    Converts latitude and longitude to tile (x, y) indices at a given zoom level.

    This is useful when identifying which map tile a geographic point (e.g., from a GeoJSON or POI file)
    belongs to in a tile-based mapping system.

    Parameters:
        lat (float): Latitude in decimal degrees.
        lon (float): Longitude in decimal degrees.
        zoom (int): Zoom level of the tile grid.

    Returns:
        tuple: (x, y) tile indices corresponding to the input coordinates.
    """
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    n = 2.0 ** zoom
    x = int((lon_rad - (-math.pi)) / (2 * math.pi) * n)
    y = int((1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * n)
    return (x, y)

def tile_coords_to_lat_lon(x, y, zoom):
    """
    Converts tile (x, y) indices back to latitude and longitude.

    This provides the geographic coordinates for the top-left corner of a tile, which
    is useful when reconstructing spatial extents from tile grids.

    Parameters:
        x (int): X index of the tile.
        y (int): Y index of the tile.
        zoom (int): Zoom level of the tile grid.

    Returns:
        tuple: (latitude, longitude) of the tile corner.
    """
    n = 2.0 ** zoom
    lon_deg = x / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1-2 * y/n)))
    lat_def = math.degrees(lat_rad)
    return (lat_def, lon_deg)

def get_tile_bounds(x, y, zoom):
    """
    Returns the geographic bounding box of a tile as corner coordinates.

    Useful for determining the exact spatial extent of a satellite or map tile, which can
    be compared with geometries in a GeoJSON or used to generate spatial queries.

    Parameters:
        x (int): X index of the tile.
        y (int): Y index of the tile.
        zoom (int): Zoom level.

    Returns:
        tuple: Coordinates of the four corners of the tile in (lat, lon) format.
               Returned in order: top-left, top-right, bottom-right, bottom-left.
    """
    lat1, lon1 = tile_coords_to_lat_lon(x,y,zoom)
    lat2, lon2 = tile_coords_to_lat_lon(x+1, y, zoom)
    lat3, lon3 = tile_coords_to_lat_lon(x+1,y+1,zoom)
    lat4, lon4 = tile_coords_to_lat_lon(x,y+1,zoom)
    return (lat1, lon1), (lat2, lon2), (lat3, lon3), (lat4, lon4)

def create_wkt_polygon(bounds):
    """
    Creates a WKT (Well-Known Text) polygon string from a list of tile corner bounds.

    This is useful when exporting or visualizing the area covered by a tile in tools that
    accept WKT input, or for spatial operations against GeoJSON features.

    Parameters:
        bounds (tuple): Four (lat, lon) coordinate pairs representing the corners of a tile.

    Returns:
        str: A WKT polygon string representing the tile area.
    """
    (lat1, lon1), (lat2, lon2), (lat3, lon3), (lat4, lon4) = bounds
    wkt = f"POLYGON(({lon1} {lat1}, {lon2} {lat2}, {lon3} {lat3}, {lon4} {lat4}, {lon1} {lat1}))"
    return wkt

def get_satellite_tile(lat, lon, zoom, tile_format, tile_size, api_key, output_path=None):
"""
Obtains a satellite image tile for the given coordinates.

Args:
    lat (float): Latitude of the point
    lon (float): Longitude of the point
    zoom (int): Zoom level
    tile_format (str): Tile format (png, jpg)
    tile_size (int): Tile size in pixels
    api_key (str): API Key for HERE Maps
    output_path (str, optional): If provided, saves the image to this path

Returns:
    PIL.Image if output_path is None, or True/False if output_path is provided
"""

    x, y = lat_lon_to_tile(lat, lon, zoom)
    
    # Construir la URL para la API de tiles de mapas
    url = f'https://maps.hereapi.com/v3/base/mc/{zoom}/{x}/{y}/{tile_format}?style=satellite.day&size={tile_size}&apiKey={api_key}'
    
    # Hacer la petición
    response = requests.get(url)
    
    # Verificar si la petición fue exitosa
    if response.status_code == 200:
        if output_path:
            # Guardar el tile en un archivo
            with open(output_path, 'wb') as file:
                file.write(response.content)
            return True
        else:
            # Devolver la imagen como objeto PIL.Image
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
            return image
    else:
        print(f"Error al obtener tile: {response.status_code}, URL: {url}")
        return False
