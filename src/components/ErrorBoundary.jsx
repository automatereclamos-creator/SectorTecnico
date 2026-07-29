import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isInline = this.props.variant === 'inline';
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isInline ? '300px' : '100vh',
          height: isInline ? '100%' : 'auto',
          backgroundColor: isInline ? 'transparent' : 'var(--bg-main, #0B0F19)',
          color: 'var(--text-main, #F9FAFB)',
          fontFamily: "'Source Sans 3', system-ui, sans-serif",
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card, #1F2937)',
            border: '1px solid var(--border-md, rgba(243,244,246,0.12))',
            borderRadius: '16px',
            padding: isInline ? '30px 20px' : '40px 30px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              marginBottom: '10px',
              fontFamily: "'Lexend', system-ui, sans-serif"
            }}>
              Algo salió mal
            </h2>

            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted, #9CA3AF)',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              Ocurrió un error inesperado. Intentá recargar la página para continuar.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                backgroundColor: 'var(--accent-blue, #0284C7)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <RefreshCw size={18} />
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
