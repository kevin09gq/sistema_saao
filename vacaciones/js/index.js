let todosLosEmpleados = [];
let empleadosFiltrados = [];
let paginaActual = 1;
const filasPorPagina = 5;

$(document).ready(function () {
    // Inicialización del módulo
    obtenerAreas();
    obtenerDepartamentos();
    obtenerEmpleados();
    inicializarEventosFiltrado();
});


//==============================
// OBTIENE LAS AREAS PARA MOSTRAR EN EL SELECT
//==============================
function obtenerAreas() {
    $.post('../php/filtrado.php', { action: 'obtenerAreas' }, function (areas) {
        let opciones = '<option value="" selected>Todas las Áreas</option>';
        $.each(areas, function (i, area) {
            opciones += `<option value="${area.id_area}">${area.nombre_area}</option>`;
        });
        $('#selectArea').html(opciones);
    }, 'json');
}

//==============================
// OBTIENE LOS DEPARTAMENTOS (OPCIONALMENTE FILTRADOS POR ÁREA)
//==============================
function obtenerDepartamentos(idArea = '') {
    $.post('../php/filtrado.php', { action: 'obtenerDepartamentos', id_area: idArea }, function (departamentos) {
        let opciones = '<option value="" selected>Todos los Departamentos</option>';
        $.each(departamentos, function (i, depto) {
            opciones += `<option value="${depto.id_departamento}">${depto.nombre_departamento}</option>`;
        });
        $('#selectDepartamento').html(opciones);
    }, 'json');
}

//==============================
// OBTIENE LA INFORMACION BASE DE TODOS LOS EMPLEADOS
//==============================
function obtenerEmpleados() {
    $.post('../php/infoEmpleados.php', { action: 'obtenerEmpleados' }, function (respuesta) {
        todosLosEmpleados = respuesta;
        empleadosFiltrados = [...respuesta]; // Al inicio, filtrados son todos
        paginarEmpleados(1);
    }, 'json');
}


//==============================
// CARGA LOS DATOS DE LOS EMPLEADOS EN EL CUERPO DE LA TABLA
//==============================
function cargarDatos(empleados, indiceInicio) {
    let $cuerpoTabla = $('#tbodyVacaciones').empty();

    if (empleados.length === 0) {
        $cuerpoTabla.append('<tr><td colspan="7" class="text-center text-muted p-4">No se encontraron resultados</td></tr>');
        return;
    }

    $.each(empleados, function (indice, emp) {
        let iniciales = (emp.nombre.charAt(0) + (emp.ap_paterno ? emp.ap_paterno.charAt(0) : '')).toUpperCase();
        
        // Determinar badge de estatus
        let statusBadge = (emp.id_status == 1) 
            ? '<span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>'
            : '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Inactivo</span>';

        let fila = `
        <tr>
            <td>${indiceInicio + indice + 1}</td>
            <td><span class="fw-bold">${emp.clave_empleado}</span></td>
            <td>
                <div class="emp-info-cell">
                    <div class="emp-initials">${iniciales}</div>
                    <div>
                        <div class="emp-name-main">${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}</div>
                        <div class="emp-dept-label">${emp.nombre_departamento || 'Sin asignar'}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="anniversary-badge">
                    <i class="bi bi-calendar-check"></i> ${formatearFecha(emp.fecha_ingreso_final)}
                </div>
            </td>
            <td><span class="badge bg-light text-dark border">${emp.antiguedad}</span></td>
            <td class="text-center">${statusBadge}</td>
            <td class="text-center">
                <div class="btn-group" role="group">
                    <button class="btn-action" onclick="verKardex(${emp.id_empleado})" title="Ver Kardex de Vacaciones">
                        <i class="bi bi-clipboard2-data"></i> Ver Kardex
                    </button>
                    <button class="btn-action" onclick="agregarPrima(${emp.id_empleado})" title="Agregar Prima Vacacional">
                        <i class="bi bi-plus-circle"></i> Detalle Pago
                    </button>
                </div>
            </td>
        </tr>`;
        $cuerpoTabla.append(fila);
    });
}

//==============================
// APLICA LOS FILTROS DE BÚSQUEDA, ÁREA Y DEPARTAMENTO
//==============================
function aplicarFiltros() {
    let textoBusqueda = $('#inputBusqueda').val().toLowerCase();
    let idArea = $('#selectArea').val();
    let idDepto = $('#selectDepartamento').val();

    // Filtrar el arreglo principal localmente
    empleadosFiltrados = todosLosEmpleados.filter(empleado => {
        // Concatenar nombre completo para buscar mejor
        let nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno} ${empleado.ap_materno}`.toLowerCase();
        
        let coincideTexto = nombreCompleto.includes(textoBusqueda) || 
                            empleado.clave_empleado.toLowerCase().includes(textoBusqueda);
        
        let coincideArea = (idArea === "" || empleado.id_area == idArea);
        let coincideDepto = (idDepto === "" || empleado.id_departamento == idDepto);

        return coincideTexto && coincideArea && coincideDepto;
    });

    // Siempre regresar a la página 1 al filtrar
    paginarEmpleados(1);
}

//==============================
// INICIALIZA LOS EVENTOS DE LOS FILTROS Y BOTONES
//==============================
function inicializarEventosFiltrado() {
    // Eventos para filtros en tiempo real
    $('#inputBusqueda').on('keyup', aplicarFiltros);
    
    $('#selectArea').on('change', function() {
        let idArea = $(this).val();
        obtenerDepartamentos(idArea); // Recargar departamentos según el área
        aplicarFiltros();
    });

    $('#selectDepartamento').on('change', aplicarFiltros);

    // Botón para limpiar filtros
    $('#btnLimpiar').on('click', function () {
        $('#inputBusqueda').val('');
        $('#selectArea').val('');
        $('#selectDepartamento').val('');
        obtenerDepartamentos(); // Resetear a todos los departamentos
        aplicarFiltros();
    });
}

//==============================
// GESTIONA LA PAGINACIÓN DE LOS DATOS
//==============================
function paginarEmpleados(numeroPagina) {
    paginaActual = numeroPagina;
    
    let inicio = (paginaActual - 1) * filasPorPagina;
    let fin = inicio + filasPorPagina;
    let empleadosPagina = empleadosFiltrados.slice(inicio, fin);

    cargarDatos(empleadosPagina, inicio);
    dibujarBotonesPaginacion();
}

//==============================
// DIBUJA LOS BOTONES DE NÚMEROS Y NAVEGACIÓN
//==============================
function dibujarBotonesPaginacion() {
    let totalPaginas = Math.ceil(empleadosFiltrados.length / filasPorPagina);
    let $listaPaginacion = $('#paginationList').empty();

    // Botón Anterior
    $listaPaginacion.append(`
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="paginarEmpleados(${paginaActual - 1})">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>`);

    // Botones de Números (Lógica simple)
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            $listaPaginacion.append(`
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" onclick="paginarEmpleados(${i})">${i}</a>
                </li>`);
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            $listaPaginacion.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
        }
    }

    // Botón Siguiente
    $listaPaginacion.append(`
        <li class="page-item ${paginaActual === totalPaginas || totalPaginas === 0 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="paginarEmpleados(${paginaActual + 1})">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>`);

    actualizarTextoInformativo();
}

//==============================
// ACTUALIZA EL TEXTO INFORMATIVO AL PIE DE LA TABLA
//==============================
function actualizarTextoInformativo() {
    let total = empleadosFiltrados.length;
    let desde = total === 0 ? 0 : (paginaActual - 1) * filasPorPagina + 1;
    let hasta = Math.min(paginaActual * filasPorPagina, total);
    
    $('#infoPaginacion').html(`Mostrando <strong>${desde}</strong> a <strong>${hasta}</strong> de <strong>${total}</strong> empleados`);
}

//==============================
// ENVIA EL ID DEL EMPLEADO A LA PÁGINA DE KARDEX PARA MOSTRAR SU INFORMACIÓN DETALLADA
//==============================
function verKardex(idEmpleado) {
    window.location.href = `kardex.php?id=${idEmpleado}`;
}

//==============================
// ENVIA EL ID DEL EMPLEADO A LA PÁGINA DE PRIMA VACACIONAL
//==============================
function agregarPrima(idEmpleado) {
    window.location.href = `prima_vacacional.php?id=${idEmpleado}`;
}

//==============================
// CONFIGURACION DEL CALENDARIO DEL MODAL
//==============================

//==============================
// FUNCIONES AUXILIARES
//==============================
function formatearFecha(fechaTexto) {
    if (!fechaTexto) return '---';
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    let fecha = new Date(fechaTexto);
    return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}


