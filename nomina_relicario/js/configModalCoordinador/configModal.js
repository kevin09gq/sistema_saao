alternarTablas();
editarHorariosOficiales();
eliminarHorarioOficial();
copiarHorariosATodos();
actualizarConceptos();
aplicarTotalHistorial();



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
    $(document).on('click', '#tbody-horarios-oficiales-coordinadores td', function (e) {
        // Si el usuario hizo clic en un botón dentro de la celda, no entramos en modo edición
        if ($(e.target).is('button') || $(e.target).closest('button').length) {
            return;
        }

        // No editar si la celda contiene el nombre del día (primera columna)
        if ($(this).index() === 0) {
            return;
        }

        // No editar si es la columna de Acción (última columna, índice 5)
        if ($(this).index() === 5) {
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

function eliminarHorarioOficial() {
    $(document).on('click', '.btn-eliminar-horario-coordinador', function (e) {
        e.preventDefault();
        
        // Obtener la fila del botón
        const $fila = $(this).closest('tr');
        
        // Vaciar las celdas de entrada, salida_comida, entrada_comida, salida
        // Índices: 0=día, 1=entrada, 2=salida_comida, 3=entrada_comida, 4=salida, 5=botones
        $fila.find('td').eq(1).text('-'); // entrada
        $fila.find('td').eq(2).text('-'); // salida_comida
        $fila.find('td').eq(3).text('-'); // entrada_comida
        $fila.find('td').eq(4).text('-'); // salida
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
    calcularSueldoACobrar();
}

// ========================================
// SUMAS AUTOMATICAS DEDUCCIONES EXTRA
// ========================================

sumasAutomaticasDeducciones();

function sumasAutomaticasDeducciones() {

    // Evento cuando cambia una deducción extra
    $(document).on('input', '.cantidad-deduccion', function () {
        calcularTotalDeduccionesEnTiempoReal();
    });
}

function calcularTotalDeduccionesEnTiempoReal() {

    // Sumar todas las deducciones extras
    let totalDeducciones = 0;
    $('#contenedor-deducciones-adicionales-coordinador').find('.cantidad-deduccion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalDeducciones += cantidad;
    });

    $('#mod-fagafetcofia-coordinador').val(totalDeducciones.toFixed(2));
    calcularSueldoACobrar();
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
    calcularSueldoACobrar();
}

// ========================================
// ACTUALIZAR CONCEPTOS ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================

function actualizarConceptos() {
    $(document).on('click', '#btn-aplicar-isr-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();

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

        $('#mod-isr-coordinador').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-imss-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();

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

        $('#mod-imss-coordinador').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#mod-infonavit-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();

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

        $('#mod-infonavit-coordinador').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-ajuste-sub-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();

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

        $('#mod-ajustes-sub-coordinador').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

 
    $(document).on('click', '#btn-aplicar-tarjeta-coordinador', function () {
       const empleado = objEmpleadoCoordinador.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copiaTarjeta = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? empleado.tarjeta_copia : null;
        if (copiaTarjeta === null) {
            return;
        }

        // Actualizar la propiedad tarjeta con el valor de tarjeta_copia
        empleado.tarjeta = copiaTarjeta;
        // Actualizar input del modal
        $('#mod-tarjeta-coordinador').val(copiaTarjeta);
        calcularSueldoACobrar();
    });
}

// ========================================
// VALIDAR CONCEPTOS MAXIMO ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================

function validarConceptoMax(inputSelector, codigo) {
    $(document).on('input', inputSelector, function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();

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
       $(document).on('input', '#mod-tarjeta-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();

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

validarConceptoMax('#mod-isr-coordinador', '45');
validarConceptoMax('#mod-imss-coordinador', '52');
validarConceptoMax('#mod-infonavit-coordinador', '16');
validarConceptoMax('#mod-ajustes-sub-coordinador', '107');
validarConceptoMaxTarjeta();
    

// ========================================
// APLICAR TOTAL DEL HISTORIAL
// ========================================

function aplicarTotalHistorial() {

    // Checador: suma de descuento_olvido en historial_olvidos
    $(document).on('click', '#btn-aplicar-checador-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();
        if (!empleado) return;

        const totalChecador = Array.isArray(empleado.historial_olvidos)
            ? empleado.historial_olvidos.reduce(function (suma, olvido) {
                return suma + (parseFloat(olvido.descuento_olvido) || 0);
            }, 0)
            : 0;

        $('#mod-checador-coordinador').val(totalChecador.toFixed(2));
        empleado.checador = totalChecador;
        calcularSueldoACobrar();
    });

    // Retardos: suma de total_descontado en historial_retardos
    $(document).on('click', '#btn-calcular-retardos-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();
        if (!empleado) return;

        const totalRetardos = Array.isArray(empleado.historial_retardos)
            ? empleado.historial_retardos.reduce(function (suma, retardo) {
                return suma + (parseFloat(retardo.total_descontado) || 0);
            }, 0)
            : 0;

        $('#mod-retardos-coordinador').val(totalRetardos.toFixed(2));
        empleado.retardos = totalRetardos;
        calcularSueldoACobrar();
    });

    // Inasistencias: suma de descuento_inasistencia en historial_inasistencias
    $(document).on('click', '#btn-calcular-inasistencias-coordinador', function () {
        const empleado = objEmpleadoCoordinador.getEmpleado();
        if (!empleado) return;

        const totalInasistencias = Array.isArray(empleado.historial_inasistencias)
            ? empleado.historial_inasistencias.reduce(function (suma, inasistencia) {
                return suma + (parseFloat(inasistencia.descuento_inasistencia) || 0);
            }, 0)
            : 0;

        $('#mod-inasistencias-coordinador').val(totalInasistencias.toFixed(2));
        empleado.inasistencia = totalInasistencias;
        calcularSueldoACobrar();
    });
}


// ========================================
// CALCULAR SUELDO A COBRAR
// ========================================

inicializarSueldoACobrar();

// Registra todos los eventos que deben disparar el recálculo del sueldo a cobrar
function inicializarSueldoACobrar() {

    // Escuchar cambios directos en sueldo semanal
    $(document).on('input', '#mod-sueldo-semanal-coordinador', calcularSueldoACobrar);

    // Escuchar cambios en todas las deducciones editables
    $(document).on('input',
        '#mod-tarjeta-coordinador, #mod-prestamo-coordinador, #mod-checador-coordinador, ' +
        '#mod-retardos-coordinador, #mod-inasistencias-coordinador, ' +
        '#mod-permisos-coordinador, #mod-fagafetcofia-coordinador',
        calcularSueldoACobrar
    );

    // Mostrar/ocultar opciones de redondeo y recalcular al activar el checkbox
    $(document).on('change', '#mod-redondear-sueldo-coordinador', function () {
        if ($(this).is(':checked')) {
            $('#mod-redondeo-opciones-coordinador').show();
        } else {
            $('#mod-redondeo-opciones-coordinador').hide();
        }
        calcularSueldoACobrar();
    });

    // Recalcular al cambiar el modo de redondeo
    $(document).on('change', '#mod-redondeo-modo-coordinador', calcularSueldoACobrar);
}

// Calcula y actualiza el campo "Sueldo a Cobrar" con todos los valores actuales del modal
function calcularSueldoACobrar() {

    // ---- PERCEPCIONES ----
    const sueldoSemanal     = parseFloat($('#mod-sueldo-semanal-coordinador').val())  || 0;
    const sueldoExtra       = parseFloat($('#mod-total-extra-coordinador').val())     || 0;
    const totalPercepciones = sueldoSemanal + sueldoExtra;

    // ---- CONCEPTOS (ISR, IMSS, INFONAVIT, AJUSTE AL SUB) ----
    const totalConceptos    = parseFloat($('#mod-total-conceptos-coordinador').val()) || 0;

    // ---- DEDUCCIONES ----
    const tarjeta           = parseFloat($('#mod-tarjeta-coordinador').val())         || 0;
    const prestamo          = parseFloat($('#mod-prestamo-coordinador').val())        || 0;
    const checador          = parseFloat($('#mod-checador-coordinador').val())        || 0;
    const retardos          = parseFloat($('#mod-retardos-coordinador').val())        || 0;
    const inasistencias     = parseFloat($('#mod-inasistencias-coordinador').val())   || 0;
    const permisos          = parseFloat($('#mod-permisos-coordinador').val())        || 0;
    const uniforme          = parseFloat($('#mod-uniforme-coordinador').val())        || 0;
    const fagafetcofia      = parseFloat($('#mod-fagafetcofia-coordinador').val())    || 0;
    const totalDeducciones  = tarjeta + prestamo + checador + retardos + inasistencias + permisos + uniforme + fagafetcofia;

    // ---- CÁLCULO FINAL ----
    const totalSinRedondear = totalPercepciones - totalConceptos - totalDeducciones;

    // Delegar al redondeo (que también actualiza el campo y persiste en empleado)
    aplicarRedondeo(totalSinRedondear);
}

// ========================================
// APLICAR REDONDEO AL SUELDO A COBRAR
// ========================================


function aplicarRedondeo(totalSinRedondear) {
    const redondeoActivo = $('#mod-redondear-sueldo-coordinador').is(':checked');

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
    $('#mod-sueldo-a-cobrar-coordinador').val(totalFinal.toFixed(2));

    // Persistir en el objeto empleado
    const empleado = objEmpleadoCoordinador.getEmpleado();
    if (empleado) {
        empleado.redondeo_activo = redondeoActivo;
        empleado.redondeo        = diferencia;   // negativo si se restó, positivo si se sumó
        empleado.total_cobrar    = totalFinal;   // valor final que se cobra
    }
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

    // Limpiar contenedor de deducciones adicionales
    $('#contenedor-deducciones-adicionales-coordinador').empty();

    // Limpiar F.A/GAFET/COFIA
    $('#mod-fagafetcofia-coordinador').val('');

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
