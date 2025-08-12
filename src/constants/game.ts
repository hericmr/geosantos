export const GAME_CONSTANTS = {
    INITIAL_TIME: 15, // Tempo inicial em segundos
    TIME_UPDATE_INTERVAL: 20,
    TIME_UPDATE_AMOUNT: 0.02,
    WARNING_TIME: 5,
    CRITICAL_TIME: 3,
    PARTICLE_CONFIG: {
        speed: { min: 200, max: 400 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.6, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1000,
        quantity: 20,
        blendMode: 'ADD'
    },
    COLORS: {
        SUCCESS: 0x00ff00,
        ERROR: 0xff0000,
        BACKGROUND: 0x002200,
        BORDER: 0x000000,
        TEXT: 0xffffff
    },
    TEXT_STYLES: {
        TITLE: {
            fontSize: '64px',
            color: '#ffffff',
            fontFamily: 'Figtree'
        },
        SCORE: {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Figtree'
        },
        TIME: {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Figtree'
        },
        DISTRICT: {
            fontSize: '90px',
            color: '#ffffff',
            fontFamily: 'Figtree'
        }
    }
};

// ============================================================================
// CONSTANTES DE TIMING
// ============================================================================

/**
 * Duração fixa da barra de feedback (em milissegundos)
 * CORREÇÃO: Valor fixo de 2 segundos para consistência
 */
export const FEEDBACK_BAR_DURATION = 2000; // 2 segundos

/**
 * Intervalo de atualização da barra de feedback (em milissegundos)
 * CORREÇÃO: 100ms para animação suave
 */
export const FEEDBACK_BAR_UPDATE_INTERVAL = 100; // 100ms

/**
 * Incremento da barra de progresso por atualização
 * CORREÇÃO: 5% a cada 100ms = 100% em 2 segundos
 */
export const FEEDBACK_BAR_PROGRESS_INCREMENT = 5; // 5% 