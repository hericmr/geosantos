import React, { useEffect } from 'react';

interface GameState {
  gameStarted: boolean;
  gameOver: boolean;
  isMuted: boolean;
  volume: number;
}

interface GameAudioManagerProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  successSoundRef: React.RefObject<HTMLAudioElement>;
  errorSoundRef: React.RefObject<HTMLAudioElement>;
  gameState: GameState;
  playSuccess?: boolean;
  playError?: boolean;
}

export const GameAudioManager: React.FC<GameAudioManagerProps> = ({
  audioRef,
  successSoundRef,
  errorSoundRef,
  gameState,
  playSuccess,
  playError
}) => {
  // Gerencia o volume da música de fundo
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = gameState.isMuted ? 0 : gameState.volume;
      audioRef.current.loop = true;
    }
  }, [gameState.volume, gameState.isMuted]);

  // Gerencia o play/pause da música de fundo baseado no estado do jogo
  useEffect(() => {
    if (audioRef.current) {
      if (gameState.gameStarted && !gameState.gameOver) {
        audioRef.current.play();
      } else if (gameState.gameOver) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [gameState.gameStarted, gameState.gameOver]);

  // Gerencia o som de sucesso
  useEffect(() => {
    if (playSuccess && successSoundRef.current) {
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play();
    }
  }, [playSuccess]);

  // Gerencia o som de erro
  useEffect(() => {
    if (playError && errorSoundRef.current) {
      errorSoundRef.current.currentTime = 0;
      errorSoundRef.current.play();
    }
  }, [playError]);

  return null;
}; 