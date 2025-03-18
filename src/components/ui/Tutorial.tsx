import React, { useState } from 'react';

interface TutorialProps {
  onClose: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Bem-vindo ao O Caiçara!',
      content: 'Vamos te ajudar a aprender os bairros de Santos de forma divertida.',
      position: 'center'
    },
    {
      title: 'Como Jogar',
      content: 'O jogo vai te mostrar o nome de um bairro. Sua missão é clicar no local correto no mapa.',
      position: 'center'
    },
    {
      title: 'Pontuação',
      content: 'Quanto mais próximo você clicar do centro do bairro, mais pontos ganha!',
      position: 'center'
    },
    {
      title: 'Tempo',
      content: 'Você tem tempo limitado para cada bairro. Fique de olho na barra de progresso!',
      position: 'bottom'
    },
    {
      title: 'Dicas',
      content: 'Use a seta vermelha como guia quando errar. Ela aponta para o centro do bairro correto.',
      position: 'center'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '20px',
        borderRadius: '10px',
        maxWidth: '500px',
        width: '90%',
        position: 'relative',
        border: '2px solid #32CD32'
      }}>
        <h2 style={{ 
          color: '#32CD32', 
          marginBottom: '15px',
          fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
          textAlign: 'center'
        }}>
          {steps[currentStep].title}
        </h2>
        
        <p style={{ 
          color: 'white',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          lineHeight: '1.5',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {steps[currentStep].content}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <button
            onClick={handleNext}
            style={{
              padding: '10px 20px',
              background: '#32CD32',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              transition: 'transform 0.2s'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {currentStep === steps.length - 1 ? 'Começar Jogo' : 'Próximo'}
          </button>

          <button
            onClick={handleSkip}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #32CD32',
              borderRadius: '5px',
              color: '#32CD32',
              cursor: 'pointer',
              fontSize: 'clamp(0.9rem, 2vw, 1rem)',
              transition: 'transform 0.2s'
            }}
            onTouchStart={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Pular Tutorial
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '5px',
          marginTop: '20px'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: index === currentStep ? '#32CD32' : '#666',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 