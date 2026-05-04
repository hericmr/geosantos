import React, { useRef, useEffect } from 'react';

const CELL_H = 60;
const FONT = "'Inter', system-ui, sans-serif";

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
      el.style.transition = `transform 5s cubic-bezier(0.15, 0.5, 0.3, 1)`;
      el.style.transform = `translateY(-${n * CELL_H}px)`;
    }, delay);

    return () => clearTimeout(tid);
  }, [n, isNum, delay]);

  if (!isNum) {
    return (
      <div style={{
        height: `${CELL_H}px`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontSize: `${CELL_H * 0.38}px`,
        fontFamily: FONT,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.6)',
        paddingBottom: '10px',
        paddingLeft: '3px',
      }}>
        {char}
      </div>
    );
  }

  return (
    <div style={{
      width: `${CELL_H * 0.62}px`,
      height: `${CELL_H}px`,
      overflow: 'hidden',
      background: 'rgba(0,0,0,0.55)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '5px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '28%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)',
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
            fontSize: `${CELL_H * 0.62}px`,
            fontFamily: FONT,
            fontWeight: 700,
            color: '#f1f5f9',
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
  valueMeters: number;
}

export const OdometerDisplay: React.FC<OdometerDisplayProps> = ({ valueMeters }) => {
  const rounded = Math.round(valueMeters);
  const chars = [...String(rounded), 'm'];

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
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
      {chars.map((c, i) => (
        <OdometerDigit key={i} char={c} delay={i * 120} />
      ))}
    </div>
  );
};
