/**
 * Utilitários para otimização de performance do jogo
 */

// Debounce function para limitar frequência de execução
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function para limitar execução por tempo
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Gerenciador de timers para evitar vazamentos de memória
export class TimerManager {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  setTimeout(id: string, callback: () => void, delay: number): void {
    this.clearTimeout(id);
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(id);
    }, delay);
    this.timers.set(id, timer);
  }

  setInterval(id: string, callback: () => void, delay: number): void {
    this.clearInterval(id);
    const interval = setInterval(callback, delay);
    this.intervals.set(id, interval);
  }

  clearTimeout(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  clearInterval(id: string): void {
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
  }

  clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    this.timers.clear();
    this.intervals.clear();
  }

  getActiveTimers(): string[] {
    return Array.from(this.timers.keys());
  }

  getActiveIntervals(): string[] {
    return Array.from(this.intervals.keys());
  }
}

// Singleton para gerenciar timers globalmente
export const globalTimerManager = new TimerManager();

// Função para agendar tarefas em momentos de baixa atividade
export const scheduleIdleTask = (task: () => void): void => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(task);
  } else {
    // Fallback para navegadores que não suportam requestIdleCallback
    setTimeout(task, 0);
  }
};

// Função para medir performance de funções
export const measurePerformance = <T extends (...args: any[]) => any>(
  func: T,
  name: string
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    const result = func(...args);
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

// Função para otimizar re-renders do React
export const memoizeFunction = <T extends (...args: any[]) => any>(
  func: T,
  getKey: (...args: Parameters<T>) => string
): ((...args: Parameters<T>) => ReturnType<T>) => {
  const cache = new Map<string, ReturnType<T>>();
  
  return (...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limpar cache se ficar muito grande
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  };
}; 