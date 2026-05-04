import React, { useRef, useEffect } from 'react';

const CELL_H = 60; // px — altura de cada célula de dígito

const OdometerDigit: React.FC<{ char: string; delay: number }> = ({ char, delay }) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const n = parseInt(char);
  const isNum = !isNaN(n);

  useEffect(() => {
    if (!isNum || !stripRef.current) return;
    const el = stripRef.current;
    el.style.transform = 'translateY(0)';
    el.style.transition = 'none';

    const tid = setTimeout(() => {
      el.style.transition = `transform 2.6s cubic-bezier(0.22, 0.61, 0.36, 1)`;
      el.style.transform = `translateY(-${n * CELL_H}px)`;
    }, delay * 4);

    return () => clearTimeout(tid);
  }, [n, isNum, delay]);

  // Separador decimal ou unidade ("." / "k" / "m")
  if (!isNum) {
    return (
      <div style={{
        height: `${CELL_H}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: char === '.' ? `${CELL_H * 0.55}px` : `${CELL_H * 0.42}px`,
        fontFamily: "'VT323', monospace",
        color: '#e2e8f0',
        padding: '0 2px',
        lineHeight: 1,
        alignSelf: 'flex-end',
        paddingBottom: char === '.' ? '6px' : '10px',
      }}>
        {char}
      </div>
    );
  }

  return (
    <div style={{
      width: `${CELL_H * 0.6}px`,
      height: `${CELL_H}px`,
      overflow: 'hidden',
      background: 'rgba(0,0,0,0.6)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '4px',
      position: 'relative',
    }}>
      {/* Reflexo superior */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '30%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      <div ref={stripRef} style={{ display: 'flex', flexDirection: 'column' }}>
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <div key={i} style={{
            height: `${CELL_H}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${CELL_H * 0.78}px`,
            fontFamily: "'VT323', monospace",
            color: '#e2e8f0',
            lineHeight: 1,
          }}>
            {i}
          </div>
        ))}
      </div>
    </div>
  );
};

interface OdometerDisplayProps {
  valueKm: number;
}

export const OdometerDisplay: React.FC<OdometerDisplayProps> = ({ valueKm }) => {
  const formatted = valueKm.toFixed(1); // e.g. "3.2"
  const chars = [...formatted, 'k', 'm'];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'flex-end',
      gap: '3px',
      background: 'linear-gradient(160deg, #0d0f1a 0%, #080a12 100%)',
      padding: '10px 14px',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
      {chars.map((c, i) => (
        <OdometerDigit key={i} char={c} delay={i * 70} />
      ))}
    </div>
  );
};
