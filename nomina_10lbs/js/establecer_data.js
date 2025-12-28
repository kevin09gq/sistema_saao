function cargarData(jsonNominaConfianza, clave) {
    // Buscar el empleado por clave en todos los departamentos
    let empleadoEncontrado = null;
    
  
    
    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            // Comparar convirtiendo ambos a string y eliminando espacios
            if (String(empleado.clave).trim() === String(clave).trim()) {
                empleadoEncontrado = empleado;
               
            }
        });
    });
    
    // Si se encontró el empleado, establecer sus datos en el modal
    if (empleadoEncontrado) {
        $('#campo-nombre').text(empleadoEncontrado.nombre);
        $('#campo-clave').text(empleadoEncontrado.clave);
        $("#nombre-empleado-modal").text(empleadoEncontrado.nombre);

        // Percepciones
        $('#mod-sueldo-semanal').val(empleadoEncontrado.sueldo_semanal || '');
        $('#mod-vacaciones').val(empleadoEncontrado.vacaciones || '');
        $('#mod-total-extra').val(empleadoEncontrado.sueldo_extra_total || '');

        // Concepto
        const conceptos = empleadoEncontrado.conceptos || [];
        const conceptoISR = conceptos.find(c => c.codigo === "45");
        const conceptoIMSS = conceptos.find(c => c.codigo === "52");
        const conceptoInfonavit = conceptos.find(c => c.codigo === "16");

        $('#mod-isr').val(conceptoISR ? conceptoISR.resultado : '');
        $('#mod-imss').val(conceptoIMSS ? conceptoIMSS.resultado : '');
        $('#mod-infonavit').val(conceptoInfonavit ? conceptoInfonavit.resultado : '');


        // Deducciones
        $('#mod-tarjeta').val(empleadoEncontrado.tarjeta || '');
        $('#mod-prestamo').val(empleadoEncontrado.prestamo || '');
        $('#mod-uniformes').val(empleadoEncontrado.uniformes || '');
        $('#mod-checador').val(empleadoEncontrado.checador || '');
        $('#mod-retardos').val(empleadoEncontrado.retardos || '');
        $('#mod-inasistencias').val(empleadoEncontrado.inasistencia || '');
        $('#mod-permiso').val(empleadoEncontrado.permiso || '');

        // Mostrar registros en la tabla
        mostrarRegistrosChecador(empleadoEncontrado);

        // Mostrar conceptos personalizados en extras_adicionales
        const $contenedorExtras = $('#contenedor-conceptos-adicionales');
        $contenedorExtras.empty(); // Limpiar el contenedor

        if (empleadoEncontrado.extras_adicionales && empleadoEncontrado.extras_adicionales.length > 0) {
            empleadoEncontrado.extras_adicionales.forEach((concepto, index) => {
                const conceptoHTML = `
                    <div class="col-md-6 mb-3 concepto-personalizado">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold">Concepto ${index + 1}</span>
                            <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-concepto">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <div class="mt-2">
                            <input type="text" class="form-control mb-2" value="${concepto.nombre}" placeholder="Nombre del concepto">
                            <input type="number" step="0.01" class="form-control" value="${concepto.resultado}" placeholder="0">
                        </div>
                    </div>
                `;
                $contenedorExtras.append(conceptoHTML);
            });
        }

        // Mostrar deducciones personalizadas en deducciones_adicionales
        const $contenedorDeducciones = $('#contenedor-deducciones-adicionales');
        $contenedorDeducciones.empty(); // Limpiar el contenedor

        if (empleadoEncontrado.deducciones_adicionales && empleadoEncontrado.deducciones_adicionales.length > 0) {
            empleadoEncontrado.deducciones_adicionales.forEach((deduccion, index) => {
                const deduccionHTML = `
                    <div class="col-md-6 mb-3 deduccion-personalizada">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-semibold">Deducción ${index + 1}</span>
                            <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-deduccion">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                        <div class="mt-2">
                            <input type="text" class="form-control mb-2" value="${deduccion.nombre}" placeholder="Nombre de la deducción">
                            <input type="number" step="0.01" class="form-control" value="${deduccion.resultado}" placeholder="0">
                        </div>
                    </div>
                `;
                $contenedorDeducciones.append(deduccionHTML);
            });
        }
    } else {
       
    }
}

function mostrarRegistrosChecador(empleado) {
    const $tbody = $('#tabla-checador tbody');
    $tbody.empty(); // Limpiar la tabla
    
    // Verificar si el empleado tiene registros
    if (!empleado.registros || empleado.registros.length === 0) {
        $tbody.append('<tr><td colspan="4" class="text-center">No hay registros disponibles</td></tr>');
        return;
    }
    
    // Recorrer los registros y agregarlos a la tabla
    empleado.registros.forEach(registro => {
        // Obtener el nombre del día a partir de la fecha
        const nombreDia = obtenerNombreDia(registro.fecha);
        
        const fila = `
            <tr>
                <td>${nombreDia}</td>
                <td>${registro.fecha || '-'}</td>
                <td>${registro.entrada || '-'}</td>
                <td>${registro.salida || '-'}</td>
            </tr>
        `;
        $tbody.append(fila);
    });
}

// Función simple para obtener el nombre del día de la semana
function obtenerNombreDia(fecha) {
    if (!fecha) return '-';
    
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    // Convertir formato DD/MM/YYYY a YYYY-MM-DD para que Date lo entienda
    let fechaParseada;
    if (fecha.includes('/')) {
        const partes = fecha.split('/');
        // partes[0] = día, partes[1] = mes, partes[2] = año
        fechaParseada = new Date(partes[2], partes[1] - 1, partes[0]);
    } else {
        fechaParseada = new Date(fecha);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(fechaParseada.getTime())) {
        return '-';
    }
    
    return dias[fechaParseada.getDay()];
}
