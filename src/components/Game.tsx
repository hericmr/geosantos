import React, { useState } from 'react';
import Map from './Map';
import './Game.css';

const Game: React.FC = () => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);

    return (
        <div className="game-container">
            <div className="game-header">
                <h1>O CAIÇARA</h1>
                <div className="game-stats">
                    <span>Pontuação: {score}</span>
                    <span>Tempo: {timeLeft}</span>
                </div>
            </div>
            <Map
                center={[-23.9618, -46.3322]} // Coordenadas de Santos
                zoom={13}
            />
        </div>
    );
};

export default Game; 