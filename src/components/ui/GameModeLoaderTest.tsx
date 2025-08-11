/**
 * Componente de teste para o sistema de carregamento dinâmico de módulos
 * 
 * Este componente permite testar e validar o sistema durante a refatoração,
 * facilitando a identificação de problemas e validação de funcionalidade.
 */

import React from 'react';
import { useGameModeLoader } from '../../hooks/useGameModeLoader';

export const GameModeLoaderTest: React.FC = () => {
  const {
    isLoading,
    error,
    moduleStatus,
    toggleAllVersions,
    toggleModule,
    testModeLoading,
    testGameModeHook,
    clearCache,
    getCacheStatus
  } = useGameModeLoader();

  const handleTestMode = async (mode: 'neighborhoods' | 'famous_places') => {
    try {
      console.log(`[GameModeLoaderTest] Testando modo ${mode}`);
      const result = await testModeLoading(mode);
      console.log(`[GameModeLoaderTest] Resultado do teste ${mode}:`, result);
      alert(`Modo ${mode} testado com sucesso!`);
    } catch (err) {
      console.error(`[GameModeLoaderTest] Erro no teste ${mode}:`, err);
      alert(`Erro ao testar modo ${mode}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleTestGameModeHook = async () => {
    try {
      console.log('[GameModeLoaderTest] Testando hook principal');
      const result = await testGameModeHook();
      console.log('[GameModeLoaderTest] Resultado do teste hook principal:', result);
      alert('Hook principal testado com sucesso!');
    } catch (err) {
      console.error('[GameModeLoaderTest] Erro no teste hook principal:', err);
      alert(`Erro ao testar hook principal: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleToggleAll = async () => {
    try {
      console.log('[GameModeLoaderTest] Alternando todas as versões');
      await toggleAllVersions();
      alert('Todas as versões alternadas!');
    } catch (err) {
      console.error('[GameModeLoaderTest] Erro ao alternar versões:', err);
      alert(`Erro ao alternar versões: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleToggleModule = async (modulePath: string) => {
    try {
      console.log(`[GameModeLoaderTest] Alternando módulo ${modulePath}`);
      await toggleModule(modulePath);
      alert(`Módulo ${modulePath} alternado!`);
    } catch (err) {
      console.error(`[GameModeLoaderTest] Erro ao alternar módulo ${modulePath}:`, err);
      alert(`Erro ao alternar módulo ${modulePath}: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  const handleClearCache = () => {
    try {
      clearCache();
      const cacheStatus = getCacheStatus();
      console.log('[GameModeLoaderTest] Cache limpo:', cacheStatus);
      alert('Cache limpo com sucesso!');
    } catch (err) {
      console.error('[GameModeLoaderTest] Erro ao limpar cache:', err);
      alert(`Erro ao limpar cache: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <div className="game-mode-loader-test" style={{
      padding: '20px',
      border: '2px solid #007bff',
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ color: '#007bff', marginBottom: '20px' }}>
        🧪 Teste do Sistema de Carregamento de Módulos
      </h3>

      {/* Status dos Módulos */}
      <div style={{ marginBottom: '20px' }}>
        <h4>📊 Status dos Módulos:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ padding: '10px', backgroundColor: moduleStatus.global ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
            <strong>Global:</strong> {moduleStatus.global ? '✅ Refatorado' : '❌ Original'}
          </div>
          <div style={{ padding: '10px', backgroundColor: moduleStatus.neighborhood ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
            <strong>Bairros:</strong> {moduleStatus.neighborhood ? '✅ Refatorado' : '❌ Original'}
          </div>
          <div style={{ padding: '10px', backgroundColor: moduleStatus.famousPlaces ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
            <strong>Lugares Famosos:</strong> {moduleStatus.famousPlaces ? '✅ Refatorado' : '❌ Original'}
          </div>
          <div style={{ padding: '10px', backgroundColor: moduleStatus.common ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
            <strong>Comum:</strong> {moduleStatus.common ? '✅ Refatorado' : '❌ Original'}
          </div>
          <div style={{ padding: '10px', backgroundColor: moduleStatus.gameMode ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
            <strong>Game Mode:</strong> {moduleStatus.gameMode ? '✅ Refatorado' : '❌ Original'}
          </div>
        </div>
      </div>

      {/* Controles Principais */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🎮 Controles Principais:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleAll}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Processando...' : '🔄 Alternar Todas as Versões'}
          </button>
          
          <button
            onClick={handleClearCache}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ Limpar Cache
          </button>
        </div>
      </div>

      {/* Testes de Módulos */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🧪 Testes de Módulos:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleTestMode('neighborhoods')}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Testando...' : '🏘️ Testar Modo Bairros'}
          </button>
          
          <button
            onClick={() => handleTestMode('famous_places')}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Testando...' : '🏛️ Testar Modo Lugares Famosos'}
          </button>
          
          <button
            onClick={handleTestGameModeHook}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Testando...' : '🎯 Testar Hook Principal'}
          </button>
        </div>
      </div>

      {/* Controles Individuais */}
      <div style={{ marginBottom: '20px' }}>
        <h4>⚙️ Controles Individuais:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => handleToggleModule('neighborhood')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Alternar Bairros
          </button>
          
          <button
            onClick={() => handleToggleModule('famousPlaces')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Alternar Lugares Famosos
          </button>
          
          <button
            onClick={() => handleToggleModule('common')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Alternar Comum
          </button>
          
          <button
            onClick={() => handleToggleModule('useGameMode')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Alternar Game Mode
          </button>
        </div>
      </div>

      {/* Status do Cache */}
      <div style={{ marginBottom: '20px' }}>
        <h4>💾 Status do Cache:</h4>
        <button
          onClick={() => {
            const cacheStatus = getCacheStatus();
            console.log('[GameModeLoaderTest] Status do cache:', cacheStatus);
            alert(`Cache: ${cacheStatus.size} módulos em cache\nChaves: ${cacheStatus.keys.join(', ')}`);
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📊 Ver Status do Cache
        </button>
      </div>

      {/* Mensagens de Erro */}
      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {/* Instruções */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb',
        borderRadius: '4px'
      }}>
        <h5>📋 Instruções de Uso:</h5>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Use "Alternar Todas as Versões" para testar o sistema completo</li>
          <li>Use os testes individuais para validar cada modo</li>
          <li>Monitore o console para logs detalhados</li>
          <li>Use "Limpar Cache" se houver problemas de carregamento</li>
          <li>Verifique o status dos módulos para confirmar mudanças</li>
        </ol>
      </div>
    </div>
  );
}; 