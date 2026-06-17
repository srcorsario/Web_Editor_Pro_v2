// state-keys.js (Web_Editor_Pro)
// ARCHIVO EXCLUSIVO: Persistencia y gestión de API Keys en LocalStorage

window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.stateKeys = '1.0.0';

const STORAGE_KEY = 'web_editor_pro_gemini_keys';

export const KeyManager = {
    // Obtener todas las llaves guardadas en el navegador
    getKeys: () => {
        try {
            const keys = localStorage.getItem(STORAGE_KEY);
            return keys ? JSON.parse(keys) : [];
        } catch (e) {
            console.error("Error al leer LocalStorage:", e);
            return [];
        }
    },

    // Guardar una nueva llave de forma segura sin duplicarla
    saveKey: (nuevaKey) => {
        if (!nuevaKey) return;
        const keys = KeyManager.getKeys();
        if (!keys.includes(nuevaKey)) {
            keys.push(nuevaKey);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
        }
    },

    // Eliminar una llave específica del llavero
    deleteKey: (keyAEliminar) => {
        let keys = KeyManager.getKeys();
        keys = keys.filter(k => k !== keyAEliminar);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    }
};
