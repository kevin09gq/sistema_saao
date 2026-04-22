// ============================================
// MÓDULO PARA SELECCIONAR EMPLEADOS A MOSTRAR
// ============================================

// Abrir el modal de selección
function abrirModalSeleccionarEmpleados() {
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
        alert('No hay nómina cargada');
        return;
    }

    // Cargar la lista de empleados
    cargarListaEmpleados();
    
    // Mostrar el modal usando Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('modal-seleccionar-empleados'));
    modal.show();
}

// Cargar lista de empleados agrupados por departamento
function cargarListaEmpleados() {
    const contenedor = $('#contenedor-lista-empleados');
    contenedor.empty();

    let totalEmpleados = 0;
    let seleccionados = 0;

    // Recorrer departamentos
    jsonNominaConfianza.departamentos.forEach(departamento => {
        if (!departamento.empleados || departamento.empleados.length === 0) return;

        // Crear grupo de departamento
        const grupoHTML = `
            <div class="departamento-grupo" data-departamento="${departamento.nombre}">
                <div class="departamento-titulo">
                    <i class="bi bi-building"></i>
                    ${departamento.nombre}
                    <span style="margin-left: auto; font-size: 12px; font-weight: normal;">
                        (${departamento.empleados.length} empleados)
                    </span>
                </div>
                <div class="empleados-lista"></div>
            </div>
        `;
        contenedor.append(grupoHTML);

        const listaEmpleados = contenedor.find(`[data-departamento="${departamento.nombre}"] .empleados-lista`);

        // Agregar cada empleado
        departamento.empleados.forEach(empleado => {
            totalEmpleados++;
            
            // Si no tiene la propiedad 'mostrar', establecerla en true por defecto
            if (empleado.mostrar === undefined) {
                empleado.mostrar = true;
            }

            if (empleado.mostrar === true) {
                seleccionados++;
            }

            const checked = empleado.mostrar === true ? 'checked' : '';
            
            const empleadoHTML = `
                <div class="empleado-item">
                    <input type="checkbox" 
                           id="emp-${empleado.clave}-${empleado.id_empresa}" 
                           data-clave="${empleado.clave}"
                           data-id-empresa="${empleado.id_empresa}"
                           ${checked}>
                    <label for="emp-${empleado.clave}-${empleado.id_empresa}">
                        <span class="empleado-clave">[${empleado.clave}]</span>
                        ${empleado.nombre}
                    </label>
                </div>
            `;
            
            listaEmpleados.append(empleadoHTML);
        });
    });

    // Actualizar contadores
    $('#contador-total').text(totalEmpleados);
    $('#contador-seleccionados').text(seleccionados);

    // Si no hay empleados
    if (totalEmpleados === 0) {
        contenedor.html('<div class="sin-resultados">No hay empleados en la nómina</div>');
    }
}

// Seleccionar todos los empleados visibles
function seleccionarTodos() {
    $('#contenedor-lista-empleados input[type="checkbox"]:visible').prop('checked', true);
    actualizarContador();
}

// Deseleccionar todos los empleados visibles
function deseleccionarTodos() {
    $('#contenedor-lista-empleados input[type="checkbox"]:visible').prop('checked', false);
    actualizarContador();
}

// Aplicar selección y cerrar modal
function aplicarSeleccion() {
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
        return;
    }

    // Recorrer todos los checkboxes y actualizar la propiedad 'mostrar'
    $('#contenedor-lista-empleados input[type="checkbox"]').each(function() {
        const clave = $(this).data('clave');
        const idEmpresa = $(this).data('id-empresa');
        const marcado = $(this).is(':checked');

        // Buscar el empleado en jsonNominaConfianza y actualizar su propiedad
        jsonNominaConfianza.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp => {
                    if (emp.clave == clave && emp.id_empresa == idEmpresa) {
                        emp.mostrar = marcado;
                    }
                });
            }
        });
    });

    // Guardar cambios
    if (typeof saveNomina === 'function') {
        saveNomina(jsonNominaConfianza);
    }

    // Refrescar la tabla
    if (typeof mostrarDatosTabla === 'function') {
        mostrarDatosTabla(jsonNominaConfianza, paginaActualNomina || 1);
    }

    // Cerrar modal usando Bootstrap
    const modalEl = document.getElementById('modal-seleccionar-empleados');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) {
        modal.hide();
    }

    // Notificar
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Selección aplicada',
            text: 'La tabla se ha actualizado',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// Actualizar contador de seleccionados
function actualizarContador() {
    const total = $('#contenedor-lista-empleados input[type="checkbox"]:visible').length;
    const seleccionados = $('#contenedor-lista-empleados input[type="checkbox"]:visible:checked').length;
    
    $('#contador-total').text(total);
    $('#contador-seleccionados').text(seleccionados);
}

// Filtrar empleados por búsqueda
function filtrarEmpleadosModal(textoBusqueda) {
    const texto = textoBusqueda.toLowerCase().trim();

    if (texto === '') {
        // Mostrar todos
        $('.empleado-item').show();
        $('.departamento-grupo').show();
    } else {
        // Filtrar empleados
        $('.empleado-item').each(function() {
            const nombre = $(this).find('label').text().toLowerCase();
            if (nombre.includes(texto)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });

        // Ocultar departamentos sin empleados visibles
        $('.departamento-grupo').each(function() {
            const empleadosVisibles = $(this).find('.empleado-item:visible').length;
            if (empleadosVisibles > 0) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    actualizarContador();
}

// ============================================
// EVENTOS
// ============================================

$(document).ready(function() {
    // Abrir modal con botón
    $(document).on('click', '#btn-seleccionar-empleados', function() {
        abrirModalSeleccionarEmpleados();
    });

    // Seleccionar todos
    $(document).on('click', '#btn-seleccionar-todos', function() {
        seleccionarTodos();
    });

    // Deseleccionar todos
    $(document).on('click', '#btn-deseleccionar-todos', function() {
        deseleccionarTodos();
    });

    // Aplicar selección
    $(document).on('click', '#btn-aplicar-seleccion', function() {
        aplicarSeleccion();
        limpiarFiltrosYBusqueda();
    });

    // Actualizar contador al cambiar checkbox
    $(document).on('change', '#contenedor-lista-empleados input[type="checkbox"]', function() {
        actualizarContador();
    });

    // Buscar empleados
    $(document).on('input', '#buscar-empleado-modal', function() {
        const texto = $(this).val();
        filtrarEmpleadosModal(texto);
    });
});
