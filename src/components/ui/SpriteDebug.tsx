import React from 'react';
import { getSpriteUrl } from '../../utils/assetUtils';

const SpriteDebug: React.FC = () => {
  const testSprite = getSpriteUrl('1.png');
  
  console.log('🧪 SpriteDebug - URL gerada:', testSprite);
  
  return (
    <div style={{
      padding: '20px',
      border: '2px solid red',
      margin: '20px',
      backgroundColor: '#fff'
    }}>
      <h2>🧪 Debug dos Sprites</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>URLs de teste:</h3>
        <p><strong>getSpriteUrl('1.png'):</strong> {testSprite}</p>
        <p><strong>getSpriteUrl('2.png'):</strong> {getSpriteUrl('2.png')}</p>
        <p><strong>getSpriteUrl('16.png'):</strong> {getSpriteUrl('16.png')}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Teste de carregamento:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(frame => (
            <div key={frame} style={{
              border: '1px solid #ccc',
              padding: '5px',
              textAlign: 'center',
              width: '80px'
            }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>Frame {frame}</p>
              <img
                src={getSpriteUrl(`${frame}.png`)}
                alt={`Frame ${frame}`}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain',
                  border: '1px solid #ddd'
                }}
                onLoad={() => console.log(`✅ Frame ${frame} carregado com sucesso`)}
                onError={(e) => console.error(`❌ Erro ao carregar frame ${frame}:`, e)}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>Console Logs:</h3>
        <p>Abra o console do navegador (F12) para ver os logs detalhados</p>
        <p>Verifique se as URLs estão sendo geradas corretamente</p>
        <p>Verifique se as imagens estão sendo carregadas</p>
      </div>
    </div>
  );
};

export default SpriteDebug; 