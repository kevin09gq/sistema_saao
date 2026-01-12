// Cargar los datos del empleado en el modal
function cargarData(jsonNominaConfianza, clave) {
    alternarTablas();
   
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

        //Total a cobrar
        $('#mod-sueldo-a-cobrar').val(empleadoEncontrado.total_cobrar || '');

        // Mostrar registros en la tabla
        mostrarRegistrosChecador(empleadoEncontrado);
        
        // Mostrar horarios oficiales en la tabla
        mostrarRegistrosBD(empleadoEncontrado);

        // Hacer horas editables a la tabla de horarios oficiales
        hacerHorasEditables();

        // Detectar eventos antes de mostrarlos (para generar historiales si es necesario)
        if (typeof detectarRetardos === 'function') detectarRetardos(empleadoEncontrado.clave);
        if (typeof detectarInasistencias === 'function') detectarInasistencias(empleadoEncontrado.clave);
        if (typeof detectarOlvidosChecador === 'function') detectarOlvidosChecador(empleadoEncontrado.clave);
        if (typeof detectarEntradasTempranas === 'function') detectarEntradasTempranas(empleadoEncontrado.clave);
        if (typeof detectarSalidasTardias === 'function') detectarSalidasTardias(empleadoEncontrado.clave);
        if (typeof detectarSalidasTempranas === 'function') detectarSalidasTempranas(empleadoEncontrado.clave);

        // Mostrar eventos especiales
        if (typeof mostrarEntradasTempranas === 'function') mostrarEntradasTempranas(empleadoEncontrado);
        if (typeof mostrarSalidasTardias === 'function') mostrarSalidasTardias(empleadoEncontrado);
        if (typeof mostrarSalidasTempranas === 'function') mostrarSalidasTempranas(empleadoEncontrado);
        if (typeof mostrarOlvidosChecador === 'function') mostrarOlvidosChecador(empleadoEncontrado);
        if (typeof mostrarRetardos === 'function') mostrarRetardos(empleadoEncontrado);
        if (typeof mostrarInasistencias === 'function') mostrarInasistencias(empleadoEncontrado);
        if (typeof mostrarHistorialRetardos === 'function') mostrarHistorialRetardos(empleadoEncontrado);
        if (typeof mostrarHistorialInasistencias === 'function') mostrarHistorialInasistencias(empleadoEncontrado);
        if (typeof mostrarHistorialOlvidos === 'function') mostrarHistorialOlvidos(empleadoEncontrado);
        if (typeof mostrarHistorialUniformes === 'function') mostrarHistorialUniformes(empleadoEncontrado);
        if (typeof mostrarHistorialPermisos === 'function') mostrarHistorialPermisos(empleadoEncontrado);

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

        // Calcular y mostrar el sueldo a cobrar inicial con los valores del modal
        if (typeof calcularYMostrarSueldoACobrar === 'function') {
            calcularYMostrarSueldoACobrar();
        }
    } else {
       
    }
}

// Función para mostrar registros en la tabla de checador
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

// Función para mostrar registros desde la base de datos
function mostrarRegistrosBD(empleado) {
    const $tbody = $('#horarios-oficiales-body');
    $tbody.empty(); // Limpiar la tabla
    
    // Lista de días de la semana
    const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    
    // Si tiene horario oficial, usar esos datos
    if (empleado.horario_oficial && Array.isArray(empleado.horario_oficial) && empleado.horario_oficial.length > 0) {
        empleado.horario_oficial.forEach(dia => {
            // Crear opciones del select
            let opcionesSelect = `<option value="">- Seleccionar día -</option>`;
            opcionesSelect += diasSemana.map(nombreDia => {
                const seleccionado = dia.dia === nombreDia ? 'selected' : '';
                return `<option value="${nombreDia}" ${seleccionado}>${nombreDia}</option>`;
            }).join('');
            
            // Crear fila con select en la primera columna
            const fila = `
                <tr>
                    <td>
                        <select class="form-control form-control-sm select-dia">
                            ${opcionesSelect}
                        </select>
                    </td>
                    <td>${dia.entrada || '-'}</td>
                    <td>${dia.salida_comida || '-'}</td>
                    <td>${dia.entrada_comida || '-'}</td>
                    <td>${dia.salida || '-'}</td>
                </tr>
            `;
            $tbody.append(fila);
        });
    } else {
        // Si NO hay horario oficial, mostrar tabla vacía con los 7 días
        diasSemana.forEach(nombreDia => {
            let opcionesSelect = '<option value="">- Seleccionar día -</option>';
            opcionesSelect += diasSemana.map(dia => {
                return `<option value="${dia}">${dia}</option>`;
            }).join('');
            
            const fila = `
                <tr>
                    <td>
                        <select class="form-control form-control-sm select-dia">
                            ${opcionesSelect}
                        </select>
                    </td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
            `;
            $tbody.append(fila);
        });
    }
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

