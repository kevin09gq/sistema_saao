
filtrarEmpleados();

/**************************************
 * FUNCIONES DE FILTRADO DE EMPLEADOS
 **************************************/


function filtrarEmpleados() {
    // Evento cuando cambia el departamento
    $('#filtro-departamento').on('change', function () {
        aplicarFiltros();
    });

    // Evento cuando se escribe en el buscador (tiempo real)
    $('#busqueda-nomina-10lbs').on('input', function () {
        aplicarFiltros();
    });

    // Evento para limpiar la búsqueda
    $('#btn-clear-busqueda').on('click', function () {
        $('#busqueda-nomina-10lbs').val('');
        aplicarFiltros();
    });
}

/**************************************
 *  POBRAR SELECT DEPARTAMENTOS ASIGNADOS A LA NOMINA
 **************************************/

function poblarSelectDepartamentos(json) {
    if (!json || !json.departamentos) return;

    const $select = $('#filtro-departamento');
    const valorActual = $select.val();
    $select.empty();

    // Organizar departamentos por tipo de empleados que contienen y agregar directamente como opciones
    json.departamentos.forEach(depto => {
        const id = depto.id_departamento || depto.nombre;
        const nombre = depto.nombre;

        const tieneConSeguro = depto.empleados.some(emp => emp.seguroSocial === true);
        const tieneSinSeguro = depto.empleados.some(emp => emp.seguroSocial === false);

        if (tieneConSeguro) {
            $select.append(`<option value="${id}|true">${nombre} CSS</option>`);
        }
        if (tieneSinSeguro) {
            $select.append(`<option value="${id}|false">${nombre} SSS</option>`);
        }
    });

    // Restaurar valor previo si es posible
    if (valorActual && $select.find(`option[value="${valorActual}"]`).length > 0) {
        $select.val(valorActual);
    }
}

/**************************************
 * OBTIENE UN JSON FILTRADO DE EMPLEADOS DE ACUERDO AL DEPARTAMENTO SELECCIONADO Y BÚSQUEDA
 **************************************/

function filtrarEmpleadosPorDepartamento(jsonNomina, filtroDepto, seguroSocial = true, busqueda = '') {
    let jsonFiltrado = {
        departamentos: []
    };

    const normalizar = (texto) => {
        return String(texto || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const terminoBusqueda = normalizar(busqueda);

    if (jsonNomina && jsonNomina.departamentos) {
        jsonNomina.departamentos.forEach(depto => {
            // 1. Filtrar por departamento (si no es 'all')
            if (filtroDepto !== null && filtroDepto !== 'all') {
                const matchId = depto.id_departamento && String(depto.id_departamento) === String(filtroDepto);
                const matchNombre = depto.nombre && String(depto.nombre) === String(filtroDepto);
                if (!matchId && !matchNombre) return;
            }

            let empleadosFiltrados = depto.empleados.filter(emp => {
                // 2. Filtrar por seguroSocial
                if (seguroSocial !== null && emp.seguroSocial !== seguroSocial) {
                    return false;
                }

                // 3. Filtrar por búsqueda de nombre
                if (terminoBusqueda !== '') {
                    const nombreNormalizado = normalizar(emp.nombre);
                    if (!nombreNormalizado.includes(terminoBusqueda)) {
                        return false;
                    }
                }

                return true;
            });

            if (empleadosFiltrados.length > 0) {
                jsonFiltrado.departamentos.push({
                    ...depto,
                    empleados: empleadosFiltrados
                });
            }
        });
    }

    return jsonFiltrado;
}

/**************************************
 *  FUNCIONES MUESTRA EMPLEADOS DE ACUERDO AL DEPARTAMENTO SELECCIONADO Y BÚSQUEDA 
 **************************************/

function aplicarFiltros() {
    const valorSelect = $('#filtro-departamento').val() || 'all|all';
    const busqueda = $('#busqueda-nomina-10lbs').val() || '';

    // Si no hay JSON de nómina, no hacer nada
    if (typeof jsonNomina10lbs === 'undefined' || jsonNomina10lbs === null) {
        return;
    }

    // Mapear el valor del select a filtroDepto y seguroSocial
    let filtroDepto = 'all';
    let seguroSocial = null;

    if (valorSelect !== 'all|all') {
        const partes = valorSelect.split('|');
        filtroDepto = partes[0];
        seguroSocial = partes[1] === 'true';
    }

    // Reiniciar a la página 1 al filtrar
    if (typeof paginaActualNomina !== 'undefined') {
        paginaActualNomina = 1;
    }

    // Filtrar usando la función extendida en showDataTable.js
    const jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNomina10lbs, filtroDepto, seguroSocial, busqueda);

    // Mostrar datos en la tabla
    mostrarDatosTabla(jsonFiltrado, 1);
}


function refrescarTabla() {
    const valorSelect = $('#filtro-departamento').val() || 'all|all';
    let filtroDepto = 'all';
    let seguroSocial = null;

    if (valorSelect !== 'all|all') {
        const partes = valorSelect.split('|');
        filtroDepto = partes[0];
        seguroSocial = partes[1] === 'true';
    }

    // Obtener término de búsqueda actual
    const busqueda = $('#busqueda-nomina-10lbs').val() || '';

    // Aplicar filtro y mostrar tabla con página actual
    const jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonNomina10lbs, filtroDepto, seguroSocial, busqueda);
    mostrarDatosTabla(jsonFiltrado, paginaActualNomina);
}
