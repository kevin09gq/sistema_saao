function obtenerDepartamentos() {

      $.ajax({
        type: "POST",
        url: "../../public/php/obtenerDepartamentos.php",
        

        success: function (response) {
            if (!response.error) {
                let departamentos = JSON.parse(response);
                // Opción para mostrar todos los departamentos
                let opciones = ``;
                opciones += `
                <option value="0">Todos</option>
                `;

                // Agrega cada departamento como opción en el select
                departamentos.forEach((element) => {
                    opciones += `
                    <option value="${element.id_departamento}">${element.nombre_departamento}</option>
                `;
                });

                // Llena el select con las opciones
                $("#filtroDepartamento").html(opciones);
  
            }
        },


    });
}

// Funcion para aplicar filtros y actualizar la tabla
function aplicarFiltros() {
    // Leer valores de los filtros
    let busqueda = $('#buscarPrestamo').val() || '';
    let estado = $('#filtroEstado').val() || '';
    let fecha = $('#filtroFecha').val() || '';
    let departamento = $('#filtroDepartamento').val() || '';
    let seguro = $('#filtroSeguro').val() || '';

    let filtros = {
        busqueda: busqueda,
        estado: estado,
        fecha: fecha,
        departamento: departamento,
        seguro: seguro
    };

    // Actualizar estadísticas con los mismos filtros
    actualizarEstadisticas(filtros);

    $.ajax({
        url: '../php/busqueda_filtrado.php',
        type: 'POST',
        dataType: 'json',
        data: filtros,
        success: function(data) {
            let tbody = $('#tablaPrestamosBody');
            tbody.empty();

            if (!data || data.length === 0) {
                tbody.append('<tr><td colspan="9" class="text-center">No hay préstamos que coincidan</td></tr>');
                resetearPaginacion();
                return;
            }

            data.forEach(function(p, index) {
                let semanasPagadas = parseInt(p.semanas_pagadas) || 0;
                let semanasTotales = parseInt(p.semanas_totales) || 0;
                let progresoPercent = semanasTotales > 0 ? Math.round((semanasPagadas / semanasTotales) * 100) : 0;

                let fila = `
                <tr data-id="${p.id_prestamo}">
                    <td>#${index + 1}</td>
                    <td>
                        <div class="empleado-info">
                            <strong>${p.nombre_completo}</strong>
                            <span>Clave: ${p.clave_empleado}</span>
                        </div>
                    </td>
                    <td>$${parseFloat(p.monto_total).toFixed(2)}</td>
                    <td>${p.semanas_totales}</td>
                    <td>$${parseFloat(p.monto_semanal).toFixed(2)}</td>
                    <td><span class="badge ${p.estado}">${p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}</span></td>
                    <td>${p.fecha_inicio}</td>
                    <td>
                        <div class="progreso-container">
                            <div class="progreso-barra">
                                <div class="progreso-fill" style="width: ${progresoPercent}%"></div>
                            </div>
                            <span class="progreso-texto">${semanasPagadas}/${semanasTotales} pagos</span>
                        </div>
                    </td>
                    <td>
                        <div class="acciones">
                            <button class="btn-accion ver" title="Ver detalles"><i class="bi bi-eye"></i></button>
                            <button class="btn-accion editar" title="Editar"><i class="bi bi-pencil"></i></button>
                            <button class="btn-accion eliminar" title="Cancelar"><i class="bi bi-x-lg"></i></button>
                        </div>
                    </td>
                </tr>
                `;

                tbody.append(fila);
            });

            // Aplicar paginación después de cargar los datos filtrados
            resetearPaginacion();
        },
        error: function() {
            console.error('Error en filtrado');
        }
    });
}

// Debounce helper
function debounce(fn, delay) {
    let timer = null;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() { fn.apply(context, args); }, delay);
    };
}

// Conectar eventos a los filtros
function inicializarFiltros() {
    // actualizar al cambiar selects
    $('#filtroEstado, #filtroFecha, #filtroDepartamento, #filtroSeguro').on('change', aplicarFiltros);

    // buscar con debounce
    $('#buscarPrestamo').on('keyup', debounce(function() { aplicarFiltros(); }, 300));
}
