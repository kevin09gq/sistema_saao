
/**
 * Esta función llena la tabla de aguinaldos con los datos de jsonAguinaldo
 */
function llenar_tabla() {

    if (!jsonAguinaldo || !Array.isArray(jsonAguinaldo) || jsonAguinaldo.length === 0) {
        console.warn("No hay datos en jsonAguinaldo para mostrar en la tabla");
        $('#cuerpo-tabla-aguinaldo').html(
            '<tr><td colspan="6" class="text-center text-muted">No hay empleados disponibles</td></tr>'
        );
        return;
    }

    console.log("Llenando tabla con", jsonAguinaldo.length, "empleados");

    // Obtener los parámetros de filtrado
    const textoBusqueda = $('#busqueda').val().toLowerCase();
    const departamentoSeleccionado = $('#departamento').val();
    const limite = parseInt($('#limite').val()) || 10;
    let paginaActual = parseInt($('#pagina-actual').data('pagina')) || 1;

    // Filtrar empleados
    let empleadosFiltrados = jsonAguinaldo.slice(1).filter(emp => {
        // Filtro de búsqueda (clave, nombre y apellidos)
        const coincideBusqueda = !textoBusqueda ||
            (emp.clave_empleado && emp.clave_empleado.toLowerCase().includes(textoBusqueda)) ||
            (emp.nombre && emp.nombre.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_paterno && emp.ap_paterno.toLowerCase().includes(textoBusqueda)) ||
            (emp.ap_materno && emp.ap_materno.toLowerCase().includes(textoBusqueda));

        // Filtro de departamento por id
        const coincideDepartamento = departamentoSeleccionado === "-1" ||
            (parseInt(emp.id_departamento) === parseInt(departamentoSeleccionado));

        return coincideBusqueda && coincideDepartamento;
    });

    // Calcular paginación
    let inicio = 0;
    let fin = empleadosFiltrados.length;

    if (limite !== -1) {
        inicio = (paginaActual - 1) * limite;
        fin = inicio + limite;
    }

    const empleadosPagina = empleadosFiltrados.slice(inicio, fin);
    const totalPaginas = limite === -1 ? 1 : Math.ceil(empleadosFiltrados.length / limite);

    // Limpiar tabla
    const tbody = $('#cuerpo-tabla-aguinaldo');
    tbody.empty();

    if (empleadosPagina.length === 0) {
        tbody.html(
            '<tr><td colspan="6" class="text-center text-muted">No se encontraron resultados</td></tr>'
        );
        $('#paginacion').empty();
        return;
    }

    // Renderizar filas
    empleadosPagina.forEach((emp, index) => {
        const campoVacio = '<span class="text-secondary">-</span>'
        const nombreCompleto = `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.trim();
        const empresa = emp.id_empresa == 1 ? '<span class="badge rounded-pill text-bg-primary">SAAO</span>' : (emp.id_empresa == 2 ? '<span class="badge rounded-pill text-bg-secondary">SB</span>' : campoVacio);
        const sueldoDiario = parseFloat(emp.salario_diario) || 0;
        const diasTrabajados = emp.dias_trabajados || 0;
        const mesesTrabajados = emp.meses_trabajados || 0;
        const aguinaldo = emp.aguinaldo !== null && emp.aguinaldo !== undefined ? emp.aguinaldo : 0;
        const nss = emp.status_nss === 1 ? '<span class="badge rounded-pill text-bg-success">Sí</span>' : '<span class="badge rounded-pill text-bg-secondary">No</span>';
        const isr = emp.isr == 0 ? campoVacio :  `<span class="text-danger">- $${parseFloat(emp.isr).toFixed(2)}</span>`;
        const tarjeta = emp.tarjeta == 0 ? campoVacio : `<span class="text-danger">- $${parseFloat(emp.tarjeta).toFixed(2)}</span>`;
        
        // Calcular total deducciones (ISR + Tarjeta)
        const suma = (parseFloat(emp.isr) || 0) + (parseFloat(emp.tarjeta) || 0);
        const totalDeducciones = suma == 0 ? campoVacio : `<span class="text-danger">- $${parseFloat(suma).toFixed(2)}</span>`;

        const netoPagar = emp.neto_pagar < 0 ? 
                `<span class="text-danger">- $${parseFloat(emp.neto_pagar*-1).toFixed(2)}</span>` : 
                (  emp.neto_pagar > 0 ? `<span class="text-success">$${parseFloat(emp.neto_pagar).toFixed(2)}</span>` : campoVacio);

        const redondeado = diferenciaRedondeo(parseFloat(emp.neto_pagar));

        const total_redondeo = emp.neto_pagar + redondeado;

        const fila = `
            <tr data-id="${emp.id_empleado}" style="cursor:pointer;">
                <td class="text-center">${emp.clave_empleado || '-'}</td>
                <td>${nombreCompleto}</td>
                <td class="text-center fw-bold">${empresa}</td>
                <td class="text-center">${nss}</td>
                <td class="text-center">$${sueldoDiario.toFixed(2)}</td>
                <td class="text-center">${diasTrabajados}</td>
                <td class="text-center">${mesesTrabajados}</td>
                <td class="text-center">${aguinaldo === -1 ? '<span class="badge rounded-pill text-bg-danger">No Aplica</span>' : `$${parseFloat(aguinaldo).toFixed(2)}`}</td>
                <td class="text-center">${isr}</td>
                <td class="text-center">${tarjeta}</td>
                <td class="text-center fw-bold">${netoPagar}</td>
                <td class="text-center">${ estructuraDinero(redondeado) }</td>
                <td class="text-center fw-bold">${ estructuraDinero(total_redondeo) }</td>
            </tr>
        `;

        tbody.append(fila);
    });

    // Renderizar paginación
    renderizarPaginacion(empleadosFiltrados.length, paginaActual, limite);
}


/**
 * Renderizar los botones de paginación
 */
function renderizarPaginacion(totalEmpleados, paginaActual, limite) {
    if (limite === -1) {
        $('#paginacion').empty();
        return;
    }

    const totalPaginas = Math.ceil(totalEmpleados / limite);
    const paginacion = $('#paginacion');
    paginacion.empty();

    // Botón anterior
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">Anterior</a>
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
                <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">Siguiente</a>
            </li>
        `);
    }
}


/**
 * Cambiar a una página específica
 */
function cambiarPagina(nuevaPagina) {
    $('#pagina-actual').data('pagina', nuevaPagina);
    llenar_tabla();
    window.scrollTo(0, 0);
}


function estructuraDinero(cantidad) {
  switch (true) {
    case (cantidad < 0):
      return `<span class="text-danger">- $${parseFloat(cantidad*-1).toFixed(2)}</span>` ;
      break;
    case (cantidad === 0):
      return '<span class="text-secondary">-</span>';
      break;
    case (cantidad > 0):
      return `<span class="text-success">$${parseFloat(cantidad).toFixed(2)}</span>` ;
      break;
    default:
      return '<span class="text-secondary">-</span>';
  }
}


/**
 * Calcular la diferencia entre un valor y su redondeo
 * @param {Float} cantidad Cantidad que se desea redondear
 * @returns {Float} Diferencia entre el valor redondeado y el original
 */
function diferenciaRedondeo(cantidad) {
  // Redondear al entero más cercano
  const redondeado = Math.round(cantidad);

  // Calcular la diferencia
  const diferencia = redondeado - cantidad;

  return diferencia;
}

/**
 * Configurar eventos de filtrado
 */
$(document).ready(function () {
    // Evento de búsqueda
    $('#busqueda').on('keyup', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla();
    });

    // Evento de filtro departamento
    $('#departamento').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla();
    });

    // Evento de límite por página
    $('#limite').on('change', function () {
        $('#pagina-actual').data('pagina', 1);
        llenar_tabla();
    });

    // Inicializar variable de página actual si no existe
    if (!$('#pagina-actual').length) {
        $('body').append('<div id="pagina-actual" data-pagina="1" style="display:none;"></div>');
    }
});
