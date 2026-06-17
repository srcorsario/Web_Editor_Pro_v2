// =========================================================================
// REPOSITORIO: FRONTEND ADMINISTRADOR CARTA
// ARCHIVO: app.js (VERSIÓN COMPLETAMENTE UNIFICADA Y ALINEADA CON EL BACKEND)
// =========================================================================

window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.app = '13.0.1'; 

window.currentMode = window.currentMode || 'RG'; 
window.datosLocales = window.datosLocales || [];

let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 
let opcionesENActuales = [];

// 📊 ÍNDICES EXACTOS SEGÚN TU GOOGLE APPS SCRIPT (Base 0 para JavaScript)
window.IDIOM_CSV_INDICES = {
    'es': 3,   // Columna D (4) - ES
    'en': 7,   // Columna H (8) - EN
    'de': 8,   // Columna I (9) - DE
    'fr': 9,   // Columna J (10) - FR
    'it': 10,  // Columna K (11) - IT
    'ru': 11,  // Columna L (12) - RU
    'nl': 12,  // Columna M (13) - NL
    'pl': 13,  // Columna N (14) - PL
    'sv': 14,  // Columna O (15) - SV
    'no': 15,  // Columna P (16) - NO
    'da': 16,  // Columna Q (17) - DA
    'fi': 17,  // Columna R (18) - FI
    'pt': 18,  // Columna S (19) - PT
    'ro': 19,  // Columna T (20) - RO
    'hu': 20,  // Columna U (21) - HU
    'cs': 21,  // Columna V (22) - CS
    'el': 22,  // Columna W (23) - EL
    'tr': 23,  // Columna X (24) - TR
    'ar': 24,  // Columna Y (25) - AR
    'zh': 25,  // Columna Z (26) - ZH
    'ja': 26,  // Columna AA (27) - JA
    'ca': 27,  // Columna AB (28) - CA
    'eu': 28,  // Columna AC (29) - EU
    'gl': 29,  // Columna AD (30) - GL
    'va': 30,  // Columna AE (31) - VA
    'ko': 31   // Columna AF (32) - KO (Coreano)
};

// Generamos el array de ordenación automáticamente usando las claves del mapa de arriba
window.IDIOMAS_ORDEN = Object.keys(window.IDIOM_CSV_INDICES);

// Configuración visual de nombres completos para la UI del editor
window.IDIOMAS_CONFIG = {
    'ES': 'Español', 'EN': 'Inglés', 'DE': 'Alemán', 'FR': 'Francés', 'IT': 'Italiano',
    'RU': 'Ruso', 'NL': 'Neerlandés', 'PL': 'Polaco', 'SV': 'Sueco', 'NO': 'Noruego',
    'DA': 'Danés', 'FI': 'Finlandés', 'PT': 'Portugués', 'RO': 'Rumano', 'HU': 'Húngaro',
    'CS': 'Checo', 'EL': 'Griego', 'TR': 'Turco', 'AR': 'Árabe', 'ZH': 'Chino',
    'JA': 'Japonés', 'CA': 'Catalán', 'EU': 'Euskera', 'GL': 'Gallego', 'VA': 'Valenciano',
    'KO': 'Coreano'
};

// Estructura por defecto de categorías si no se hereda de config.js
if (typeof window.ESTRUCTURA === 'undefined') {
    window.ESTRUCTURA = [
        { id: 10000, rango: 999, name: "Entrantes", folder: "entrantes" },
        { id: 11000, rango: 999, name: "Principales", folder: "principales" },
        { id: 12100, rango: 199, name: "Croquetas", folder: "croquetas" },
        { id: 13000, rango: 999, name: "Bodega", folder: "bodega" }
    ];
}

const ALERGENOS_LISTA = [
    "🌾 GLUTEN", "🫘 SESAMO", "🥜 CACAHUETE", "🌱 SOJA", "🌰 FRUTOSCASCARA", 
    "🥬 APIO", "🥚 HUEVO", "🐟 PESCADO", "🟡 MOSTAZA", "🐚 MOLUSCO", 
    "🧪 SULFITOS", "🥛 LACTOSA", "🌼 ALTRAMUCES", "🦐 CRUSTACEO", 
    "🌿 VEGANO", "🥗 VEGETARIANO"
];

const CROQUETAS_CONFIG = {
    carne: ["Cecina de vaca", "Rabo de toro", "Pollo", "Jamón Ibérico", "Puchero de cerdo"],
    pescado: ["Gamba al ajillo", "Chipirones"],
    vegetariana: ["Setas", "Coliflor con curry"]
};

// --- UTILS ---
function superLimpiar(texto) {
    if (!texto) return "";
    let t = texto.toString().trim();
    if (t.startsWith('"') && t.endsWith('"')) t = t.substring(1, t.length - 1);
    t = t.replace(/""/g, '"');
    return t.trim();
}

function desglosarNombre(texto) {
    if (!texto) return { nombre: "", uvas: "" };
    const partes = texto.split('//');
    return {
        nombre: partes[0] ? partes[0].trim() : "",
        uvas: partes[1] ? partes[1].trim() : ""
    };
}

function formatWineName(texto) {
    if (!texto) return "";
    const partes = texto.split('(');
    let nombrePrincipal = partes[0].toUpperCase();
    if (partes.length > 1) {
        return nombrePrincipal + '(' + partes.slice(1).join('(');
    }
    return nombrePrincipal;
}

function extraerJSON(texto) {
    let limpio = texto.replace(/```json/g, '').replace(/```/g, '').trim();
    let braceCount = 0;
    let startIndex = -1;
    
    for (let i = 0; i < limpio.length; i++) {
        if (limpio[i] === '{') {
            if (braceCount === 0) startIndex = i;
            braceCount++;
        } else if (limpio[i] === '}') {
            braceCount--;
            if (braceCount === 0 && startIndex !== -1) {
                const jsonString = limpio.substring(startIndex, i + 1);
                try {
                    return JSON.parse(jsonString);
                } catch (e) {
                    console.error("JSON aislado pero inválido:", jsonString);
                    throw new Error("JSON inválido: " + e.message);
                }
            }
        }
    }
    throw new Error("No se encontró un JSON válido en la respuesta de la IA.");
}

// --- FUNCIÓN CARGAR (ALINEADA AL BACKEND 32 COLUMNAS) ---
async function cargar() {
    try {
        if (typeof UI !== 'undefined' && typeof UI.log === 'function') {
            UI.log('[Editor] Conectando con Google Sheets remoto...');
        }
        
        if (typeof getCsvUrl !== 'function') {
            console.error("La función getCsvUrl() no está definida.");
            const statusCarga = document.getElementById('status-carga');
            if (statusCarga) statusCarga.innerText = "❌ Error: getCsvUrl no configurado";
            return;
        }

        const resp = await fetch(getCsvUrl() + '&t=' + Date.now());
        const text = await resp.text();
        const filas = text.split(/\r?\n/).filter(f => f.trim() !== "");
        
        window.datosLocales = []; 
        
        const indicesIdiomas = window.IDIOM_CSV_INDICES;
        const ordenIdiomas = window.IDIOMAS_ORDEN;

        filas.forEach((f, i) => {
            if (i === 0) return; // Saltar cabecera
            
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const id = parseInt(c[0]);
            
            if (!isNaN(id)) {
                let item = {
                    id: id,
                    precio: c[1] || "0.00", 
                    activa: (c[2] || "").trim().toUpperCase() === "SI" || (c[2] || "").trim().toUpperCase() === "SÍ",
                    carpeta: c[4] || "",                  // Columna E (5) -> c[4]
                    imagen: c[5] || "",                   // Columna F (6) -> c[5]
                    alergenos: superLimpiar(c[6] || "")    // Columna G (7) -> c[6]
                };
                
                // Mapeo estable de todos los idiomas de tu estructura fija
                ordenIdiomas.forEach(lang => {
                    const idx = indicesIdiomas[lang];
                    if (idx !== undefined && c[idx] !== undefined) {
                        item[lang] = superLimpiar(c[idx]);
                    } else {
                        item[lang] = "";
                    }
                });
                
                window.datosLocales.push(item);
            }
        });
        
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) {
            statusCarga.innerText = `✅ Sincronizados ${window.datosLocales.length} platos (${ordenIdiomas.length} Idiomas)`;
            statusCarga.className = "status-ok";
        }
        
        renderizar();
        generarMenuAgrupado();
    } catch (e) { 
        console.error("Error crítico en la carga de app.js:", e);
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) statusCarga.innerText = "❌ Error al cargar base multidireccional"; 
    }
}

// --- FUNCIÓN RENDERIZAR ---
function renderizar() {
    const editorContainerId = window.currentMode === 'USOPEN' ? 'editor-dinamico-usopen' : 'editor-dinamico';
    const editorElement = document.getElementById(editorContainerId);
    if (!editorElement) return;

    let h = "";
    window.datosLocales.sort((a, b) => a.id - b.id);
    
    const estructuraBase = window.ESTRUCTURA;

    estructuraBase.forEach(cat => {
        const platos = window.datosLocales.filter(p => p.id >= cat.id && p.id <= (cat.id + cat.rango));
        if (platos.length === 0) return;
        
        h += `<div class="categoria-tarjeta"><div class="categoria-titulo">${cat.name}</div>`;
        platos.forEach((p) => {
            let htmlImagenPC = p.imagen ? `<span class="tag-imagen">📷 ${p.imagen}</span>` : "";
            let htmlCarpetaPC = p.carpeta ? `<span class="tag-carpeta">${p.carpeta}</span>` : "";
            const nombreLimpio = desglosarNombre(p.es).nombre;
            
            h += `<div class="plato-item">
                <div class="plato-orden-btns">
                    <button class="btn-orden" onclick="moverPlato(${p.id}, 'subir')">▲</button>
                    <button class="btn-orden" onclick="moverPlato(${p.id}, 'bajar')">▼</button>
                </div>
                <div class="plato-info">
                    <span class="plato-nombre">${nombreLimpio}</span>
                    <div style="font-size: 0.7rem; color: #7f8c8d; margin-top: 4px; display: flex; gap: 10px; align-items: center;">${htmlCarpetaPC} ${htmlImagenPC}</div>
                </div>
                <div class="plato-meta-footer">
                    <div><small>ID ${p.id} | ${p.precio}€</small></div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button class="btn-config" onclick="abrirEditor(${p.id})">⚙️</button>
                        <label class="switch-container">
                            <input type="checkbox" ${p.activa ? 'checked' : ''} onchange="toggleActivo(${p.id}, this.checked)">
                            <span class="slider-switch"></span>
                        </label>
                    </div>
                </div>
            </div>`;
        });
        h += `</div>`;
    });
    editorElement.innerHTML = h;
}

function renderizarSugerencias() {
    if (typeof window.renderSugerenciasLogic === 'function') {
        window.renderSugerenciasLogic();
    }
}

function moverPlato(id, direccion) {
    const idx = window.datosLocales.findIndex(x => x.id === id);
    if (direccion === 'subir' && idx > 0) {
        const temp = window.datosLocales[idx].id;
        window.datosLocales[idx].id = window.datosLocales[idx-1].id;
        window.datosLocales[idx-1].id = temp;
    } else if (direccion === 'bajar' && idx < window.datosLocales.length - 1) {
        const temp = window.datosLocales[idx].id;
        window.datosLocales[idx].id = window.datosLocales[idx+1].id;
        window.datosLocales[idx+1].id = temp;
    }
    renderizar();
}

// --- EDITOR DE FORMULARIO MODAL ---
function abrirEditor(id, esNuevo = false) {
    let p = esNuevo ? datosTempNuevo : window.datosLocales.find(x => x.id === id);
    esNuevoPlato = esNuevo;
    platoEditandoId = id;
    
    const nombreLower = (p && p['es']) ? p['es'].toLowerCase() : "";
    const esVino = (id >= 13000) || (id === 12990) || (nombreLower.includes('vino') && !nombreLower.includes('copa'));
    
    const esCroqueta = (id >= 12100 && id <= 12299);
    const esCroquetaVeg = (id >= 12200 && id <= 12299);
    
    const labelUvas = document.getElementById('label-uvas');
    if (labelUvas) {
        labelUvas.innerText = esVino ? "Nombres y Detalles del Plato / Vino (Uvas)" : "Nombres y Detalles del Plato";
    }
    
    const dataEs = desglosarNombre(p['es'] || "");
    const inputEditEs = document.getElementById('edit-es');
    if (inputEditEs) {
        inputEditEs.value = esVino ? formatWineName(dataEs.nombre) : dataEs.nombre;
    }
    
    const inputEsUvas = document.getElementById('edit-es-uvas');
    if (inputEsUvas) {
        inputEsUvas.value = dataEs.uvas;
        inputEsUvas.style.display = esVino ? "block" : "none";
    }

    const dataEn = desglosarNombre(p['en'] || "");
    const inputEditEn = document.getElementById('edit-en');
    if (inputEditEn) {
        inputEditEn.value = esVino ? formatWineName(dataEn.nombre) : dataEn.nombre;
    }
    
    const inputEnUvas = document.getElementById('edit-en-uvas');
    if (inputEnUvas) {
        inputEnUvas.value = dataEn.uvas;
        inputEnUvas.style.display = esVino ? "block" : "none";
    }
    
    let htmlRestoLangs = `<div class="langs-fluid-container">`;
    window.IDIOMAS_ORDEN.forEach(l => {
        if (l === 'es' || l === 'en') return;
        const dataLang = desglosarNombre(p[l] || "");
        const labelIdioma = window.IDIOMAS_CONFIG[l.toUpperCase()] || l.toUpperCase();
        
        htmlRestoLangs += `
            <div class="input-row-lang">
                <div class="lang-tag">${l.toUpperCase()}</div>
                <div style="flex:1">
                    <input id="edit-${l}" class="input-estandar input-nombre-corto" placeholder="Nombre en ${labelIdioma}" value="${esVino ? formatWineName(dataLang.nombre) : dataLang.nombre}">
                    <input id="edit-${l}-uvas" class="input-estandar input-uvas" placeholder="Detalles / Grapes (${labelIdioma})" value="${dataLang.uvas}" style="display: ${esVino ? 'block' : 'none'};">
                </div>
            </div>`;
    });
    htmlRestoLangs += `</div>`;
    
    const contenedorResto = document.getElementById('contenedor-resto-idiomas');
    if (contenedorResto) contenedorResto.innerHTML = htmlRestoLangs;
    
    const inputPrecio = document.getElementById('edit-precio');
    if (inputPrecio) inputPrecio.value = p.precio;
    
    const inputImagen = document.getElementById('edit-imagen');
    if (inputImagen) inputImagen.value = p.imagen;
    
    const actuales = (p.alergenos || "").split(',').map(s => s.trim().toUpperCase());
    let alergenosHtml = "";
    if (esVino) {
        const sel = actuales.includes("🧪 SULFITOS") || actuales.includes("SULFITOS") ? 'selected' : '';
        alergenosHtml = `<div class="alergeno-btn ${sel}" onclick="this.classList.toggle('selected')">🧪 SULFITOS</div>`;
    } else {
        alergenosHtml = ALERGENOS_LISTA.map(a => {
            const sel = actuales.some(act => act.includes(a.split(" ").pop())) ? 'selected' : '';
            return `<div class="alergeno-btn ${sel}" onclick="this.classList.toggle('selected')">${a}</div>`;
        }).join('');
    }
    
    const gridAlergenos = document.getElementById('alergenos-grid');
    if (gridAlergenos) gridAlergenos.innerHTML = alergenosHtml;
    
    let croquetasHtml = "";
    if (esCroqueta) {
        croquetasHtml += `<div class="input-group"><label class="label-seccion">Sabores de Croquetas</label><div class="croquetas-grid">`;
        
        if (!esCroquetaVeg) {
            croquetasHtml += `<div class="croqueta-category"><div class="croqueta-cat-title carne">Carne</div><div class="croqueta-cat-btns">`;
            CROQUETAS_CONFIG.carne.forEach(c => {
                croquetasHtml += `<div class="croqueta-btn carne" onclick="this.classList.toggle('selected'); actualizarNombreCroquetas()">${c}</div>`;
            });
            croquetasHtml += `</div></div>`;

            croquetasHtml += `<div class="croqueta-category"><div class="croqueta-cat-title pescado">Pescado</div><div class="croqueta-cat-btns">`;
            CROQUETAS_CONFIG.pescado.forEach(c => {
                croquetasHtml += `<div class="croqueta-btn pescado" onclick="this.classList.toggle('selected'); actualizarNombreCroquetas()">${c}</div>`;
            });
            croquetasHtml += `</div></div>`;
        }

        croquetasHtml += `<div class="croqueta-category"><div class="croqueta-cat-title vegetariana">Vegetarianas</div><div class="croqueta-cat-btns">`;
        CROQUETAS_CONFIG.vegetariana.forEach(c => {
            croquetasHtml += `<div class="croqueta-btn vegetariana" onclick="this.classList.toggle('selected'); actualizarNombreCroquetas()">${c}</div>`;
        });
        croquetasHtml += `</div></div>`;

        croquetasHtml += `</div></div>`;
    }
    
    const contenedorCroquetas = document.getElementById('contenedor-croquetas');
    if (contenedorCroquetas) contenedorCroquetas.innerHTML = croquetasHtml;

    if (esCroqueta && p['es']) {
        const todosSabores = [...CROQUETAS_CONFIG.carne, ...CROQUETAS_CONFIG.pescado, ...CROQUETAS_CONFIG.vegetariana];
        todosSabores.forEach(sabor => {
            if (p['es'].includes(sabor)) {
                const btns = document.querySelectorAll('.croqueta-btn');
                btns.forEach(btn => {
                    if (btn.innerText.trim() === sabor) btn.classList.add('selected');
                });
            }
        });
    }
    
    comprobarRequisitosTraduccion();
    const modalEditor = document.getElementById('modal-editor');
    if (modalEditor) modalEditor.style.display = 'block';
}

function actualizarNombreCroquetas() {
    const esCroquetaVeg = (platoEditandoId >= 12200 && platoEditandoId <= 12299);
    const seleccionadas = Array.from(document.querySelectorAll('.croqueta-btn.selected')).map(el => el.innerText.trim());
    
    if (seleccionadas.length === 0) {
        const inputEditEs = document.getElementById('edit-es');
        if (inputEditEs) inputEditEs.value = "";
        comprobarRequisitosTraduccion();
        return;
    }

    const soloVegetarianas = seleccionadas.every(s => CROQUETAS_CONFIG.vegetariana.includes(s));
    const cantidad = (soloVegetarianas || esCroquetaVeg) ? 6 : 2;

    const textoCroquetas = seleccionadas.map(s => `${cantidad} ${s}`).join(' - ');
    
    let titulo = esCroquetaVeg ? "Croquetas Vegetarianas:" : "Surtido de Croquetas:";
    if (!esCroquetaVeg && soloVegetarianas) titulo = "Croquetas Vegetarianas:";

    const inputEditEs = document.getElementById('edit-es');
    if (inputEditEs) inputEditEs.value = `${titulo} ${textoCroquetas}`;
    comprobarRequisitosTraduccion();
}

function comprobarRequisitosTraduccion() {
    const editEs = document.getElementById('edit-es');
    const editEn = document.getElementById('edit-en');
    const btnAuto = document.getElementById('btn-autotraducir');
    
    if (editEs && editEn && btnAuto) {
        const esValido = editEs.value.trim() !== "" && editEn.value.trim() !== "";
        btnAuto.disabled = !esValido;
    }
}

// --- INTEGRACIÓN INTELIGENTE CON GEMINI AI ---
async function generarTraduccionEN() {
    const editEs = document.getElementById('edit-es');
    const nombreEs = editEs ? editEs.value.trim() : "";
    
    const nombreLower = nombreEs.toLowerCase();
    const esVino = (platoEditandoId >= 13000) || (platoEditandoId === 12990) || (nombreLower.includes('vino') && !nombreLower.includes('copa'));
    
    const editEsUvas = document.getElementById('edit-es-uvas');
    const uvasEs = (esVino && editEsUvas) ? editEsUvas.value.trim() : "";
    
    if (!nombreEs) {
        alert("❌ Debes introducir primero el nombre en Español.");
        return;
    }

    if (typeof getKeys !== 'function' || getKeys().length === 0) {
        alert("❌ No hay API Keys de Gemini configuradas.");
        return;
    }
    const keys = getKeys();

    const btn = document.getElementById('btn-generar-en');
    const originalText = btn ? btn.innerText : "Generar";
    if (btn) {
        btn.innerText = "🇬🇧 Generando opciones...";
        btn.disabled = true;
    }

    const textoCompletoEs = (nombreEs + (uvasEs ? ' // ' + uvasEs : '')).replace(/"/g, "'");
    const URL_MODELO = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
    const instruccion = `Actúa como un translator profesional de menús de restaurantes. Te paso un elemento en español: "${textoCompletoEs}".
    ${esVino ? 'Es un vino. El separador "//" distingue el nombre del vino de la variedad de uva o detalles. Debes traducir ambas partes y mantener el separador "//" en el resultado. El nombre del vino debe ir en MAYÚSCULAS, pero el contenido entre paréntesis (como la D.O.) debe mantener su formato original (ej: EL COTO (D.O. Rioja)).' : ''}
    Necesito que me des EXACTAMENTE 3 opciones de traducción al inglés con diferentes enfoques para un menú:
    1. Traducción directa/literal.
    2. Traducción gastronómica/descriptiva (más elegante).
    3. Traducción corta/concisa (estilo menú rápido).
    
    Responde EXCLUSIVAMENTE con un objeto JSON válido. No incluyas texto fuera del JSON. Las comillas dobles dentro de las traducciones deben estar escapadas con barra invertida (\").
    Estructura exacta: {"directa": "...", "gastronomica": "...", "corta": "..."}`;

    let exito = false;
    let intentos = 0;
    let opciones = {};
    let ultimoError = "";

    while (!exito && intentos < keys.length) {
        try {
            const apiKey = keys[intentos];
            const response = await fetch(`${URL_MODELO}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: instruccion }] }] })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                ultimoError = data.error?.message || "Error HTTP " + response.status;
                intentos++;
                continue;
            }

            const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (txt) {
                opciones = extraerJSON(txt);
                if (opciones.directa || opciones.gastronomica || opciones.corta) {
                    exito = true;
                } else {
                    throw new Error("El JSON no contiene las claves esperadas.");
                }
            } else {
                throw new Error("Respuesta vacía de Gemini.");
            }
        } catch (err) {
            ultimoError = err.message;
            intentos++;
        }
    }

    if (exito) {
        abrirModalTraduccionEN(opciones);
    } else {
        alert("❌ Error al generar las opciones en Inglés.\nDetalles: " + ultimoError);
    }

    if (btn) {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function abrirModalTraduccionEN(opciones) {
    const container = document.getElementById('opciones-en-container');
    const textarea = document.getElementById('editar-opcion-en');
    if (textarea) textarea.value = "";
    opcionesENActuales = [];

    let html = "";
    const mapaOpciones = {
        directa: "Directa / Literal",
        gastronomica: "Gastronómica / Elegante",
        corta: "Corta / Menú"
    };

    let index = 0;
    for (const [key, value] of Object.entries(opciones)) {
        if (value) {
            const label = mapaOpciones[key] || key;
            opcionesENActuales.push(value);
            html += `<div class="opcion-en-btn" onclick="seleccionarOpcionEN(this, ${index})">
                <span class="opcion-en-label">${label}</span>
                ${value}
            </div>`;
            index++;
        }
    }

    if (container) container.innerHTML = html;
    const modalTraduccion = document.getElementById('modal-traduccion-en');
    if (modalTraduccion) modalTraduccion.style.display = 'flex';
}

function seleccionarOpcionEN(elemento, index) {
    document.querySelectorAll('.opcion-en-btn').forEach(el => el.classList.remove('selected'));
    elemento.classList.add('selected');
    const textarea = document.getElementById('editar-opcion-en');
    if (textarea) textarea.value = opcionesENActuales[index];
}

function confirmarTraduccionEN() {
    const textarea = document.getElementById('editar-opcion-en');
    const textoFinal = textarea ? textarea.value.trim() : "";
    if (!textoFinal) {
        alert("❌ Selecciona una opción o escribe la traducción antes de confirmar.");
        return;
    }
    
    let p = window.datosLocales.find(x => x.id === platoEditandoId) || {};
    const nombreLower = (p['es'] || "").toLowerCase();
    const esVino = (platoEditandoId >= 13000) || (platoEditandoId === 12990) || (nombreLower.includes('vino') && !nombreLower.includes('copa'));

    const desglosado = desglosarNombre(textoFinal);
    const editEn = document.getElementById('edit-en');
    if (editEn) editEn.value = esVino ? formatWineName(desglosado.nombre) : desglosado.nombre;
    
    const inputEnUvas = document.getElementById('edit-en-uvas');
    if (inputEnUvas && inputEnUvas.style.display !== "none") {
        inputEnUvas.value = desglosado.uvas;
    }
    
    cerrarModalTraduccionEN();
    comprobarRequisitosTraduccion();
}

function cerrarModalTraduccionEN() {
    const modalTraduccion = document.getElementById('modal-traduccion-en');
    if (modalTraduccion) modalTraduccion.style.display = 'none';
}

async function ejecutarTraduccionAutomatica() {
    const btn = document.getElementById('btn-autotraducir');
    const originalText = btn ? btn.innerText : "";
    if (btn) {
        btn.innerText = "✨ Traduciendo con Gemini 2.5...";
        btn.disabled = true;
    }
    
    const editEs = document.getElementById('edit-es');
    const editEn = document.getElementById('edit-en');
    const nombreEs = editEs ? editEs.value.trim() : "";
    const nombreEn = editEn ? editEn.value.trim() : "";
    
    const nombreLower = nombreEs.toLowerCase();
    const esVino = (platoEditandoId >= 13000) || (platoEditandoId === 12990) || (nombreLower.includes('vino') && !nombreLower.includes('copa'));
    
    const editEsUvas = document.getElementById('edit-es-uvas');
    const editEnUvas = document.getElementById('edit-en-uvas');
    const uvasEs = (esVino && editEsUvas) ? editEsUvas.value.trim() : "";
    const uvasEn = (esVino && editEnUvas) ? editEnUvas.value.trim() : "";
    
    if (typeof getKeys !== 'function' || getKeys().length === 0) {
        alert("❌ No hay API Keys de Gemini configuradas.");
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
        return;
    }
    const keys = getKeys();
    
    const textoCompletoEs = (nombreEs + (uvasEs ? ' // ' + uvasEs : '')).replace(/"/g, "'");
    const textoCompletoEn = (nombreEn + (uvasEn ? ' // ' + uvasEn : '')).replace(/"/g, "'");
    
    const idiomasObjetivo = window.IDIOMAS_ORDEN.filter(l => l !== 'es' && l !== 'en');
    const URL_MODELO = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
    
    const instruccion = `Actúa como un traductor experto de menús de restaurantes. Traduce el siguiente elemento basándote en su texto en Español: "${textoCompletoEs}" ${textoCompletoEn ? `y su texto en Inglés (como referencia): "${textoCompletoEn}"` : ''}.
    ${esVino ? 'Es un vino. El separador "//" distingue el nombre del vino de la variedad de uva o detalles. Debes traducir ambas partes y mantener el separador "//" en el resultado para todos los idiomas. El nombre del vino debe ir en MAYÚSCULAS, pero el contenido entre paréntesis (como la D.O.) debe mantener su formato original en todos los idiomas (ej: EL COTO (D.O. Rioja)).' : ''}
    Traduce a los siguientes idiomas (usa los códigos ISO proporcionados): ${idiomasObjetivo.join(', ')}.
    Responde EXCLUSIVAMENTE con un objeto JSON válido.`;
    
    let exito = false;
    let intentos = 0;
    let ultimoError = "";
    
    while (!exito && intentos < keys.length) {
        try {
            const apiKey = keys[intentos];
            const response = await fetch(`${URL_MODELO}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: instruccion }] }] })
            });
            
            const data = await response.json();
            
            if (!response.ok || data.error) {
                ultimoError = data.error?.message || "Error HTTP " + response.status;
                intentos++;
                continue; 
            }
            
            const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (txt) {
                const traducciones = extraerJSON(txt);
                
                idiomasObjetivo.forEach(l => {
                    if (traducciones[l]) {
                        const desglosado = desglosarNombre(traducciones[l]);
                        const finalName = esVino ? formatWineName(desglosado.nombre) : desglosado.nombre;
                        const inputField = document.getElementById(`edit-${l}`);
                        if (inputField) inputField.value = finalName;
                        
                        const inputUva = document.getElementById(`edit-${l}-uvas`);
                        if (inputUva && inputUva.style.display !== "none") {
                            inputUva.value = desglosado.uvas;
                        }
                    }
                });
                exito = true;
            }
        } catch (err) {
            ultimoError = err.message;
            intentos++;
        }
    }
    
    if (!exito) alert("❌ Error al traducir con Gemini: " + ultimoError);
    if (btn) { btn.innerText = originalText; btn.disabled = false; }
}

// --- GUARDAR EN ARRAY LOCAL ---
function aplicarCambiosPlato() {
    let p = esNuevoPlato ? datosTempNuevo : window.datosLocales.find(x => x.id === platoEditandoId);
    if (esNuevoPlato) window.datosLocales.push(p);
    
    const inputEditEs = document.getElementById('edit-es');
    const nombreLower = inputEditEs ? inputEditEs.value.toLowerCase() : "";
    const esVino = (platoEditandoId >= 13000) || (platoEditandoId === 12990) || (nombreLower.includes('vino') && !nombreLower.includes('copa'));

    window.IDIOMAS_ORDEN.forEach(l => {
        const inputField = document.getElementById(`edit-${l}`);
        let nom = inputField ? superLimpiar(inputField.value) : "";
        
        const inputUva = document.getElementById(`edit-${l}-uvas`);
        const uvas = (inputUva && inputUva.style.display !== "none") ? superLimpiar(inputUva.value) : "";
        
        if (esVino) nom = formatWineName(nom);
        p[l] = uvas ? `${nom} // ${uvas}` : nom;
    });
    
    const inputPrecio = document.getElementById('edit-precio');
    let preVal = inputPrecio ? inputPrecio.value || "0.00" : "0.00";
    p.precio = parseFloat(preVal).toFixed(2);
    if(isNaN(p.precio)) p.precio = "0.00";
    
    const inputImagen = document.getElementById('edit-imagen');
    p.imagen = inputImagen ? superLimpiar(inputImagen.value) : "";
    
    p.alergenos = Array.from(document.querySelectorAll('.alergeno-btn.selected')).map(el => {
        let rawText = el.innerText.trim();
        let spaceIdx = rawText.indexOf(' ');
        return spaceIdx !== -1 ? rawText.substring(spaceIdx + 1).trim() : rawText;
    }).join(', ');
    
    cerrarModal('modal-editor');
    renderizar();
}

// --- CREACIÓN DE NUEVOS PLATOS ---
function generarMenuAgrupado() {
    let h = "";
    const container = document.getElementById('lista-agrupada');
    if (!container) return;

    window.ESTRUCTURA.forEach(cat => {
        h += `<div style="margin-bottom:10px;"><div style="background:#eee;padding:5px;font-size:0.7rem;font-weight:bold;text-transform:uppercase;">${cat.name}</div>`;
        if (cat.sub) {
            cat.sub.forEach(s => {
                h += `<button onclick="prepararNuevoPlato(${s.id}, '${s.folder}')" style="width:100%;text-align:left;padding:10px;background:white;border:1px solid #ddd;font-family:'Montserrat';cursor:pointer;">+ ${s.name}</button>`;
            });
        } else {
            h += `<button onclick="prepararNuevoPlato(${cat.id}, '${cat.folder || ''}')" style="width:100%;text-align:left;padding:10px;background:white;border:1px solid #ddd;font-family:'Montserrat';cursor:pointer;">+ ${cat.name}</button>`;
        }
        h += `</div>`;
    });
    container.innerHTML = h;
}

function prepararNuevoPlato(baseId, folder) {
    let maxPermitido = baseId + 99;
    window.ESTRUCTURA.forEach(cat => {
        if (cat.sub) {
            const sub = cat.sub.find(s => s.id === baseId);
            if (sub && sub.max) maxPermitido = sub.max;
        }
    });

    const similares = window.datosLocales.filter(p => p.id >= baseId && p.id <= maxPermitido);
    const nuevoId = similares.length > 0 ? Math.max(...similares.map(p => p.id)) + 1 : baseId;
    
    if (nuevoId > maxPermitido) {
        alert("Límite de IDs alcanzado.");
        return;
    }

    datosTempNuevo = { id: nuevoId, precio: "0.00", activa: true, carpeta: folder, imagen: "", alergenos: "" };
    
    if (baseId >= 12200 && baseId <= 12299) datosTempNuevo.imagen = "croquetasvegetarianas01.webp";
    else if (baseId >= 12100 && baseId <= 12199) datosTempNuevo.imagen = "croquetas01.webp";
    
    window.IDIOMAS_ORDEN.forEach(l => { datosTempNuevo[l] = ""; });
    datosTempNuevo['es'] = "NUEVO ELEMENTO";

    cerrarModal('modal-selector');
    abrirEditor(nuevoId, true);
}

// --- SUBIR DATOS AL EXCEL REMOTO (POST) ---
async function enviarAlExcel() {
    const btn = document.querySelector('.btn-guardar-main');
    const textoOriginal = btn ? btn.innerText : "";
    if (btn) { btn.innerText = "⏳ SUBIENDO..."; btn.disabled = true; }
    
    window.datosLocales.sort((a, b) => a.id - b.id);
    
    // Mapeo saliente idéntico al esquema esperado por doPost() en tu Código.gs
    const payload = window.datosLocales.map(p => {
        let obj = { 
            id: p.id, 
            precio: p.precio, 
            estado: p.activa ? 'si' : 'no', 
            carpeta: p.carpeta, 
            imagen: p.imagen, 
            alergenos: p.alergenos 
        };
        // Inyecta dinámicamente propiedades en minúsculas (nombre_es, nombre_en, etc.) como lee el Apps Script
        window.IDIOMAS_ORDEN.forEach(l => { 
            obj[`nombre_${l}`] = p[l] || ""; 
        });
        return obj;
    });
    
    try {
        if (typeof window.getWebAppUrl !== 'function') {
            alert("Error: getWebAppUrl() no está disponible.");
            if (btn) { btn.disabled = false; btn.innerText = textoOriginal; }
            return;
        }
        const urlDestino = window.getWebAppUrl();
        await fetch(urlDestino, { 
            method: 'POST', 
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        alert("✅ Cambios enviados con éxito.");
        location.reload();
    } catch (e) { 
        alert("Error de conexión al enviar datos."); 
        if (btn) { btn.disabled = false; btn.innerText = textoOriginal; }
    }
}

// --- INTERFACES BÁSICAS ---
function toggleActivo(id, v) { 
    const p = window.datosLocales.find(x => x.id === id);
    if(p) p.activa = v; 
}

function abrirSelector() { 
    const modalSelector = document.getElementById('modal-selector');
    if (modalSelector) modalSelector.style.display = 'block'; 
}

function cerrarModal(id) { 
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none'; 
}

// Inicialización controlada por el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargar();
    const editPrecioInput = document.getElementById('edit-precio');
    if (editPrecioInput) {
        editPrecioInput.addEventListener('input', function() {
            if (this.value.includes('.')) {
                let parts = this.value.split('.');
                if (parts[1] && parts[1].length > 2) {
                    parts[1] = parts[1].substring(0, 2);
                    this.value = parts.join('.');
                }
            }
        });
    }
});
