mostrarEstructuraPercepcionesJornaleros();
eliminarPercepcionExtraJornalero();
mostrarEstructuraDeduccionesJornaleros();
eliminarDeduccionExtraJornalero();

editarOlvidoChecadorJornalero();

guardarPermisoManualJornalero();
eliminarPermisoManualJornalero();

guardarUniformeManualJornalero();
eliminarUniformeManualJornalero();

/************************************
 * AGREGAR PERCEPCIONES ADICIONALES
 ************************************/

// Función para mostrar la estructura de percepciones adicionales en la interfaz
function mostrarEstructuraPercepcionesJornaleros() {
    // Agregar percepciones adicionales
    $("#btn-agregar-percepcion-jornalero").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) {
            return;
        }

        // Crear nuevo elemento de percepción con estructura Bootstrap
        const nuevoConcepto = `
        <div class="col-md-6 mb-3 percepcion-extra-item">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">Concepto Adicional</span>
                <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-percepcion">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="mt-2">
                <input type="text" class="form-control form-control-sm mb-2 nombre-percepcion" 
                       placeholder="Nombre del concepto">
                <input type="number" step="0.01" class="form-control form-control-sm cantidad-percepcion" 
                       value="0.00" placeholder="0.00">
            </div>
        </div>
    `;

        // Agregar el nuevo concepto al contenedor
        $('#contenedor-conceptos-adicionales-jornalero').append(nuevoConcepto);

        // Agregar evento change para guardar cambios
        $('#contenedor-conceptos-adicionales-jornalero').find('.percepcion-extra-item').last().find('input').on('change', function () {
            guardarPercepcionesExtraJornalero(empleado);
        });

    });
}

// Función para mostrar las percepciones adicionales existentes de un empleado en el modal
function mostrarPercepcionesExtrasJornalero(empleado) {

    // Limpiar el contenedor de percepciones adicionales
    $('#contenedor-conceptos-adicionales-jornalero').empty();

    // Si existen percepciones adicionales, mostrarlas
    if (empleado.percepciones_extra && Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.length > 0) {
        empleado.percepciones_extra.forEach((percepcion) => {
            // Crear elemento de percepción con datos existentes
            const htmlPercepcion = `
                <div class="col-md-6 mb-3 percepcion-extra-item">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-semibold">Concepto Adicional</span>
                        <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-percepcion">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div class="mt-2">
                        <input type="text" class="form-control form-control-sm mb-2 nombre-percepcion" 
                               value="${percepcion.nombre || ''}" placeholder="Nombre del concepto">
                        <input type="number" step="0.01" class="form-control form-control-sm cantidad-percepcion" 
                               value="${percepcion.cantidad || 0.00}" placeholder="0.00">
                    </div>
                </div>
            `;

            // Agregar el elemento al contenedor
            $('#contenedor-conceptos-adicionales-jornalero').append(htmlPercepcion);

            // Agregar evento change para actualizar
            $('#contenedor-conceptos-adicionales-jornalero').find('.percepcion-extra-item').last().find('input').on('change', function () {
                guardarPercepcionesExtraJornalero(empleado);
            });
        });
    }
}

// Función para guardar las percepciones adicionales en el objeto empleado
function guardarPercepcionesExtraJornalero(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el array
    empleado.percepciones_extra = [];


    // Iterar sobre todos los elementos de percepción
    $('#contenedor-conceptos-adicionales-jornalero').find('.percepcion-extra-item').each(function () {
        const nombre = $(this).find('.nombre-percepcion').val().trim();
        const cantidad = parseFloat($(this).find('.cantidad-percepcion').val()) || 0;

        // Solo guardar si tiene nombre
        if (nombre) {
            empleado.percepciones_extra.push({
                nombre: nombre,
                cantidad: cantidad
            });
        }
    });

}

// Función para eliminar una percepción adicional del empleado
function eliminarPercepcionExtraJornalero() {
    // Delegación de eventos para eliminar percepciones
    $("#contenedor-conceptos-adicionales-jornalero").on('click', '.btn-eliminar-percepcion', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const $elemento = $(this).closest('.percepcion-extra-item');

        if (!$elemento || $elemento.length === 0) return;

        $elemento.remove();
        guardarPercepcionesExtraJornalero(empleado);
        calcularTotalPercepcionesEnTiempoRealJornalero();
    });
}


/************************************
 * AGREGAR DEDUCCIONES ADICIONALES
 ************************************/

// Función para mostrar la estructura de deducciones adicionales en la interfaz
function mostrarEstructuraDeduccionesJornaleros() {
    // Agregar deducciones adicionales
    $("#btn-agregar-deduccion-jornalero").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        // Crear nuevo elemento de deducción con estructura Bootstrap
        const nuevaDeduccion = `
        <div class="col-md-6 mb-3 deduccion-extra-item">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">Deducción Adicional</span>
                <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-deduccion">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
            <div class="mt-2">
                <input type="text" class="form-control form-control-sm mb-2 nombre-deduccion" 
                       placeholder="Nombre de la deducción">
                <input type="number" step="0.01" class="form-control form-control-sm cantidad-deduccion" 
                       value="0.00" placeholder="0.00">
            </div>
        </div>
    `;

        // Agregar la nueva deducción al contenedor
        $('#contenedor-deducciones-adicionales-jornalero').append(nuevaDeduccion);

        // Agregar evento change para guardar cambios
        $('#contenedor-deducciones-adicionales-jornalero').find('.deduccion-extra-item').last().find('input').on('change', function () {
            guardarDeduccionesExtraJornalero(empleado);
        });

    });
}

// Función para mostrar las deducciones adicionales existentes de un empleado en el modal
function mostrarDeduccionesExtrasJornalero(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el contenedor de deducciones adicionales
    $('#contenedor-deducciones-adicionales-jornalero').empty();

    // Si existen deducciones adicionales, mostrarlas
    if (empleado.deducciones_extra && Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length > 0) {
        empleado.deducciones_extra.forEach((deduccion) => {
            const elementoDeduccion = `
            <div class="col-md-6 mb-3 deduccion-extra-item">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">Deducción Adicional</span>
                    <button type="button" class="btn btn-outline-danger btn-sm btn-eliminar-deduccion">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="mt-2">
                    <input type="text" class="form-control form-control-sm mb-2 nombre-deduccion" 
                           value="${deduccion.nombre || ''}" placeholder="Nombre de la deducción">
                    <input type="number" step="0.01" class="form-control form-control-sm cantidad-deduccion" 
                           value="${parseFloat(deduccion.cantidad).toFixed(2)}" placeholder="0.00">
                </div>
            </div>
        `;
            $('#contenedor-deducciones-adicionales-jornalero').append(elementoDeduccion);

            // Agregar evento change para actualizar
            $('#contenedor-deducciones-adicionales-jornalero').find('.deduccion-extra-item').last().find('input').on('change', function () {
                guardarDeduccionesExtraJornalero(empleado);
            });
        });
    }
}

// Función para guardar las deducciones adicionales en el objeto empleado
function guardarDeduccionesExtraJornalero(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el array
    empleado.deducciones_extra = [];

    // Iterar sobre todos los elementos de deducción
    $('#contenedor-deducciones-adicionales-jornalero').find('.deduccion-extra-item').each(function () {
        const nombre = $(this).find('.nombre-deduccion').val().trim();
        const cantidad = parseFloat($(this).find('.cantidad-deduccion').val()) || 0;

        // Solo guardar si tiene nombre
        if (nombre) {
            empleado.deducciones_extra.push({
                nombre: nombre,
                cantidad: cantidad
            });
        }
    });
}

// Función para eliminar una deducción adicional del empleado
function eliminarDeduccionExtraJornalero() {
    // Delegación de eventos para eliminar deducciones
    $("#contenedor-deducciones-adicionales-jornalero").on('click', '.btn-eliminar-deduccion', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const $elemento = $(this).closest('.deduccion-extra-item');

        if (!$elemento || $elemento.length === 0) return;

        $elemento.remove();
        guardarDeduccionesExtraJornalero(empleado);
        calcularTotalDeduccionesEnTiempoRealJornalero();
    });
}

/************************************
 * EDITAR HISTORIAL CHECADOR MANUALES
 ************************************/

// Función para editar el descuento de un olvido en el historial
function editarOlvidoChecadorJornalero() {
    const $contenedor = $('#contenedor-historial-olvidos-jornaleros');

    $contenedor.off('click', '.btn-editar-olvido');
    $contenedor.on('click', '.btn-editar-olvido', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();
        if (!empleado) return;

        const indice = $(this).data('index');
        const olvido = empleado.historial_olvidos[indice];
        const fila = $(this).closest('tr');
        const celdaDescuento = fila.find('td').eq(2);

        const valor = parseFloat(olvido.descuento_olvido).toFixed(2);
        const htmlEditable = `
            <div class="d-flex gap-2">
                <input type="number" step="0.01" class="form-control form-control-sm input-editar-olvido" value="${valor}" min="0">
                <button type="button" class="btn btn-sm btn-success btn-confirmar-olvido" title="Guardar"><i class="bi bi-check"></i></button>
                <button type="button" class="btn btn-sm btn-danger btn-cancelar-olvido" title="Cancelar"><i class="bi bi-x"></i></button>
            </div>
        `;

        celdaDescuento.html(htmlEditable);
        const inputNuevo = celdaDescuento.find('.input-editar-olvido');
        inputNuevo.focus().select();

        // Botón confirmar
        celdaDescuento.find('.btn-confirmar-olvido').on('click', function () {
            guardarDescuentoOlvidoJornalero(inputNuevo, olvido, empleado);
        });

        // Botón cancelar
        celdaDescuento.find('.btn-cancelar-olvido').on('click', function () {
            establecerHistorialChecadorJornalero(empleado);
        });
    });
}

// Función para guardar el descuento del olvido editado
function guardarDescuentoOlvidoJornalero(inputElement, olvidoObject, empleadoObject) {
    const raw = inputElement.val();

    // Si está vacío, cancelar edición y mantener valor anterior
    if (raw === null || raw.trim() === '') {
        establecerHistorialChecadorJornalero(empleadoObject);
        return;
    }

    const valorNuevo = parseFloat(raw);
    // Validar número (permitir 0)
    if (isNaN(valorNuevo) || valorNuevo < 0) {
        alert('Por favor ingresa un valor válido');
        establecerHistorialChecadorJornalero(empleadoObject);
        return;
    }

    // Guardar el nuevo descuento (incluye 0)
    olvidoObject.descuento_olvido = valorNuevo;
    // Marcar el registro como editado manualmente
    olvidoObject.editado = true;

    const total = empleadoObject.historial_olvidos.reduce((suma, item) =>
        suma + (parseFloat(item.descuento_olvido) || 0), 0);

    empleadoObject.checador = total;
    $('#mod-checador-jornalero').val(total.toFixed(2));
    establecerHistorialChecadorJornalero(empleadoObject);
    calcularSueldoACobrarJornalero();
}



/************************************
 * AGREGAR Y ELIMINAR PERMISOS
 ************************************/

// Función para guardar permiso manual en el historial
function guardarPermisoManualJornalero() {
    // Función para recalcular descuento en tiempo real
    function recalcularDescuentoPermiso() {
        const minutos = parseInt($('#input-minutos-permiso-jornalero').val()) || 0;
        const costoMinuto = parseFloat($('#input-costo-minuto-permiso-jornalero').val()) || 0;
        const descuento = minutos * costoMinuto;
        $('#input-descuento-permiso-jornalero').val(descuento.toFixed(2));
    }

    // Agregar eventos de input para cálculo en tiempo real
    $('#input-minutos-permiso-jornalero').on('input', recalcularDescuentoPermiso);
    $('#input-costo-minuto-permiso-jornalero').on('input', recalcularDescuentoPermiso);

    $("#btn-agregar-permiso-jornalero").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) {
            return;
        }

        // Obtener valores del formulario
        const dia = $('#select-dia-permiso-jornalero').val().trim();
        const minutos = parseInt($('#input-minutos-permiso-jornalero').val()) || 0;
        const costoMinuto = parseFloat($('#input-costo-minuto-permiso-jornalero').val()) || 0;
        const descuento = minutos * costoMinuto;

        // Validar que tenga día
        if (!dia) {
            alert('Por favor selecciona un día');
            return;
        }

        // Inicializar historial si no existe
        if (!Array.isArray(empleado.historial_permisos)) {
            empleado.historial_permisos = [];
        }

        // Agregar nuevo permiso manual
        empleado.historial_permisos.push({
            dia: dia,
            minutos_permiso: minutos,
            costo_por_minuto: costoMinuto,
            descuento_permiso: descuento,

        });

        // Limpiar formulario
        $('#select-dia-permiso-jornalero').val('');
        $('#input-minutos-permiso-jornalero').val('0');
        $('#input-costo-minuto-permiso-jornalero').val('0.00');
        $('#input-descuento-permiso-jornalero').val('0.00');

        // Calcular y actualizar el total de permisos
        const totalPermisos = empleado.historial_permisos.reduce((sum, p) => {
            return sum + (parseFloat(p.descuento_permiso) || 0);
        }, 0);

        empleado.permiso = totalPermisos;
        $('#mod-permisos-jornalero').val(totalPermisos.toFixed(2));

        establecerHistorialPermisosJornalero(empleado);
        calcularSueldoACobrarJornalero();

        console.log('Permiso guardado:', empleado.historial_permisos);
    });
}

// Función para eliminar permiso manual del historial
function eliminarPermisoManualJornalero() {
    const $contenedor = $('#contenedor-historial-permisos-jornalero');

    // Delegación de eventos para eliminar permisos manuales
    $contenedor.on('click', '.btn-eliminar-permiso-manual', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const index = $(this).data('index');

        // Eliminar el permiso del array
        empleado.historial_permisos.splice(index, 1);

        // Calcular y actualizar el total de permisos
        const totalPermisos = empleado.historial_permisos.reduce((sum, p) => {
            return sum + (parseFloat(p.descuento_permiso) || 0);
        }, 0);
        empleado.permiso = totalPermisos;
        $('#mod-permisos-jornalero').val(totalPermisos.toFixed(2));

        // Actualizar la tabla
        establecerHistorialPermisosJornalero(empleado);
        calcularSueldoACobrarJornalero();

        console.log('Permiso eliminado. Historial actualizado:', empleado.historial_permisos);
    });
}


// ----------------------------------
// UNIFORME MANUAL
// ----------------------------------

// Función para guardar uniforme manual en el historial
function guardarUniformeManualJornalero() {
    $("#btn-agregar-uniforme-jornalero").click(function(e) {
        e.preventDefault();
        const empleado = objEmpleadoJornalero.getEmpleado();
        if (!empleado) return;

        const folio = $('#input-folio-uniforme-jornalero').val().trim();
        const cantidad = parseInt($('#input-cantidad-uniforme-jornalero').val()) || 0;
        if (!folio) {
            alert('Por favor ingresa un folio');
            return;
        }
        if (cantidad <= 0) {
            alert('La cantidad debe ser mayor a 0');
            return;
        }
        if (!Array.isArray(empleado.historial_uniforme)) {
            empleado.historial_uniforme = [];
        }
        empleado.historial_uniforme.push({
            folio: folio,
            cantidad: cantidad,
        });

        $('#input-folio-uniforme-jornalero').val('');
        $('#input-cantidad-uniforme-jornalero').val('0');

        // recalcular total
        const total = empleado.historial_uniforme.reduce((s, u) => s + (parseInt(u.cantidad) || 0), 0);
        $('#mod-uniforme-jornalero').val(total);
        empleado.uniformes = total;
        establecerHistorialUniformeJornalero(empleado);
        calcularSueldoACobrarJornalero();
        console.log('Uniforme guardado', empleado.historial_uniforme);
    });
}

// Función para eliminar uniforme manual del historial
function eliminarUniformeManualJornalero() {
    const $contenedor = $('#contenedor-historial-uniforme-jornalero');
    $contenedor.on('click', '.btn-eliminar-uniforme-manual', function() {
        const empleado = objEmpleadoJornalero.getEmpleado();
        if (!empleado) return;
        const index = $(this).data('index');
        empleado.historial_uniforme.splice(index,1);
        const total = empleado.historial_uniforme.reduce((s, u) => s + (parseInt(u.cantidad) || 0), 0);
        $('#mod-uniforme-jornalero').val(total);
        empleado.uniformes = total;
        establecerHistorialUniformeJornalero(empleado);
        calcularSueldoACobrarJornalero();
        
    });
}

