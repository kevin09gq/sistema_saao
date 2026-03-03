alternarTablas();



// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y HORARIOS OFICIALES
// ========================================
function alternarTablas() {
    // BOTÓN BIOMÉTRICO: Mostrar registros biométricos del checador
    $('#btn-biometrico-40lbs').on('click', function () {
        // Mostrar tabla biométrico
        $('#tabla-biometrico-40lbs').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-biometrico-redondeado').attr('hidden', 'hidden');

        // Marcar botones: biométrico activo, horarios inactivo
        $(this).addClass('active');
        $('#btn-biometrico-redondeado-40lbs').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-biometrico-redondeado-40lbs').on('click', function () {
        // Ocultar tabla biométrico
        $('#tabla-biometrico-40lbs').attr('hidden', 'hidden');
        // Mostrar tabla de horarios oficiales
        $('#tabla-biometrico-redondeado').removeAttr('hidden');

        // Marcar botones: horarios activo, biométrico inactivo
        $(this).addClass('active');
        $('#btn-biometrico-40lbs').removeClass('active');
    });
}
