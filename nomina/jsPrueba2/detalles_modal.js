/*
 * ================================================================
 * MÓDULO DE BÚSQUEDA Y CARGA DE DATOS DEL EMPLEADO
 * ================================================================
 * Este módulo se encarga de:
 * - Buscar empleado específico por clave en el JSON global
 * ================================================================
 */

function buscarDatos(claveEmpleado) {
    // Busca el empleado en jsonGlobal usando la clave
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return null;

    let empleadoEncontrado = null;

    // Recorre todos los departamentos y empleados
    window.jsonGlobal.departamentos.forEach(depto => {
        (depto.empleados || []).forEach(emp => {
            // Compara la clave como string o número
            if (String(emp.clave) === String(claveEmpleado)) {
                empleadoEncontrado = emp;
            }
        });
    });

    if (empleadoEncontrado) {
        //  ACTIVAR MODAL ANTES DE CONFIGURAR DATOS
        activarModal();

        // RESETEAR ESTADO DE MINI-TABS ANTES DE MOSTRAR DATOS
        resetearEstadoMiniTabs();

        establecerDatosTrabajador(empleadoEncontrado.clave, empleadoEncontrado.nombre);
        establecerDatosConceptos(empleadoEncontrado.conceptos || []);
        llenarTablaHorariosSemanales(empleadoEncontrado);
        establecerDatosPercepciones(empleadoEncontrado);
        establecerDatosDeducciones(empleadoEncontrado);
        establecerMinutosHoras(empleadoEncontrado.Minutos_extra, empleadoEncontrado.Minutos_normales);
    }
}

// Variable global para controlar si el modal está activo
let modalDetallesActivo = false;

// Función para activar el modal y configurar eventos
function activarModal() {
    modalDetallesActivo = true;
}

// Función para resetear estado de mini-tabs
function resetearEstadoMiniTabs() {
    // Resetear clases activas de los botones
    $('.mini-tab-registros').removeClass('active');
    $('#btn-redondeados').addClass('active');

    // Mostrar tabla redondeados por defecto y ocultar checador
    $('#tabla-checador').hide();
    $('#tabla-redondeados').show();
}

/*
 * ================================================================
 * MODULO TRABAJADOR
 * ================================================================
 */

function establecerDatosTrabajador(clave, nombre) {
    $('#campo-clave').text(clave);
    $('#campo-nombre').text(nombre);
}




/*
 * ================================================================
 * MÓDULO MODIFICAR DETALLES
 * ================================================================
 * Este módulo maneja la edición de datos del empleado en el modal
 * Incluye: percepciones, bonos, conceptos adicionales y cálculos
 * ================================================================
 */

/*
 * ----------------------------------------------------------------
 * SUBSECCIÓN: PERCEPCIONES
 * ----------------------------------------------------------------
 * Gestiona datos de sueldos, bonos e incentivos del empleado
 * ----------------------------------------------------------------
 */

// Inicializar campos de percepciones con datos del empleado
function establecerDatosPercepciones(empleado) {
    // Limpiar inputs antes de establecer valores
    $("#mod-sueldo-neto").val(0);
    $("#mod-horas-extras").val(0);
    $("#mod-total-extra").val(0);
    $("#mod-actividades-especiales").val(0); // Limpiar actividades especiales
    $("#mod-bono-responsabilidad").val(0); // Limpiar bono responsabilidad

    // Establecer valores solo si existen y no son NaN
    if (empleado.sueldo_base && !isNaN(empleado.sueldo_base)) {
        $("#mod-sueldo-neto").val(empleado.sueldo_base);
    }
    if (empleado.sueldo_extra && !isNaN(empleado.sueldo_extra)) {
        $("#mod-horas-extras").val(empleado.sueldo_extra);
    }

    // Establecer total extra con sueldo_extra_final si existe
    if (empleado.sueldo_extra_final && !isNaN(empleado.sueldo_extra_final)) {
        $("#mod-total-extra").val(empleado.sueldo_extra_final);
    }

    // Establecer actividades especiales del empleado
    if (empleado.actividades_especiales && !isNaN(empleado.actividades_especiales)) {
        $("#mod-actividades-especiales").val(empleado.actividades_especiales);
    }

    // Establecer bono responsabilidad del empleado
    if (empleado.bono_puesto && !isNaN(empleado.bono_puesto)) {
        $("#mod-bono-responsabilidad").val(empleado.bono_puesto);
    }

    //   Establecer sueldo a cobrar del empleado
    if (empleado.sueldo_a_cobrar && !isNaN(empleado.sueldo_a_cobrar)) {
        $("#mod-sueldo-a-cobrar").val(empleado.sueldo_a_cobrar.toFixed(2));
    }

    // Agregar eventos para actualizar sueldos en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-sueldo-neto").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const sueldoBase = parseFloat($(this).val());
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_base', sueldoBase);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_base_manual', true); // Activar bandera manual
        actualizarSueldoACobrarEnTiempoReal(clave); // Actualizar sueldo a cobrar
    });

    $("#mod-horas-extras").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const sueldoExtra = parseFloat($(this).val());
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_extra', sueldoExtra);
        calcularTotalExtra(); // Recalcular total
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

    $("#mod-incentivo-monto").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const incentivo = parseFloat($(this).val());
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'incentivo', incentivo);
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

    $("#mod-actividades-especiales").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const actividadesEspeciales = parseFloat($(this).val()) || 0;
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'actividades_especiales', actividadesEspeciales);
        calcularTotalExtra(); // Recalcular total
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

    $("#mod-bono-responsabilidad").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const bonoPuesto = parseFloat($(this).val()) || 0;
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_puesto', bonoPuesto);
        calcularTotalExtra(); // Recalcular total
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });


    // Cargar conceptos adicionales existentes del empleado
    cargarConceptosAdicionalesExistentes(empleado);


    configCheckBox(empleado.incentivo, empleado.bono_antiguedad);

    // Calcular total extra inicial después de cargar todos los valores
    setTimeout(() => {
        calcularTotalExtra();
        actualizarSueldoACobrarEnTiempoReal($('#campo-clave').text().trim()); //   Calcular sueldo a cobrar inicial
    }, 100);
}

// Configurar checkboxes de incentivo y bono de antigüedad
function configCheckBox(incentivo, bonoAntiguedad) {

    // CONFIGURAR CHECKBOX E INPUT DEL INCENTIVO
    const checkboxIncentivo = $("#mod-incentivo-check");
    const inputIncentivo = $("#mod-incentivo-monto");

    // Establecer estado inicial del checkbox según si el empleado tiene incentivo
    if (incentivo && incentivo > 0) {
        checkboxIncentivo.prop('checked', true);
        inputIncentivo.prop('disabled', false);
        inputIncentivo.val(incentivo);
    } else {
        checkboxIncentivo.prop('checked', false);
        inputIncentivo.prop('disabled', true);
        inputIncentivo.val(0);
    }

    checkboxIncentivo.off('change').on('change', function () {
        const isChecked = $(this).is(':checked');

        if (isChecked) {
            // Activar input y poner valor por defecto
            inputIncentivo.prop('disabled', false);
            inputIncentivo.val(incentivo);
            inputIncentivo.focus(); // Dar foco para que el usuario pueda editar
        } else {
            // Desactivar input y poner en 0
            inputIncentivo.prop('disabled', true);
            inputIncentivo.val(0);
        }

        // ACTUALIZAR INCENTIVO EN JSON CUANDO CAMBIE EL CHECKBOX
        const clave = $('#campo-clave').text().trim();
        const valorIncentivo = isChecked ? parseFloat(inputIncentivo.val()) : 0;
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'incentivo', valorIncentivo);
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

    // CONFIGURAR CHECKBOX E INPUT DEL BONO DE ANTIGÜEDAD
    const checkboxBonoAntiguedad = $("#mod-bono-antiguedad-check");
    const inputBonoAntiguedad = $("#mod-bono-antiguedad");

    // ESTABLECER ESTADO INICIAL BASADO EN LOS DATOS DEL EMPLEADO
    if (bonoAntiguedad && bonoAntiguedad > 0) {
        checkboxBonoAntiguedad.prop('checked', true);
        inputBonoAntiguedad.prop('disabled', false);
        inputBonoAntiguedad.val(bonoAntiguedad);
    } else {
        checkboxBonoAntiguedad.prop('checked', false);
        inputBonoAntiguedad.prop('disabled', true);
        inputBonoAntiguedad.val(0);
    }

    checkboxBonoAntiguedad.off('change').on('change', function () {
        const isChecked = $(this).is(':checked');

        if (isChecked) {
            // Activar input y poner valor por defecto
            inputBonoAntiguedad.prop('disabled', false);
            inputBonoAntiguedad.val(150);
            inputBonoAntiguedad.focus();
        } else {
            // Desactivar input y poner en 0
            inputBonoAntiguedad.prop('disabled', true);
            inputBonoAntiguedad.val(0);
        }

        // ACTUALIZAR BONO EN JSON CUANDO CAMBIE EL CHECKBOX
        const clave = $('#campo-clave').text().trim();
        const valorBono = isChecked ? parseFloat(inputBonoAntiguedad.val()) : 0;
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_antiguedad', valorBono);
        calcularTotalExtra(); // Recalcular total
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

    // Evento para actualizar valor cuando se modifica el input del bono
    inputBonoAntiguedad.off('input').on('input', function () {
        if (!$(this).prop('disabled')) {
            const clave = $('#campo-clave').text().trim();
            const valorBono = parseFloat($(this).val()) || 0;
            actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_antiguedad', valorBono);
            calcularTotalExtra(); // Recalcular total
            actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
        }
    });
}


/*
 * ----------------------------------------------------------------
 * SUBSECCIÓN: FUNCIONES AUXILIARES
 * ----------------------------------------------------------------
 * Funciones de soporte para actualización y cálculos
 * ----------------------------------------------------------------
 */

// Función universal para actualizar cualquier propiedad del empleado en todas las estructuras JSON
function actualizarPropiedadEmpleadoEnJsonGlobal(clave, propiedad, valor) {
    // Verificar que tenemos un valor válido para actualizar

    let empleadoEncontrado = false;

    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    // Asegurar que el valor anterior se mantenga si el nuevo es NaN
                    if (typeof valor === 'number' && isNaN(valor)) {
                       
                        valor = emp[propiedad] || 0;
                    }
                    
                    emp[propiedad] = valor;
                    empleadoEncontrado = true;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal[propiedad] = valor;
            empleadoEncontrado = true;
        }
    }

    // Actualizar en empleadosFiltrados
    if (window.empleadosFiltrados) {
        const empleadoFiltrado = window.empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado[propiedad] = valor;
            empleadoEncontrado = true;
        }
    }

   
}

function calcularTotalExtra() {
    // Obtener valores de todos los campos que conforman el total extra
    const horasExtras = parseFloat($('#mod-horas-extras').val()) || 0;
    const bonoAntiguedad = parseFloat($('#mod-bono-antiguedad').val()) || 0;
    const actividadesEspeciales = parseFloat($('#mod-actividades-especiales').val()) || 0;
    const bonoPuesto = parseFloat($('#mod-bono-responsabilidad').val()) || 0;

    // Sumar conceptos adicionales dinámicos
    let conceptosAdicionalesTotales = 0;
    $('.concepto-adicional .concepto-valor').each(function () {
        const valor = parseFloat($(this).val()) || 0;
        conceptosAdicionalesTotales += valor;
    });

    // Calcular el total
    const totalExtra = horasExtras + bonoAntiguedad + actividadesEspeciales + bonoPuesto + conceptosAdicionalesTotales;

    // Actualizar el campo total extra
    $('#mod-total-extra').val(totalExtra.toFixed(2));

    // Actualizar en el JSON global también
    const clave = $('#campo-clave').text().trim();
    if (clave) {
        // Actualizar cada componente individual también para asegurar que se sincronicen
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_extra', horasExtras);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_antiguedad', bonoAntiguedad);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'actividades_especiales', actividadesEspeciales);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_puesto', bonoPuesto);
        
        // Actualizar el total extra
        actualizarTotalExtraEnJsonGlobal(clave, totalExtra);
        actualizarSueldoACobrarEnTiempoReal(clave); // Actualizar sueldo a cobrar
    }
}



// Actualizar total extra final en el JSON global del empleado
function actualizarTotalExtraEnJsonGlobal(clave, totalExtra) {
    // Usar la función universal para actualizar ambas propiedades
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'total_extra_calculado', totalExtra);
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_extra_final', totalExtra);
}

// Calcular sueldo a cobrar: (Sueldo Neto + Incentivo + Extra) - (Tarjeta + Préstamo + Inasistencias + Uniformes + INFONAVIT + ISR + IMSS + Checador + F.A/GAFET/COFIA)
function calcularSueldoACobrar(clave) {
    // Obtener empleado actualizado
    const empleado = obtenerEmpleadoActualizado(clave);
    if (!empleado) return 0;

    // === CALCULAR TOTAL PERCEPCIONES ===
    const sueldoNeto = parseFloat(empleado.sueldo_base) || 0;  // Sueldo Neto (antes era sueldo_base)
    const incentivo = parseFloat(empleado.incentivo) || 0;
    const extra = parseFloat(empleado.sueldo_extra_final) || 0;
    const totalPercepciones = sueldoNeto + incentivo + extra;

    // === CALCULAR TOTAL CONCEPTOS (ISR, IMSS, INFONAVIT) ===
    let totalConceptos = 0;
    const conceptos = empleado.conceptos || [];
    conceptos.forEach(concepto => {
        if (['45', '52', '16'].includes(concepto.codigo)) { // ISR, IMSS, INFONAVIT
            totalConceptos += parseFloat(concepto.resultado) || 0;
        }
    });

    // === CALCULAR TOTAL DEDUCCIONES (incluyendo TARJETA) ===
    const tarjeta = parseFloat(empleado.neto_pagar) || 0;  // TARJETA (campo neto_pagar)
    const prestamo = parseFloat(empleado.prestamo) || 0;
    const inasistencias = parseFloat(empleado.inasistencias_descuento) || 0;
    const uniformes = parseFloat(empleado.uniformes) || 0;
    const checador = parseFloat(empleado.checador) || 0;
    const faGafetCofia = parseFloat(empleado.fa_gafet_cofia) || 0;

    // Total de deducciones incluye conceptos (INFONAVIT, ISR, IMSS) + otras deducciones
    const totalDeducciones = tarjeta + prestamo + inasistencias + uniformes + checador + faGafetCofia + totalConceptos;

    // === CALCULAR SUELDO A COBRAR ===
    const sueldoACobrar = totalPercepciones - totalDeducciones;

    // Actualizar en JSON global
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_a_cobrar', sueldoACobrar);


    return sueldoACobrar;
}


/*
 * ----------------------------------------------------------------
 * SUBSECCIÓN: CONCEPTOS ADICIONALES DINÁMICOS
 * ----------------------------------------------------------------
 * Gestiona la adición, eliminación y actualización de conceptos personalizados
 * ----------------------------------------------------------------
 */

// Inicializar eventos para conceptos adicionales dinámicos
$(document).ready(function () {
    // Usar delegación de eventos para que funcione sin importar cuándo se cargue el modal
    $(document).on('click', '#btn-agregar-concepto', function (e) {
        e.preventDefault();

        agregarCampoConceptoAdicional();
    });

    // Configurar botón Guardar Detalles
    $(document).on('click', '#btn-guardar-detalles', function (e) {
        e.preventDefault();

        guardarDetallesEmpleado();
    });

    // LIMPIAR EVENTOS AL CERRAR EL MODAL
    $(document).on('click', '#cerrar-modal-detalles, #btn-cancelar-detalles', function () {
        limpiarEventosModal(); // Limpiar antes de cerrar
        $('#modal-detalles').fadeOut();
    });

    // También limpiar si se cierra con ESC o clic fuera del modal
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && modalDetallesActivo) {
            limpiarEventosModal();
            $('#modal-detalles').fadeOut();
        }
    });

    // Limpiar si se hace clic fuera del modal
    $('#modal-detalles').on('click', function (e) {
        if (e.target === this) {
            limpiarEventosModal();
            $('#modal-detalles').fadeOut();
        }
    });

    //  FUNCIONALIDAD PARA CAMBIAR ENTRE VISTAS DE REGISTROS
    $(document).on('change', 'input[name="vista-registros"]', function () {
        const vistaSeleccionada = $(this).attr('id');

        if (vistaSeleccionada === 'btn-redondeados') {
            // Mostrar tabla redondeados, ocultar checador
            $('#tabla-checador').attr('hidden', true);
            $('#tabla-redondeados').removeAttr('hidden');
        } else if (vistaSeleccionada === 'btn-checador') {
            // Mostrar tabla checador, ocultar redondeados
            $('#tabla-redondeados').attr('hidden', true);
            $('#tabla-checador').removeAttr('hidden');
            // Llenar tabla del checador si no está llena
            //llenarTablaChecador();
        }
    });
});

// Agregar nuevo campo de concepto adicional al formulario
function agregarCampoConceptoAdicional(nombre = '', valor = 0) {


    const conceptoIndex = Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const nuevoConcepto = `
        <div class="col-md-6 mb-3 d-flex flex-column concepto-adicional" data-concepto-index="${conceptoIndex}">
            <div class="d-flex align-items-center mb-1">
                <label class="form-label fw-normal flex-grow-1">Concepto Personalizado</label>
                <button type="button" class="btn btn-sm btn-outline-danger ms-2 btn-eliminar-concepto">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <input type="text" class="form-control mb-2 concepto-nombre" placeholder="Nombre del concepto" value="${nombre}">
            <input type="number" step="0.01" class="form-control mod-input-azul concepto-valor componente-extra" placeholder="0.00" value="${valor}">
        </div>
    `;

    // Verificar que el contenedor existe
    const $contenedor = $('#componentes-sueldo-extra');
    const $botonContainer = $contenedor.find('.col-12').last();

    if ($botonContainer.length > 0) {
        // Insertar antes del botón "Agregar Otro Concepto"
        $(nuevoConcepto).insertBefore($botonContainer);

    } else {
        // Si no encuentra el contenedor del botón, agregar al final del contenedor
        $contenedor.append(nuevoConcepto);
    }

    // Configurar eventos para el nuevo concepto
    configurarEventosConceptoAdicional(conceptoIndex);
}

// Configurar eventos (eliminar, modificar) para un concepto adicional específico
function configurarEventosConceptoAdicional(conceptoIndex) {
    const $concepto = $(`.concepto-adicional[data-concepto-index="${conceptoIndex}"]`);

    // Evento para eliminar concepto
    $concepto.find('.btn-eliminar-concepto').on('click', function () {
        const clave = $('#campo-clave').text().trim();
        $concepto.remove();
        // Actualizar JSON después de eliminar
        setTimeout(() => {
            actualizarConceptosAdicionalesEnJsonGlobal(clave);
            calcularTotalExtra(); // Recalcular total cuando se elimine un concepto
            actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
        }, 100);
    });

    // Eventos para actualizar valores en tiempo real
    $concepto.find('.concepto-nombre, .concepto-valor').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        actualizarConceptosAdicionalesEnJsonGlobal(clave);
        calcularTotalExtra(); // Recalcular total cuando cambien conceptos adicionales
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });
}

// Actualizar lista completa de conceptos adicionales en el JSON global
function actualizarConceptosAdicionalesEnJsonGlobal(clave) {
    const conceptosAdicionales = [];

    // Recopilar todos los conceptos adicionales del modal
    $('.concepto-adicional').each(function () {
        const $concepto = $(this);
        const nombre = $concepto.find('.concepto-nombre').val().trim();
        const valor = parseFloat($concepto.find('.concepto-valor').val()) || 0;

        if (nombre) { // Solo agregar si tiene nombre
            conceptosAdicionales.push({
                nombre: nombre,
                valor: valor
            });
        }
    });

    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp.conceptos_adicionales = conceptosAdicionales;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal.conceptos_adicionales = conceptosAdicionales;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado.conceptos_adicionales = conceptosAdicionales;
        }
    }


}

// Cargar conceptos adicionales existentes del empleado al abrir el modal
function cargarConceptosAdicionalesExistentes(empleado) {
    // Limpiar conceptos adicionales previos
    $('.concepto-adicional').remove();

    // Cargar conceptos adicionales existentes
    if (empleado.conceptos_adicionales && Array.isArray(empleado.conceptos_adicionales)) {
        empleado.conceptos_adicionales.forEach(concepto => {
            agregarCampoConceptoAdicional(concepto.nombre, concepto.valor);
        });
    }

    // Recalcular total después de cargar conceptos
    setTimeout(() => {
        calcularTotalExtra();
    }, 200);
}



/*
 * ----------------------------------------------------------------
 * SUBSECCIÓN: CONCEPTOS
 * ----------------------------------------------------------------
 * Maneja conceptos de deducciones fiscales y legales (ISR, IMSS, INFONAVIT)
 * ----------------------------------------------------------------
 */

// Inicializar campos de conceptos con datos del empleado y configurar eventos
function establecerDatosConceptos(conceptos) {
    // Limpiar todos los inputs antes de establecer nuevos valores
    $("#mod-isr").val(0);
    $("#mod-imss").val(0);
    $("#mod-infonavit").val(0);

    // Buscar cada concepto por su código y establecer su valor en el input correspondiente
    conceptos.forEach(concepto => {
        if (concepto.codigo === '45') {
            $("#mod-isr").val(concepto.resultado);
        }
        if (concepto.codigo === '52') {
            $("#mod-imss").val(concepto.resultado);
        }
        if (concepto.codigo === '16') { // Ajusta este código según tu JSON
            $("#mod-infonavit").val(concepto.resultado);
        }
    });

    // Agregar eventos para actualizar conceptos en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-isr").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const isr = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '45', isr); // 45 es el código del ISR
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

    $("#mod-imss").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const imss = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '52', imss); // 52 es el código del IMSS
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

    $("#mod-infonavit").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const infonavit = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '16', infonavit); // 16 es el código del INFONAVIT
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
    });

}

// Actualizar concepto específico por código en todas las estructuras JSON del empleado
function actualizarConceptoEnJsonGlobal(clave, codigoConcepto, valor) {
    // Función auxiliar para obtener el nombre del concepto
    const getConceptoNombre = (codigo) => {
        const nombres = {
            '45': 'I.S.R. (mes)',
            '52': 'I.M.S.S.',
            '16': 'Préstamo infonavit (CF)'
        };
        return nombres[codigo] || `Concepto ${codigo}`;
    };

    // Función auxiliar para actualizar o crear concepto en un empleado
    const actualizarConceptoEnEmpleado = (empleado) => {
        // Asegurar que el array conceptos existe
        if (!empleado.conceptos) {
            empleado.conceptos = [];
        }

        // Buscar el concepto existente
        let concepto = empleado.conceptos.find(c => c.codigo === codigoConcepto);

        if (concepto) {
            // Actualizar concepto existente
            concepto.resultado = valor;
        } else {
            // Crear nuevo concepto si no existe
            concepto = {
                codigo: codigoConcepto,
                nombre: getConceptoNombre(codigoConcepto),
                resultado: valor
            };
            empleado.conceptos.push(concepto);
        }
    };

    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    actualizarConceptoEnEmpleado(emp);
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            actualizarConceptoEnEmpleado(empleadoOriginal);
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            actualizarConceptoEnEmpleado(empleadoFiltrado);
        }
    }


}



/*
 * ----------------------------------------------------------------
 * SUBSECCIÓN: DEDUCCIONES
 * ----------------------------------------------------------------
 * Gestiona deducciones del empleado (préstamos, uniformes, inasistencias, etc.)
 * Incluye cálculo automático de descuentos por inasistencias
 * ----------------------------------------------------------------
 */

// Inicializar campos de deducciones con datos del empleado y configurar eventos
function establecerDatosDeducciones(empleado) {
    // Limpiar todos los inputs antes de establecer nuevos valores
    $("#mod-tarjeta").val(0);
    $("#mod-prestamo").val(0);
    $("#mod-uniformes").val(0);
    $("#mod-checador").val(0);
    $("#mod-fa-gafet-cofia").val(0);
    $("#mod-inasistencias-horas").val(0);
    $("#mod-inasistencias-descuento").val(0);

    // Establecer los valores del empleado (si existen)
    $("#mod-tarjeta").val(empleado.neto_pagar || 0);
    $("#mod-prestamo").val(empleado.prestamo || 0);
    $("#mod-uniformes").val(empleado.uniformes || 0);
    $("#mod-checador").val(empleado.checador || 0);
    $("#mod-fa-gafet-cofia").val(empleado.fa_gafet_cofia || 0);
    $("#mod-inasistencias-minutos").val(empleado.inasistencias_minutos || 0);
    $("#mod-inasistencias-descuento").val(empleado.inasistencias_descuento || 0);

    // Eventos para actualizar deducciones en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-tarjeta").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const neto_pagar = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'neto_pagar', neto_pagar);
        actualizarSueldoACobrarEnTiempoReal(clave);
    });

    $("#mod-prestamo").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const prestamo = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'prestamo', isNaN(prestamo) ? 0 : prestamo);
        actualizarSueldoACobrarEnTiempoReal(clave);
    });

    $("#mod-uniformes").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const uniformes = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'uniformes', isNaN(uniformes) ? 0 : uniformes);
        actualizarSueldoACobrarEnTiempoReal(clave);
    });

    $("#mod-checador").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const checador = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'checador', isNaN(checador) ? 0 : checador);
        actualizarSueldoACobrarEnTiempoReal(clave);
    });

    $("#mod-fa-gafet-cofia").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const faGafetCofia = parseFloat($(this).val());
        actualizarDeduccionEnJsonGlobal(clave, 'fa_gafet_cofia', isNaN(faGafetCofia) ? 0 : faGafetCofia);
        actualizarSueldoACobrarEnTiempoReal(clave);
    });

    // Evento para calcular descuento por inasistencias basado en minutos
    $("#mod-inasistencias-minutos").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const minutos = parseFloat($(this).val()) || 0;

        // Obtener costo por minuto del archivo rangos_horas.js
        let costoPorMinuto = 1.34; // Valor por defecto

        if (window.rangosHorasJson) {
            // Buscar el rango de hora_extra que contiene el costo por minuto para penalizaciones
            const rangoExtra = window.rangosHorasJson.find(rango => rango.tipo === "hora_extra");
            if (rangoExtra && rangoExtra.costo_por_minuto) {
                costoPorMinuto = rangoExtra.costo_por_minuto;
            }
        }

        // Calcular el descuento: minutos * costo por minuto
        const descuento = minutos * costoPorMinuto;

        // Actualizar el campo de descuento
        $("#mod-inasistencias-descuento").val(descuento.toFixed(2));

        // Actualizar ambos valores en el JSON global
        actualizarDeduccionEnJsonGlobal(clave, 'inasistencias_minutos', minutos);
        actualizarDeduccionEnJsonGlobal(clave, 'inasistencias_descuento', descuento);
        actualizarSueldoACobrarEnTiempoReal(clave);
    });

    // Evento para actualizar descuento manual (si el usuario modifica directamente el descuento)
    $("#mod-inasistencias-descuento").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const descuento = parseFloat($(this).val()) || 0;
        actualizarDeduccionEnJsonGlobal(clave, 'inasistencias_descuento', descuento);
        actualizarSueldoACobrarEnTiempoReal(clave);
    });
}


/*
 * ----------------------------------------------------------------
 * SUBSECCIÓN: SUELDO A COBRAR
 * ----------------------------------------------------------------
 * Gestiona únicamente el establecimiento del valor en el input
 * de sueldo a cobrar
 * ----------------------------------------------------------------
 */

// Función para actualizar sueldo a cobrar en tiempo real
function actualizarSueldoACobrarEnTiempoReal(clave) {
    if (!clave) {
        return;
    }

    const empleado = obtenerEmpleadoActualizado(clave);
    if (!empleado) {

        return;
    }

    // === CALCULAR TOTAL PERCEPCIONES ===
    const sueldoNeto = parseFloat(empleado.sueldo_base) || 0;
    const incentivo = parseFloat(empleado.incentivo) || 0;
    const extra = parseFloat(empleado.sueldo_extra_final) || 0;
    const totalPercepciones = sueldoNeto + incentivo + extra;

    // === CALCULAR TOTAL CONCEPTOS (ISR, IMSS, INFONAVIT) ===
    let totalConceptos = 0;
    const conceptos = empleado.conceptos || [];
    conceptos.forEach(concepto => {
        if (['45', '52', '16'].includes(concepto.codigo)) {
            totalConceptos += parseFloat(concepto.resultado) || 0;
        }
    });

    // === CALCULAR TOTAL DEDUCCIONES ===
    const tarjeta = parseFloat(empleado.neto_pagar) || 0;
    const prestamo = parseFloat(empleado.prestamo) || 0;
    const inasistencias = parseFloat(empleado.inasistencias_descuento) || 0;
    const uniformes = parseFloat(empleado.uniformes) || 0;
    const checador = parseFloat(empleado.checador) || 0;
    const faGafetCofia = parseFloat(empleado.fa_gafet_cofia) || 0;

    const totalDeducciones = tarjeta + prestamo + inasistencias + uniformes + checador + faGafetCofia + totalConceptos;

    // === CALCULAR SUELDO A COBRAR ===
    const sueldoACobrar = totalPercepciones - totalDeducciones;

    // === ACTUALIZAR EN INTERFAZ ===
    $("#mod-sueldo-a-cobrar").val(sueldoACobrar.toFixed(2));

    // === ACTUALIZAR EN JSON GLOBAL ===
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_a_cobrar', sueldoACobrar);

    return sueldoACobrar;
}

// Función para actualizar deducciones solo en jsonGlobal (sin afectar tabla)
function actualizarDeduccionEnJsonGlobal(clave, tipoDeduccion, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp[tipoDeduccion] = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal[tipoDeduccion] = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado[tipoDeduccion] = valor;
        }
    }
}
function actualizarSueldoEnTabla(clave, sueldoACobrar) {
    // Detectar qué tabla está visible y actualizar la correcta
    let $fila = null;
    let tablaActual = null;
    
    // Verificar si la tabla de empleados sin seguro está visible
    if (!$('#tabla-sin-seguro-container').attr('hidden')) {
        $fila = $(`#tabla-sin-seguro-body tr[data-clave="${clave}"]`);
        tablaActual = 'sin-seguro';
    } 
    // Verificar si la tabla de dispersión está visible
    else if (!$('#tabla-dispersion-tarjeta').attr('hidden')) {
        $fila = $(`#tabla-dispersion-body tr[data-clave="${clave}"]`);
        tablaActual = 'dispersion';
    }
    // Por defecto, usar la tabla principal de nómina
    else {
        $fila = $(`#tabla-nomina-body tr[data-clave="${clave}"]`);
        tablaActual = 'nomina';
    }

    if ($fila.length === 0) {
        return;
    }

    // Función para mostrar cadena vacía en lugar de 0
    const mostrarValor = (valor) => {
        if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
            return '';
        }
        return valor;
    };

    // Actualizar la columna del sueldo a cobrar según el tipo de tabla
    const celdas = $fila.find('td');
    
    if (tablaActual === 'dispersion') {
        // En la tabla de dispersión, actualizar la columna de Sueldo Neto (índice 3)
        $(celdas[3]).text(mostrarValor(sueldoACobrar.toFixed(2)));
    } else {
        // En las tablas de nómina y sin seguro, actualizar la columna de Sueldo a Cobrar (índice 15)
        $(celdas[15]).text(mostrarValor(sueldoACobrar.toFixed(2)));
    }

    // Agregar efecto visual para indicar que se actualizó
    $fila.addClass('fila-actualizada');
    setTimeout(() => {
        $fila.removeClass('fila-actualizada');
    }, 1000);
}

// Función para actualizar deducciones solo en jsonGlobal (sin afectar tabla)
function actualizarDeduccionEnJsonGlobal(clave, tipoDeduccion, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp[tipoDeduccion] = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal[tipoDeduccion] = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado[tipoDeduccion] = valor;
        }
    }
}


/*
 * ================================================================
 * FUNCIÓN PARA GUARDAR DETALLES DEL EMPLEADO
 * ================================================================
 * Esta función guarda todos los cambios realizados en el modal
 * y actualiza la fila correspondiente en la tabla de nómina
 * ================================================================
 */
function guardarDetallesEmpleado() {
    const clave = $('#campo-clave').text().trim();
    if (!clave) return;

    // Capturar todos los valores actuales del formulario antes de guardar
    const incentivo = parseFloat($('#mod-incentivo-monto').val()) || 0;
    const bonoAntiguedad = parseFloat($('#mod-bono-antiguedad').val()) || 0;
    const actividadesEspeciales = parseFloat($('#mod-actividades-especiales').val()) || 0;
    const bonoPuesto = parseFloat($('#mod-bono-responsabilidad').val()) || 0;
    const sueldoNeto = parseFloat($('#mod-sueldo-neto').val()) || 0;
    const horasExtras = parseFloat($('#mod-horas-extras').val()) || 0;
    const totalExtra = parseFloat($('#mod-total-extra').val()) || 0;

    // Actualizar explícitamente cada valor en jsonGlobal para evitar pérdida de datos
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'incentivo', incentivo);
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_antiguedad', bonoAntiguedad);
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'actividades_especiales', actividadesEspeciales);
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_puesto', bonoPuesto);
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_base', sueldoNeto);
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_extra', horasExtras);
    actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_extra_final', totalExtra);

    // 1. Guardar horarios modificados de la tabla
    guardarHorariosModificadosEnJsonGlobal(clave);

    // 2. Recalcular sueldo a cobrar automáticamente
    calcularSueldoACobrar(clave);

    // 3. Obtener datos actualizados del empleado desde jsonGlobal
    const empleadoActualizado = obtenerEmpleadoActualizado(clave);
    if (!empleadoActualizado) {
       return;
    }

    // 4. Actualizar la fila de la tabla
    actualizarFilaTabla(clave, empleadoActualizado);

    // 5. Refrescar la tabla visible si es necesario
    refrescarTablaVisible();

    // 6. Guardar datos en localStorage
    if (typeof guardarDatosNomina === 'function') {
        guardarDatosNomina();
      
    }

    // 7. Limpiar eventos antes de cerrar
    limpiarEventosModal();

    // 8. Cerrar el modal
    $('#modal-detalles').fadeOut();

  
}



// FUNCIÓN PARA GUARDAR HORARIOS MODIFICADOS DE LA TABLA EN JSONGLOBAL
function guardarHorariosModificadosEnJsonGlobal(clave) {
    const empleado = obtenerEmpleadoActualizado(clave);
    if (!empleado || !empleado.registros_redondeados) {
        return;
    }

    // Obtener horarios actuales de la tabla editada
    const diasSemana = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];
    const horariosActualizados = {};

    // Capturar datos de cada fila de la tabla
    $('#tab_registros .custom-table tbody tr').each(function (index) {
        const $fila = $(this);
        const celdas = $fila.find('td');

        if (celdas.length >= 8 && index < diasSemana.length) {
            const dia = diasSemana[index];

            horariosActualizados[dia] = {
                entrada: $(celdas[1]).text().trim(),
                salida_comer: $(celdas[2]).text().trim(),
                entrada_comer: $(celdas[3]).text().trim(),
                salida: $(celdas[4]).text().trim(),
                trabajado: $(celdas[5]).text().trim(),
                minutos_trabajados: parseInt($(celdas[6]).text().trim()) || 0,
                hora_comida: $(celdas[7]).text().trim()
            };
        }
    });

    // Actualizar los registros_redondeados en jsonGlobal
    let totalMinutosSemanales = 0;

    empleado.registros_redondeados.forEach(registro => {
        const dia = registro.dia.toLowerCase();
        const datosActualizados = horariosActualizados[dia];

        if (datosActualizados) {
            // Actualizar todos los campos del registro
            registro.entrada = datosActualizados.entrada;
            registro.salida_comer = datosActualizados.salida_comer;
            registro.entrada_comer = datosActualizados.entrada_comer;
            registro.salida = datosActualizados.salida;
            registro.trabajado = datosActualizados.trabajado;
            registro.hora_comida = datosActualizados.hora_comida;

            // Sumar minutos trabajados del día
            if (datosActualizados.minutos_trabajados) {
                totalMinutosSemanales += datosActualizados.minutos_trabajados;
            }
        }
    });

    // Actualizar totales del empleado
    empleado.Minutos_trabajados = totalMinutosSemanales;
    empleado.Minutos_normales = Math.min(totalMinutosSemanales, 2880); // 48 horas en minutos

    // Calcular sueldo base basado en los minutos trabajados solo si no fue modificado manualmente
    if (!empleado.sueldo_base_manual) {
        if (window.rangosHorasJson && window.rangosHorasJson.length > 0) {
            const rangosNormales = window.rangosHorasJson
                .filter(r => r.minutos && !r.tipo)
                .sort((a, b) => a.minutos - b.minutos);

            let rangoEncontrado = rangosNormales.find(r => totalMinutosSemanales <= r.minutos);

            if (!rangoEncontrado && rangosNormales.length > 0) {
                rangoEncontrado = rangosNormales[rangosNormales.length - 1];
            }

            if (rangoEncontrado) {
                empleado.sueldo_base = rangoEncontrado.sueldo_base;

                const maxMinutosNormales = rangosNormales[rangosNormales.length - 1]?.minutos || 0;
                if (totalMinutosSemanales > maxMinutosNormales) {
                    const rangoExtra = window.rangosHorasJson.find(r => r.tipo === "hora_extra");
                    if (rangoExtra) {
                        empleado.Minutos_extra = totalMinutosSemanales - maxMinutosNormales;
                        empleado.sueldo_extra = empleado.Minutos_extra * rangoExtra.costo_por_minuto;
                    }
                } else {
                    empleado.Minutos_extra = 0;
                    empleado.sueldo_extra = 0;
                }
            }
        }
    }

    // Actualizar totales en el footer de la tabla
    const $filaTotalTfoot = $('#tabla-redondeados:visible .custom-table tfoot tr');
    if ($filaTotalTfoot.length > 0) {
        const celdasTotal = $filaTotalTfoot.find('th');
        if (celdasTotal.length >= 7) {
            const tiempoTotalTexto = $(celdasTotal[5]).text().trim();
            empleado.tiempo_total_redondeado = tiempoTotalTexto;
            empleado.total_minutos_redondeados = totalMinutosSemanales;
        }
    }
}


// FUNCIÓN PARA OBTENER EMPLEADO ACTUALIZADO

function obtenerEmpleadoActualizado(clave) {
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) return null;

    for (let depto of window.jsonGlobal.departamentos) {
        const empleado = (depto.empleados || []).find(emp => String(emp.clave) === String(clave));
        if (empleado) {
            return empleado;
        }
    }
    return null;
}

// Función para refrescar la tabla visible después de actualizar datos
function refrescarTablaVisible() {
    // Verificar si la tabla de empleados sin seguro está visible
    if (!$('#tabla-sin-seguro-container').attr('hidden')) {
        // Refrescar la tabla de empleados sin seguro
        if (typeof mostrarEmpleadosSinSeguro === 'function') {
            mostrarEmpleadosSinSeguro();
        }
    } 
    // Verificar si la tabla de dispersión está visible
    else if (!$('#tabla-dispersion-tarjeta').attr('hidden')) {
        // Refrescar la tabla de dispersión
        if (typeof setEmpleadosDispersionPaginados === 'function' && window.empleadosOriginalesDispersion) {
            setEmpleadosDispersionPaginados(window.empleadosOriginalesDispersion);
        }
    }
    // Si la tabla principal está visible, no necesita refrescar porque ya se actualizó la fila
}

//FUNCIÓN PARA ACTUALIZAR FILA DE LA TABLA

function actualizarFilaTabla(clave, empleado) {
    // Detectar qué tabla está visible y actualizar la correcta
    let $fila = null;
    let tablaActual = null;
    
    // Verificar si la tabla de empleados sin seguro está visible
    if (!$('#tabla-sin-seguro-container').attr('hidden')) {
        $fila = $(`#tabla-sin-seguro-body tr[data-clave="${clave}"]`);
        tablaActual = 'sin-seguro';
    } 
    // Verificar si la tabla de dispersión está visible
    else if (!$('#tabla-dispersion-tarjeta').attr('hidden')) {
        $fila = $(`#tabla-dispersion-body tr[data-clave="${clave}"]`);
        tablaActual = 'dispersion';
    }
    // Por defecto, usar la tabla principal de nómina
    else {
        $fila = $(`#tabla-nomina-body tr[data-clave="${clave}"]`);
        tablaActual = 'nomina';
    }

    if ($fila.length === 0) {
        return;
    }

    // Obtener conceptos
    const conceptos = empleado.conceptos || [];
    const getConcepto = (codigo) => {
        const c = conceptos.find(c => c.codigo === codigo);
        return c ? parseFloat(c.resultado).toFixed(2) : '';
    };

    const infonavit = getConcepto('16');
    const isr = getConcepto('45');
    const imss = getConcepto('52');

    // Función para mostrar cadena vacía en lugar de 0, NaN o valores vacíos, con formato de 2 decimales
    const mostrarValor = (valor) => {
        if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
            return '';
        }
        // Formatear números con dos decimales
        const num = parseFloat(valor);
        return isNaN(num) ? '' : num.toFixed(2);
    };

    // Mostrar deducciones con prefijo "-"
    const mostrarDeduccion = (valor) => {
        if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
            return '';
        }
        const num = parseFloat(valor);
        return isNaN(num) ? '' : `-${num.toFixed(2)}`;
    };

    // Solo mostrar el puesto original del empleado
    let puestoEmpleado = empleado.puesto || empleado.nombre_departamento || '';

    // Usar sueldo_extra_final si existe, sino usar sueldo_extra
    const sueldoExtra = empleado.sueldo_extra_final || empleado.sueldo_extra || 0;

    // Actualizar las celdas de la fila según el tipo de tabla
    const celdas = $fila.find('td');

    if (tablaActual === 'dispersion') {
        // Tabla de dispersión solo tiene 4 columnas: #, Clave, Nombre, Sueldo Neto
        $(celdas[1]).text(empleado.clave); // Clave
        $(celdas[2]).text(empleado.nombre); // Nombre
        $(celdas[3]).text(mostrarValor(empleado.neto_pagar)); // Sueldo Neto
    } else {
        // Tablas de nómina y sin seguro tienen todas las columnas
        // Actualizar cada celda (manteniendo el número de fila)
        $(celdas[1]).text(empleado.nombre); // Nombre
        $(celdas[2]).text(puestoEmpleado); // Puesto (mantener el original)
        $(celdas[3]).text(mostrarValor(empleado.sueldo_base)); // Sueldo base
        $(celdas[4]).text(mostrarValor(empleado.incentivo)); // Incentivo
        $(celdas[5]).text(mostrarValor(sueldoExtra)); // Extra (ahora usa sueldo_extra_final)
        $(celdas[6]).text(mostrarDeduccion(empleado.neto_pagar)); // Neto a pagar (deducción)
        $(celdas[7]).text(mostrarDeduccion(empleado.prestamo)); // Préstamo (deducción)
        $(celdas[8]).text(mostrarDeduccion(empleado.inasistencias_descuento)); // Inasistencias (deducción)
        $(celdas[9]).text(mostrarDeduccion(empleado.uniformes)); // Uniformes (deducción)
        $(celdas[10]).text(mostrarDeduccion(infonavit)); // INFONAVIT (deducción)
        $(celdas[11]).text(mostrarDeduccion(isr)); // ISR (deducción)
        $(celdas[12]).text(mostrarDeduccion(imss)); // IMSS (deducción)
        $(celdas[13]).text(mostrarDeduccion(empleado.checador)); // Checador (deducción)
        $(celdas[14]).text(mostrarDeduccion(empleado.fa_gafet_cofia)); // F.A/GAFET/COFIA (deducción)
        $(celdas[15]).text(mostrarValor(empleado.sueldo_a_cobrar)); // SUELDO A COBRAR

        // Aplicar clase de sueldo negativo si corresponde
        const sueldo = parseFloat(empleado.sueldo_a_cobrar) || 0;
        $(celdas[15]).removeClass('sueldo-negativo sueldo-final').addClass(sueldo < 0 ? 'sueldo-negativo' : 'sueldo-final');
    }

    // Agregar efecto visual para indicar que se actualizó
    $fila.addClass('fila-actualizada');
    setTimeout(() => {
        $fila.removeClass('fila-actualizada');
    }, 2000);


}

/*
 * ================================================================
 * REGISTROS
 * ================================================================
 */


function llenarTablaHorariosSemanales(empleado) {

    //   LIMPIAR TABLA SIEMPRE AL INICIO
    const tbody = $('#tab_registros .custom-table tbody');
    const tfoot = $('#tab_registros .custom-table tfoot');
    tbody.empty();
    tfoot.empty();

    // Limpiar eventos especiales
    const entradasTempranasContainer = $('#entradas-tempranas-content');
    const salidasTardiasContainer = $('#salidas-tardias-content');
    const olvidosChecadorContainer = $('#olvidos-checador-content');

    entradasTempranasContainer.empty();
    salidasTardiasContainer.empty();
    olvidosChecadorContainer.empty();

    // Resetear totales de eventos especiales
    $('#total-entradas-tempranas').text('0 min');
    $('#total-salidas-tardias').text('0 min');
    $('#total-olvidos-checador').text('0 eventos');
    $('#tiempo-extra-total').text('0 min');

    //   VERIFICAR SI EL EMPLEADO TIENE DATOS REDONDEADOS
    if (!empleado.tiempo_total_redondeado || !empleado.registros_redondeados || empleado.registros_redondeados.length === 0) {
        const filaMensaje = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999; font-style: italic;">
                    <i class="bi bi-info-circle"></i> No hay registros de horarios disponibles para este empleado
                </td>
            </tr>
        `;
        tbody.html(filaMensaje);

        const filaTotalesVacia = `
            <tr>
                <th>TOTAL</th>
                <th>--</th>
                <th>--</th>
                <th>--</th>
                <th>--</th>
                <th>00:00</th>
                <th>0</th>
                <th>00:00</th>
            </tr>
        `;
        tfoot.html(filaTotalesVacia);
        return;
    }

    // Mapear días de la semana EMPEZANDO DESDE VIERNES
    const diasSemana = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];
    const diasEspañol = ['Viernes', 'Sábado', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves'];

    // Crear mapa de datos por día
    const datosPorDia = {};
    empleado.registros_redondeados.forEach(registro => {
        datosPorDia[registro.dia.toLowerCase()] = registro;
    });

    // 🔥 VARIABLES PARA RECALCULAR TOTALES CORRECTOS
    let totalMinutosSemanaCalculados = 0;
    let totalMinutosComida = 0;

    function horaAMinutos(hora) {
        if (!hora || hora === "" || hora === "00:00" || hora === "--") return 0;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    // Llenar cada fila de la tabla
    diasSemana.forEach((dia, index) => {
        const diaEspañol = diasEspañol[index];
        const datos = datosPorDia[dia];

        let fila = '';

        if (datos && datos.trabajado !== "00:00" && datos.trabajado !== "--") {
            // 🔥 RECALCULAR MINUTOS DEL DÍA CORRECTAMENTE
            const minutosDelDia = horaAMinutos(datos.trabajado);

            // 🔥 SUMAR AL TOTAL SEMANAL
            totalMinutosSemanaCalculados += minutosDelDia;

            fila = `
                <tr>
                    <td class="day-cell">${diaEspañol}</td>
                    <td contenteditable="true">${datos.entrada || '--'}</td>
                    <td contenteditable="true">${datos.salida_comer || '--'}</td>
                    <td contenteditable="true">${datos.entrada_comer || '--'}</td>
                    <td contenteditable="true">${datos.salida || '--'}</td>
                    <td>${datos.trabajado || '--'}</td>
                    <td>${minutosDelDia}</td>
                    <td contenteditable="true">${datos.hora_comida || '--'}</td>
                </tr>
            `;

            // Acumular tiempo de comida
            if (datos.hora_comida && datos.hora_comida !== "00:00") {
                const [h, m] = datos.hora_comida.split(':');
                totalMinutosComida += (parseInt(h) * 60 + parseInt(m));
            }
        } else {
            // Día sin trabajo
            fila = `
                <tr>
                    <td class="day-cell">${diaEspañol}</td>
                    <td contenteditable="true">--</td>
                    <td contenteditable="true">--</td>
                    <td contenteditable="true">--</td>
                    <td contenteditable="true">--</td>
                    <td>--</td>
                    <td>--</td>
                    <td contenteditable="true">--</td>
                </tr>
            `;
        }

        tbody.append(fila);
    });

    // 🔥 USAR LOS TOTALES RECALCULADOS CORRECTAMENTE
    function minutosAHora(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    const totalHorasSemana = minutosAHora(totalMinutosSemanaCalculados);
    const totalHorasComida = `${Math.floor(totalMinutosComida / 60).toString().padStart(2, '0')}:${(totalMinutosComida % 60).toString().padStart(2, '0')}`;



    // 🔥 ACTUALIZAR LOS TOTALES EN EL EMPLEADO TAMBIÉN
    const clave = $('#campo-clave').text().trim();
    if (clave) {
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'total_minutos_redondeados', totalMinutosSemanaCalculados);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'tiempo_total_redondeado', totalHorasSemana);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'Minutos_trabajados', totalMinutosSemanaCalculados);
    }

    // 🔥 USAR LOS TOTALES RECALCULADOS EN LA FILA TOTAL
    const filaTotales = `
        <tr>
            <th>TOTAL</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>${totalHorasSemana}</th>
            <th>${totalMinutosSemanaCalculados}</th>
            <th>${totalHorasComida}</th>
        </tr>
    `;

    $('#tab_registros .custom-table tfoot').html(filaTotales);

    // Al final de la función, después de actualizar la tabla
    llenarEventosEspeciales(empleado);

    // APLICAR FORMATO DE HORA A CAMPOS EDITABLES
    aplicarFormatoHoraCamposEditables();
}

function llenarEventosEspeciales(empleado) {

    if (!empleado.registros_redondeados || empleado.registros_redondeados.length === 0) {

        return;
    }

    const entradasTempranasContainer = $('#entradas-tempranas-content');
    const salidasTardiasContainer = $('#salidas-tardias-content');
    const olvidosChecadorContainer = $('#olvidos-checador-content');

    //  LIMPIAR CONTENEDORES SIEMPRE
    entradasTempranasContainer.empty();
    salidasTardiasContainer.empty();
    olvidosChecadorContainer.empty();

    let totalEntradaTempranaMinutos = 0;
    let totalSalidaTardiaMinutos = 0;
    let totalOlvidosChecador = 0;
    let diasConEventos = 0;

    function minutosAHora(minutos) {
        if (minutos === 0) return "0 min";
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        if (h > 0 && m > 0) return `${h}h ${m}min`;
        if (h > 0) return `${h}h`;
        return `${m}min`;
    }

    function horaAMinutos(hora) {
        if (!hora || hora === "00:00" || hora === "--") return 0;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    empleado.registros_redondeados.forEach(registro => {
        const entradaTemprana = horaAMinutos(registro.entrada_temprana || "00:00");
        const salidaTardia = horaAMinutos(registro.salida_tardia || "00:00");
        const olvidoChecador = registro.olvido_checador || false;

        let tieneEventos = false;

        // Entrada temprana
        if (entradaTemprana > 0) {
            const eventoItem = `
                <div class="evento-item">
                    <span class="evento-dia">${registro.dia}:</span>
                    <span class="evento-tiempo">${minutosAHora(entradaTemprana)}</span>
                </div>
            `;
            entradasTempranasContainer.append(eventoItem);
            totalEntradaTempranaMinutos += entradaTemprana;
            tieneEventos = true;
        }

        // Salida tardía
        if (salidaTardia > 0) {
            const eventoItem = `
                <div class="evento-item">
                    <span class="evento-dia">${registro.dia}:</span>
                    <span class="evento-tiempo">${minutosAHora(salidaTardia)}</span>
                </div>
            `;
            salidasTardiasContainer.append(eventoItem);
            totalSalidaTardiaMinutos += salidaTardia;
            tieneEventos = true;
        }

        // Olvido del checador
        if (olvidoChecador) {
            const eventoItem = `
                <div class="evento-item">
                    <span class="evento-dia">${registro.dia}:</span>
                    <span class="evento-tiempo">Olvido</span>
                </div>
            `;
            olvidosChecadorContainer.append(eventoItem);
            totalOlvidosChecador++;
            tieneEventos = true;
        }

        if (tieneEventos) diasConEventos++;
    });

    // Actualizar totales
    $('#total-entradas-tempranas').text(minutosAHora(totalEntradaTempranaMinutos));
    $('#total-salidas-tardias').text(minutosAHora(totalSalidaTardiaMinutos));
    $('#total-olvidos-checador').text(`${totalOlvidosChecador} ${totalOlvidosChecador === 1 ? 'evento' : 'eventos'}`);
    $('#tiempo-extra-total').text(minutosAHora(totalEntradaTempranaMinutos + totalSalidaTardiaMinutos));
}

function establecerMinutosHoras(minutosExtra, minutosNormales) {
    //Limpiar campos
    $("#minutos-normales-trabajados").val("");
    $("#minutos-extra-trabajados").val("");

    $("#minutos-normales-trabajados").val(minutosNormales);
    $("#minutos-extra-trabajados").val(minutosExtra);
}

//  FUNCIÓN PARA RECALCULAR EVENTOS ESPECIALES CUANDO SE MODIFICAN HORARIOS
function recalcularEventosEspeciales(empleado) {


    // Verificar que tenemos acceso a los horarios oficiales
    if (!window.horariosSemanales || !window.horariosSemanales.semana) {

        return;
    }

    // Obtener datos ORIGINALES del empleado (antes de modificaciones en tabla)
    if (!empleado.registros_redondeados || empleado.registros_redondeados.length === 0) {

        return;
    }

    // Limpiar contenedores de eventos
    const entradasTempranasContainer = $('#entradas-tempranas-content');
    const salidasTardiasContainer = $('#salidas-tardias-content');
    const olvidosChecadorContainer = $('#olvidos-checador-content');

    entradasTempranasContainer.empty();
    salidasTardiasContainer.empty();
    olvidosChecadorContainer.empty();

    let totalEntradaTempranaMinutos = 0;
    let totalSalidaTardiaMinutos = 0;
    let totalOlvidosChecador = 0;
    let diasConEventos = 0;

    function minutosAHora(minutos) {
        if (minutos === 0) return "0 min";
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        if (h > 0 && m > 0) return `${h}h ${m}min`;
        if (h > 0) return `${h}h`;
        return `${m}min`;
    }

    function horaAMinutos(hora) {
        if (!hora || hora === "00:00" || hora === "--") return 0;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    empleado.registros_redondeados.forEach(registro => {
        const entradaTemprana = horaAMinutos(registro.entrada_temprana || "00:00");
        const salidaTardia = horaAMinutos(registro.salida_tardia || "00:00");
        const olvidoChecador = registro.olvido_checador || false;

        let tieneEventos = false;

        // Entrada temprana
        if (entradaTemprana > 0) {
            const eventoItem = `
                <div class="evento-item">
                    <span class="evento-dia">${registro.dia}:</span>
                    <span class="evento-tiempo">${minutosAHora(entradaTemprana)}</span>
                </div>
            `;
            entradasTempranasContainer.append(eventoItem);
            totalEntradaTempranaMinutos += entradaTemprana;
            tieneEventos = true;
        }

        // Salida tardía
        if (salidaTardia > 0) {
            const eventoItem = `
                <div class="evento-item">
                    <span class="evento-dia">${registro.dia}:</span>
                    <span class="evento-tiempo">${minutosAHora(salidaTardia)}</span>
                </div>
            `;
            salidasTardiasContainer.append(eventoItem);
            totalSalidaTardiaMinutos += salidaTardia;
            tieneEventos = true;
        }

        // Olvido del checador
        if (olvidoChecador) {
            const eventoItem = `
                <div class="evento-item">
                    <span class="evento-dia">${registro.dia}:</span>
                    <span class="evento-tiempo">Olvido</span>
                </div>
            `;
            olvidosChecadorContainer.append(eventoItem);
            totalOlvidosChecador++;
            tieneEventos = true;
        }

        if (tieneEventos) diasConEventos++;
    });

    // Actualizar totales
    $('#total-entradas-tempranas').text(minutosAHora(totalEntradaTempranaMinutos));
    $('#total-salidas-tardias').text(minutosAHora(totalSalidaTardiaMinutos));
    $('#total-olvidos-checador').text(`${totalOlvidosChecador} ${totalOlvidosChecador === 1 ? 'evento' : 'eventos'}`);
    $('#tiempo-extra-total').text(minutosAHora(totalEntradaTempranaMinutos + totalSalidaTardiaMinutos));
}

//  FUNCIÓN SIMPLE PARA ELIMINAR EVENTO ESPECIAL DEL DÍA MODIFICADO

//  FUNCIÓN SIMPLE PARA ELIMINAR EVENTO ESPECIAL DEL DÍA MODIFICADO Y ACTUALIZAR DATOS ORIGINALES
function eliminarEventoEspecialDia(diaModificado, tipoModificacion) {


    // Mapear días
    const diasSemana = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];
    const diasEspañol = ['Viernes', 'Sábado', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves'];

    const indiceDiaModificado = diasSemana.indexOf(diaModificado);
    const diaEspañolModificado = diasEspañol[indiceDiaModificado];

    if (tipoModificacion === 'entrada') {
        // 🗑️ ELIMINAR EVENTO DE ENTRADA TEMPRANA DE ESTE DÍA
        $(`#entradas-tempranas-content .evento-item:contains("${diaEspañolModificado}")`).remove();


    } else if (tipoModificacion === 'salida') {
        // 🗑️ ELIMINAR EVENTO DE SALIDA TARDÍA DE ESTE DÍA
        $(`#salidas-tardias-content .evento-item:contains("${diaEspañolModificado}")`).remove();

    }

    //  ACTUALIZAR LOS DATOS ORIGINALES DEL EMPLEADO PARA QUE NO VUELVAN A APARECER
    const clave = $('#campo-clave').text().trim();
    if (clave) {
        actualizarEventosEspecialesEnDatosOriginales(clave, diaModificado, tipoModificacion);
    }

    // 🔄 RECALCULAR TOTALES después de eliminar eventos
    recalcularTotalesEventos();
}

//  FUNCIÓN PARA ACTUALIZAR LOS DATOS ORIGINALES Y ELIMINAR EVENTOS ESPECIALES PERMANENTEMENTE
function actualizarEventosEspecialesEnDatosOriginales(clave, diaModificado, tipoModificacion) {


    // Función auxiliar para limpiar evento en un empleado específico
    function limpiarEventoEnEmpleado(empleado) {
        if (!empleado.registros_redondeados) return;

        // Buscar el registro del día modificado
        const registro = empleado.registros_redondeados.find(reg =>
            reg.dia.toLowerCase() === diaModificado
        );

        if (registro) {
            if (tipoModificacion === 'entrada') {
                // Limpiar entrada temprana
                registro.entrada_temprana = "00:00";

            } else if (tipoModificacion === 'salida') {
                // Limpiar salida tardía
                registro.salida_tardia = "00:00";

            }
        }
    }

    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    limpiarEventoEnEmpleado(emp);
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            limpiarEventoEnEmpleado(empleadoOriginal);
        }
    }

    // Actualizar en empleadosFiltrados
    if (window.empleadosFiltrados) {
        const empleadoFiltrado = window.empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            limpiarEventoEnEmpleado(empleadoFiltrado);
        }
    }


}


// Función para limpiar todos los event listeners del modal
function limpiarEventosModal() {
    //  LIMPIAR VALORES DE LOS CAMPOS ANTES DE LIMPIAR EVENTOS
    limpiarValoresCamposModal();

    // Limpiar eventos de inputs de percepciones
    $("#mod-sueldo-neto").off('input');
    $("#mod-horas-extras").off('input');
    $("#mod-incentivo-monto").off('input');
    $("#mod-actividades-especiales").off('input');
    $("#mod-bono-responsabilidad").off('input');

    // Limpiar eventos de checkboxes
    $("#mod-incentivo-check").off('change');
    $("#mod-bono-antiguedad-check").off('change');
    $("#mod-bono-antiguedad").off('input');

    // Limpiar eventos de conceptos
    $("#mod-isr").off('input');
    $("#mod-imss").off('input');
    $("#mod-infonavit").off('input');

    // Limpiar eventos de deducciones
    $("#mod-tarjeta").off('input');
    $("#mod-prestamo").off('input');
    $("#mod-uniformes").off('input');
    $("#mod-checador").off('input');
    $("#mod-fa-gafet-cofia").off('input');
    $("#mod-inasistencias-minutos").off('input');
    $("#mod-inasistencias-descuento").off('input');

    // Limpiar eventos de conceptos adicionales
    $('.concepto-adicional').off();
    $('.btn-eliminar-concepto').off('click');
    $('.concepto-nombre, .concepto-valor').off('input');

    //  LIMPIAR EVENTOS DE FORMATO DE HORA (incluyendo columna Horas Comida)
    $('#tab_registros .custom-table tbody td[contenteditable="true"]').off('input.formato blur.formato focus.original');

    //  LIMPIAR COMPLETAMENTE EVENTOS ESPECIALES
    $('#entradas-tempranas-content').empty();
    $('#salidas-tardias-content').empty();
    $('#olvidos-checador-content').empty();
    $('#total-entradas-tempranas').text('0 min');
    $('#total-salidas-tardias').text('0 min');
    $('#total-olvidos-checador').text('0 eventos');
    $('#tiempo-extra-total').text('0 min');

    // RESETEAR ESTADO DE MINI-TABS AL LIMPIAR
    resetearEstadoMiniTabs();

    // Marcar modal como inactivo
    modalDetallesActivo = false;
}

//  NUEVA FUNCIÓN PARA LIMPIAR VALORES DE LOS CAMPOS
function limpiarValoresCamposModal() {
    // Limpiar campos de trabajador
    $('#campo-clave').text('');
    $('#campo-nombre').text('');

    // Limpiar campos de percepciones
    $("#mod-sueldo-neto").val('');
    $("#mod-horas-extras").val('');
    $("#mod-total-extra").val('');
    $("#mod-actividades-especiales").val('');
    $("#mod-bono-responsabilidad").val('');
    $("#mod-sueldo-a-cobrar").val('');

    // Limpiar checkboxes e inputs de incentivos
    $("#mod-incentivo-check").prop('checked', false);
    $("#mod-incentivo-monto").val('').prop('disabled', true);
    $("#mod-bono-antiguedad-check").prop('checked', false);
    $("#mod-bono-antiguedad").val('').prop('disabled', true);

    // Limpiar campos de conceptos
    $("#mod-isr").val('');
    $("#mod-imss").val('');
    $("#mod-infonavit").val('');

    // Limpiar campos de deducciones
    $("#mod-tarjeta").val('');
    $("#mod-prestamo").val('');
    $("#mod-uniformes").val('');
    $("#mod-checador").val('');
    $("#mod-fa-gafet-cofia").val('');
    $("#mod-inasistencias-minutos").val('');
    $("#mod-inasistencias-descuento").val('');

    // Limpiar campos de minutos
    $("#minutos-normales-trabajados").val('');
    $("#minutos-extra-trabajados").val('');

    // Limpiar conceptos adicionales dinámicos
    $('.concepto-adicional').remove();

    // Limpiar tabla de registros
    $('#tab_registros .custom-table tbody').empty();
    $('#tab_registros .custom-table tfoot').empty();

    // Limpiar tabla del checador
    $('#tabla-checador tbody').empty();
}

// FUNCIONALIDAD PARA MINI-TABS DE REGISTROS (adaptada de configTablas)
$(document).on('click', '.mini-tab-registros', function (e) {
    e.preventDefault();

    // Remover clase active de todos los mini-tabs de registros
    $('.mini-tab-registros').removeClass('active');
    // Agregar clase active al tab clickeado
    $(this).addClass('active');

    const tabId = $(this).attr('id');

    if (tabId === 'btn-redondeados') {
        // Mostrar tabla redondeados, ocultar checador
        $('#tabla-checador').hide();
        $('#tabla-redondeados').show();
    } else if (tabId === 'btn-checador') {
        // Mostrar tabla checador, ocultar redondeados
        $('#tabla-redondeados').hide();
        $('#tabla-checador').show();
        // Llenar tabla del checador
        llenarTablaChecador();
    }
});

//  FUNCIÓN PARA LLENAR LA TABLA DEL CHECADOR
function llenarTablaChecador() {


    const clave = $('#campo-clave').text().trim();
    if (!clave) {

        return;
    }

    // Buscar empleado en jsonGlobal
    const empleado = obtenerEmpleadoActualizado(clave);
    if (!empleado) {

        mostrarMensajeNoRegistrosChecador();
        return;
    }



    if (!empleado.registros || empleado.registros.length === 0) {

        mostrarMensajeNoRegistrosChecador();
        return;
    }

    const tbody = $('#tabla-checador tbody');
    tbody.empty();

    // Definir días de la semana empezando por viernes
    const diasSemana = ['Viernes', 'Sábado', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves'];

    // Función para obtener el día de la semana de una fecha
    function obtenerDiaSemana(fechaStr) {
        if (!fechaStr || fechaStr === '--') return '--';

        try {
            // Asumir formato DD/MM/YYYY o similar
            const partes = fechaStr.split('/');
            if (partes.length === 3) {
                const fecha = new Date(partes[2], partes[1] - 1, partes[0]);
                const diasJS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                return diasJS[fecha.getDay()];
            }
        } catch (error) {

        }
        return '--';
    }

    // Función para convertir día a índice para ordenamiento (viernes = 0)
    function obtenerIndiceDia(dia) {
        const indice = diasSemana.indexOf(dia);
        return indice === -1 ? 999 : indice; // Si no se encuentra, poner al final
    }

    // Procesar y organizar registros
    const registrosConDia = empleado.registros.map(registro => {
        const fecha = registro.fecha || '--';
        const diaSemana = obtenerDiaSemana(fecha);
        const entrada = registro.entrada || '--';
        const salida = registro.salida || '--';

        return {
            dia: diaSemana,
            fecha: fecha,
            entrada: entrada,
            salida: salida,
            indiceDia: obtenerIndiceDia(diaSemana)
        };
    });

    // Ordenar por día empezando desde viernes
    registrosConDia.sort((a, b) => a.indiceDia - b.indiceDia);


    // Llenar la tabla con los registros organizados
    registrosConDia.forEach((registro, index) => {
        // Determinar clase CSS para completitud del registro
        let claseRegistro = '';
        if (registro.entrada !== '--' && registro.salida !== '--') {
            claseRegistro = 'registro-completo';
        } else if (registro.entrada === '--' && registro.salida === '--') {
            claseRegistro = 'registro-vacio';
        } else {
            claseRegistro = 'registro-incompleto';
        }

        const fila = `
            <tr class="${claseRegistro}">
                <td><strong>${registro.dia}</strong></td>
                <td>${registro.fecha}</td>
                <td>${registro.entrada}</td>
                <td>${registro.salida}</td>
            </tr>
        `;

        tbody.append(fila);
    });


}

//  FUNCIÓN PARA MOSTRAR MENSAJE CUANDO NO HAY REGISTROS
function mostrarMensajeNoRegistrosChecador() {
    const tbody = $('#tabla-checador tbody');
    tbody.html(`
        <tr>
            <td colspan="4" style="text-align: center; padding: 40px; color: #999; font-style: italic;">
                <i class="bi bi-info-circle"></i> No hay registros del checador disponibles para este empleado
            </td>
        </tr>
    `);
}

/*
 * ================================================================
 * MÓDULO DE FORMATO DE HORA - BASADO EN HORARIOS_MODAL.JS
 * ================================================================
 * Aplica la misma lógica de validación y formato de horarios_modal.js
 * ================================================================
 */

// Función para aplicar formato de hora a campos editables (basada en horarios_modal.js)
function aplicarFormatoHoraCamposEditables() {
    // Seleccionar solo las celdas editables de tiempo
    const camposEditables = $('#tab_registros .custom-table tbody td[contenteditable="true"]');

    camposEditables.each(function () {
        const $campo = $(this);

        // Guardar el valor original cuando se enfoca el campo
        $campo.off('focus.original').on('focus.original', function () {
            $(this).data('valor-original', $(this).text());
        });

        // Evento input - Filtrar y formatear mientras escribe
        $campo.off('input.formato').on('input.formato', function () {
            let valor = $(this).text();

            // Solo permitir números y dos puntos
            valor = valor.replace(/[^0-9:]/g, '');
            valor = valor.replace(/:+/g, ':');

            // Limitar a 5 caracteres máximo (HH:MM)
            if (valor.length > 5) {
                valor = valor.substring(0, 5);
            }

            // No permitir que empiece con :
            if (valor.startsWith(':')) {
                valor = valor.substring(1);
            }

            // Auto-formatear horas si exceden 23
            if (valor.length >= 2 && !valor.includes(':')) {
                let horas = valor.substring(0, 2);
                if (parseInt(horas) > 23) {
                    horas = "23";
                }
                valor = horas + valor.substring(2);
            }

            // Agregar : automáticamente después de 2 dígitos
            if (valor.length === 2 && !valor.includes(':')) {
                valor += ':';
            }

            // Validar minutos si ya tiene :
            if (valor.includes(':') && valor.length >= 5) {
                let partes = valor.split(':');
                if (partes[1] && parseInt(partes[1]) > 59) {
                    partes[1] = "59";
                }
                valor = partes[0] + ':' + (partes[1] || '');
            }

            $(this).text(valor);

            // Mover cursor al final
            let range = document.createRange();
            let sel = window.getSelection();
            range.selectNodeContents(this);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);

            // 🔥 DEBOUNCE: RECALCULAR DESPUÉS DE 200ms DE INACTIVIDAD (más rápido)
            const $fila = $(this).closest('tr');
            const indiceCelda = $(this).index();

            // Limpiar timeout anterior
            clearTimeout($(this).data('calcularTimeout'));

            // Crear nuevo timeout
            const timeoutId = setTimeout(() => {
                // Solo calcular si el formato está completo (HH:MM)
                if (valor.length === 5 && valor.includes(':')) {
                    // Si cambió entrada, salida_comer o entrada_comer → recalcular comida y totales
                    if (indiceCelda >= 1 && indiceCelda <= 3) {
                        calcularHorasComidaFila($fila);
                        calcularHorasTotalesFila($fila);
                        recalcularTotalesSemana(); // 🔥 Actualizar totales semanales inmediatamente
                    }

                    // Si cambió entrada o salida → recalcular totales
                    if (indiceCelda === 1 || indiceCelda === 4) {
                        calcularHorasTotalesFila($fila);
                        recalcularTotalesSemana(); // 🔥 Actualizar totales semanales inmediatamente
                    }

                    // Si cambió hora de comida (columna 8, índice 7) → recalcular totales
                    if (indiceCelda === 7) {
                        calcularHorasTotalesFila($fila);
                        recalcularTotalesSemana(); // 🔥 Actualizar totales semanales inmediatamente
                    }
                }
            }, 200);

            // Guardar el timeout ID en el elemento
            $(this).data('calcularTimeout', timeoutId);
        });

        // Evento blur - Completar formato al salir del campo
        $campo.off('blur.formato').on('blur.formato', function () {
            // 🔥 CANCELAR CUALQUIER TIMEOUT PENDIENTE DEL INPUT
            clearTimeout($(this).data('calcularTimeout'));

            let valor = $(this).text();

            // Guardar el valor original antes de cualquier modificación
            const valorOriginal = $(this).data('valor-original') || '';

            // Si está vacío, poner "--"
            if (valor === "") {
                $(this).text("--");
                valor = "--";
            }

            // Si es "--", mantenerlo
            if (valor === "--") {
                return;
            }

            // Completar formato según la longitud
            if (valor.length === 1) {
                $(this).text("0" + valor + ":00");
            } else if (valor.length === 2 && !valor.includes(':')) {
                $(this).text(valor + ":00");
            } else if (valor.length === 3 && valor.includes(':')) {
                $(this).text(valor + "00");
            } else if (valor.length === 4 && valor.includes(':')) {
                $(this).text(valor + "0");
            }

            //  RECALCULAR HORAS DESPUÉS DE FORMATEAR (INMEDIATAMENTE EN BLUR)
            const $fila = $(this).closest('tr');
            const indiceCelda = $(this).index();

            // Si cambió entrada, salida_comer o entrada_comer → recalcular comida y totales
            if (indiceCelda >= 1 && indiceCelda <= 3) {
                calcularHorasComidaFila($fila);
                calcularHorasTotalesFila($fila);
            }

            // Si cambió entrada o salida → recalcular totales
            if (indiceCelda === 1 || indiceCelda === 4) {
                calcularHorasTotalesFila($fila);
            }

            //  Si cambió hora de comida (columna 8, índice 7) → recalcular totales
            if (indiceCelda === 7) {
                calcularHorasTotalesFila($fila);
            }

            //  LÓGICA MEJORADA: ELIMINAR EVENTO ESPECIAL SOLO CUANDO HAY UN CAMBIO REAL
            // Solo eliminar eventos si el valor realmente cambió
            if ((indiceCelda === 1 || indiceCelda === 4) && valor !== valorOriginal) {
                // Determinar qué día se modificó basado en la fila
                const diasSemana = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];
                const indiceFila = $fila.index(); // Posición de la fila en la tabla

                if (indiceFila >= 0 && indiceFila < diasSemana.length) {
                    const diaModificado = diasSemana[indiceFila];
                    const tipoModificacion = indiceCelda === 1 ? 'entrada' : 'salida';

                    // 🗑️ ELIMINAR EVENTO ESPECIAL DE ESE DÍA SOLO SI HUBO CAMBIO REAL
                    eliminarEventoEspecialDia(diaModificado, tipoModificacion);
                }
            }
        });
    });
}

// Función para limpiar todos los event listeners del modal
function limpiarEventosModal() {
    // Limpiar eventos de inputs de percepciones
    $("#mod-sueldo-neto").off('input');
    $("#mod-horas-extras").off('input');
    $("#mod-incentivo-monto").off('input');
    $("#mod-actividades-especiales").off('input');
    $("#mod-bono-responsabilidad").off('input');

    // Limpiar eventos de checkboxes
    $("#mod-incentivo-check").off('change');
    $("#mod-bono-antiguedad-check").off('change');
    $("#mod-bono-antiguedad").off('input');

    // Limpiar eventos de conceptos
    $("#mod-isr").off('input');
    $("#mod-imss").off('input');
    $("#mod-infonavit").off('input');

    // Limpiar eventos de deducciones
    $("#mod-tarjeta").off('input');
    $("#mod-prestamo").off('input');
    $("#mod-uniformes").off('input');
    $("#mod-checador").off('input');
    $("#mod-fa-gafet-cofia").off('input');
    $("#mod-inasistencias-minutos").off('input');
    $("#mod-inasistencias-descuento").off('input');

    // Limpiar eventos de conceptos adicionales
    $('.concepto-adicional').off();
    $('.btn-eliminar-concepto').off('click');
    $('.concepto-nombre, .concepto-valor').off('input');

    //  LIMPIAR EVENTOS DE FORMATO DE HORA (incluyendo columna Horas Comida)
    $('#tab_registros .custom-table tbody td[contenteditable="true"]').each(function () {
        clearTimeout($(this).data('calcularTimeout')); // Limpiar timeouts pendientes
    }).off('input.formato blur.formato focus.original');

    //  LIMPIAR COMPLETAMENTE EVENTOS ESPECIALES
    $('#entradas-tempranas-content').empty();
    $('#salidas-tardias-content').empty();
    $('#olvidos-checador-content').empty();
    $('#total-entradas-tempranas').text('0 min');
    $('#total-salidas-tardias').text('0 min');
    $('#total-olvidos-checador').text('0 eventos');
    $('#tiempo-extra-total').text('0 min');



    // RESETEAR ESTADO DE MINI-TABS AL LIMPIAR
    resetearEstadoMiniTabs();

    // Marcar modal como inactivo
    modalDetallesActivo = false;
}


// Función para validar si una hora es válida
function esHoraValidaTabla(hora) {
    const patron = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!patron.test(hora)) {
        return false;
    }

    if (hora.includes("NaN")) {
        return false;
    }

    return true;
}

// Función para convertir hora HH:MM a minutos
function convertirHoraAMinutosTabla(hora) {
    if (!hora || hora === "" || hora.includes("NaN") || hora === "--") {
        return NaN;
    }

    const partes = hora.split(':');

    if (partes.length !== 2) {
        return NaN;
    }

    const horas = parseInt(partes[0]);
    const minutos = parseInt(partes[1]);

    if (isNaN(horas) || isNaN(minutos)) {
        return NaN;
    }

    return (horas * 60) + minutos;
}

// Función para convertir minutos a hora HH:MM
function convertirMinutosAHoraTabla(totalMinutos) {
    if (isNaN(totalMinutos) || totalMinutos < 0) {
        return "00:00";
    }

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    if (isNaN(horas) || isNaN(minutos)) {
        return "00:00";
    }

    return horas.toString().padStart(2, '0') + ':' + minutos.toString().padStart(2, '0');
}

// Función para calcular horas de comida en una fila
function calcularHorasComidaFila($fila) {
    // Obtener las celdas de la fila
    const celdas = $fila.find('td');
    const entrada = $(celdas[1]).text().trim();
    const salidaComida = $(celdas[2]).text().trim();
    const entradaComida = $(celdas[3]).text().trim();
    const $celdaHorasComida = $(celdas[7]); // Columna "Horas Comida"
    const horaComidaActual = $celdaHorasComida.text().trim();

    //  SI YA EXISTE UNA HORA DE COMIDA MANUAL, NO LA SOBREESCRIBIR
    if (horaComidaActual && horaComidaActual !== "00:00" && horaComidaActual !== "--" && esHoraValidaTabla(horaComidaActual)) {
        // Ya hay una hora de comida establecida manualmente, no calcular automáticamente
        return;
    }

    // Si no hay entrada, poner 00:00
    if (entrada === "00:00" || entrada === "" || entrada === "--") {
        $celdaHorasComida.text("00:00");
        return;
    }

    // Si no hay horarios de comida completos, poner 00:00
    if ((salidaComida === "00:00" || salidaComida === "" || salidaComida === "--") &&
        (entradaComida === "00:00" || entradaComida === "" || entradaComida === "--")) {
        $celdaHorasComida.text("00:00");
        return;
    }

    if (salidaComida === "00:00" || salidaComida === "" || salidaComida === "--" ||
        entradaComida === "00:00" || entradaComida === "" || entradaComida === "--") {
        $celdaHorasComida.text("00:00");
        return;
    }

    // Validar formato de horas
    if (!esHoraValidaTabla(salidaComida) || !esHoraValidaTabla(entradaComida)) {
        $celdaHorasComida.text("00:00");
        return;
    }

    // Convertir a minutos
    const salidaMinutos = convertirHoraAMinutosTabla(salidaComida);
    const entradaMinutos = convertirHoraAMinutosTabla(entradaComida);

    if (isNaN(salidaMinutos) || isNaN(entradaMinutos)) {
        $celdaHorasComida.text("00:00");
        return;
    }

    // Calcular diferencia
    const diferenciaMinutos = entradaMinutos - salidaMinutos;

    if (diferenciaMinutos <= 0) {
        $celdaHorasComida.text("00:00");
        return;
    }

    const horasComida = convertirMinutosAHoraTabla(diferenciaMinutos);

    if (horasComida.includes("NaN")) {
        $celdaHorasComida.text("00:00");
        return;
    }

    // Solo establecer el valor calculado si no hay una hora manual
    $celdaHorasComida.text(horasComida);
}

// Función para calcular horas totales trabajadas en una fila
function calcularHorasTotalesFila($fila) {
    const celdas = $fila.find('td');
    const entrada = $(celdas[1]).text().trim();
    const salidaComida = $(celdas[2]).text().trim();
    const entradaComida = $(celdas[3]).text().trim();
    const salida = $(celdas[4]).text().trim();
    const $celdaTotalHoras = $(celdas[5]); // Columna "Total Horas"
    const $celdaTotalMinutos = $(celdas[6]); // Columna "Total Minutos"

    // Si no hay entrada o salida, poner 00:00
    if (entrada === "00:00" || entrada === "" || entrada === "--" ||
        salida === "00:00" || salida === "" || salida === "--") {
        $celdaTotalHoras.text("00:00");
        $celdaTotalMinutos.text("0");
        // 🔥 NO RECALCULAR TOTALES AQUÍ PARA EVITAR BUCLE INFINITO
        return;
    }

    // Validar formato
    if (!esHoraValidaTabla(entrada) || !esHoraValidaTabla(salida)) {
        $celdaTotalHoras.text("00:00");
        $celdaTotalMinutos.text("0");
        return;
    }

    // Convertir a minutos
    const entradaMinutos = convertirHoraAMinutosTabla(entrada);
    const salidaMinutos = convertirHoraAMinutosTabla(salida);

    if (isNaN(entradaMinutos) || isNaN(salidaMinutos)) {
        $celdaTotalHoras.text("00:00");
        $celdaTotalMinutos.text("0");
        return;
    }

    // Calcular tiempo total trabajado
    let totalMinutosTrabajados = salidaMinutos - entradaMinutos;

    // Manejar cambio de día (ej: 23:00 a 01:00)
    if (totalMinutosTrabajados < 0) {
        totalMinutosTrabajados += (24 * 60);
    }

    //  PRIORIZAR SIEMPRE LA COLUMNA "HORAS COMIDA" EDITABLE
    let tiempoComidaMinutos = 0;
    const horaComidaExistente = $(celdas[7]).text().trim(); // Hora de comida ya establecida

    // PRIMERA PRIORIDAD: Usar la columna "Horas Comida" si tiene un valor válido
    if (horaComidaExistente && horaComidaExistente !== "00:00" && horaComidaExistente !== "--" && esHoraValidaTabla(horaComidaExistente)) {
        tiempoComidaMinutos = convertirHoraAMinutosTabla(horaComidaExistente);
    }
    // SEGUNDA PRIORIDAD: Solo si la columna "Horas Comida" está vacía, calcular usando horarios específicos
    else if (salidaComida !== "00:00" && salidaComida !== "" && salidaComida !== "--" &&
        entradaComida !== "00:00" && entradaComida !== "" && entradaComida !== "--") {

        if (esHoraValidaTabla(salidaComida) && esHoraValidaTabla(entradaComida)) {
            const salidaComidaMinutos = convertirHoraAMinutosTabla(salidaComida);
            const entradaComidaMinutos = convertirHoraAMinutosTabla(entradaComida);

            if (!isNaN(salidaComidaMinutos) && !isNaN(entradaComidaMinutos)) {
                tiempoComidaMinutos = entradaComidaMinutos - salidaComidaMinutos;
            }
        }
    }

    // Restar tiempo de comida si es válido
    if (tiempoComidaMinutos > 0) {
        totalMinutosTrabajados -= tiempoComidaMinutos;
    }

    // Validar resultado
    if (totalMinutosTrabajados <= 0) {
        $celdaTotalHoras.text("00:00");
        $celdaTotalMinutos.text("0");
        return;
    }

    // Convertir y actualizar
    const horasTotales = convertirMinutosAHoraTabla(totalMinutosTrabajados);

    if (horasTotales.includes("NaN")) {
        $celdaTotalHoras.text("00:00");
        $celdaTotalMinutos.text("0");
        return;
    }

    $celdaTotalHoras.text(horasTotales);
    $celdaTotalMinutos.text(totalMinutosTrabajados.toString());

    // 🔥 NO LLAMAR recalcularTotalesSemana() aquí - se llama directamente desde aplicarFormatoHoraCamposEditables
    // Esto evita llamadas duplicadas y mejora el rendimiento
}

// Función para recalcular los totales de la semana (fila TOTAL)
function recalcularTotalesSemana() {

    // 🔥 VERIFICAR QUE SOLO ESTAMOS EN LA TABLA VISIBLE
    const $tablaVisible = $('#tabla-redondeados:visible .custom-table tbody tr');

    if ($tablaVisible.length === 0) {

        return;
    }

    let totalHorasSemanales = 0;
    let totalComidaSemanales = 0;

    // 🔥 USAR SELECTOR MÁS ESPECÍFICO PARA EVITAR DUPLICADOS
    $tablaVisible.each(function (index) {
        const $fila = $(this);
        const celdas = $fila.find('td');

        // 🔥 VERIFICAR MÁS ESTRICTAMENTE QUE ES UNA FILA DE DATOS VÁLIDA
        if (celdas.length >= 8) {
            const primeraCelda = $(celdas[0]).text().trim();

            // Excluir filas de mensajes informativos
            if (primeraCelda.includes('No hay registros') ||
                primeraCelda.includes('info-circle') ||
                primeraCelda === '' ||
                celdas.length < 8) {

                return true; // Continuar con la siguiente fila
            }

            // 🔥 VALIDAR QUE ES UN DÍA DE LA SEMANA VÁLIDO
            const diasValidos = ['viernes', 'sábado', 'domingo', 'lunes', 'martes', 'miércoles', 'jueves'];
            if (!diasValidos.includes(primeraCelda.toLowerCase())) {

                return true;
            }

            // 🔥 OBTENER VALORES DE MINUTOS DIRECTAMENTE (COLUMNA 6)
            const minutosTexto = $(celdas[6]).text().trim();
            const minutosHoras = parseInt(minutosTexto) || 0;



            // 🔥 SOLO SUMAR SI ES UN NÚMERO VÁLIDO Y NO ES "--"
            if (minutosHoras > 0 && minutosTexto !== '--') {
                totalHorasSemanales += minutosHoras;

            }

            // Sumar horas de comida (columna 8, índice 7)
            const horasComida = $(celdas[7]).text().trim();
            if (horasComida && horasComida !== "00:00" && horasComida !== "--" && horasComida !== "") {
                const minutosComida = convertirHoraAMinutosTabla(horasComida);
                if (!isNaN(minutosComida) && minutosComida > 0) {
                    totalComidaSemanales += minutosComida;

                }
            }
        }
    });



    // Convertir totales a formato HH:MM
    const totalHorasFormateadas = convertirMinutosAHoraTabla(totalHorasSemanales);
    const totalComidaFormateadas = convertirMinutosAHoraTabla(totalComidaSemanales);



    // 🔥 ACTUALIZAR SOLO LA FILA TOTAL DE LA TABLA VISIBLE
    const $filaTotalTfoot = $('#tabla-redondeados:visible .custom-table tfoot tr');
    if ($filaTotalTfoot.length > 0) {
        const celdasTotal = $filaTotalTfoot.find('th');
        if (celdasTotal.length >= 8) {
            // Limpiar y establecer nuevos valores
            $(celdasTotal[5]).empty().text(totalHorasFormateadas);      // Total Horas
            $(celdasTotal[6]).empty().text(totalHorasSemanales);        // Total Minutos
            $(celdasTotal[7]).empty().text(totalComidaFormateadas);     // Total Horas Comida


        }
    }

    //  SOLO EJECUTAR UNA VEZ EL RECÁLCULO DE MINUTOS
    setTimeout(() => {
        recalcularMinutosNormalesYExtras();
    }, 100);
}

//  FUNCIÓN PARA RECALCULAR MINUTOS NORMALES Y EXTRAS (MEJORADA)
function recalcularMinutosNormalesYExtras() {


    // 🔥 OBTENER EL TOTAL SOLO DE LA TABLA VISIBLE
    const $filaTotalTfoot = $('#tabla-redondeados:visible .custom-table tfoot tr');
    if ($filaTotalTfoot.length === 0) {

        return;
    }

    const celdasTotal = $filaTotalTfoot.find('th');
    if (celdasTotal.length < 7) {

        return;
    }

    // 🔥 OBTENER DIRECTAMENTE EL VALOR DE LA CELDA DE TOTAL MINUTOS
    const totalMinutosTrabajadosTexto = $(celdasTotal[6]).text().trim();
    const totalMinutosTrabajados = parseInt(totalMinutosTrabajadosTexto) || 0;


    // Obtener minutos normales de la semana (48 horas = 2880 minutos)
    const minutosNormalesSemanales = 2880; // 48 horas * 60 minutos

    // Calcular minutos normales y extras
    let minutosNormales = 0;
    let minutosExtras = 0;

    if (totalMinutosTrabajados <= minutosNormalesSemanales) {
        // No hay extras, solo normales
        minutosNormales = totalMinutosTrabajados;
        minutosExtras = 0;
    } else {
        // Hay extras
        minutosNormales = minutosNormalesSemanales;
        minutosExtras = totalMinutosTrabajados - minutosNormalesSemanales;
    }


    //  ACTUALIZAR LOS INPUTS DE MINUTOS (LIMPIAR PRIMERO)
    $("#minutos-normales-trabajados").val('').val(minutosNormales);
    $("#minutos-extra-trabajados").val('').val(minutosExtras);

    //  ACTUALIZAR EN EL JSON GLOBAL TAMBIÉN
    const clave = $('#campo-clave').text().trim();
    if (clave) {
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'Minutos_normales', minutosNormales);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'Minutos_extra', minutosExtras);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'Minutos_trabajados', totalMinutosTrabajados);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'total_minutos_redondeados', totalMinutosTrabajados);

        // También actualizar el tiempo total en formato HH:MM
        const tiempoTotalFormateado = convertirMinutosAHoraTabla(totalMinutosTrabajados);
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'tiempo_total_redondeado', tiempoTotalFormateado);



        //  RECALCULAR HORAS EXTRAS EN PESOS Y ACTUALIZAR CAMPOS
        recalcularHorasExtrasEnPesos(clave, minutosExtras);
    }

    //  FUNCIÓN PARA RECALCULAR HORAS EXTRAS EN PESOS
    function recalcularHorasExtrasEnPesos(clave, minutosExtras) {


        // Obtener costo por minuto de horas extra
        let costoPorMinuto = 1.34; // Valor por defecto

        if (window.rangosHorasJson) {
            const rangoExtra = window.rangosHorasJson.find(rango => rango.tipo === "hora_extra");
            if (rangoExtra && rangoExtra.costo_por_minuto) {
                costoPorMinuto = rangoExtra.costo_por_minuto;
            }
        }

        // Calcular horas extras en pesos
        const horasExtrasEnPesos = minutosExtras * costoPorMinuto;



        // Actualizar el campo "Horas Extras" en el modal
        $("#mod-horas-extras").val(horasExtrasEnPesos.toFixed(2));

        // Actualizar en el JSON global
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'sueldo_extra', horasExtrasEnPesos);

        // Recalcular total extra (incluye horas extras + bonos + conceptos adicionales)
        calcularTotalExtra();

        // Actualizar sueldo a cobrar
        actualizarSueldoACobrarEnTiempoReal(clave);


    }

    // 🔥 MODIFICAR TAMBIÉN LA FUNCIÓN calcularHorasTotalesFila PARA EVITAR BUCLES
    function calcularHorasTotalesFila($fila) {
        const celdas = $fila.find('td');
        const entrada = $(celdas[1]).text().trim();
        const salidaComida = $(celdas[2]).text().trim();
        const entradaComida = $(celdas[3]).text().trim();
        const salida = $(celdas[4]).text().trim();
        const $celdaTotalHoras = $(celdas[5]); // Columna "Total Horas"
        const $celdaTotalMinutos = $(celdas[6]); // Columna "Total Minutos"

        // Si no hay entrada o salida, poner 00:00
        if (entrada === "00:00" || entrada === "" || entrada === "--" ||
            salida === "00:00" || salida === "" || salida === "--") {
            $celdaTotalHoras.text("00:00");
            $celdaTotalMinutos.text("0");
            // 🔥 NO RECALCULAR TOTALES AQUÍ PARA EVITAR BUCLE INFINITO
            return;
        } eliminarEventoEspecialDia

        // Validar formato
        if (!esHoraValidaTabla(entrada) || !esHoraValidaTabla(salida)) {
            $celdaTotalHoras.text("00:00");
            $celdaTotalMinutos.text("0");
            return;
        }

        // Convertir a minutos
        const entradaMinutos = convertirHoraAMinutosTabla(entrada);
        const salidaMinutos = convertirHoraAMinutosTabla(salida);

        if (isNaN(entradaMinutos) || isNaN(salidaMinutos)) {
            $celdaTotalHoras.text("00:00");
            $celdaTotalMinutos.text("0");
            return;
        }

        // Calcular tiempo total trabajado
        let totalMinutosTrabajados = salidaMinutos - entradaMinutos;

        // Manejar cambio de día (ej: 23:00 a 01:00)
        if (totalMinutosTrabajados < 0) {
            totalMinutosTrabajados += (24 * 60);
        }

        //  PRIORIZAR SIEMPRE LA COLUMNA "HORAS COMIDA" EDITABLE
        let tiempoComidaMinutos = 0;
        const horaComidaExistente = $(celdas[7]).text().trim(); // Hora de comida ya establecida

        // PRIMERA PRIORIDAD: Usar la columna "Horas Comida" si tiene un valor válido
        if (horaComidaExistente && horaComidaExistente !== "00:00" && horaComidaExistente !== "--" && esHoraValidaTabla(horaComidaExistente)) {
            tiempoComidaMinutos = convertirHoraAMinutosTabla(horaComidaExistente);
        }
        // SEGUNDA PRIORIDAD: Solo si la columna "Horas Comida" está vacía, calcular usando horarios específicos
        else if (salidaComida !== "00:00" && salidaComida !== "" && salidaComida !== "--" &&
            entradaComida !== "00:00" && entradaComida !== "" && entradaComida !== "--") {

            if (esHoraValidaTabla(salidaComida) && esHoraValidaTabla(entradaComida)) {
                const salidaComidaMinutos = convertirHoraAMinutosTabla(salidaComida);
                const entradaComidaMinutos = convertirHoraAMinutosTabla(entradaComida);

                if (!isNaN(salidaComidaMinutos) && !isNaN(entradaComidaMinutos)) {
                    tiempoComidaMinutos = entradaComidaMinutos - salidaComidaMinutos;
                }
            }
        }

        // Restar tiempo de comida si es válido
        if (tiempoComidaMinutos > 0) {
            totalMinutosTrabajados -= tiempoComidaMinutos;
        }

        // Validar resultado
        if (totalMinutosTrabajados <= 0) {
            $celdaTotalHoras.text("00:00");
            $celdaTotalMinutos.text("0");
            return;
        }

        // Convertir y actualizar
        const horasTotales = convertirMinutosAHoraTabla(totalMinutosTrabajados);

        if (horasTotales.includes("NaN")) {
            $celdaTotalHoras.text("00:00");
            $celdaTotalMinutos.text("0");
            return;
        }

        $celdaTotalHoras.text(horasTotales);
        $celdaTotalMinutos.text(totalMinutosTrabajados.toString());

        // 🔥 USAR TIMEOUT PARA EVITAR MÚLTIPLES EJECUCIONES
        clearTimeout(window.recalcularTimeout);
        window.recalcularTimeout = setTimeout(() => {
            recalcularTotalesSemana();
        }, 300);
    }
}

// Función para recalcular los totales de eventos especiales (salida tardía, entrada temprana, tiempo extra total)
function recalcularTotalesEventos() {
    let totalEntradaTemprana = 0;
    let totalSalidaTardia = 0;

    // Función auxiliar para convertir tiempo en formato "Xh Ymin" o "Zmin" a minutos
    function convertirTiempoAMinutos(tiempo) {
        if (!tiempo) return 0;
        let minutos = 0;
        if (tiempo.includes('h')) {
            const partes = tiempo.split('h');
            minutos += parseInt(partes[0]) * 60;
            if (partes[1] && partes[1].includes('min')) {
                minutos += parseInt(partes[1].replace('min', ''));
            }
        } else if (tiempo.includes('min')) {
            minutos = parseInt(tiempo.replace('min', ''));
        }
        return minutos;
    }

    // Sumar minutos de entradas tempranas
    $('#entradas-tempranas-content .evento-tiempo').each(function () {
        const tiempo = $(this).text().trim();
        totalEntradaTemprana += convertirTiempoAMinutos(tiempo);
    });

    // Sumar minutos de salidas tardías
    $('#salidas-tardias-content .evento-tiempo').each(function () {
        const tiempo = $(this).text().trim();
        totalSalidaTardia += convertirTiempoAMinutos(tiempo);
    });

    // Función auxiliar para convertir minutos a formato "Xh Ymin" o "Zmin"
    function minutosAHora(minutos) {
        if (minutos === 0) return "0 min";
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        if (h > 0 && m > 0) return `${h}h ${m}min`;
        if (h > 0) return `${h}h`;
        return `${m}min`;
    }

    // Actualizar los totales en la interfaz
    $('#total-entradas-tempranas').text(minutosAHora(totalEntradaTemprana));
    $('#total-salidas-tardias').text(minutosAHora(totalSalidaTardia));
    $('#tiempo-extra-total').text(minutosAHora(totalEntradaTemprana + totalSalidaTardia));
}