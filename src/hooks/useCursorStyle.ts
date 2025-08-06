import { useEffect } from 'react';
import { getImageUrl } from '../utils/assetUtils';

/**
 * Hook para aplicar o cursor personalizado do jogo
 * Usa a função utilitária getImageUrl para garantir compatibilidade
 */
export const useCursorStyle = () => {
  useEffect(() => {
    const cursorUrl = getImageUrl('80.png');
    
    // Aplica o cursor personalizado ao container do mapa
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-container,
      .leaflet-container *,
      .leaflet-interactive,
      .leaflet-interactive * {
        cursor: url("${cursorUrl}") 9 9, crosshair !important;
        touch-action: none !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
}; 