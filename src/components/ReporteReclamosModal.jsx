import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, AlertTriangle, User, AlertCircle, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { storageService } from '../services/storageService';
import { buscarAgencia } from '../services/agenciasService';

const ReporteReclamosModal = ({ isOpen, onClose }) => {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroIdAgencia, setFiltroIdAgencia] = useState('');
  const [nombreAgencia, setNombreAgencia] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultados, setResultados] = useState(null);

  useEffect(() => {
    if (filtroEmpresa && filtroEmpresa !== 'Todas' && filtroEmpresa !== 'Otros' && filtroIdAgencia) {
      buscarAgencia(filtroEmpresa, filtroIdAgencia).then(ag => {
        if (ag) {
          setNombreAgencia(ag.nombre);
        } else {
          setNombreAgencia('No encontrada');
        }
      });
    } else {
      setNombreAgencia('');
    }
  }, [filtroEmpresa, filtroIdAgencia]);

  if (!isOpen) return null;

  const handleGenerar = async () => {
    if (!fechaDesde || !fechaHasta) {
      setError('Por favor selecciona ambas fechas');
      return;
    }
    
    if (new Date(fechaDesde) > new Date(fechaHasta)) {
      setError('La fecha "Desde" no puede ser mayor que "Hasta"');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await storageService.getReporteReclamosData(fechaDesde, fechaHasta, filtroEmpresa, filtroIdAgencia);
      setResultados(data);
    } catch (err) {
      console.error(err);
      setError('Error al generar el reporte: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    if (!resultados) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Reclamos', 14, 22);
    
    doc.setFontSize(11);
    const filtrosAg = [];
    if (filtroEmpresa) filtrosAg.push(`Empresa: ${filtroEmpresa}`);
    if (filtroIdAgencia) filtrosAg.push(`ID: ${filtroIdAgencia}`);
    const textoFiltrosAg = filtrosAg.length > 0 ? `   ${filtrosAg.join(' ')}` : '';
    doc.text(`Desde: ${fechaDesde}   Hasta: ${fechaHasta}${textoFiltrosAg}`, 14, 30);
    
    doc.setFontSize(14);
    doc.text(`Total de Reclamos: ${resultados.totalReclamos}`, 14, 40);
    
    let yPos = 50;
    
    if (resultados.rankingAgencias.length > 0) {
      doc.setFontSize(12);
      doc.text('Ranking de Agencias', 14, yPos);
      
      const tableData = resultados.rankingAgencias.map((ag, i) => [
        `#${i+1}`,
        ag.nombre,
        (ag.empresa || '').toUpperCase(),
        ag.cantidad
      ]);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Pos', 'Agencia', 'Empresa', 'Cantidad']],
        body: tableData,
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    if (resultados.rankingOperadores.length > 0) {
      doc.setFontSize(12);
      doc.text('Operadores (Carga de Reclamos)', 14, yPos);
      
      const tableData = resultados.rankingOperadores.map((op, i) => [
        `#${i+1}`,
        op.nombre,
        op.cantidad
      ]);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Pos', 'Operador', 'Cantidad Reclamos']],
        body: tableData,
      });
      yPos = doc.lastAutoTable.finalY + 15;
    }
    
    if (resultados.rankingDias && resultados.rankingDias.length > 0) {
      doc.setFontSize(12);
      doc.text('Días de Mayor Demanda', 14, yPos);
      
      const tableData = resultados.rankingDias.map((d, i) => [
        `#${i+1}`,
        d.nombre,
        d.cantidad
      ]);
      
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Pos', 'Día', 'Cantidad Reclamos']],
        body: tableData,
      });
    }
    
    doc.save(`Reporte_Reclamos_${fechaDesde}_a_${fechaHasta}.pdf`);
  };

  const getEmpresaColors = (empresaRaw) => {
    const emp = String(empresaRaw || '').toLowerCase().trim();
    if (emp.includes('alfa')) return { bg: 'rgba(234, 88, 12, 0.15)', text: '#ea580c', label: 'ALFA' }; 
    if (emp.includes('palpitos') || emp.includes('pálpitos')) return { bg: 'rgba(79, 70, 229, 0.15)', text: '#818cf8', label: 'PÁLPITOS' }; 
    return { bg: 'var(--bg-input)', text: 'var(--text-muted)', label: emp.toUpperCase() || 'S/E' }; 
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-panel)', borderRadius: '12px',
        width: '90%', maxWidth: '800px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '1px solid var(--border-md)',
        overflow: 'hidden'
      }}>
        {/* HEADER */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={24} color="#eab308" />
            Reporte de Reclamos
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '5px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
            transition: 'background 0.2s'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* CONTROLES */}
        <div style={{ padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Fecha Desde</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
              <input 
                type="date" 
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 40px',
                  borderRadius: '8px', border: '1px solid var(--border-md)',
                  backgroundColor: 'var(--bg-input)', color: 'var(--text-main)',
                  outline: 'none',
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Fecha Hasta</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }} />
              <input 
                type="date" 
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
                min={fechaDesde}
                style={{
                  width: '100%', padding: '10px 12px 10px 40px',
                  borderRadius: '8px', border: '1px solid var(--border-md)',
                  backgroundColor: 'var(--bg-input)', color: 'var(--text-main)',
                  outline: 'none',
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Empresa</label>
            <select
              value={filtroEmpresa}
              onChange={e => setFiltroEmpresa(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: '8px', border: '1px solid var(--border-md)',
                backgroundColor: 'var(--bg-input)', color: 'var(--text-main)',
                outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="">Todas</option>
              <option value="Alfa">Alfa</option>
              <option value="Palpitos">Pálpitos</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div style={{ flex: '1', minWidth: '100px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>ID Agencia</label>
            <input 
              type="text" 
              value={filtroIdAgencia}
              onChange={e => setFiltroIdAgencia(e.target.value)}
              placeholder="Opcional"
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: '8px', border: '1px solid var(--border-md)',
                backgroundColor: 'var(--bg-input)', color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: '2', minWidth: '180px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Nombre Agencia</label>
            <input 
              type="text" 
              value={nombreAgencia}
              disabled
              placeholder="Automático"
              style={{
                width: '100%', padding: '10px 12px',
                borderRadius: '8px', border: '1px solid var(--border-md)',
                backgroundColor: 'var(--bg-panel)', color: 'var(--text-hint)',
                outline: 'none', cursor: 'not-allowed'
              }}
            />
          </div>

          <button 
            onClick={handleGenerar}
            disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              backgroundColor: '#eab308', color: '#000', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s', height: '42px'
            }}
          >
            {loading ? <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <Download size={18} />}
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>

        {error && (
          <div style={{ margin: '15px 24px 0', padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* RESULTADOS */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, backgroundColor: 'var(--bg-body)' }}>
          {!resultados && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--text-hint)' }}>
              <AlertTriangle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>Selecciona un rango de fechas y presiona Generar Reporte</p>
            </div>
          )}

          {resultados && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                <button 
                  onClick={exportarPDF}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-md)',
                    backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'background 0.2s'
                  }}
                >
                  <FileText size={16} /> Exportar PDF
                </button>
              </div>

              {/* Tarjeta de Resumen */}
              <div style={{ backgroundColor: 'var(--bg-card)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>TOTAL RECLAMOS EN EL PERIODO</h3>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>{resultados.totalReclamos}</p>
                </div>
                <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '15px', borderRadius: '50%' }}>
                  <AlertTriangle size={32} color="#eab308" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* Ranking de Agencias */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid var(--border-md)', backgroundColor: 'var(--bg-panel)' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={18} color="var(--warning)" /> Agencias con más Reclamos
                    </h3>
                  </div>
                  <div style={{ flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
                    {resultados.rankingAgencias.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-hint)', fontSize: '0.9rem' }}>No hay datos en el periodo</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <tbody>
                          {resultados.rankingAgencias.map((ag, i) => {
                            const empColors = getEmpresaColors(ag.empresa);
                            return (
                              <tr key={ag.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '12px 15px', width: '30px', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{i+1}</td>
                                <td style={{ padding: '12px 15px' }}>
                                  <div style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '0.9rem' }}>{ag.nombre} (ID: {ag.id})</div>
                                  <div style={{ marginTop: '4px' }}>
                                    <span style={{ backgroundColor: empColors.bg, color: empColors.text, fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>{empColors.label}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)' }}>{ag.cantidad}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Ranking de Operadores */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid var(--border-md)', backgroundColor: 'var(--bg-panel)' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={18} color="var(--accent-blue)" /> Operadores (Carga)
                    </h3>
                  </div>
                  <div style={{ flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
                    {resultados.rankingOperadores.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-hint)', fontSize: '0.9rem' }}>No hay datos en el periodo</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <tbody>
                          {resultados.rankingOperadores.map((op, i) => (
                            <tr key={op.nombre} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px 15px', width: '30px', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{i+1}</td>
                              <td style={{ padding: '12px 15px' }}>
                                <div style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column' }}>
                                  <span>{op.nombre}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)' }}>{op.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Ranking de Días de la Semana */}
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-md)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid var(--border-md)', backgroundColor: 'var(--bg-panel)' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={18} color="var(--primary)" /> Días de Mayor Demanda
                    </h3>
                  </div>
                  <div style={{ flex: 1, maxHeight: '300px', overflowY: 'auto' }}>
                    {!resultados.rankingDias || resultados.rankingDias.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-hint)', fontSize: '0.9rem' }}>No hay datos en el periodo</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <tbody>
                          {resultados.rankingDias.map((d, i) => (
                            <tr key={d.nombre} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px 15px', width: '30px', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{i+1}</td>
                              <td style={{ padding: '12px 15px' }}>
                                <div style={{ fontWeight: '500', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column' }}>
                                  <span>{d.nombre}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-main)' }}>{d.cantidad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReporteReclamosModal;
