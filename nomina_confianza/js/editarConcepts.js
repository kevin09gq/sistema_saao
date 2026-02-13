function actualizarEmpleado(jsonNominaConfianza, claveEmpleado, idEmpresa) {
    // Buscar el empleado por clave
    let empleadoEncontrado = null;
    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            if (String(empleado.clave).trim() === String(claveEmpleado).trim() && 
                String(empleado.id_empresa).trim() === String(idEmpresa).trim()) {
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
    actualizarConcepto("107", parseFloat($('#mod-ajustes-sub').val()) || 0); // Ajuste al Sub

    // Deducciones
    empleadoEncontrado.tarjeta = parseFloat($('#mod-tarjeta').val()) || 0;
    empleadoEncontrado.prestamo = parseFloat($('#mod-prestamo').val()) || 0;
    empleadoEncontrado.uniformes = parseFloat($('#mod-uniformes').val()) || 0;
    empleadoEncontrado.checador = parseFloat($('#mod-checador').val()) || 0;
    empleadoEncontrado.retardos = parseFloat($('#mod-retardos').val()) || 0;
    empleadoEncontrado.inasistencia = parseFloat($('#mod-inasistencias').val()) || 0;
    empleadoEncontrado.permiso = parseFloat($('#mod-permiso').val()) || 0;
    empleadoEncontrado.fa_gafet_cofia = parseFloat($('#mod-fa-gafet-cofia').val()) || 0;

    // Guardar preferencias de redondeo
    empleadoEncontrado.redondeo_activo = $('#mod-redondear-sueldo').is(':checked');

    // HISTORIAS DE DEDUCCIONES 
    
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

    // Actualizar el array completo (incluso si está vacío)
    empleadoEncontrado.historial_retardos = nuevosHistorial;

    // Actualizar historial de inasistencias desde el DOM - PRESERVAR INASISTENCIAS MANUALES
    if (!empleadoEncontrado.historial_inasistencias) {
        empleadoEncontrado.historial_inasistencias = [];
    }
    
    // PRESERVAR las inasistencias manuales existentes
    const inasistenciasManuales = empleadoEncontrado.historial_inasistencias.filter(
        inasistencia => inasistencia && inasistencia.tipo === 'manual'
    );
    
    // Solo leer las inasistencias automáticas desde el DOM
    const nuevosHistorialInasistencias = [];
    $('#contenedor-historial-inasistencias .historial-inasistencia-item').each(function() {
        const $item = $(this);
        const index = parseInt($item.data('index'));
        
        const historialItem = {
            dia: $item.find('.historial-inasistencia-dia').val(),
            fecha: '',
            descuento_inasistencia: parseFloat($item.find('.historial-inasistencia-descuento').val()) || 0,
            tipo: 'automatico' // Marcar como automático para distinguir
        };
        
        nuevosHistorialInasistencias.push(historialItem);
    });
    
    // Combinar inasistencias manuales con las nuevas automáticas
    empleadoEncontrado.historial_inasistencias = [
        ...inasistenciasManuales,  // Mantener las manuales
        ...nuevosHistorialInasistencias  // Agregar las nuevas automáticas
    ];

    // Actualizar historial de olvidos desde el DOM
    if (!empleadoEncontrado.historial_olvidos) {
        empleadoEncontrado.historial_olvidos = [];
    }
    
    const nuevosHistorialOlvidos = [];
    $('#contenedor-historial-olvidos .historial-olvido-item').each(function() {
        const $item = $(this);
        const index = parseInt($item.data('index'));
        
        const historialItem = {
            dia: $item.find('.historial-olvido-dia').val(),
            fecha: $item.find('.historial-olvido-fecha').val(),
            descuento_olvido: parseFloat($item.find('.historial-olvido-descuento').val()) || 0
        };
        
        nuevosHistorialOlvidos.push(historialItem);
    });
    
    // Actualizar el array completo solo si hay elementos en el DOM
    if (nuevosHistorialOlvidos.length > 0) {
        empleadoEncontrado.historial_olvidos = nuevosHistorialOlvidos;
    }

    // Actualizar historial de uniformes desde el DOM
    if (!empleadoEncontrado.historial_uniformes) {
        empleadoEncontrado.historial_uniformes = [];
    }
    
    const nuevosHistorialUniformes = [];
    $('#contenedor-historial-uniformes .historial-uniforme-item').each(function() {
        const $item = $(this);
        const index = parseInt($item.data('index'));
        
        const historialItem = {
            folio: $item.find('.historial-uniforme-folio').val(),
            cantidad: parseFloat($item.find('.historial-uniforme-cantidad').val()) || 0
        };
        
        nuevosHistorialUniformes.push(historialItem);
    });
    
    // Actualizar el array completo solo si hay elementos en el DOM
    if (nuevosHistorialUniformes.length > 0) {
        empleadoEncontrado.historial_uniformes = nuevosHistorialUniformes;
    }

    // Actualizar historial de permisos desde el DOM
    if (!empleadoEncontrado.historial_permisos) {
        empleadoEncontrado.historial_permisos = [];
    }
    
    const nuevosHistorialPermisos = [];
    $('#contenedor-historial-permisos .historial-permiso-item').each(function() {
        const $item = $(this);
        const index = parseInt($item.data('index'));
        
        // Leer los campos actualizados: minutos, costo, descuento
        const minutos = parseFloat($item.find('.historial-permiso-minutos').val()) || 0;
        const costo = parseFloat($item.find('.historial-permiso-costo').val()) || 0;
        const descuento = parseFloat($item.find('.historial-permiso-descuento').val()) || 0;
        
        const historialItem = {
            descripcion: $item.find('.historial-permiso-descripcion').val(),
            horas_minutos: minutos,
            cantidad: costo, // costo_por_minuto
            descuento: descuento
        };
        
        nuevosHistorialPermisos.push(historialItem);
    });
    
    // Actualizar el array completo solo si hay elementos en el DOM
    if (nuevosHistorialPermisos.length > 0) {
        empleadoEncontrado.historial_permisos = nuevosHistorialPermisos;
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

  
}

function guardarCambiosEmpleado() {
    $('#btn-guardar-conceptos').on('click', function () {
        const claveEmpleado = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        
        // Actualizar datos del empleado
        actualizarEmpleado(jsonNominaConfianza, claveEmpleado, idEmpresa);        
        // Actualizar horario oficial si fue modificado
        actualizarHorarioOficial(claveEmpleado, idEmpresa);
        // Detectar retardos usando la función en config_modal_concepts.js
        if (typeof detectarRetardos === 'function') {
            detectarRetardos(claveEmpleado, idEmpresa);
        }
        if (typeof detectarInasistencias === 'function') {
            detectarInasistencias(claveEmpleado, idEmpresa);
        }
        if (typeof detectarOlvidosChecador === 'function') {
            detectarOlvidosChecador(claveEmpleado, idEmpresa);
        }
       
        // Guardar en localStorage para que otros módulos tengan datos actualizados
        if (typeof saveNomina === 'function') {
            saveNomina(jsonNominaConfianza);
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
function actualizarHorarioOficial(claveEmpleado, idEmpresa) {
    // Buscar el empleado por clave
    let empleadoEncontrado = null;
    
    jsonNominaConfianza.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            if (String(empleado.clave).trim() === String(claveEmpleado).trim() && 
                String(empleado.id_empresa).trim() === String(idEmpresa).trim()) {
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
        
        // Leer el valor del SELECT (no el texto)
        const dia = $fila.find('select.select-dia').val() || '';
        
        // Leer el resto de campos como antes
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
    
    // GUARDAR TIPOS DE DÍA (vacaciones, descanso, enfermedad, festivo)
    // Leer los tipos_dia del objeto empleado (ya están guardados por el handler en establecer_data.js)
    // No es necesario leerlos de la tabla porque se guardan directamente en el objeto
    
    // PRESERVAR INASISTENCIAS MANUALES antes de limpiar
    let inasistenciasManuales = [];
    if (Array.isArray(empleadoEncontrado.historial_inasistencias)) {
        inasistenciasManuales = empleadoEncontrado.historial_inasistencias.filter(
            inasistencia => inasistencia && inasistencia.tipo === 'manual'
        );
        
        // Preservar los descuentos editados manualmente
        const descuentosPrevios = {};
        empleadoEncontrado.historial_inasistencias.forEach(inasistencia => {
            if (inasistencia && inasistencia.dia) {
                descuentosPrevios[inasistencia.dia.toUpperCase()] = parseFloat(inasistencia.descuento_inasistencia) || 0;
            }
        });
        
        // Guardar los descuentos previos para que detectarInasistencias los use
        empleadoEncontrado._descuentos_inasistencias_previos = descuentosPrevios;
    }
    
    // Limpiar historial de inasistencias pero mantener las manuales
    empleadoEncontrado.historial_inasistencias = [...inasistenciasManuales];
    
}

function configPaginacionSelect() {
    // Reaplicar el filtro actual manualmente para NO resetear la página
    const valorDepartamento = String($('#filtro-departamento').val() || '0');
    const valorEmpresa = String($('#filtro-empresa').val() || '0');

    // Si ambos están en "Todos", mostrar la tabla completa en la página actual
    if (valorDepartamento === '0' && valorEmpresa === '0') {
        if (typeof mostrarDatosTabla === 'function') mostrarDatosTabla(jsonNominaConfianza, paginaActualNomina);
        return;
    }

    let empleadosFiltrados = [];

    // Paso 1: Filtrar por departamento
    if (valorDepartamento === '0') {
        // Todos los departamentos
        jsonNominaConfianza.departamentos.forEach(depto => {
            if (Array.isArray(depto.empleados)) empleadosFiltrados = empleadosFiltrados.concat(depto.empleados);
        });
    } else if (valorDepartamento === 'sin_seguro') {
        const deptoSinSeguro = jsonNominaConfianza.departamentos.find(
            d => String(d.nombre || '').toLowerCase().trim() === 'sin seguro'
        );
        if (deptoSinSeguro && Array.isArray(deptoSinSeguro.empleados)) empleadosFiltrados = deptoSinSeguro.empleados.slice();
    } else {
        const idDepartamento = Number(valorDepartamento);
        jsonNominaConfianza.departamentos.forEach(depto => {
            if (!Array.isArray(depto.empleados)) return;
            depto.empleados.forEach(emp => {
                if (Number(emp.id_departamento) === idDepartamento) empleadosFiltrados.push(emp);
            });
        });
    }

    // Paso 2: Filtrar por empresa (si aplica)
    if (valorEmpresa !== '0') {
        const idEmpresa = Number(valorEmpresa);
        empleadosFiltrados = empleadosFiltrados.filter(emp => Number(emp.id_empresa) === idEmpresa);
    }

    if (typeof mostrarDatosTabla === 'function') mostrarDatosTabla({ departamentos: [{ nombre: 'Filtro', empleados: empleadosFiltrados }] }, paginaActualNomina);
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

