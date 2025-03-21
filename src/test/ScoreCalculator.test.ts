import { describe, it, expect, beforeEach } from 'vitest';
import { LatLng } from 'leaflet';
import { ScoreCalculator, ScoreConfig } from '../game/ScoreCalculator';

describe('ScoreCalculator', () => {
  let calculator: ScoreCalculator;
  let defaultConfig: ScoreConfig;

  beforeEach(() => {
    calculator = new ScoreCalculator();
    defaultConfig = {
      maxDistancePoints: 1000,
      maxTimeBonus: 500,
      maxDistanceKm: 10,
      timeBonusThreshold: 2,
      nearBorderDistance: 10,
      nearBorderBonus: 2000,
      correctNeighborhoodBonus: 1000,
      maxTotalDistanceKm: 4
    };
  });

  describe('constructor', () => {
    it('should use default config when no config is provided', () => {
      const calculator = new ScoreCalculator();
      expect(calculator['config']).toEqual({
        maxDistancePoints: 1000,
        maxTimeBonus: 500,
        maxDistanceKm: 10,
        timeBonusThreshold: 2,
        nearBorderDistance: 10,
        nearBorderBonus: 2000,
        correctNeighborhoodBonus: 1000,
        maxTotalDistanceKm: 4
      });
    });

    it('should override default config with provided values', () => {
      const customConfig = {
        maxDistancePoints: 2000,
        maxTimeBonus: 1000,
        maxDistanceKm: 20,
        timeBonusThreshold: 5,
        nearBorderDistance: 20,
        nearBorderBonus: 4000,
        correctNeighborhoodBonus: 2000,
        maxTotalDistanceKm: 8
      };
      const calculator = new ScoreCalculator(customConfig);
      expect(calculator['config']).toEqual(customConfig);
    });
  });

  describe('calculateBaseScore', () => {
    it('should calculate maximum score for zero distance', () => {
      const score = calculator.calculateBaseScore(0, 10);
      expect(score.distancePoints).toBe(1000);
      expect(score.timePoints).toBeGreaterThan(400);
      expect(score.timePoints).toBeLessThanOrEqual(500);
      expect(score.total).toBeGreaterThan(1400);
      expect(score.total).toBeLessThanOrEqual(1500);
    });

    it('should calculate zero score for maximum distance', () => {
      const score = calculator.calculateBaseScore(10000, 10); // 10km
      expect(score.distancePoints).toBe(0);
      expect(score.timePoints).toBe(0);
      expect(score.total).toBe(0);
    });

    it('should calculate score without penalty for distance below 70% threshold', () => {
      const score = calculator.calculateBaseScore(6000, 10); // 6km = 60% do máximo
      const expectedBaseScore = Math.round(1000 * (1 - 6/10)); // 400 pontos
      expect(score.distancePoints).toBe(expectedBaseScore);
      expect(score.timePoints).toBeGreaterThan(0);
      expect(score.timePoints).toBeLessThan(200);
    });

    it('should apply penalty for distance above 70% threshold', () => {
      const score = calculator.calculateBaseScore(8000, 10); // 8km = 80% do máximo
      // Distância base seria 200 pontos (1000 * (1 - 8/10))
      // penaltyFactor = (8 - 7) / 3 = 0.33
      // Penalidade = 200 * 0.33 = ~66 pontos
      // Score final esperado ~134 pontos
      expect(score.distancePoints).toBeGreaterThan(100);
      expect(score.distancePoints).toBeLessThan(150);
      expect(score.timePoints).toBeGreaterThan(0);
      expect(score.timePoints).toBeLessThan(100);
    });

    it('should apply maximum penalty near max distance', () => {
      const score = calculator.calculateBaseScore(9500, 10); // 9.5km = 95% do máximo
      // Distância base seria 50 pontos (1000 * (1 - 9.5/10))
      // penaltyFactor = (9.5 - 7) / 3 = 0.83
      // Penalidade = 200 * 0.83 = ~166 pontos
      // Score final esperado muito baixo, mas não necessariamente zero
      expect(score.distancePoints).toBeLessThan(50);
      expect(score.timePoints).toBeLessThan(50);
      expect(score.total).toBeLessThan(100);
    });

    it('should handle intermediate distances with proportional penalties', () => {
      // Testar várias distâncias para verificar a progressão da penalidade
      const distances = [7500, 8000, 8500, 9000]; // 75%, 80%, 85%, 90%
      let lastScore = Infinity;
      
      for (const distance of distances) {
        const score = calculator.calculateBaseScore(distance, 10);
        expect(score.distancePoints).toBeLessThan(lastScore);
        lastScore = score.distancePoints;
        // Garantir que a pontuação nunca é negativa
        expect(score.distancePoints).toBeGreaterThanOrEqual(0);
      }
    });

    it('should calculate time bonus correctly for fast response', () => {
      const score = calculator.calculateBaseScore(0, 1); // 1 segundo restante
      expect(score.distancePoints).toBe(1000);
      expect(score.timePoints).toBeGreaterThan(50);
      expect(score.timePoints).toBeLessThan(200);
      expect(score.total).toBeGreaterThan(1050);
      expect(score.total).toBeLessThan(1200);
    });

    it('should handle time above threshold gracefully', () => {
      const score = calculator.calculateBaseScore(0, 20);
      expect(score.distancePoints).toBe(1000);
      expect(score.timePoints).toBeGreaterThan(400);
      expect(score.timePoints).toBeLessThanOrEqual(500);
      expect(score.total).toBeGreaterThan(1400);
      expect(score.total).toBeLessThanOrEqual(1500);
    });
  });

  describe('calculateFinalScore', () => {
    it('should give near border bonus when distance is less than threshold', () => {
      // Pontos muito próximos (menos de 10m de distância)
      const clicked = new LatLng(-23.550520, -46.633308);
      const target = new LatLng(-23.550520, -46.633318);
      const score = calculator.calculateFinalScore(clicked, target, 10, false);
      
      expect(score.isNearBorder).toBe(true);
      expect(score.total).toBeGreaterThan(1800);
      expect(score.total).toBeLessThanOrEqual(2000);
    });

    it('should give correct neighborhood bonus', () => {
      // Pontos no mesmo bairro mas com alguma distância
      const clicked = new LatLng(-23.550520, -46.633308);
      const target = new LatLng(-23.551520, -46.634308);
      const score = calculator.calculateFinalScore(clicked, target, 10, true);
      
      expect(score.isNearBorder).toBe(false);
      expect(score.total).toBeGreaterThan(600);
      expect(score.total).toBeLessThan(900);
    });

    it('should apply time multiplier to bonus scores', () => {
      // Pontos próximos com metade do tempo
      const clicked = new LatLng(-23.550520, -46.633308);
      const target = new LatLng(-23.550520, -46.633318);
      const score = calculator.calculateFinalScore(clicked, target, 5, false);
      
      expect(score.isNearBorder).toBe(true);
      expect(score.total).toBeGreaterThan(1200);
      expect(score.total).toBeLessThan(1600);
    });

    it('should calculate regular score when not near border or correct neighborhood', () => {
      // Pontos distantes e em bairros diferentes
      const clicked = new LatLng(-23.550520, -46.633308);
      const target = new LatLng(-23.560520, -46.643308);
      const score = calculator.calculateFinalScore(clicked, target, 10, false);
      
      expect(score.isNearBorder).toBe(false);
      expect(score.total).toBeLessThan(700);
      expect(score.total).toBeGreaterThan(0);
    });
  });

  describe('getTimeMultiplier', () => {
    it('should calculate correct multiplier for perfect conditions', () => {
      // Tempo máximo (10s) e distância zero
      expect(calculator.getTimeMultiplier(10, 0)).toBeCloseTo(1, 2);
    });

    it('should calculate reduced multiplier for greater distances', () => {
      // Mesmo tempo (10s), mas distâncias diferentes
      const nearMultiplier = calculator.getTimeMultiplier(10, 1000);  // 1km
      const farMultiplier = calculator.getTimeMultiplier(10, 5000);   // 5km
      const veryFarMultiplier = calculator.getTimeMultiplier(10, 9000); // 9km

      expect(nearMultiplier).toBeGreaterThan(farMultiplier);
      expect(farMultiplier).toBeGreaterThan(veryFarMultiplier);
      expect(veryFarMultiplier).toBeGreaterThan(0);
    });

    it('should apply logarithmic scaling to time', () => {
      // Testar em distância zero para isolar o efeito do tempo
      const fullTimeMultiplier = calculator.getTimeMultiplier(10, 0);
      const halfTimeMultiplier = calculator.getTimeMultiplier(5, 0);
      const quarterTimeMultiplier = calculator.getTimeMultiplier(2.5, 0);

      // Com escala logarítmica, a diferença entre 10s e 5s deve ser menor
      // que a diferença entre 5s e 2.5s
      const upperDiff = fullTimeMultiplier - halfTimeMultiplier;
      const lowerDiff = halfTimeMultiplier - quarterTimeMultiplier;

      expect(upperDiff).toBeLessThan(lowerDiff);
    });

    it('should handle distance decay correctly', () => {
      // Tempo fixo em 10s, testando o decaimento por distância
      const distances = [0, 2000, 4000, 6000, 8000, 10000]; // 0km a 10km
      const multipliers = distances.map(d => calculator.getTimeMultiplier(10, d));

      // Verificar se o decaimento é progressivo
      for (let i = 1; i < multipliers.length; i++) {
        expect(multipliers[i]).toBeLessThan(multipliers[i-1]);
      }

      // O último multiplicador (10km) deve ser próximo de zero
      expect(multipliers[multipliers.length - 1]).toBeCloseTo(0, 2);
    });

    it('should handle zero time correctly', () => {
      expect(calculator.getTimeMultiplier(0, 0)).toBe(0);
      expect(calculator.getTimeMultiplier(0, 5000)).toBe(0);
    });

    it('should handle edge cases', () => {
      // Tempo negativo
      expect(calculator.getTimeMultiplier(-1, 0)).toBe(0);
      
      // Distância negativa
      expect(calculator.getTimeMultiplier(10, -1000)).toBeCloseTo(1, 2);
      
      // Valores muito grandes
      expect(calculator.getTimeMultiplier(1000, 0)).toBeCloseTo(1, 2);
      expect(calculator.getTimeMultiplier(10, 1000000)).toBeCloseTo(0, 2);
    });

    it('should provide smooth transition in mid-range values', () => {
      // Testar valores intermediários para garantir transição suave
      const midRangeMultiplier = calculator.getTimeMultiplier(5, 3000);
      
      // Deve estar entre 0 e 1
      expect(midRangeMultiplier).toBeGreaterThan(0);
      expect(midRangeMultiplier).toBeLessThan(1);
      
      // Deve ser aproximadamente 0.25-0.35 para esses valores médios
      expect(midRangeMultiplier).toBeGreaterThan(0.15);
      expect(midRangeMultiplier).toBeLessThan(0.45);
    });
  });

  describe('edge cases', () => {
    it('should handle negative distances', () => {
      const score = calculator.calculateBaseScore(-1000, 10);
      expect(score.total).toBe(1000); // Deve tratar como distância zero
    });

    it('should handle negative time', () => {
      const score = calculator.calculateBaseScore(0, -1);
      expect(score.timePoints).toBe(0); // Não deve dar bônus de tempo
    });

    it('should handle very large distances', () => {
      const score = calculator.calculateBaseScore(1000000, 10);
      expect(score.total).toBe(0); // Não deve dar pontos para distâncias muito grandes
    });

    it('should handle very large time values', () => {
      const score = calculator.calculateBaseScore(0, 1000);
      expect(score.timePoints).toBe(0); // Não deve dar bônus para tempo muito alto
    });
  });

  describe('game over by total distance', () => {
    it('should not be game over when total distance is below threshold', () => {
      const calculator = new ScoreCalculator();
      const target = new LatLng(0, 0);
      // Aproximadamente 1.5km por clique (total 3km após dois cliques)
      const click = new LatLng(0.00675, 0.00675);
      
      const result1 = calculator.calculateFinalScore(click, target, 10, false);
      const result2 = calculator.calculateFinalScore(click, target, 10, false);
      
      expect(calculator.isGameOver()).toBe(false);
      expect(calculator.getTotalDistance()).toBeLessThan(4000);
      expect(result1.total).toBeGreaterThan(0);
      expect(result2.total).toBeGreaterThan(0);
    });

    it('should be game over when total distance exceeds threshold', () => {
      const calculator = new ScoreCalculator();
      const target = new LatLng(0, 0);
      // Aproximadamente 2.5km por clique
      const click = new LatLng(0.0112, 0.0112);
      
      const result1 = calculator.calculateFinalScore(click, target, 10, false);
      const result2 = calculator.calculateFinalScore(click, target, 10, false);
      
      expect(calculator.isGameOver()).toBe(true);
      expect(calculator.getTotalDistance()).toBeGreaterThan(4000);
      expect(result1.total).toBeGreaterThan(0); // Primeiro clique ainda deve dar pontos
      expect(result2.total).toBe(0); // Segundo clique deve retornar zero pontos
    });

    it('should reset total distance when resetTotalDistance is called', () => {
      const calculator = new ScoreCalculator();
      const target = new LatLng(0, 0);
      // Aproximadamente 2.5km por clique
      const click = new LatLng(0.0112, 0.0112);
      
      const result1 = calculator.calculateFinalScore(click, target, 10, false);
      const result2 = calculator.calculateFinalScore(click, target, 10, false);
      
      expect(calculator.isGameOver()).toBe(true);
      expect(calculator.getTotalDistance()).toBeGreaterThan(4000);
      expect(result2.total).toBe(0);
      
      calculator.resetTotalDistance();
      expect(calculator.isGameOver()).toBe(false);
      expect(calculator.getTotalDistance()).toBe(0);
      
      // Deve permitir pontuação novamente após reset
      const result3 = calculator.calculateFinalScore(click, target, 10, false);
      expect(result3.total).toBeGreaterThan(0);
    });
  });
}); 