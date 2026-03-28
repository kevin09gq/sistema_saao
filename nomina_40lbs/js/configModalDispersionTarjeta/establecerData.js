// ========================================
// ABRIR MODAL DE DISPERSION DE TARJETA
// ========================================

$(document).ready(function () {
    $('#btn_ver_dispersion').on('click', function () {
        abrirModalDispersionTarjeta();
    });
});

function abrirModalDispersionTarjeta() {
    if (typeof jsonNomina40lbs === 'undefined' || !jsonNomina40lbs || !jsonNomina40lbs.departamentos) {
        Swal.fire('Error', 'No hay datos de nómina cargados.', 'error');
        return;
    }

    // Inicializar el select de departamentos
    cargarDepartamentosEnSelect();

    // Mostrar todos los empleados inicialmente
    const todosLosEmpleados = obtenerTodosLosEmpleadosFiltrados();
    renderizarTablaTarjeta(todosLosEmpleados);

    // Mostrar el modal
    $('#modalDispersionTarjeta').modal('show');
}



// ========================================
// ESTABLECER DATA PARA EL MODAL DE DISPERSIÓN DE TARJETA
// ========================================

function renderizarTablaTarjeta(empleados) {
    const $tbody = $('#tbody-dispersion-tarjeta');
    $tbody.empty();

    let totalGeneral = 0;

    if (empleados.length === 0) {
        $tbody.append('<tr><td colspan="4" class="text-center text-muted">No se encontraron empleados.</td></tr>');
    } else {
        empleados.forEach((emp, index) => {
            const montoTarjeta = parseFloat(emp.tarjeta) || 0;
            totalGeneral += montoTarjeta;

            const row = `
                <tr data-clave="${emp.clave}">
                    <td class="text-center">${index + 1}</td>
                    <td><span class="badge bg-light text-dark border">${emp.clave || 'N/A'}</span></td>
                    <td>${emp.nombre || 'SIN NOMBRE'}</td>
                    <td class="text-end">
                        <div class="d-flex align-items-center justify-content-end gap-2">
                             <span class="fw-bold text-dark valor-tarjeta">$${montoTarjeta.toFixed(2)}</span>
                             <button class="btn btn-sm btn-outline-primary btn-editar-tarjeta" title="Editar monto">
                                <i class="bi bi-pencil-square"></i>
                             </button>
                        </div>
                    </td>
                </tr>
            `;
            $tbody.append(row);
        });
    }

    // Actualizar totales en la vista
    $('#total-empleados-tarjeta').text(empleados.length);
    $('#total-general-tarjeta').text('$' + totalGeneral.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}
