// --- config.js ---
// NUEVO: Archivo centralizado de configuración de URLs y endpoints
window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.config = '1.0.0';

// MODIFICADO: Movido desde app.js para centralizar la configuración
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';

// MODIFICADO: Movido desde state.js para centralizar la configuración
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxBdhrRWx9GNYU_oub52jQcRrG-XRhcDIjdHHW_CYQlob3PNButhNinqw-JLNES_3Ci-w/exec';

function getWebAppUrl() {
    return WEB_APP_URL;
}
