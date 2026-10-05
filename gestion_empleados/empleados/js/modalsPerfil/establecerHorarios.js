$(document).ready(function () {
    guardarHorarios();

    copiarHorariosATodosLosDias();
});

//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE HORARIOS
//====================================================

function abrirModalHorarios(idEmpleado) {

    // Guardar el ID del empleado en el formulario
    $('#formHorariosEmpleado').data('id_empleado', idEmpleado);

    obtenerHorarios(idEmpleado);

    aplicarPermisosHorariosReloj8Hrs();
    
    // Abrir el modal
    $('#modalHorarios').modal('show');
}

//====================================================
// FUNCIÓN PARA OBTENER LOS HORARIOS DE UN EMPLEADO
//====================================================

function obtenerHorarios(idEmpleado) {

    $.ajax({
        type: "POST",
        url: "../php/infoHorarios.php",
        data: {
            accion: "obtenerHorarios",
            id_empleado: idEmpleado
        },
        dataType: "json",

        success: function (response) {

            // validar si la consulta fue exitosa
            if (!response.success) {
                console.error(response.mensaje);
                return;
            }

            // limpiar todos los inputs
            limpiarHorarios();

            // si hay horarios, llenar los inputs
            if (response.horarios && Array.isArray(response.horarios)) {
                response.horarios.forEach(horario => {
                    llenarHorarioDia(horario);
                });
            }
        },

        error: function (xhr, status, error) {
            console.error("Error al obtener los horarios:", error);
            console.error(xhr.responseText);
        }
    });
}

//====================================================
// FUNCIÓN PARA LIMPIAR TODOS LOS INPUTS DE HORARIOS
//====================================================

function limpiarHorarios() {
    const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

    dias.forEach(dia => {
        $(`#horario${dia}_entrada`).val('');
        $(`#horario${dia}_salida_comida`).val('');
        $(`#horario${dia}_entrada_comida`).val('');
        $(`#horario${dia}_salida`).val('');
        $(`#horario${dia}_descanso`).prop('checked', false);
    });
}

//====================================================
// FUNCIÓN PARA LLENAR LOS INPUTS DE UN DÍA ESPECÍFICO
//====================================================

function llenarHorarioDia(horario) {
    const dia = horario.dia;

    // Normalizar el nombre del día para que coincida con los IDs
    const diaNormalizado = normalizarNombreDia(dia);

    if (!diaNormalizado) return;

    // Llenar los inputs con los valores del horario
    $(`#horario${diaNormalizado}_entrada`).val(horario.entrada || '');
    $(`#horario${diaNormalizado}_salida_comida`).val(horario.salida_comida || '');
    $(`#horario${diaNormalizado}_entrada_comida`).val(horario.entrada_comida || '');
    $(`#horario${diaNormalizado}_salida`).val(horario.salida || '');

    // El descanso viene como "0" o "1" en el JSON, convertir a boolean
    const descanso = horario.descanso === "1" || horario.descanso === true;
    $(`#horario${diaNormalizado}_descanso`).prop('checked', descanso);
}

//====================================================
// FUNCIÓN PARA GUARDAR LOS HORARIOS DEL EMPLEADO
//====================================================

function guardarHorarios() {

    $(document).on('click', '#btnGuardarHorarios', function () {
        const idEmpleado = $('#formHorariosEmpleado').data('id_empleado');

        // Recopilar todos los horarios de los inputs
        const horarios = recopilarHorarios();

        // Validar que haya al menos un horario
        if (!validarHorarios(horarios)) {
            return;
        }

        // Hacer la llamada AJAX para guardar
        $.ajax({
            type: "POST",
            url: "../php/infoHorarios.php",
            data: {
                accion: "guardarHorarios",
                id_empleado: idEmpleado,
                horarios: JSON.stringify(horarios)
            },
            dataType: "json",

            success: function (response) {
                if (response.success) {
                    mostrarAlerta('success', 'Éxito', response.mensaje);

                    // Cerrar el modal
                    $('#modalHorarios').modal('hide');
                } else {
                    mostrarAlerta('error', 'Error', response.mensaje);
                }
            },

            error: function (xhr, status, error) {
                console.error("Error al guardar horarios:", error);
                console.error(xhr.responseText);
                mostrarAlerta('error', 'Error', 'Error al guardar los horarios.');
            }
        });
    });

}

//====================================================
// FUNCIÓN PARA COPIAR HORARIOS A TODOS LOS DÍAS
//====================================================

function copiarHorariosATodosLosDias() {
    $(document).on('click', '#btnCopiarHorarios', function () {
        // Obtener los valores de los inputs de copiar
        const entrada = $('#copiarEntrada').val();
        const salidaComida = $('#copiarSalidaComida').val();
        const entradaComida = $('#copiarEntradaComida').val();
        const salida = $('#copiarSalida').val();

        // Validar que al menos tenga la entrada y salida
        if (!entrada || !salida) {
            mostrarAlerta('error', 'Error', 'Debe especificar al menos la entrada y salida para copiar.');
            return;
        }

        // Días a los que se copiará (todos menos Domingo)
        const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

        // Copiar los valores a cada día
        dias.forEach(dia => {
            $(`#horario${dia}_entrada`).val(entrada);
            $(`#horario${dia}_salida_comida`).val(salidaComida);
            $(`#horario${dia}_entrada_comida`).val(entradaComida);
            $(`#horario${dia}_salida`).val(salida);
            // No copiamos el descanso, se mantiene el valor actual
        });

        mostrarAlerta('success', 'Éxito', 'Horarios copiados a todos los días (excepto Domingo).');
    });
}

//====================================================
// FUNCIÓN PARA ELIMINAR HORARIO DE UN DÍA
//====================================================

function eliminarHorario(dia) {
    const diaNormalizado = normalizarNombreDia(dia);

    if (!diaNormalizado) return;

    // Mostrar confirmación con SweetAlert
    Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea limpiar el horario de ' + dia + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar los inputs del día
            $(`#horario${diaNormalizado}_entrada`).val('');
            $(`#horario${diaNormalizado}_salida_comida`).val('');
            $(`#horario${diaNormalizado}_entrada_comida`).val('');
            $(`#horario${diaNormalizado}_salida`).val('');
            $(`#horario${diaNormalizado}_descanso`).prop('checked', false);

            mostrarAlerta('success', 'Éxito', 'Horario de ' + dia + ' limpiado correctamente.');
        }
    });
}


//====================================================
// FUNCIÓN PARA NORMALIZAR EL NOMBRE DEL DÍA
//====================================================

function normalizarNombreDia(dia) {
    const mapeoDias = {
        'LUNES': 'Lunes',
        'MARTES': 'Martes',
        'MIÉRCOLES': 'Miercoles',
        'MIERCOLES': 'Miercoles',
        'JUEVES': 'Jueves',
        'VIERNES': 'Viernes',
        'SÁBADO': 'Sabado',
        'SABADO': 'Sabado',
        'DOMINGO': 'Domingo'
    };

    return mapeoDias[dia.toUpperCase()] || dia;
}


//====================================================
// FUNCIÓN PARA RECOPILAR TODOS LOS HORARIOS
//====================================================

function recopilarHorarios() {
    const dias = [
        { nombre: 'Lunes', input: 'Lunes' },
        { nombre: 'MARTES', input: 'Martes' },
        { nombre: 'MIÉRCOLES', input: 'Miercoles' },
        { nombre: 'JUEVES', input: 'Jueves' },
        { nombre: 'VIERNES', input: 'Viernes' },
        { nombre: 'SÁBADO', input: 'Sabado' },
        { nombre: 'DOMINGO', input: 'Domingo' }
    ];

    const horarios = [];

    dias.forEach(dia => {
        const entrada = $(`#horario${dia.input}_entrada`).val();
        const salidaComida = $(`#horario${dia.input}_salida_comida`).val();
        const entradaComida = $(`#horario${dia.input}_entrada_comida`).val();
        const salida = $(`#horario${dia.input}_salida`).val();
        const descanso = $(`#horario${dia.input}_descanso`).is(':checked') ? '1' : '0';

        horarios.push({
            dia: dia.nombre,
            entrada: entrada,
            salida_comida: salidaComida,
            entrada_comida: entradaComida,
            salida: salida,
            descanso: descanso
        });
    });

    return horarios;
}

//====================================================
// FUNCIÓN PARA VALIDAR HORARIOS
//====================================================

function validarHorarios(horarios) {
    // Validar que al menos un día tenga horario configurado
    const diasConHorario = horarios.filter(h =>
        h.entrada || h.salida || h.salida_comida || h.entrada_comida
    );

    if (diasConHorario.length === 0) {
        mostrarAlerta('error', 'Error', 'Debe configurar al menos un día con horario.');
        return false;
    }

    return true;
}


