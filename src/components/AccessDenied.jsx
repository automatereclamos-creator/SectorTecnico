import React from 'react';
import { ShieldAlert, LogOut, MessageSquare } from 'lucide-react';
import { supabase } from '../config/supabase';

const AccessDenied = ({ email }) => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      padding: '20px',
      textAlign: 'center',
      transition: 'background-color var(--transition)'
    }}>
      <div className="card" style={{
        maxWidth: '450px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '40px 30px'
      }}>
        <div style={{ 
          backgroundColor: 'var(--error-bg)',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 25px',
          border: '1px solid rgba(220, 38, 38, 0.2)'
        }}>
          <ShieldAlert size={40} color="var(--error)" />
        </div>
        
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '15px' }}>Acceso No Autorizado</h1>
        
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
          Tu cuenta <strong style={{ color: 'var(--text-main)' }}>{email}</strong> no tiene un rol asignado en el sistema de Pálpitos SRL.
        </p>

        <div style={{ 
          backgroundColor: 'var(--bg-input)',
          padding: '15px', 
          borderRadius: 'var(--radius-md)',
          borderLeft: '3px solid var(--accent-indigo)',
          marginBottom: '30px' 
        }}>
          <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <MessageSquare size={16} style={{ color: 'var(--accent-indigo)' }} /> 
            Solicitá al administrador que registre tu cuenta según el rol correspondiente.
          </p>
        </div>

        <button 
          onClick={() => supabase.auth.signOut()}
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
            justifycontent: 'center',
            gap: '10px',
            transition: 'background var(--transition), color var(--transition)'
          }}
          className="btn-cancel"
        >
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;