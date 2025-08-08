import { useEffect } from 'react';
import { getImageUrl } from '../utils/assetUtils';

/**
 * Hook para aplicar o cursor personalizado do jogo
 * Usa a função utilitária getImageUrl para garantir compatibilidade
 */
export const useCursorStyle = () => {
  useEffect(() => {
    const cursorUrl = getImageUrl('80.png');
    
    // Cria uma versão maior do cursor usando canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      if (ctx) {
        // Define o tamanho do canvas como 1.5x o tamanho original
        const scale = 1.5;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Desenha a imagem escalada
        ctx.imageSmoothingEnabled = false; // Mantém a qualidade pixel art
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converte para data URL
        const scaledCursorUrl = canvas.toDataURL();
        
        // Aplica o cursor personalizado ao container do mapa
        const style = document.createElement('style');
        style.setAttribute('data-cursor-style', 'true');
        style.textContent = `
          .leaflet-container,
          .leaflet-container *,
          .leaflet-interactive,
          .leaflet-interactive * {
            cursor: url("${scaledCursorUrl}") ${img.width * scale / 2} ${img.height * scale / 2}, crosshair !important;
            touch-action: none !important;
          }
        `;
        
        document.head.appendChild(style);
        
        // Limpa o canvas
        canvas.remove();
      }
    };
    
    img.src = cursorUrl;
    
    return () => {
      // Remove o estilo quando o componente é desmontado
      const existingStyle = document.querySelector('style[data-cursor-style]');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
}; 