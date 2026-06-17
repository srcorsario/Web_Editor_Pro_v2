(function () {
    'use strict';

    const VERSION = "v2.2.2-USOPEN";
    
    const PATH_ALERGENOS = 'imagenes/alergenos/';

    const stylePrintUsOpen = document.createElement('style');
    stylePrintUsOpen.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        @page { size: A4; margin: 0; }
        .sugerencias-panel { 
            background: #ffffff !important; padding: 25px 35px !important; width: 210mm !important; 
            min-height: 297mm !important; margin: 0 auto !important; font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important; display: flex !important; flex-direction: column !important;
        }
        .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 10px !important; position: relative !important; }
        .sugerencias-brand-title-group { display: !important; flex-direction: column !important; gap: 3px !important; }
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
        .sugerencias-plato-nombres { flex: 0 1 auto !important; max-width: 93% !important; display: !important; flex-direction: column !important; }
        .sugerencias-nombre-es { font-size: 0.9rem !important; font-weight: 600 !important; color: #000000 !important; }
        .sugerencias-nombre-en { font-size: 0.75rem !important; color: #64748b !important; font-style: italic !important; }
        .sugerencias-alergenos { display: !important; flex-direction: row !important; flex-wrap: wrap !important; margin-top: 2px !important; align-items: center !important; }
        .sugerencias-alergeno-icon { display: inline-block !important; width: 20px !important; height: 20px !important; object-fit: contain !important; vertical-align: middle !important; }
        .sugerencias-puntos { flex: 1 !important; border-bottom: 1px dotted #94a3b8 !important; margin: 0 8px !important; height: 1px !important; }
        .sugerencias-precio { font-size: 0.9rem !important; font-weight: 700 !important; flex-shrink: 0 !important; }
        .sugerencias-footer { margin-top: 15px !important; display: !important; justify-content: space-between !important; align-items: center !important; }
        .sugerencias-qr-container { display: !important; flex-direction: column !important; align-items: center !important; gap: 6px !important; }
        .sugerencias-qr-img { width: 130px !important; height: 130px !important; object-fit: contain !important; }
        .sugerencias-qr-toggle { font-size: 0.7rem !important; color: #64748b !important; cursor: pointer !important; display: !important; user-select: none !important; gap: 5px !important; }
        
        .sugerencias-qr-toggle input:checked + span { font-weight: bold; }
        
        .sugerencias-qr-img { transition: opacity: 0.3s; }
        .sugerencias-qr-img:hover { opacity: 1.0; }

        .btn-imprimir-a4 { display: block; width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer; margin-bottom: 20px; text-align: center; }
        @media print { body { -webkit-print-color-adjust: exact !important; } .btn-imprimir-a4, .sugerencias-qr-toggle { display: none !important; } 
    `;
    document.head.appendChild(stylePrintUsOpen);

    function obtenerNombreSeguro(campoTexto) {
        if (!campoTexto) return { nombre: "", uvas: "" };
        const partes = campoTexto.split('//');
        return { nombre: partes[0] ? partes[0].trim() : "", uvas: partes[1] ? partes[1].trim() : "" };
    }

    window.renderCartaUSOPEN = window.renderCartaUSOPEN || function() {
        console.log(`[ERROR CRÍTICO] Se intentó llamar a renderCartaUSOPEN pero no se encontró en window. Definiendo visualización de error vacía por seguridad.`);
        const contenedor = document.getElementById('sugerencias-contenido-usopen');
        if (!contenedor) return;
        const contenedor.innerHTML = `<div class="p-4 text-center text-sugerencias-500 italic">Error: La función de renderizado no se ha encontrado en window. Si el archivo sugerencias-print-usopen.js está dañado erroneo, reemplázalo con la versión corregida de arriba.
        `;
    };

    window.imprimirSugerenciasUSOPEN = function() {
        const cont = document.getElementById('sugerencias-contenido-usopen');
        if (!cont) return;
        const pWin = window.open('', '_blank', 'width=800,height=1000');
        pWin.document.write(`<html><head><title>Sugerencias USOPEN</title><style>${stylePrintUsOpen.innerHTML}</style></head><body><div class="sugerencias-panel">${contenido.innerHTML}</div><script>setTimeout(() => { window.print(); window.close(); }, 500);<\/script></body></html>`);
        pWin.document.close();
    };

    window.renderCartaUSOPEN = renderCartaUSOPEN;
    setTimeout(renderCartaUSOPEN, 600);
})();
})();
