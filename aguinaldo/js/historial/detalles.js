
// EVENTO PARA ABRIR EL MODAL DE LOS DETALLES DEL AGUINALDO
$(document).on('click', '.btn_ver_detalles_aguinaldo', function () {

    // Obtener los datos del botón
    const empleados = $(this).data('empleados');
    const anio = $(this).data('anio');
    const totalEmpleados = $(this).data('total');

    // VACIAR LOS DATOS ANTERIORES DEL MODAL
    $('#span_anio_detalle').text('');
    $('#total_registros_modal').text('');
    $('#empleados').val('');
    $('#cuerpo_tabla_detalles_aguinaldo').empty();

    // LLENAR EL MODAL CON LOS DATOS CORRESPONDIENTES
    $('#span_anio_detalle').text(anio);
    // LLENAR EL INPUT OCULTO CON LOS EMPLEADOS (EN FORMATO JSON)
    $('#empleados').val(JSON.stringify(empleados));
    // LLENAR EL TOTAL DE EMPLEADOS EN EL MODAL
    $('#total_registros_modal').text(totalEmpleados);

    // Llenar la tabla con los empleados
    llenar_tabla_aguinaldo(empleados);

    // Abrir el modal
    modal_detalles_aguinaldo.show();
});


/**
 * Llenar la tabla de aguinaldo con los datos obtenidos del servidor
 */
function llenar_tabla_aguinaldo(empleados) {

    // Obtener valores de los filtros
    const textoBusqueda = $('#busqueda_detalles').val().toLowerCase();
    const departamentoSeleccionado = $('#id_departamento').val();
    const empresaSeleccionada = $('#id_empresa').val();
    const limite = parseInt($('#limite').val()) || 10;

    // Obtener la página actual de la paginación
    let paginaActual = parseInt($('#pagina_actual_detalles').data('pagina')) || 1;


    // Filtrar empleados
    let empleadosFiltrados = empleados.filter(emp => {
        // Filtro de búsqueda (clave, nombre y apellidos)
        const coincideBusqueda = !textoBusqueda ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda)) ||
            (emp.nombre && emp.nombre.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_paterno && emp.ap_paterno.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_materno && emp.ap_materno.toLowerCase().includes(textoBusqueda));

        // Filtro de departamento por id
        // Si es -1 significa que debe mostrar todos los departamentos
        // Si no, mostrar solo los empleado de ese departamento
        const coincideDepartamento = departamentoSeleccionado === "-1" ||
            (parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado));
        // Filtro de empresa por id
        const coincideEmpresa = empresaSeleccionada === "-1" ||
            (parseInt(emp.id_empresa) === parseInt(empresaSeleccionada));

        // Filtro de derecho a aguinaldo y visibilidad
        const cumpleDerechoYVisible = emp.derecho_aguinaldo === true && emp.visible === true;

        return coincideBusqueda && coincideDepartamento && coincideEmpresa && cumpleDerechoYVisible;
    });

    // Calcular paginación
    let inicio = 0;
    let fin = empleadosFiltrados.length;

    if (limite !== -1) {
        inicio = (paginaActual - 1) * limite;
        fin = inicio + limite;
    }

    // Obtener empleados para la página actual
    const empleadosPagina = empleadosFiltrados.slice(inicio, fin);
    const totalPaginas = limite === -1 ? 1 : Math.ceil(empleadosFiltrados.length / limite);

    // Limpiar tabla
    const tbody = $('#cuerpo_tabla_detalles_aguinaldo');
    tbody.empty();

    // Si no hay empleados después de filtrar, mostrar mensaje
    if (empleadosPagina.length === 0) {
        tbody.html(
            '<tr><td colspan="13" class="text-center text-muted">No se encontraron resultados</td></tr>'
        );
        $('#paginacion_detalles').empty();
        return;
    }

    // Renderizar filas
    empleadosPagina.forEach((emp, index) => {
        const contador = inicio + index + 1;
        const campoVacio = '<span class="text-secondary">-</span>'
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim();
        const empresa = emp.id_empresa == 1 ? '<span class="badge rounded-pill text-bg-primary">SAAO</span>' : (emp.id_empresa == 2 ? '<span class="badge rounded-pill text-bg-secondary">SB</span>' : campoVacio);
        const sueldoDiario = parseFloat(emp.salario_diario) || 0;
        const diasTrabajados = emp.dias_trabajados || 0;
        const mesesTrabajados = emp.meses_trabajados || 0;
        const aguinaldo = emp.aguinaldo !== null && emp.aguinaldo !== undefined ? emp.aguinaldo : 0;
        const nss = emp.status_nss === 1 ? '<span class="badge rounded-pill text-bg-success">Sí</span>' : '<span class="badge rounded-pill text-bg-secondary">No</span>';
        const isr = emp.isr == 0 ? campoVacio : `<span class="text-danger">- $${formatoMoneda(emp.isr)}</span>`;
        const tarjeta = emp.tarjeta == 0 ? campoVacio : `<span class="text-danger">- $${formatoMoneda(emp.tarjeta)}</span>`;

        // Calcular total deducciones (ISR + Tarjeta)
        const suma = (parseFloat(emp.isr) || 0) + (parseFloat(emp.tarjeta) || 0);
        const totalDeducciones = suma == 0 ? campoVacio : `<span class="text-danger">- $ ${formatoMoneda(suma)}</span>`;

        const netoPagar = emp.neto_pagar < 0 ?
            `<span class="text-danger">- $ ${formatoMoneda(emp.neto_pagar * -1)}</span>` :
            (emp.neto_pagar > 0 ? `<span class="text-success">$ ${formatoMoneda(emp.neto_pagar)}</span>` : campoVacio);

        //const redondeado = emp.aplicar_redondeo ? diferenciaRedondeo(emp.neto_pagar) : 0;
        const redondeado = emp.redondeo;

        // const total_redondeo = emp.neto_pagar + redondeado;
        const total_redondeo = emp.neto_pagar_redondeado;

        const fila = `
            <tr data-id="${emp.id_empleado}">
                <td>${contador}</td>
                <td class="text-center">${emp.clave_empleado}</td>
                <td class="text-center">${nombreCompleto}</td>
                <td class="text-center fw-bold">${empresa}</td>
                <td class="text-center">${nss}</td>
                <td class="text-center">${sueldoDiario == 0 ? campoVacio : `$ ${formatoMoneda(sueldoDiario)}`}</td>
                <td class="text-center">${diasTrabajados}</td>
                <td class="text-center">${mesesTrabajados}</td>
                <td class="text-center">${aguinaldo == 0 ? campoVacio : `$ ${formatoMoneda(aguinaldo)}`}</td>
                <td class="text-center">${isr}</td>
                <td class="text-center">${tarjeta}</td>
                <td class="text-center fw-bold">${netoPagar}</td>
                <td class="text-center">${estructuraDinero(redondeado)}</td>
                <td class="text-center fw-bold">${estructuraDinero(total_redondeo)}</td>
            </tr>
        `;

        tbody.append(fila);
    });

    // ===============================
    // FILA DE TOTALES
    // ===============================
    if (paginaActual === totalPaginas || limite === -1) {

        const totalAguinaldo = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.aguinaldo) || 0),
            0
        );

        const totalISR = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.isr) || 0),
            0
        );

        const totalTarjeta = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.tarjeta) || 0),
            0
        );

        const totalNeto = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.neto_pagar) || 0),
            0
        );

        const totalRedondeo = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.redondeo) || 0),
            0
        );

        const totalNetoRedondeado = empleadosFiltrados.reduce(
            (acc, emp) => acc + (parseFloat(emp.neto_pagar_redondeado) || 0),
            0
        );

        const filaTotal = `
        <tr class="table-light fw-bold">
            <td colspan="3" class="text-center">
                TOTALES
            </td>

            <td colspan="5"></td>

            <td class="text-center">
                $ ${formatoMoneda(totalAguinaldo)}
            </td>

            <td class="text-center text-danger">
                - $ ${formatoMoneda(totalISR)}
            </td>

            <td class="text-center text-danger">
                - $ ${formatoMoneda(totalTarjeta)}
            </td>

            <td class="text-center text-success">
                $ ${formatoMoneda(totalNeto)}
            </td>

            <td class="text-center">
                $ ${formatoMoneda(totalRedondeo)}
            </td>

            <td class="text-center text-success">
                $ ${formatoMoneda(totalNetoRedondeado)}
            </td>
        </tr>
    `;

        tbody.append(filaTotal);
    }


    // Renderizar paginación
    renderizarPaginacion(empleadosFiltrados.length, paginaActual, limite);
}

/**
 * Renderizar los botones de paginación
 */
function renderizarPaginacion(totalEmpleados, paginaActual, limite) {
    if (limite === -1) {
        $('#paginacion_detalles').empty();
        return;
    }

    const totalPaginas = Math.ceil(totalEmpleados / limite);
    const paginacion = $('#paginacion_detalles');
    paginacion.empty();

    // Botón Inicio
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(1); return false;"><i class="bi bi-chevron-double-left me-1"></i>Inicio</a>
            </li>
        `);
    }

    // Botón anterior
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;"><i class="bi bi-chevron-left me-1"></i>Anterior</a>
            </li>
        `);
    }

    // Botones de páginas
    const rangoInicio = Math.max(1, paginaActual - 2);
    const rangoFin = Math.min(totalPaginas, paginaActual + 2);

    for (let i = rangoInicio; i <= rangoFin; i++) {
        const activa = i === paginaActual ? 'active' : '';
        paginacion.append(`
            <li class="page-item ${activa}">
                <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
            </li>
        `);
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">Siguiente<i class="bi bi-chevron-right ms-1"></i></a>
            </li>
        `);
    }

    // Botón Final
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${totalPaginas}); return false;">Final <i class="bi bi-chevron-double-right ms-1"></i></a>
            </li>
        `);
    }
}

/**
 * Cambiar a una página específica
 */
function cambiarPagina(nuevaPagina) {
    $('#pagina_actual_detalles').data('pagina', nuevaPagina);
    let empleado = $('#empleados').val();
    if (empleado) {
        empleado = JSON.parse(empleado);
        llenar_tabla_aguinaldo(empleado);
    } else {
        console.error("No se encontraron empleados para paginar.");
    }
    window.scrollTo(0, 0);
}

/**
 * Configurar eventos de filtrado
 */
$(document).ready(function () {
    // Evento de búsqueda
    $('#busqueda_detalles').on('keyup', function () {
        $('#pagina_actual_detalles').data('pagina', 1);
        let empleado = $('#empleados').val();
        if (empleado) {
            empleado = JSON.parse(empleado);
        }
        llenar_tabla_aguinaldo(empleado);
    });

    // Evento de filtro departamento
    $('#id_departamento').on('change', function () {
        $('#pagina_actual_detalles').data('pagina', 1);
        let empleado = $('#empleados').val();
        if (empleado) {
            empleado = JSON.parse(empleado);
        }
        llenar_tabla_aguinaldo(empleado);
    });

    // Evento de filtro empresa
    $('#id_empresa').on('change', function () {
        $('#pagina_actual_detalles').data('pagina', 1);
        let empleado = $('#empleados').val();
        if (empleado) {
            empleado = JSON.parse(empleado);
        }
        llenar_tabla_aguinaldo(empleado);
    });

    // Evento de límite por página
    $('#limite').on('change', function () {
        $('#pagina_actual_detalles').data('pagina', 1);
        let empleado = $('#empleados').val();
        if (empleado) {
            empleado = JSON.parse(empleado);
        }
        llenar_tabla_aguinaldo(empleado);
    });

    // Inicializar variable de página actual si no existe
    if (!$('#pagina_actual_detalles').length) {
        $('body').append('<div id="pagina_actual_detalles" data-pagina="1" style="display:none;"></div>');
    }
});