/**
 * Utilitário global para carregar assets do jogo
 * Usa o BASE_URL do Vite para garantir compatibilidade com diferentes ambientes
 */

/**
 * Obtém a URL completa para um asset na pasta public
 * @param path - Caminho relativo do asset (ex: "assets/images/80.png")
 * @returns URL completa do asset
 */
export const getAssetUrl = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || '';
  // Remove barra inicial se existir para evitar duplicação
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const finalUrl = `${baseUrl}${cleanPath}`;
  console.log('🌐 getAssetUrl:', { path, baseUrl, cleanPath, finalUrl });
  return finalUrl;
};

/**
 * Obtém a URL para uma imagem na pasta assets/images
 * @param filename - Nome do arquivo da imagem
 * @returns URL completa da imagem
 */
export const getImageUrl = (filename: string): string => {
  const url = getAssetUrl(`assets/images/${filename}`);
  console.log('🔗 getImageUrl (utils):', { filename, url });
  return url;
};

/**
 * Obtém a URL para um áudio na pasta assets/audio
 * @param filename - Nome do arquivo de áudio
 * @returns URL completa do áudio
 */
export const getAudioUrl = (filename: string): string => {
  return getAssetUrl(`assets/audio/${filename}`);
};

/**
 * Obtém a URL para um arquivo de dados na pasta assets/data
 * @param filename - Nome do arquivo de dados
 * @returns URL completa do arquivo de dados
 */
export const getDataUrl = (filename: string): string => {
  return getAssetUrl(`assets/data/${filename}`);
};

/**
 * Obtém a URL para um arquivo de fonte na pasta assets
 * @param filename - Nome do arquivo de fonte
 * @returns URL completa da fonte
 */
export const getFontUrl = (filename: string): string => {
  return getAssetUrl(`assets/${filename}`);
};

/**
 * Obtém a URL para um sprite na pasta assets/markerclick
 * @param filename - Nome do arquivo do sprite
 * @returns URL completa do sprite
 */
export const getSpriteUrl = (filename: string): string => {
  const url = getAssetUrl(`assets/markerclick/${filename}`);
  console.log('🎭 getSpriteUrl:', { filename, url, fullPath: `assets/markerclick/${filename}` });
  return url;
};

/**
 * Obtém a URL para um sprite na pasta assets/marker_bandeira_lugar_correto
 * @param filename - Nome do arquivo do sprite
 * @returns URL completa do sprite
 */
export const getBandeiraCorretaSpriteUrl = (filename: string): string => {
  const url = getAssetUrl(`assets/marker_bandeira_lugar_correto/${filename}`);
  console.log('🏁 getBandeiraCorretaSpriteUrl:', { filename, url, fullPath: `assets/marker_bandeira_lugar_correto/${filename}` });
  return url;
}; 