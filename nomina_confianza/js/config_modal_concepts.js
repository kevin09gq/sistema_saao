// Variable global para guardar la fila seleccionada
var filaSeleccionada = null;

// Función helper para buscar empleado por clave y id_empresa
function buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa = null) {
    if (!clave) return null;
    
    let empleado = null;
    jsonNominaConfianza.departamentos.forEach(dept => {
        (dept.empleados || []).forEach(emp => { 
            const claveCoincide = String(emp.clave).trim() === String(clave).trim();
            const empresaCoincide = idEmpresa === null || String(emp.id_empresa).trim() === String(idEmpresa).trim();
            
            if (claveCoincide && empresaCoincide) {
                empleado = emp;
            }
        });
    });
    return empleado;
}

/* Función para calcular Total Percepciones
function calcularTotalPercepciones(empleado) {
    const sueldo = parseFloat(empleado.sueldo_semanal) || 0;
    const extras = parseFloat(empleado.sueldo_extra_total) || 0;
    return (sueldo + extras).toFixed(2);
}

// Función para calcular Total Deducciones
function calcularTotalDeducciones(empleado) {
    // Obtener valores de conceptos
    const buscarConcepto = (codigo) => {
        if (!Array.isArray(empleado.conceptos)) return 0;
        const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
        return concepto ? parseFloat(concepto.resultado) || 0 : 0;
    };

    const retardos = parseFloat(empleado.retardos) || 0;
    const isr = buscarConcepto('45');
    const imss = buscarConcepto('52');
    const ajusteSub = buscarConcepto('107');
    const infonavit = buscarConcepto('16');
    const permiso = parseFloat(empleado.permiso) || 0;
    const inasistencia = parseFloat(empleado.inasistencia) || 0;
    const uniformes = parseFloat(empleado.uniformes) || 0;
    const checador = parseFloat(empleado.checador) || 0;
    const faGafetCofia = parseFloat(empleado.fa_gafet_cofia) || 0;

    // Sumar deducciones_adicionales (deducciones personalizadas)
    let deduccionesAdicionales = 0;
    if (Array.isArray(empleado.deducciones_adicionales)) {
        empleado.deducciones_adicionales.forEach(deduccion => {
            deduccionesAdicionales += parseFloat(deduccion.resultado) || parseFloat(deduccion.valor) || parseFloat(deduccion.monto) || 0;
        });
    }

    const total = retardos + isr + imss + ajusteSub + infonavit + permiso + inasistencia + uniformes + checador + faGafetCofia + deduccionesAdicionales;
    return total.toFixed(2);
}
*/


// ========================================
// DESHABILITAR INPUTS PARA EMPLEADOS SIN SEGURO
// ========================================
// - Los empleados del departamento "sin seguro" no tienen ISR, IMSS, INFONAVIT, Ajuste al Sub ni Tarjeta
// - Esta función deshabilita esos inputs y los pone en 0

function configurarInputsSinSeguro(clave, idEmpresa = null) {
    if (!jsonNominaConfianza || !clave) return;

    // Buscar el empleado y su departamento
    const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
    let nombreDepartamento = '';

    if (empleado) {
        // Encontrar el nombre del departamento
        jsonNominaConfianza.departamentos.forEach(dept => {
            (dept.empleados || []).forEach(emp => {
                if (emp.clave == clave && String(emp.id_empresa).trim() === String(idEmpresa).trim()) {
                    nombreDepartamento = (dept.nombre || '').toLowerCase().trim();
                }
            });
        });
    }

    if (!empleado) return;

    // IDs de los inputs que se deshabilitan para empleados sin seguro
    const inputsConceptos = [
        '#mod-isr',
        '#mod-imss',
        '#mod-infonavit',
        '#mod-ajustes-sub',
        '#mod-tarjeta'
    ];

    // IDs de los botones de aplicar conceptos
    const botonesAplicar = [
        '#btn-aplicar-isr',
        '#btn-aplicar-imss',
        '#btn-aplicar-infonavit',
        '#btn-aplicar-ajuste-sub',
        '#btn-aplicar-tarjeta'
    ];

    // Verificar si el empleado está en el departamento "sin seguro"
    const esSinSeguro = nombreDepartamento === 'sin seguro';

    if (esSinSeguro) {
        // Deshabilitar inputs y ponerlos en 0
        inputsConceptos.forEach(selector => {
            $(selector).val('0.00').prop('disabled', true).addClass('input-disabled');
        });

        // Deshabilitar botones de aplicar
        botonesAplicar.forEach(selector => {
            $(selector).prop('disabled', true).addClass('btn-disabled');
        });

        // Asegurar que los valores en el empleado también sean 0
        if (Array.isArray(empleado.conceptos)) {
            empleado.conceptos.forEach(concepto => {
                const codigo = String(concepto.codigo);
                if (codigo === '45' || codigo === '52' || codigo === '16' || codigo === '107') {
                    concepto.resultado = 0;
                }
            });
        }

        empleado.tarjeta = 0;

    } else {
        // Habilitar inputs normalmente
        inputsConceptos.forEach(selector => {
            $(selector).prop('disabled', false).removeClass('input-disabled');
        });

        // Habilitar botones de aplicar
        botonesAplicar.forEach(selector => {
            $(selector).prop('disabled', false).removeClass('btn-disabled');
        });
    }
}


// ========================================
// SUELDO A COBRAR EN TIEMPO REAL (Input: #mod-sueldo-a-cobrar)
// ========================================
// - Recalcula el sueldo a cobrar cuando cambian los campos del modal
// - Si se escribe manualmente en el input, guarda el valor en el objeto empleado

// Calcula y pinta el sueldo a cobrar basado EN LOS INPUTS DEL MODAL (tiempo real)
function calcularYMostrarSueldoACobrar() {
    const clave = $('#campo-clave').text().trim();
    const idEmpresa = $('#campo-id-empresa').val().trim();
    if (!clave || !idEmpresa) return;

    // Percepciones desde inputs
    const sueldoSemanal = parseFloat($('#mod-sueldo-semanal').val()) || 0;
    // mod-total-extra ya contiene vacaciones + conceptos adicionales (lo actualiza actualizarTotalExtra)
    const totalExtra = parseFloat($('#mod-total-extra').val()) || 0;
    const percepciones = sueldoSemanal + totalExtra;

    // Deducciones principales
    const isr = parseFloat($('#mod-isr').val()) || 0;
    const imss = parseFloat($('#mod-imss').val()) || 0;
    const ajusteSub = parseFloat($('#mod-ajustes-sub').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit').val()) || 0;
    const retardos = parseFloat($('#mod-retardos').val()) || 0;
    const permiso = parseFloat($('#mod-permiso').val()) || 0;
    const inasistencia = parseFloat($('#mod-inasistencias').val()) || 0;
    const uniformes = parseFloat($('#mod-uniformes').val()) || 0;
    const checador = parseFloat($('#mod-checador').val()) || 0;
    const faGafetCofia = parseFloat($('#mod-fa-gafet-cofia').val()) || 0;
    const tarjeta = parseFloat($('#mod-tarjeta').val()) || 0;
    const prestamo = parseFloat($('#mod-prestamo').val()) || 0;

    // Deducciones adicionales dinámicas
    let adicionales = 0;
    $('#contenedor-deducciones-adicionales .deduccion-personalizada input[type="number"]').each(function () {
        adicionales += parseFloat($(this).val()) || 0;
    });

    // Actualizar F.A/GAFET/COFIA con el total de deducciones adicionales
    $('#mod-fa-gafet-cofia').val(adicionales.toFixed(2));

    const deducciones = isr + imss + ajusteSub + infonavit + retardos + permiso + inasistencia + uniformes + checador  + tarjeta + prestamo + adicionales;

    let total = percepciones - deducciones;
    const totalOriginal = total;
    
    // Aplicar redondeo al entero más cercano si el checkbox está activo
    const redondeoActivo = $('#mod-redondear-sueldo').is(':checked');
    if (redondeoActivo) {
        total = Math.round(total);
    }
    
    // Calcular la cantidad redondeada (diferencia entre el valor redondeado y el original)
    const cantidadRedondeada = redondeoActivo ? (total - totalOriginal) : 0;
    
    $('#mod-sueldo-a-cobrar').val(total.toFixed(2));

    // Reflejar en el empleado
    if (jsonNominaConfianza && Array.isArray(jsonNominaConfianza.departamentos)) {
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (empleado) {
            empleado.total_cobrar = total;
            empleado.fa_gafet_cofia = adicionales;
            empleado.redondeo_activo = redondeoActivo;
            empleado.redondeo = cantidadRedondeada;
        }
    }
}
function calcularSueldoACobrar() {

    // Escucha cambios en los campos relevantes del modal para recalcular automáticamente
    $(document).on('input change', '#modal-detalles input, #modal-detalles select, #contenedor-conceptos-adicionales input[type="number"], #contenedor-deducciones-adicionales input[type="number"]', function () {
        // Evitar bucle cuando el disparador es el propio input de sueldo a cobrar (lo maneja su listener dedicado)
        if ($(this).attr('id') === 'mod-sueldo-a-cobrar') return;
        calcularYMostrarSueldoACobrar();
    });

    // Si el usuario escribe manualmente el sueldo a cobrar, actualizar la propiedad en el empleado
    $(document).on('input', '#mod-sueldo-a-cobrar', function () {
        const $input = $(this);
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;

        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const valor = parseFloat($input.val()) || 0;
        empleado.total_cobrar = valor;
    });

}


// ========================================
// MENÚ CONTEXTUAL EN LA TABLA DE NÓMINA
// ========================================

// Función simple: muestra el menú contextual cuando se hace click en cualquier parte de la tabla
function mostrarContextMenu() {
    var $menu = $('#context-menu');
    if ($menu.length === 0) return; // no hay menú en el DOM

    // Adjunta un manejador simple: al hacer click derecho (contextmenu) en el cuerpo de la tabla, posiciona y muestra el menú
    $('#tabla-nomina-body').on('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Guardar la fila sobre la que se hizo clic
        filaSeleccionada = $(e.target).closest('tr');

        var x = e.pageX;
        var y = e.pageY;
        $menu.css({ top: y + 'px', left: x + 'px' }).show();
    });
}

// Función simple: al hacer click en una opción del menú contextual, mostrar el modal
function bindContextMenuToModal() {
    var $menu = $('#context-menu');
    if ($menu.length === 0) return;

    $menu.on('click', '.cm-item', function (e) {
        e.preventDefault();

        // Obtener la clave Y id_empresa de la fila seleccionada
        if (filaSeleccionada && filaSeleccionada.length > 0) {
            var clave = filaSeleccionada.data('clave');
            var idEmpresa = filaSeleccionada.data('id-empresa');

            // Cargar los datos del empleado en el modal (con clave e id_empresa)
            if (typeof cargarData === 'function' && jsonNominaConfianza) {
                cargarData(jsonNominaConfianza, clave, idEmpresa);
            }
        } else {

        }

        // Mostrar modal de detalles
        $('#modal-detalles').show();
        // Ocultar el menú contextual
        $menu.hide();
    });
}

// ========================================
// CERRAR EL MODAL Y LIMPIAR CAMPOS
// ========================================
// Función para cerrar el modal
function cerrarModalDetalles() {
    $("#cerrar-modal-detalles").click(function (e) {
        e.preventDefault();
        $('#modal-detalles').hide();
        limpiarModalDetalles();
    });
    $("#btn-cancelar-conceptos").click(function (e) {
        e.preventDefault();
        $('#modal-detalles').hide();
        limpiarModalDetalles();
    });
}

// Función para limpiar los campos del modal
function limpiarModalDetalles() {
    // Limpiar campos de información básica
    $('#campo-nombre').text('');
    $('#campo-clave').text('');
    $('#nombre-empleado-modal').text('');

    // Limpiar campos de percepciones
    $('#mod-sueldo-semanal').val('');
    $('#mod-vacaciones').val('');

    // Limpiar campos de conceptos
    $('#mod-isr').val('');
    $('#mod-imss').val('');
    $('#mod-infonavit').val('');
    $('#mod-ajustes-sub').val('');

    // Limpiar campos de deducciones
    $('#mod-tarjeta').val('');
    $('#mod-prestamo').val('');
    $('#mod-uniformes').val('');
    $('#mod-checador').val('');
    $('#mod-retardos').val('');
    $('#mod-inasistencias').val('');
    $('#mod-permiso').val('');

    // Limpiar tabla de registros biométricos
    $('#tabla-checador tbody').empty();

    // Limpiar tabla de horarios oficiales
    $('#horarios-oficiales-body').empty();

    // Limpiar conceptos personalizados
    $('#contenedor-conceptos-adicionales').empty();

    // Limpiar deducciones personalizadas
    $('#contenedor-deducciones-adicionales').empty();

    // Limpiar eventos especiales con mensajes de "Sin eventos"
    $('#olvidos-checador-content').html('<p class="sin-eventos">No hay olvidos registrados</p>');
    $('#retardos-content').html('<p class="sin-eventos">No hay retardos registrados</p>');
    $('#faltas-content').html('<p class="sin-eventos">No hay inasistencias registradas</p>');
    $('#analisis-permisos-comida-content').html('<p class="sin-eventos">No hay análisis de permisos y comidas disponible</p>');

    // Limpiar totales de eventos especiales
    $('#total-olvidos-checador').text('Total: 0 eventos');
    $('#total-retardos').text('Total: 0 eventos');
    $('#total-faltas').text('Total: 0 días');
    $('#total-analisis-permisos-comida').text('Total: 0 eventos');

    // Limpiar historial de retardos
    $('#contenedor-historial-retardos').empty();

    // Limpiar historial de inasistencias
    $('#contenedor-historial-inasistencias').empty();

    // Limpiar historial de olvidos
    $('#contenedor-historial-olvidos').empty();

    // Limpiar historial de uniformes
    $('#contenedor-historial-uniformes').empty();
    $('#input-folio-uniforme').val('');
    $('#input-cantidad-uniforme').val('');

    // Limpiar historial de permisos
    $('#contenedor-historial-permisos').empty();
    $('#input-descripcion-permiso').val('');
    $('#input-minutos-permiso').val('');
    $('#input-cantidad-permiso').val('');

    // Limpiar campo de sueldo a cobrar
    $('#mod-sueldo-a-cobrar').val('');

    // Limpiar campo id_empresa
    $('#campo-id-empresa').val('');
}

// ========================================
// FUNCIONES PARA LA FUNCIONALIDAD DE LOS INPUTS EN EL MODAL
// ========================================

// Función simple para actualizar automáticamente el Total Extra
function actualizarTotalExtra() {
    let total = 0;

    // Sumar vacaciones
    total += parseFloat($('#mod-vacaciones').val()) || 0;

    // Sumar todos los conceptos personalizados (solo los valores numéricos)
    $('#contenedor-conceptos-adicionales .concepto-personalizado input[type="number"]').each(function () {
        total += parseFloat($(this).val()) || 0;
    });

    // Actualizar el campo total con 2 decimales
    $('#mod-total-extra').val(total.toFixed(2));
}


// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y HORARIOS OFICIALES
// ========================================
function alternarTablas() {
    // BOTÓN BIOMÉTRICO: Mostrar registros del checador
    $('#btn-biometrico').on('click', function () {
        // Mostrar tabla de checador
        $('#tabla-checador').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-horarios-oficiales').attr('hidden', true);

        // Marcar botón como activo
        $('#btn-biometrico').addClass('active');
        $('#btn-horarios-oficiales').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-horarios-oficiales').on('click', function () {
        // Ocultar tabla de checador
        $('#tabla-checador').attr('hidden', true);
        // Mostrar tabla de horarios oficiales
        $('#tabla-horarios-oficiales').removeAttr('hidden');

        // Marcar botón como activo
        $('#btn-horarios-oficiales').addClass('active');
        $('#btn-biometrico').removeClass('active');
    });
}

// ========================================
// EDITAR HORAS EN TABLA HORARIOS OFICIALES
// ========================================
function hacerHorasEditables() {
    // Hacer que las celdas de hora sean editables al hacer clic
    $(document).on('click', '#horarios-oficiales-body td', function () {
        const $celda = $(this);
        const indiceCelda = $celda.index(); // Obtener el índice de la columna

        // NO permitir editar la primera columna (Día) ni la última columna (Acciones)
        if (indiceCelda === 0 || indiceCelda === 5) return;

        const textoActual = $celda.text().trim();

        // Si ya es un input, no hacer nada
        if ($celda.find('input').length > 0) return;

        // Crear input temporal
        const $input = $('<input type="time" class="form-control form-control-sm">');
        $input.val(textoActual !== '-' ? textoActual : '');

        // Reemplazar texto con input
        $celda.html($input);
        $input.focus();

        // Al salir del input (blur), validar y guardar
        $input.on('blur', function () {
            const valorIngresado = $input.val();

            if (valorIngresado) {
                // Validar formato HH:MM y rango
                if (validarHora(valorIngresado)) {
                    $celda.text(valorIngresado);
                } else {
                    alert('⚠️ Hora inválida. Use formato HH:MM (00:00 - 23:59)');
                    $celda.text(textoActual);
                }
            } else {
                $celda.text('-');
            }
        });

        // Al presionar Enter, guardar
        $input.on('keypress', function (e) {
            if (e.which === 13) { // Enter
                $input.blur();
            }
        });
    });
}

// Validar formato y rango de hora
function validarHora(hora) {
    // Validar formato HH:MM
    const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(hora);
}


// ========================================
// ACTIVAR BOTONES DE RECÁLCULO EN EL MODAL
// ========================================

function activarBotonesRecalculo() {
    // Evento para el botón de calcular retardos
    $(document).on('click', '#btn-calcular-retardos', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        
        if (empleado && typeof recalcularTotalRetardos === 'function') {
            recalcularTotalRetardos(empleado, true);
        }
    });

    // Evento para el botón de calcular checador
    $(document).on('click', '#btn-calcular-checador', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        
        if (empleado && typeof recalcularTotalOlvidos === 'function') {
            recalcularTotalOlvidos(empleado, true);
        }
    });

    // Evento para el botón de calcular inasistencias
    $(document).on('click', '#btn-calcular-inasistencias', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        
        if (empleado && typeof recalcularTotalInasistencias === 'function') {
            recalcularTotalInasistencias(empleado, true);
        }
    });

    // BOTONES PARA APLICAR CONCEPTOS DESDE conceptos_copia
    // Aplica ISR (código 45) desde conceptos_copia al empleado actual y actualiza el input
    $(document).on('click', '#btn-aplicar-isr', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '45') : null;
        if (!copia) {
            alert('No hay valor de ISR en conceptos_copia para este empleado');
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

        $('#mod-isr').val(copia.resultado);
    });

    // Aplica IMSS (código 52) desde conceptos_copia
    $(document).on('click', '#btn-aplicar-imss', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '52') : null;
        if (!copia) {
            alert('No hay valor de IMSS en conceptos_copia para este empleado');
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

        $('#mod-imss').val(copia.resultado);
    });

    // Aplica INFONAVIT (código 16) desde conceptos_copia
    $(document).on('click', '#btn-aplicar-infonavit', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '16') : null;
        if (!copia) {
            alert('No hay valor de INFONAVIT en conceptos_copia para este empleado');
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

        $('#mod-infonavit').val(copia.resultado);
    });

    // Aplica AJUSTE AL SUB (código 107) desde conceptos_copia
    $(document).on('click', '#btn-aplicar-ajuste-sub', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '107') : null;
        if (!copia) {
            alert('No hay valor de Ajuste al Sub en conceptos_copia para este empleado');
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

        $('#mod-ajustes-sub').val(copia.resultado);
    });

    // Aplica TARJETA desde tarjeta_copia (actualiza la propiedad tarjeta y el input)
    $(document).on('click', '#btn-aplicar-tarjeta', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const copiaTarjeta = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? empleado.tarjeta_copia : null;
        if (copiaTarjeta === null) {
            alert('No hay valor de tarjeta_copia para este empleado');
            return;
        }

        // Actualizar la propiedad tarjeta con el valor de tarjeta_copia
        empleado.tarjeta = copiaTarjeta;
        // Actualizar input del modal
        $('#mod-tarjeta').val(copiaTarjeta);
    });

}

function activarFuncionalidadInasistencias() {
    // Activar función para agregar inasistencias manuales
    if (typeof agregarInasistenciaManual === 'function') {
        agregarInasistenciaManual();
    }
}

function activarInputsValidadores() {

    // VALIDADORES: impedir escribir valores mayores a los de copia
    // Se inicializan de forma que siempre consulten el empleado mostrado en el modal
    // y corrigen el valor automáticamente si excede el máximo permitido.
    $(document).on('input', '#mod-tarjeta', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const maxVal = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? parseFloat(empleado.tarjeta_copia) : null;
        if (maxVal === null) return;

        const $this = $(this);
        let val = parseFloat($this.val()) || 0;
        if (val > maxVal) {
            $this.val(maxVal);
        }
    });

    // Manejador global: aplicar tarjeta_copia y conceptos_copia a TODOS los empleados
    $(document).on('click', '#btn_aplicar_copias_global', function () {
        if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) {
            alert('No hay nómina cargada para aplicar copias.');
            return;
        }

        let totalAplicados = 0;

        jsonNominaConfianza.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                // Aplicar tarjeta_copia si existe
                if (emp.tarjeta_copia !== undefined && emp.tarjeta_copia !== null) {
                    emp.tarjeta = emp.tarjeta_copia;
                }

                // Aplicar conceptos_copia si existe
                if (Array.isArray(emp.conceptos_copia) && emp.conceptos_copia.length > 0) {
                    emp.conceptos = JSON.parse(JSON.stringify(emp.conceptos_copia));
                }

                totalAplicados++;
            });
        });

        // Guardar cambios y notificar
        try {
            if (typeof saveNomina === 'function') {
                saveNomina(jsonNominaConfianza);
            }
        } catch (err) {

        }

        // Refrescar la tabla para mostrar los cambios
        if (typeof mostrarDatosTabla === 'function') {
            mostrarDatosTabla(jsonNominaConfianza, paginaActualNomina || 1);
        }

        limpiarFiltrosYBusqueda();

        if (typeof Swal !== 'undefined') {
            Swal.fire({ icon: 'success', title: 'Copias aplicadas', text: 'Se aplicaron copias a ' + totalAplicados + ' empleados.' });
        } else {
            alert('Copias aplicadas a ' + totalAplicados + ' empleados.');
        }
    });

    // Validadores para conceptos principales: ISR(45), IMSS(52), INFONAVIT(16)
    function validarConceptoMax(inputSelector, codigo) {
        $(document).on('input', inputSelector, function () {
            const clave = $('#campo-clave').text().trim();
            const idEmpresa = $('#campo-id-empresa').val().trim();
            if (!clave || !idEmpresa) return;
            
            const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
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

    validarConceptoMax('#mod-isr', '45');
    validarConceptoMax('#mod-imss', '52');
    validarConceptoMax('#mod-infonavit', '16');
    validarConceptoMax('#mod-ajustes-sub', '107');

    // DETECTAR EDICIONES MANUALES: marcar banderas cuando el usuario edita directamente los inputs
    // Esto permite que el valor manual se respete aunque el historial cambie
    $(document).on('input', '#mod-checador', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (empleado) {
            empleado._checador_editado_manual = true;
            empleado.checador = parseFloat($(this).val()) || 0;
        }
    });

    $(document).on('input', '#mod-retardos', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (empleado) {
            empleado._retardos_editado_manual = true;
            empleado.retardos = parseFloat($(this).val()) || 0;
        }
    });

    $(document).on('input', '#mod-inasistencias', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (empleado) {
            empleado._inasistencias_editado_manual = true;
            empleado.inasistencia = parseFloat($(this).val()) || 0;
        }
    });

    $(document).on('input', '#mod-uniformes', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (empleado) {
            empleado._uniformes_editado_manual = true;
            empleado.uniformes = parseFloat($(this).val()) || 0;
        }
    });

    $(document).on('input', '#mod-permiso', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (empleado) {
            empleado._permiso_editado_manual = true;
            empleado.permiso = parseFloat($(this).val()) || 0;
        }
    });

    $(document).on('input', '#mod-prestamo', function () {
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (empleado) {
            empleado._prestamo_editado_manual = true;
            empleado.prestamo = parseFloat($(this).val()) || 0;
        }
    });

    // Para conceptos adicionales dinámicos: si cada input lleva data-codigo y existe en conceptos_copia,
    // se valida de la misma forma. Escuchamos cambios en el contenedor y aplicamos validación a los inputs nuevos.
    $(document).on('input', '#contenedor-conceptos-adicionales input[type="number"]', function () {
        const $input = $(this);
        const codigo = $input.data('codigo');
        if (!codigo) return; // sin código no hay copia que validar
        const clave = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        if (!clave || !idEmpresa) return;
        
        const empleado = buscarEmpleadoPorClaveYEmpresa(clave, idEmpresa);
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === String(codigo)) : null;
        if (!copia) return;

        const maxVal = parseFloat(copia.resultado) || 0;
        let val = parseFloat($input.val()) || 0;
        if (val > maxVal) {
            $input.val(maxVal);
        }
    });

}

// ========================================
// LIMPIAR BÚSQUEDA
// ========================================
function limpiarBusqueda() {
    // Limpiar el campo de búsqueda
    $('#busqueda-nomina-confianza').val('');

    // Verificar si hay filtros activos de departamento o empresa
    const valorDepartamento = String($('#filtro-departamento').val() || '0');
    const valorEmpresa = String($('#filtro-empresa').val() || '0');

    // Si hay filtros activos, aplicarlos; si no, mostrar todos los empleados
    if (valorDepartamento !== '0' || valorEmpresa !== '0') {
        // Hay filtros activos, aplicar solo esos filtros
        if (typeof configPaginacionSelect === 'function') {
            configPaginacionSelect();
        }
    } else {
        // No hay filtros, mostrar todos los empleados
        if (typeof mostrarDatosTabla === 'function' && jsonNominaConfianza) {
            mostrarDatosTabla(jsonNominaConfianza, 1);
        }
    }
}

// Evento para el botón de limpiar búsqueda
$(document).on('click', '#btn-clear-busqueda', function () {
    limpiarBusqueda();
});




