import React, { useState, useEffect } from 'react';
import { FamousPlacesWiki } from './FamousPlacesWiki';
import { Landmark, Monitor, Smartphone, X, Construction } from 'lucide-react';

interface MobileDisplayProps {
  onClose?: () => void;
}

export const MobileDisplay: React.FC<MobileDisplayProps> = ({ onClose }) => {
  const [showFamousPlaces, setShowFamousPlaces] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleShowFamousPlaces = () => {
    setShowFamousPlaces(true);
  };

  const handleCloseFamousPlaces = () => {
    setShowFamousPlaces(false);
  };

  if (showFamousPlaces) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'var(--bg-primary)',
        overflow: 'auto'
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          background: 'var(--bg-secondary)',
          borderBottom: '3px solid var(--accent-green)',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <h2 style={{
            margin: 0,
            color: 'var(--accent-green)',
            fontFamily: "'LaCartoonerie', cursive",
            fontSize: '1.5rem'
          }}>
            <Landmark size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Lugares Famosos
          </h2>
          <button
            onClick={handleCloseFamousPlaces}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} />
          </button>
        </div>
        <FamousPlacesWiki />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: 'var(--bg-primary)',
      overflow: 'auto',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.5s ease-in-out'
    }}>
      {/* Background Animation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `url(${import.meta.env.BASE_URL || ''}/assets/images/bg.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.3,
        animation: 'pulse 4s ease-in-out infinite',
        pointerEvents: 'none'
      }} />

      {/* Main Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingBottom: '20px'
      }}>
        {/* Logo/Title Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          animation: 'bounceIn 1s ease-out'
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 10vw, 3.5rem)',
            color: '#000000',
            margin: '0 0 10px 0',
            fontFamily: "'LaCartoonerie', cursive",
            textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8)',
            letterSpacing: '4px',
            animation: 'titleFloat 5s ease-in-out infinite'
          }}>
            GEOSANTOS
          </h1>
          <div style={{
            fontSize: 'clamp(1rem, 4vw, 1.2rem)',
            color: 'var(--text-secondary)',
            fontFamily: "'LaCartoonerie', cursive"
          }}>
            Jogo de Geografia
          </div>
        </div>

        {/* Development Message */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          border: '3px solid var(--accent-yellow)',
          borderRadius: '12px',
          padding: 'clamp(20px, 5vw, 30px)',
          marginBottom: '30px',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          animation: 'slideInUp 0.8s ease-out 0.3s both'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <Construction size={48} color="var(--accent-yellow)" data-testid="construction-icon" />
          </div>
          
          <h2 style={{
            fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
            color: 'var(--accent-yellow)',
            margin: '0 0 15px 0',
            fontFamily: "'LaCartoonerie', cursive",
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Em Desenvolvimento
          </h2>
          
          <p style={{
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            color: 'var(--text-primary)',
            margin: '0 0 15px 0',
            lineHeight: '1.5',
            fontFamily: "'LaCartoonerie', cursive",
            textAlign: 'center'
          }}>
            Geosantos é um jogo que ainda está em construção.
          </p>
          
          <p style={{
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            color: 'var(--text-primary)',
            margin: '0 0 15px 0',
            lineHeight: '1.5',
            fontFamily: "'LaCartoonerie', cursive",
            textAlign: 'center'
          }}>
            Atualmente só pode ser jogado em computadores.
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            margin: '20px 0',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            border: '2px solid var(--accent-green)'
          }}>
            <Monitor size={24} color="var(--accent-green)" />
            <span style={{
              color: 'var(--accent-green)',
              fontFamily: "'LaCartoonerie', cursive",
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Acesse em um computador para jogar
            </span>
          </div>
          
          <p style={{
            fontSize: 'clamp(0.9rem, 3vw, 1rem)',
            color: 'var(--text-secondary)',
            margin: '0',
            fontStyle: 'italic',
            fontFamily: "'LaCartoonerie', cursive",
            textAlign: 'center'
          }}>
            Obrigado pela sua visita!
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto 30px auto',
          animation: 'slideInUp 0.8s ease-out 0.6s both'
        }}>
          <button
            onClick={handleShowFamousPlaces}
            style={{
              background: 'linear-gradient(135deg, var(--accent-green), #2d6a4f)',
              border: '3px solid var(--accent-green)',
              color: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: 'clamp(14px, 4vw, 16px) clamp(20px, 5vw, 24px)',
              fontSize: 'clamp(1rem, 4vw, 1.2rem)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: "'LaCartoonerie', cursive",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
          >
            <Landmark size={24} />
            Lugares Famosos
          </button>


        </div>


      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes titleFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes bounceIn {
            0% { 
              opacity: 0; 
              transform: scale(0.3);
            }
            50% { 
              opacity: 1; 
              transform: scale(1.05);
            }
            70% { 
              transform: scale(0.9);
            }
            100% { 
              opacity: 1; 
              transform: scale(1);
            }
          }

          @keyframes slideInUp {
            0% { 
              opacity: 0; 
              transform: translateY(30px);
            }
            100% { 
              opacity: 1; 
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% { 
              opacity: 0.3;
            }
            50% { 
              opacity: 0.5;
            }
          }

          /* Mobile-specific adjustments */
          @media (max-width: 480px) {
            .mobile-display-container {
              padding: 15px;
              padding-top: 70px;
            }
          }

          /* Accessibility improvements */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
          }

          ::-webkit-scrollbar-thumb {
            background: var(--accent-green);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #2d6a4f;
          }
        `}
      </style>
    </div>
  );
}; 