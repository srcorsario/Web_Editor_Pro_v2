// ui-events.js
// Probando la conexión de los nuevos módulos de configuración y estado

import { getCsvUrl, getWebAppUrl } from './config-env.js';
import { CONFIG_PROCESO } from './config-ia.js';
import { stateContainer } from './state-data.js';
import { ProcesoEstado } from './state-process.js';
import { KeyManager } from './state-keys.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 ¡Estructura modular en marcha!");
    
    // Verificación 1: Comprobar que lee las URLs de Google del config-env
    console.log("URL de tu CSV guardada con éxito:", getCsvUrl());

    // Verificación 2: Comprobar que lee el LocalStorage del state-keys
    const llavesActuales = KeyManager.getKeys();
    console.log("API Keys detectadas en tu navegador:", llavesActuales);

    // Verificación 3: Pintar las versiones dinámicamente en tu cabecera
    const versionEl = document.getElementById('app-version');
    if (versionEl) {
        const v = window.APP_VERSIONS;
        versionEl.innerText = `Core Modulado | Env:${v.configEnv || '?'} | IA:${v.configIa || '?'} | Data:${v.stateData || '?'} | Process:${v.stateProcess || '?'}`;
    }
});
