const API_KEY = "Palpitos_Secure_Access_2026_Key"; // Tu contraseña secreta

/**
 * Validador de Seguridad
 */
function isAuthorized(e) {
  // En Google Apps Script, los encabezados vienen en e.parameter o e.postData
  // pero la forma más segura es enviarlo como un parámetro en la URL o un campo en el JSON
  // Para simplificar y asegurar, validaremos un campo 'key' en la petición.
  return e.parameter.key === API_KEY;
}
/**
 * APP: Sistema de Gestión de Soporte Técnico - Pálpitos SRL
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Verificamos si la app nos está pidiendo algo específico (ej: ?tipo=relevamientos)
  var tipo = (e && e.parameter && e.parameter.tipo) ? e.parameter.tipo : null;
  
  // =========================================================
  // CASO NUEVO: Leer datos de Relevamiento
  // =========================================================
  if (tipo === "relevamientos") {
    var sheetRel = ss.getSheetByName("relevamiento");
    if (!sheetRel) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    var dataRel = sheetRel.getDataRange().getValues();
    if (dataRel.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    
    dataRel.shift(); // Sacamos los encabezados
    
    // Mapeamos según el orden exacto en el que guardaste en tu doPost
    var registros = dataRel.map(function(row) {
      return {
        fecha: row[0],             // A: Fecha
        empresa: row[1],           // B: Empresa
        id_agencia: row[2],        // C: ID Agencia
        nombre_agencia: row[3],    // D: Nombre Agencia
        categoria: row[4],         // E: Categoría
        producto: row[5],          // F: Producto
        marca: row[6],             // G: Marca
        procesador: row[7],        // H: Procesador
        disco: row[8],             // I: Disco
        cantidad: row[9]           // J: Cantidad
      };
    });
    
    return ContentService.createTextOutput(JSON.stringify(registros)).setMimeType(ContentService.MimeType.JSON);
  }

  // =========================================================
  // CASO ORIGINAL POR DEFECTO: Leer Reclamos Pendientes
  // =========================================================
  var sheet = ss.getSheetByName("reclamos");
  
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  var head = data.shift();
  
  var pendientes = data.map(function(row, index) {
    return {
      rowId: index + 2,
      empresa: row[1], id: row[2], nombre: row[3],
      informa: row[4], horario: row[5], telefono: row[6],
      carga: row[7], estado: row[8]
    };
  }).filter(function(item) {
    return item.estado === "PENDIENTE";
  });

  return ContentService.createTextOutput(JSON.stringify(pendientes))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // CASO 1: Actualizar a SOLUCIONADO
    if (data.tipo === "update_status") {
      var sheetRec = ss.getSheetByName("reclamos");
      sheetRec.getRange(data.rowId, 9).setValue("SOLUCIONADO");
      return ContentService.createTextOutput(JSON.stringify({"result": "status_updated"}));
    }

    // CASO 2: Guardar Reclamo (Soporte)
    if (data.tipo === "reclamo") {
      var sheetRec = ss.getSheetByName("reclamos");
      var rowRec = [
        new Date(), data.empresa, data.id, data.nombre, 
        data.informa, data.horario, data.telefono, data.carga, "PENDIENTE"
      ];
      sheetRec.appendRow(rowRec);
      return ContentService.createTextOutput(JSON.stringify({"result": "reclamo_saved"}));
    }

    // =========================================================
    // CASO NUEVO: Guardar Relevamiento (Inventario de Agencia)
    // =========================================================
    if (data.tipo === "relevamiento") {
      var sheetRel = ss.getSheetByName("relevamiento");
      var equipos = JSON.parse(data.equipos);
      var fechaActual = new Date();
      
      // Creamos UNA fila por cada equipo relevado
      equipos.forEach(function(eq) {
        sheetRel.appendRow([
          fechaActual,          // A: Fecha
          data.empresa,       // B: Técnico que releva
          data.id_agencia,         // C: Empresa
          data.nombre_agencia,      // D: ID Agencia
          eq.categoria,         // E: Categoría
          eq.producto,          // F: Producto / Descripción manual
          eq.marca,
          eq.procesador || "",  // I: Procesador (si aplica)
          eq.disco || "",             // G: Marca
          eq.cantidad          // H: Cantidad
                  // J: Disco (si aplica)
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({"result": "relevamiento_saved"}));
    }
    // =========================================================

    // CASO 3: Guardar Solución y Movimientos de Stock
    var sheetSol = ss.getSheetByName("soluciones");
    var rowSol = [
      new Date(), data.fecha, data.empresa, data.id, data.nombre,
      data.trabajo, data.hora_inicio || data.horaInicio, data.hora_fin || data.horaFin,
      data.total_horas, data.tecnico1, data.tecnico2, data.tecnico3,
      data.observaciones, data.materiales_consumidos || "[]" 
    ];
    sheetSol.appendRow(rowSol);
    
    if (data.originRowId) {
      var sheetRec = ss.getSheetByName("reclamos");
      sheetRec.getRange(data.originRowId, 9).setValue("SOLUCIONADO");
    }

    // DESGLOSE EN HOJA 'movimientos'
    if (data.materiales_consumidos && data.materiales_consumidos !== "[]") {
      try {
        var sheetMov = ss.getSheetByName("movimientos");
        if (sheetMov) {
          var arrayMateriales = JSON.parse(data.materiales_consumidos);
          var fechaRegistro = new Date();
          
          var tecnicos = [data.tecnico1, data.tecnico2, data.tecnico3];
          var cuadrilla = tecnicos.filter(function(t) { return t && t.trim() !== ""; }).join(", ");
          
          arrayMateriales.forEach(function(mat) {
            sheetMov.appendRow([
              fechaRegistro,   // A: Fecha
              data.id,         // B: Ticket ID
              mat.codigo,      // C: Producto (Código General, ej: PC-GEN)
              mat.marca,       // D: Marca
              mat.cantidad,    // E: Cantidad
              cuadrilla,       // F: Técnicos
              mat.serie || ""  // G: N° Serie / Código Interno fusionado
            ]);
          });
        }
      } catch (errMov) {
        console.error("Error en desglose de materiales: " + errMov);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({"result": "solucion_saved"}));

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"error": error.toString()}));
  }
}