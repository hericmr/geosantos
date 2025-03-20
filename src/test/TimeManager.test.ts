import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimeManager } from '../game/TimeManager';
import { ROUND_TIME, PHASE_TWO_TIME } from '../utils/gameConstants';

describe('TimeManager', () => {
  let timeManager: TimeManager;

  beforeEach(() => {
    vi.useFakeTimers();
    timeManager = new TimeManager();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Inicialização', () => {
    it('deve inicializar com os valores padrão', () => {
      expect(timeManager.getTimeLeft()).toBe(ROUND_TIME);
      expect(timeManager.getTotalTimeLeft()).toBe(ROUND_TIME);
      expect(timeManager.getRoundInitialTime()).toBe(ROUND_TIME);
      expect(timeManager.isCountingDown()).toBe(false);
      expect(timeManager.isPaused()).toBe(false);
      expect(timeManager.isGameOver()).toBe(false);
    });

    it('deve permitir configurar tempo inicial personalizado', () => {
      const customTime = 15;
      const customManager = new TimeManager(customTime);
      expect(customManager.getTimeLeft()).toBe(customTime);
      expect(customManager.getTotalTimeLeft()).toBe(customTime);
      expect(customManager.getRoundInitialTime()).toBe(customTime);
    });
  });

  describe('Controle de Tempo', () => {
    it('deve iniciar a contagem regressiva corretamente', () => {
      timeManager.startCountdown();
      expect(timeManager.isCountingDown()).toBe(true);
      
      // Avança 1 segundo
      vi.advanceTimersByTime(1000);
      expect(timeManager.getTimeLeft()).toBe(9);
      expect(timeManager.getTotalTimeLeft()).toBe(9);
    });

    it('deve pausar e retomar a contagem corretamente', () => {
      timeManager.startCountdown();
      vi.advanceTimersByTime(1000);
      
      timeManager.pause();
      expect(timeManager.isPaused()).toBe(true);
      const timePaused = timeManager.getTimeLeft();
      
      // Avança mais tempo durante a pausa
      vi.advanceTimersByTime(1000);
      expect(timeManager.getTimeLeft()).toBe(timePaused);
      
      timeManager.resume();
      expect(timeManager.isPaused()).toBe(false);
      vi.advanceTimersByTime(1000);
      expect(timeManager.getTimeLeft()).toBe(timePaused - 1);
    });

    it('deve ativar game over quando o tempo acabar', () => {
      timeManager.startCountdown();
      vi.advanceTimersByTime(ROUND_TIME * 1000);
      expect(timeManager.isGameOver()).toBe(true);
      expect(timeManager.getTimeLeft()).toBe(0);
    });
  });

  describe('Bônus de Tempo', () => {
    it('deve adicionar bônus de tempo corretamente', () => {
      const bonus = 2;
      const initialTime = timeManager.getTimeLeft();
      timeManager.addTimeBonus(bonus);
      expect(timeManager.getTimeLeft()).toBe(initialTime + bonus);
      expect(timeManager.getTotalTimeLeft()).toBe(initialTime + bonus);
    });

    it('deve calcular bônus baseado na pontuação', () => {
      const highScore = 1200;
      const bonus = timeManager.calculateTimeBonus(highScore);
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThanOrEqual(2); // Máximo de 2 segundos
    });

    it('não deve dar bônus para pontuação baixa', () => {
      const lowScore = 400;
      const bonus = timeManager.calculateTimeBonus(lowScore);
      expect(bonus).toBe(0);
    });
  });

  describe('Mudança de Fase', () => {
    it('deve ajustar o tempo para a fase 2', () => {
      timeManager.setPhaseTwo();
      timeManager.startNextRound();
      expect(timeManager.getRoundInitialTime()).toBe(PHASE_TWO_TIME);
      expect(timeManager.getTimeLeft()).toBe(PHASE_TWO_TIME);
    });

    it('deve manter o tempo total ao mudar de fase', () => {
      const totalBefore = timeManager.getTotalTimeLeft();
      timeManager.setPhaseTwo();
      timeManager.startNextRound();
      expect(timeManager.getTotalTimeLeft()).toBe(totalBefore);
    });
  });

  describe('Próxima Rodada', () => {
    it('deve resetar o tempo da rodada mantendo o tempo total', () => {
      timeManager.startCountdown();
      vi.advanceTimersByTime(2000); // Passa 2 segundos
      const totalBefore = timeManager.getTotalTimeLeft();
      
      timeManager.startNextRound();
      expect(timeManager.getTimeLeft()).toBe(ROUND_TIME);
      expect(timeManager.getTotalTimeLeft()).toBe(totalBefore);
    });

    it('deve adicionar bônus ao iniciar próxima rodada', () => {
      timeManager.startCountdown();
      vi.advanceTimersByTime(2000);
      const score = 1000;
      const bonus = timeManager.calculateTimeBonus(score);
      
      timeManager.startNextRound(score);
      expect(timeManager.getTimeLeft()).toBe(ROUND_TIME + bonus);
    });
  });

  describe('Eventos', () => {
    it('deve emitir evento quando o tempo acabar', () => {
      const onGameOver = vi.fn();
      timeManager.onGameOver(onGameOver);
      
      timeManager.startCountdown();
      vi.advanceTimersByTime(ROUND_TIME * 1000);
      
      expect(onGameOver).toHaveBeenCalled();
    });

    it('deve emitir evento quando o tempo estiver crítico', () => {
      const onCriticalTime = vi.fn();
      timeManager.onCriticalTime(onCriticalTime);
      
      timeManager.startCountdown();
      vi.advanceTimersByTime((ROUND_TIME - 3) * 1000); // Deixa 3 segundos
      
      expect(onCriticalTime).toHaveBeenCalled();
    });

    it('deve emitir evento a cada atualização de tempo', () => {
      const onTimeUpdate = vi.fn();
      timeManager.onTimeUpdate(onTimeUpdate);
      
      timeManager.startCountdown();
      vi.advanceTimersByTime(1000);
      
      expect(onTimeUpdate).toHaveBeenCalledWith(expect.any(Number));
    });
  });

  describe('Formatação de Tempo', () => {
    it('deve formatar o tempo corretamente', () => {
      expect(timeManager.formatTime(10)).toBe('10.0');
      expect(timeManager.formatTime(5.5)).toBe('5.5');
      expect(timeManager.formatTime(0)).toBe('0.0');
    });
  });

  describe('Validações', () => {
    it('não deve permitir tempo negativo', () => {
      timeManager.addTimeBonus(-5);
      expect(timeManager.getTimeLeft()).toBeGreaterThanOrEqual(0);
    });

    it('não deve contar tempo quando o jogo estiver terminado', () => {
      timeManager.setGameOver(true);
      timeManager.startCountdown();
      vi.advanceTimersByTime(1000);
      expect(timeManager.getTimeLeft()).toBe(ROUND_TIME);
    });

    it('deve limpar intervalos ao destruir', () => {
      timeManager.startCountdown();
      timeManager.destroy();
      vi.advanceTimersByTime(1000);
      expect(timeManager.getTimeLeft()).toBe(ROUND_TIME);
    });
  });
}); 