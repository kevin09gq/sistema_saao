// ARREGLO QUE ALMACENARÁ LA CONFIGURACIÓN DE CONCEPTOS
let configuracionConceptosSeleccionados = [];

// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS
let empleadosSeleccionadosConfigConceptos = [];

$(document).ready(function () {
    abrirModalConfigConceptos();

    buscadorEmpleadosConfigConceptos();

    obtenerEmpleadosSeleccionadosConfigConceptos();
    
    seleccionarTodosEmpleadoConfigConceptos();

    seleccionarDepartamentosConfigConceptos();

});

//=============================================================
// FUNCIÓN PARA ABRIR EL MODAL DE CONFIGURACIÓN DE CONCEPTOS
//=============================================================

function abrirModalConfigConceptos() {

    // Detectar el clic en el botón "Configurar Conceptos"
    $('#btn_config_conceptos').click(function () {
        cargarEmpleadosConfigConceptos();

        // Limpiar el buscador
        $('#txtBuscarEmpleadoConfigConceptos').val('');
        // Asingar el valor por defecto al select de concepto "todos"
        $('#selectConceptoConfig').val('todos');
        // Limpiar el select de acción
        $('#selectAccionConcepto').val('');
        // Abrir el modal de Bootstrap
        $('#modalConfigConceptos').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosConfigConceptos() {

    // Limpiar tabla
    $('#tbody-empleados-config-conceptos').empty();

    // Limpiar el checkbox principal
    $('#checkTodosConfigConceptos').prop('checked', false);

    // Recorrer departamentos
    jsonNominaRelicario.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán y seguroSocial = true
        const empleadosMostrar = departamento.empleados.filter(empleado => empleado.mostrar && empleado.seguroSocial);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-config-conceptos').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <input 
                        type="checkbox"
                        class="form-check-input me-2 check-departamento-config-conceptos"
                        data-departamento="${departamento.id_departamento}">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-config-conceptos').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-config-conceptos"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">
                    </td>

                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                </tr>
            `);

        });

    });

    seleccionarDepartamentosConfigConceptos();

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosConfigConceptos() {

    $('.check-departamento-config-conceptos').off('change').on('change', function () {

        let idDepartamento = $(this).data('departamento');
        let seleccionado = $(this).prop('checked');

        $(`.check-empleado-config-conceptos[data-departamento="${idDepartamento}"]`)
            .prop('checked', seleccionado);

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosConfigConceptos() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoConfigConceptos').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-config-conceptos tr').each(function () {

            // Si la fila corresponde al encabezado de un departamento,
            // no se realiza la búsqueda sobre ella.
            if ($(this).hasClass('table-secondary') || $(this).hasClass('table-success')) {
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

function seleccionarTodosEmpleadoConfigConceptos() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosConfigConceptos').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-config-conceptos:visible').prop('checked', $(this).prop('checked'));

    });

}

//==========================================================
// FUNCIÓN PARA OBTENER LOS EMPLEADOS SELECCIONADOS
//==========================================================

function obtenerEmpleadosSeleccionadosConfigConceptos() {
    // Detectar clic en el botón Continuar
    $('#btnEstablecerConfigConceptos').click(function () {

        // Limpiar el arreglo antes de volver a llenarlo
        empleadosSeleccionadosConfigConceptos = [];

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-config-conceptos:checked').each(function () {

            // Obtener la fila del empleado
            let fila = $(this).closest('tr');

            // Crear un objeto con la información del empleado
            let empleado = {

                id_empleado: $(this).val(),

            };

            // Agregar el empleado al arreglo
            empleadosSeleccionadosConfigConceptos.push(empleado);

        });

        // Verificar si no se seleccionó ningún empleado
        if (empleadosSeleccionadosConfigConceptos.length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado para continuar."
            );

            return;

        } else {
            // Si hay empleados seleccionados, obtener que conceptos se van a configurar y
            // Verificar que tipo de ejecución se va a realizar (Agregar o Quitar conceptos).

            obtenerConfiguracionConcepto();
            configurarConceptosEmpleados();

            // Cerrar el modal
            $('#modalConfigConceptos').modal('hide');

        }
    });
}

//==========================================================
// FUNCIÓN PARA OBTENER LA CONFIGURACIÓN DEL CONCEPTO
// OBTIENE:
// - CONCEPTO SELECCIONADO
// - ACCIÓN (ASIGNAR / QUITAR)
//==========================================================

function obtenerConfiguracionConcepto() {


    // Limpiar arreglo
    configuracionConceptosSeleccionados = [];


    // Obtener concepto seleccionado
    let concepto = $('#selectConceptoConfig').val();


    // Obtener acción seleccionada
    let accion = $('#selectAccionConcepto').val();



    // Validar que exista un concepto
    if (concepto === "") {

        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debes seleccionar un concepto."
        );

        return false;

    }



    // Validar que exista una acción
    if (accion === "") {

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
    configuracionConceptosSeleccionados.push(configuracion);

    return true;

}

//==========================================================
// FUNCIÓN PARA RECORRER EMPLEADOS SELECCIONADOS
// Y APLICAR CONFIGURACIÓN
//==========================================================

function configurarConceptosEmpleados() {

    empleadosSeleccionadosConfigConceptos.forEach(empleadoSeleccionado => {

        jsonNominaRelicario.departamentos.forEach(departamento => {

            departamento.empleados.forEach(empleado => {

                if (empleado.id_empleado == empleadoSeleccionado.id_empleado) {

                    configuracionConceptosSeleccionados.forEach(configuracion => {

                        aplicarConfiguracionConceptoEmpleado(
                            empleado,
                            configuracion
                        );

                    });

                }

            });

        });

    });

    // Actualizar tabla
    llenarTablaNomina();

}

//==========================================================
// FUNCIÓN PARA APLICAR CONFIGURACIÓN DE CONCEPTOS AL EMPLEADO
// RECIBE:
// - empleado: empleado encontrado dentro del JSON
// - configuracion: concepto y acción seleccionada
//==========================================================

function aplicarConfiguracionConceptoEmpleado(empleado, configuracion) {

    // Obtener concepto seleccionado
    let concepto = configuracion.concepto;

    // Obtener acción seleccionada
    let accion = configuracion.accion;

    //==================================================
    // TARJETA
    //==================================================

    if (concepto === "tarjeta") {

        if (accion === "asignar") {

            // Restaurar tarjeta
            empleado.tarjeta = empleado.tarjeta_copia;

        } else if (accion === "quitar") {

            // Quitar tarjeta
            empleado.tarjeta = 0;

        }

    }

    //==================================================
    // TODOS LOS CONCEPTOS
    //==================================================

    else if (concepto === "todos") {

        if (accion === "asignar") {
             // Restaurar tarjeta
            empleado.tarjeta = empleado.tarjeta_copia;

            // Restaurar todos los conceptos
            empleado.conceptos.forEach(conceptoEmpleado => {

                empleado.conceptos_copia.forEach(conceptoCopia => {

                    if (conceptoEmpleado.codigo == conceptoCopia.codigo) {

                        conceptoEmpleado.resultado = conceptoCopia.resultado;

                    }

                });

            });

        } else if (accion === "quitar") {

            // Quitar tarjeta
            empleado.tarjeta = 0;

            // Poner todos los conceptos en 0
            empleado.conceptos.forEach(conceptoEmpleado => {

                conceptoEmpleado.resultado = 0;

            });

        }

    }

    //==================================================
    // CONCEPTOS INDIVIDUALES
    //==================================================

    else {

        if (accion === "asignar") {

            // Buscar el concepto en la copia y restaurar su resultado
            empleado.conceptos.forEach(conceptoEmpleado => {

                if (conceptoEmpleado.codigo == concepto) {

                    empleado.conceptos_copia.forEach(conceptoCopia => {

                        if (conceptoCopia.codigo == concepto) {

                            conceptoEmpleado.resultado = conceptoCopia.resultado;

                        }

                    });

                }

            });

        } else if (accion === "quitar") {

            // Colocar en 0 únicamente el concepto seleccionado
            empleado.conceptos.forEach(conceptoEmpleado => {

                if (conceptoEmpleado.codigo == concepto) {

                    conceptoEmpleado.resultado = 0;

                }

            });

        }

    }

}

