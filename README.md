# SIG - Sistema Integrado de Gestión (Hardware, Soporte y Relevamiento)

Plataforma web centralizada para la auditoría, control de inventario físico, trazabilidad de hardware y gestión de incidentes técnicos de soporte en agencias y puntos de venta.

---

## 📖 Documentación Principal

Para comprender el flujo de trabajo, los beneficios aplicados al sector (incluyendo la transición desde el uso informal de WhatsApp hacia una base de datos estructurada con trazabilidad completa), la arquitectura técnica y el detalle de cada módulo, consulte el documento principal:

👉 **[Documentación Completa del SIG](file:///c:/Users/TecnicoG/Desktop/Soluciones/soluciones/DOCUMENTACION.md)**

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

Asegúrese de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) en su sistema.

### Instalación de Dependencias

1. Clone el repositorio y acceda a la carpeta del proyecto.
2. Instale las dependencias base del proyecto:
   ```bash
   npm install
   ```
3. Instale el paquete de iconos requerido:
   ```bash
   npm install lucide-react
   ```

### Ejecución en Entorno de Desarrollo

Para iniciar el servidor local de desarrollo con soporte de recarga en caliente (HMR):
```bash
npm run dev
```
La aplicación estará disponible por defecto en `http://localhost:5173`.

### Compilación para Producción

Para generar el bundle optimizado y minificado listo para desplegar:
```bash
npm run build
```
Los archivos de distribución se generarán en la carpeta `dist/`.