function listarEmpleados() {
        // Buscar empleados al escribir en el campo nombreEmpleado
    $('#nombreEmpleado').on('keyup', function () {
        let busqueda = $(this).val();
        
        // Solo buscar si hay al menos 2 caracteres
        if (busqueda.length >= 2) {
            buscarEmpleados(busqueda);
        } else {
            $('#listaEmpleados').hide();
        }
    });
    
    // Ocultar la lista al hacer clic fuera
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#nombreEmpleado').length) {
            $('#listaEmpleados').hide();
        }
    });
}

// Función para buscar empleados
function buscarEmpleados(termino) {
    $.ajax({
        url: '../php/listaEmpleado.php',
        type: 'POST',
        data: { busqueda: termino },
        dataType: 'json',
        success: function (empleados) {
            mostrarListaEmpleados(empleados);
        },
        error: function () {
            console.error('Error al buscar empleados');
        }
    });
}

// Función para mostrar la lista de empleados
function mostrarListaEmpleados(empleados) {
    let lista = $('#listaEmpleados');
    lista.empty();
    
    if (empleados.length > 0) {
        empleados.forEach(function (empleado) {
            let item = `
                <div class="lista-item" data-id="${empleado.id_empleado}">
                    <strong>${empleado.nombre_completo}</strong>
                    <br>
                    <small>Clave: ${empleado.clave_empleado}</small>
                </div>
            `;
            lista.append(item);
        });
        
        lista.show();
        
        // Al hacer clic en un empleado
        $('.lista-item').on('click', function () {
            let id = $(this).data('id');
            let nombre = $(this).find('strong').text();
            
            $('#nombreEmpleado').val(nombre);
            $('#empleadoIdSeleccionado').val(id);
            lista.hide();
        });
    } else {
        lista.html('<div class="lista-item">No se encontraron empleados</div>');
        lista.show();
    }
}

function calcularMontoSemanal() {
    // Calcular monto semanal al ingresar monto del concepto y total de semanas
    $('#montoConcepto, #totalSemanas').on('input', function () {
        let montoConcepto = parseFloat($('#montoConcepto').val()) || 0;
        let totalSemanas = parseInt($('#totalSemanas').val()) || 0;

        if (montoConcepto > 0 && totalSemanas > 0) {
            let montoSemanal = (montoConcepto / totalSemanas).toFixed(2);
            $('#montoSemanal').val(montoSemanal);
        } else {
            $('#montoSemanal').val('');
        }
    });
}

function guardarPrestamo() {
    // Manejar el envío del formulario
    $('#formNuevoPrestamo').on('submit', function (e) {
        e.preventDefault();

        // Validar que se haya seleccionado un empleado
        let empleadoId = $('#empleadoIdSeleccionado').val();
        if (!empleadoId) {
            alert('Debe seleccionar un empleado de la lista');
            return;
        }

        // Obtener los datos del formulario
        let datos = {
            id_empleado: empleadoId,
            concepto: $('#conceptoPrestamo').val(),
            monto_concepto: $('#montoConcepto').val(),
            monto_semanal: $('#montoSemanal').val(),
            semanas_totales: $('#totalSemanas').val(),
            notas: $('#descripcionPrestamo').val()
        };

        // Enviar al servidor
        $.ajax({
            url: '../php/nuevoPrestamo.php',
            type: 'POST',
            data: datos,
            dataType: 'json',
            success: function (respuesta) {
                if (respuesta.success) {
                    alert('Préstamo registrado exitosamente');
                    $('#modalNuevoPresupuesto').modal('hide');
                    $('#formNuevoPrestamo')[0].reset();
                    $('#empleadoIdSeleccionado').val('');
                    // Recargar la tabla de préstamos y actualizar estadísticas
                    cargarTablaPrestamos();
                    actualizarEstadisticas();
                } else {
                    alert('Error: ' + respuesta.mensaje);
                }
            },
            error: function () {
                alert('Error al guardar el préstamo');
            }
        });
    });
}


