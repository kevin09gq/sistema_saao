$(document).ready(function () {
    abrirModalTesoreria();
});

//================================================
// FUNCIÓN PARA ABRIR EL MODAL DE TESORERÍA Y 
// CARGAR EL AÑO Y SEMANAS CORRESPONDIENTES
//================================================

function abrirModalTesoreria() {
    $("#btn_exportar_tesoreria").click(function (e) {
        e.preventDefault();

        obtenerAnios();

        obtenerNominas();

        // Abrir el modal de Tesorería
        $("#modalTesoreria").modal("show");
    });
}

//=================================================
// FUNCIÓN PARA OBTENER LOS AÑOS DE LAS NOMINAS 
//=================================================

function obtenerAnios() {

    const selectAnio = $("#modal_tesoreria_anio");
    const selectSemana = $("#modal_tesoreria_semana");
    const botonObtener = $("#btn_obtener_info_tesoreria");

    // Limpiar el selector de años
    selectAnio.empty();


    // Deshabilitar el selector de años mientras se cargan los datos
    selectAnio.prop("disabled", true);

    // Reiniciar selector de semanas
    selectSemana.empty();

    // Deshabilitar el selector de semanas y el botón de obtener información
    selectSemana.prop("disabled", true);
    botonObtener.prop("disabled", true);

    $.ajax({
        url: "../php/exportarTesoreria/obtenerNominas.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerAnios"
        },

        success: function (respuesta) {

            selectAnio.append(
                $("<option>", {
                    value: "",
                    text: "Seleccione un año..."
                })
            );

            if (!respuesta.success || respuesta.datos.length === 0) {

                selectAnio.append(
                    $("<option>", {
                        value: "",
                        text: "No hay años disponibles"
                    })
                );

                return;
            }

            respuesta.datos.forEach(function (anio) {

                selectAnio.append(
                    $("<option>", {
                        value: anio,
                        text: anio
                    })
                );

            });

            selectAnio.prop("disabled", false);

        },

        error: function (xhr, estado, error) {

            console.error("error al obtener los años:", error);

            selectAnio.empty();

            selectAnio.append(
                $("<option>", {
                    value: "",
                    text: "Error al cargar los años"
                })
            );

        }
    });

    // evento para cargar semanas al cambiar de año
    selectAnio.on("change", function () {
        let anio = $(this).val();
        if (anio) {
            obtenerSemanas(anio);
        } else {
            selectSemana.empty();
            selectSemana.append(
                $("<option>", {
                    value: "",
                    text: "Seleccione primero un año..."
                })
            );
            selectSemana.prop("disabled", true);
            botonObtener.prop("disabled", true);
        }
    });

    // evento para habilitar el botón al seleccionar semana
    selectSemana.on("change", function () {
        let semana = $(this).val();
        botonObtener.prop("disabled", !semana);
    });

}


//=================================================
// FUNCIÓN PARA OBTENER LAS SEMANAS DE UN AÑO
//=================================================

function obtenerSemanas(anio) {

    const selectSemana = $("#modal_tesoreria_semana");
    const botonObtener = $("#btn_obtener_info_tesoreria");

    // limpiar el selector de semanas
    selectSemana.empty();

    // deshabilitar el selector de semanas y el botón mientras se cargan los datos
    selectSemana.prop("disabled", true);
    botonObtener.prop("disabled", true);

    $.ajax({
        url: "../php/exportarTesoreria/obtenerNominas.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerSemanas",
            anio: anio
        },

        success: function (respuesta) {

            selectSemana.append(
                $("<option>", {
                    value: "",
                    text: "Seleccione una semana..."
                })
            );

            if (!respuesta.success || respuesta.datos.length === 0) {

                selectSemana.append(
                    $("<option>", {
                        value: "",
                        text: "No hay semanas registradas"
                    })
                );

                return;
            }

            respuesta.datos.forEach(function (semana) {

                selectSemana.append(
                    $("<option>", {
                        value: semana,
                        text: "Semana " + semana
                    })
                );

            });

            // seleccionar automáticamente la primera semana
            selectSemana.val(respuesta.datos[0]);
            selectSemana.prop("disabled", false);
            botonObtener.prop("disabled", false);

        },

        error: function (xhr, estado, error) {

            console.error("error al obtener las semanas:", error);

            selectSemana.empty();

            selectSemana.append(
                $("<option>", {
                    value: "",
                    text: "Error al cargar las semanas"
                })
            );

        }
    });
}


//=================================================
// FUNCIÓN PARA OBTENER LAS NÓMINAS DEL AÑO Y SEMANA
//=================================================

function obtenerNominas() {

    $("#btn_obtener_info_tesoreria").off("click").on("click", function (e) {

        e.preventDefault();

        const anio = $("#modal_tesoreria_anio").val();
        const semana = $("#modal_tesoreria_semana").val();

        // mostrar loading
        Swal.fire({
            icon: 'info',
            title: 'Obteniendo nóminas...',
            text: 'Consultando las nóminas de la semana ' + semana + ' del año ' + anio + '.',
            allowOutsideClick: false,
            didOpen: function () {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: "../php/exportarTesoreria/obtenerNominas.php",
            type: "POST",
            dataType: "json",
            data: {
                accion: "obtenerNominas",
                anio: anio,
                semana: semana
            },

            success: function (respuesta) {

                Swal.close();

                if (respuesta.success) {

                    console.log("nominas obtenidas:", respuesta.datos);
                    console.log("cortes y podas:", respuesta.cortes_podas);


                    // obtener conceptos y totales de departamentos
                    let departamentos = obtenerConceptosDepartamentos(respuesta.datos, respuesta.cortes_podas);

                    // enviar datos al servidor para generar el Excel de Tesorería
                    exportarExcelTesoreria(anio, semana, departamentos);

                } else {

                    console.error(respuesta.mensaje);

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: respuesta.mensaje || 'Error al obtener las nóminas.'
                    });
                }
            },

            error: function (xhr, estado, error) {

                Swal.close();

                console.error("error al obtener las nóminas:", error);
                console.error(xhr.responseText);

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al obtener las nóminas. Por favor intenta nuevamente.'
                });
            }
        });
    });
}




//=================================================
// FUNCIÓN PARA OBTENER LOS CONCEPTOS Y TOTALES
// DE CADA DEPARTAMENTO
//=================================================

function obtenerConceptosDepartamentos(datos, cortesPodas = {}) {

    // orden de las nóminas
    let ordenNominas = [
        'nomina_confianza',
        'nomina_40lbs',
        'nomina_40lbs_jornal',
        'nomina_10lbs',
        'nomina_relicario',
        'nomina_pilar',
        'nomina_huasteca',
        'nomina_palmilla'
    ];

    // Mapeo de sufijos para identificar ranchos
    let sufijosRanchos = {
        'nomina_relicario': 'Relicario',
        'nomina_pilar': 'Pilar',
        'nomina_huasteca': 'Huasteca',
        'nomina_palmilla': 'Palmilla'
    };

    let conceptosDepartamentos = [];

    // recorrer cada nómina
    ordenNominas.forEach(function (tablaNomina) {

        let colorRancho = '';

        // validar que exista la nómina en datos
        if (datos[tablaNomina] && datos[tablaNomina].departamentos && Array.isArray(datos[tablaNomina].departamentos)) {

            let datosNomina = datos[tablaNomina];

            // recorrer cada departamento de la nómina
            datosNomina.departamentos.forEach(function (departamento) {

                // validar que tenga nombre
                if (!departamento.nombre) {
                    return;
                }

                // validar que tenga empleados
                if (!departamento.empleados || !Array.isArray(departamento.empleados)) {
                    return;
                }

                // obtener color del departamento
                let color = Array.isArray(departamento.color_reporte) ? departamento.color_reporte[0] : (departamento.color_reporte || '');
                if (color && !colorRancho) {
                    colorRancho = color;
                }

                // verificar si es una nómina que requiere separación por seguro social
                let requiereSeparacionSeguro = (tablaNomina === 'nomina_40lbs' || tablaNomina === 'nomina_40lbs_jornal' || tablaNomina === 'nomina_10lbs');

                // si requiere separación, dividir empleados en dos grupos
                if (requiereSeparacionSeguro) {

                    // grupo 1: empleados con seguro social
                    let empleadosConSeguro = departamento.empleados.filter(function (empleado) {
                        return empleado.mostrar && empleado.seguroSocial === true;
                    });

                    // grupo 2: empleados sin seguro social
                    let empleadosSinSeguro = departamento.empleados.filter(function (empleado) {
                        return empleado.mostrar && empleado.seguroSocial === false;
                    });

                    // calcular totales para empleados con seguro (CSS)
                    if (empleadosConSeguro.length > 0) {
                        let totales = calcularTotalesGrupo(empleadosConSeguro);
                        conceptosDepartamentos.push(crearObjetoDepartamento(departamento.nombre + ' CSS', totales, color));
                    }

                    // calcular totales para empleados sin seguro (SSS)
                    if (empleadosSinSeguro.length > 0) {
                        let totales = calcularTotalesGrupo(empleadosSinSeguro);
                        conceptosDepartamentos.push(crearObjetoDepartamento(departamento.nombre + ' SSS', totales, color));
                    }

                } else {

                    // nóminas sin separación: calcular totales de todos los empleados
                    let empleadosActivos = departamento.empleados.filter(function (empleado) {
                        return empleado.mostrar;
                    });

                    if (empleadosActivos.length > 0) {
                        let totales = calcularTotalesGrupo(empleadosActivos);
                        let nombreDepto = departamento.nombre;

                        // Si pertenece a un rancho y no contiene aún el nombre, anexarlo para identificarlo
                        if (sufijosRanchos[tablaNomina]) {
                            let sufijo = sufijosRanchos[tablaNomina];
                            if (!nombreDepto.toLowerCase().includes(sufijo.toLowerCase())) {
                                nombreDepto += ' ' + sufijo;
                            }
                        }

                        conceptosDepartamentos.push(crearObjetoDepartamento(nombreDepto, totales, color));
                    }
                }
            });
        }

        // ==========================================================
        // AGREGAR DEPARTAMENTOS DE CORTE Y PODA SEPARADOS PARA RANCHOS
        // ==========================================================
        if (sufijosRanchos[tablaNomina] && cortesPodas && cortesPodas[tablaNomina]) {
            let infoRancho = cortesPodas[tablaNomina];
            let sufijo = sufijosRanchos[tablaNomina];

            let totalCortes = parseFloat(infoRancho.total_cortes) || 0;
            let totalPodas  = parseFloat(infoRancho.total_podas) || 0;

            // Departamento individual de Corte
            if (totalCortes > 0) {
                conceptosDepartamentos.push({
                    color: colorRancho,
                    nombre_departamento: 'Corte ' + sufijo,
                    sueldo_bruto: totalCortes
                });
            }

            // Departamento individual de Poda
            if (totalPodas > 0) {
                conceptosDepartamentos.push({
                    color: colorRancho,
                    nombre_departamento: 'Poda ' + sufijo,
                    sueldo_bruto: totalPodas
                });
            }
        }
    });

    console.log("conceptos de departamentos:", conceptosDepartamentos);

    return conceptosDepartamentos;
}


//=================================================
// FUNCIÓN AUXILIAR PARA CALCULAR TOTALES DE UN GRUPO
// DE EMPLEADOS
//=================================================

function calcularTotalesGrupo(empleados) {

    let totalSueldoBruto = 0;
    let totalIncentivo = 0;
    let totalHorasExtra = 0;
    let totalbonoAntiguedad = 0;
    let totalActividadesEspeciales = 0;
    let totalPuesto = 0;
    let totalPasaje = 0;
    let totalComida = 0;
    let totalTardeada = 0;

    let totalISR = 0;
    let totalIMSS = 0;
    let totalInfonavit = 0;
    let totalAjusteSub = 0;
    let totalAusentismo = 0;
    let totalPermisos = 0;
    let totalRetardos = 0;
    let totalUniformes = 0;
    let totalChecador = 0;
    let totalFaGafetCofia = 0;
    let totalTarjeta = 0;
    let totalPrestamo = 0;

    empleados.forEach(function (empleado) {

        let sueldoBruto = empleado.salario_semanal || empleado.sueldo_neto || 0;
        let incentivo = empleado.incentivo || 0;
        let horasExtra = empleado.horas_extra || 0;
        let bonoAntiguedad = empleado.bono_antiguedad || 0;
        let actividadesEspeciales = empleado.actividades_especiales || 0;
        let puesto = empleado.puesto || 0;
        let pasaje = empleado.pasaje || 0;
        let comida = empleado.comida || 0;
        let tardeada = parseFloat(empleado.tardeada) || 0;
        let ausentismo = empleado.inasistencia || 0;
        let permisos = empleado.permiso || 0;

        let isr = 0;
        let imss = 0;
        let infonavit = 0;
        let ajusteSub = 0;

        if (empleado.conceptos && Array.isArray(empleado.conceptos)) {
            empleado.conceptos.forEach(function (concepto) {
                if (concepto.codigo === '45') {
                    isr = parseFloat(concepto.resultado) || 0;
                } else if (concepto.codigo === '52') {
                    imss = parseFloat(concepto.resultado) || 0;
                } else if (concepto.codigo === '16') {
                    infonavit = parseFloat(concepto.resultado) || 0;
                } else if (concepto.codigo === '107') {
                    ajusteSub = parseFloat(concepto.resultado) || 0;
                }
            });
        }

        let retardos = empleado.retardos || 0;
        let uniformes = empleado.uniformes || 0;
        let checador = empleado.checador || 0;
        let faGafetCofia = empleado.fa_gafet_cofia || 0;
        let tarjeta = empleado.tarjeta || 0;
        let prestamo = empleado.prestamo || 0;

        totalSueldoBruto += sueldoBruto;
        totalIncentivo += incentivo;
        totalHorasExtra += horasExtra;
        totalbonoAntiguedad += bonoAntiguedad;
        totalActividadesEspeciales += actividadesEspeciales;
        totalPuesto += puesto;
        totalPasaje += pasaje;
        totalComida += comida;
        totalTardeada += tardeada;

        totalISR += isr;
        totalIMSS += imss;
        totalInfonavit += infonavit;
        totalAjusteSub += ajusteSub;
        totalAusentismo += ausentismo;
        totalPermisos += permisos;
        totalRetardos += retardos;
        totalUniformes += uniformes;
        totalChecador += checador;
        totalFaGafetCofia += faGafetCofia;
        totalTarjeta += tarjeta;
        totalPrestamo += prestamo;
    });

    // calcular percepciones y deducciones extra
    let extras = calcularPercepcionesDeduccionesExtra(empleados);

    return {
        sueldoBruto: totalSueldoBruto,
        incentivo: totalIncentivo,
        horasExtra: totalHorasExtra,
        bonoAntiguedad: totalbonoAntiguedad,
        actividadesEspeciales: totalActividadesEspeciales,
        puesto: totalPuesto,
        pasaje: totalPasaje,
        comida: totalComida,
        tardeada: totalTardeada,
        isr: totalISR,
        imss: totalIMSS,
        infonavit: totalInfonavit,
        ajusteSub: totalAjusteSub,
        ausentismo: totalAusentismo,
        permisos: totalPermisos,
        retardos: totalRetardos,
        uniformes: totalUniformes,
        checador: totalChecador,
        faGafetCofia: totalFaGafetCofia,
        tarjeta: totalTarjeta,
        prestamo: totalPrestamo,
        percepciones_extra: extras.percepciones_extra,
        deducciones_extra: extras.deducciones_extra
    };
}


//=================================================
// FUNCIÓN AUXILIAR PARA CREAR OBJETO DE DEPARTAMENTO
//=================================================

function crearObjetoDepartamento(nombre, totales, color = '') {
    return {
        color: color,
        nombre_departamento: nombre,
        sueldo_bruto: totales.sueldoBruto,
        incentivo: totales.incentivo,
        horas_extra: totales.horasExtra,
        bono_antiguedad: totales.bonoAntiguedad,
        actividades_especiales: totales.actividadesEspeciales,
        puesto: totales.puesto,
        pasaje: totales.pasaje,
        comida: totales.comida,
        tardeada: totales.tardeada,
        isr: totales.isr,
        imss: totales.imss,
        infonavit: totales.infonavit,
        ajuste_sub: totales.ajusteSub,
        ausentismo: totales.ausentismo,
        permisos: totales.permisos,
        retardos: totales.retardos,
        uniformes: totales.uniformes,
        checador: totales.checador,
        fa_gafet_cofia: totales.faGafetCofia,
        tarjeta: totales.tarjeta,
        prestamo: totales.prestamo,
        percepciones_extra: totales.percepciones_extra,
        deducciones_extra: totales.deducciones_extra
    };
}


//=================================================
// FUNCIÓN PARA CALCULAR PERCEPCIONES Y DEDUCCIONES
// EXTRA POR DEPARTAMENTO
//=================================================

function calcularPercepcionesDeduccionesExtra(empleados) {

    let percepcionesExtra = {};
    let deduccionesExtra = {};

    empleados.forEach(function (empleado) {

        // procesar percepciones extra
        if (empleado.percepciones_extra && Array.isArray(empleado.percepciones_extra)) {
            empleado.percepciones_extra.forEach(function (percepcion) {
                let nombre = percepcion.nombre || '';
                let cantidad = parseFloat(percepcion.cantidad) || 0;

                if (nombre && cantidad > 0) {
                    if (!percepcionesExtra[nombre]) {
                        percepcionesExtra[nombre] = 0;
                    }
                    percepcionesExtra[nombre] += cantidad;
                }
            });
        }

        // procesar deducciones extra
        if (empleado.deducciones_extra && Array.isArray(empleado.deducciones_extra)) {
            empleado.deducciones_extra.forEach(function (deduccion) {
                let nombre = deduccion.nombre || '';
                let cantidad = parseFloat(deduccion.cantidad) || 0;

                if (nombre && cantidad > 0) {
                    if (!deduccionesExtra[nombre]) {
                        deduccionesExtra[nombre] = 0;
                    }
                    deduccionesExtra[nombre] += cantidad;
                }
            });
        }
    });

    return {
        percepciones_extra: percepcionesExtra,
        deducciones_extra: deduccionesExtra
    };
}


//=================================================
// FUNCIÓN PARA ENVIAR DATOS AL SERVIDOR Y GENERAR
// EL EXCEL DE TESORERÍA
//=================================================

function exportarExcelTesoreria(anio, semana, departamentos) {

    $.ajax({
        url: "../php/exportarTesoreria/tesoreria.php",
        type: "POST",
        xhrFields: {
            responseType: 'blob'
        },
        data: {
            accion: "generarExcelTesoreria",
            anio: anio,
            semana: semana,
            departamentos: JSON.stringify(departamentos)
        },
        success: function (blob, status, xhr) {
            // Obtener el nombre del archivo del header Content-Disposition
            let filename = 'tesoreria_semana_' + semana + '_anio_' + anio + '.xlsx';
            let disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
                let filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                let matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Crear un enlace temporal para descargar el archivo
            let link = document.createElement('a');
            let url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            $("#modalTesoreria").modal("hide");
        },
        error: function (xhr, estado, error) {
            console.error("error al exportar a excel:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al generar el archivo Excel. Por favor intenta nuevamente.'
            });
        }
    });
}


