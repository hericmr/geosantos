import React, { useEffect } from 'react';
import { FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import { FASE_1_BAIRROS } from '../../utils/gameConstants';

interface NeighborhoodManagerProps {
  geoJsonData: FeatureCollection | null;
  geoJsonRef: React.RefObject<L.GeoJSON>;
  isPhaseTwo: boolean;
  updateGameState: (state: any) => void;
}

export const NeighborhoodManager: React.FC<NeighborhoodManagerProps> = ({
  geoJsonData,
  geoJsonRef,
  isPhaseTwo,
  updateGameState
}) => {
  useEffect(() => {
    if (geoJsonData) {
      const features = geoJsonData.features;
      let availableFeatures = features;

      // Se não estiver na fase 2, filtra apenas os bairros da fase 1
      if (!isPhaseTwo) {
        availableFeatures = features.filter(feature => 
          FASE_1_BAIRROS.includes(feature.properties?.NOME)
        );
      }

      const randomIndex = Math.floor(Math.random() * availableFeatures.length);
      const neighborhood = availableFeatures[randomIndex].properties?.NOME;
      updateGameState({ currentNeighborhood: neighborhood });
    }
  }, [geoJsonData, isPhaseTwo]);

  return null;
}; 