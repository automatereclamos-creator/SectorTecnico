// src/components/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import { FullLogo } from './Logo';
import '../styles.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { prompt: 'select_account' },
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (err) {
      console.error(err);
      setError("Error al conectar con Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '30px', border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
          <FullLogo size={36} />
        </div>

        <div className="card-header" style={{ padding: '0 0 20px 0', borderBottom: '1px solid var(--border)', textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Acceso al Sistema</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-hint)', marginTop: '4px' }}>Iniciá sesión para continuar</p>
        </div>
        
        <div className="card-body" style={{ padding: 0 }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="field">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="tecnico@palpitos.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>

            <div className="field">
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn-submit" 
              disabled={isLoading}
              style={{ marginTop: '10px' }}
            >
              {isLoading ? "Verificando..." : "Ingresar"}
            </button>
          </form>

          <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
            <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px solid var(--border)', zIndex: 1 }}></span>
            <span style={{ position: 'relative', background: 'var(--bg-card)', padding: '0 10px', fontSize: '0.75rem', color: 'var(--text-hint)', zIndex: 2 }}>O CONTINUAR CON</span>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            className="btn-google" 
            disabled={isLoading}
            type="button"
            style={{ 
              marginTop: 0, 
              background: 'var(--bg-input)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-md)' 
            }}
          >
            <svg 
              style={{ width: '18px', height: '18px' }} 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>

          {error && (
            <div className="msg error" style={{ marginTop: '15px' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;