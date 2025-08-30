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
        // 🔥 ACTIVAR MODAL ANTES DE CONFIGURAR DATOS
        activarModal();
        
        // 🆕 RESETEAR ESTADO DE MINI-TABS ANTES DE MOSTRAR DATOS
        resetearEstadoMiniTabs();

        establecerDatosTrabajador(empleadoEncontrado.clave, empleadoEncontrado.nombre);
        establecerDatosConceptos(empleadoEncontrado.conceptos || []);
        llenarTablaHorariosSemanales(empleadoEncontrado);
        establecerDatosPercepciones(empleadoEncontrado);
        establecerDatosDeducciones(empleadoEncontrado);
        establecerMinutosHoras(empleadoEncontrado.Minutos_extra, empleadoEncontrado.Minutos_normales);
    }
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
    if (empleado.bono_responsabilidad && !isNaN(empleado.bono_responsabilidad)) {
        $("#mod-bono-responsabilidad").val(empleado.bono_responsabilidad);
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
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar
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
        const bonoResponsabilidad = parseFloat($(this).val()) || 0;
        actualizarPropiedadEmpleadoEnJsonGlobal(clave, 'bono_responsabilidad', bonoResponsabilidad);
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
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp[propiedad] = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal[propiedad] = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado[propiedad] = valor;
        }
    }
}



// Calcular total de sueldo extra sumando todos los componentes
function calcularTotalExtra() {
    // Obtener valores de todos los campos que conforman el total extra
    const horasExtras = parseFloat($('#mod-horas-extras').val()) || 0;
    const bonoAntiguedad = parseFloat($('#mod-bono-antiguedad').val()) || 0;
    const actividadesEspeciales = parseFloat($('#mod-actividades-especiales').val()) || 0;
    const bonoResponsabilidad = parseFloat($('#mod-bono-responsabilidad').val()) || 0;

    // Sumar conceptos adicionales dinámicos
    let conceptosAdicionalesTotales = 0;
    $('.concepto-adicional .concepto-valor').each(function () {
        const valor = parseFloat($(this).val()) || 0;
        conceptosAdicionalesTotales += valor;
    });

    // Calcular el total
    const totalExtra = horasExtras + bonoAntiguedad + actividadesEspeciales + bonoResponsabilidad + conceptosAdicionalesTotales;

    // Actualizar el campo total extra
    $('#mod-total-extra').val(totalExtra.toFixed(2));

    // Actualizar en el JSON global también
    const clave = $('#campo-clave').text().trim();
    if (clave) {
        actualizarTotalExtraEnJsonGlobal(clave, totalExtra);
        actualizarSueldoACobrarEnTiempoReal(clave); //   Actualizar sueldo a cobrar cuando cambie el total extra
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
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && modalDetallesActivo) {
            limpiarEventosModal();
            $('#modal-detalles').fadeOut();
        }
    });
    
    // Limpiar si se hace clic fuera del modal
    $('#modal-detalles').on('click', function(e) {
        if (e.target === this) {
            limpiarEventosModal();
            $('#modal-detalles').fadeOut();
        }
    });

    // 🆕 FUNCIONALIDAD PARA CAMBIAR ENTRE VISTAS DE REGISTROS
    $(document).on('change', 'input[name="vista-registros"]', function() {
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
    const $fila = $(`#tabla-nomina-body tr[data-clave="${clave}"]`);

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

    // Actualizar la columna del sueldo a cobrar (columna 16, índice 15)
    const celdas = $fila.find('td');
    $(celdas[15]).text(mostrarValor(sueldoACobrar.toFixed(2)));

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



    // 1. Asegurar que el total extra esté calculado
    calcularTotalExtra();

    // 2. Calcular sueldo a cobrar automáticamente
    calcularSueldoACobrar(clave);

    // 3. Obtener datos actualizados del empleado desde jsonGlobal
    const empleadoActualizado = obtenerEmpleadoActualizado(clave);

    if (!empleadoActualizado) {
       
        return;
    }

    // 4. Actualizar la fila de la tabla
    actualizarFilaTabla(clave, empleadoActualizado);

    // 5. LIMPIAR EVENTOS ANTES DE CERRAR
    limpiarEventosModal();

    // 6. Cerrar el modal
    $('#modal-detalles').fadeOut();


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

//FUNCIÓN PARA ACTUALIZAR FILA DE LA TABLA

function actualizarFilaTabla(clave, empleado) {
    const $fila = $(`#tabla-nomina-body tr[data-clave="${clave}"]`);

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

    // Función para mostrar cadena vacía en lugar de 0, NaN o valores vacíos
    const mostrarValor = (valor) => {
        if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
            return '';
        }
        return valor;
    };

    // Solo mostrar el puesto original del empleado
    let puestoEmpleado = empleado.puesto || empleado.nombre_departamento || '';

    // Obtener el incentivo si existe
    const incentivo = empleado.incentivo ? empleado.incentivo.toFixed(2) : '';

    // Usar sueldo_extra_final si existe, sino usar sueldo_extra
    const sueldoExtra = empleado.sueldo_extra_final || empleado.sueldo_extra || 0;

    // Actualizar las celdas de la fila
    const celdas = $fila.find('td');

    // Actualizar cada celda (manteniendo el número de fila)
    $(celdas[1]).text(empleado.nombre); // Nombre
    $(celdas[2]).text(puestoEmpleado); // Puesto (mantener el original)
    $(celdas[3]).text(mostrarValor(empleado.sueldo_base)); // Sueldo base
    $(celdas[4]).text(mostrarValor(incentivo)); // Incentivo
    $(celdas[5]).text(mostrarValor(sueldoExtra.toFixed(2))); // Extra (ahora usay sueldo_extra_final)
    $(celdas[6]).text(mostrarValor(empleado.neto_pagar)); // Neto a pagar
    $(celdas[7]).text(mostrarValor(empleado.prestamo)); // Préstamo
    $(celdas[8]).text(mostrarValor(empleado.inasistencias_descuento)); // Inasistencias
    $(celdas[9]).text(mostrarValor(empleado.uniformes)); // Uniformes
    $(celdas[10]).text(mostrarValor(infonavit)); // INFONAVIT
    $(celdas[11]).text(mostrarValor(isr)); // ISR
    $(celdas[12]).text(mostrarValor(imss)); // IMSS
    $(celdas[13]).text(mostrarValor(empleado.checador)); // Checador
    $(celdas[14]).text(mostrarValor(empleado.fa_gafet_cofia)); // F.A/GAFET/COFIA
    $(celdas[15]).text(mostrarValor(empleado.sueldo_a_cobrar ? empleado.sueldo_a_cobrar.toFixed(2) : '')); // SUELDO A COBRAR

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

    //   LIMPIAR TAMBIÉN EVENTOS ESPECIALES
    $('#entradas-tempranas-content').empty();
    $('#salidas-tardias-content').empty();
    $('#olvidos-checador-content').empty();
    $('#total-entradas-tempranas').text('0 min');
    $('#total-salidas-tardias').text('0 min');
    $('#total-olvidos-checador').text('0 eventos');
    $('#tiempo-extra-total').text('0 min');

    //   VERIFICAR SI EL EMPLEADO TIENE DATOS REDONDEADOS
    if (!empleado.tiempo_total_redondeado || !empleado.registros_redondeados || empleado.registros_redondeados.length === 0) {
       
        // Mostrar mensaje en la tabla indicando que no hay datos
        const filaMensaje = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999; font-style: italic;">
                    <i class="bi bi-info-circle"></i> No hay registros de horarios disponibles para este empleado
                </td>
            </tr>
        `;
        tbody.html(filaMensaje);

        // Fila de totales vacía
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

        return; //   SALIR DE LA FUNCIÓN SI NO HAY DATOS
    }

  
    // Mapear días de la semana EMPEZANDO DESDE VIERNES
    const diasSemana = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];
    const diasEspañol = ['Viernes', 'Sábado', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves'];

    // Crear mapa de datos por día
    const datosPorDia = {};
    empleado.registros_redondeados.forEach(registro => {
        datosPorDia[registro.dia.toLowerCase()] = registro;
    });

    // Variables para totales
    let totalMinutosSemana = empleado.total_minutos_redondeados || 0;
    let totalMinutosComida = 0;

    // Función para extraer minutos de formato "HH:MM"
    function extraerMinutos(hora) {
        if (!hora || hora === "00:00" || hora === "--") return 0;
        const [h, m] = hora.split(':');
        return parseInt(m) || 0;
    }
    function horaAMinutos(hora) {
        if (!hora || hora === "" || hora === "00:00") return 0;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }

    // Llenar cada fila de la tabla
    diasSemana.forEach((dia, index) => {
        const diaEspañol = diasEspañol[index];
        const datos = datosPorDia[dia];

        let fila = '';

        if (datos && datos.trabajado !== "00:00") {
            // Día con trabajo
            const minutosDelDia = horaAMinutos(datos.trabajado);

            fila = `
                <tr>
                    <td class="day-cell">${diaEspañol}</td>
                    <td contenteditable="true">${datos.entrada || '--'}</td>
                    <td contenteditable="true">${datos.salida_comer || '--'}</td>
                    <td contenteditable="true">${datos.entrada_comer || '--'}</td>
                    <td contenteditable="true">${datos.salida || '--'}</td>
                    <td>${datos.trabajado || '--'}</td>
                    <td>${minutosDelDia.toString().padStart(2, '0')}</td>
                    <td>${datos.hora_comida || '--'}</td>
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
                    <td>--</td>
                </tr>
            `;
        }

        tbody.append(fila);
    });

    // Convertir totales a formato HH:MM
    const totalHorasSemana = empleado.tiempo_total_redondeado || "00:00";
    const totalHorasComida = `${Math.floor(totalMinutosComida / 60).toString().padStart(2, '0')}:${(totalMinutosComida % 60).toString().padStart(2, '0')}`;
    const totalMinutosFinal = horaAMinutos(totalHorasSemana);

    // Actualizar fila de totales
    const filaTotales = `
        <tr>
            <th>TOTAL</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>${totalHorasSemana}</th>
            <th>${totalMinutosFinal}</th>
            <th>${totalHorasComida}</th>
        </tr>
    `;

    $('#tab_registros .custom-table tfoot').html(filaTotales);

    // Al final de la función, después de actualizar la tabla
    llenarEventosEspeciales(empleado);
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

/*
 * ================================================================
 * MÓDULO DE GESTIÓN DE EVENTOS DEL MODAL
 * ================================================================
 * Controla la activación y desactivación de eventos para evitar
 * conflictos cuando el modal se cierra
 * ================================================================
 */

// Variable global para controlar si el modal está activo
let modalDetallesActivo = false;

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
    
    // RESETEAR ESTADO DE MINI-TABS AL LIMPIAR
    resetearEstadoMiniTabs();
    
    // Marcar modal como inactivo
    modalDetallesActivo = false;
}

// Función para activar el modal y configurar eventos
function activarModal() {
    modalDetallesActivo = true;
   
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

// 🆕 FUNCIÓN PARA LLENAR LA TABLA DEL CHECADOR
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
    
    // Recorrer los registros del empleado
    empleado.registros.forEach((registro, index) => {
        
        const fecha = registro.fecha || '--';
        const entrada = registro.entrada || '--';
        const salida = registro.salida || '--';
        
        const fila = `
            <tr>
                <td>${fecha}</td>
                <td>${entrada}</td>
                <td>${salida}</td>
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
            <td colspan="3" style="text-align: center; padding: 40px; color: #999; font-style: italic;">
                <i class="bi bi-info-circle"></i> No hay registros del checador disponibles para este empleado
            </td>
        </tr>
    `);
}

//  FUNCIÓN PARA RESETEAR ESTADO DE MINI-TABS
function resetearEstadoMiniTabs() {
    // Resetear clases activas de los botones
    $('.mini-tab-registros').removeClass('active');
    $('#btn-redondeados').addClass('active');
    
    // Mostrar tabla redondeados por defecto y ocultar checador
    $('#tabla-checador').hide();
    $('#tabla-redondeados').show();
    
    
}

