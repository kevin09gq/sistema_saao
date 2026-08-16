// ARREGLO QUE ALMACENARÁ LA CONFIGURACIÓN DE VALORES ECONÓMICOS
let configuracionValoresEconomicosSeleccionados = [];

// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS
let empleadosSeleccionadosGestionarValoresEconomicos = [];

$(document).ready(function () {
    abrirModalGestionarValoresEconomicos();

    buscadorEmpleadosGestionarValoresEconomicos();  
    
    obtenerEmpleadosSeleccionadosGestionarValoresEconomicos();

    seleccionarTodosEmpleadoGestionarValoresEconomicos();

    seleccionarDepartamentosGestionarValoresEconomicos();
});


//=============================================================
// FUNCIÓN PARA ABRIR EL MODAL DE GESTIÓN DE VALORES ECONÓMICOS
//=============================================================

function abrirModalGestionarValoresEconomicos() {

    // Detectar el clic en el botón "Gestionar Valores Economicos"
    $('#btn_gestionar_valores_economicos').click(function () {
        cargarEmpleadosGestionarValoresEconomicos();

        // Limpiar el buscador
        $('#txtBuscarEmpleadoGestionarValoresEconomicos').val('');
        // Asignar el valor por defecto al select de concepto "todos"
        $('#selectConceptoGestionarValoresEconomicos').val('todos');
        // Limpiar el select de acción
        $('#selectAccionGestionarValoresEconomicos').val('');
        // Abrir el modal de Bootstrap
        $('#modalGestionarValoresEconomicos').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosGestionarValoresEconomicos() {

    // Limpiar tabla
    $('#tbody-empleados-gestionar-valores-economicos').empty();

    // Limpiar el checkbox principal
    $('#checkTodosGestionarValoresEconomicos').prop('checked', false);

    // Recorrer departamentos
    jsonNominaHuasteca.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(empleado => empleado.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-gestionar-valores-economicos').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <input 
                        type="checkbox"
                        class="form-check-input me-2 check-departamento-gestionar-valores-economicos"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-gestionar-valores-economicos').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-gestionar-valores-economicos"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">
                    </td>

                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                </tr>
            `);

        });

    });

    seleccionarDepartamentosGestionarValoresEconomicos();

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosGestionarValoresEconomicos() {

    $('.check-departamento-gestionar-valores-economicos').off('change').on('change', function () {

        let idDepartamento = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');

        $(`.check-empleado-gestionar-valores-economicos[data-departamento="${idDepartamento}"]`)
            .prop('checked', seleccionado);

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosGestionarValoresEconomicos() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoGestionarValoresEconomicos').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-gestionar-valores-economicos tr').each(function () {

            // Si la fila corresponde al encabezado de un departamento, no realizar búsqueda sobre ella
            if ($(this).hasClass('table-secondary') || $(this).hasClass('table-success')) {
                return;
            }

            // Obtener la clave del empleado (segunda columna)
            let clave = $(this).find('td:eq(1)').text().toLowerCase();

            // Obtener el nombre del empleado (tercera columna)
            let nombre = $(this).find('td:eq(2)').text().toLowerCase();

            // Verificar si el texto escrito coincide con la clave o nombre
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
// SEGÚN EL ESTADO DEL CHECK PRINCIPAL.
//===============================================================

function seleccionarTodosEmpleadoGestionarValoresEconomicos() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosGestionarValoresEconomicos').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-gestionar-valores-economicos:visible').prop('checked', $(this).prop('checked'));

    });

}

//==========================================================
// FUNCIÓN PARA OBTENER LOS EMPLEADOS SELECCIONADOS
//==========================================================

function obtenerEmpleadosSeleccionadosGestionarValoresEconomicos() {

    // Detectar clic en el botón de aplicar configuración
    $('#btnEstablecerGestionarValoresEconomicos').click(function () {

        // Limpiar el arreglo antes de volver a llenarlo
        empleadosSeleccionadosGestionarValoresEconomicos = [];

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-gestionar-valores-economicos:checked').each(function () {

            let empleado = {
                id_empleado: $(this).val()
            };

            empleadosSeleccionadosGestionarValoresEconomicos.push(empleado);

        });

        // Verificar si no se seleccionó ningún empleado
        if (empleadosSeleccionadosGestionarValoresEconomicos.length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado para continuar."
            );

            return;

        }

        // Obtener la configuración del concepto y acción seleccionados
        let configuracionValida = obtenerConfiguracionValoresEconomicos();

        if (configuracionValida) {

            // Aplicar la actualización a los empleados seleccionados
            gestionarValoresEconomicosEmpleados();

            // Cerrar el modal
            $('#modalGestionarValoresEconomicos').modal('hide');

        }

    });

}

//==========================================================
// FUNCIÓN PARA OBTENER LA CONFIGURACIÓN DEL CONCEPTO
// OBTIENE:
// - CONCEPTO SELECCIONADO (pasaje, comida, tardeada, todos)
// - ACCIÓN (asignar / quitar)
//==========================================================

function obtenerConfiguracionValoresEconomicos() {

    // Limpiar arreglo
    configuracionValoresEconomicosSeleccionados = [];

    // Obtener concepto seleccionado
    let concepto = $('#selectConceptoGestionarValoresEconomicos').val();

    // Obtener acción seleccionada
    let accion = $('#selectAccionGestionarValoresEconomicos').val();

    // Validar que exista un concepto
    if (!concepto || concepto === "") {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debes seleccionar un concepto."
        );

        return false;

    }

    // Validar que exista una acción
    if (!accion || accion === "") {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debes seleccionar una acción."
        );

        return false;

    }

    // Crear objeto configuración
    let configuracion = {
        concepto: concepto,
        accion: accion
    };

    // Guardar configuración
    configuracionValoresEconomicosSeleccionados.push(configuracion);

    return true;

}

//==========================================================
// FUNCIÓN PARA RECORRER EMPLEADOS SELECCIONADOS
// Y APLICAR CONFIGURACIÓN DE VALORES ECONÓMICOS
//==========================================================

function gestionarValoresEconomicosEmpleados() {

    empleadosSeleccionadosGestionarValoresEconomicos.forEach(empleadoSeleccionado => {

        jsonNominaHuasteca.departamentos.forEach(departamento => {

            departamento.empleados.forEach(empleado => {

                if (empleado.id_empleado == empleadoSeleccionado.id_empleado) {

                    configuracionValoresEconomicosSeleccionados.forEach(configuracion => {

                        aplicarValoresEconomicosEmpleado(
                            empleado,
                            departamento,
                            configuracion
                        );

                    });

                }

            });

        });

    });

    // Actualizar la tabla principal de la nómina
    llenarTablaNomina();

}

//==========================================================
// FUNCIÓN PARA APLICAR CONFIGURACIÓN DE VALORES ECONÓMICOS
// AL EMPLEADO
// RECIBE:
// - empleado: objeto del empleado dentro del JSON
// - departamento: departamento al que pertenece el empleado
// - configuracion: concepto y acción seleccionados
//==========================================================

function aplicarValoresEconomicosEmpleado(empleado, departamento, configuracion) {

    let concepto = configuracion.concepto;
    let accion = configuracion.accion;

    // Determinar si el empleado pertenece a un departamento de oficina (tipo_horario = 1)
    let esOficina = (departamento.tipo_horario == 1);

    // Si el empleado tiene registros pero no tiene calculados los días trabajados, los calculamos
    if (empleado.registros && (!empleado.dias_trabajados || empleado.dias_trabajados === 0)) {
        calcularDiasTrabajadosRancho(empleado);
    }

    //==================================================
    // CONCEPTO: COMIDA
    //==================================================
    if (concepto === "comida") {

        if (accion === "asignar") {

            calcularPagoComidaEmpleado(empleado);

        } else if (accion === "quitar") {

            empleado.comida = 0;

        }

    }

    //==================================================
    // CONCEPTO: PASAJE
    //==================================================
    else if (concepto === "pasaje") {

        if (accion === "asignar") {

            calcularPagoPasajeEmpleado(empleado);

        } else if (accion === "quitar") {

            empleado.pasaje = 0;

        }

    }

    //==================================================
    // CONCEPTO: TARDEADAS
    // SOLO APLICA A EMPLEADOS DE RANCHO (tipo_horario != 1)
    //==================================================
    else if (concepto === "tardeada") {

        // Si es de oficina (tipo_horario = 1), no se permite asignar ni actualizar tardeadas
        if (!esOficina) {

            if (accion === "asignar") {

                calcularTardeadaEmpleado(empleado);

            } else if (accion === "quitar") {

                empleado.tardeada = 0;
                empleado.total_tardeadas = 0;

            }

        }

    }

    //==================================================
    // CONCEPTO: TODOS LOS CONCEPTOS
    //==================================================
    else if (concepto === "todos") {

        if (accion === "asignar") {

            // Asignar Comida y Pasaje a todos
            calcularPagoComidaEmpleado(empleado);
            calcularPagoPasajeEmpleado(empleado);

            // Asignar Tardeada únicamente si NO es de oficina
            if (!esOficina) {
                calcularTardeadaEmpleado(empleado);
            }

        } else if (accion === "quitar") {

            // Quitar Comida y Pasaje
            empleado.comida = 0;
            empleado.pasaje = 0;

            // Quitar Tardeada únicamente si NO es de oficina
            if (!esOficina) {
                empleado.tardeada = 0;
                empleado.total_tardeadas = 0;
            }

        }

    }

}