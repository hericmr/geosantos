# Planejamento: Implementação do Modo de Jogo "Lugares Famosos"

## 1. Visão Geral do Novo Modo

O modo "Lugares Famosos" permitirá aos jogadores adivinhar a localização de pontos turísticos e históricos pré-definidos na cidade, em vez de bairros. A mecânica central de adivinhação no mapa e cálculo de pontuação por distância será mantida, mas adaptada para os novos alvos.

## 2. Integração de Dados (Supabase)

A tabela `famous_places` no Supabase já contém os dados necessários.

### Tarefas:
- **`src/types/famousPlaces.ts`**: Definir uma interface TypeScript para `FamousPlace` que corresponda à estrutura da tabela `famous_places` (id, name, description, latitude, longitude, category, address, image_url).
- **`src/lib/supabase.ts`**: Criar uma função para buscar uma lista de lugares famosos do Supabase.
- **`src/hooks/useFamousPlaces.ts`**: Desenvolver um hook para gerenciar o estado dos lugares famosos, incluindo a seleção de um lugar aleatório para cada rodada.

## 3. Modificações na UI/UX

### 3.1. Seleção de Modo de Jogo
- **`src/components/ui/GameModeSelector.tsx`**: Adicionar uma opção para selecionar "Lugares Famosos" como modo de jogo. Isso provavelmente envolverá a adição de um novo botão ou item de menu.

### 3.2. Exibição do Alvo
- **`src/components/ui/Game.tsx` / `src/components/ui/GameControls.tsx`**: O componente que exibe o nome do bairro (`game-target__name`) precisará ser adaptado para exibir o nome do lugar famoso e, opcionalmente, sua categoria ou uma breve descrição. **Além disso, uma imagem do lugar famoso (obtida do bucket `famous-places-images` do Supabase) deverá ser exibida junto ao nome.**
- **`src/components/ui/FeedbackPanel.tsx`**: Adaptar mensagens de feedback para o novo contexto (e.g., "Você acertou o [Nome do Lugar]!").

### 3.3. Marcadores e Visualização no Mapa
- **`src/components/Map.tsx` / `src/components/game/FamousPlacesManager.tsx`**:
    - Ao iniciar uma rodada no modo "Lugares Famosos", um marcador (ou ícone representativo) do lugar famoso deve ser exibido no mapa.
    - Após a adivinhação, a localização correta do lugar famoso deve ser claramente indicada, talvez com um ícone diferente ou um círculo de precisão.
    - Considerar a exibição de informações adicionais do lugar famoso (descrição, imagem) em um popup ou painel lateral após a adivinhação.

## 4. Lógica do Jogo

### 4.1. Gerenciamento de Estado
- **`src/hooks/useGameState.ts`**:
    - Adicionar um novo estado para o modo de jogo atual (e.g., `gameMode: 'neighborhoods' | 'famousPlaces'`).
    - Modificar a lógica de seleção de alvo para escolher entre bairros e lugares famosos com base no `gameMode`.
    - Ajustar a lógica de pontuação e cálculo de distância para usar as coordenadas do lugar famoso.

### 4.2. Fluxo da Rodada
- **`src/components/Game.tsx`**:
    - Adaptar o fluxo de início de rodada para o modo "Lugares Famosos":
        1. Selecionar um lugar famoso aleatório.
        2. Exibir o nome do lugar famoso.
        3. Aguardar a adivinhação do jogador.
        4. Calcular distância e pontuação.
        5. Exibir feedback e a localização correta.
        6. Transitar para a próxima rodada.

### 4.3. Cálculo de Distância e Pontuação
- **`src/utils/gameUtils.ts`**: A função `calculateDistance` pode ser reutilizada. A função `calculateScore` pode precisar de ajustes finos para o novo contexto de distâncias (lugares famosos podem estar mais distantes que bairros).

## 5. Testes

### 5.1. Testes Unitários
- **`src/hooks/__tests__/useFamousPlaces.test.ts`**: Testar a busca e seleção de lugares famosos.
- **`src/components/ui/__tests__/GameModeSelector.test.tsx`**: Testar a seleção do novo modo.
- **`src/utils/__tests__/gameUtils.test.ts`**: Se `calculateScore` for ajustado, testar a nova lógica.

### 5.2. Testes de Integração
- Testar o fluxo completo de uma rodada no modo "Lugares Famosos", garantindo que a UI, a lógica e a integração de dados funcionem corretamente.

## 6. Implantação

- Após a implementação e testes, o novo modo será incluído no processo de build e deploy existente (`npm run build` e `npm run deploy`).

## 7. Considerações Adicionais

- **Imagens dos Lugares Famosos**: Se `image_url` for preenchido no Supabase, considerar exibir essas imagens na UI para enriquecer a experiência.
- **Categorias**: Utilizar a `category` dos lugares famosos para futuras expansões (e.g., modos de jogo por categoria).
- **Internacionalização**: Se o jogo for expandido para outros idiomas, garantir que os nomes e descrições dos lugares famosos possam ser traduzidos.