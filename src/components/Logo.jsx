// src/components/Logo.jsx
import React from 'react';

export const LogoIsotype = ({ size = 28, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0EA5E9" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
    </defs>
    {/* Concentric node rings for CRM / connectivity feel */}
    <path
      d="M12 2L2 7l10 5 10-5-10-5z"
      fill="url(#logo-grad)"
      opacity="0.85"
    />
    <path
      d="M2 17l10 5 10-5"
      stroke="url(#logo-grad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12l10 5 10-5"
      stroke="url(#logo-grad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.7"
    />
  </svg>
);

export const FullLogo = ({ size = 32, showText = true }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <LogoIsotype size={size} />
    {showText && (
      <span style={{
        fontFamily: 'Lexend, sans-serif',
        fontWeight: '700',
        fontSize: '1.25rem',
        color: 'var(--text-main)',
        letterSpacing: '-0.5px'
      }}>
        Soluciones<span style={{ color: 'var(--accent-blue)' }}>SIG</span>
      </span>
    )}
  </div>
);
