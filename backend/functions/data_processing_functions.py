import pandas as pd 
import geopandas as gpd
import numpy as np
import os
import traceback

# Use environment variables
DATA_DIR = os.environ.get('DATA_DIR', '../data')
TEMP_DIR = os.environ.get('TEMP_DIR', 'temp')

# Funciones de procesamiento de datos
def get_points_df(path_gdf: str, path_points: str, slice=-1):
    """
    The function merges the point table and the GeoJSON to find the points of interest that have a link_id whose route shows 
    multi-digitization. It returns the dataframe of points with these cases and the linestring (geometry) associated with their link_id. 
    It adds a label indicating whether the link_id for the point has multi-digitization or not.

    Input: GeoJSON file path, POI.csv  

    Output: CSV with the database of points, the linestring of their link_id, and a classification indicating whether their route has multi-digitization or not
    """
    # Verify if the files exist
    if not os.path.exists(path_gdf):
        raise FileNotFoundError(f"Archivo de navegación no encontrado: {path_gdf}")
    if not os.path.exists(path_points):
        raise FileNotFoundError(f"Archivo de POI no encontrado: {path_points}")
    
    # Debugging print
    print(f"Cargando archivos: {path_gdf}, {path_points}")
    
    # Load GeoDataFrame
    gdf = gpd.read_file(path_gdf)
    gdf["geometry"] = gdf.geometry.apply(lambda geom: list(geom.coords) if geom.geom_type == 'LineString' else None)
    links_id = list(gdf.loc[gdf["MULTIDIGIT"] == "Y"]["link_id"].unique())
    
    # Load Points
    poi_df = pd.read_csv(path_points, encoding="utf-8")
    poi_df.drop_duplicates(subset=["LINK_ID", "POI_ID"], keep="first", inplace=True)
    
    # Merge on link_id
    poi_df = poi_df.merge(
        gdf[['link_id', 'geometry']],
        left_on='LINK_ID',
        right_on='link_id',
        how='left'
    )
    
    # Find points with corresponding to a multidigitalised link_id
    poi_rm = list(poi_df.loc[poi_df["LINK_ID"].isin(links_id)]["POI_ID"].unique())
    
    # Asign label
    poi_df.loc[:, "label_rm"] = np.where(poi_df["POI_ID"].isin(poi_rm), 1, 0)
    
    # Filtrar y devolver
    return poi_df.loc[(poi_df["label_rm"] == 1) & (poi_df["POI_ST_SD"].isin(["L", "R"]))].reset_index(drop=True)[:slice]

def create_dicts_for_sorting(df):
    """
    This function receives a DataFrame and extract a list of coordinates and link_ids 
    to create a dictionary: {'link_id': coordinates for reference node}
    Input: DataFrame 
    Output: Dictionary
    """
    coords_list = [df.loc[i, 'geometry'][0] for i in range(len(df))]
    link_ids_list = [df.loc[i, 'LINK_ID'] for i in range(len(df))]
    coords = dict(zip(link_ids_list, coords_list))
    return coords

def get_sorted_x_y(df):
    """This function sorts the link_id-coordinates dictionary based on x or y coordinate.
    Input: DataFrame
    Output: Two sorted dictionaries with the form {'link_id': coordinate} (sorted_x, sorted_y) sorted based on x or y coordinate
    """
    coords = create_dicts_for_sorting(df)
    # Ordenado por coordenada x
    sorted_x = dict(sorted(coords.items(), key=lambda item: item[1][0]))
    # Ordenado por coordenada y
    sorted_y = dict(sorted(coords.items(), key=lambda item: item[1][1]))
    return sorted_x, sorted_y

def encontrar_link_alineado(link_id, x_sorted, y_sorted, coord_dict, df, dot_threshold=0.90, max_dist=0.00035, n_vecinos=10):
    """
    Finds the best-aligned neighboring segment (link) to a given `link_id` based on geometric direction and spatial proximity.
    
    This function takes a segment identifier (`link_id`) and searches among its spatial neighbors—sorted by X and Y coordinates
    for another segment whose direction vector is sufficiently aligned (via dot product threshold) and lies within a maximum distance. 
    Direction is computed using the vector between the first two nodes of the geometry.
    
    Parameters:
    -----------
    - link_id : str or int  
        The identifier of the base segment for which an aligned pair is to be found.
    
    - coord_dict : dict  
        Dictionary mapping each `link_id` to its starting node as a (x, y) coordinate.
    
    - x_sorted : dict  
        Dictionary with `link_id`s sorted by their X coordinate.
    
    - y_sorted : dict  
        Dictionary with `link_id`s sorted by their Y coordinate.
    
    - df : pandas.DataFrame  
        DataFrame containing at least the columns `LINK_ID` and `geometry`, 
        where `geometry` is a list of coordinates representing the route.
    
    - n_neighbors : int, optional (default=5)  
        Number of neighboring links to consider in both directions of the sorted lists.
    
    - dot_threshold : float, optional (default=0.90)  
        Minimum dot product threshold between direction vectors to be considered "aligned" 
        (closer to 1.0 means more aligned).
    
    - max_dist : float, optional (default=0.0003)  
        Maximum allowed distance between starting coordinates for a pair to be valid.
    
    Returns:
    --------
    - pair : str or int  
        The `link_id` of the best-aligned and closest segment.
    
    - coord_dict : dict  
        Updated version of `coord_dict` without `link_id` and its matched pair.
    
    - x_sorted : dict  
        Updated `x_sorted` dictionary without the pair.
    
    - y_sorted : dict  
        Updated `y_sorted` dictionary without the pair.
    
    Raises:
    -------
    - `ValueError` if `link_id` is not found or no sufficiently aligned and close neighbor is found.
    """
    # Copy original dictionaries to avoid overwriting.
    coord_dict = coord_dict.copy()
    x_sorted = x_sorted.copy()
    y_sorted = y_sorted.copy()
    
    # List of sorted link_ids
    x_keys = list(x_sorted.keys())
    y_keys = list(y_sorted.keys())
    
    try:
        idx_x = x_keys.index(link_id)
        idx_y = y_keys.index(link_id)
    except ValueError:
        raise ValueError(f"{link_id} no se encontró en x_sorted o y_sorted")
    
    # Neighbours in x,y
    vecinos = set()
    for offset in range(1, n_vecinos + 1):
        if idx_x - offset >= 0:
            vecinos.add(x_keys[idx_x - offset])
        if idx_x + offset < len(x_keys):
            vecinos.add(x_keys[idx_x + offset])
        if idx_y - offset >= 0:
            vecinos.add(y_keys[idx_y - offset])
        if idx_y + offset < len(y_keys):
            vecinos.add(y_keys[idx_y + offset])
    
    vecinos.add(link_id)  # Add the same link_id to create the vector
    vecinos = list(vecinos)
    
    # Create direction vectors
    vectores = {}
    for lid in vecinos:
        nodo_ini = np.array(coord_dict[lid])
        row = df[df['LINK_ID'] == lid].reset_index()
        nodo_sig = np.array([row.loc[0, 'geometry'][1][0], row.loc[0, 'geometry'][1][1]])
        vectores[lid] = nodo_sig - nodo_ini
    
    # Base vector
    v0 = vectores[link_id] / np.linalg.norm(vectores[link_id])
    
    # Compare with other candidates vectors
    candidatos = []
    for lid, vec in vectores.items():
        if lid == link_id:
            continue
        v = vec / np.linalg.norm(vec)
        dot = np.dot(v0, v)
        if dot >= dot_threshold:
            dist = np.linalg.norm(np.array(coord_dict[link_id]) - np.array(coord_dict[lid]))
            if dist <= max_dist:
                candidatos.append((lid, dot, dist))
    
    if not candidatos:
        raise ValueError(f"Ningún vector suficientemente alineado y cercano")
    
    # Choose the best
    candidatos = sorted(candidatos, key=lambda x: -x[1])
    max_dot = candidatos[0][1]
    mejores = [c for c in candidatos if np.isclose(c[1], max_dot, atol=1e-3)]
    
    if len(mejores) == 1:
        pareja = mejores[0][0]
    else:
        mejores.sort(key=lambda x: x[2])
        pareja = mejores[0][0]
    
    # Delete the pair from the dictionary
    for d in [coord_dict, x_sorted, y_sorted]:
        d.pop(link_id, None)
        d.pop(pareja, None)
    
    return pareja, coord_dict, x_sorted, y_sorted

def encontrar_link_alineados_fulldf(x_sorted, y_sorted, coord_dict, df, dot_threshold=0.90, max_dist=0.00035, n_vecinos=10):
    """Encuentra los links alineados para todo el DataFrame."""
    # Create empty column
    df['pareja'] = None
    
    # Copy of the dictionaries to update
    coord_dict_actual = coord_dict.copy()
    x_sorted_actual = x_sorted.copy()
    y_sorted_actual = y_sorted.copy()
    
    # Iterate over unique link_id values
    for link_id in df['LINK_ID'].unique():
        # Skip if it was already processed
        if link_id not in coord_dict_actual:
            continue
        
        try:
            pareja, coord_dict_actual, x_sorted_actual, y_sorted_actual = encontrar_link_alineado(
                link_id, x_sorted_actual, y_sorted_actual, coord_dict_actual, df, dot_threshold, max_dist, n_vecinos
            )
            
            # Asign the pair to all rows with the same LINK_ID
            df.loc[df['LINK_ID'] == link_id, 'pareja'] = pareja
            df.loc[df['LINK_ID'] == pareja, 'pareja'] = link_id
            
        except Exception:
            # Asign mistake (case 3) if pair not found.
            df.loc[df['LINK_ID'] == link_id, 'pareja'] = 'Error 3: road is not Multiply Digitised'

def agregar_coordenadas_pareja(df):
    """Add the coordinates of its pair to each link_id.
    Input: DataFrame 
    Output: None"""
    df['pareja_coord'] = None
    
    for lid in df['LINK_ID'].unique():
        pareja = df[df['LINK_ID'] == lid].reset_index().loc[0, 'pareja']
        if pareja != 'Error 3: road is not Multiply Digitised':
            row = df[df['LINK_ID'] == pareja].reset_index()
            coordenadas = row.loc[0, 'geometry']
            df.loc[df['LINK_ID'] == lid, 'pareja_coord'] = str(coordenadas)

def add_camellon_column_for_pair(link_id1, ref_node_1, next_node_1, link_id2, ref_node_2, next_node_2, df):
    """Add the column of the side in which side of the link_id is the ridge located. 
    Input: 
    -link_id1: link_id of the first pair
    -ref_node_1, next_node_1: Two first nodes of link_id1 geometry. 
    -link_id2: link_id of the second pair
    -ref_node_2, next_node_2: Two first nodes of link_id2 geometry.
    -df: DataFrame
    Output: None
    """
    v1 = (next_node_1[0] - ref_node_1[0], next_node_1[1] - ref_node_1[1])
    v2 = (next_node_2[0] - ref_node_2[0], next_node_2[1] - ref_node_2[1])
    
    if v1[1] == v2[1]:
        if v1[0] < v2[0]:
            df.loc[df['LINK_ID'] == link_id1, 'camellon'] = 'R'
            df.loc[df['LINK_ID'] == link_id2, 'camellon'] = 'L'
        else:
            df.loc[df['LINK_ID'] == link_id1, 'camellon'] = 'L'
            df.loc[df['LINK_ID'] == link_id2, 'camellon'] = 'R'
    elif v1[1] < v2[1]:
        df.loc[df['LINK_ID'] == link_id1, 'camellon'] = 'L'
        df.loc[df['LINK_ID'] == link_id2, 'camellon'] = 'R'
    else:
        df.loc[df['LINK_ID'] == link_id1, 'camellon'] = 'R'
        df.loc[df['LINK_ID'] == link_id2, 'camellon'] = 'L'

def add_camellon_column_for_df(df):
    """Adds the 'ridge' column to all df.
    Input: DataFrame
    Ouput: None 
    """
    
    df['camellon'] = None
    
    for lid in df['LINK_ID'].unique():
        pareja = df[df['LINK_ID'] == lid].reset_index().loc[0, 'pareja']
        
        if pareja != 'Error 3: road is not Multiply Digitised':
            ref_node_1 = df[df['LINK_ID'] == lid].reset_index().loc[0, 'geometry'][0]
            next_node_1 = df[df['LINK_ID'] == lid].reset_index().loc[0, 'geometry'][1]
            ref_node_2 = df[df['LINK_ID'] == pareja].reset_index().loc[0, 'geometry'][0]
            next_node_2 = df[df['LINK_ID'] == pareja].reset_index().loc[0, 'geometry'][1]
            
            add_camellon_column_for_pair(lid, ref_node_1, next_node_1, pareja, ref_node_2, next_node_2, df)

def get_final_df(df):
    """
    Returns the final dataframe with those POI located at the ridge.
    Input: DataFrame
    Output: DataFrame
    """
    return df[df['POI_ST_SD'] == df['camellon']]

def process_data(slice=-1):
    """Procesa los datos y obtiene el DataFrame final."""
    # Intentar encontrar los archivos en múltiples posibles ubicaciones
    possible_data_dirs = [
        DATA_DIR,                                                  # Usar la variable de entorno
        os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data'),  # backend/../data
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data'),  # ../../data
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'data')  # ../../../data
    ]
    
    path_gdf = None
    path_poi = None
    
    # Look for the files in possible locations.
    for data_dir in possible_data_dirs:
        test_path_gdf = os.path.join(data_dir, 'NAV.geojson')
        test_path_poi = os.path.join(data_dir, 'POI.csv')
        
        if os.path.exists(test_path_gdf) and os.path.exists(test_path_poi):
            path_gdf = test_path_gdf
            path_poi = test_path_poi
            print(f"Archivos encontrados en: {data_dir}")
            break
    
    # Verify if the files have been found.
    if not path_gdf or not path_poi:
        raise FileNotFoundError(f"No se encontraron los archivos de datos necesarios. Rutas buscadas: {possible_data_dirs}")
    
    print(f"Usando archivos: {path_gdf}, {path_poi}")
    
    try:
        # Obtener DataFrame de puntos
        df_poi = get_points_df(path_gdf, path_poi, slice)
        
        # Crear diccionarios y ordenamientos
        coord = create_dicts_for_sorting(df_poi)
        x_sorted, y_sorted = get_sorted_x_y(df_poi)
        
        # Encontrar parejas
        encontrar_link_alineados_fulldf(x_sorted, y_sorted, coord, df_poi)
        
        # Agregar coordenadas de la pareja
        agregar_coordenadas_pareja(df_poi)
        
        # Agregar columna camellon
        add_camellon_column_for_df(df_poi)
        
        # Obtener DataFrame final
        final_df = get_final_df(df_poi)
        
        return final_df
    except Exception as e:
        print(f"Error en process_data: {str(e)}")
        print(traceback.format_exc())
        raise