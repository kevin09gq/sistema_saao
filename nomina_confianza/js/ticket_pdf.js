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

function obtenerNominaConfianzaGlobal() {
    if (window.jsonNominaConfianza && Array.isArray(window.jsonNominaConfianza.departamentos)) return window.jsonNominaConfianza;
    if (typeof jsonNominaConfianza !== 'undefined' && jsonNominaConfianza && Array.isArray(jsonNominaConfianza.departamentos)) return jsonNominaConfianza;
    return null;
}

function obtenerEmpleadosFiltradosConfianza(opciones = {}) {
    const nomina = obtenerNominaConfianzaGlobal();
    if (!nomina || !Array.isArray(nomina.departamentos)) return [];

    const aplicarBusqueda = opciones.aplicarBusqueda === true;
    const valorDepartamento = String($('#filtro-departamento').val() || '');
    const valorEmpresa = String($('#filtro-empresa').val() || '');
    const q = aplicarBusqueda ? String($('#busqueda-nomina-confianza').val() || '').trim().toLowerCase() : '';

    let empleados = [];

    if (valorDepartamento === '' || valorDepartamento === '0' || valorDepartamento === 'all') {
        nomina.departamentos.forEach(depto => {
            if (!Array.isArray(depto.empleados)) return;
            depto.empleados.forEach(emp => {
                if (emp && emp.mostrar !== false) {
                    empleados.push({ emp, deptoNombre: String(depto.nombre || '') });
                }
            });
        });
    } else if (valorDepartamento === 'sin_seguro') {
        const deptoSinSeguro = nomina.departamentos.find(d => String(d.nombre || '').toLowerCase().trim() === 'sin seguro');
        if (deptoSinSeguro && Array.isArray(deptoSinSeguro.empleados)) {
            deptoSinSeguro.empleados.forEach(emp => {
                if (emp && emp.mostrar !== false) {
                    empleados.push({ emp, deptoNombre: String(deptoSinSeguro.nombre || 'sin seguro') });
                }
            });
        }
    } else {
        const idDepartamento = Number(valorDepartamento);
        nomina.departamentos.forEach(depto => {
            if (!Array.isArray(depto.empleados)) return;
            depto.empleados.forEach(emp => {
                if (emp && emp.mostrar !== false && Number(emp.id_departamento) === idDepartamento) {
                    empleados.push({ emp, deptoNombre: String(depto.nombre || '') });
                }
            });
        });
    }

    if (valorEmpresa !== '' && valorEmpresa !== '0' && valorEmpresa !== 'all') {
        const idEmpresa = Number(valorEmpresa);
        empleados = empleados.filter(x => Number(x.emp.id_empresa) === idEmpresa);
    }

    if (q) {
        empleados = empleados.filter(x => {
            const nombre = String(x.emp.nombre || '').toLowerCase();
            const clave = String(x.emp.clave || '').toLowerCase();
            return nombre.includes(q) || clave.includes(q);
        });
    }

    empleados.sort((a, b) => String(a.emp.nombre || '').localeCompare(String(b.emp.nombre || ''), 'es', { sensitivity: 'base' }));

    return empleados;
}

function obtenerTodosEmpleadosConfianza() {
    const nomina = obtenerNominaConfianzaGlobal();
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

function construirNominaParaTicketsConfianza(empleadosConDepto) {
    const nomina = obtenerNominaConfianzaGlobal();
    const departamentosMap = new Map();

    empleadosConDepto.forEach(({ emp, deptoNombre }) => {
        const nombreDepto = String(deptoNombre || '').trim();
        if (!departamentosMap.has(nombreDepto)) departamentosMap.set(nombreDepto, []);
        const copia = JSON.parse(JSON.stringify(emp));
        copia.departamento = nombreDepto;

        const esSinSeguro = String(nombreDepto).toLowerCase().trim() === 'sin seguro';
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
        const nomina = obtenerNominaConfianzaGlobal();
        if (!nomina || !Array.isArray(nomina.departamentos)) {
            Swal.fire('Sin datos', 'No hay datos de nómina para generar el PDF.', 'warning');
            return;
        }

        const empleadosConDepto = obtenerEmpleadosFiltradosConfianza({ aplicarBusqueda: true });
        if (empleadosConDepto.length === 0) {
            Swal.fire('Sin datos', 'No hay empleados para los filtros seleccionados.', 'warning');
            return;
        }

        const nominaParaEnviar = construirNominaParaTicketsConfianza(empleadosConDepto);

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

                let filename = 'tickets_confianza.pdf';
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
