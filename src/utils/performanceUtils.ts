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