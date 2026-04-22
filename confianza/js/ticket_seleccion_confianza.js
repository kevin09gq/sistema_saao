/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - NÓMINA CONFIANZA
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
    $('#btn_ticket_manual').on('click', function() {
        // FORZAR RECARGA desde localStorage para obtener datos actualizados
        const nominaData = JSON.parse(localStorage.getItem('jsonNominaConfianza') || '{}');
        // Actualizar variable global si hay datos más recientes
        if (nominaData && nominaData.departamentos) {
            if (typeof window.jsonNominaConfianza !== 'undefined') {
                window.jsonNominaConfianza = nominaData;
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
        cargarEmpleadosParaTickets();
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
 * Carga todos los empleados de nómina de confianza
 */
function cargarEmpleadosParaTickets() {
    empleadosParaTickets = [];
    empleadosSeleccionados.clear();
    
    const nominaData = JSON.parse(localStorage.getItem('jsonNominaConfianza') || '{}');
    
    if (!nominaData || !nominaData.departamentos) {
        return;
    }

    //

    // Procesar todos los departamentos de nómina de confianza
    nominaData.departamentos.forEach(depto => {
        const nombreDepto = depto.nombre || '';
        //
        if (depto.empleados && Array.isArray(depto.empleados)) {
            depto.empleados.forEach(emp => {
                if (emp && typeof emp === 'object') {
                    empleadosParaTickets.push({
                        ...emp,
                        departamento: nombreDepto,
                        tipo: 'confianza'
                    });
                }
            });
        }
    });

    //
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
                    
                // Determinar la clase del badge según el departamento
                let badgeClass = 'bg-primary';
                const deptoLower = departamento.toLowerCase();
                    
                if (deptoLower.includes('administracion')) {
                    badgeClass = 'bg-primary';
                } else if (deptoLower.includes('produccion')) {
                    badgeClass = 'bg-warning text-dark';
                } else if (deptoLower.includes('seguridad') || deptoLower.includes('vigilancia') || deptoLower.includes('intendencia')) {
                    badgeClass = 'bg-purple';
                } else if (deptoLower.includes('sin seguro')) {
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
        
    // Agregar estilos para badges personalizados
    if (!$('#custom-styles-tickets').length) {
        $('head').append(`
            <style id="custom-styles-tickets">
                .bg-purple { background-color: #6f42c1 !important; color: white !important; }
                .bg-orange { background-color: #fd7e14 !important; color: white !important; }
                .list-group-item.active { background-color: #0d6efd; border-color: #0d6efd; }
            </style>
        `);
    }
    
    actualizarContadores();
}

/**
 * Seleccionar todos los empleados visibles
 */
function seleccionarTodosEmpleados() {
    $('.empleado-item:visible').each(function() {
        const clave = String($(this).data('clave'));
        empleadosSeleccionados.add(clave);
        $(this).addClass('active');
        $(this).find('input[type="checkbox"]').prop('checked', true);
    });
    
    actualizarContadores();
}

/**
 * Deseleccionar todos los empleados
 */
function deseleccionarTodosEmpleados() {
    empleadosSeleccionados.clear();
    $('.empleado-item').removeClass('active');
    $('.empleado-item input[type="checkbox"]').prop('checked', false);
    
    actualizarContadores();
}

/**
 * Limpiar el campo de búsqueda
 */
function limpiarCampoBusqueda() {
    $('#buscar_empleado_ticket').val('').trigger('input').focus();
}

/**
 * Filtrar empleados por texto de búsqueda
 */
function filtrarEmpleados() {
    const filtro = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    const $items = $('.empleado-item');
    if (filtro === '') {
        $items.removeClass('d-none').show();
    } else {
        $items.each(function() {
            const $item = $(this);
            const nombre = $item.data('nombre') || '';
            const texto = $item.text().toLowerCase();
            if (nombre.includes(filtro) || texto.includes(filtro)) {
                $item.removeClass('d-none').show();
            } else {
                $item.addClass('d-none').hide();
            }
        });
    }
}

/**
 * Actualizar contadores de empleados seleccionados
 */
function actualizarContadores() {
    const count = empleadosSeleccionados.size;
    $('#contador_seleccionados').text(count);
    $('#contador_seleccionados_btn').text(count);
}

/**
 * Generar tickets para empleados seleccionados
 */
function generarTicketsSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Por favor selecciona al menos un empleado.'
        });
        return;
    }

    // Obtener datos completos de empleados seleccionados
    const empleadosData = empleadosParaTickets.filter(emp => {
        const clave = String(emp.clave || emp.id || '');
        return empleadosSeleccionados.has(clave);
    });

    console.log('Empleados seleccionados:', empleadosData);

    // Preparar datos para el servidor
    const nominaCompleta = JSON.parse(localStorage.getItem('jsonNominaConfianza') || '{}');
    
    const datosParaTickets = {
        empleados_seleccionados: empleadosData,
        metadatos: nominaCompleta
    };

    // Mostrar loading
    Swal.fire({
        title: 'Generando tickets...',
        text: `Procesando ${empleadosData.length} empleado(s)`,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Enviar al servidor
    $.ajax({
        url: '../php/descargar_ticket_pdf.php',
        method: 'POST',
        data: {
            datos_json: JSON.stringify(datosParaTickets),
            empleados_seleccionados: true
        },
        xhrFields: {
            responseType: 'blob'
        },
        success: function(data, status, xhr) {
            Swal.close();
            
            // Crear URL del blob y descargar
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `tickets_confianza_seleccionados_${new Date().getTime()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            Swal.fire({
                icon: 'success',
                title: '¡Tickets generados!',
                text: `Se generaron ${empleadosData.length} ticket(s) exitosamente.`
            });

            // Cerrar modal y limpiar selecciones
            $('#modal_seleccion_tickets').modal('hide');
            empleadosSeleccionados.clear();
        },
        error: function(xhr, status, error) {
            Swal.close();
            console.error('Error al generar tickets:', error);
            console.error('Response:', xhr.responseText);
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al generar los tickets. Por favor, intenta de nuevo.'
            });
        }
    });
}