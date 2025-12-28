$(document).ready(function () {
    modalNuevosPrestmamos();
    listarEmpleados();
    calcularMontoSemanal();
    guardarPrestamo();
    cargarTablaPrestamos();
    obtenerDepartamentos();
    inicializarFiltros();
    actualizarEstadisticas(); // Cargar estadísticas iniciales
    inicializarPaginacion(); // Inicializar paginación
    inicializarModalActualizar(); // Inicializar modal de actualización
});

function modalNuevosPrestmamos(){
$("#btnNuevoPrestamo").click(function (e) { 
    e.preventDefault();
   //Abre el modal de nuevos prestamos
    $("#modalNuevoPresupuesto").modal("show"); 
});
}

function cargarTablaPrestamos() {
    // Petición al servidor para obtener los préstamos en JSON
    $.ajax({
        url: '../php/obtenerPrestamos.php',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            let tbody = $('#tablaPrestamosBody');
            tbody.empty();

            if (!data || data.length === 0) {
                tbody.append('<tr><td colspan="9" class="text-center">No hay préstamos registrados</td></tr>');
                return;
            }

            // Construir filas (usar índice secuencial en lugar del id de BD)
            data.forEach(function (p, index) {
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

            // Aplicar paginación después de cargar los datos
            aplicarPaginacion();
        },
        error: function () {
            console.error('Error al obtener préstamos');
        }
    });
}
