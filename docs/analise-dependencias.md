# 🔍 ANÁLISE DE DEPENDÊNCIAS CRUZADAS - ETAPA 1

## 📊 RESUMO EXECUTIVO

**Data da Análise**: $(date)
**Analista**: Sistema de Refatoração
**Objetivo**: Mapear completamente como as lógicas dos modos Bairros e Lugares Famosos estão entrelaçadas

## 🎯 ESTADO ATUAL DO CÓDIGO

### **Arquitetura Identificada**
O projeto já possui uma estrutura bem organizada com separação de modos, mas ainda existem algumas dependências cruzadas que precisam ser isoladas.

### **Estrutura de Diretórios Atual**
```
src/
├── components/game/
│   ├── modes/
│   │   ├── NeighborhoodMode/
│   │   │   ├── NeighborhoodMode.tsx ✅ ISOLADO
│   │   │   └── index.ts
│   │   └── FamousPlacesMode/
│   │       ├── FamousPlacesMode.tsx ✅ ISOLADO
│   │       └── index.ts
│   └── common/
│       └── BaseGameMode.tsx ✅ INTERFACE COMUM
├── hooks/modes/
│   ├── useNeighborhoodGame.ts ✅ ISOLADO
│   ├── useFamousPlacesGame.ts ✅ ISOLADO
│   └── useGameMode.ts ⚠️ PONTO DE ACOPLAMENTO
├── types/
│   ├── common.ts ✅ TIPOS BASE
│   ├── modes/
│   │   ├── neighborhood.ts ✅ ISOLADO
│   │   └── famousPlaces.ts ✅ ISOLADO
│   └── famousPlaces.ts ⚠️ TIPO COMPARTILHADO
└── utils/modes/
    ├── neighborhood/ ✅ ISOLADO
    │   ├── validation.ts
    │   └── scoring.ts
    └── famousPlaces/ ✅ ISOLADO
        ├── validation.ts
        └── scoring.ts
```

## ⚠️ DEPENDÊNCIAS CRUZADAS IDENTIFICADAS

### **1. Hook Principal (useGameMode.ts)**
**Arquivo**: `src/hooks/modes/useGameMode.ts`
**Problema**: Este hook importa e gerencia ambos os modos simultaneamente
**Dependências**:
- `useNeighborhoodGame`
- `useFamousPlacesGame`
- `NeighborhoodMode`
- `FamousPlacesMode`

**Código Problemático**:
```typescript
// Hook para modo bairros
const neighborhoodGame = useNeighborhoodGame(geoJsonData, config.neighborhood);

// Hook para modo lugares famosos
const famousPlacesGame = useFamousPlacesGame(famousPlaces, config.famousPlaces);
```

### **2. Tipos Compartilhados**
**Arquivo**: `src/types/famousPlaces.ts`
**Problema**: Este arquivo é importado por ambos os modos
**Dependências**:
- `FamousPlace` interface
- Usado em `NeighborhoodMode` e `FamousPlacesMode`

### **3. Componente Map.tsx**
**Arquivo**: `src/components/Map.tsx`
**Problema**: Lógica de ambos os modos misturada no mesmo componente
**Dependências**:
- `NeighborhoodManager`
- `FamousPlacesManager`
- Lógica condicional baseada no modo ativo

### **4. Hook useMapGame.ts**
**Arquivo**: `src/hooks/useMapGame.ts`
**Problema**: Lógica de validação e pontuação misturada
**Dependências**:
- Funções de validação de polígonos
- Cálculos de distância
- Lógica de pontuação

## 🔗 MAPEAMENTO DE IMPORTS

### **Imports de NeighborhoodMode**
```typescript
// Arquivos importados
import { BaseGameMode } from '../../common/BaseGameMode';
import { NeighborhoodValidation, NeighborhoodGameState, NeighborhoodConfig, NeighborhoodVisualFeedback } from '../../../../types/modes/neighborhood';
import { validateNeighborhoodClick } from '../../../../utils/modes/neighborhood/validation';
import { calculateNeighborhoodScore } from '../../../../utils/modes/neighborhood/scoring';

// Dependências
✅ BaseGameMode (interface comum)
✅ Tipos específicos do modo
✅ Utilitários específicos do modo
```

### **Imports de FamousPlacesMode**
```typescript
// Arquivos importados
import { BaseGameMode } from '../../common/BaseGameMode';
import { FamousPlacesValidation, FamousPlacesGameState, FamousPlacesConfig, FamousPlacesVisualFeedback, FamousPlacesRound } from '../../../../types/modes/famousPlaces';
import { validateFamousPlaceClick } from '../../../../utils/modes/famousPlaces/validation';
import { calculateFamousPlacesScore } from '../../../../utils/modes/famousPlaces/scoring';
import { FamousPlace } from '../../../../types/famousPlaces';

// Dependências
✅ BaseGameMode (interface comum)
✅ Tipos específicos do modo
✅ Utilitários específicos do modo
⚠️ FamousPlace (tipo compartilhado)
```

### **Imports de useGameMode**
```typescript
// Arquivos importados
import { GameMode } from '../../types/famousPlaces';
import { useNeighborhoodGame } from './useNeighborhoodGame';
import { useFamousPlacesGame } from './useFamousPlacesGame';
import { NeighborhoodMode } from '../../components/game/modes/NeighborhoodMode';
import { FamousPlacesMode } from '../../components/game/modes/FamousPlacesMode';

// Dependências
⚠️ GameMode (tipo compartilhado)
⚠️ Ambos os hooks de modo
⚠️ Ambos os componentes de modo
```

## 🎮 LÓGICA DE ESTADO COMPARTILHADA

### **Estado Global**
**Arquivo**: `src/hooks/useGameState.ts`
**Problema**: Estado compartilhado entre modos
**Campos Compartilhados**:
- `score` (pontuação global)
- `roundNumber` (número da rodada)
- `gameMode` (modo ativo)
- `gameStarted` (jogo iniciado)

### **Estado Específico de Cada Modo**
**NeighborhoodMode**:
- `currentNeighborhood`
- `revealedNeighborhoods`
- `availableNeighborhoods`

**FamousPlacesMode**:
- `currentPlace`
- `roundPlaces`
- `usedPlaces`
- `currentRoundIndex`

## 🔄 FLUXO DE DADOS ENTRE MODOS

### **Fluxo Atual**
```
useGameMode (Hook Principal)
├── useNeighborhoodGame
│   ├── NeighborhoodMode
│   └── Utilitários Neighborhood
└── useFamousPlacesGame
    ├── FamousPlacesMode
    └── Utilitários FamousPlaces
```

### **Pontos de Acoplamento**
1. **Seleção de Modo**: `useGameMode` decide qual hook usar
2. **Estado Compartilhado**: Pontuação e rodadas são compartilhadas
3. **Configuração**: Configurações são passadas através do hook principal
4. **Eventos**: Cliques no mapa são roteados para o modo correto

## 📋 CHECKLIST DE DEPENDÊNCIAS

### **Dependências que DEVEM ser mantidas**
- [x] `BaseGameMode` (interface comum)
- [x] `ClickValidation` (tipo base)
- [x] `ScoreCalculation` (tipo base)
- [x] `GameModeInterface` (interface base)

### **Dependências que DEVEM ser isoladas**
- [ ] `useGameMode` (hook principal)
- [ ] `GameMode` (tipo compartilhado)
- [ ] `FamousPlace` (tipo compartilhado)
- [ ] Estado global compartilhado
- [ ] Lógica de roteamento de eventos

### **Dependências que DEVEM ser extraídas**
- [ ] Funções de cálculo de distância
- [ ] Funções de formatação de tempo
- [ ] Funções de validação genéricas
- [ ] Funções de pontuação base

## 🚨 RISCOS IDENTIFICADOS

### **Risco 1: Estado Compartilhado**
- **Descrição**: Pontuação e rodadas são compartilhadas entre modos
- **Impacto**: Mudança em um modo pode afetar o outro
- **Mitigação**: Criar estado isolado para cada modo

### **Risco 2: Hook Principal**
- **Descrição**: `useGameMode` gerencia ambos os modos
- **Impacto**: Mudanças em um modo podem quebrar o outro
- **Mitigação**: Criar sistema de carregamento dinâmico

### **Risco 3: Tipos Compartilhados**
- **Descrição**: `GameMode` e `FamousPlace` são usados por ambos
- **Impacto**: Mudanças nos tipos afetam ambos os modos
- **Mitigação**: Criar interfaces específicas para cada modo

## 🎯 PRÓXIMOS PASSOS

### **Etapa 2: Duplicação de Módulos**
1. Criar cópias dos arquivos existentes
2. Manter funcionamento atual intacto
3. Preparar para refatoração isolada

### **Etapa 3: Sistema de Carregamento**
1. Criar factory pattern para modos
2. Implementar carregamento dinâmico
3. Manter interface unificada

### **Etapa 4: Isolamento de Dependências**
1. Remover imports cruzados
2. Criar interfaces específicas
3. Isolar estado de cada modo

## ✅ CONCLUSÃO DA ETAPA 1

**Status**: ✅ CONCLUÍDA
**Próxima Etapa**: Duplicação de módulos para refatoração isolada

**Principais Descobertas**:
1. O projeto já possui boa separação de modos
2. Principais pontos de acoplamento estão no `useGameMode`
3. Estado compartilhado precisa ser isolado
4. Tipos compartilhados precisam ser específicos por modo

**Recomendação**: Proceder com a Etapa 2 conforme planejado. 