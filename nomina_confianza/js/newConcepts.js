function nuevosConceptosPercepcciones(){
 $('#btn-agregar-concepto').on('click', function() {
        // Crear un nuevo elemento de concepto con diseño que ocupe la mitad de una fila
        const nuevoConcepto = `
            <div class="col-md-6 mb-3 concepto-personalizado">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-semibold">Concepto Personalizado</span>
                    <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-concepto">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="mt-2">
                    <input type="text" class="form-control mb-2" placeholder="Nombre del concepto">
                    <input type="number" step="0.01" class="form-control" value="0" placeholder="0">
                </div>
            </div>
        `;

        // Agregar el nuevo concepto al contenedor correcto
        $('#contenedor-conceptos-adicionales').append(nuevoConcepto);
    });

    // Delegar evento para eliminar conceptos dinámicos (usa función sencilla)
    $('#contenedor-conceptos-adicionales').on('click', '.btn-eliminar-concepto', function() {
        eliminarConceptoPersonalizado($(this).closest('.concepto-personalizado'));
    });

    // Agregar funcionalidad para deducciones adicionales
    $('#btn-agregar-deduccion').on('click', function() {
        const nuevaDeduccion = `
            <div class="col-md-6 mb-3 deduccion-personalizada">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-semibold">Deducción Personalizada</span>
                    <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-deduccion">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="mt-2">
                    <input type="text" class="form-control mb-2" placeholder="Nombre de la deducción">
                    <input type="number" step="0.01" class="form-control" value="0" placeholder="0">
                </div>
            </div>
        `;

        // Agregar la nueva deducción al contenedor correcto
        $('#contenedor-deducciones-adicionales').append(nuevaDeduccion);
    });

    // Delegar evento para eliminar deducciones dinámicas (usa función sencilla)
    $('#contenedor-deducciones-adicionales').on('click', '.btn-eliminar-deduccion', function() {
        eliminarDeduccionPersonalizada($(this).closest('.deduccion-personalizada'));
    });
}

// Función simple para eliminar un concepto personalizado (percepciones)
function eliminarConceptoPersonalizado($elemento) {
    if (!$elemento || $elemento.length === 0) return;
    // Eliminación simple y clara:
    // 1) quitar del DOM
    // 2) recalcular total
    // 3) borrar del JSON del empleado abierto (si existe)
    var nombre = String($elemento.find('input[type="text"]').val() || '').trim();
    var valor = parseFloat($elemento.find('input[type="number"]').val()) || 0;
    $elemento.remove();
    if (typeof actualizarTotalExtra === 'function') actualizarTotalExtra();
    
    // Recalcular el sueldo a cobrar después de eliminar
    if (typeof calcularYMostrarSueldoACobrar === 'function') calcularYMostrarSueldoACobrar();

    // Borrar del jsonNominaConfianza del empleado que está en el modal
    try {
        var clave = String($('#campo-clave').text() || '').trim();
        var idEmpresa = String($('#campo-id-empresa').val() || '').trim();
        if (!clave || !idEmpresa || typeof jsonNominaConfianza === 'undefined' || !jsonNominaConfianza) return;
        var deps = jsonNominaConfianza.departamentos || [];
        for (var i = 0; i < deps.length; i++) {
            var dept = deps[i];
            var emps = dept.empleados || [];
            for (var j = 0; j < emps.length; j++) {
                var emp = emps[j];
                if (String(emp.clave).trim() === clave && String(emp.id_empresa).trim() === idEmpresa) {
                    emp.extras_adicionales = (emp.extras_adicionales || []).filter(function(item) {
                        return !(String(item.nombre || '').trim() === nombre && (parseFloat(item.resultado) || 0) === valor);
                    });
                    if (typeof saveNomina === 'function') saveNomina(jsonNominaConfianza);
                    return;
                }
            }
        }
    } catch (err) {
        // ignore
    }
}

// Función simple para eliminar una deducción personalizada
function eliminarDeduccionPersonalizada($elemento) {
    if (!$elemento || $elemento.length === 0) return;
    var nombre = String($elemento.find('input[type="text"]').val() || '').trim();
    var valor = parseFloat($elemento.find('input[type="number"]').val()) || 0;
    $elemento.remove();
    
    // Recalcular el sueldo a cobrar después de eliminar
    if (typeof calcularYMostrarSueldoACobrar === 'function') calcularYMostrarSueldoACobrar();
    
    try {
        var clave = String($('#campo-clave').text() || '').trim();
        var idEmpresa = String($('#campo-id-empresa').val() || '').trim();
        if (!clave || !idEmpresa || typeof jsonNominaConfianza === 'undefined' || !jsonNominaConfianza) return;
        var deps = jsonNominaConfianza.departamentos || [];
        for (var i = 0; i < deps.length; i++) {
            var dept = deps[i];
            var emps = dept.empleados || [];
            for (var j = 0; j < emps.length; j++) {
                var emp = emps[j];
                if (String(emp.clave).trim() === clave && String(emp.id_empresa).trim() === idEmpresa) {
                    emp.deducciones_adicionales = (emp.deducciones_adicionales || []).filter(function(item) {
                        return !(String(item.nombre || '').trim() === nombre && (parseFloat(item.resultado) || 0) === valor);
                    });
                    if (typeof saveNomina === 'function') saveNomina(jsonNominaConfianza);
                    return;
                }
            }
        }
    } catch (err) {
        // ignore
    }
}

