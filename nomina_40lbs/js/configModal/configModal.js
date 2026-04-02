alternarTablas();
sumasAutomaticasPercepciones();
sumasAutomaticasDeducciones();
sumasAutomaticasConceptos();
actualizarConceptos();
aplicarTotalHistorial();
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


// ========================================
// SUMAS AUTOMATICAS PERCEPCIONES EXTRA
// ========================================

function sumasAutomaticasPercepciones() {

    // Evento cuando cambia cualquier percepción extra
    $(document).on('input', '.cantidad-percepcion', function () {
        calcularTotalPercepcionesEnTiempoReal();
    });

    // Evento cuando cambian horas extras, bono o actividades especiales
    $(document).on('input', '#mod-horas-extras-40lbs, #mod-bono-antiguedad-40lbs, #mod-actividades-especiales-40lbs, #mod-puesto-40lbs', function () {
        calcularTotalPercepcionesEnTiempoReal();
    });
}

function calcularTotalPercepcionesEnTiempoReal() {

    // Sumar percepciones extras del contenedor
    let totalExtras = 0;
    $('#contenedor-conceptos-adicionales-40lbs').find('.cantidad-percepcion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalExtras += cantidad;
    });

    // Sumar horas extras
    const horasExtras = parseFloat($('#mod-horas-extras-40lbs').val()) || 0;
    totalExtras += horasExtras;

    // Sumar bono de antiguedad
    const bonoAntiguedad = parseFloat($('#mod-bono-antiguedad-40lbs').val()) || 0;
    totalExtras += bonoAntiguedad;

    // Sumar actividades especiales
    const actividadesEspeciales = parseFloat($('#mod-actividades-especiales-40lbs').val()) || 0;
    totalExtras += actividadesEspeciales;

    // Sumar puesto
    const puesto = parseFloat($('#mod-puesto-40lbs').val()) || 0;
    totalExtras += puesto;

    // Establecer el total en el campo
    $('#mod-total-extra-40lbs').val(totalExtras.toFixed(2));
    calcularSueldoACobrar();
}

// ========================================
// SUMAS AUTOMATICAS DEDUCCIONES EXTRA
// ========================================

function sumasAutomaticasDeducciones() {

    // Evento cuando cambia una deducción extra
    $(document).on('input', '.cantidad-deduccion', function () {
        calcularTotalDeduccionesEnTiempoReal();
    });
}

function calcularTotalDeduccionesEnTiempoReal() {

    // Sumar todas las deducciones extras
    let totalDeducciones = 0;
    $('#contenedor-deducciones-adicionales-40lbs').find('.cantidad-deduccion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalDeducciones += cantidad;
    });

    $('#mod-fagafetcofia-40lbs').val(totalDeducciones.toFixed(2));
    calcularSueldoACobrar();
}


// ========================================
// SUMAS AUTOMATICAS CONCEPTOS
// ========================================

function sumasAutomaticasConceptos() {
    // Evento cuando cambia un concepto (ISR, IMSS, INFONAVIT, AJUSTES)
    $(document).on('input', '#mod-isr-40lbs, #mod-imss-40lbs, #mod-infonavit-40lbs, #mod-ajustes-sub-40lbs', function () {
        calcularTotalConceptosEnTiempoReal();
    });
}


function calcularTotalConceptosEnTiempoReal() {
    // Obtener valores de cada concepto
    const isr = parseFloat($('#mod-isr-40lbs').val()) || 0;
    const imss = parseFloat($('#mod-imss-40lbs').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-40lbs').val()) || 0;
    const ajustes = parseFloat($('#mod-ajustes-sub-40lbs').val()) || 0;

    // Sumar todos los conceptos
    const totalConceptos = isr + imss + infonavit + ajustes;

    // Actualizar el total en el campo readonly
    $('#mod-total-conceptos-40lbs').val(totalConceptos.toFixed(2));
    calcularSueldoACobrar();
}

// ========================================
// ACTUALIZAR CONCEPTOS ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================


function actualizarConceptos() {
    $(document).on('click', '#btn-aplicar-isr-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

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

        $('#mod-isr-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-imss-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

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

        $('#mod-imss-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-infonavit-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

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

        $('#mod-infonavit-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-ajuste-sub-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

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

        $('#mod-ajustes-sub-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });


    $(document).on('click', '#btn-aplicar-tarjeta-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copiaTarjeta = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? empleado.tarjeta_copia : null;
        if (copiaTarjeta === null) {
            return;
        }

        // Actualizar la propiedad tarjeta con el valor de tarjeta_copia
        empleado.tarjeta = copiaTarjeta;
        // Actualizar input del modal
        $('#mod-tarjeta-40lbs').val(copiaTarjeta);
        calcularSueldoACobrar();
    });

    //  Al presionar el botón de incentivo, ponerlo en 0
    $(document).on('click', '#btn-aplicar-incentivo-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        $('#mod-incentivo-40lbs').val('0.00');
        empleado.incentivo = 0;
        calcularSueldoACobrar();
    });
}

// ========================================
// VALIDAR CONCEPTOS MAXIMO ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================

function validarConceptoMax(inputSelector, codigo) {
    $(document).on('input', inputSelector, function () {
        const empleado = objEmpleado.getEmpleado();

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
function validarConceptoMaxTarjeta() {
    $(document).on('input', '#mod-tarjeta-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

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

validarConceptoMax('#mod-isr-40lbs', '45');
validarConceptoMax('#mod-imss-40lbs', '52');
validarConceptoMax('#mod-infonavit-40lbs', '16');
validarConceptoMax('#mod-ajustes-sub-40lbs', '107');
validarConceptoMaxTarjeta();


// ========================================
// APLICAR TOTAL DEL HISTORIAL
// ========================================

function aplicarTotalHistorial() {

    // Checador: suma de descuento_olvido en historial_olvidos
    $(document).on('click', '#btn-aplicar-checador-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const totalChecador = Array.isArray(empleado.historial_olvidos)
            ? empleado.historial_olvidos.reduce(function (suma, olvido) {
                return suma + (parseFloat(olvido.descuento_olvido) || 0);
            }, 0)
            : 0;

        $('#mod-checador-40lbs').val(totalChecador.toFixed(2));
        empleado.checador = totalChecador;
        calcularSueldoACobrar();
    });


    // Inasistencias: suma de descuento_inasistencia en historial_inasistencias
    $(document).on('click', '#btn-calcular-inasistencias-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const totalInasistencias = Array.isArray(empleado.historial_inasistencias)
            ? empleado.historial_inasistencias.reduce(function (suma, inasistencia) {
                return suma + (parseFloat(inasistencia.descuento_inasistencia) || 0);
            }, 0)
            : 0;

        $('#mod-inasistencias-40lbs').val(totalInasistencias.toFixed(2));
        empleado.inasistencia = totalInasistencias;
         calcularSueldoACobrar();
    });
}

inicializarSueldoACobrar();

// Registra todos los eventos que deben disparar el recálculo del sueldo a cobrar
function inicializarSueldoACobrar() {

    // Escuchar cambios directos en sueldo semanal
    $(document).on('input', '#mod-sueldo-neto-40lbs, #mod-incentivo-40lbs, #mod-total-extra-40lbs', calcularSueldoACobrar);

    // Escuchar cambios en todas las deducciones editables
    $(document).on('input',
        '#mod-tarjeta-40lbs, #mod-prestamo-40lbs, #mod-checador-40lbs, ' +
        '#mod-inasistencias-40lbs, ' +
        '#mod-permisos-40lbs, #mod-fagafetcofia-40lbs',
        calcularSueldoACobrar
    );


    // Mostrar/ocultar opciones de redondeo y recalcular al activar el checkbox
    $(document).on('change', '#mod-redondear-sueldo-40lbs', function () {
    
        calcularSueldoACobrar();
    });

    // Recalcular al cambiar el modo de redondeo
    $(document).on('change', '#mod-redondeo-modo-40lbs', calcularSueldoACobrar);
}

// Calcula y actualiza el campo "Sueldo a Cobrar" con todos los valores actuales del modal
function calcularSueldoACobrar() {

    // ---- PERCEPCIONES ----
    const sueldoNeto = parseFloat($('#mod-sueldo-neto-40lbs').val()) || 0;
    const incentivo = parseFloat($('#mod-incentivo-40lbs').val()) || 0;
    const sueldoExtra = parseFloat($('#mod-total-extra-40lbs').val()) || 0;
    const totalPercepciones = sueldoNeto + incentivo + sueldoExtra;

    // ---- CONCEPTOS (ISR, IMSS, INFONAVIT, AJUSTE AL SUB) ----
    const totalConceptos = parseFloat($('#mod-total-conceptos-40lbs').val()) || 0;

    // ---- DEDUCCIONES ----
    const tarjeta = parseFloat($('#mod-tarjeta-40lbs').val()) || 0;
    const prestamo = parseFloat($('#mod-prestamo-40lbs').val()) || 0;
    const checador = parseFloat($('#mod-checador-40lbs').val()) || 0;
    const inasistencias = parseFloat($('#mod-inasistencias-40lbs').val()) || 0;
    const permisos = parseFloat($('#mod-permisos-40lbs').val()) || 0;
    const uniforme = parseFloat($('#mod-uniforme-40lbs').val()) || 0;
    const fagafetcofia = parseFloat($('#mod-fagafetcofia-40lbs').val()) || 0;
    const totalDeducciones = tarjeta + prestamo + checador + inasistencias + permisos + uniforme + fagafetcofia;

    // ---- CÁLCULO FINAL ----
    const totalSinRedondear = totalPercepciones - totalConceptos - totalDeducciones;

    // Delegar al redondeo (que también actualiza el campo y persiste en empleado)
    aplicarRedondeo(totalSinRedondear);
}

// ========================================
// APLICAR REDONDEO AL SUELDO A COBRAR
// ========================================

function aplicarRedondeo(totalSinRedondear) {
    const redondeoActivo = $('#mod-redondear-sueldo-40lbs').is(':checked');

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
    $('#mod-sueldo-a-cobrar-40lbs').val(totalFinal.toFixed(2));

    // Persistir en el objeto empleado
    const empleado = objEmpleado.getEmpleado();
    if (empleado) {
        empleado.redondeo_activo = redondeoActivo;
        empleado.redondeo = diferencia;   // negativo si se restó, positivo si se sumó
        empleado.total_cobrar = totalFinal;   // valor final que se cobra
    }
}



// ========================================
// LIMPIAR MODAL 
// ========================================
function limpiarModal() {
    // ========================================
    // LIMPIAR TAB: TRABAJADOR (Información del empleado)
    // ========================================
    $('#campo-clave-40lbs').text('');
    $('#campo-nombre-40lbs').text('');
    $('#campo-departamento-40lbs').text('');
    $('#campo-puesto-40lbs').text('');
    $('#campo-id-empresa-40lbs').val('');
    $('#nombre-empleado-modal').text('');

    // ========================================
    // LIMPIAR TAB: REGISTROS (Tablas)
    // ========================================
    // Limpiar tabla biométrica
    $('#tbody-biometrico-40lbs').empty();

    // Limpiar tabla horarios oficiales
    $('#tbody-biometrico-redondeado-40lbs').empty();

    // Limpiar inputs de copia rápida (si existen en el modal, si no, omitir o agregar)
    // En modal40lbs.php no veo estos inputs de "copia rapida", pero los dejo por si acaso o los quito si no aplican.
    // Viendo el modal, no están. Los comentaré o quitaré.

    // ========================================
    // LIMPIAR EVENTOS ESPECIALES
    // ========================================
    $('#entradas-tempranas-40lbs').empty();
    $('#salidas-tardias-40lbs').empty();
    $('#salidas-tempranas-40lbs').empty();
    $('#olvidos-checador-40lbs').empty();
    $('#retardos-40lbs').empty();
    $('#inasistencias-content-40lbs').empty();
    // $('#analisis-permisos-comida-content-40lbs').empty(); // Comentado en el modal

    // Limpiar totales de eventos
    $('#total-entradas-tempranas-40lbs').text('0');
    $('#total-salidas-tardias-40lbs').text('0');
    $('#total-salidas-tempranas-40lbs').text('0');
    $('#total-olvidos-checador-40lbs').text('0');
    $('#total-retardos-40lbs').text('0');
    $('#total-inasistencias-40lbs').text('0');

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Percepciones)
    // ========================================
    $('#mod-sueldo-neto-40lbs').val('');
    $('#mod-incentivo-40lbs').val('');
    $('#mod-total-extra-40lbs').val('');
    
    // Componentes del sueldo extra
    $('#mod-horas-extras-40lbs').val('');
    $('#mod-bono-antiguedad-40lbs').val('');
    $('#mod-actividades-especiales-40lbs').val('');
    $('#mod-puesto-40lbs').val('');

    // Limpiar contenedor de conceptos adicionales
    $('#contenedor-conceptos-adicionales-40lbs').empty();

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Conceptos)
    // ========================================
    $('#mod-isr-40lbs').val('');
    $('#mod-imss-40lbs').val('');
    $('#mod-infonavit-40lbs').val('');
    $('#mod-ajustes-sub-40lbs').val('');
    $('#mod-total-conceptos-40lbs').val('');

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Deducciones)
    // ========================================
    $('#mod-tarjeta-40lbs').val('');
    $('#mod-prestamo-40lbs').val('');
    $('#mod-checador-40lbs').val('');
    $('#mod-inasistencias-40lbs').val('');
    $('#mod-permisos-40lbs').val('');
    $('#mod-uniforme-40lbs').val('');
    $('#mod-fagafetcofia-40lbs').val('');
    
    // Historiales
    $('#contenedor-historial-olvidos').empty();
    $('#contenedor-historial-inasistencias-40lbs').empty();
    $('#contenedor-historial-permisos-40lbs').empty();
    $('#contenedor-historial-uniforme-40lbs').empty();
    $('#contenedor-deducciones-adicionales-40lbs').empty();

    // ========================================
    // LIMPIAR: SUELDO A COBRAR
    // ========================================
    $('#mod-redondear-sueldo-40lbs').prop('checked', false);
    $('#mod-sueldo-a-cobrar-40lbs').val('');
}

