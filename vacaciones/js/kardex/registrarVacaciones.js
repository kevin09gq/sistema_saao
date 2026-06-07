//==================================================================================================
// CONTROLADOR DE REGISTRO DE VACACIONES
//==================================================================================================

let festividadesGlobales = []; // Lista de fechas festivas en formato YYYY-MM-DD

$(document).ready(function () {
    inicializarRegistroVacaciones();
});

//==============================
// INICIALIZACIÓN DE LOS EVENTOS DE REGISTRO
//==============================
function inicializarRegistroVacaciones() {
    // Cargar festividades desde la base de datos
    $.post('../php/vacaciones_lft.php', {
        action: 'obtenerFestividades'
    }, function (fechas) {
        if (Array.isArray(fechas)) {
            festividadesGlobales = fechas;
        }
    }, 'json');

    // Escuchar cambios en las fechas para calcular los días a descontar
    $('#fechaInicio, #fechaFin').on('change', function () {
        calcularDiasRegistro();
    });

    // Formulario de Registro de Vacaciones
    $('#formRegistroVacaciones').on('submit', function (e) {
        e.preventDefault();
        registrarSalidaVacaciones();
    });

    // Botón Restaurar Todo
    $('#btnRestaurar').on('click', function () {
        restaurarDatosVacaciones();
    });
}

//==============================
// RESTAURA Y RECONSTRUYE LOS DATOS DE VACACIONES DEL EMPLEADO
//==============================
function restaurarDatosVacaciones() {
    if (!empleadoActual) {
        Swal.fire({
            icon: 'warning',
            title: 'Empleado no seleccionado',
            text: 'No hay un empleado seleccionado.'
        });
        return;
    }

    Swal.fire({
        icon: 'question',
        title: 'Restaurar datos de vacaciones',
        text: '¿Está seguro de restaurar todos los datos de vacaciones de este empleado? Esto eliminará todo el historial y volverá a calcular desde 0 a la fecha de hoy.',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let $btn = $('#btnRestaurar');
            let btnHtml = $btn.html();
            $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Restaurando...');

            $.post('../php/infoEmpleados.php', {
                action: 'restaurarVacaciones',
                id_empleado: empleadoActual.id_empleado
            }, function (res) {
                $btn.prop('disabled', false).html(btnHtml);
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Datos restaurados',
                        text: 'Se restauraron todos los datos correctamente.'
                    });
                    // Recargar toda la información del empleado
                    obtenerInformacionEmpleado(empleadoActual.id_empleado);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al restaurar datos',
                        text: 'Error: ' + res.message
                    });
                }
            }, 'json').fail(function () {
                $btn.prop('disabled', false).html(btnHtml);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al restaurar datos',
                    text: 'Ocurrió un error al procesar la restauración en el servidor.'
                });
            });
        }
    });
}

//==============================
// CALCULA Y ACTUALIZA LOS DÍAS EN EL INPUT CORRESPONDIENTE
//==============================
function calcularDiasRegistro() {
    let fIniStr = $('#fechaInicio').val();
    let fFinStr = $('#fechaFin').val();
    let dias = calcularDiasVacaciones(fIniStr, fFinStr);
    $('#numDiasDescontar').val(dias);
}

//==============================
// ENVÍA EL REGISTRO DE SALIDA DE VACACIONES AL SERVIDOR
//==============================
function registrarSalidaVacaciones() {
    if (!empleadoActual) {
        Swal.fire({
            icon: 'warning',
            title: 'Empleado no seleccionado',
            text: 'No hay un empleado seleccionado.'
        });
        return;
    }

    let fIniStr = $('#fechaInicio').val();
    let fFinStr = $('#fechaFin').val();
    let obs = $('#txtObservaciones').val();
    let dias = parseFloat($('#numDiasDescontar').val());

    if (dias <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Rango de fechas inválido',
            text: 'Por favor seleccione un rango válido de fechas de vacaciones (mínimo 1 día laborable).'
        });
        return;
    }

    Swal.fire({
        icon: 'question',
        title: 'Confirmar Registro',
        text: `¿Está seguro de registrar ${dias.toFixed(1)} días de vacaciones del ${formatearFechaSimple(fIniStr)} al ${formatearFechaSimple(fFinStr)}?`,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, registrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let $btn = $('#btnRegistrarVacaciones');
            let btnHtml = $btn.html();
            $btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Procesando...');

            $.post('../php/infoEmpleados.php', {
                action: 'registrarVacaciones',
                id_empleado: empleadoActual.id_empleado,
                fecha_inicio: fIniStr,
                fecha_fin: fFinStr,
                concepto: 'Salida de vacaciones',
                dias_descontar: dias,
                observaciones: obs
            }, function (res) {
                $btn.prop('disabled', false).html(btnHtml);
                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Vacaciones registradas',
                        text: 'Las vacaciones se registraron exitosamente.'
                    });

                    // Limpiar formulario
                    $('#fechaInicio').val('');
                    $('#fechaFin').val('');
                    $('#txtObservaciones').val('');
                    $('#numDiasDescontar').val(0);

                    // Recargar información del empleado, periodos y movimientos
                    obtenerInformacionEmpleado(empleadoActual.id_empleado);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al registrar vacaciones',
                        text: 'Error: ' + res.message
                    });
                }
            }, 'json').fail(function () {
                $btn.prop('disabled', false).html(btnHtml);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al registrar vacaciones',
                    text: 'Ocurrió un error al procesar el registro en el servidor.'
                });
            });
        }
    });
}

//==============================
// CÁLCULO DE DÍAS HÁBILES DE VACACIONES (EXCLUYE DOMINGOS Y FESTIVOS)
//==============================
function calcularDiasVacaciones(fechaIniStr, fechaFinStr) {
    if (!fechaIniStr || !fechaFinStr) return 0;
    let fIni = new Date(fechaIniStr + 'T00:00:00');
    let fFin = new Date(fechaFinStr + 'T00:00:00');
    if (fFin < fIni) return 0;

    let dias = 0;
    let iter = new Date(fIni);
    while (iter <= fFin) {
        // Obtener el día de la semana (0 = Domingo, 1 = Lunes, etc.)
        let w = iter.getDay();

        // Formatear la fecha iterada a YYYY-MM-DD para validar festivos
        let y = iter.getFullYear();
        let m = String(iter.getMonth() + 1).padStart(2, '0');
        let d = String(iter.getDate()).padStart(2, '0');
        let fechaStr = `${y}-${m}-${d}`;

        // Excluir domingos y festividades globales cargadas de la BD
        if (w !== 0 && !festividadesGlobales.includes(fechaStr)) {
            dias++;
        }
        iter.setDate(iter.getDate() + 1);
    }
    return dias;
}

//==============================
// FUNCIONES AUXILIARES DE FORMATEO
//==============================
function formatearFechaSimple(fechaTexto) {
    if (!fechaTexto) return '---';
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    let parts = fechaTexto.split('-');
    if (parts.length === 3) {
        let y = parts[0];
        let m = parseInt(parts[1]) - 1;
        let d = parseInt(parts[2]);
        return `${d} ${meses[m]} ${y}`;
    }
    return fechaTexto;
}
