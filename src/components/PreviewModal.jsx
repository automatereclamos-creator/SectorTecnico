import React from 'react';
import { X, Copy, Check, Send } from 'lucide-react';

const PreviewModal = ({ isOpen, onClose, onConfirm, previewContent, isSubmitting, isCopied, onCopy }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <span>Confirmar registro</span>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <pre className="preview-block">{previewContent}</pre>

          {onCopy && (
            <button
              className={`btn-copy ${isCopied ? 'copied' : ''}`}
              onClick={onCopy}
              aria-label={isCopied ? 'Texto copiado' : 'Copiar texto'}
            >
              {isCopied
                ? <><Check size={14} /> Copiado al portapapeles</>
                : <><Copy size={14} /> Copiar texto</>
              }
            </button>
          )}

          <p className="modal-note">Revisá los datos antes de guardar.</p>

          <div className="modal-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' }}>
            <button 
              className="btn-cancel" 
              onClick={onClose}
              style={{ flex: 1, minWidth: '100px', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-md)', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}
            >
              Volver
            </button>
            
            <button
              className="btn-secondary"
              onClick={() => onConfirm(false)}
              disabled={isSubmitting}
              style={{ 
                flex: 1.2, 
                minWidth: '130px', 
                padding: '10px 16px',
                backgroundColor: 'var(--bg-input)', 
                border: '1px solid var(--border-md)', 
                color: 'var(--text-main)',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              {isSubmitting ? 'Guardando...' : 'Solo Guardar (DB)'}
            </button>

            <button
              className="btn-whatsapp"
              onClick={() => onConfirm(true)}
              disabled={isSubmitting}
              style={{ 
                flex: 1.5, 
                minWidth: '160px', 
                padding: '10px 16px',
                backgroundColor: '#25D366', 
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              {isSubmitting ? (
                'Guardando...'
              ) : (
                <><Send size={16} /> Guardar y Enviar WA</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PreviewModal;