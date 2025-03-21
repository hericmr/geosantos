import { LatLng } from 'leaflet';
import { ScoreCalculation } from '../types/game';
import { calculateDistance } from '../utils/gameUtils';

export interface ScoreConfig {
  maxDistancePoints: number;     // Pontos máximos por distância (padrão: 1000)
  maxTimeBonus: number;          // Bônus máximo por tempo (padrão: 500)
  maxDistanceKm: number;         // Distância máxima para pontuação (padrão: 10km)
  timeBonusThreshold: number;    // Limite de tempo para bônus (padrão: 2s)
  nearBorderDistance: number;    // Distância considerada próxima à borda (padrão: 10m)
  nearBorderBonus: number;       // Bônus por estar próximo à borda (padrão: 2000)
  correctNeighborhoodBonus: number; // Bônus por acertar o bairro (padrão: 1000)
  maxTotalDistanceKm: number;    // Distância máxima total para game over (padrão: 4km)
}

export class ScoreCalculator {
  private config: ScoreConfig;
  private totalDistance: number = 0;

  constructor(config?: Partial<ScoreConfig>) {
    this.config = {
      maxDistancePoints: 1000,
      maxTimeBonus: 500,
      maxDistanceKm: 10,
      timeBonusThreshold: 2,
      nearBorderDistance: 10,
      nearBorderBonus: 2000,
      correctNeighborhoodBonus: 1000,
      maxTotalDistanceKm: 4,
      ...config
    };
  }

  calculateBaseScore(distance: number, timeLeft: number): ScoreCalculation {
    // Para distância zero ou negativa, retorna pontos base mais bônus de tempo
    if (distance <= 0) {
      const timeMultiplier = this.getTimeMultiplier(timeLeft, 0);
      const timeBonus = Math.round(this.config.maxTimeBonus * timeMultiplier);
      return {
        total: this.config.maxDistancePoints + timeBonus,
        distancePoints: this.config.maxDistancePoints,
        timePoints: timeBonus
      };
    }

    // Garantir que a distância não seja negativa
    const positiveDistance = Math.max(0, distance);
    const distanceKm = positiveDistance / 1000;
    
    // Se a distância for maior que o máximo, retorna zero
    if (distanceKm >= this.config.maxDistanceKm) {
      return {
        total: 0,
        distancePoints: 0,
        timePoints: 0
      };
    }
    
    // Pontuação baseada na distância com penalidade para longas distâncias
    let distanceScore;
    
    if (distanceKm >= this.config.maxDistanceKm * 0.7) {
      // Quando a distância é maior que 70% do máximo, aplicar penalidade progressiva
      const penaltyFactor = (distanceKm - this.config.maxDistanceKm * 0.7) / 
                           (this.config.maxDistanceKm * 0.3);
      const baseScore = this.config.maxDistancePoints * (1 - (distanceKm / this.config.maxDistanceKm));
      const penalty = penaltyFactor * baseScore; // Penalidade completa
      distanceScore = Math.max(0, baseScore - penalty);
    } else {
      // Cálculo normal para distâncias menores
      distanceScore = this.config.maxDistancePoints * (1 - (distanceKm / this.config.maxDistanceKm));
    }
    
    // Bônus de tempo usando a lógica do multiplicador
    const timeMultiplier = this.getTimeMultiplier(timeLeft, positiveDistance);
    const timeBonus = Math.round(this.config.maxTimeBonus * timeMultiplier);
    
    return {
      total: Math.round(distanceScore + timeBonus),
      distancePoints: Math.round(distanceScore),
      timePoints: timeBonus
    };
  }

  calculateFinalScore(
    clickedPosition: LatLng,
    targetPosition: LatLng,
    timeLeft: number,
    isCorrectNeighborhood: boolean
  ): ScoreCalculation & { isNearBorder: boolean } {
    const distance = calculateDistance(clickedPosition, targetPosition);
    const isNearBorder = distance < this.config.nearBorderDistance;
    
    // Atualiza a distância total antes de qualquer verificação
    this.totalDistance += distance;
    
    // Verifica se o jogo acabou após atualizar a distância total
    if (this.isGameOver()) {
      return {
        total: 0,
        distancePoints: 0,
        timePoints: 0,
        isNearBorder
      };
    }
    
    // Se acertou o bairro, recebe o bônus de bairro correto
    if (isCorrectNeighborhood) {
      const timeMultiplier = this.getTimeMultiplier(timeLeft, distance);
      
      // Calcula os pontos base e de tempo separadamente
      const distancePoints = Math.round(this.config.correctNeighborhoodBonus * 0.7); // 70% do bônus é pela distância
      const timePoints = Math.round(this.config.correctNeighborhoodBonus * 0.3 * timeMultiplier); // 30% é pelo tempo
      
      return {
        total: distancePoints + timePoints,
        distancePoints,
        timePoints,
        isNearBorder
      };
    }
    
    // Se não acertou o bairro mas está próximo à borda, recebe o bônus de borda
    if (isNearBorder) {
      const timeMultiplier = this.getTimeMultiplier(timeLeft, distance);
      
      // Calcula os pontos base e de tempo separadamente
      const distancePoints = Math.round(this.config.nearBorderBonus * 0.7); // 70% do bônus é pela distância
      const timePoints = Math.round(this.config.nearBorderBonus * 0.3 * timeMultiplier); // 30% é pelo tempo
      
      return {
        total: distancePoints + timePoints,
        distancePoints,
        timePoints,
        isNearBorder
      };
    }
    
    // Caso contrário, calcula pontuação normal baseada na distância
    const baseScore = this.calculateBaseScore(distance, timeLeft);
    return {
      ...baseScore,
      isNearBorder
    };
  }

  getTimeMultiplier(timeLeft: number, distance: number): number {
    if (timeLeft <= 0) return 0;
    
    // Se o tempo for muito grande (> 20s), retorna 1 para distância zero, 0 para outros casos
    if (timeLeft > 20) {
      return distance < this.config.nearBorderDistance ? 1 : 0;
    }
    
    // Normaliza o tempo entre 0 e 10
    const normalizedTime = Math.min(10, Math.max(0, timeLeft));
    
    // Calcula o multiplicador base usando uma curva logarítmica mais suave
    // Usando uma base menor para ter uma curva mais pronunciada no início
    const baseMultiplier = Math.log(1 + normalizedTime) / Math.log(4);
    
    // Se a distância for negativa ou muito pequena, retorna apenas o multiplicador de tempo
    if (distance < this.config.nearBorderDistance) {
      return Math.max(0, Math.min(1, baseMultiplier));
    }
    
    // Calcula o fator de distância
    const distanceKm = Math.max(0, distance) / 1000;
    if (distanceKm >= this.config.maxDistanceKm) return 0;
    
    // Usando uma curva quadrática para o decaimento da distância
    const distanceFactor = Math.pow(1 - (distanceKm / this.config.maxDistanceKm), 2);
    
    // O multiplicador final é o produto do multiplicador base e o fator de distância
    return Math.max(0, Math.min(1, baseMultiplier * distanceFactor));
  }

  isGameOver(): boolean {
    return this.totalDistance / 1000 >= this.config.maxTotalDistanceKm;
  }

  getTotalDistance(): number {
    return this.totalDistance;
  }

  resetTotalDistance(): void {
    this.totalDistance = 0;
  }
} 