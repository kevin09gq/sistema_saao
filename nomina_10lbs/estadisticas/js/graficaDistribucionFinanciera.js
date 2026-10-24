//====================================================
// VARIABLES GLOBALES DE LA GRÁFICA
//====================================================

// instancia de la gráfica
let chartDonut = null;

// datos de la distribución financiera
let datosDistribucion = null;


//====================================================
// FUNCIÓN PARA CARGAR LA DISTRIBUCIÓN FINANCIERA
//====================================================

function cargarDistribucionFinanciera(anio) {

    // validar que se haya recibido el año
    if (!anio) {
        return;
    }

    // llamada ajax para obtener la distribución financiera
    $.ajax({
        type: "POST",
        url: "../php/infoDistribucionFinanciera.php",
        data: {
            accion: "obtenerDistribucion",
            anio: anio
        },
        dataType: "json",

        success: function (respuesta) {

            // validar si la respuesta fue exitosa
            if (respuesta.success) {

                // guardar los datos de la distribución
                datosDistribucion = respuesta;

                // renderizar la gráfica
                renderizarGraficaDistribucionFinanciera(respuesta);

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
            console.error("error al obtener la distribución financiera:", error);
            console.error(xhr.responseText);
        }
    });
}


//====================================================
// FUNCIÓN PARA RENDERIZAR LA GRÁFICA DONUT
//====================================================

function renderizarGraficaDistribucionFinanciera(datos) {

    // preparar los datos para la gráfica
    let etiquetas = datos.distribucion.map(function (item) {
        return item.categoria;
    });

    let montos = datos.distribucion.map(function (item) {
        return item.monto;
    });

    // colores para las categorías
    let colores = [
        '#16a34a',  // Percepciones - Verde
        '#dc2626',  // Deducciones - Rojo
        '#2d6a4f'   // Neto Pagado - Verde Corporativo
    ];

    // preparar el dataset
    let dataset = {
        data: montos,
        backgroundColor: colores,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
    };

    // destruir la gráfica si ya existe
    if (chartDonut) {
        chartDonut.destroy();
    }

    // crear la gráfica donut
    let ctx = document.getElementById('chartDonut').getContext('2d');
    chartDonut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: etiquetas,
            datasets: [dataset]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: 12
                        },
                        usePointStyle: true,
                        padding: 15,
                        generateLabels: function (chart) {
                            let data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(function (label, i) {
                                    let valor = data.datasets[0].data[i];
                                    let porcentaje = datos.distribucion[i].porcentaje.toFixed(1);
                                    return {
                                        text: label + ' (' + porcentaje + '%)',
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
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
                            let label = context.label || '';
                            let valor = context.parsed;
                            let porcentaje = datos.distribucion[context.dataIndex].porcentaje.toFixed(1);

                            let valorFormateado = new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(valor);

                            return [
                                label + ': ' + valorFormateado,
                                'Participación: ' + porcentaje + '%'
                            ];
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


function actualizarGraficaDistribucionFinanciera(anio) {
    cargarDistribucionFinanciera(anio);
}
