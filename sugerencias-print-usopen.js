(function () {
    'use strict';

    const VERSION = "v2.2.0-USOPEN";
    console.log(`%c[Editor Pro] [Sugerencias USOPEN] Inicializado ${VERSION}`, "color: #0d5c63; font-weight: bold;");

    // Inyección limpia en la cabecera
    const intv = setInterval(() => {
        const header = document.querySelector('header .text-xs') || document.getElementById('version-indicador-ui') || document.querySelector('.version-logs');
        if (header && !header.textContent.includes('print-usopen')) {
            header.textContent += ` - sugerencias-print-usopen.js ${VERSION}`;
            clearInterval(intv);
        }
    }, 300);

    const PATH_ALERGENOS = 'imagenes/alergenos/';

    function renderCartaUSOPEN() {
        const contenedor = document.getElementById('sugerencias-contenido-usopen');
        if (!contenedor) return;

        let fuente = [];
        if (window.activeStateContainer && window.activeStateContainer.csvDataUSOPEN) {
            fuente = window.activeStateContainer.csvDataUSOPEN;
        } else {
            const backup = localStorage.getItem('csvData_USOPEN');
            if (backup) { try { fuente = JSON.parse(backup); } catch(e) {} }
        }

        if (!fuente || fuente.length === 0) {
            setTimeout(renderCartaUSOPEN, 200);
            return;
        }

        // Filtro estricto ID (12000-12999) e individuales para USOPEN
        const platos = fuente.filter(p => p.activa && p.id >= 12000 && p.id <= 12999);
        let entrantes = [], principales = [], postres = [], vinos = [];

        platos.forEach(p => {
            const id = p.id;
            const nombreEs = desglosarNombre(p.es).nombre.toLowerCase();
            if (id === 12990 || (nombreEs.includes('vino') && !nombreEs.includes('copa') && !nombreEs.includes('vinagreta'))) {
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
            <button onclick="window.imprimirSugerenciasUSOPEN()" class="btn-imprimir-a4" style="background:#0d5c63 !important;">🖨️ Imprimir Sugerencias USOPEN (A4)</button>
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

        document.getElementById('toggle-qr-usopen').addEventListener('change', function() {
            document.getElementById('img-qr-usopen').style.display = this.checked ? 'block' : 'none';
        });
    }

    // Observer exclusivo de escucha para el contenedor del USOPEN
    const obs = new MutationObserver(() => {
        if (document.getElementById('sugerencias-contenido-usopen')) {
            renderCartaUSOPEN();
        }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    window.imprimirSugerenciasUSOPEN = function() {
        const cont = document.getElementById('sugerencias-contenido-usopen');
        if (!cont) return;
        const pWin = window.open('', '_blank', 'width=800,height=1000');
        pWin.document.write(`<html><head><title>Sugerencias USOPEN</title><style>${document.head.querySelector('style').innerHTML}</style></head><body><div class="sugerencias-panel">${cont.innerHTML}</div><script>setTimeout(() => { window.print(); window.close(); }, 500);<\/script></body></html>`);
        pWin.document.close();
    };

    renderCartaUSOPEN();
})();
