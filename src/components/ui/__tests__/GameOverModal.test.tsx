import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameOverModal } from '../GameOverModal';
import { rankingService } from '../../../lib/supabase';

// Mock do rankingService
jest.mock('../../../lib/supabase', () => ({
  rankingService: {
    getTopPlayers: jest.fn(),
    addScore: jest.fn(),
    getPlayerPosition: jest.fn()
  }
}));

const mockRankingService = rankingService as jest.Mocked<typeof rankingService>;

describe('GameOverModal - Ranking Position', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onPlayAgain: jest.fn(),
    score: 5000,
    playTime: 120,
    roundsPlayed: 5,
    accuracy: 0.8,
    currentPlayerName: 'TestPlayer'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRankingService.getTopPlayers.mockResolvedValue([
      { player_name: 'Player1', score: 10000, play_time: 300, rounds_played: 10, accuracy: 0.9 },
      { player_name: 'Player2', score: 8000, play_time: 250, rounds_played: 8, accuracy: 0.8 },
      { player_name: 'Player3', score: 6000, play_time: 200, rounds_played: 6, accuracy: 0.7 }
    ]);
  });

  it('should show ranking position after successful submission', async () => {
    mockRankingService.addScore.mockResolvedValue(true);
    mockRankingService.getPlayerPosition.mockResolvedValue(5);

    render(<GameOverModal {...defaultProps} />);

    // Preencher nome e submeter
    const nameInput = screen.getByPlaceholderText('Seu nome');
    const submitButton = screen.getByText('SALVAR');
    
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(submitButton);

    // Aguardar submissão
    await waitFor(() => {
      expect(screen.getByText('PONTUAÇÃO SALVA COM SUCESSO!')).toBeInTheDocument();
    });

    // Aguardar exibição da posição no ranking
    await waitFor(() => {
      expect(screen.getByText('POSIÇÃO NO RANKING')).toBeInTheDocument();
      expect(screen.getByText('#5')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show correct ranking message for different positions', async () => {
    mockRankingService.addScore.mockResolvedValue(true);
    mockRankingService.getPlayerPosition.mockResolvedValue(1);

    render(<GameOverModal {...defaultProps} />);

    // Preencher nome e submeter
    const nameInput = screen.getByPlaceholderText('Seu nome');
    const submitButton = screen.getByText('SALVAR');
    
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(submitButton);

    // Aguardar exibição da posição no ranking
    await waitFor(() => {
      expect(screen.getByText('🏆 CAMPEÃO ABSOLUTO! 🏆')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show top 3 message for position 3', async () => {
    mockRankingService.addScore.mockResolvedValue(true);
    mockRankingService.getPlayerPosition.mockResolvedValue(3);

    render(<GameOverModal {...defaultProps} />);

    // Preencher nome e submeter
    const nameInput = screen.getByPlaceholderText('Seu nome');
    const submitButton = screen.getByText('SALVAR');
    
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(submitButton);

    // Aguardar exibição da posição no ranking
    await waitFor(() => {
      expect(screen.getByText('🥇 TOP 3 - LENDÁRIO! 🥇')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show top 10 message for position 8', async () => {
    mockRankingService.addScore.mockResolvedValue(true);
    mockRankingService.getPlayerPosition.mockResolvedValue(8);

    render(<GameOverModal {...defaultProps} />);

    // Preencher nome e submeter
    const nameInput = screen.getByPlaceholderText('Seu nome');
    const submitButton = screen.getByText('SALVAR');
    
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(submitButton);

    // Aguardar exibição da posição no ranking
    await waitFor(() => {
      expect(screen.getByText('🥈 TOP 10 - IMPRESSIONANTE! 🥈')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show general ranking message for position 25', async () => {
    mockRankingService.addScore.mockResolvedValue(true);
    mockRankingService.getPlayerPosition.mockResolvedValue(25);

    render(<GameOverModal {...defaultProps} />);

    // Preencher nome e submeter
    const nameInput = screen.getByPlaceholderText('Seu nome');
    const submitButton = screen.getByText('SALVAR');
    
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(submitButton);

    // Aguardar exibição da posição no ranking
    await waitFor(() => {
      expect(screen.getByText('🥉 TOP 50 - MUITO BOM! 🥉')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show general ranking message for position 100', async () => {
    mockRankingService.addScore.mockResolvedValue(true);
    mockRankingService.getPlayerPosition.mockResolvedValue(100);

    render(<GameOverModal {...defaultProps} />);

    // Preencher nome e submeter
    const nameInput = screen.getByPlaceholderText('Seu nome');
    const submitButton = screen.getByText('SALVAR');
    
    fireEvent.change(nameInput, { target: { value: 'TestPlayer' } });
    fireEvent.click(submitButton);

    // Aguardar exibição da posição no ranking
    await waitFor(() => {
      expect(screen.getByText('🎯 NO RANKING! 🎯')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
}); 