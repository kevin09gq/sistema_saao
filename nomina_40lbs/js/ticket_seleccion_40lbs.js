/**
 * ================================================================
 * MÓDULO DE SELECCIÓN DE EMPLEADOS PARA TICKETS - NÓMINA 40LBS
 * ================================================================
 * Maneja la selección manual de empleados para generar tickets PDF
 * ================================================================
 */

// Variables globales para el modal de selección
let empleadosParaTickets40lbs = [];
let empleadosSeleccionados40lbs = new Set();

// Inicializar eventos cuando el DOM esté listo
$(document).ready(function() {
    // Evento para abrir modal de selección de empleados
    $('#btn_ticket_manual_40lbs').on('click', function() {
        if (!window.jsonNomina40lbs) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay datos de nómina cargados. Primero procesa los archivos.'
            });
            return;
        }
        
        cargarEmpleadosParaTickets40lbs();
        $('#modal_seleccion_tickets_40lbs').modal('show');
    });

    // Eventos del modal - usar delegación de eventos para elementos dinámicos
    $('#btn_seleccionar_todos_tickets_40lbs').on('click', seleccionarTodosEmpleados40lbs);
    $('#btn_deseleccionar_todos_tickets_40lbs').on('click', deseleccionarTodosEmpleados40lbs);
    $(document).on('input', '#buscar_empleado_ticket_40lbs', filtrarEmpleados40lbs);
    $('#btn_generar_tickets_seleccionados_40lbs').on('click', generarTicketsSeleccionados40lbs);

    // Evento para seleccionar empleado individual
    $(document).on('click', '.empleado-item-40lbs', function(e) {
        // Evitar que el click en el checkbox dispare el evento dos veces
        if ($(e.target).is('input[type="checkbox"]')) {
            return;
        }
        
        const clave = String($(this).data('clave')); // Normalizar como string
        const checkbox = $(this).find('input[type="checkbox"]');
        
        if (empleadosSeleccionados40lbs.has(clave)) {
            empleadosSeleccionados40lbs.delete(clave);
            $(this).removeClass('active');
            checkbox.prop('checked', false);
        } else {
            empleadosSeleccionados40lbs.add(clave);
            $(this).addClass('active');
            checkbox.prop('checked', true);
        }
        
        actualizarContadores40lbs();
    });
    
    // Evento para el checkbox directamente
    $(document).on('change', '.empleado-item-40lbs input[type="checkbox"]', function() {
        const listItem = $(this).closest('.list-group-item');
        const clave = String(listItem.data('clave'));
        
        if ($(this).is(':checked')) {
            empleadosSeleccionados40lbs.add(clave);
            listItem.addClass('active');
        } else {
            empleadosSeleccionados40lbs.delete(clave);
            listItem.removeClass('active');
        }
        
        actualizarContadores40lbs();
    });

    // Mostrar/ocultar la X según el contenido del input de búsqueda del modal tickets
    const inputBuscar = document.getElementById('buscar_empleado_ticket_40lbs');
    const btnLimpiar = document.getElementById('limpiar_busqueda_ticket_40lbs');
    if(inputBuscar && btnLimpiar) {
        inputBuscar.addEventListener('input', function() {
            btnLimpiar.style.display = this.value ? 'flex' : 'none';
        });
        btnLimpiar.addEventListener('click', function() {
            inputBuscar.value = '';
            filtrarEmpleados40lbs();
            inputBuscar.focus();
        });
    }
});

/**
 * Carga los empleados de nomina_40lbs
 */
function cargarEmpleadosParaTickets40lbs() {
    empleadosParaTickets40lbs = [];
    empleadosSeleccionados40lbs.clear();
    
    if (!window.jsonNomina40lbs || !window.jsonNomina40lbs.departamentos) {
        return;
    }

    // Solo incluir departamentos 40 libras, 10 libras y sin seguro
    window.jsonNomina40lbs.departamentos.forEach(depto => {
        const nombreDepto = (depto.nombre || '').toLowerCase();
        if (
            nombreDepto.includes('40 libras') ||
            nombreDepto.includes('10 libras') ||
            nombreDepto.includes('sin seguro')
        ) {
            if (depto.empleados && Array.isArray(depto.empleados)) {
                depto.empleados.forEach(emp => {
                    empleadosParaTickets40lbs.push({
                        ...emp,
                        departamento: depto.nombre || '',
                    });
                });
            }
        }
    });

    renderizarListaEmpleados40lbs();
    actualizarContadores40lbs();
    
    // Debug: mostrar información de los empleados cargados
    console.log('Empleados cargados para tickets (40lbs):', empleadosParaTickets40lbs.length);
}

/**
 * Renderiza la lista de empleados en el modal
 */
function renderizarListaEmpleados40lbs() {
    const container = $('#lista_empleados_tickets_40lbs');
    container.empty();
    
    if (empleadosParaTickets40lbs.length === 0) {
        container.html(`
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i>
                    No se encontraron empleados.
                </div>
            </div>
        `);
        return;
    }

    empleadosParaTickets40lbs.forEach(emp => {
        const clave = String(emp.clave || ''); // Normalizar como string
        const nombre = emp.nombre || 'Sin nombre';
        const departamento = emp.departamento || '';
        const isSelected = empleadosSeleccionados40lbs.has(clave);
        
        // Determinar clase del badge según el departamento
        let badgeClass = 'bg-primary';
        if (departamento.includes('10 Libras')) {
            badgeClass = 'bg-success';
        }

        const itemClass = isSelected ? 'list-group-item list-group-item-action active d-flex justify-content-between align-items-center' : 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
        
        const itemHtml = `
            <div class="${itemClass} empleado-item-40lbs" data-clave="${clave}" style="cursor: pointer;">
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
    if (!$('#custom-styles-nomina-40lbs').length) {
        $('head').append(`
            <style id="custom-styles-nomina-40lbs">
                .list-group-item.active { background-color: #0d6efd; border-color: #0d6efd; }
            </style>
        `);
    }
}

/**
 * Selecciona todos los empleados visibles
 */
function seleccionarTodosEmpleados40lbs() {
    $('.empleado-item-40lbs:visible').each(function() {
        const clave = String($(this).data('clave')); // Normalizar como string
        empleadosSeleccionados40lbs.add(clave);
        $(this).addClass('active');
        $(this).find('input[type="checkbox"]').prop('checked', true);
    });
    
    actualizarContadores40lbs();
}

/**
 * Deselecciona todos los empleados
 */
function deseleccionarTodosEmpleados40lbs() {
    empleadosSeleccionados40lbs.clear();
    $('.empleado-item-40lbs').removeClass('active');
    $('.empleado-item-40lbs input[type="checkbox"]').prop('checked', false);
    
    actualizarContadores40lbs();
}

/**
 * Filtra empleados por nombre o clave
 */
function filtrarEmpleados40lbs() {
    const filtro = $('#buscar_empleado_ticket_40lbs').val().toLowerCase().trim();
    
    const $items = $('.empleado-item-40lbs');
    
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
function actualizarContadores40lbs() {
    const count = empleadosSeleccionados40lbs.size;
    $('#contador_seleccionados_40lbs').text(count);
    $('#contador_seleccionados_btn_40lbs').text(count);
    
    // Habilitar/deshabilitar botón según selección
    $('#btn_generar_tickets_seleccionados_40lbs').prop('disabled', count === 0);
}

/**
 * Genera tickets PDF solo para los empleados seleccionados
 */
async function generarTicketsSeleccionados40lbs() {
    try {
        if (empleadosSeleccionados40lbs.size === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin selección',
                text: 'Debes seleccionar al menos un empleado.'
            });
            return;
        }

        // Validar que haya datos cargados
        if (typeof jsonNomina40lbs === 'undefined' || !jsonNomina40lbs.departamentos) {
            Swal.fire({
                title: 'Error',
                text: 'No hay datos de nómina cargados. Carga los archivos Excel primero.',
                icon: 'error'
            });
            return;
        }

        // Cerrar modal
        $('#modal_seleccion_tickets_40lbs').modal('hide');
        
        // Mostrar muestra de carga
        Swal.fire({
            title: 'Generando tickets...',
            text: `Por favor espera mientras se generan ${empleadosSeleccionados40lbs.size} PDFs.`,
            icon: 'info',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // NUEVO: Construir la estructura de departamentos incluyendo SOLO los empleados seleccionados, sin importar el filtro de departamento
        const clavesSeleccionadas = Array.from(empleadosSeleccionados40lbs).map(c => String(c));
        // Crear un mapa para agrupar empleados seleccionados por departamento
        const empleadosSeleccionadosDetalles = [];
        if (window.jsonNomina40lbs && window.jsonNomina40lbs.departamentos) {
            window.jsonNomina40lbs.departamentos.forEach(depto => {
                if (depto.empleados && Array.isArray(depto.empleados)) {
                    depto.empleados.forEach(emp => {
                        if (clavesSeleccionadas.includes(String(emp.clave || ''))) {
                            empleadosSeleccionadosDetalles.push({
                                ...emp,
                                departamento: depto.nombre || '',
                                nombre_departamento: depto.nombre || ''
                            });
                        }
                    });
                }
            });
        }

        // Agrupar empleados seleccionados por departamento
        const departamentosSeleccionados = {};
        empleadosSeleccionadosDetalles.forEach(emp => {
            const deptoNombre = emp.departamento || 'Sin Departamento';
            if (!departamentosSeleccionados[deptoNombre]) {
                departamentosSeleccionados[deptoNombre] = [];
            }
            departamentosSeleccionados[deptoNombre].push(emp);
        });

        // Construir la estructura final de departamentos
        const nomina_para_enviar = {
            numero_semana: jsonNomina40lbs.numero_semana,
            fecha_inicio: jsonNomina40lbs.fecha_inicio,
            fecha_cierre: jsonNomina40lbs.fecha_cierre,
            departamentos: Object.entries(departamentosSeleccionados).map(([nombreDepto, empleadosDepto]) => {
                return {
                    nombre: nombreDepto,
                    empleados: empleadosDepto.map(emp => {
                        const codigosDeduccion = {
                            '45': 'ISR',
                            '52': 'IMSS',
                            '16': 'INFONAVIT',
                            '107': 'AJUSTES AL SUB'
                        };
                        let deduccionesArray = [];
                        if (Array.isArray(emp.conceptos)) {
                            emp.conceptos.forEach(concepto => {
                                const codigo = String(concepto.codigo || '');
                                const nombre = codigosDeduccion[codigo] || concepto.nombre || '';
                                const valor = parseFloat(concepto.resultado) || 0;
                                if (nombre && valor > 0) {
                                    deduccionesArray.push({
                                        nombre: nombre,
                                        resultado: valor
                                    });
                                }
                            });
                        }
                        if ((emp.permiso || 0) > 0) {
                            deduccionesArray.push({
                                nombre: 'PERMISO',
                                resultado: emp.permiso
                            });
                        }
                        const empleado = {
                            clave: emp.clave || '',
                            nombre: emp.nombre || '',
                            id_empresa: emp.id_empresa || 1,
                            sueldo_base: emp.sueldo_neto || 0,
                            incentivo: emp.incentivo || 0,
                            sueldo_extra: emp.horas_extra || 0,
                            sueldo_extra_final: emp.sueldo_extra_final || 0,
                            bono_antiguedad: emp.bono_antiguedad || 0,
                            aplicar_bono: emp.aplicar_bono || 0,
                            actividades_especiales: emp.actividades_especiales || 0,
                            bono_puesto: emp.puesto || 0,
                            neto_pagar: emp.tarjeta || 0,
                            prestamo: emp.prestamo || 0,
                            uniformes: emp.uniformes || 0,
                            checador: emp.checador || 0,
                            inasistencias_descuento: emp.inasistencia || 0,
                            vacaciones: emp.vacaciones || 0,
                            conceptos: deduccionesArray,
                            conceptos_adicionales: (emp.percepciones_extra || []).map(item => ({
                                nombre: item.nombre || '',
                                valor: item.cantidad || 0
                            })),
                            deducciones_adicionales: (emp.deducciones_extra || []).map(item => ({
                                nombre: item.nombre || '',
                                valor: item.cantidad || 0
                            })),
                            mostrar: emp.mostrar !== false,
                            salario_semanal: emp.salario_semanal || 0,
                            salario_diario: emp.salario_diario || 0,
                            id_departamento: emp.id_departamento || null,
                            seguroSocial: emp.seguroSocial !== undefined ? emp.seguroSocial : true,
                            departamento: emp.departamento || '',
                            nombre_departamento: emp.nombre_departamento || '',
                            nombre_puesto: emp.nombre_puesto || '',
                            rfc_empleado: emp.rfc || '',
                            imss: emp.imss || '',
                            fecha_ingreso: emp.fecha_ingreso || ''
                        };
                        return empleado;
                    })
                };
            })
        };

        // Obtener departamento filtrado si está seleccionado en la interfaz
        let departamentoFiltrado = null;
        const filtroDepto = $('#filtro-departamento').val();
        if (filtroDepto === '1') {
            departamentoFiltrado = '40 Libras CSS';
        } else if (filtroDepto === '2') {
            departamentoFiltrado = '40 Libras SSS';
        } else if (filtroDepto === '3') {
            departamentoFiltrado = '10 Libras CSS';
        } else if (filtroDepto === '4') {
            departamentoFiltrado = '10 Libras SSS';
        }

        // Preparar datos para enviar
        const datos = {
            nomina: nomina_para_enviar,
            departamento_filtrado: departamentoFiltrado,
            solo_sin_seguro: false
        };

        const response = await fetch('../php/descargar_ticket_pdf.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        
        // Generar nombre de archivo con fecha/semana
        const numeroSemana = jsonNomina40lbs.numero_semana || 'SEM';
        const ahora = new Date();
        const timestamp = ahora.getTime();
        const nombreArchivo = `tickets_seleccionados_semana_${numeroSemana}_${timestamp}.pdf`;

        // Crear URL para descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        
        // Simular click para descargar
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 100);

        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: `Se generaron ${empleadosSeleccionados40lbs.size} tickets correctamente`,
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
