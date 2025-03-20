import { useEffect } from 'react';
import * as L from 'leaflet';

interface DistanceCircleProps {
  map: L.Map;
  distanceCircle: {
    center: L.LatLng | {lat: number, lng: number};
    radius: number;
  } | null;
  onAnimationComplete?: () => void;
}

export const DistanceCircle: React.FC<DistanceCircleProps> = ({
  map,
  distanceCircle,
  onAnimationComplete
}) => {
  useEffect(() => {
    if (map && distanceCircle) {
      // Limpa círculos anteriores
      map.eachLayer((layer: L.Layer) => {
        if (layer instanceof L.Circle) {
          map.removeLayer(layer);
        }
      });

      // Converte o centro para L.LatLng se necessário
      const circleCenter = distanceCircle.center instanceof L.LatLng 
        ? distanceCircle.center 
        : new L.LatLng(distanceCircle.center.lat, distanceCircle.center.lng);
      
      // Desenha o novo círculo
      const circle = L.circle(circleCenter, {
        radius: 0, // Começa com raio 0
        color: '#ff6b6b', // Vermelho mais suave
        fillColor: '#ff6b6b',
        fillOpacity: 0.05, // Opacidade reduzida
        weight: 1.5, // Borda mais fina
        className: 'distance-circle'
      }).addTo(map);

      // Espera a animação da bandeira terminar (0.3s) antes de começar a animação do círculo
      setTimeout(() => {
        // Animação do círculo
        const startTime = Date.now();
        const duration = 500; // 0.5 segundos
        const targetRadius = distanceCircle.radius;

        const animate = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Função de easing para suavizar a animação
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentRadius = targetRadius * easeOutCubic;
          
          circle.setRadius(currentRadius);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Remove o círculo após a animação
            setTimeout(() => {
              if (map) {
                map.removeLayer(circle);
                onAnimationComplete?.();
              }
            }, 500); // Espera 0.5 segundos antes de remover
          }
        };
        
        animate();
      }, 300); // Espera 0.3 segundos (duração da animação da bandeira)
    }
  }, [map, distanceCircle, onAnimationComplete]);

  return null;
};