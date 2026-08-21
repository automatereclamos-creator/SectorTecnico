// src/components/InventarioPanel.jsx
import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Monitor, Cpu, Trash2, Tag,
  Info, ChevronRight, X, AlertTriangle, Check,
  Layers, Wifi, Tv, Printer, Package, Camera,
  ScanLine, MousePointer, Keyboard, RefreshCw,
  ChevronDown, ChevronUp, Hash, Edit3, BarChart2,
  Building2, Zap, Activity, ArrowDownRight, ArrowUpRight,
  Calendar, MapPin,
} from 'lucide-react';
import { useInventario, getPrimeraInstalacion } from '../hooks/useInventario';
import ModalTracking from './ModalTracking';
import { APP_TIMEZONE } from '../utils/timezone';

// ─── MAPA DE TOKENS SEMÁNTICOS (SISTEMA DE DISEÑO PREMIUM) ───────────────────
const T = {
  bgMain: 'var(--bg-main)',
  bgCard: 'var(--bg-card)',
  bgInput: 'var(--bg-input)',
  bgSurface: 'var(--bg-surface)',
  textMain: 'var(--text-main)',
  textMuted: 'var(--text-muted)',
  textHint: 'var(--text-hint)',
  accent: 'var(--accent-blue)',
  accentLight: 'var(--accent-indigo-bg)',
  success: 'var(--success)',
  successLight: 'var(--success-bg)',
  error: 'var(--error)',
  errorLight: 'var(--error-bg)',
  warning: 'var(--warning)',
  border: 'var(--border)',
  borderMd: 'var(--border-md)',
  radius: '12px',
  radiusSm: '8px',
  radiusXs: '6px',
  radiusPill: '20px',
  shadowModal: 'var(--shadow-lg)',
  shadowHover: 'var(--shadow-md)',
  transition: 'var(--transition)',
};

const card = {
  backgroundColor: T.bgCard,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  transition: T.transition,
};

// ─── MAPEOS POR CATEGORÍA DE HARDWARE ────────────────────────────────────────
const ICON_MAP = {
  'AIO': <Monitor size={15} />, 'AIO DEPORTE': <Monitor size={15} />, 'AIO CAMARAS': <Monitor size={15} />,
  'CPU': <Cpu size={15} />, 'MONITORES': <Tv size={15} />, 'TICKETERAS': <Printer size={15} />,
  'SCANNERS': <ScanLine size={15} />, 'MOUSE': <MousePointer size={15} />, 'TECLADOS': <Keyboard size={15} />,
  'REDES': <Wifi size={15} />, 'CAMARAS': <Camera size={15} />, 'TV': <Tv size={15} />,
  'IMPRESORAS': <Printer size={15} />, 'COMPONENTES': <Layers size={15} />,
};

const COLOR_MAP = {
  'AIO': '#2563eb', 'AIO DEPORTE': '#7c3aed', 'AIO CAMARAS': '#0891b2',
  'CPU': '#16a34a', 'MONITORES': '#d97706', 'TICKETERAS': '#db2777',
  'SCANNERS': '#dc2626', 'MOUSE': '#64748b', 'TECLADOS': '#64748b',
  'REDES': '#0284c7', 'CAMARAS': '#c2410c', 'TV': '#b45309',
  'IMPRESORAS': '#7c3aed', 'COMPONENTES': '#475569',
};

const getIcon = (cat) => ICON_MAP[cat?.toUpperCase()] ?? <Package size={15} />;
const getColor = (cat) => COLOR_MAP[cat?.toUpperCase()] ?? '#64748b';

// ─── METRICAS KPI QUANTITATIVAS ──────────────────────────────────────────────
const KpiCard = React.memo(({ label, value, color, sub }) => (
  <div style={{ ...card, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: `4px solid ${color}` }}>
    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"Source Sans 3", sans-serif' }}>
      {label}
    </span>
    <span style={{ fontSize: '1.8rem', fontWeight: 700, color: T.textMain, lineHeight: 1, fontFamily: '"Lexend", sans-serif' }}>
      {value}
    </span>
    {sub && <span style={{ fontSize: '0.72rem', color: T.textMuted, fontFamily: '"Source Sans 3", sans-serif' }}>{sub}</span>}
  </div>
));

// ─── MODAL: TRASPASO DIRECTO A STOCK MAESTRO (9999) ──────────────────────────
const ModalBajaToStock = React.memo(({ equipo, onConfirm, onCancel, loading }) => {
  const [motivo, setMotivo] = useState('');
  const [condicion, setCondicion] = useState('PARA REPARAR');

  return (
    <div style={overlayStyle}>
      <div style={{ ...card, width: '100%', maxWidth: 460, padding: 28, boxShadow: T.shadowModal, fontFamily: '"Source Sans 3", sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{ backgroundColor: 'var(--warning-bg, rgba(217, 119, 6, 0.1))', borderRadius: T.radiusSm, padding: 10, flexShrink: 0 }}>
            <Package size={20} color={T.warning} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', color: T.textMain, fontSize: '1.1rem', fontWeight: 700, fontFamily: '"Lexend", sans-serif' }}>
              Traspasar activo a Depósito Central
            </h3>
            <p style={{ margin: 0, color: T.textMuted, fontSize: '0.875rem', lineHeight: '1.4' }}>
              Vas a retirar el equipo <strong style={{ color: T.textMain }}>{equipo.producto}</strong> de su locación actual para enviarlo de forma directa al <strong style={{ color: T.accent }}>Stock Pastor (9999)</strong>.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
          <div>
            <label style={labelStyle}>Condición de Ingreso al Depósito</label>
            <select value={condicion} onChange={e => setCondicion(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: `1px solid ${T.borderMd}`, borderRadius: T.radiusSm, backgroundColor: T.bgCard, color: T.textMain, fontSize: '0.875rem', outline: 'none' }}>
              <option value="PARA REPARAR">PARA REPARAR (Revisión de Taller Central)</option>
              <option value="DISPONIBLE">DISPONIBLE (Listo para reasignación inmediata)</option>
              <option value="DESECHADO">DESECHADO (Para desguace de piezas)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Justificación del Traslado</label>
            <textarea rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Escribí el motivo del retiro..." style={textareaStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnSecondary}>Cancelar</button>
          <button onClick={() => onConfirm({ condicion, observaciones: motivo })} disabled={loading || !motivo.trim()} style={{ ...btnPrimary, backgroundColor: T.success, opacity: loading || !motivo.trim() ? 0.7 : 1 }}>
            <Check size={15} /> {loading ? 'Procesando...' : 'Confirmar Traspaso'}
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── MODAL EDITAR ESPECIFICACIONES ───────────────────────────────────────────
const ModalEditar = React.memo(({ equipo, onConfirm, onCancel, loading }) => {
  const specs = equipo.especificaciones || {};
  const [form, setForm] = useState({
    producto: equipo.producto || '', marca: equipo.marca || '',
    procesador: specs.procesador !== '-' ? (specs.procesador || '') : '',
    disco: specs.disco !== '-' ? (specs.disco || '') : '',
    memoria: specs.memoria !== '-' ? (specs.memoria || '') : '',
    nro_terminal: specs.nro_terminal !== '-' ? (specs.nro_terminal || '') : '',
    detalles: specs.detalles !== '-' ? (specs.detalles || '') : '',
  });

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const handleGuardar = useCallback(() => {
    onConfirm({
      producto: form.producto.trim(), marca: form.marca.trim() || '-',
      especificaciones: {
        ...specs,
        procesador: form.procesador.trim() || '-',
        disco: form.disco.trim() || '-',
        memoria: form.memoria.trim() || '-',
        nro_terminal: form.nro_terminal.trim() || '-',
        detalles: form.detalles.trim() || '-',
      },
    });
  }, [form, specs, onConfirm]);

  return (
    <div style={overlayStyle}>
      <div style={{ ...card, width: '100%', maxWidth: 480, padding: 28, boxShadow: T.shadowModal }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ backgroundColor: T.accentLight, borderRadius: T.radiusSm, padding: 9, display: 'flex' }}>
              <Edit3 size={17} color={T.accent} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: T.textMain, fontSize: '1rem', fontWeight: 700, fontFamily: '"Lexend", sans-serif' }}>Editar especificaciones</h3>
            </div>
          </div>
          <button onClick={onCancel} style={btnIcon}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Producto</label><input type="text" value={form.producto} onChange={e => set('producto', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Marca</label><input type="text" value={form.marca} onChange={e => set('marca', e.target.value)} style={inputStyle} /></div>
          </div>
          <div style={{ height: 1, backgroundColor: T.border }} />
          <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"Lexend", sans-serif' }}>JSON de Especificaciones</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>N° Terminal</label><input type="text" value={form.nro_terminal} onChange={e => set('nro_terminal', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Procesador</label><input type="text" value={form.procesador} onChange={e => set('procesador', e.target.value)} style={inputStyle} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Almacenamiento</label><input type="text" value={form.disco} onChange={e => set('disco', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Memoria RAM</label><input type="text" value={form.memoria} onChange={e => set('memoria', e.target.value)} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Detalles Adicionales</label><input type="text" value={form.detalles} onChange={e => set('detalles', e.target.value)} style={inputStyle} /></div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={btnSecondary}>Cancelar</button>
          <button onClick={handleGuardar} disabled={loading || !form.producto.trim()} style={{ ...btnPrimary, opacity: loading || !form.producto.trim() ? 0.65 : 1 }}>
            <Check size={15} /> {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── FILA DE GRILLA REFACTORIZADA CON JSONB DETALLADO ────────────────────────
const FilaEquipo = React.memo(({ eq, onBaja, onEditar, onPatrimonio, onTracking, isHighlighted }) => {
  const [editandoPatrimonio, setEditandoPatrimonio] = useState(false);
  const [codigoInput, setCodigoInput] = useState(eq.codigo_patrimonio || '');
  const [guardando, setGuardando] = useState(false);
  const [rowHover, setRowHover] = useState(false);
  const rowRef = React.useRef(null);

  const color = getColor(eq.categoria);
  const specs = eq.especificaciones || {};
  const primeraInst = getPrimeraInstalacion(eq);
  const fechaFormatted = eq.creado_en
    ? new Date(eq.creado_en).toLocaleDateString('es-AR', { timeZone: APP_TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  const handleGuardarPatrimonio = useCallback(async () => {
    if (!codigoInput.trim()) return;
    setGuardando(true);
    const res = await onPatrimonio(eq.id, codigoInput.trim());
    setGuardando(false);
    if (res?.success) setEditandoPatrimonio(false);
  }, [codigoInput, eq.id, onPatrimonio]);

  React.useEffect(() => {
    if (isHighlighted && rowRef.current) {
      const timer = setTimeout(() => {
        rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <tr 
      ref={rowRef}
      className={isHighlighted ? 'highlighted-row' : ''}
      style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: rowHover ? T.bgSurface : 'transparent', transition: T.transition }} 
      onMouseEnter={() => setRowHover(true)} 
      onMouseLeave={() => setRowHover(false)}
    >
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color, display: 'flex', alignItems: 'center' }}>{getIcon(eq.categoria)}</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color, backgroundColor: `${color}15`, padding: '2px 8px', borderRadius: T.radiusPill }}>
            {eq.categoria}
          </span>
        </div>
      </td>

      <td style={tdStyle}>
        <div style={{ fontWeight: 600, color: T.textMain, fontSize: '0.875rem' }}>{eq.producto}</div>
        {eq.marca && eq.marca !== '-' && <div style={{ color: T.textMuted, fontSize: '0.75rem', marginTop: 2 }}>{eq.marca}</div>}
        
        {/* Specs fusionadas como chips inline */}
        {(specs.nro_terminal && specs.nro_terminal !== '-' || specs.procesador && specs.procesador !== '-' || specs.memoria && specs.memoria !== '-' || specs.disco && specs.disco !== '-' || specs.detalles && specs.detalles !== '-') && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, alignItems: 'center' }}>
            {specs.nro_terminal && specs.nro_terminal !== '-' && <span style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: T.accentLight, color: T.accent, padding: '2px 6px', borderRadius: T.radiusXs }}>T{specs.nro_terminal}</span>}
            {specs.procesador && specs.procesador !== '-' && <span style={{ fontSize: '0.65rem', backgroundColor: T.bgInput, color: T.textMuted, border: `1px solid ${T.borderMd}`, padding: '1px 6px', borderRadius: T.radiusXs }}>{specs.procesador}</span>}
            {specs.memoria && specs.memoria !== '-' && <span style={{ fontSize: '0.65rem', backgroundColor: T.bgInput, color: T.textMuted, border: `1px solid ${T.borderMd}`, padding: '1px 6px', borderRadius: T.radiusXs }}>{specs.memoria}</span>}
            {specs.disco && specs.disco !== '-' && <span style={{ fontSize: '0.65rem', backgroundColor: T.bgInput, color: T.textMuted, border: `1px solid ${T.borderMd}`, padding: '1px 6px', borderRadius: T.radiusXs }}>{specs.disco}</span>}
            {specs.detalles && specs.detalles !== '-' && <span style={{ fontSize: '0.65rem', fontStyle: 'italic', color: T.textHint, marginLeft: 2 }}>• {specs.detalles}</span>}
          </div>
        )}
      </td>

      {/* 1ª Agencia donde fue instalado */}
      <td style={tdStyle}>
        {primeraInst ? (
          <button
            onClick={() => onTracking(eq)}
            title="Ver ruta completa de este equipo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: T.accentLight,
              border: `1px solid ${T.accent}35`,
              borderRadius: T.radiusSm,
              padding: '4px 9px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: T.accent,
              transition: T.transition
            }}
          >
            <Building2 size={13} />
            <span>{primeraInst.nombre}</span>
            {primeraInst.id_agencia && <span style={{ opacity: 0.75, fontWeight: 500 }}>#{primeraInst.id_agencia}</span>}
          </button>
        ) : (
          <span style={{ fontSize: '0.75rem', color: T.textHint }}>—</span>
        )}
      </td>

      {/* Fecha de Registro / Alta */}
      <td style={tdStyle}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.textMuted, fontSize: '0.8rem', fontFamily: 'monospace' }}>
          <Calendar size={12} color={T.textMuted} />
          <span>{fechaFormatted}</span>
        </div>
      </td>

      {/* Código de Equipo */}
      <td style={tdStyle}>
        {editandoPatrimonio ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input autoFocus type="text" value={codigoInput} onChange={e => setCodigoInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleGuardarPatrimonio(); if (e.key === 'Escape') setEditandoPatrimonio(false); }} placeholder="Ej: COD-402" style={{ ...inputStyle, width: 120, padding: '5px 8px', fontSize: '0.8rem' }} />
            <button onClick={handleGuardarPatrimonio} disabled={guardando} style={{ ...btnIcon, backgroundColor: T.success, color: '#fff', border: 'none' }}><Check size={13} /></button>
            <button onClick={() => setEditandoPatrimonio(false)} style={btnIcon}><X size={13} /></button>
          </div>
        ) : eq.codigo_patrimonio ? (
          <button onClick={() => { setCodigoInput(eq.codigo_patrimonio); setEditandoPatrimonio(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Tag size={12} color={T.success} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: T.success }}>{eq.codigo_patrimonio}</span>
          </button>
        ) : (
          <button onClick={() => setEditandoPatrimonio(true)} style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: T.radiusXs, border: `1px dashed ${T.borderMd}`, color: T.textMuted, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Hash size={11} /> Asignar Código
          </button>
        )}
      </td>

      <td style={{ ...tdStyle, textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', gap: 6 }}>
          <ActionBtn title="Editar especificaciones" hoverColor={T.accent} hoverBg={T.accentLight} onClick={() => onEditar(eq)}><Edit3 size={14} /></ActionBtn>
          <ActionBtn title="Ver Hoja de Vida y Ruta (Tracking)" hoverColor={T.accent} hoverBg={T.accentLight} onClick={() => onTracking(eq)}><Activity size={14} /></ActionBtn>
          <ActionBtn title="Traspasar a Stock Central" hoverColor={T.warning} hoverBg="rgba(217, 119, 6, 0.08)" onClick={() => onBaja(eq)}><Package size={14} /></ActionBtn>
        </div>
      </td>
    </tr>
  );
});

const ActionBtn = ({ children, title, onClick, hoverColor, hoverBg }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button title={title} onClick={onClick} style={{ background: hovered ? hoverBg : 'none', border: `1px solid ${hovered ? hoverColor : T.border}`, borderRadius: T.radiusXs, color: hovered ? hoverColor : T.textMuted, cursor: 'pointer', padding: '5px 8px', display: 'inline-flex', alignItems: 'center', transition: T.transition }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{children}</button>
  );
};

const ThCol = React.memo(({ col, label, center, ordenCol, ordenAsc, onToggle }) => {
  const activo = ordenCol === col;
  return (
    <th onClick={() => onToggle(col)} style={{ padding: '11px 16px', textAlign: center ? 'center' : 'left', fontSize: '0.72rem', fontWeight: 700, color: activo ? T.accent : T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none', borderBottom: `2px solid ${T.border}`, transition: T.transition, fontFamily: '"Lexend", sans-serif' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        {activo ? (ordenAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ChevronDown size={12} style={{ opacity: 0.3 }} />}
      </span>
    </th>
  );
});

const AgenciaCard = React.memo(({ ag, index, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const isPodio = index < 3;
  const leftColor = isPodio ? PODIO_COLORS[index] : T.border;

  return (
    <div onClick={() => onSelect(ag)} style={{ ...card, padding: '16px 18px', cursor: 'pointer', position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${hovered ? T.accent : leftColor}`, boxShadow: hovered ? T.shadowHover : 'none', transform: hovered ? 'translateY(-1px)' : 'none' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {isPodio && <span style={{ position: 'absolute', top: 10, right: 12, fontSize: '0.7rem', fontWeight: 800, color: PODIO_COLORS[index], opacity: 0.75, fontFamily: '"Lexend", sans-serif' }}>{PODIO_LABELS[index]}</span>}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <div style={{ backgroundColor: T.bgInput, borderRadius: T.radiusSm, padding: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={16} color={T.textMuted} /></div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: T.textMain, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: '"Lexend", sans-serif' }}>{ag.nombre}</div>
          <div style={{ fontSize: '0.75rem', color: T.textMuted, marginTop: 1 }}>{ag.empresa} · <span style={{ color: T.accent, fontWeight: 600 }}>#{ag.id_agencia}</span></div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
        <span style={{ fontSize: '0.72rem', color: T.textMuted }}>Equipos instalados</span>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: T.textMain, fontFamily: '"Lexend", sans-serif' }}>{ag.totalEquipos}<Zap size={11} color={T.warning} style={{ marginLeft: 3, verticalAlign: 'middle' }} /></span>
      </div>
    </div>
  );
});

const PODIO_COLORS = ['#d97706', '#64748b', '#b45309'];
const PODIO_LABELS = ['1°', '2°', '3°'];

const GlobalSearchResults = ({ 
  agencias, 
  equipos, 
  buscando, 
  onSelectAgencia, 
  onSelectEquipo,
  onEditar, 
  onBaja, 
  onTracking, 
  onPatrimonio 
}) => {
  if (buscando) {
    return (
      <div style={centeredMsg}>
        <RefreshCw className="animate-spin" size={24} style={{ marginRight: 8, color: T.accent, display: 'inline-block', verticalAlign: 'middle' }} /> 
        Buscando en inventario global...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 10 }}>
      
      {/* SECCIÓN AGENCIAS COINCIDENTES */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Building2 size={16} color={T.textMuted} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: '"Lexend", sans-serif' }}>
            Puntos de Venta Coincidentes ({agencias.length})
          </span>
        </div>
        {agencias.length === 0 ? (
          <div style={{ ...card, padding: 20, textAlign: 'center', color: T.textMuted, fontSize: '0.85rem' }}>
            No se encontraron agencias.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {agencias.map((ag) => (
              <div 
                key={ag.id} 
                onClick={() => onSelectAgencia(ag)}
                style={{ 
                  ...card, 
                  padding: '14px 16px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  transition: T.transition
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: T.textMain, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: '"Lexend", sans-serif' }}>
                    {ag.nombre}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: T.textMuted, marginTop: 2 }}>
                    {ag.empresa?.toUpperCase()} · <span style={{ color: T.accent, fontWeight: 600 }}>#{ag.id_agencia}</span>
                  </div>
                </div>
                <ChevronRight size={16} color={T.textMuted} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN EQUIPOS COINCIDENTES */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: '"Lexend", sans-serif' }}>
            Equipos Encontrados ({equipos.length})
          </span>
        </div>
        
        {equipos.length === 0 ? (
          <div style={centeredMsg}>
            No se encontraron activos que coincidan con la búsqueda.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: T.bgSurface }}>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  <th style={{ padding: '11px 16px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textAlign: 'left', fontFamily: '"Lexend", sans-serif' }}>Categoría</th>
                  <th style={{ padding: '11px 16px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textAlign: 'left', fontFamily: '"Lexend", sans-serif' }}>Producto</th>
                  <th style={{ padding: '11px 16px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textAlign: 'left', fontFamily: '"Lexend", sans-serif' }}>1ª Agencia</th>
                  <th style={{ padding: '11px 16px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textAlign: 'left', fontFamily: '"Lexend", sans-serif' }}>Ubicación Actual</th>
                  <th style={{ padding: '11px 16px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textAlign: 'left', fontFamily: '"Lexend", sans-serif' }}>Fecha</th>
                  <th style={{ padding: '11px 16px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textAlign: 'left', fontFamily: '"Lexend", sans-serif' }}>Código</th>
                  <th style={{ padding: '11px 16px', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textAlign: 'right', fontFamily: '"Lexend", sans-serif' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {equipos.map(eq => {
                  const color = getColor(eq.categoria);
                  const specs = eq.especificaciones || {};
                  const primeraInstGlobal = getPrimeraInstalacion(eq);
                  const fechaGlobal = eq.creado_en
                    ? new Date(eq.creado_en).toLocaleDateString('es-AR', { timeZone: APP_TIMEZONE, day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '—';
                  
                  const empLower = String(eq.agencias?.empresa || '').toLowerCase();
                  const empColor = empLower.includes('alfa') ? '#ea580c' : empLower.includes('palpito') ? '#818cf8' : T.textMuted;
                  const empBg = empLower.includes('alfa') ? 'rgba(234, 88, 12, 0.1)' : empLower.includes('palpito') ? 'rgba(129, 140, 248, 0.1)' : T.bgInput;

                  return (
                    <tr 
                      key={eq.id} 
                      style={{ borderBottom: `1px solid ${T.border}` }}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color, display: 'flex', alignItems: 'center' }}>{getIcon(eq.categoria)}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color, backgroundColor: `${color}15`, padding: '2px 8px', borderRadius: T.radiusPill }}>
                            {eq.categoria}
                          </span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: T.textMain, fontSize: '0.875rem' }}>{eq.producto}</div>
                        {eq.marca && eq.marca !== '-' && <div style={{ color: T.textMuted, fontSize: '0.75rem', marginTop: 2 }}>{eq.marca}</div>}
                        
                        {/* Specs fusionadas como chips inline */}
                        {(specs.nro_terminal && specs.nro_terminal !== '-' || specs.procesador && specs.procesador !== '-' || specs.memoria && specs.memoria !== '-' || specs.disco && specs.disco !== '-' || specs.detalles && specs.detalles !== '-') && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, alignItems: 'center' }}>
                            {specs.nro_terminal && specs.nro_terminal !== '-' && <span style={{ fontSize: '0.65rem', fontWeight: 600, backgroundColor: T.accentLight, color: T.accent, padding: '2px 6px', borderRadius: T.radiusXs }}>T{specs.nro_terminal}</span>}
                            {specs.procesador && specs.procesador !== '-' && <span style={{ fontSize: '0.65rem', backgroundColor: T.bgInput, color: T.textMuted, border: `1px solid ${T.borderMd}`, padding: '1px 6px', borderRadius: T.radiusXs }}>{specs.procesador}</span>}
                            {specs.memoria && specs.memoria !== '-' && <span style={{ fontSize: '0.65rem', backgroundColor: T.bgInput, color: T.textMuted, border: `1px solid ${T.borderMd}`, padding: '1px 6px', borderRadius: T.radiusXs }}>{specs.memoria}</span>}
                            {specs.disco && specs.disco !== '-' && <span style={{ fontSize: '0.65rem', backgroundColor: T.bgInput, color: T.textMuted, border: `1px solid ${T.borderMd}`, padding: '1px 6px', borderRadius: T.radiusXs }}>{specs.disco}</span>}
                            {specs.detalles && specs.detalles !== '-' && <span style={{ fontSize: '0.65rem', fontStyle: 'italic', color: T.textHint, marginLeft: 2 }}>• {specs.detalles}</span>}
                          </div>
                        )}
                      </td>

                      {/* 1ª Agencia */}
                      <td style={tdStyle}>
                        {primeraInstGlobal ? (
                          <button
                            onClick={() => onTracking(eq)}
                            title="Ver ruta completa"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              background: T.accentLight, border: `1px solid ${T.accent}35`,
                              borderRadius: T.radiusSm, padding: '4px 9px', cursor: 'pointer',
                              fontSize: '0.78rem', fontWeight: 700, color: T.accent, transition: T.transition
                            }}
                          >
                            <Building2 size={13} />
                            <span>{primeraInstGlobal.nombre}</span>
                            {primeraInstGlobal.id_agencia && <span style={{ opacity: 0.75, fontWeight: 500 }}>#{primeraInstGlobal.id_agencia}</span>}
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: T.textHint }}>—</span>
                        )}
                      </td>

                      <td style={tdStyle}>
                        <button
                          onClick={() => {
                            if (eq.agencias) {
                              onSelectEquipo(eq);
                            } else {
                              onSelectAgencia(eq.agencias);
                            }
                          }}
                          style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            background: empBg,
                            border: `1px solid ${empColor}20`,
                            borderRadius: T.radiusSm,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: T.transition
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = empColor; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = `${empColor}20`; }}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: empColor }}>
                            {eq.agencias?.nombre || (eq.estado === 'EN TALLER' ? 'TALLER CENTRAL' : 'STOCK PASTOR')}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: T.textMuted, marginTop: 1 }}>
                            {eq.agencias ? `${eq.agencias.empresa?.toUpperCase()} · #${eq.agencias.id_agencia}` : (eq.estado === 'EN TALLER' ? 'Oficina Técnica (1213)' : 'Stock Maestro (9999)')}
                          </span>
                        </button>
                      </td>

                      {/* Fecha */}
                      <td style={tdStyle}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.textMuted, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          <Calendar size={12} color={T.textMuted} />
                          <span>{fechaGlobal}</span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {eq.codigo_patrimonio ? (
                          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700, color: T.success }}>
                            {eq.codigo_patrimonio}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: T.textHint }}>—</span>
                        )}
                      </td>



                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <ActionBtn title="Editar especificaciones" hoverColor={T.accent} hoverBg={T.accentLight} onClick={() => onEditar(eq)}><Edit3 size={14} /></ActionBtn>
                          <ActionBtn title="Ver Hoja de Vida (Tracking)" hoverColor={T.accent} hoverBg={T.accentLight} onClick={() => onTracking(eq)}><Activity size={14} /></ActionBtn>
                          <ActionBtn title="Traspasar a Stock Central" hoverColor={T.warning} hoverBg="rgba(217, 119, 6, 0.08)" onClick={() => onBaja(eq)}><Package size={14} /></ActionBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const InventarioPanel = () => {
  const {
    agenciaSeleccionada, seleccionarAgencia, limpiarAgencia,
    equipos, stats, loading, error,
    procesarBaja, asignarPatrimonio, actualizarEquipo, refresh,
    busqueda, setBusqueda, agenciasResultados, equiposResultados, buscandoAgencias,
    agenciasTop, loadingTop, conteosGlobales, agenciasVirtuales,
    obtenerHistorialEquipo, procesarAsignacion,
    filtroEmpresa, setFiltroEmpresa,
    filtroCategoria, setFiltroCategoria,
    filtroEstado, setFiltroEstado,
    modoBusquedaActivo,
    highlightedEquipoId, seleccionarEquipoGlobal,
    // Nuevos estados y funciones para el buscador autocomplete
    searchEmpresa,
    searchId,
    searchNombre,
    searchUuid,
    searchIdHint,
    handleSearchEmpresaChange,
    handleSearchIdChange
  } = useInventario();

  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');
  const [equipoTraspasoTarget, setEquipoTraspasoTarget] = useState(null);
  const [equipoEditar, setEquipoEditar] = useState(null);
  const [equipoTracking, setEquipoTracking] = useState(null);
  const [procesandoTraspaso, setProcesandoTraspaso] = useState(false);
  const [procesandoEditar, setProcesandoEditar] = useState(false);

  const handleSelectEquipoGlobal = useCallback((equipo) => {
    setCategoriaFiltro('TODOS');
    seleccionarEquipoGlobal(equipo);
  }, [seleccionarEquipoGlobal]);
  const [ordenCol, setOrdenCol] = useState('creado_en');
  const [ordenAsc, setOrdenAsc] = useState(false);

  const equiposMostrados = useMemo(() => {
    let lista = equipos;

    // 1. Filtro Categoría (prioriza la pestaña local 'categoriaFiltro' si no es 'TODOS')
    if (categoriaFiltro !== 'TODOS') {
      lista = lista.filter(e => e.categoria === categoriaFiltro);
    } else if (filtroCategoria !== 'TODAS') {
      lista = lista.filter(e => e.categoria === filtroCategoria);
    }

    // 2. Filtro Estado
    if (filtroEstado !== 'TODOS') {
      lista = lista.filter(e => e.estado === filtroEstado);
    }

    // 3. Buscador Local (si hay un término de búsqueda escrito)
    if (busqueda.trim().length > 0) {
      const queryStr = busqueda.toLowerCase().trim();
      lista = lista.filter(e => {
        const prod = String(e.producto || '').toLowerCase();
        const marca = String(e.marca || '').toLowerCase();
        const cat = String(e.categoria || '').toLowerCase();
        const pat = String(e.codigo_patrimonio || '').toLowerCase();
        
        // Buscar también en especificaciones JSONB
        const specs = e.especificaciones ? JSON.stringify(e.especificaciones).toLowerCase() : '';

        return prod.includes(queryStr) || 
               marca.includes(queryStr) || 
               cat.includes(queryStr) || 
               pat.includes(queryStr) ||
               specs.includes(queryStr);
      });
    }

    return [...lista].sort((a, b) => {
      if (ordenCol === 'creado_en') {
        const da = new Date(a.creado_en || 0).getTime();
        const db = new Date(b.creado_en || 0).getTime();
        return ordenAsc ? da - db : db - da;
      }
      const va = String(a[ordenCol] ?? '').toLowerCase();
      const vb = String(b[ordenCol] ?? '').toLowerCase();
      return ordenAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [equipos, categoriaFiltro, filtroCategoria, filtroEstado, busqueda, ordenCol, ordenAsc]);

  const toggleOrden = useCallback((col) => {
    setOrdenCol(prev => {
      if (prev === col) { setOrdenAsc(o => !o); return prev; }
      setOrdenAsc(true); return col;
    });
  }, []);

  const handleConfirmarTraspasoDirecto = useCallback(async ({ condicion, observaciones }) => {
    if (!equipoTraspasoTarget) return;
    setProcesandoTraspaso(true);

    const uuidStockMaestro = agenciasVirtuales?.stock?.id;
    if (!uuidStockMaestro) {
      alert("Error crítico: No se encontró el UUID indexado del Stock Maestro.");
      setProcesandoTraspaso(false); return;
    }

    const notasLog = `Retiro urgente desde Inventario General (Estado: ${condicion}). ${observaciones}`.trim();
    const res = await procesarAsignacion(equipoTraspasoTarget.id, uuidStockMaestro, notasLog);

    if (res.success && condicion === 'DESECHADO') {
      await actualizarEquipo(equipoTraspasoTarget.id, { estado: 'DESECHADO' });
    } else if (res.success && condicion === 'PARA REPARAR') {
      await actualizarEquipo(equipoTraspasoTarget.id, { estado: 'EN TALLER' });
    }

    setProcesandoTraspaso(false);
    if (!res.success) alert('Error en red: ' + res.error);
    else refresh();
    setEquipoTraspasoTarget(null);
  }, [equipoTraspasoTarget, agenciasVirtuales, procesarAsignacion, actualizarEquipo, refresh]);

  const handleConfirmarEditar = useCallback(async (campos) => {
    if (!equipoEditar) return;
    setProcesandoEditar(true);
    const res = await actualizarEquipo(equipoEditar.id, campos);
    setProcesandoEditar(false);
    if (!res.success) alert('Error: ' + res.error);
    setEquipoEditar(null);
  }, [equipoEditar, actualizarEquipo]);

  const categorias = useMemo(() => ['TODOS', ...Object.keys(stats.categorias)], [stats.categorias]);

  return (
    <>
      {equipoTraspasoTarget && <ModalBajaToStock equipo={equipoTraspasoTarget} onConfirm={handleConfirmarTraspasoDirecto} onCancel={() => setEquipoTraspasoTarget(null)} loading={procesandoTraspaso} />}
      {equipoEditar && <ModalEditar equipo={equipoEditar} onConfirm={handleConfirmarEditar} onCancel={() => setEquipoEditar(null)} loading={procesandoEditar} />}
      {equipoTracking && (
        <ModalTracking 
          equipo={equipoTracking} 
          onCancel={() => setEquipoTracking(null)} 
          obtenerHistorialEquipo={obtenerHistorialEquipo} 
          procesarAsignacion={procesarAsignacion} 
          actualizarEquipo={actualizarEquipo}
          agenciasVirtuales={agenciasVirtuales} 
          refresh={refresh}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: '"Source Sans 3", sans-serif' }}>
        <div style={{ ...card, padding: 20, borderTop: `4px solid ${T.accent}`, position: 'relative' }}>
          
          {agenciaSeleccionada ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={17} color={T.textMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input 
                  type="text" 
                  placeholder="Buscar en esta agencia (ej: i5, 55, Redes)..." 
                  value={busqueda} 
                  onChange={e => setBusqueda(e.target.value)} 
                  style={{ ...inputStyle, paddingLeft: 40 }} 
                />
              </div>

              {/* Filtro Categoría */}
              <select
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
                style={selectFilterStyle}
              >
                <option value="TODAS">Todas las Categorías</option>
                {Object.keys(ICON_MAP).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Filtro Estado */}
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                style={selectFilterStyle}
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="INSTALADO">Instalado</option>
                <option value="EN TALLER">En Taller</option>
                <option value="DESECHADO">Desechado</option>
              </select>

              <button onClick={limpiarAgencia} style={btnSecondary}><X size={15} /> Cambiar</button>
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', width: '100%' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <span style={labelStyle}>Empresa</span>
                  <select
                    value={searchEmpresa}
                    onChange={handleSearchEmpresaChange}
                    style={selectFilterStyle}
                  >
                    <option value="">— Seleccionar Empresa —</option>
                    <option value="Palpitos">Pálpitos</option>
                    <option value="Alfa">Alfa</option>
                    <option value="TucuApuestas">TucuApuestas</option>
                  </select>
                </div>

                {searchEmpresa && (
                  <>
                    <div style={{ flex: '0 0 120px' }}>
                      <span style={labelStyle}>ID Agencia</span>
                      <input
                        type="text"
                        value={searchId}
                        onChange={handleSearchIdChange}
                        className={searchIdHint.found === true ? "found" : searchIdHint.found === false ? "not-found" : ""}
                        placeholder="Ej: 1207"
                        style={inputStyle}
                        autoComplete="off"
                      />
                    </div>

                    <div style={{ flex: '1 1 250px' }}>
                      <span style={labelStyle}>Nombre</span>
                      <input
                        type="text"
                        value={searchNombre}
                        readOnly
                        style={{ ...inputStyle, backgroundColor: T.bgInput, color: T.textMuted }}
                        placeholder="Nombre autocompletado"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => seleccionarAgencia({ id: searchUuid, id_agencia: searchId, nombre: searchNombre, empresa: searchEmpresa })}
                      disabled={!searchUuid}
                      style={{
                        ...btnPrimary,
                        backgroundColor: searchUuid ? T.accent : T.bgInput,
                        color: searchUuid ? '#fff' : T.textHint,
                        cursor: searchUuid ? 'pointer' : 'not-allowed',
                        height: '40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 20px',
                        border: 'none',
                        borderRadius: T.radiusSm,
                        fontWeight: 600,
                        transition: T.transition
                      }}
                    >
                      Ver Inventario
                    </button>
                  </>
                )}
              </div>
              {searchEmpresa && searchIdHint.text && (
                <div className={`id-hint ${searchIdHint.type}`} style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  {searchIdHint.text}
                </div>
              )}
            </div>
          )}

          {agenciaSeleccionada && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', color: T.textMuted }}>Viendo:</span>
              <span style={{ backgroundColor: T.accentLight, color: T.accent, fontWeight: 700, fontSize: '0.82rem', padding: '3px 12px', borderRadius: T.radiusPill, display: 'flex', alignItems: 'center', gap: 6 }}>
                {agenciaSeleccionada.nombre}
                <span style={{ opacity: 0.65, fontWeight: 400 }}> · {agenciaSeleccionada.empresa} #{agenciaSeleccionada.id_agencia}</span>
              </span>
            </div>
          )}
        </div>

        {!agenciaSeleccionada && (
          <>
            {modoBusquedaActivo ? (
              <GlobalSearchResults 
                agencias={agenciasResultados}
                equipos={equiposResultados}
                buscando={buscandoAgencias}
                onSelectAgencia={seleccionarAgencia}
                onSelectEquipo={handleSelectEquipoGlobal}
                onEditar={setEquipoEditar}
                onBaja={setEquipoTraspasoTarget}
                onTracking={setEquipoTracking}
                onPatrimonio={asignarPatrimonio}
              />
            ) : (
              <>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div onClick={() => agenciasVirtuales?.oficina && seleccionarAgencia(agenciasVirtuales.oficina)} style={{ ...card, flex: 1, minWidth: 200, padding: 20, borderTop: `4px solid ${T.warning}`, cursor: agenciasVirtuales?.oficina ? 'pointer' : 'default' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowHover; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Oficina Técnica (1213)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: T.textMain, margin: '8px 0', lineHeight: 1, fontFamily: '"Lexend", sans-serif' }}>{conteosGlobales?.oficina || 0}</div>
                    <div style={{ fontSize: '0.8rem', color: T.warning, fontWeight: 600 }}>Ver taller y tránsito &rarr;</div>
                  </div>
                  <div onClick={() => agenciasVirtuales?.stock && seleccionarAgencia(agenciasVirtuales.stock)} style={{ ...card, flex: 1, minWidth: 200, padding: 20, borderTop: `4px solid ${T.accent}`, cursor: agenciasVirtuales?.stock ? 'pointer' : 'default' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowHover; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ color: T.textMuted, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Maestro (9999)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: T.textMain, margin: '8px 0', lineHeight: 1, fontFamily: '"Lexend", sans-serif' }}>{conteosGlobales?.stock || 0}</div>
                    <div style={{ fontSize: '0.8rem', color: T.accent, fontWeight: 600 }}>Ver depósito central &rarr;</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart2 size={16} color={T.textMuted} /><span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: '"Lexend", sans-serif' }}>Puntos de venta con más equipos</span></div>
                  <span style={{ fontSize: '0.72rem', color: T.textHint }}>Clic para abrir directamente</span>
                </div>

                {loadingTop ? <div style={centeredMsg}>Cargando agencias...</div> : agenciasTop.length === 0 ? <div style={centeredMsg}><Info size={32} style={{ opacity: 0.35, display: 'block', margin: '0 auto 10px' }} />No hay datos de inventario todavía.</div> : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {agenciasTop.map((ag, i) => <AgenciaCard key={ag.id} ag={ag} index={i} onSelect={seleccionarAgencia} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {agenciaSeleccionada && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              <KpiCard label="Total equipos" value={stats.total} color={T.accent} sub="en este punto de venta" />
              <KpiCard label="Sin código" value={stats.sinEtiquetar} color={stats.sinEtiquetar > 0 ? T.warning : T.success} sub={stats.sinEtiquetar > 0 ? 'requieren código de equipo' : 'todo identificado ✓'} />
              <KpiCard label="Categorías" value={Object.keys(stats.categorias).length} color="var(--accent-indigo)" sub="tipos de equipo distintos" />
              {Object.entries(stats.categorias).slice(0, 3).map(([cat, cnt]) => <KpiCard key={cat} label={cat} value={cnt} color={getColor(cat)} sub="unidades instaladas" />)}
            </div>

            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {categorias.map(cat => {
                    const activo = categoriaFiltro === cat; const color = cat === 'TODOS' ? T.accent : getColor(cat);
                    return <button key={cat} onClick={() => setCategoriaFiltro(cat)} style={{ padding: '5px 12px', borderRadius: T.radiusPill, border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', backgroundColor: activo ? color : T.bgInput, color: activo ? '#fff' : T.textMuted, transition: T.transition }}>{cat}<span style={{ marginLeft: 5, opacity: 0.8 }}>{cat === 'TODOS' ? stats.total : (stats.categorias[cat] || 0)}</span></button>;
                  })}
                </div>
                <button onClick={refresh} style={{ ...btnSecondary, gap: 6, fontSize: '0.8rem' }}><RefreshCw size={13} /> Actualizar</button>
              </div>

              {error && <div style={{ margin: '16px 20px', padding: '12px 16px', backgroundColor: T.errorLight, border: `1px solid ${T.error}`, borderRadius: T.radiusSm, color: T.error, fontSize: '0.875rem' }}>{error}</div>}

              {loading ? <div style={centeredMsg}>Cargando inventario...</div> : equiposMostrados.length === 0 ? <div style={centeredMsg}>No hay equipos en esta categoría.</div> : (
                <div className="custom-scrollbar" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '550px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: T.bgSurface, position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr>
                        {[
                          { col: 'categoria', label: 'Categoría' },
                          { col: 'producto', label: 'Producto' },
                          { col: 'primera_agencia', label: '1ª Agencia' },
                          { col: 'creado_en', label: 'Fecha' },
                          { col: 'codigo_patrimonio', label: 'Código de Equipo' },
                        ].map(({ col, label, center }) => (
                          <ThCol key={col} col={col} label={label} center={center} ordenCol={ordenCol} ordenAsc={ordenAsc} onToggle={toggleOrden} />
                        ))}
                        <th style={{ padding: '11px 16px', textAlign: 'right', borderBottom: `2px solid ${T.border}`, fontSize: '0.72rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: '"Lexend", sans-serif' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {equiposMostrados.map(eq => (
                        <FilaEquipo 
                          key={eq.id} 
                          eq={eq} 
                          onBaja={setEquipoTraspasoTarget} 
                          onEditar={setEquipoEditar} 
                          onPatrimonio={asignarPatrimonio} 
                          onTracking={setEquipoTracking} 
                          isHighlighted={eq.id === highlightedEquipoId}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && equiposMostrados.length > 0 && (
                <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, backgroundColor: T.bgSurface, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: T.textMuted }}>Mostrando <strong>{equiposMostrados.length}</strong> de <strong>{stats.total}</strong> equipos</span>
                  {stats.sinEtiquetar > 0 && (
                    <span style={{ fontSize: '0.78rem', color: T.warning, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Tag size={12} /> {stats.sinEtiquetar} sin código
                    </span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default InventarioPanel;

const DropdownItem = React.memo(({ ag, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onSelect(ag)} style={{ padding: '11px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}`, backgroundColor: hovered ? T.accentLight : 'transparent', transition: T.transition }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Building2 size={16} color={T.textMuted} /><span style={{ fontWeight: 600, color: T.textMain, fontSize: '0.9rem' }}>{ag.nombre}</span></div>
      <span style={{ color: T.textMuted, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>{ag.empresa} <ChevronRight size={12} /> {ag.id_agencia}</span>
    </div>
  );
});

const DropdownItemEquipo = React.memo(({ eq, onSelect }) => {
  const [hovered, setHovered] = useState(false); const color = getColor(eq.categoria);
  return (
    <div onClick={() => onSelect(eq)} style={{ padding: '11px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}`, backgroundColor: hovered ? `${color}10` : 'transparent', transition: T.transition }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ color }}>{getIcon(eq.categoria)}</div>
        <div>
          <span style={{ fontWeight: 600, color: T.textMain, fontSize: '0.9rem', display: 'block' }}>{eq.producto}</span>
          <span style={{ fontSize: '0.75rem', color: T.textMuted }}>{eq.codigo_patrimonio ? `CÓD: ${eq.codigo_patrimonio}` : 'Sin código'} · {eq.estado === 'INSTALADO' ? `Ubicación: ${eq.agencias?.nombre || 'Desconocida'}` : 'EN TALLER'}</span>
        </div>
      </div>
      <Activity size={16} color={T.accent} style={{ opacity: hovered ? 1 : 0.4, transition: T.transition }} />
    </div>
  );
});

const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 };
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: `1px solid ${T.borderMd}`, borderRadius: T.radiusSm, backgroundColor: T.bgInput, color: T.textMain, fontSize: '0.875rem', outline: 'none', transition: T.transition };
const textareaStyle = { ...inputStyle, resize: 'vertical', fontFamily: 'inherit' };
const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: T.radiusSm, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', border: 'none', transition: T.transition };
const btnPrimary = { ...btnBase, backgroundColor: T.accent, color: '#fff' };
const btnSecondary = { ...btnBase, backgroundColor: T.bgCard, color: T.textMuted, border: `1px solid ${T.borderMd}` };
const btnIcon = { background: 'none', border: `1px solid ${T.borderMd}`, borderRadius: T.radiusXs, color: T.textMuted, padding: '5px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', transition: T.transition };
const tdStyle = { padding: '12px 16px' };
const selectFilterStyle = {
  padding: '10px 14px',
  border: `1px solid ${T.borderMd}`,
  borderRadius: T.radiusSm,
  backgroundColor: T.bgInput,
  color: T.textMain,
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer',
  minWidth: '160px',
  transition: T.transition
};
const centeredMsg = { padding: 40, textAlign: 'center', color: T.textMuted, fontSize: '0.9rem' };