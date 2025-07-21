import React, { useEffect } from 'react';
import { FeatureCollection } from 'geojson';
import * as L from 'leaflet';
import { FASE_1_BAIRROS } from '../../utils/gameConstants';

interface NeighborhoodManagerProps {
  geoJsonData: FeatureCollection | null;
  geoJsonRef: React.RefObject<L.GeoJSON>;
  updateGameState: (state: any) => void;
}

export const NeighborhoodManager: React.FC<NeighborhoodManagerProps> = ({
  geoJsonData,
  geoJsonRef,
  updateGameState
}) => {
  useEffect(() => {
    if (geoJsonData) {
      const features = geoJsonData.features;
      const availableFeatures = features;
      const randomIndex = Math.floor(Math.random() * availableFeatures.length);
      const neighborhood = availableFeatures[randomIndex].properties?.NOME;
      updateGameState({ currentNeighborhood: neighborhood });
    }
  }, [geoJsonData]);

  return null;
}; 