// frontend/src/services/HereMapService.js

/**
 * Servicio para gestionar la integración con HERE Maps
 */

// Esta función carga los scripts de HERE Maps si aún no están cargados
const loadHereMapScripts = () => {
    return new Promise((resolve, reject) => {
      // Verificar si los scripts ya están cargados
      if (window.H) {
        resolve();
        return;
      }
  
      // Cargar los scripts de HERE Maps
      const scriptCore = document.createElement('script');
      scriptCore.type = 'text/javascript';
      scriptCore.src = 'https://js.api.here.com/v3/3.1/mapsjs-core.js';
      scriptCore.async = true;
      scriptCore.defer = true;
  
      const scriptService = document.createElement('script');
      scriptService.type = 'text/javascript';
      scriptService.src = 'https://js.api.here.com/v3/3.1/mapsjs-service.js';
      scriptService.async = true;
      scriptService.defer = true;
  
      // Scripts adicionales para interactividad
      const scriptMapEvents = document.createElement('script');
      scriptMapEvents.type = 'text/javascript';
      scriptMapEvents.src = 'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js';
      scriptMapEvents.async = true;
      scriptMapEvents.defer = true;
  
      const scriptUI = document.createElement('script');
      scriptUI.type = 'text/javascript';
      scriptUI.src = 'https://js.api.here.com/v3/3.1/mapsjs-ui.js';
      scriptUI.async = true;
      scriptUI.defer = true;
  
      // Estilos para la UI
      const linkUI = document.createElement('link');
      linkUI.rel = 'stylesheet';
      linkUI.type = 'text/css';
      linkUI.href = 'https://js.api.here.com/v3/3.1/mapsjs-ui.css';
  
      // Añadir scripts al DOM
      document.head.appendChild(linkUI);
      document.body.appendChild(scriptCore);
  
      // Esperar a que se cargue el script principal antes de cargar los demás
      scriptCore.onload = () => {
        document.body.appendChild(scriptService);
        
        scriptService.onload = () => {
          document.body.appendChild(scriptMapEvents);
          
          scriptMapEvents.onload = () => {
            document.body.appendChild(scriptUI);
            
            scriptUI.onload = () => {
              resolve();
            };
            
            scriptUI.onerror = () => {
              reject(new Error('Error cargando HERE Maps UI'));
            };
          };
          
          scriptMapEvents.onerror = () => {
            reject(new Error('Error cargando HERE Maps Events'));
          };
        };
        
        scriptService.onerror = () => {
          reject(new Error('Error cargando HERE Maps Service'));
        };
      };
      
      scriptCore.onerror = () => {
        reject(new Error('Error cargando HERE Maps Core'));
      };
    });
  };
  
  // Función para inicializar el mapa
  export const setupHereMap = async (mapContainer) => {
    try {
      // Cargar los scripts necesarios
      await loadHereMapScripts();
      
      // Obtener la API key del archivo .env en la raíz
      // IMPORTANTE: En Create React App, las variables de entorno deben empezar con REACT_APP_
      const apiKey = process.env.REACT_APP_HERE_API_KEY;
      
      if (!apiKey) {
        console.error('La API key de HERE Maps no está configurada');
        return null;
      }
  
      // Inicializar la plataforma con la API key
      const platform = new window.H.service.Platform({
        apikey: apiKey
      });
  
      // Obtener los tipos de mapas por defecto
      const defaultLayers = platform.createDefaultLayers();
  
      // Coordenadas de Zapopan, Jalisco, MX (para ubicar el mapa en esta zona)
      const mapCenter = { lat: 20.7214, lng: -103.3905 };
  
      // Crear una instancia del mapa
      const map = new window.H.Map(
        mapContainer,
        defaultLayers.vector.normal.map,
        {
          zoom: 12,
          center: mapCenter,
          pixelRatio: window.devicePixelRatio || 1
        }
      );
  
      // Añadir controles de interactividad (zoom, pan, etc.)
      const behavior = new window.H.mapevents.Behavior(
        new window.H.mapevents.MapEvents(map)
      );
  
      // Añadir controles de UI (zoom, escala, etc.)
      const ui = window.H.ui.UI.createDefault(map, defaultLayers);
  
      // Hacer el mapa responsive
      const resizeListener = () => {
        map.getViewPort().resize();
      };
      
      window.addEventListener('resize', resizeListener);
  
      // Retornar el mapa para uso en el componente
      return map;
    } catch (error) {
      console.error('Error inicializando el mapa de HERE:', error);
      throw error;
    }
  };
  
  // Función para añadir un marcador
  export const addMarker = (map, coordinates, text) => {
    if (!map || !window.H) return null;
    
    const marker = new window.H.map.Marker(coordinates);
    if (text) {
      marker.setData(text);
    }
    map.addObject(marker);
    
    return marker;
  };
  
  // Función para crear una ruta entre dos puntos
  export const calculateRoute = async (map, start, destination) => {
    if (!map || !window.H) return null;
    
    // Obtener la plataforma del mapa
    const platform = map.getBaseLayer().getPlatform();
    
    // Crear el servicio de enrutamiento
    const router = platform.getRoutingService(null, 8);
    
    // Configurar los parámetros de la ruta
    const routeParams = {
      routingMode: 'fast',
      transportMode: 'car',
      origin: `${start.lat},${start.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      return: 'polyline,summary'
    };
    
    // Calcular la ruta
    return new Promise((resolve, reject) => {
      router.calculateRoute(routeParams, (result) => {
        if (result.routes && result.routes.length > 0) {
          // Crear una polilínea para la ruta
          const route = result.routes[0];
          const lineString = new window.H.geo.LineString();
          
          // Extraer los puntos de la ruta
          route.sections.forEach((section) => {
            section.polyline.map((point) => {
              const [lat, lng] = point.split(',').map(Number);
              lineString.pushPoint({ lat, lng });
            });
          });
          
          // Crear un objeto polilínea para mostrar en el mapa
          const routeLine = new window.H.map.Polyline(lineString, {
            style: { strokeColor: '#0066CC', lineWidth: 5 }
          });
          
          // Añadir la ruta al mapa
          map.addObject(routeLine);
          
          // Ajustar el zoom para ver toda la ruta
          map.getViewModel().setLookAtData({
            bounds: routeLine.getBoundingBox()
          });
          
          resolve(route);
        } else {
          reject(new Error('No se pudo calcular la ruta'));
        }
      }, reject);
    });
  };