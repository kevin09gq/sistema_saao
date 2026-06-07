// Sincronización automática de vacaciones en segundo plano al iniciar sesión 
$(document).ready(function () {
    
    $.post('/sistema_saao/vacaciones/php/sincronizar_vacaciones.php', function (response) {
        console.log("Sincronización de vacaciones:", response);
    }, 'json').fail(function (err) {
        console.error("Error al sincronizar vacaciones:", err);
    });
});
