/**
 * Arquivo de teste para os novos sistemas do jogo GeoSantos
 * Execute este arquivo para verificar se tudo está funcionando
 */

import { GameTimerManager } from './GameTimerManager';
import { GameStateMachine, GamePhase } from './GameStateMachine';
import { GameAnimationSystem } from './GameAnimationSystem';

export function testAllSystems() {
  console.log('🧪 Iniciando testes dos sistemas...');
  
  // Teste 1: GameTimerManager
  console.log('\n📱 Testando GameTimerManager...');
  const timerManager = new GameTimerManager();
  
  // Testar timer
  timerManager.scheduleTimer('test', 1000, () => {
    console.log('✅ Timer funcionando!');
  });
  
  console.log(`Timers ativos: ${timerManager.getActiveTimersCount()}`);
  console.log(`Configuração mobile:`, timerManager.getMobileOptimizedConfig());
  
  // Teste 2: GameStateMachine
  console.log('\n🎮 Testando GameStateMachine...');
  const stateMachine = new GameStateMachine();
  
  console.log(`Estado inicial: ${stateMachine.getCurrentPhase()}`);
  
  // Testar transições
  stateMachine.transitionTo(GamePhase.WAITING_CLICK);
  console.log(`Após transição: ${stateMachine.getCurrentPhase()}`);
  
  stateMachine.transitionTo(GamePhase.PROCESSING_CLICK);
  console.log(`Após segunda transição: ${stateMachine.getCurrentPhase()}`);
  
  // Teste 3: GameAnimationSystem
  console.log('\n🎬 Testando GameAnimationSystem...');
  const animationSystem = new GameAnimationSystem();
  
  console.log(`Sistema de animações criado: ${animationSystem.isAnimating()}`);
  
  // Testar sequência de animações
  animationSystem.playAnimationSequence(['sprite_click', 'feedback_panel']);
  console.log(`Sequência iniciada: ${animationSystem.isAnimating()}`);
  
  // Limpar após 2 segundos
  setTimeout(() => {
    animationSystem.cleanup();
    console.log('🧹 Sistema de animações limpo');
    
    // Limpar timer de teste
    timerManager.clearAll();
    console.log('🧹 Timers limpos');
    
    console.log('\n✅ Todos os testes concluídos!');
  }, 2000);
}

// Executar testes se o arquivo for importado
if (typeof window !== 'undefined') {
  // Adicionar botão de teste na interface
  const testButton = document.createElement('button');
  testButton.textContent = '🧪 Testar Sistemas';
  testButton.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10000;
    padding: 10px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  `;
  testButton.onclick = testAllSystems;
  document.body.appendChild(testButton);
} 