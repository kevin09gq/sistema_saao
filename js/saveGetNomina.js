function saveNomina40lbs(){

    const jsonData = jsonNomina40lbs;
    const numeroSemana = jsonData.numero_semana;
    
    // IMPORTANTE: Usar fecha_cierre para determinar el año (NO fecha_inicio)
    // Esto es crítico para semanas que cruzan el cambio de año
    // Ejemplo: Semana 1 del 2026 que va del 27/Dic/2025 al 02/Ene/2026
    let anio = null;
    if (jsonData.fecha_cierre) {
        const partes = jsonData.fecha_cierre.split('/');
        anio = parseInt(partes[2]);
        if (!anio || isNaN(anio)) {
            anio = new Date().getFullYear();
        }
    } else if (jsonData.fecha_inicio) {
        // Fallback solo si no existe fecha_cierre
        const partes = jsonData.fecha_inicio.split('/');
        anio = parseInt(partes[2]);
        if (!anio || isNaN(anio)) {
            anio = new Date().getFullYear();
        }
    } else {
        anio = new Date().getFullYear();
    }
    
    // Log para debugging
    console.log('=== GUARDANDO NÓMINA ===');
    console.log('Semana:', numeroSemana);
    console.log('Año extraído:', anio);
    console.log('Fecha inicio:', jsonData.fecha_inicio);
    console.log('Fecha cierre:', jsonData.fecha_cierre);
    console.log('=========================')

    $.ajax({
        url: '../php/saveGetNomina.php',
        type: 'POST',
        data: JSON.stringify({
            id_empresa: 1,
            numero_semana: numeroSemana,
            anio: anio,
            nomina: JSON.stringify(jsonData),
            actualizar: true,
            case: 'guardarNomina' // Agregar el caso para identificar la función en el servidor
        }),
        contentType: 'application/json; charset=UTF-8',
        success: function (response) {
            // Asegurarse de que la respuesta sea un objeto JSON
            if (typeof response === 'string') {
                response = JSON.parse(response);
            }

            if (response.success) {
                Swal.fire({
                    title: 'Éxito',
                    text: response.message || 'Nómina guardada exitosamente.',
                    icon: 'success'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.message || 'Error al guardar la nómina.',
                    icon: 'error'
                });
            }
        },
        error: function (xhr, status, error) {
            Swal.fire({
                title: 'Error',
                text: `Error de comunicación con el servidor: ${error}`,
                icon: 'error'
            });
        }
    });

}