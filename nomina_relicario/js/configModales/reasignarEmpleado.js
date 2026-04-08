// reasignarEmpleado.js
// Funcionalidad para mover un empleado de un departamento a otro validando el tipo de horario

$(document).ready(function () {
    configurarEventosReasignar();
});

/**
 * Configura los eventos principales para la reasignación de empleados
 */
function configurarEventosReasignar() {
    
    // Botón para abrir el modal - Delegación de eventos con jQuery
    $(document).on('click', '#btn_abrir_modal_reasignar', function () {
        // Verificar si tenemos datos cargados
        if (!jsonNominaRelicario || !jsonNominaRelicario.departamentos) {
            Swal.fire('Error', 'No hay datos de nómina cargados.', 'error');
            return;
        }

        llenarSelectoresDelModal();
        $('#modalReasignarEmpleado').modal('show');
    });

    // Cuando cambia el empleado seleccionado
    $('#select_empleado_reasignar').on('change', function () {
        let claveEmpleado = $(this).val();
        mostrarInformacionDelEmpleado(claveEmpleado);
        verificarCompatibilidadHorarios();
    });

    // Cuando cambia el departamento de destino
    $('#select_depto_destino').on('change', function () {
        let idDepartamento = $(this).val();
         verificarCompatibilidadHorarios();
    });

    // Botón para ejecutar el movimiento
    $('#btn_confirmar_reasignacion').on('click', function () {
        solicitarConfirmacionMovimiento();
    });
}

/**
 * Llena los selectores de empleado y departamentos en el modal
 */
function llenarSelectoresDelModal() {
    let selectorEmpleados = $('#select_empleado_reasignar');
    let selectorDepartamentos = $('#select_depto_destino');

    // Limpiar selectores
    selectorEmpleados.empty().append('<option value="" disabled selected>Selecciona un empleado</option>');
    selectorDepartamentos.empty().append('<option value="" disabled selected>Selecciona un departamento</option>');

    // 1. Llenar lista de empleados agrupados por su departamento actual
    $.each(jsonNominaRelicario.departamentos, function (indice, departamento) {
        if (departamento.empleados && departamento.empleados.length > 0) {
            
            // Crear grupo visual para el departamento
            let grupoVisual = $(`<optgroup label="${departamento.nombre}">`);
            
            // Ordenar empleados por nombre para que sea fácil buscarlos
            let listaOrdenada = [...departamento.empleados].sort((a, b) => a.nombre.localeCompare(b.nombre));
            
            $.each(listaOrdenada, function (i, empleado) {
                grupoVisual.append(`<option value="${empleado.clave}">${empleado.nombre} (${empleado.clave})</option>`);
            });
            
            selectorEmpleados.append(grupoVisual);
        }
    });

    // 2. Llenar lista de departamentos disponibles
    $.each(jsonNominaRelicario.departamentos, function (indice, departamento) {
        // No permitir mover al departamento especial de "Corte" si existe (id 800)
        if (departamento.id_departamento == 800) return;
        
        selectorDepartamentos.append(`<option value="${departamento.id_departamento}">${departamento.nombre}</option>`);
    });

    // Resetear avisos visuales
    $('#info_empleado_actual, #alerta_reasignacion').hide();
    $('#btn_confirmar_reasignacion').prop('disabled', true);
}

/**
 * Muestra el departamento y horario actual del empleado seleccionado
 */
function mostrarInformacionDelEmpleado(claveBuscada) {
    if (!claveBuscada) return;

    let empleadoEncontrado = buscarEmpleadoEnTodaLaNomina(claveBuscada);
    if (!empleadoEncontrado) return;

    // Buscar a qué departamento pertenece
    let departamentoActual = jsonNominaRelicario.departamentos.find(dept => 
        dept.empleados.some(emp => emp.clave == claveBuscada)
    );
    
    $('#depto_actual_nombre').text(departamentoActual ? departamentoActual.nombre : 'S/D');
    
    
    $('#info_empleado_actual').show();
}

/**
 * Muestra el tipo de horario del departamento donde se quiere mover al empleado
 */


/**
 * Valida si el horario del empleado coincide con el del departamento nuevo
 */
function verificarCompatibilidadHorarios() {
    let claveEmpleado = $('#select_empleado_reasignar').val();
    let idDepartamentoDestino = $('#select_depto_destino').val();

    // Solo validar si ambos están seleccionados
    if (!claveEmpleado || !idDepartamentoDestino) {
        $('#btn_confirmar_reasignacion').prop('disabled', true);
        return;
    }

    let empleado = buscarEmpleadoEnTodaLaNomina(claveEmpleado);
    let departamentoObjetivo = jsonNominaRelicario.departamentos.find(d => d.id_departamento == idDepartamentoDestino);

    // Comparar tipos de horario (Regla de negocio principal)
    if (empleado.tipo_horario != departamentoObjetivo.tipo_horario) {
        $('#alerta_reasignacion').show();
        $('#btn_confirmar_reasignacion').prop('disabled', true);
    } else {
        $('#alerta_reasignacion').hide();
        $('#btn_confirmar_reasignacion').prop('disabled', false);
    }
}

/**
 * Busca un empleado por su clave en todos los departamentos del JSON global
 */
function buscarEmpleadoEnTodaLaNomina(claveABuscar) {
    let empleadoLocalizado = null;
    
    $.each(jsonNominaRelicario.departamentos, function (indice, departamento) {
        let busqueda = departamento.empleados.find(e => e.clave == claveABuscar);
        if (busqueda) {
            empleadoLocalizado = busqueda;
            return false; // Detener el bucle $.each
        }
    });
    
    return empleadoLocalizado;
}

/**
 * Muestra una alerta de SweetAlert para confirmar antes de mover al empleado
 */
function solicitarConfirmacionMovimiento() {
    Swal.fire({
        title: '¿Mover empleado?',
        text: "El empleado cambiará de departamento en la nómina actual.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, mover',
        cancelButtonText: 'Cancelar'
    }).then((respuesta) => {
        if (respuesta.isConfirmed) {
            moverEmpleadoNuevoDepartamento();
        }
    });
}

/**
 * Realiza el proceso técnico de mover al empleado de un array a otro
 */
function moverEmpleadoNuevoDepartamento() {
    let claveEmpleado = $('#select_empleado_reasignar').val();
    let idDestino = $('#select_depto_destino').val();

    let departamentoOrigen = null;
    let empleadoMover = null;

    // 1. Localizar al empleado y su departamento actual (Origen)
    $.each(jsonNominaRelicario.departamentos, function (indice, departamento) {
        let encontrado = departamento.empleados.find(e => e.clave == claveEmpleado);
        if (encontrado) {
            departamentoOrigen = departamento;
            empleadoMover = encontrado;
            return false;
        }
    });

    if (!empleadoMover) {
        Swal.fire('Error', 'No se encontró al empleado.', 'error');
        return;
    }

    // Si el destino es el mismo que el origen, simplemente cerramos
    if (departamentoOrigen.id_departamento == idDestino) {
        $('#modalReasignarEmpleado').modal('hide');
        return;
    }

    // 2. Localizar el departamento de destino
    let departamentoDestino = jsonNominaRelicario.departamentos.find(d => d.id_departamento == idDestino);
    if (!departamentoDestino) {
        Swal.fire('Error', 'Departamento destino no válido.', 'error');
        return;
    }

    // 3. QUITAR al empleado del departamento de origen
    departamentoOrigen.empleados = departamentoOrigen.empleados.filter(e => e.clave != claveEmpleado);

    // 4. ACTUALIZAR los datos del empleado
    empleadoMover.id_departamento = idDestino;

    // 5. AGREGAR al empleado al departamento de destino
    departamentoDestino.empleados.push(empleadoMover);

    // 6. REORDENAR la lista del departamento destino por nombre
    departamentoDestino.empleados.sort((a, b) => a.nombre.localeCompare(b.nombre));

    // 7. GUARDAR los cambios en el almacenamiento local
    if (typeof saveNomina === 'function') {
        saveNomina(jsonNominaRelicario);
    }

    // Limpiar y cerrar modal
    $('#modalReasignarEmpleado').modal('hide');

    // Notificar éxito
    Swal.fire('¡Movido!', `${empleadoMover.nombre} ahora está en ${departamentoDestino.nombre}`, 'success');

    // 8. REFRESCAR la tabla de la página
    if (typeof aplicarFiltrosActuales === 'function') {
        aplicarFiltrosActuales();
    } else {
        location.reload();
    }
}
