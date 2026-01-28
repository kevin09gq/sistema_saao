/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS
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
        if (!window.jsonGlobal) {
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

    // Eventos del modal - usar delegación de eventos para elementos dinámicos
    $('#btn_seleccionar_todos_tickets').on('click', seleccionarTodosEmpleados);
    $('#btn_deseleccionar_todos_tickets').on('click', deseleccionarTodosEmpleados);
    $(document).on('input', '#buscar_empleado_ticket', filtrarEmpleados);
    $('#btn_generar_tickets_seleccionados').on('click', generarTicketsSeleccionados);

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
 * Carga los empleados filtrados (40 LIBRAS, 10 LIBRAS y sin seguro de esos departamentos)
 */
function cargarEmpleadosParaTickets() {
    empleadosParaTickets = [];
    empleadosSeleccionados.clear();
    
    if (!window.jsonGlobal || !window.jsonGlobal.departamentos) {
        return;
    }

    // Filtrar empleados de 40 y 10 libras
    window.jsonGlobal.departamentos.forEach(depto => {
        const nombreDepto = (depto.nombre || '').toUpperCase();
        
        // Departamentos de 40 LIBRAS y 10 LIBRAS con seguro
        if (nombreDepto.includes('40 LIBRAS') || nombreDepto.includes('10 LIBRAS')) {
            if (depto.empleados && Array.isArray(depto.empleados)) {
                depto.empleados.forEach(emp => {
                    empleadosParaTickets.push({
                        ...emp,
                        departamento: depto.nombre || '',
                        tipo: 'con_seguro'
                    });
                });
            }
        }
        
        // Departamento SIN SEGURO - filtrar solo empleados de 40 y 10 libras
        if (nombreDepto.includes('SIN SEGURO')) {
            if (depto.empleados && Array.isArray(depto.empleados)) {
                depto.empleados.forEach(emp => {
                    // Verificar si el empleado es de 40 o 10 libras basado en su puesto/departamento/nombre
                    const puesto = (emp.puesto || emp.departamento || emp.nombre_puesto || '').toUpperCase();
                    const nombre = (emp.nombre || '').toUpperCase();
                    
                    // Verificar múltiples campos para identificar 40 y 10 libras
                    if (puesto.includes('40 LIBRAS') || puesto.includes('10 LIBRAS') || 
                        puesto.includes('PRODUCCION 40') || puesto.includes('PRODUCCION 10') ||
                        puesto.includes('40') || puesto.includes('10') ||
                        nombre.includes('40') || nombre.includes('10')) {
                        empleadosParaTickets.push({
                            ...emp,
                            departamento: 'Sin Seguro',
                            tipo: 'sin_seguro'
                        });
                    }
                });
            }
        }
    });

    renderizarListaEmpleados();
    actualizarContadores();
    
    // Debug: mostrar información de los empleados cargados
    console.log('Empleados cargados para tickets:', empleadosParaTickets.length);
    console.log('Empleados con seguro:', empleadosParaTickets.filter(e => e.tipo === 'con_seguro').length);
    console.log('Empleados sin seguro:', empleadosParaTickets.filter(e => e.tipo === 'sin_seguro').length);
}

/**
 * Renderiza la lista de empleados en el modal
 */
function renderizarListaEmpleados() {
    const container = $('#lista_empleados_tickets');
    container.empty();
    
    if (empleadosParaTickets.length === 0) {
        container.html(`
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    No se encontraron empleados de 40 LIBRAS o 10 LIBRAS.
                </div>
            </div>
        `);
        return;
    }

    empleadosParaTickets.forEach(emp => {
        const clave = String(emp.clave || ''); // Normalizar como string
        const nombre = emp.nombre || 'Sin nombre';
        const departamento = emp.departamento || '';
        const isSelected = empleadosSeleccionados.has(clave);
        
        // Determinar clase del badge según el departamento
        let badgeClass = '';
        if (departamento.includes('40 LIBRAS')) {
            badgeClass = 'bg-primary';
        } else if (departamento.includes('10 LIBRAS')) {
            badgeClass = 'bg-success';
        } else {
            badgeClass = 'bg-warning text-dark';
        }

        const itemClass = isSelected ? 'list-group-item list-group-item-action active d-flex justify-content-between align-items-center' : 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        
        const itemHtml = `
            <div class="${itemClass} empleado-item" data-clave="${clave}" style="cursor: pointer;">
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
        
        container.append(itemHtml);
    });
    
    // Agregar estilos personalizados si no existen
    if (!$('#custom-styles-nomina').length) {
        $('head').append(`
            <style id="custom-styles-nomina">
                .list-group-item.active { background-color: #0d6efd; border-color: #0d6efd; }
            </style>
        `);
    }
}

/**
 * Selecciona todos los empleados visibles
 */
function seleccionarTodosEmpleados() {
    $('.empleado-item:visible').each(function() {
        const clave = String($(this).data('clave')); // Normalizar como string
        empleadosSeleccionados.add(clave);
        $(this).addClass('active');
        $(this).find('input[type="checkbox"]').prop('checked', true);
    });
    
    actualizarContadores();
}

/**
 * Deselecciona todos los empleados
 */
function deseleccionarTodosEmpleados() {
    empleadosSeleccionados.clear();
    $('.empleado-item').removeClass('active');
    $('.empleado-item input[type="checkbox"]').prop('checked', false);
    
    actualizarContadores();
}

/**
 * Filtra empleados por nombre o clave
 */
function filtrarEmpleados() {
    const filtro = $('#buscar_empleado_ticket').val().toLowerCase().trim();
    
    const $items = $('.empleado-item');
    
    if (filtro === '') {
        $items.removeClass('d-none').show();
    } else {
        $items.each(function() {
            const $item = $(this);
            const clave = $item.data('clave').toString().toLowerCase();
            const nombre = $item.find('.fw-bold').text().toLowerCase();
            
            if (clave.includes(filtro) || nombre.includes(filtro)) {
                $item.removeClass('d-none').show();
            } else {
                $item.addClass('d-none').hide();
            }
        });
    }
}

/**
 * Actualiza los contadores de empleados seleccionados
 */
function actualizarContadores() {
    const count = empleadosSeleccionados.size;
    $('#contador_seleccionados').text(count);
    $('#contador_seleccionados_btn').text(count);
    
    // Habilitar/deshabilitar botón según selección
    $('#btn_generar_tickets_seleccionados').prop('disabled', count === 0);
}

/**
 * Genera tickets PDF solo para los empleados seleccionados
 */
async function generarTicketsSeleccionados() {
    if (empleadosSeleccionados.size === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin selección',
            text: 'Debes seleccionar al menos un empleado.'
        });
        return;
    }

    // Filtrar datos de jsonGlobal para incluir solo empleados seleccionados
    const datosCompletosFiltrados = filtrarDatosParaTickets();
    
    // Debug: verificar datos filtrados
    console.log('Datos filtrados para enviar:', datosCompletosFiltrados);
    console.log('Empleados en departamentos filtrados:', 
        (datosCompletosFiltrados.departamentos || []).reduce((total, dept) => total + (dept.empleados || []).length, 0));
    console.log('Empleados sin seguro filtrados:', 
        (datosCompletosFiltrados.empleados_sin_seguro || []).length);
    
    if (!datosCompletosFiltrados) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron preparar los datos para la descarga.'
        });
        return;
    }

    // Cerrar modal
    $('#modal_seleccion_tickets').modal('hide');
    
    // Mostrar loading
    Swal.fire({
        title: 'Generando tickets...',
        text: `Preparando ${empleadosSeleccionados.size} tickets`,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch('../php/descargar_ticket_pdf.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify({ nomina: datosCompletosFiltrados })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        
        // Descargar archivo
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets_seleccionados_${empleadosSeleccionados.size}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: `Se generaron ${empleadosSeleccionados.size} tickets correctamente`,
            timer: 2000
        });

    } catch (error) {
        console.error('Error generando tickets:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron generar los tickets. Revisa la consola.'
        });
    }
}

/**
 * Filtra los datos de jsonGlobal para incluir solo empleados seleccionados
 */
function filtrarDatosParaTickets() {
    if (!window.jsonGlobal) return null;

    const datosCompletos = JSON.parse(JSON.stringify(window.jsonGlobal)); // Deep copy
    const clavesSeleccionadas = Array.from(empleadosSeleccionados).map(c => String(c)); // Normalizar como strings

    console.log('Claves seleccionadas para filtrar:', clavesSeleccionadas);

    // Filtrar departamentos y sus empleados
    if (datosCompletos.departamentos) {
        datosCompletos.departamentos = datosCompletos.departamentos
            .map(depto => {
                const nombreDepto = (depto.nombre || '').toUpperCase();
                let empleadosFiltrados = [];
                
                if (nombreDepto.includes('40 LIBRAS') || nombreDepto.includes('10 LIBRAS')) {
                    // Departamentos con seguro - incluir todos los seleccionados
                    empleadosFiltrados = (depto.empleados || []).filter(emp => {
                        const claveEmp = String(emp.clave || '');
                        const incluir = clavesSeleccionadas.includes(claveEmp);
                        if (incluir) {
                            console.log('Incluyendo empleado con seguro:', claveEmp, emp.nombre);
                        }
                        return incluir;
                    });
                } else if (nombreDepto.includes('SIN SEGURO')) {
                    // Departamento sin seguro - filtrar solo 40 y 10 libras seleccionados
                    empleadosFiltrados = (depto.empleados || []).filter(emp => {
                        const claveEmp = String(emp.clave || '');
                        const incluir = clavesSeleccionadas.includes(claveEmp);
                        if (incluir) {
                            console.log('Incluyendo empleado sin seguro:', claveEmp, emp.nombre);
                        }
                        return incluir;
                    });
                }
                
                return {
                    ...depto,
                    empleados: empleadosFiltrados
                };
            })
            .filter(depto => depto.empleados.length > 0);
    }

    // Nota: Los empleados sin seguro ya se procesaron desde el departamento "SIN SEGURO"
    // No necesitamos procesar empleados_sin_seguro por separado

    return datosCompletos;
}

// Mostrar/ocultar la X según el contenido del input de búsqueda del modal tickets
const inputBuscar = document.getElementById('buscar_empleado_ticket');
const btnLimpiar = document.getElementById('limpiar_busqueda_ticket');
if(inputBuscar && btnLimpiar) {
    inputBuscar.addEventListener('input', function() {
        btnLimpiar.style.display = this.value ? 'flex' : 'none';
    });
    btnLimpiar.addEventListener('click', function() {
        inputBuscar.value = '';
        // Forzar el filtrado para mostrar todos los empleados
        filtrarEmpleados();
        inputBuscar.focus();
    });
}