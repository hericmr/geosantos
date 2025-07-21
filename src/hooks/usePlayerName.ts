import { useState, useEffect } from 'react';

const PLAYER_NAME_KEY = 'jogocaicara_player_name';

export const usePlayerName = () => {
  const [playerName, setPlayerName] = useState<string>('');

  // Carregar nome do jogador do localStorage
  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  // Salvar nome do jogador no localStorage
  const savePlayerName = (name: string) => {
    const trimmedName = name.trim();
    if (trimmedName) {
      localStorage.setItem(PLAYER_NAME_KEY, trimmedName);
      setPlayerName(trimmedName);
    }
  };

  // Gerar nome aleatório se não houver nome salvo
  const generateRandomName = () => {
    const adjectives = [
      'Veloz', 'Sábio', 'Destemido', 'Astuto', 'Valente', 'Esperto',
      'Corajoso', 'Intrépido', 'Perspicaz', 'Audaz', 'Hábil', 'Vigoroso'
    ];
    
    const nouns = [
      'Caiçara', 'Navegador', 'Explorador', 'Aventureiro', 'Guerreiro',
      'Mestre', 'Campeão', 'Herói', 'Líder', 'Estrategista', 'Vencedor'
    ];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;

    const generatedName = `${randomAdjective} ${randomNoun} ${randomNumber}`;
    savePlayerName(generatedName);
    return generatedName;
  };

  // Inicializar nome se não existir
  const initializePlayerName = () => {
    if (!playerName) {
      return generateRandomName();
    }
    return playerName;
  };

  return {
    playerName,
    savePlayerName,
    generateRandomName,
    initializePlayerName
  };
}; 