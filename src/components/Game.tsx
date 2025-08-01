import React from 'react';
import Map from './Map';
import './Game.css';
import { useGameState } from '../hooks/useGameState';
import { GameControls } from './ui/GameControls';
import { getProgressBarColor } from '../utils/gameConstants';

const Game: React.FC = () => {
    const { gameState } = useGameState();

    return (
        <div className="game-container">
            <div className="game-header">
                <h1>O CAIÇARA</h1>
                <div className="game-stats">
                    <span>Pontuação: {gameState.score}</span>
                    <span>Tempo: {gameState.globalTimeLeft}</span>
                </div>
            </div>
            {/* A exibição do lugar famoso deve ser feita no Map ou em um componente que recebe currentFamousPlace do FamousPlacesManager */}
            <Map
                center={[-23.9618, -46.3322]} // Coordenadas de Santos
                zoom={13}
            />
            <GameControls
                gameStarted={gameState.gameStarted}
                currentNeighborhood={gameState.currentNeighborhood}
                globalTimeLeft={gameState.globalTimeLeft}
                roundTimeLeft={gameState.roundTimeLeft}
                roundNumber={gameState.roundNumber}
                roundInitialTime={gameState.roundInitialTime}
                score={gameState.score}
                onStartGame={() => {}}
                getProgressBarColor={getProgressBarColor}
                currentMode={gameState.gameMode}
            />
        </div>
    );
};

export default Game; 