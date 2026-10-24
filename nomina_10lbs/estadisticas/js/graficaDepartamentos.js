//====================================================
// VARIABLES GLOBALES DE LA GRÁFICA
//====================================================

// instancia de la gráfica por departamento
let chartSeguroSocial = null;

// instancia de la gráfica por semana
let chartSeguroSocialSemanal = null;

// datos de seguro social por departamento
let datosSeguroSocial = null;

// datos de seguro social por semana
let datosSeguroSocialSemanal = null;


//====================================================
// FUNCIÓN PARA CARGAR DATOS DE SEGURO SOCIAL POR DEPARTAMENTO
//====================================================

function cargarDatosPorDepartamento(anio) {

    // validar que se haya recibido el año
    if (!anio) {
        return;
    }

    // llamada ajax para obtener los datos
    $.ajax({
        type: "POST",
        url: "../php/infoGraficaDepartamentos.php",
        data: {
            accion: "obtenerSeguroSocialPorDepartamento",
            anio: anio
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos
                datosSeguroSocial = respuesta;

                // renderizar la gráfica
                renderizarGraficaDepartamentos(respuesta);

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
            console.error("error al obtener datos de seguro social:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA GRÁFICA DE BARRAS AGRUPADAS
//====================================================

function renderizarGraficaDepartamentos(datos) {

    // preparar los datos para la gráfica
    let etiquetas = datos.departamentos.map(function (item) {
        return item.nombre_departamento;
    });

    let montosConSeguro = datos.departamentos.map(function (item) {
        return item.con_seguro;
    });

    let montosSinSeguro = datos.departamentos.map(function (item) {
        return item.sin_seguro;
    });

    // preparar los datasets
    let datasets = [
        {
            label: 'Con Seguro Social (CSS)',
            data: montosConSeguro,
            backgroundColor: '#16a34a',
            borderColor: '#15803d',
            borderWidth: 1,
            borderRadius: 4
        },
        {
            label: 'Sin Seguro Social (SSS)',
            data: montosSinSeguro,
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1,
            borderRadius: 4
        }
    ];

    // destruir la gráfica si ya existe
    if (chartSeguroSocial) {
        chartSeguroSocial.destroy();
    }

    // crear la gráfica de barras agrupadas
    let ctx = document.getElementById('chartSeguroSocial').getContext('2d');
    chartSeguroSocial = new Chart(ctx, {
        type: 'bar',
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
                        },
                        footer: function (tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(function (item) {
                                total += item.parsed.y;
                            });
                            if (total > 0) {
                                return 'Total: ' + new Intl.NumberFormat('es-MX', {
                                    style: 'currency',
                                    currency: 'MXN',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(total);
                            }
                            return '';
                        }
                    }
                },
                title: {
                    display: false
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

function actualizarGraficaDepartamentos(anio) {
    cargarDatosPorDepartamento(anio);
}


//====================================================
// FUNCIÓN PARA CARGAR DATOS DE SEGURO SOCIAL POR SEMANA
//====================================================

function cargarSeguroSocialSemanal(anio) {

    // validar que se haya recibido el año
    if (!anio) {
        return;
    }

    // llamada ajax para obtener los datos
    $.ajax({
        type: "POST",
        url: "../php/infoGraficaDepartamentos.php",
        data: {
            accion: "obtenerSeguroSocialSemanal",
            anio: anio
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos
                datosSeguroSocialSemanal = respuesta;

                // renderizar la gráfica
                renderizarGraficaDepartamentosSemanal(respuesta);

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
            console.error("error al obtener datos de seguro social semanal:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA GRÁFICA DE LÍNEAS
//====================================================

function renderizarGraficaDepartamentosSemanal(datos) {

    // preparar los datos para la gráfica
    let etiquetas = datos.semanas.map(function (item) {
        return 'Semana ' + item.numero_semana;
    });

    let montosConSeguro = datos.semanas.map(function (item) {
        return item.con_seguro;
    });

    let montosSinSeguro = datos.semanas.map(function (item) {
        return item.sin_seguro;
    });

    // preparar los datasets
    let datasets = [
        {
            label: 'Con Seguro Social (CSS)',
            data: montosConSeguro,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#16a34a',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        },
        {
            label: 'Sin Seguro Social (SSS)',
            data: montosSinSeguro,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }
    ];

    // destruir la gráfica si ya existe
    if (chartSeguroSocialSemanal) {
        chartSeguroSocialSemanal.destroy();
    }

    // crear la gráfica de líneas
    let ctx = document.getElementById('chartSeguroSocialSemanal').getContext('2d');
    chartSeguroSocialSemanal = new Chart(ctx, {
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
                        },
                        footer: function (tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(function (item) {
                                total += item.parsed.y;
                            });
                            if (total > 0) {
                                return 'Total Semana: ' + new Intl.NumberFormat('es-MX', {
                                    style: 'currency',
                                    currency: 'MXN',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(total);
                            }
                            return '';
                        }
                    }
                },
                title: {
                    display: false
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
// FUNCIÓN PARA ACTUALIZAR LA GRÁFICA SEMANAL AL CAMBIAR DE AÑO
//====================================================

function actualizarGraficaDepartamentosSemanal(anio) {
    cargarSeguroSocialSemanal(anio);
}
