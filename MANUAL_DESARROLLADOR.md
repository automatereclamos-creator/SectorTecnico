# Manual del Desarrollador - SIG (Sistema Integrado de Gestión)

Bienvenido/a al código base de SIG. Este documento está diseñado para que el próximo desarrollador que asuma el mantenimiento y la expansión de este sistema pueda entender rápidamente la arquitectura, los patrones utilizados y sepa exactamente por dónde continuar.

## 1. Stack Tecnológico

El proyecto es una **SPA (Single Page Application)** construida con:
*   **Frontend Core**: React (v19) + Vite (v8).
*   **Estilos**: CSS nativo utilizando variables (CSS Custom Properties) para el sistema de temas (Dark/Light). Aunque hay configuración de Tailwind en `package.json`, gran parte del styling y layout core está en `src/styles.css` y estilos inline.
*   **Base de Datos y Auth**: Supabase (PostgreSQL + GoTrue).
*   **Componentes UI adicionales**: `@mui/material` (para ciertos elementos), `@mui/x-charts` y `recharts` para dashboards. `lucide-react` para iconografía.

## 2. Estructura del Proyecto

El código fuente se aloja íntegramente en la carpeta `src/`. El proyecto sigue una separación clara de responsabilidades:

```text
src/
├── App.jsx                 # Punto de entrada principal, enrutador y control de sesión/tema.
├── main.jsx                # Renderizado del root de React.
├── styles.css              # Sistema de diseño, variables CSS y utilidades globales.
├── components/             # Componentes de UI (Vistas, Paneles, Modales).
├── hooks/                  # Lógica de negocio y manejo de estado complejo (React Custom Hooks).
├── services/               # Capa de acceso a datos e integraciones (Supabase).
├── config/                 # Inicialización de clientes (Supabase).
├── constants/              # Constantes globales (Ej. Roles y permisos).
└── utils/                  # Funciones de ayuda (formateo de fechas, textos).
```

### Patrón de Arquitectura: UI -> Hook -> Service
Para mantener los componentes limpios, el sistema utiliza un patrón de tres capas:
1.  **Componente (`components/`)**: Se encarga puramente de pintar la interfaz y manejar eventos de usuario.
2.  **Custom Hook (`hooks/`)**: Maneja el estado local del componente, reglas de negocio y orquesta las llamadas asíncronas. Ejemplo: `useMantenimientoForm.js`, `useInventario.js`.
3.  **Servicio (`services/`)**: Ejecuta exclusivamente las consultas a la base de datos (Supabase). Ejemplo: `storageService.js`, `agenciasService.js`.

## 3. Flujo Principal y Enrutamiento (`App.jsx`)

El sistema **NO utiliza** bibliotecas como `react-router-dom`. El enrutamiento se maneja de forma manual a través del estado en `App.jsx`.

### Autenticación y Carga
1.  Al iniciar, `App.jsx` escucha el estado de sesión de Supabase (`supabase.auth.getSession()` y `onAuthStateChange`).
2.  Si hay sesión activa, consulta la tabla `perfiles` en Supabase para obtener el `rol`, `nombre_completo` y si el usuario está `activo`.
3.  Dependiendo del rol (`admin`, `tecnico`, `soporte`, `encargado`), se decide a qué vista inicial enviarlo.

### Navegación por Estado (Lazy Mount)
*   El estado `vistaTecnico` (y el de persistencia `vistasVisitadas`) determina qué vista (menú, panel, relevamiento, soporte, ruta) se muestra en pantalla usando `display: block` o `display: none`.
*   Esto mantiene el estado de las vistas previas sin desmontarlas, lo cual es útil para que los técnicos no pierdan datos si alternan entre pestañas de la aplicación.

### Control de Permisos
*   Se utiliza el archivo `constants/roles.js` (probablemente importando `PERMISOS`) para decidir qué rol tiene acceso a qué componente. La función `tienePermiso('modulo')` en `App.jsx` restringe el acceso.

## 4. Guía para Nuevos Desarrollos (Cómo seguir)

### A. Cómo agregar una nueva tabla o módulo
Si necesitas agregar, por ejemplo, un módulo de "Vehículos":
1.  **Base de Datos (Supabase)**: Crea la tabla `vehiculos` en Supabase Dashboard.
2.  **Servicio (`src/services/vehiculosService.js`)**:
    Crea un archivo exportando funciones que hagan los `select`, `insert`, `update` correspondientes usando `supabase.from('vehiculos')`.
3.  **Hook (`src/hooks/useVehiculos.js`)**:
    Crea el hook que llame al servicio, maneje el estado de carga (`cargando`), el arreglo de datos (`vehiculos`) y los errores.
4.  **Componente (`src/components/VehiculosManager.jsx`)**:
    Crea la interfaz de usuario. Importa tu hook y bindea los datos a la tabla/formulario.
5.  **Enrutamiento (`App.jsx`)**:
    *   Agrega la nueva vista al estado y al render (ej. `<div style={{ display: vistaTecnico === 'vehiculos' ? 'block' : 'none' }}>...`).
    *   No olvides agregar el permiso en `constants/roles.js` y el botón de navegación en el menú o panel lateral correspondiente (`MainMenu.jsx` o `PanelOperativo.jsx`).

### B. Cómo modificar formularios existentes
Si entras a modificar formularios como el `RelevamientoForm.jsx` o el `TaskForm.jsx` (que a veces ha presentado problemas en la inserción de DB):
*   Busca el archivo en `src/components`.
*   Identifica el hook que utiliza (ej. `useMantenimientoForm` o `useTaskForm`).
*   Toda la lógica de guardado estará en el Hook, en funciones como `handleSubmit`. Revisa allí cómo se arman los objetos y cómo se llaman a los servicios en `src/services/storageService.js`.
*   **Recuerda**: Los campos de la base de datos deben mapear exactamente a lo que envías desde el servicio.

## 5. Mantenimiento y Troubleshooting

*   **Error "JWT expirado" o deslogueos aleatorios**:
    Revisa la lógica en `App.jsx` en el bloque de `PGRST301`. Supabase automáticamente renueva tokens, pero si el técnico pierde conexión prologandamente, el token puede expirar. El sistema lo fuerza a reloguear para evitar bugs fantasma de inserción de DB fallidas.
*   **Offline Mode**:
    El hook `useOnlineStatus.js` y el banner rojo en `App.jsx` advierten sobre falta de conectividad. Para evitar pérdida de datos, ciertas acciones de guardado podrían estar protegidas comprobando si `isOnline` es true.
*   **Errores al enviar a DB (Ej. `storageService.saveMantenimiento` falla)**:
    Siempre usa `console.log()` antes del bloque del `try...catch` en los hooks para asegurar que los datos no lleguen como `undefined`. Muchas veces Supabase rechaza el insert si una columna no admite nulos pero el form no la validó.
*   **Modo Oscuro/Claro**:
    Está centralizado en `App.jsx` (`theme`) y sincronizado con clases en el `<body>` (`theme-dark`, `theme-light`). Los colores reales (como `--bg-main`, `--text-main`) se definen en `src/styles.css`. No "hardcodees" colores hexadecimales en los componentes, usa `var(--nombre-color)`.

## 6. Comandos Básicos
*   `npm run dev`: Iniciar el entorno de desarrollo local (normalmente puerto 5173).
*   `npm run build`: Compilar la versión de producción en la carpeta `dist`.
*   `npm run lint`: Ejecutar ESLint para asegurar calidad del código.

## 7. Dependencias Clave a tener en cuenta
*   **Supabase JS**: Vital para la persistencia. Si actualizas su versión, lee los breaking changes, ya que sus tipos de respuesta de error a veces mutan.
*   **JSPdf / docx**: Utilizados para generar remitos y exportables en el Panel Operativo. Modificar estas plantillas requiere cuidado con la posición (X, Y) de los elementos en el canvas del PDF.

---
**¡Mucho éxito con el desarrollo del sistema!** Tienes una base sólida, tipada (en su mayoría por estructura, no TS, pero bien definida) y altamente modular.
