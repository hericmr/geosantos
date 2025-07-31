import { renderHook } from '@testing-library/react';
import { useMobileDetection } from '../useMobileDetection';

// Mock do window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock do navigator.userAgent
const mockUserAgent = (userAgent: string) => {
  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    configurable: true,
    value: userAgent,
  });
};

describe('useMobileDetection', () => {
  beforeEach(() => {
    // Reset dos mocks
    mockInnerWidth(1024);
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  });

  it('returns false for desktop screen width', () => {
    mockInnerWidth(1024);
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(false);
  });

  it('returns true for mobile screen width', () => {
    mockInnerWidth(768);
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
  });

  it('returns true for small mobile screen width', () => {
    mockInnerWidth(375);
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
  });

  it('returns true for mobile user agent even with desktop width', () => {
    mockInnerWidth(1024);
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
  });

  it('returns true for Android user agent', () => {
    mockInnerWidth(1024);
    mockUserAgent('Mozilla/5.0 (Linux; Android 10; SM-G975F)');
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
  });

  it('returns true for iPad user agent', () => {
    mockInnerWidth(1024);
    mockUserAgent('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
  });

  it('returns true for BlackBerry user agent', () => {
    mockInnerWidth(1024);
    mockUserAgent('Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en)');
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
  });

  it('returns true for Opera Mini user agent', () => {
    mockInnerWidth(1024);
    mockUserAgent('Opera/9.80 (J2ME/MIDP; Opera Mini/9.80)');
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(true);
  });

  it('returns false for desktop user agent with desktop width', () => {
    mockInnerWidth(1024);
    mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    const { result } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(false);
  });

  it('handles window resize events', () => {
    mockInnerWidth(1024);
    const { result, rerender } = renderHook(() => useMobileDetection());
    
    expect(result.current).toBe(false);
    
    // Simula resize para mobile
    mockInnerWidth(768);
    window.dispatchEvent(new Event('resize'));
    
    // Força re-render para capturar a mudança
    rerender();
    
    expect(result.current).toBe(true);
  });
}); 