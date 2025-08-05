import React from 'react';
import { GameIcon } from './GameIcons';

interface ContextualTipProps {
  currentMode: 'neighborhoods' | 'famous_places';
  currentNeighborhood: string;
  currentFamousPlace?: any;
  isVisible: boolean;
}



export const ContextualTip: React.FC<ContextualTipProps> = ({
  currentMode,
  currentNeighborhood,
  currentFamousPlace,
  isVisible
}) => {
  if (!isVisible) return null;

  let tipData;
  
  // Por enquanto, só mostramos informações para lugares famosos
  if (currentMode === 'famous_places' && currentFamousPlace) {
    tipData = {
      description: currentFamousPlace.description,
      icon: "landmark",
      category: "LUGAR FAMOSO"
    };
  } else {
    // Para bairros, não mostramos informações por enquanto
    return null;
  }

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.85)',
      borderRadius: '12px',
      padding: '16px',
      margin: '12px 0 0 0',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      animation: 'fadeInUp 0.5s ease-out'
    }}>
      {/* Cabeçalho da dica */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <GameIcon name={tipData.icon} size={20} color="#FFD700" />
        <div style={{
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          color: '#FFD700',
          fontFamily: "'LaCartoonerie', sans-serif",
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {tipData.category}
        </div>
      </div>

      {/* Descrição principal */}
              <div style={{
          fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
          color: '#fff',
          fontFamily: "'LaCartoonerie', sans-serif",
          lineHeight: 1.4,
          marginBottom: '12px',
          textAlign: 'left'
        }}>
          {tipData.description}
        </div>



      <style>
        {`
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}; 