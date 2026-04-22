alternarTablas();
editarHorariosOficiales();
eliminarHorarioOficial();
copiarHorariosATodos();
actualizarConceptos();
aplicarTotalHistorial();



// ========================================
// ACTUALIZAR HISTORIAL DE RETARDOS EN TIEMPO REAL
// ========================================
function actualizarHistorialRetardosEnTiempoReal() {
    const empleado = objEmpleado.getEmpleado();
    
    // Validar que exista empleado
    if (!empleado) {
        return;
    }

    // Iterara sobre cada fila de la tabla de horarios y actualizar el objeto empleado
    $('#tbody-horarios-oficiales-confianza tr').each(function () {
        const $celdas = $(this).find('td');
        
        // Obtener los valores de cada celda
        const dia = $celdas.eq(0).text().trim(); // Día (no editable)
        const entrada = $celdas.eq(1).text().trim(); // Entrada
        const salidaComida = $celdas.eq(2).text().trim(); // Salida Comida
        const entradaComida = $celdas.eq(3).text().trim(); // Entrada Comida
        const salida = $celdas.eq(4).text().trim(); // Salida
        
        // Buscar el horario correspondiente por el nombre del día
        let horario = empleado.horario_oficial.find(h => 
            String(h.dia || '').toUpperCase().trim() === dia.toUpperCase().trim()
        );
        
        // Si no existe el horario para este día, crearlo
        if (!horario) {
            horario = {
                dia: dia.toUpperCase()
            };
            empleado.horario_oficial.push(horario);
        }
        
        // Actualizar los valores (convertir '-' en vacío)
        horario.entrada = entrada === '-' ? '' : entrada;
        horario.salida_comida = salidaComida === '-' ? '' : salidaComida;
        horario.entrada_comida = entradaComida === '-' ? '' : entradaComida;
        horario.salida = salida === '-' ? '' : salida;
    });
    
    // Recalcular el historial de retardos basado en el nuevo horario
    asignarHistorialRetardos(empleado);
    
    // Recalcular el total de retardos
    asignarTotalRetardos(empleado, false);
    
    // Actualizar el campo del modal con el nuevo total
    $('#mod-retardos-confianza').val(empleado.retardos || 0);

    // Establecer el historial de retardos actualizado en el modal
    establecerHistorialRetardos(empleado);
    
    // Recalcular el sueldo a cobrar si fue afectado
    calcularSueldoACobrar();
}

// ========================================
// ACTUALIZAR HISTORIAL DE INASISTENCIAS EN TIEMPO REAL
// ========================================
function actualizarHistorialInasistenciasEnTiempoReal() {
    const empleado = objEmpleado.getEmpleado();
    
    // Validar que exista empleado
    if (!empleado) {
        return;
    }

    // Iterar sobre cada fila de la tabla de horarios y actualizar el objeto empleado
    $('#tbody-horarios-oficiales-confianza tr').each(function () {
        const $celdas = $(this).find('td');
        
        // Obtener los valores de cada celda
        const dia = $celdas.eq(0).text().trim(); // Día (no editable)
        const entrada = $celdas.eq(1).text().trim(); // Entrada
        const salidaComida = $celdas.eq(2).text().trim(); // Salida Comida
        const entradaComida = $celdas.eq(3).text().trim(); // Entrada Comida
        const salida = $celdas.eq(4).text().trim(); // Salida
        
        // Buscar el horario correspondiente por el nombre del día
        let horario = empleado.horario_oficial.find(h => 
            String(h.dia || '').toUpperCase().trim() === dia.toUpperCase().trim()
        );
        
        // Si no existe el horario para este día, crearlo
        if (!horario) {
            horario = {
                dia: dia.toUpperCase()
            };
            empleado.horario_oficial.push(horario);
        }
        
        // Actualizar los valores (convertir '-' en vacío)
        horario.entrada = entrada === '-' ? '' : entrada;
        horario.salida_comida = salidaComida === '-' ? '' : salidaComida;
        horario.entrada_comida = entradaComida === '-' ? '' : entradaComida;
        horario.salida = salida === '-' ? '' : salida;
    });
    
    // Recalcular el historial de inasistencias basado en el nuevo horario
    asignarHistorialInasistencias(empleado);
    
    // Recalcular el total de inasistencias
    asignarTotalInasistencias(empleado, false);

    establecerHistorialInasistencias(empleado);
    
    // Actualizar el campo del modal con el nuevo total
    $('#mod-inasistencias-confianza').val(empleado.inasistencia || 0);
    
    // Recalcular el sueldo a cobrar si fue afectado
    calcularSueldoACobrar();
}

// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y HORARIOS OFICIALES
// ========================================
function alternarTablas() {
    // BOTÓN BIOMÉTRICO: Mostrar registros biométricos del checador
    $('#btn-biometrico-confianza').on('click', function () {
        // Mostrar tabla biométrico
        $('#tabla-biometrico-confianza').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-horarios-oficiales-confianza').attr('hidden', 'hidden');

        // Marcar botones: biométrico activo, horarios inactivo
        $(this).addClass('active');
        $('#btn-horarios-oficiales-confianza').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-horarios-oficiales-confianza').on('click', function () {
        // Ocultar tabla biométrico
        $('#tabla-biometrico-confianza').attr('hidden', 'hidden');
        // Mostrar tabla de horarios oficiales
        $('#tabla-horarios-oficiales-confianza').removeAttr('hidden');

        // Marcar botones: horarios activo, biométrico inactivo
        $(this).addClass('active');
        $('#btn-biometrico-confianza').removeClass('active');
    });
}

// ========================================
// EDITAR HORARIOS OFICIALES: Click en celda = Input time
// ========================================
function editarHorariosOficiales() {
    // Delegación de eventos: click en cualquier celda de la tabla de horarios
    $(document).on('click', '#tbody-horarios-oficiales-confianza td', function (e) {
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
            
            // Actualizar historial de retardos en tiempo real
            actualizarHistorialRetardosEnTiempoReal();
            // Actualizar historial de inasistencias en tiempo real
            actualizarHistorialInasistenciasEnTiempoReal();
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
    $(document).on('click', '.btn-eliminar-horario-confianza', function (e) {
        e.preventDefault();
        
        // Obtener la fila del botón
        const $fila = $(this).closest('tr');
        
        // Vaciar las celdas de entrada, salida_comida, entrada_comida, salida
        // Índices: 0=día, 1=entrada, 2=salida_comida, 3=entrada_comida, 4=salida, 5=botones
        $fila.find('td').eq(1).text('-'); // entrada
        $fila.find('td').eq(2).text('-'); // salida_comida
        $fila.find('td').eq(3).text('-'); // entrada_comida
        $fila.find('td').eq(4).text('-'); // salida
        
        // Actualizar historial de retardos en tiempo real
        actualizarHistorialRetardosEnTiempoReal();
        // Actualizar historial de inasistencias en tiempo real
        actualizarHistorialInasistenciasEnTiempoReal();
    });
}

// ========================================
// COPIAR HORARIOS A TODAS LAS FILAS (LUNES A SÁBADO)
// ========================================
function copiarHorariosATodos() {
    $('#btn-copiar-horarios-confianza').on('click', function () {
        // Obtener valores de los inputs de copia rápida
        const entrada = $('#input-entrada-copiar-confianza').val();
        const salidaComida = $('#input-salida-comida-copiar-confianza').val();
        const entradaComida = $('#input-entrada-comida-copiar-confianza').val();
        const salida = $('#input-salida-copiar-confianza').val();

        // Iterar sobre las filas de lunes a sábado (excluyendo domingo)
        $('#tbody-horarios-oficiales-confianza tr:not(:last-child)').each(function () {
            // Obtener todas las celdas de la fila (excluyendo la primera que es el día)
            const $celdas = $(this).find('td');

            // Asignar valores a cada celda (índices: 1=entrada, 2=salida_comida, 3=entrada_comida, 4=salida)
            $celdas.eq(1).text(entrada || '-');
            $celdas.eq(2).text(salidaComida || '-');
            $celdas.eq(3).text(entradaComida || '-');
            $celdas.eq(4).text(salida || '-');
        });

        // Actualizar historial de retardos en tiempo real
        actualizarHistorialRetardosEnTiempoReal();
        // Actualizar historial de inasistencias en tiempo real
        actualizarHistorialInasistenciasEnTiempoReal();
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
    $('#contenedor-conceptos-adicionales-confianza').find('.cantidad-percepcion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalExtras += cantidad;
    });
    ;
    $('#mod-total-extra-confianza').val(totalExtras.toFixed(2));
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
    $('#contenedor-deducciones-adicionales-confianza').find('.cantidad-deduccion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalDeducciones += cantidad;
    });

    $('#mod-fagafetcofia-confianza').val(totalDeducciones.toFixed(2));
    calcularSueldoACobrar();
}

// ========================================
// SUMAS AUTOMATICAS CONCEPTOS
// ========================================

sumasAutomaticasConceptos();

function sumasAutomaticasConceptos() {
    // Evento cuando cambia un concepto (ISR, IMSS, INFONAVIT, AJUSTES)
    $(document).on('input', '#mod-isr-confianza, #mod-imss-confianza, #mod-infonavit-confianza, #mod-ajustes-sub-confianza', function () {
        calcularTotalConceptosEnTiempoReal();
    });
}

function calcularTotalConceptosEnTiempoReal() {
    // Obtener valores de cada concepto
    const isr = parseFloat($('#mod-isr-confianza').val()) || 0;
    const imss = parseFloat($('#mod-imss-confianza').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-confianza').val()) || 0;
    const ajustes = parseFloat($('#mod-ajustes-sub-confianza').val()) || 0;

    // Sumar todos los conceptos
    const totalConceptos = isr + imss + infonavit + ajustes;

    // Actualizar el total en el campo readonly
    $('#mod-total-conceptos-confianza').val(totalConceptos.toFixed(2));
    calcularSueldoACobrar();
}

// ========================================
// ACTUALIZAR CONCEPTOS ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================

function actualizarConceptos() {
    $(document).on('click', '#btn-aplicar-isr-confianza', function () {
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

        $('#mod-isr-confianza').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-imss-confianza', function () {
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

        $('#mod-imss-confianza').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#mod-infonavit-confianza', function () {
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

        $('#mod-infonavit-confianza').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-ajuste-sub-confianza', function () {
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

        $('#mod-ajustes-sub-confianza').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

 
    $(document).on('click', '#btn-aplicar-tarjeta-confianza', function () {
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
        $('#mod-tarjeta-confianza').val(copiaTarjeta);
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
       $(document).on('input', '#mod-tarjeta-confianza', function () {
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

validarConceptoMax('#mod-isr-confianza', '45');
validarConceptoMax('#mod-imss-confianza', '52');
validarConceptoMax('#mod-infonavit-confianza', '16');
validarConceptoMax('#mod-ajustes-sub-confianza', '107');
validarConceptoMaxTarjeta();
    

// ========================================
// APLICAR TOTAL DEL HISTORIAL
// ========================================

function aplicarTotalHistorial() {

    // Checador: suma de descuento_olvido en historial_olvidos
    $(document).on('click', '#btn-aplicar-checador-confianza', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const totalChecador = Array.isArray(empleado.historial_olvidos)
            ? empleado.historial_olvidos.reduce(function (suma, olvido) {
                return suma + (parseFloat(olvido.descuento_olvido) || 0);
            }, 0)
            : 0;

        $('#mod-checador-confianza').val(totalChecador.toFixed(2));
        empleado.checador = totalChecador;
        calcularSueldoACobrar();
    });

    // Retardos: suma de total_descontado en historial_retardos
    $(document).on('click', '#btn-calcular-retardos-confianza', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const totalRetardos = Array.isArray(empleado.historial_retardos)
            ? empleado.historial_retardos.reduce(function (suma, retardo) {
                return suma + (parseFloat(retardo.total_descontado) || 0);
            }, 0)
            : 0;

        $('#mod-retardos-confianza').val(totalRetardos.toFixed(2));
        empleado.retardos = totalRetardos;
        calcularSueldoACobrar();
    });

    // Inasistencias: suma de descuento_inasistencia en historial_inasistencias
    $(document).on('click', '#btn-calcular-inasistencias-confianza', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const totalInasistencias = Array.isArray(empleado.historial_inasistencias)
            ? empleado.historial_inasistencias.reduce(function (suma, inasistencia) {
                return suma + (parseFloat(inasistencia.descuento_inasistencia) || 0);
            }, 0)
            : 0;

        $('#mod-inasistencias-confianza').val(totalInasistencias.toFixed(2));
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
    $(document).on('input', '#mod-sueldo-semanal-confianza', calcularSueldoACobrar);

    // Escuchar cambios en todas las deducciones editables
    $(document).on('input',
        '#mod-tarjeta-confianza, #mod-prestamo-confianza, #mod-checador-confianza, ' +
        '#mod-retardos-confianza, #mod-inasistencias-confianza, ' +
        '#mod-permisos-confianza, #mod-fagafetcofia-confianza',
        calcularSueldoACobrar
    );

    // Mostrar/ocultar opciones de redondeo y recalcular al activar el checkbox
    $(document).on('change', '#mod-redondear-sueldo-confianza', function () {
        if ($(this).is(':checked')) {
            $('#mod-redondeo-opciones-confianza').show();
        } else {
            $('#mod-redondeo-opciones-confianza').hide();
        }
        calcularSueldoACobrar();
    });

    // Recalcular al cambiar el modo de redondeo
    $(document).on('change', '#mod-redondeo-modo-confianza', calcularSueldoACobrar);
}

// Calcula y actualiza el campo "Sueldo a Cobrar" con todos los valores actuales del modal
function calcularSueldoACobrar() {

    // ---- PERCEPCIONES ----
    const sueldoSemanal     = parseFloat($('#mod-sueldo-semanal-confianza').val())  || 0;
    const sueldoExtra       = parseFloat($('#mod-total-extra-confianza').val())     || 0;
    const totalPercepciones = sueldoSemanal + sueldoExtra;

    // ---- CONCEPTOS (ISR, IMSS, INFONAVIT, AJUSTE AL SUB) ----
    const totalConceptos    = parseFloat($('#mod-total-conceptos-confianza').val()) || 0;

    // ---- DEDUCCIONES ----
    const tarjeta           = parseFloat($('#mod-tarjeta-confianza').val())         || 0;
    const prestamo          = parseFloat($('#mod-prestamo-confianza').val())        || 0;
    const checador          = parseFloat($('#mod-checador-confianza').val())        || 0;
    const retardos          = parseFloat($('#mod-retardos-confianza').val())        || 0;
    const inasistencias     = parseFloat($('#mod-inasistencias-confianza').val())   || 0;
    const permisos          = parseFloat($('#mod-permisos-confianza').val())        || 0;
    const uniforme          = parseFloat($('#mod-uniforme-confianza').val())        || 0;
    const fagafetcofia      = parseFloat($('#mod-fagafetcofia-confianza').val())    || 0;
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
    const redondeoActivo = $('#mod-redondear-sueldo-confianza').is(':checked');

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
    $('#mod-sueldo-a-cobrar-confianza').val(totalFinal.toFixed(2));

    // Persistir en el objeto empleado
    const empleado = objEmpleado.getEmpleado();
    if (empleado) {
        empleado.redondeo_activo = redondeoActivo;
        empleado.redondeo        = diferencia;   // negativo si se restó, positivo si se sumó
        empleado.total_cobrar    = totalFinal;   // valor final que se cobra
    }
}



// ========================================
// LIMPIAR MODAL COORDINADOR
// ========================================
function limpiarModal() {
    // ========================================
    // LIMPIAR TAB: TRABAJADOR (Información del empleado)
    // ========================================
    $('#campo-clave-confianza').text('');
    $('#campo-nombre-confianza').text('');
    $('#campo-departamento-confianza').text('');
    $('#campo-puesto-confianza').text('');
    $('#campo-id-empresa-confianza').val('');
    $('#nombre-empleado-modal').text('');

    // ========================================
    // LIMPIAR TAB: REGISTROS (Tablas)
    // ========================================
    // Limpiar tabla biométrica
    $('#tbody-biometrico-confianza').empty();

    // Limpiar tabla horarios oficiales
    $('#tbody-horarios-oficiales-confianza').empty();

    // Limpiar inputs de copia rápida
    $('#input-entrada-copiar-confianza').val('');
    $('#input-salida-comida-copiar-confianza').val('');
    $('#input-entrada-comida-copiar-confianza').val('');
    $('#input-salida-copiar-confianza').val('');

    // ========================================
    // LIMPIAR EVENTOS ESPECIALES
    // ========================================
    $('#entradas-tempranas-confianza').empty();
    $('#salidas-tardias-confianza').empty();
    $('#salidas-tempranas-confianza').empty();
    $('#olvidos-checador-confianza').empty();
    $('#retardos-confianza').empty();
    $('#faltas-content-confianza').empty();
    $('#analisis-permisos-comida-content-confianza').empty();

    // Limpiar totales de eventos
    $('#total-entradas-tempranas-confianza').text('0');
    $('#total-salidas-tardias-confianza').text('0');
    $('#total-salidas-tempranas-confianza').text('0');
    $('#total-olvidos-checador-confianza').text('0');
    $('#total-retardos-confianza').text('0');
    $('#total-faltas-confianza').text('0');
    $('#total-analisis-permisos-comida-confianza').text('0');

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (Percepciones)
    // ========================================
    // Limpiar sueldo semanal
    $('#mod-sueldo-semanal-confianza').val('');

    // Limpiar total extra
    $('#mod-total-extra-confianza').val('');

    // Limpiar todos los inputs de percepciones adicionales
    $('#contenedor-conceptos-adicionales-confianza').find('input').val('');

    // Limpiar contenedor de conceptos adicionales
    $('#contenedor-conceptos-adicionales-confianza').empty();

    // Limpiar contenedor de deducciones adicionales
    $('#contenedor-deducciones-adicionales-confianza').empty();

    // Limpiar F.A/GAFET/COFIA
    $('#mod-fagafetcofia-confianza').val('');

    // ========================================
    // LIMPIAR TAB: MODIFICAR DETALLES (conceptos)
    // ========================================
    $('#mod-isr-confianza').val('');
    $('#mod-imss-confianza').val('');
    $('#mod-infonavit-confianza').val('');
    $('#mod-ajustes-sub-confianza').val('');
    $('#mod-total-conceptos-confianza').val('');

    // ========================================
    // LIMPIAR: SUELDO A COBRAR
    // ========================================
    // Desmarcar checkbox de redondeo
    $('#mod-redondear-sueldo-confianza').prop('checked', false);

    // Ocultar opciones de redondeo
    $('#mod-redondeo-opciones-confianza').hide();

    // Resetear modo de redondeo
    $('#mod-redondeo-modo-confianza').val('nearest');

    // Limpiar sueldo a cobrar
    $('#mod-sueldo-a-cobrar-confianza').val('');
}
