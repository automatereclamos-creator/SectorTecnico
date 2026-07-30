import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { supabase } from '../config/supabase';

const MaintenancePage = ({ email }) => {
  const [extraMonkeys, setExtraMonkeys] = useState([]);

  const handleTrollClick = (e) => {
    e.preventDefault();
    const top = Math.floor(Math.random() * 70) + 10;
    const left = Math.floor(Math.random() * 70) + 10;
    const size = Math.floor(Math.random() * 80) + 110;
    const rotate = Math.floor(Math.random() * 60) - 30;

    setExtraMonkeys((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        top,
        left,
        size,
        rotate,
      },
    ]);
  };

  const handleRealSignOut = () => {
    supabase.auth.signOut();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      padding: '20px',
      textAlign: 'center',
      transition: 'background-color var(--transition)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background gears & popIn keyframes */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.2), 0 0 40px rgba(251, 191, 36, 0.1); }
          50% { box-shadow: 0 0 35px rgba(251, 191, 36, 0.4), 0 0 70px rgba(251, 191, 36, 0.2); }
        }
        @keyframes dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
        }
        @keyframes popIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          70% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .maintenance-dots::after {
          content: '';
          animation: dots 1.5s steps(4, end) infinite;
        }
        .maintenance-card {
          animation: float 4s ease-in-out infinite;
        }
        .maintenance-gear-1 {
          position: absolute;
          top: 10%;
          left: 8%;
          opacity: 0.04;
          animation: spin-slow 20s linear infinite;
          pointer-events: none;
        }
        .maintenance-gear-2 {
          position: absolute;
          bottom: 15%;
          right: 5%;
          opacity: 0.03;
          animation: spin-reverse 25s linear infinite;
          pointer-events: none;
        }
        .maintenance-monkey-container {
          position: relative;
          display: inline-block;
          margin: 0 auto 20px;
          border-radius: 50%;
          animation: pulse-glow 3s ease-in-out infinite;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .maintenance-monkey-container:hover {
          transform: scale(1.08);
        }
        .maintenance-monkey-container:active {
          transform: scale(0.95);
        }
        .maintenance-monkey-container img {
          display: block;
          width: 220px;
          height: 220px;
          object-fit: contain;
          border-radius: 50%;
        }
        .extra-troll-monkey {
          animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @media (max-width: 480px) {
          .maintenance-monkey-container img {
            width: 180px;
            height: 180px;
          }
          .maintenance-card {
            padding: 25px 18px !important;
          }
        }
      `}</style>

      {/* Spawned extra troll monkeys */}
      {extraMonkeys.map((m) => (
        <div
          key={m.id}
          className="extra-troll-monkey"
          style={{
            position: 'fixed',
            top: `${m.top}%`,
            left: `${m.left}%`,
            zIndex: 9999,
            transform: `rotate(${m.rotate}deg)`,
            pointerEvents: 'none',
          }}
        >
          <img
            src="https://media.tenor.com/TpW10D1VIH8AAAAj/simpsons-monkey.gif"
            alt="Mono troll extra"
            style={{
              width: `${m.size}px`,
              height: `${m.size}px`,
              objectFit: 'contain',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
            }}
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Decorative background gears */}
      <svg className="maintenance-gear-1" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="0.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <svg className="maintenance-gear-2" width="280" height="280" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="0.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      <div className="card maintenance-card" style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '40px 30px',
        position: 'relative',
        zIndex: 2
      }}>

        {/* Monkey GIF centered — Clicking HERE actually logs out */}
        <div
          className="maintenance-monkey-container"
          onClick={handleRealSignOut}
          title="Click en el mono para cerrar sesión"
        >
          <img
            src="https://media.tenor.com/TpW10D1VIH8AAAAj/simpsons-monkey.gif"
            alt="Mono de los Simpsons tocando los platillos"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </div>

        <h1 style={{
          color: 'var(--text-main)',
          fontSize: '1.6rem',
          fontWeight: '700',
          marginBottom: '10px',
          fontFamily: "'Lexend', system-ui, sans-serif"
        }}>
          Estamos en mantenimiento
        </h1>

        <p className="maintenance-dots" style={{
          color: '#fbbf24',
          fontSize: '0.95rem',
          fontWeight: '600',
          marginBottom: '15px',
          letterSpacing: '0.02em'
        }}>
          Realizando mejoras en el sistema
        </p>

        <p style={{
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          marginBottom: '25px',
          fontSize: '0.9rem'
        }}>
          Nuestro equipo está trabajando para brindarte una mejor experiencia.
          Volveremos en breve. ¡Gracias por tu paciencia!
        </p>

        {/* Info box */}
        <div style={{
          backgroundColor: 'var(--bg-input)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid #fbbf24',
          marginBottom: '25px',
          textAlign: 'left'
        }}>
          <p style={{
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            margin: 0,
            lineHeight: '1.5'
          }}>
            🔧 Si necesitás acceso urgente, contactá al administrador del sistema.
          </p>
        </div>

        {/* Logged in as */}
        {email && (
          <p style={{
            color: 'var(--text-hint)',
            fontSize: '0.8rem',
            marginBottom: '15px'
          }}>
            Sesión iniciada como <strong style={{ color: 'var(--text-muted)' }}>{email}</strong>
          </p>
        )}

        {/* Troll button: Clicking spawns extra monkeys */}
        <button
          onClick={handleTrollClick}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-md)',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-main)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'background var(--transition), color var(--transition)',
            fontSize: '0.9rem'
          }}
          className="btn-cancel"
        >
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default MaintenancePage;
