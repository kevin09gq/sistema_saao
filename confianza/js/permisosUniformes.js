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
    
    // Agregar filas de datos (ahora: descripción, minutos, costo_por_minuto, descuento)
    empleado.historial_permisos.forEach((permiso, index) => {
        // Asegurar campos numéricos
        const minutos = parseFloat(permiso.horas_minutos) || 0;
        const costo = parseFloat(permiso.cantidad) || 0; // 'cantidad' ahora se usa como costo_por_minuto
        const descuento = parseFloat(((minutos * costo) || 0).toFixed(2));

        // Guardar descuento en el objeto para consistencia
        permiso.descuento = descuento;

        html += `
            <div class="historial-permiso-item" data-index="${index}">
                <div>
                    <input type="text" class="form-control form-control-sm historial-permiso-descripcion" value="${permiso.descripcion}" data-field="descripcion">
                </div>
                <div>
                    <input type="number" min="0" step="1" class="form-control form-control-sm historial-permiso-minutos" value="${minutos}" data-field="horas_minutos" title="Minutos">
                </div>
                <div>
                    <input type="number" min="0" step="0.01" class="form-control form-control-sm historial-permiso-costo" value="${costo.toFixed(2)}" data-field="cantidad" title="Costo por minuto">
                </div>
                <div>
                    <input type="number" step="0.01" class="form-control form-control-sm historial-permiso-descuento" value="${descuento.toFixed(2)}" readonly title="Descuento (minutos * costo_por_minuto)">
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

    $contenedor.on('input', '.historial-permiso-minutos', function() {
        const $item = $(this).closest('.historial-permiso-item');
        const index = parseInt($item.data('index'));
        const minutos = parseFloat($(this).val()) || 0;

        if (empleado.historial_permisos[index]) {
            empleado.historial_permisos[index].horas_minutos = minutos;
            const costo = parseFloat(empleado.historial_permisos[index].cantidad) || 0;
            empleado.historial_permisos[index].descuento = parseFloat((minutos * costo).toFixed(2));
            $item.find('.historial-permiso-descuento').val(empleado.historial_permisos[index].descuento.toFixed(2));
        }

        // IMPORTANTE: Limpiar las banderas de edición manual para que el historial sobrescriba
        empleado._permiso_editado_manual = false;
        empleado._prestamo_editado_manual = false;

        recalcularTotalPermisos(empleado);
    });

    $contenedor.on('input', '.historial-permiso-costo', function() {
        const $item = $(this).closest('.historial-permiso-item');
        const index = parseInt($item.data('index'));
        const costo = parseFloat($(this).val()) || 0;
        const $costoInput = $(this);

        const valorAnterior = parseFloat($costoInput.data('prev')) || 0;
        const valorNuevo = parseFloat(costo);

        if (valorAnterior !== valorNuevo) {
            $costoInput.addClass('updated');
            setTimeout(() => $costoInput.removeClass('updated'), 500);
            $costoInput.data('prev', valorNuevo);
        }

        $item.addClass('editing');

        if (empleado.historial_permisos[index]) {
            empleado.historial_permisos[index].cantidad = costo; // costo_por_minuto
            const minutos = parseFloat(empleado.historial_permisos[index].horas_minutos) || 0;
            empleado.historial_permisos[index].descuento = parseFloat((minutos * costo).toFixed(2));
            $item.find('.historial-permiso-descuento').val(empleado.historial_permisos[index].descuento.toFixed(2));
        }

        // IMPORTANTE: Limpiar las banderas de edición manual para que el historial sobrescriba
        empleado._permiso_editado_manual = false;
        empleado._prestamo_editado_manual = false;

        recalcularTotalPermisos(empleado);
    });
    
    // Remover clase de edición cuando se pierde el foco
    $contenedor.on('blur', '.historial-permiso-costo, .historial-permiso-minutos', function() {
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
       return;
    }
    
    // Validar que el índice es válido
    if (index < 0 || index >= empleado.historial_permisos.length) {
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

}

// Función para recalcular el total de permisos basado en el historial
function recalcularTotalPermisos(empleado, force = false) {
    if (!Array.isArray(empleado.historial_permisos)) {
        empleado.historial_permisos = [];
    }
    
    // Ahora sumamos el campo 'descuento' (minutos * costo_por_minuto)
    let totalDescuento = 0;
    empleado.historial_permisos.forEach(permiso => {
        // Asegurar que exista descuento calculado
        let descuento = parseFloat(permiso.descuento);
        if (isNaN(descuento)) {
            const minutos = parseFloat(permiso.horas_minutos) || 0;
            const costo = parseFloat(permiso.cantidad) || 0; // costo_por_minuto
            descuento = parseFloat((minutos * costo).toFixed(2)) || 0;
            permiso.descuento = descuento;
        }
        totalDescuento += descuento;
    });

    // Actualizar mod-permiso solo si NO fue editado manualmente o si force=true
    if (!empleado._permiso_editado_manual || force) {
        $('#mod-permiso').val(totalDescuento.toFixed(2));
        empleado.permiso = totalDescuento;
    }
    

    
    // Actualizar sueldo a cobrar en tiempo real
    if (typeof calcularYMostrarSueldoACobrar === 'function') {
        calcularYMostrarSueldoACobrar();
    }
}

// Función para agregar un nuevo permiso
function agregarPermiso() {
    $('#btn-agregar-permiso').on('click', function() {
        const descripcion = $('#input-descripcion-permiso').val().trim();
        const horasMinutos = $('#input-minutos-permiso').val().trim();
        const cantidad = parseFloat($('#input-cantidad-permiso').val()) || 0;
        
        // La descripción ya no es obligatoria
        
        if (!horasMinutos) {
            alert('⚠️ Debes ingresar las horas o minutos');
            $('#input-minutos-permiso').focus();
            return;
        }
        
        if (cantidad <= 0) {
            alert('⚠️ La cantidad debe ser mayor a 0');
            $('#input-cantidad-permiso').focus();
            return;
        }
        
        // Obtener empleado actual
        const claveEmpleado = $('#campo-clave').text().trim();
        const idEmpresa = $('#campo-id-empresa').val().trim();
        let empleadoEncontrado = null;
        
        jsonNominaConfianza.departamentos.forEach(departamento => {
            departamento.empleados.forEach(empleado => {
                if (String(empleado.clave).trim() === String(claveEmpleado).trim() && 
                    String(empleado.id_empresa).trim() === String(idEmpresa).trim()) {
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
        
        // Calcular descuento (minutos * costo_por_minuto)
        const minutosNum = parseFloat(horasMinutos) || 0;
        const descuentoCalc = parseFloat((minutosNum * cantidad).toFixed(2)) || 0;

        empleadoEncontrado.historial_permisos.push({
            descripcion: descripcion,
            horas_minutos: horasMinutos,
            cantidad: cantidad, // costo_por_minuto
            descuento: descuentoCalc
        });
        
        // Limpiar inputs
        $('#input-descripcion-permiso').val('');
        $('#input-minutos-permiso').val('');
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
        console.error('Error: Empleado no válido o sin historial de uniformes');
        return;
    }
    
    // Validar que el índice es válido
    if (index < 0 || index >= empleado.historial_uniformes.length) {
        console.error('Error: Índice de folio no válido');
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
    
    // Mensaje opcional de éxito (puedes comentarlo si no lo deseas)
    console.log(`Folio "${folioAEliminar.folio}" eliminado correctamente`);
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
        const idEmpresa = $('#campo-id-empresa').val().trim();
        let empleadoEncontrado = null;
        
        jsonNominaConfianza.departamentos.forEach(departamento => {
            departamento.empleados.forEach(empleado => {
                if (String(empleado.clave).trim() === String(claveEmpleado).trim() && 
                    String(empleado.id_empresa).trim() === String(idEmpresa).trim()) {
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