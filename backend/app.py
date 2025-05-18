from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import geopandas as gpd
import numpy as np
import torch
import ast
from PIL import Image
from torchvision import transforms
import requests
import math
import os
import glob
import shutil
import traceback
from typing import Dict, Any, List
from dotenv import load_dotenv
import sys

# Asegurar que el directorio functions está en el path
sys.path.append(os.path.abspath('.'))

# Cargar variables de entorno
load_dotenv()

# Configuración de variables a partir del .env o usar valores por defecto
API_KEY = os.getenv('HERE_API_KEY', 'wEmGiRQk7GrIqqwGGmhK-Qjmdg-KkkUFXOGAjfjzsoQ')
PORT = int(os.getenv('PORT', 5000))  # Cambiado a 5000 para coincidir con frontend
HOST = os.getenv('HOST', '0.0.0.0')
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# Configuración de rutas para adaptarse a la estructura del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.getenv('DATA_DIR', os.path.join(BASE_DIR, 'data'))  # Data dir en la raíz del proyecto
TEMP_DIR = os.getenv('TEMP_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp'))
MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models/modelo_camellones.pth'))

# Exportar las variables para que sean accesibles desde los módulos
os.environ['API_KEY'] = API_KEY
os.environ['DATA_DIR'] = DATA_DIR
os.environ['TEMP_DIR'] = TEMP_DIR
os.environ['MODEL_PATH'] = MODEL_PATH

try:
    # Importar funciones desde módulos personalizados
    from functions.cnn_functions import predecir
    from functions.data_processing_functions import process_data
    from functions.satellite_functions import *
except ImportError as e:
    print(f"Error importando módulos: {e}")
    # Crear un mensaje de error más detallado
    print(f"PATH actual: {sys.path}")
    print(f"Directorio actual: {os.getcwd()}")
    print(f"Directorio de backend: {os.path.dirname(os.path.abspath(__file__))}")
    print(f"Archivos en functions: {os.listdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'functions'))}")

app = FastAPI(title="Camellones API", description="API para procesar y predecir camellones")

# Configuración de CORS
origins = [
    "http://localhost:3000",  # Frontend React típico
    "http://localhost:5173",  # Vite
    "http://frontend:3000",   # Contenedor Docker
    "*"                       # Para desarrollo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Asegurar que existan los directorios necesarios
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

def limpiar_archivos_temporales():
    """Limpia los archivos temporales generados durante el procesamiento."""
    for filename in os.listdir(TEMP_DIR):
        file_path = os.path.join(TEMP_DIR, filename)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error al eliminar {file_path}: {e}")

@app.get("/")
async def root():
    """Endpoint raíz para verificar que la API está funcionando."""
    return {"message": "Camellones API está funcionando"}

@app.get("/process")
async def process_and_predict(background_tasks: BackgroundTasks):
    """
    Endpoint para procesar datos y realizar predicciones.
    
    Returns:
        dict: Resultados de las predicciones en formato 
              {'POI_ID': {'x_cord': x, 'y_cord': y, 'POI_NAME': name, 'label': label}}
    """
    try:
        # Verificar que existan los archivos necesarios
        poi_path = os.path.join(DATA_DIR, 'POI.csv')
        nav_path = os.path.join(DATA_DIR, 'NAV.geojson')
        
        if not os.path.exists(poi_path):
            raise HTTPException(status_code=400, detail=f"Archivo POI.csv no encontrado en {poi_path}")
        
        if not os.path.exists(nav_path):
            raise HTTPException(status_code=400, detail=f"Archivo NAV.geojson no encontrado en {nav_path}")
        
        # Procesar datos
        try:
            print(f"Iniciando process_data()")
            final_df = process_data()
            print(f"Procesamiento exitoso, dataframe con {len(final_df)} filas")
        except Exception as e:
            print(f"Error en process_data(): {str(e)}")
            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Error procesando datos: {str(e)}")
        
        # Realizar predicciones
        try:
            print(f"Iniciando predecir()")
            resultados = predecir(final_df)
            print(f"Predicción exitosa, {len(resultados)} resultados")
        except Exception as e:
            print(f"Error en predecir(): {str(e)}")
            print(traceback.format_exc())
            raise HTTPException(status_code=500, detail=f"Error al realizar predicciones: {str(e)}")
        
        # Programar limpieza de archivos temporales
        background_tasks.add_task(limpiar_archivos_temporales)
        
        return resultados
    
    except HTTPException as he:
        # Reenviar excepciones HTTP tal como son
        raise he
    except Exception as e:
        # Capturar cualquier otra excepción, loguearla y devolver un 500
        error_detail = f"Error inesperado: {str(e)}"
        print(error_detail)
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=error_detail)

@app.post("/api/upload-files", status_code=200)
async def upload_files(
    poiFile: UploadFile = File(...),
    streetsFile: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    try:
        # Verificar que los archivos tienen nombre
        if not poiFile.filename or not streetsFile.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        # Limpiar el directorio 'data' antes de guardar nuevos archivos
        try:
            # Eliminar todos los archivos en el directorio 'data'
            files = glob.glob(os.path.join(DATA_DIR, '*'))
            for f in files:
                if os.path.isfile(f):
                    os.remove(f)
                elif os.path.isdir(f):
                    shutil.rmtree(f)
            print(f"Cleaned up data directory: {DATA_DIR}")
        except Exception as e:
            print(f"Warning: Could not clean up data directory: {str(e)}")
        
        # Definir nombres estandarizados para los archivos
        poi_filename = "POI.csv"
        nav_filename = "NAV.geojson"
        
        # Guardar archivos en el directorio 'data' con nombres estandarizados
        poi_path = os.path.join(DATA_DIR, poi_filename)
        streets_path = os.path.join(DATA_DIR, nav_filename)
        
        print(f"Guardando archivos en: {DATA_DIR}")
        print(f"POI path: {poi_path}")
        print(f"Streets path: {streets_path}")
        
        # Guardar archivos
        with open(poi_path, "wb") as f:
            content = await poiFile.read()
            f.write(content)
            
        with open(streets_path, "wb") as f:
            content = await streetsFile.read()
            f.write(content)
        
        print(f"Files saved to: {DATA_DIR}")
        print(f"POI file: {poi_path}")
        print(f"Streets file: {streets_path}")
        
        # Si se proporciona background_tasks, programar limpieza de archivos temporales
        if background_tasks:
            background_tasks.add_task(limpiar_archivos_temporales)
        
        return {
            'success': True, 
            'message': 'Files uploaded successfully',
            'poi_path': poi_path,
            'streets_path': streets_path
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error al subir archivos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def api_health_check():
    """Endpoint para verificar que el servidor está funcionando (compatible con código anterior)."""
    return {"status": "ok", "message": "Server is running"}

@app.get("/health")
async def health_check():
    """Endpoint para verificar la salud completa de la API."""
    # Verificar que existen los directorios necesarios
    data_exists = os.path.exists(DATA_DIR)
    temp_exists = os.path.exists(TEMP_DIR)
    model_exists = os.path.exists(MODEL_PATH)
    
    # Verificar que existen los archivos de datos
    poi_exists = os.path.exists(os.path.join(DATA_DIR, 'POI.csv'))
    nav_exists = os.path.exists(os.path.join(DATA_DIR, 'NAV.geojson'))
    
    # Verificar la API KEY
    api_key_exists = API_KEY is not None and API_KEY != ""
    
    status = {
        "status": "healthy" if all([data_exists, temp_exists, model_exists, api_key_exists]) else "unhealthy",
        "checks": {
            "data_directory": data_exists,
            "temp_directory": temp_exists,
            "model_file": model_exists,
            "poi_file": poi_exists,
            "nav_file": nav_exists,
            "api_key": api_key_exists
        },
        "environment": {
            "data_dir": DATA_DIR,
            "temp_dir": TEMP_DIR,
            "model_path": MODEL_PATH,
            "base_dir": BASE_DIR,
            "current_dir": os.path.dirname(os.path.abspath(__file__))
        }
    }
    
    return status

@app.get("/env-info")
async def env_info():
    """Endpoint para verificar la información de las variables de entorno (sólo en desarrollo)."""
    if not DEBUG:
        raise HTTPException(status_code=403, detail="Este endpoint solo está disponible en modo desarrollo")
    
    return {
        "api_key": API_KEY[:5] + "..." if API_KEY else None,
        "data_dir": DATA_DIR,
        "temp_dir": TEMP_DIR,
        "model_path": MODEL_PATH,
        "port": PORT,
        "host": HOST,
        "debug": DEBUG,
        "base_dir": BASE_DIR,
        "current_dir": os.path.dirname(os.path.abspath(__file__)),
        "functions_path": os.path.join(os.path.dirname(os.path.abspath(__file__)), 'functions'),
        "functions_exist": os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'functions')),
        "model_exists": os.path.exists(MODEL_PATH),
        "python_path": sys.path,
    }

if __name__ == "__main__":
    import uvicorn
    print(f"Starting server on {HOST}:{PORT}")
    print(f"Data directory: {DATA_DIR}")
    print(f"Temp directory: {TEMP_DIR}")
    print(f"Model path: {MODEL_PATH}")
    uvicorn.run("app:app", host=HOST, port=PORT, reload=DEBUG)