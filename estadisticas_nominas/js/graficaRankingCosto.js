//====================================================
// VARIABLES GLOBALES DE LA GRÁFICA
//====================================================

// instancia de la gráfica
let chartRanking = null;

// datos del ranking de costo
let datosRanking = null;


//====================================================
// FUNCIÓN PARA CARGAR EL RANKING DE COSTO
//====================================================

function cargarRankingUltimaSemana(anio) {

    // validar que se haya recibido el año
    if (!anio) {
        return;
    }

    // llamada ajax para obtener el ranking de costo
    $.ajax({
        type: "POST",
        url: "../php/graficaRankingCosto.php",
        data: {
            accion: "obtenerRankingUltimaSemana",
            anio: anio
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos del ranking
                datosRanking = respuesta;

                // renderizar la gráfica
                renderizarGraficaRanking(respuesta);

            } else {

                // mostrar error si falló
                console.error(respuesta.mensaje);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });
            }
        },

        error: function (xhr, estado, error) {

            // mostrar error en consola
            console.error("error al obtener el ranking de costo:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA GRÁFICA DE RANKING
//====================================================

function renderizarGraficaRanking(datos) {

    // preparar los datos para la gráfica
    let etiquetas = datos.ranking.map(function (item) {
        return item.nomina;
    });

    let montos = datos.ranking.map(function (item) {
        return item.monto;
    });

    // colores de las 8 nóminas (según la paleta del css)
    let colores = [
        '#2d6a4f',  // 40 Lbs - Verde Corporativo
        '#40916c',  // 40 Lbs Jornal - Verde Bosque
        '#52b788',  // 10 Lbs - Verde Salvia
        '#2563eb',  // Confianza - Azul Zafiro
        '#d97706',  // Relicario - Ámbar Cosecha
        '#0d9488',  // Pilar - Verde Azur
        '#ea580c',  // Huasteca - Cítrico Naranja
        '#9333ea'   // Palmilla - Ciruela
    ];

    // preparar el dataset
    let dataset = {
        label: 'Costo Individual',
        data: montos,
        backgroundColor: colores,
        borderColor: colores,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
    };

    // destruir la gráfica si ya existe
    if (chartRanking) {
        chartRanking.destroy();
    }

    // crear la gráfica de barras horizontales
    let ctx = document.getElementById('chartRankingUltimaSemana').getContext('2d');
    chartRanking = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [dataset]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 12
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            let valor = context.parsed.x;
                            return new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(valor);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        callback: function (value) {
                            return new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: '500'
                        }
                    }
                }
            }
        }
    });
}


//====================================================
// FUNCIÓN PARA ACTUALIZAR LA GRÁFICA AL CAMBIAR DE AÑO
//====================================================

function actualizarGraficaRanking(anio) {
    cargarRankingUltimaSemana(anio);
}
