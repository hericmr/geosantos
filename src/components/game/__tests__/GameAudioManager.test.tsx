import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { GameAudioManager } from '../GameAudioManager';

describe('GameAudioManager', () => {
  const mockAudioRef = { current: { play: vi.fn(), pause: vi.fn(), volume: 0 } };
  const mockSuccessSoundRef = { current: { play: vi.fn(), currentTime: 0 } };
  const mockErrorSoundRef = { current: { play: vi.fn(), currentTime: 0 } };
  
  const mockGameState = {
    gameStarted: false,
    gameOver: false,
    isMuted: false,
    volume: 0.5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update background music volume when volume changes', () => {
    render(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={mockGameState}
      />
    );

    expect(mockAudioRef.current.volume).toBe(mockGameState.volume);
  });

  it('should mute background music when isMuted is true', () => {
    render(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={{
          ...mockGameState,
          isMuted: true
        }}
      />
    );

    expect(mockAudioRef.current.volume).toBe(0);
  });

  it('should play background music when game starts', () => {
    render(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={{
          ...mockGameState,
          gameStarted: true
        }}
      />
    );

    expect(mockAudioRef.current.play).toHaveBeenCalled();
  });

  it('should pause background music when game is over', () => {
    render(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={{
          ...mockGameState,
          gameOver: true
        }}
      />
    );

    expect(mockAudioRef.current.pause).toHaveBeenCalled();
  });

  it('should play success sound when playSuccess is called', () => {
    const { rerender } = render(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={mockGameState}
        playSuccess={true}
      />
    );

    expect(mockSuccessSoundRef.current.play).toHaveBeenCalled();
    expect(mockSuccessSoundRef.current.currentTime).toBe(0);

    // Reset playSuccess
    rerender(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={mockGameState}
        playSuccess={false}
      />
    );
  });

  it('should play error sound when playError is called', () => {
    const { rerender } = render(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={mockGameState}
        playError={true}
      />
    );

    expect(mockErrorSoundRef.current.play).toHaveBeenCalled();
    expect(mockErrorSoundRef.current.currentTime).toBe(0);

    // Reset playError
    rerender(
      <GameAudioManager
        audioRef={mockAudioRef as any}
        successSoundRef={mockSuccessSoundRef as any}
        errorSoundRef={mockErrorSoundRef as any}
        gameState={mockGameState}
        playError={false}
      />
    );
  });
}); 