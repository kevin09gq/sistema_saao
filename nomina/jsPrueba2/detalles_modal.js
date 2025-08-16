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
    establecerDatosTrabajador(empleadoEncontrado.clave, empleadoEncontrado.nombre);
    establecerDatosConceptos(empleadoEncontrado.conceptos || []);

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




