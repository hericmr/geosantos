# GameOverModal - Posição no Ranking (Estilo Mortal Kombat)

## 🎯 Objetivo
Mostrar a posição do jogador no ranking global após salvar a pontuação, com visual inspirado no estilo Mortal Kombat.

## ✨ Funcionalidades

### 1. **Busca da Posição no Ranking**
- Após salvar a pontuação com sucesso, o sistema busca automaticamente a posição do jogador
- A posição é calculada baseada na pontuação do jogador em relação aos outros jogadores
- Delay de 1 segundo para criar suspense

### 2. **Visual Estilo Mortal Kombat**
- **Gradiente dourado**: `linear-gradient(135deg, #FFD700, #FFA500)`
- **Borda laranja**: `3px solid #FF4500`
- **Efeito de brilho**: `box-shadow` com animação `rankingGlow`
- **Animação de pulso**: `rankingPulse` para chamar atenção

### 3. **Mensagens Dinâmicas**
Baseadas na posição do jogador:

| Posição | Mensagem | Emoji |
|---------|----------|-------|
| 1 | 🏆 CAMPEÃO ABSOLUTO! 🏆 | 🏆 |
| 2-3 | 🥇 TOP 3 - LENDÁRIO! 🥇 | 🥇 |
| 4-10 | 🥈 TOP 10 - IMPRESSIONANTE! 🥈 | 🥈 |
| 11-50 | 🥉 TOP 50 - MUITO BOM! 🥉 | 🥉 |
| 51+ | 🎯 NO RANKING! 🎯 | 🎯 |

### 4. **Animações CSS**
```css
@keyframes rankingGlow {
  0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
  100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
}

@keyframes rankingPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

## 🔧 Implementação

### 1. **Serviço de Ranking Atualizado**
```typescript
// src/lib/supabase.ts
async getPlayerPosition(playerName: string, playerScore: number): Promise<number> {
  const { data, error } = await supabase
    .from('ranking')
    .select('score')
    .order('score', { ascending: false });

  if (error) {
    console.error('Erro ao buscar posição:', error);
    return -1;
  }

  // Encontrar a posição baseada na pontuação
  const position = data?.findIndex(entry => entry.score <= playerScore) + 1;
  return position > 0 ? position : (data?.length || 0) + 1;
}
```

### 2. **GameOverModal Atualizado**
```typescript
// Estados adicionais
const [playerPosition, setPlayerPosition] = useState<number | null>(null);
const [showRankingPosition, setShowRankingPosition] = useState(false);

// Função para buscar posição
const fetchPlayerPosition = async () => {
  try {
    const position = await rankingService.getPlayerPosition(playerName, score);
    setPlayerPosition(position);
    setShowRankingPosition(true);
  } catch (err) {
    console.error("Erro ao buscar posição do jogador:", err);
  }
};

// Chamada após salvar pontuação
setTimeout(() => {
  fetchPlayerPosition();
}, 1000);
```

### 3. **Componente de Posição**
```tsx
{showRankingPosition && playerPosition && (
  <div style={{
    textAlign: 'center',
    marginBottom: '24px',
    padding: '20px',
    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
    border: '3px solid #FF4500',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
    animation: 'rankingGlow 2s ease-in-out infinite alternate'
  }}>
    <div style={{
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontFamily: "'Press Start 2P', monospace",
      color: '#FF4500',
      textTransform: 'uppercase',
      textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)',
      marginBottom: '12px',
      animation: 'rankingPulse 1.5s ease-in-out infinite'
    }}>
      POSIÇÃO NO RANKING
    </div>
    
    <div style={{
      fontSize: 'clamp(3rem, 8vw, 5rem)',
      fontFamily: "'Press Start 2P', monospace",
      color: '#FF4500',
      fontWeight: 'bold',
      textShadow: '4px 4px 0px rgba(0, 0, 0, 0.8)',
      marginBottom: '8px',
      animation: 'rankingPulse 1.5s ease-in-out infinite'
    }}>
      #{playerPosition}
    </div>
    
    <div style={{
      fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
      fontFamily: "'VT323', monospace",
      color: '#8B0000',
      fontWeight: 'bold',
      textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
    }}>
      {getRankingMessage(playerPosition)}
    </div>
  </div>
)}
```

## 🧪 Testes

### Testes Implementados
1. **Exibição da posição**: Verifica se a posição aparece após submissão
2. **Mensagens corretas**: Testa diferentes posições (1, 3, 8, 25, 100)
3. **Animações**: Verifica se as animações estão funcionando
4. **Responsividade**: Testa em diferentes tamanhos de tela

### Exemplo de Teste
```typescript
it('should show ranking position after successful submission', async () => {
  mockRankingService.addScore.mockResolvedValue(true);
  mockRankingService.getPlayerPosition.mockResolvedValue(5);

  render(<GameOverModal {...defaultProps} />);

  // Preencher nome e submeter
  const nameInput = screen.getByPlaceholderText('Seu nome');
  const submitButton = screen.getByText('SALVAR');
  
  fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
  fireEvent.click(submitButton);

  // Aguardar exibição da posição no ranking
  await waitFor(() => {
    expect(screen.getByText('POSIÇÃO NO RANKING')).toBeInTheDocument();
    expect(screen.getByText('#5')).toBeInTheDocument();
  }, { timeout: 3000 });
});
```

## 🎨 Design

### Cores Utilizadas
- **Dourado**: `#FFD700` (gradiente)
- **Laranja**: `#FFA500` (gradiente)
- **Vermelho escuro**: `#FF4500` (borda e texto)
- **Vermelho sangue**: `#8B0000` (texto secundário)

### Fontes
- **Título**: `'Press Start 2P', monospace` (estilo pixel art)
- **Posição**: `'Press Start 2P', monospace` (grande e impactante)
- **Mensagem**: `'VT323', monospace` (estilo retro)

### Efeitos Visuais
- **Brilho pulsante**: Animação contínua
- **Escala pulsante**: Efeito de "respiração"
- **Sombras**: Profundidade e legibilidade
- **Gradiente**: Visual premium

## 🚀 Resultado

A funcionalidade cria uma experiência épica similar ao Mortal Kombat, onde o jogador vê sua posição no ranking com:
- **Visual impactante** com cores vibrantes
- **Animações suaves** que chamam atenção
- **Mensagens motivacionais** baseadas na posição
- **Feedback imediato** sobre o desempenho
- **Sensação de conquista** ao ver a posição no ranking

A implementação mantém a consistência com o tema pixel art do jogo enquanto adiciona um toque épico ao momento de Game Over. 