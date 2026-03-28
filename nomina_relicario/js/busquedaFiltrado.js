//Aqui Agrega los filtros para mostrar los empleados en la tabla, dependiendo del tipo de puesto que se quiera mostrar,
// Inicializar las funciones de este js
seleccionarDepartamento();
seleccionarPuesto();
buscarEmpleado();
limpiarBusqueda();
obtenerDepartamentos();
obtenerPuestos(7);
eventoSelectDepartamento();



// ========================================
// CARGAR DATA EN SELECTS DE FILTRADO
// ========================================

function obtenerDepartamentos() {
    $.ajax({
        type: "GET",
        url: "../php/info-rancho.php",
        data: { accion: "obtenerDepartamento" },
        dataType: "json",
        success: function (response) {

            const data = response.data;

            // Se agrega el departamento de Corte de forma manual, ya que no se encuentra en la base de datos, pero es necesario para el filtro
            data.push({
                "id_departamento": 800,
                "nombre_departamento": "Corte",
                "id_area": 2
            });

            let tmp = '';

            // El valor por defecto es el departamento 7 (Jornaleros), por eso se marca como selected
            data.forEach(element => {
                tmp += `<option ${element.id_departamento === 7 ? 'selected' : ''} value="${element.id_departamento}">${element.nombre_departamento}</option>`;
            });

            $('#filtro_departamento').html(tmp);

        }
    });
}

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

        if (id_departamento !== 800) {
            // Se muestra la tabla de nomina normal
            $("#tabla-nomina-container-relicario").prop("hidden", false);
            // Se oculta la tabla de corte
            $("#tabla-corte-container-relicario").prop("hidden", true);

            // Filtrar el JSON por el departamento seleccionado
            let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
            obtenerPuestos(id_departamento);
            window.paginaActualNomina = 1; // Resetear a página 1
            mostrarDatosTabla(jsonFiltrado);
        } else {
            // Se oculta la tabla de nomina normal
            $("#tabla-nomina-container-relicario").prop("hidden", true);
            // Se muestra la tabla de corte
            $("#tabla-corte-container-relicario").prop("hidden", false);

            mostrarDatosTablaCorte(jsonNominaRelicario);

        }

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
        // Resetear a página 1
        window.paginaActualNomina = 1;
        // Lo muestra en la tabla
        mostrarDatosTabla(jsonFiltrado);
    });
}


/**
 * ===============================================================
 * FILTRAR LA TABLA MEDIANTE LA BUSQUEDA DE TEXTO
 * ---------------------------------------------------------------
 *   - Obtiene: valor búsqueda, departamento y puesto seleccionados
 *   - Aplica filtros secuencialmente: departamento → puesto → búsqueda
 *   - Renderiza el JSON filtrado en la tabla (página 1)
 *   - Oculta paginación si hay búsqueda, la muestra si está vacía
 * ===============================================================
 */
function buscarEmpleado() {
    $("#busqueda-nomina-relicario").on("keyup", function () {
        aplicarFiltrosActuales();
    });
}

/**
 * ===============================================================
 * APLICAR TODOS LOS FILTROS ACTUALES (DEPARTAMENTO, PUESTO, BUSQUEDA)
 * ---------------------------------------------------------------
 *   - Centraliza la lógica de filtrado para ser usada tras búsquedas
 *     o ediciones de datos.
 * ===============================================================
 */
function aplicarFiltrosActuales() {
    // Obtener valores de los filtros
    let textoBusqueda = $("#busqueda-nomina-relicario").val().toLowerCase().trim();
    let id_departamento = parseInt($('#filtro_departamento').val());
    let id_puestoEspecial = parseInt($('#filtro_puesto').val());

    // Paso 1: Filtrar por departamento
    let resultado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);

    // Paso 2: Filtrar por puesto
    resultado = filtrarEmpleadosPorPuesto(resultado, id_puestoEspecial);

    // Paso 3: Filtrar por búsqueda (si hay texto)
    if (textoBusqueda !== '') {
        resultado = filtrarEmpleadosPorBusqueda(resultado, textoBusqueda);
        $('#paginacion-nomina').hide(); // Sin paginación en búsqueda
        window.paginaActualNomina = 1; // Resetear a página 1 en búsqueda
    } else {
        $('#paginacion-nomina').show(); // Con paginación normal
    }

    // Mostrar los resultados
    mostrarDatosTabla(resultado, window.paginaActualNomina || 1);
}

/**
 * ===============================================================
 * Función auxiliar: filtrar JSON por búsqueda de texto
 * ===============================================================
 */
function filtrarEmpleadosPorBusqueda(jsonNomina, textoBusqueda) {
    let resultado = {
        departamentos: []
    };

    jsonNomina.departamentos.forEach(depto => {
        let empleadosFiltrados = depto.empleados.filter(emp => {
            let nombre = (emp.nombre || '').toLowerCase();
            let clave = (emp.clave || '').toLowerCase();

            return nombre.includes(textoBusqueda) || clave.includes(textoBusqueda);
        });

        if (empleadosFiltrados.length > 0) {
            resultado.departamentos.push({
                nombre: depto.nombre,
                empleados: empleadosFiltrados
            });
        }
    });

    return resultado;
}


/**
 * ================================================================
 * LIMPIAR LA BUSQUEDA DE TEXTO
 * ----------------------------------------------------------------
 *   - Borra el texto del input de búsqueda
 *   - Restaura los filtros actuales de departamento y puesto
 *   - Vuelve a mostrar paginación
 * ================================================================
 */
function limpiarBusqueda() {
    $(document).on("click", '#btn-clear-busqueda', function (e) {
        e.preventDefault();

        // Limpiar el input
        $("#busqueda-nomina-relicario").val("");

        // Obtener filtros actuales
        let id_departamento = parseInt($('#filtro_departamento').val());
        let id_puestoEspecial = parseInt($('#filtro_puesto').val());

        // Aplicar filtros nuevamente
        let resultado = filtrarEmpleadosPorDepartamento(jsonNominaRelicario, id_departamento);
        resultado = filtrarEmpleadosPorPuesto(resultado, id_puestoEspecial);

        // Mostrar resultados y restaurar paginación
        window.paginaActualNomina = 1;
        mostrarDatosTabla(resultado, 1);
        $('#paginacion-nomina').show();
    });
}



// ========================================
// FUNCIONES DE FILTRADO POR DEPARTAMENTO Y PUESTO
// ========================================
// Estas funciones filtran el JSON de nómina según:
// - Departamento seleccionado
// - Puesto especial dentro del departamento
// Ambas retornan un JSON filtrado que se pasa a mostrarDatosTabla()
// ========================================
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


function eventoSelectDepartamento() {
    $(document).on("change", "#filtro_departamento", function (e) {
        const id_departamento = $(this).val();
        obtenerPuestos(id_departamento);
    });
}