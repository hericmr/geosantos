/**
 * Sistema de timers unificado para o jogo GeoSantos
 * Resolve problemas de timers sobrepostos e vazamentos de memória
 */

export class GameTimerManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isMobile: boolean;

  constructor() {
    this.isMobile = this.detectMobileDevice();
  }

  private detectMobileDevice(): boolean {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') {
      return false; // Não é mobile se não estamos no browser
    }
    
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768 ||
      'ontouchstart' in window
    );
  }

  /**
   * Agenda um timer único
   */
  scheduleTimer(id: string, delay: number, callback: () => void): void {
    this.clearTimer(id);
    
    // Otimizações para mobile
    const optimizedDelay = this.isMobile ? Math.min(delay, 2000) : delay;
    
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, optimizedDelay);
    
    this.timers.set(id, timer);
  }

  /**
   * Agenda um intervalo
   */
  scheduleInterval(id: string, interval: number, callback: () => void): void {
    console.log(`[GameTimerManager] 📅 Agendando intervalo: ${id} a cada ${interval}ms`);
    
    this.clearInterval(id);
    
    // Otimizações para mobile
    const optimizedInterval = this.isMobile ? Math.max(interval, 50) : interval;
    console.log(`[GameTimerManager] 📱 Intervalo otimizado: ${optimizedInterval}ms (mobile: ${this.isMobile})`);
    
    const intervalTimer = setInterval(callback, optimizedInterval);
    this.intervals.set(id, intervalTimer);
    
    console.log(`[GameTimerManager] ✅ Intervalo ${id} agendado com sucesso. Total ativos: ${this.intervals.size}`);
  }

  /**
   * Limpa um timer específico
   */
  clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  /**
   * Limpa um intervalo específico
   */
  clearInterval(id: string): void {
    const interval = this.intervals.get(id);
    if (interval) {
      console.log(`[GameTimerManager] 🧹 Limpando intervalo: ${id}`);
      clearInterval(interval);
      this.intervals.delete(id);
      console.log(`[GameTimerManager] ✅ Intervalo ${id} limpo. Total restantes: ${this.intervals.size}`);
    } else {
      console.log(`[GameTimerManager] ℹ️ Intervalo ${id} não encontrado para limpeza`);
    }
  }

  /**
   * Limpa todos os timers e intervalos
   */
  clearAll(): void {
    console.log(`[GameTimerManager] 🧹 Limpando todos os timers e intervalos (${this.timers.size} timers, ${this.intervals.size} intervalos)`);
    
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    this.timers.clear();
    this.intervals.clear();
    
    console.log(`[GameTimerManager] ✅ Todos os timers e intervalos limpos`);
  }

  /**
   * Verifica se um timer está ativo
   */
  hasTimer(id: string): boolean {
    return this.timers.has(id);
  }

  /**
   * Verifica se um intervalo está ativo
   */
  hasInterval(id: string): boolean {
    return this.intervals.has(id);
  }

  /**
   * Retorna o número de timers ativos
   */
  getActiveTimersCount(): number {
    return this.timers.size + this.intervals.size;
  }

  /**
   * Configurações otimizadas para mobile
   */
  getMobileOptimizedConfig() {
    return {
      spriteFrames: this.isMobile ? 8 : 16,
      frameDelay: this.isMobile ? 80 : 45,
      distanceCircleDelay: this.isMobile ? 200 : 400,
      feedbackDelay: this.isMobile ? 400 : 800,
      progressInterval: this.isMobile ? 50 : 100
    };
  }
} 