// frontend/src/components/Map/HEREMapComponent.jsx
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { setupHereMap } from '../../services/HereMapService';

// Map container with improved styling
const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

// Status message (loading, error)
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

// Map legend container
const MapLegend = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 15px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 5;
  font-size: 14px;
`;

// Legend title
const LegendTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
`;

// Legend item
const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

// Legend color indicator
const LegendColor = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => props.color};
`;

const HEREMapComponent = () => {
  // Reference for the map container
  const mapContainerRef = useRef(null);
  
  // States for map management
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize the map when component mounts
  useEffect(() => {
    // Check if a map instance already exists
    if (mapInstance) return;
    
    const initMap = async () => {
      setIsLoading(true);
      try {
        if (mapContainerRef.current) {
          const map = await setupHereMap(mapContainerRef.current);
          if (map) {
            setMapInstance(map);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Could not load the map. Please check your connection and API key.');
        setIsLoading(false);
      }
    };

    initMap();
    
    // Cleanup function
    return () => {
      if (mapInstance) {
        try {
          window.removeEventListener('resize', mapInstance._resizeListener);
          mapInstance.dispose();
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional here

  return (
    <>
      <MapContainer ref={mapContainerRef}>
        {isLoading && (
          <StatusMessage>
            <div>Loading map...</div>
            <div style={{ fontSize: '12px', marginTop: '10px', fontWeight: 'normal' }}>
              Connecting to HERE Maps API
            </div>
          </StatusMessage>
        )}
        {error && (
          <StatusMessage style={{ backgroundColor: 'rgba(255, 200, 200, 0.9)' }}>
            {error}
          </StatusMessage>
        )}
        
        <MapLegend>
          <LegendTitle>POI Validation</LegendTitle>
          <LegendItem>
            <LegendColor color="#4CAF50" />
            <span>Valid POI</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#F44336" />
            <span>Invalid POI (on median)</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#FFC107" />
            <span>Warning (near median)</span>
          </LegendItem>
        </MapLegend>
      </MapContainer>
    </>
  );
};

export default HEREMapComponent;