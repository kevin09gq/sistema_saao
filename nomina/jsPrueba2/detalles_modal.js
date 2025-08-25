
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

        establecerDatosTrabajador(empleadoEncontrado.clave, empleadoEncontrado.nombre);
        establecerDatosConceptos(empleadoEncontrado.conceptos || []);
        llenarTablaHorariosSemanales(empleadoEncontrado);
        establecerDatosPercepciones(empleadoEncontrado);
    }
}

/*
 * ================================================================
 * MÓDULO DE CONFIGURACIÓN DE DATOS EN MODAL
 * ================================================================
 * Este módulo se encarga de:
 * - Establecer datos básicos del trabajador (clave y nombre) en el modal
 * - Configurar valores de conceptos (ISR, IMSS, INFONAVIT) en formularios
 * - Manejar eventos de actualización en tiempo real de conceptos
 * - Sincronizar cambios con el JSON global del sistema
 * ================================================================
 */

function establecerDatosTrabajador(clave, nombre) {
    $('#campo-clave').text(clave);
    $('#campo-nombre').text(nombre);
}


/*
 * ================================================================
 * PERCEPCIONES
 * ================================================================
 */


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

    // Agregar eventos para actualizar sueldos en tiempo real (solo jsonGlobal, no tabla)
    $("#mod-sueldo-neto").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const sueldoBase = parseFloat($(this).val());
        actualizarSueldoEnJsonGlobal(clave, 'sueldo_base', sueldoBase);
    });

    $("#mod-horas-extras").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const sueldoExtra = parseFloat($(this).val());
        actualizarSueldoEnJsonGlobal(clave, 'sueldo_extra', sueldoExtra);
        calcularTotalExtra(); // Recalcular total
    });

    $("#mod-incentivo-monto").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const incentivo = parseFloat($(this).val());
        actualizarIncentivoEnJsonGlobal(clave, incentivo);
    });

    $("#mod-actividades-especiales").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const actividadesEspeciales = parseFloat($(this).val()) || 0;
        actualizarActividadesEspecialesEnJsonGlobal(clave, actividadesEspeciales);
        calcularTotalExtra(); // Recalcular total
    });

    $("#mod-bono-responsabilidad").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const bonoResponsabilidad = parseFloat($(this).val()) || 0;
        actualizarBonoResponsabilidadEnJsonGlobal(clave, bonoResponsabilidad);
        calcularTotalExtra(); // Recalcular total
    });

    // Ya no es necesario configurar el botón aquí, se usará delegación de eventos
    
    // Cargar conceptos adicionales existentes del empleado
    cargarConceptosAdicionalesExistentes(empleado);

 
    configCheckBox(empleado.incentivo, empleado.bono_antiguedad);
    
    // Calcular total extra inicial después de cargar todos los valores
    setTimeout(() => {
        calcularTotalExtra();
    }, 100);
}

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
        actualizarIncentivoEnJsonGlobal(clave, valorIncentivo);
    });
    
    // ✅ CONFIGURAR CHECKBOX E INPUT DEL BONO DE ANTIGÜEDAD
    const checkboxBonoAntiguedad = $("#mod-bono-antiguedad-check");
    const inputBonoAntiguedad = $("#mod-bono-antiguedad");

    // ✅ ESTABLECER ESTADO INICIAL BASADO EN LOS DATOS DEL EMPLEADO
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
        actualizarBonoAntiguedadEnJsonGlobal(clave, valorBono);
        calcularTotalExtra(); // Recalcular total
    });

    // Evento para actualizar valor cuando se modifica el input del bono
    inputBonoAntiguedad.off('input').on('input', function () {
        if (!$(this).prop('disabled')) {
            const clave = $('#campo-clave').text().trim();
            const valorBono = parseFloat($(this).val()) || 0;
            actualizarBonoAntiguedadEnJsonGlobal(clave, valorBono);
            calcularTotalExtra(); // Recalcular total
        }
    });
}


// Función para actualizar sueldo solo en jsonGlobal (sin afectar tabla)
function actualizarSueldoEnJsonGlobal(clave, tipo, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp[tipo] = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal[tipo] = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado[tipo] = valor;
        }
    }


}
 
function actualizarIncentivoEnJsonGlobal(clave, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp.incentivo = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal.incentivo = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado.incentivo = valor;
        }
    }
}

function actualizarBonoAntiguedadEnJsonGlobal(clave, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp.bono_antiguedad = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal.bono_antiguedad = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado.bono_antiguedad = valor;
        }
    }

   
}

/*
 * ================================================================
 * FUNCIÓN PARA CALCULAR TOTAL EXTRA AUTOMÁTICAMENTE
 * ================================================================
 * Esta función calcula automáticamente el total de sueldos extra
 * sumando: horas extras + bono antigüedad + actividades especiales + puesto
 * ================================================================
 */
function calcularTotalExtra() {
    // Obtener valores de todos los campos que conforman el total extra
    const horasExtras = parseFloat($('#mod-horas-extras').val()) || 0;
    const bonoAntiguedad = parseFloat($('#mod-bono-antiguedad').val()) || 0;
    const actividadesEspeciales = parseFloat($('#mod-actividades-especiales').val()) || 0;
    const bonoResponsabilidad = parseFloat($('#mod-bono-responsabilidad').val()) || 0;
    
    // Sumar conceptos adicionales dinámicos
    let conceptosAdicionalesTotales = 0;
    $('.concepto-adicional .concepto-valor').each(function() {
        const valor = parseFloat($(this).val()) || 0;
        conceptosAdicionalesTotales += valor;
    });
    
    // Calcular el total
    const totalExtra = horasExtras + bonoAntiguedad + actividadesEspeciales + bonoResponsabilidad + conceptosAdicionalesTotales;
    
    // Actualizar el campo total extra
    $('#mod-total-extra').val(totalExtra.toFixed(2));
    
    // Opcional: Mostrar en consola para debugging
    console.log('Cálculo Total Extra:', {
        horasExtras: horasExtras,
        bonoAntiguedad: bonoAntiguedad,
        actividadesEspeciales: actividadesEspeciales,
        bonoResponsabilidad: bonoResponsabilidad,
        conceptosAdicionales: conceptosAdicionalesTotales,
        total: totalExtra
    });
    
    // Actualizar en el JSON global también
    const clave = $('#campo-clave').text().trim();
    if (clave) {
        actualizarTotalExtraEnJsonGlobal(clave, totalExtra);
    }
}

/*
 * ================================================================
 * FUNCIÓN PARA ACTUALIZAR TOTAL EXTRA EN JSON GLOBAL
 * ================================================================
 */
function actualizarTotalExtraEnJsonGlobal(clave, totalExtra) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp.total_extra_calculado = totalExtra;
                    emp.sueldo_extra_final = totalExtra; // Nueva propiedad
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal.total_extra_calculado = totalExtra;
            empleadoOriginal.sueldo_extra_final = totalExtra; // Nueva propiedad
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado.total_extra_calculado = totalExtra;
            empleadoFiltrado.sueldo_extra_final = totalExtra; // Nueva propiedad
        }
    }
    
    console.log(`✅ sueldo_extra_final actualizado para empleado ${clave}: $${totalExtra.toFixed(2)}`);
}

function actualizarActividadesEspecialesEnJsonGlobal(clave, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp.actividades_especiales = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal.actividades_especiales = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado.actividades_especiales = valor;
        }
    }
}

function actualizarBonoResponsabilidadEnJsonGlobal(clave, valor) {
    // Actualizar en jsonGlobal
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (String(emp.clave) === String(clave)) {
                    emp.bono_responsabilidad = valor;
                }
            });
        });
    }

    // Actualizar en empleadosOriginales
    if (window.empleadosOriginales) {
        const empleadoOriginal = window.empleadosOriginales.find(emp => String(emp.clave) === String(clave));
        if (empleadoOriginal) {
            empleadoOriginal.bono_responsabilidad = valor;
        }
    }

    // Actualizar en empleadosFiltrados
    if (empleadosFiltrados) {
        const empleadoFiltrado = empleadosFiltrados.find(emp => String(emp.clave) === String(clave));
        if (empleadoFiltrado) {
            empleadoFiltrado.bono_responsabilidad = valor;
        }
    }
}

/*
 * ================================================================
 * MÓDULO DE CONCEPTOS ADICIONALES DINÁMICOS
 * ================================================================
 * Este módulo se encarga de:
 * - Agregar campos dinámicos para conceptos personalizados
 * - Guardar conceptos adicionales en el empleado
 * - Inicializar conceptos existentes al abrir el modal
 * - Eliminar conceptos adicionales
 * ================================================================
 */

// Configurar delegación de eventos para el botón (se ejecuta una sola vez)
$(document).ready(function() {
    // Usar delegación de eventos para que funcione sin importar cuándo se cargue el modal
    $(document).on('click', '#btn-agregar-concepto', function(e) {
        e.preventDefault();
        console.log('Botón agregar concepto clickeado'); // Para debugging
        agregarCampoConceptoAdicional();
    });
    
    // Configurar botón Guardar Detalles
    $(document).on('click', '#btn-guardar-detalles', function(e) {
        e.preventDefault();
        console.log('Guardando detalles del empleado...');
        guardarDetallesEmpleado();
    });
});

function agregarCampoConceptoAdicional(nombre = '', valor = 0) {
    console.log('Agregando campo concepto adicional:', nombre, valor); // Para debugging
    
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
        console.log('Campo agregado correctamente');
    } else {
        // Si no encuentra el contenedor del botón, agregar al final del contenedor
        $contenedor.append(nuevoConcepto);
        console.log('Campo agregado al final del contenedor');
    }
    
    // Configurar eventos para el nuevo concepto
    configurarEventosConceptoAdicional(conceptoIndex);
}

function configurarEventosConceptoAdicional(conceptoIndex) {
    const $concepto = $(`.concepto-adicional[data-concepto-index="${conceptoIndex}"]`);
    
    // Evento para eliminar concepto
    $concepto.find('.btn-eliminar-concepto').on('click', function() {
        const clave = $('#campo-clave').text().trim();
        $concepto.remove();
        // Actualizar JSON después de eliminar
        setTimeout(() => {
            actualizarConceptosAdicionalesEnJsonGlobal(clave);
            calcularTotalExtra(); // Recalcular total cuando se elimine un concepto
        }, 100);
    });
    
    // Eventos para actualizar valores en tiempo real
    $concepto.find('.concepto-nombre, .concepto-valor').on('input', function() {
        const clave = $('#campo-clave').text().trim();
        actualizarConceptosAdicionalesEnJsonGlobal(clave);
        calcularTotalExtra(); // Recalcular total cuando cambien conceptos adicionales
    });
}

function actualizarConceptosAdicionalesEnJsonGlobal(clave) {
    const conceptosAdicionales = [];
    
    // Recopilar todos los conceptos adicionales del modal
    $('.concepto-adicional').each(function() {
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
    
    console.log('Conceptos adicionales actualizados:', conceptosAdicionales);
}

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
 * ================================================================
 * CONCEPTOS
 * ================================================================
 */

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
    });

    $("#mod-imss").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const imss = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '52', imss); // 52 es el código del IMSS
    });

    $("#mod-infonavit").off('input').on('input', function () {
        const clave = $('#campo-clave').text().trim();
        const infonavit = parseFloat($(this).val());
        actualizarConceptoEnJsonGlobal(clave, '16', infonavit); // 16 es el código del INFONAVIT
    });

}

// Función para actualizar conceptos solo en jsonGlobal (sin afectar tabla)
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
 * ================================================================
 * FUNCIÓN PARA GUARDAR DETALLES DEL EMPLEADO
 * ================================================================
 * Esta función guarda todos los cambios realizados en el modal
 * y actualiza la fila correspondiente en la tabla de nómina
 * ================================================================
 */
function guardarDetallesEmpleado() {
    const clave = $('#campo-clave').text().trim();
    
    if (!clave) {
        console.error('No se encontró la clave del empleado');
        return;
    }
    
    console.log('✅ Guardando cambios para empleado:', clave);
    
    // 1. Asegurar que el total extra esté calculado
    calcularTotalExtra();
    
    // 2. Obtener datos actualizados del empleado desde jsonGlobal
    const empleadoActualizado = obtenerEmpleadoActualizado(clave);
    
    if (!empleadoActualizado) {
        console.error('No se encontró el empleado en jsonGlobal');
        return;
    }
    
    // 3. Actualizar la fila de la tabla
    actualizarFilaTabla(clave, empleadoActualizado);
    
    // 4. Cerrar el modal
    $('#modal-detalles').fadeOut();
    
    // 5. Log de confirmación
    console.log('✅ Detalles guardados correctamente para:', empleadoActualizado.nombre);
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
        console.warn('No se encontró la fila en la tabla para la clave:', clave);
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
    $(celdas[5]).text(mostrarValor(sueldoExtra.toFixed(2))); // Extra (ahora usa sueldo_extra_final)
    $(celdas[6]).text(mostrarValor(empleado.neto_pagar)); // Neto a pagar
    $(celdas[7]).text(mostrarValor(empleado.prestamo)); // Préstamo
    $(celdas[8]).text(mostrarValor(empleado.inasistencias_descuento)); // Inasistencias
    $(celdas[9]).text(mostrarValor(empleado.uniformes)); // Uniformes
    $(celdas[10]).text(mostrarValor(infonavit)); // INFONAVIT
    $(celdas[11]).text(mostrarValor(isr)); // ISR
    $(celdas[12]).text(mostrarValor(imss)); // IMSS
    $(celdas[13]).text(mostrarValor(empleado.checador)); // Checador
    $(celdas[14]).text(mostrarValor(empleado.fa_gafet_cofia)); // F.A/GAFET/COFIA
    // La última celda (SUELDO A COBRAR) se mantiene igual
    
    // Agregar efecto visual para indicar que se actualizó
    $fila.addClass('fila-actualizada');
    setTimeout(() => {
        $fila.removeClass('fila-actualizada');
    }, 2000);
    
    console.log('✅ Fila de tabla actualizada para empleado:', empleado.nombre);
}



/*
 * ================================================================
 * REGISTROS
 * ================================================================
 */


function llenarTablaHorariosSemanales(empleado) {
    // ✅ LIMPIAR TABLA SIEMPRE AL INICIO
    const tbody = $('#tab_registros .custom-table tbody');
    const tfoot = $('#tab_registros .custom-table tfoot');
    tbody.empty();
    tfoot.empty();

    // ✅ LIMPIAR TAMBIÉN EVENTOS ESPECIALES
    $('#entradas-tempranas-content').empty();
    $('#salidas-tardias-content').empty();
    $('#olvidos-checador-content').empty();
    $('#total-entradas-tempranas').text('0 min');
    $('#total-salidas-tardias').text('0 min');
    $('#total-olvidos-checador').text('0 eventos');
    $('#tiempo-extra-total').text('0 min');

    // ✅ VERIFICAR SI EL EMPLEADO TIENE DATOS REDONDEADOS
    if (!empleado.tiempo_total_redondeado || !empleado.registros_redondeados || empleado.registros_redondeados.length === 0) {
        console.log('❌ No hay datos redondeados para este empleado:', empleado.nombre);

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

        return; // ✅ SALIR DE LA FUNCIÓN SI NO HAY DATOS
    }

    // ✅ CONTINUAR CON EL CÓDIGO NORMAL SI HAY DATOS
    console.log('✅ Llenando tabla con datos del empleado:', empleado.nombre);

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
                    <td>${datos.entrada || '--'}</td>
                    <td>${datos.salida_comer || '--'}</td>
                    <td>${datos.entrada_comer || '--'}</td>
                    <td>${datos.salida || '--'}</td>
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
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
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

    console.log('✅ Tabla actualizada con datos reales del empleado:', {
        nombre: empleado.nombre,
        totalSemanal: totalHorasSemana,
        totalMinutos: totalMinutosFinal,
        totalComida: totalHorasComida,
        registros: empleado.registros_redondeados.length
    });

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

