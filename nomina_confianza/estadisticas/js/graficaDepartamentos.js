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
// FUNCIÓN PARA CARGAR DATOS DE GASTOS POR DEPARTAMENTO
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
            accion: "obtenerGastosPorDepartamento",
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
            console.error("error al obtener datos de gastos por departamento:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA GRÁFICA DE BARRAS
//====================================================

function renderizarGraficaDepartamentos(datos) {

    // preparar los datos para la gráfica
    let etiquetas = datos.departamentos.map(function (item) {
        return item.nombre_departamento;
    });

    let montos = datos.departamentos.map(function (item) {
        return item.total;
    });

    // colores para los departamentos
    let colores = [
        '#16a34a', '#dc2626', '#2563eb', '#f59e0b', '#7c3aed',
        '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4b5563'
    ];

    // preparar el dataset
    let dataset = {
        label: 'Gastos por Departamento',
        data: montos,
        backgroundColor: montos.map(function (_, index) {
            return colores[index % colores.length];
        }),
        borderColor: montos.map(function (_, index) {
            return colores[index % colores.length];
        }),
        borderWidth: 1,
        borderRadius: 4
    };

    // destruir la gráfica si ya existe
    if (chartSeguroSocial) {
        chartSeguroSocial.destroy();
    }

    // crear la gráfica de barras
    let ctx = document.getElementById('chartSeguroSocial').getContext('2d');
    chartSeguroSocial = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [dataset]
        },
        options: {
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
                            let label = context.label || '';
                            let valor = context.parsed.y;
                            return new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(valor);
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
// FUNCIÓN PARA CARGAR DATOS DE GASTOS POR SEMANA
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
            accion: "obtenerGastosSemanal",
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
            console.error("error al obtener datos de gastos semanal:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA GRÁFICA DE LÍNEAS POR DEPARTAMENTO
//====================================================

function renderizarGraficaDepartamentosSemanal(datos) {

    // preparar los datos para la gráfica
    let etiquetas = datos.semanas.map(function (item) {
        return 'Semana ' + item.numero_semana;
    });

    // colores para los departamentos
    let colores = [
        '#16a34a', '#dc2626', '#2563eb', '#f59e0b', '#7c3aed',
        '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4b5563'
    ];

    // preparar los datasets - una línea por departamento
    let datasets = datos.departamentos.map(function (depto, index) {
        let color = colores[index % colores.length];

        // obtener los datos de este departamento por semana
        let montos = datos.semanas.map(function (semana) {
            let deptoEnSemana = semana.departamentos.find(function (d) {
                return d.id_departamento === depto.id_departamento &&
                    d.id_empresa === depto.id_empresa;
            });
            return deptoEnSemana ? deptoEnSemana.total : 0;
        });

        return {
            label: depto.nombre_departamento,
            data: montos,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: color,
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        };
    });

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
                            size: 11
                        },
                        usePointStyle: true,
                        padding: 15,
                        boxWidth: 10
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
                        size: 11
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
