# Correção do Timing das Animações do Sprite

## Problema Identificado

As animações do sprite após o clique estavam com durações muito curtas, causando:

1. **Frame Delay muito curto**: 45ms entre frames (muito rápido para apreciar)
2. **Duração total muito curta**: 727ms para toda a animação
3. **Conflitos de timing**: Tempos de 200ms e 300ms interferindo na animação
4. **Sprite final muito rápido**: Apenas 1 segundo na tela

## Soluções Implementadas

### 1. Ajuste das Constantes de Animação (`src/constants/spriteAnimation.ts`)

```typescript
export const IDEAL_SPRITE_CONFIG: SpriteAnimationConfig = {
  size: 122,
  anchorX: 25,
  anchorY: 104,
  fps: 15,             // Reduzido de 22 para 15 (mais visível)
  frameDelay: 67,      // Aumentado de 45ms para 67ms
  totalDuration: 1072  // Aumentado de 727ms para 1072ms
};
```

**Benefícios:**
- Animação mais lenta e apreciável
- FPS reduzido para melhor visualização
- Duração total aumentada em ~47%

### 2. Ajuste do Componente SpriteAnimation (`src/components/ui/SpriteAnimation.tsx`)

```typescript
const frameInterval = setInterval(() => {
  // ... lógica da animação
}, 150); // Aumentado de 100ms para 150ms
```

**Benefícios:**
- Intervalo entre frames mais adequado
- Melhor sincronização com as constantes

### 3. Ajuste do Tempo de Exibição do Sprite Final (`src/components/Map.tsx`)

```typescript
// Sprite final permanece por 2 segundos (aumentado de 1 segundo)
setTimeout(() => {
  updateGameState({ clickedPosition: null });
}, 2000); // Aumentado de 1000ms para 2000ms
```

**Benefícios:**
- Mais tempo para apreciar o resultado
- Melhor experiência visual

### 4. Ajuste dos Tempos de Feedback (`src/hooks/useMapGame.ts`)

**Antes:**
- Círculo de distância: 200ms
- Início do feedback: 200ms/300ms
- Progresso do feedback: 300ms

**Depois:**
- Círculo de distância: 500ms
- Início do feedback: 800ms
- Progresso do feedback: 800ms

**Benefícios:**
- Evita conflitos com a animação do sprite
- Sequência temporal mais lógica
- Melhor separação entre animação e feedback

## Cronograma de Timing Atualizado

```
0ms    - Clique detectado
0ms    - Animação do sprite inicia
1072ms - Animação do sprite termina
2000ms - Sprite final é removido
500ms  - Círculo de distância aparece (se aplicável)
800ms  - Feedback inicia
```

## Resultados Esperados

1. **Animação mais visível**: FPS reduzido e duração aumentada
2. **Melhor timing**: Sem conflitos entre animação e feedback
3. **Experiência aprimorada**: Usuário tem tempo para apreciar a animação
4. **Sequência lógica**: Animação → Resultado → Feedback

## Arquivos Modificados

- `src/constants/spriteAnimation.ts`
- `src/components/ui/SpriteAnimation.tsx`
- `src/components/Map.tsx`
- `src/hooks/useMapGame.ts`

## Testes Recomendados

1. **Teste de clique**: Verificar se a animação é visível
2. **Teste de timing**: Confirmar que não há conflitos
3. **Teste de feedback**: Verificar se aparece após a animação
4. **Teste de performance**: Confirmar que não há travamentos 