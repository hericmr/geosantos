# Animação de Sprites - Substituição da bandeira2.png

## Visão Geral

Este projeto implementa uma animação de sprite que substitui a imagem estática da `bandeira2.png` no jogo GeoSantos. Em vez de mostrar uma imagem fixa quando o jogador clica no mapa, agora é exibida uma animação sequencial de 16 frames.

## Arquivos Criados/Modificados

### 1. Componente de Animação
- **`src/components/ui/SpriteAnimation.tsx`** - Componente React que renderiza a animação
- **`src/components/ui/SpriteAnimation.css`** - Estilos CSS para as animações

### 2. Página de Teste
- **`src/components/ui/SpriteTestPage.tsx`** - Página para testar a animação independentemente

### 3. Integração no Jogo
- **`src/components/Map.tsx`** - Modificado para usar a animação em vez da imagem estática

### 4. Rota de Teste
- **`src/App.tsx`** - Adicionada rota `/teste-sprites` para acessar a página de teste

## Como Funciona

### 1. Animação dos Sprites
- **16 frames sequenciais** numerados de 1.png a 16.png
- **Velocidade configurável** (padrão: 100ms entre frames)
- **Animação automática** quando o jogador clica no mapa
- **Auto-remoção** após a conclusão da animação

### 2. Integração no Jogo
- Substitui o marcador estático `bandeira2.png`
- Ativado quando `gameState.clickedPosition` muda
- Usa `L.DivIcon` do Leaflet para renderizar a animação
- Mantém a mesma posição e comportamento do marcador original

### 3. Sistema de URLs
- Usa a função utilitária `getImageUrl()` do projeto
- Compatível com diferentes ambientes (desenvolvimento, produção)
- Suporta o sistema de base URL configurado no Vite

## Como Usar

### 1. Testar a Animação
Acesse a rota `/teste-sprites` para ver a animação funcionando independentemente do jogo:

```bash
# No navegador
http://localhost:3000/geosantos/teste-sprites
```

### 2. No Jogo
A animação é ativada automaticamente sempre que o jogador clicar no mapa durante o jogo.

### 3. Personalização
- **Velocidade**: Ajuste o valor no slider da página de teste
- **Frames**: Substitua as imagens na pasta `public/assets/markerclick/`
- **Estilos**: Modifique o CSS em `SpriteAnimation.css`

## Estrutura dos Arquivos

```
public/assets/markerclick/
├── 1.png   # Frame inicial
├── 2.png   # Segundo frame
├── 3.png   # Terceiro frame
...
├── 15.png  # Penúltimo frame
└── 16.png  # Frame final
```

## Configuração Técnica

### 1. Vite
- **Base URL**: `/geosantos/` (configurado em `vite.config.ts`)
- **Public Dir**: `public/` (padrão)
- **Assets**: Processados automaticamente

### 2. TypeScript
- **JSX**: `react-jsx` (configurado em `tsconfig.app.json`)
- **Strict Mode**: Habilitado
- **Module Resolution**: `bundler`

### 3. React
- **Version**: Compatível com React 18+
- **Hooks**: Usa `useState` e `useEffect`
- **CSS Modules**: Suportado

## Benefícios da Implementação

### 1. Experiência do Usuário
- **Feedback visual mais rico** em vez de imagem estática
- **Animação suave** que chama atenção para o clique
- **Consistência visual** com o estilo do jogo

### 2. Manutenibilidade
- **Código modular** e reutilizável
- **Separação de responsabilidades** (lógica vs. apresentação)
- **Fácil personalização** de estilos e comportamento

### 3. Performance
- **Lazy loading** dos frames
- **Auto-remoção** após animação
- **Otimização** para diferentes dispositivos

## Troubleshooting

### 1. Sprites não aparecem
- Verifique se as imagens estão na pasta correta
- Confirme se o caminho está correto em `getImageUrl()`
- Verifique o console do navegador para erros

### 2. Animação muito rápida/lenta
- Ajuste o valor no slider da página de teste
- Modifique o valor no `setTimeout` do `useEffect`

### 3. Problemas de posicionamento
- Verifique se o `iconAnchor` está configurado corretamente
- Confirme se o `iconSize` está adequado

## Próximos Passos

### 1. Melhorias Possíveis
- **Sons de animação** para cada frame
- **Efeitos de partículas** durante a animação
- **Diferentes animações** para diferentes tipos de clique

### 2. Otimizações
- **Sprite sheet** para reduzir requisições HTTP
- **WebP** para melhor compressão
- **Lazy loading** inteligente dos frames

### 3. Integração
- **Modo de teste** integrado ao jogo
- **Configurações** salvas no localStorage
- **Animações personalizáveis** por usuário

## Conclusão

A implementação da animação de sprites representa uma melhoria significativa na experiência do usuário do jogo GeoSantos. Substituindo a imagem estática por uma animação fluida e atrativa, o jogo se torna mais envolvente e moderno, mantendo a compatibilidade com a arquitetura existente. 