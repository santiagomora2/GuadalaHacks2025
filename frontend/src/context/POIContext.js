// frontend/src/context/POIContext.js
import React, { createContext, useState } from 'react';

// Create the POI context
export const POIContext = createContext();

// POI context provider component
export const POIProvider = ({ children }) => {
  const [poiData, setPOIData] = useState(null);

  // Función para actualizar los datos de POI
  const updatePOIData = (data) => {
    console.log('Updating POI data:', data);
    // Asegurarnos de que los datos sean un objeto
    const processedData = typeof data === 'string' ? JSON.parse(data) : data;
    setPOIData(processedData);
  };

  return (
    <POIContext.Provider value={{ poiData, setPOIData: updatePOIData }}>
      {children}
    </POIContext.Provider>
  );
};