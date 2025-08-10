import { useEffect, useRef } from 'react';
import * as L from 'leaflet';

interface DistanceCircleProps {
  map: L.Map;
  distanceCircle: {
    center: L.LatLng | { lat: number; lng: number };
    radius: number;
  } | null;
  onAnimationComplete?: () => void;
}

export const DistanceCircle: React.FC<DistanceCircleProps> = ({
  map,
  distanceCircle,
  onAnimationComplete
}) => {
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!map || !distanceCircle) return;

    // Remove círculo anterior se houver
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    const center =
      distanceCircle.center instanceof L.LatLng
        ? distanceCircle.center
        : new L.LatLng(distanceCircle.center.lat, distanceCircle.center.lng);

    // Cria o círculo com raio direto
    const circle = L.circle(center, {
      radius: distanceCircle.radius,
      color: 'var(--accent-red)',
      fillColor: 'var(--accent-red)',
      fillOpacity: 0.15,
      weight: 2,
      className: 'distance-circle'
    }).addTo(map);

    circleRef.current = circle;

    // Aguarda um pequeno tempo e remove
    setTimeout(() => {
      map.removeLayer(circle);
      onAnimationComplete?.();
    }, 1200); // Tempo sincronizado: aparece quando sprite termina (727ms) + permanece visível por mais tempo

  }, [map, distanceCircle, onAnimationComplete]);

  return null;
};
