alternarTablas();
editarHorariosOficiales();
copiarHorariosATodos();


// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y HORARIOS OFICIALES
// ========================================
function alternarTablas() {
    // BOTÓN BIOMÉTRICO: Mostrar registros biométricos del checador
    $('#btn-biometrico-coordinadores').on('click', function () {
        // Mostrar tabla biométrico
        $('#tabla-biometrico-coordinadores').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-horarios-oficiales-coordinadores').attr('hidden', 'hidden');

        // Marcar botones: biométrico activo, horarios inactivo
        $(this).addClass('active');
        $('#btn-horarios-oficiales-coordinadores').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-horarios-oficiales-coordinadores').on('click', function () {
        // Ocultar tabla biométrico
        $('#tabla-biometrico-coordinadores').attr('hidden', 'hidden');
        // Mostrar tabla de horarios oficiales
        $('#tabla-horarios-oficiales-coordinadores').removeAttr('hidden');

        // Marcar botones: horarios activo, biométrico inactivo
        $(this).addClass('active');
        $('#btn-biometrico-coordinadores').removeClass('active');
    });
}

// ========================================
// EDITAR HORARIOS OFICIALES: Click en celda = Input time
// ========================================
function editarHorariosOficiales() {
    // Delegación de eventos: click en cualquier celda de la tabla de horarios
    $(document).on('click', '#tbody-horarios-oficiales-coordinadores td', function () {
        // No editar si la celda contiene el nombre del día (primera columna)
        if ($(this).index() === 0) {
            return;
        }

        // Guardar el valor original
        const valorOriginal = $(this).text().trim();
        
        // Crear input de tipo time
        const $input = $('<input>', {
            type: 'time',
            class: 'form-control form-control-sm',
            value: valorOriginal || ''
        });

        // Reemplazar contenido de la celda con el input
        $(this).html('').append($input);
        
        // Enfocar el input automáticamente
        $input.focus();

        // Guardar valor cuando se pierde el foco
        $input.on('blur', function () {
            const nuevoValor = $(this).val() || '-';
            $(this).parent('td').text(nuevoValor);
        });

        // Guardar valor al presionar Enter
        $input.on('keypress', function (e) {
            if (e.which === 13) { // Enter
                $(this).blur();
            }
        });
    });
}

// ========================================
// COPIAR HORARIOS A TODAS LAS FILAS (LUNES A SÁBADO)
// ========================================
function copiarHorariosATodos() {
    $('#btn-copiar-horarios-coordinadores').on('click', function () {
        // Obtener valores de los inputs de copia rápida
        const entrada = $('#input-entrada-copiar-coordinadores').val();
        const salidaComida = $('#input-salida-comida-copiar-coordinadores').val();
        const entradaComida = $('#input-entrada-comida-copiar-coordinadores').val();
        const salida = $('#input-salida-copiar-coordinadores').val();

        // Iterar sobre las filas de lunes a sábado (excluyendo domingo)
        $('#tbody-horarios-oficiales-coordinadores tr:not(:last-child)').each(function () {
            // Obtener todas las celdas de la fila (excluyendo la primera que es el día)
            const $celdas = $(this).find('td');

            // Asignar valores a cada celda (índices: 1=entrada, 2=salida_comida, 3=entrada_comida, 4=salida)
            $celdas.eq(1).text(entrada || '-');
            $celdas.eq(2).text(salidaComida || '-');
            $celdas.eq(3).text(entradaComida || '-');
            $celdas.eq(4).text(salida || '-');
        });

        
    });
}
