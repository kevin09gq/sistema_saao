//Aqui Agrega los filtros para mostrar los empleados en la tabla, dependiendo del tipo de puesto que se quiera mostrar,
// Inicializar las funciones de este js
seleccionarDepartamento();
seleccionarPuesto();
buscarEmpleado();
limpiarBusqueda();
obtenerDepartamentos();
obtenerPuestos(7);
eventoSelectDepartamento();



/**
 * ================================================================
 * FILTRAR LA TABLA POR EL DEPARTAMENTO SELECCIONADO
 * ----------------------------------------------------------------
 *   - Se recupera el valor del select
 *   - Se pasa a la función que sirve para filtrar el json
 *   - Se pasa el json filtrado a la función que muestra la tabla
 * ================================================================
 */
function seleccionarDepartamento() {
    $(document).on("change", '#filtro_departamento', function (e) {
        e.preventDefault();

        let id_departamento = parseInt($(this).val());
        let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
        obtenerPuestos(id_departamento);
        mostrarDatosTabla(jsonFiltrado);
    });
}

function seleccionarPuesto() {
    $(document).on("change", '#filtro_puesto', function (e) {
        e.preventDefault();

        let id_puestoEspecial = parseInt($(this).val()); // Obtener id_puesto
        let id_departamento = parseInt($('#filtro_departamento').val()); // Obtener id_departamento

        // Primero filtra el departamento seleccionado
        let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
        // Luego filtra por puesto dentro del departamento filtrado
        jsonFiltrado = filtrarEmpleadosPorPuesto(jsonFiltrado, id_puestoEspecial);
        // Lo muestra en la tabla
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


/**
 * Función para filtrar empleados por id_departamento
 * @param {Object} jsonNomina - El JSON de nómina completo
 * @param {int} id_departamento - El ID del departamento por el cual filtrar
 * @returns {Object} Un nuevo JSON de nómina que solo incluye empleados del departamento especificado
 */
function filtrarEmpleadosPorDepartamento(jsonNomina, id_departamento) {
    let jsonFiltrado = {
        departamentos: []
    };

    if (jsonNomina && jsonNomina.departamentos) {
        jsonNomina.departamentos.forEach(departamento => {
            let depaFiltrado = {
                nombre: departamento.nombre,
                empleados: departamento.empleados.filter(empleado => empleado.id_departamento == id_departamento)
            }

            if (depaFiltrado.empleados.length > 0) {
                jsonFiltrado.departamentos.push(depaFiltrado);
            }
        });
    }

    return jsonFiltrado;
}

/**
 * Función para filtrar empleados por id_puestoEspecial
 * @param {Object} jsonNomina - El JSON de nómina completo
 * @param {int} id_puestoEspecial - El ID del puesto especial por el cual filtrar
 * @returns {Object} Un nuevo JSON de nómina que solo incluye empleados con el id_puestoEspecial especificado
 */
function filtrarEmpleadosPorPuesto(jsonNomina, id_puestoEspecial) {
    let jsonFiltrado = {
        departamentos: []
    };

    if (jsonNomina && jsonNomina.departamentos) {
        jsonNomina.departamentos.forEach(departamento => {
            let depaFiltrado;

            if (id_puestoEspecial == -1) {
                depaFiltrado = {
                    nombre: departamento.nombre,
                    empleados: departamento.empleados
                };
            } else {
                depaFiltrado = {
                    nombre: departamento.nombre,
                    empleados: departamento.empleados.filter(empleado => empleado.id_puestoEspecial == id_puestoEspecial)
                }
            }

            if (depaFiltrado.empleados.length > 0) {
                jsonFiltrado.departamentos.push(depaFiltrado);
            }
        });
    }

    return jsonFiltrado;
}


/** ============================= FUNCIONES AUXILIARES PARA OBTENER DATOS DE LOS SELECT ============================= */

/**
 * Función para llenar el select de departamentos
 */
function obtenerDepartamentos() {
    $.ajax({
        type: "GET",
        url: "../php/info-rancho.php",
        data: { accion: "obtenerDepartamento" },
        dataType: "json",
        success: function (response) {

            const data = response.data;
            let tmp = '';

            // El valor por defecto es el departamento 7 (Jornaleros), por eso se marca como selected
            data.forEach(element => {
                tmp += `<option ${element.id_departamento === 7 ? 'selected' : ''} value="${element.id_departamento}">${element.nombre_departamento}</option>`;
            });

            $('#filtro_departamento').html(tmp);

        }
    });
}

/**
 * Función para llenar el select de puestos
 * @param {int} id_departamento 
 */
function obtenerPuestos(id_departamento) {
    $.ajax({
        type: "GET",
        url: "../php/info-rancho.php",
        data: { accion: "obtenerPuesto", id_departamento: id_departamento },
        dataType: "json",
        success: function (response) {

            const data = response.data;
            let tmp = '<option value="-1">Seleccionar Puesto</option>';

            data.forEach(element => {
                tmp += `<option value="${element.id_puestoEspecial}">${element.nombre_puesto}</option>`;
            });

            $('#filtro_puesto').html(tmp);

        }
    });
}

/**
 * Función para detectar el cambio en el select de departamento y actualizar el select de puestos en consecuencia
 */
function eventoSelectDepartamento() {
    $(document).on("change", "#filtro_departamento", function (e) {
        const id_departamento = $(this).val();
        obtenerPuestos(id_departamento);
    });
}