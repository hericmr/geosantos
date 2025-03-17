import React, { useState } from 'react';
import Map from './Map';
import './Game.css';

const Game: React.FC = () => {
    const [score, setScore] = useState(0);
    const [currentBairro, setCurrentBairro] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(10);

    const handleBairroClick = (bairroName: string) => {
        if (bairroName === currentBairro) {
            setScore(prev => prev + 100);
            // Select new random bairro
            // TODO: Implement bairro selection logic
        } else {
            setScore(prev => Math.max(0, prev - 50));
        }
    };

    return (
        <div className="game-container">
            <div className="game-header">
                <h1>O CAIÇARA</h1>
                <div className="game-stats">
                    <span>Pontuação: {score}</span>
                    <span>Tempo: {timeLeft}</span>
                </div>
                {currentBairro && (
                    <div className="game-instruction">
                        Encontre o bairro: {currentBairro}
                    </div>
                )}
            </div>
            <Map
                center={[-23.9618, -46.3322]} // Coordenadas de Santos
                zoom={13}
                onBairroClick={handleBairroClick}
            />
        </div>
    );
};

export default Game; 