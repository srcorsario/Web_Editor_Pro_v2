// config-env.js (Web_Editor_Pro)
// ARCHIVO EXCLUSIVO: Infraestructura, pasarelas de comunicación y orígenes de datos de Google

window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.configEnv = '1.0.0';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxBdhrRWx9GNYU_oub52jQcRrG-XRhcDIjdHHW_CYQlob3PNButhNinqw-JLNES_3Ci-w/exec';

export function getWebAppUrl() {
    return WEB_APP_URL;
}

export function getCsvUrl() {
    return CSV_URL;
}
