// config-ia.js (Web_Editor_Pro)
// ARCHIVO EXCLUSIVO: Constantes operativas de la API de Inteligencia Artificial

window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.configIa = '1.0.0';

export const ENDPOINTS = {
    GEMINI_GATEWAY: "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
};

export const CONFIG_PROCESO = {
    TAMANO_LOTE: 3,
    DELAY_REINTENTO_MS: 3000,
    DELAY_LOTE_MS: 2500
};
