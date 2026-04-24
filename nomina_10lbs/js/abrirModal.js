// ========================================
// MENÚ CONTEXTUAL EN LA TABLA DE NÓMINA
// ========================================
const $menu = $('#context-menu');
let filaSeleccionada = null;

mostrarContextMenu();
abrirModal();

//=======================================
// MUESTRA EL CONTEX MENU AL HACER CLICK DERECHO EN LA FILA DE LA TABLA
//=======================================

function mostrarContextMenu() {
    // Click derecho en fila de la tabla
    $('#tabla-nomina-body-10lbs').on('contextmenu', 'tr', function (e) {
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

//=======================================
// ABRE EL MODAL CON LOS DATOS DEL EMPLEADO SELECCIONADO EN LA FILA DE LA TABLA
//=======================================

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

//=======================================
// BUSCA AL EMPLEADO EN EL JSON DE NÓMINA USANDO CLAVE E ID_EMPRESA
//=======================================

function buscarEmpleado(clave, idEmpresa) {
    if (!jsonNomina10lbs || !jsonNomina10lbs.departamentos) {
        return null;
    }

    for (let depto of jsonNomina10lbs.departamentos) {
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

