import React, { useState, useEffect } from 'react';
import { 
  TrophyIcon, 
  XIcon, 
  CheckIcon,
  StarIcon,
  ClockIcon,
  TargetIcon,
  ZapIcon,
  AwardIcon,
  ShareIcon,
  
} from './GameIcons';
import { rankingService } from '../../lib/supabase';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  score: number;
  playTime: number;
  roundsPlayed: number;
  accuracy: number;
  currentPlayerName: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  score,
  playTime,
  roundsPlayed,
  accuracy,
  currentPlayerName
}) => {
  const [playerName, setPlayerName] = useState(currentPlayerName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rankingData, setRankingData] = useState<any[]>([]);

  const fetchRanking = async () => {
    try {
      const data = await rankingService.getTopPlayers(3);
      if (data) {
        setRankingData(data.slice(0, 3)); // Get top 3
      }
    } catch (err) {
      console.error("Erro ao buscar ranking:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPlayerName(currentPlayerName);
      setIsSubmitted(false);
      setError(null);
      setShowConfetti(false);
    }
  }, [isOpen, currentPlayerName]);

  const handleSubmit = async () => {
    if (!playerName.trim()) {
      setError('Digite um nome para salvar sua pontuação!');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await rankingService.addScore({
        player_name: playerName.trim(),
        score,
        play_time: playTime,
        rounds_played: roundsPlayed,
        accuracy
      });

      if (success) {
        setIsSubmitted(true);
        setShowConfetti(true);
        fetchRanking(); // Fetch ranking after successful submission
        
        // Parar confetti após 3 segundos
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        setError('Erro ao salvar pontuação. Tente novamente!');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente!');
      console.error('Erro ao salvar pontuação:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAccuracy = (acc: number): string => {
    return `${Math.round(acc * 100)}%`;
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 20000) return "REI DA GEOGRAFIA! Você conhece Santos!";
    if (score >= 15000) return "MITO SANTISTA! Até as ondas do mar te aplaudem!";
    if (score >= 10000) return "LENDÁRIO! Você é um Pelé da geografia santista!";
    if (score >= 8000) return "MESTRE DOS BAIRROS! Você é um GPS ambulante!";
    if (score >= 5000) return "IMPRESSIONANTE! Quase um GPS humano!!";
    if (score >= 4000) return "VC É MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA!";
    if (score >= 3000) return "SANTISTA DE CORAÇÃO! Você manja dos bairros!";
    if (score >= 2000) return "MUITO BOM! Você deve ter ido em algumas aulas de geografia!";
    if (score >= 1000) return "BOM JOGO! Mas ainda precisa andar mais pela zona noroeste!";
    if (score >= 500) return "QUASE LÁ! Dá um role no bondinho pra pegar umas dicas!";
    if (score >= 100) return "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA!";
    return "Eita! Parece que você não sabe nada de Santos!";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 20000) return '#FFD700'; // Ouro para Rei da Geografia
    if (score >= 15000) return '#FFA500'; // Laranja para Mito Santista
    if (score >= 10000) return '#32CD32'; // Verde para Lendário
    if (score >= 8000) return '#00CED1'; // Ciano para Mestre
    if (score >= 5000) return '#9370DB'; // Roxo para Impressionante
    if (score >= 4000) return '#FF69B4'; // Rosa para Santista
    if (score >= 3000) return '#FF6347'; // Tomate para Santista de Coração
    if (score >= 2000) return '#FFD700'; // Ouro para Muito Bom
    if (score >= 1000) return '#98FB98'; // Verde claro para Bom Jogo
    if (score >= 500) return '#F0E68C'; // Amarelo claro para Quase Lá
    if (score >= 100) return '#FFB6C1'; // Rosa claro para Perdido
    return '#FF6B6B'; // Vermelho claro para Não sabe nada
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10002,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Confetti animado */}
      {showConfetti && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <style>
            {`
              @keyframes confetti {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
              }
            `}
          </style>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                width: '8px',
                height: '8px',
                background: ['var(--accent-yellow)', 'var(--accent-green)', 'var(--accent-blue)', 'var(--accent-orange)', 'var(--accent-red)'][Math.floor(Math.random() * 5)],
                animation: `confetti ${2 + Math.random() * 3}s linear forwards`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div style={{
        background: 'var(--bg-secondary)',
        border: '3px solid var(--text-primary)',
        borderRadius: '4px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        zIndex: 2,
        animation: 'modalSlideIn 0.5s ease-out'
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
            
            @keyframes scorePulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            .score-animation { animation: scorePulse 2s ease-in-out infinite; }
          `}
        </style>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            margin: '0 0 8px 0',
            fontFamily: "'Press Start 2P', monospace",
            color: 'var(--accent-red)',
            textTransform: 'uppercase',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)'
          }}>
            GAME OVER
          </h1>
        </div>

        {/* Pontuação */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '20px',
          background: 'var(--bg-primary)',
          border: '3px solid var(--text-primary)',
          borderRadius: '4px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontFamily: "'VT323', monospace",
            color: getScoreColor(score),
            fontWeight: 'bold',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)',
            marginBottom: '12px',
            animation: 'scorePulse 2s ease-in-out infinite'
          }}>
            {score.toLocaleString()} PONTOS
          </div>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
            margin: 0,
            fontFamily: "'VT323', monospace",
            color: 'var(--text-secondary)',
            textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)',
            lineHeight: 1.3
          }}>
            {getScoreMessage(score)}
          </p>
        </div>

        {/* Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'var(--bg-primary)',
            border: '2px solid var(--accent-blue)',
            borderRadius: '4px'
          }}>
            <ClockIcon size={20} color="var(--accent-blue)" />
            <div style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              fontFamily: "'VT323', monospace",
              color: 'var(--text-primary)',
              marginTop: '4px'
            }}>
              {formatTime(playTime)}
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'var(--bg-primary)',
            border: '2px solid var(--accent-green)',
            borderRadius: '4px'
          }}>
            <TargetIcon size={20} color="var(--accent-green)" />
            <div style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              fontFamily: "'VT323', monospace",
              color: 'var(--text-primary)',
              marginTop: '4px'
            }}>
              {roundsPlayed} rodadas
            </div>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: 'var(--bg-primary)',
            border: '2px solid var(--accent-orange)',
            borderRadius: '4px'
          }}>
            <ZapIcon size={20} color="var(--accent-orange)" />
            <div style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              fontFamily: "'VT323', monospace",
              color: 'var(--text-primary)',
              marginTop: '4px'
            }}>
              {formatAccuracy(accuracy)}
            </div>
          </div>
        </div>

        {/* Formulário de nome */}
        {!isSubmitted ? (
          <div style={{
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              margin: '0 0 12px 0',
              fontFamily: "'Press Start 2P', monospace",
              color: 'var(--accent-yellow)',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}>
              SALVAR NO RANKING
            </h3>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Seu nome"
                maxLength={50}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontFamily: "'VT323', monospace",
                  background: 'var(--bg-primary)',
                  border: '2px solid var(--text-primary)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: '12px 20px',
                  background: 'var(--accent-green)',
                  border: '2px solid var(--text-primary)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.1s steps(1)',
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  textTransform: 'uppercase',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'SALVANDO...' : 'SALVAR'}
              </button>
            </div>
            
            {error && (
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontFamily: "'VT323', monospace",
                color: 'var(--accent-red)',
                margin: '8px 0 0 0',
                textAlign: 'center'
              }}>
                {error}
              </p>
            )}
          </div>
        ) : (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '16px',
              background: 'var(--accent-green)',
              border: '2px solid var(--text-primary)',
              borderRadius: '4px'
            }}>
              <CheckIcon size={24} color="var(--text-primary)" />
              <p style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                fontFamily: "'VT323', monospace",
                color: 'var(--text-primary)',
                margin: '8px 0 0 0',
                fontWeight: 'bold'
              }}>
                PONTUAÇÃO SALVA COM SUCESSO!
              </p>
            </div>
            {isSubmitted && rankingData.length > 0 && (
              <div style={{
                marginTop: '24px',
                textAlign: 'center',
                background: 'var(--bg-primary)',
                border: '2px solid var(--accent-yellow)',
                borderRadius: '4px',
                padding: '16px',
                boxShadow: 'var(--shadow-md)'
              }}>
                <h3 style={{
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  margin: '0 0 12px 0',
                  fontFamily: "'Press Start 2P', monospace",
                  color: 'var(--accent-yellow)',
                  textTransform: 'uppercase'
                }}>
                  TOP 3 DO RANKING
                </h3>
                {rankingData.map((entry, index) => (
                  <p key={index} style={{
                    fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                    fontFamily: "'VT323', monospace",
                    color: 'var(--text-primary)',
                    margin: '4px 0'
                  }}>
                    {index + 1}. {entry.player_name} - {entry.score.toLocaleString()} pontos
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {/* Botões de ação */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onPlayAgain}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'var(--accent-green)',
              border: '2px solid var(--text-primary)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.1s steps(1)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <TrophyIcon size={16} color="var(--text-primary)" />
            JOGAR NOVAMENTE
          </button>
          
          <button
            onClick={() => {
              const mensagem = score >= 20000 ? "REI DA GEOGRAFIA! Eu conheço Santos!" :
                score >= 15000 ? "MITO SANTISTA! Até as ondas do mar me aplaudem!" :
                score >= 10000 ? "LENDÁRIO! Eu sou um Pelé da geografia santista!" :
                score >= 8000 ? "MESTRE DOS BAIRROS! Eu sou um GPS ambulante!" :
                score >= 5000 ? "IMPRESSIONANTE! Quase um GPS humano!!" :
                score >= 4000 ? "SOU MAIS SANTISTA QUE PASTEL DE VENTO NA FEIRA!" :
                score >= 3000 ? "SANTISTA DE CORAÇÃO! Eu manjo dos bairros!" :
                score >= 2000 ? "MUITO BOM! Eu devo ter ido em algumas aulas de geografia!" :
                score >= 1000 ? "BOM JOGO! Mas ainda preciso andar mais na zona noroeste!" :
                score >= 500 ? "QUASE LÁ! Vou dar um rolê no bondinho pra pegar mais dicas!" :
                score >= 100 ? "MAIS PERDIDO QUE DOIDO NA PONTA DA PRAIA!" :
                "Eita! Parece que eu não sei nada de Santos!";

              const shareText = `${mensagem} Joguei o Geosantos e fiz ${score} pontos! Jogue agora em https://hericmr.github.io/geosantos e veja quanto você consegue fazer!`;

              if (navigator.share) {
                navigator.share({
                  text: shareText
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(shareText)
                  .then(() => alert('Texto copiado para a área de transferência! Desafie uma pessoa, compartilhe o jogo!'))
                  .catch(console.error);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'var(--accent-blue)',
              border: '2px solid var(--text-primary)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.1s steps(1)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-md)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            <ShareIcon size={16} color="var(--text-primary)" />
            COMPARTILHAR
          </button>
          
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'var(--bg-primary)',
              border: '2px solid var(--text-primary)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.1s steps(1)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translate(-1px, -1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <XIcon size={16} color="var(--text-primary)" />
            MENU PRINCIPAL
          </button>
        </div>
      </div>
    </div>
  );
}; 