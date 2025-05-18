// frontend/src/components/Map/HEREMapComponent.jsx
import React, { useEffect, useRef, useState, useContext } from 'react';
import styled from 'styled-components';
import { setupHereMap } from '../../services/HereMapService';
import { POIContext } from '../../context/POIContext';

// Map container
const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

// Status message
const StatusMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  text-align: center;
  font-weight: bold;
`;

const HEREMapComponent = () => {
  // Reference for the map container
  const mapContainerRef = useRef(null);
  
  // States for map management
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get POI data from context
  const { poiData } = useContext(POIContext);
  
  // Initialize the map when component mounts
  useEffect(() => {
    const initMap = async () => {
      setIsLoading(true);
      try {
        if (mapContainerRef.current) {
          // Initialize the map
          const map = await setupHereMap(mapContainerRef.current);
          
          if (map) {
            console.log("Map created successfully");
            setMapInstance(map);
          } else {
            setError("Could not initialize the map. Check the console for details.");
          }
        }
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Could not load the map. Please check your connection and API key.');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize map if not already initialized
    initMap();
  }, []);
  
  // Show zone with invalid POIs when data changes
  useEffect(() => {
    // Skip if any requirements missing
    if (!mapInstance || !poiData || !window.H) {
      return;
    }
    
    console.log("Processing POI data for visualization");
    
    // Clear existing objects from the map
    const currentObjects = mapInstance.getObjects();
    mapInstance.removeObjects(currentObjects);
    
    // Parse POI data
    const poiDataObject = typeof poiData === 'string' ? JSON.parse(poiData) : poiData;
    console.log("POI data loaded, total items:", Object.keys(poiDataObject).length);
    
    // Find all invalid POIs
    const invalidPOIs = [];
    
    // Process each POI
    Object.entries(poiDataObject).forEach(([id, poi]) => {
      try {
        // Skip if there's an error with this POI
        if (poi.error) return;
        
        // Skip if not invalid (only interested in invalid POIs)
        if (poi.label === 1) return;
        
        // Skip if coordinates are missing
        if (poi.x_cord === undefined || poi.y_cord === undefined) return;
        
        // Convert coordinates to numbers if they're strings
        const lat = typeof poi.y_cord === 'string' ? parseFloat(poi.y_cord) : poi.y_cord;
        const lng = typeof poi.x_cord === 'string' ? parseFloat(poi.x_cord) : poi.x_cord;
        
        // Skip if coordinates are not valid numbers
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;
        
        // Add to invalid POIs list
        invalidPOIs.push({lat, lng, id});
      } catch (e) {
        console.error("Error processing POI:", e);
      }
    });
    
    // If we found any invalid POIs, show their zone
    if (invalidPOIs.length > 0) {
      console.log(`Found ${invalidPOIs.length} invalid POIs`);
      
      // Log first few POIs for verification
      invalidPOIs.slice(0, 3).forEach((poi, i) => {
        console.log(`Invalid POI ${i+1}: ${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}`);
      });
      
      // Calculate the center of all invalid POIs
      let sumLat = 0;
      let sumLng = 0;
      
      for (const poi of invalidPOIs) {
        sumLat += poi.lat;
        sumLng += poi.lng;
      }
      
      const centerLat = sumLat / invalidPOIs.length;
      const centerLng = sumLng / invalidPOIs.length;
      
      console.log(`Center of invalid POIs: ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)}`);
      
      // Calculate the radius (use the maximum distance from center to any invalid POI)
      let maxDistance = 0;
      for (const poi of invalidPOIs) {
        // Simple Euclidean distance (not accurate for long distances but ok for visualization)
        const distance = Math.sqrt(
          Math.pow((poi.lat - centerLat) * 111000, 2) + 
          Math.pow((poi.lng - centerLng) * 111000 * Math.cos(centerLat * Math.PI / 180), 2)
        );
        
        if (distance > maxDistance) {
          maxDistance = distance;
        }
      }
      
      // Add a buffer to the radius (minimum 500 meters, or 20% larger than max distance)
      const radius = Math.max(500, maxDistance * 1.2);
      console.log(`Maximum distance from center: ${maxDistance.toFixed(0)} meters`);
      console.log(`Circle radius: ${radius.toFixed(0)} meters`);
      
      // Create a circle for the invalid POIs zone
      try {
        const circle = new window.H.map.Circle(
          { lat: centerLat, lng: centerLng },
          radius, // radius in meters
          {
            style: {
              strokeColor: 'rgba(255, 0, 0, 0.8)', // Red outline
              lineWidth: 2,
              fillColor: 'rgba(255, 0, 0, 0.3)' // Transparent red fill
            }
          }
        );
        
        // Add the circle to the map
        mapInstance.addObject(circle);
        console.log(`Added circle at ${centerLat.toFixed(6)}, ${centerLng.toFixed(6)} with radius ${radius.toFixed(0)} meters`);
        
        // Center the map on the circle and zoom appropriately
        mapInstance.setCenter({ lat: centerLat, lng: centerLng });
        
        // Calculate appropriate zoom level based on radius
        // Approximate formula: larger radius = smaller zoom level
        const zoomLevel = Math.max(10, 16 - Math.log2(radius / 100));
        mapInstance.setZoom(zoomLevel);
        console.log(`Set zoom level to ${zoomLevel.toFixed(1)}`);
      } catch (e) {
        console.error("Error creating circle:", e);
      }
    } else {
      console.log("No invalid POIs found");
      // Default view if no invalid POIs
      mapInstance.setCenter({ lat: 20.7214, lng: -103.3905 });
      mapInstance.setZoom(12);
    }
    
  }, [mapInstance, poiData]);

  return (
    <MapContainer ref={mapContainerRef}>
      {isLoading && (
        <StatusMessage>
          <div>Loading map...</div>
        </StatusMessage>
      )}
      {error && (
        <StatusMessage style={{ backgroundColor: 'rgba(255, 200, 200, 0.9)' }}>
          {error}
        </StatusMessage>
      )}
      
      {!poiData && !isLoading && !error && (
        <StatusMessage>
          <div>No POI data to display</div>
          <div style={{ fontSize: '12px', marginTop: '10px', fontWeight: 'normal' }}>
            Upload files and click "Analyze POIs" to see results
          </div>
        </StatusMessage>
      )}
    </MapContainer>
  );
};

export default HEREMapComponent;