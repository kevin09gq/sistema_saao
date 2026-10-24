//====================================================
// VARIABLES GLOBALES DE ESTADISTICAS
//====================================================

// año seleccionado actualmente
let anioSeleccionado = '';

// datos en memoria de kpis y desglose
let datosKpis = null;
let datosDesglose = null;


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

    // cargar desglose de la ultima semana
    cargarDesgloseUltimaSemana(anio);

    // recargar grafica de evolucion semanal si existe
    if (typeof cargarEvolucionSemanal === 'function') {
        cargarEvolucionSemanal(anio);
    }

    // recargar grafica de distribucion presupuestal si existe
    if (typeof cargarDistribucionPresupuestal === 'function') {
        cargarDistribucionPresupuestal(anio);
    }

    // recargar ranking de costo si existe
    if (typeof cargarRankingUltimaSemana === 'function') {
        cargarRankingUltimaSemana(anio);
    }

    // recargar grafica de promedios semanales si existe
    if (typeof cargarPromediosSemanales === 'function') {
        cargarPromediosSemanales(anio);
    }

    // recargar historial semanal de nominas si existe
    if (typeof cargarHistorialSemanal === 'function') {
        cargarHistorialSemanal(anio);
    }
}


//====================================================
// FUNCION PARA CARGAR EL SELECT DE AÑOS
//====================================================

function cargarSelectAnio() {
    // peticion ajax para obtener los años
    $.ajax({
        type: "POST",
        url: "../php/estadisticas.php",
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
        url: "../php/estadisticas.php",
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

    // actualizar badge y monto de la ultima semana
    $('#kpi-total-ultima-semana-badge').text(`Semana ${datosKpis.ultima_semana}`);
    $('#kpi-total-ultima-monto').text(formatearMonto(datosKpis.total_ultima_semana));

    // calcular variacion con respecto a semana anterior
    let variacion = datosKpis.total_ultima_semana - datosKpis.total_semana_anterior;
    let porcentajeVariacion = 0;

    if (datosKpis.total_semana_anterior > 0) {
        porcentajeVariacion = (variacion / datosKpis.total_semana_anterior) * 100;
    }

    // generar html del comparativo de variacion
    let htmlVariacion = '';
    if (variacion > 0) {
        htmlVariacion = `
            <span class="text-success small">
                <i class="bi bi-arrow-up"></i>
                +${formatearMonto(variacion)} (${porcentajeVariacion.toFixed(1)}%)
            </span>
            <span class="text-muted small">vs semana anterior</span>
        `;
    } else if (variacion < 0) {
        htmlVariacion = `
            <span class="text-danger small">
                <i class="bi bi-arrow-down"></i>
                ${formatearMonto(variacion)} (${porcentajeVariacion.toFixed(1)}%)
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
    $('#kpi-total-ultima-vs-antigua').html(htmlVariacion);

    // actualizar datos de la semana mas cara
    $('#kpi-max-monto').text(formatearMonto(datosKpis.monto_semana_cara));
    let difPromedio = datosKpis.monto_semana_cara - datosKpis.promedio_semanal;
    $('#kpi-max-dif-promedio').text(`+${formatearMonto(difPromedio)} vs promedio semanal`);
    $('#kpi-max-semana-label').text(`Semana ${datosKpis.semana_mas_cara}`);

    // actualizar acumulado anual
    $('#kpi-acumulado-monto').text(formatearMonto(datosKpis.acumulado_anual));
    $('#kpi-acumulado-semanas-label').text(`Año ${anioSeleccionado}`);

    // actualizar promedio semanal
    $('#kpi-promedio-monto').text(formatearMonto(datosKpis.promedio_semanal));
}


//====================================================
// FUNCION PARA CARGAR EL DESGLOSE DE LA ULTIMA SEMANA
//====================================================

function cargarDesgloseUltimaSemana(anio = null) {
    // determinar año a consultar
    let anioConsulta = anio || anioSeleccionado;

    // validar año
    if (!anioConsulta) {
        return;
    }

    // peticion ajax para obtener desglose
    $.ajax({
        type: "POST",
        url: "../php/estadisticas.php",
        data: {
            accion: "obtenerDesgloseUltimaSemana",
            anio: anioConsulta
        },
        dataType: "json",

        success: function (respuesta) {
            // validar respuesta
            if (respuesta.success) {
                // guardar datos y actualizar etiqueta
                datosDesglose = respuesta.desglose;

                $('#label-fecha-ultima-semana').text(
                    `Semana ${respuesta.ultima_semana} - Total consolidado: ${formatearMonto(respuesta.total_consolidado)}`
                );

                // mostrar tarjetas de desglose
                mostrarDesgloseUltimaSemana(respuesta.desglose, respuesta.total_consolidado);
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
            // notificar error de comunicacion
            console.error("error al obtener el desglose:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCION PARA MOSTRAR EL DESGLOSE DE LA ULTIMA SEMANA
//====================================================

function mostrarDesgloseUltimaSemana(desglose, totalConsolidado) {
    // limpiar el contenedor de tarjetas
    $('#contenedor-desglose-ultima-semana').empty();

    // catalogo de las 8 nominas con sus estilos
    const nominas = [
        { nombre: '40 Lbs',        clase: 'chip-8nom chip-8nom-40lbs' },
        { nombre: '40 Lbs Jornal', clase: 'chip-8nom chip-8nom-40lbs-jornal' },
        { nombre: '10 Lbs',        clase: 'chip-8nom chip-8nom-10lbs' },
        { nombre: 'Confianza',     clase: 'chip-8nom chip-8nom-confianza' },
        { nombre: 'Relicario',     clase: 'chip-8nom chip-8nom-relicario' },
        { nombre: 'Pilar',         clase: 'chip-8nom chip-8nom-pilar' },
        { nombre: 'Huasteca',      clase: 'chip-8nom chip-8nom-huasteca' },
        { nombre: 'Palmilla',      clase: 'chip-8nom chip-8nom-palmilla' }
    ];

    // recorrer nominas y generar las tarjetas
    nominas.forEach(function (nominaDef) {
        // buscar datos de la nomina en la respuesta
        let nominaEncontrada = desglose.find(function (n) {
            return n.nomina === nominaDef.nombre;
        });

        // asignar monto y calcular porcentaje
        let monto = nominaEncontrada ? nominaEncontrada.monto : 0;
        let porcentaje = totalConsolidado > 0 ? (monto / totalConsolidado) * 100 : 0;

        // agregar tarjeta al contenedor
        $('#contenedor-desglose-ultima-semana').append(`
            <div class="col-12 col-sm-6 col-lg-3">
                <div class="card border-0 shadow-sm h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="${nominaDef.clase}">${nominaDef.nombre}</span>
                            <span class="badge bg-light text-dark">${porcentaje.toFixed(1)}%</span>
                        </div>
                        <h5 class="fw-bold mb-0 text-dark">${formatearMonto(monto)}</h5>
                        <small class="text-muted">Aportación individual</small>
                    </div>
                </div>
            </div>
        `);
    });
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
