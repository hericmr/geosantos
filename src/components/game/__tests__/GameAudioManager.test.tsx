import React from 'react';
import { render } from '@testing-library/react';
import { GameAudioManager } from '../GameAudioManager';

// Mock do HTMLAudioElement
const mockAudioElement = {
  currentTime: 0,
  volume: 1,
  loop: false,
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

describe('GameAudioManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should play game start music when showPhaseOneMessage is true', () => {
    const gameStartAudioRef = { current: mockAudioElement as any };
    const gameState = {
      gameStarted: true,
      gameOver: false,
      isMuted: false,
      volume: 0.8
    };

    render(
      <GameAudioManager
        audioRef={{ current: null }}
        successSoundRef={{ current: null }}
        errorSoundRef={{ current: null }}
        gameStartAudioRef={gameStartAudioRef}
        gameState={gameState}
        showPhaseOneMessage={true}
      />
    );

    expect(mockAudioElement.currentTime).toBe(0);
    expect(mockAudioElement.volume).toBe(0.8);
    expect(mockAudioElement.play).toHaveBeenCalled();
  });

  it('should not play game start music when muted', () => {
    const gameStartAudioRef = { current: mockAudioElement as any };
    const gameState = {
      gameStarted: true,
      gameOver: false,
      isMuted: true,
      volume: 0.8
    };

    render(
      <GameAudioManager
        audioRef={{ current: null }}
        successSoundRef={{ current: null }}
        errorSoundRef={{ current: null }}
        gameStartAudioRef={gameStartAudioRef}
        gameState={gameState}
        showPhaseOneMessage={true}
      />
    );

    expect(mockAudioElement.play).not.toHaveBeenCalled();
  });

  it('should not play game start music when showPhaseOneMessage is false', () => {
    const gameStartAudioRef = { current: mockAudioElement as any };
    const gameState = {
      gameStarted: true,
      gameOver: false,
      isMuted: false,
      volume: 0.8
    };

    render(
      <GameAudioManager
        audioRef={{ current: null }}
        successSoundRef={{ current: null }}
        errorSoundRef={{ current: null }}
        gameStartAudioRef={gameStartAudioRef}
        gameState={gameState}
        showPhaseOneMessage={false}
      />
    );

    expect(mockAudioElement.play).not.toHaveBeenCalled();
  });

  it('should limit game start music volume to 0.8', () => {
    const gameStartAudioRef = { current: mockAudioElement as any };
    const gameState = {
      gameStarted: true,
      gameOver: false,
      isMuted: false,
      volume: 1.0
    };

    render(
      <GameAudioManager
        audioRef={{ current: null }}
        successSoundRef={{ current: null }}
        errorSoundRef={{ current: null }}
        gameStartAudioRef={gameStartAudioRef}
        gameState={gameState}
        showPhaseOneMessage={true}
      />
    );

    expect(mockAudioElement.volume).toBe(0.8);
  });
}); 