📁 config.js

No usa módulos. Se ejecuta en el scope global.
getWebAppUrl()

    Retorna: String (URL del Web App de Google)
    Lee: window.currentMode
    Es usado por: app.js (vía getWebAppUrlSafe()), ui.js (en sincronizarConGoogleSheets)

getCsvUrl()

    Retorna: String (URL del CSV de Google Sheets)
    Lee: window.currentMode
    Es usado por: app.js (vía getCsvUrlSafe()), index.html (en switchTab)

📁 state.js

No usa módulos. Se ejecuta en el scope global.
getKeys()

    Retorna: Array<String>
    Lee: localStorage
    Es usado por: app.js (generarTraduccionEN, ejecutarTraduccionAutomatica), ui.js (iniciarTraduccionPorLotes)

saveKey(key)

    Escribe en: localStorage
    Es usado por: app.js (agregarKey), ui.js (listener de addKeyBtn)

deleteKey(key)

    Escribe en: localStorage
    Es usado por: app.js (eliminarKeySeleccionada), ui.js (listener de btnEliminarKeySeleccionada)

📁 app.js

No usa módulos. Se ejecuta en el scope global. Contiene la lógica principal del Editor.
window.hayCambiosSinGuardar (Variable)

    Tipo: Boolean
    Escribe en: app.js (moverPlato, aplicarCambiosPlato, toggleActivo, cargar, enviarAlExcel)
    Lee de: index.html (switchTab)

window.optimisticState (Variable)

    Tipo: Object ({ RG: {t, s}, USOPEN: {t, s} })
    Escribe en: app.js (cargar, enviarAlExcel, cancelarModoOptimista)
    Lee de: app.js (cargar, iniciarContadorOptimista), sugerencias-print-rg.js, sugerencias-print-usopen.js

cargar(retryCount)

    Retorna: Promise<void>
    Lee: getCsvUrlSafe(), window.optimisticState, window.ESTRUCTURA, window.IDIOMAS_ORDEN, window.IDIOMAS_CSV_INDICES
    Escribe en: window.datosLocales, window.hayCambiosSinGuardar, DOM (#status-carga, #editor-dinamico)
    Es usado por: index.html (switchTab), se auto-invoca al final del archivo.

enviarAlExcel()

    Retorna: Promise<void>
    Lee: getWebAppUrlSafe(), window.datosLocales, window.currentMode, window.IDIOMAS_ORDEN
    Escribe en: window.optimisticState, sessionStorage, window.hayCambiosSinGuardar, DOM (#btn-guardar-dinamico)
    Es usado por: index.html (botón #btn-guardar-dinamico inline onclick), index.html (switchTab)

abrirEditor(id, esNuevo)

    Lee: window.datosLocales, window.IDIOMAS_ORDEN, window.IDIOMAS_CONFIG
    Escribe en: Variables locales (platoEditandoId, esNuevoPlato), DOM (múltiples inputs del modal)
    Es usado por: app.js (prepararNuevoPlato), index.html (botones generados dinámicamente con onclick)

aplicarCambiosPlato()

    Lee: DOM (inputs del modal), window.IDIOMAS_ORDEN, platoEditandoId, esNuevoPlato
    Escribe en: window.datosLocales, window.hayCambiosSinGuardar
    Es usado por: index.html (botón modal onclick)

generarTraduccionEN()

    Lee: DOM (#edit-es), getKeys()
    Escribe en: DOM (#modal-traduccion-en)
    Es usado por: index.html (botón onclick)

ejecutarTraduccionAutomatica()

    Lee: DOM, window.IDIOMAS_ORDEN, getKeys()
    Escribe en: DOM (inputs de idiomas restantes)
    Es usado por: index.html (botón onclick)

cancelarModoOptimista(modo)

    Escribe en: window.optimisticState, sessionStorage, DOM (#optimistic-timer)
    Es usado por: index.html (botón inline onclick en el timer)

📁 ui.js (Módulo ES)

Usa type="module". Todo está encapsulado, pero se expone globalmente al final via window.UI = UI;.
stateContainer (Variable Interna)

    Tipo: { headers: [], csvData: [], currentProMode: 'RG' }
    Nota Crítica: NO es window.datosLocales. Es una copia exclusiva para la pestaña "Traductor Pro".
    Escribe en: UI.cargarGoogleSheets, UI.confirmarImportacion, UI.iniciarTraduccionPorLotes
    Lee de: UI.renderTable, UI.sincronizarConGoogleSheets, UI.exportarCSV

UI.cargarGoogleSheets(targetUrl, retryCount)

    Lee: window.Papa, window.lastSaveAttempt
    Escribe en: stateContainer, DOM (#consola)
    Es usado por: Listeners internos de loadSheetsBtnRG y loadSheetsBtnUSOpen

UI.sincronizarConGoogleSheets()

    Lee: stateContainer, stateContainer.currentProMode, window.getWebAppUrl (desde config.js)
    Escribe en: Red (Fetch POST), DOM (#consola)
    Es usado por: Listener interno de btnSyncSheets

UI.confirmarImportacion(mode)

    Lee: window.UI.tempImportFile
    Escribe en: stateContainer, window.currentMode
    Es usado por: index.html (botón inline onclick en #modal-seleccionar-destino)

UI.cancelarImportacion()

    Escribe en: DOM (#modal-seleccionar-destino, #archivoLocal), window.UI.tempImportFile
    Es usado por: index.html (botón inline onclick)

📁 sugerencias-print-rg.js y sugerencias-print-usopen.js

IIFEs (Invocación Inmediata). Se ejecutan en scope aislado pero inyectan en window.
window.renderCartaRG() / window.renderCartaUSOPEN()

    Lee: window.datosLocales, window.optimisticState (para parchear)
    Escribe en: DOM (#sugerencias-contenido / #sugerencias-contenido-usopen)
    Es usado por: index.html (switchTab)

window.toggleQR(tipo, modo)

    Escribe en: DOM (img #img-qr-rg o #img-qr-usopen)
    Es usado por: HTML generado dinámicamente dentro de las propias funciones de renderizado (radios inline).

📁 index.html (Scripts Inline)

Contiene la orquestación de pestañas y el sistema de arrastre del panel Debug.
switchTab(tabId, btnElement)

    Lee: window.hayCambiosSinGuardar, window.cargar, window.renderCartaRG, window.renderCartaUSOPEN, window.optimisticTimers
    Escribe en: window.currentMode, DOM (tabs, botones flotantes)
    Es usado por: Botones .tab-btn inline onclick

updateDebugPanel()

    Lee: window.APP_VERSIONS, window.optimisticState, window.datosLocales, window.currentMode
    Escribe en: DOM (#debug-versions, #debug-state)
    Es usado por: setInterval interno (cada 1s)

    ¿Cómo usar este archivo en tu flujo de trabajo?

    Si vas a extraer una función (ej. pasar cargar() a un nuevo archivo loader.js):
         Buscas cargar() en el FUNCTION_MAP.md.
         Ves que Lee getCsvUrlSafe() y Escribe en window.datosLocales.
         Te aseguras de importar/exportar o mantener globales esas dependencias antes de cortar la función.
    Si vas a renombrar una variable global (ej. datosLocales a menuData):
         Buscas window.datosLocales en el mapa.
         El mapa te dice exactamente qué 4 archivos la leen y cuáles 3 la escriben. Vas a esos archivos y aplicas el cambio sin miedo a olvidar uno.
    Actualización: Cuando añadas una función nueva que cruce archivos (ej. una nueva función en app.js que llame a algo de ui.js), simplemente añades el bloque correspondiente debajo del archivo en el Markdown. Son 3 líneas de mantenimiento que te ahorran horas de debug.
