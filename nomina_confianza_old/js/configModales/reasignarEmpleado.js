// reasignarEmpleado.js
// Funcionalidad para mover un empleado de un departamento a otro

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
        if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
            Swal.fire('Error', 'No hay datos de nómina cargados.', 'error');
            return;
        }

        llenarSelectoresDelModal();
        $('#modalReasignarEmpleado').modal('show');
    });

    // Cuando cambia el empleado seleccionado
    $('#select_empleado_reasignar').on('change', function () {
        let valor = $(this).val(); // clave|id_empresa
        if (!valor) return;
        let [clave, idEmpresa] = valor.split('|');
        mostrarInformacionDelEmpleado(clave, idEmpresa);
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
    $.each(jsonNominaConfianza.departamentos, function (indice, departamento) {
        if (departamento.empleados && departamento.empleados.length > 0) {
            
            // Crear grupo visual para el departamento
            let grupoVisual = $(`<optgroup label="${departamento.nombre}">`);
            
            // Ordenar empleados por nombre para que sea fácil buscarlos
            let listaOrdenada = [...departamento.empleados].sort((a, b) => a.nombre.localeCompare(b.nombre));
            
            $.each(listaOrdenada, function (i, empleado) {
                selectorEmpleados.append(`<option value="${empleado.clave}|${empleado.id_empresa}">${empleado.nombre} (${empleado.clave})</option>`);
            });
            
            selectorEmpleados.append(grupoVisual);
        }
    });

    // 2. Llenar lista de departamentos disponibles
    $.each(jsonNominaConfianza.departamentos, function (indice, departamento) {
        // No permitir mover al departamento especial de "Corte" si existe (id 800)
        if (departamento.id_departamento == 800) return;
        
        selectorDepartamentos.append(`<option value="${departamento.id_departamento}">${departamento.nombre}</option>`);
    });

    // Resetear avisos visuales
    $('#info_empleado_actual').hide();
    $('#btn_confirmar_reasignacion').prop('disabled', true);
}

/**
 * Muestra el departamento actual del empleado seleccionado
 */
function mostrarInformacionDelEmpleado(claveBuscada, idEmpresaBuscada) {
    if (!claveBuscada || !idEmpresaBuscada) return;

    let empleadoEncontrado = buscarEmpleadoEnTodaLaNomina(claveBuscada, idEmpresaBuscada);
    if (!empleadoEncontrado) return;

    // Buscar a qué departamento pertenece
    let departamentoActual = jsonNominaConfianza.departamentos.find(dept => 
        dept.empleados.some(emp => emp.clave == claveBuscada && emp.id_empresa == idEmpresaBuscada)
    );
    
    $('#depto_actual_nombre').text(departamentoActual ? departamentoActual.nombre : 'S/D');
    
    
    $('#info_empleado_actual').show();
}

/**
 * Valida si el empleado y el departamento destino están seleccionados
 */
function verificarCompatibilidadHorarios() {
    let claveEmpleado = $('#select_empleado_reasignar').val();
    let idDepartamentoDestino = $('#select_depto_destino').val();

    // Habilitar botón solo si ambos están seleccionados
    if (claveEmpleado && idDepartamentoDestino) {
        $('#btn_confirmar_reasignacion').prop('disabled', false);
    } else {
        $('#btn_confirmar_reasignacion').prop('disabled', true);
    }
}

/**
 * Busca un empleado por su clave e id_empresa en todos los departamentos
 */
function buscarEmpleadoEnTodaLaNomina(claveABuscar, idEmpresaABuscar) {
    let empleadoLocalizado = null;
    
    $.each(jsonNominaConfianza.departamentos, function (indice, departamento) {
        let busqueda = departamento.empleados.find(e => e.clave == claveABuscar && e.id_empresa == idEmpresaABuscar);
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
    let valorEmpleado = $('#select_empleado_reasignar').val();
    let [claveEmpleado, idEmpresaEmpleado] = valorEmpleado.split('|');
    let idDestino = $('#select_depto_destino').val();

    let departamentoOrigen = null;
    let empleadoMover = null;

    // 1. Localizar al empleado y su departamento actual (Origen)
    $.each(jsonNominaConfianza.departamentos, function (indice, departamento) {
        let encontrado = departamento.empleados.find(e => e.clave == claveEmpleado && e.id_empresa == idEmpresaEmpleado);
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
    let departamentoDestino = jsonNominaConfianza.departamentos.find(d => d.id_departamento == idDestino);
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
        saveNomina(jsonNominaConfianza);
    }

    // Limpiar y cerrar modal
    $('#modalReasignarEmpleado').modal('hide');

    // Notificar éxito
    Swal.fire('¡Movido!', `${empleadoMover.nombre} ahora está en ${departamentoDestino.nombre}`, 'success');

  // Actualizar la tabla manteniendo la paginación actual
        if (typeof aplicarFiltrosConfianza === 'function') {
            aplicarFiltrosConfianza(paginaActualNomina);
        }

}
