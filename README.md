# 🗺️ Geosantos - Jogo educativo de sobre a cidade

[![Deploy Status](https://img.shields.io/badge/status-online-brightgreen)](https://hericmr.github.io/geosantos/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green)](https://leafletjs.com/)

**🎮 Acesse o jogo:** https://hericmr.github.io/geosantos/

Um jogo educativo interativo para aprender sobre os bairros e lugares importantes de Santos, SP. Oferece uma experiência gamificada de aprendizado geográfico.

## 🎯 Sobre o Jogo

O Geosantos é um jogo de geografia que desafia os jogadores a localizar bairros e lugares famosos de Santos no mapa. Com dois modos de jogo distintos, sistema de pontuação dinâmico e ranking competitivo, o jogo torna o aprendizado geográfico divertido e envolvente.

### 🏠 Modo Bairros
- **Objetivo:** Localizar bairros específicos de Santos no mapa
- **Mecânica:** O jogo apresenta um bairro e você deve clicar onde acredita que ele está localizado
- **Pontuação:** Baseada na proximidade do clique (máximo 3000 pontos)
- **Bônus:** Tempo extra para acertos precisos

geosantos/
├── src/
│   ├── components/
│   │   ├── game/           # Componentes específicos do jogo
│   │   │   ├── DistanceCircle.tsx
│   │   │   ├── FamousPlacesManager.tsx
│   │   │   ├── GameAudioManager.tsx
│   │   │   ├── GeoJSONLayer.tsx
│   │   │   ├── MapEvents.tsx
│   │   │   └── NeighborhoodManager.tsx
│   │   ├── ui/             # Componentes de interface
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── AudioControls.tsx
│   │   │   ├── FeedbackPanel.tsx
│   │   │   ├── GameControls.tsx
│   │   │   ├── GameOverModal.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   └── StartScreen.tsx
│   │   ├── Game.tsx        # Componente principal do jogo
│   │   └── Map.tsx         # Componente do mapa
│   ├── hooks/              # Custom hooks
│   │   ├── useFamousPlaces.ts
│   │   ├── useGameState.ts
│   │   ├── useMapGame.ts
│   │   └── useMobileDetection.ts
│   ├── types/              # Definições TypeScript
│   │   ├── game.ts
│   │   └── famousPlaces.ts
│   ├── utils/              # Utilitários
│   │   ├── gameUtils.ts
│   │   └── gameConstants.ts
│   ├── constants/          # Constantes do jogo
│   │   └── game.ts
│   ├── lib/                # Configurações externas
│   │   └── supabase.ts
│   └── styles/             # Estilos globais
│       ├── modern-ui.css
│       └── pixel-art-ui.css
├── public/
│   ├── assets/             # Recursos estáticos
│   │   ├── audio/          # Efeitos sonoros
│   │   ├── images/         # Imagens e ícones
│   │   └── data/           # Dados GeoJSON
│   └── data/               # Dados dos bairros
└── docs/                   # Documentação
```

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/hericmr/geosantos.git
cd geosantos

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev
```

### Acesse o jogo
Abra seu navegador e acesse: `http://localhost:5173/geosantos/`

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run lint         # Verificar código
npm run deploy       # Deploy para GitHub Pages
```

## 🧪 Testes

O projeto inclui uma suíte completa de testes:

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com UI
npm run test:ui

# Cobertura de testes
npm run coverage
```

### Estrutura de Testes
- **Componentes:** Testes unitários para todos os componentes principais
- **Hooks:** Testes para custom hooks
- **Utilitários:** Testes para funções utilitárias
- **Integração:** Testes de fluxo do jogo

## 🎨 Características Técnicas

### Performance
- **Lazy Loading** de componentes
- **Memoização** de cálculos pesados
- **Otimização** de re-renders
- **Preload** de recursos críticos

### Acessibilidade
- **Navegação por teclado** completa
- **Screen reader** friendly
- **Contraste** adequado
- **Reduced motion** support

### Responsividade
- **Mobile-first** design
- **Touch-friendly** interface
- **Adaptive** layout
- **Cross-browser** compatibility

### Áudio
- **Efeitos sonoros** para feedback
- **Música de fundo** opcional
- **Controles de volume** independentes
- **Mute** global

## 📊 Sistema de Ranking

- **Persistência** via Supabase
- **Top players** global
- **Estatísticas** detalhadas
- **Posicionamento** em tempo real
- **Compartilhamento** de resultados

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Supabase Setup
1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Configure a tabela de ranking:
```sql
CREATE TABLE rankings (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  play_time INTEGER NOT NULL,
  rounds_played INTEGER NOT NULL,
  accuracy DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Modo multiplayer
- [ ] Mais cidades brasileiras
- [ ] Sistema de conquistas
- [ ] Modo história
- [ ] Integração com redes sociais

### Melhorias Técnicas
- [ ] PWA (Progressive Web App)
- [ ] Offline mode
- [ ] Cache inteligente
- [ ] Analytics avançado

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código
- **TypeScript** strict mode
- **ESLint** para linting
- **Prettier** para formatação
- **Conventional Commits** para mensagens

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Héric Moura**
- GitHub: [@hericmr](https://github.com/hericmr)
- LinkedIn: [Héric Moura](https://www.linkedin.com/in/heric-moura/)

## 🙏 Agradecimentos

- **Prefeitura de Santos** pelos dados geográficos
- **Comunidade React** pelo ecossistema incrível
- **Leaflet** pela biblioteca de mapas
- **Supabase** pela infraestrutura backend

---

**🎮 Divirta-se explorando Santos!** 🗺️
