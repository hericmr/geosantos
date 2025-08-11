/**
 * Componente de teste para o sistema unificado de modos de jogo
 * 
 * Este componente permite testar e validar o sistema unificado
 * durante a refatoração, facilitando a identificação de problemas
 */

import React, { useState } from 'react';
import { useUnifiedGameMode } from '../../hooks/useUnifiedGameMode';
import { GameModeType } from '../../types/modes/unified/unified.types';

export const UnifiedGameModeTest: React.FC = () => {
  const {
    isLoading,
    error,
    activeMode,
    gameStats,
    isGameActive,
    switchMode,
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    handleMapClick,
    updateTimer,
    startNewRound,
    selectRandomTarget,
    getDebugInfo,
    getEventSystemStats,
    getEventHistory,
    getEventsByType,
    getEventsByMode,
    cleanup
  } = useUnifiedGameMode();

  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [eventHistory, setEventHistory] = useState<any[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');

  const handleSwitchMode = async (mode: GameModeType) => {
    try {
      await switchMode(mode);
    } catch (err) {
      console.error('Erro ao trocar modo:', err);
    }
  };

  const handleExecuteAction = async (action: string, data: any = {}) => {
    try {
      let result;
      switch (action) {
        case 'startGame':
          result = await startGame();
          break;
        case 'pauseGame':
          result = await pauseGame();
          break;
        case 'resumeGame':
          result = await resumeGame();
          break;
        case 'endGame':
          result = await endGame();
          break;
        case 'handleMapClick':
          result = await handleMapClick({ lat: -23.9618, lng: -46.3322 });
          break;
        case 'updateTimer':
          result = await updateTimer(10);
          break;
        case 'startNewRound':
          result = await startNewRound();
          break;
        case 'selectRandomTarget':
          result = await selectRandomTarget();
          break;
        default:
          console.warn('Ação desconhecida:', action);
          return;
      }
      console.log(`Ação ${action} executada:`, result);
    } catch (err) {
      console.error(`Erro ao executar ação ${action}:`, err);
    }
  };

  const handleGetDebugInfo = () => {
    const info = getDebugInfo();
    setDebugInfo(info);
    console.log('Debug info:', info);
  };

  const handleGetEventStats = () => {
    const stats = getEventSystemStats();
    setEventStats(stats);
    console.log('Event stats:', stats);
  };

  const handleGetEventHistory = () => {
    const history = getEventHistory();
    setEventHistory(history);
    console.log('Event history:', history);
  };

  const handleGetEventsByType = () => {
    if (selectedEventType === 'all') {
      handleGetEventHistory();
    } else {
      const events = getEventsByType(selectedEventType);
      setEventHistory(events);
      console.log(`Events by type ${selectedEventType}:`, events);
    }
  };

  const handleGetEventsByMode = () => {
    if (selectedMode === 'all') {
      handleGetEventHistory();
    } else {
      const events = getEventsByMode(selectedMode);
      setEventHistory(events);
      console.log(`Events by mode ${selectedMode}:`, events);
    }
  };

  return (
    <div className="unified-game-mode-test" style={{
      padding: '20px',
      border: '2px solid #28a745',
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3 style={{ color: '#28a745', marginBottom: '20px' }}>
        🎮 Teste do Sistema Unificado de Modos
      </h3>

      {/* Status do Sistema */}
      <div style={{ marginBottom: '20px' }}>
        <h4>📊 Status do Sistema:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div style={{ padding: '10px', backgroundColor: isLoading ? '#fff3cd' : '#d4edda', borderRadius: '4px' }}>
            <strong>Carregando:</strong> {isLoading ? '⏳ Sim' : '✅ Não'}
          </div>
          <div style={{ padding: '10px', backgroundColor: error ? '#f8d7da' : '#d4edda', borderRadius: '4px' }}>
            <strong>Erro:</strong> {error ? `❌ ${error}` : '✅ Nenhum'}
          </div>
          <div style={{ padding: '10px', backgroundColor: isGameActive ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
            <strong>Jogo Ativo:</strong> {isGameActive ? '✅ Sim' : '❌ Não'}
          </div>
          <div style={{ padding: '10px', backgroundColor: '#e2e3e5', borderRadius: '4px' }}>
            <strong>Modo Ativo:</strong> {activeMode}
          </div>
        </div>
      </div>

      {/* Estatísticas do Jogo */}
      {gameStats && (
        <div style={{ marginBottom: '20px' }}>
          <h4>🎯 Estatísticas do Jogo:</h4>
          <div style={{ padding: '15px', backgroundColor: '#e2e3e5', borderRadius: '4px' }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(gameStats, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Controles de Modo */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🔄 Controles de Modo:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSwitchMode(GameModeType.NEIGHBORHOODS)}
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
            🏘️ Modo Bairros
          </button>
          
          <button
            onClick={() => handleSwitchMode(GameModeType.FAMOUS_PLACES)}
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
            🏛️ Modo Lugares Famosos
          </button>
        </div>
      </div>

      {/* Controles de Jogo */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🎮 Controles de Jogo:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => handleExecuteAction('startGame')}
            disabled={isLoading || isGameActive}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isLoading || isGameActive) ? 'not-allowed' : 'pointer'
            }}
          >
            ▶️ Iniciar
          </button>
          
          <button
            onClick={() => handleExecuteAction('pauseGame')}
            disabled={isLoading || !isGameActive}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: (isLoading || !isGameActive) ? 'not-allowed' : 'pointer'
            }}
          >
            ⏸️ Pausar
          </button>
          
          <button
            onClick={() => handleExecuteAction('resumeGame')}
            disabled={isLoading || isGameActive}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isLoading || isGameActive) ? 'not-allowed' : 'pointer'
            }}
          >
            ▶️ Retomar
          </button>
          
          <button
            onClick={() => handleExecuteAction('endGame')}
            disabled={isLoading || !isGameActive}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (isLoading || !isGameActive) ? 'not-allowed' : 'pointer'
            }}
          >
            ⏹️ Finalizar
          </button>
        </div>
      </div>

      {/* Ações de Jogo */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🎯 Ações de Jogo:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <button
            onClick={() => handleExecuteAction('handleMapClick')}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            🖱️ Clique no Mapa
          </button>
          
          <button
            onClick={() => handleExecuteAction('updateTimer')}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            ⏰ Atualizar Timer
          </button>
          
          <button
            onClick={() => handleExecuteAction('startNewRound')}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#20c997',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            🔄 Nova Rodada
          </button>
          
          <button
            onClick={() => handleExecuteAction('selectRandomTarget')}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            🎯 Alvo Aleatório
          </button>
        </div>
      </div>

      {/* Informações de Debug */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🐛 Informações de Debug:</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetDebugInfo}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📊 Debug Info
          </button>
          
          <button
            onClick={handleGetEventStats}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📈 Event Stats
          </button>
          
          <button
            onClick={handleGetEventHistory}
            style={{
              padding: '8px 16px',
              backgroundColor: '#20c997',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📜 Event History
          </button>
          
          <button
            onClick={cleanup}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🗑️ Cleanup
          </button>
        </div>
      </div>

      {/* Filtros de Eventos */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🔍 Filtros de Eventos:</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            Tipo de Evento:
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              style={{ marginLeft: '5px', padding: '5px' }}
            >
              <option value="all">Todos</option>
              <option value="gameStart">Início de Jogo</option>
              <option value="gameEnd">Fim de Jogo</option>
              <option value="gamePause">Pausa</option>
              <option value="gameResume">Retomada</option>
              <option value="roundComplete">Rodada Completa</option>
              <option value="scoreUpdate">Atualização de Pontuação</option>
              <option value="feedback">Feedback</option>
            </select>
          </label>
          
          <button
            onClick={handleGetEventsByType}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔍 Filtrar por Tipo
          </button>
          
          <label>
            Modo:
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              style={{ marginLeft: '5px', padding: '5px' }}
            >
              <option value="all">Todos</option>
              <option value="neighborhoods">Bairros</option>
              <option value="famous_places">Lugares Famosos</option>
            </select>
          </label>
          
          <button
            onClick={handleGetEventsByMode}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔍 Filtrar por Modo
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div style={{ marginBottom: '20px' }}>
          <h4>🐛 Debug Info:</h4>
          <div style={{ padding: '15px', backgroundColor: '#e2e3e5', borderRadius: '4px' }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Event Stats */}
      {eventStats && (
        <div style={{ marginBottom: '20px' }}>
          <h4>📈 Event Stats:</h4>
          <div style={{ padding: '15px', backgroundColor: '#e2e3e5', borderRadius: '4px' }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(eventStats, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Event History */}
      {eventHistory.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>📜 Event History:</h4>
          <div style={{ padding: '15px', backgroundColor: '#e2e3e5', borderRadius: '4px', maxHeight: '300px', overflow: 'auto' }}>
            {eventHistory.map((event, index) => (
              <div key={index} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                <strong>{event.type}</strong> - {event.mode} - {new Date(event.timestamp).toLocaleTimeString()}
                <pre style={{ margin: '5px 0 0 0', fontSize: '10px' }}>
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <li>Use os controles de modo para alternar entre Bairros e Lugares Famosos</li>
          <li>Use os controles de jogo para gerenciar o estado do jogo</li>
          <li>Use as ações de jogo para simular interações do usuário</li>
          <li>Monitore o console para logs detalhados</li>
          <li>Use as informações de debug para análise do sistema</li>
        </ol>
      </div>
    </div>
  );
}; 