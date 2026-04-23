/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - NÓMINA HUASTECA
 * ================================================================
 * Maneja la selección manual de empleados para generar tickets PDF
 * ================================================================
 */

// Variables globales para el modal de selección
let empleadosParaTickets = [];
let empleadosSeleccionados = new Set();

// Inicializar eventos cuando el DOM esté listo
$(document).ready(function() {
    // Evento para abrir modal de selección de empleados
    $('#btn_ticket_seleccion').on('click', function() {
        // PRIORIZAR la variable global que ya está en memoria y actualizada
        // Intentar obtenerla directamente (no desde window ya que let no se adjunta a window)
        let nominaData = null;
        try {
            if (typeof jsonNominaHuasteca !== 'undefined' && jsonNominaHuasteca) {
                nominaData = jsonNominaHuasteca;
            }
        } catch (e) {
            console.log("jsonNominaHuasteca no definida globalmente todavía");
        }
        
        // Si por alguna razón no está en memoria, intentar cargar de localStorage
        if (!nominaData || !nominaData.departamentos) {
            nominaData = JSON.parse(localStorage.getItem('jsonNominaHuasteca') || '{}');
            if (nominaData && nominaData.departamentos && typeof jsonNominaHuasteca !== 'undefined') {
                // Sincronizar si es posible
                try { jsonNominaHuasteca = nominaData; } catch(e){}
            }
        }

        if (!nominaData || !nominaData.departamentos) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay datos de nómina cargados. Primero procesa los archivos.'
            });
            return;
        }
        
        // Limpiar el campo de búsqueda antes de abrir el modal
        $('#buscar_empleado_ticket').val('');
        
        cargarEmpleadosParaTickets(nominaData);
        $('#modal_seleccion_tickets').modal('show');
    });

    // Accesibilidad: forzar aria-hidden correcto en el modal
    $('#modal_seleccion_tickets').on('shown.bs.modal', function () {
        $(this).attr('aria-hidden', 'false');
    });
    $('#modal_seleccion_tickets').on('hidden.bs.modal', function () {
        $(this).attr('aria-hidden', 'true');
    });

    // Eventos del modal - usar delegación de eventos para elementos dinámicos
    $('#btn_seleccionar_todos_tickets').on('click', seleccionarTodosEmpleados);
    $('#btn_deseleccionar_todos_tickets').on('click', deseleccionarTodosEmpleados);
    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleados);
    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionados);
    $(document).on('click', '#btn_limpiar_busqueda', limpiarCampoBusqueda);

    // Evento para seleccionar empleado individual
    $(document).on('click', '.empleado-item', function(e) {
        // Evitar que el click en el checkbox dispare el evento dos veces
        if ($(e.target).is('input[type="checkbox"]')) {
            return;
        }
        
        const clave = String($(this).data('clave')); // Normalizar como string
        const checkbox = $(this).find('input[type="checkbox"]');
        
        if (empleadosSeleccionados.has(clave)) {
            empleadosSeleccionados.delete(clave);
            $(this).removeClass('active');
            checkbox.prop('checked', false);
        } else {
            empleadosSeleccionados.add(clave);
            $(this).addClass('active');
            checkbox.prop('checked', true);
        }
        
        actualizarContadores();
    });
    
    // Evento para el checkbox directamente
    $(document).on('change', '.empleado-item input[type="checkbox"]', function() {
        const listItem = $(this).closest('.list-group-item');
        const clave = String(listItem.data('clave'));
        
        if ($(this).is(':checked')) {
            empleadosSeleccionados.add(clave);
            listItem.addClass('active');
        } else {
            empleadosSeleccionados.delete(clave);
            listItem.removeClass('active');
        }
        
        actualizarContadores();
    });
});

/**
 * Carga todos los empleados de nómina huasteca
 */
function cargarEmpleadosParaTickets(nominaData) {
    empleadosParaTickets = [];
    empleadosSeleccionados.clear();
    
    if (!nominaData || !nominaData.departamentos) {
        return;
    }

    // Procesar todos los departamentos de nómina huasteca
    nominaData.departamentos.forEach(depto => {
        const nombreDepto = depto.nombre || '';
        if (depto.empleados && Array.isArray(depto.empleados)) {
            depto.empleados.forEach(emp => {
                if (emp && typeof emp === 'object') {
                    // NO CLONAR (...emp), guardar referencia al objeto original
                    // para que los cambios en la tabla se reflejen aquí también
                    empleadosParaTickets.push({
                        original: emp, 
                        clave: emp.clave,
                        nombre: emp.nombre,
                        departamento: nombreDepto,
                        tipo: 'huasteca'
                    });
                }
            });
        }
    });

    mostrarEmpleados(empleadosParaTickets);
}

/**
 * Mostrar empleados en el modal
 */
function mostrarEmpleados(empleados) {
    const container = $('#lista_empleados_tickets');
    container.empty();
    
    if (!empleados || empleados.length === 0) {
        container.html('<div class="col-12"><div class="alert alert-info text-center">No se encontraron empleados</div></div>');
        return;
    }
    
    // Crear lista simple en lugar de tarjetas
    const listaHtml = `
        <div class="list-group">
            ${empleados.map(empleado => {
                // Normalizar clave como string para comparación consistente
                const clave = String(empleado.clave || empleado.id || Math.random());
                const nombre = empleado.nombre || 'Sin nombre';
                const departamento = empleado.departamento || 'Sin departamento';
                    
                // Determinar la clase del badge según el departamento específico de Huasteca
                let badgeClass = 'bg-secondary'; // Color por defecto
                const deptoLower = departamento.toLowerCase();
                    
                // Departamentos específicos con colores únicos
                if (deptoLower.includes('jornalero') || deptoLower.includes('jornal')) {
                    badgeClass = 'bg-success';
                } else if (deptoLower.includes('coordinador') || deptoLower.includes('coordi')) {
                    badgeClass = 'bg-primary';
                } else if (deptoLower.includes('vivero') || deptoLower.includes('vive')) {
                    badgeClass = 'bg-warning text-dark';
                } else if (deptoLower.includes('rancho') || deptoLower.includes('ranch')) {
                    badgeClass = 'bg-danger';
                } else if (deptoLower.includes('apoyo') || deptoLower.includes('apoy')) {
                    badgeClass = 'bg-info';
                } else if (deptoLower.includes('base') || deptoLower.includes('bas')) {
                    badgeClass = 'bg-dark';
                } else if (deptoLower.includes('administracion') || deptoLower.includes('admin')) {
                    badgeClass = 'bg-primary';
                } else if (deptoLower.includes('produccion') || deptoLower.includes('produc')) {
                    badgeClass = 'bg-warning text-dark';
                } else if (deptoLower.includes('seguridad') || deptoLower.includes('vigilancia') || deptoLower.includes('intendencia')) {
                    badgeClass = 'bg-purple';
                } else if (deptoLower.includes('sin seguro') || deptoLower.includes('sin')) {
                    badgeClass = 'bg-orange';
                }
                    
                const isSelected = empleadosSeleccionados.has(clave);
                const itemClass = isSelected ? 'list-group-item list-group-item-action active d-flex justify-content-between align-items-center' : 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                    
                return `
                    <div class="${itemClass} empleado-item" data-clave="${clave}" data-nombre="${nombre.toLowerCase()}" style="cursor: pointer;">
                        <div>
                            <div class="fw-bold">${nombre}</div>
                            <small class="text-muted">Clave: ${clave}</small>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge ${badgeClass} rounded-pill">${departamento}</span>
                            <input class="form-check-input" type="checkbox" ${isSelected ? 'checked' : ''}>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
        
    container.html(listaHtml);
}

/**
 * Filtrar empleados en tiempo real
 */
function filtrarEmpleados() {
    const query = $(this).val().toLowerCase().trim();
    
    // Mostrar/ocultar el botón de limpiar
    if (query !== '') {
        $('#btn_limpiar_busqueda').css('display', 'flex');
    } else {
        $('#btn_limpiar_busqueda').hide();
    }
    
    // Si la búsqueda está vacía, mostrar todos
    if (query === '') {
        mostrarEmpleados(empleadosParaTickets);
        return;
    }
    
    // Filtrar por nombre o clave
    const filtrados = empleadosParaTickets.filter(emp => {
        const nombre = (emp.nombre || '').toLowerCase();
        const clave = String(emp.clave || emp.id || '');
        const depto = (emp.departamento || '').toLowerCase();
        
        return nombre.includes(query) || clave.includes(query) || depto.includes(query);
    });
    
    mostrarEmpleados(filtrados);
}

/**
 * Seleccionar todos los empleados visibles
 */
function seleccionarTodosEmpleados() {
    // Si hay búsqueda activa, seleccionar solo los visibles
    const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    
    if (query === '') {
        empleadosParaTickets.forEach(emp => {
            empleadosSeleccionados.add(String(emp.clave || emp.id));
        });
    } else {
        empleadosParaTickets.forEach(emp => {
            const nombre = (emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || emp.id || '');
            const depto = (emp.departamento || '').toLowerCase();
            
            if (nombre.includes(query) || clave.includes(query) || depto.includes(query)) {
                empleadosSeleccionados.add(String(emp.clave || emp.id));
            }
        });
    }
    
    actualizarVistaSeleccion();
}

/**
 * Deseleccionar todos los empleados visibles
 */
function deseleccionarTodosEmpleados() {
    const query = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    
    if (query === '') {
        empleadosSeleccionados.clear();
    } else {
        empleadosParaTickets.forEach(emp => {
            const nombre = (emp.nombre || '').toLowerCase();
            const clave = String(emp.clave || emp.id || '');
            const depto = (emp.departamento || '').toLowerCase();
            
            if (nombre.includes(query) || clave.includes(query) || depto.includes(query)) {
                empleadosSeleccionados.delete(String(emp.clave || emp.id));
            }
        });
    }
    
    actualizarVistaSeleccion();
}

/**
 * Actualiza la vista según el Set de seleccionados
 */
function actualizarVistaSeleccion() {
    $('.empleado-item').each(function() {
        const clave = String($(this).data('clave'));
        const checkbox = $(this).find('input[type="checkbox"]');
        
        if (empleadosSeleccionados.has(clave)) {
            $(this).addClass('active');
            checkbox.prop('checked', true);
        } else {
            $(this).removeClass('active');
            checkbox.prop('checked', false);
        }
    });
    
    actualizarContadores();
}

/**
 * Actualizar contadores de selección
 */
function actualizarContadores() {
    const total = empleadosSeleccionados.size;
    $('#contador_seleccionados').text(total);
    $('#contador_seleccionados_btn').text(total);
}

/**
 * Limpiar campo de búsqueda
 */
function limpiarCampoBusqueda() {
    $('#buscar_empleado_ticket').val('').trigger('input');
    $(this).hide();
}

/**
 * Generar tickets para empleados seleccionados
 */
function generarTicketsSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Por favor, selecciona al menos un empleado para generar tickets.'
        });
        return;
    }
    
    // Intentar obtener la variable global más reciente
    let nominaData = null;
    try {
        if (typeof jsonNominaHuasteca !== 'undefined' && jsonNominaHuasteca) {
            nominaData = jsonNominaHuasteca;
        }
    } catch (e) {}
    
    if (!nominaData) {
        nominaData = JSON.parse(localStorage.getItem('jsonNominaHuasteca') || '{}');
    }

    const seleccionados = [];
    
    // Obtener los datos más recientes de los empleados seleccionados
    empleadosParaTickets.forEach(item => {
        const clave = String(item.clave || (item.original ? item.original.clave : ''));
        if (empleadosSeleccionados.has(clave)) {
            // Aseguramos que usamos la referencia original que se actualiza con la tabla
            const empActualizado = item.original;
            if (empActualizado) {
                // Añadir departamento al objeto para el PDF
                empActualizado.departamento = item.departamento;
                seleccionados.push(empActualizado);
            }
        }
    });
    
    if (seleccionados.length === 0) return;
    
    // Mostrar cargando
    const btnOriginalHtml = $(this).html();
    $(this).prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Generando...');
    
    // Preparar datos para enviar
    const dataEnviar = {
        seleccion: true,
        empleados: seleccionados,
        meta: {
            numero_semana: nominaData.numero_semana || ''
        }
    };
    
    // Enviar por AJAX como JSON raw body (más robusto para datos grandes)
    $.ajax({
        url: '../php/descargar_ticket_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataEnviar),
        xhrFields: {
            responseType: 'blob'
        },
        success: function(blob, status, xhr) {
            if (!(blob instanceof Blob)) {
                Swal.fire('Error', 'El servidor no devolvió un archivo PDF válido.', 'error');
                $('#btn_generar_tickets_seleccionados').prop('disabled', false).html(btnOriginalHtml);
                return;
            }
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tickets_seleccionados.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            $('#btn_generar_tickets_seleccionados').prop('disabled', false).html(btnOriginalHtml);
            $('#modal_seleccion_tickets').modal('hide');
            
            Swal.fire({
                icon: 'success',
                title: 'Tickets generados',
                text: 'Se han generado los tickets correctamente.'
            });
        },
        error: function() {
            Swal.fire('Error', 'Error al generar el PDF. Por favor, intenta nuevamente.', 'error');
            $('#btn_generar_tickets_seleccionados').prop('disabled', false).html(btnOriginalHtml);
        }
    });
}
