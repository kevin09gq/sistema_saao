// Función para actualizar las estadísticas
function actualizarEstadisticas(filtros) {
    $.ajax({
        url: '../php/estadisticas.php',
        type: 'POST',
        dataType: 'json',
        data: filtros || {},
        success: function(data) {
            // Actualizar los números en las tarjetas
            $('.stat-card .stat-icon.activo').next('.stat-info').find('.stat-number').text(data.activos || 0);
            $('.stat-card .stat-icon.pendiente').next('.stat-info').find('.stat-number').text(data.pendientes || 0);
            $('.stat-card .stat-icon.total').next('.stat-info').find('.stat-number').text('$' + (parseFloat(data.total_prestado || 0).toLocaleString('es-MX', {minimumFractionDigits: 0})));
            $('.stat-card .stat-icon.pagado').next('.stat-info').find('.stat-number').text(data.pagados || 0);
        },
        error: function() {
            console.error('Error al obtener estadísticas');
        }
    });
}
