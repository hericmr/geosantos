import React from 'react';
import { Link } from 'react-router-dom';
import { PlaceSuggestionForm } from './PlaceSuggestionForm';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';

export const SuggestPlacePage: React.FC = () => {
  const [showForm, setShowForm] = React.useState(false);

  if (showForm) {
    return <PlaceSuggestionForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      padding: '20px',
      fontFamily: "'LaCartoonerie', sans-serif",
      color: 'var(--text-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(87, 189, 205, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '40px',
        maxWidth: '1200px',
        margin: '0 auto 40px auto',
        position: 'relative',
        zIndex: 1
      }}>
        <Link 
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            fontSize: '1.1rem',
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-blue)',
            transition: 'var(--transition-normal)',
            fontFamily: "'LaCartoonerie', sans-serif",
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-md)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-blue)';
            e.currentTarget.style.color = 'var(--bg-primary)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)';
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          <ArrowLeft size={20} />
          Voltar ao Jogo
        </Link>
        
        <h1 style={{
          color: 'var(--text-primary)',
          fontSize: '2.5rem',
          margin: 0,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          flex: 1,
          textAlign: 'center',
          fontFamily: "'LaCartoonerie', sans-serif",
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Sugerir Novo Lugar
        </h1>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'start',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Left Column - Info */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '2px solid var(--accent-blue)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(87, 189, 205, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--accent-blue)'
            }}>
              <MapPin size={32} />
            </div>
            <h2 style={{
              fontSize: '2rem',
              margin: 0,
              color: 'var(--text-primary)',
              fontFamily: "'LaCartoonerie', sans-serif",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Ajude a Expandir o GeoSantos!
            </h2>
          </div>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            fontFamily: "'LaCartoonerie', sans-serif",
            position: 'relative',
            zIndex: 1
          }}>
            Conhece um lugar interessante em Santos que deveria estar no jogo? 
            Sugira novos pontos turísticos, locais históricos ou lugares especiais 
            para que outros jogadores possam descobrir!
          </p>

          <div style={{
            background: 'var(--gradient-success)',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            marginBottom: '24px',
            border: '2px solid var(--accent-green)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: "'LaCartoonerie', sans-serif",
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#000000'
            }}>
              <Plus size={24} />
              Como Sugerir
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '1rem',
              lineHeight: 1.8,
              fontFamily: "'LaCartoonerie', sans-serif",
              color: '#000000'
            }}>
              <li>1. Clique no mapa para selecionar a localização exata do lugar</li>
              <li>2. Preencha os dados do lugar (nome, descrição, categoria, etc.)</li>
              <li>3. Adicione seus dados para que possamos entrar em contato</li>
              <li>4. Clique em "Enviar Sugestão" para abrir seu cliente de email</li>
            </ul>
          </div>

          <div style={{
            background: 'var(--bg-accent)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-orange)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            zIndex: 1
          }}>
            <h4 style={{
              fontSize: '1.1rem',
              margin: '0 0 12px 0',
              color: '#000000',
              fontFamily: "'LaCartoonerie', sans-serif",
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              💡 Dicas:
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#000000',
              fontFamily: "'LaCartoonerie', sans-serif"
            }}>
              <li>• Lugares históricos e culturais são prioridade</li>
              <li>• Inclua uma imagem se possível</li>
              <li>• Descreva por que o lugar é importante</li>
              <li>• Verifique se as coordenadas estão corretas</li>
            </ul>
          </div>

          <div style={{
            background: '#fff3cd',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #ffc107',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            zIndex: 1
          }}>
            <h4 style={{
              fontSize: '1.1rem',
              margin: '0 0 12px 0',
              color: '#000000',
              fontFamily: "'LaCartoonerie', sans-serif",
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              ⚠️ Importante:
            </h4>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#000000',
              fontFamily: "'LaCartoonerie', sans-serif",
              margin: 0
            }}>
              Sua sugestão será analisada pela equipe do GeoSantos. Lugares aprovados serão adicionados ao jogo em futuras atualizações.
            </p>
          </div>
        </div>

        {/* Right Column - CTA */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          border: '2px solid var(--accent-green)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '400px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            background: 'var(--gradient-primary)',
            padding: '32px',
            borderRadius: '50%',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-lg)',
            border: '3px solid var(--accent-blue)',
            position: 'relative',
            zIndex: 1
          }}>
            <Plus size={48} color="var(--text-primary)" />
          </div>

          <h2 style={{
            fontSize: '2rem',
            margin: '0 0 16px 0',
            color: 'var(--text-primary)',
            fontFamily: "'LaCartoonerie', sans-serif",
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            position: 'relative',
            zIndex: 1
          }}>
            Pronto para Contribuir?
          </h2>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            maxWidth: '400px',
            fontFamily: "'LaCartoonerie', sans-serif",
            position: 'relative',
            zIndex: 1
          }}>
            Clique no botão abaixo para abrir o formulário de sugestão. 
            Você poderá selecionar a localização no mapa e preencher todos os detalhes.
          </p>

          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--text-primary)',
              border: '3px solid var(--accent-blue)',
              padding: '16px 32px',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'var(--transition-normal)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: "'LaCartoonerie', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '1px',
              position: 'relative',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              e.currentTarget.style.background = 'var(--accent-blue)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              e.currentTarget.style.background = 'var(--gradient-primary)';
            }}
          >
            <Plus size={24} />
            Abrir Formulário
          </button>

          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginTop: '24px',
            fontStyle: 'italic',
            fontFamily: "'LaCartoonerie', sans-serif",
            position: 'relative',
            zIndex: 1
          }}>
            Sua sugestão será analisada pela equipe do GeoSantos
          </p>
        </div>
      </div>
    </div>
  );
}; 