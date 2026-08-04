$(document).ready(function () {
    filtrarEmpleados();
});

//====================================
// CONFIGURACION DE LLENADO DEL SELECT
//==================================== 

// FUNCION PARA POBLAR EL SELECT DE DEPARTAMENTOS CON LOS DEPARTAMENTOS ASIGNADOS A LA NOMINA, MOSTRANDO SI SON CON O SIN SEGURO SOCIAL
function poblarSelectDepartamentos(json) {
    if (!json || !json.departamentos) return;

    const $select = $('#filtro-departamento');
    const valorActual = $select.val();
    $select.empty();

    // Organizar departamentos por tipo de empleados que contienen y agregar directamente como opciones
    json.departamentos.forEach(depto => {
        // Solo mostrar departamentos con la propiedad editar: true
        if (depto.editar !== true) return;

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




//====================================
// CONFIGURACION DE FILTRADO DE EMPLEADOS
//==================================== 

// FUNCION PARA FILTRAR EMPLEADOS DE ACUERDO AL DEPARTAMENTO SELECCIONADO Y BÚSQUEDA EN TIEMPO REAL
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

// FUNCION PARA FILTRAR EMPLEADOS DE ACUERDO AL DEPARTAMENTO SELECCIONADO, SEGURO SOCIAL Y BÚSQUEDA
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

// FUNCION PARA APLICAR LOS FILTROS SELECCIONADOS Y MOSTRAR LOS RESULTADOS EN LA TABLA
function aplicarFiltros() {
    const valorSelect = $('#filtro-departamento').val() || 'all|all';
    const busqueda = $('#busqueda-nomina-40lbs').val() || '';

    // Si no hay JSON de nómina, no hacer nada
    if (typeof jsonHistorialNomina === 'undefined' || jsonHistorialNomina === null) {
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
    const jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonHistorialNomina, filtroDepto, seguroSocial, busqueda);

    // Mostrar datos en la tabla
    mostrarDatosTabla(jsonFiltrado, 1);
}

// FUNCION PARA REFRESCAR LA TABLA DESPUES DE APLICAR FILTROS O REALIZAR BUSQUEDAS, MANTENIENDO LA PAGINA ACTUAL SI ES POSIBLE
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
    const busqueda = $('#busqueda-nomina-40lbs').val() || '';

    // Aplicar filtro y mostrar tabla con página actual
    const jsonFiltrado = filtrarEmpleadosPorDepartamento(jsonHistorialNomina, filtroDepto, seguroSocial, busqueda);
    mostrarDatosTabla(jsonFiltrado, paginaActualNomina);
}
