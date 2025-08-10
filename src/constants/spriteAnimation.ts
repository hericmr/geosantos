/**
 * Configurações ideais para a animação de sprite no jogo
 * Baseado nos testes e otimizações realizadas
 */

export interface SpriteAnimationConfig {
  size: number;
  anchorX: number;
  anchorY: number;
  fps: number;
  frameDelay: number;
  totalDuration: number;
}

export const IDEAL_SPRITE_CONFIG = {
  size: 122,
  anchorX: 25,
  anchorY: 104,
  fps: 25,
  frameDelay: 1000 / 25 // 40ms por frame
};

// ⚙️ CONFIGURAÇÕES DE DURAÇÃO DO ÚLTIMO FRAME
export const LAST_FRAME_DURATIONS = {
  markerclick: 4000,        // 2 segundos para animação de clique (mesmo tempo da bandeira correta)
  bandeira_correta: 4000,   // 2 segundos para bandeira correta (mesmo tempo da bandeira2)
  default: 4000             // Padrão para outras animações
} as const;

// ⚙️ CONFIGURAÇÕES DE ANCHOR X POR TIPO DE ANIMAÇÃO
export const ANCHOR_X_CONFIG = {
  markerclick: 25,          // 25px para animação de clique
  bandeira_correta: 85,     // 85px para bandeira correta
  default: 25               // Padrão para outras animações
} as const;

export const SPRITE_ANIMATION_CONFIG = {
  totalFrames: 16,
  defaultFrame: 1,
  ...IDEAL_SPRITE_CONFIG
};

// Configurações para diferentes contextos
export const SPRITE_CONTEXTS = {
  game: IDEAL_SPRITE_CONFIG,
  test: {
    ...IDEAL_SPRITE_CONFIG,
    size: 70,          // Tamanho menor para testes
    fps: 10            // FPS menor para visualização
  },
  debug: {
    ...IDEAL_SPRITE_CONFIG,
    size: 100,         // Tamanho médio para debug
    fps: 15            // FPS médio para debug
  }
}; 