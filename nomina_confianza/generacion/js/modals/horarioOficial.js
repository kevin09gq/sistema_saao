// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS PARA EL HORARIO
let empleadosSeleccionadosHorario = [];

$(document).ready(function () {

    abrirModalHorarioOficial();

    buscadorEmpleadosHorario();

    seleccionarTodosEmpleadosHorario();

    seleccionarDepartamentosHorario();

    continuarHorario();

    regresarHorario();

    guardarHorarioOficial();

    // Botón para copiar el horario de la fila superior a Lunes-Sábado
    copiarHorarioATodos();

    // Navegación por teclado (flechas y Enter) en la tabla de horarios
    navegacionTecladoHorario();

});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE HORARIO OFICIAL
//===================================================

function abrirModalHorarioOficial() {

    // Detectar el clic en el botón que abre este modal
    $('#btn-horario-oficial').click(function () {

        // Cargar empleados en la tabla
        cargarEmpleadosHorario();

        // Limpiar el formulario de horario antes de abrir
        limpiarFormularioHorario();

        // Asegurarse de estar en el paso 1
        mostrarPaso1Horario();

        // Abrir el modal de Bootstrap
        $('#modalHorarioOficial').modal('show');

    });

}


//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN LA TABLA
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON mostrar = true
//===================================================

function cargarEmpleadosHorario() {

    // Limpiar tabla
    $('#tbody-empleados-horario').empty();

    // Limpiar checkbox principal
    $('#checkTodosHorario').prop('checked', false);

    // Recorrer departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {

        // Obtener únicamente empleados visibles
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento con checkbox para seleccionar todos del depto
        $('#tbody-empleados-horario').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <input
                        type="checkbox"
                        class="form-check-input me-2 check-departamento-horario"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Filas de empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-horario').append(`
                <tr>
                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-horario"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">
                    </td>
                    <td>${empleado.clave}</td>
                    <td>${empleado.nombre}</td>
                </tr>
            `);

        });

    });

    // Re-enlazar eventos de departamento después de renderizar
    seleccionarDepartamentosHorario();

}


//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
//===================================================

function buscadorEmpleadosHorario() {

    $('#txtBuscarEmpleadoHorario').on('keyup', function () {

        let texto = $(this).val().toLowerCase().trim();

        $('#tbody-empleados-horario tr').each(function () {

            // Ignorar encabezados de departamento
            if ($(this).hasClass('table-secondary')) {
                return;
            }

            let clave = $(this).find('td:eq(1)').text().toLowerCase();
            let nombre = $(this).find('td:eq(2)').text().toLowerCase();

            if (clave.includes(texto) || nombre.includes(texto)) {
                $(this).show();
            } else {
                $(this).hide();
            }

        });

    });

}


//===============================================================
// FUNCIÓN PARA SELECCIONAR O DESELECCIONAR TODOS LOS EMPLEADOS
// SEGÚN EL ESTADO DEL CHECK PRINCIPAL
//===============================================================

function seleccionarTodosEmpleadosHorario() {

    $('#checkTodosHorario').change(function () {

        // Afecta únicamente los checkboxes visibles
        $('.check-empleado-horario:visible').prop('checked', $(this).prop('checked'));

    });

}


//===================================================
// FUNCIÓN PARA SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosHorario() {

    // Se usa .off antes de .on para evitar eventos duplicados al recargar la tabla
    $('.check-departamento-horario').off('change').on('change', function () {

        let idDepartamento = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');

        // Seleccionar / deseleccionar todos los empleados de ese departamento
        $(`.check-empleado-horario[data-departamento="${idDepartamento}"]`)
            .prop('checked', seleccionado);

    });

}


//===================================================
// FUNCIÓN PARA PASAR AL PASO 2 (HORARIO)
// Valida que haya al menos un empleado seleccionado,
// guarda la selección y muestra el formulario de horario.
//===================================================

function continuarHorario() {

    $('#btnContinuarHorario').click(function () {

        // Limpiar el arreglo antes de llenarlo
        empleadosSeleccionadosHorario = [];

        // Recolectar empleados marcados
        $('.check-empleado-horario:checked').each(function () {

            let fila = $(this).closest('tr');

            empleadosSeleccionadosHorario.push({
                id_empleado: $(this).val(),
                clave: fila.find('td:eq(1)').text(),
                nombre: fila.find('td:eq(2)').text()
            });

        });

        // Validar selección
        if (empleadosSeleccionadosHorario.length === 0) {

            mostrarAlerta(
                'warning',
                'Advertencia',
                'Debes seleccionar al menos un empleado para continuar.'
            );

            return;

        }

        // Ir al paso 2
        mostrarPaso2Horario();

    });

}


//===================================================
// FUNCIÓN PARA REGRESAR AL PASO 1
//===================================================

function regresarHorario() {

    $('#btnRegresarHorario').click(function () {

        mostrarPaso1Horario();

    });

}


//===================================================
// MOSTRAR PASO 1 (lista de empleados)
//===================================================

function mostrarPaso1Horario() {

    $('#divListaEmpleadosHorario').show();
    $('#divHorarioOficial').hide();

    $('#btnContinuarHorario').show();
    $('#btnGuardarHorario').hide();
    $('#btnRegresarHorario').hide();

}


//===================================================
// MOSTRAR PASO 2 (formulario de horario)
//===================================================

function mostrarPaso2Horario() {

    $('#divListaEmpleadosHorario').hide();
    $('#divHorarioOficial').show();

    $('#btnContinuarHorario').hide();
    $('#btnGuardarHorario').show();
    $('#btnRegresarHorario').show();

}


//===================================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE HORARIO
// Se llama al abrir el modal para que siempre empiece limpio.
//===================================================

function limpiarFormularioHorario() {

    // Limpiar la fila de copia rápida
    $('#copia-entrada').val('');
    $('#copia-salida-comida').val('');
    $('#copia-entrada-comida').val('');
    $('#copia-salida').val('');

    // Lista de todos los IDs de los inputs de horario
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const campos = ['entrada', 'salida-comida', 'entrada-comida', 'salida'];

    dias.forEach(dia => {
        campos.forEach(campo => {
            $(`#horario-${dia}-${campo}`).val('');
        });
    });

}


//===================================================
// FUNCIÓN PARA COPIAR EL HORARIO DE LA FILA SUPERIOR
// A TODOS LOS DÍAS DE LUNES A SÁBADO.
// El DOMINGO NO se asigna por defecto.
//===================================================

function copiarHorarioATodos() {

    $('#btnCopiarHorario').on('click', function () {

        // Leer los valores de la fila de copia rápida
        let entrada = $('#copia-entrada').val();
        let salidaComida = $('#copia-salida-comida').val();
        let entradaComida = $('#copia-entrada-comida').val();
        let salida = $('#copia-salida').val();

        // Días que recibirán el horario (Domingo se excluye por defecto)
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

        dias.forEach(dia => {
            $(`#horario-${dia}-entrada`).val(entrada);
            $(`#horario-${dia}-salida-comida`).val(salidaComida);
            $(`#horario-${dia}-entrada-comida`).val(entradaComida);
            $(`#horario-${dia}-salida`).val(salida);
        });

        // Dejar el Domingo vacío (día de descanso por defecto)
        $('#horario-domingo-entrada').val('');
        $('#horario-domingo-salida-comida').val('');
        $('#horario-domingo-entrada-comida').val('');
        $('#horario-domingo-salida').val('');

    });

}


//===================================================
// FUNCIÓN PARA LEER EL HORARIO DEL FORMULARIO
// Devuelve un arreglo con la estructura:
// [
//   { dia: 'LUNES', entrada: '08:00', salida_comida: '13:00', entrada_comida: '14:00', salida: '17:00' },
//   ...
// ]
//===================================================

function leerHorarioFormulario() {

    // Mapeo: nombre del día → IDs del formulario
    const diasConfig = [
        { dia: 'LUNES', id: 'lunes' },
        { dia: 'MARTES', id: 'martes' },
        { dia: 'MIERCOLES', id: 'miercoles' },
        { dia: 'JUEVES', id: 'jueves' },
        { dia: 'VIERNES', id: 'viernes' },
        { dia: 'SABADO', id: 'sabado' },
        { dia: 'DOMINGO', id: 'domingo' }
    ];

    return diasConfig.map(item => ({
        dia: item.dia,
        entrada: $(`#horario-${item.id}-entrada`).val(),
        salida_comida: $(`#horario-${item.id}-salida-comida`).val(),
        entrada_comida: $(`#horario-${item.id}-entrada-comida`).val(),
        salida: $(`#horario-${item.id}-salida`).val()
    }));

}


//===================================================
// FUNCIÓN PARA GUARDAR EL HORARIO OFICIAL
// Lee el formulario, construye el arreglo de horario
// y lo asigna a horario_oficial de cada empleado
// seleccionado dentro de jsonNominaConfianza.
//===================================================

function guardarHorarioOficial() {

    $('#btnGuardarHorario').click(function () {

        // Leer el horario configurado en el formulario
        let horario = leerHorarioFormulario();

        // Guardar el horario en cada empleado seleccionado
        jsonNominaConfianza.departamentos.forEach(departamento => {

            departamento.empleados.forEach(empleado => {

                // Buscar si este empleado está en la selección
                let seleccionado = empleadosSeleccionadosHorario.find(
                    e => e.id_empleado == empleado.id_empleado
                );

                if (seleccionado) {

                    // Asignar el horario oficial al empleado
                    empleado.horario_oficial = horario;
                    empleado.historial_olvidos = [];
                    empleado.historial_inasistencias = [];
                    empleado.historial_retardos = [];
                    empleado.dias_justificados = [];


                    crearHistorialRetardosConfianza(empleado);

                    // Creamos el historial de olvidos de checador
                    crearHistorialOlvidosChecador(empleado);

                    // Creamos el historial de inasistencias
                    crearHistorialInasistenciasConfianza(empleado);

                }

            });

        });

        // Refrescar la tabla principal de nómina para reflejar cambios
        llenarTablaNomina();

        // Cerrar el modal
        $('#modalHorarioOficial').modal('hide');

        // Notificar al usuario
        mostrarAlerta(
            'success',
            'Éxito',
            `Horario oficial asignado correctamente a ${empleadosSeleccionadosHorario.length} empleado(s).`
        );

    });

}


//===================================================
// FUNCIÓN PARA NAVEGAR ENTRE CELDAS CON EL TECLADO
// Permite mover el foco usando las flechas (Arriba, Abajo,
// Izquierda, Derecha) y la tecla Enter en la tabla.
//===================================================

function navegacionTecladoHorario() {

    $('#tablaHorarioOficial').on('keydown', 'input', function (e) {

        const key = e.key;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) {

            const $currentInput = $(this);
            const $currentTd    = $currentInput.closest('td');
            const $currentTr    = $currentTd.closest('tr');
            const colIndex      = $currentTd.index();

            // ARRIBA: Mover foco a la celda superior en la misma columna
            if (key === 'ArrowUp') {
                e.preventDefault();
                const $prevTr = $currentTr.prev('tr');
                if ($prevTr.length) {
                    const $targetInput = $prevTr.children().eq(colIndex).find('input');
                    if ($targetInput.length) {
                        $targetInput.focus().select();
                    }
                }
            }

            // ABAJO o ENTER: Mover foco a la celda inferior en la misma columna
            else if (key === 'ArrowDown' || key === 'Enter') {
                e.preventDefault();
                const $nextTr = $currentTr.next('tr');
                if ($nextTr.length) {
                    const $targetInput = $nextTr.children().eq(colIndex).find('input');
                    if ($targetInput.length) {
                        $targetInput.focus().select();
                    }
                }
            }

            // IZQUIERDA: Mover foco a la celda de la izquierda (Alt + Flecha Izq o Flecha Izq)
            else if (key === 'ArrowLeft' && (e.altKey || e.ctrlKey)) {
                e.preventDefault();
                const $prevTd = $currentTd.prevAll('td').has('input').first();
                if ($prevTd.length) {
                    $prevTd.find('input').focus().select();
                } else {
                    const $prevTr = $currentTr.prev('tr');
                    if ($prevTr.length) {
                        $prevTr.find('td').has('input').last().find('input').focus().select();
                    }
                }
            }

            // DERECHA: Mover foco a la celda de la derecha (Alt + Flecha Der o Flecha Der)
            else if (key === 'ArrowRight' && (e.altKey || e.ctrlKey)) {
                e.preventDefault();
                const $nextTd = $currentTd.nextAll('td').has('input').first();
                if ($nextTd.length) {
                    $nextTd.find('input').focus().select();
                } else {
                    const $nextTr = $currentTr.next('tr');
                    if ($nextTr.length) {
                        $nextTr.find('td').has('input').first().find('input').focus().select();
                    }
                }
            }

        }

    });

}

