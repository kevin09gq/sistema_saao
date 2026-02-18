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

// ========================================
// SUMAS AUTOMATICAS PERCEPCIONES EXTRA
// ========================================

sumasAutomaticasPercepciones();

function sumasAutomaticasPercepciones() {

    // Evento cuando cambia una percepción extra
    $(document).on('input', '.cantidad-percepcion', function () {
        calcularTotalPercepcionesEnTiempoReal();
    });
}

function calcularTotalPercepcionesEnTiempoReal() {
   
    // Sumar todas las percepciones extras
    let totalExtras = 0;
    $('#contenedor-conceptos-adicionales-coordinador').find('.cantidad-percepcion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalExtras += cantidad;
    });
;
    $('#mod-total-extra-coordinador').val(totalExtras.toFixed(2));
}

// ========================================
// SUMAS AUTOMATICAS CONCEPTOS
// ========================================

sumasAutomaticasConceptos();

function sumasAutomaticasConceptos() {
    // Evento cuando cambia un concepto (ISR, IMSS, INFONAVIT, AJUSTES)
    $(document).on('input', '#mod-isr-coordinador, #mod-imss-coordinador, #mod-infonavit-coordinador, #mod-ajustes-sub-coordinador', function () {
        calcularTotalConceptosEnTiempoReal();
    });
}

function calcularTotalConceptosEnTiempoReal() {
    // Obtener valores de cada concepto
    const isr = parseFloat($('#mod-isr-coordinador').val()) || 0;
    const imss = parseFloat($('#mod-imss-coordinador').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-coordinador').val()) || 0;
    const ajustes = parseFloat($('#mod-ajustes-sub-coordinador').val()) || 0;
    
    // Sumar todos los conceptos
    const totalConceptos = isr + imss + infonavit + ajustes;
    
    // Actualizar el total en el campo readonly
    $('#mod-total-conceptos-coordinador').val(totalConceptos.toFixed(2));
}

// ========================================
// LIMPIAR MODAL COORDINADOR
// ========================================
function limpiarModalCoordinador() {
    // ========================================
    // LIMPIAR TAB: TRABAJADOR (Información del empleado)
    // ========================================
    $('#campo-clave-coordinadores').text('');
    $('#campo-nombre-coordinadores').text('');
    $('#campo-departamento-coordinadores').text('');
    $('#campo-puesto-coordinadores').text('');
    $('#campo-id-empresa-coordinadores').val('');
    $('#nombre-empleado-modal').text('');
    
    // ========================================
    // LIMPIAR TAB: REGISTROS (Tablas)
    // ========================================
    // Limpiar tabla biométrica
    $('#tbody-biometrico-coordinadores').empty();
    
    // Limpiar tabla horarios oficiales
    $('#tbody-horarios-oficiales-coordinadores').empty();
    
    // Limpiar inputs de copia rápida
    $('#input-entrada-copiar-coordinadores').val('');
    $('#input-salida-comida-copiar-coordinadores').val('');
    $('#input-entrada-comida-copiar-coordinadores').val('');
    $('#input-salida-copiar-coordinadores').val('');
    
    // ========================================
    // LIMPIAR EVENTOS ESPECIALES
    // ========================================
    $('#entradas-tempranas-coordinadores').empty();
    $('#salidas-tardias-coordinadores').empty();
    $('#salidas-tempranas-coordinadores').empty();
    $('#olvidos-checador-coordinadores').empty();
    $('#retardos-coordinadores').empty();
    $('#faltas-content-coordinadores').empty();
    $('#analisis-permisos-comida-content-coordinadores').empty();
    
    // Limpiar totales de eventos
    $('#total-entradas-tempranas-coordinadores').text('0');
    $('#total-salidas-tardias-coordinadores').text('0');
    $('#total-salidas-tempranas-coordinadores').text('0');
    $('#total-olvidos-checador-coordinadores').text('0');
    $('#total-retardos-coordinadores').text('0');
    $('#total-faltas-coordinadores').text('0');
    $('#total-analisis-permisos-comida-coordinadores').text('0');
    
    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Percepciones)
    // ========================================
    // Limpiar sueldo semanal
    $('#mod-sueldo-semanal-coordinador').val('');
    
    // Limpiar total extra
    $('#mod-total-extra-coordinador').val('');
    
    // Limpiar todos los inputs de percepciones adicionales
    $('#contenedor-conceptos-adicionales-coordinador').find('input').val('');
    
    // Limpiar contenedor de conceptos adicionales
    $('#contenedor-conceptos-adicionales-coordinador').empty();

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (conceptos)
    // ========================================
    $('#mod-isr-coordinador').val('');
    $('#mod-imss-coordinador').val('');
    $('#mod-infonavit-coordinador').val('');
    $('#mod-ajustes-sub-coordinador').val('');
    $('#mod-total-conceptos-coordinador').val('');

    // ========================================
    // LIMPIAR: SUELDO A COBRAR
    // ========================================
    // Desmarcar checkbox de redondeo
    $('#mod-redondear-sueldo-coordinador').prop('checked', false);
    
    // Ocultar opciones de redondeo
    $('#mod-redondeo-opciones-coordinador').hide();
    
    // Resetear modo de redondeo
    $('#mod-redondeo-modo-coordinador').val('nearest');
    
    // Limpiar sueldo a cobrar
    $('#mod-sueldo-a-cobrar-coordinador').val('');
}
