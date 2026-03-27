
filtrarEmpleados();

function filtrarEmpleados() {
    // Evento cuando cambia el departamento
    $('#filtro-departamento').on('change', function () {
        aplicarFiltros();
    });

    // Evento cuando se escribe en el buscador (tiempo real)
    $('#busqueda-nomina-40lbs').on('input', function () {
        aplicarFiltros();
    });

    // Evento para limpiar la búsqueda
    $('#btn-clear-busqueda').on('click', function () {
        $('#busqueda-nomina-40lbs').val('');
        aplicarFiltros();
    });
}

/**
 * Función centralizada que lee todos los filtros activos 
 * (departamento y búsqueda) y actualiza la tabla.
 */
function aplicarFiltros() {
    const valorSelect = $('#filtro-departamento').val();
    const busqueda = $('#busqueda-nomina-40lbs').val() || '';

    // Si no hay JSON de nómina, no hacer nada
    if (typeof jsonNomina40lbs === 'undefined' || jsonNomina40lbs === null) {
        return;
    }

    // Mapear el valor del select a id_departamento y seguroSocial
    let idDepartamento = null;
    let seguroSocial = null;

    if (valorSelect === '1') {
        idDepartamento = 4;
        seguroSocial = true;
    } else if (valorSelect === '2') {
        idDepartamento = 4;
        seguroSocial = false;
    } else if (valorSelect === '3') {
        idDepartamento = 5;
        seguroSocial = true;
    } else if (valorSelect === '4') {
        idDepartamento = 5;
        seguroSocial = false;
    }

    // Reiniciar a la página 1 al filtrar
    if (typeof paginaActualNomina !== 'undefined') {
        paginaActualNomina = 1;
    }

    // Filtrar usando la función extendida en showDataTable.js
    const jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNomina40lbs, idDepartamento, seguroSocial, busqueda);

    // Mostrar datos en la tabla
    mostrarDatosTabla(jsonFiltrado, 1);
}

