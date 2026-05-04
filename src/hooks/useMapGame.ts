import { useRef, useState, useEffect } from 'react';
import * as L from 'leaflet';
import { FeatureCollection } from 'geojson';
import { calculateDistance, calculateScore, closestPointOnSegment } from '../utils/gameUtils';
import {
  getFeedbackMessage,
  ROUND_TIME,
  calculateTimeBonus,
  SCORE_CORRECT_BASE,
  SCORE_CORRECT_TIME_BONUS,
  SCORE_NEAR_BORDER_BASE,
  SCORE_NEAR_BORDER_TIME_BONUS,
  SCORE_FAMOUS_PLACE_BASE,
  SCORE_FAMOUS_PLACE_TIME_BONUS,
  FAMOUS_PLACE_HIT_RADIUS_KM,
  STREAK_MULTIPLIER_PER_LEVEL,
  MAX_STREAK_LEVELS,
} from '../utils/gameConstants';
import { GameMode, FamousPlace } from '../types/famousPlaces';
import { useGameState } from './useGameState';

const isPointInsidePolygon = (point: L.LatLng, polygon: L.LatLng[]): boolean => {
  const x = point.lng;
  const y = point.lat;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const useMapGame = (
  geoJsonData: FeatureCollection | null,
  gameMode: GameMode = 'neighborhoods',
  currentFamousPlace: FamousPlace | null = null,
  externalPause: boolean = false
) => {
  const clickDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingClickRef = useRef(false);
  const isAutoAdvancingRef = useRef(false);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON>(null) as React.RefObject<L.GeoJSON>;
  const audioRef = useRef<HTMLAudioElement>(null);
  const successSoundRef = useRef<HTMLAudioElement>(null);
  const errorSoundRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showPhaseOneMessage, setShowPhaseOneMessage] = useState(false);
  const [distanceCircle, setDistanceCircle] = useState<{ center: L.LatLng; radius: number } | null>(null);

  const {
    gameState,
    updateGameState,
    startGame,
    startNextRound,
    feedbackTimerRef
  } = useGameState(externalPause);

  useEffect(() => {
    return () => {
      if (clickDebounceRef.current) clearTimeout(clickDebounceRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (feedbackProgressIntervalRef.current) clearInterval(feedbackProgressIntervalRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const playSound = (ref: React.RefObject<HTMLAudioElement>, volume = 0.7) => {
    if (!ref.current) return;
    ref.current.currentTime = 0;
    ref.current.volume = volume;
    ref.current.play().catch(() => {
      // AbortError é esperado quando o browser bloqueia autoplay
    });
  };

  const startFeedbackProgress = () => {
    if (feedbackProgressIntervalRef.current) clearInterval(feedbackProgressIntervalRef.current);
    let progress = 100;
    updateGameState({ feedbackProgress: 100 });

    feedbackProgressIntervalRef.current = setInterval(() => {
      progress -= 3.33;

      if (progress <= 0) {
        clearInterval(feedbackProgressIntervalRef.current!);
        feedbackProgressIntervalRef.current = null;
        updateGameState({ feedbackProgress: 0 });

        if (!isAutoAdvancingRef.current) {
          isAutoAdvancingRef.current = true;
          if (geoJsonData) {
            startNextRound(geoJsonData);
          } else {
            isAutoAdvancingRef.current = false;
          }
        }
      } else {
        updateGameState({ feedbackProgress: progress });
      }
    }, 100);
  };

  const handleMapClick = (latlng: L.LatLng) => {
    if (isProcessingClickRef.current) return;
    if (!gameState.gameStarted || !gameState.isCountingDown) return;

    isProcessingClickRef.current = true;
    clickDebounceRef.current = setTimeout(() => { isProcessingClickRef.current = false; }, 100);
    isAutoAdvancingRef.current = false;

    const clickDuration = Math.max(0, gameState.roundInitialTime - gameState.roundTimeLeft);

    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; }

    updateGameState({ isCountingDown: false, isPaused: true });

    if (gameMode === 'famous_places' && currentFamousPlace) {
      const targetLatLng = L.latLng(currentFamousPlace.latitude, currentFamousPlace.longitude);
      const distance = calculateDistance(latlng, targetLatLng);
      const distanceKm = distance / 1000;
      const streak = gameState.consecutiveCorrect;
      const streakMultiplier = 1 + Math.min(streak, MAX_STREAK_LEVELS) * STREAK_MULTIPLIER_PER_LEVEL;

      let score = 0, feedbackMessage = '', isCorrectPlace = false;
      let arrowPath: [L.LatLng, L.LatLng] | null = null;

      if (distanceKm <= FAMOUS_PLACE_HIT_RADIUS_KM) {
        isCorrectPlace = true;
        const baseScore = SCORE_FAMOUS_PLACE_BASE + Math.round((gameState.roundTimeLeft / ROUND_TIME) * SCORE_FAMOUS_PLACE_TIME_BONUS);
        score = Math.round(baseScore * streakMultiplier);
        feedbackMessage = streak >= 2 ? `Acertou! 🔥 ${streak + 1} seguidos!` : `Acertou! ${currentFamousPlace.name}`;
      } else {
        score = calculateScore(distance, gameState.roundTimeLeft, 'famous_places').total;
        if (distanceKm < 0.5) feedbackMessage = 'Quase lá!';
        else if (distanceKm < 1) feedbackMessage = 'Está no caminho certo!';
        else if (distanceKm < 2) feedbackMessage = 'Ainda longe!';
        else feedbackMessage = 'Muito longe!';
        arrowPath = [latlng, targetLatLng];
      }

      const timeBonus = calculateTimeBonus(score, gameMode);
      const newGlobalTime = Math.max(gameState.globalTimeLeft - clickDuration, 0);

      if (isCorrectPlace || distance <= 500) playSound(successSoundRef);
      else if (distance >= 700) playSound(errorSoundRef);

      updateGameState({
        clickedPosition: latlng,
        clickTime: clickDuration,
        score: gameState.score + score,
        globalTimeLeft: newGlobalTime,
        timeBonus,
        gameOver: newGlobalTime <= 0,
        showFeedback: true,
        feedbackOpacity: 1,
        feedbackProgress: 0,
        feedbackMessage,
        revealedNeighborhoods: isCorrectPlace
          ? new Set([...gameState.revealedNeighborhoods, currentFamousPlace.name])
          : gameState.revealedNeighborhoods,
        arrowPath,
        totalDistance: gameState.totalDistance + distance,
        consecutiveCorrect: isCorrectPlace ? gameState.consecutiveCorrect + 1 : 0,
        roundScore: Math.round(score),
      });

      if (!isCorrectPlace) setTimeout(() => setDistanceCircle({ center: latlng, radius: distance }), 400);
      startFeedbackProgress();
      return;
    }

    if (geoJsonRef.current) {
      const layers = geoJsonRef.current.getLayers();
      let targetLayer: L.Layer | null = null;
      let clickedNeighborhood: string | null = null;

      layers.forEach((layer: L.Layer) => {
        const feature = (layer as any).feature;
        try {
          if (feature.properties?.NOME === gameState.currentNeighborhood) targetLayer = layer;
        } catch { /* ignore */ }
      });

      layers.forEach((layer: L.Layer) => {
        const feature = (layer as any).feature;
        try {
          if ((layer as L.Polygon).getBounds().contains(latlng)) {
            if (feature.properties?.NOME === gameState.currentNeighborhood) {
              if (layer instanceof L.Polygon && isPointInsidePolygon(latlng, (layer as L.Polygon).getLatLngs()[0] as L.LatLng[]))
                clickedNeighborhood = feature.properties?.NOME;
            } else if (!clickedNeighborhood) {
              clickedNeighborhood = feature.properties?.NOME;
            }
          }
        } catch { /* ignore */ }
      });

      const isCorrectNeighborhood = clickedNeighborhood === gameState.currentNeighborhood;

      if (isCorrectNeighborhood) {
        const streak = gameState.consecutiveCorrect;
        const streakMultiplier = 1 + Math.min(streak, MAX_STREAK_LEVELS) * STREAK_MULTIPLIER_PER_LEVEL;
        const score = Math.round((SCORE_CORRECT_BASE + Math.round((gameState.roundTimeLeft / ROUND_TIME) * SCORE_CORRECT_TIME_BONUS)) * streakMultiplier);
        const timeBonus = calculateTimeBonus(score, gameMode);
        const newGlobalTime = Math.max(gameState.globalTimeLeft - clickDuration, 0);
        const newStreak = streak + 1;

        setTimeout(() => {
          playSound(successSoundRef);
          updateGameState({
            clickedPosition: latlng,
            clickTime: clickDuration,
            score: gameState.score + score,
            globalTimeLeft: newGlobalTime,
            timeBonus,
            gameOver: newGlobalTime <= 0,
            showFeedback: true,
            feedbackOpacity: 1,
            feedbackProgress: 0,
            feedbackMessage: newStreak >= 2 ? ` 🔥 ${newStreak} seguidos!` : '',
            revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
            arrowPath: null,
            totalDistance: gameState.totalDistance,
            consecutiveCorrect: newStreak,
            roundScore: score,
          });
          startFeedbackProgress();
        }, 0);
        return;
      }

      if (targetLayer) {
        const latLngs = (targetLayer as L.Polygon).getLatLngs()[0] as L.LatLng[];
        let minDistance = Infinity, closestPoint: L.LatLng = latlng;

        for (let i = 0; i < latLngs.length; i++) {
          const point = closestPointOnSegment(latlng, latLngs[i], latLngs[(i + 1) % latLngs.length]);
          const d = calculateDistance(latlng, point);
          if (d < minDistance) { minDistance = d; closestPoint = point; }
        }

        const distance = minDistance;
        const isNearBorder = distance < 10;
        const score = isNearBorder
          ? SCORE_NEAR_BORDER_BASE + Math.round((gameState.roundTimeLeft / ROUND_TIME) * SCORE_NEAR_BORDER_TIME_BONUS)
          : calculateScore(distance, gameState.roundTimeLeft).total;
        const timeBonus = calculateTimeBonus(score, gameMode);
        const newGlobalTime = Math.max(gameState.globalTimeLeft - clickDuration, 0);

        if (!isCorrectNeighborhood && distance >= 700) playSound(errorSoundRef);
        if (distance <= 500) playSound(successSoundRef);

        updateGameState({
          clickedPosition: latlng,
          clickTime: clickDuration,
          score: gameState.score + score,
          globalTimeLeft: newGlobalTime,
          timeBonus,
          showFeedback: true,
          feedbackOpacity: 1,
          feedbackProgress: 100,
          feedbackMessage: isNearBorder ? '' : getFeedbackMessage(distance),
          gameOver: newGlobalTime <= 0,
          revealedNeighborhoods: new Set([...gameState.revealedNeighborhoods, gameState.currentNeighborhood]),
          arrowPath: (!isCorrectNeighborhood && !isNearBorder) ? [latlng, closestPoint] : null,
          totalDistance: gameState.totalDistance + distance,
          consecutiveCorrect: 0,
          roundScore: score,
        });

        if (!isNearBorder) setTimeout(() => setDistanceCircle({ center: latlng, radius: distance }), 400);
        startFeedbackProgress();
      }
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    updateGameState({ volume: newVolume });
    if (newVolume > 0) updateGameState({ isMuted: false });
  };

  const handleToggleMute = () => updateGameState({ isMuted: !gameState.isMuted });

  const handlePauseGame = () => {
    setIsPaused(true);
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; }
    if (feedbackProgressIntervalRef.current) { clearInterval(feedbackProgressIntervalRef.current); feedbackProgressIntervalRef.current = null; }
    if (audioRef.current) audioRef.current.pause();
    updateGameState({ isCountingDown: false, isPaused: true });
  };

  const handleResumeGame = () => {
    setIsPaused(false);
    if (audioRef.current && gameState.gameStarted && !gameState.gameOver && !gameState.isMuted)
      playSound(audioRef);
    updateGameState({ isCountingDown: true, isPaused: false });
    if (gameState.showFeedback && gameState.feedbackProgress > 0) startFeedbackProgress();
  };

  const handleNextRound = (geoJsonData: FeatureCollection) => {
    isAutoAdvancingRef.current = false;
    setIsPaused(false);

    if (audioRef.current && gameState.gameStarted && !gameState.gameOver && !gameState.isMuted)
      playSound(audioRef);

    if (feedbackTimerRef.current) { clearTimeout(feedbackTimerRef.current); feedbackTimerRef.current = null; }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    if (feedbackProgressIntervalRef.current) { clearInterval(feedbackProgressIntervalRef.current); feedbackProgressIntervalRef.current = null; }

    updateGameState({
      isPaused: false,
      isCountingDown: true,
      showFeedback: false,
      feedbackOpacity: 0,
      feedbackProgress: 0,
      clickedPosition: null,
      arrowPath: null,
      revealedNeighborhoods: new Set<string>()
    });

    requestAnimationFrame(() => startNextRound(geoJsonData));
  };

  const handleStartGame = () => {
    if (geoJsonData) {
      setShowPhaseOneMessage(true);
      setTimeout(() => { setShowPhaseOneMessage(false); startGame(); }, 1000);
    }
  };

  return {
    mapRef,
    geoJsonRef,
    audioRef,
    successSoundRef,
    errorSoundRef,
    isLoading,
    isPaused,
    showPhaseOneMessage,
    distanceCircle,
    gameState,
    handleMapClick,
    handleVolumeChange,
    handleToggleMute,
    handlePauseGame,
    handleResumeGame,
    handleNextRound,
    handleStartGame,
    setDistanceCircle,
    updateGameState,
    gameMode
  };
};
