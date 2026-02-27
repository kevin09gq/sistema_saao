/**
 * Cargar el tabulador de costos en la tabla
 * Obtiene los datos del servidor y llena la tabla dinámicamente
 */
function cargarTabulador() {
    // ID de la empresa (asume que está en una variable global o en el DOM)
    var idEmpresa = 1; // Ajusta según tu lógica
    
    // Realizar petición AJAX para obtener datos del tabulador
    $.ajax({
        url: '../php/tabulador.php',
        type: 'POST',
        data: {
            accion: 'obtenerTabulador',
            id_empresa: idEmpresa
        },
        dataType: 'json',
        success: function(datos) {
            // Limpiar la tabla antes de llenarla
            var tbody = $('#tabulador-tbody');
            tbody.empty();
            
            // Validar que tenemos datos
            if (!datos || datos.length === 0) {
                tbody.html('<tr><td colspan="6" class="text-center text-muted">No hay datos disponibles</td></tr>');
                return;
            }
            
            // Recorrer cada rango y crear una fila en la tabla
            datos.forEach(function(item, index) {
                // Determinar si es hora extra
                var esHoraExtra = item.tipo === 'hora_extra';
                
                // Obtener los valores del rango
                var desde = item.rango.desde;
                var hasta = item.rango.hasta;
                var minutos = item.minutos || '';
                var sueldoBase = item.sueldo_base || '';
                var costoPorMinuto = item.costo_por_minuto || '';
                var sueldoEspecial = item.sueldo_especial || '';
                
                // Crear la fila HTML
                var fila = '<tr>';
                // Columna de checkbox para seleccionar fila
                fila += '<td><input type="checkbox" class="form-check-input checkbox-fila"></td>';
                // Columna "De la hora" - EDITABLE con formato HH:MM
                fila += '<td><input type="text" class="form-control form-control-sm tiempo-entrada" value="' + desde + '" placeholder="HH:MM"></td>';
                
                // Columna "A la" - EDITABLE con formato HH:MM
                // Si el valor es "en adelante", hacer readonly
                var esEnAdelante = hasta.toLowerCase() === 'en adelante';
                var atributoReadonly = esEnAdelante ? ' readonly style="background-color: #e9ecef; cursor: not-allowed;"' : '';
                fila += '<td><input type="text" class="form-control form-control-sm tiempo-salida" value="' + hasta + '" placeholder="HH:MM"' + atributoReadonly + '></td>';
                
                fila += '<td><input type="text" class="form-control form-control-sm minutos-trabajados" value="' + minutos + '"></td>';
                fila += '<td><input type="text" class="form-control form-control-sm sueldo-semanal" value="' + sueldoBase + '"></td>';
                fila += '<td><input type="text" class="form-control form-control-sm costo-minuto" value="' + costoPorMinuto + '"></td>';
                fila += '<td><input type="text" class="form-control form-control-sm adicional" value="' + sueldoEspecial + '"></td>';
                fila += '</tr>';
                
                // Agregar fila a la tabla
                tbody.append(fila);
            });
            
            // Agregar validación de formato HH:MM a los campos de tiempo
            validarFormatoHora();
        },
        error: function(xhr, status, error) {
            console.error('Error al cargar tabulador:', error);
            $('#tabulador-tbody').html('<tr><td colspan="6" class="text-center text-danger">Error al cargar datos</td></tr>');
        }
    });
}

/**
 * Actualizar el tabulador en la base de datos
 * Valida formato HH:MM, construye el JSON y lo envía al servidor
 * La última fila puede tener "en adelante" en el campo "A la"
 */
function actualizarTabulador() {
    // Expresión regular para validar HH:MM (permite cualquier número de horas: 01:00, 40:00, 100:00, etc.)
    var patronHora = /^\d+:[0-5][0-9]$/;
    
    // Array para almacenar los datos del tabulador
    var datosActualizados = [];
    var hayErrores = false;
    
    // ID de la empresa (ajusta según tu lógica)
    var idEmpresa = 1;
    
    // Obtener todas las filas
    var filas = $('#tabulador-tbody tr');
    var totalFilas = filas.length;
    
    // Recorrer cada fila de la tabla
    filas.each(function(index) {
        var fila = $(this);
        var esUltimaFila = (index === totalFilas - 1);
        
        // Obtener valores de los inputs
        var desde = fila.find('.tiempo-entrada').val().trim();
        var hasta = fila.find('.tiempo-salida').val().trim();
        var minutos = fila.find('.minutos-trabajados').val().trim();
        var sueldoBase = fila.find('.sueldo-semanal').val().trim();
        var costoPorMinuto = fila.find('.costo-minuto').val().trim();
        var sueldoEspecial = fila.find('.adicional').val().trim();
        
        // Validar "desde" (siempre debe ser HH:MM)
        if (!patronHora.test(desde)) {
            fila.find('.tiempo-entrada').addClass('is-invalid');
            hayErrores = true;
        } else {
            fila.find('.tiempo-entrada').removeClass('is-invalid');
        }
        
        // Validar "hasta"
        var hasValido = false;
        
        // Si es última fila, permite "en adelante" o HH:MM
        if (esUltimaFila) {
            if (hasta.toLowerCase() === 'en adelante' || patronHora.test(hasta)) {
                hasValido = true;
                fila.find('.tiempo-salida').removeClass('is-invalid');
            } else {
                fila.find('.tiempo-salida').addClass('is-invalid');
                hayErrores = true;
            }
        } else {
            // Para otras filas, debe ser HH:MM
            if (patronHora.test(hasta)) {
                hasValido = true;
                fila.find('.tiempo-salida').removeClass('is-invalid');
            } else {
                fila.find('.tiempo-salida').addClass('is-invalid');
                hayErrores = true;
            }
        }
        
        // Si no hay errores, agregar la fila al array
        if (!hayErrores && desde && hasta) {
            var registro = {
                rango: {
                    desde: desde,
                    hasta: hasta
                },
                minutos: parseInt(minutos) || 0,
                sueldo_base: parseFloat(sueldoBase) || 0,
                sueldo_especial: parseFloat(sueldoEspecial) || 0,
                costo_por_minuto: parseFloat(costoPorMinuto) || 0
            };
            
            datosActualizados.push(registro);
        }
    });
    
    // Si hay errores, mostrar alerta y no enviar
    if (hayErrores) {
        Swal.fire({
            icon: 'error',
            title: 'Errores de validación',
            text: 'Por favor, corrija los campos resaltados. Use formato HH:MM o "en adelante" en la última fila',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Si no hay datos, mostrar alerta
    if (datosActualizados.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sin datos',
            text: 'No hay datos para actualizar',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Convertir array a JSON string
    var jsonTabulador = JSON.stringify(datosActualizados);
    
    // Enviar datos al servidor
    $.ajax({
        url: '../php/tabulador.php',
        type: 'POST',
        data: {
            accion: 'actualizarTabulador',
            id_empresa: idEmpresa,
            info_tabulador: jsonTabulador
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: response.message,
                    confirmButtonText: 'Aceptar'
                });
                // Recargar tabulador después de actualizar
                cargarTabulador();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonText: 'Entendido'
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Error al actualizar tabulador:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo guardar los cambios. Intente nuevamente.',
                confirmButtonText: 'Entendido'
            });
        }
    });
}

/**
 * Agregar una nueva fila al tabulador
 * Solo permite agregar si no existe una fila con "en adelante"
 */
/**
 * Eliminar filas seleccionadas del tabulador
 * Permite eliminar una o varias filas marCadas con checkbox
 */
function eliminarFilaTabulador() {
    // Obtener todas las filas seleccionadas
    var filasSeleccionadas = $('#tabulador-tbody tr').has('.checkbox-fila:checked');
    
    // Verificar si hay filas seleccionadas
    if (filasSeleccionadas.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No hay filas seleccionadas',
            text: 'Por favor, marca las filas que deseas eliminar.',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Confirmar eliminación
    Swal.fire({
        icon: 'question',
        title: '¿Eliminar filas?',
        html: 'Se eliminarán <strong>' + filasSeleccionadas.length + '</strong> fila(s). ¿Deseas continuar?',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545'
    }).then((result) => {
        if (result.isConfirmed) {
            // Eliminar las filas seleccionadas
            filasSeleccionadas.remove();
            
            // Validar que no queden filas vacías
            if ($('#tabulador-tbody tr').length === 0) {
                $('#tabulador-tbody').html('<tr><td colspan="7" class="text-center text-muted">No hay filas en el tabulador</td></tr>');
            }
            
            // Mostrar confirmación
            Swal.fire({
                icon: 'success',
                title: 'Filas eliminadas',
                text: 'Las filas han sido eliminadas. Presiona Actualizar para guardar los cambios.',
                confirmButtonText: 'Aceptar',
                timer: 2000
            });
        }
    });
}

/**
 * Agregar una nueva fila al tabulador
 * Solo permite agregar si no existe una fila con "en adelante"
 */
function agregarFilaTabulador() {
    // Verificar si existe una fila con "en adelante"
    var hayEnAdelante = false;
    
    $('#tabulador-tbody tr').each(function() {
        var tiempoSalida = $(this).find('.tiempo-salida').val().trim().toLowerCase();
        if (tiempoSalida === 'en adelante') {
            hayEnAdelante = true;
            return false;
        }
    });
    
    // Si existe "en adelante", no permitir agregar más filas
    if (hayEnAdelante) {
        Swal.fire({
            icon: 'warning',
            title: 'No se puede agregar',
            text: 'No puedes agregar más filas si existe una fila con "en adelante". Elimínala primero.',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Crear nueva fila vacía
    var filaHTML = '<tr>' +
        '<td><input type="checkbox" class="form-check-input checkbox-fila"></td>' +
        '<td><input type="text" class="form-control form-control-sm tiempo-entrada" placeholder="HH:MM"></td>' +
        '<td><input type="text" class="form-control form-control-sm tiempo-salida" placeholder="HH:MM"></td>' +
        '<td><input type="text" class="form-control form-control-sm minutos-trabajados" placeholder="Minutos"></td>' +
        '<td><input type="text" class="form-control form-control-sm sueldo-semanal" placeholder="Sueldo"></td>' +
        '<td><input type="text" class="form-control form-control-sm costo-minuto" placeholder="Costo/min"></td>' +
        '<td><input type="text" class="form-control form-control-sm adicional" placeholder="Adicional"></td>' +
        '</tr>';
    
    // Agregar la fila a la tabla
    $('#tabulador-tbody').append(filaHTML);
    
    // Aplicar validación a los nuevos inputs
    validarFormatoHora();
    
    // Mostrar confirmación
    Swal.fire({
        icon: 'success',
        title: 'Fila agregada',
        text: 'Nueva fila agregada. Completa los datos y presiona Actualizar.',
        confirmButtonText: 'Aceptar',
        timer: 2000
    });
}

/**
 * Agregar una nueva fila de hora extra al tabulador
 * Crea una fila con "en adelante" en el campo "A la"
 * Solo permite una fila con "en adelante"
 */
function agregarFilaExtra() {
    // Verificar si ya existe una fila con "en adelante"
    var hayEnAdelante = false;
    var filaEnAdelante = null;
    
    $('#tabulador-tbody tr').each(function() {
        var tiempoSalida = $(this).find('.tiempo-salida').val().trim().toLowerCase();
        if (tiempoSalida === 'en adelante') {
            hayEnAdelante = true;
            filaEnAdelante = $(this);
            return false; // Salir del loop
        }
    });
    
    // Si ya existe "en adelante", mostrar alerta
    if (hayEnAdelante) {
        Swal.fire({
            icon: 'warning',
            title: 'Ya existe una fila con "en adelante"',
            text: 'Solo puede haber una fila de hora extra. Elimínala si deseas crear otra.',
            confirmButtonText: 'Entendido'
        });
        return;
    }
    
    // Crear nueva fila con "en adelante"
    var filaHTML = '<tr>' +
        '<td><input type="checkbox" class="form-check-input checkbox-fila"></td>' +
        '<td><input type="text" class="form-control form-control-sm tiempo-entrada" placeholder="HH:MM"></td>' +
        '<td><input type="text" class="form-control form-control-sm tiempo-salida" value="en adelante" readonly style="background-color: #e9ecef; cursor: not-allowed;"></td>' +
        '<td><input type="text" class="form-control form-control-sm minutos-trabajados" placeholder="Minutos"></td>' +
        '<td><input type="text" class="form-control form-control-sm sueldo-semanal" placeholder="Sueldo"></td>' +
        '<td><input type="text" class="form-control form-control-sm costo-minuto" placeholder="Costo/min"></td>' +
        '<td><input type="text" class="form-control form-control-sm adicional" placeholder="Adicional"></td>' +
        '</tr>';
    
    // Agregar la fila a la tabla
    $('#tabulador-tbody').append(filaHTML);
    
    // Aplicar validación a los nuevos inputs
    validarFormatoHora();
    
    // Mostrar confirmación
    Swal.fire({
        icon: 'success',
        title: 'Fila de hora extra agregada',
        text: 'Completa el tiempo de entrada y presiona Actualizar.',
        confirmButtonText: 'Aceptar',
        timer: 2000
    });
}

/**
 * Validar y aplicar formato HH:MM en los campos de tiempo
 * Usa expresión regular para aceptar solo el formato HH:MM (permite horas mayores a 24)
 * La última fila puede tener "en adelante" en el campo "A la"
 */
function validarFormatoHora() {
    // Expresión regular para validar HH:MM (permite cualquier número de horas: 01:00, 40:00, 100:00, etc.)
    var patronHora = /^\d+:[0-5][0-9]$/;
    
    // Aplicar validación a campos de entrada y salida
    $('.tiempo-entrada, .tiempo-salida').on('blur', function() {
        var valor = $(this).val().trim();
        var fila = $(this).closest('tr');
        var esUltimaFila = fila.is(':last-child');
        var esTimepoSalida = $(this).hasClass('tiempo-salida');
        
        // Si el campo está vacío, permitir
        if (valor === '') {
            $(this).removeClass('is-invalid');
            return;
        }
        
        // Permitir "en adelante" SOLO en la última fila y en el campo "A la"
        if (esUltimaFila && esTimepoSalida && valor.toLowerCase() === 'en adelante') {
            $(this).removeClass('is-invalid');
            return;
        }
        
        // Validar formato HH:MM
        if (!patronHora.test(valor)) {
            $(this).addClass('is-invalid');
            alert('Formato inválido. Use HH:MM (ejemplo: 08:30) o "en adelante" en la última fila');
            $(this).focus();
        } else {
            $(this).removeClass('is-invalid');
        }
    });
    
    // Permitir solo números, dos puntos y letras mientras se escribe
    $('.tiempo-entrada, .tiempo-salida').on('keypress', function(e) {
        // Si el campo es readonly, no hacer nada
        if ($(this).prop('readonly')) {
            e.preventDefault();
            return;
        }
        
        var char = String.fromCharCode(e.which);
        var fila = $(this).closest('tr');
        var esUltimaFila = fila.is(':last-child');
        var esTimepoSalida = $(this).hasClass('tiempo-salida');
        
        // Si es última fila y campo "A la", permitir también letras para "en adelante"
        if (esUltimaFila && esTimepoSalida) {
            if (!/[0-9:\sa-záéíóúñáéíóúñ]/.test(char)) {
                e.preventDefault();
            }
        } else {
            // Para otras filas, solo números y dos puntos
            if (!/[0-9:]/.test(char)) {
                e.preventDefault();
            }
        }
    });
}
// Ejecutar cuando se selecciona la pestaña de tabulador
$(document).ready(function() {
    // Escuchar cuando se hace clic en la pestaña del tabulador
    $('#tabulador-tab').on('click', function() {
        cargarTabulador();
    });
    
    // Evento click para el botón de actualizar tabulador
    $('#btn-actualizar-tabulador').on('click', function() {
        actualizarTabulador();
    });
    
    // Evento click para el botón de agregar fila
    $('#btn-agregar-fila').on('click', function() {
        agregarFilaTabulador();
    });
    
    // Evento click para el botón de agregar hora extra
    $('#btn-agregar-extra').on('click', function() {
        agregarFilaExtra();
    });
    
    // Evento click para el botón de eliminar fila
    $('#btn-eliminar-fila').on('click', function() {
        eliminarFilaTabulador();
    });
});
