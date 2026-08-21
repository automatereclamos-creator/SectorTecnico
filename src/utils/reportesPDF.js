// src/utils/reportesPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- CAMBIO 1: Importamos la función directamente
import { hoyISO, formatearFechaTZ } from './timezone';

export const generarReportePDF = (agencias, tipo = 'TOTAL', agenciaId = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // --- ENCABEZADO PRINCIPAL ---
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80);
  doc.text("Reporte de Inventario", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha de emisión: ${formatearFechaTZ(new Date())}`, 14, 28);
  doc.text(`Tipo de reporte: ${tipo === 'TOTAL' ? 'Flota Completa' : `Agencia ID ${agenciaId}`}`, 14, 33);
  
  let startY = 45;

  const agenciasAProcesar = tipo === 'INDIVIDUAL' 
    ? agencias.filter(a => a.id === agenciaId) 
    : agencias;

  // --- GENERACIÓN DE TABLAS POR AGENCIA ---
  agenciasAProcesar.forEach((agencia, index) => {
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Agencia ID: ${agencia.id} - ${agencia.nombre}`, 14, startY);
    
    const tableBody = agencia.equipos.map(eq => [
      eq.categoria,
      eq.producto || eq.categoria,
      eq.marca || 'Genérica',
      eq.procesador && eq.procesador !== 'N/A' ? eq.procesador : '-',
      eq.disco && eq.disco !== 'N/A' ? eq.disco : '-',
      eq.cantidad
    ]);

    // <-- CAMBIO 2: Llamamos a autoTable pasándole el doc primero
    autoTable(doc, {
      startY: startY + 4,
      head: [['Categoría', 'Equipo', 'Marca', 'CPU', 'Disco', 'Cant.']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    // Actualizar la posición Y leyendo desde la función autoTable
    startY = doc.lastAutoTable.finalY + 15;

    if (startY > 270) {
        doc.addPage();
        startY = 20;
    }
  });

  // --- GUARDADO DEL ARCHIVO ---
  const nombreArchivo = tipo === 'INDIVIDUAL' 
    ? `Reporte_Agencia_${agenciaId}.pdf` 
    : `Reporte_Inventario_Total_${hoyISO()}.pdf`;
    
  doc.save(nombreArchivo);
};