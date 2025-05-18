# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import glob
import shutil

app = Flask(__name__)
CORS(app)  # Habilitar CORS para poder conectar con el frontend

# Crear el directorio 'data' si no existe
data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
os.makedirs(data_dir, exist_ok=True)

@app.route('/api/upload-files', methods=['POST'])
def upload_files():
    try:
        # Verificar si los archivos están en la petición
        if 'poiFile' not in request.files or 'streetsFile' not in request.files:
            return jsonify({'success': False, 'message': 'Missing files in request'}), 400
        
        poi_file = request.files['poiFile']
        streets_file = request.files['streetsFile']
        
        # Verificar que los archivos tienen nombre
        if poi_file.filename == '' or streets_file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        # Limpiar el directorio 'data' antes de guardar nuevos archivos
        try:
            # Eliminar todos los archivos en el directorio 'data'
            files = glob.glob(os.path.join(data_dir, '*'))
            for f in files:
                if os.path.isfile(f):
                    os.remove(f)
                elif os.path.isdir(f):
                    shutil.rmtree(f)
            print(f"Cleaned up data directory: {data_dir}")
        except Exception as e:
            print(f"Warning: Could not clean up data directory: {str(e)}")
        
        # Definir nombres estandarizados para los archivos
        poi_filename = "POI.csv"
        nav_filename = "NAV.geojson"
        
        # Guardar archivos en el directorio 'data' con nombres estandarizados
        poi_path = os.path.join(data_dir, poi_filename)
        streets_path = os.path.join(data_dir, nav_filename)
        
        poi_file.save(poi_path)
        streets_file.save(streets_path)
        
        print(f"Files saved to: {data_dir}")
        print(f"POI file: {poi_path}")
        print(f"Streets file: {streets_path}")
        
        # Aquí se llamaría al código de validación
        # validate_files(poi_path, streets_path)
        
        return jsonify({
            'success': True, 
            'message': 'Files uploaded successfully',
            'poi_path': poi_path,
            'streets_path': streets_path
        })
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

# Ruta para verificar que el servidor está funcionando
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting server on port {port}")
    print(f"Data directory: {data_dir}")
    app.run(host='0.0.0.0', port=port, debug=True)