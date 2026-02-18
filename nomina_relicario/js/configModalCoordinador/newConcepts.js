mostrarEstructuraPercepciones();
eliminarPercepcionExtra();

/************************************
 * AGREGAR PERCEPCIONES ADICIONALES
 ************************************/

// Función para mostrar la estructura de percepciones adicionales en la interfaz
function mostrarEstructuraPercepciones() {
    // Agregar percepciones adicionales
    $("#btn-agregar-percepcion-coordinador").click(function (e) {
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
        $('#contenedor-conceptos-adicionales-coordinador').append(nuevoConcepto);

        // Agregar evento change para guardar cambios
        $('#contenedor-conceptos-adicionales-coordinador').find('.percepcion-extra-item').last().find('input').on('change', function () {
            guardarPercepcionesExtra(empleado);
        });

    });
}

// Función para mostrar las percepciones adicionales existentes de un empleado en el modal
function mostrarPercepcionesExtras(empleado) {
    
    // Limpiar el contenedor de percepciones adicionales
    $('#contenedor-conceptos-adicionales-coordinador').empty();

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
            $('#contenedor-conceptos-adicionales-coordinador').append(htmlPercepcion);

            // Agregar evento change para actualizar
            $('#contenedor-conceptos-adicionales-coordinador').find('.percepcion-extra-item').last().find('input').on('change', function () {
                guardarPercepcionesExtra(empleado);
            });
        });
    }
}

// Función para guardar las percepciones adicionales en el objeto empleado
function guardarPercepcionesExtra(empleado) {
    // Si no hay empleado, salir
    if (!empleado) return;

    // Limpiar el array
    empleado.percepciones_extra = [];

    // Iterar sobre todos los elementos de percepción
    $('#contenedor-conceptos-adicionales-coordinador').find('.percepcion-extra-item').each(function () {
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
function eliminarPercepcionExtra() {
    // Delegación de eventos para eliminar percepciones
    $("#contenedor-conceptos-adicionales-coordinador").on('click', '.btn-eliminar-percepcion', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const $elemento = $(this).closest('.percepcion-extra-item');

        if (!$elemento || $elemento.length === 0) return;

        $elemento.remove();
        guardarPercepcionesExtra(empleado);
        calcularTotalPercepcionesEnTiempoReal();
    });
}

