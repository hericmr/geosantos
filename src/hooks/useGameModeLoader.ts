/**
 * Hook para testar o sistema de carregamento dinâmico de módulos
 * 
 * Este hook permite alternar entre versões antigas e refatoradas
 * dos módulos durante a refatoração, facilitando testes e validação.
 */

import { useState, useEffect, useCallback } from 'react';
import { GameModeFactory } from '../factories/GameModeFactory';
import { getModuleStatus, toggleAllModules, toggleModuleVersion } from '../config/gameModeConfig';

export const useGameModeLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleStatus, setModuleStatus] = useState(getModuleStatus());

  // Atualizar status dos módulos
  const updateModuleStatus = useCallback(() => {
    setModuleStatus(getModuleStatus());
  }, []);

  // Alternar todas as versões de uma vez
  const toggleAllVersions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Limpar cache antes de alternar
      GameModeFactory.clearCache();
      
      // Alternar versões
      toggleAllModules();
      
      // Atualizar status
      updateModuleStatus();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('[useGameModeLoader] Erro ao alternar versões:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updateModuleStatus]);

  // Alternar versão de um módulo específico
  const toggleModule = useCallback(async (modulePath: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Limpar cache antes de alternar
      GameModeFactory.clearCache();
      
      // Alternar versão do módulo
      toggleModuleVersion(modulePath);
      
      // Atualizar status
      updateModuleStatus();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('[useGameModeLoader] Erro ao alternar módulo:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updateModuleStatus]);

  // Testar carregamento de um modo específico
  const testModeLoading = useCallback(async (mode: 'neighborhoods' | 'famous_places') => {
    try {
      setIsLoading(true);
      setError(null);
      
      
      // Testar criação do modo
      const gameMode = await GameModeFactory.createMode(mode);
      
      // Testar criação do hook
      const gameHook = await GameModeFactory.createHook(mode);
      
      // Testar carregamento de utilitários
      const validationUtils = await GameModeFactory.loadValidationUtils(mode);
      
      const scoringUtils = await GameModeFactory.loadScoringUtils(mode);
      
      
      return {
        mode: gameMode,
        hook: gameHook,
        validation: validationUtils,
        scoring: scoringUtils
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error(`[useGameModeLoader] Erro ao testar modo ${mode}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Testar carregamento do hook principal
  const testGameModeHook = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      
      const gameModeHook = await GameModeFactory.createGameModeHook();
      
      return gameModeHook;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('[useGameModeLoader] Erro ao testar hook principal:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Limpar cache
  const clearCache = useCallback(() => {
    try {
      GameModeFactory.clearCache();
      
      // Obter status do cache
      const cacheStatus = GameModeFactory.getCacheStatus();
    } catch (err) {
      console.error('[useGameModeLoader] Erro ao limpar cache:', err);
    }
  }, []);

  // Obter status do cache
  const getCacheStatus = useCallback(() => {
    return GameModeFactory.getCacheStatus();
  }, []);

  // Atualizar status periodicamente
  useEffect(() => {
    const interval = setInterval(updateModuleStatus, 1000);
    return () => clearInterval(interval);
  }, [updateModuleStatus]);

  return {
    // Estado
    isLoading,
    error,
    moduleStatus,
    
    // Ações
    toggleAllVersions,
    toggleModule,
    testModeLoading,
    testGameModeHook,
    clearCache,
    getCacheStatus,
    
    // Utilitários
    updateModuleStatus
  };
}; 