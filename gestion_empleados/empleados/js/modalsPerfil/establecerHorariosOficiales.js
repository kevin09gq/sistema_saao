$(document).ready(function () {
    guardarHorariosOficiales();

    copiarHorariosOficialesATodosLosDias();
});

//====================================================
// FUNCIÓN PARA ABRIR EL MODAL DE HORARIOS OFICIALES
//====================================================

function abrirModalHorariosOficiales(idEmpleado) {

    // Guardar el ID del empleado en el formulario
    $('#formHorariosOficialesEmpleado').data('id_empleado', idEmpleado);

    // Obtener y mostrar el nombre del empleado en el pie del modal
    const emp = (typeof empleados !== 'undefined' && Array.isArray(empleados))
        ? empleados.find(e => e.id_empleado == idEmpleado)
        : null;
    const nombreCompleto = emp
        ? `${emp.nombre || ''} ${emp.ap_paterno || ''} ${emp.ap_materno || ''}`.replace(/\s+/g, ' ').trim()
        : '---';
    $('#nombreEmpleadoModalHorariosOficiales').text(nombreCompleto);

    obtenerHorariosOficiales(idEmpleado);

    aplicarPermisosHorariosOficiales();

    // Abrir el modal
    $('#modalHorariosOficiales').modal('show');
}

//====================================================
// FUNCIÓN PARA OBTENER LOS HORARIOS OFICIALES DE UN EMPLEADO
//====================================================

function obtenerHorariosOficiales(idEmpleado) {

    $.ajax({
        type: "POST",
        url: "../php/infoHorariosOficiales.php",
        data: {
            accion: "obtenerHorariosOficiales",
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
            limpiarHorariosOficiales();

            // si hay horarios oficiales, llenar los inputs
            if (response.horarios_oficiales && Array.isArray(response.horarios_oficiales)) {
                response.horarios_oficiales.forEach(horario => {
                    llenarHorarioOficialDia(horario);
                });
            }
        },

        error: function (xhr, status, error) {
            console.error("Error al obtener los horarios oficiales:", error);
            console.error(xhr.responseText);
        }
    });
}

//====================================================
// FUNCIÓN PARA LIMPIAR TODOS LOS INPUTS DE HORARIOS OFICIALES
//====================================================

function limpiarHorariosOficiales() {
    const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

    dias.forEach(dia => {
        $(`#horarioOficial${dia}_entrada`).val('');
        $(`#horarioOficial${dia}_salida_comida`).val('');
        $(`#horarioOficial${dia}_entrada_comida`).val('');
        $(`#horarioOficial${dia}_salida`).val('');
    });
}

//====================================================
// FUNCIÓN PARA LLENAR LOS INPUTS DE UN DÍA ESPECÍFICO
//====================================================

function llenarHorarioOficialDia(horario) {
    const dia = horario.dia;

    // Normalizar el nombre del día para que coincida con los IDs
    const diaNormalizado = normalizarNombreDiaOficial(dia);

    if (!diaNormalizado) return;

    // Llenar los inputs con los valores del horario (sin descanso)
    $(`#horarioOficial${diaNormalizado}_entrada`).val(horario.entrada || '');
    $(`#horarioOficial${diaNormalizado}_salida_comida`).val(horario.salida_comida || '');
    $(`#horarioOficial${diaNormalizado}_entrada_comida`).val(horario.entrada_comida || '');
    $(`#horarioOficial${diaNormalizado}_salida`).val(horario.salida || '');
}

//====================================================
// FUNCIÓN PARA GUARDAR LOS HORARIOS OFICIALES DEL EMPLEADO
//====================================================

function guardarHorariosOficiales() {

    $(document).on('click', '#btnGuardarHorariosOficiales', function () {
        const idEmpleado = $('#formHorariosOficialesEmpleado').data('id_empleado');

        // Recopilar todos los horarios oficiales de los inputs
        const horariosOficiales = recopilarHorariosOficiales();

        // Validar que haya al menos un horario oficial
        if (!validarHorariosOficiales(horariosOficiales)) {
            return;
        }

        // Hacer la llamada AJAX para guardar
        $.ajax({
            type: "POST",
            url: "../php/infoHorariosOficiales.php",
            data: {
                accion: "guardarHorariosOficiales",
                id_empleado: idEmpleado,
                horarios_oficiales: JSON.stringify(horariosOficiales)
            },
            dataType: "json",

            success: function (response) {
                if (response.success) {
                    mostrarAlerta('success', 'Éxito', response.mensaje);

                    // Cerrar el modal
                    $('#modalHorariosOficiales').modal('hide');
                } else {
                    mostrarAlerta('error', 'Error', response.mensaje);
                }
            },

            error: function (xhr, status, error) {
                console.error("Error al guardar horarios oficiales:", error);
                console.error(xhr.responseText);
                mostrarAlerta('error', 'Error', 'Error al guardar los horarios oficiales.');
            }
        });
    });
}

//====================================================
// FUNCIÓN PARA COPIAR HORARIOS OFICIALES A TODOS LOS DÍAS
//====================================================

function copiarHorariosOficialesATodosLosDias() {
    $(document).on('click', '#btnCopiarHorariosOficiales', function () {


        // Obtener los valores de los inputs de copiar
        const entrada = $('#copiarEntradaOficial').val();
        const salidaComida = $('#copiarSalidaComidaOficial').val();
        const entradaComida = $('#copiarEntradaComidaOficial').val();
        const salida = $('#copiarSalidaOficial').val();

        // Validar que al menos tenga la entrada y salida
        if (!entrada || !salida) {
            mostrarAlerta('error', 'Error', 'Debe especificar al menos la entrada y salida para copiar.');
            return;
        }

        // Días a los que se copiará (todos menos Domingo)
        const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

        // Copiar los valores a cada día
        dias.forEach(dia => {
            $(`#horarioOficial${dia}_entrada`).val(entrada);
            $(`#horarioOficial${dia}_salida_comida`).val(salidaComida);
            $(`#horarioOficial${dia}_entrada_comida`).val(entradaComida);
            $(`#horarioOficial${dia}_salida`).val(salida);
        });

        mostrarAlerta('success', 'Éxito', 'Horarios oficiales copiados a todos los días (excepto Domingo).');
    });
}


//====================================================
// FUNCIÓN PARA ELIMINAR HORARIO OFICIAL DE UN DÍA
//====================================================

function eliminarHorarioOficial(dia) {
    const diaNormalizado = normalizarNombreDiaOficial(dia);

    if (!diaNormalizado) return;

    // Mostrar confirmación con SweetAlert
    Swal.fire({
        title: '¿Está seguro?',
        text: '¿Desea limpiar el horario oficial de ' + dia + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, limpiar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar los inputs del día (sin descanso)
            $(`#horarioOficial${diaNormalizado}_entrada`).val('');
            $(`#horarioOficial${diaNormalizado}_salida_comida`).val('');
            $(`#horarioOficial${diaNormalizado}_entrada_comida`).val('');
            $(`#horarioOficial${diaNormalizado}_salida`).val('');

            mostrarAlerta('success', 'Éxito', 'Horario oficial de ' + dia + ' limpiado correctamente.');
        }
    });
}


//====================================================
// FUNCIÓN PARA NORMALIZAR EL NOMBRE DEL DÍA
//====================================================

function normalizarNombreDiaOficial(dia) {
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
// FUNCIÓN PARA RECOPILAR TODOS LOS HORARIOS OFICIALES
//====================================================

function recopilarHorariosOficiales() {
    const dias = [
        { nombre: 'LUNES', input: 'Lunes' },
        { nombre: 'MARTES', input: 'Martes' },
        { nombre: 'MIÉRCOLES', input: 'Miercoles' },
        { nombre: 'JUEVES', input: 'Jueves' },
        { nombre: 'VIERNES', input: 'Viernes' },
        { nombre: 'SÁBADO', input: 'Sabado' },
        { nombre: 'DOMINGO', input: 'Domingo' }
    ];

    const horariosOficiales = [];

    dias.forEach(dia => {
        const entrada = $(`#horarioOficial${dia.input}_entrada`).val();
        const salidaComida = $(`#horarioOficial${dia.input}_salida_comida`).val();
        const entradaComida = $(`#horarioOficial${dia.input}_entrada_comida`).val();
        const salida = $(`#horarioOficial${dia.input}_salida`).val();

        horariosOficiales.push({
            dia: dia.nombre,
            entrada: entrada,
            salida_comida: salidaComida,
            entrada_comida: entradaComida,
            salida: salida
        });
    });

    return horariosOficiales;
}

//====================================================
// FUNCIÓN PARA VALIDAR HORARIOS OFICIALES
//====================================================

function validarHorariosOficiales(horariosOficiales) {
    // Validar que al menos un día tenga horario oficial configurado
    const diasConHorarioOficial = horariosOficiales.filter(h =>
        h.entrada || h.salida || h.salida_comida || h.entrada_comida
    );

    if (diasConHorarioOficial.length === 0) {
        mostrarAlerta('error', 'Error', 'Debe configurar al menos un día con horario oficial.');
        return false;
    }

    return true;
}

