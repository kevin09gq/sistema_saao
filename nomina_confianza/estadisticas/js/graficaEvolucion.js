//====================================================
// VARIABLES GLOBALES DE LA GRÁFICA
//====================================================

// instancia de la gráfica
let chartEvolucion = null;

// datos de la evolución semanal
let datosEvolucion = null;


//====================================================
// FUNCIÓN PARA CARGAR LA EVOLUCIÓN SEMANAL
//====================================================

function cargarEvolucion(anio) {

    // validar que se haya recibido el año
    if (!anio) {
        return;
    }

    // llamada ajax para obtener la evolución semanal
    $.ajax({
        type: "POST",
        url: "../php/infoGraficaEvolucion.php",
        data: {
            accion: "obtenerEvolucionSemanal",
            anio: anio
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos de la evolución
                datosEvolucion = respuesta;

                // renderizar la gráfica
                renderizarGraficaEvolucion(respuesta);

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
            console.error("error al obtener la evolución semanal:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA GRÁFICA DE EVOLUCIÓN
//====================================================

function renderizarGraficaEvolucion(datos) {

    // preparar los datos para la gráfica
    let etiquetas = datos.evolucion.map(function (item) {
        return 'Semana ' + item.numero_semana;
    });

    let montos = datos.evolucion.map(function (item) {
        return item.total_semana;
    });

    // crear el array de promedio (línea horizontal)
    let promedios = new Array(montos.length).fill(datos.promedio);

    // preparar los datasets
    let datasets = [
        {
            label: 'Total Neto (Confianza)',
            data: montos,
            borderColor: '#2d6a4f',
            backgroundColor: 'rgba(45, 106, 79, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#2d6a4f',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        },
        {
            label: 'Promedio Semanal',
            data: promedios,
            borderColor: '#d97706',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
        }
    ];

    // marcar la semana más cara
    if (datos.semana_mas_cara) {
        let indiceMax = datos.evolucion.findIndex(function (item) {
            return item.numero_semana == datos.semana_mas_cara;
        });

        if (indiceMax !== -1) {
            datasets[0].pointBackgroundColor = function (context) {
                return context.dataIndex === indiceMax ? '#16a34a' : '#2d6a4f';
            };
            datasets[0].pointRadius = function (context) {
                return context.dataIndex === indiceMax ? 8 : 5;
            };
        }
    }

    // marcar la semana más baja
    if (datos.semana_mas_baja) {
        let indiceMin = datos.evolucion.findIndex(function (item) {
            return item.numero_semana == datos.semana_mas_baja;
        });

        if (indiceMin !== -1) {
            datasets[0].pointBorderColor = function (context) {
                return context.dataIndex === indiceMin ? '#dc2626' : '#fff';
            };
            datasets[0].pointBorderWidth = function (context) {
                return context.dataIndex === indiceMin ? 3 : 2;
            };
        }
    }

    // destruir la gráfica si ya existe
    if (chartEvolucion) {
        chartEvolucion.destroy();
    }

    // crear la gráfica
    let ctx = document.getElementById('chartEvolucion').getContext('2d');
    chartEvolucion = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetas,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 20
                    }
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
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            let valor = context.parsed.y;
                            label += new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(valor);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                y: {
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
                }
            }
        }
    });
}


//====================================================
// FUNCIÓN PARA ACTUALIZAR LA GRÁFICA AL CAMBIAR DE AÑO
//====================================================

function actualizarGraficaEvolucion(anio) {
    cargarEvolucion(anio);
}
