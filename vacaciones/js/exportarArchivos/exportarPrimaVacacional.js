//==================================================================================================
// EXPORTADOR DE HISTORIAL DE PRIMAS VACACIONALES A PDF
//==================================================================================================

function descargarPrimaVacacionalPDF(idEmpleado) {
    if (!idEmpleado) {
        Swal.fire({
            icon: 'warning',
            title: 'Error',
            text: 'ID de empleado no válido para exportar.'
        });
        return;
    }
    
    // Abre el archivo PHP generador de PDF en otra pestaña
    window.open(`../php/exportarArchivos/exportarPrimaVacacional.php?id_empleado=${idEmpleado}`, '_blank');
}
