import React, { useState } from 'react';
import { 
  SettingsIcon, 
  Volume2Icon, 
  VolumeXIcon, 
  RotateCcwIcon,
  XIcon,
  CheckIcon
} from './GameIcons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetStats: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetStats,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleResetStats = () => {
    if (showResetConfirm) {
      onResetStats();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
    }
  };

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
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
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
          `}
        </style>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          borderBottom: '2px solid var(--text-primary)',
          paddingBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <SettingsIcon size={24} color="var(--accent-yellow)" />
            <h2 style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
              margin: 0,
              fontFamily: "'Press Start 2P', monospace",
              color: 'var(--accent-yellow)',
              textTransform: 'uppercase'
            }}>
              CONFIGURAÇÕES
            </h2>
          </div>
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

        {/* Conteúdo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Configurações de Áudio */}
          <div>
            <h3 style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              margin: '0 0 12px 0',
              fontFamily: "'Press Start 2P', monospace",
              color: 'var(--text-primary)',
              textTransform: 'uppercase'
            }}>
              ÁUDIO
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px',
              background: 'var(--bg-primary)',
              border: '2px solid var(--text-primary)',
              borderRadius: '4px'
            }}>
              <button
                onClick={onToggleMute}
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
                {isMuted ? (
                  <VolumeXIcon size={24} color="var(--accent-red)" />
                ) : (
                  <Volume2Icon size={24} color="var(--accent-green)" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: 'var(--accent-green)',
                  cursor: 'pointer'
                }}
              />
              <span style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontFamily: "'VT323', monospace",
                color: 'var(--text-primary)',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Reset de Estatísticas */}
          <div>
            <h3 style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              margin: '0 0 12px 0',
              fontFamily: "'Press Start 2P', monospace",
              color: 'var(--text-primary)',
              textTransform: 'uppercase'
            }}>
              DADOS
            </h3>
            <div style={{
              padding: '12px',
              background: 'var(--bg-primary)',
              border: '2px solid var(--accent-red)',
              borderRadius: '4px'
            }}>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontFamily: "'VT323', monospace",
                color: 'var(--text-secondary)',
                margin: '0 0 12px 0',
                lineHeight: 1.4
              }}>
                Esta ação irá apagar todas as suas estatísticas de jogo permanentemente.
              </p>
              <button
                onClick={handleResetStats}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: showResetConfirm ? 'var(--accent-red)' : 'var(--bg-secondary)',
                  border: '2px solid var(--accent-red)',
                  borderRadius: '4px',
                  color: showResetConfirm ? 'var(--text-primary)' : 'var(--accent-red)',
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
                <RotateCcwIcon size={16} color={showResetConfirm ? 'var(--text-primary)' : 'var(--accent-red)'} />
                {showResetConfirm ? 'CONFIRMAR RESET' : 'RESETAR ESTATÍSTICAS'}
              </button>
              {showResetConfirm && (
                <p style={{
                  fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                  fontFamily: "'VT323', monospace",
                  color: 'var(--accent-red)',
                  margin: '8px 0 0 0',
                  fontWeight: 'bold'
                }}>
                  Clique novamente para confirmar!
                </p>
              )}
            </div>
          </div>

          {/* Informações do Jogo */}
          <div>
            <h3 style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              margin: '0 0 12px 0',
              fontFamily: "'Press Start 2P', monospace",
              color: 'var(--text-primary)',
              textTransform: 'uppercase'
            }}>
              SOBRE
            </h3>
            <div style={{
              padding: '12px',
              background: 'var(--bg-primary)',
              border: '2px solid var(--accent-blue)',
              borderRadius: '4px'
            }}>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontFamily: "'VT323', monospace",
                color: 'var(--text-secondary)',
                margin: '0 0 8px 0',
                lineHeight: 1.4
              }}>
                <strong>Versão:</strong> 1.0.0
              </p>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontFamily: "'VT323', monospace",
                color: 'var(--text-secondary)',
                margin: '0 0 8px 0',
                lineHeight: 1.4
              }}>
                <strong>Desenvolvedor:</strong> Héric Moura
              </p>
              <p style={{
                fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
                fontFamily: "'VT323', monospace",
                color: 'var(--text-secondary)',
                margin: '0',
                lineHeight: 1.4
              }}>
                <strong>Localização:</strong> Santos, SP - Brasil
              </p>
            </div>
          </div>
        </div>

        {/* Botão de fechar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '2px solid var(--text-primary)'
        }}>
          <button
            onClick={onClose}
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
            <CheckIcon size={16} color="var(--text-primary)" />
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
}; 