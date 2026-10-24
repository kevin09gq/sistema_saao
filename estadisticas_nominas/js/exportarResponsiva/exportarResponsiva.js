//================================================
// INICIALIZACIÓN DEL DOCUMENTO
//================================================
jsonNominasResponsivas = null; // Variable única para el JSON de responsivas
var datosNominasGlobal = null; // Datos originales de nóminas del servidor
var datosCortesPodasGlobal = null; // Datos de cortes y podas del servidor
var ordenNominasGlobal = []; // Orden de nóminas para mapeo

$(document).ready(function () {
    procesarInformacion();                // Configurar botón procesar
    seleccionarDepartamentosPorNomina();  // Configurar toggle de departamentos
    generarResponsivas();                 // Configurar botón generar responsivas

    if (typeof restoreNomina === "function" && restoreNomina()) {
        return;
    }

    if (typeof mostrarApartadoFiltros === "function") {
        mostrarApartadoFiltros();
    }

    cargarAnios();                        // Cargar años al iniciar
});

//================================================
// FUNCIÓN PARA CARGAR LOS AÑOS DE LAS NÓMINAS
//================================================

function cargarAnios() {
    // Obtener selectores de año y semana
    var selectAnio = $("#select_anio_responsiva");
    var selectSemana = $("#select_semana_responsiva");

    // Limpiar selector de años
    selectAnio.empty();

    // Deshabilitar selector mientras carga
    selectAnio.prop("disabled", true);

    // Limpiar y deshabilitar selector de semanas
    selectSemana.empty();
    selectSemana.prop("disabled", true);

    // Petición AJAX para obtener años
    $.ajax({
        url: "../php/exportarTesoreria/obtenerNominas.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerAnios"
        },

        success: function (respuesta) {
            // Agregar opción por defecto
            selectAnio.append(
                $("<option>", {
                    value: "",
                    text: "Seleccione un año..."
                })
            );

            // Validar respuesta
            if (!respuesta.success || respuesta.datos.length === 0) {
                selectAnio.append(
                    $("<option>", {
                        value: "",
                        text: "No hay años disponibles"
                    })
                );
                return;
            }

            // Agregar cada año al selector
            respuesta.datos.forEach(function (anio) {
                selectAnio.append(
                    $("<option>", {
                        value: anio,
                        text: anio
                    })
                );
            });

            // Habilitar selector de años
            selectAnio.prop("disabled", false);

            // Evento: al cambiar año, cargar semanas
            selectAnio.off("change").on("change", function () {
                var anio = $(this).val();
                if (anio) {
                    cargarSemanas(anio);
                } else {
                    selectSemana.empty();
                    selectSemana.append(
                        $("<option>", {
                            value: "",
                            text: "Seleccione primero un año..."
                        })
                    );
                    selectSemana.prop("disabled", true);
                }
            });
        },

        error: function (xhr, estado, error) {
            console.error("Error al obtener los años:", error);
            selectAnio.empty();
            selectAnio.append(
                $("<option>", {
                    value: "",
                    text: "Error al cargar los años"
                })
            );
        }
    });
}

//================================================
// FUNCIÓN PARA CARGAR LAS SEMANAS DE UN AÑO
//================================================

function cargarSemanas(anio) {
    // Obtener selector de semanas
    var selectSemana = $("#select_semana_responsiva");

    // Limpiar selector de semanas
    selectSemana.empty();

    // Deshabilitar selector mientras carga
    selectSemana.prop("disabled", true);

    // Petición AJAX para obtener semanas del año
    $.ajax({
        url: "../php/exportarTesoreria/obtenerNominas.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerSemanas",
            anio: anio
        },

        success: function (respuesta) {
            // Agregar opción por defecto
            selectSemana.append(
                $("<option>", {
                    value: "",
                    text: "Seleccione una semana..."
                })
            );

            // Validar respuesta
            if (!respuesta.success || respuesta.datos.length === 0) {
                selectSemana.append(
                    $("<option>", {
                        value: "",
                        text: "No hay semanas registradas"
                    })
                );
                return;
            }

            // Agregar cada semana al selector
            respuesta.datos.forEach(function (semana) {
                selectSemana.append(
                    $("<option>", {
                        value: semana,
                        text: "Semana " + semana
                    })
                );
            });

            // Seleccionar automáticamente la primera semana
            selectSemana.val(respuesta.datos[0]);
            selectSemana.prop("disabled", false);
        },

        error: function (xhr, estado, error) {
            console.error("Error al obtener las semanas:", error);
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

//================================================
// FUNCIÓN PARA PROCESAR LA INFORMACIÓN
// Obtiene los departamentos de cada nómina al presionar el botón
//================================================

function procesarInformacion() {
    // Evento click en botón procesar
    $("#btn_procesar_responsiva").click(function () {
        // Obtener año y semana seleccionados
        var anio = $("#select_anio_responsiva").val();
        var semana = $("#select_semana_responsiva").val();

        // Validar que se hayan seleccionado año y semana
        if (!anio || !semana) {
            Swal.fire({
                icon: 'warning',
                title: 'Datos incompletos',
                text: 'Seleccione año y semana'
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            icon: 'info',
            title: 'Procesando...',
            didOpen: function () {
                Swal.showLoading();
            }
        });

        // Petición AJAX para obtener nóminas
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
                    datosNominasGlobal = respuesta.datos || {};
                    datosCortesPodasGlobal = respuesta.cortes_podas || {};
                    mostrarDepartamentos(respuesta.datos);      // Mostrar departamentos
                    mostrarApartadoSeleccion();                 // Mostrar apartados de selección
                }
            },
            error: function () {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al obtener datos'
                });
            }
        });
    });
}

//================================================
// FUNCIÓN PARA MOSTRAR DEPARTAMENTOS
// Muestra los departamentos de cada nómina en el HTML
//================================================

function mostrarDepartamentos(datos) {
    // Lista de las 8 nóminas del sistema
    var nominas = [
        'nomina_confianza',
        'nomina_40lbs',
        'nomina_40lbs_jornal',
        'nomina_10lbs',
        'nomina_relicario',
        'nomina_pilar',
        'nomina_huasteca',
        'nomina_palmilla'
    ];

    // Recorrer cada nómina
    nominas.forEach(function (tabla) {
        // Obtener datos de la nómina
        var nomina = datos[tabla];

        // Obtener contenedor de departamentos correspondiente
        var contenedor = $("#deptos_" + tabla);

        // Limpiar contenedor
        contenedor.empty();

        // Validar que existan departamentos
        if (!nomina || !nomina.departamentos) {
            contenedor.text("Sin departamentos");
            return;
        }

        // Agregar departamentos normales
        nomina.departamentos.forEach(function (depto) {
            contenedor.append(
                '<label class="depto-tag">' +
                '<input type="checkbox" data-id-departamento="' + (depto.id_departamento || '') + '"> ' +
                depto.nombre +
                '</label>'
            );
        });

        // Agregar departamentos de cortes y podas si existen
        if (nomina.departamentos_cortes_poda) {
            nomina.departamentos_cortes_poda.forEach(function (depto) {
                contenedor.append(
                    '<label class="depto-tag">' +
                    '<input type="checkbox" data-id-departamento="' + (depto.id_departamento || '') + '"> ' +
                    depto.nombre +
                    '</label>'
                );
            });
        }

        // Agregar departamento de CORTE si hay cortes en los datos
        if (datosCortesPodasGlobal && datosCortesPodasGlobal[tabla] && datosCortesPodasGlobal[tabla].total_cortes > 0) {
            contenedor.append(
                '<label class="depto-tag">' +
                '<input type="checkbox" data-id-departamento="1000"> ' +
                'CORTE' +
                '</label>'
            );
        }

        // Agregar departamento de PODA si hay podas en los datos
        if (datosCortesPodasGlobal && datosCortesPodasGlobal[tabla] && datosCortesPodasGlobal[tabla].total_podas > 0) {
            contenedor.append(
                '<label class="depto-tag">' +
                '<input type="checkbox" data-id-departamento="2000"> ' +
                'PODA' +
                '</label>'
            );
        }
    });
}


//================================================
// FUNCIÓN PARA MARCAR/DESMARCAR DEPARTAMENTOS AL MARCAR NÓMINA
// Y SINCRONIZAR SELECCIÓN DE DEPARTAMENTOS CON SU NÓMINA
//================================================

function seleccionarDepartamentosPorNomina() {
    // Escuchar cambios en checkboxes principales de nómina
    $(document).on("change", "#container_departamentos_responsiva .form-check-input[id^='check_nomina']", function () {
        var nominaId = $(this).attr("id");
        var nominaTabla = nominaId.replace("check_", "");
        var checked = $(this).prop("checked");

        // Marcar/desmarcar todos los departamentos de esa nómina y su estilo visual
        var checkboxesDeptos = $("#deptos_" + nominaTabla + " input[type='checkbox']");
        checkboxesDeptos.prop("checked", checked);
        checkboxesDeptos.closest(".depto-tag").toggleClass("selected", checked);
    });

    // Escuchar cambios en los checkboxes individuales de departamentos
    $(document).on("change", "#container_departamentos_responsiva .depto-tag input[type='checkbox']", function () {
        var isChecked = $(this).prop("checked");
        $(this).closest(".depto-tag").toggleClass("selected", isChecked);

        // Obtener el ID del contenedor padre (ej. deptos_nomina_confianza)
        var contenedor = $(this).closest("[id^='deptos_']");
        var contenedorId = contenedor.attr("id");
        if (!contenedorId) return;

        var nominaTabla = contenedorId.replace("deptos_", "");

        // Si al menos un departamento está seleccionado, marcar el check de la nómina; si no, desmarcarlo
        var totalDeptosSeleccionados = contenedor.find("input[type='checkbox']:checked").length;
        $("#check_" + nominaTabla).prop("checked", totalDeptosSeleccionados > 0);
    });
}

//================================================
// FUNCIÓN PARA GENERAR RESPONSIVAS
// Genera JSON con nóminas y departamentos seleccionados
//================================================

function generarResponsivas() {

    // Evento click en el boton generar responsivas
    $("#btn_generar_responsivas").click(function () {

        // Lista de nominas
        var nominas = [
            'nomina_confianza',
            'nomina_40lbs',
            'nomina_40lbs_jornal',
            'nomina_10lbs',
            'nomina_relicario',
            'nomina_pilar',
            'nomina_huasteca',
            'nomina_palmilla'
        ];

        // Objeto para almacenar las responsivas
        var resultado = {};

        // Variables para datos generales
        var totalSobresGeneral = 0;
        var totalImporteGeneral = 0;
        var totalSobresDevueltosGeneral = 0;
        var totalImporteDevueltoGeneral = 0;

        // Recorrer cada nomina
        nominas.forEach(function (tabla) {

            // Obtener contenedor de departamentos
            var deptosContainer = $("#deptos_" + tabla);

            // Arreglo para almacenar departamentos seleccionados
            var departamentos = [];

            // Variables para totales de esta nómina
            var totalSobresNomina = 0;
            var totalEfectivoNomina = 0;
            var totalDevueltoNomina = 0;
            var sobresDevueltosNomina = 0;
            var colorNomina = "";

            // Recorrer departamentos seleccionados en esta nómina
            deptosContainer.find("input[type='checkbox']:checked").each(function () {
                var $checkbox = $(this);
                var nombre = $checkbox.parent().text().trim();
                var idDepartamento = $checkbox.data("id-departamento");

                if (nombre) {
                    var importe = obtenerImportes(tabla, nombre);
                    var sobres = obtenerSobres(tabla, nombre);
                    var color = obtenerColorDepartamento(tabla, nombre);

                    if (color && !colorNomina) {
                        colorNomina = color;
                    }

                    departamentos.push({
                        id_departamento: idDepartamento,
                        nombre: nombre,
                        sobres: sobres,
                        importe: importe,
                        color: color,
                        observaciones: "",
                        sobres_devueltos: 0,
                        importe_devuelto: 0,
                        incidencias: ""
                    });

                    // Acumular totales de la nómina
                    totalSobresNomina += sobres;
                    totalEfectivoNomina += importe;
                }
            });

            // Si no se capturó color de los deptos seleccionados, buscar en cualquier departamento de la nómina
            if (!colorNomina && datosNominasGlobal && datosNominasGlobal[tabla] && Array.isArray(datosNominasGlobal[tabla].departamentos)) {
                var deptoConColor = datosNominasGlobal[tabla].departamentos.find(function (d) {
                    return d.color_reporte && (Array.isArray(d.color_reporte) ? d.color_reporte.length > 0 : true);
                });
                if (deptoConColor) {
                    colorNomina = Array.isArray(deptoConColor.color_reporte) ? deptoConColor.color_reporte[0] : (deptoConColor.color_reporte || '');
                }
            }

            // Guardar nómina si tiene departamentos seleccionados
            if (departamentos.length > 0) {
                resultado[tabla] = {
                    departamentos: departamentos,
                    color: colorNomina,
                    hora_salida: "",
                    hora_regreso: "",
                    total_sobres: totalSobresNomina,
                    responsable: "",
                    puesto: "",
                    total_efectivo: totalEfectivoNomina,
                    total_devuelto: totalDevueltoNomina,
                    sobres_devueltos: sobresDevueltosNomina
                };

                // Acumular totales generales
                totalSobresGeneral += totalSobresNomina;
                totalImporteGeneral += totalEfectivoNomina;
                totalSobresDevueltosGeneral += sobresDevueltosNomina;
                totalImporteDevueltoGeneral += totalDevueltoNomina;
            }

        });

        // Validar que se haya seleccionado al menos un departamento
        if (Object.keys(resultado).length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin selección',
                text: 'Por favor seleccione al menos un departamento o nómina para generar las responsivas.'
            });
            return;
        }

        // Agregar datos generales al resultado
        var anio = $("#select_anio_responsiva").val();
        var semana = $("#select_semana_responsiva").val();

        resultado.datos_generales = {
            folio: "RH-01/SEM " + semana,
            periodo: anio,
            fecha: "",
            semana: "SEM - " + semana,
            elaboro: "",
            sobres_general: totalSobresGeneral,
            importe_general: totalImporteGeneral,
            sobres_devueltos_general: totalSobresDevueltosGeneral,
            total_sobres_devueltos: totalSobresDevueltosGeneral
        };

        // Guardar solo la estructura de responsivas en jsonNominasResponsivas
        jsonNominasResponsivas = resultado;
        ordenNominasGlobal = nominas;

        // Guardar la estructura generada para restaurarla al volver a la vista
        if (typeof saveNomina === "function") {
            saveNomina(jsonNominasResponsivas);
        }

        // Mostrar solo el apartado 3 con la información generada
        mostrarApartadoResponsivas(resultado);
    });

}

//================================================
// FUNCIÓN PARA OBTENER EL COLOR DE UN DEPARTAMENTO
// DE color_reporte (ARRAY O STRING)
//================================================
function obtenerColorDepartamento(tabla, nombreDepartamento) {
    if (!datosNominasGlobal || !datosNominasGlobal[tabla]) {
        return "";
    }

    var nomina = datosNominasGlobal[tabla];
    var departamentos = nomina.departamentos || [];

    if (nomina.departamentos_cortes_poda) {
        departamentos = departamentos.concat(nomina.departamentos_cortes_poda);
    }

    var depto = departamentos.find(function (d) {
        return (d.nombre || '').trim().toLowerCase() === (nombreDepartamento || '').trim().toLowerCase();
    });

    if (depto && depto.color_reporte) {
        if (Array.isArray(depto.color_reporte) && depto.color_reporte.length > 0) {
            return depto.color_reporte[0];
        }
        return typeof depto.color_reporte === 'string' ? depto.color_reporte : "";
    }

    return "";
}

//================================================
// FUNCIÓN PARA OBTENER LOS IMPORTES DE CADA
// DEPARTAMENTO, OBTENIENDO DEL EMPLEADO EN LA
// PROPIEDAD total_cobrar (SOLO EMPLEADOS MOSTRAR = TRUE)
//================================================
function obtenerImportes(tabla, nombreDepartamento) {
    var totalImporte = 0;

    // 1. Si es CORTE, obtener de los datos de cortes_podas
    if (nombreDepartamento.trim().toUpperCase() === 'CORTE') {
        if (datosCortesPodasGlobal && datosCortesPodasGlobal[tabla]) {
            return datosCortesPodasGlobal[tabla].total_cortes || 0;
        }
        return 0;
    }

    // 2. Si es PODA, obtener de los datos de cortes_podas
    if (nombreDepartamento.trim().toUpperCase() === 'PODA') {
        if (datosCortesPodasGlobal && datosCortesPodasGlobal[tabla]) {
            return datosCortesPodasGlobal[tabla].total_podas || 0;
        }
        return 0;
    }

    // 3. Validar que existan los datos de la nómina
    if (!datosNominasGlobal || !datosNominasGlobal[tabla]) {
        return 0;
    }

    var nomina = datosNominasGlobal[tabla];
    var departamentos = nomina.departamentos || [];

    // Incluir departamentos de cortes y podas si existen
    if (nomina.departamentos_cortes_poda) {
        departamentos = departamentos.concat(nomina.departamentos_cortes_poda);
    }

    // 4. Buscar el departamento por su nombre
    var depto = departamentos.find(function (d) {
        return (d.nombre || '').trim().toLowerCase() === (nombreDepartamento || '').trim().toLowerCase();
    });

    // 5. Validar que el departamento exista y tenga empleados
    if (!depto || !Array.isArray(depto.empleados)) {
        return 0;
    }

    // 6. Sumar total_cobrar solo de los empleados con mostrar === true
    depto.empleados.forEach(function (empleado) {
        if (empleado.mostrar === true) {
            var cobrar = parseFloat(empleado.total_cobrar) || 0;
            totalImporte += cobrar;
        }
    });

    // 7. Retornar importe redondeado a 2 decimales
    return parseFloat(totalImporte.toFixed(2));
}

//================================================
// FUNCIÓN PARA OBTENER LA CANTIDAD DE SOBRES
// DE UN DEPARTAMENTO (SOLO EMPLEADOS MOSTRAR = TRUE)
//================================================
function obtenerSobres(tabla, nombreDepartamento) {
    var totalSobres = 0;

    // 1. Si es CORTE, se cuenta como 1 sobre (agrupado)
    if (nombreDepartamento.trim().toUpperCase() === 'CORTE') {
        // Verificar si hay importe > 0
        var importe = obtenerImportes(tabla, nombreDepartamento);
        return importe > 0 ? 1 : 0;
    }

    // 2. Si es PODA, usar la cantidad de cabos del servidor
    if (nombreDepartamento.trim().toUpperCase() === 'PODA') {
        if (datosCortesPodasGlobal && datosCortesPodasGlobal[tabla]) {
            return datosCortesPodasGlobal[tabla].total_cabos || 0;
        }
        return 0;
    }

    // 2. Validar que existan los datos de la nómina
    if (!datosNominasGlobal || !datosNominasGlobal[tabla]) {
        return 0;
    }

    var nomina = datosNominasGlobal[tabla];
    var departamentos = nomina.departamentos || [];

    if (nomina.departamentos_cortes_poda) {
        departamentos = departamentos.concat(nomina.departamentos_cortes_poda);
    }

    // 3. Buscar el departamento por su nombre
    var depto = departamentos.find(function (d) {
        return (d.nombre || '').trim().toLowerCase() === (nombreDepartamento || '').trim().toLowerCase();
    });

    if (!depto || !Array.isArray(depto.empleados)) {
        return 0;
    }

    // 4. Contar empleados con mostrar === true que cobren
    depto.empleados.forEach(function (empleado) {
        if (empleado.mostrar === true) {
            var cobrar = parseFloat(empleado.total_cobrar) || 0;
            if (cobrar > 0) {
                totalSobres++;
            }
        }
    });

    return totalSobres;
}

//================================================
// FUNCIÓN PARA MOSTRAR INFORMACIÓN GENERAL
//================================================

function mostrarInformacionGeneral(datos) {
    console.log("Mostrando información general con datos:", datos);

    var datosGenerales = datos.datos_generales;

    // Calcular totales generales
    var totalSobres = 0;
    var totalImporte = 0;
    var totalSobresDevueltos = 0;
    var totalImporteDevuelto = 0;

    Object.keys(datos).forEach(function (nomina) {
        if (nomina === "datos_generales") return;

        var nominaData = datos[nomina];
        totalSobres += nominaData.total_sobres || 0;
        totalImporte += nominaData.total_efectivo || 0;
        totalSobresDevueltos += nominaData.sobres_devueltos || 0;
        totalImporteDevuelto += nominaData.total_devuelto || 0;
    });

    // Establecer valores en los inputs de información general
    $("#info_folio").val(datosGenerales.folio);
    $("#info_fecha").val(datosGenerales.fecha);
    $("#info_semana").val(datosGenerales.semana);
    $("#info_periodo").val(datosGenerales.periodo);
    $("#info_elaboro").val(datosGenerales.elaboro);
    $("#info_sobres").val(totalSobres);
    $("#info_importe").val(totalImporte.toFixed(2));
    $("#info_sobres_devueltos").val(totalSobresDevueltos);
    $("#info_total_devuelto").val(totalImporteDevuelto.toFixed(2));

    // Limpiar el contenedor de responsivas individuales
    $("#container_responsivas_individuales").empty();

    // Luego mostrar las responsivas por nómina
    mostrarResponsivasPorNomina(datos);
}

//================================================
// FUNCIÓN PARA MOSTRAR RESPONSIVAS POR NÓMINA
//================================================

function mostrarResponsivasPorNomina(datos) {
    console.log("Mostrando responsivas con datos:", datos);

    // Recorrer cada nómina (excluyendo datos_generales)
    Object.keys(datos).forEach(function (nomina) {
        if (nomina === "datos_generales") return;

        var nominaData = datos[nomina];
        var datosGenerales = datos.datos_generales;

        // Obtener nombre legible de la nómina
        var nombreNomina = obtenerNombreNomina(nomina);

        // Generar HTML de la responsiva
        var responsivaHTML = `
            <div class="sheet-container mb-5" data-nomina="${nomina}">
                <!-- FRANJA SUPERIOR VERDE CITRICOS SAAO -->
                <div class="sheet-top-title">
                    CITRICOS SAAO
                </div>

                <!-- BANNER ROJO PRINCIPAL -->
                <div class="sheet-main-banner">
                    RESPONSIVA INDIVIDUAL – ${nombreNomina.toUpperCase()}
                </div>

                <!-- TABLA DE METADATOS Y DATOS GENERALES -->
                <div class="table-responsive">
                    <table class="responsiva-meta-table mt-1">
                    <tbody>
                        <!-- Fila 1 -->
                        <tr>
                            <td class="label-cell">Folio</td>
                            <td class="value-cell highlight-red">
                                <input type="text" class="form-control form-control-sm" value="${datosGenerales.folio}">
                            </td>
                            <td class="label-cell">Fecha</td>
                            <td class="value-cell highlight-bold">
                                <input type="date" class="form-control form-control-sm" value="${datosGenerales.fecha}">
                            </td>
                            <td class="label-cell">Semana</td>
                            <td class="value-cell highlight-red text-center">
                                <input type="text" class="form-control form-control-sm text-center" value="${datosGenerales.semana}">
                            </td>
                        </tr>
                        <!-- Fila 2 -->
                        <tr>
                            <td class="label-cell">Periodo</td>
                            <td class="value-cell text-center">
                                <input type="number" class="form-control form-control-sm text-center" value="${datosGenerales.periodo}">
                            </td>
                            <td class="label-cell">Responsable</td>
                            <td class="value-cell highlight-bold cell-responsable position-relative">
                                <input type="text" class="form-control form-control-sm input-responsable" value="${nominaData.responsable}" autocomplete="off" placeholder="Escriba o busque responsable...">
                                <div class="autocomplete-suggestions-dropdown" style="display: none;"></div>
                            </td>
                            <td class="label-cell">Puesto</td>
                            <td class="value-cell">
                                <input type="text" class="form-control form-control-sm input-puesto" value="${nominaData.puesto}" placeholder="Puesto">
                            </td>
                        </tr>
                        <!-- Fila 3 -->
                        <tr>
                            <td class="label-cell">Hora salida</td>
                            <td class="value-cell text-center">
                                <input type="time" class="form-control form-control-sm text-center" value="${nominaData.hora_salida}">
                            </td>
                            <td class="label-cell">Hora regreso</td>
                            <td class="value-cell text-center">
                                <input type="time" class="form-control form-control-sm text-center" value="${nominaData.hora_regreso}">
                            </td>
                            <td class="label-cell">Rancho</td>
                            <td class="value-cell highlight-bold">
                                <input type="text" class="form-control form-control-sm" value="${nombreNomina.toUpperCase()}">
                            </td>
                        </tr>
                        <!-- Fila 4 -->
                        <tr>
                            <td class="label-cell">Total sobres</td>
                            <td class="value-cell text-center highlight-bold">
                                <input type="number" class="form-control form-control-sm text-center input-meta-total-sobres" value="${nominaData.total_sobres}" min="0">
                            </td>
                            <td class="label-cell">Total efectivo</td>
                            <td class="value-cell highlight-bold">
                                <input type="number" class="form-control form-control-sm input-meta-total-importe" value="${nominaData.total_efectivo}" step="0.01" min="0">
                            </td>
                            <td class="label-cell">Total devuelto</td>
                            <td class="value-cell text-center">
                                <input type="number" class="form-control form-control-sm text-center input-meta-total-devuelto" value="${nominaData.total_devuelto}" step="0.01" min="0">
                            </td>
                        </tr>
                        <!-- Fila 5 -->
                        <tr>
                            <td class="label-cell"></td>
                            <td class="value-cell"></td>
                            <td class="label-cell"></td>
                            <td class="value-cell"></td>
                            <td class="label-cell" style="font-size: 0.78rem;">SOBRES DEVUELT</td>
                            <td class="value-cell text-center highlight-bold">
                                <input type="number" class="form-control form-control-sm text-center input-meta-sobres-devueltos" value="${nominaData.sobres_devueltos}" min="0">
                            </td>
                        </tr>
                    </tbody>
                </table>
                </div>

                <!-- TABLA PRINCIPAL DE DEPARTAMENTOS -->
                <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                    <span class="fw-bold text-secondary small">
                        <i class="bi bi-list-check me-1 text-success"></i>Detalle de Departamentos
                    </span>
                    <button type="button" class="btn btn-sm btn-success btn-agregar-fila shadow-sm" data-nomina="${nomina}">
                        <i class="bi bi-plus-circle me-1"></i>Agregar Fila
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="responsiva-table table-fixed">
                        <thead>
                            <tr>
                                <th style="width: 20%;">Nómina</th>
                                <th style="width: 8%;">Sobres</th>
                                <th style="width: 12%;">Importe</th>
                                <th style="width: 17%;">Observaciones</th>
                                <th style="width: 10%;">Sobres devueltos</th>
                                <th style="width: 12%;">Importe devuelto</th>
                                <th style="width: 16%;">Incidencias</th>
                                <th style="width: 5%;" class="text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generarFilasDepartamentos(nominaData.departamentos)}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td class="col-depto">TOTAL</td>
                                <td class="col-center">
                                    <input type="number" class="meta-input input-total-sobres" value="${nominaData.total_sobres}" min="0" readonly>
                                </td>
                                <td class="col-money">
                                    <input type="number" class="meta-input input-total-importe" value="${nominaData.total_efectivo}" step="0.01" min="0" readonly>
                                </td>
                                <td></td>
                                <td class="col-center">
                                    <input type="number" class="meta-input input-total-sobres-devueltos" value="${nominaData.sobres_devueltos}" min="0" readonly>
                                </td>
                                <td class="col-money text-center">
                                    <input type="number" class="meta-input input-total-importe-devuelto" value="${nominaData.total_devuelto}" step="0.01" min="0" readonly>
                                </td>
                                <td></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;

        // Agregar la responsiva al contenedor
        $("#container_responsivas_individuales").append(responsivaHTML);
    });
}

//================================================
// FUNCIÓN PARA OBTENER NOMBRE LEGIBLE DE NÓMINA
//================================================

function obtenerNombreNomina(nomina) {
    var nombres = {
        'nomina_confianza': 'Confianza',
        'nomina_40lbs': '40 LBS',
        'nomina_40lbs_jornal': '40 LBS Por Dia',
        'nomina_10lbs': '10 LBS',
        'nomina_relicario': 'Rancho Relicario',
        'nomina_pilar': 'Rancho Pilar',
        'nomina_huasteca': 'Rancho Huasteca',
        'nomina_palmilla': 'Rancho Palmilla'
    };
    return nombres[nomina] || nomina;
}

//================================================
// FUNCIÓN PARA GENERAR FILAS DE DEPARTAMENTOS
//================================================

function generarFilasDepartamentos(departamentos) {
    var filas = "";
    departamentos.forEach(function (depto) {
        filas += `
            <tr data-id-departamento="${depto.id_departamento || ''}">
                <td class="col-depto">
                    <input type="text" class="input-nombre-depto form-control form-control-sm border-0 bg-transparent p-0" value="${depto.nombre}" placeholder="Nombre depto">
                </td>
                <td class="col-center">
                    <input type="number" class="input-sobres" value="${depto.sobres}" min="0">
                </td>
                <td class="col-money">
                    <input type="number" class="input-importe" value="${depto.importe}" step="0.01" min="0">
                </td>
                <td>
                    <input type="text" class="input-observaciones" value="${depto.observaciones || ''}">
                </td>
                <td class="col-center">
                    <input type="number" class="input-sobres-devueltos" value="${depto.sobres_devueltos || 0}" min="0">
                </td>
                <td class="col-money">
                    <input type="number" class="input-importe-devuelto" value="${depto.importe_devuelto || 0}" step="0.01" min="0">
                </td>
                <td>
                    <input type="text" class="input-incidencias" value="${depto.incidencias || ''}">
                </td>
                <td class="text-center align-middle">
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-fila p-1" title="Eliminar departamento">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    return filas;
}

//================================================
// FUNCIÓN PARA AGREGAR UNA NUEVA FILA A LA TABLA
//================================================
function agregarFilaResponsiva(tablaNomina) {
    var $sheet = $(".sheet-container[data-nomina='" + tablaNomina + "']");
    if ($sheet.length === 0) return;

    var idNuevo = "manual_" + Date.now();
    var nuevaFilaHTML = `
        <tr data-id-departamento="${idNuevo}">
            <td class="col-depto">
                <input type="text" class="input-nombre-depto form-control form-control-sm border-0 bg-transparent p-0" placeholder="Nuevo depto / concepto" value="">
            </td>
            <td class="col-center">
                <input type="number" class="input-sobres" value="0" min="0">
            </td>
            <td class="col-money">
                <input type="number" class="input-importe" value="0.00" step="0.01" min="0">
            </td>
            <td>
                <input type="text" class="input-observaciones" value="" placeholder="Observaciones">
            </td>
            <td class="col-center">
                <input type="number" class="input-sobres-devueltos" value="0" min="0">
            </td>
            <td class="col-money">
                <input type="number" class="input-importe-devuelto" value="0.00" step="0.01" min="0">
            </td>
            <td>
                <input type="text" class="input-incidencias" value="" placeholder="Incidencias">
            </td>
            <td class="text-center align-middle">
                <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-fila p-1" title="Eliminar departamento">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;

    $sheet.find(".responsiva-table tbody").append(nuevaFilaHTML);
    $sheet.find("tr[data-id-departamento='" + idNuevo + "'] .input-nombre-depto").focus();

    // Actualizar totales y sincronizar JSON
    if (typeof actualizarTotalesResponsivaIndividual === "function") {
        actualizarTotalesResponsivaIndividual($sheet);
    }
    if (typeof actualizarTotalesGeneralesDesdeResponsivas === "function") {
        actualizarTotalesGeneralesDesdeResponsivas();
    }
    if (typeof actualizarJSONDesdeDOM === "function") {
        actualizarJSONDesdeDOM();
    }
}

//================================================
// FUNCIÓN PÚBLICA PARA OBTENER JSON ACTUALIZADO
//================================================

function obtenerJSONResponsivas() {
    // Actualizar desde el DOM antes de retornar
    actualizarJSONDesdeDOM();
    return jsonNominasResponsivas;
}


