/// <reference types="node" />
import { ROUND_TIME, PHASE_TWO_TIME } from '../utils/gameConstants';

type TimeCallback = (time: number) => void;

export class TimeManager {
  private timeLeft: number;
  private totalTimeLeft: number;
  private roundInitialTime: number;
  private countingDown: boolean;
  private paused: boolean;
  private gameOver: boolean;
  private isPhaseTwo: boolean;
  private countdownInterval: NodeJS.Timeout | null;
  private onGameOverCallbacks: (() => void)[];
  private onCriticalTimeCallbacks: (() => void)[];
  private onTimeUpdateCallbacks: TimeCallback[];

  constructor(initialTime: number = ROUND_TIME) {
    this.timeLeft = Number(initialTime.toFixed(1));
    this.totalTimeLeft = Number(initialTime.toFixed(1));
    this.roundInitialTime = Number(initialTime.toFixed(1));
    this.countingDown = false;
    this.paused = false;
    this.gameOver = false;
    this.isPhaseTwo = false;
    this.countdownInterval = null;
    this.onGameOverCallbacks = [];
    this.onCriticalTimeCallbacks = [];
    this.onTimeUpdateCallbacks = [];
  }

  private roundToOneDecimal(value: number): number {
    return Number(value.toFixed(1));
  }

  public startCountdown(): void {
    if (this.gameOver || this.countingDown) return;

    this.countingDown = true;
    this.countdownInterval = setInterval(() => {
      if (this.paused) return;

      this.timeLeft = this.roundToOneDecimal(Math.max(0, this.timeLeft - 0.1));
      this.totalTimeLeft = this.roundToOneDecimal(Math.max(0, this.totalTimeLeft - 0.1));

      // Notifica sobre atualização de tempo
      this.onTimeUpdateCallbacks.forEach(callback => callback(this.timeLeft));

      // Verifica tempo crítico (3 segundos ou menos)
      if (this.timeLeft <= 3 && this.timeLeft > 0) {
        this.onCriticalTimeCallbacks.forEach(callback => callback());
      }

      // Verifica game over
      if (this.timeLeft <= 0) {
        this.timeLeft = 0; // Garante que o tempo seja exatamente zero
        this.setGameOver(true);
      }
    }, 100);
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }

  public destroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countingDown = false;
  }

  public startNextRound(score?: number): void {
    const timeBonus = score !== undefined ? this.calculateTimeBonus(score) : 0;
    this.timeLeft = this.roundToOneDecimal(
      (this.isPhaseTwo ? PHASE_TWO_TIME : ROUND_TIME) + timeBonus
    );
    this.roundInitialTime = this.timeLeft;
  }

  public calculateTimeBonus(score: number): number {
    if (score < 500) return 0;
    const normalizedScore = Math.min(1, (score - 500) / 500);
    return this.roundToOneDecimal(normalizedScore * 2); // Máximo de 2 segundos de bônus
  }

  public addTimeBonus(seconds: number): void {
    if (seconds <= 0) return;
    const bonus = this.roundToOneDecimal(seconds);
    this.timeLeft = this.roundToOneDecimal(Math.max(0, this.timeLeft + bonus));
    this.totalTimeLeft = this.roundToOneDecimal(Math.max(0, this.totalTimeLeft + bonus));
  }

  public setPhaseTwo(): void {
    this.isPhaseTwo = true;
    this.roundInitialTime = PHASE_TWO_TIME;
  }

  public setGameOver(value: boolean): void {
    this.gameOver = value;
    if (value) {
      this.destroy();
      this.onGameOverCallbacks.forEach(callback => callback());
    }
  }

  public formatTime(time: number): string {
    return this.roundToOneDecimal(time).toFixed(1);
  }

  // Getters
  public getTimeLeft(): number {
    return this.roundToOneDecimal(this.timeLeft);
  }

  public getTotalTimeLeft(): number {
    return this.roundToOneDecimal(this.totalTimeLeft);
  }

  public getRoundInitialTime(): number {
    return this.roundToOneDecimal(this.roundInitialTime);
  }

  public isCountingDown(): boolean {
    return this.countingDown;
  }

  public isPaused(): boolean {
    return this.paused;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  // Event Listeners
  public onGameOver(callback: () => void): void {
    this.onGameOverCallbacks.push(callback);
  }

  public onCriticalTime(callback: () => void): void {
    this.onCriticalTimeCallbacks.push(callback);
  }

  public onTimeUpdate(callback: TimeCallback): void {
    this.onTimeUpdateCallbacks.push(callback);
  }
} 