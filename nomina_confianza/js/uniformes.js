// ========================================
// GESTIÓN DE UNIFORMES
// ========================================

// Función para mostrar el historial de uniformes
function mostrarHistorialUniformes(empleado) {
    const $contenedor = $('#contenedor-historial-uniformes');
    $contenedor.empty();

    if (!Array.isArray(empleado.historial_uniformes) || empleado.historial_uniformes.length === 0) {
        $contenedor.html(`
            <div style="text-align: center; padding: 2rem 1rem;">
                <p class="text-muted" style="font-size: 0.85rem; font-style: italic; margin: 0;">No hay folios de uniformes registrados</p>
            </div>
        `);
        return;
    }

    // Crear header de la tabla
    let html = `
        <div class="historial-uniformes-header">
            <div class="historial-header-cell">Folio</div>
            <div class="historial-header-cell">Cantidad ($)</div>
            <div class="historial-header-cell">Acciones</div>
        </div>
    `;
    
    // Agregar filas de datos
    empleado.historial_uniformes.forEach((uniforme, index) => {
        html += `
            <div class="historial-uniforme-item" data-index="${index}">
                <div>
                    <input type="text" class="form-control form-control-sm historial-uniforme-folio" value="${uniforme.folio}" readonly>
                </div>
                <div>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-uniforme-cantidad" value="${uniforme.cantidad.toFixed(2)}" data-field="cantidad">
                </div>
                <div class="text-center">
                    <button type="button" class="btn btn-danger btn-sm btn-eliminar-uniforme" data-index="${index}" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    $contenedor.html(html);

    // IMPORTANTE: Remover eventos previos para evitar acumulación de listeners
    $contenedor.off('input', '.historial-uniforme-cantidad');
    $contenedor.off('click', '.btn-eliminar-uniforme');

    // Agregar eventos para actualizar totales cuando cambien los valores
    $contenedor.on('input', '.historial-uniforme-cantidad', function() {
        const $item = $(this).closest('.historial-uniforme-item');
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
        if (empleado.historial_uniformes[index]) {
            empleado.historial_uniformes[index].cantidad = cantidad;
        }
        
        // IMPORTANTE: Limpiar la bandera de edición manual para que el historial sobrescriba
        empleado._uniformes_editado_manual = false;
        
        // Recalcular total
        recalcularTotalUniformes(empleado);
    });
    
    // Remover clase de edición cuando se pierde el foco
    $contenedor.on('blur', '.historial-uniforme-cantidad', function() {
        const $item = $(this).closest('.historial-uniforme-item');
        setTimeout(() => {
            if (!$item.find('input:focus').length) {
                $item.removeClass('editing');
            }
        }, 100);
    });

    // Evento para eliminar folio - delegar a función especializada
    $contenedor.on('click', '.btn-eliminar-uniforme', function() {
        const index = parseInt($(this).data('index'));
        eliminarFolioUniforme(empleado, index);
    });
}

// Función para eliminar un folio de uniforme del historial
function eliminarFolioUniforme(empleado, index) {
    // Validar que el empleado existe y tiene historial
    if (!empleado || !Array.isArray(empleado.historial_uniformes)) {
        return;
    }
    
    // Validar que el índice es válido
    if (index < 0 || index >= empleado.historial_uniformes.length) {
        return;
    }
    
    // Obtener información del folio a eliminar para mostrarla en la confirmación
    const folioAEliminar = empleado.historial_uniformes[index];
    const mensajeConfirmacion = `¿Estás seguro de eliminar este folio?\n\n` +
                                `Folio: ${folioAEliminar.folio}\n` +
                                `Cantidad: $${folioAEliminar.cantidad.toFixed(2)}`;
    
    // Pedir confirmación al usuario
    if (!confirm(mensajeConfirmacion)) {
        return; // El usuario canceló
    }
    
    // Eliminar el folio del historial
    empleado.historial_uniformes.splice(index, 1);
    
    // Actualizar la visualización del historial
    mostrarHistorialUniformes(empleado);
    
    // Recalcular el total de uniformes
    recalcularTotalUniformes(empleado);
    
   
}

// Función para recalcular el total de uniformes basado en el historial
function recalcularTotalUniformes(empleado, force = false) {
    if (!Array.isArray(empleado.historial_uniformes)) {
        empleado.historial_uniformes = [];
    }
    
    let totalUniformes = 0;
    empleado.historial_uniformes.forEach(uniforme => {
        totalUniformes += parseFloat(uniforme.cantidad) || 0;
    });
    
    // Solo actualizar si NO fue editado manualmente o si force=true
    if (!empleado._uniformes_editado_manual || force) {
        $('#mod-uniformes').val(totalUniformes.toFixed(2));
        empleado.uniformes = totalUniformes;
        
        // Actualizar sueldo a cobrar en tiempo real
        if (typeof calcularYMostrarSueldoACobrar === 'function') {
            calcularYMostrarSueldoACobrar();
        }
    }
}

// Función para agregar un nuevo folio de uniforme
function agregarFolioUniforme() {
    $('#btn-agregar-folio-uniforme').on('click', function() {
        const folio = $('#input-folio-uniforme').val().trim();
        const cantidad = parseFloat($('#input-cantidad-uniforme').val()) || 0;
        
        // Validaciones
        if (!folio) {
            alert('⚠️ Debes ingresar un folio');
            $('#input-folio-uniforme').focus();
            return;
        }
        
        if (cantidad <= 0) {
            alert('⚠️ La cantidad debe ser mayor a 0');
            $('#input-cantidad-uniforme').focus();
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
        
        // Verificar si el folio ya existe
        const folioExiste = empleadoEncontrado.historial_uniformes.some(u => u.folio === folio);
        if (folioExiste) {
            alert('⚠️ Este folio ya existe. Usa uno diferente.');
            return;
        }
        
        // Agregar al historial
        if (!Array.isArray(empleadoEncontrado.historial_uniformes)) {
            empleadoEncontrado.historial_uniformes = [];
        }
        
        empleadoEncontrado.historial_uniformes.push({
            folio: folio,
            cantidad: cantidad
        });
        
        // Limpiar inputs
        $('#input-folio-uniforme').val('');
        $('#input-cantidad-uniforme').val('');
        
        // Actualizar visualización
        mostrarHistorialUniformes(empleadoEncontrado);
        recalcularTotalUniformes(empleadoEncontrado);
        
        // Enfocar en el input de folio para seguir agregando
        $('#input-folio-uniforme').focus();
    });
}

// Función para abrir/cerrar la sección de uniformes con el botón
function gestionarBotonUniformes() {
    $('#btn-gestionar-uniformes').on('click', function() {
        // Scroll suave hacia la sección de uniformes
        $('html, body').animate({
            scrollTop: $('#contenedor-historial-uniformes').offset().top - 100
        }, 500);
        
        // Enfocar en el input de folio
        setTimeout(() => {
            $('#input-folio-uniforme').focus();
        }, 600);
    });
}
