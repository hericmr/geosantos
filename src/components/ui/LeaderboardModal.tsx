import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  XIcon, 
  RefreshCwIcon,
  MedalIcon,
  ClockIcon,
  TargetIcon,
  UserIcon
} from './GameIcons';
import { rankingService, RankingEntry } from '../../lib/supabase';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerScore?: number;
  currentPlayerName?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentPlayerScore,
  currentPlayerName
}) => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);

  const loadRanking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const topPlayers = await rankingService.getTopPlayers(20);
      setRanking(topPlayers);
      
      // Buscar posição do jogador atual se tiver pontuação
      if (currentPlayerName && currentPlayerScore) {
        const position = await rankingService.getPlayerPosition(currentPlayerName, currentPlayerScore);
        setPlayerPosition(position);
      }
    } catch (err) {
      setError('Erro ao carregar ranking');
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRanking();
    }
  }, [isOpen]);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <MedalIcon size={20} color="#FFD700" />; // Ouro
      case 2:
        return <MedalIcon size={20} color="#C0C0C0" />; // Prata
      case 3:
        return <MedalIcon size={20} color="#CD7F32" />; // Bronze
      default:
        return <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>#{position}</span>;
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAccuracy = (accuracy: number): string => {
    return `${Math.round(accuracy * 100)}%`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '3px solid var(--text-primary)',
        borderRadius: '4px',
        padding: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        animation: 'modalSlideIn 0.3s ease-out'
      }}>
        <style>
          {`
            @keyframes modalSlideIn {
              0% {
                transform: scale(0.8) translateY(-20px);
                opacity: 0;
              }
              100% {
                transform: scale(1) translateY(0);
                opacity: 1;
              }
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            
            .loading { animation: pulse 1.5s ease-in-out infinite; }
          `}
        </style>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '2px solid var(--text-primary)',
          paddingBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <TrophyIcon size={24} color="var(--accent-yellow)" />
            <h2 style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              margin: 0,
              fontFamily: "'LaCartoonerie', sans-serif",
              color: 'var(--accent-green)',
              textTransform: 'uppercase'
            }}>
              RANKING GLOBAL
            </h2>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={loadRanking}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.5 : 1
              }}
            >
              <RefreshCwIcon size={20} color="var(--text-primary)" />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <XIcon size={20} color="var(--text-primary)" />
            </button>
          </div>
        </div>

        {/* Posição do jogador atual */}
        {currentPlayerScore && currentPlayerName && playerPosition && (
          <div style={{
            background: 'var(--accent-green)',
            border: '2px solid var(--text-primary)',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              margin: '0 0 8px 0',
              fontFamily: "'LaCartoonerie', sans-serif",
              color: 'var(--text-primary)',
              textTransform: 'uppercase'
            }}>
              SUA PONTUAÇÃO
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{
                fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                fontFamily: "'LaCartoonerie', sans-serif",
                color: 'var(--text-primary)',
                fontWeight: 'bold'
              }}>
                {currentPlayerScore.toLocaleString()} pts
              </div>
              <div style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
                fontFamily: "'LaCartoonerie', sans-serif",
                color: 'var(--text-primary)'
              }}>
                Posição #{playerPosition}
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontFamily: "'LaCartoonerie', sans-serif",
              color: 'var(--text-secondary)'
            }}>
              <RefreshCwIcon size={24} color="var(--text-secondary)" />
              Carregando ranking...
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontFamily: "'LaCartoonerie', sans-serif",
              color: 'var(--accent-red)',
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : (
            <>
              {/* Cabeçalho da tabela */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 120px 100px',
                gap: '8px',
                padding: '12px',
                background: 'var(--bg-primary)',
                border: '2px solid var(--text-primary)',
                borderRadius: '4px',
                marginBottom: '8px',
                fontFamily: "'LaCartoonerie', sans-serif",
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                color: 'var(--text-primary)',
                textTransform: 'uppercase'
              }}>
                <div>POS</div>
                <div>JOGADOR</div>
                <div>PONTOS</div>
                <div>RODADAS</div>
              </div>

              {/* Lista de jogadores */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {ranking.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                    fontFamily: "'LaCartoonerie', sans-serif",
                    color: 'var(--text-secondary)'
                  }}>
                    Nenhum jogador ainda!
                  </div>
                ) : (
                  ranking.map((player, index) => (
                    <div
                      key={player.id || index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 120px 100px',
                        gap: '8px',
                        padding: '8px 12px',
                        background: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                        border: '1px solid var(--text-primary)',
                        borderRadius: '2px',
                        alignItems: 'center',
                        fontFamily: "'LaCartoonerie', sans-serif",
                        fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getMedalIcon(index + 1)}
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {player.player_name}
                      </div>
                      <div style={{
                        fontWeight: 'bold',
                        color: 'var(--accent-green)'
                      }}>
                        {player.score.toLocaleString()}
                      </div>
                      <div>
                        {player.rounds_played}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '2px solid var(--text-primary)'
        }}>
          <p style={{
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            fontFamily: "'LaCartoonerie', sans-serif",
            color: 'var(--text-muted)',
            margin: 0,
            textAlign: 'center'
          }}>
            Top 20 jogadores • Atualizado em tempo real
          </p>
        </div>
      </div>
    </div>
  );
}; 