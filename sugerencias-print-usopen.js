(function () {
    'use strict';

    const VERSION = "v2.2.1-USOPEN";
    console.log(`%c[Editor Pro] [Sugerencias USOPEN] Inicializado ${VERSION}`, "color: #0d5c63; font-weight: bold;");

    const PATH_ALERGENOS = 'imagenes/alergenos/';

    const stylePrintUsOpen = document.createElement('style');
    stylePrintUsOpen.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght=300;400;600;700&display=swap');
        @page { size: A4; margin: 0; }
        .sugerencias-panel { 
            background: #ffffff !important; padding: 25px 35px !important; width: 210mm !important; 
            min-height: 297mm !important; margin: 0 auto !important; font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important; display: flex !important; flex-direction: column !important;
        }
        .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 10px !important; position: relative !important; }
        .sugerencias-brand-title-group { display: flex !important; flex-direction: column !important; gap: 3px !important; }
        .sugerencias-title-es { font-weight: 300 !important; font-size: 2rem !important; color: #e05a2b !important; text-transform: uppercase !important; margin:0 !important; }
        .sugerencias-title-en { font-weight: 300 !important; font-size: 1.4rem !important; color: #0d5c63 !important; text-transform: uppercase !important; margin:0 !important; }
        .sugerencias-version-tag { position: absolute !important; top: -15px !important; left: 0 !important; font-size: 0.6rem !important; color: #94a3b8 !important; font-family: monospace !important; }
        .sugerencias-logo-img { width: 200px !important; height: auto !important; object-fit: contain !important; }
        .sugerencias-body { flex: 1 1 auto !important; display: flex !important; flex-direction: column !important; }
        .sugerencias-seccion { margin-bottom: 15px !important; }
        .sugerencias-seccion-titulo { font-size: 0.85rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; margin-bottom: 8px !important; text-transform: uppercase !important; }
        .sugerencias-seccion-vinos { margin-top: auto !important; }
        .sugerencias-body.no-postres .sugerencias-seccion-principales { margin-top: auto !important; margin-bottom: auto !important; }
        .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 6px !important; width: 100% !important; }
        .sugerencias-plato-nombres { flex: 0 1 auto !important; max-width: 93% !important; display: flex !important; flex-direction: column !important; }
        .sugerencias-nombre-es { font-size: 0.9rem !important; font-weight: 600 !important; color: #000000 !important; }
        .sugerencias-nombre-en { font-size: 0.75rem !important; color: #64748b !important; font-style: italic !important; }
        .sugerencias-alergenos { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 4px !important; margin-top: 2px !important; align-items: center !important; }
        .sugerencias-alergeno-icon { display: inline-block !important; width: 20px !important; height: 20px !important; object-fit: contain !important; vertical-align: middle !important; }
        .sugerencias-puntos { flex: 1 !important; border-bottom: 1px dotted #94a3b8 !important; margin: 0 8px !important; height: 1px !important; }
        .sugerencias-precio { font-size: 0.9rem !important; font-weight: 700 !important; flex-shrink: 0 !important; }
        .sugerencias-footer { margin-top: 15px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
        .sugerencias-aviso { font-size: 0.7rem !important; color: #64748b !important; max-width: 60% !important; line-height: 1.4 !important;}
        .sugerencias-qr-container { display: flex !important; flex-direction: column !important; align-items: center !important; gap: 6px !important; }
        .sugerencias-qr-img { width: 130px !important; height: 130px !important; object-fit: contain !important; }
        .sugerencias-qr-toggle { font-size: 0.7rem !important; color: #64748b !important; cursor: pointer !important; display: flex !important; user-select: none !important; gap: 5px !important; }
        .btn-imprimir-a4 { display: block; width: 100%; padding: 12px; background: #0d5c63; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; margin-bottom: 20px; text-align: center; }
        @media print { body { -webkit-print-color-adjust: exact !important; } .btn-imprimir-a4, .sugerencias-qr-toggle { display: none !important; } }
    `;
    document.head.appendChild(stylePrintUsOpen);

    function renderCartaUSOPEN() {
        const contenedor = document.getElementById('sugerencias-contenido-usopen');
        if (!contenedor) return;

        // VARIABLES EXCLUSIVAS USOPEN: Buscamos en todas las claves posibles de almacenamiento dedicadas a USOPEN
        let fuente = [];
        const backupUSOPEN = localStorage.getItem('csvData_USOPEN') || 
                             localStorage.getItem('csvDataUSOPEN') || 
                             localStorage.getItem('csvData_usopen');

        if (backupUSOPEN) { 
            try { fuente = JSON.parse(backupUSOPEN); } catch(e) { console.error("Error USOPEN parse", e); } 
        }

        if (!fuente || fuente.length === 0) {
            contenedor.innerHTML = `<div class="p-4 text-center text-slate-500 italic">Esperando origen de datos válido de la carta UsOpen en localStorage (csvData_USOPEN)...</div>`;
            return;
        }

        const platos = fuente.filter(p => p.activa && p.id >= 12000 && p.id <= 12999);
        let entrantes = [], principales = [], postres = [], vinos = [];

        platos.forEach(p => {
            const id = p.id;
            const textEs = desglosarNombre(p.es).nombre.toLowerCase();
            if (id === 12990 || (textEs.includes('vino') && !textEs.includes('copa') && !textEs.includes('vinagreta'))) {
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
            <button onclick="window.imprimirSugerenciasUSOPEN()" class="btn-imprimir-a4">🖨️ Imprimir Sugerencias USOPEN (A4)</button>
            <div class="sugerencias-header-layout">
                <span class="sugerencias-version-tag">Módulo ${VERSION}</span>
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">SUGERENCIAS DEL CHEF</div>
                    <div class="sugerencias-title-en">CHEF'S SUGGESTIONS</div>
                </div>
                <img src="USOPEN_REST.png" class="sugerencias-logo-img" onerror="this.src='https://z-cdn-media.chatglm.cn/files/fc4b4919-b148-470d-97a2-c740c58d1178.png?auth_key=1881113734-9f1ef8e42c5a4eae8f4f0f9055730ecf-0-f7b585f0f08f5f78de683fb163bec75d';">
            </div>
            <div class="${postres.length === 0 ? 'sugerencias-body no-postres' : 'sugerencias-body'}">
        `;

        const renderCat = (titulo, lista, className) => {
            if (lista.length === 0) return '';
            let h = `<div class="sugerencias-seccion ${className}"><div class="sugerencias-seccion-titulo">${titulo}</div>`;
            lista.forEach(p => {
                let iconsHtml = '';
                if (p.alergenos) {
                    iconsHtml = '<div class="sugerencias-alergenos">' + p.alergenos.split(',').map(a => `<img src="${PATH_ALERGENOS}${a.trim()}.webp" class="sugerencias-alergeno-icon" onerror="this.style.display='none'">`).join('') + '</div>';
                }
                h += `
                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <span class="sugerencias-nombre-es">${desglosarNombre(p.es).nombre}</span>
                            <span class="sugerencias-nombre-en">${desglosarNombre(p.en).nombre}</span>
                            ${iconsHtml}
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">${p.precio}€</div>
                    </div>`;
            });
            return h + '</div>';
        };

        html += renderCat('Entrantes / Starters', entrantes, 'sugerencias-seccion-entrantes');
        html += renderCat('Platos Principales / Main Courses', principales, 'sugerencias-seccion-principales');
        html += renderCat('Postres / Desserts', postres, 'sugerencias-seccion-postres');
        html += renderCat('Vinos Recomendados / Recommended Wines', vinos, 'sugerencias-seccion-vinos');
        
        html += `
            </div>
            <div class="sugerencias-footer">
                <div class="sugerencias-aviso">⚠️ Si usted tiene alguna alergia, por favor comuníquelo al personal.<br>If you have any food allergies, please inform staff.</div>
                <div class="sugerencias-qr-container">
                    <label class="sugerencias-qr-toggle"><input type="checkbox" id="toggle-qr-usopen" checked> Mostrar QR</label>
                    <img src="https://z-cdn-media.chatglm.cn/files/b78052a5-e557-40d5-b6d7-b178fdcb24f0.png?auth_key=1881113482-d01441d334c1427982bb0a78a45f46bd-0-60430b647cd3b43f34b5ec212f6640b1" class="sugerencias-qr-img" id="img-qr-usopen">
                </div>
            </div>
        `;

        contenedor.innerHTML = html;

        const toggle = document.getElementById('toggle-qr-usopen');
        if(toggle) {
            toggle.addEventListener('change', function() {
                const img = document.getElementById('img-qr-usopen');
                if(img) img.style.display = this.checked ? 'block' : 'none';
            });
        }
    }

    window.imprimirSugerenciasUSOPEN = function() {
        const cont = document.getElementById('sugerencias-contenido-usopen');
        if (!cont) return;
        const pWin = window.open('', '_blank', 'width=800,height=1000');
        pWin.document.write(`<html><head><title>Sugerencias USOPEN</title><style>${stylePrintUsOpen.innerHTML}</style></head><body><div class="sugerencias-panel">${cont.innerHTML}</div><script>setTimeout(() => { window.print(); window.close(); }, 500);<\/script></body></html>`);
        pWin.document.close();
    };

    window.renderCartaUSOPEN = renderCartaUSOPEN;
    setTimeout(renderCartaUSOPEN, 600);
})();
