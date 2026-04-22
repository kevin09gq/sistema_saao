$(document).ready(function () {
    inicializarEventosFiltros();
});

function cargarSelectsConfianza() {
    return $.when(cargarDepartamentos(), cargarEmpresas());
}

function cargarDepartamentos() {
    return $.ajax({
        url: '../php/infoNomina.php',
        type: 'GET',
        data: { case: 'obtenerDepartamentosNomina', id_nomina: 3 },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                const $select = $('#filtro-departamento');
                $select.empty();

                response.departamentos.forEach(dept => {
                    $select.append(`<option value="${dept.id_departamento}">${dept.nombre_departamento}</option>`);
                });
            } else {
                console.error('Error al cargar departamentos:', response.error);
            }
        },
        error: function (error) {
            console.error('Error en la petición de departamentos:', error);
        }
    });
}

function cargarEmpresas() {
    return $.ajax({
        url: '../php/infoNomina.php',
        type: 'GET',
        data: { case: 'obtenerEmpresas' },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                const $select = $('#filtro-empresa');
                $select.empty();
                $select.append('<option value="all">Todas las Empresas</option>');

                response.empresas.forEach(emp => {
                    $select.append(`<option value="${emp.id_empresa}">${emp.nombre_empresa}</option>`);
                });
            } else {
                console.error('Error al cargar empresas:', response.error);
            }
        },
        error: function (error) {
            console.error('Error en la petición de empresas:', error);
        }
    });
}


function filtrarEmpleadosPorDepartamento(jsonNomina, id_departamento) {
    let jsonFiltrado = {
        ...jsonNomina,
        departamentos: []
    };

    if (jsonNomina && jsonNomina.departamentos) {
        jsonNomina.departamentos.forEach(departamento => {
            let depaFiltrado = {
                nombre: departamento.nombre,
                id_departamento: departamento.id_departamento,
                empleados: departamento.empleados.filter(empleado => {
                    // Filtrar estrictamente por el ID del departamento seleccionado
                    return empleado.id_departamento == id_departamento;
                })
            }

            if (depaFiltrado.empleados.length > 0) {
                jsonFiltrado.departamentos.push(depaFiltrado);
            }
        });
    }

    return jsonFiltrado;
}

function inicializarEventosFiltros() {
    // Eventos para los selects - Resetear a página 1
    $('#filtro-departamento, #filtro-empresa').on('change', function () {
        paginaActualNomina = 1;
        aplicarFiltrosConfianza(1);
    });

    // Evento para la búsqueda (con delay para rendimiento) - Resetear a página 1
    let timeoutBusqueda;
    $('#busqueda-nomina-confianza').on('keyup', function () {
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(function () {
            paginaActualNomina = 1;
            aplicarFiltrosConfianza(1);
        }, 300);
    });

    // Botón para limpiar búsqueda - Resetear a página 1
    $('#btn-clear-busqueda').on('click', function () {
        $('#busqueda-nomina-confianza').val('');
        paginaActualNomina = 1;
        aplicarFiltrosConfianza(1);
    });
}

function aplicarFiltrosConfianza(pagina) {
    if (!jsonNominaConfianza) return;

    // Determinar qué página mostrar (usar la global si no se pasa una específica)
    const paginaDestino = pagina || (typeof paginaActualNomina !== 'undefined' ? paginaActualNomina : 1);
    if (typeof paginaActualNomina !== 'undefined') {
        paginaActualNomina = paginaDestino;
    }

    let id_departamento = $('#filtro-departamento').val();
    let id_empresa = $('#filtro-empresa').val();
    let busqueda = $('#busqueda-nomina-confianza').val().toLowerCase().trim();

    // 1. Filtrar por Departamento (usando tu lógica)
    let jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNominaConfianza, id_departamento);

    // 2. Filtrar por Empresa y Búsqueda sobre el JSON ya filtrado por departamento
    jsonFiltrado.departamentos.forEach(depto => {
        depto.empleados = depto.empleados.filter(emp => {
            // Filtro de empresa
            const cumpleEmpresa = (id_empresa === 'all' || emp.id_empresa == id_empresa);

            // Filtro de búsqueda (nombre o clave)
            const cumpleBusqueda = (busqueda === '' ||
                emp.nombre.toLowerCase().includes(busqueda) ||
                (emp.clave && emp.clave.toString().includes(busqueda)));

            return cumpleEmpresa && cumpleBusqueda;
        });
    });

    // Limpiar departamentos que se quedaron sin empleados después del segundo filtro
    jsonFiltrado.departamentos = jsonFiltrado.departamentos.filter(d => d.empleados.length > 0);

    // Mostrar en tabla usando la página decidida
    mostrarDatosTabla(jsonFiltrado, paginaDestino);
}