
//==========================================================
// FUNCIÓN PARA MOSTRAR EL MENÚ CONTEXTUAL
// SOBRE LAS FILAS DE UNA TABLA
//==========================================================

function mostrarContextMenu() {

    // Detectar clic derecho sobre cualquier fila del tbody
    $(document).on('contextmenu', '#detalle-tabla-nomina-body-confianza tr', function (e) {

        // Evitar el menú contextual del navegador
        e.preventDefault();

        // Guardar la fila seleccionada (opcional)
        $('#context-menu').data('fila', $(this));

        // Mostrar el menú en la posición del cursor
        $('#context-menu')
            .css({
                top: e.pageY + 'px',
                left: e.pageX + 'px'
            })
            .show();

    });


    // Ocultar el menú al hacer clic en cualquier parte
    $(document).on('click', function () {

        $('#context-menu').hide();

    });

}


//===========================================
// FUNCIÓN PARA MOSTRAR EL MODAL DE DETALLES 
// DE LA NÓMINA DEL EMPLEADO SELECCIONADO
//===========================================

function mostrarModalHistorialEmpleado() {

    $('#context-menu').on('click', '.cm-item[data-action="ver"]', function () {

        // Obtener la fila seleccionada
        let fila = $('#context-menu').data('fila');

        // Obtener el id del empleado
        let idEmpleado = fila.data('id-empleado');

        // Variable para guardar el empleado encontrado
        let empleadoSeleccionado = null;

        // Buscar el empleado dentro del JSON
        jsonHistorialConfianza.departamentos.forEach(departamento => {

            departamento.empleados.forEach(empleado => {

                if (empleado.id_empleado == idEmpleado) {

                    empleadoSeleccionado = empleado;

                }

            });

        });

        console.log(empleadoSeleccionado);

        if (!empleadoSeleccionado) {

            mostrarAlerta(
                "warning",
                "Advertencia",
                "No se encontró el empleado."
            );

            return;

        }

        // Ocultar el menú contextual
        $('#context-menu').hide();

        // Establecer los datos del empleado

        establecerDataEmpleado(empleadoSeleccionado);

    });

}

// ==================================================
// FUNCIÓN PARA REGRESAR A LA VISTA HISTORIAL_40LBS
// ==================================================

function regresarHistorialconfianza() {

    $('#btnRegresar').on('click', function () {
        // Redirigir a la vista historial_confianza
        window.location.href = "historial_confianza.php";

        // Limpiar el localStorage
        localStorage.removeItem('id_nomina_confianza');

    });

}

//=======================================
// ACTUALIZAR CABECERA DE NÓMINA CON FECHAS Y NÚMERO DE SEMANA
//=======================================

function actualizarCabeceraNomina(json) {
    if (!json) return;

    // Función para obtener el nombre del mes en español
    function mesEnLetras(mes) {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[mes - 1];
    }

    // Extraer día, mes y año de las fechas
    function descomponerFecha(fecha) {
        // Verificar que la fecha no sea null o undefined
        if (!fecha) {
            return { dia: '', mes: '', anio: '' };
        }

        // Ejemplo: "21/Jun/2025" o "21/05/2025"
        const partes = fecha.split('/');
        let dia = partes[0] || '';
        let mes = partes[1] || '';
        let anio = partes[2] || '';

        // Si el mes es numérico, conviértelo a nombre
        if (/^\d+$/.test(mes)) {
            mes = mesEnLetras(parseInt(mes, 10));
        } else {
            // Si el mes es abreviado (Jun), conviértelo a nombre completo
            const mesesAbrev = {
                'Ene': 'Enero', 'Feb': 'Febrero', 'Mar': 'Marzo', 'Abr': 'Abril', 'May': 'Mayo', 'Jun': 'Junio',
                'Jul': 'Julio', 'Ago': 'Agosto', 'Sep': 'Septiembre', 'Oct': 'Octubre', 'Nov': 'Noviembre', 'Dic': 'Diciembre'
            };
            mes = mesesAbrev[mes] || mes;
        }
        return { dia, mes, anio };
    }

    // Verificar que las fechas existan antes de procesarlas
    if (!json.fecha_inicio || !json.fecha_cierre) {
        $('#nombre_nomina').text('NÓMINA');
        $('#num_semana').text(`SEM ${json.numero_semana || ''}`);
        return;
    }

    const ini = descomponerFecha(json.fecha_inicio);
    const fin = descomponerFecha(json.fecha_cierre);

    let nombreNomina = '';
    if (ini.anio === fin.anio) {
        if (ini.mes === fin.mes) {
            // Mismo mes y año
            nombreNomina = `NÓMINA DEL ${ini.dia} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        } else {
            // Mismo año, diferente mes
            nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        }
    } else {
        // Diferente año
        nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} DEL ${ini.anio} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
    }

    $('#nombre_nomina').text(nombreNomina);
    $('#num_semana').text(`SEM ${json.numero_semana}`);
}
