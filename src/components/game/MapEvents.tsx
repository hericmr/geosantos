import React from 'react';
import { useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { MapEventsProps } from '../../types/game';

export const MapEvents: React.FC<MapEventsProps> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}; 