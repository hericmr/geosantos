import { PhaserGameState } from '../../types/phaser';
import { GAME_CONSTANTS } from '../../constants/game';

export class GameStateManager {
    private state: PhaserGameState;
    private onGameOver: () => void;

    constructor(onGameOver: () => void) {
        this.state = {
            pontuacao: 0,
            tempoRestante: GAME_CONSTANTS.INITIAL_TIME,
            bairroAtual: null
        };
        this.onGameOver = onGameOver;
    }

    getState(): PhaserGameState {
        return { ...this.state };
    }

    updateTime(time: number) {
        this.state.tempoRestante = time;
        if (time <= 0) {
            this.onGameOver();
        }
    }

    updateScore(points: number) {
        this.state.pontuacao += points;
    }

    setCurrentDistrict(district: string) {
        this.state.bairroAtual = district;
    }

    getCurrentDistrict(): string | null {
        return this.state.bairroAtual;
    }

    calculatePoints(distance: number, timeMultiplier: number): number {
        // Base points for correct district
        let points = 1000;

        // Distance penalty (closer = more points)
        const distancePenalty = Math.min(distance / 100, 1);
        points *= (1 - distancePenalty);

        // Time bonus (faster = more points)
        const timeBonus = Math.max(0, timeMultiplier);
        points *= (1 + timeBonus * 0.1);

        return Math.floor(points);
    }
} 