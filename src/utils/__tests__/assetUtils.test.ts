import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAssetUrl, getImageUrl, getAudioUrl, getDataUrl, getFontUrl } from '../assetUtils';

// Mock do import.meta.env
const mockEnv = {
  BASE_URL: '/geosantos/'
};

vi.stubGlobal('import', {
  meta: {
    env: mockEnv
  }
});

describe('assetUtils', () => {
  beforeEach(() => {
    // Reset do mock antes de cada teste
    vi.clearAllMocks();
  });

  describe('getAssetUrl', () => {
    it('should return correct URL with BASE_URL', () => {
      const result = getAssetUrl('assets/images/test.png');
      expect(result).toBe('/geosantos/assets/images/test.png');
    });

    it('should handle path with leading slash', () => {
      const result = getAssetUrl('/assets/images/test.png');
      expect(result).toBe('/geosantos/assets/images/test.png');
    });

    it('should handle empty BASE_URL', () => {
      mockEnv.BASE_URL = '';
      const result = getAssetUrl('assets/images/test.png');
      expect(result).toBe('assets/images/test.png');
    });

    it('should handle undefined BASE_URL', () => {
      mockEnv.BASE_URL = undefined as any;
      const result = getAssetUrl('assets/images/test.png');
      expect(result).toBe('assets/images/test.png');
    });
  });

  describe('getImageUrl', () => {
    it('should return correct image URL', () => {
      const result = getImageUrl('test.png');
      expect(result).toBe('/geosantos/assets/images/test.png');
    });
  });

  describe('getAudioUrl', () => {
    it('should return correct audio URL', () => {
      const result = getAudioUrl('test.mp3');
      expect(result).toBe('/geosantos/assets/audio/test.mp3');
    });
  });

  describe('getDataUrl', () => {
    it('should return correct data URL', () => {
      const result = getDataUrl('test.json');
      expect(result).toBe('/geosantos/assets/data/test.json');
    });
  });

  describe('getFontUrl', () => {
    it('should return correct font URL', () => {
      const result = getFontUrl('test.ttf');
      expect(result).toBe('/geosantos/assets/test.ttf');
    });
  });
}); 