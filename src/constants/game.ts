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