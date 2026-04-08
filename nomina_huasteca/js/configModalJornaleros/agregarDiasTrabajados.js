
abrirModalDiasExtra();
filtrarEmpleadosExtra();
aplicarDiasExtraEmpleado();

//=====================================
// ABRIR MODAL DIAS EXTRA
//=====================================
function abrirModalDiasExtra() {
    $(document).on('click', '#btn_modal_dias_extra', function () {
        cargarJornalerosEnModal();
        const modal = new bootstrap.Modal(document.getElementById('modal-dias-extra'));
        modal.show();
    });
}

//=====================================
// CARGAR EMPLEADOS CON HORARIO TIPO 2
//=====================================

function cargarJornalerosEnModal() {
    const $tbody = $('#tbody-empleados-extra');
    $tbody.empty();

    if (!jsonNominaHuasteca || !jsonNominaHuasteca.departamentos) {
        $tbody.html('<tr><td colspan="4" class="text-center text-muted">No hay datos de nómina disponibles</td></tr>');
        return;
    }

    let contador = 0;

    // Recorrer departamentos y empleados
    jsonNominaHuasteca.departamentos.forEach(depto => {
        if (!depto.empleados) return;

        depto.empleados.forEach(emp => {
            // Filtrar solo Jornaleros (tipo_horario 2)
            if (emp.tipo_horario === 2) {
                contador++;
                const diasTrabajados = emp.dias_trabajados || 0;

                const fila = `
                    <tr class="fila-empleado-extra" data-clave="${emp.clave}">
                        <td>
                            <div class="form-check">
                                <input class="form-check-input check-empleado-extra" type="checkbox" value="${emp.clave}">
                            </div>
                        </td>
                        <td><span class="badge bg-light text-dark">${emp.clave}</span></td>
                        <td class="nombre-empleado-extra">${emp.nombre}</td>
                        <td class="text-center fw-bold">${diasTrabajados}</td>
                    </tr>
                `;
                $tbody.append(fila);
            }
        });
    });

    if (contador === 0) {
        $tbody.html('<tr><td colspan="4" class="text-center text-muted">No se encontraron jornaleros en esta nómina</td></tr>');
    }
}

//=====================================
// FUNCIONALIDA DE BUSQUEDA
//=====================================

function filtrarEmpleadosExtra() {
       // Buscador del modal
    $(document).on('keyup', '#busqueda-empleados-extra', function () {
        const busqueda = $(this).val().toLowerCase();
        
        $('.fila-empleado-extra').each(function() {
            const clave = $(this).data('clave').toString().toLowerCase();
            const nombre = $(this).find('.nombre-empleado-extra').text().toLowerCase();
            
            if (clave.includes(busqueda) || nombre.includes(busqueda)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

//=====================================
// SELECCIONAR Y DESELECCIONAR EMPLEADOS
//=====================================

function seleccionarDeseleccionarEmpleado() {
      // Seleccionar/Deseleccionar todos
    $(document).on('change', '#check-all-extra', function () {
        const checked = $(this).prop('checked');
        $('.check-empleado-extra').prop('checked', checked);
    });

}

//=====================================
// APLICAR DÍAS EXTRA A LOS EMPLEADOS SELECCIONADOS
//=====================================

function aplicarDiasExtraEmpleado() {
      // Aplicar Días Extra
    $(document).on('click', '#btn-aplicar-dia-extra', function () {
        const seleccionados = obtenerEmpleadosSeleccionadosExtra();
        const diaSeleccionado = $('#select-dia-semana-extra').val();
        
        if (seleccionados.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin selección',
                text: 'Por favor, selecciona al menos un empleado.'
            });
            return;
        }

        // Aplicar el incremento a cada uno
        seleccionados.forEach(emp => {
            aumentarDiaExtra(emp, diaSeleccionado);
            // Recalcular su sueldo y otros conceptos
            calcularSueldoSemanal(emp);
        });

        // Guardar cambios globalmente
        saveNomina(jsonNominaHuasteca);

        Swal.fire({
            icon: 'success',
            title: 'Días aplicados',
            text: `Se ha sumado ${diaSeleccionado} extra a ${seleccionados.length} empleados.`,
            timer: 2000,
            showConfirmButton: false
        });

        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('modal-dias-extra')).hide();
    });
}

//=====================================
// OBTENER EMPLEADOS SELECCIONADOS
//=====================================

function obtenerEmpleadosSeleccionadosExtra() {
    const clavesSeleccionadas = [];
    $('.check-empleado-extra:checked').each(function() {
        clavesSeleccionadas.push($(this).val());
    });

    const empleadosSeleccionados = [];
    
    // Buscar los objetos completos en jsonNominaHuasteca
    jsonNominaHuasteca.departamentos.forEach(depto => {
        if (!depto.empleados) return;
        depto.empleados.forEach(emp => {
            if (clavesSeleccionadas.includes(emp.clave)) {
                empleadosSeleccionados.push(emp);
            }
        });
    });

    return empleadosSeleccionados;
}

//=====================================
// AUMENTAR DÍA EXTRA
//=====================================

function aumentarDiaExtra(persona, dia) {
    if (!persona || !dia) return;
    
    // Inicializar arreglo detallado si no existe
    if (!Array.isArray(persona.dias_extra_detalle)) {
        persona.dias_extra_detalle = [];
    }
    
    // Agregar el día extra al arreglo
    persona.dias_extra_detalle.push({
        dia: dia,
        fecha: "Extra" // Etiqueta para identificar en la tabla
    });
    
    // Sincronizar el contador antiguo por compatibilidad
    persona.dias_extra = persona.dias_extra_detalle.length;
}
