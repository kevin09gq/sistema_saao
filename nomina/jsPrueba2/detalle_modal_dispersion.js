/*
 * ================================================================
 * MODAL DE DISPERSIÓN - MENÚ CONTEXTUAL
 * ================================================================
 * Este módulo maneja únicamente el menú contextual para la tabla de dispersión
 * ================================================================
 */

/*
 * ================================================================
 * CONFIGURACIÓN DEL SISTEMA
 * ================================================================
 * Configuraciones centralizadas para identificación de empleados
 * y parámetros del sistema que pueden cambiar en el futuro
 * ================================================================
 */
const CONFIG_40_LIBRAS = {
    // Identificador principal: valor del incentivo para empleados de 40 LIBRAS
    INCENTIVO_IDENTIFICADOR: 250,

    // Nombre del departamento (solo para referencia/logs, no se usa para identificación)
    NOMBRE_DEPARTAMENTO_REFERENCIA: 'PRODUCCION 40 LIBRAS',

    // Configuraciones adicionales que pueden cambiar
    INCENTIVO_POR_DEFECTO: 250,
    VALOR_MINIMO_SUELDO: 0
};

// Variable global para almacenar claves válidas
let clavesValidasGlobal = [];

// Función para inicializar el menú contextual de la tabla de dispersión
function inicializarMenuContextualDispersion() {
    // Limpiar eventos previos para evitar acumulación
    $(document).off('contextmenu', '#tabla-dispersion-body tr');
    $(document).off('click', '#menu-contextual-dispersion');

    // Crear un mapa de empleados para búsqueda rápida
    const empleadosMap = new Map();
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                empleadosMap.set(String(emp.clave), {
                    empleado: emp,
                    departamento: depto.nombre || ''
                });
            });
        });
    }

    // Mostrar menú contextual para empleados registrados en BD
    $(document).on('contextmenu', '#tabla-dispersion-body tr', function (e) {
        e.preventDefault();
        const clave = $(this).data('clave');

        // Verificar si el empleado está registrado en la BD
        const empleadoInfo = empleadosMap.get(String(clave));
        const esEmpleadoRegistrado = clavesValidasGlobal.includes(String(clave)) ||
            clavesValidasGlobal.includes(Number(clave));

        if (empleadoInfo && esEmpleadoRegistrado) {
            // Guardar la clave para usar en "Ver detalles"
            $('#menu-contextual-dispersion').data('clave-actual', clave);
            $('#menu-contextual-dispersion')
                .css({ left: e.pageX, top: e.pageY })
                .removeAttr('hidden');
        } else {
            $('#menu-contextual-dispersion').attr('hidden', true);
        }
    });

    // Ocultar menú contextual al hacer clic fuera
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#menu-contextual-dispersion').length) {
            $('#menu-contextual-dispersion').attr('hidden', true);
        }
    });

    // Mostrar modal de dispersión al hacer clic en "Actualizar Sueldo"
    $(document).on('click', '#menu-contextual-dispersion', function () {
        $('#menu-contextual-dispersion').attr('hidden', true);

        // Obtener la clave guardada
        const clave = $(this).data('clave-actual');
        if (clave) {
            abrirModalDispersion(clave);
        }
    });
}

// Función para abrir el modal de dispersión con datos del empleado
function abrirModalDispersion(clave) {
    // Buscar empleado en jsonGlobal
    const empleado = obtenerEmpleadoPorClave(clave);

    if (!empleado) {
        return;
    }

    // Llenar datos del empleado en el modal
    $('#disp-clave').text(empleado.clave || '--');
    $('#disp-nombre').text(empleado.nombre || '--');

    // Obtener sueldo neto actual (usar sueldo_base como sueldo neto)
    const tarjeta = parseFloat(empleado.neto_pagar);

    // Establecer valores en el modal
    $('#disp-sueldo-neto').val(tarjeta.toFixed(2));

    // Configurar eventos del modal
    configurarEventosModalDispersion(clave);

    // Mostrar el modal
    $('#modal-dispersion').fadeIn();
}

// Función para configurar eventos del modal de dispersión
function configurarEventosModalDispersion(clave) {
    // Limpiar eventos previos
    $('#btn-guardar-dispersion').off('click.dispersion');
    $('#btn-cancelar-dispersion').off('click.dispersion');
    $('#cerrar-modal-dispersion').off('click.dispersion');
    $(document).off('keydown.dispersion');
    $('#modal-dispersion').off('click.dispersion');

    // Evento para guardar cambios
    $('#btn-guardar-dispersion').on('click.dispersion', function () {
        guardarCambiosDispersion(clave);
    });

    // Evento para cerrar modal con botón cancelar
    $('#btn-cancelar-dispersion').on('click.dispersion', function () {
        cerrarModalDispersion();
    });

    // Evento para cerrar modal con X
    $('#cerrar-modal-dispersion').on('click.dispersion', function () {
        cerrarModalDispersion();
    });

    // Cerrar modal con ESC
    $(document).on('keydown.dispersion', function (e) {
        if (e.key === 'Escape') {
            cerrarModalDispersion();
        }
    });

    // Cerrar modal al hacer clic fuera del contenido
    $('#modal-dispersion').on('click.dispersion', function (e) {
        if (e.target === this) {
            cerrarModalDispersion();
        }
    });
}

// Función para cerrar el modal de dispersión
function cerrarModalDispersion() {
    // Limpiar eventos
    $('#btn-guardar-dispersion').off('click.dispersion');
    $('#btn-cancelar-dispersion').off('click.dispersion');
    $('#cerrar-modal-dispersion').off('click.dispersion');
    $(document).off('keydown.dispersion');
    $('#modal-dispersion').off('click.dispersion');

    // Limpiar campos del modal
    $('#disp-clave').text('--');
    $('#disp-nombre').text('--');
    $('#disp-sueldo-neto').val('');

    // Ocultar modal con efecto
    $('#modal-dispersion').fadeOut();
}

// Función para obtener empleado por clave
function obtenerEmpleadoPorClave(clave) {
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return null;

    for (let depto of window.jsonGlobal.departamentos) {
        const empleado = (depto.empleados || []).find(emp => String(emp.clave) === String(clave));
        if (empleado) {
            return empleado;
        }
    }
    return null;
}

/*
 * ================================================================
 * MÓDULO DE GUARDADO Y ACTUALIZACIÓN DE DATOS
 * ================================================================
 */

/**
 * Guarda los cambios del sueldo neto en el jsonGlobal
 * @param {string|number} clave - Clave del empleado
 */
function guardarCambiosDispersion(clave) {
    const nuevoSueldo = parseFloat($('#disp-sueldo-neto').val()) || 0;

    // Validar que el sueldo sea mayor o igual al valor mínimo configurado (permite 0)
    if (nuevoSueldo < CONFIG_40_LIBRAS.VALOR_MINIMO_SUELDO) {
        return;
    }

    // Mostrar estado de guardando
    const $btnGuardar = $('#btn-guardar-dispersion');
    $btnGuardar.text('Guardando...').prop('disabled', true);

    try {
        // Actualizar en jsonGlobal
        const actualizado = actualizarSueldoEnJsonGlobal(clave, nuevoSueldo);

        if (actualizado) {
            // Actualizar en otras estructuras de datos si existen
            actualizarEnOtrasEstructuras(clave, nuevoSueldo);

            // Actualizar la tabla visual
            actualizarTablaVisual(clave, nuevoSueldo);

            // Cerrar modal después de un breve delay
            setTimeout(() => {
                cerrarModalDispersion();
            }, 500);
        } else {
            throw new Error('No se pudo encontrar el empleado en jsonGlobal');
        }

    } catch (error) {

    } finally {
        // Restaurar botón
        $btnGuardar.text('Guardar').prop('disabled', false);
    }
}

/**
 * Actualiza el sueldo neto en jsonGlobal
 */
function actualizarSueldoEnJsonGlobal(clave, nuevoSueldo) {
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) {

        return false;
    }

    let empleadoEncontrado = false;

    // Buscar y actualizar en todos los departamentos
    window.jsonGlobal.departamentos.forEach(depto => {
        if (depto.empleados) {
            depto.empleados.forEach(empleado => {
                if (String(empleado.clave) === String(clave)) {
                    empleado.neto_pagar = nuevoSueldo;
                    empleadoEncontrado = true;

                }
            });
        }
    });

    return empleadoEncontrado;
}

/**
 * Actualiza el sueldo en otras estructuras de datos si existen
 
 */
function actualizarEnOtrasEstructuras(clave, nuevoSueldo) {
    // Actualizar en empleadosOriginales si existe
    if (window.empleadosOriginales && Array.isArray(window.empleadosOriginales)) {
        const empleado = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleado) {
            empleado.neto_pagar = nuevoSueldo;

        }
    }

    // Actualizar en empleadosOriginalesDispersion si existe
    if (window.empleadosOriginalesDispersion && Array.isArray(window.empleadosOriginalesDispersion)) {
        const empleado = window.empleadosOriginalesDispersion.find(emp => String(emp.clave) === String(clave));
        if (empleado) {
            empleado.neto_pagar = nuevoSueldo;

        }
    }

    // Actualizar en empleadosFiltradosDispersion si existe
    if (window.empleadosFiltradosDispersion && Array.isArray(window.empleadosFiltradosDispersion)) {
        const empleado = window.empleadosFiltradosDispersion.find(emp => String(emp.clave) === String(clave));
        if (empleado) {
            empleado.neto_pagar = nuevoSueldo;
        }
    }
}

/**
 * Actualiza la tabla visual con el nuevo sueldo
 */
function actualizarTablaVisual(clave, nuevoSueldo) {
    // 1. Actualizar tabla de dispersión
    actualizarTablaDispersion(clave, nuevoSueldo);

    // 2. Actualizar tabla de nómina (solo para empleados de 40 LIBRAS)
    actualizarTablaNomina(clave, nuevoSueldo);
}

/**
 * Actualiza la tabla de dispersión con el nuevo sueldo
 * @param {string|number} clave - Clave del empleado
 * @param {number} nuevoSueldo - Nuevo sueldo
 */
function actualizarTablaDispersion(clave, nuevoSueldo) {
    const $fila = $(`#tabla-dispersion-body tr[data-clave="${clave}"]`);

    if ($fila.length === 0) {
        console.warn(`⚠️ No se encontró fila en tabla dispersión para empleado: ${clave}`);
        return;
    }

    // Buscar la celda del sueldo neto (columna 4, índice 3)
    const $celdas = $fila.find('td');
    if ($celdas.length >= 4) {
        // Actualizar el texto de la celda
        $($celdas[3]).text(nuevoSueldo.toFixed(2));

    }
}

/**
 * Actualiza la tabla de nómina con el nuevo sueldo (solo empleados de 40 LIBRAS)
*/
function actualizarTablaNomina(clave, nuevoSueldo) {
    // Verificar si el empleado es de 40 LIBRAS
    const esEmpleado40Libras = verificarEmpleado40Libras(clave);

    if (!esEmpleado40Libras) {
        console.log(`🚫 Empleado ${clave} no es de 40 LIBRAS, no se actualiza tabla nómina`);
        return;
    }

    // Buscar la fila en la tabla de nómina
    const $filaNomina = $(`#tabla-nomina-body tr[data-clave="${clave}"]`);

    if ($filaNomina.length === 0) {
        console.warn(`⚠️ No se encontró fila en tabla nómina para empleado: ${clave}`);
        return;
    }

    // Actualizar la columna TARJETA (columna 7, índice 6)
    const $celdasNomina = $filaNomina.find('td');
    if ($celdasNomina.length >= 7) {
        $($celdasNomina[6]).text(nuevoSueldo.toFixed(2));

        // Recalcular sueldo a cobrar si es necesario
        recalcularSueldoACobrar(clave, $filaNomina);

        console.log('✅ Tabla nómina actualizada - columna TARJETA');
    }
}

/**
 * Verifica si un empleado pertenece al departamento de 40 LIBRAS
 * 
 * SISTEMA FLEXIBLE DE IDENTIFICACIÓN:
 * - Utiliza el incentivo como identificador principal (CONFIG_40_LIBRAS.INCENTIVO_IDENTIFICADOR)
 * - Evita dependencia en nombres de departamento que pueden cambiar
 * - También verifica si está en empleadosOriginales como respaldo
 * 
 * CONFIGURACIÓN:
 * - Para cambiar el valor del incentivo identificador, modificar CONFIG_40_LIBRAS.INCENTIVO_IDENTIFICADOR
 * - El nombre del departamento es solo para referencia, no se usa para identificación
 * 
 * @param {string|number} clave - Clave del empleado
 * @returns {boolean} True si es de 40 LIBRAS, false si no
 */
function verificarEmpleado40Libras(clave) {
    // Buscar empleado directamente por clave en el JSON global
    const empleado = obtenerEmpleadoPorClave(clave);

    if (!empleado) {
        return false;
    }

    // Verificar si tiene incentivo de 250 (identificador de 40 LIBRAS)
    // También verificar si está en empleadosOriginales (que solo contiene empleados de 40 LIBRAS)
    const tieneIncentivo40Libras = empleado.incentivo === CONFIG_40_LIBRAS.INCENTIVO_IDENTIFICADOR;
    const estaEnEmpleadosOriginales = window.empleadosOriginales?.some(emp =>
        String(emp.clave) === String(clave)
    );

    // Retornar true si cumple cualquiera de las condiciones
    return tieneIncentivo40Libras || estaEnEmpleadosOriginales;
}

/**
 * Recalcula el sueldo a cobrar en la tabla de nómina
 * @param {string|number} clave - Clave del empleado
 * @param {jQuery} $fila - Fila jQuery de la tabla
 */
function recalcularSueldoACobrar(clave, $fila) {
    // Obtener datos actualizados del empleado desde jsonGlobal
    const empleado = obtenerEmpleadoPorClave(clave);

    if (!empleado) {
        return;
    }

    // Recalcular sueldo a cobrar usando la misma lógica que el sistema
    const sueldoACobrar = calcularSueldoACobraSimplificado(empleado);

    // Actualizar la columna SUELDO A COBRAR (columna 16, índice 15)
    const $celdas = $fila.find('td');
    if ($celdas.length >= 16) {
        $($celdas[15]).text(sueldoACobrar.toFixed(2));
        console.log('✅ Sueldo a cobrar recalculado en tabla nómina');
    }
}

/**
 * Cálculo simplificado del sueldo a cobrar
 * @param {Object} emp - Datos del empleado
 * @returns {number} Sueldo a cobrar calculado
 */
function calcularSueldoACobraSimplificado(emp) {
    // === PERCEPCIONES ===
    const sueldoNeto = parseFloat(emp.sueldo_base) || 0;
    const incentivo = parseFloat(emp.incentivo) || 0;
    const sueldoExtraFinal = parseFloat(emp.sueldo_extra_final) || parseFloat(emp.sueldo_extra) || 0;

    const totalPercepciones = sueldoNeto + incentivo + sueldoExtraFinal;

    // === CONCEPTOS (ISR, IMSS, INFONAVIT) ===
    let totalConceptos = 0;
    const conceptos = emp.conceptos || [];
    conceptos.forEach(concepto => {
        if (['45', '52', '16'].includes(concepto.codigo)) {
            totalConceptos += parseFloat(concepto.resultado) || 0;
        }
    });

    // === DEDUCCIONES ===
    const tarjeta = parseFloat(emp.neto_pagar) || 0;
    const prestamo = parseFloat(emp.prestamo) || 0;
    const inasistencias = parseFloat(emp.inasistencias_descuento) || 0;
    const uniformes = parseFloat(emp.uniformes) || 0;
    const checador = parseFloat(emp.checador) || 0;
    const faGafetCofia = parseFloat(emp.fa_gafet_cofia) || 0;

    const totalDeducciones = tarjeta + prestamo + inasistencias + uniformes + checador + faGafetCofia + totalConceptos;

    // === SUELDO A COBRAR ===
    return totalPercepciones - totalDeducciones;
}





