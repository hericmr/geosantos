/**
 * Configuração para controle de versões dos módulos durante refatoração
 * 
 * Este arquivo permite alternar entre versões antigas e refatoradas
 * dos módulos de jogo, facilitando testes e rollback.
 */

export const GAME_MODE_CONFIG = {
  // Flag global para usar versões refatoradas
  useRefactoredModules: true,
  
  // Configurações específicas por modo
  neighborhood: {
    useRefactored: true,
    fallbackToOriginal: true,
    components: {
      mode: true,        // NeighborhoodMode
      hook: true,        // useNeighborhoodGame
      validation: true,  // validation
      scoring: true,     // scoring
      types: true        // neighborhood types
    }
  },
  
  famousPlaces: {
    useRefactored: true,
    fallbackToOriginal: true,
    components: {
      mode: true,        // FamousPlacesMode
      hook: true,        // useFamousPlacesGame
      validation: true,  // validation
      scoring: true,     // scoring
      types: true        // famousPlaces types
    }
  },
  
  // Configurações compartilhadas
  common: {
    useRefactored: true,
    fallbackToOriginal: true,
    components: {
      baseGameMode: true, // BaseGameMode
      types: true         // common types
    }
  },
  
  // Hook principal
  gameMode: {
    useRefactored: true,
    fallbackToOriginal: true
  }
};

/**
 * Função para verificar se um módulo específico deve usar versão refatorada
 */
export const shouldUseRefactored = (modulePath: string): boolean => {
  const config = GAME_MODE_CONFIG;
  
  // Verificar configuração global
  if (!config.useRefactoredModules) {
    return false;
  }
  
  // Verificar configurações específicas por módulo
  if (modulePath.includes('neighborhood')) {
    return config.neighborhood.useRefactored;
  }
  
  if (modulePath.includes('famousPlaces') || modulePath.includes('famous_places')) {
    return config.famousPlaces.useRefactored;
  }
  
  if (modulePath.includes('common') || modulePath.includes('BaseGameMode')) {
    return config.common.useRefactored;
  }
  
  if (modulePath.includes('useGameMode')) {
    return config.gameMode.useRefactored;
  }
  
  // Padrão: usar versão original
  return false;
};

/**
 * Função para obter o caminho correto de um módulo
 */
export const getModulePath = (originalPath: string): string => {
  if (shouldUseRefactored(originalPath)) {
    // Substituir extensão e adicionar sufixo -refactored
    const pathWithoutExt = originalPath.replace(/\.(ts|tsx)$/, '');
    const extension = originalPath.match(/\.(ts|tsx)$/)?.[1] || 'ts';
    return `${pathWithoutExt}-refactored.${extension}`;
  }
  
  return originalPath;
};

/**
 * Função para alternar entre versões de um módulo específico
 */
export const toggleModuleVersion = (modulePath: string): void => {
  if (modulePath.includes('neighborhood')) {
    GAME_MODE_CONFIG.neighborhood.useRefactored = !GAME_MODE_CONFIG.neighborhood.useRefactored;
  } else if (modulePath.includes('famousPlaces') || modulePath.includes('famous_places')) {
    GAME_MODE_CONFIG.famousPlaces.useRefactored = !GAME_MODE_CONFIG.famousPlaces.useRefactored;
  } else if (modulePath.includes('common') || modulePath.includes('BaseGameMode')) {
    GAME_MODE_CONFIG.common.useRefactored = !GAME_MODE_CONFIG.common.useRefactored;
  } else if (modulePath.includes('useGameMode')) {
    GAME_MODE_CONFIG.gameMode.useRefactored = !GAME_MODE_CONFIG.gameMode.useRefactored;
  }
  
  console.log(`[GameModeConfig] Alternado versão para ${modulePath}:`, shouldUseRefactored(modulePath));
};

/**
 * Função para alternar todas as versões de uma vez
 */
export const toggleAllModules = (): void => {
  GAME_MODE_CONFIG.useRefactoredModules = !GAME_MODE_CONFIG.useRefactoredModules;
  
  if (GAME_MODE_CONFIG.useRefactoredModules) {
    GAME_MODE_CONFIG.neighborhood.useRefactored = true;
    GAME_MODE_CONFIG.famousPlaces.useRefactored = true;
    GAME_MODE_CONFIG.common.useRefactored = true;
    GAME_MODE_CONFIG.gameMode.useRefactored = true;
  } else {
    GAME_MODE_CONFIG.neighborhood.useRefactored = false;
    GAME_MODE_CONFIG.famousPlaces.useRefactored = false;
    GAME_MODE_CONFIG.common.useRefactored = false;
    GAME_MODE_CONFIG.gameMode.useRefactored = false;
  }
  
  console.log(`[GameModeConfig] Todas as versões alternadas para:`, GAME_MODE_CONFIG.useRefactoredModules);
};

/**
 * Função para obter status atual de todos os módulos
 */
export const getModuleStatus = () => {
  return {
    global: GAME_MODE_CONFIG.useRefactoredModules,
    neighborhood: GAME_MODE_CONFIG.neighborhood.useRefactored,
    famousPlaces: GAME_MODE_CONFIG.famousPlaces.useRefactored,
    common: GAME_MODE_CONFIG.common.useRefactored,
    gameMode: GAME_MODE_CONFIG.gameMode.useRefactored
  };
};

/**
 * Função para validar se a configuração está consistente
 */
export const validateConfig = (): boolean => {
  const status = getModuleStatus();
  
  // Se global está true, todos os módulos devem estar true
  if (status.global) {
    return status.neighborhood && status.famousPlaces && status.common && status.gameMode;
  }
  
  // Se global está false, todos os módulos devem estar false
  return !status.neighborhood && !status.famousPlaces && !status.common && !status.gameMode;
};

// Log inicial da configuração
console.log('[GameModeConfig] Configuração carregada:', getModuleStatus()); 