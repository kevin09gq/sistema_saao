//==============================
// VARIABLE GLOBAL PARA ALMACENAR LOS DATOS DEL EMPLEADO
//==============================
let empleadoActual = null;
let festividadesGlobales = []; // Lista de festividades en formato YYYY-MM-DD

$(document).ready(function () {
    // Obtener ID del empleado desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idEmpleado = urlParams.get('id');

    if (idEmpleado) {
        cargarFestividades(); // Cargar festividades primero
        obtenerInformacionEmpleado(idEmpleado);
        obtenerMovimientosKardex(idEmpleado);
    } else {
        alert("No se especificó un empleado.");
        window.location.href = 'vacaciones.php';
    }

    // Evento para capturar cuando se selecciona un movimiento
    $('#selectMovimientoKardex').on('change', function () {
        let idKardex = $(this).val();
        $('#idKardexSeleccionado').val(idKardex);
    });

    // Botón Volver
    $('#btnVolver').on('click', function (e) {
        e.preventDefault();
        window.location.href = 'vacaciones.php';
    });

    // Botón Guardar Prima Vacacional
    $('#btn_guardar_prima').on('click', function (e) {
        e.preventDefault();
        guardarPrima();
    });

    inicializarEventosCalculo(); // Inicializar eventos para cálculos automáticos
});

//==============================
// OBTIENE LA INFORMACIÓN DEL EMPLEADO DESDE EL SERVIDOR
//==============================
function obtenerInformacionEmpleado(idEmpleado) {
    $.post('../php/infoEmpleados.php', {
        action: 'obtenerEmpleadoPorId',
        id_empleado: idEmpleado
    }, function (empleado) {
        if (empleado.error) {
            alert(empleado.error);
            return;
        }
        empleadoActual = empleado; // Guardar en variable global
        $('#idEmpleado').val(empleado.id_empleado); // Establecer el ID en el campo oculto
        
        // Cargar salario diario en el formulario
        $('#salarioDiario').val(empleado.salario_diario || '');
        
        cargarEncabezadoEmpleado(empleado);

        // Disparar cambio para calcular
        $('#salarioDiario').trigger('change');
    }, 'json');
}

//==============================
// CARGA LA INFORMACION DEL EMPLEADO EN EL ENCABEZADO DE LA PAGINA
//==============================
function cargarEncabezadoEmpleado(emp) {
    let iniciales = (emp.nombre.charAt(0) + (emp.ap_paterno ? emp.ap_paterno.charAt(0) : '')).toUpperCase();
    $('#avatarEmpleado').text(iniciales);
    $('#nombreEmpleado').text(`${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}`);
    $('#claveEmpleado').text(emp.clave_empleado);
    $('#deptoEmpleado').text(emp.nombre_departamento || 'Sin asignar');
    $('#ingresoEmpleado').text(formatearFecha(emp.fecha_ingreso_final));
    $('#antiguedadEmpleado').text(emp.antiguedad);
}

//==============================
// CARGA LAS FESTIVIDADES DESDE LA BASE DE DATOS
//==============================
function cargarFestividades() {
    $.post('../php/vacaciones_lft.php', {
        action: 'obtenerFestividades'
    }, function (fechas) {
        if (Array.isArray(fechas)) {
            festividadesGlobales = fechas;
        }
    }, 'json');
}

//==============================
// AUTO-LLENA LOS DATOS AL SELECCIONAR UN MOVIMIENTO DEL KARDEX
//==============================
function autoLlenarDatos(idKardex) {
    if (!idKardex) {
        $('#idKardexSeleccionado').val('');
        $('#diasVacaciones').val('');
        $('#fechaInicio').val('');
        $('#fechaFin').val('');
        $('#anio').val('');
        $('#domingos').val('0');
        $('#festivos').val('0');
        $('#incluirDomingos').prop('checked', true);
        $('#incluirFestivos').prop('checked', true);
        $('#diasTotalesCalculo').text('0.000');
        $('#diasVacaciones').trigger('change');
        return;
    }

    let option = $(`#selectMovimientoKardex option[value="${idKardex}"]`);
    if (option.length) {
        let dias = option.data('dias');
        let inicio = option.data('inicio');
        let fin = option.data('fin');

        // Guardar el id del kardex
        $('#idKardexSeleccionado').val(idKardex);

        // Llenar año de la fecha de inicio de vacaciones
        $('#anio').val(inicio ? new Date(inicio).getFullYear() : '');

        // Llenar campos de fechas y días
        $('#diasVacaciones').val(dias);
        $('#fechaInicio').val(inicio);
        $('#fechaFin').val(fin);

        // Calcular y llenar domingos
        let numDomingos = contarDomingos(inicio, fin);
        $('#domingos').val(numDomingos);

        // Calcular y llenar festivos
        let numFestivos = contarFestivos(inicio, fin);
        $('#festivos').val(numFestivos);

        // Default switches to checked
        $('#incluirDomingos').prop('checked', true);
        $('#incluirFestivos').prop('checked', true);

        // Trigger change event to fire calculations
        $('#diasVacaciones').trigger('change');
    }
}

//==============================
// OBTIENE LOS MOVIMIENTOS DEL KARDEX DE VACACIONES DEL EMPLEADO
//==============================
function obtenerMovimientosKardex(idEmpleado) {
    // Primero obtener los kardex que ya tienen prima vacacional
    $.post('../php/primaVacacional.php', {
        action: 'obtenerKardexConPrima',
        id_empleado: idEmpleado
    }, function (kardexConPrima) {
        // Luego obtener todos los movimientos del kardex
        $.post('../php/infoEmpleados.php', {
            action: 'obtenerKardexEmpleado',
            id_empleado: idEmpleado
        }, function (movimientos) {
            if (Array.isArray(movimientos) && movimientos.length > 0) {
                cargarSelectKardex(movimientos, kardexConPrima);
            }
        }, 'json');
    }, 'json');
}

//==============================
// CARGA EL SELECT CON LOS MOVIMIENTOS DEL KARDEX
// Filtra los que ya tienen prima vacacional registrada
//==============================
function cargarSelectKardex(movimientos, kardexConPrima) {
    // kardexConPrima es un array de id_kardex que ya tienen prima
    let idsConPrima = Array.isArray(kardexConPrima) ? kardexConPrima : [];

    let selectHtml = '<option value="">-- Selecciona un movimiento de vacaciones --</option>';

    movimientos.forEach(mov => {
        // Solo mostrar movimientos negativos (descuentos de vacaciones)
        if (mov.dias_movimiento < 0) {
            let idKardex = parseInt(mov.id_kardex);
            let fecha_inicio = formatearFechaSimple(mov.fecha_inicio);
            let fecha_fin = formatearFechaSimple(mov.fecha_fin);
            let dias = Math.abs(parseFloat(mov.dias_movimiento)).toFixed(3);

            // Si ya tiene prima, no lo incluye en el select
            if (idsConPrima.includes(idKardex)) {
                return; // Saltar este movimiento
            }

            let label = `${fecha_inicio} al ${fecha_fin} (${dias} días)`;

            selectHtml += `<option value="${mov.id_kardex}" data-dias="${dias}" data-inicio="${mov.fecha_inicio}" data-fin="${mov.fecha_fin}">
                ${label}
            </option>`;
        }
    });

    $('#selectMovimientoKardex').html(selectHtml);
}




//==============================
// FUNCIONES AUXILIARES
//==============================
function formatearFecha(fechaTexto) {
    if (!fechaTexto) return '---';
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    let fecha = new Date(fechaTexto);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}

//==============================
// FORMATEA FECHA SIMPLE PARA VISUALIZACIÓN
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

//==============================
// CUENTA LOS DOMINGOS EN UN RANGO DE FECHAS
//==============================
function contarDomingos(fechaIniStr, fechaFinStr) {
    if (!fechaIniStr || !fechaFinStr) return 0;

    let fIni = new Date(fechaIniStr + 'T00:00:00');
    let fFin = new Date(fechaFinStr + 'T00:00:00');
    if (fFin < fIni) return 0;

    let domingos = 0;
    let iter = new Date(fIni);

    while (iter <= fFin) {
        if (iter.getDay() === 0) { // 0 = Domingo
            domingos++;
        }
        iter.setDate(iter.getDate() + 1);
    }

    return domingos;
}

//==============================
// CUENTA LOS FESTIVOS EN UN RANGO DE FECHAS
//==============================
function contarFestivos(fechaIniStr, fechaFinStr) {
    if (!fechaIniStr || !fechaFinStr) return 0;

    let fIni = new Date(fechaIniStr + 'T00:00:00');
    let fFin = new Date(fechaFinStr + 'T00:00:00');
    if (fFin < fIni) return 0;

    let festivos = 0;
    let iter = new Date(fIni);

    while (iter <= fFin) {
        let y = iter.getFullYear();
        let m = String(iter.getMonth() + 1).padStart(2, '0');
        let d = String(iter.getDate()).padStart(2, '0');
        let fechaStr = `${y}-${m}-${d}`;

        if (festividadesGlobales.includes(fechaStr)) {
            festivos++;
        }

        iter.setDate(iter.getDate() + 1);
    }

    return festivos;
}

