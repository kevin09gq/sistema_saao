// ========================================
// MENÚ CONTEXTUAL EN LA TABLA DE NÓMINA
// ========================================
const $menu = $('#context-menu');
let filaSeleccionada = null;

mostrarContextMenu();
abrirModal();


function mostrarContextMenu() {
    // Click derecho en fila de la tabla
    $('#tabla-nomina-body-confianza').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        filaSeleccionada = $(this);

        // Posicionar y mostrar menú
        $menu.css({
            top: e.pageY + 'px',
            left: e.pageX + 'px'
        }).show();
    });

    // Cerrar menú al hacer click en otro lugar
    $(document).on('click', function () {
        $menu.hide();
    });
}

function abrirModal() {
    // Acciones del menú contextual
    $menu.on('click', '.cm-item', function () {
        const accion = $(this).data('action');
        if (accion === 'ver' && filaSeleccionada) {


            // Obtener clave e id_empresa del empleado
            const clave = String(filaSeleccionada.data('clave') || '').trim();
            const idEmpresa = parseInt(filaSeleccionada.data('id-empresa')) || 1;

            // Buscar el empleado usando la función dedicada
            const empleadoEncontrado = buscarEmpleado(clave, idEmpresa);

            if (empleadoEncontrado) {
                         
                establerDataModal(empleadoEncontrado);
            } else {
                console.warn('Empleado no encontrado');
            }

        }
        $menu.hide();
    });
}

// Función para buscar empleado por clave e id_empresa
function buscarEmpleado(clave, idEmpresa) {
    if (!jsonNominaConfianza || !jsonNominaConfianza.departamentos) {
        return null;
    }

    for (let depto of jsonNominaConfianza.departamentos) {
        if (depto.empleados) {
            const empleado = depto.empleados.find(emp =>
                String(emp.clave || '').trim() === clave &&
                parseInt(emp.id_empresa) === idEmpresa
            );
            if (empleado) {
                return empleado;
            }
        }
    }
    return null;
}

