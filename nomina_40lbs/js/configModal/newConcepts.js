mostrarEstructuraPercepciones40lbs();
eliminarPercepcionExtra40lbs();
mostrarEstructuraDeducciones40lbs();
eliminarDeduccionExtra40lbs();
guardarInasistenciaManual();
eliminarInasistenciaManual();
editarOlvidoChecador();
guardarPermisoManual();
eliminarPermisoManual();
guardarUniformeManual();
eliminarUniformeManual();

/************************************
 * AGREGAR PERCEPCIONES ADICIONALES
 ************************************/

// Función para mostrar la estructura de percepciones adicionales en la interfaz
function mostrarEstructuraPercepciones40lbs() {
    // Agregar percepciones adicionales
    $("#btn-agregar-percepcion-40lbs").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();

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
        $('#contenedor-conceptos-adicionales-40lbs').append(nuevoConcepto);

        // Agregar evento change para guardar cambios
        $('#contenedor-conceptos-adicionales-40lbs').find('.percepcion-extra-item').last().find('input').on('change', function () {
            guardarPercepcionesExtra40lbs(empleado);
        });

    });
}

// Función para mostrar las percepciones adicionales existentes de un empleado en el modal
function mostrarPercepcionesExtras40lbs(empleado) {

    // Limpiar el contenedor de percepciones adicionales
    $('#contenedor-conceptos-adicionales-40lbs').empty();

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
            $('#contenedor-conceptos-adicionales-40lbs').append(htmlPercepcion);

            // Agregar evento change para actualizar
            $('#contenedor-conceptos-adicionales-40lbs').find('.percepcion-extra-item').last().find('input').on('change', function () {
                guardarPercepcionesExtra40lbs(empleado);
            });
        });
    }
}

// Función para guardar las percepciones adicionales en el objeto empleado
function guardarPercepcionesExtra40lbs(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el array
    empleado.percepciones_extra = [];


    // Iterar sobre todos los elementos de percepción
    $('#contenedor-conceptos-adicionales-40lbs').find('.percepcion-extra-item').each(function () {
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
function eliminarPercepcionExtra40lbs() {
    // Delegación de eventos para eliminar percepciones
    $("#contenedor-conceptos-adicionales-40lbs").on('click', '.btn-eliminar-percepcion', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const $elemento = $(this).closest('.percepcion-extra-item');

        if (!$elemento || $elemento.length === 0) return;

        $elemento.remove();
        guardarPercepcionesExtra40lbs(empleado);
        calcularTotalPercepcionesEnTiempoReal();
    });
}

/************************************
 * AGREGAR DEDUCCIONES ADICIONALES
 ************************************/

// Función para mostrar la estructura de deducciones adicionales en la interfaz
function mostrarEstructuraDeducciones40lbs() {
    // Agregar deducciones adicionales
    $("#btn-agregar-deduccion-40lbs").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();

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
        $('#contenedor-deducciones-adicionales-40lbs').append(nuevaDeduccion);

        // Agregar evento change para guardar cambios
        $('#contenedor-deducciones-adicionales-40lbs').find('.deduccion-extra-item').last().find('input').on('change', function () {
            guardarDeduccionesExtra40lbs(empleado);
        });

    });
}

// Función para mostrar las deducciones adicionales existentes de un empleado en el modal
function mostrarDeduccionesExtras40lbs(empleado) {

    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el contenedor de deducciones adicionales
    $('#contenedor-deducciones-adicionales-40lbs').empty();

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
            $('#contenedor-deducciones-adicionales-40lbs').append(elementoDeduccion);

            // Agregar evento change para actualizar
            $('#contenedor-deducciones-adicionales-40lbs').find('.deduccion-extra-item').last().find('input').on('change', function () {
                guardarDeduccionesExtra40lbs(empleado);
            });
        });
    }
}

// Función para guardar las deducciones adicionales en el objeto empleado
function guardarDeduccionesExtra40lbs(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el array
    empleado.deducciones_extra = [];

    // Iterar sobre todos los elementos de deducción
    $('#contenedor-deducciones-adicionales-40lbs').find('.deduccion-extra-item').each(function () {
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
function eliminarDeduccionExtra40lbs() {
    // Delegación de eventos para eliminar deducciones
    $("#contenedor-deducciones-adicionales-40lbs").on('click', '.btn-eliminar-deduccion', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const $elemento = $(this).closest('.deduccion-extra-item');

        if (!$elemento || $elemento.length === 0) return;

        $elemento.remove();
        guardarDeduccionesExtra40lbs(empleado);
        calcularTotalDeduccionesEnTiempoReal();
    });
}

/************************************
 * AGREGAR INASISTENCIAS MANUALES
 ************************************/

// Función para guardar inasistencia manual en el historial
function guardarInasistenciaManual() {
    $("#btn-agregar-inasistencia-40lbs").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) {
            return;
        }

        // Obtener valores del formulario
        const dia = $('#select-dia-inasistencia-40lbs').val().trim();
        const descuento = parseFloat($('#input-descuento-inasistencia-40lbs').val()) || 0;

        // Validar que tenga día
        if (!dia) {
            alert('Por favor selecciona un día');
            return;
        }

        // Inicializar historial si no existe
        if (!Array.isArray(empleado.historial_inasistencias)) {
            empleado.historial_inasistencias = [];
        }

        // Agregar nueva inasistencia manual
        empleado.historial_inasistencias.push({
            dia: dia,
            descuento_inasistencia: descuento,
            tipo: 'manual'
        });

        // Limpiar formulario
        $('#select-dia-inasistencia-40lbs').val('');
        $('#input-descuento-inasistencia-40lbs').val('0.00');

        // Calcular y actualizar el total de inasistencias
        const totalInasistencias = empleado.historial_inasistencias.reduce((sum, i) => {
            return sum + (parseFloat(i.descuento_inasistencia) || 0);
        }, 0);
        $('#mod-inasistencias-40lbs').val(totalInasistencias.toFixed(2));

        empleado.inasistencia = totalInasistencias;
        establecerHistorialInasistencias(empleado);
        calcularSueldoACobrar();

    });
}

/************************************
 * ELIMINAR INASISTENCIAS MANUALES
 ************************************/

// Función para eliminar inasistencia manual del historial
function eliminarInasistenciaManual() {
    const $contenedor = $('#contenedor-historial-inasistencias-40lbs');

    // Delegación de eventos para eliminar inasistencias manuales
    $contenedor.on('click', '.btn-eliminar-inasistencia-manual', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const index = $(this).data('index');

        // Eliminar la inasistencia del array
        empleado.historial_inasistencias.splice(index, 1);

        // Calcular y actualizar el total de inasistencias
        const totalInasistencias = empleado.historial_inasistencias.reduce((sum, i) => {
            return sum + (parseFloat(i.descuento_inasistencia) || 0);
        }, 0);
        $('#mod-inasistencias-40lbs').val(totalInasistencias.toFixed(2));
        empleado.inasistencia = totalInasistencias;

        // Actualizar la tabla
        establecerHistorialInasistencias(empleado);
        calcularSueldoACobrar();

    });
}


/************************************
 * EDITAR HISTORIAL CHECADOR MANUALES
 ************************************/

// Función para editar el descuento de un olvido en el historial
function editarOlvidoChecador() {
    const $contenedor = $('#contenedor-historial-olvidos');

    $contenedor.off('click', '.btn-editar-olvido');
    $contenedor.on('click', '.btn-editar-olvido', function () {
        const empleado = objEmpleado.getEmpleado();
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
            guardarDescuentoOlvido(inputNuevo, olvido, empleado);
        });

        // Botón cancelar
        celdaDescuento.find('.btn-cancelar-olvido').on('click', function () {
            establecerHistorialChecador(empleado);
        });
    });
}

// Función para guardar el descuento del olvido editado
function guardarDescuentoOlvido(inputElement, olvidoObject, empleadoObject) {
    const raw = inputElement.val();

    // Si está vacío, cancelar edición y mantener valor anterior
    if (raw === null || raw.trim() === '') {
        establecerHistorialChecador(empleadoObject);
        return;
    }

    const valorNuevo = parseFloat(raw);
    // Validar número (permitir 0)
    if (isNaN(valorNuevo) || valorNuevo < 0) {
        alert('Por favor ingresa un valor válido');
        establecerHistorialChecador(empleadoObject);
        return;
    }

    // Guardar el nuevo descuento (incluye 0)
    olvidoObject.descuento_olvido = valorNuevo;
    // Marcar el registro como editado manualmente
    olvidoObject.editado = true;

    const total = empleadoObject.historial_olvidos.reduce((suma, item) =>
        suma + (parseFloat(item.descuento_olvido) || 0), 0);

    empleadoObject.checador = total;
    $('#mod-checador-40lbs').val(total.toFixed(2));
    establecerHistorialChecador(empleadoObject);
    calcularSueldoACobrar();
}


/************************************
 * AGREGAR Y ELIMINAR PERMISOS
 ************************************/

// Función para guardar permiso manual en el historial
function guardarPermisoManual() {

    // Agregar eventos de input para cálculo en tiempo real
    $('#input-minutos-permiso-40lbs').on('input', recalcularDescuentoPermiso);
    $('#input-costo-minuto-permiso-40lbs').on('input', recalcularDescuentoPermiso);

    $("#btn-agregar-permiso-40lbs").click(function (e) {
        e.preventDefault();

        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) {
            return;
        }

        // Obtener valores del formulario
        const dia = $('#select-dia-permiso-40lbs').val().trim();
        const minutos = parseInt($('#input-minutos-permiso-40lbs').val()) || 0;
        const costoMinuto = parseFloat($('#input-costo-minuto-permiso-40lbs').val()) || 0;
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
        $('#select-dia-permiso-40lbs').val('');
        $('#input-minutos-permiso-40lbs').val('0');
        $('#input-costo-minuto-permiso-40lbs').val('0.00');
        $('#input-descuento-permiso-40lbs').val('0.00');

        // Calcular y actualizar el total de permisos
        const totalPermisos = empleado.historial_permisos.reduce((sum, p) => {
            return sum + (parseFloat(p.descuento_permiso) || 0);
        }, 0);

        empleado.permiso = totalPermisos;
        $('#mod-permisos-40lbs').val(totalPermisos.toFixed(2));

        establecerHistorialPermisos(empleado);
        calcularSueldoACobrar();

    });
}

// Función para recalcular descuento en tiempo real
function recalcularDescuentoPermiso() {
    const minutos = parseInt($('#input-minutos-permiso-40lbs').val()) || 0;
    const costoMinuto = parseFloat($('#input-costo-minuto-permiso-40lbs').val()) || 0;
    const descuento = minutos * costoMinuto;
    $('#input-descuento-permiso-40lbs').val(descuento.toFixed(2));
}


// Función para eliminar permiso manual del historial
function eliminarPermisoManual() {
    const $contenedor = $('#contenedor-historial-permisos-40lbs');

    // Delegación de eventos para eliminar permisos manuales
    $contenedor.on('click', '.btn-eliminar-permiso-manual', function () {
        const empleado = objEmpleado.getEmpleado();

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
        $('#mod-permisos-40lbs').val(totalPermisos.toFixed(2));

        // Actualizar la tabla
        establecerHistorialPermisos(empleado);
        calcularSueldoACobrar();

    });
}


// ----------------------------------
// UNIFORME MANUAL
// ----------------------------------

// Función para guardar uniforme manual en el historial
function guardarUniformeManual() {
    $("#btn-agregar-uniforme-40lbs").click(function (e) {
        e.preventDefault();
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;

        const folio = $('#input-folio-uniforme-40lbs').val().trim();
        const cantidad = parseInt($('#input-cantidad-uniforme-40lbs').val()) || 0;
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

        $('#input-folio-uniforme-40lbs').val('');
        $('#input-cantidad-uniforme-40lbs').val('0');

        // recalcular total
        const total = empleado.historial_uniforme.reduce((s, u) => s + (parseInt(u.cantidad) || 0), 0);
        $('#mod-uniforme-40lbs').val(total);
        empleado.uniformes = total;
        establecerHistorialUniforme(empleado);
        calcularSueldoACobrar();

    });
}

// Función para eliminar uniforme manual del historial
function eliminarUniformeManual() {
    const $contenedor = $('#contenedor-historial-uniforme-40lbs');
    $contenedor.on('click', '.btn-eliminar-uniforme-manual', function () {
        const empleado = objEmpleado.getEmpleado();
        if (!empleado) return;
        const index = $(this).data('index');
        empleado.historial_uniforme.splice(index, 1);
        const total = empleado.historial_uniforme.reduce((s, u) => s + (parseInt(u.cantidad) || 0), 0);
        $('#mod-uniforme-40lbs').val(total);
        empleado.uniformes = total;
        establecerHistorialUniforme(empleado);
        calcularSueldoACobrar();

    });
}


