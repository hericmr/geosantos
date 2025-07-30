import { useState, useEffect } from 'react';

const PLAYER_NAME_KEY = 'geosantos_player_name';

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



  // Inicializar nome se não existir
  const initializePlayerName = () => {
    if (!playerName) {
      return 'Seu nome';
    }
    return playerName;
  };

  return {
    playerName,
    savePlayerName,
    initializePlayerName
  };
}; 