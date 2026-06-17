// state-process.js (Web_Editor_Pro)
// ARCHIVO EXCLUSIVO: Estado de control de los hilos de traducción de la IA y navegación

window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.stateProcess = '1.0.0';

export const ProcesoEstado = {
    procesoDetenido: false,
    procesoPausado: false,
    activeLang: 'EN',       // Idioma seleccionado actualmente en el Box 2
    currentKeyIndex: 0     // Índice de la API Key que se está usando para la rotación activa
};
