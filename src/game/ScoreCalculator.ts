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
}

export class ScoreCalculator {
  private config: ScoreConfig;

  constructor(config?: Partial<ScoreConfig>) {
    this.config = {
      maxDistancePoints: 1000,
      maxTimeBonus: 500,
      maxDistanceKm: 10,
      timeBonusThreshold: 2,
      nearBorderDistance: 10,
      nearBorderBonus: 2000,
      correctNeighborhoodBonus: 1000,
      ...config
    };
  }

  calculateBaseScore(distance: number, timeLeft: number): ScoreCalculation {
    // Garantir que a distância não seja negativa
    const positiveDistance = Math.max(0, distance);
    const distanceKm = positiveDistance / 1000;
    
    // Pontuação baseada na distância com penalidade para longas distâncias
    let distanceScore;
    
    if (distanceKm >= this.config.maxDistanceKm * 0.7) {
      // Quando a distância é maior que 70% do máximo, aplicar penalidade crescente
      const penaltyFactor = Math.min(1, (distanceKm - this.config.maxDistanceKm * 0.7) / 
                                       (this.config.maxDistanceKm * 0.3));
      distanceScore = Math.max(0, 
        this.config.maxDistancePoints * (1 - (distanceKm / this.config.maxDistanceKm)) - 
        (penaltyFactor * 200) // Penalidade máxima de 200 pontos
      );
    } else {
      // Cálculo normal para distâncias menores
      distanceScore = Math.max(0, 
        this.config.maxDistancePoints * (1 - (distanceKm / this.config.maxDistanceKm))
      );
    }
    
    // Bônus de tempo usando a lógica do multiplicador
    const timeMultiplier = this.getTimeMultiplier(timeLeft, distance);
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
    
    // Se acertou o bairro ou está muito próximo da borda
    if (isCorrectNeighborhood || isNearBorder) {
      const baseBonus = isNearBorder ? this.config.nearBorderBonus : this.config.correctNeighborhoodBonus;
      
      // Para pontuação perfeita (tempo = 10), mantém o bônus original
      // Para outros tempos, aplica o multiplicador que considera tempo e distância
      const timeMultiplier = this.getTimeMultiplier(timeLeft, distance);
      const total = Math.round(baseBonus * timeMultiplier);
      
      return {
        total,
        distancePoints: baseBonus,
        timePoints: total - baseBonus, // A diferença entre o total e o bônus base é o bônus de tempo
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
    // Normaliza o tempo entre 0 e 10
    // No jogo real, timeLeft sempre será positivo pois o jogo termina quando o tempo acaba
    const normalizedTime = Math.min(10, timeLeft);
    
    // Calcula o multiplicador base usando uma curva logarítmica suavizada
    // Que dá maior recompensa para tempos mais rápidos
    const baseMultiplier = Math.log10(1 + 9 * normalizedTime / 10) / Math.log10(10);
    
    // Se a distância for negativa, trata como zero
    const positiveDistance = Math.max(0, distance);
    const distanceKm = positiveDistance / 1000;
    
    // Se a distância for maior que a máxima, retorna zero
    if (distanceKm >= this.config.maxDistanceKm) return 0;
    
    // Para distâncias muito pequenas (menos de 10m), o fator de distância é 1
    if (distance < this.config.nearBorderDistance) {
      return Math.max(0, Math.min(1, baseMultiplier));
    }
    
    // Calcula o fator de distância com uma curva mais suave
    // Usamos uma potência menor para reduzir o impacto da distância
    const distanceFactor = Math.pow(1 - (distanceKm / this.config.maxDistanceKm), 1.2);
    
    // O multiplicador final é o produto do multiplicador base e o fator de distância
    // Garantimos que o resultado está entre 0 e 1
    return Math.max(0, Math.min(1, baseMultiplier * distanceFactor));
  }
} 