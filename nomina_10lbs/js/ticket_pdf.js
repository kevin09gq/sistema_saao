function obtenerMapaEmpresasDesdeSelect() {
    const mapa = new Map();
    const $sel = $('#filtro-empresa');
    if ($sel.length) {
        $sel.find('option').each(function () {
            const v = String($(this).attr('value') || '').trim();
            const t = String($(this).text() || '').trim();
            if (v !== '') mapa.set(v, t);
        });
    }
    return mapa;
}

function obtenerNomina10lbsGlobal() {
    if (window.jsonNomina10lbs && Array.isArray(window.jsonNomina10lbs.departamentos)) return window.jsonNomina10lbs;
    if (typeof jsonNomina10lbs !== 'undefined' && jsonNomina10lbs && Array.isArray(jsonNomina10lbs.departamentos)) return jsonNomina10lbs;
    return null;
}

function obtenerEmpleadosFiltrados10lbs(options = {}) {
    const { aplicarBusqueda = false } = options;
    const nomina = obtenerNomina10lbsGlobal();
    if (!nomina || !Array.isArray(nomina.departamentos)) {
        return [];
    }

    const valorSelect = String($('#filtro-departamento').val() || 'all|all');
    const q = aplicarBusqueda ? String($('#busqueda-nomina-10lbs').val() || '').trim().toLowerCase() : '';

    let filtroDepto = 'all';
    let seguroSocial = null;

    if (valorSelect !== 'all|all' && valorSelect !== '') {
        const partes = valorSelect.split('|');
        filtroDepto = partes[0];
        seguroSocial = partes[1] === 'true';
    }

    let empleados = [];

    nomina.departamentos.forEach(depto => {
        // 1. Filtrar por departamento
        if (filtroDepto !== 'all') {
            const matchId = depto.id_departamento && String(depto.id_departamento) === String(filtroDepto);
            const matchNombre = depto.nombre && String(depto.nombre) === String(filtroDepto);
            if (!matchId && !matchNombre) return;
        }

        if (!Array.isArray(depto.empleados)) return;

        depto.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;

            // 2. Filtrar por seguroSocial
            if (seguroSocial !== null && emp.seguroSocial !== seguroSocial) {
                return;
            }

            // 3. Filtrar por búsqueda
            if (q) {
                const nombre = String(emp.nombre || '').toLowerCase();
                const clave = String(emp.clave || '').toLowerCase();
                if (!nombre.includes(q) && !clave.includes(q)) return;
            }

            empleados.push({
                emp,
                deptoNombre: String(depto.nombre || '')
            });
        });
    });

    empleados.sort((a, b) => String(a.emp.nombre || '').localeCompare(String(b.emp.nombre || ''), 'es', { sensitivity: 'base' }));

    return empleados;
}

function obtenerTodosEmpleados10lbs() {
    const nomina = obtenerNomina10lbsGlobal();
    if (!nomina || !Array.isArray(nomina.departamentos)) return [];

    let empleados = [];
    nomina.departamentos.forEach(depto => {
        if (!Array.isArray(depto.empleados)) return;
        depto.empleados.forEach(emp => {
            if (emp && emp.mostrar !== false) {
                empleados.push({ emp, deptoNombre: String(depto.nombre || '') });
            }
        });
    });

    empleados.sort((a, b) => String(a.emp.nombre || '').localeCompare(String(b.emp.nombre || ''), 'es', { sensitivity: 'base' }));
    return empleados;
}

function construirNominaParaTickets10lbs(empleadosConDepto) {
    const nomina = obtenerNomina10lbsGlobal();
    const departamentosMap = new Map();

    empleadosConDepto.forEach(({ emp, deptoNombre }) => {
        const nombreDepto = String(deptoNombre || '').trim();
        if (!departamentosMap.has(nombreDepto)) departamentosMap.set(nombreDepto, []);
        const copia = JSON.parse(JSON.stringify(emp));
        copia.departamento = nombreDepto;

        const esSinSeguro = (emp.seguroSocial === false) || String(nombreDepto).toLowerCase().includes('sin seguro');
        if (esSinSeguro) copia.sin_seguro_ticket = true;

        if (copia.id_empresa === undefined || copia.id_empresa === null || copia.id_empresa === '') {
            copia.id_empresa = 1;
        }

        departamentosMap.get(nombreDepto).push(copia);
    });

    const departamentos = Array.from(departamentosMap.entries()).map(([nombre, empleados]) => ({
        nombre,
        empleados
    }));

    return {
        numero_semana: nomina?.numero_semana || '',
        departamentos
    };
}

$(document).ready(function () {
    $('#btn_ticket_pdf').on('click', function () {
        const nomina = obtenerNomina10lbsGlobal();
        if (!nomina || !Array.isArray(nomina.departamentos)) {
            Swal.fire('Sin datos', 'No hay datos de nómina para generar el PDF.', 'warning');
            return;
        }

        const empleadosConDepto = obtenerEmpleadosFiltrados10lbs({ aplicarBusqueda: true });
        if (empleadosConDepto.length === 0) {
            Swal.fire('Sin datos', 'No hay empleados para los filtros seleccionados.', 'warning');
            return;
        }

        const nominaParaEnviar = construirNominaParaTickets10lbs(empleadosConDepto);

        const $btn = $(this);
        $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');

        $.ajax({
            url: '../php/descargar_ticket_pdf.php',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify({ nomina: nominaParaEnviar }),
            xhrFields: { responseType: 'blob' },
            success: function (blob, status, xhr) {
                if (!(blob instanceof Blob) || blob.size === 0) {
                    Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido.', 'error');
                    $btn.prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
                    return;
                }

                let filename = 'tickets_10lbs.pdf';
                const disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('filename=') !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches && matches[1]) filename = matches[1].replace(/["']/g, '');
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                $btn.prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
            },
            error: function () {
                Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
                $btn.prop('disabled', false).html('<i class="bi bi-ticket-perforated"></i>');
            }
        });
    });
});
