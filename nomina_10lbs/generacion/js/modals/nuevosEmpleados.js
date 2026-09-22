

$(document).ready(function () {
    abrirModalNuevosEmpleados();

    buscadorEmpleadosNuevos();

    seleccionarTodosEmpleadoNuevos();

    establecerNuevosEmpleados();

});

//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE SUELDO BASE
//===================================================

function abrirModalNuevosEmpleados() {

    // Detectar el clic en el botón "Establecer Nuevos Empleados"
    $('#btn-agregar-nuevos-empleados').click(function () {
        obtenerNuevosEmpleados();
        // Abrir el modal de Bootstrap
        $('#modalNuevosEmpleados').modal('show');

    });

}


//===================================================
// FUNCIÓN PARA OBTENER LOS NUEVOS EMPLEADOS
// Y MOSTRARLOS EN EL MODAL.
//===================================================

function obtenerNuevosEmpleados() {

    $.ajax({

        url: "../php/infoEmpleados.php",
        type: "POST",

        data: {
            accion: "obtenerNuevosEmpleados"
        },

        dataType: "json",

        success: function (respuesta) {

            if (!respuesta.success) {

                console.error(respuesta.mensaje);

                return;

            }

            // Limpiar tabla
            $("#tbody-empleados-nuevos").empty();

            // OBTENER LOS IDS QUE YA EXISTEN EN LA NÓMINA

            let idsExistentes = [];

            jsonNomina10lbs.departamentos.forEach(function (departamento) {

                departamento.empleados.forEach(function (empleado) {

                    idsExistentes.push(parseInt(empleado.id_empleado));

                });

            });

            // FILTRAR ÚNICAMENTE LOS EMPLEADOS NUEVOS

            let empleadosNuevos = respuesta.empleados.filter(function (empleado) {

                return !idsExistentes.includes(parseInt(empleado.id_empleado));

            });

            // Si no hay empleados nuevos
            if (empleadosNuevos.length === 0) {

                $("#tbody-empleados-nuevos").append(`
                    <tr>
                        <td colspan="3" class="text-center text-muted py-3">
                            No se encontraron empleados nuevos.
                        </td>
                    </tr>
                `);

                return;

            }

            // IMPRIMIR EMPLEADOS EN LA TABLA

            empleadosNuevos.forEach(function (empleado) {

                $("#tbody-empleados-nuevos").append(`

                    <tr>

                        <td class="text-center">

                            <input
                                type="checkbox"
                                class="form-check-input check-empleado-nuevo"
                                value="${empleado.id_empleado}">

                        </td>

                        <td>${empleado.clave_empleado}</td>

                        <td>${empleado.nombre}</td>

                    </tr>

                `);

            });

        },

        error: function (xhr, status, error) {

            console.error(error);

        }

    });

}


//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosNuevos() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoNuevosEmpleados').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-nuevos tr').each(function () {

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

function seleccionarTodosEmpleadoNuevos() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosEmpleadosNuevos').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-nuevo:visible').prop('checked', $(this).prop('checked'));

    });

}

//===================================================
// FUNCIÓN PARA OBTENER LOS EMPLEADOS SELECCIONADOS
// Y SOLICITAR SU INFORMACIÓN COMPLETA.
//===================================================

function establecerNuevosEmpleados() {

    $("#btnEstablecerNuevosEmpleados").click(function () {

        let empleadosSeleccionados = [];

        // OBTENER LOS EMPLEADOS SELECCIONADOS

        $(".check-empleado-nuevo:checked").each(function () {

            empleadosSeleccionados.push({

                id_empleado: $(this).val()

            });

        });


        // VALIDAR QUE EXISTA AL MENOS UN EMPLEADO

        if (empleadosSeleccionados.length == 0) {

            Swal.fire({

                icon: "warning",

                title: "Seleccione al menos un empleado."

            });

            return;

        }

        // OBTENER LA INFORMACIÓN COMPLETA

        $.ajax({

            url: "../php/infoEmpleados.php",

            type: "POST",

            data: {

                accion: "obtenerInformacionNuevosEmpleados",

                empleados: JSON.stringify(empleadosSeleccionados)

            },

            dataType: "json",

            success: function (respuesta) {

                if (!respuesta.success) {

                    Swal.fire({

                        icon: "error",

                        title: respuesta.mensaje

                    });

                    return;

                }

                // Si la respuesta es exitosa, recorrer los empleados y agregarlos al arreglo de empleados 
                // dentro de cada departamento correspondiente en el JSON

                respuesta.empleados.forEach(empleado => {

                    // Recorrer el arreglo de departamentos en el JSON para encontrar el departamento correspondiente al empleado
                    jsonNomina10lbs.departamentos.forEach(departamento => {

                        // Si el id del departamento del empleado coincide con el id del departamento en el JSON, 
                        // agregar el empleado al arreglo de empleados de ese departamento

                        if (departamento.id_departamento == empleado.id_departamento && departamento.id_empresa == empleado.id_empresa) {

                            let nuevoEmpleado = {

                                id_empleado: empleado.id_empleado,
                                clave: empleado.clave_empleado,
                                id_biometrico: empleado.biometrico,
                                nombre: empleado.nombre + " " + empleado.ap_paterno + " " + empleado.ap_materno,
                                id_departamento: empleado.id_departamento,
                                id_empresa: empleado.id_empresa,
                                mostrar: true,

                                //Validamos si tiene seguro social, si no tiene, se asigna false, si tiene, se asigna true
                                seguroSocial: empleado.status_nss === "1" ? true : false

                            };

                            // Agregar el empleado al arreglo de empleados del departamento correspondiente
                            departamento.empleados.push(nuevoEmpleado);

                        }

                    });

                });

                // ORDENAR EMPLEADOS

                jsonNomina10lbs.departamentos.forEach(function (departamento) {

                    departamento.empleados.sort(function (a, b) {

                        return a.nombre.localeCompare(b.nombre, 'es', {
                            sensitivity: 'base'
                        });

                    });

                });

                asignarPropiedadesEmpleado(jsonNomina10lbs);

                llenarTablaNomina();

                // Cerrar el modal de nuevos empleados
                $('#modalNuevosEmpleados').modal('hide');

            },

            error: function (xhr) {

                console.error(xhr.responseText);

            }

        });

    });

}