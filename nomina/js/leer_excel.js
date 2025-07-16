$(document).ready(function () {
    $('#btn_cargar_excel').on('click', function (e) {
        e.preventDefault(); // Evita que el formulario se envíe de forma tradicional
        var formData = new FormData($('#form_excel')[0]); // Obtiene el archivo seleccionado
        // Envia el archivo por AJAX al backend PHP
        $.ajax({
            url: '../php/leer_excel_backend.php', // Archivo PHP que procesa el Excel
            type: 'POST',
            data: formData,
            processData: false, // Necesario para enviar archivos
            contentType: false, // Necesario para enviar archivos
            success: function (res) {
                // Si la respuesta es un JSON válido, lo muestra en consola
                try {
                    const json = JSON.parse(res);
                    console.log(json); // Aquí verás el resultado: departamentos y empleados
                } catch (e) {
                    // Si hay error, muestra el texto recibido
                    console.error('No es un JSON válido:', res);
                }
            },
            error: function (err) {
                // Si hay error en la petición AJAX
                console.error('Error al leer el archivo:', err);
            }
        });
    });

    $('#btn_cargar_excel2').on('click', function (e) {
        e.preventDefault();
        var formData = new FormData($('#form_excel2')[0]);
        $.ajax({
            url: '../php/leer_excel_horario.php', // Archivo PHP para el segundo Excel
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                try {
                    const json = JSON.parse(res);
                    console.log(json); // Resultado del segundo archivo
                } catch (e) {
                    console.error('No es un JSON válido:', res);
                }
            },
            error: function (err) {
                console.error('Error al leer el archivo:', err);
            }
        });
    });

});