//==================================================================================================
// CONTROLADOR PARA EXPORTAR EL REPORTE DE KARDEX EN PDF
//==================================================================================================

$(document).ready(function () {
    $('#btnExportarKardexPdf').on('click', function (e) {
        e.preventDefault();
        
        if (!empleadoActual || !empleadoActual.id_empleado) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'No hay información del empleado cargada para exportar.'
            });
            return;
        }
        
        // Abrir el reporte en una pestaña nueva para su visualización y descarga
        window.open(`../php/exportarArchivos/exportarKardex.php?id_empleado=${empleadoActual.id_empleado}`, '_blank');
    });
});
