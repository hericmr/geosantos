import React from 'react';
import * as L from 'leaflet';
import { GameModeInterface, ClickValidation, ScoreCalculation, GameModeConfig, GameModeState } from '../../../types/common';

export abstract class BaseGameMode implements GameModeInterface {
  protected config: GameModeConfig;
  protected state: GameModeState;
  protected isActive: boolean = false;

  constructor(mode: string, config: Partial<GameModeConfig> = {}) {
    this.config = {
      roundTime: 10,
      maxRounds: 10,
      autoAdvance: true,
      showDistanceCircle: true,
      showArrow: true,
      soundEffects: true,
      ...config
    };

    this.state = {
      currentRound: 1,
      totalRounds: this.config.maxRounds,
      roundTimeLeft: this.config.roundTime,
      isActive: false,
      score: 0,
      feedback: null
    };
  }

  // Propriedades de leitura
  get mode(): string {
    return this.constructor.name;
  }

  get currentState(): GameModeState {
    return { ...this.state };
  }

  get currentConfig(): GameModeConfig {
    return { ...this.config };
  }

  // Métodos abstratos que devem ser implementados pelas classes filhas
  abstract validateClick(latlng: L.LatLng): ClickValidation;
  abstract calculateScore(distance: number, timeLeft: number): ScoreCalculation;
  abstract handleFeedback(validation: ClickValidation): void;
  abstract advanceRound(): void;

  // Métodos comuns que podem ser sobrescritos
  startGame(): void {
    this.isActive = true;
    this.state.isActive = true;
    this.state.currentRound = 1;
    this.state.score = 0;
    this.state.feedback = null;
    this.onGameStart();
  }

  pauseGame(): void {
    this.isActive = false;
    this.state.isActive = false;
    this.onGamePause();
  }

  resumeGame(): void {
    this.isActive = true;
    this.state.isActive = true;
    this.onGameResume();
  }

  endGame(): void {
    this.isActive = false;
    this.state.isActive = false;
    this.onGameEnd();
  }

  updateTimer(timeLeft: number): void {
    this.state.roundTimeLeft = timeLeft;
    this.onTimerUpdate(timeLeft);
  }

  addScore(points: number): void {
    this.state.score += points;
    this.onScoreUpdate(this.state.score);
  }

  setFeedback(feedback: any): void {
    this.state.feedback = feedback;
    this.onFeedbackUpdate(feedback);
  }

  // Métodos de ciclo de vida que podem ser sobrescritos
  protected onGameStart(): void {
    // Hook para subclasses
  }

  protected onGamePause(): void {
    // Hook para subclasses
  }

  protected onGameResume(): void {
    // Hook para subclasses
  }

  protected onGameEnd(): void {
    // Hook para subclasses
  }

  protected onTimerUpdate(timeLeft: number): void {
    // Hook para subclasses
  }

  protected onScoreUpdate(score: number): void {
    // Hook para subclasses
  }

  protected onFeedbackUpdate(feedback: any): void {
    // Hook para subclasses
  }

  // Métodos utilitários comuns
  protected calculateDistance(point1: L.LatLng, point2: L.LatLng): number {
    return point1.distanceTo(point2);
  }

  protected formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  protected formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Limpeza de recursos
  cleanup(): void {
    this.isActive = false;
    this.state.isActive = false;
    this.onCleanup();
  }

  protected onCleanup(): void {
    // Hook para subclasses
  }

  // Validação de configuração
  protected validateConfig(): boolean {
    if (this.config.roundTime <= 0) {
      console.error('Round time must be greater than 0');
      return false;
    }
    if (this.config.maxRounds <= 0) {
      console.error('Max rounds must be greater than 0');
      return false;
    }
    return true;
  }

  // Métodos para estatísticas
  getGameStats() {
    return {
      mode: this.mode,
      score: this.state.score,
      currentRound: this.state.currentRound,
      totalRounds: this.state.totalRounds,
      isActive: this.state.isActive
    };
  }

  // Métodos para persistência
  saveGameState(): any {
    return {
      config: this.config,
      state: this.state,
      timestamp: Date.now()
    };
  }

  loadGameState(savedState: any): boolean {
    try {
      if (savedState.config && savedState.state) {
        this.config = { ...this.config, ...savedState.config };
        this.state = { ...this.state, ...savedState.state };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading game state:', error);
      return false;
    }
  }
} 