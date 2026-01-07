$(document).ready(function() {
    cargarRankingIncidencias('vacaciones'); // Por defecto, ranking de vacaciones

    // Cambiar ranking según selección
    $('#select_ranking').on('change', function() {
        const campo = $(this).val();
        cargarRankingIncidencias(campo);
    });
});

function cargarRankingIncidencias(campo) {
    $.ajax({
        url: '../php/obtener_ranking_incidencias.php',
        type: 'GET',
        data: { campo: campo },
        dataType: 'json',
        success: function(response) {
            mostrarRankingIncidencias(response, campo);
        },
        error: function(xhr, status, error) {
            $('#tbody_ranking').html('<tr><td colspan="6">Error al cargar ranking</td></tr>');
        }
    });
}

function mostrarRankingIncidencias(datos, campo) {
    const tbody = $('#tbody_ranking');
    tbody.empty();
    if (!datos || datos.length === 0) {
        tbody.html('<tr><td colspan="6">No hay datos para mostrar</td></tr>');
        return;
    }
    datos.forEach(function(emp, idx) {
        const fila = `<tr>
            <td>${idx + 1}</td>
            <td>${emp.nombre}</td>
            <td>${emp.total_vacaciones}</td>
            <td>${emp.total_ausencias}</td>
            <td>${emp.total_incapacidades}</td>
            <td>${emp.total_dias_trabajados}</td>
        </tr>`;
        tbody.append(fila);
    });
}
