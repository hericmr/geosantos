import { capitalizeWords } from '../textUtils';

describe('textUtils', () => {
  describe('capitalizeWords', () => {
    it('capitalizes first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
    });

    it('handles already capitalized words', () => {
      expect(capitalizeWords('HELLO WORLD')).toBe('Hello World');
    });

    it('handles mixed case words', () => {
      expect(capitalizeWords('hElLo WoRlD')).toBe('Hello World');
    });

    it('handles single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
    });

    it('handles empty string', () => {
      expect(capitalizeWords('')).toBe('');
    });

    it('handles multiple spaces', () => {
      expect(capitalizeWords('hello   world')).toBe('Hello   World');
    });
  });
}); 