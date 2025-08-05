# Timing do Modal de Lugares Famosos

## Visão Geral
O modal de lugares famosos agora tem um timing específico para garantir justiça no jogo: aparece centralizado por 2 segundos para o jogador ver o lugar, depois se move para o canto e só então inicia o timer.

## Melhorias Visuais Implementadas

### 🎨 **Estilo do Jogo**
- **Fonte LaCartoonerie**: Título com a mesma fonte do StartScreen
- **Cores consistentes**: Verde do jogo no header
- **Text shadow**: Efeito 3D no título (branco em todas as direções)
- **Formatação**: Uppercase, letter-spacing e peso da fonte

### ⏱️ **Barra de Tempo Visual**
- **Progresso em tempo real**: Barra verde que avança de 0% a 100%
- **Indicador visual**: Verde (tempo restante) → Vermelho (tempo esgotado)
- **Suavidade**: Atualização a cada 50ms para movimento fluido
- **Posicionamento**: No fundo do header, atrás do título

## Sequência de Timing

### 1. **Aparição Centralizada (0-2s)**
- Modal aparece centralizado na tela
- Backdrop com blur para foco total
- Mostra imagem, nome e categoria do lugar
- **Barra de tempo visual** no header (verde → vermelho)
- **Timer pausado** - jogador pode ver o lugar sem pressão de tempo
- Duração: 2 segundos

### 2. **Transição para o Canto (2-2.3s)**
- Modal se move suavemente para o canto superior direito
- Animação de slide de 0.3 segundos
- Backdrop desaparece
- Modal fica compacto (só imagem e título)
- **Timer ainda pausado**

### 3. **Início do Timer (2.3s)**
- Timer inicia após a transição
- Jogador pode começar a jogar
- Modal permanece no canto como referência

## Implementação Técnica

### Estados do Modal
```typescript
const [isModalCentered, setIsModalCentered] = useState(true);
const [isTimerPaused, setIsTimerPaused] = useState(false);
const [modalTimeProgress, setModalTimeProgress] = useState(0);
```

### Lógica de Timing
```typescript
useEffect(() => {
  if (currentMode === 'famous_places' && currentFamousPlace && gameState.gameStarted) {
    // 1. Mostra modal centralizado
    setIsModalCentered(true);
    setShowFamousPlaceModal(true);
    setIsTimerPaused(true);
    setModalTimeProgress(0);
    
    // Barra de tempo de 2 segundos
    const startTime = Date.now();
    const duration = 2000;
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setModalTimeProgress(progress);
    }, 50);
    
    // 2. Após 2 segundos, move para o canto
    const moveToCornerTimer = setTimeout(() => {
      setIsModalCentered(false);
      setModalTimeProgress(0);
      clearInterval(progressInterval);
    }, 2000);
    
    // 3. Após 2.3 segundos, inicia o timer
    const startTimerTimer = setTimeout(() => {
      setIsTimerPaused(false);
    }, 2300);
    
    return () => {
      clearTimeout(moveToCornerTimer);
      clearTimeout(startTimerTimer);
      clearInterval(progressInterval);
    };
  }
}, [currentMode, currentFamousPlace, gameState.gameStarted]);
```

### Pausa Externa do Timer
O hook `useGameState` foi modificado para aceitar uma pausa externa:

```typescript
export const useGameState = (externalPause: boolean = false) => {
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && 
        gameState.roundTimeLeft > 0 && gameState.globalTimeLeft > 0 && 
        gameState.isCountingDown && !gameState.isPaused && !externalPause) {
      // Timer só roda se não estiver pausado externamente
    }
  }, [gameState.gameStarted, gameState.gameOver, gameState.isCountingDown, 
      gameState.isPaused, externalPause]);
};
```

## Benefícios

### Justiça no Jogo
- **Tempo igual para todos**: Todos os jogadores têm 2 segundos para ver o lugar
- **Sem vantagem de velocidade**: Timer não inicia imediatamente
- **Foco no lugar**: Modal centralizado força atenção ao lugar
- **Feedback visual**: Barra de tempo mostra quanto tempo resta

### UX Melhorada
- **Referência visual**: Modal no canto serve como lembrete
- **Transição suave**: Movimento natural do modal
- **Feedback claro**: Estados visuais distintos
- **Estilo consistente**: Visual alinhado com o resto do jogo

### Performance
- **Timer eficiente**: Pausa externa evita cálculos desnecessários
- **Cleanup adequado**: Timeouts são limpos corretamente
- **Memory safe**: Sem vazamentos de memória
- **Animação suave**: 50ms de intervalo para barra de tempo

## Estados Visuais

### Modal Centralizado
- **Posição**: Centro da tela
- **Tamanho**: Grande (420px)
- **Backdrop**: Com blur
- **Conteúdo**: Essencial (imagem, nome, categoria)
- **Estilo**: Fonte LaCartoonerie, cores do jogo
- **Barra de tempo**: Visual no header (0-100%)
- **Timer**: Pausado

### Modal no Canto
- **Posição**: Canto superior direito
- **Tamanho**: Compacto (380px)
- **Backdrop**: Sem backdrop
- **Conteúdo**: Reduzido (só imagem e título)
- **Timer**: Ativo

## Animações

### Entrada Centralizada
```css
@keyframes modalSlideIn {
  0% { 
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

### Transição para o Canto
```css
@keyframes modalSlideIn {
  0% { 
    opacity: 0;
    transform: translateX(100%);
  }
  100% { 
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Barra de Tempo
```css
.progress-bar {
  transition: width 0.1s linear;
  background: linear-gradient(to right, 
    rgba(255, 255, 255, 0.2) 0%, 
    rgba(255, 0, 0, 0.3) 100%);
}
```

## Configuração

### Timing Configurável
Os tempos podem ser facilmente ajustados:

```typescript
const MODAL_CENTER_DURATION = 2000; // 2 segundos
const MODAL_TRANSITION_DURATION = 300; // 0.3 segundos
const TOTAL_DELAY = MODAL_CENTER_DURATION + MODAL_TRANSITION_DURATION; // 2.3 segundos
const PROGRESS_UPDATE_INTERVAL = 50; // 50ms para suavidade
```

### Responsividade
- **Mobile**: Modal se adapta ao tamanho da tela
- **Desktop**: Tamanhos otimizados para cada estado
- **Viewport**: Uso de unidades vw para responsividade

## Próximas Melhorias

1. **Configuração de timing**: Permitir ajustar tempos via configuração
2. **Animações customizáveis**: Diferentes tipos de transição
3. **Som de transição**: Feedback sonoro quando timer inicia
4. **Contador visual**: Mostrar contagem regressiva antes do timer
5. **Modo rápido**: Opção para pular a visualização centralizada
6. **Efeitos sonoros**: Sons para a barra de tempo
7. **Vibração**: Feedback tátil em dispositivos móveis 