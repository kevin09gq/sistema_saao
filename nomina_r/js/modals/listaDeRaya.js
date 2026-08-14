// ARREGLO QUE ALMACENARÁ LOS EMPLEADOS SELECCIONADOS
let empleadosSeleccionadosListaRaya = [];

$(document).ready(function () {
    abrirModalListaDeRaya();

    buscadorEmpleadosListaDeRaya();

    seleccionarTodosEmpleadosListaDeRaya();

    seleccionarDepartamentosListaRaya();

    continuarListaDeRaya();

    regresarListaDeRaya();

    obtenerInformacionListaDeRaya();
});


//===================================================
// FUNCIÓN PARA ABRIR EL MODAL DE LISTA DE RAYA
//===================================================

function abrirModalListaDeRaya() {

    // Detectar el clic en el botón "Actualizar Lista de Raya"
    $('#btn_lista_raya').click(function () {
        cargarEmpleadosListaDeRaya();
        // Abrir el modal de Bootstrap
        $('#modalListaRaya').modal('show');

    });

}

//===================================================
// FUNCIÓN PARA CARGAR LOS EMPLEADOS EN EL MODAL
// MUESTRA ÚNICAMENTE LOS EMPLEADOS CON LA PROPIEDAD
// "mostrar = true".
//===================================================

function cargarEmpleadosListaDeRaya() {

    // Limpiar tabla
    $('#tbody-empleados-lista-raya').empty();

    // Limpiar checkbox principal
    $('#checkTodosListaRaya').prop('checked', false);


    // Recorrer departamentos
    jsonNominaRelicario.departamentos.forEach(departamento => {


        // Obtener únicamente empleados visibles
        const empleadosMostrar = departamento.empleados.filter(emp => emp.mostrar);


        // Si no hay empleados visibles, no mostrar departamento
        if (empleadosMostrar.length === 0) {
            return;
        }


        // Encabezado del departamento con checkbox
        $('#tbody-empleados-lista-raya').append(`

            <tr class="table-secondary">

                <td colspan="3" class="fw-bold">

                    <input 
                        type="checkbox"
                        class="form-check-input me-2 check-departamento-lista-raya"
                        data-departamento="${departamento.id_departamento}">

                    <i class="bi bi-building me-2"></i>

                    ${departamento.nombre}

                </td>

            </tr>

        `);



        // Empleados del departamento
        empleadosMostrar.forEach(empleado => {


            $('#tbody-empleados-lista-raya').append(`

                <tr>

                    <td class="text-center">

                        <input
                            type="checkbox"
                            class="form-check-input check-empleado-lista-raya"
                            data-departamento="${departamento.id_departamento}"
                            value="${empleado.id_empleado}">

                    </td>


                    <td>${empleado.clave}</td>


                    <td>${empleado.nombre}</td>


                </tr>

            `);


        });


    });


    seleccionarDepartamentosListaRaya();

}


//===================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS POR CLAVE O NOMBRE
// FILTRA LOS EMPLEADOS CONFORME EL USUARIO ESCRIBE.
//===================================================

function buscadorEmpleadosListaDeRaya() {

    // Detectar cuando el usuario escribe en el cuadro de búsqueda
    $('#txtBuscarEmpleadoListaRaya').on('keyup', function () {

        // Obtener el texto escrito y convertirlo a minúsculas
        // para que la búsqueda no distinga entre mayúsculas y minúsculas.
        let texto = $(this).val().toLowerCase().trim();

        // Recorrer todas las filas de la tabla
        $('#tbody-empleados-lista-raya tr').each(function () {

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

function seleccionarTodosEmpleadosListaDeRaya() {

    // Detectar el cambio de estado del checkbox principal
    $('#checkTodosListaRaya').change(function () {

        // Cambiar el estado de todos los checkboxes de empleados visibles
        $('.check-empleado-lista-raya:visible').prop('checked', $(this).prop('checked'));

    });

}

//===================================================
// SELECCIONAR EMPLEADOS POR DEPARTAMENTO
//===================================================

function seleccionarDepartamentosListaRaya() {


    $('.check-departamento-lista-raya').off('change').on('change', function () {


        // Obtener el departamento seleccionado
        let idDepartamento = $(this).data('departamento');


        // Estado del checkbox
        let seleccionado = $(this).prop('checked');



        // Seleccionar únicamente empleados de ese departamento
        $(`.check-empleado-lista-raya[data-departamento="${idDepartamento}"]`)
            .prop('checked', seleccionado);



    });


}

//===================================================
// FUNCIÓN PARA CONTINUAR AL SIGUIENTE PASO
// OBTIENE LOS EMPLEADOS SELECCIONADOS Y MUESTRA
// EL APARTADO PARA CARGAR EL ARCHIVO EXCEL.
//===================================================

function continuarListaDeRaya() {

    // Detectar clic en el botón Continuar
    $('#btnContinuarListaRaya').click(function () {

        // Limpiar el arreglo antes de volver a llenarlo
        empleadosSeleccionadosListaRaya = [];

        // Recorrer todos los empleados seleccionados
        $('.check-empleado-lista-raya:checked').each(function () {

            // Obtener la fila del empleado
            let fila = $(this).closest('tr');

            // Crear un objeto con la información del empleado
            let empleado = {

                id_empleado: $(this).val(),

                clave: fila.find('td:eq(1)').text(),

                nombre: fila.find('td:eq(2)').text()

            };

            // Agregar el empleado al arreglo
            empleadosSeleccionadosListaRaya.push(empleado);

        });

        // Verificar si no se seleccionó ningún empleado
        if (empleadosSeleccionadosListaRaya.length === 0) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "Debes seleccionar al menos un empleado para continuar."
            );

            return;

        }

        // Ocultar la lista de empleados
        $('#divListaEmpleadosListaRaya').hide();

        // Mostrar el apartado para cargar el archivo Excel
        $('#divSubirExcelListaRaya').show();

        // Ocultar el botón Continuar
        $('#btnContinuarListaRaya').hide();

        // Mostrar el botón Regresar
        $('#btnRegresarListaRaya').show();

    });

}

//===================================================
// FUNCIÓN PARA REGRESAR AL PRIMER PASO
// OCULTA EL APARTADO DE CARGA DEL EXCEL Y
// MUESTRA NUEVAMENTE LA LISTA DE EMPLEADOS.
//===================================================

function regresarListaDeRaya() {

    // Detectar clic en el botón Regresar
    $('#btnRegresarListaRaya').click(function () {

        // Ocultar el apartado para cargar el archivo Excel
        $('#divSubirExcelListaRaya').hide();

        // Mostrar nuevamente la lista de empleados
        $('#divListaEmpleadosListaRaya').show();

        // Mostrar el botón Continuar
        $('#btnContinuarListaRaya').show();

        // Ocultar el botón Regresar
        $('#btnRegresarListaRaya').hide();

    });

}

//===================================================
// FUNCIÓN PARA LEER EL ARCHIVO DE EXCEL
// ENVÍA EL ARCHIVO AL SERVIDOR Y MUESTRA
// EL RESULTADO EN LA CONSOLA.
//===================================================

function obtenerInformacionListaDeRaya() {
    $('#btnProcesarListaRaya').on('click', function (e) {
        e.preventDefault();


        // Obtener el archivo que seleccionó el usuario
        let archivo = $('#inputArchivoListaRaya')[0].files[0];

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
            url: '../php/leerListaRaya.php',

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

                // Comparar los empleados seleccionados con los empleados
                // obtenidos del archivo de Excel.
                compararEmpleadosListaDeRaya(empleadosSeleccionadosListaRaya, respuesta.empleados);

            },

        });
    });

}

//===================================================
// FUNCIÓN PARA COMPARAR LOS EMPLEADOS SELECCIONADOS
// CON LOS EMPLEADOS OBTENIDOS DEL ARCHIVO DE EXCEL.
//===================================================

function compararEmpleadosListaDeRaya(empleadosSeleccionados, empleadosExcel) {

    // Recorrer uno por uno los empleados seleccionados
    empleadosSeleccionados.forEach(empleadoSeleccionado => {


        // Variable donde se guardará el empleado encontrado
        let empleadoEncontrado = null;

        // Variable para saber cuántos empleados tienen el mismo nombre
        let cantidadCoincidencias = 0;


        // ==========================================================
        // PRIMERA BÚSQUEDA
        // BUSCAR POR NOMBRE
        // ==========================================================

        empleadosExcel.forEach(empleadoExcel => {
            // Comparar los nombres
            if (

                normalizarNombreEmpleado(empleadoSeleccionado.nombre) ==
                normalizarNombreEmpleado(empleadoExcel.nombre)

            ) {

                // Aumentar el contador de coincidencias
                cantidadCoincidencias++;

                // Guardar temporalmente el empleado encontrado
                empleadoEncontrado = empleadoExcel;

            }

        });


        // ==========================================================
        // SI SOLAMENTE EXISTE UN EMPLEADO CON ESE NOMBRE
        // ==========================================================

        if (cantidadCoincidencias == 1) {

            // Copiar la información del empleado del Excel
            // al empleado seleccionado.
            copiarInformacionEmpleadoListaRaya(
                empleadoSeleccionado,
                empleadoEncontrado
            );

        }


        // ==========================================================
        // SI EXISTEN DOS O MÁS EMPLEADOS CON EL MISMO NOMBRE
        // (HOMÓNIMOS)
        // ==========================================================

        if (cantidadCoincidencias > 1) {

            // Volver a recorrer los empleados del Excel
            empleadosExcel.forEach(function (empleadoExcel) {

                // Comparar ahora por clave
                if (
                    empleadoSeleccionado.clave == empleadoExcel.clave &&
                    empleadoSeleccionado.nombre.trim().toUpperCase() ==
                    empleadoExcel.nombre.trim().toUpperCase()
                ) {

                    // Copiar la información correcta
                    copiarInformacionEmpleadoListaRaya(
                        empleadoSeleccionado,
                        empleadoExcel
                    );

                }

            });

        }

    });

}


//===================================================
// FUNCIÓN PARA NORMALIZAR NOMBRES
// CONVIERTE:
// "PEREZ GARCIA JUAN"
// "JUAN PEREZ GARCIA"
// EN EL MISMO FORMATO
//===================================================

function normalizarNombreEmpleado(nombre) {

    // Separar palabras
    let partes = nombre
        .trim()
        .toUpperCase()
        .split(/\s+/);


    // Ordenar alfabéticamente para ignorar el orden
    partes.sort();


    // Regresar nombre normalizado
    return partes.join(' ');

}


//===================================================
// FUNCIÓN PARA COPIAR LA INFORMACIÓN DEL EMPLEADO
// OBTENIDA DEL ARCHIVO DE EXCEL.

// FUNCIÓN PARA COPIAR LA INFORMACIÓN DEL EMPLEADO
// BUSCA EL EMPLEADO DENTRO DE jsonNominaRelicario
// Y ACTUALIZA SU TARJETA Y CONCEPTOS.
//===================================================

function copiarInformacionEmpleadoListaRaya(empleadoSeleccionado, empleadoExcel) {

    // Recorrer todos los departamentos
    jsonNominaRelicario.departamentos.forEach(departamento => {

        // Recorrer los empleados del departamento
        departamento.empleados.forEach(empleado => {
            // Comparar el id del empleado
            if (empleado.id_empleado == empleadoSeleccionado.id_empleado) {

                // Actualizar el importe de la tarjeta
                empleado.tarjeta = empleadoExcel.tarjeta;
                empleado.tarjeta_copia = empleadoExcel.tarjeta;

                // Actualizar los conceptos
                empleado.conceptos = empleadoExcel.conceptos;
                empleado.conceptos_copia = empleadoExcel.conceptos;

            }

        });

        // Refrescar la tabla de empleados para mostrar los cambios
        llenarTablaNomina();

        // Cerrar el modal de lista de raya
        $('#modalListaRaya').modal('hide');

    });

}