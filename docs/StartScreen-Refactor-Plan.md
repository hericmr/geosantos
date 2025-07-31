# Plano de Refatoração da StartScreen - Foco em Desempenho

## 🎯 Objetivo

Refatorar o componente `StartScreen` para otimizar o desempenho, reduzir re-renderizações desnecessárias e melhorar a experiência do usuário.

## 📊 Análise Atual

### Problemas Identificados

1. **Re-renderizações Excessivas**
   - `useMemo` para `menuOptions` com dependências desnecessárias
   - `useCallback` para funções que não precisam ser memoizadas
   - Estado `selectedOption` causando re-renderizações em hover

2. **Carregamento de Vídeo Ineficiente**
   - Vídeo de background carregado sempre
   - Captura de frame desnecessária
   - Múltiplos event listeners

3. **CSS Inline Excessivo**
   - Estilos inline em todos os elementos
   - Duplicação de estilos
   - Falta de classes CSS reutilizáveis

4. **Lógica de Estado Complexa**
   - Múltiplos estados relacionados
   - Lógica de vídeo misturada com UI
   - Estados desnecessários

## 🚀 Plano de Refatoração

### Fase 1: Otimização de Estado e Memoização

#### 1.1 Simplificar Estados
```typescript
// ANTES
const [selectedOption, setSelectedOption] = useState(0);
const [videoLoaded, setVideoLoaded] = useState(false);
const [videoError, setVideoError] = useState(false);
const [firstFrameDataUrl, setFirstFrameDataUrl] = useState<string | null>(null);

// DEPOIS
const [selectedOption, setSelectedOption] = useState(0);
const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
```

#### 1.2 Otimizar Menu Options
```typescript
// ANTES
const menuOptions = useMemo(() => [
  { id: 'famous_places', label: 'LUGARES FAMOSOS', icon: LandmarkIcon, action: () => { 
    console.log('[StartScreen] Lugares famosos selecionado');
    onSelectMode?.('famous_places'); 
    onStartGame(); 
  }, isMode: true },
  // ... mais opções
], [onStartGame, onShowLeaderboard, onSelectMode]);

// DEPOIS
const menuOptions = useMemo(() => [
  { id: 'famous_places', label: 'LUGARES FAMOSOS', icon: LandmarkIcon, action: 'famous_places' },
  { id: 'play', label: 'JOGAR', icon: PlayIcon, action: 'play' },
  { id: 'leaderboard', label: 'RANKING', icon: TrophyIcon, action: 'leaderboard' },
  { id: 'wiki', label: 'CONHEÇA OS LUGARES', icon: BookOpenIcon, action: 'wiki' }
], []); // Sem dependências

const handleMenuAction = useCallback((action: string) => {
  switch (action) {
    case 'famous_places':
      onSelectMode?.('famous_places');
      onStartGame();
      break;
    case 'play':
      onStartGame();
      break;
    case 'leaderboard':
      onShowLeaderboard?.();
      break;
    case 'wiki':
      window.location.href = '/geosantos/lugares-famosos';
      break;
  }
}, [onStartGame, onShowLeaderboard, onSelectMode]);
```

### Fase 2: Otimização de Vídeo e Background

#### 2.1 Lazy Loading do Vídeo
```typescript
// Componente separado para background
const BackgroundVideo = memo(() => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Carregar vídeo apenas quando necessário
    const video = new Image();
    video.onload = () => setIsLoaded(true);
    video.onerror = () => setHasError(true);
    video.src = '/assets/images/background.webm';
  }, []);

  if (hasError || !isLoaded) {
    return <div className="background-fallback" />;
  }

  return <video className="background-video" autoPlay muted loop />;
});
```

#### 2.2 Remover Captura de Frame
```typescript
// REMOVER completamente
// const captureFirstFrame = useCallback(() => { ... });
// const handleVideoLoad = useCallback(() => { ... });
// const handleVideoError = useCallback(() => { ... });
```

### Fase 3: CSS Otimizado

#### 3.1 Criar Classes CSS
```css
/* start-screen.css */
.start-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
}

.start-screen__content {
  position: relative;
  z-index: 5;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.start-screen__title {
  font-size: clamp(4.5rem, 10vw, 8rem);
  margin: 0;
  font-family: 'LaCartoonerie', sans-serif;
  font-weight: 800;
  color: #000000;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0px;
  text-shadow: 3px 3px 0px #fff, -3px -3px 0px #fff, 3px -3px 0px #fff, -3px 3px 0px #fff;
  text-align: center;
}

.start-screen__menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 300px;
}

.start-screen__menu-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border: 3px solid var(--text-primary);
  border-radius: 4px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.1s steps(1);
  font-family: 'LaCartoonerie', sans-serif;
  font-size: clamp(0.8rem, 2vw, 1rem);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: var(--shadow-md);
  transform: translate(0, 0);
  position: relative;
  overflow: hidden;
  opacity: 1;
}

.start-screen__menu-button--selected {
  background: var(--accent-blue);
  color: var(--bg-primary);
  box-shadow: var(--shadow-lg);
  transform: translate(-2px, -2px);
}

.start-screen__menu-button:hover {
  background: var(--accent-blue);
  color: var(--bg-primary);
  box-shadow: var(--shadow-lg);
  transform: translate(-2px, -2px);
}
```

#### 3.2 Componente de Botão Otimizado
```typescript
const MenuButton = memo(({ 
  option, 
  isSelected, 
  onClick, 
  onMouseEnter 
}: MenuButtonProps) => {
  const IconComponent = option.icon;
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`start-screen__menu-button ${isSelected ? 'start-screen__menu-button--selected' : ''}`}
    >
      <IconComponent 
        size={24} 
        color={isSelected ? 'var(--bg-primary)' : 'var(--text-primary)'} 
      />
      {option.label}
      {isSelected && (
        <div className="start-screen__menu-button-arrow">▶</div>
      )}
    </button>
  );
});
```

### Fase 4: Otimização de Event Handlers

#### 4.1 Simplificar Keyboard Navigation
```typescript
// ANTES
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSelectedOption(prev => {
      let newOption = prev > 0 ? prev - 1 : menuOptions.length - 1;
      return newOption;
    });
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSelectedOption(prev => {
      let newOption = prev < menuOptions.length - 1 ? prev + 1 : 0;
      return newOption;
    });
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    menuOptions[selectedOption].action?.();
  }
}, [menuOptions, selectedOption]);

// DEPOIS
const handleKeyDown = useCallback((e: KeyboardEvent) => {
  if (!['ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) return;
  
  e.preventDefault();
  
  switch (e.key) {
    case 'ArrowUp':
      setSelectedOption(prev => prev > 0 ? prev - 1 : menuOptions.length - 1);
      break;
    case 'ArrowDown':
      setSelectedOption(prev => prev < menuOptions.length - 1 ? prev + 1 : 0);
      break;
    case 'Enter':
    case ' ':
      handleMenuAction(menuOptions[selectedOption].action);
      break;
  }
}, [menuOptions, selectedOption, handleMenuAction]);
```

### Fase 5: Componentização

#### 5.1 Separar Componentes
```typescript
// StartScreenStats.tsx
const StartScreenStats = memo(({ highScore, totalGames, averageScore }: StatsProps) => {
  if (highScore === 0 && totalGames === 0) return null;
  
  return (
    <div className="start-screen__stats">
      {/* Renderizar estatísticas */}
    </div>
  );
});

// StartScreenInstructions.tsx
const StartScreenInstructions = memo(() => {
  return (
    <div className="start-screen__instructions">
      {/* Renderizar instruções */}
    </div>
  );
});
```

#### 5.2 StartScreen Principal Otimizada
```typescript
export const StartScreen: React.FC<StartScreenProps> = memo(({
  onStartGame,
  onShowLeaderboard,
  highScore = 0,
  totalGames = 0,
  averageScore = 0,
  onSelectMode
}) => {
  const [selectedOption, setSelectedOption] = useState(0);
  
  const menuOptions = useMemo(() => [
    { id: 'famous_places', label: 'LUGARES FAMOSOS', icon: LandmarkIcon, action: 'famous_places' },
    { id: 'play', label: 'JOGAR', icon: PlayIcon, action: 'play' },
    { id: 'leaderboard', label: 'RANKING', icon: TrophyIcon, action: 'leaderboard' },
    { id: 'wiki', label: 'CONHEÇA OS LUGARES', icon: BookOpenIcon, action: 'wiki' }
  ], []);

  const handleMenuAction = useCallback((action: string) => {
    switch (action) {
      case 'famous_places':
        onSelectMode?.('famous_places');
        onStartGame();
        break;
      case 'play':
        onStartGame();
        break;
      case 'leaderboard':
        onShowLeaderboard?.();
        break;
      case 'wiki':
        window.location.href = '/geosantos/lugares-famosos';
        break;
    }
  }, [onStartGame, onShowLeaderboard, onSelectMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!['ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) return;
    
    e.preventDefault();
    
    switch (e.key) {
      case 'ArrowUp':
        setSelectedOption(prev => prev > 0 ? prev - 1 : menuOptions.length - 1);
        break;
      case 'ArrowDown':
        setSelectedOption(prev => prev < menuOptions.length - 1 ? prev + 1 : 0);
        break;
      case 'Enter':
      case ' ':
        handleMenuAction(menuOptions[selectedOption].action);
        break;
    }
  }, [menuOptions, selectedOption, handleMenuAction]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <BackgroundVideo />
      <div className="start-screen__content">
        <div className="start-screen__title">GEOSANTOS</div>
        <p className="start-screen__subtitle">DESAFIO GEOGRÁFICO DE SANTOS</p>
        
        <StartScreenStats 
          highScore={highScore}
          totalGames={totalGames}
          averageScore={averageScore}
        />
        
        <div className="start-screen__menu">
          {menuOptions.map((option, index) => (
            <MenuButton
              key={option.id}
              option={option}
              isSelected={index === selectedOption}
              onClick={() => handleMenuAction(option.action)}
              onMouseEnter={() => setSelectedOption(index)}
            />
          ))}
        </div>
        
        <StartScreenInstructions />
      </div>
    </>
  );
});
```

## 📈 Benefícios Esperados

### Performance
- **Redução de 60-80%** nas re-renderizações
- **Carregamento 40% mais rápido** sem captura de frame
- **Menos uso de memória** com componentes memoizados
- **CSS mais eficiente** com classes ao invés de inline styles

### Manutenibilidade
- **Código mais limpo** e organizado
- **Componentes reutilizáveis**
- **Separação de responsabilidades**
- **Testes mais fáceis** de implementar

### UX
- **Resposta mais rápida** aos inputs
- **Transições mais suaves**
- **Menos travamentos** em dispositivos lentos
- **Melhor acessibilidade**

## 🛠️ Implementação

### Ordem de Implementação
1. **Fase 1**: Otimização de estado e memoização
2. **Fase 2**: Otimização de vídeo e background
3. **Fase 3**: CSS otimizado
4. **Fase 4**: Otimização de event handlers
5. **Fase 5**: Componentização

### Testes Necessários
- [ ] Testes de performance (React DevTools Profiler)
- [ ] Testes de acessibilidade (keyboard navigation)
- [ ] Testes de responsividade
- [ ] Testes de carregamento em conexões lentas

### Métricas de Sucesso
- **Bundle size**: Redução de 20-30%
- **First Contentful Paint**: Melhoria de 30-50%
- **Time to Interactive**: Melhoria de 25-40%
- **Re-renderizações**: Redução de 60-80%

## 🔄 Rollback Plan

1. **Branch separado** para implementação
2. **Testes automatizados** antes do merge
3. **Feature flags** para ativação gradual
4. **Monitoramento** de performance em produção
5. **Rollback automático** se métricas piorarem 