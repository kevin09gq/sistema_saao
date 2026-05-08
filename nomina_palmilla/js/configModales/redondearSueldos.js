$(document).ready(function () {
    // Evento para abrir el modal
    $('#btn_redondear_sueldos').on('click', function () {
        cargarEmpleadosRedondeo();
        $('#modalRedondeoSueldos').modal('show');
    });

    // Checkbox para seleccionar/deseleccionar todos
    $('#check-all-redondeo').on('change', function () {
        $('.check-empleado-redondeo').prop('checked', $(this).is(':checked'));
    });

    // Aplicar redondeo masivo
    $('#btn-aplicar-redondeo-masivo').on('click', function () {
        aplicarRedondeoMasivo();
    });

    // Quitar redondeo a todos
    $('#btn-quitar-redondeo-todos').on('click', function () {
        quitarRedondeoTodos();
    });
});

//======================================================
// CARGAR LA LISTA DE EMPLEADOS CON DECIMALES EN TOTAL A COBRAR
//======================================================
function cargarEmpleadosRedondeo() {
    if (!jsonNominaPalmilla || !jsonNominaPalmilla.departamentos) return;

    const tbody = $('#tbody-redondeo-empleados');
    tbody.empty();

    let totalFiltrados = 0;

    jsonNominaPalmilla.departamentos.forEach(depto => {
        // Filtrar empleados del departamento que tengan mostrar: true
        const empleadosDecimales = depto.empleados.filter(emp => emp.mostrar !== false);

        if (empleadosDecimales.length === 0) return;
        totalFiltrados += empleadosDecimales.length;

        // Fila de encabezado de departamento (estilo solicitado)
        tbody.append(`
            <tr class="table-secondary">
                <td colspan="6" class="fw-bold">
                    <i class="bi bi-building"></i> ${depto.nombre} 
                    <small class="fw-normal text-muted ms-1">(${empleadosDecimales.length} empleados)</small>
                </td>
            </tr>
        `);

        // Ordenar por nombre
        empleadosDecimales.sort((a, b) => a.nombre.localeCompare(b.nombre));

        empleadosDecimales.forEach(empleado => {
            const sueldoActual = parseFloat(empleado.total_cobrar) || 0;
            const sueldoRedondeado = Math.round(sueldoActual);
            const isRedondeado = empleado.redondeo_activo === true;

            const fila = `
                <tr>
                    <td class="text-center">
                        <div class="form-check d-flex justify-content-center">
                            <input class="form-check-input check-empleado-redondeo" type="checkbox" 
                                   data-clave="${empleado.clave}" 
                                   ${isRedondeado ? 'checked' : ''}>
                        </div>
                    </td>
                    <td class="text-center">${empleado.clave}</td>
                    <td>${empleado.nombre}</td>
                    <td class="text-end fw-bold">${formatearMonedaSimple(sueldoActual)}</td>
                    <td class="text-end fw-bold text-primary">${formatearMonedaSimple(sueldoRedondeado)}</td>
                    <td class="text-center">
                        ${isRedondeado
                    ? '<span class="badge bg-success-subtle text-success border border-success">Redondeado</span>'
                    : '<span class="badge bg-light text-muted border">Sin Redondear</span>'}
                    </td>
                </tr>
            `;
            tbody.append(fila);
        });
    });

    // Actualizar contador
    $('#total-empleados-redondeo').text(totalFiltrados);
}

//======================================================
// APLICAR REDONDEO MASIVO A LOS EMPLEADOS SELECCIONADOS
//======================================================
function aplicarRedondeoMasivo() {
    const seleccionados = [];
    $('.check-empleado-redondeo:checked').each(function () {
        seleccionados.push($(this).data('clave'));
    });

    if (seleccionados.length === 0 && !confirm('¿Desea quitar el redondeo a todos los empleados?')) {
        return;
    }

    // Iterar por todo el JSON y actualizar
    jsonNominaPalmilla.departamentos.forEach(depto => {
        depto.empleados.forEach(empleado => {
            if (empleado.mostrar === false) return;

            // Verificar si el empleado está en la lista de seleccionados por su clave y id_empresa
            const claveStr = String(empleado.clave);
            const idEmpresaStr = String(empleado.id_empresa);
            const debeRedondear = seleccionados.some(c => String(c) === claveStr && String(empleado.id_empresa) === idEmpresaStr);

            if (debeRedondear) {
                empleado.redondeo_activo = true;
                // El cálculo real de 'redondeo' y 'total_cobrar' lo hace mostrarDatosTabla -> calcularTotalCobrar
            } else {
                empleado.redondeo_activo = false;
                empleado.redondeo = 0;
            }
        });
    });

    // Guardar en localStorage
    if (typeof saveNomina === 'function') {
        saveNomina();
    }

    // Cerrar modal y refrescar tabla principal
    $('#modalRedondeoSueldos').modal('hide');

    // Actualizar la tabla manteniendo el filtrado, búsqueda y paginación actual
    aplicarFiltrosActuales();

    // Mostrar mensaje de éxito Alerta de switch alert 
    swal.fire({
        title: '¡Redondeo aplicado!',
        text: `Exito`,
        icon: 'success'
    });

}

//======================================================
// QUITAR REDONDEO A TODOS LOS EMPLEADOS SELECCIONADOS
//======================================================

function quitarRedondeoTodos() {
    swal.fire({
        title: '¿Estás seguro?',
        text: "Se desactivará el redondeo para todos los empleados de esta nómina.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, quitar todo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            if (!jsonNominaPalmilla || !jsonNominaPalmilla.departamentos) return;

            jsonNominaPalmilla.departamentos.forEach(depto => {
                depto.empleados.forEach(empleado => {
                    empleado.redondeo_activo = false;
                    empleado.redondeo = 0;
                });
            });

            // Guardar cambios
            if (typeof saveNomina === 'function') saveNomina();

            // Refrescar y cerrar
            $('#modalRedondeoSueldos').modal('hide');
            // Actualizar la tabla manteniendo el filtrado, búsqueda y paginación actual
            aplicarFiltrosActuales();

            swal.fire(
                '¡Eliminado!',
                'Se ha quitado el redondeo a todos los empleados.',
                'success'
            );
        }
    });
}

//======================================================
// FORMATEADOR SIMPLE PARA EL MODAL
//======================================================
function formatearMonedaSimple(valor) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(valor);
}
