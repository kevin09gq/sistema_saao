alternarTablasJornalero();
aplicarTotalHistorialJornalero();

// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y DIAS TRABAJADOS
// ========================================
function alternarTablasJornalero() {
    // BOTÓN BIOMÉTRICO: Mostrar registros biométricos del checador
    $('#btn-biometrico-jornaleros').on('click', function () {
        // Mostrar tabla biométrico
        $('#tabla-biometrico-jornaleros').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-dias-trabajados-jornaleros').attr('hidden', 'hidden');

        // Marcar botones: biométrico activo, horarios inactivo
        $(this).addClass('active');
        $('#btn-dias-trabajados-jornaleros').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-dias-trabajados-jornaleros').on('click', function () {
        // Ocultar tabla biométrico
        $('#tabla-biometrico-jornaleros').attr('hidden', 'hidden');
        // Mostrar tabla de horarios oficiales
        $('#tabla-dias-trabajados-jornaleros').removeAttr('hidden');

        // Marcar botones: horarios activo, biométrico inactivo
        $(this).addClass('active');
        $('#btn-biometrico-jornaleros').removeClass('active');
    });
}

// ========================================
// SUMAS AUTOMATICAS PERCEPCIONES EXTRA
// ========================================

sumasAutomaticasPercepcionesJornalero();

function sumasAutomaticasPercepcionesJornalero() {

    // Evento cuando cambia una percepción extra o la tardeada
    $(document).on('input', '.cantidad-percepcion, #mod-tardeada-jornalero', function () {
        calcularTotalPercepcionesEnTiempoRealJornalero();
    });
}

function calcularTotalPercepcionesEnTiempoRealJornalero() {

    // Sumar todas las percepciones extras
    let totalExtras = 0;
    $('#contenedor-conceptos-adicionales-jornalero').find('.cantidad-percepcion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalExtras += cantidad;
    });
    // incluir tardeada en percepciones
    const tardeada = parseFloat($('#mod-tardeada-jornalero').val()) || 0;
    totalExtras += tardeada;
    $('#mod-total-extra-jornalero').val(totalExtras.toFixed(2));
    calcularSueldoACobrarJornalero();
}

function calcularTotalExtra(empleado) {
    if (!empleado) return 0;

    let total = 0;

    // Sumar tardeada si existe
    if (empleado.tardeada !== undefined && empleado.tardeada !== null) {
        total += parseFloat(empleado.tardeada) || 0;
    }

    // Sumar percepciones_extra si existen
    if (Array.isArray(empleado.percepciones_extra)) {
        empleado.percepciones_extra.forEach(percepcion => {
            if (percepcion.cantidad !== undefined && percepcion.cantidad !== null) {
                total += parseFloat(percepcion.cantidad) || 0;
            }
        });
    }

    empleado.sueldo_extra_total = total.toFixed(2);
}

// ========================================
// SUMAS AUTOMATICAS DEDUCCIONES EXTRA
// ========================================

sumasAutomaticasDeduccionesJornalero();

function sumasAutomaticasDeduccionesJornalero() {

    // Evento cuando cambia una deducción extra
    $(document).on('input', '.cantidad-deduccion', function () {
        calcularTotalDeduccionesEnTiempoRealJornalero();
    });
}

function calcularTotalDeduccionesEnTiempoRealJornalero() {

    // Sumar todas las deducciones extras
    let totalDeducciones = 0;
    $('#contenedor-deducciones-adicionales-jornalero').find('.cantidad-deduccion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalDeducciones += cantidad;
    });

    $('#mod-fagafetcofia-jornalero').val(totalDeducciones.toFixed(2));
    calcularSueldoACobrarJornalero();
}

// ========================================
// SUMAS AUTOMATICAS CONCEPTOS
// ========================================

sumasAutomaticasConceptosJornalero();

function sumasAutomaticasConceptosJornalero() {
    // Evento cuando cambia un concepto (ISR, IMSS, INFONAVIT, AJUSTES)
    $(document).on('input', '#mod-isr-jornalero, #mod-imss-jornalero, #mod-infonavit-jornalero, #mod-ajustes-sub-jornalero', function () {
        calcularTotalConceptosEnTiempoRealJornalero();
    });
}

function calcularTotalConceptosEnTiempoRealJornalero() {
    // Obtener valores de cada concepto
    const isr = parseFloat($('#mod-isr-jornalero').val()) || 0;
    const imss = parseFloat($('#mod-imss-jornalero').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-jornalero').val()) || 0;
    const ajustes = parseFloat($('#mod-ajustes-sub-jornalero').val()) || 0;

    // Sumar todos los conceptos
    const totalConceptos = isr + imss + infonavit + ajustes;

    // Actualizar el total en el campo readonly
    $('#mod-total-conceptos-jornalero').val(totalConceptos.toFixed(2));
    calcularSueldoACobrarJornalero();
}


// ========================================
// ACTUALIZAR CONCEPTOS ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================
actualizarConceptosJornalero();

function actualizarConceptosJornalero() {
    $(document).on('click', '#btn-aplicar-isr-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '45') : null;
        if (!copia) {
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '45');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-isr-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });

    $(document).on('click', '#btn-aplicar-imss-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '52') : null;
        if (!copia) {
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '52');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-imss-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });

    $(document).on('click', '#mod-infonavit-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '16') : null;
        if (!copia) {
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '16');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-infonavit-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });

    $(document).on('click', '#btn-aplicar-ajuste-sub-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '107') : null;
        if (!copia) {
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '107');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-ajustes-sub-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });


    $(document).on('click', '#btn-aplicar-tarjeta-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copiaTarjeta = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? empleado.tarjeta_copia : null;
        if (copiaTarjeta === null) {
            return;
        }

        // Actualizar la propiedad tarjeta con el valor de tarjeta_copia
        empleado.tarjeta = copiaTarjeta;
        // Actualizar input del modal
        $('#mod-tarjeta-jornalero').val(copiaTarjeta);
        calcularSueldoACobrarJornalero();
    });
}


// ========================================
// VALIDAR CONCEPTOS MAXIMO ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================

function validarConceptoMaxJornalero(inputSelector, codigo) {
    $(document).on('input', inputSelector, function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === String(codigo)) : null;
        if (!copia) return;

        const maxVal = parseFloat(copia.resultado) || 0;
        const $this = $(this);
        let val = parseFloat($this.val()) || 0;
        if (val > maxVal) {
            $this.val(maxVal);
        }
    });
}
function validarConceptoMaxTarjetaJornalero() {
    $(document).on('input', '#mod-tarjeta-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const maxVal = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? parseFloat(empleado.tarjeta_copia) : null;
        if (maxVal === null) return;

        const $this = $(this);
        let val = parseFloat($this.val()) || 0;
        if (val > maxVal) {
            $this.val(maxVal);
        }
    });

}

validarConceptoMaxJornalero('#mod-isr-jornalero', '45');
validarConceptoMaxJornalero('#mod-imss-jornalero', '52');
validarConceptoMaxJornalero('#mod-infonavit-jornalero', '16');
validarConceptoMaxJornalero('#mod-ajustes-sub-jornalero', '107');
validarConceptoMaxTarjetaJornalero();


// ========================================
// APLICAR TOTAL DEL HISTORIAL
// ========================================

function aplicarTotalHistorialJornalero() {

    // Checador: suma de descuento_olvido en historial_olvidos
    $(document).on('click', '#btn-aplicar-checador-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();
        if (!empleado) return;

        const totalChecador = Array.isArray(empleado.historial_olvidos)
            ? empleado.historial_olvidos.reduce(function (suma, olvido) {
                return suma + (parseFloat(olvido.descuento_olvido) || 0);
            }, 0)
            : 0;

        $('#mod-checador-jornalero').val(totalChecador.toFixed(2));
        empleado.checador = totalChecador;
        calcularSueldoACobrarJornalero();
    });

}


// ========================================
// CALCULAR SUELDO A COBRAR
// ========================================

inicializarSueldoACobrarJornalero();

// Registra todos los eventos que deben disparar el recálculo del sueldo a cobrar
function inicializarSueldoACobrarJornalero() {

    // Escuchar cambios directos en sueldo semanal
    $(document).on('input', '#mod-sueldo-semanal-jornalero, #mod-pasaje-jornalero', calcularSueldoACobrarJornalero);

    // Escuchar cambios en todas las deducciones editables
    $(document).on('input',
        '#mod-tarjeta-jornalero, #mod-prestamo-jornalero, #mod-checador-jornalero, ' +
        '#mod-retardos-jornalero, ' +
        '#mod-permisos-jornalero, #mod-fagafetcofia-jornalero',
        calcularSueldoACobrarJornalero
    );

    // Mostrar/ocultar opciones de redondeo y recalcular al activar el checkbox
    $(document).on('change', '#mod-redondear-sueldo-jornalero', function () {
        if ($(this).is(':checked')) {
            $('#mod-redondeo-opciones-jornalero').show();
        } else {
            $('#mod-redondeo-opciones-jornalero').hide();
        }
        calcularSueldoACobrarJornalero();
    });

    // Recalcular al cambiar el modo de redondeo
    $(document).on('change', '#mod-redondeo-modo-jornalero', calcularSueldoACobrarJornalero);
}

// Calcula y actualiza el campo "Sueldo a Cobrar" con todos los valores actuales del modal
function calcularSueldoACobrarJornalero() {

    // ---- PERCEPCIONES ----
    const sueldoSemanal = parseFloat($('#mod-sueldo-semanal-jornalero').val()) || 0;
    const pasaje = parseFloat($('#mod-pasaje-jornalero').val()) || 0;
    const comida = parseFloat($('#mod-comida-jornalero').val()) || 0;
    const sueldoExtra = parseFloat($('#mod-total-extra-jornalero').val()) || 0;
    const totalPercepciones = sueldoSemanal + pasaje + comida + sueldoExtra;

    // ---- CONCEPTOS (ISR, IMSS, INFONAVIT, AJUSTE AL SUB) ----
    const totalConceptos = parseFloat($('#mod-total-conceptos-jornalero').val()) || 0;

    // ---- DEDUCCIONES ----
    const tarjeta = parseFloat($('#mod-tarjeta-jornalero').val()) || 0;
    const prestamo = parseFloat($('#mod-prestamo-jornalero').val()) || 0;
    const checador = parseFloat($('#mod-checador-jornalero').val()) || 0;
    const retardos = parseFloat($('#mod-retardos-jornalero').val()) || 0;
    const permisos = parseFloat($('#mod-permisos-jornalero').val()) || 0;
    const uniforme = parseFloat($('#mod-uniforme-jornalero').val()) || 0;
    const fagafetcofia = parseFloat($('#mod-fagafetcofia-jornalero').val()) || 0;
    const totalDeducciones = tarjeta + prestamo + checador + retardos + permisos + uniforme + fagafetcofia;

    // ---- CÁLCULO FINAL ----
    const totalSinRedondear = totalPercepciones - totalConceptos - totalDeducciones;

    // Delegar al redondeo (que también actualiza el campo y persiste en empleado)
    aplicarRedondeoJornalero(totalSinRedondear);
}

// ========================================
// APLICAR REDONDEO AL SUELDO A COBRAR
// ========================================


function aplicarRedondeoJornalero(totalSinRedondear) {
    const redondeoActivo = $('#mod-redondear-sueldo-jornalero').is(':checked');

    let totalFinal;
    let diferencia;

    if (redondeoActivo) {
        totalFinal = Math.round(totalSinRedondear);                          // ej. 10
        diferencia = parseFloat((totalFinal - totalSinRedondear).toFixed(2)); // ej. -0.49 o +0.50
    } else {
        totalFinal = totalSinRedondear;
        diferencia = 0;
    }

    // Actualizar campo visible
    $('#mod-sueldo-a-cobrar-jornalero').val(totalFinal.toFixed(2));

    // Persistir en el objeto empleado
    const empleado = objEmpleadoJornalero.getEmpleado();
    if (empleado) {
        empleado.redondeo_activo = redondeoActivo;
        empleado.redondeo = diferencia;   // negativo si se restó, positivo si se sumó
        empleado.total_cobrar = totalFinal;   // valor final que se cobra
    }
}



// ========================================
// LIMPIAR MODAL JORNALERO
// ========================================
function limpiarModalJornalero() {
    // ========================================
    // LIMPIAR TAB: TRABAJADOR (Información del empleado)
    // ========================================
    $('#campo-clave-jornaleros').text('');
    $('#campo-nombre-jornaleros').text('');
    $('#campo-departamento-jornaleros').text('');
    $('#campo-puesto-jornaleros').text('');
    $('#campo-id-empresa-jornaleros').val('');
    $('#nombre-jornalero-modal').text('');

    // ========================================
    // LIMPIAR TAB: REGISTROS (Tablas)
    // ========================================
    // Limpiar tabla biométrica
    $('#tbody-biometrico-jornaleros').empty();

    // Limpiar tabla de días trabajados
    $('#tbody-dias-trabajados-jornaleros').empty();

    // ========================================
    // LIMPIAR EVENTOS ESPECIALES
    // ========================================
    $('#entradas-tempranas-jornaleros').empty();
    $('#salidas-tardias-jornaleros').empty();
    $('#salidas-tempranas-jornaleros').empty();
    $('#olvidos-checador-jornaleros').empty();
    $('#retardos-jornaleros').empty();
    $('#inasistencias-content-jornaleros').empty();

    // Limpiar totales de eventos
    $('#total-entradas-tempranas-jornaleros').text('0');
    $('#total-salidas-tardias-jornaleros').text('0');
    $('#total-salidas-tempranas-jornaleros').text('0');
    $('#total-olvidos-checador-jornaleros').text('0');
    $('#total-retardos-jornaleros').text('0');
    $('#total-inasistencias-jornaleros').text('0');

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Percepciones)
    // ========================================
    // Limpiar sueldo semanal
    $('#mod-sueldo-semanal-jornalero').val('');

    // Limpiar pasaje
    $('#mod-pasaje-jornalero').val('');

    // Limpiar tardeada
    $('#mod-tardeada-jornalero').val('');

    // Limpiar total extra
    $('#mod-total-extra-jornalero').val('');

    // Limpiar todos los inputs de percepciones adicionales
    $('#contenedor-conceptos-adicionales-jornalero').find('input').val('');

    // Limpiar contenedor de conceptos adicionales
    $('#contenedor-conceptos-adicionales-jornalero').empty();

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Conceptos)
    // ========================================
    $('#mod-isr-jornalero').val('');
    $('#mod-imss-jornalero').val('');
    $('#mod-infonavit-jornalero').val('');
    $('#mod-ajustes-sub-jornalero').val('');
    $('#mod-total-conceptos-jornalero').val('');

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Deducciones)
    // ========================================
    $('#mod-tarjeta-jornalero').val('');
    $('#mod-prestamo-jornalero').val('');
    $('#mod-retardos-jornalero').val('');
    $('#mod-checador-jornalero').val('');
    $('#mod-permisos-jornalero').val('');
    $('#mod-uniforme-jornalero').val('');
    $('#mod-fagafetcofia-jornalero').val('');

    // Limpiar historiales de deducciones
    $('#contenedor-historial-olvidos-jornaleros').empty();
    $('#contenedor-historial-retardos-jornaleros').empty();
    $('#contenedor-historial-permisos-jornalero').empty();
    $('#contenedor-historial-uniforme-jornalero').empty();

    // Limpiar contenedor de deducciones adicionales
    $('#contenedor-deducciones-adicionales-jornalero').empty();

    // ========================================
    // LIMPIAR: SUELDO A COBRAR
    // ========================================
    // Desmarcar checkbox de redondeo
    $('#mod-redondear-sueldo-jornalero').prop('checked', false);

    // Ocultar opciones de redondeo
    $('#mod-redondeo-opciones-jornalero').hide();

    // Resetear modo de redondeo
    $('#mod-redondeo-modo-jornalero').val('abajo');

    // Limpiar sueldo a cobrar
    $('#mod-sueldo-a-cobrar-jornalero').val('');
}
