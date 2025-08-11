# 🎯 PLANO DE REFATORAÇÃO - SEPARAÇÃO DE MODOS DE JOGO

## 📋 RESUMO / OBJETIVO

**Objetivo Principal**: Refatorar o código atual do jogo que mistura as lógicas dos modos **Bairros** e **Lugares Famosos**, criando uma arquitetura onde cada modo tenha sua lógica **100% isolada e independente**, **SEM ALTERAR EM NADA** o funcionamento atual.

**Princípio Fundamental**: Esta refatoração será **incremental**, com **testes manuais a cada etapa**, e **totalmente reversível** através de branches e commits atômicos.

**Resultado Esperado**: Dois modos de jogo completamente independentes, com interfaces unificadas, mas implementações isoladas, facilitando manutenção e expansão futura.

---

## 🤖 PROMPT FINAL PARA O CURSOR

### **REGRAS OBRIGATÓRIAS DURANTE REFATORAÇÃO:**

1. **PRESERVAÇÃO TOTAL DE COMPORTAMENTO**: Nenhuma mudança visível para o usuário final
2. **COMMITS ATÔMICOS**: Cada etapa deve ser um commit isolado e testável
3. **BRANCHES POR ETAPA**: Criar branch específica para cada etapa da refatoração
4. **LOGS TEMPORÁRIOS**: Adicionar logs de debug temporários para validação
5. **ROLLBACK RÁPIDO**: Cada etapa deve permitir reversão imediata
6. **TESTES MANUAIS**: Validar funcionamento após cada mudança
7. **INTERFACES UNIFICADAS**: Manter contratos existentes durante transição

### **COMANDOS GIT OBRIGATÓRIOS:**
```bash
# Antes de cada etapa
git checkout -b refactor/etapa-X-separacao-modos
git add .
git commit -m "REFACTOR: Etapa X - [Descrição específica]"

# Após testes bem-sucedidos
git push origin refactor/etapa-X-separacao-modos

# Em caso de problemas
git checkout main
git branch -D refactor/etapa-X-separacao-modos
```

---

## ✅ PRÉ-REQUISITOS

### **Estado do Repositório**
- [ ] Repositório em estado estável (sem bugs conhecidos)
- [ ] Todos os testes passando
- [ ] Funcionamento dos dois modos validado manualmente

### **Criação de Baseline**
```bash
# Criar tag de baseline
git tag -a v1.0.0-baseline -m "Baseline antes da refatoração - modos funcionando"
git push origin v1.0.0-baseline
```

### **Ferramentas de Teste**
- [ ] Ambiente de desenvolvimento configurado
- [ ] Navegador com DevTools aberto
- [ ] Console de logs ativo
- [ ] Ferramentas de debug do React (React DevTools)

### **Backup e Segurança**
- [ ] Branch `main` protegida (não permitir push direto)
- [ ] Backup local do código atual
- [ ] Documentação do comportamento atual dos modos

---

## 🚀 PLANO DE ETAPAS

### **ETAPA 1: ANÁLISE E MAPEAMENTO DA LÓGICA ATUAL**

#### **Objetivo**
Mapear completamente como as lógicas dos dois modos estão entrelaçadas no código atual.

#### **Ações**
1. **Análise de Dependências Cruzadas**
   - Identificar imports compartilhados entre modos
   - Mapear funções utilitárias usadas por ambos
   - Documentar interfaces e tipos compartilhados

2. **Mapeamento de Estado Compartilhado**
   - Identificar variáveis de estado misturadas
   - Mapear callbacks e event handlers compartilhados
   - Documentar fluxo de dados entre modos

3. **Análise de Componentes Misturados**
   - Identificar componentes que renderizam ambos os modos
   - Mapear props e estados compartilhados
   - Documentar lógica condicional baseada no modo

#### **Comandos Git**
```bash
git checkout -b refactor/etapa-1-analise-mapeamento
# Fazer análise sem alterar código
git add docs/analise-dependencias.md
git commit -m "REFACTOR: Etapa 1 - Análise e mapeamento de dependências cruzadas"
```

#### **Checklist de Testes**
- [ ] Modo Bairros funciona normalmente
- [ ] Modo Lugares Famosos funciona normalmente
- [ ] Troca entre modos funciona
- [ ] Nenhum erro no console

#### **Instruções de Rollback**
```bash
git checkout main
git branch -D refactor/etapa-1-analise-mapeamento
```

---

### **ETAPA 2: CRIAÇÃO DE MÓDULOS SEPARADOS (CÓPIA)**

#### **Objetivo**
Criar cópias completas dos módulos existentes sem alterar o funcionamento atual.

#### **Ações**
1. **Duplicação de Arquivos de Modo**
   ```bash
   # Criar estrutura duplicada
   src/components/game/modes/
   ├── NeighborhoodMode/
   │   ├── NeighborhoodMode.tsx (cópia)
   │   ├── NeighborhoodMode-refactored.tsx (nova versão)
   │   └── index.ts
   └── FamousPlacesMode/
       ├── FamousPlacesMode.tsx (cópia)
       ├── FamousPlacesMode-refactored.tsx (nova versão)
       └── index.ts
   ```

2. **Duplicação de Hooks**
   ```bash
   src/hooks/modes/
   ├── useNeighborhoodGame.ts (cópia)
   ├── useNeighborhoodGame-refactored.ts (nova versão)
   ├── useFamousPlacesGame.ts (cópia)
   └── useFamousPlacesGame-refactored.ts (nova versão)
   ```

3. **Duplicação de Utilitários**
   ```bash
   src/utils/modes/
   ├── neighborhood/
   │   ├── validation.ts (cópia)
   │   ├── validation-refactored.ts (nova versão)
   │   ├── scoring.ts (cópia)
   │   └── scoring-refactored.ts (nova versão)
   └── famousPlaces/
       ├── validation.ts (cópia)
       ├── validation-refactored.ts (nova versão)
       ├── scoring.ts (cópia)
       └── scoring-refactored.ts (nova versão)
   ```

#### **Comandos Git**
```bash
git checkout -b refactor/etapa-2-duplicacao-modulos
# Duplicar arquivos
git add .
git commit -m "REFACTOR: Etapa 2 - Duplicação de módulos para refatoração isolada"
```

#### **Checklist de Testes**
- [ ] Modo Bairros funciona com arquivos originais
- [ ] Modo Lugares Famosos funciona com arquivos originais
- [ ] Nenhum erro de import ou dependência
- [ ] Console limpo de warnings

#### **Instruções de Rollback**
```bash
git checkout main
git branch -D refactor/etapa-2-duplicacao-modulos
```

---

### **ETAPA 3: PONTO DE ENTRADA CONTROLADO**

#### **Objetivo**
Criar um sistema de carregamento que permita alternar entre versões antigas e novas dos módulos.

#### **Ações**
1. **Criação de Configuração de Modo**
   ```typescript
   // src/config/gameModeConfig.ts
   export const GAME_MODE_CONFIG = {
     useRefactoredModules: false, // Flag para alternar entre versões
     neighborhood: {
       useRefactored: false,
       fallbackToOriginal: true
     },
     famousPlaces: {
       useRefactored: false,
       fallbackToOriginal: true
     }
   };
   ```

2. **Sistema de Carregamento Condicional**
   ```typescript
   // src/hooks/useGameModeLoader.ts
   export const useGameModeLoader = (mode: GameMode) => {
     const config = GAME_MODE_CONFIG[mode];
     
     if (config.useRefactored) {
       return importRefactoredModule(mode);
     } else {
       return importOriginalModule(mode);
     }
   };
   ```

3. **Integração no useGameMode**
   - Modificar `useGameMode.ts` para usar o loader
   - Manter interface existente
   - Adicionar logs de debug para rastrear qual versão está ativa

#### **Comandos Git**
```bash
git checkout -b refactor/etapa-3-ponto-entrada-controlado
# Implementar sistema de carregamento
git add .
git commit -m "REFACTOR: Etapa 3 - Sistema de carregamento controlado de módulos"
```

#### **Checklist de Testes**
- [ ] Configuração `useRefactoredModules: false` carrega versões originais
- [ ] Configuração `useRefactoredModules: true` carrega versões refatoradas
- [ ] Troca dinâmica entre versões funciona
- [ ] Logs de debug mostram qual versão está ativa

#### **Instruções de Rollback**
```bash
# Alterar configuração para false
git checkout main
git branch -D refactor/etapa-3-ponto-entrada-controlado
```

---

### **ETAPA 4: ISOLAMENTO DE DEPENDÊNCIAS CRUZADAS**

#### **Objetivo**
Remover todas as dependências compartilhadas entre os modos, criando interfaces limpas.

#### **Ações**
1. **Criação de Interfaces Base**
   ```typescript
   // src/types/modes/base.ts
   export interface BaseGameMode {
     startGame(): void;
     pauseGame(): void;
     resumeGame(): void;
     endGame(): void;
     handleMapClick(latlng: L.LatLng): void;
     updateTimer(timeLeft: number): void;
   }
   
   export interface BaseGameState {
     isActive: boolean;
     score: number;
     roundNumber: number;
     roundTimeLeft: number;
   }
   ```

2. **Implementação de Interfaces nos Modos**
   - Cada modo implementa `BaseGameMode`
   - Estados específicos estendem `BaseGameState`
   - Remoção de imports diretos entre modos

3. **Criação de Factory Pattern**
   ```typescript
   // src/factories/GameModeFactory.ts
   export class GameModeFactory {
     static createMode(mode: GameMode, config: any): BaseGameMode {
       switch (mode) {
         case 'neighborhoods':
           return new NeighborhoodMode(config);
         case 'famous_places':
           return new FamousPlacesMode(config);
         default:
           throw new Error(`Modo desconhecido: ${mode}`);
       }
     }
   }
   ```

#### **Comandos Git**
```bash
git checkout -b refactor/etapa-4-isolamento-dependencias
# Implementar isolamento
git add .
git commit -m "REFACTOR: Etapa 4 - Isolamento completo de dependências entre modos"
```

#### **Checklist de Testes**
- [ ] Modo Bairros funciona independentemente
- [ ] Modo Lugares Famosos funciona independentemente
- [ ] Nenhum import cruzado entre modos
- [ ] Interfaces base funcionam corretamente

#### **Instruções de Rollback**
```bash
git checkout main
git branch -D refactor/etapa-4-isolamento-dependencias
```

---

### **ETAPA 5: EXTRAÇÃO DE UTILITÁRIOS COMPARTILHADOS**

#### **Objetivo**
Identificar e extrair funções utilitárias que podem ser compartilhadas sem criar acoplamento.

#### **Ações**
1. **Análise de Utilitários**
   - Identificar funções matemáticas (cálculo de distância, etc.)
   - Identificar funções de formatação (tempo, pontuação, etc.)
   - Identificar funções de validação genéricas

2. **Criação de Utilitários Compartilhados**
   ```typescript
   // src/utils/shared/
   ├── math/
   │   ├── distance.ts
   │   ├── geometry.ts
   │   └── coordinates.ts
   ├── formatting/
   │   ├── time.ts
   │   ├── score.ts
   │   └── text.ts
   └── validation/
       ├── common.ts
       └── types.ts
   ```

3. **Refatoração dos Modos para Usar Utilitários**
   - Substituir implementações duplicadas
   - Manter interfaces específicas de cada modo
   - Adicionar logs para rastrear uso

#### **Comandos Git**
```bash
git checkout -b refactor/etapa-5-utilitarios-compartilhados
# Extrair utilitários
git add .
git commit -m "REFACTOR: Etapa 5 - Extração de utilitários compartilhados"
```

#### **Checklist de Testes**
- [ ] Utilitários compartilhados funcionam corretamente
- [ ] Modos usam utilitários sem acoplamento
- [ ] Nenhuma regressão de funcionalidade
- [ ] Performance mantida ou melhorada

#### **Instruções de Rollback**
```bash
git checkout main
git branch -D refactor/etapa-5-utilitarios-compartilhados
```

---

### **ETAPA 6: LIMPEZA E REMOÇÃO DO CÓDIGO ANTIGO**

#### **Objetivo**
Remover código duplicado e antigo, mantendo apenas as versões refatoradas.

#### **Ações**
1. **Validação Final**
   - Testar ambos os modos extensivamente
   - Validar todos os cenários de uso
   - Confirmar que não há regressões

2. **Remoção de Arquivos Antigos**
   ```bash
   # Remover arquivos duplicados
   rm src/components/game/modes/NeighborhoodMode/NeighborhoodMode.tsx
   rm src/components/game/modes/FamousPlacesMode/FamousPlacesMode.tsx
   rm src/hooks/modes/useNeighborhoodGame.ts
   rm src/hooks/modes/useFamousPlacesGame.ts
   # ... outros arquivos duplicados
   ```

3. **Renomeação de Arquivos Refatorados**
   ```bash
   # Renomear arquivos refatorados
   mv NeighborhoodMode-refactored.tsx NeighborhoodMode.tsx
   mv FamousPlacesMode-refactored.tsx FamousPlacesMode.tsx
   # ... outros arquivos
   ```

4. **Atualização de Imports**
   - Atualizar todos os imports para usar arquivos refatorados
   - Remover imports de arquivos removidos
   - Validar que não há imports quebrados

#### **Comandos Git**
```bash
git checkout -b refactor/etapa-6-limpeza-codigo-antigo
# Remover código duplicado
git add .
git commit -m "REFACTOR: Etapa 6 - Limpeza e remoção de código duplicado"
```

#### **Checklist de Testes**
- [ ] Todos os modos funcionam perfeitamente
- [ ] Nenhum arquivo duplicado
- [ ] Imports atualizados corretamente
- [ ] Build sem erros ou warnings

#### **Instruções de Rollback**
```bash
git checkout main
git branch -D refactor/etapa-6-limpeza-codigo-antigo
```

---

### **ETAPA 7: PR, REVISÃO E MERGE**

#### **Objetivo**
Finalizar a refatoração com revisão de código e merge seguro.

#### **Ações**
1. **Criação de Pull Request**
   - Descrição detalhada de todas as mudanças
   - Checklist de testes executados
   - Instruções para revisores

2. **Revisão de Código**
   - Revisar arquitetura final
   - Validar isolamento dos modos
   - Confirmar que não há regressões

3. **Merge e Deploy**
   - Merge apenas após aprovação completa
   - Deploy em ambiente de teste
   - Validação final em produção

#### **Comandos Git**
```bash
git checkout main
git merge refactor/etapa-6-limpeza-codigo-antigo
git tag -a v2.0.0-refatorado -m "Refatoração completa - modos isolados"
git push origin main
git push origin v2.0.0-refatorado
```

#### **Checklist de Testes**
- [ ] PR aprovado por pelo menos 2 revisores
- [ ] Todos os testes passando
- [ ] Deploy em produção bem-sucedido
- [ ] Funcionamento validado em produção

---

## 📋 CHECKLIST GERAL

### **Etapas Principais**
- [ ] **Etapa 1**: Análise e mapeamento da lógica atual
- [ ] **Etapa 2**: Criação de módulos separados (cópia)
- [ ] **Etapa 3**: Ponto de entrada controlado para carregar apenas o módulo do modo ativo
- [ ] **Etapa 4**: Isolamento de dependências cruzadas
- [ ] **Etapa 5**: Extração opcional de utilitários compartilhados
- [ ] **Etapa 6**: Limpeza e remoção do código antigo
- [ ] **Etapa 7**: PR, revisão e merge

### **Checklist de Testes para Cada Modo**
- [ ] **Modo Bairros**
  - [ ] Início do jogo
  - [ ] Clique em bairro correto
  - [ ] Clique em bairro incorreto
  - [ ] Avanço automático de rodada
  - [ ] Cálculo de pontuação
  - [ ] Feedback visual (DistanceCircle)
  - [ ] Timer de rodada
  - [ ] Fim do jogo

- [ ] **Modo Lugares Famosos**
  - [ ] Início do jogo
  - [ ] Seleção de lugar
  - [ ] Clique próximo ao lugar correto
  - [ ] Clique longe do lugar correto
  - [ ] Modal de confirmação
  - [ ] Cálculo de pontuação
  - [ ] Feedback visual (seta, círculo)
  - [ ] Avanço manual de rodada
  - [ ] Fim do jogo

- [ ] **Funcionalidades Compartilhadas**
  - [ ] Troca entre modos
  - [ ] Sistema de pontuação global
  - [ ] Controles de áudio
  - [ ] Configurações do jogo
  - [ ] Sistema de ranking

---

## 🧪 TESTES MANUAIS DETALHADOS

### **Teste do Modo Bairros**

#### **Cenário 1: Jogo Normal**
1. Selecionar modo "Bairros"
2. Clicar em "Iniciar Jogo"
3. Verificar se bairro aparece na tela
4. Clicar dentro do bairro correto
5. Verificar se pontuação aumenta
6. Verificar se rodada avança automaticamente
7. Repetir por 3-4 rodadas
8. Verificar se timer funciona (10 segundos)
9. Verificar se DistanceCircle aparece

#### **Cenário 2: Clique Incorreto**
1. Iniciar jogo no modo Bairros
2. Clicar fora do bairro correto
3. Verificar se pontuação não aumenta
4. Verificar se feedback negativo aparece
5. Verificar se rodada não avança

#### **Cenário 3: Fim do Jogo**
1. Jogar até completar todas as rodadas
2. Verificar se modal de fim de jogo aparece
3. Verificar se pontuação final está correta
4. Verificar se ranking é exibido

### **Teste do Modo Lugares Famosos**

#### **Cenário 1: Jogo Normal**
1. Selecionar modo "Lugares Famosos"
2. Clicar em "Iniciar Jogo"
3. Verificar se lugar aparece na tela
4. Clicar próximo ao lugar (≤100m)
5. Verificar se modal de confirmação aparece
6. Confirmar localização
7. Verificar se pontuação aumenta
8. Verificar se próximo lugar é selecionado

#### **Cenário 2: Clique Longe**
1. Iniciar jogo no modo Lugares Famosos
2. Clicar longe do lugar (>100m)
3. Verificar se feedback negativo aparece
4. Verificar se pontuação não aumenta
5. Verificar se lugar não muda

#### **Cenário 3: Navegação Manual**
1. Jogar algumas rodadas
2. Verificar se pode navegar entre lugares da rodada
3. Verificar se rodada avança manualmente
4. Verificar se lugares não se repetem na mesma rodada

### **Teste de Troca Entre Modos**
1. Jogar modo Bairros por algumas rodadas
2. Pausar jogo
3. Trocar para modo Lugares Famosos
4. Verificar se estado é resetado corretamente
5. Iniciar novo jogo
6. Verificar se funciona normalmente

---

## 💬 SUGESTÃO DE MENSAGENS DE COMMIT E NAMING DE BRANCHES

### **Padrão de Naming de Branches**
```
refactor/etapa-1-analise-mapeamento
refactor/etapa-2-duplicacao-modulos
refactor/etapa-3-ponto-entrada-controlado
refactor/etapa-4-isolamento-dependencias
refactor/etapa-5-utilitarios-compartilhados
refactor/etapa-6-limpeza-codigo-antigo
refactor/etapa-7-pr-revisao-merge
```

### **Padrão de Mensagens de Commit**
```
REFACTOR: Etapa X - [Descrição específica da mudança]

Exemplos:
REFACTOR: Etapa 1 - Análise e mapeamento de dependências cruzadas
REFACTOR: Etapa 2 - Duplicação de módulos para refatoração isolada
REFACTOR: Etapa 3 - Sistema de carregamento controlado de módulos
REFACTOR: Etapa 4 - Isolamento completo de dependências entre modos
REFACTOR: Etapa 5 - Extração de utilitários compartilhados
REFACTOR: Etapa 6 - Limpeza e remoção de código duplicado
```

### **Commits de Rollback (se necessário)**
```
REVERT: Etapa X - [Motivo do rollback]

Exemplos:
REVERT: Etapa 3 - Problemas de carregamento dinâmico
REVERT: Etapa 4 - Dependências não isoladas corretamente
```

---

## 📝 MODELO DE DESCRIÇÃO DE PR

### **Título do PR**
```
🚀 REFACTOR: Separação completa dos modos Bairros e Lugares Famosos
```

### **Descrição**
```markdown
## 🎯 Objetivo
Refatoração completa do código para separar as lógicas dos modos Bairros e Lugares Famosos, criando uma arquitetura onde cada modo tenha sua implementação isolada e independente.

## 🔄 Mudanças Realizadas
- [x] **Etapa 1**: Análise e mapeamento de dependências cruzadas
- [x] **Etapa 2**: Duplicação de módulos para refatoração isolada
- [x] **Etapa 3**: Sistema de carregamento controlado de módulos
- [x] **Etapa 4**: Isolamento completo de dependências entre modos
- [x] **Etapa 5**: Extração de utilitários compartilhados
- [x] **Etapa 6**: Limpeza e remoção de código duplicado

## 🧪 Testes Executados
- [x] Modo Bairros - todos os cenários funcionando
- [x] Modo Lugares Famosos - todos os cenários funcionando
- [x] Troca entre modos - funcionando corretamente
- [x] Funcionalidades compartilhadas - mantidas
- [x] Performance - mantida ou melhorada

## 📁 Arquivos Alterados
- `src/components/game/modes/` - Refatoração completa dos modos
- `src/hooks/modes/` - Hooks isolados por modo
- `src/utils/modes/` - Utilitários específicos de cada modo
- `src/types/modes/` - Tipos isolados por modo
- `src/factories/` - Factory pattern para criação de modos

## 🚨 Riscos e Mitigações
- **Risco**: Regressão de funcionalidade
  - **Mitigação**: Testes extensivos em cada etapa, commits atômicos
- **Risco**: Problemas de performance
  - **Mitigação**: Benchmarks antes/depois, otimizações incrementais

## ✅ Checklist de Revisão
- [ ] Código segue padrões do projeto
- [ ] Testes passando
- [ ] Funcionalidade preservada
- [ ] Performance mantida
- [ ] Documentação atualizada
- [ ] Logs de debug removidos

## 🔗 Links Relacionados
- Issue: #[Número da issue]
- Documentação: `planning.md`
- Baseline: `v1.0.0-baseline`
```

---

## ⚠️ RISCOS E MITIGAÇÃO

### **Principais Riscos Identificados**

#### **1. Regressões de Funcionalidade**
- **Risco**: Mudanças podem quebrar funcionalidades existentes
- **Mitigação**: 
  - Testes extensivos em cada etapa
  - Commits atômicos para rollback rápido
  - Validação manual de todos os cenários

#### **2. Conflitos de Merge**
- **Risco**: Múltiplas branches podem causar conflitos
- **Mitigação**:
  - Branches de vida curta
  - Merge frequente com main
  - Resolução de conflitos incremental

#### **3. Perda de Sincronização**
- **Risco**: Versões antigas e novas podem ficar dessincronizadas
- **Mitigação**:
  - Sistema de configuração para alternar versões
  - Logs de debug para rastrear qual versão está ativa
  - Validação de consistência em cada etapa

#### **4. Problemas de Performance**
- **Risco**: Refatoração pode introduzir overhead
- **Mitigação**:
  - Benchmarks antes/depois de cada etapa
  - Otimizações incrementais
  - Monitoramento de métricas de performance

### **Estratégias de Mitigação**

#### **Rollback Rápido**
```bash
# Em caso de problemas críticos
git checkout main
git reset --hard HEAD~1
git push --force origin main
```

#### **Testes Incrementais**
- Cada etapa deve ser testada independentemente
- Validação de que não há regressões
- Logs temporários para debug

#### **Documentação de Mudanças**
- Cada etapa deve ser documentada
- Mudanças devem ser rastreáveis
- Instruções de rollback claras

---

## 🔮 FOLLOW-UPS PÓS-MERGE

### **Tarefas Imediatas (1-2 semanas)**
- [ ] **Monitoramento de Produção**
  - Monitorar logs de erro
  - Verificar métricas de performance
  - Validar funcionamento em diferentes dispositivos

- [ ] **Limpeza de Código**
  - Remover logs de debug temporários
  - Otimizar imports não utilizados
  - Refatorar código duplicado restante

- [ ] **Documentação**
  - Atualizar README.md
  - Documentar nova arquitetura
  - Criar guias de desenvolvimento

### **Tarefas de Médio Prazo (1-2 meses)**
- [ ] **Expansão de Modos**
  - Preparar estrutura para novos modos de jogo
  - Criar templates para implementação rápida
  - Documentar processo de criação de modos

- [ ] **Otimizações**
  - Análise de performance
  - Lazy loading de módulos
  - Cache de dados compartilhados

- [ ] **Testes Automatizados**
  - Implementar testes unitários
  - Criar testes de integração
  - Configurar CI/CD

### **Tarefas de Longo Prazo (3-6 meses)**
- [ ] **Arquitetura de Plugins**
  - Sistema de modos carregáveis dinamicamente
  - API para desenvolvedores externos
  - Marketplace de modos de jogo

- [ ] **Escalabilidade**
  - Preparar para múltiplos jogadores
  - Sistema de modos online
  - Integração com backend

---

## 📚 RECURSOS ADICIONAIS

### **Documentação de Referência**
- [React Best Practices](https://react.dev/learn)
- [TypeScript Design Patterns](https://www.typescriptlang.org/docs/)
- [Git Workflow](https://git-scm.com/book/en/v2)

### **Ferramentas Recomendadas**
- **Debug**: React DevTools, Redux DevTools
- **Performance**: Lighthouse, React Profiler
- **Testes**: Jest, React Testing Library
- **Linting**: ESLint, Prettier

### **Contatos de Emergência**
- **Tech Lead**: [Nome e contato]
- **DevOps**: [Nome e contato]
- **QA**: [Nome e contato]

---

## 🎯 CONCLUSÃO

Este plano de refatoração foi projetado para ser **incremental**, **seguro** e **reversível**. Cada etapa é independente e pode ser validada individualmente, permitindo que a equipe execute a refatoração com confiança.

**Lembre-se**: A refatoração é um processo iterativo. Se algo não funcionar como esperado, sempre é possível voltar à etapa anterior e ajustar a abordagem.

**Boa sorte com a refatoração! 🚀** 