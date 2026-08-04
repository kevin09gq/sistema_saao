// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS
let empleadosSeleccionadosAddConceptos = [];

$(document).ready(function () {
    abrirModalAddConceptos();

    buscadorEmpleadosAddConceptos();

    seleccionarTodosEmpleadoAddConceptos();

    aplicarConceptoExtraAEmpleados();
});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE SUELDO BASE
//===================================================

function abrirModalAddConceptos() {

    // Detectar el clic en el botón "Agregar Percepciones / Deducciones"
    $('#btn_add_percepciones_deducciones').click(function () {
        cargarEmpleadosAddConceptos();
        // Abrir el modal de Bootstrap
        $('#modalAddConceptos').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosAddConceptos() {

    // Limpiar tabla
    $('#tbody-empleados-add-conceptos').empty();

    // Limpiar el checkbox principal
    $('#checkTodosAddConceptos').prop('checked', false);

    // Recorrer departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-add-conceptos').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-add-conceptos').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-add-conceptos"
                            value="${empleado.id_empleado}">
                    </td>

                    <td>${empleado.clave}</td>

                    <td>${empleado.nombre}</td>

                </tr>
            `);

        });

    });

}

//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosAddConceptos() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoAddConceptos').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-add-conceptos tr').each(function () {

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

function seleccionarTodosEmpleadoAddConceptos() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosAddConceptos').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-add-conceptos:visible').prop('checked', $(this).prop('checked'));

    });

}

//==========================================================
// FUNCIÓN PARA OBTENER Y VALIDAR LA INFORMACIÓN DEL CONCEPTO
//==========================================================
function obtenerDatosConceptoExtra() {

    // Obtener la información de los inputs
    let tipo = $("#selectTipoConceptoExtra").val();
    let nombre = $("#inputNombreConceptoExtra").val().trim();
    let cantidadVal = $("#inputCantidadConceptoExtra").val();

    // Validar nombre
    if (nombre === "") {
        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debe ingresar el nombre del concepto."
        );
        return null;
    }

    // Validar cantidad
    if (cantidadVal === "" || isNaN(cantidadVal) || parseFloat(cantidadVal) <= 0) {
        mostrarAlerta(
            "warning",
            "Advertencia",
            "Debe ingresar una cantidad válida mayor a 0."
        );
        return null;
    }

    // Retornar objeto con los datos procesados
    return {
        tipo: tipo,
        nombre: nombre,
        cantidad: parseFloat(cantidadVal)
    };

}

//==========================================================
// FUNCIÓN PARA APLICAR EL CONCEPTO A LOS EMPLEADOS SELECCIONADOS
// AL HACER CLIC EN EL BOTÓN DE GUARDADO
//==========================================================
function aplicarConceptoExtraAEmpleados() {

    $("#btnAddConceptos").on("click", function () {

        // 1. Obtener y validar los datos del concepto
        let concepto = obtenerDatosConceptoExtra();
        if (!concepto) {
            return;
        }

        // 2. Validar que exista al menos un empleado seleccionado
        if ($(".check-empleado-add-conceptos:checked").length === 0) {
            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado."
            );
            return;
        }

        // 3. Aplicar el concepto a cada empleado seleccionado
        $(".check-empleado-add-conceptos:checked").each(function () {
            let idEmpleado = $(this).val();

            // Buscar el empleado en el JSON local
            jsonNomina40lbs.departamentos.forEach(departamento => {
                departamento.empleados.forEach(empleado => {
                    if (empleado.id_empleado == idEmpleado) {

                        // Si es una Percepción
                        if (concepto.tipo === "percepcion") {
                            // Inicializar el arreglo de percepciones extras si no existe
                            if (!empleado.percepciones_extra) {
                                empleado.percepciones_extra = [];
                            }
                            // Agregar el concepto extra
                            empleado.percepciones_extra.push({
                                nombre: concepto.nombre,
                                cantidad: concepto.cantidad
                            });

                        }
                        
                        // Si es una Deducción
                        else if (concepto.tipo === "deduccion") {
                            // Inicializar el arreglo de deducciones extras si no existe
                            if (!empleado.deducciones_extra) {
                                empleado.deducciones_extra = [];
                            }
                            // Agregar el concepto extra
                            empleado.deducciones_extra.push({
                                nombre: concepto.nombre,
                                cantidad: concepto.cantidad
                            });

                           
                        }

                    }
                });
            });
        });

        // 4. Limpiar campos del formulario
        $("#inputNombreConceptoExtra").val("");
        $("#inputCantidadConceptoExtra").val("");
        $("#selectTipoConceptoExtra").val("percepcion");

        // 5. Actualizar la tabla principal de la nómina
        llenarTablaNomina();

        // 6. Mostrar mensaje de éxito y cerrar el modal
        mostrarAlerta(
            "success",
            "Éxito",
            "Concepto agregado correctamente a los empleados seleccionados."
        );

        $("#modalAddConceptos").modal("hide");

    });

}

