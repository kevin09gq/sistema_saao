<<<<<<< HEAD
const $menu_corte = $('#context_menu_corte');

// Variable para almacenar la fila seleccionada de Nomina de cortador
const modal_corte_nomina_detalles = new bootstrap.Modal(document.getElementById('modalCorteNominaDetalles'));
const btn_guardar_cambios_nomina_corte = document.getElementById('btn_guardar_cambios_nomina_corte');
// Variable para almacenar la fila seleccionada de Reja de corte
const modal_corte_reja_detalles = new bootstrap.Modal(document.getElementById('modalCorteRejasDetalles'));
const btn_guardar_cambios_reja_corte = document.getElementById('btn_guardar_cambios_reja_corte');


$(document).ready(function () {
    mostrarContextMenuCorte();

});


// Funciones para mostrar el menú contextual y abrir los modales correspondientes
function mostrarContextMenuCorte() {
    // Click derecho en fila de la tabla
    $('#tabla-nomina-corte').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        filaSeleccionada = $(this);

        // Posicionar y mostrar menú
        $menu_corte.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        }).show();
    });

    // Cerrar menú al hacer click en otro lugar
    $(document).on('click', function () {
        $menu_corte.hide();
    });
}


/**
 * Abrir los modales correspondientes según el concepto de la fila seleccionada
 */
$(document).on('click', '#context_menu_corte', function (e) {
    e.preventDefault();

    const concepto = String(filaSeleccionada.data('concepto') || '').trim();
    const nombre = String(filaSeleccionada.data('nombre') || '').trim();
    const precio = String(filaSeleccionada.data('precio') || '').trim();

    switch (concepto) {
        case 'REJA':
            inicializar_modal_corte_rejas_detalles(jsonNominaRelicario, nombre, precio);
            break;
        case 'NOMINA':
            inicializar_modal_corte_nomina_detalles(jsonNominaRelicario, nombre);
            break;
        default:
            console.warn('Concepto no reconocido');
            alerta("warning", "Concepto no reconocido", "no se puede mostrar el detalle.");
            break;
    }
});


/**
 * INCIALIZAR EL MODAL PARA LOS DETALLES DE LA NOMINA DE CORTE
 * @param {JsonObject} json jsonNominaRelicario de process_excel.js
 * @param {string} nombreEmpleado nombre del empleado para filtrar
 * @returns 
 */
function inicializar_modal_corte_nomina_detalles(json, nombreEmpleado) {
    // Obtener el nombre del empleado de la fila seleccionada
    const nombre = nombreEmpleado || String(filaSeleccionada.data('nombre') || '').trim();

    // Buscar el empleado en el departamento "Corte" con concepto "NOMINA"
    const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
    if (!departamentoCorte) {
        console.error('Departamento Corte no encontrado');
        return;
    }

    const empleado = departamentoCorte.empleados.find(emp =>
        emp.nombre === nombre && emp.concepto === 'NOMINA'
    );

    if (!empleado || !empleado.nomina) {
        console.error('Empleado no encontrado o no tiene datos de nómina');
        return;
    }

    // Procesar la información de nómina
    const datosNomina = procesarDatosNomina(empleado);

    // Llenar el primer tab (Detalles)
    llenarTabDetalles(empleado.nombre, datosNomina);

    // Llenar el segundo tab (Pagos por día)
    llenarTabPagosPorDia(empleado.nomina);

    modal_corte_nomina_detalles.show();
}

/**
 * Procesa los datos de nómina del empleado
 */
function procesarDatosNomina(empleado) {
    const pagos = empleado.nomina.filter(dia => dia.pago > 0);

    // Calcular el sueldo diario más frecuente
    const sueldosFrecuencia = {};
    pagos.forEach(dia => {
        const pago = parseFloat(dia.pago);
        sueldosFrecuencia[pago] = (sueldosFrecuencia[pago] || 0) + 1;
    });

    const sueldoDiario = Object.keys(sueldosFrecuencia).reduce((a, b) =>
        sueldosFrecuencia[a] > sueldosFrecuencia[b] ? a : b, 0
    );

    // Contar días trabajados
    const diasTrabajados = pagos.length;

    // Calcular total efectivo
    const totalEfectivo = empleado.nomina.reduce((total, dia) =>
        total + parseFloat(dia.pago), 0
    );

    return {
        sueldoDiario: parseFloat(sueldoDiario),
        diasTrabajados,
        totalEfectivo
    };
}

/**
 * Llena el tab de detalles del modal
 */
function llenarTabDetalles(nombre, datos) {
    $('#span_nombre_cortador').text(nombre);
    $('#span_sueldo_diario').text(`$${datos.sueldoDiario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#span_dias_trabajados').text(datos.diasTrabajados);
    $('#span_total_efectivo').text(`$${datos.totalEfectivo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#badge_nombre_cortador').html(`<i class="bi bi-person-fill me-2"></i>${nombre}`);

    // Se agrega el nombre del empleado como un parametro data
    $('#btn_borrar_nomina').attr('data-nombre', nombre);
}

/**
 * Llena el tab de pagos por día del modal
 */
function llenarTabPagosPorDia(nomina) {
    // Crear un mapa de pagos por día
    const pagosPorDia = {};
    nomina.forEach(dia => {
        pagosPorDia[dia.dia.toUpperCase()] = parseFloat(dia.pago) || 0;
    });

    // Mapeo de días en español a los IDs de los inputs
    const mapaDias = {
        'VIERNES': 'viernes',
        'SABADO': 'sabado',
        'DOMINGO': 'domingo',
        'LUNES': 'lunes',
        'MARTES': 'martes',
        'MIERCOLES': 'miercoles',
        'JUEVES': 'jueves'
    };

    // Llenar los inputs
    let totalPagos = 0;
    Object.keys(mapaDias).forEach(dia => {
        const pago = pagosPorDia[dia] || 0;
        const inputId = `pago_editar_${mapaDias[dia]}`;
        $(`#${inputId}`).val(pago > 0 ? pago : '');
        totalPagos += pago;
    });

    // Actualizar el total
    $('#total_pagos_nomina_editar').text(`$${totalPagos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}



// ==================================================================================
// Funciones para preparar la actualización de los pagos del modal de nómina de corte
// ==================================================================================

/**
 * Recopila los pagos del modal de edición
 */
function recopilarPagosDelModal() {
    const mapaDias = {
        'viernes': 'VIERNES',
        'sabado': 'SABADO',
        'domingo': 'DOMINGO',
        'lunes': 'LUNES',
        'martes': 'MARTES',
        'miercoles': 'MIERCOLES',
        'jueves': 'JUEVES'
    };

    const pagos = [];

    Object.keys(mapaDias).forEach(inputDia => {
        const valor = parseFloat($(`#pago_editar_${inputDia}`).val()) || 0;
        pagos.push({
            dia: mapaDias[inputDia],
            pago: valor
        });
    });

    return pagos;
}

/**
 * Actualiza los pagos de un empleado en el JSON
 */
function actualizarPagosEmpleado(json, nombreEmpleado, nuevosPageos) {
    try {
        const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
        if (!departamentoCorte) {
            console.error('Departamento Corte no encontrado');
            return false;
        }

        const empleado = departamentoCorte.empleados.find(emp =>
            emp.nombre === nombreEmpleado && emp.concepto === 'NOMINA'
        );

        if (!empleado) {
            console.error('Empleado no encontrado');
            return false;
        }

        // Actualizar los pagos del empleado
        empleado.nomina = nuevosPageos;

        console.log('Pagos actualizados para:', nombreEmpleado, nuevosPageos);
        return true;

    } catch (error) {
        console.error('Error al actualizar pagos del empleado:', error);
        return false;
    }
}

/**
 * Actualiza el total de pagos automáticamente cuando cambian los inputs
 */
function actualizarTotalPagosAutomatico() {
    const mapaDias = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];

    let total = 0;
    mapaDias.forEach(dia => {
        const valor = parseFloat($(`#pago_editar_${dia}`).val()) || 0;
        total += valor;
    });

    $('#total_pagos_nomina_editar').text(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}

// Evento para actualizar el total automáticamente cuando cambian los inputs
$(document).on('input', '.pago_del_dia_editar', function () {
    actualizarTotalPagosAutomatico();
});

// Evento para limpiar un día específico
$(document).on('click', '.btn_limpiar_dia', function () {
    const fila = $(this).closest('tr');
    const input = fila.find('.pago_del_dia_editar');
    input.val('');
    actualizarTotalPagosAutomatico();
});

// Evento para guardar los cambios al hacer click en el botón de guardar
$(btn_guardar_cambios_nomina_corte).on('click', function (e) {
    e.preventDefault();

    // Obtener el nombre del empleado actual
    const nombreEmpleado = $('#span_nombre_cortador').text().trim();

    // Recopilar los nuevos pagos de los inputs
    const nuevosPageos = recopilarPagosDelModal();

    // Actualizar el empleado en el JSON
    const actualizado = actualizarPagosEmpleado(jsonNominaRelicario, nombreEmpleado, nuevosPageos);

    if (actualizado) {
        // Mostrar mensaje de éxito
        alerta("success", "Pagos actualizados", "Los pagos del empleado han sido actualizados correctamente.");

        // Después de actualizar los datos, cerrar el modal y refrescar la tabla
        mostrarDatosTablaCorte(jsonNominaRelicario);
        modal_corte_nomina_detalles.hide();
    } else {
        // Mostrar mensaje de error
        alerta("error", "Error al actualizar", "No se pudieron actualizar los pagos del empleado.");
    }
});


/**
 * ===========================================================
 * INCIALIZAR EL MODAL PARA LOS DETALLES DE LAS REJAS DE CORTE
 * ===========================================================
 */

/**
 * INCIALIZAR EL MODAL PARA LOS DETALLES DE LAS REJAS DE CORTE
 * @param {JsonObject} json jsonNominaRelicario de process_excel.js
 * @param {string} nombreEmpleado nombre del empleado para filtrar
 * @param {float} precioReja precio de la reja para filtrar los tickets
 * @returns 
 */
function inicializar_modal_corte_rejas_detalles(json, nombreEmpleado, precioReja) {
    // Obtener el nombre del empleado de la fila seleccionada
    const nombre = nombreEmpleado || String(filaSeleccionada.data('nombre') || '').trim();
    const precio = parseFloat(precioReja) || 0;

    // Buscar el empleado en el departamento "Corte" con concepto "REJA"
    const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
    if (!departamentoCorte) {
        console.error('Departamento Corte no encontrado');
        return;
    }

    const empleado = departamentoCorte.empleados.find(emp =>
        emp.nombre === nombre && emp.concepto === 'REJA'
    );

    if (!empleado || !empleado.tickets) {
        console.error('Empleado no encontrado o no tiene tickets de rejas');
        return;
    }

    // Filtrar tickets por el precio especificado
    const ticketsPorPrecio = empleado.tickets.filter(ticket =>
        parseFloat(ticket.precio_reja) === precio
    );

    if (ticketsPorPrecio.length === 0) {
        console.error('No se encontraron tickets para el precio especificado');
        return;
    }

    // Procesar la información de rejas
    const datosRejas = procesarDatosRejas(ticketsPorPrecio, precio);

    // Llenar el primer tab (Detalles)
    llenarTabDetallesRejas(empleado.nombre, datosRejas);

    // Llenar el segundo tab (Tickets de rejas)
    llenarTabTicketsRejas(ticketsPorPrecio);

    modal_corte_reja_detalles.show();
}


/**
 * Procesa los datos de rejas del empleado para un precio específico
 * @param {Array} tickets - Array de tickets del empleado filtrados por precio
 * @param {Number} precio - Precio por reja
 * @returns {Object} Datos procesados
 */
function procesarDatosRejas(tickets, precio) {
    let totalRejas = 0;

    // Calcular el total de rejas sumando todas las cantidades de todos los tickets
    tickets.forEach(ticket => {
        ticket.datosRejas.forEach(tabla => {
            totalRejas += parseInt(tabla.cantidad) || 0;
        });
    });

    const totalEfectivo = totalRejas * precio;

    return {
        totalRejas,
        precioReja: precio,
        totalEfectivo
    };
}


/**
 * Llena el tab de detalles del modal de rejas
 * @param {String} nombre - Nombre del empleado
 * @param {Object} datos - Datos procesados de rejas
 */
function llenarTabDetallesRejas(nombre, datos) {
    $('#span_nombre_cortador_reja').text(nombre);
    $('#span_total_rejas').text(datos.totalRejas.toLocaleString('en-US'));
    $('#span_precio_reja').text(`$${datos.precioReja.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#span_total_efectivo_reja').text(`$${datos.totalEfectivo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#badge_nombre_cortador_reja').html(`<i class="bi bi-person-fill me-2"></i>${nombre}`);
}


/**
 * Llena el tab de tickets de rejas con inputs editables
 * @param {Array} tickets - Array de tickets filtrados por precio
 */
function llenarTabTicketsRejas(tickets) {
    let htmlTickets = '';

    tickets.forEach((ticket, index) => {
        htmlTickets += generarHtmlTicket(ticket, index);
    });

    // Insertar el HTML en el contenedor del segundo tab
    $('#lista-reja-tab-pane').html(`
        <div class="mt-3">
            <div class="row">
                <div class="col-12">
                    <h6 class="text-muted mb-3">Tickets de Rejas</h6>
                </div>
            </div>
            ${htmlTickets}
        </div>
    `);
}


/**
 * Genera el HTML para un ticket individual
 * @param {Object} ticket - Datos del ticket
 * @param {Number} index - Índice del ticket
 * @returns {String} HTML del ticket
 */
function generarHtmlTicket(ticket, index) {
    let htmlTablas = '';

    // Generar HTML para cada tabla del ticket
    ticket.datosRejas.forEach((tabla, tablaIndex) => {
        htmlTablas += `
            <div class="row align-items-center mb-2">
                <div class="col-4">
                    <label class="form-label">Tabla de Origen:</label>
                    <input type="number" class="form-control form-control-sm shadow-sm" 
                           value="${tabla.tabla}" 
                           id="tabla_${index}_${tablaIndex}">
                </div>
                <div class="col-4">
                    <label class="form-label">Cantidad:</label>
                    <input type="number" class="form-control form-control-sm shadow-sm" 
                           value="${tabla.cantidad}" 
                           id="cantidad_${index}_${tablaIndex}">
                </div>
                <div class="col-4">
                    <button type="button" class="btn btn-outline-danger btn-sm mt-4 shadow-sm" 
                            onclick="eliminarTabla(${index}, ${tablaIndex})" 
                            title="Eliminar tabla">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    return `
        <div class="card mb-3" id="ticket_${index}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Ticket #${ticket.folio}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm" 
                        onclick="eliminarTicket(${index})" 
                        title="Eliminar ticket completo">
                    <i class="bi bi-trash"></i> Eliminar Ticket
                </button>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-6">
                        <label class="form-label">Folio:</label>
                        <input type="text" class="form-control form-control-sm shadow-sm" 
                               value="${ticket.folio}" 
                               id="folio_${index}">
                    </div>
                    <div class="col-6">
                        <label class="form-label">Fecha:</label>
                        <input type="date" class="form-control form-control-sm shadow-sm" 
                               value="${ticket.fecha}" 
                               id="fecha_${index}">
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">Tablas y Cantidades:</label>
                    <div id="tablas_container_${index}">
                        ${htmlTablas}
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm mt-2" 
                            onclick="agregarTabla(${index})">
                        <i class="bi bi-plus"></i> Agregar Tabla
                    </button>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <label class="form-label">Precio por Reja:</label>
                        <input type="number" step="0.01" class="form-control form-control-sm shadow-sm" 
                               value="${ticket.precio_reja}" 
                               id="precio_${index}">
                    </div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Elimina un ticket completo
 * @param {Number} ticketIndex - Índice del ticket a eliminar
 */
function eliminarTicket(ticketIndex) {
    Swal.fire({
        title: "Eliminar Ticket",
        text: "¿Seguro que deseas eliminar este ticket completo? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#bc2b2b",
        cancelButtonColor: "rgb(123, 123, 123)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Eliminar el del html
            $(`#ticket_${ticketIndex}`).remove();
        }
    });
}


/**
 * Elimina una tabla específica de un ticket
 * @param {Number} ticketIndex - Índice del ticket
 * @param {Number} tablaIndex - Índice de la tabla a eliminar
 */
function eliminarTabla(ticketIndex, tablaIndex) {
    Swal.fire({
        title: "Eliminar registro de tabla",
        text: "¿Seguro que deseas eliminar esta tabla? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#bc2b2b",
        cancelButtonColor: "rgb(123, 123, 123)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Buscar y eliminar la fila de la tabla específica
            $(`#tabla_${ticketIndex}_${tablaIndex}`).closest('.row').remove();
        }
    });
}


/**
 * Agrega una nueva tabla a un ticket específico
 * @param {Number} ticketIndex - Índice del ticket
 */
function agregarTabla(ticketIndex) {
    // Contar cuántas tablas ya existen para este ticket
    const tablasExistentes = $(`#tablas_container_${ticketIndex} .row`).length;
    const nuevoIndice = tablasExistentes;

    const nuevaTablaHtml = `
        <div class="row align-items-center mb-2">
            <div class="col-4">
                <label class="form-label">Tabla de Origen:</label>
                <input type="number" class="form-control form-control-sm" 
                       value="" 
                       placeholder="Número de tabla"
                       id="tabla_${ticketIndex}_${nuevoIndice}">
            </div>
            <div class="col-4">
                <label class="form-label">Cantidad:</label>
                <input type="number" class="form-control form-control-sm" 
                       value="" 
                       placeholder="Cantidad de rejas"
                       id="cantidad_${ticketIndex}_${nuevoIndice}">
            </div>
            <div class="col-4">
                <button type="button" class="btn btn-outline-danger btn-sm mt-4" 
                        onclick="eliminarTabla(${ticketIndex}, ${nuevoIndice})" 
                        title="Eliminar tabla">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;

    $(`#tablas_container_${ticketIndex}`).append(nuevaTablaHtml);
    console.log(`Nueva tabla agregada al ticket ${ticketIndex}`);
}


/**
 * ===========================================================
 * GUARDAR LOS CAMBIOS DE LOS TICKETS DE REJAS
 * ===========================================================
 */

/**
 * Recopila los tickets del modal de edición
 * @returns {Array} Array con los tickets actualizados
 */
function recopilarTicketsDelModal() {
    const tickets = [];

    // Recorrer todas las tarjetas de tickets visibles
    $('#lista-reja-tab-pane .card').each(function (index) {
        const ticketId = $(this).attr('id');
        if (!ticketId) return; // Saltar si no tiene ID (ticket eliminado)

        const ticketIndex = ticketId.split('_')[1];

        // Obtener datos básicos del ticket
        const folio = $(`#folio_${ticketIndex}`).val().trim();
        const fecha = $(`#fecha_${ticketIndex}`).val();
        const precioReja = parseFloat($(`#precio_${ticketIndex}`).val()) || 0;

        // Recopilar datosRejas (tablas y cantidades)
        const datosRejas = [];
        $(`#tablas_container_${ticketIndex} .row`).each(function () {
            const tablaInput = $(this).find('input[id^="tabla_"]');
            const cantidadInput = $(this).find('input[id^="cantidad_"]');

            if (tablaInput.length && cantidadInput.length) {
                const tabla = parseInt(tablaInput.val()) || 0;
                const cantidad = parseInt(cantidadInput.val()) || 0;

                if (tabla > 0 && cantidad > 0) {
                    datosRejas.push({
                        tabla: tabla,
                        cantidad: cantidad
                    });
                }
            }
        });

        // Solo agregar el ticket si tiene datos válidos
        if (folio && fecha && datosRejas.length > 0) {
            tickets.push({
                folio: folio,
                fecha: fecha,
                datosRejas: datosRejas,
                precio_reja: precioReja
            });
        }
    });

    return tickets;
}


/**
 * Actualiza los tickets de un empleado en el JSON para un precio específico
 * @param {Object} json - El objeto JSON completo
 * @param {String} nombreEmpleado - Nombre del empleado a actualizar
 * @param {Number} precioOriginal - Precio original para filtrar los tickets a actualizar
 * @param {Array} nuevosTickets - Array con los nuevos tickets
 * @returns {Boolean} True si se actualizó correctamente, false en caso contrario
 */
function actualizarTicketsEmpleado(json, nombreEmpleado, precioOriginal, nuevosTickets) {
    try {
        const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
        if (!departamentoCorte) {
            console.error('Departamento Corte no encontrado');
            return false;
        }

        const empleado = departamentoCorte.empleados.find(emp =>
            emp.nombre === nombreEmpleado && emp.concepto === 'REJA'
        );

        if (!empleado) {
            console.error('Empleado no encontrado');
            return false;
        }

        // Filtrar tickets que NO tengan el precio original (mantener los otros precios)
        const ticketsOtrosPrecios = empleado.tickets.filter(ticket =>
            parseFloat(ticket.precio_reja) !== precioOriginal
        );

        // Combinar tickets de otros precios con los nuevos tickets actualizados
        empleado.tickets = [...ticketsOtrosPrecios, ...nuevosTickets];

        // Si el empleado es REJA y queda sin tickets, eliminarlo del JSON
        if (empleado.concepto === 'REJA' && empleado.tickets.length === 0) {
            const indexEmpleado = departamentoCorte.empleados.indexOf(empleado);
            if (indexEmpleado > -1) {
                departamentoCorte.empleados.splice(indexEmpleado, 1);
                console.log('Empleado eliminado del JSON (sin tickets):', nombreEmpleado);
            }
        } else {
            console.log('Tickets actualizados para:', nombreEmpleado, nuevosTickets);
        }

        return true;

    } catch (error) {
        console.error('Error al actualizar tickets del empleado:', error);
        return false;
    }
}


// Evento para guardar los cambios al hacer click en el botón de guardar de rejas
$(btn_guardar_cambios_reja_corte).on('click', function (e) {
    e.preventDefault();

    Swal.fire({
        title: "Confirmar cambios",
        text: "¿Seguro que deseas guardar los cambios? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2b59bc",
        cancelButtonColor: "rgb(123, 123, 123)",
        confirmButtonText: "Sí, guardar cambios",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {

            // Obtener el nombre del empleado y precio actual
            const nombreEmpleado = $('#span_nombre_cortador_reja').text().trim();
            const precioOriginal = parseFloat($('#span_precio_reja').text().replace('$', '').replace(/,/g, ''));

            // Recopilar los nuevos tickets de los inputs
            const nuevosTickets = recopilarTicketsDelModal();

            // Actualizar el empleado en el JSON
            const actualizado = actualizarTicketsEmpleado(jsonNominaRelicario, nombreEmpleado, precioOriginal, nuevosTickets);

            if (actualizado) {
                // Mostrar mensaje de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Tickets actualizados',
                    text: 'Los tickets del empleado han sido actualizados correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Se actualiza la tabla y se cierra el modal
                mostrarDatosTablaCorte(jsonNominaRelicario);
                modal_corte_reja_detalles.hide();
            } else {
                // Mostrar mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: 'No se pudieron actualizar los tickets del empleado.',
                    confirmButtonColor: '#bc2b2b'
                });
            }
        }
    });

});


// Eliminar la nomina del empleado
$(document).on('click', '#btn_borrar_nomina', function (e) {
    e.preventDefault();

    const nombre = $(this).attr('data-nombre');

    Swal.fire({
        title: "Eliminar Nómina de " + nombre,
        text: "Esta acción eliminará el concepto Nomina, ¿seguro de continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d63030",
        cancelButtonColor: "rgb(167, 167, 167)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            
            if (jsonNominaRelicario == null) {
                alerta("error", "Error de datos", "No se pudo eliminar la nómina porque no se han cargado los datos correctamente.");
                return;
            }

            try {
                // Buscar el departamento "Corte"
                const departamentoCorte = jsonNominaRelicario.departamentos.find(dept => dept.nombre === 'Corte');
                
                if (!departamentoCorte) {
                    alerta("error", "Departamento no encontrado", "El departamento 'Corte' no existe en los datos.");
                    return;
                }

                // Buscar y eliminar el empleado con concepto "NOMINA"
                const indexEmpleado = departamentoCorte.empleados.findIndex(emp => 
                    emp.nombre === nombre && emp.concepto === 'NOMINA'
                );

                if (indexEmpleado === -1) {
                    alerta("error", "Nómina no encontrada", "No se encontró la nómina del empleado " + nombre);
                    return;
                }

                // Eliminar el empleado con concepto NOMINA
                departamentoCorte.empleados.splice(indexEmpleado, 1);

                console.log('Nómina eliminada para:', nombre);

                // Mostrar mensaje de éxito
                alerta("success", "Nómina eliminada", "La nómina de " + nombre + " ha sido eliminada correctamente.");

                // Refrescar la tabla y cerrar el modal
                mostrarDatosTablaCorte(jsonNominaRelicario);
                modal_corte_nomina_detalles.hide();

            } catch (error) {
                console.error('Error al eliminar la nómina:', error);
                alerta("error", "Error al eliminar", "Ocurrió un error al intentar eliminar la nómina.");
            }
        }
    });

=======
const $menu_corte = $('#context_menu_corte');

// Variable para almacenar la fila seleccionada de Nomina de cortador
const modal_corte_nomina_detalles = new bootstrap.Modal(document.getElementById('modalCorteNominaDetalles'));
const btn_guardar_cambios_nomina_corte = document.getElementById('btn_guardar_cambios_nomina_corte');
// Variable para almacenar la fila seleccionada de Reja de corte
const modal_corte_reja_detalles = new bootstrap.Modal(document.getElementById('modalCorteRejasDetalles'));
const btn_guardar_cambios_reja_corte = document.getElementById('btn_guardar_cambios_reja_corte');


$(document).ready(function () {
    mostrarContextMenuCorte();

});


// Funciones para mostrar el menú contextual y abrir los modales correspondientes
function mostrarContextMenuCorte() {
    // Click derecho en fila de la tabla
    $('#tabla-nomina-corte').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        filaSeleccionada = $(this);

        // Posicionar y mostrar menú
        $menu_corte.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        }).show();
    });

    // Cerrar menú al hacer click en otro lugar
    $(document).on('click', function () {
        $menu_corte.hide();
    });
}


/**
 * Abrir los modales correspondientes según el concepto de la fila seleccionada
 */
$(document).on('click', '#context_menu_corte', function (e) {
    e.preventDefault();

    const concepto = String(filaSeleccionada.data('concepto') || '').trim();
    const nombre = String(filaSeleccionada.data('nombre') || '').trim();
    const precio = String(filaSeleccionada.data('precio') || '').trim();

    switch (concepto) {
        case 'REJA':
            inicializar_modal_corte_rejas_detalles(jsonNominaRelicario, nombre, precio);
            break;
        case 'NOMINA':
            inicializar_modal_corte_nomina_detalles(jsonNominaRelicario, nombre);
            break;
        default:
            console.warn('Concepto no reconocido');
            alerta("warning", "Concepto no reconocido", "no se puede mostrar el detalle.");
            break;
    }
});


/**
 * INCIALIZAR EL MODAL PARA LOS DETALLES DE LA NOMINA DE CORTE
 * @param {JsonObject} json jsonNominaRelicario de process_excel.js
 * @param {string} nombreEmpleado nombre del empleado para filtrar
 * @returns 
 */
function inicializar_modal_corte_nomina_detalles(json, nombreEmpleado) {
    // Obtener el nombre del empleado de la fila seleccionada
    const nombre = nombreEmpleado || String(filaSeleccionada.data('nombre') || '').trim();

    // Buscar el empleado en el departamento "Corte" con concepto "NOMINA"
    const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
    if (!departamentoCorte) {
        console.error('Departamento Corte no encontrado');
        return;
    }

    const empleado = departamentoCorte.empleados.find(emp =>
        emp.nombre === nombre && emp.concepto === 'NOMINA'
    );

    if (!empleado || !empleado.nomina) {
        console.error('Empleado no encontrado o no tiene datos de nómina');
        return;
    }

    // Procesar la información de nómina
    const datosNomina = procesarDatosNomina(empleado);

    // Llenar el primer tab (Detalles)
    llenarTabDetalles(empleado.nombre, datosNomina);

    // Llenar el segundo tab (Pagos por día)
    llenarTabPagosPorDia(empleado.nomina);

    modal_corte_nomina_detalles.show();
}

/**
 * Procesa los datos de nómina del empleado
 */
function procesarDatosNomina(empleado) {
    const pagos = empleado.nomina.filter(dia => dia.pago > 0);

    // Calcular el sueldo diario más frecuente
    const sueldosFrecuencia = {};
    pagos.forEach(dia => {
        const pago = parseFloat(dia.pago);
        sueldosFrecuencia[pago] = (sueldosFrecuencia[pago] || 0) + 1;
    });

    const sueldoDiario = Object.keys(sueldosFrecuencia).reduce((a, b) =>
        sueldosFrecuencia[a] > sueldosFrecuencia[b] ? a : b, 0
    );

    // Contar días trabajados
    const diasTrabajados = pagos.length;

    // Calcular total efectivo
    const totalEfectivo = empleado.nomina.reduce((total, dia) =>
        total + parseFloat(dia.pago), 0
    );

    return {
        sueldoDiario: parseFloat(sueldoDiario),
        diasTrabajados,
        totalEfectivo
    };
}

/**
 * Llena el tab de detalles del modal
 */
function llenarTabDetalles(nombre, datos) {
    $('#span_nombre_cortador').text(nombre);
    $('#span_sueldo_diario').text(`$${datos.sueldoDiario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#span_dias_trabajados').text(datos.diasTrabajados);
    $('#span_total_efectivo').text(`$${datos.totalEfectivo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#badge_nombre_cortador').html(`<i class="bi bi-person-fill me-2"></i>${nombre}`);

    // Se agrega el nombre del empleado como un parametro data
    $('#btn_borrar_nomina').attr('data-nombre', nombre);
}

/**
 * Llena el tab de pagos por día del modal
 */
function llenarTabPagosPorDia(nomina) {
    // Crear un mapa de pagos por día
    const pagosPorDia = {};
    nomina.forEach(dia => {
        pagosPorDia[dia.dia.toUpperCase()] = parseFloat(dia.pago) || 0;
    });

    // Mapeo de días en español a los IDs de los inputs
    const mapaDias = {
        'VIERNES': 'viernes',
        'SABADO': 'sabado',
        'DOMINGO': 'domingo',
        'LUNES': 'lunes',
        'MARTES': 'martes',
        'MIERCOLES': 'miercoles',
        'JUEVES': 'jueves'
    };

    // Llenar los inputs
    let totalPagos = 0;
    Object.keys(mapaDias).forEach(dia => {
        const pago = pagosPorDia[dia] || 0;
        const inputId = `pago_editar_${mapaDias[dia]}`;
        $(`#${inputId}`).val(pago > 0 ? pago : '');
        totalPagos += pago;
    });

    // Actualizar el total
    $('#total_pagos_nomina_editar').text(`$${totalPagos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}



// ==================================================================================
// Funciones para preparar la actualización de los pagos del modal de nómina de corte
// ==================================================================================

/**
 * Recopila los pagos del modal de edición
 */
function recopilarPagosDelModal() {
    const mapaDias = {
        'viernes': 'VIERNES',
        'sabado': 'SABADO',
        'domingo': 'DOMINGO',
        'lunes': 'LUNES',
        'martes': 'MARTES',
        'miercoles': 'MIERCOLES',
        'jueves': 'JUEVES'
    };

    const pagos = [];

    Object.keys(mapaDias).forEach(inputDia => {
        const valor = parseFloat($(`#pago_editar_${inputDia}`).val()) || 0;
        pagos.push({
            dia: mapaDias[inputDia],
            pago: valor
        });
    });

    return pagos;
}

/**
 * Actualiza los pagos de un empleado en el JSON
 */
function actualizarPagosEmpleado(json, nombreEmpleado, nuevosPageos) {
    try {
        const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
        if (!departamentoCorte) {
            console.error('Departamento Corte no encontrado');
            return false;
        }

        const empleado = departamentoCorte.empleados.find(emp =>
            emp.nombre === nombreEmpleado && emp.concepto === 'NOMINA'
        );

        if (!empleado) {
            console.error('Empleado no encontrado');
            return false;
        }

        // Actualizar los pagos del empleado
        empleado.nomina = nuevosPageos;

        console.log('Pagos actualizados para:', nombreEmpleado, nuevosPageos);
        return true;

    } catch (error) {
        console.error('Error al actualizar pagos del empleado:', error);
        return false;
    }
}

/**
 * Actualiza el total de pagos automáticamente cuando cambian los inputs
 */
function actualizarTotalPagosAutomatico() {
    const mapaDias = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];

    let total = 0;
    mapaDias.forEach(dia => {
        const valor = parseFloat($(`#pago_editar_${dia}`).val()) || 0;
        total += valor;
    });

    $('#total_pagos_nomina_editar').text(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
}

// Evento para actualizar el total automáticamente cuando cambian los inputs
$(document).on('input', '.pago_del_dia_editar', function () {
    actualizarTotalPagosAutomatico();
});

// Evento para limpiar un día específico
$(document).on('click', '.btn_limpiar_dia', function () {
    const fila = $(this).closest('tr');
    const input = fila.find('.pago_del_dia_editar');
    input.val('');
    actualizarTotalPagosAutomatico();
});

// Evento para guardar los cambios al hacer click en el botón de guardar
$(btn_guardar_cambios_nomina_corte).on('click', function (e) {
    e.preventDefault();

    // Obtener el nombre del empleado actual
    const nombreEmpleado = $('#span_nombre_cortador').text().trim();

    // Recopilar los nuevos pagos de los inputs
    const nuevosPageos = recopilarPagosDelModal();

    // Actualizar el empleado en el JSON
    const actualizado = actualizarPagosEmpleado(jsonNominaRelicario, nombreEmpleado, nuevosPageos);

    if (actualizado) {
        // Mostrar mensaje de éxito
        alerta("success", "Pagos actualizados", "Los pagos del empleado han sido actualizados correctamente.");

        // Después de actualizar los datos, cerrar el modal y refrescar la tabla
        mostrarDatosTablaCorte(jsonNominaRelicario);
        modal_corte_nomina_detalles.hide();
    } else {
        // Mostrar mensaje de error
        alerta("error", "Error al actualizar", "No se pudieron actualizar los pagos del empleado.");
    }
});


/**
 * ===========================================================
 * INCIALIZAR EL MODAL PARA LOS DETALLES DE LAS REJAS DE CORTE
 * ===========================================================
 */

/**
 * INCIALIZAR EL MODAL PARA LOS DETALLES DE LAS REJAS DE CORTE
 * @param {JsonObject} json jsonNominaRelicario de process_excel.js
 * @param {string} nombreEmpleado nombre del empleado para filtrar
 * @param {float} precioReja precio de la reja para filtrar los tickets
 * @returns 
 */
function inicializar_modal_corte_rejas_detalles(json, nombreEmpleado, precioReja) {
    // Obtener el nombre del empleado de la fila seleccionada
    const nombre = nombreEmpleado || String(filaSeleccionada.data('nombre') || '').trim();
    const precio = parseFloat(precioReja) || 0;

    // Buscar el empleado en el departamento "Corte" con concepto "REJA"
    const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
    if (!departamentoCorte) {
        console.error('Departamento Corte no encontrado');
        return;
    }

    const empleado = departamentoCorte.empleados.find(emp =>
        emp.nombre === nombre && emp.concepto === 'REJA'
    );

    if (!empleado || !empleado.tickets) {
        console.error('Empleado no encontrado o no tiene tickets de rejas');
        return;
    }

    // Filtrar tickets por el precio especificado
    const ticketsPorPrecio = empleado.tickets.filter(ticket =>
        parseFloat(ticket.precio_reja) === precio
    );

    if (ticketsPorPrecio.length === 0) {
        console.error('No se encontraron tickets para el precio especificado');
        return;
    }

    // Procesar la información de rejas
    const datosRejas = procesarDatosRejas(ticketsPorPrecio, precio);

    // Llenar el primer tab (Detalles)
    llenarTabDetallesRejas(empleado.nombre, datosRejas);

    // Llenar el segundo tab (Tickets de rejas)
    llenarTabTicketsRejas(ticketsPorPrecio);

    modal_corte_reja_detalles.show();
}


/**
 * Procesa los datos de rejas del empleado para un precio específico
 * @param {Array} tickets - Array de tickets del empleado filtrados por precio
 * @param {Number} precio - Precio por reja
 * @returns {Object} Datos procesados
 */
function procesarDatosRejas(tickets, precio) {
    let totalRejas = 0;

    // Calcular el total de rejas sumando todas las cantidades de todos los tickets
    tickets.forEach(ticket => {
        ticket.datosRejas.forEach(tabla => {
            totalRejas += parseInt(tabla.cantidad) || 0;
        });
    });

    const totalEfectivo = totalRejas * precio;

    return {
        totalRejas,
        precioReja: precio,
        totalEfectivo
    };
}


/**
 * Llena el tab de detalles del modal de rejas
 * @param {String} nombre - Nombre del empleado
 * @param {Object} datos - Datos procesados de rejas
 */
function llenarTabDetallesRejas(nombre, datos) {
    $('#span_nombre_cortador_reja').text(nombre);
    $('#span_total_rejas').text(datos.totalRejas.toLocaleString('en-US'));
    $('#span_precio_reja').text(`$${datos.precioReja.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#span_total_efectivo_reja').text(`$${datos.totalEfectivo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    $('#badge_nombre_cortador_reja').html(`<i class="bi bi-person-fill me-2"></i>${nombre}`);
}


/**
 * Llena el tab de tickets de rejas con inputs editables
 * @param {Array} tickets - Array de tickets filtrados por precio
 */
function llenarTabTicketsRejas(tickets) {
    let htmlTickets = '';

    tickets.forEach((ticket, index) => {
        htmlTickets += generarHtmlTicket(ticket, index);
    });

    // Insertar el HTML en el contenedor del segundo tab
    $('#lista-reja-tab-pane').html(`
        <div class="mt-3">
            <div class="row">
                <div class="col-12">
                    <h6 class="text-muted mb-3">Tickets de Rejas</h6>
                </div>
            </div>
            ${htmlTickets}
        </div>
    `);
}


/**
 * Genera el HTML para un ticket individual
 * @param {Object} ticket - Datos del ticket
 * @param {Number} index - Índice del ticket
 * @returns {String} HTML del ticket
 */
function generarHtmlTicket(ticket, index) {
    let htmlTablas = '';

    // Generar HTML para cada tabla del ticket
    ticket.datosRejas.forEach((tabla, tablaIndex) => {
        htmlTablas += `
            <div class="row align-items-center mb-2">
                <div class="col-4">
                    <label class="form-label">Tabla de Origen:</label>
                    <input type="number" class="form-control form-control-sm shadow-sm" 
                           value="${tabla.tabla}" 
                           id="tabla_${index}_${tablaIndex}">
                </div>
                <div class="col-4">
                    <label class="form-label">Cantidad:</label>
                    <input type="number" class="form-control form-control-sm shadow-sm" 
                           value="${tabla.cantidad}" 
                           id="cantidad_${index}_${tablaIndex}">
                </div>
                <div class="col-4">
                    <button type="button" class="btn btn-outline-danger btn-sm mt-4 shadow-sm" 
                            onclick="eliminarTabla(${index}, ${tablaIndex})" 
                            title="Eliminar tabla">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    return `
        <div class="card mb-3" id="ticket_${index}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">Ticket #${ticket.folio}</h6>
                <button type="button" class="btn btn-outline-danger btn-sm" 
                        onclick="eliminarTicket(${index})" 
                        title="Eliminar ticket completo">
                    <i class="bi bi-trash"></i> Eliminar Ticket
                </button>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col-6">
                        <label class="form-label">Folio:</label>
                        <input type="text" class="form-control form-control-sm shadow-sm" 
                               value="${ticket.folio}" 
                               id="folio_${index}">
                    </div>
                    <div class="col-6">
                        <label class="form-label">Fecha:</label>
                        <input type="date" class="form-control form-control-sm shadow-sm" 
                               value="${ticket.fecha}" 
                               id="fecha_${index}">
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label fw-bold">Tablas y Cantidades:</label>
                    <div id="tablas_container_${index}">
                        ${htmlTablas}
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm mt-2" 
                            onclick="agregarTabla(${index})">
                        <i class="bi bi-plus"></i> Agregar Tabla
                    </button>
                </div>
                
                <div class="row">
                    <div class="col-6">
                        <label class="form-label">Precio por Reja:</label>
                        <input type="number" step="0.01" class="form-control form-control-sm shadow-sm" 
                               value="${ticket.precio_reja}" 
                               id="precio_${index}">
                    </div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Elimina un ticket completo
 * @param {Number} ticketIndex - Índice del ticket a eliminar
 */
function eliminarTicket(ticketIndex) {
    Swal.fire({
        title: "Eliminar Ticket",
        text: "¿Seguro que deseas eliminar este ticket completo? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#bc2b2b",
        cancelButtonColor: "rgb(123, 123, 123)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Eliminar el del html
            $(`#ticket_${ticketIndex}`).remove();
        }
    });
}


/**
 * Elimina una tabla específica de un ticket
 * @param {Number} ticketIndex - Índice del ticket
 * @param {Number} tablaIndex - Índice de la tabla a eliminar
 */
function eliminarTabla(ticketIndex, tablaIndex) {
    Swal.fire({
        title: "Eliminar registro de tabla",
        text: "¿Seguro que deseas eliminar esta tabla? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#bc2b2b",
        cancelButtonColor: "rgb(123, 123, 123)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Buscar y eliminar la fila de la tabla específica
            $(`#tabla_${ticketIndex}_${tablaIndex}`).closest('.row').remove();
        }
    });
}


/**
 * Agrega una nueva tabla a un ticket específico
 * @param {Number} ticketIndex - Índice del ticket
 */
function agregarTabla(ticketIndex) {
    // Contar cuántas tablas ya existen para este ticket
    const tablasExistentes = $(`#tablas_container_${ticketIndex} .row`).length;
    const nuevoIndice = tablasExistentes;

    const nuevaTablaHtml = `
        <div class="row align-items-center mb-2">
            <div class="col-4">
                <label class="form-label">Tabla de Origen:</label>
                <input type="number" class="form-control form-control-sm" 
                       value="" 
                       placeholder="Número de tabla"
                       id="tabla_${ticketIndex}_${nuevoIndice}">
            </div>
            <div class="col-4">
                <label class="form-label">Cantidad:</label>
                <input type="number" class="form-control form-control-sm" 
                       value="" 
                       placeholder="Cantidad de rejas"
                       id="cantidad_${ticketIndex}_${nuevoIndice}">
            </div>
            <div class="col-4">
                <button type="button" class="btn btn-outline-danger btn-sm mt-4" 
                        onclick="eliminarTabla(${ticketIndex}, ${nuevoIndice})" 
                        title="Eliminar tabla">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;

    $(`#tablas_container_${ticketIndex}`).append(nuevaTablaHtml);
    console.log(`Nueva tabla agregada al ticket ${ticketIndex}`);
}


/**
 * ===========================================================
 * GUARDAR LOS CAMBIOS DE LOS TICKETS DE REJAS
 * ===========================================================
 */

/**
 * Recopila los tickets del modal de edición
 * @returns {Array} Array con los tickets actualizados
 */
function recopilarTicketsDelModal() {
    const tickets = [];

    // Recorrer todas las tarjetas de tickets visibles
    $('#lista-reja-tab-pane .card').each(function (index) {
        const ticketId = $(this).attr('id');
        if (!ticketId) return; // Saltar si no tiene ID (ticket eliminado)

        const ticketIndex = ticketId.split('_')[1];

        // Obtener datos básicos del ticket
        const folio = $(`#folio_${ticketIndex}`).val().trim();
        const fecha = $(`#fecha_${ticketIndex}`).val();
        const precioReja = parseFloat($(`#precio_${ticketIndex}`).val()) || 0;

        // Recopilar datosRejas (tablas y cantidades)
        const datosRejas = [];
        $(`#tablas_container_${ticketIndex} .row`).each(function () {
            const tablaInput = $(this).find('input[id^="tabla_"]');
            const cantidadInput = $(this).find('input[id^="cantidad_"]');

            if (tablaInput.length && cantidadInput.length) {
                const tabla = parseInt(tablaInput.val()) || 0;
                const cantidad = parseInt(cantidadInput.val()) || 0;

                if (tabla > 0 && cantidad > 0) {
                    datosRejas.push({
                        tabla: tabla,
                        cantidad: cantidad
                    });
                }
            }
        });

        // Solo agregar el ticket si tiene datos válidos
        if (folio && fecha && datosRejas.length > 0) {
            tickets.push({
                folio: folio,
                fecha: fecha,
                datosRejas: datosRejas,
                precio_reja: precioReja
            });
        }
    });

    return tickets;
}


/**
 * Actualiza los tickets de un empleado en el JSON para un precio específico
 * @param {Object} json - El objeto JSON completo
 * @param {String} nombreEmpleado - Nombre del empleado a actualizar
 * @param {Number} precioOriginal - Precio original para filtrar los tickets a actualizar
 * @param {Array} nuevosTickets - Array con los nuevos tickets
 * @returns {Boolean} True si se actualizó correctamente, false en caso contrario
 */
function actualizarTicketsEmpleado(json, nombreEmpleado, precioOriginal, nuevosTickets) {
    try {
        const departamentoCorte = json.departamentos.find(dept => dept.nombre === 'Corte');
        if (!departamentoCorte) {
            console.error('Departamento Corte no encontrado');
            return false;
        }

        const empleado = departamentoCorte.empleados.find(emp =>
            emp.nombre === nombreEmpleado && emp.concepto === 'REJA'
        );

        if (!empleado) {
            console.error('Empleado no encontrado');
            return false;
        }

        // Filtrar tickets que NO tengan el precio original (mantener los otros precios)
        const ticketsOtrosPrecios = empleado.tickets.filter(ticket =>
            parseFloat(ticket.precio_reja) !== precioOriginal
        );

        // Combinar tickets de otros precios con los nuevos tickets actualizados
        empleado.tickets = [...ticketsOtrosPrecios, ...nuevosTickets];

        // Si el empleado es REJA y queda sin tickets, eliminarlo del JSON
        if (empleado.concepto === 'REJA' && empleado.tickets.length === 0) {
            const indexEmpleado = departamentoCorte.empleados.indexOf(empleado);
            if (indexEmpleado > -1) {
                departamentoCorte.empleados.splice(indexEmpleado, 1);
                console.log('Empleado eliminado del JSON (sin tickets):', nombreEmpleado);
            }
        } else {
            console.log('Tickets actualizados para:', nombreEmpleado, nuevosTickets);
        }

        return true;

    } catch (error) {
        console.error('Error al actualizar tickets del empleado:', error);
        return false;
    }
}


// Evento para guardar los cambios al hacer click en el botón de guardar de rejas
$(btn_guardar_cambios_reja_corte).on('click', function (e) {
    e.preventDefault();

    Swal.fire({
        title: "Confirmar cambios",
        text: "¿Seguro que deseas guardar los cambios? Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2b59bc",
        cancelButtonColor: "rgb(123, 123, 123)",
        confirmButtonText: "Sí, guardar cambios",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {

            // Obtener el nombre del empleado y precio actual
            const nombreEmpleado = $('#span_nombre_cortador_reja').text().trim();
            const precioOriginal = parseFloat($('#span_precio_reja').text().replace('$', '').replace(/,/g, ''));

            // Recopilar los nuevos tickets de los inputs
            const nuevosTickets = recopilarTicketsDelModal();

            // Actualizar el empleado en el JSON
            const actualizado = actualizarTicketsEmpleado(jsonNominaRelicario, nombreEmpleado, precioOriginal, nuevosTickets);

            if (actualizado) {
                // Mostrar mensaje de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Tickets actualizados',
                    text: 'Los tickets del empleado han sido actualizados correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Se actualiza la tabla y se cierra el modal
                mostrarDatosTablaCorte(jsonNominaRelicario);
                modal_corte_reja_detalles.hide();
            } else {
                // Mostrar mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    text: 'No se pudieron actualizar los tickets del empleado.',
                    confirmButtonColor: '#bc2b2b'
                });
            }
        }
    });

});


// Eliminar la nomina del empleado
$(document).on('click', '#btn_borrar_nomina', function (e) {
    e.preventDefault();

    const nombre = $(this).attr('data-nombre');

    Swal.fire({
        title: "Eliminar Nómina de " + nombre,
        text: "Esta acción eliminará el concepto Nomina, ¿seguro de continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d63030",
        cancelButtonColor: "rgb(167, 167, 167)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            
            if (jsonNominaRelicario == null) {
                alerta("error", "Error de datos", "No se pudo eliminar la nómina porque no se han cargado los datos correctamente.");
                return;
            }

            try {
                // Buscar el departamento "Corte"
                const departamentoCorte = jsonNominaRelicario.departamentos.find(dept => dept.nombre === 'Corte');
                
                if (!departamentoCorte) {
                    alerta("error", "Departamento no encontrado", "El departamento 'Corte' no existe en los datos.");
                    return;
                }

                // Buscar y eliminar el empleado con concepto "NOMINA"
                const indexEmpleado = departamentoCorte.empleados.findIndex(emp => 
                    emp.nombre === nombre && emp.concepto === 'NOMINA'
                );

                if (indexEmpleado === -1) {
                    alerta("error", "Nómina no encontrada", "No se encontró la nómina del empleado " + nombre);
                    return;
                }

                // Eliminar el empleado con concepto NOMINA
                departamentoCorte.empleados.splice(indexEmpleado, 1);

                console.log('Nómina eliminada para:', nombre);

                // Mostrar mensaje de éxito
                alerta("success", "Nómina eliminada", "La nómina de " + nombre + " ha sido eliminada correctamente.");

                // Refrescar la tabla y cerrar el modal
                mostrarDatosTablaCorte(jsonNominaRelicario);
                modal_corte_nomina_detalles.hide();

            } catch (error) {
                console.error('Error al eliminar la nómina:', error);
                alerta("error", "Error al eliminar", "Ocurrió un error al intentar eliminar la nómina.");
            }
        }
    });

>>>>>>> d47f2597972a63bfde96235bb44ebc1d4a071513
});