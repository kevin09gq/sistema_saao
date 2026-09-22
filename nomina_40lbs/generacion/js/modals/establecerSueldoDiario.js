// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS
let empleadosSeleccionadosSueldoDiario = [];

$(document).ready(function () {
    abrirModalSueldoDiario();

    buscadorEmpleadosSueldoDiario();

    seleccionarTodosEmpleadoSueldoDiario();

    obtenerEmpleadosSeleccionadosSueldoDiario();

    quitarSueldoDiario();
});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE SUELDO BASE
//===================================================

function abrirModalSueldoDiario() {

    // Detectar el clic en el botón "Establecer Sueldo Diario"
    $('#btn_establecer_sueldo_diario').click(function () {
        cargarEmpleadosSueldoDiario();
        // Abrir el modal de Bootstrap
        $('#modalSueldoDiario').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosSueldoDiario() {

    // Limpiar tabla
    $('#tbody-empleados-sueldo-diario').empty();

    // Limpiar el checkbox principal
    $('#checkTodosSueldoDiario').prop('checked', false);

    // Recorrer departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Separar empleados por seguro social
        const empleadosCSS = empleadosMostrar.filter(emp => emp.seguroSocial === true);
        const empleadosSSS = empleadosMostrar.filter(emp => !emp.seguroSocial);

        // Encabezado del departamento
        $('#tbody-empleados-sueldo-diario').append(`
            <tr class="table-secondary fila-encabezado">
                <td colspan="3" class="fw-bold">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Subgrupo Con Seguro Social (CSS)
        if (empleadosCSS.length > 0) {
            $('#tbody-empleados-sueldo-diario').append(`
                <tr class="table-light fila-encabezado">
                    <td colspan="3" class="fw-semibold ps-4 text-primary">
                        <i class="bi bi-shield-check me-1"></i>
                        CSS (Con Seguro Social)
                    </td>
                </tr>
            `);

            empleadosCSS.forEach(empleado => {
                $('#tbody-empleados-sueldo-diario').append(`
                    <tr>
                        <td class="text-center">
                            <input
                                type="checkbox"
                                class="form-check-input check-empleado-sueldo-diario"
                                value="${empleado.id_empleado}">
                        </td>
                        <td>${empleado.clave}</td>
                        <td>${empleado.nombre}</td>
                    </tr>
                `);
            });
        }

        // Subgrupo Sin Seguro Social (SSS)
        if (empleadosSSS.length > 0) {
            $('#tbody-empleados-sueldo-diario').append(`
                <tr class="table-light fila-encabezado">
                    <td colspan="3" class="fw-semibold ps-4 text-secondary">
                        <i class="bi bi-shield-x me-1"></i>
                        SSS (Sin Seguro Social)
                    </td>
                </tr>
            `);

            empleadosSSS.forEach(empleado => {
                $('#tbody-empleados-sueldo-diario').append(`
                    <tr>
                        <td class="text-center">
                            <input
                                type="checkbox"
                                class="form-check-input check-empleado-sueldo-diario"
                                value="${empleado.id_empleado}">
                        </td>
                        <td>${empleado.clave}</td>
                        <td>${empleado.nombre}</td>
                    </tr>
                `);
            });
        }

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosSueldoDiario() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoSueldoDiario').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-sueldo-diario tr').each(function () {

            // Si la fila corresponde al encabezado de un departamento o subgrupo,
            // no se realiza la búsqueda sobre ella.
            if ($(this).hasClass('table-secondary') || $(this).hasClass('table-success') || $(this).hasClass('table-light') || $(this).hasClass('fila-encabezado')) {
                return;
            }

            // Obtener la clave del empleado (segunda columna)
            let clave = $(this).find('td:eq(1)').text().toLowerCase();

            // Obtener el nombre del empleado (tercera columna)
            let nombre = $(this).find('td:eq(2)').text().toLowerCase();

            // Verificar si el texto escrito coincide con la clave
            // o con el nombre del empleado.
            if (clave.includes(texto) || nombre.includes(texto)) {

                // Si coincide, mostrar la fila.
                $(this).show();

            } else {

                // Si no coincide, ocultar la fila.
                $(this).hide();

            }

        });

    });

}

//===============================================================
// FUNCIÓN PARA SELECCIONAR O DESELECCIONAR TODOS LOS EMPLEADOS
// SEGÚN EL ESTADO DEL CHECK PRINCIPAL.
//===============================================================

function seleccionarTodosEmpleadoSueldoDiario() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosSueldoDiario').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-sueldo-diario:visible').prop('checked', $(this).prop('checked'));

    });

}




//==========================================================
// FUNCIÓN PARA OBTENER LOS EMPLEADOS SELECCIONADOS
// OBTENER ID DEL EMPLEADO, PARA ENVIAR LOS ID AL SERVIDOR
//==========================================================

function obtenerEmpleadosSeleccionadosSueldoDiario() {
    // Detectar clic en el botón Continuar
    $('#btnEstablecerSueldoDiario').click(function () {

        // Limpiar el arreglo antes de volver a llenarlo
        empleadosSeleccionadosSueldoDiario = [];

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-sueldo-diario:checked').each(function () {

            // Obtener la fila del empleado
            let fila = $(this).closest('tr');

            // Crear un objeto con la información del empleado
            let empleado = {

                id_empleado: $(this).val(),

            };

            // Agregar el empleado al arreglo
            empleadosSeleccionadosSueldoDiario.push(empleado);

        });

        // Verificar si no se seleccionó ningún empleado
        if (empleadosSeleccionadosSueldoDiario.length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado para continuar."
            );

            return;

        } else {
            // Si hay empleados seleccionados, llamar a la función para obtener su sueldo diario
            obtenerSueldoDiario();
        }



    });
}

//==========================================================
// FUNCIÓN PARA OBTENER EL SUELDO BASE DE LOS EMPLEADOS
//==========================================================
function obtenerSueldoDiario() {

    $.ajax({

        url: "../php/infoDepartamentos.php",

        type: "POST",

        data: {

            accion: "obtenerSueldoDiario",

            empleados: JSON.stringify(empleadosSeleccionadosSueldoDiario)

        },

        dataType: "json",

        success: function (respuesta) {

            copiarInformacionEmpleadoSueldoDiario(respuesta);
        },

        error: function (xhr, status, error) {

            console.log(error);

        }

    });

}

//===================================================
// FUNCIÓN PARA COPIAR LA INFORMACIÓN DEL EMPLEADO
// OBTENIDA DEl SERVIDOR Y ACTUALIZAR sueldo_neto

// FUNCIÓN PARA COPIAR LA INFORMACIÓN DEL EMPLEADO
// BUSCA EL EMPLEADO DENTRO DE jsonNomina40lbs
// Y ACTUALIZA SU PROPIEDAD "sueldo_neto" CON EL 
// VALOR OBTENIDO DEL SERVIDOR.
//===================================================

function copiarInformacionEmpleadoSueldoDiario(empleadosConSueldoDiario) {

    empleadosConSueldoDiario.forEach(empleadoServidor => {

        jsonNomina40lbs.departamentos.forEach(departamento => {

            departamento.empleados.forEach(empleado => {

                if (empleado.id_empleado == empleadoServidor.id_empleado) {

                    // empleado.sueldo_neto = empleadoServidor.salario_semanal;

                    empleado.sueldo_diario = true;

                    // Reiniciar incentivo y horas extra
                    empleado.incentivo = 0;
                    empleado.horas_extra = 0;

                    delete empleado.sueldo_base;

                    // Calcular los días trabajados del empleado
                    calcularDiasTrabajados(empleado, empleadoServidor.salario_diario);

                    // Limpiar historial de inasistencias para recalcularlo
                    empleado.historial_inasistencias = [];

                    // Limpiar historial de olvidos de checador
                    empleado.historial_olvidos = [];


                }

            });

        });

    });

    llenarTablaNomina();

    $('#modalSueldoDiario').modal('hide');

}


//===================================================
// CALCULAR DÍAS TRABAJADOS PARA EMPLEADOS DE 
// SUELDO DIARIO CUENTA UN DÍA SI EXISTE AL MENOS 
// UNA ENTRADA
//===================================================

function calcularDiasTrabajados(empleado, salario_diario) {

    // Validar registros
    if (!empleado.registros || empleado.registros.length === 0) {
        empleado.sueldo_neto = 0;
        return;
    }

    // Arreglo para almacenar días ya contados
    let diasTrabajados = [];

    // Recorrer registros
    empleado.registros.forEach(function (registro) {

        // Validar que tenga entrada válida y no sea falta (00:00 o vacía)
        if (
            registro.entrada &&
            registro.entrada.trim() !== "" &&
            registro.entrada.trim() !== "00:00"
        ) {

            // Verificar que el día no esté contado todavía
            if (!diasTrabajados.includes(registro.fecha)) {

                diasTrabajados.push(registro.fecha);

            }

        }

    });

    // Guardar cantidad de días únicos trabajados
    var diasTrabajadosCount = diasTrabajados.length;

    calcularSalarioSemanal(empleado, diasTrabajadosCount, salario_diario);

}


//===================================================
// FUNCION PARA CALCULAR EL SALARIO SEMANAL 
// DEL EMPLEADO
//===================================================

function calcularSalarioSemanal(empleado, diasTrabajadosCount, salario_diario) {

    // Validar que el empleado tenga días trabajados y que tenga mostrar = true 
    if (diasTrabajadosCount <= 0 || !empleado.mostrar) {
        empleado.sueldo_neto = 0;
        return;
    }

    // Calcular el total de sueldo neto según días trabajados
    empleado.sueldo_neto = salario_diario * diasTrabajadosCount;

}


//==========================================================
// FUNCIÓN PARA QUITAR EL SUELDO BASE DE LOS EMPLEADOS
// SELECCIONADOS EN EL MODAL
//==========================================================

function quitarSueldoDiario() {

    // Detectar clic en el botón "Quitar Sueldo Diario"
    $('#btnQuitarSueldoDiario').click(function () {

        // Verificar que exista al menos un empleado seleccionado
        if ($('.check-empleado-sueldo-diario:checked').length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado."
            );

            return;
        }

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-sueldo-diario:checked').each(function () {

            // Obtener el id del empleado
            let idEmpleado = $(this).val();

            // Buscar el empleado dentro del JSON
            jsonNomina40lbs.departamentos.forEach(departamento => {

                departamento.empleados.forEach(empleado => {

                    if (empleado.id_empleado == idEmpleado) {

                        // Quitar el sueldo diario
                        empleado.sueldo_diario = false;

                        // Remover la propiedad sueldo_diario
                        delete empleado.sueldo_diario;

                        // Obtener el tabulador de sueldos para restablecer el sueldo neto
                        getTabulador();

                        // Restablecer el sueldo neto de acuerdo al tabulador
                        establecerSueldoNeto(empleado);

                        // Restablecer incentivo de asistencia según sus asistencias

                        aplicarIncentivoEmpleado(empleado);


                    }

                });

            });

        });

        // Actualizar la tabla
        llenarTablaNomina();

        // Cerrar el modal
        $('#modalSueldoDiario').modal('hide');

    });

}
