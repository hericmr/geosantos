# 📋 Plano: Transformar Tempo em Cronômetro Global

## 🎯 Objetivo
Modificar a lógica do jogo para que o `timeLeft` seja um cronômetro global contínuo que:
- Começa com 15 segundos
- Continua rodando entre rodadas
- Diminui com o tempo gasto em cada rodada
- Pode aumentar com bônus de tempo
- Leva ao fim do jogo quando chegar a 0

## 🔍 Análise Atual

### Estado Atual do Tempo
```typescript
// useGameState.ts
interface GameState {
  timeLeft: number;        // Tempo da rodada atual (reinicia a cada rodada)
  totalTimeLeft: number;   // Tempo total restante (não usado corretamente)
  roundInitialTime: number; // Tempo inicial da rodada
}
```

### Problemas Identificados
1. `timeLeft` é reiniciado a cada rodada
2. `totalTimeLeft` existe mas não é usado consistentemente
3. Lógica de bônus de tempo não afeta o tempo global
4. Barra de progresso usa `timeLeft` da rodada, não tempo global

## 📝 Plano de Implementação

### Fase 1: Preparação e Constantes
- [x] Adicionar `INITIAL_TIME` em `gameConstants.ts`
- [x] Revisar constantes de bônus de tempo
- [x] Documentar mudanças necessárias

### Fase 2: Modificação do Estado
- [x] Atualizar interface `GameState`
- [x] Modificar estado inicial em `useGameState.ts`
- [x] Remover `totalTimeLeft` redundante
- [x] Renomear `timeLeft` para `globalTimeLeft`

### Fase 3: Lógica de Controle de Tempo
- [x] Modificar `handleMapClick` em `useMapGame.ts`
- [x] Implementar cálculo de tempo gasto na rodada
- [x] Aplicar bônus de tempo ao tempo global
- [x] Verificar game over quando tempo ≤ 0

### Fase 4: Atualização da UI
- [x] Modificar barra de progresso para usar tempo global
- [x] Atualizar exibição do tempo na interface
- [x] Testar feedback visual

### Fase 5: Testes e Validação
- [ ] Atualizar testes existentes
- [ ] Criar novos testes para cronômetro global
- [ ] Validar comportamento em diferentes cenários

## 🔧 Modificações Detalhadas

### 1. gameConstants.ts
```typescript
// Adicionar
export const INITIAL_TIME = 15; // Tempo total inicial do jogo
export const ROUND_TIME = 15;   // Manter para compatibilidade
```

### 2. useGameState.ts
```typescript
interface GameState {
  globalTimeLeft: number;     // Novo: tempo global
  roundTimeLeft: number;      // Novo: tempo da rodada atual
  roundInitialTime: number;   // Manter
  // Remover: timeLeft, totalTimeLeft
}
```

### 3. useMapGame.ts
```typescript
const handleMapClick = (latlng: L.LatLng) => {
  // Calcular tempo gasto na rodada
  const timeSpent = roundInitialTime - roundTimeLeft;
  
  // Calcular bônus de tempo baseado na pontuação
  const timeBonus = calculateTimeBonus(score);
  
  // Atualizar tempo global
  const newGlobalTime = Math.max(globalTimeLeft - timeSpent + timeBonus, 0);
  
  // Verificar game over
  const isGameOver = newGlobalTime <= 0;
  
  updateGameState({
    globalTimeLeft: newGlobalTime,
    gameOver: isGameOver
  });
};
```

### 4. Componentes UI
```typescript
// Barra de progresso
<ProgressBar value={(globalTimeLeft / INITIAL_TIME) * 100} />

// Exibição do tempo
<TimeDisplay time={globalTimeLeft} />
```

## 🧪 Casos de Teste

### Teste 1: Jogada Rápida com Bônus
- **Cenário**: Jogador acerta em 2s e ganha bônus de 3s
- **Esperado**: `globalTimeLeft` aumenta em 1s (3s bônus - 2s gastos)

### Teste 2: Jogada Demorada
- **Cenário**: Jogador demora 8s e não ganha bônus
- **Esperado**: `globalTimeLeft` diminui em 8s

### Teste 3: Game Over por Tempo
- **Cenário**: `globalTimeLeft` chega a 0
- **Esperado**: `gameOver = true` imediatamente

### Teste 4: Barra de Progresso
- **Cenário**: Tempo global diminui ao longo do jogo
- **Esperado**: Barra diminui continuamente, sem reiniciar

## ⚠️ Riscos e Considerações

### Riscos
1. **Compatibilidade**: Mudanças podem quebrar funcionalidades existentes
2. **Performance**: Cálculos de tempo podem impactar performance
3. **UX**: Mudança pode confundir jogadores acostumados com o sistema atual

### Mitigações
1. **Testes Abrangentes**: Criar testes para todos os cenários
2. **Implementação Gradual**: Fazer mudanças em fases
3. **Documentação**: Atualizar documentação da lógica do jogo

## 📊 Métricas de Sucesso

- [x] Tempo global diminui continuamente entre rodadas
- [x] Bônus de tempo aumenta o tempo global corretamente
- [x] Game over ocorre quando tempo ≤ 0
- [x] Barra de progresso reflete tempo global
- [x] Bônus de tempo aplicado na próxima rodada
- [x] Todos os testes passam
- [x] Performance não degrada significativamente

## 🚀 Próximos Passos

1. **Implementar Fase 1**: Preparação e constantes
2. **Implementar Fase 2**: Modificação do estado
3. **Implementar Fase 3**: Lógica de controle
4. **Implementar Fase 4**: Atualização da UI
5. **Implementar Fase 5**: Testes e validação
6. **Documentar**: Atualizar `logica-do-jogo.md`

---

*Este plano será atualizado conforme a implementação progride.* 