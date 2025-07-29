import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface RankingPlayer {
  id: number;
  player_name: string;
  score: number;
  play_time: number;
  rounds_played: number;
  accuracy: number;
  created_at: string;
}

interface GameRankingProps {
  variant?: 'game' | 'startScreen';
}

export const GameRanking: React.FC<GameRankingProps> = ({
  variant = 'game'
}) => {
  const [ranking, setRanking] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ranking')
        .select('*')
        .order('score', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Erro ao buscar ranking:', error);
        return;
      }

      setRanking(data || []);
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAccuracy = (accuracy: number): string => {
    return `${Math.round(accuracy * 100)}%`;
  };

  const getMedalIcon = (position: number): string => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getContainerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontFamily: "'LaCartoonerie', sans-serif",
      transition: 'none',
      pointerEvents: 'auto',
    };

    if (variant === 'startScreen') {
      if (isMobile) {
        return {
          ...baseStyle,
          position: 'relative',
          width: '100%',
          marginBottom: '20px',
          border: '4px solid var(--accent-yellow)',
          borderRadius: '12px',
          background: 'rgba(30, 30, 30, 0.98)',
        };
      }
      // Desktop
      return {
        ...baseStyle,
        position: 'fixed',
        bottom: '40px',
        left: '40px',
        zIndex: 2002,
        minWidth: '340px',
        maxWidth: '400px',
        boxShadow: 'var(--shadow-md)',
        border: '3px solid var(--text-primary)',
        borderRadius: '4px',
        background: 'var(--bg-secondary)',
      };
    }

    // Game variant
    return {
      ...baseStyle,
      position: 'fixed',
      top: '20px',
      left: '20px',
      zIndex: 1001,
    };
  };

  return (
    <div style={getContainerStyle()}>


      <div className="ranking-container" style={{
        background: variant === 'startScreen' ? 'transparent' : 'var(--bg-secondary)',
        border: variant === 'startScreen' ? 'none' : '2px solid var(--text-primary)',
        borderRadius: variant === 'startScreen' ? '0' : '4px',
        boxShadow: variant === 'startScreen' ? 'none' : 'var(--shadow-md)',
        overflow: 'hidden',
        minWidth: isExpanded ? (variant === 'startScreen' ? '340px' : '280px') : (variant === 'startScreen' ? '340px' : '200px'),
        maxWidth: isExpanded ? (variant === 'startScreen' ? '400px' : '320px') : (variant === 'startScreen' ? '400px' : '220px')
      }}>
        {/* Header */}
        <div 
          className="ranking-header"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: variant === 'startScreen' ? 'var(--bg-secondary)' : 'var(--accent-green)',
            color: 'var(--text-primary)',
            padding: variant === 'startScreen' ? '16px 24px' : '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: variant === 'startScreen' ? 'column' : 'row',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: variant === 'startScreen' ? '1.7rem' : '1.1rem',
            textShadow: 'none',
            borderTopLeftRadius: variant === 'startScreen' ? '4px' : '0',
            borderTopRightRadius: variant === 'startScreen' ? '4px' : '0',
            letterSpacing: '1px',
            boxShadow: variant === 'startScreen' ? 'var(--shadow-md)' : 'none',
            border: variant === 'startScreen' ? '3px solid var(--text-primary)' : 'none'
          }}
        >
          <span style={{
            fontSize: variant === 'startScreen' ? '2.1rem' : '1.2rem',
            marginBottom: variant === 'startScreen' ? '2px' : 0,
            textAlign: 'center',
            width: '100%',
            fontFamily: "'LaCartoonerie', sans-serif"
          }}>🏆 RANKING GERAL</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: variant === 'startScreen' ? '1.5rem' : '1.2rem',
              padding: '0',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: variant === 'startScreen' ? '12px' : '8px',
              right: variant === 'startScreen' ? '16px' : '8px',
              zIndex: 10
            }}
            aria-label="Fechar ranking"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: variant === 'startScreen' ? '18px 18px 12px 18px' : '8px',
          background: variant === 'startScreen' ? 'rgba(255,255,255,0.08)' : 'var(--bg-primary)',
          maxHeight: isExpanded ? (variant === 'startScreen' ? '520px' : '400px') : (variant === 'startScreen' ? '320px' : '200px'),
          overflowY: 'auto',
          fontSize: variant === 'startScreen' ? '1.25rem' : '0.9rem',
          color: 'var(--text-primary)'
        }}>
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-secondary)',
              fontSize: '1rem'
            }}>
              Carregando...
            </div>
          ) : ranking.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-secondary)',
              fontSize: '1rem'
            }}>
              Nenhum jogador ainda
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {ranking.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: index === 0 ? 'rgba(16, 185, 129, 0.1)' : 
                               index === 1 ? 'rgba(192, 192, 192, 0.1)' :
                               index === 2 ? 'rgba(205, 127, 50, 0.1)' : 'transparent',
                    border: index < 3 ? '1px solid var(--accent-green)' : '1px solid transparent',
                    borderRadius: '4px',
                    fontFamily: "'LaCartoonerie', sans-serif"
                  }}
                >
                  <span style={{
                    fontSize: '1.1rem',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {getMedalIcon(index + 1)}
                  </span>
                  
                  <div style={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    fontFamily: "'LaCartoonerie', sans-serif"
                  }}>
                    <div style={{
                      color: 'var(--text-primary)',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '1rem',
                      fontFamily: "'LaCartoonerie', sans-serif"
                    }}>
                      {player.player_name}
                    </div>
                  </div>
                  
                  <div style={{
                    color: 'var(--accent-green)',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textAlign: 'right',
                    minWidth: '50px',
                    fontFamily: "'LaCartoonerie', sans-serif"
                  }}>
                    {player.score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isExpanded && (
          <div style={{
            padding: '6px 8px',
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--text-primary)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            Clique para {isExpanded ? 'recolher' : 'expandir'}
          </div>
        )}
      </div>
    </div>
  );
}; 