(function () {
    'use strict';

    const VERSION = "v2.3.0-RG-Compact"; // Versión actualizada
    const PATH_ALERGENOS = 'imagenes/alergenos/';

    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        @page { size: A4; margin: 0; }
        .sugerencias-panel { 
            background: #ffffff !important; padding: 20px 30px !important; width: 210mm !important; /* Reducido padding: 25px 35px -> 20px 30px */
            min-height: 297mm !important; margin: 0 auto !important; font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important; display: flex !important; flex-direction:column !important;
        }
        .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 15px !important; position: relative !important; }
        .sugerencias-brand-title-group { display: flex !important; flex-direction: column !important; gap: 2px !important; }
        .sugerencias-title-es { font-weight: 700 !important; font-size: 1.5rem !important; color: #e05a2b !important; text-transform: uppercase !important; margin:0 !important; } /* Reducido: 2rem -> 1.5rem */
        .sugerencias-title-en { font-weight: 300 !important; font-size: 1.1rem !important; color: #0d5c63 !important; text-transform: uppercase !important; margin:0 !important; } /* Reducido: 1.4rem -> 1.1rem */
        .sugerencias-version-tag { position: absolute !important; top: -15px !important; left: 0 !important; font-size: 0.6rem !important; color: #94a3b8 !important; font-family: monospace !important; }
        
        .sugerencias-logo-img { width: 150px !important; height: auto !important; object-fit: contain !important; } /* Reducido: 200px -> 150px */
        
        .sugerencias-body { flex: 1 1 auto !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }
        .sugerencias-seccion { flex: 1 1 auto !important; display: flex !important; flex-direction: column !important; margin-bottom: 15px !important; }
        .sugerencias-seccion-titulo { font-size: 0.9rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; margin-bottom: 10px !important; text-transform: uppercase !important; } /* Reducido ligeramente margen inferior */
        
        .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 8px !important; width: 100% !important; } /* Reducido: 12px -> 8px */
        .sugerencias-plato-nombres { flex: 0 1 auto !important; max-width: 93% !important; display: flex !important; flex-direction: column !important; }
        .sugerencias-nombre-es { font-size: 0.9rem !important; font-weight: 600 !important; color: #000000 !important; } /* Reducido: 0.95rem -> 0.9rem */
        .sugerencias-nombre-en { font-size: 0.75rem !important; color: #64748b !important; font-style: italic !important; margin-top: 1px !important; }
        
        .sugerencias-detalles-uvas { display: block !important; font-size: 0.75rem !important; font-weight: normal !important; color: #475569 !important; margin-top: 1px !important; }
        .sugerencias-detalles-uvas-en { display: block !important; font-size: 0.7rem !important; font-weight: normal !important; color: #64748b !important; font-style: italic !important; }

        .sugerencias-alergenos { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 4px !important; margin-top: 3px !important; align-items: center !important; }
        .sugerencias-alergeno-icon { display: inline-block !important; width: 18px !important; height: 18px !important; object-fit: contain !important; vertical-align: middle !important; } /* Reducido: 20px -> 18px */
        .sugerencias-puntos { flex: 1 !important; border-bottom: 1px dotted #94a3b8 !important; margin: 0 8px !important; height: 1px !important; }
        .sugerencias-precio { font-size: 0.9rem !important; font-weight: 700 !important; flex-shrink: 0 !important; } /* Reducido: 1rem -> 0.9rem */
        
        .sugerencias-footer { margin-top: auto !important; padding-top: 15px !important; display: flex !important; justify-content: space-between !important; align-items: flex-end !important; width: 100% !important; }
        .sugerencias-advertencia-alergenos { font-size: 0.65rem !important; color: #64748b !important; max-width: 65% !important; line-height: 1.3 !important; text-align: left !important; font-style: italic !important; margin-bottom: 5px !important; }
        .sugerencias-qr-container { display: flex !important; flex-direction: column !important; align-items: center !important; gap: 5px !important; margin-left: auto !important; }
        
        .sugerencias-qr-img { width: 100px !important; height: 100px !important; object-fit: contain !important; } /* Reducido: 130px -> 100px */
        
        .sugerencias-qr-toggle { font-size: 0.7rem !important; color: #64748b !important; cursor: pointer !important; display: flex !important; user-select: none !important; gap: 5px !important; }
        
        .sugerencias-qr-toggle input:checked + span { font-weight: bold; }
        .sugerencias-qr-img { transition: opacity 0.3s; }

        .btn-imprimir-a4 { display: block; width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; margin-bottom: 20px; text-align: center; }
        @media print { body { -webkit-print-color-adjust: exact !important; } .btn-imprimir-a4, .sugerencias-qr-toggle, .qr-selector-wrapper { display: none !important; } }
    `;
    document.head.appendChild(stylePrint);

    window.desglosarNombre = function(texto) { 
        if (!texto) return { nombre: "", uvas: "" };
        const partes = texto.split('//');
        return { 
            nombre: partes[0] ? partes[0].trim() : "", 
            uvas: partes[1] ? partes[1].trim() : "" 
        };
    };

    window.toggleQR = function(tipo, modo) {
        const img = document.getElementById(`img-qr-${modo}`);
        if (!img) return;

        if (modo === 'rg') {
            if (tipo === 'default') {
                img.src = 'qr-code-RG-MOD.png';
            } else if (tipo === 'mod') {
                img.src = 'qr-code.png';
            }
        } else if (modo === 'usopen') {
            if (tipo === 'default') {
                img.src = 'qr-usopen_oficial.png';
            } else if (tipo === 'mod') {
                img.src = 'qr-usopen_mod.png';
            }
        }
    };

    function renderCartaRG() {
        const contenedor = document.getElementById('sugerencias-contenido');
        if (!contenedor) return;

        let fuente = [];
        const backup = localStorage.getItem('csvData');
        
        if (backup) {
            try {
                fuente = JSON.parse(backup);
            } catch(e) {
                fuente = window.datosLocales || [];
            }
        } else {
            fuente = window.datosLocales || [];
        }

        if (!fuente || fuente.length === 0) {
            contenedor.innerHTML = `<div class="p-4 text-center text-slate-500 italic">Esperando origen de datos válido de la carta estándar (vuelve a la Pestaña 1 un segundo para activar la memoria)...</div>`;
            return;
        }

        const platos = fuente.filter(p => p && p.activa && parseInt(p.id, 10) >= 12000 && parseInt(p.id, 10) <= 12999);
        let entrantes = [], principales = [], postres = [], vinos = [];

        platos.forEach(p => {
            const id = parseInt(p.id, 10);
            const desgloseEs = window.desglosarNombre(p.es);
            const nombreEsBajo = (desgloseEs && desgloseEs.nombre) ? desgloseEs.nombre.toLowerCase() : "";
            
            if (id === 12990 || (nombreEsBajo.includes('vino') && !nombreEsBajo.includes('copa') && !nombreEsBajo.includes('vinagreta'))) {
                vinos.push(p);
            } else if (id >= 12100 && id <= 12399) {
                entrantes.push(p);
            } else if (id >= 12400 && id <= 12899) {
                principales.push(p);
            } else if (id >= 12900 && id <= 12999) {
                postres.push(p);
            } else {
                entrantes.push(p);
            }
        });

        let html = `
            <button onclick="window.imprimirSugerenciasRG()" class="btn-imprimir-a4">🖨️ Imprimir Sugerencias RG (A4)</button>
            <div class="sugerencias-header-layout">
                <span class="sugerencias-version-tag" style="display:none;">Módulo ${VERSION}</span>
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">SUGERENCIAS DEL CHEF</div>
                    <div class="sugerencias-title-en">CHEF'S SUGGESTIONS</div>
                </div>
                <img src="logo RG_REST.png" class="sugerencias-logo-img" onerror="this.src='https://z-cdn-media.chatglm.cn/files/fc4b4919-b148-470d-97a2-c740c58d1178.png?auth_key=1881113734-9f1ef8e42c5a4eae8f4f0f9055730ecf-0-f7b585f0f08f5f78de683fb163bec75d';">
            </div>
            <div class="sugerencias-body">
        `;

        const renderCat = (titulo, lista, className) => {
            if (lista.length === 0) return '';
            let h = `<div class="sugerencias-seccion ${className}"><div class="sugerencias-seccion-titulo">${titulo}</div>`;
            lista.forEach(p => {
                let iconsHtml = '';
                if (p.alergenos) {
                    iconsHtml = '<div class="sugerencias-alergenos">' + p.alergenos.split(',').map(a => `<img src="${PATH_ALERGENOS}${a.trim()}.webp" class="sugerencias-alergeno-icon" onerror="this.style.display='none'">`).join('') + '</div>';
                }
                
                const objEs = window.desglosarNombre(p.es);
                const objEn = window.desglosarNombre(p.en);
                const precioFormateado = p.precio ? parseFloat(p.precio).toFixed(2) + '€' : '0.00€';

                h += `
                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <span class="sugerencias-nombre-es">${objEs.nombre}</span>
                            ${objEs.uvas ? `<span class="sugerencias-detalles-uvas">${objEs.uvas}</span>` : ''}
                            
                            <span class="sugerencias-nombre-en">${objEn.nombre}</span>
                            ${objEn.uvas ? `<span class="sugerencias-detalles-uvas-en">${objEn.uvas}</span>` : ''}
                            
                            ${iconsHtml}
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">${precioFormateado}</div>
                    </div>
                `;
            });
            return h + '</div>';
        };

        html += renderCat("ENTRANTES / STARTERS", entrantes, "sugerencias-seccion-entrantes");
        html += renderCat("PRINCIPALES / MAIN COURSES", principales, "sugerencias-seccion-principales");
        html += renderCat("POSTRES / DESSERTS", postres, "sugerencias-seccion-postres");
        html += renderCat("BODEGA / WINE CELLAR", vinos, "sugerencias-seccion-vinos");

        html += `
            </div>
            <div class="sugerencias-footer">
                <div class="sugerencias-advertencia-alergenos">
                    Si usted tiene algún tipo de alergia alimentaria, por favor comuníquelo a nuestro personal.<br>
                    If you have any food allergies, please inform our staff.
                </div>
                <div class="sugerencias-qr-container">
                    <div class="qr-selector-wrapper" style="font-size: 0.75rem; color: #64748b; text-align: center; margin-bottom: 5px; user-select:none;">
                        Tipo de QR:
                        <label style="cursor: pointer; margin-right: 10px; color: #64748b; font-weight: normal;">
                            <input type="radio" name="qr-mode-rg-footer" value="default" onchange="window.toggleQR('default', 'rg')"> Oficial
                        </label>
                        <label style="cursor: pointer; color: #0d5c63; font-weight: bold;">
                            <input type="radio" name="qr-mode-rg-footer" value="mod" checked onchange="window.toggleQR('mod', 'rg')"> Alternativo
                        </label>
                    </div>
                    <img src="qr-code.png" class="sugerencias-qr-img" id="img-qr-rg">
                </div>
            </div>
        `;

        contenedor.innerHTML = html;
    }

    window.imprimirSugerenciasRG = function() {
        const contenedor = document.getElementById('sugerencias-contenido');
        if (!contenedor) return;
        const pWin = window.open('', '_blank', 'width=800,height=1000');
        pWin.document.write(`<html><head><title>Sugerencias RG</title><style>${stylePrint.innerHTML}</style></head><body><div class="sugerencias-panel">${contenedor.innerHTML}</div><script>setTimeout(() => { window.print(); window.close(); }, 500);<\/script></body></html>`);
        pWin.document.close();
    };

    window.renderCartaRG = renderCartaRG;
    setTimeout(renderCartaRG, 600);
})();
