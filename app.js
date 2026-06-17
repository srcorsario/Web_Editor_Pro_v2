// --- app.js ---
// NUEVO: Registro de versión del archivo
window.APP_VERSIONS = window.APP_VERSIONS || {};
window.APP_VERSIONS.app = '1.0.34'; // Versión incrementada por soporte multi-torneo

// NUEVO: Variable global para controlar el torneo activo
window.currentMode = 'RG'; // Por defecto RG

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 
let opcionesENActuales = [];

// Lista de Alérgenos con Emojis Restaurados
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
            box_count = braceCount--;
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

async function cargar() {
    try {
        if (typeof UI !== 'undefined' && typeof UI.log === 'function') {
            UI.log('[Editor] Conectando con Google Sheets remoto...');
        }
        
        // MODIFICADO: Usar getCsvUrl() dinámico
        const resp = await fetch(getCsvUrl() + '&t=' + Date.now());
        const text = await resp.text();
        const filas = text.split(/\r?\n/).filter(f => f.trim() !== "");
        datosLocales = [];
        
        filas.forEach((f, i) => {
            if (i === 0) return;
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const id = parseInt(c[0]);
            
            if (!isNaN(id)) {
                let item = {
                    id: id,
                    precio: c[1] || "0.00", 
                    activa: (c[2] || "").trim().toUpperCase() === "SI",
                    carpeta: c[4] || "",
                    imagen: c[5] || "",
                    alergenos: superLimpiar(c[6])
                };
                
                // MODIFICADO: Bucle dinámico basado en IDIOMAS_CSV_INDICES para evitar mapeos manuales
                IDIOMAS_ORDEN.forEach(lang => {
                    const index = IDIOMAS_CSV_INDICES[lang];
                    if (index !== undefined && c[index] !== undefined) {
                        item[lang] = superLimpiar(c[index]);
                    }
                });
                
                datosLocales.push(item);
            }
        });
        
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) {
            statusCarga.innerText = `✅ Datos Sincronizados (${window.currentMode}) (${IDIOMAS_ORDEN.length} Idiomas)`;
            statusCarga.className = "status-ok";
        }
        renderizar();
        generarMenuAgrupado();
    } catch (e) { 
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) statusCarga.innerText = "❌ Error al cargar base multidireccional"; 
    }
}

function renderizar() {
    // MODIFICADO: Seleccionar contenedor correcto según modo
    const editorContainerId = window.currentMode === 'USOPEN' ? 'editor-dinamico-usopen' : 'editor-dinamico';
    const editorElement = document.getElementById(editorContainerId);
    if (!editorElement) return;

    let h = "";
    datosLocales.sort((a, b) => a.id - b.id);
    
    ESTRUCTURA.forEach(cat => {
        const platos = datosLocales.filter(p => p.id >= cat.id && p.id <= (cat.id + cat.rango));
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

// MODIFICADO: Función para renderizar la pestaña de Sugerencias (Lógica compartida con sugerencias-print.js para UI simple si fuera necesario)
// Nota: La renderización pesada está en sugerencias-print.js, esta es backup/fallback.
function renderizarSugerencias() {
    // Esta función es principalmente invocada por el script sugerencias-print.js,
    // pero mantenemos la definición aquí por seguridad si se llama globalmente.
    if (typeof window.renderSugerenciasLogic === 'function') {
        window.renderSugerenciasLogic();
    }
}

function moverPlato(id, direccion) {
    const idx = datosLocales.findIndex(x => x.id === id);
    if (direccion === 'subir' && idx > 0) {
        const temp = datosLocales[idx].id;
        datosLocales[idx].id = datosLocales[idx-1].id;
        datosLocales[idx-1].id = temp;
    } else if (direccion === 'bajar' && idx < datosLocales.length - 1) {
        const temp = datosLocales[idx].id;
        datosLocales[idx].id = datosLocales[idx+1].id;
        datosLocales[idx+1].id = temp;
    }
    renderizar();
}

function abrirEditor(id, esNuevo = false) {
    let p = esNuevo ? datosTempNuevo : datosLocales.find(x => x.id === id);
    esNuevoPlato = esNuevo;
    platoEditandoId = id;
    const esVino = (id >= 13000);
    const esCroqueta = (id >= 12100 && id <= 12299);
    const esCroquetaVeg = (id >= 12200 && id <= 12299);
    
    document.getElementById('label-uvas').innerText = esVino ? "Nombres y Detalles del Plato / Vino (Uvas)" : "Nombres y Detalles del Plato";
    
    const dataEs = desglosarNombre(p['es'] || "");
    document.getElementById('edit-es').value = esVino ? formatWineName(dataEs.nombre) : dataEs.nombre;
    const inputEsUvas = document.getElementById('edit-es-uvas');
    inputEsUvas.value = dataEs.uvas;
    inputEsUvas.style.display = esVino ? "block" : "none";

    const dataEn = desglosarNombre(p['en'] || "");
    document.getElementById('edit-en').value = esVino ? formatWineName(dataEn.nombre) : dataEn.nombre;
    const inputEnUvas = document.getElementById('edit-en-uvas');
    inputEnUvas.value = dataEn.uvas;
    inputEnUvas.style.display = esVino ? "block" : "none";
    
    let htmlRestoLangs = `<div class="langs-fluid-container">`;
    IDIOMAS_ORDEN.forEach(l => {
        if (l === 'es' || l === 'en') return;
        const dataLang = desglosarNombre(p[l] || "");
        const labelIdioma = IDIOMAS_CONFIG[l.toUpperCase()] || l.toUpperCase();
        
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
    document.getElementById('contenedor-resto-idiomas').innerHTML = htmlRestoLangs;
    
    document.getElementById('edit-precio').value = p.precio;
    document.getElementById('edit-imagen').value = p.imagen;
    
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
    document.getElementById('alergenos-grid').innerHTML = alergenosHtml;
    
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
    document.getElementById('contenedor-croquetas').innerHTML = croquetasHtml;

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
    document.getElementById('modal-editor').style.display = 'block';
}

function actualizarNombreCroquetas() {
    const esCroquetaVeg = (platoEditandoId >= 12200 && platoEditandoId <= 12299);
    const seleccionadas = Array.from(document.querySelectorAll('.croqueta-btn.selected')).map(el => el.innerText.trim());
    
    if (seleccionadas.length === 0) {
        document.getElementById('edit-es').value = "";
        comprobarRequisitosTraduccion();
        return;
    }

    const soloVegetarianas = seleccionadas.every(s => CROQUETAS_CONFIG.vegetariana.includes(s));
    const cantidad = (soloVegetarianas || esCroquetaVeg) ? 6 : 2;

    const textoCroquetas = seleccionadas.map(s => `${cantidad} ${s}`).join(' - ');
    
    let titulo = esCroquetaVeg ? "Croquetas Vegetarianas:" : "Surtido de Croquetas:";
    if (!esCroquetaVeg && soloVegetarianas) titulo = "Croquetas Vegetarianas:";

    document.getElementById('edit-es').value = `${titulo} ${textoCroquetas}`;
    comprobarRequisitosTraduccion();
}

function comprobarRequisitosTraduccion() {
    const esValido = document.getElementById('edit-es').value.trim() !== "" && document.getElementById('edit-en').value.trim() !== "";
    document.getElementById('btn-autotraducir').disabled = !esValido;
}

async function generarTraduccionEN() {
    const nombreEs = document.getElementById('edit-es').value.trim();
    const esVino = (platoEditandoId >= 13000);
    const uvasEs = esVino ? document.getElementById('edit-es-uvas').value.trim() : "";
    
    if (!nombreEs) {
        alert("❌ Debes introducir primero el nombre en Español.");
        return;
    }

    const keys = getKeys();
    if (keys.length === 0) {
        alert("❌ No hay API Keys de Gemini configuradas. Añade al menos una en el panel superior.");
        return;
    }

    const btn = document.getElementById('btn-generar-en');
    const originalText = btn.innerText;
    btn.innerText = "🇬🇧 Generando opciones...";
    btn.disabled = true;

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
                console.warn(`Error con Key ${intentos + 1}, rotando...`, ultimoError);
                if (data.error?.code === 429 || response.status === 429) {
                    await new Promise(r => setTimeout(r, 3000));
                }
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
            console.error(`Error procesando Key ${intentos + 1}:`, err);
            intentos++;
        }
    }

    if (exito) {
        abrirModalTraduccionEN(opciones);
    } else {
        alert("❌ Error al generar las opciones en Inglés.\nDetalles: " + ultimoError);
    }

    btn.innerText = originalText;
    btn.disabled = false;
}

function abrirModalTraduccionEN(opciones) {
    const container = document.getElementById('opciones-en-container');
    const textarea = document.getElementById('editar-opcion-en');
    textarea.value = "";
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

    container.innerHTML = html;
    document.getElementById('modal-traduccion-en').style.display = 'flex';
}

function seleccionarOpcionEN(elemento, index) {
    document.querySelectorAll('.opcion-en-btn').forEach(el => el.classList.remove('selected'));
    elemento.classList.add('selected');
    document.getElementById('editar-opcion-en').value = opcionesENActuales[index];
}

function confirmarTraduccionEN() {
    const textoFinal = document.getElementById('editar-opcion-en').value.trim();
    if (!textoFinal) {
        alert("❌ Selecciona una opción o escribe la traducción antes de confirmar.");
        return;
    }
    
    const desglosado = desglosarNombre(textoFinal);
    const esVino = (platoEditandoId >= 13000);
    document.getElementById('edit-en').value = esVino ? formatWineName(desglosado.nombre) : desglosado.nombre;
    
    const inputEnUvas = document.getElementById('edit-en-uvas');
    if (inputEnUvas && inputEnUvas.style.display !== "none") {
        inputEnUvas.value = desglosado.uvas;
    }
    
    cerrarModalTraduccionEN();
    comprobarRequisitosTraduccion();
}

function cerrarModalTraduccionEN() {
    document.getElementById('modal-traduccion-en').style.display = 'none';
}

async function ejecutarTraduccionAutomatica() {
    const btn = document.getElementById('btn-autotraducir');
    const originalText = btn.innerText;
    btn.innerText = "✨ Traduciendo con Gemini 2.5...";
    btn.disabled = true;
    
    const nombreEs = document.getElementById('edit-es').value.trim();
    const nombreEn = document.getElementById('edit-en').value.trim();
    const esVino = (platoEditandoId >= 13000);
    const uvasEs = esVino ? document.getElementById('edit-es-uvas').value.trim() : "";
    const uvasEn = esVino ? document.getElementById('edit-en-uvas').value.trim() : "";
    const keys = getKeys();
    
    if (keys.length === 0) {
        alert("❌ No hay API Keys de Gemini configuradas. Añade al menos una en el panel superior.");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }
    
    const textoCompletoEs = (nombreEs + (uvasEs ? ' // ' + uvasEs : '')).replace(/"/g, "'");
    const textoCompletoEn = (nombreEn + (uvasEn ? ' // ' + uvasEn : '')).replace(/"/g, "'");
    
    const idiomasObjetivo = IDIOMAS_ORDEN.filter(l => l !== 'es' && l !== 'en');
    const URL_MODELO = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
    
    const instruccion = `Actúa como un traductor experto de menús de restaurantes. Traduce el siguiente elemento basándote en su texto en Español: "${textoCompletoEs}" ${textoCompletoEn ? `y su texto en Inglés (como referencia): "${textoCompletoEn}"` : ''}.
    ${esVino ? 'Es un vino. El separador "//" distingue el nombre del vino de la variedad de uva o detalles. Debes traducir ambas partes y mantener el separador "//" en el resultado para todos los idiomas. El nombre del vino debe ir en MAYÚSCULAS, pero el contenido entre paréntesis (como la D.O.) debe mantener su formato original en todos los idiomas (ej: EL COTO (D.O. Rioja)).' : ''}
    
    Traduce a los siguientes idiomas (usa los códigos ISO proporcionados): ${idiomasObjetivo.join(', ')}.
    
    Responde EXCLUSIVAMENTE con un objeto JSON válido. No incluyas texto fuera del JSON. Las comillas dobles dentro de las traducciones deben estar escapadas con barra invertida (\").
    Usa los códigos ISO como claves.
    Ejemplo de formato de respuesta esperado: {"de": "Nombre // Uva", "fr": "Nombre // Uva"}`;
    
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
                console.warn(`Error con Key ${intentos + 1}, rotando...`, ultimoError);
                if (data.error?.code === 429 || response.status === 429) {
                    await new Promise(r => setTimeout(r, 3000));
                }
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
            } else {
                throw new Error("La respuesta de Gemini no contiene texto válido.");
            }
        } catch (err) {
            ultimoError = err.message;
            console.error(`Error procesando Key ${intentos + 1}:`, err);
            intentos++;
        }
    }
    
    if (!exito) {
        alert("❌ Error al traducir con Gemini.\nDetalles del error: " + ultimoError);
    }
    
    btn.innerText = originalText;
    btn.disabled = false;
}

function aplicarCambiosPlato() {
    let p = esNuevoPlato ? datosTempNuevo : datosLocales.find(x => x.id === platoEditandoId);
    if (esNuevoPlato) datosLocales.push(p);
    
    const esVino = (platoEditandoId >= 13000);

    IDIOMAS_ORDEN.forEach(l => {
        let nom = superLimpiar(document.getElementById(`edit-${l}`).value);
        const inputUva = document.getElementById(`edit-${l}-uvas`);
        const uvas = (inputUva && inputUva.style.display !== "none") ? superLimpiar(inputUva.value) : "";
        
        if (esVino) nom = formatWineName(nom);
        
        p[l] = uvas ? `${nom} // ${uvas}` : nom;
    });
    
    let preVal = document.getElementById('edit-precio').value || "0.00";
    p.precio = parseFloat(preVal).toFixed(2);
    if(isNaN(p.precio)) p.precio = "0.00";
    
    p.imagen = superLimpiar(document.getElementById('edit-imagen').value);
    p.alergenos = Array.from(document.querySelectorAll('.alergeno-btn.selected')).map(el => {
        let rawText = el.innerText.trim();
        let spaceIdx = rawText.indexOf(' ');
        return spaceIdx !== -1 ? rawText.substring(spaceIdx + 1).trim() : rawText;
    }).join(', ');
    
    cerrarModal('modal-editor');
    renderizar();
}

function generarMenuAgrupado() {
    // MODIFICADO: Usar modal-selector único, pero el botón "+" flotante solo aparece en pestañas de editor
    // La lógica interna detectará el ID y usará la estructura actual.
    let h = "";
    ESTRUCTURA.forEach(cat => {
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
    const container = document.getElementById('lista-agrupada');
    if (container) container.innerHTML = h;
}

function prepararNuevoPlato(baseId, folder) {
    let maxPermitido = baseId + 99;
    ESTRUCTURA.forEach(cat => {
        if (cat.sub) {
            const sub = cat.sub.find(s => s.id === baseId);
            if (sub && sub.max) maxPermitido = sub.max;
        }
    });

    const similares = datosLocales.filter(p => p.id >= baseId && p.id <= maxPermitido);
    const nuevoId = similares.length > 0 ? Math.max(...similares.map(p => p.id)) + 1 : baseId;
    
    if (nuevoId > maxPermitido) {
        alert("Límite de IDs alcanzado para esta subcategoría específica.");
        return;
    }

    datosTempNuevo = { 
        id: nuevoId, 
        precio: "0.00", 
        activa: true, 
        carpeta: folder, 
        imagen: "", 
        alergenos: "" 
    };
    
    if (baseId >= 12200 && baseId <= 12299) {
        datosTempNuevo.imagen = "croquetasvegetarianas01.webp";
    } else if (baseId >= 12100 && baseId <= 12199) {
        datosTempNuevo.imagen = "croquetas01.webp";
    }
    
    IDIOMAS_ORDEN.forEach(l => { datosTempNuevo[l] = ""; });
    datosTempNuevo['es'] = "NUEVO ELEMENTO";

    cerrarModal('modal-selector');
    abrirEditor(nuevoId, true);
}

async function enviarAlExcel() {
    const btn = document.querySelector('.btn-guardar-main');
    const textoOriginal = btn.innerText;
    btn.innerText = "⏳ SUBIENDO Y ORDENANDO COLUMNAS..."; 
    btn.disabled = true;
    
    if (typeof UI !== 'undefined' && typeof UI.log === 'function') {
        UI.log('[Editor] Compilando matriz y enviando cambios distribuidos a Google Sheets...');
    }
    
    datosLocales.sort((a, b) => a.id - b.id);
    
    const payload = datosLocales.map(p => {
        let obj = {
            id: p.id, 
            precio: p.precio, 
            estado: p.activa ? 'si' : 'no', 
            carpeta: p.carpeta, 
            imagen: p.imagen, 
            alergenos: p.alergenos
        };
        IDIOMAS_ORDEN.forEach(l => {
            obj[`nombre_${l}`] = p[l] || "";
        });
        return obj;
    });
    
    try {
        // MODIFICADO: Usar getWebAppUrl() dinámico
        const urlDestino = window.getWebAppUrl();
        
        console.log(`[Editor-Debug] Enviando a URL: ${urlDestino}`);
        console.log(`[Editor-Debug] Modo: ${window.currentMode}`);
        
        const response = await fetch(urlDestino, { 
            method: 'POST', 
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        });
        
        console.log(`[Editor-Debug] Fetch finalizado. Tipo de respuesta: ${response.type}, Status: ${response.status}`);
        
        if (response.type === 'opaque') {
            console.warn("[Editor-Debug] Modo 'no-cors' activo.");
        }
        
        alert("✅ Petición de guardado enviada. (Nota: En modo no-cors no podemos confirmar el éxito total, revisa el Excel).");
        location.reload();
    } catch (e) { 
        alert("Error al intentar impactar los datos en Google Sheets."); 
        console.error("❌ [Editor-Debug] Error de red: ", e);
        btn.disabled = false; 
        btn.innerText = textoOriginal; 
    }
}

function toggleActivo(id, v) { 
    const p = datosLocales.find(x => x.id === id);
    if(p) p.activa = v; 
}

function abrirSelector() { document.getElementById('modal-selector').style.display = 'block'; }
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }

// Inicialización automática al cargar la página
// Solo cargamos si no estamos en UsOpen inicialmente (o cargamos RG por defecto)
cargar();

// NUEVO: Restringir input de precio a estrictamente 2 decimales
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
