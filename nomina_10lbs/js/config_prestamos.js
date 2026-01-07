// Funciones para modal de préstamos: obtener por id_empleado y mostrar en tabla
function openModalPrestamos() {
    // Abrir modal de préstamos
    $("#btn-ver-prestamos").on("click", function () {
        // Intentar obtener id_empleado guardado en modal-detalles
        let idEmpleado = $('#modal-detalles').data('id-empleado') || null;

        // Si no existe, intentar obtener por la clave mostrada en el modal
        if (!idEmpleado) {
            const clave = $('#campo-clave').text().trim();
            if (clave) {
                idEmpleado = obtenerIdEmpleado(clave);
            }
        }

        if (!idEmpleado) {
            alert('No se pudo obtener el ID del empleado.');
            return;
        }

        // Cerrar el modal personalizado modal-detalles
        $("#modal-detalles").hide();

        // Abrir el modal de préstamos
        $("#modal-prestamos").modal("show");

        // Cargar los préstamos del empleado
        obtenerPrestamosEmpleado(idEmpleado);
    });

    // Cuando se cierra el modal de préstamos, volver a abrir modal-detalles
    $("#modal-prestamos").on("hidden.bs.modal", function () {
        $("#modal-detalles").show();
    });
    pagarPrestamo();
    configurarModPrestamos();
}

// Busca id_empleado en jsonNominaConfianza por clave (intenta varias propiedades para compatibilidad)
function obtenerIdEmpleado(claveEmpleado) {
    let idEmpleado = null;
    if (!jsonNominaConfianza || !Array.isArray(jsonNominaConfianza.departamentos)) return null;

    jsonNominaConfianza.departamentos.forEach(function (departamento) {
        if (!Array.isArray(departamento.empleados)) return;
        departamento.empleados.forEach(function (empleado) {
            const clave1 = String(empleado.clave || empleado.clave_empleado || '').trim();
            const clave2 = String(claveEmpleado).trim();
            if (clave1 !== '' && clave1 === clave2) {
                idEmpleado = empleado.id_empleado || empleado.idEmpleado || null;
            }
        });
    });

    return idEmpleado;
}


// Obtiene préstamos activos por id_empleado y los muestra en la tabla del modal
function obtenerPrestamosEmpleado(idEmpleado) {
    // Mostrar fila de carga
    $('#lista-prestamos-activos').html('<tr><td colspan="8" class="text-center">Cargando...</td></tr>');

    $.ajax({
        url: '../php/obtenerPrestamos.php',
        type: 'POST',
        data: { id_empleado: idEmpleado },
        dataType: 'json',
        success: function (res) {
            if (!res || !res.success) {
                const msg = res && res.message ? res.message : 'Error al obtener préstamos';
                $('#lista-prestamos-activos').html('<tr><td colspan="6">' + msg + '</td></tr>');
                return;
            }

            const prestamos = Array.isArray(res.prestamos) ? res.prestamos : [];
            if (prestamos.length === 0) {
                $('#lista-prestamos-activos').html('<tr><td colspan="8">No hay préstamos activos</td></tr>');
                return;
            }

            let rows = '';
            prestamos.forEach(function (p) {
                const semanasTotales = Number(p.semanas_totales) || 0;
                const semanasPagadas = Number(p.semanas_pagadas) || 0;
                const progreso = semanasTotales > 0 ? Math.round((semanasPagadas / semanasTotales) * 100) : 0;

                const estadoClass = p.estado === 'activo' ? 'bg-success' : (p.estado === 'pendiente' ? 'bg-warning' : 'bg-secondary');

                rows += `
                    <tr>
                        <td>$${parseFloat(p.monto_total).toFixed(2)}</td>
                        <td>${semanasPagadas} / ${semanasTotales}</td>
                        <td>$${parseFloat(p.monto_semanal).toFixed(2)}</td>
                        <td>$${parseFloat(p.saldo_restante).toFixed(2)}</td>
                        <td><span class="badge ${estadoClass}">${p.estado}</span></td>
                        <td>${p.fecha_inicio}</td>
                        <td>
                            <div class="progress" style="height:18px;">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${progreso}%">${progreso}%</div>
                            </div>
                        </td>
                        <td style="white-space:nowrap;">
                            <button type="button" class="btn btn-sm btn-success btn-pagar-prestamo" data-id="${p.id_prestamo}" title="Pagar">
                                <i class="bi bi-currency-dollar"></i>
                            </button>
                        </td>
                    </tr>`;
            });

            $('#lista-prestamos-activos').html(rows);
        },
        error: function () {
            $('#lista-prestamos-activos').html('<tr><td colspan="8">Error en la petición</td></tr>');
        }
    });
}


// ========================================
// CUANDO SE HACE CLIC EN EL BOTÓN PAGAR
// ========================================

function pagarPrestamo() {
    $(document).on('click', '.btn-pagar-prestamo', function (e) {
        e.preventDefault();

        // PASO 1: Obtener el ID del préstamo y la fila
        const idPrestamo = $(this).data('id');
        const filaDelPrestamo = $(this).closest('tr');

        // PASO 2: Leer el monto semanal de la tabla (columna 3)
        const textoMonto = filaDelPrestamo.find('td').eq(2).text();
        const montoAPagar = parseFloat(textoMonto.replace(/[^0-9.-]+/g, ''));

        // PASO 3: Preguntar al usuario si está seguro
        const confirmar = confirm('¿Desea abonar $' + montoAPagar.toFixed(2) + ' al préstamo?');
        if (!confirmar) return; // Si dice NO, salir

        // PASO 4: Obtener el ID del empleado (guardado en el modal o buscando por clave)
        let idDelEmpleado = $('#modal-detalles').data('id-empleado');
        if (!idDelEmpleado) {
            const claveEmpleado = $('#campo-clave').text().trim();
            idDelEmpleado = obtenerIdEmpleado(claveEmpleado);
        }

        if (!idDelEmpleado) {
            alert('Error: No se pudo identificar al empleado');
            return;
        }

        // PASO 5: Enviar el pago al servidor
        $.ajax({
            url: '../php/pagarPrestamos.php',
            type: 'POST',
            data: {
                id_prestamo: idPrestamo,
                monto_pagado: montoAPagar
            },
            dataType: 'json',
            success: function(respuesta) {
                if (respuesta.success) {
                    // Buscar al empleado en la nómina y asignar el pago
                    let empleado = null;
                    jsonNominaConfianza.departamentos.forEach(function(departamento) {
                        departamento.empleados.forEach(function(emp) {
                            if (emp.id_empleado == idDelEmpleado) {
                                empleado = emp;
                            }
                        });
                    });

                    if (empleado) {
                        // Asignar el monto a la propiedad 'prestamo' del empleado
                        empleado.prestamo = montoAPagar;

                        // Actualizar el campo del modal si existe
                        if ($('#mod-prestamo').length) {
                            $('#mod-prestamo').val(montoAPagar.toFixed(2));
                        }
                    }

                    alert('✓ Pago registrado: Semana ' + respuesta.data.semanas_pagadas + ' de ' + respuesta.data.numero_semana + ' (año)\nSaldo restante: $' + respuesta.data.saldo_restante.toFixed(2));
                    
                    // Recargar la tabla de préstamos para mostrar cambios
                    obtenerPrestamosEmpleado(idDelEmpleado);
                } else {
                    alert('Error: ' + respuesta.message);
                }
            },
            error: function() {
                alert('Error al procesar el pago. Intente nuevamente.');
            }
        });
    });

}




