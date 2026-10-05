/**
 * Genera y descarga tickets PDF para todos los empleados de la nómina
 */

function obtenerNomina40lbsGlobal() {
    if (typeof jsonNomina40lbs !== 'undefined' && jsonNomina40lbs && Array.isArray(jsonNomina40lbs.departamentos)) {
        if (typeof window !== 'undefined') window.jsonNomina40lbs = jsonNomina40lbs;
        return jsonNomina40lbs;
    }
    if (typeof window !== 'undefined' && window.jsonNomina40lbs && Array.isArray(window.jsonNomina40lbs.departamentos)) {
        return window.jsonNomina40lbs;
    }
    return null;
}

function obtenerEmpleadosFiltrados40lbs(options = {}) {
    const { aplicarBusqueda = false } = options;
    const nomina = obtenerNomina40lbsGlobal();
    if (!nomina || !Array.isArray(nomina.departamentos)) return [];

    const valorSelect = String($('#filtro-departamento').val() || '');
    const q = aplicarBusqueda ? String($('#busqueda-nomina-40lbs').val() || '').trim().toLowerCase() : '';

    let filtroDepto = 'all';
    let seguroSocial = null;

    // El formato en nomina_40lbs es "idDepartamento-TipoEmpleado" (ej: "1-CSS", "1-SSS")
    if (valorSelect !== '' && valorSelect !== 'all') {
        const partes = valorSelect.split('-');
        if (partes.length === 2) {
            filtroDepto = partes[0];
            const tipoEmpleado = partes[1];
            // CSS = con seguro social, SSS = sin seguro social
            seguroSocial = tipoEmpleado === 'CSS';
        }
    }

    let empleados = [];

    nomina.departamentos.forEach(depto => {
        if (filtroDepto !== 'all') {
            const matchId = depto.id_departamento && String(depto.id_departamento) === String(filtroDepto);
            const matchNombre = depto.nombre && String(depto.nombre) === String(filtroDepto);
            if (!matchId && !matchNombre) return;
        }

        if (!Array.isArray(depto.empleados)) return;

        depto.empleados.forEach(emp => {
            if (!emp || emp.mostrar === false) return;
            if (seguroSocial !== null && emp.seguroSocial !== seguroSocial) return;

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

function mapearEmpleadoTicket40lbs(emp, deptoNombre) {
    const codigosDeduccion = {
        '45': 'ISR',
        '52': 'IMSS',
        '16': 'INFONAVIT',
        '107': 'AJUSTES AL SUB'
    };

    let deduccionesArray = [];
    if (Array.isArray(emp.conceptos)) {
        emp.conceptos.forEach(concepto => {
            const codigo = String(concepto.codigo || '');
            const nombre = codigosDeduccion[codigo] || concepto.nombre || '';
            const valor = parseFloat(concepto.resultado) || 0;
            if (nombre && valor > 0) {
                deduccionesArray.push({
                    nombre: nombre,
                    resultado: valor
                });
            }
        });
    }

    if ((emp.permiso || 0) > 0) {
        deduccionesArray.push({
            nombre: 'PERMISO',
            resultado: emp.permiso
        });
    }

    return {
        clave: emp.clave || '',
        nombre: emp.nombre || '',
        id_empresa: emp.id_empresa || 1,
        sueldo_base: emp.sueldo_neto || 0,
        incentivo: emp.incentivo || 0,
        sueldo_extra: emp.horas_extra || 0,
        sueldo_extra_final: emp.sueldo_extra_final || 0,
        bono_antiguedad: emp.bono_antiguedad || 0,
        aplicar_bono: emp.aplicar_bono || 0,
        actividades_especiales: emp.actividades_especiales || 0,
        bono_puesto: emp.puesto || 0,
        neto_pagar: emp.tarjeta || 0,
        prestamo: emp.prestamo || 0,
        uniformes: emp.uniformes || 0,
        checador: emp.checador || 0,
        inasistencias_descuento: emp.inasistencia || 0,
        vacaciones: emp.vacaciones || 0,
        conceptos: deduccionesArray,
        conceptos_adicionales: (emp.percepciones_extra || []).map(item => ({
            nombre: item.nombre || '',
            valor: item.cantidad || 0
        })),
        deducciones_adicionales: (emp.deducciones_extra || []).map(item => ({
            nombre: item.nombre || '',
            valor: item.cantidad || 0
        })),
        mostrar: emp.mostrar !== false,
        salario_semanal: emp.salario_semanal || 0,
        salario_diario: emp.salario_diario || 0,
        departamento: deptoNombre || '',
        id_departamento: emp.id_departamento || null,
        seguroSocial: emp.seguroSocial !== undefined ? emp.seguroSocial : true,
        nombre_departamento: deptoNombre || '',
        nombre_puesto: emp.nombre_puesto || '',
        rfc_empleado: emp.rfc || '',
        imss: emp.imss || '',
        fecha_alta_empresa: emp.fecha_alta_empresa || ''
    };
}

function construirNominaParaTickets40lbs(empleadosConDepto) {
    const nomina = obtenerNomina40lbsGlobal();
    const departamentosMap = new Map();

    empleadosConDepto.forEach(({ emp, deptoNombre }) => {
        const nombreDepto = String(deptoNombre || '').trim() || 'Sin Departamento';
        if (!departamentosMap.has(nombreDepto)) departamentosMap.set(nombreDepto, []);
        departamentosMap.get(nombreDepto).push(mapearEmpleadoTicket40lbs(emp, nombreDepto));
    });

    return {
        numero_semana: nomina?.numero_semana || '',
        fecha_inicio: nomina?.fecha_inicio || '',
        fecha_cierre: nomina?.fecha_cierre || '',
        departamentos: Array.from(departamentosMap.entries()).map(([nombre, empleados]) => ({
            nombre,
            empleados
        }))
    };
}

function descargarTickets40lbs(url, nombreArchivoBase, exitoTexto, esTicketNombre = false) {
    const nomina = obtenerNomina40lbsGlobal();
    if (!nomina || !Array.isArray(nomina.departamentos)) {
        Swal.fire({
            title: 'Sin datos',
            text: 'No hay datos de nómina para generar el PDF.',
            icon: 'warning'
        });
        return;
    }

    // Depuración: mostrar el valor del filtro
    console.log('Valor del filtro:', $('#filtro-departamento').val());
    console.log('Valor de búsqueda:', $('#busqueda-nomina-40lbs').val());

    const empleadosConDepto = obtenerEmpleadosFiltrados40lbs({ aplicarBusqueda: true });
    console.log('Empleados filtrados:', empleadosConDepto.length);

    if (empleadosConDepto.length === 0) {
        Swal.fire({
            title: 'Sin datos',
            text: 'No hay empleados para los filtros seleccionados.',
            icon: 'warning'
        });
        return;
    }

    const nominaParaEnviar = construirNominaParaTickets40lbs(empleadosConDepto);

    // Obtener departamento predominante y verificar si hay múltiples departamentos
    const deptoCount = {};
    nominaParaEnviar.departamentos.forEach(depto => {
        const nombreDepto = (depto.nombre || 'GENERAL').toUpperCase();
        const count = (depto.empleados || []).length;
        deptoCount[nombreDepto] = (deptoCount[nombreDepto] || 0) + count;
    });
    const departamentosUnicos = Object.keys(deptoCount);
    const multiplesDepartamentos = departamentosUnicos.length > 1;
    const departamento = Object.keys(deptoCount).reduce((a, b) => deptoCount[a] > deptoCount[b] ? a : b);
    
    // Generar nombre del archivo con formato según el tipo de ticket
    const numSemana = nomina.numero_semana || '';
    const año = new Date().getFullYear();
    let nombreArchivo;
    if (esTicketNombre) {
        // Formato para tickets nombre: NOMBRE_SEMANA_DEPARTAMENTO_40LBS_AÑO
        if (multiplesDepartamentos) {
            nombreArchivo = `NOMBRE_SEM ${numSemana}_40LBS_${año}.pdf`;
        } else {
            nombreArchivo = `NOMBRE_SEM ${numSemana}_${departamento}_40LBS_${año}.pdf`;
        }
    } else {
        // Formato para tickets generales: SEMANA_DEPARTAMENTO_40LBS_AÑO
        if (multiplesDepartamentos) {
            nombreArchivo = `SEM ${numSemana}_40LBS_${año}.pdf`;
        } else {
            nombreArchivo = `SEM ${numSemana}_${departamento}_40LBS_${año}.pdf`;
        }
    }
    
    // Agregar departamento y año al meta
    nominaParaEnviar.meta = {
        numero_semana: numSemana,
        departamento: multiplesDepartamentos ? '' : departamento,
        año: año
    };

    Swal.fire({
        title: 'Generando tickets...',
        text: 'Por favor espera mientras se generan los PDFs.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.responseType = 'blob';

    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const blob = xhr.response;

                const urlBlob = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = urlBlob;
                link.download = nombreArchivo;

                document.body.appendChild(link);
                link.click();

                setTimeout(() => {
                    window.URL.revokeObjectURL(urlBlob);
                    document.body.removeChild(link);
                }, 100);

                Swal.fire({
                    title: 'Exito',
                    text: `${exitoTexto} ${nombreArchivo}`,
                    icon: 'success'
                });
            } catch (error) {
                console.error('Error al procesar PDF:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al procesar el archivo PDF generado.',
                    icon: 'error'
                });
            }
        } else {
            console.error('Error HTTP:', xhr.status);
            Swal.fire({
                title: 'Error',
                text: `Error del servidor: ${xhr.status}`,
                icon: 'error'
            });
        }
    };

    xhr.onerror = function() {
        console.error('Error en la solicitud XML');
        Swal.fire({
            title: 'Error',
            text: 'Error de conexión al servidor.',
            icon: 'error'
        });
    };

    xhr.send(JSON.stringify({ nomina: nominaParaEnviar }));
}

function generarTicketsPDF() {
    descargarTickets40lbs('../php/descargar_ticket_pdf.php', 'tickets_nomina', 'Tickets generados y descargados como');
}

/**
 * Genera y descarga tickets PDF con solo el nombre del empleado
 */
function generarTicketsNombrePDF() {
    descargarTickets40lbs('../php/descargar_ticket_nombre_pdf.php', 'tickets_nombre_40lbs', 'Tickets de nombre generados y descargados como', true);
}

// Manejador del boton de tickets con selector de tipo
$(document).ready(function() {
    $('#btn_ticket_pdf').on('click', function() {
        const nomina = obtenerNomina40lbsGlobal();
        if (!nomina || !Array.isArray(nomina.departamentos)) {
            Swal.fire({
                title: 'Sin datos',
                text: 'No hay datos de nómina para generar el PDF.',
                icon: 'warning'
            });
            return;
        }

        const modalEl = document.getElementById('modalSeleccionTicket');
        if (modalEl) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    });

    $('#btn_ticket_normal').on('click', function() {
        const modalEl = document.getElementById('modalSeleccionTicket');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        generarTicketsPDF();
    });

    $('#btn_ticket_nombre').on('click', function() {
        const modalEl = document.getElementById('modalSeleccionTicket');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        generarTicketsNombrePDF();
    });
});
