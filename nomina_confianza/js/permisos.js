// ========================================
// GESTIÓN DE PERMISOS
// ========================================

// Función para mostrar el historial de permisos
function mostrarHistorialPermisos(empleado) {
    const $contenedor = $('#contenedor-historial-permisos');
    $contenedor.empty();

    if (!Array.isArray(empleado.historial_permisos) || empleado.historial_permisos.length === 0) {
        $contenedor.html(`
            <div style="text-align: center; padding: 2rem 1rem;">
                <p class="text-muted" style="font-size: 0.85rem; font-style: italic; margin: 0;">No hay permisos registrados</p>
            </div>
        `);
        return;
    }

    // Crear header de la tabla
    let html = `
        <div class="historial-permisos-header">
            <div class="historial-header-cell">Descripción</div>
            <div class="historial-header-cell">Horas/Min</div>
            <div class="historial-header-cell">Cantidad ($)</div>
            <div class="historial-header-cell">Acciones</div>
        </div>
    `;
    
    // Agregar filas de datos
    empleado.historial_permisos.forEach((permiso, index) => {
        html += `
            <div class="historial-permiso-item" data-index="${index}">
                <div>
                    <input type="text" class="form-control form-control-sm historial-permiso-descripcion" value="${permiso.descripcion}" data-field="descripcion">
                </div>
                <div>
                    <input type="text" class="form-control form-control-sm historial-permiso-horas" value="${permiso.horas_minutos}" data-field="horas_minutos">
                </div>
                <div>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-permiso-cantidad" value="${permiso.cantidad.toFixed(2)}" data-field="cantidad">
                </div>
                <div class="text-center">
                    <button type="button" class="btn btn-danger btn-sm btn-eliminar-permiso" data-index="${index}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    $contenedor.html(html);

    // IMPORTANTE: Remover eventos previos para evitar acumulación de listeners
    $contenedor.off('input', '.historial-permiso-descripcion, .historial-permiso-horas, .historial-permiso-cantidad');
    $contenedor.off('click', '.btn-eliminar-permiso');

    // Agregar eventos para actualizar valores cuando cambien
    $contenedor.on('input', '.historial-permiso-descripcion', function() {
        const $item = $(this).closest('.historial-permiso-item');
        const index = parseInt($item.data('index'));
        const descripcion = $(this).val();
        
        // Actualizar el valor en el array
        if (empleado.historial_permisos[index]) {
            empleado.historial_permisos[index].descripcion = descripcion;
        }
    });

    $contenedor.on('input', '.historial-permiso-horas', function() {
        const $item = $(this).closest('.historial-permiso-item');
        const index = parseInt($item.data('index'));
        const horasMinutos = $(this).val();
        
        // Actualizar el valor en el array
        if (empleado.historial_permisos[index]) {
            empleado.historial_permisos[index].horas_minutos = horasMinutos;
        }
    });

    $contenedor.on('input', '.historial-permiso-cantidad', function() {
        const $item = $(this).closest('.historial-permiso-item');
        const index = parseInt($item.data('index'));
        const cantidad = parseFloat($(this).val()) || 0;
        
        const $cantidadInput = $(this);
        const valorAnterior = parseFloat($cantidadInput.val()) || 0;
        const valorNuevo = parseFloat(cantidad);
        
        // Efecto visual cuando cambia la cantidad
        if (valorAnterior !== valorNuevo) {
            $cantidadInput.addClass('updated');
            setTimeout(() => {
                $cantidadInput.removeClass('updated');
            }, 500);
        }
        
        // Marcar el item como editando
        $item.addClass('editing');
        
        // Actualizar el valor en el array
        if (empleado.historial_permisos[index]) {
            empleado.historial_permisos[index].cantidad = cantidad;
        }
        
        // Recalcular total
        recalcularTotalPermisos(empleado);
    });
    
    // Remover clase de edición cuando se pierde el foco
    $contenedor.on('blur', '.historial-permiso-cantidad', function() {
        const $item = $(this).closest('.historial-permiso-item');
        setTimeout(() => {
            if (!$item.find('input:focus').length) {
                $item.removeClass('editing');
            }
        }, 100);
    });

    // Evento para eliminar permiso - delegar a función especializada
    $contenedor.on('click', '.btn-eliminar-permiso', function() {
        const index = parseInt($(this).data('index'));
        eliminarPermiso(empleado, index);
    });
}

// Función para eliminar un permiso del historial
function eliminarPermiso(empleado, index) {
    // Validar que el empleado existe y tiene historial
    if (!empleado || !Array.isArray(empleado.historial_permisos)) {
        console.error('Error: Empleado no válido o sin historial de permisos');
        return;
    }
    
    // Validar que el índice es válido
    if (index < 0 || index >= empleado.historial_permisos.length) {
        console.error('Error: Índice de permiso no válido');
        return;
    }
    
    // Obtener información del permiso a eliminar para mostrarla en la confirmación
    const permisoAEliminar = empleado.historial_permisos[index];
    const mensajeConfirmacion = `¿Estás seguro de eliminar este permiso?\n\n` +
                                `Descripción: ${permisoAEliminar.descripcion}\n` +
                                `Horas/Min: ${permisoAEliminar.horas_minutos}\n` +
                                `Cantidad: $${permisoAEliminar.cantidad.toFixed(2)}`;
    
    // Pedir confirmación al usuario
    if (!confirm(mensajeConfirmacion)) {
        return; // El usuario canceló
    }
    
    // Eliminar el permiso del historial
    empleado.historial_permisos.splice(index, 1);
    
    // Actualizar la visualización del historial
    mostrarHistorialPermisos(empleado);
    
    // Recalcular el total de permisos
    recalcularTotalPermisos(empleado);
    
    // Mensaje opcional de éxito
    console.log(`Permiso "${permisoAEliminar.descripcion}" eliminado correctamente`);
}

// Función para recalcular el total de permisos basado en el historial
function recalcularTotalPermisos(empleado) {
    if (!Array.isArray(empleado.historial_permisos)) {
        empleado.historial_permisos = [];
    }
    
    let totalPermisos = 0;
    empleado.historial_permisos.forEach(permiso => {
        totalPermisos += parseFloat(permiso.cantidad) || 0;
    });
    
    $('#mod-permiso').val(totalPermisos.toFixed(2));
    empleado.permiso = totalPermisos;
    
    // Actualizar sueldo a cobrar en tiempo real
    if (typeof calcularYMostrarSueldoACobrar === 'function') {
        calcularYMostrarSueldoACobrar();
    }
}

// Función para agregar un nuevo permiso
function agregarPermiso() {
    $('#btn-agregar-permiso').on('click', function() {
        const descripcion = $('#input-descripcion-permiso').val().trim();
        const horasMinutos = $('#input-horas-permiso').val().trim();
        const cantidad = parseFloat($('#input-cantidad-permiso').val()) || 0;
        
        // Validaciones
        if (!descripcion) {
            alert('⚠️ Debes ingresar una descripción del permiso');
            $('#input-descripcion-permiso').focus();
            return;
        }
        
        if (!horasMinutos) {
            alert('⚠️ Debes ingresar las horas o minutos');
            $('#input-horas-permiso').focus();
            return;
        }
        
        if (cantidad <= 0) {
            alert('⚠️ La cantidad debe ser mayor a 0');
            $('#input-cantidad-permiso').focus();
            return;
        }
        
        // Obtener empleado actual
        const claveEmpleado = $('#campo-clave').text().trim();
        let empleadoEncontrado = null;
        
        jsonNominaConfianza.departamentos.forEach(departamento => {
            departamento.empleados.forEach(empleado => {
                if (String(empleado.clave).trim() === String(claveEmpleado).trim()) {
                    empleadoEncontrado = empleado;
                }
            });
        });
        
        if (!empleadoEncontrado) {
            alert('❌ Error: No se encontró el empleado');
            return;
        }
        
        // Agregar al historial
        if (!Array.isArray(empleadoEncontrado.historial_permisos)) {
            empleadoEncontrado.historial_permisos = [];
        }
        
        empleadoEncontrado.historial_permisos.push({
            descripcion: descripcion,
            horas_minutos: horasMinutos,
            cantidad: cantidad
        });
        
        // Limpiar inputs
        $('#input-descripcion-permiso').val('');
        $('#input-horas-permiso').val('');
        $('#input-cantidad-permiso').val('');
        
        // Actualizar visualización
        mostrarHistorialPermisos(empleadoEncontrado);
        recalcularTotalPermisos(empleadoEncontrado);
        
        // Enfocar en el input de descripción para seguir agregando
        $('#input-descripcion-permiso').focus();
    });
}

// Función para gestionar el botón de permisos
function gestionarBotonPermisos() {
    $('#btn-gestionar-permisos').on('click', function() {
        // Scroll suave hacia la sección de permisos
        $('html, body').animate({
            scrollTop: $('#contenedor-historial-permisos').offset().top - 100
        }, 500);
        
        // Enfocar en el input de descripción
        setTimeout(() => {
            $('#input-descripcion-permiso').focus();
        }, 600);
    });
}
