# 🏛️ PLANEJAMENTO: MODO LUGARES FAMOSOS DE SANTOS

## 📋 Visão Geral
Implementar um novo modo de jogo focado em lugares famosos e pontos turísticos de Santos, expandindo a experiência do jogo além dos bairros.

## 🎯 Objetivos
- Criar uma nova modalidade de jogo com lugares icônicos de Santos
- Expandir o conhecimento geográfico dos jogadores sobre pontos turísticos
- Manter a mesma mecânica de jogo (clique no mapa + pontuação por proximidade)
- Adicionar elementos visuais (imagens dos lugares)

## 🗄️ ESTRUTURA DO BANCO DE DADOS (SUPABASE)

### Tabela: `famous_places`
```sql
CREATE TABLE famous_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category VARCHAR(100), -- 'monumento', 'museu', 'praia', 'igreja', etc.
  address TEXT,
  image_url TEXT, -- URL da imagem no bucket
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_famous_places_location ON famous_places(latitude, longitude);
CREATE INDEX idx_famous_places_category ON famous_places(category);
```

### Bucket: `famous-places-images`
- Configurar bucket público para imagens
- Política de acesso: leitura pública, escrita apenas para usuários autenticados
- Estrutura de pastas: `/places/{place_id}/main.jpg`

## 📊 DADOS INICIAIS

### Lugares para inserir:
```json
[
  {
    "name": "Escultura 100 Anos da Imigração Japonesa",
    "description": "Monumento criado pela artista Tomie Ohtake em homenagem aos 100 anos da imigração japonesa no Brasil",
    "latitude": -23.9829486,
    "longitude": -46.3705368,
    "category": "monumento",
    "address": "Praça da Independência, Santos - SP"
  },
  {
    "name": "Monumento aos Andradas",
    "description": "Monumento em homenagem aos irmãos Andradas, importantes figuras da independência do Brasil",
    "latitude": -23.9735,
    "longitude": -46.3092,
    "category": "monumento",
    "address": "Praça Barão do Rio Branco, Santos - SP"
  },
  {
    "name": "Museu do Café",
    "description": "Museu histórico localizado no antigo Palácio da Bolsa Oficial de Café",
    "latitude": -23.9735,
    "longitude": -46.3092,
    "category": "museu",
    "address": "Rua XV de Novembro, 95, Santos - SP"
  },
  {
    "name": "Aquário Municipal",
    "description": "Um dos maiores aquários da América Latina",
    "latitude": -23.9735,
    "longitude": -46.3092,
    "category": "turismo",
    "address": "Av. Bartolomeu de Gusmão, s/n, Santos - SP"
  },
  {
    "name": "Orquidário Municipal",
    "description": "Jardim botânico com orquídeas e outras plantas exóticas",
    "latitude": -23.9735,
    "longitude": -46.3092,
    "category": "turismo",
    "address": "Praça Washington, s/n, Santos - SP"
  }
]
```

## 🎮 IMPLEMENTAÇÃO DO JOGO

### 1. Estrutura de Arquivos
```
src/
├── components/
│   ├── game/
│   │   ├── FamousPlacesManager.tsx
│   │   └── FamousPlaceMarker.tsx
│   └── ui/
│       ├── GameModeSelector.tsx
│       └── FamousPlaceInfo.tsx
├── hooks/
│   └── useFamousPlaces.ts
├── types/
│   └── famousPlaces.ts
└── utils/
    └── famousPlacesUtils.ts
```

### 2. Tipos TypeScript
```typescript
// src/types/famousPlaces.ts
export interface FamousPlace {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string;
  address: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FamousPlaceGameState {
  currentPlace: FamousPlace | null;
  places: FamousPlace[];
  isLoading: boolean;
  error: string | null;
}
```

### 3. Hook para Gerenciar Lugares
```typescript
// src/hooks/useFamousPlaces.ts
export const useFamousPlaces = () => {
  const [places, setPlaces] = useState<FamousPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from('famous_places')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPlaces(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomPlace = () => {
    if (places.length === 0) return null;
    return places[Math.floor(Math.random() * places.length)];
  };

  return { places, isLoading, error, fetchPlaces, getRandomPlace };
};
```

### 4. Componente de Seleção de Modo
```typescript
// src/components/ui/GameModeSelector.tsx
export const GameModeSelector: React.FC = () => {
  return (
    <div className="game-mode-selector">
      <button className="mode-btn neighborhoods">
        <MapIcon />
        <span>Bairros</span>
      </button>
      <button className="mode-btn famous-places">
        <LandmarkIcon />
        <span>Lugares Famosos</span>
      </button>
    </div>
  );
};
```

## 🎨 INTERFACE DO USUÁRIO

### 1. Tela de Seleção de Modo
- Botões para escolher entre "Bairros" e "Lugares Famosos"
- Preview de cada modo com ícones e descrições
- Manter design consistente com o tema atual

### 2. Modificações na StartScreen
- Adicionar seletor de modo de jogo
- Ajustar instruções baseado no modo selecionado
- Manter ranking separado por modo

### 3. Modificações no Jogo
- Mostrar imagem do lugar famoso quando disponível
- Exibir nome e descrição do lugar
- Manter mecânica de pontuação por proximidade

## 📊 SISTEMA DE PONTUAÇÃO

### Estrutura da Tabela de Ranking
```sql
-- Modificar tabela existente ou criar nova
ALTER TABLE game_scores ADD COLUMN game_mode VARCHAR(50) DEFAULT 'neighborhoods';
-- Ou criar nova tabela
CREATE TABLE famous_places_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  place_id UUID REFERENCES famous_places(id),
  distance_meters DECIMAL(10, 2),
  time_taken DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 TAREFAS DE IMPLEMENTAÇÃO

### Fase 1: Infraestrutura (1-2 dias)
- [ ] Criar tabela `famous_places` no Supabase
- [ ] Configurar bucket para imagens
- [ ] Inserir dados iniciais dos lugares
- [ ] Criar tipos TypeScript

### Fase 2: Backend e Hooks (2-3 dias)
- [ ] Implementar `useFamousPlaces` hook
- [ ] Criar funções utilitárias para lugares famosos
- [ ] Implementar sistema de pontuação
- [ ] Configurar upload de imagens

### Fase 3: Componentes UI (3-4 dias)
- [ ] Criar `GameModeSelector`
- [ ] Implementar `FamousPlacesManager`
- [ ] Criar `FamousPlaceMarker`
- [ ] Implementar `FamousPlaceInfo`

### Fase 4: Integração (2-3 dias)
- [ ] Integrar modo lugares famosos no jogo principal
- [ ] Modificar StartScreen para suportar seleção de modo
- [ ] Ajustar sistema de ranking
- [ ] Testes e refinamentos

### Fase 5: Polimento (1-2 dias)
- [ ] Otimizações de performance
- [ ] Ajustes de UI/UX
- [ ] Testes finais
- [ ] Documentação

## 🎯 CRITÉRIOS DE SUCESSO
- [ ] Jogadores podem alternar entre modos de jogo
- [ ] Sistema de pontuação funciona corretamente
- [ ] Imagens dos lugares são exibidas adequadamente
- [ ] Ranking separado por modo de jogo
- [ ] Performance mantida com novos dados
- [ ] Interface consistente com design atual

## 🔮 PRÓXIMOS PASSOS
1. Revisar e aprovar o planejamento
2. Configurar infraestrutura no Supabase
3. Começar implementação pela Fase 1
4. Coletar feedback durante desenvolvimento
5. Implementar melhorias baseadas em testes

## 📝 NOTAS ADICIONAIS
- Considerar adicionar mais categorias de lugares (restaurantes, shoppings, etc.)
- Implementar sistema de conquistas específicas para lugares famosos
- Adicionar informações históricas detalhadas
- Considerar integração com APIs de turismo locais 