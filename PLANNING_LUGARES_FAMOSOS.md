# Planejamento Metapista: Modo "Lugares Famosos" (Fase Local e Supabase)

## Princípios
- **Pequenas etapas:** Cada passo deve ser implementável e testável isoladamente.
- **Reversibilidade:** Cada etapa pode ser revertida facilmente (ex: via git revert).
- **Segurança:** Mudanças não quebram funcionalidades existentes; feature flags ou toggles quando possível.
- **Validação:** Critérios claros de “pronto” e testes para cada etapa.

---

## Fase 1: Implementação Local (Mock)

### Etapa 1: Definir tipos e contratos de dados
**Objetivo:** Criar a interface TypeScript `FamousPlace`.
**Passos:**
- Criar/atualizar `src/types/famousPlaces.ts` com a interface.
**Critério de pronto:** Interface criada, build passa.
**Reversão:** Remover/voltar o arquivo de tipos.

---

### Etapa 2: Criar dados locais mockados
**Objetivo:** Disponibilizar um array de lugares famosos localmente.
**Passos:**
- Criar `src/data/famousPlacesMock.ts` com pelo menos o monumento Tomiotake (imagem: `escultura.webp`).
**Critério de pronto:** Dados disponíveis para uso local.
**Reversão:** Remover arquivo de mock.

---

### Etapa 3: Criar hook useFamousPlaces para dados locais
**Objetivo:** Gerenciar estado dos lugares famosos usando mock.
**Passos:**
- Implementar hook em `src/hooks/useFamousPlaces.ts` consumindo o mock.
**Critério de pronto:** Hook retorna dados e seleciona lugar aleatório.
**Reversão:** Remover hook e testes.

---

### Etapa 4: Adicionar modo no seletor de jogo
**Objetivo:** Permitir seleção do modo "Lugares Famosos" na UI.
**Passos:**
- Adicionar opção no `GameModeSelector.tsx`.
**Critério de pronto:** Novo modo aparece, sem alterar lógica do jogo.
**Reversão:** Remover opção do seletor.

---

### Etapa 5: Gerenciar estado do modo de jogo
**Objetivo:** Adicionar campo `gameMode` ao estado global.
**Passos:**
- Atualizar `useGameState.ts` para incluir `gameMode`.
**Critério de pronto:** Estado pode ser lido/alterado.
**Reversão:** Remover campo e referências.

---

### Etapa 6: Integrar lógica de seleção de alvo usando dados locais
**Objetivo:** Usar hook para selecionar alvo quando modo "Lugares Famosos" estiver ativo.
**Passos:**
- Alterar lógica de seleção de alvo em `useGameState.ts`.
**Critério de pronto:** Modo bairros inalterado; modo lugares famosos seleciona alvo do mock.
**Reversão:** Restaurar lógica anterior.

---

### Etapa 7: Adaptar UI para exibir nome, categoria e imagem (usando escultura.webp)
**Objetivo:** Exibir informações do lugar famoso na UI.
**Passos:**
- Atualizar `Game.tsx` e/ou `GameControls.tsx`.
**Critério de pronto:** UI mostra corretamente informações do lugar famoso.
**Reversão:** Restaurar UI anterior.

---

### Etapa 8: Ajustar feedback e mensagens
**Objetivo:** Personalizar feedback para o novo modo.
**Passos:**
- Atualizar `FeedbackPanel.tsx` e mensagens relacionadas.
**Critério de pronto:** Mensagens refletem o contexto de lugares famosos.
**Reversão:** Restaurar mensagens anteriores.

---

### Etapa 9: Visualização no mapa com marcador local
**Objetivo:** Exibir marcador/ícone do lugar famoso no mapa.
**Passos:**
- Atualizar `Map.tsx` e/ou `FamousPlacesManager.tsx`.
**Critério de pronto:** Marcador aparece corretamente, sem afetar outros modos.
**Reversão:** Remover lógica de marcador.

---

### Etapa 10: Ajustar cálculo de distância e pontuação
**Objetivo:** Ajustar funções para considerar distâncias típicas de lugares famosos.
**Passos:**
- Revisar `calculateScore` em `gameUtils.ts`.
**Critério de pronto:** Pontuação faz sentido para ambos os modos.
**Reversão:** Restaurar funções anteriores.

---

### Etapa 11: Testes de integração com dados locais
**Objetivo:** Testar o fluxo completo do novo modo com mock.
**Passos:**
- Criar testes de integração para o modo "Lugares Famosos".
**Critério de pronto:** Todos os testes passam, fluxo validado.
**Reversão:** Desabilitar testes e feature flag do modo.

---

### Etapa 12: Deploy do modo local (sem Supabase)
**Objetivo:** Ativar modo para todos os usuários e publicar.
**Passos:**
- Rodar build e deploy.
**Critério de pronto:** Modo disponível em produção, sem regressões.
**Reversão:** Reverter deploy.

---

## Fase 2: Integração com Supabase

### Etapa 13: Implementar função de fetch do Supabase
**Objetivo:** Buscar lugares famosos do Supabase (sem ativar na UI).
**Passos:**
- Adicionar função em `src/lib/supabase.ts`.
**Critério de pronto:** Função retorna dados corretamente.
**Reversão:** Remover função e eventuais imports.

---

### Etapa 14: Alterar hook/useFamousPlaces para buscar do Supabase (feature flag)
**Objetivo:** Permitir alternar entre mock e Supabase.
**Passos:**
- Atualizar hook para buscar do Supabase se flag estiver ativa.
**Critério de pronto:** Hook funciona com ambas as fontes.
**Reversão:** Desativar flag ou restaurar hook.

---

### Etapa 15: Testes de integração com Supabase
**Objetivo:** Testar o fluxo completo do novo modo com Supabase.
**Passos:**
- Criar testes de integração para o modo "Lugares Famosos" com Supabase.
**Critério de pronto:** Todos os testes passam, fluxo validado.
**Reversão:** Desabilitar testes e feature flag do modo.

---

### Etapa 16: Deploy com Supabase ativado
**Objetivo:** Ativar modo Supabase para todos os usuários e publicar.
**Passos:**
- Remover feature flag (se usada).
- Rodar build e deploy.
**Critério de pronto:** Modo Supabase disponível em produção, sem regressões.
**Reversão:** Reverter deploy ou desabilitar feature flag.

---

## Observações Gerais
- **Feature Flags:** Use toggles para alternar entre mock e Supabase.
- **Commits Pequenos:** Faça commits atômicos e descritivos para facilitar rollback.
- **Testes:** Priorize testes automatizados em cada etapa.
- **Documentação:** Atualize README e comentários conforme avança.