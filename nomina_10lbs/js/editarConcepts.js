function actualizarEmpleado(jsonNominaConfianza, claveEmpleado) {
    // Buscar el empleado por clave
    let empleadoEncontrado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            if (String(empleado.clave).trim() === String(claveEmpleado).trim()) {
                empleadoEncontrado = empleado;
            }
        });
    });

    if (!empleadoEncontrado) {
      
        return;
    }

    // Actualizar las propiedades del empleado con los valores del modal
    // Percepciones
    empleadoEncontrado.sueldo_semanal = parseFloat($('#mod-sueldo-semanal').val()) || 0;
    empleadoEncontrado.sueldo_extra_total = parseFloat($('#mod-total-extra').val()) || 0;

    empleadoEncontrado.vacaciones = parseFloat($('#mod-vacaciones').val()) || 0;

    // Conceptos específicos
    const conceptos = empleadoEncontrado.conceptos || [];

    const actualizarConcepto = (codigo, nuevoResultado) => {
        const concepto = conceptos.find(c => c.codigo === codigo);
        if (concepto) {
            concepto.resultado = nuevoResultado;
        } else {
            conceptos.push({ codigo, resultado: nuevoResultado });
        }
    };

    actualizarConcepto("45", parseFloat($('#mod-isr').val()) || 0); // ISR
    actualizarConcepto("52", parseFloat($('#mod-imss').val()) || 0); // IMSS
    actualizarConcepto("16", parseFloat($('#mod-infonavit').val()) || 0); // Infonavit

    // Deducciones
    empleadoEncontrado.tarjeta = parseFloat($('#mod-tarjeta').val()) || 0;
    empleadoEncontrado.prestamo = parseFloat($('#mod-prestamo').val()) || 0;
    empleadoEncontrado.uniformes = parseFloat($('#mod-uniformes').val()) || 0;
    empleadoEncontrado.checador = parseFloat($('#mod-checador').val()) || 0;
    empleadoEncontrado.retardos = parseFloat($('#mod-retardos').val()) || 0;
    empleadoEncontrado.inasistencia = parseFloat($('#mod-inasistencias').val()) || 0;
    empleadoEncontrado.permiso = parseFloat($('#mod-permiso').val()) || 0;

    // Guardar conceptos personalizados en extras_adicionales
    if (!empleadoEncontrado.extras_adicionales) {
        empleadoEncontrado.extras_adicionales = [];
    }

    $('#contenedor-conceptos-adicionales .concepto-personalizado').each(function (index) {
        const nombreConcepto = $(this).find('input[type="text"]').val().trim();
        const valorConcepto = parseFloat($(this).find('input[type="number"]').val()) || 0;

        if (nombreConcepto) {
            // Buscar el concepto existente por índice o id único
            let conceptoExistente = empleadoEncontrado.extras_adicionales[index];

            if (conceptoExistente) {
                // Actualizar el concepto existente
                conceptoExistente.nombre = nombreConcepto; // Actualizar el nombre
                conceptoExistente.resultado = valorConcepto; // Actualizar el valor
            } else {
                // Agregar un nuevo concepto si no existe
                empleadoEncontrado.extras_adicionales.push({ nombre: nombreConcepto, resultado: valorConcepto });
            }
        }
    });

    // Guardar deducciones personalizadas en deducciones_adicionales
    if (!empleadoEncontrado.deducciones_adicionales) {
        empleadoEncontrado.deducciones_adicionales = [];
    }

    $('#contenedor-deducciones-adicionales .deduccion-personalizada').each(function (index) {
        const nombreDeduccion = $(this).find('input[type="text"]').val().trim();
        const valorDeduccion = parseFloat($(this).find('input[type="number"]').val()) || 0;

        if (nombreDeduccion) {
            // Buscar la deducción existente por índice
            let deduccionExistente = empleadoEncontrado.deducciones_adicionales[index];

            if (deduccionExistente) {
                // Actualizar la deducción existente
                deduccionExistente.nombre = nombreDeduccion;
                deduccionExistente.resultado = valorDeduccion;
            } else {
                // Agregar una nueva deducción si no existe
                empleadoEncontrado.deducciones_adicionales.push({ nombre: nombreDeduccion, resultado: valorDeduccion });
            }
        }
    });

    console.log('Empleado actualizado:', empleadoEncontrado);
}

function guardarCambiosEmpleado() {
    $('#btn-guardar-conceptos').on('click', function () {
        const claveEmpleado = $('#campo-clave').text().trim();
        actualizarEmpleado(jsonNominaConfianza, claveEmpleado);
        // Cerrar el modal después de guardar
        $('#modal-detalles').hide();
        limpiarModalDetalles();

        configPaginacionSearch(); // Reaplicar búsqueda o filtro sin resetear paginación
    });
}

// Función simple para actualizar automáticamente el Total Extra
function actualizarTotalExtra() {
    let total = 0;
    
    // Sumar vacaciones
    total += parseFloat($('#mod-vacaciones').val()) || 0;
    
    // Sumar todos los conceptos personalizados (solo los valores numéricos)
    $('#contenedor-conceptos-adicionales .concepto-personalizado input[type="number"]').each(function() {
        total += parseFloat($(this).val()) || 0;
    });
    
    // Actualizar el campo total con 2 decimales
    $('#mod-total-extra').val(total.toFixed(2));
}

// Activar la actualización automática cuando cambien los valores
function activarActualizacionTotalExtra() {
    // Escuchar cambios en vacaciones
    $('#mod-vacaciones').on('input', actualizarTotalExtra);
    
    // Escuchar cambios en conceptos personalizados (delegación de eventos)
    $('#contenedor-conceptos-adicionales').on('input', '.concepto-personalizado input[type="number"]', actualizarTotalExtra);
}



function configPaginacionSelect() {    
        // Reaplicar el filtro actual manualmente para NO resetear la página
        var filtro = $('#filtro-departamento').length ? String($('#filtro-departamento').val()) : '0';
        if (filtro === '0') {
            if (typeof mostrarDatosTabla === 'function') mostrarDatosTabla(jsonNominaConfianza, paginaActualNomina);
        } else if (filtro === 'sin_seguro') {
            const deptoSinSeguro = jsonNominaConfianza.departamentos.find(d => String(d.nombre || '').toLowerCase().trim() === 'sin seguro');
            const empleadosFiltrados = Array.isArray(deptoSinSeguro && deptoSinSeguro.empleados) ? deptoSinSeguro.empleados.slice() : [];
            if (typeof mostrarDatosTabla === 'function') mostrarDatosTabla({ departamentos: [{ nombre: 'sin seguro', empleados: empleadosFiltrados }] }, paginaActualNomina);
        } else {
            const idSeleccionado = Number(filtro);
            const empleadosFiltrados = [];
            jsonNominaConfianza.departamentos.forEach(depto => {
                if (!Array.isArray(depto.empleados)) return;
                depto.empleados.forEach(emp => {
                    if (Number(emp.id_departamento) === idSeleccionado) empleadosFiltrados.push(emp);
                });
            });
            if (typeof mostrarDatosTabla === 'function') mostrarDatosTabla({ departamentos: [{ nombre: 'Filtro', empleados: empleadosFiltrados }] }, paginaActualNomina);
        }
}

function configPaginacionSearch(){
    // Verificar si hay una búsqueda activa
        const busquedaActual = $('#busqueda-nomina-confianza').val() || '';
        
        if (busquedaActual.trim() !== '') {
            // Si hay búsqueda activa, reaplicar la búsqueda
            $('#busqueda-nomina-confianza').trigger('input');
        } else {
            // Reaplicar filtro de departamento sin resetear paginación
            configPaginacionSelect();
        }
}

