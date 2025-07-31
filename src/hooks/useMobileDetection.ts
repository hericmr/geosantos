import { useState, useEffect } from 'react';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Verifica se é um dispositivo mobile baseado na largura da tela
      const isMobileDevice = window.innerWidth <= 768;
      
      // Verifica também o user agent para dispositivos móveis
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      setIsMobile(isMobileDevice || isMobileUserAgent);
    };

    // Verificação inicial
    checkMobile();

    // Listener para mudanças de tamanho da tela
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}; 