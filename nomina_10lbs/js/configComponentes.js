updateTarjeta();
quitarTarjeta();
moverModales();

//=======================================
// OCULTAR CONTENEDOR DE CARGA DE ARCHIVO PARA MOSTRAR LA TABLA DE NÓMINA
//=======================================

function initComponents() {
    $("#container-nomina_10lbs").attr("hidden", true);

    $("#tabla-nomina-responsive").removeAttr("hidden");

}

// ============================================
// ACTUALIZAR CONCEPTOS Y TARJETA A TODOS LOS EMPLEADOS
// ============================================
function updateTarjeta() {
    $(document).on('click', '#btn_aplicar_copias_global', function (e) {
        e.preventDefault();

        if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
            alert('No hay nómina cargada para aplicar copias.');
            return;
        }

        let totalAplicados = 0;

        jsonNomina10lbs.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                // Asignar conceptos_copia a conceptos
                if (Array.isArray(emp.conceptos_copia) && emp.conceptos_copia.length > 0) {
                    emp.conceptos = JSON.parse(JSON.stringify(emp.conceptos_copia));
                }

                // Actualizar tarjeta con lo que hay en tarjeta_copia
                if (emp.tarjeta_copia !== undefined && emp.tarjeta_copia !== null) {
                    emp.tarjeta = emp.tarjeta_copia;
                }

                totalAplicados++;
            });
        });

        // Guardar cambios
        saveNomina(jsonNomina10lbs);
        refrescarTabla(); // Refrescar tabla para mostrar cambios        
        // Mostrar confirmación
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Copias aplicadas',
                text: 'Se aplicaron copias a ' + totalAplicados + ' empleados.'
            });
        } else {
            alert('Copias aplicadas a ' + totalAplicados + ' empleados.');
        }
    });
}

// ============================================
// QUITA TARJETA A TODOS LOS EMPLEADOS 
// ============================================
function quitarTarjeta() {

    $(document).on('click', '#btn_delete_tarjeta', function () {
        if (typeof jsonNomina10lbs === 'undefined' || !jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) {
            console.warn('No hay nómina cargada para eliminar tarjetas.');
            return;
        }

        // Confirmación con SweetAlert2
        Swal.fire({
            title: '¿Quitar tarjeta a todos los empleados?',
            text: 'Esta acción establecerá 0 a "tarjeta" para todos los empleados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Iterar departamentos y empleados y asignar 0 a tarjeta
                jsonNomina10lbs.departamentos.forEach(departamento => {
                    if (!Array.isArray(departamento.empleados)) return;
                    departamento.empleados.forEach(empleado => {
                        empleado.tarjeta = 0; // asignación directa, sencillo y claro
                    });
                });

                saveNomina(jsonNomina10lbs);
                refrescarTabla(); // Refrescar tabla para mostrar cambios
                // Mostrar confirmación modal (tamaño normal, no toast)
                Swal.fire({
                    icon: 'success',
                    title: 'Tarjetas quitadas',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
            }
        });
    });
}

//=======================================
// LIMPIAR CAMPOS DE NÓMINA Y REINICIAR ESTADO
//=======================================

function limpiarCamposNomina() {
    $("#btn_limpiar_datos").click(function (e) {
        e.preventDefault();

        Swal.fire({
            title: '¿Limpiar datos?',
            text: '¿Está seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                clearNomina();
                
                // Limpiar formulario de archivos
                $('#form_excel_raya')[0].reset();
                $('#archivo_excel_lista_raya_10lbs').val('');
                $('#archivo_excel_biometrico_10lbs').val('');
                
                // Limpiar paginación
                $('#paginacion-nomina').empty();
                paginaActualNomina = 1;
                
                // Mostrar contenedor de carga y ocultar tabla
                $("#container-nomina_10lbs").removeAttr("hidden");
                $("#tabla-nomina-responsive").attr("hidden", true);
            }
        });


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


function moverModales() {
    // Mover el modal de configuración de valores al body para evitar problemas de z-index
    $(".modal-dialog").draggable({
        handle: ".modal-header"
    });
}