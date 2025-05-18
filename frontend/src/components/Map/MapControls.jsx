// frontend/src/components/Map/MapControls.jsx
import React from 'react';
import styled from 'styled-components';

// Estilo para el contenedor de controles
const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
`;

// Estilo para los botones de control
const ControlButton = styled.button`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f8f9fa;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    background-color: #e9ecef;
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Estilo para la información de zoom
const ZoomInfo = styled.span`
  padding: 8px 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: bold;
`;

/**
 * Componente para controlar el mapa
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onZoomIn - Función para aumentar el zoom
 * @param {Function} props.onZoomOut - Función para disminuir el zoom
 * @param {number} props.currentZoom - Nivel de zoom actual
 */
const MapControls = ({ onZoomIn, onZoomOut, currentZoom }) => {
  // Definir límites de zoom
  const MIN_ZOOM = 2;
  const MAX_ZOOM = 20;

  return (
    <ControlsContainer>
      <ControlButton 
        onClick={onZoomOut} 
        disabled={currentZoom <= MIN_ZOOM}
        title="Reducir zoom"
      >
        -
      </ControlButton>
      
      <ZoomInfo title="Nivel de zoom actual">
        Zoom: {currentZoom}
      </ZoomInfo>
      
      <ControlButton 
        onClick={onZoomIn} 
        disabled={currentZoom >= MAX_ZOOM}
        title="Aumentar zoom"
      >
        +
      </ControlButton>
    </ControlsContainer>
  );
};

export default MapControls;