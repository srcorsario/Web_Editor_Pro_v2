(function () {
    'use strict';

    // NUEVO: Ruta base para localizar las imágenes de los alérgenos.
    const ALERGENOS_BASE_PATH = 'imagenes/alergenos/';

    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        
        @page { 
            size: A4; 
            margin: 0; 
        }

        .sugerencias-panel { 
            background: #ffffff !important; 
            padding: 25px 35px !important; 
            width: 210mm !important; 
            min-height: 297mm !important; 
            margin: 0 auto !important; 
            font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important;
            display: flex !important; 
            flex-direction: column !important;
            }
        
        .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 10px !important; }
        .sugerencias-brand-title-group { display: flex !important; flex-direction: column !important; gap: 3px !important; }
        .sugerencias-title-es { font-weight: 300 !important; font-size: 2rem !important; color: #e05a2b !important; text-transform: uppercase !important; margin:0 !important; }
        .sugerencias-title-en { font-weight: 300 !important; font-size: 1.4rem !important; color: #0d5c63 !important; text-transform: uppercase !important; margin:0 !important; }
        
        .sugerencias-logo-img { width: 200px !important; height: auto !important; }
        /* MODIFICADO: Escala unificada idéntica a logo RG_REST / sugerencias-logo-img */
        .sugerencias-header-img { width: 200px !important; height: auto !important; object-fit: contain !important; }
        
        .sugerencias-body {
            flex: 1 1 auto !important;
            display: flex !important;
            flex-direction: column !important;
        }

        .sugerencias-seccion { margin-bottom: 15px !important; }
        .sugerencias-seccion-titulo { font-size: 0.85rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; margin-bottom: 8px !important; text-transform: uppercase !important; }
        
        .sugerencias-seccion-vinos { 
            margin-top: auto !important; 
        }

        .sugerencias-body.no-postres .sugerencias-seccion-principales {
            margin-top: auto !important;
            margin-bottom: auto !important;
        }
        
        .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 6px !important; width: 100% !important; }
        
        .sugerencias-plato-nombres { 
            flex: 0 1 auto !important; 
            max-width: 93% !important;
            display: flex !important; 
            flex-direction: column !important; 
        }
        
        .sugerencias-nombre-es { font-size: 0.9rem !important; font-weight: 600 !important; color: #000000 !important; }
        .sugerencias-nombre-en { font-size: 0.75rem !important; color: #64748b !important; font-style: italic !important; }
        
        .sugerencias-alergenos { 
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
            margin-top: 2px !important; 
            align-items: center !important;
        }
        .sugerencias-alergeno-icon { 
            display: inline-block !important;
            width: 20px !important; 
            height: 20px !important; 
            object-fit: contain !important;
            vertical-align: middle !important;
        }
        
        .sugerencias-puntos { 
            flex: 1 !important; 
            border-bottom: 1px dotted #94a3b8 !important; 
            margin: 0 8px !important; 
            height: 1px !important; 
        }
        
        .sugerencias-precio { font-size: 0.9rem !important; font-weight: 700 !important; flex-shrink: 0 !important; }
        
        .sugerencias-footer { 
            margin-top: 15px !important; 
            padding-top: 0 !important; 
            display: flex !important; 
            justify-content: space-between !important; 
            align-items: center !important; 
        }
        .sugerencias-aviso { font-size: 0.7rem !important; color: #64748b !important; max-width: 60% !important; line-height: 1.4 !important;}
        
        .sugerencias-qr-container { 
            display: flex !important; 
            flex-direction: column !important; 
            align-items: center !important; 
            gap: 6px !important; 
        }
        .sugerencias-qr-img { width: 130px !important; height: 130px !important; object-fit: contain !important; }
        .sugerencias-qr-toggle { 
            font-size: 0.7rem !important; 
            color: #64748b !important; 
            cursor: pointer !important; 
            display: flex !important; 
            align-items: center !important; 
            gap: 5px !important; 
            user-select: none !important;
        }
        
        .btn-imprimir-a4 {
            display: block;
            width: 100%;
            padding: 12px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            font-family: 'Montserrat', sans-serif;
            font-size: 0.9rem;
            cursor: pointer;
            margin-bottom: 20px;
            text-align: center;
            transition: background 0.2s;
        }
        .btn-imprimir-a4:hover {
            background: #1d4ed8;
        }

        @media print { 
            body { -webkit-print-color-adjust: exact !important; } 
            .btn-imprimir-a4 { display: none !important; }
            .sugerencias-qr-toggle { display: none !important; }
        }
    `;
    document.head.appendChild(stylePrint);

    function getAlergenosHtml(alergenosStr) {
        if (!alergenosStr) return '';
        const items = alergenosStr.split(',').map(a => a.trim()).filter(a => a);
        if (items.length === 0) return '';
        
        let iconsHtml = '<div class="sugerencias-alergenos">';
        items.forEach(nombreAlergeno => {
            iconsHtml += `<img src="${ALERGENOS_BASE_PATH}${nombreAlergeno}.webp" class="sugerencias-alergeno-icon" title="${nombreAlergeno}" onerror="this.style.display='none'">`;
        });
        iconsHtml += '</div>';
        
        return iconsHtml;
    }

    function cargarCarta() {
        const statusCarga = document.getElementById('status-carga');
        const isLoaded = statusCarga && statusCarga.innerText.includes('✅');

        if (typeof datosLocales === 'undefined' || (datosLocales.length === 0 && !isLoaded)) { 
            setTimeout(cargarCarta, 500); 
            return; 
        }
        
        const contenedorId = window.currentMode === 'USOPEN' ? 'sugerencias-contenido-usopen' : 'sugerencias-contenido';
        const contenedor = document.getElementById(contenedorId);
        
        if (!contenedor) return;

        const platosActivos = datosLocales.filter(p => p.activa && p.id >= 12000 && p.id <= 12999);

        let entrantes = [];
        let principales = [];
        let postres = [];
        let vinos = [];

        platosActivos.forEach(p => {
            const id = p.id;
            const nombreEs = desglosarNombre(p.es).nombre.toLowerCase();
            
            if (id === 12990 || (nombreEs.includes('vino') && !nombreEs.includes('copa') && !nombreEs.includes('vinagreta'))) {
                vinos.push(p);
            } 
            else if (id >= 12100 && id <= 12399) {
                entrantes.push(p);
            } 
            else if (id >= 12400 && id <= 12899) {
                principales.push(p);
            } 
            else if (id >= 12900 && id <= 12999) {
                postres.push(p);
            } 
            else {
                entrantes.push(p);
            }
        });

        const isUsOpen = window.currentMode === 'USOPEN';
        const LOGO_URL = isUsOpen ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/US_Open_%28logo%29.svg/1200px-US_Open_%28logo%29.svg.png' : 'https://z-cdn-media.chatglm.cn/files/fc4b4919-b148-470d-97a2-c740c58d1178.png?auth_key=1881113734-9f1ef8e42c5a4eae8f4f0f9055730ecf-0-f7b585f0f08f5f78de683fb163bec75d';
        
        const QR_URL = 'https://z-cdn-media.chatglm.cn/files/b78052a5-e557-40d5-b6d7-b178fdcb24f0.png?auth_key=1881113482-d01441d334c1427982bb0a78a45f46bd-0-60430b647cd3b43f34b5ec212f6640b1';
        
        const HEADER_TEXT_URL = isUsOpen ? 'USOPEN_REST.png' : 'https://z-cdn-media.chatglm.cn/files/ea3128c5-540d-482e-adee-1ecbc193dd9c.png?auth_key=1881116219-cf95c1daa2014b019656762380eb6c80-0-8816330462d4295fd9dfe95d1cfab6e5';
        
        // MODIFICADO: Textos estandarizados e idénticos en ambos modos según requerimiento directo
        const TITLE_TEXT = 'SUGERENCIAS DEL CHEF';
        const SUBTITLE_TEXT = "CHEF'S SUGGESTIONS";

        const modeSuffix = isUsOpen ? 'usopen' : 'rg';
        const toggleQrId = `toggle-qr-sugerencias-${modeSuffix}`;
        const imgQrId = `img-qr-sugerencias-${modeSuffix}`;

        let html = `
            <button onclick="window.imprimirSugerenciasA4()" class="btn-imprimir-a4">🖨️ Imprimir en A4</button>
            <div class="sugerencias-header-layout">
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">${TITLE_TEXT}</div>
                    <div class="sugerencias-title-en">${SUBTITLE_TEXT}</div>
                </div>
                <img src="${LOGO_URL}" class="sugerencias-logo-img">
            </div>
        `;
        
        if (HEADER_TEXT_URL) {
            html += `
            <div class="sugerencias-subheader">
                <img src="${HEADER_TEXT_URL}" class="sugerencias-header-img" onerror="this.style.opacity='0'; this.style.height='0px'; console.warn('No se pudo cargar la imagen local del encabezado.');">
            </div>
            `;
        }

        const bodyClass = postres.length === 0 ? 'sugerencias-body no-postres' : 'sugerencias-body';
        html += `<div class="${bodyClass}">`;

        const renderCat = (titulo, lista, className = '') => {
            if (lista.length === 0) return '';
            let h = `<div class="sugerencias-seccion ${className}"><div class="sugerencias-seccion-titulo">${titulo}</div>`;
            lista.forEach(p => {
                const alergenosHtml = getAlergenosHtml(p.alergenos);
                h += `
                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <span class="sugerencias-nombre-es">${desglosarNombre(p.es).nombre}</span>
                            <span class="sugerencias-nombre-en">${desglosarNombre(p.en).nombre}</span>
                            ${alergenosHtml}
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">${p.precio}€</div>
                    </div>`;
            });
            return h + `</div>`;
        };

        html += renderCat('Entrantes / Starters', entrantes, 'sugerencias-seccion-entrantes');
        html += renderCat('Platos Principales / Main Courses', principales, 'sugerencias-seccion-principales');
        html += renderCat('Postres / Desserts', postres, 'sugerencias-seccion-postres');
        html += renderCat('Vinos Recomendados / Recommended Wines', vinos, 'sugerencias-seccion-vinos');
        
        html += `</div>`;

        html += `
            <div class="sugerencias-footer">
                <div class="sugerencias-aviso">
                    ⚠️ Si usted tiene algún tipo de alergia alimentaria, por favor comuníquelo a nuestro personal.<br>
                    If you have any food allergies, please inform our staff.
                </div>
                <div class="sugerencias-qr-container">
                    <label class="sugerencias-qr-toggle">
                        <input type="checkbox" id="${toggleQrId}" checked> Mostrar QR
                    </label>
                    <img src="${QR_URL}" class="sugerencias-qr-img" id="${imgQrId}" alt="QR Menu">
                </div>
            </div>
        `;
        
        contenedor.innerHTML = html;

        const toggleQrCheckbox = document.getElementById(toggleQrId);
        const imgQr = document.getElementById(imgQrId);
        if (toggleQrCheckbox && imgQr) {
            toggleQrCheckbox.replaceWith(toggleQrCheckbox.cloneNode(true));
            const newToggle = document.getElementById(toggleQrId);
            
            newToggle.addEventListener('change', function() {
                imgQr.style.display = this.checked ? 'block' : 'none';
            });
        }
    }

    window.imprimirSugerenciasA4 = function() {
        const contenedorId = window.currentMode === 'USOPEN' ? 'sugerencias-contenido-usopen' : 'sugerencias-contenido';
        const contenedor = document.getElementById(contenedorId);
        
        if (!contenedor) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contenedor.innerHTML;
        const btnImprimir = tempDiv.querySelector('.btn-imprimir-a4');
        if (btnImprimir) btnImprimir.remove();

        const toggleLabel = tempDiv.querySelector('.sugerencias-qr-toggle');
        if (toggleLabel) toggleLabel.remove();

        const printWindow = window.open('', '_blank', 'width=800,height=1000');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <title>Imprimir Sugerencias A4</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
                    
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    
                    body { margin: 0; padding: 0; background: white; }
                    .sugerencias-panel { 
                        background: #ffffff !important; 
                        padding: 25px 35px !important;
                        width: 210mm !important; 
                        min-height: 297mm !important; 
                        margin: 0 auto !important; 
                        font-family: 'Montserrat', sans-serif !important;
                        box-sizing: border-box !important;
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 10px !important; }
                    .sugerencias-brand-title-group { display: flex !important; flex-direction: column !important; gap: 3px !important; }
                    .sugerencias-title-es { font-weight: 300 !important; font-size: 2rem !important; color: #e05a2b !important; text-transform: uppercase !important; margin:0 !important; }
                    .sugerencias-title-en { font-weight: 300 !important; font-size: 1.4rem !important; color: #0d5c63 !important; text-transform: uppercase !important; margin:0 !important; }
                    .sugerencias-logo-img { width: 200px !important; height: auto !important; }
                    .sugerencias-header-img { width: 200px !important; height: auto !important; object-fit: contain !important; }
                    
                    .sugerencias-body {
                        flex: 1 1 auto !important;
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    
                    .sugerencias-seccion { margin-bottom: 15px !important; }
                    .sugerencias-seccion-titulo { font-size: 0.85rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; margin-bottom: 8px !important; text-transform: uppercase !important; }
                    
                    .sugerencias-seccion-vinos { 
                        margin-top: auto !important; 
                    }
                    
                    .sugerencias-body.no-postres .sugerencias-seccion-principales {
                        margin-top: auto !important;
                        margin-bottom: auto !important;
                    }
                    
                    .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 6px !important; width: 100% !important; }
                    .sugerencias-plato-nombres { flex: 0 1 auto !important; max-width: 93% !important; display: flex !important; flex-direction: column !important; }
                    
                    .sugerencias-nombre-es { font-size: 0.9rem !important; font-weight: 600 !important; color: #000000 !important; }
                    .sugerencias-nombre-en { font-size: 0.75rem !important; color: #64748b !important; font-style: italic !important; }
                    
                    .sugerencias-alergenos { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 4px !important; margin-top: 2px !important; align-items: center !important; }
                    .sugerencias-alergeno-icon { display: inline-block !important; width: 20px !important; height: 20px !important; object-fit: contain !important; vertical-align: middle !important; }
                    
                    .sugerencias-puntos { flex: 1 !important; border-bottom: 1px dotted #94a3b8 !important; margin: 0 8px !important; height: 1px !important; }
                    .sugerencias-precio { font-size: 0.9rem !important; font-weight: 700 !important; flex-shrink: 0 !important; }
                    
                    .sugerencias-footer { 
                        margin-top: 15px !important; 
                        padding-top: 0 !important; 
                        display: flex !important; 
                        justify-content: space-between !important; 
                        align-items: center !important; 
                    }
                    .sugerencias-aviso { font-size: 0.7rem !important; color: #64748b !important; max-width: 60% !important; line-height: 1.4 !important;}
                    
                    .sugerencias-qr-container { display: flex !important; flex-direction: column !important; align-items: center !important; gap: 6px !important; }
                    .sugerencias-qr-img { width: 130px !important; height: 130px !important; object-fit: contain !important; }
                    .sugerencias-qr-toggle { display: none !important; }
                </style>
            </head>
            <body>
                <div class="sugerencias-panel">
                    ${tempDiv.innerHTML}
                </div>
                <script>
                    setTimeout(function() { 
                        window.print(); 
                        window.close(); 
                    }, 600);
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    window.renderSugerenciasLogic = cargarCarta;
    window.renderizarSugerencias = cargarCarta;

    cargarCarta();
})();
