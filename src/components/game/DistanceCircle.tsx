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
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!map || !distanceCircle || animatingRef.current) return;

    animatingRef.current = true; // trava para não criar vários

    // Criar gradiente no SVG (uma vez só)
    const mapContainer = map.getPanes().overlayPane.querySelector('svg');
    if (mapContainer && !mapContainer.querySelector('#whiteGradient')) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <radialGradient id="whiteGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="white" stop-opacity="0" />
          <stop offset="80%" stop-color="white" stop-opacity="0" />
          <stop offset="99%" stop-color="white" stop-opacity="1" />
        </radialGradient>
      `;
      mapContainer.prepend(defs);
    }

    // Criar círculo com raio inicial zero
    const center =
      distanceCircle.center instanceof L.LatLng
        ? distanceCircle.center
        : new L.LatLng(distanceCircle.center.lat, distanceCircle.center.lng);

    const circle = L.circle(center, {
      radius: 0,
      color: 'white',
      fillColor: 'url(#whiteGradient)',
      fillOpacity: 1,
      weight: 2,
      className: 'distance-circle'
    }).addTo(map);

    circleRef.current = circle;

    // --- Animação suave do raio ---
    const duration = 800; // ms
    const start = performance.now();
    const targetRadius = distanceCircle.radius;

    // Easing suave (easeOutCubic)
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      circle.setRadius(targetRadius * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // mantém o círculo por 1 segundo antes de remover
        setTimeout(() => {
          map.removeLayer(circle);
          circleRef.current = null;
          animatingRef.current = false;
          onAnimationComplete?.();
        }, 1000); // 1000ms = 1 segundo de "paz"
      }
    };

    requestAnimationFrame(animate);

  }, [map, distanceCircle, onAnimationComplete]);

  return null;
};
