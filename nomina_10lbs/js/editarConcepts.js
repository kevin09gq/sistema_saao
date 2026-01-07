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

    // Actualizar historial de retardos desde el DOM
    if (!empleadoEncontrado.historial_retardos) {
        empleadoEncontrado.historial_retardos = [];
    }
    
    const nuevosHistorial = [];
    $('#contenedor-historial-retardos .historial-retardo-item').each(function() {
        const $item = $(this);
        const index = parseInt($item.data('index'));
        
        const historialItem = {
            fecha: $item.find('.historial-fecha').val(),
            dia: $item.find('.historial-dia').val(),
            minutos_retardo: parseFloat($item.find('.historial-minutos').val()) || 0,
            tolerancia: parseFloat($item.find('.historial-tolerancia').val()) || 0,
            descuento_por_minuto: parseFloat($item.find('.historial-descuento-min').val()) || 0,
            total_descontado: parseFloat($item.find('.historial-total').val()) || 0
        };
        
        nuevosHistorial.push(historialItem);
    });
    
    // Actualizar el array completo solo si hay elementos en el DOM
    if (nuevosHistorial.length > 0) {
        empleadoEncontrado.historial_retardos = nuevosHistorial;
    }


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
        
        // Actualizar datos del empleado
        actualizarEmpleado(jsonNominaConfianza, claveEmpleado);        
        // Actualizar horario oficial si fue modificado
        actualizarHorarioOficial(claveEmpleado);
        // Detectar retardos usando la función en config_modal_concepts.js
        if (typeof detectarRetardos === 'function') {
            detectarRetardos(claveEmpleado);
        }
        if (typeof detectarInasistencias === 'function') {
            detectarInasistencias(claveEmpleado);
        }
        if (typeof detectarOlvidosChecador === 'function') {
            detectarOlvidosChecador(claveEmpleado);
        }
        if (typeof detectarPermisos === 'function') {
            detectarPermisos(claveEmpleado);
        }
       
        // Cerrar el modal después de guardar
        $('#modal-detalles').hide();
        limpiarModalDetalles();

        configPaginacionSearch(); // Reaplicar búsqueda o filtro sin resetear paginación
    });
}


// Activar la actualización automática cuando cambien los valores
function activarActualizacionTotalExtra() {
    // Escuchar cambios en vacaciones
    $('#mod-vacaciones').on('input', actualizarTotalExtra);
    
    // Escuchar cambios en conceptos personalizados (delegación de eventos)
    $('#contenedor-conceptos-adicionales').on('input', '.concepto-personalizado input[type="number"]', actualizarTotalExtra);
}

// ========================================
// ACTUALIZAR HORARIO OFICIAL DEL EMPLEADO
// ========================================
function actualizarHorarioOficial(claveEmpleado) {
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
        alert('Error: Empleado no encontrado');
        return;
    }
    
    // Leer todas las filas de la tabla de horarios oficiales
    const nuevoHorario = [];
    $('#horarios-oficiales-body tr').each(function() {
        const $fila = $(this);
        const dia = $fila.find('td').eq(0).text().trim();
        const entrada = $fila.find('td').eq(1).text().trim();
        const salidaComida = $fila.find('td').eq(2).text().trim();
        const entradaComida = $fila.find('td').eq(3).text().trim();
        const salida = $fila.find('td').eq(4).text().trim();
        
        nuevoHorario.push({
            dia: dia,
            entrada: entrada !== '-' ? entrada : '',
            salida_comida: salidaComida !== '-' ? salidaComida : '',
            entrada_comida: entradaComida !== '-' ? entradaComida : '',
            salida: salida !== '-' ? salida : ''
        });
    });
    
    // Actualizar la propiedad horario_oficial del empleado
    empleadoEncontrado.horario_oficial = nuevoHorario;
    
    console.log('Horario actualizado:', empleadoEncontrado.horario_oficial);
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

