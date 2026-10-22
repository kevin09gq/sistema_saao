//================================================
// CONFIGURACIÓN DE TABLAS RESPONSIVAS
// Funciones para actualizar totales en tiempo real
//================================================

$(document).ready(function () {
    // Inicializar eventos de las tablas
    inicializarEventosTablaGeneral();
    inicializarEventosTablaResponsiva();
    inicializarAutocompletadoEmpleados();
});

//================================================
// INICIALIZAR EVENTOS DE TABLA GENERAL
//================================================

function inicializarEventosTablaGeneral() {
    // Eventos para inputs de sobres e importe en tabla general
    $(document).on("input", "#info_sobres, #info_importe", function () {
        actualizarTotalesGenerales();
    });

    // Eventos para inputs de sobres devueltos en tabla general
    $(document).on("input", "#info_sobres_devueltos, #info_total_devuelto", function () {
        actualizarTotalesGenerales();
    });
}

//================================================
// INICIALIZAR EVENTOS DE TABLA RESPONSIVA INDIVIDUAL
//================================================

function inicializarEventosTablaResponsiva() {
    // Eventos para inputs de sobres en tabla responsiva
    $(document).on("input", ".input-sobres", function () {
        var $tabla = $(this).closest(".sheet-container");
        actualizarTotalesResponsivaIndividual($tabla);
        actualizarTotalesGeneralesDesdeResponsivas();
    });

    // Eventos para inputs de importe en tabla responsiva
    $(document).on("input", ".input-importe", function () {
        var $tabla = $(this).closest(".sheet-container");
        actualizarTotalesResponsivaIndividual($tabla);
        actualizarTotalesGeneralesDesdeResponsivas();
    });

    // Eventos para inputs de sobres devueltos en tabla responsiva
    $(document).on("input", ".input-sobres-devueltos", function () {
        var $tabla = $(this).closest(".sheet-container");
        actualizarTotalesResponsivaIndividual($tabla);
        actualizarTotalesGeneralesDesdeResponsivas();
    });

    // Eventos para inputs de importe devuelto en tabla responsiva
    $(document).on("input", ".input-importe-devuelto", function () {
        var $tabla = $(this).closest(".sheet-container");
        actualizarTotalesResponsivaIndividual($tabla);
        actualizarTotalesGeneralesDesdeResponsivas();
    });

    // Evento para agregar una nueva fila a la tabla de una nómina
    $(document).on("click", ".btn-agregar-fila", function () {
        var nomina = $(this).data("nomina") || $(this).closest(".sheet-container").data("nomina");
        if (nomina && typeof agregarFilaResponsiva === "function") {
            agregarFilaResponsiva(nomina);
        }
    });

    // Evento para eliminar una fila con confirmación
    $(document).on("click", ".btn-eliminar-fila", function () {
        var $btn = $(this);
        var $fila = $btn.closest("tr");
        var $sheet = $fila.closest(".sheet-container");
        var inputNombre = $fila.find(".input-nombre-depto");
        var nombreDepto = (inputNombre.length > 0 && inputNombre.val().trim() !== "")
            ? inputNombre.val().trim()
            : ($fila.find("td.col-depto").text().trim() || "este departamento");

        Swal.fire({
            title: "¿Eliminar fila?",
            text: "¿Desea eliminar \"" + nombreDepto + "\" de esta responsiva?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                $fila.fadeOut(200, function () {
                    $(this).remove();
                    actualizarTotalesResponsivaIndividual($sheet);
                    actualizarTotalesGeneralesDesdeResponsivas();
                    actualizarJSONDesdeDOM();
                });
            }
        });
    });

    // Actualizar JSON en tiempo real con cualquier cambio en los inputs
    $(document).on("input change", "#container_responsivas input, #info_folio, #info_fecha, #info_semana, #info_periodo, #info_elaboro, #info_sobres, #info_importe, #info_sobres_devueltos, #info_total_devuelto", function () {
        actualizarJSONDesdeDOM();
    });
}

//================================================
// ACTUALIZAR TOTALES DE INFORMACIÓN GENERAL
//================================================

function actualizarTotalesGenerales() {
    // Obtener valores de la tabla general
    var sobres = parseFloat($("#info_sobres").val()) || 0;
    var importe = parseFloat($("#info_importe").val()) || 0;
    var sobresDevueltos = parseFloat($("#info_sobres_devueltos").val()) || 0;
    var totalDevuelto = parseFloat($("#info_total_devuelto").val()) || 0;

    // Aquí puedes agregar lógica adicional si es necesario
}

//================================================
// ACTUALIZAR TOTALES DE RESPONSIVA INDIVIDUAL
//================================================

function actualizarTotalesResponsivaIndividual($tabla) {
    var totalSobres = 0;
    var totalImporte = 0;
    var totalSobresDevueltos = 0;
    var totalImporteDevuelto = 0;

    // Sumar sobres
    $tabla.find(".input-sobres").each(function () {
        totalSobres += parseFloat($(this).val()) || 0;
    });

    // Sumar importes
    $tabla.find(".input-importe").each(function () {
        totalImporte += parseFloat($(this).val()) || 0;
    });

    // Sumar sobres devueltos
    $tabla.find(".input-sobres-devueltos").each(function () {
        totalSobresDevueltos += parseFloat($(this).val()) || 0;
    });

    // Sumar importes devueltos
    $tabla.find(".input-importe-devuelto").each(function () {
        totalImporteDevuelto += parseFloat($(this).val()) || 0;
    });

    // Actualizar los inputs de totales en la tabla de metadatos
    $tabla.find(".input-meta-total-sobres").val(totalSobres);
    $tabla.find(".input-meta-total-importe").val(totalImporte.toFixed(2));
    $tabla.find(".input-meta-total-devuelto").val(totalImporteDevuelto.toFixed(2));
    $tabla.find(".input-meta-sobres-devueltos").val(totalSobresDevueltos);

    // Actualizar los inputs de totales en el footer de la tabla de departamentos
    $tabla.find(".input-total-sobres").val(totalSobres);
    $tabla.find(".input-total-importe").val(totalImporte.toFixed(2));
    $tabla.find(".input-total-sobres-devueltos").val(totalSobresDevueltos);
    $tabla.find(".input-total-importe-devuelto").val(totalImporteDevuelto.toFixed(2));
}

//================================================
// ACTUALIZAR TOTALES GENERALES DESDE RESPONSIVAS
//================================================

function actualizarTotalesGeneralesDesdeResponsivas() {
    var totalSobresGeneral = 0;
    var totalImporteGeneral = 0;
    var totalSobresDevueltosGeneral = 0;
    var totalImporteDevueltoGeneral = 0;

    // Recorrer todas las tablas responsivas
    $(".sheet-container").each(function () {
        var $tabla = $(this);

        // Sumar sobres de esta tabla
        $tabla.find(".input-sobres").each(function () {
            totalSobresGeneral += parseFloat($(this).val()) || 0;
        });

        // Sumar importes de esta tabla
        $tabla.find(".input-importe").each(function () {
            totalImporteGeneral += parseFloat($(this).val()) || 0;
        });

        // Sumar sobres devueltos de esta tabla
        $tabla.find(".input-sobres-devueltos").each(function () {
            totalSobresDevueltosGeneral += parseFloat($(this).val()) || 0;
        });

        // Sumar importes devueltos de esta tabla
        $tabla.find(".input-importe-devuelto").each(function () {
            totalImporteDevueltoGeneral += parseFloat($(this).val()) || 0;
        });
    });

    // Actualizar la tabla general
    $("#info_sobres").val(totalSobresGeneral);
    $("#info_importe").val(totalImporteGeneral.toFixed(2));
    $("#info_sobres_devueltos").val(totalSobresDevueltosGeneral);
    $("#info_total_devuelto").val(totalImporteDevueltoGeneral.toFixed(2));
}

//================================================
// FUNCIÓN UTILIDAD: OBTENER TOTALES DE UNA TABLA
//================================================

function obtenerTotalesTabla($tabla) {
    var totalSobres = 0;
    var totalImporte = 0;
    var totalSobresDevueltos = 0;
    var totalImporteDevuelto = 0;

    $tabla.find(".input-sobres").each(function () {
        totalSobres += parseFloat($(this).val()) || 0;
    });

    $tabla.find(".input-importe").each(function () {
        totalImporte += parseFloat($(this).val()) || 0;
    });

    $tabla.find(".input-sobres-devueltos").each(function () {
        totalSobresDevueltos += parseFloat($(this).val()) || 0;
    });

    $tabla.find(".input-importe-devuelto").each(function () {
        totalImporteDevuelto += parseFloat($(this).val()) || 0;
    });

    return {
        totalSobres: totalSobres,
        totalImporte: totalImporte,
        totalSobresDevueltos: totalSobresDevueltos,
        totalImporteDevuelto: totalImporteDevuelto
    };
}


//================================================
// FUNCIÓN PARA ACTUALIZAR JSON EN TIEMPO REAL
//================================================

function actualizarJSONDesdeDOM() {
    if (!jsonNominasResponsivas) return;

    // Actualizar datos generales desde la tabla general
    jsonNominasResponsivas.datos_generales.folio = $("#info_folio").val();
    jsonNominasResponsivas.datos_generales.fecha = $("#info_fecha").val();
    jsonNominasResponsivas.datos_generales.semana = $("#info_semana").val();
    jsonNominasResponsivas.datos_generales.periodo = $("#info_periodo").val();
    jsonNominasResponsivas.datos_generales.elaboro = $("#info_elaboro").val();
    jsonNominasResponsivas.datos_generales.sobres_general = parseFloat($("#info_sobres").val()) || 0;
    jsonNominasResponsivas.datos_generales.importe_general = parseFloat($("#info_importe").val()) || 0;
    jsonNominasResponsivas.datos_generales.sobres_devueltos_general = parseFloat($("#info_sobres_devueltos").val()) || 0;
    jsonNominasResponsivas.datos_generales.total_sobres_devueltos = parseFloat($("#info_total_devuelto").val()) || 0;

    // Recorrer cada responsiva individual usando el atributo data-nomina
    var sheets = $(".sheet-container").toArray();
    sheets.forEach(function (sheet) {
        var $sheet = $(sheet);
        var tablaNomina = $sheet.data("nomina");

        if (!tablaNomina || !jsonNominasResponsivas[tablaNomina]) return;

        var nominaData = jsonNominasResponsivas[tablaNomina];
        var $metaTable = $sheet.find(".responsiva-meta-table");

        // Actualizar metadatos buscando por el texto de la etiqueta anterior
        $metaTable.find("input").each(function () {
            var $input = $(this);
            var $parentTd = $input.closest("td");
            var $prevTd = $parentTd.prev();
            var labelText = $prevTd.length > 0 ? $prevTd.text().trim().toLowerCase() : "";
            var inputValue = $input.val();

            if ($input.hasClass("input-responsable") || labelText.includes("responsable")) {
                nominaData.responsable = inputValue;
            } else if ($input.hasClass("input-puesto") || labelText.includes("puesto")) {
                nominaData.puesto = inputValue;
            } else if (labelText.includes("hora salida")) {
                nominaData.hora_salida = inputValue;
            } else if (labelText.includes("hora regreso")) {
                nominaData.hora_regreso = inputValue;
            } else if (labelText.includes("total sobres")) {
                nominaData.total_sobres = parseFloat(inputValue) || 0;
            } else if (labelText.includes("total efectivo")) {
                nominaData.total_efectivo = parseFloat(inputValue) || 0;
            } else if (labelText.includes("total devuelto")) {
                nominaData.total_devuelto = parseFloat(inputValue) || 0;
            } else if (labelText.includes("sobres devuelt")) {
                nominaData.sobres_devueltos = parseFloat(inputValue) || 0;
            }
        });

        // Reconstruir departamentos dinámicamente desde las filas actuales del DOM
        var nuevosDepartamentos = [];
        var rows = $sheet.find(".responsiva-table tbody tr").toArray();

        rows.forEach(function (row) {
            var $row = $(row);
            var $cells = $row.find("td");
            var idDepartamento = $row.data("id-departamento");

            if (!idDepartamento) {
                idDepartamento = "manual_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
                $row.attr("data-id-departamento", idDepartamento);
                $row.data("id-departamento", idDepartamento);
            }

            // Buscar si ya existía para mantener su color y datos originales
            var deptoExistente = Array.isArray(nominaData.departamentos) ? nominaData.departamentos.find(function (d) {
                return String(d.id_departamento) === String(idDepartamento);
            }) : null;

            // Obtener el nombre del departamento (input o texto)
            var inputNombre = $cells.eq(0).find(".input-nombre-depto");
            var nombreDepto = (inputNombre.length > 0 && inputNombre.val().trim() !== "")
                ? inputNombre.val().trim()
                : $cells.eq(0).text().trim();

            if (!nombreDepto && deptoExistente) {
                nombreDepto = deptoExistente.nombre || "";
            }

            var sobres = parseFloat($cells.eq(1).find("input").val()) || 0;
            var importe = parseFloat($cells.eq(2).find("input").val()) || 0;
            var observaciones = $cells.eq(3).find("input").val() || "";
            var sobresDevueltos = parseFloat($cells.eq(4).find("input").val()) || 0;
            var importeDevuelto = parseFloat($cells.eq(5).find("input").val()) || 0;
            var incidencias = $cells.eq(6).find("input").val() || "";

            nuevosDepartamentos.push({
                id_departamento: idDepartamento,
                nombre: nombreDepto,
                sobres: sobres,
                importe: importe,
                color: deptoExistente ? (deptoExistente.color || "") : (nominaData.color || ""),
                observaciones: observaciones,
                sobres_devueltos: sobresDevueltos,
                importe_devuelto: importeDevuelto,
                incidencias: incidencias
            });
        });

        nominaData.departamentos = nuevosDepartamentos;
    });

    console.log("JSON actualizado en tiempo real:", jsonNominasResponsivas);
}


//================================================
// EXPORTAR RESPONSIVAS A EXCEL
//================================================

$("#btn_generar_excel").on("click", function () {

    // Obtener el JSON actualizado con los datos de la interfaz
    var json = obtenerJSONResponsivas();

    // Validar que existan datos
    if (!json) {
        Swal.fire({
            icon: "warning",
            title: "Sin información",
            text: "Primero debes generar las responsivas."
        });
        return;
    }

    // Mostrar feedback de carga al usuario
    Swal.fire({
        title: "Generando Excel...",
        text: "Por favor espere mientras se prepara el archivo.",
        allowOutsideClick: false,
        didOpen: function () {
            Swal.showLoading();
        }
    });

    // Enviar el JSON mediante AJAX al backend
    $.ajax({
        url: "../php/exportarResponsiva/responsiva.php",
        type: "POST",
        xhrFields: {
            responseType: 'blob'
        },
        data: {
            accion: "generarExcelResponsivas",
            json_responsivas: JSON.stringify(json)
        },
        success: function (blob, status, xhr) {
            Swal.close();

            // Obtener el nombre del archivo del header Content-Disposition
            var filename = 'responsivas_nomina.xlsx';
            var disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            // Crear un enlace temporal para descargar el archivo
            var link = document.createElement('a');
            var url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: "success",
                title: "¡Archivo generado!",
                text: "Descarga iniciada correctamente.",
                timer: 2000,
                showConfirmButton: false
            });
        },
        error: function (xhr, estado, error) {
            Swal.close();
            console.error("Error al exportar a excel:", error, xhr.responseText);
            Swal.fire({
                icon: "error",
                title: "Error de comunicación",
                text: "No se pudo conectar con el servidor para exportar el Excel."
            });
        }
    });
});

//================================================
// AUTOCOMPLETADO DE EMPLEADOS Y PUESTOS (BASE DE DATOS)
//================================================

var debounceTimerAutocompletado = null;

function inicializarAutocompletadoEmpleados() {
    // Evento al escribir en el campo responsable o elaboró
    $(document).on("input", ".input-responsable, .input-elaboro, #info_elaboro", function () {
        var $input = $(this);
        var $container = $input.closest(".cell-responsable, .cell-elaboro, td, .position-relative");
        var $dropdown = $container.find(".autocomplete-suggestions-dropdown");

        if ($dropdown.length === 0) {
            $dropdown = $('<div class="autocomplete-suggestions-dropdown" style="display:none;"></div>');
            $container.addClass("position-relative").append($dropdown);
        }

        var termino = $input.val().trim();
        clearTimeout(debounceTimerAutocompletado);

        if (termino.length < 2) {
            $dropdown.hide().empty();
            return;
        }

        debounceTimerAutocompletado = setTimeout(function () {
            $.ajax({
                url: "../php/exportarResponsiva/buscarEmpleadosResponsiva.php",
                type: "POST",
                dataType: "json",
                data: {
                    accion: "buscarEmpleados",
                    termino: termino
                },
                success: function (response) {
                    if (!response || !response.success || !Array.isArray(response.datos) || response.datos.length === 0) {
                        $dropdown.html('<div class="autocomplete-no-results"><i class="bi bi-info-circle me-1"></i>Sin coincidencias (se permite valor libre)</div>').show();
                        return;
                    }

                    var html = "";
                    response.datos.forEach(function (emp) {
                        var puestoTexto = emp.puesto && emp.puesto.trim() !== "" ? emp.puesto.trim() : "Sin puesto asignado";
                        var claveTexto = emp.clave_empleado ? emp.clave_empleado : "";

                        var nombreEscapado = $("<div>").text(emp.nombre_completo).html();
                        var puestoEscapado = $("<div>").text(emp.puesto).html();

                        html += '<div class="autocomplete-suggestion-item" data-nombre="' + nombreEscapado + '" data-puesto="' + puestoEscapado + '">' +
                                    '<div class="autocomplete-suggestion-name">' + nombreEscapado + '</div>' +
                                    '<div class="autocomplete-suggestion-meta">' +
                                        '<span class="badge-puesto"><i class="bi bi-briefcase me-1"></i>' + puestoTexto + '</span>' +
                                        (claveTexto ? '<span class="badge-clave"><i class="bi bi-person-badge me-1"></i>' + claveTexto + '</span>' : '') +
                                    '</div>' +
                                '</div>';
                    });

                    $dropdown.html(html).show();
                },
                error: function (xhr, status, error) {
                    console.warn("No se pudo obtener sugerencias de empleados:", error);
                    $dropdown.hide().empty();
                }
            });
        }, 220);
    });

    // Evento al seleccionar una sugerencia de la lista
    $(document).on("click", ".autocomplete-suggestion-item", function (e) {
        e.stopPropagation();
        var $item = $(this);
        var nombre = $item.data("nombre") || "";
        var puesto = $item.data("puesto") || "";

        var $dropdown = $item.closest(".autocomplete-suggestions-dropdown");
        var $container = $dropdown.closest(".cell-responsable, .cell-elaboro, td, .position-relative");
        var $input = $container.find("input");

        // Asignar el nombre seleccionado al input
        $input.val(nombre);

        // Si es el input de responsable, asignar el puesto correspondiente
        if ($input.hasClass("input-responsable") || $container.hasClass("cell-responsable") || $container.prev().text().toLowerCase().includes("responsable")) {
            var $row = $container.closest("tr");
            var $puestoInput = $row.find(".input-puesto");
            if ($puestoInput.length === 0) {
                var $sheet = $container.closest(".sheet-container");
                $puestoInput = $sheet.find(".input-puesto");
            }

            if ($puestoInput.length > 0) {
                $puestoInput.val(puesto);

                // Destello visual de confirmación en el puesto asignado
                $puestoInput.addClass("bg-warning-subtle");
                setTimeout(function () {
                    $puestoInput.removeClass("bg-warning-subtle");
                }, 700);
            }
        }

        $dropdown.hide().empty();

        // Actualizar el JSON y almacenamiento en tiempo real
        actualizarJSONDesdeDOM();
    });

    // Navegación por teclado (Flechas arriba/abajo, Enter para seleccionar, Escape para cerrar)
    $(document).on("keydown", ".input-responsable, .input-elaboro, #info_elaboro", function (e) {
        var $input = $(this);
        var $container = $input.closest(".cell-responsable, .cell-elaboro, td, .position-relative");
        var $dropdown = $container.find(".autocomplete-suggestions-dropdown");

        if (!$dropdown.is(":visible")) return;

        var $items = $dropdown.find(".autocomplete-suggestion-item");
        if ($items.length === 0) return;

        var $active = $items.filter(".active");

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if ($active.length === 0 || $active.is(":last-child")) {
                $items.removeClass("active");
                $items.first().addClass("active");
            } else {
                $active.removeClass("active").next().addClass("active");
            }
            var el = $items.filter(".active")[0];
            if (el) el.scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if ($active.length === 0 || $active.is(":first-child")) {
                $items.removeClass("active");
                $items.last().addClass("active");
            } else {
                $active.removeClass("active").prev().addClass("active");
            }
            var el = $items.filter(".active")[0];
            if (el) el.scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
            if ($active.length > 0) {
                e.preventDefault();
                $active.trigger("click");
            }
        } else if (e.key === "Escape") {
            $dropdown.hide().empty();
        }
    });

    // Cerrar sugerencias al hacer clic en cualquier otra parte del documento
    $(document).on("click", function (e) {
        if (!$(e.target).closest(".cell-responsable, .cell-elaboro, .autocomplete-suggestions-dropdown").length) {
            $(".autocomplete-suggestions-dropdown").hide().empty();
        }
    });
}