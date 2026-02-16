// ========================================
// MENÚ CONTEXTUAL EN LA TABLA DE NÓMINA
// ========================================
const $menu = $('#context-menu');
let filaSeleccionada = null;

mostrarContextMenu();
abrirModal();


function mostrarContextMenu() {
    // Click derecho en fila de la tabla
    $('#tabla-nomina-body-relicario').on('contextmenu', 'tr', function (e) {
        e.preventDefault();
        filaSeleccionada = $(this);

        // Obtener datos de la fila
        const clave = filaSeleccionada.data('clave');
        const idTipoPuesto = filaSeleccionada.data('id-tipo-puesto');

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
     
            // Obtener idTipoPuesto desde la fila seleccionada
            const idTipoPuesto = filaSeleccionada.data('id-tipo-puesto');
            
            // Solo abrir modal si es Coordinador (id_tipo_puesto 4 o 5)
            if (idTipoPuesto === 4 || idTipoPuesto === 5) {
                // Obtener clave e id_empresa del empleado
                const clave = String(filaSeleccionada.data('clave') || '').trim();
                const idEmpresa = parseInt(filaSeleccionada.data('id-empresa')) || 1;
                
                // Buscar el empleado usando la función dedicada
                const empleadoEncontrado = buscarEmpleado(clave, idEmpresa);
                
                if (empleadoEncontrado) {
                    establerDataModalCoordinador(empleadoEncontrado);
                } else {
                   console.warn('Empleado no encontrado');
                } 
            } else {
                console.warn('Este empleado no es un Coordinador (tipo:', idTipoPuesto + ')');
                alert('Este modal es solo para Coordinadores.');
            }
        }
        $menu.hide();
    });
}

// Función para buscar empleado por clave e id_empresa
function buscarEmpleado(clave, idEmpresa) {
    if (!jsonNominaRelicario || !jsonNominaRelicario.departamentos) {
        return null;
    }
    
    for (let depto of jsonNominaRelicario.departamentos) {
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

