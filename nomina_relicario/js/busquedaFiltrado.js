//Aqui Agrega los filtros para mostrar los empleados en la tabla, dependiendo del tipo de puesto que se quiera mostrar,
// Inicializar las funciones de este js
seleccionarPuesto();
buscarEmpleado();
limpiarBusqueda();




/**
 * ================================================================
 * FILTRAR LA TABLA POR EL TIPO DE PUESTO SELECCIONADO
 * ----------------------------------------------------------------
 *   - Se recupera el valor del select
 *   - Se pasa a la función que sirve para filtrar el json
 *   - Se pasa el json filtrado a la función que muestra la tabla
 * ================================================================
 */
function seleccionarPuesto() {
    $(document).on("change", '#filtro-puesto', function (e) {
        let idTipoPuestoSeleccionado = parseInt($(this).val());
        let jsonFiltrado = filtrarEmpleadosPorTipoPuesto(jsonNominaRelicario, idTipoPuestoSeleccionado);
        mostrarDatosTabla(jsonFiltrado);
    });
}


/**
 * ===============================================================
 * FILTRAR LA TABLA MEDIANTE LA BUSQUEDA DE TEXTO
 * ---------------------------------------------------------------
 *   - Se recupera el valor del input de búsqueda
 *   - filter es propia de JQuery y sirve para filtrar
 *   - toggle muestra o esconde la fila dependiendo si coincide
 *   - Oculta la paginación cuando hay búsqueda activa
 * ===============================================================
 */
function buscarEmpleado() {
    $("#busqueda-nomina-relicario").on("keyup", function () {
        // Pasa todo a minusculas solo para comparar
        let valor = $(this).val().toLowerCase();
        $("#tabla-nomina-body-relicario tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(valor) > -1);
        });

        // Ocultar o Mostrar la paginación
        if (valor.trim() !== '') {
            $('#paginacion-nomina').hide(); // Ocultar solo la paginación
        } else {
            $('#paginacion-nomina').show(); // Mostrar solo la paginación
        }
    });
}


/**
 * ================================================================
 * LIMPIAR LA BUSQUEDA DE TEXTO
 * ----------------------------------------------------------------
 *   - Al hacer click en el botón de limpiar, se borra el texto
 *   - Se muestran todas las filas de la tabla
 *   - Restaura la paginación original
 * ================================================================
 */
function limpiarBusqueda() {
    $(document).on("click", '#btn-clear-busqueda', function (e) {
        e.preventDefault();
        $("#busqueda-nomina-relicario").val("");

        // Mostrar la paginación
        $('#paginacion-nomina').show();

        // Volver a mostrar las filas de la tabla
        $("#tabla-nomina-body-relicario tr").show();
    });
}