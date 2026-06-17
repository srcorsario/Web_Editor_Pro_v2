// state-data.js (Web_Editor_Pro)
// ARCHIVO EXCLUSIVO: Gestión de datos en memoria del CSV y validaciones estructurales

window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.stateData = '1.0.0';

// El contenedor limpio donde api.js inyectará los datos devueltos por Google
export const stateContainer = {
    headers: [],
    csvData: []
};

// Funciones puras de comprobación (No tocan la interfaz)
export const ValidadoresCSV = {
    esEstructuraValida: (headers) => {
        if (!headers || headers.length === 0) return false;
        
        // Comprobación quirúrgica de las dos columnas obligatorias para que la app no colapse
        const tieneId = headers.findIndex(h => h && h.toUpperCase() === 'ID') !== -1;
        const tieneNombreES = headers.findIndex(h => h && h.toUpperCase() === 'NOMBRE_ES') !== -1;
        
        return tieneId && tieneNombreES;
    }
};
