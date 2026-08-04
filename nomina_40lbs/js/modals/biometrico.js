// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS
let empleadosSeleccionadosBiometrico = [];

$(document).ready(function () {
    abrirModalBiometrico();

    buscadorEmpleadosBiometrico();

    seleccionarTodosEmpleadosBiometrico();

    continuarBiometrico();

    regresarBiometrico();

    obtenerInformacionBiometrico();
});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE LISTA DE RAYA
//===================================================
function abrirModalBiometrico() {

    // Detectar el clic en el botón "Actualizar Lista de Raya"
    $('#btn_biometrico').click(function () {
        cargarEmpleadosBiometrico();
        // Abrir el modal de Bootstrap
        $('#modalBiometrico').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosBiometrico() {

    // Limpiar tabla
    $('#tbody-empleados-biometrico').empty();

    // Limpiar el checkbox principal
    $('#checkTodosBiometrico').prop('checked', false);

    // Recorrer departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {

        // Obtener únicamente los empleados que se mostrarán
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);

        // Si no hay empleados visibles, no mostrar el departamento
        if (empleadosMostrar.length === 0) {
            return;
        }

        // Encabezado del departamento
        $('#tbody-empleados-biometrico').append(`
            <tr class="table-secondary">
                <td colspan="3" class="fw-bold">
                    <i class="bi bi-building me-2"></i>
                    ${departamento.nombre}
                </td>
            </tr>
        `);

        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {

            $('#tbody-empleados-biometrico').append(`
                <tr>

                    <td class="text-center">
                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-biometrico"
                            value="${empleado.id_empleado}"
                             data-id-biometrico="${empleado.id_biometrico}">
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

function buscadorEmpleadosBiometrico() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoBiometrico').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-biometrico tr').each(function () {

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

//==============================================================
// FUNCIÓN PARA SELECCIONAR O DESELECCIONAR TODOS LOS EMPLEADOS
// SEGÚN EL ESTADO DEL CHECK PRINCIPAL.
//==============================================================

function seleccionarTodosEmpleadosBiometrico() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosBiometrico').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-biometrico:visible').prop('checked', $(this).prop('checked'));

    });

}

//===================================================
// FUNCIÓN PARA CONTINUAR AL SIGUIENTE PASO
// OBTIENE LOS EMPLEADOS SELECCIONADOS Y MUESTRA
// EL APARTADO PARA CARGAR EL ARCHIVO EXCEL.
//===================================================

function continuarBiometrico() {

    // Detectar clic en el botón Continuar
    $('#btnContinuarBiometrico').click(function () {

        // Limpiar el arreglo antes de volver a llenarlo
        empleadosSeleccionadosBiometrico = [];

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-biometrico:checked').each(function () {

            // Obtener la fila del empleado
            let fila = $(this).closest('tr');

            // Crear un objeto con la información del empleado
            let empleado = {

                id_empleado: $(this).val(),

                clave: fila.find('td:eq(1)').text(),

                nombre: fila.find('td:eq(2)').text(),

                id_biometrico: $(this).data('id-biometrico')


            };

            // Agregar el empleado al arreglo
            empleadosSeleccionadosBiometrico.push(empleado);

        });

        // Verificar si no se seleccionó ningún empleado
        if (empleadosSeleccionadosBiometrico.length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado para continuar."
            );

            return;

        }

        // Ocultar la lista de empleados
        $('#divListaEmpleadosBiometrico').hide();

        // Mostrar el apartado para cargar el archivo Excel
        $('#divSubirExcelBiometrico').show();

        // Ocultar el botón Continuar
        $('#btnContinuarBiometrico').hide();

        // Mostrar el botón Regresar
        $('#btnRegresarBiometrico').show();

    });

}

//===================================================
// FUNCIÓN PARA REGRESAR AL PRIMER PASO
// OCULTA EL APARTADO DE CARGA DEL EXCEL Y
// MUESTRA NUEVAMENTE LA LISTA DE EMPLEADOS.
//===================================================

function regresarBiometrico() {

    // Detectar clic en el botón Regresar
    $('#btnRegresarBiometrico').click(function () {

        // Ocultar el apartado para cargar el archivo Excel
        $('#divSubirExcelBiometrico').hide();

        // Mostrar nuevamente la lista de empleados
        $('#divListaEmpleadosBiometrico').show();

        // Mostrar el botón Continuar
        $('#btnContinuarBiometrico').show();

        // Ocultar el botón Regresar
        $('#btnRegresarBiometrico').hide();

    });

}

//===================================================
// FUNCIÓN PARA LEER EL ARCHIVO DE EXCEL
// ENVÍA EL ARCHIVO AL SERVIDOR Y MUESTRA
// EL RESULTADO EN LA CONSOLA.
//===================================================

function obtenerInformacionBiometrico() {
    $('#btnProcesarBiometrico').on('click', function (e) {
        e.preventDefault();


        // Obtener el archivo que seleccionó el usuario
        let archivo = $('#inputArchivoBiometrico')[0].files[0];

        // Verificar que el usuario haya seleccionado un archivo
        if (!archivo) {
            alert("Seleccione un archivo de Excel.");
            return;
        }

        // Crear un objeto FormData para enviar el archivo al PHP
        let datos = new FormData();

        // Agregar el archivo con el nombre "archivo_excel"
        // Este nombre debe ser el mismo que recibe el PHP:
        // $_FILES['archivo_excel']


        datos.append('archivo_excel', archivo);

        Swal.fire({

            title: 'Procesando archivo...',

            text: 'Espere un momento.',

            allowOutsideClick: false,

            allowEscapeKey: false,

            showConfirmButton: false,

            didOpen: () => {

                Swal.showLoading();

            }

        })

        // Enviar la información al archivo PHP
        $.ajax({

            // Archivo PHP que leerá el Excel
            url: '../php/leerBiometrico.php',

            // Método de envío
            type: 'POST',

            // Datos que se enviarán
            data: datos,

            // Necesario cuando se envían archivos
            processData: false,

            // Necesario cuando se envían archivos
            contentType: false,

            // Indicar que esperamos un JSON como respuesta
            dataType: 'json',

            // Si todo salió bien
            success: function (respuesta) {

                // Cerrar la alerta de procesamiento
                Swal.close();
                emplaeadosBiometrico = respuesta.empleados;
        
                // Comparar los empleados seleccionados con los empleados
                // obtenidos del archivo de Excel.
                // Comparar los empleados del biométrico
              compararEmpleadosBiometrico(empleadosSeleccionadosBiometrico, emplaeadosBiometrico);
            },

        });
    });

}

//======================================================
// FUNCIÓN PARA COMPARAR LOS EMPLEADOS SELECCIONADOS
// CON LOS EMPLEADOS OBTENIDOS DEL ARCHIVO DEL BIOMÉTRICO.
//======================================================

function compararEmpleadosBiometrico(empleadosSeleccionados, empleadosBiometrico) {

    // Recorrer los empleados seleccionados
    empleadosSeleccionados.forEach((empleadoSeleccionado) => {

        // Recorrer los empleados obtenidos del archivo
        empleadosBiometrico.forEach((empleadoBiometrico) => {

            // Comparar el id del biométrico
            if (empleadoSeleccionado.id_biometrico == empleadoBiometrico.id_biometrico) {
                
                // Si coincide, copiar la información
                copiarInformacionEmpleadoBiometrico(
                    empleadoSeleccionado,
                    empleadoBiometrico
                );

            }else {
               console.log(`No coincide el empleado ${empleadoSeleccionado.nombre} con el biométrico ${empleadoBiometrico.nombre}`);
            }

        });

    });

}

//===================================================
// FUNCIÓN PARA COPIAR LA INFORMACIÓN DEL BIOMÉTRICO
// AL EMPLEADO DENTRO DEL jsonNomina40lbs.
//===================================================

function copiarInformacionEmpleadoBiometrico(empleadoSeleccionado, empleadoBiometrico) {

    // Recorrer todos los departamentos
    jsonNomina40lbs.departamentos.forEach((departamento) => {

        // Recorrer todos los empleados
        departamento.empleados.forEach((empleado) => {

            // Buscar el empleado por su id_empleado
            if (empleado.id_empleado == empleadoSeleccionado.id_empleado) {

                // Guardar los registros del biométrico
                empleado.registros = empleadoBiometrico.registros;

                // Vaciamos los arreglos de olvidos de checador e inasistencias para recalcularlos
                empleado.historial_olvidos = [];
                empleado.historial_inasistencias = [];

               // Verificamos si jsonNomina40lbs.horarios_semanales existe y tiene datos
                if (jsonNomina40lbs.horarios_semanales && jsonNomina40lbs.horarios_semanales.length > 0) {
                    // Si existe, obtener Tabulador 
                    getTabulador();

                    // Redondear horarios y calcular sueldo neto
                    redondearRegistrosEmpleado(empleado);
                   
                }
            }

        });

    });

    llenarTablaNomina();

    // Cerrar el modal de biométrico
    $('#modalBiometrico').modal('hide');

}



