//====================================================
// VARIABLES GLOBALES DE ESTADISTICAS 10 LBS
//====================================================

// año seleccionado actualmente
let anioSeleccionado = '';

// datos en memoria de kpis
let datosKpis = null;


//====================================================
// INICIALIZACION
//====================================================

$(document).ready(function () {
    // cargar listado de años al iniciar
    cargarSelectAnio();
});


//====================================================
// FUNCION PARA ACTUALIZAR TODAS LAS ESTADISTICAS DEL AÑO
//====================================================

function actualizarEstadisticas(anio) {
    // validar año recibido
    if (!anio) {
        return;
    }

    // cargar tarjetas kpi
    cargarKpis(anio);

    // recargar grafica de evolucion semanal si existe
    if (typeof cargarEvolucion === 'function') {
        cargarEvolucion(anio);
    }

    // recargar grafica de distribucion si existe
    if (typeof cargarDistribucionFinanciera === 'function') {
        cargarDistribucionFinanciera(anio);
    }

    // recargar grafica de seguro social por departamento si existe
    if (typeof actualizarGraficaDepartamentos === 'function') {
        actualizarGraficaDepartamentos(anio);
    }

    // recargar grafica de seguro social por semana si existe
    if (typeof actualizarGraficaDepartamentosSemanal === 'function') {
        actualizarGraficaDepartamentosSemanal(anio);
    }

    // recargar historial semanal si existe
    if (typeof actualizarHistorialSemanal === 'function') {
        actualizarHistorialSemanal(anio);
    }



}


//====================================================
// FUNCION PARA CARGAR EL SELECT DE AÑOS
//====================================================

function cargarSelectAnio() {
    // peticion ajax para obtener los años
    $.ajax({
        type: "POST",
        url: "../php/infoKpi.php",
        data: {
            accion: "obtenerAnios"
        },
        dataType: "json",

        success: function (respuesta) {
            // validar respuesta exitosa
            if (respuesta.success) {
                // limpiar select
                $('#select_anio').empty();

                // agregar opciones al select
                respuesta.anios.forEach(function (anio) {
                    $('#select_anio').append(`
                        <option value="${anio}">${anio}</option>
                    `);
                });

                // seleccionar el primer año y cargar estadisticas
                if (respuesta.anios.length > 0) {
                    anioSeleccionado = respuesta.anios[0];
                    $('#select_anio').val(anioSeleccionado);
                    actualizarEstadisticas(anioSeleccionado);
                }

            } else {
                // mostrar mensaje de error
                console.error(respuesta.mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });
            }
        },

        error: function (xhr, estado, error) {
            // mostrar error de conexion
            console.error("error al obtener los años:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCION PARA CARGAR LOS KPIS DEL AÑO
//====================================================

function cargarKpis(anio = null) {
    // determinar año a consultar
    let anioConsulta = anio || anioSeleccionado;

    // validar año
    if (!anioConsulta) {
        return;
    }

    // peticion ajax para obtener kpis
    $.ajax({
        type: "POST",
        url: "../php/infoKpi.php",
        data: {
            accion: "obtenerKpis",
            anio: anioConsulta
        },
        dataType: "json",

        success: function (respuesta) {
            // validar respuesta exitosa
            if (respuesta.success) {
                // guardar datos y actualizar interfaz
                datosKpis = respuesta.kpis;
                actualizarKpis();
            } else {
                // notificar error
                console.error(respuesta.mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });
            }
        },

        error: function (xhr, estado, error) {
            // notificar error de red
            console.error("error al obtener los kpis:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCION PARA ACTUALIZAR LAS TARJETAS KPI
//====================================================

function actualizarKpis() {
    // validar existencia de datos
    if (!datosKpis) {
        return;
    }

    // 1. NÓMINA MÁS ALTA
    $('#kpi-max-monto').text(formatearMonto(datosKpis.monto_semana_cara));
    let difPromedioAlta = datosKpis.monto_semana_cara - datosKpis.promedio_semanal;
    $('#kpi-max-dif-promedio').text(`+${formatearMonto(difPromedioAlta)} vs promedio`);
    $('#kpi-max-semana-label').text(`Semana ${datosKpis.semana_mas_cara}`);

    // 2. NÓMINA MÁS BAJA
    $('#kpi-min-monto').text(formatearMonto(datosKpis.monto_semana_baja));
    let difPromedioBaja = datosKpis.promedio_semanal - datosKpis.monto_semana_baja;
    $('#kpi-min-dif-promedio').text(`-${formatearMonto(difPromedioBaja)} vs promedio`);
    $('#kpi-min-semana-label').text(`Semana ${datosKpis.semana_mas_baja}`);

    // 3. DIFERENCIA ÚLTIMA VS ANTERIOR
    $('#kpi-dif-monto').text(formatearMonto(datosKpis.diferencia_ultima_anterior));
    let htmlVariacion = '';
    if (datosKpis.diferencia_ultima_anterior > 0) {
        htmlVariacion = `
            <span class="text-success small">
                <i class="bi bi-arrow-up"></i>
                +${formatearMonto(datosKpis.diferencia_ultima_anterior)} (${datosKpis.porcentaje_diferencia.toFixed(1)}%)
            </span>
            <span class="text-muted small">vs semana anterior</span>
        `;
    } else if (datosKpis.diferencia_ultima_anterior < 0) {
        htmlVariacion = `
            <span class="text-danger small">
                <i class="bi bi-arrow-down"></i>
                ${formatearMonto(datosKpis.diferencia_ultima_anterior)} (${datosKpis.porcentaje_diferencia.toFixed(1)}%)
            </span>
            <span class="text-muted small">vs semana anterior</span>
        `;
    } else {
        htmlVariacion = `
            <span class="text-muted small">
                sin variación vs semana anterior
            </span>
        `;
    }
    $('#kpi-dif-porcentaje').html(htmlVariacion);
    $('#kpi-dif-semanas-label').text(`Semana ${datosKpis.ultima_semana} vs ${datosKpis.ultima_semana - 1}`);

    // 4. PROMEDIO SEMANAL
    $('#kpi-promedio-monto').text(formatearMonto(datosKpis.promedio_semanal));
}


//====================================================
// FUNCION PARA FORMATEAR MONTOS EN MONEDA MEXICANA
//====================================================

function formatearMonto(monto) {
    // dar formato de moneda en pesos mexicanos
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(monto || 0);
}


//====================================================
// EVENTO: CAMBIO DE AÑO EN EL SELECT
//====================================================

$('#select_anio').on('change', function () {
    // capturar año seleccionado y actualizar estadisticas
    anioSeleccionado = $(this).val();
    actualizarEstadisticas(anioSeleccionado);
});
