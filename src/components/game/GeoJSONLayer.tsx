import React, { useRef } from 'react';
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
  // Ref para armazenar os timers de cada camada
  const hoverTimeouts = useRef<Map<L.Layer, NodeJS.Timeout>>(new Map());

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

          // cancela qualquer timeout anterior para este layer
          if (hoverTimeouts.current.has(layer)) {
            clearTimeout(hoverTimeouts.current.get(layer));
            hoverTimeouts.current.delete(layer);
          }

          if (feature && revealedNeighborhoods.has(feature.properties?.NOME)) {
            // cria um timeout para aplicar o estilo ap�s 1 segundo
            const timeoutId = setTimeout(() => {
              layer.setStyle({
                ...getNeighborhoodStyle(feature, revealedNeighborhoods, currentNeighborhood),
                fillOpacity: 0.7
              });
              hoverTimeouts.current.delete(layer);
            }, 1000);

            hoverTimeouts.current.set(layer, timeoutId);
          }
        },
        mouseout: (e: L.LeafletEvent) => {
          const layer = e.target as L.Path;
          const feature = (layer as any).feature;

          // cancela o timeout se o mouse sair antes de 1 segundo
          if (hoverTimeouts.current.has(layer)) {
            clearTimeout(hoverTimeouts.current.get(layer));
            hoverTimeouts.current.delete(layer);
          }

          if (feature) {
            layer.setStyle(getNeighborhoodStyle(feature, revealedNeighborhoods, currentNeighborhood));
          }
        }
      }}
      ref={geoJsonRef}
    />
  );
};
