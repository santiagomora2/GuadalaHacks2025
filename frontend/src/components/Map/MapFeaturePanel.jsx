// frontend/src/components/Map/MapFeaturePanel.jsx
import React from 'react';
import styled from 'styled-components';

// Contenedor principal
const FeaturePanelContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  font-size: 14px;
`;

// Título de característica
const FeatureTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 12px;
  color: #4A56A6;
  font-size: 16px;
`;

// Lista de características
const FeatureList = styled.ul`
  padding-left: 20px;
  margin: 0;
`;

// Elemento de la lista
const FeatureItem = styled.li`
  margin-bottom: 8px;
  line-height: 1.5;
`;

// Componente de chip para destacar datos
const Chip = styled.span`
  display: inline-block;
  padding: 3px 8px;
  background-color: ${props => props.color || '#00AFAA'};
  color: white;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 5px;
`;

/**
 * Componente que muestra información específica según el tipo de mapa seleccionado
 */
const MapFeaturePanel = ({ type }) => {
  // Contenido personalizado según el tipo de mapa
  const getContent = () => {
    switch(type) {
      case 'satellite':
        return (
          <>
            <FeatureTitle>Vista Satelital</FeatureTitle>
            <FeatureList>
              <FeatureItem>
                Imágenes de satélite de alta resolución
              </FeatureItem>
              <FeatureItem>
                Visualización detallada de áreas urbanas y rurales
              </FeatureItem>
              <FeatureItem>
                Ideal para análisis de terreno y urbanismo
              </FeatureItem>
              <FeatureItem>
                Actualizado regularmente <Chip>2023</Chip>
              </FeatureItem>
            </FeatureList>
          </>
        );
      
      case 'terrain':
        return (
          <>
            <FeatureTitle>Vista de Terreno</FeatureTitle>
            <FeatureList>
              <FeatureItem>
                Visualización de relieve y topografía
              </FeatureItem>
              <FeatureItem>
                Detalle de elevaciones, montañas y valles
              </FeatureItem>
              <FeatureItem>
                Perfecto para senderismo y actividades al aire libre
              </FeatureItem>
              <FeatureItem>
                Datos precisos de elevación <Chip color="#4A56A6">HERE Maps</Chip>
              </FeatureItem>
            </FeatureList>
          </>
        );
      
      case 'traffic':
        return (
          <>
            <FeatureTitle>Información de Tráfico</FeatureTitle>
            <FeatureList>
              <FeatureItem>
                Datos de tráfico en tiempo real <Chip color="#FF6B6B">En vivo</Chip>
              </FeatureItem>
              <FeatureItem>
                Congestiones, accidentes y obras viales
              </FeatureItem>
              <FeatureItem>
                Patrones históricos de tráfico y horas pico
              </FeatureItem>
              <FeatureItem>
                Actualizado cada 5 minutos
              </FeatureItem>
            </FeatureList>
          </>
        );
      
      default: // standard
        return (
          <>
            <FeatureTitle>Vista Estándar</FeatureTitle>
            <FeatureList>
              <FeatureItem>
                Mapa base vectorial optimizado
              </FeatureItem>
              <FeatureItem>
                Calles, carreteras y puntos de interés
              </FeatureItem>
              <FeatureItem>
                Nombres de calles y ubicaciones importantes
              </FeatureItem>
              <FeatureItem>
                Diseño claro y legible <Chip>HERE Maps</Chip>
              </FeatureItem>
            </FeatureList>
          </>
        );
    }
  };

  return (
    <FeaturePanelContainer>
      {getContent()}
    </FeaturePanelContainer>
  );
};

export default MapFeaturePanel;