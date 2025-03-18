import React from 'react';
import { GeoJSON } from 'react-leaflet';
import * as L from 'leaflet';
import { GeoJSONLayerProps } from '../../types/game';
import { getNeighborhoodStyle } from '../../utils/gameUtils';

export const GeoJSONLayer: React.FC<GeoJSONLayerProps> = ({
  geoJsonData,
  revealedNeighborhoods,
  currentNeighborhood,
  onMapClick,
  geoJsonRef
}) => {
  return (
    <GeoJSON
      data={geoJsonData}
      style={(feature) => getNeighborhoodStyle(feature, revealedNeighborhoods, currentNeighborhood)}
      eventHandlers={{
        click: (e: L.LeafletEvent) => {
          L.DomEvent.stopPropagation(e);
          onMapClick((e as L.LeafletMouseEvent).latlng);
        },
        mouseover: (e: L.LeafletEvent) => {
          const layer = e.target as L.Path;
          const feature = (layer as any).feature;
          if (feature && revealedNeighborhoods.has(feature.properties?.NOME)) {
            layer.setStyle({
              ...getNeighborhoodStyle(feature, revealedNeighborhoods, currentNeighborhood),
              fillOpacity: 0.7
            });
          }
        },
        mouseout: (e: L.LeafletEvent) => {
          const layer = e.target as L.Path;
          const feature = (layer as any).feature;
          if (feature) {
            layer.setStyle(getNeighborhoodStyle(feature, revealedNeighborhoods, currentNeighborhood));
          }
        }
      }}
      ref={geoJsonRef}
    />
  );
}; 