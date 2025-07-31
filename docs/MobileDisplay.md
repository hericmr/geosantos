# MobileDisplay Component

## Visão Geral

O componente `MobileDisplay` é uma interface responsiva exclusiva para dispositivos mobile do jogo Geosantos. Ele substitui a interface padrão do jogo quando detectado um dispositivo mobile, exibindo uma mensagem informativa sobre o status de desenvolvimento e funcionalidades limitadas.

## Características

### 🎯 Funcionalidades Principais

- **Detecção Automática de Mobile**: Utiliza o hook `useMobileDetection` para identificar dispositivos mobile
- **Interface Responsiva**: Layout adaptável para diferentes tamanhos de tela
- **Animação de Fundo**: Utiliza a imagem `bg.png` como background animado
- **Mensagem Informativa**: Comunica claramente o status de desenvolvimento
- **Navegação para Lugares Famosos**: Botão para acessar a wiki de lugares famosos

### 📱 Elementos da Interface

1. **Header com Logo**
   - Título "GEOSANTOS" com animação de entrada
   - Subtítulo "Jogo de Geografia"

2. **Mensagem de Desenvolvimento**
   - Ícone de construção (Construction) da Lucide animado
   - Título "Em Desenvolvimento"
   - Texto explicativo sobre o status atual
   - Ícone de monitor indicando necessidade de computador
   - Agradecimento pela visita

3. **Botões de Ação**
   - Botão "Lugares Famosos" com ícone



## Uso

### Integração no App.tsx

```tsx
import { MobileDisplay } from './components/ui/MobileDisplay';
import { useMobileDetection } from './hooks/useMobileDetection';

function App() {
  const isMobile = useMobileDetection();

  if (isMobile) {
    return (
      <BrowserRouter basename="/geosantos">
        <Routes>
          <Route path="/" element={<MobileDisplay />} />
          {/* outras rotas */}
        </Routes>
      </BrowserRouter>
    );
  }

  // Interface normal para desktop
  return (
    // ... interface desktop
  );
}
```

### Props

```tsx
interface MobileDisplayProps {
  onClose?: () => void; // Função opcional para fechar o componente
}
```

## Responsividade

### Breakpoints
- **Mobile**: ≤ 768px de largura
- **Desktop**: > 768px de largura

### Ajustes Mobile
- Fontes responsivas usando `clamp()`
- Padding e margens adaptáveis
- Altura máxima do ranking limitada
- Scroll automático quando necessário

## Animações

### CSS Animations
- `bounceIn`: Animação de entrada do título
- `slideInUp`: Animação de entrada dos elementos
- `pulse`: Animação contínua do background e emoji

### Timing
- Entrada do título: 0s
- Mensagem de desenvolvimento: 0.3s
- Botões de ação: 0.6s
- Ranking: 0.9s

## Acessibilidade

### Recursos
- Suporte a `prefers-reduced-motion`
- Contraste adequado para textos
- Navegação por teclado
- Roles semânticos apropriados

### Melhorias Mobile
- Touch targets adequados (mínimo 44px)
- Scroll suave
- Indicadores visuais claros

## Dependências

### Componentes
- `FamousPlacesWiki`: Para navegação aos lugares famosos

### Hooks
- `useMobileDetection`: Para detecção de dispositivos mobile

### Bibliotecas
- `lucide-react`: Para ícones
- `react`: Para funcionalidades básicas

## Testes

### Cobertura
- Renderização dos elementos principais
- Funcionalidade dos botões
- Navegação entre telas
- Responsividade
- Acessibilidade

### Execução
```bash
npm test -- --testPathPattern="MobileDisplay"
```

## Estilo

### Variáveis CSS Utilizadas
- `--bg-primary`: Cor de fundo principal
- `--bg-secondary`: Cor de fundo secundária
- `--accent-green`: Cor de destaque verde
- `--accent-yellow`: Cor de destaque amarela
- `--text-primary`: Cor do texto principal
- `--text-secondary`: Cor do texto secundário

### Fonte
- `LaCartoonerie`: Fonte principal do jogo
- Fallback para `cursive` quando não disponível

## Limitações

### Mobile
- Interface limitada comparada ao desktop
- Funcionalidades do jogo não disponíveis
- Foco em informação e navegação básica

### Desktop
- Componente não é exibido
- Interface normal do jogo mantida

## Futuras Melhorias

### Possíveis Adições
- [ ] PWA (Progressive Web App) support
- [ ] Notificações push
- [ ] Modo offline
- [ ] Mais funcionalidades mobile
- [ ] Integração com redes sociais

### Otimizações
- [ ] Lazy loading de componentes
- [ ] Cache de imagens
- [ ] Performance mobile
- [ ] Analytics mobile 