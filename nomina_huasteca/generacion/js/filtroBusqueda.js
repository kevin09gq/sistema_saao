//=====================================================
// FUNCIÓN PARA CARGAR EL SELECT DE DEPARTAMENTOS.
//=====================================================

function cargarFiltroDepartamentos() {

    // Limpiar el contenido del select
    $('#filtro-departamento').empty();

    // Lista de departamentos a agregar
    const nuevosDepartamentos = [
        { id_departamento: 800, nombre: "Corte", empleados: [] },
        { id_departamento: 801, nombre: "Poda", empleados: [] }
    ];

    // Recorremos cada uno y lo agregamos solo si no existe
    nuevosDepartamentos.forEach(dep => {
        const existe = jsonNominaHuasteca.departamentos.some(
            d => d.id_departamento === dep.id_departamento
        );
        if (!existe) {
            jsonNominaHuasteca.departamentos.push(dep);
        }
    });

    // Recorrer todos los departamentos
    jsonNominaHuasteca.departamentos.forEach(departamento => {

        // Agregar la opción de empleados
        $('#filtro-departamento').append(`
            <option value="${departamento.id_departamento}">
                ${departamento.nombre}
            </option>
        `);


    });

}

//=====================================================
//FUNCIÓN PARA DETECTAR EL CAMBIO DEL SELECT.
//CADA VEZ QUE EL USUARIO CAMBIE DE DEPARTAMENTO
//SE MOSTRARÁN LOS EMPLEADOS CORRESPONDIENTES.
//=====================================================

function eventoFiltroDepartamento() {

    $('#filtro-departamento').change(function () {

        // Obtener el id del departamento seleccionado
        let id_departamento = parseInt($(this).val());

        switch (id_departamento) {
            case 800:
                // Se oculta la tabla de nomina normal
                $("#tabla-nomina-container-huasteca").prop("hidden", true);
                // Se oculta la tabla de Poda
                $("#tabla_poda_container").prop("hidden", true);
                // Se muestra la tabla de corte
                $("#tabla-corte-container").prop("hidden", false);
                mostrarDatosTablaCorte(jsonNominaHuasteca);
                break;

            case 801:
                // Se oculta la tabla de nomina normal
                $("#tabla-nomina-container-huasteca").prop("hidden", true);
                // Se oculta la tabla de corte
                $("#tabla-corte-container").prop("hidden", true);
                // Se muestra la tabla de Poda
                $("#tabla_poda_container").prop("hidden", false);
                mostrarDatosTablaPoda(jsonNominaHuasteca);
                break;

            default:
                // HACER VISIBLE LA TABLA DE NOMINA NORMAL
                $("#tabla-nomina-container-huasteca").prop("hidden", false);
                // Se oculta la tabla de corte
                $("#tabla-corte-container").prop("hidden", true);
                // Se muestra la tabla de Poda
                $("#tabla_poda_container").prop("hidden", true);
                // Regresar a la primera página
                paginaActual = 1;
                // Volver a llenar la tabla
                llenarTablaNomina();
                break;
        }

    });

}

//=====================================================
// FUNCIÓN PARA FILTRAR LOS EMPLEADOS
//MIENTRAS EL USUARIO ESCRIBE EN EL BUSCADOR.
//=====================================================

function eventoBusquedaEmpleado() {

    $('#busqueda-nomina-huasteca').on('keyup', function (e) {
        e.preventDefault();

        // Regresar a la primera página
        paginaActual = 1;

        // Actualizar la tabla
        llenarTablaNomina();

    });

}

//=====================================================
//FUNCIÓN PARA LIMPIAR EL TEXTO DEL BUSCADOR.
//=====================================================

function limpiarBusqueda() {

    $('#btn-clear-busqueda').click(function () {

        // Limpiar el campo de búsqueda
        $('#busqueda-nomina-huasteca').val('');

        // Regresar a la primera página
        paginaActual = 1;

        // Actualizar la tabla
        llenarTablaNomina();

    });

}