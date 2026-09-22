let todosLosEmpleados = [];
let empleadosFiltrados = [];
let empleadosSeleccionados = new Set(); // IDs de empleados seleccionados
let paginaActual = 1;
const filasPorPagina = 10;

$(document).ready(function () {
    obtenerAreas();
    obtenerDepartamentos();
    obtenerEmpleados();
    inicializarEventosFiltrado();
});

//==============================
// OBTIENE LAS AREAS PARA MOSTRAR EN EL SELECT
//==============================
function obtenerAreas() {
    $.post('../php/filtrado.php', { action: 'obtenerAreas' }, function (areas) {
        let opciones = '<option value="" selected>Todas las Áreas</option>';
        $.each(areas, function (i, area) {
            opciones += `<option value="${area.id_area}">${area.nombre_area}</option>`;
        });
        $('#selectArea').html(opciones);
    }, 'json');
}

//==============================
// OBTIENE LOS DEPARTAMENTOS (OPCIONALMENTE FILTRADOS POR ÁREA)
//==============================
function obtenerDepartamentos(idArea = '') {
    $.post('../php/filtrado.php', { action: 'obtenerDepartamentos', id_area: idArea }, function (departamentos) {
        let opciones = '<option value="" selected>Todos los Departamentos</option>';
        $.each(departamentos, function (i, depto) {
            opciones += `<option value="${depto.id_departamento}">${depto.nombre_departamento}</option>`;
        });
        $('#selectDepartamento').html(opciones);
    }, 'json');
}

//==============================
// OBTIENE LA INFORMACION BASE DE TODOS LOS EMPLEADOS
//==============================
function obtenerEmpleados() {
    $.post('../php/empleados.php', { action: 'obtenerEmpleados' }, function (respuesta) {
        todosLosEmpleados = respuesta;
        empleadosFiltrados = [...respuesta];
        paginarEmpleados(1);
    }, 'json');
}

//==============================
// CARGA LOS DATOS DE LOS EMPLEADOS EN EL CUERPO DE LA TABLA
//==============================
function cargarDatos(empleados, indiceInicio) {
    let $cuerpoTabla = $('#tbodyAsistencia').empty();

    if (empleados.length === 0) {
        $cuerpoTabla.append(`
            <tr>
                <td colspan="6" class="text-center text-muted p-4">
                    <i class="bi bi-search" style="font-size: 1.5rem; opacity: 0.4;"></i>
                    <br><br>No se encontraron resultados
                </td>
            </tr>`);
        return;
    }

    $.each(empleados, function (indice, emp) {
        let iniciales = (emp.nombre.charAt(0) + (emp.ap_paterno ? emp.ap_paterno.charAt(0) : '')).toUpperCase();
        let isSelected = empleadosSeleccionados.has(String(emp.id_empleado));

        // Determinar badge de IMSS
        let imssBadge = '';
        if (emp.status_nss == 1) {
            imssBadge = '<span class="badge-seguro">Con Seguro</span>';
        } else {
            imssBadge = '<span class="badge-sin-seguro">Sin Seguro</span>';
        }

        let fila = `
        <tr class="${isSelected ? 'selected' : ''}" data-id="${emp.id_empleado}">
            <td>
                <div class="check-header">
                    <input type="checkbox" class="custom-check check-empleado"
                           value="${emp.id_empleado}"
                           ${isSelected ? 'checked' : ''}
                           data-nombre="${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}">
                </div>
            </td>
            <td><span class="fw-bold">${emp.clave_empleado}</span></td>
            <td>
                <div class="emp-info-cell">
                    <div class="emp-initials">${iniciales}</div>
                    <div class="emp-name-main">${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}</div>
                </div>
            </td>
            <td>
                <div class="dept-badge">
                    ${emp.nombre_departamento || 'Sin asignar'}
                </div>
            </td>
            <td>
                <div class="area-badge">
                    <i class="bi bi-geo-alt"></i> ${emp.nombre_area || 'Sin asignar'}
                </div>
            </td>
            <td class="text-center">${imssBadge}</td>
        </tr>`;
        $cuerpoTabla.append(fila);
    });

    // Actualizar estado del checkbox "seleccionar todos" de la página actual
    actualizarCheckAll();
}

//==============================
// APLICA LOS FILTROS DE BÚSQUEDA, ÁREA, DEPARTAMENTO E IMSS
//==============================
function aplicarFiltros() {
    let textoBusqueda = $('#inputBusqueda').val().toLowerCase();
    let idArea = $('#selectArea').val();
    let idDepto = $('#selectDepartamento').val();
    let statusIMSS = $('#selectIMSS').val();

    empleadosFiltrados = todosLosEmpleados.filter(empleado => {
        let nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno} ${empleado.ap_materno}`.toLowerCase();

        let coincideTexto = nombreCompleto.includes(textoBusqueda) ||
                            empleado.clave_empleado.toLowerCase().includes(textoBusqueda);

        let coincideArea = (idArea === "" || empleado.id_area == idArea);
        let coincideDepto = (idDepto === "" || empleado.id_departamento == idDepto);
        let coincideIMSS = (statusIMSS === "" || empleado.status_nss == statusIMSS);

        return coincideTexto && coincideArea && coincideDepto && coincideIMSS;
    });

    paginarEmpleados(1);
}

//==============================
// INICIALIZA LOS EVENTOS DE LOS FILTROS Y BOTONES
//==============================
function inicializarEventosFiltrado() {
    // Eventos para filtros en tiempo real
    $('#inputBusqueda').on('input keyup', function() {
        let val = $(this).val().trim();
        if (val.length > 0) {
            $('#btnClearSearch').removeClass('d-none');
        } else {
            $('#btnClearSearch').addClass('d-none');
        }
        aplicarFiltros();
    });

    // Botón X interno para limpiar el campo de búsqueda
    $('#btnClearSearch').on('click', function() {
        $('#inputBusqueda').val('').focus();
        $(this).addClass('d-none');
        aplicarFiltros();
    });
    
    $('#selectArea').on('change', function() {
        let idArea = $(this).val();
        obtenerDepartamentos(idArea);
        aplicarFiltros();
    });

    $('#selectDepartamento').on('change', aplicarFiltros);
    $('#selectIMSS').on('change', aplicarFiltros);

    // Botón para limpiar filtros
    $('#btnLimpiar').on('click', function () {
        $('#inputBusqueda').val('');
        $('#btnClearSearch').addClass('d-none');
        $('#selectArea').val('');
        $('#selectDepartamento').val('');
        $('#selectIMSS').val('');
        obtenerDepartamentos();
        aplicarFiltros();
    });

    // Checkbox principal "seleccionar todos" de la página actual
    $(document).on('change', '#checkAll', function() {
        let isChecked = $(this).is(':checked');
        let inicio = (paginaActual - 1) * filasPorPagina;
        let fin = Math.min(inicio + filasPorPagina, empleadosFiltrados.length);

        for (let i = inicio; i < fin; i++) {
            let idEmpleado = String(empleadosFiltrados[i].id_empleado);
            if (isChecked) {
                empleadosSeleccionados.add(idEmpleado);
            } else {
                empleadosSeleccionados.delete(idEmpleado);
            }
        }

        // Actualizar checkboxes de la tabla visualmente
        $('.check-empleado').each(function() {
            $(this).prop('checked', isChecked);
            $(this).closest('tr').toggleClass('selected', isChecked);
        });
    });

    // Checkbox individual de empleado
    $(document).on('change', '.check-empleado', function() {
        let idEmpleado = String($(this).val());
        let isChecked = $(this).is(':checked');

        if (isChecked) {
            empleadosSeleccionados.add(idEmpleado);
        } else {
            empleadosSeleccionados.delete(idEmpleado);
        }

        $(this).closest('tr').toggleClass('selected', isChecked);
        actualizarCheckAll();
    });

    // Click en la fila para seleccionar/deseleccionar
    $(document).on('click', '#tbodyAsistencia tr td:not(:first-child)', function() {
        let $checkbox = $(this).closest('tr').find('.check-empleado');
        $checkbox.prop('checked', !$checkbox.is(':checked')).trigger('change');
    });

    // Botón "Seleccionar Todos" (todos los filtrados, no solo la página)
    $('#btnSeleccionarTodos').on('click', function() {
        let todosSeleccionados = empleadosFiltrados.every(emp => empleadosSeleccionados.has(String(emp.id_empleado)));

        if (todosSeleccionados) {
            // Si ya están todos seleccionados, deseleccionar
            empleadosFiltrados.forEach(emp => {
                empleadosSeleccionados.delete(String(emp.id_empleado));
            });
        } else {
            // Seleccionar todos los filtrados
            empleadosFiltrados.forEach(emp => {
                empleadosSeleccionados.add(String(emp.id_empleado));
            });
        }

        // Redibujar la tabla
        let inicio = (paginaActual - 1) * filasPorPagina;
        let fin = inicio + filasPorPagina;
        cargarDatos(empleadosFiltrados.slice(inicio, fin), inicio);
    });

    // Botón Deseleccionar todo
    $('#btnDeseleccionar').on('click', function() {
        empleadosSeleccionados.clear();

        let inicio = (paginaActual - 1) * filasPorPagina;
        let fin = inicio + filasPorPagina;
        cargarDatos(empleadosFiltrados.slice(inicio, fin), inicio);
    });

    // Botón Generar Excel: Generar Excel con los empleados seleccionados o filtrados
    $('#btnGenerarExcel').on('click', function() {
        // Prioridad: si hay selección manual, usarla. Si no, usar filtrados.
        let idsAUsar = [];

        if (empleadosSeleccionados.size > 0) {
            // Hay empleados seleccionados manualmente
            idsAUsar = Array.from(empleadosSeleccionados);
        } else if (empleadosFiltrados.length > 0) {
            // No hay selección manual, usar todos los filtrados
            idsAUsar = empleadosFiltrados.map(emp => String(emp.id_empleado));
        } else {
            // No hay empleados en la tabla
            Swal.fire({
                icon: 'warning',
                title: 'Sin resultados',
                text: 'Por favor aplica filtros para mostrar empleados en la tabla.',
                confirmButtonColor: '#22c55e'
            });
            return;
        }

        $('#hiddenEmpleadosIds').val(JSON.stringify(idsAUsar));

        // Preparar modal y abrirlo
        prepararModalExcel();
        $('#modalConfigExcel').modal('show');
    });

    inicializarEventosModalExcel();
}

//==============================
// ACTUALIZA EL ESTADO DEL CHECKBOX "SELECCIONAR TODOS"
//==============================
function actualizarCheckAll() {
    let checkboxesPagina = $('.check-empleado');
    let todosChecked = checkboxesPagina.length > 0 && checkboxesPagina.filter(':checked').length === checkboxesPagina.length;
    $('#checkAll').prop('checked', todosChecked);
}



//==============================
// GESTIONA LA PAGINACIÓN DE LOS DATOS
//==============================
function paginarEmpleados(numeroPagina) {
    paginaActual = numeroPagina;
    
    let inicio = (paginaActual - 1) * filasPorPagina;
    let fin = inicio + filasPorPagina;
    let empleadosPagina = empleadosFiltrados.slice(inicio, fin);

    cargarDatos(empleadosPagina, inicio);
    dibujarBotonesPaginacion();
}

//==============================
// DIBUJA LOS BOTONES DE NÚMEROS Y NAVEGACIÓN
//==============================
function dibujarBotonesPaginacion() {
    let totalPaginas = Math.ceil(empleadosFiltrados.length / filasPorPagina);
    let $listaPaginacion = $('#paginationList').empty();

    // Botón Anterior
    $listaPaginacion.append(`
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="paginarEmpleados(${paginaActual - 1})">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>`);

    // Botones de Números
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            $listaPaginacion.append(`
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="javascript:void(0)" onclick="paginarEmpleados(${i})">${i}</a>
                </li>`);
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            $listaPaginacion.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
        }
    }

    // Botón Siguiente
    $listaPaginacion.append(`
        <li class="page-item ${paginaActual === totalPaginas || totalPaginas === 0 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="paginarEmpleados(${paginaActual + 1})">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>`);

    actualizarTextoInformativo();
}

//==============================
// ACTUALIZA EL TEXTO INFORMATIVO AL PIE DE LA TABLA
//==============================
function actualizarTextoInformativo() {
    let total = empleadosFiltrados.length;
    let desde = total === 0 ? 0 : (paginaActual - 1) * filasPorPagina + 1;
    let hasta = Math.min(paginaActual * filasPorPagina, total);
    
    $('#infoPaginacion').html(`Mostrando <strong>${desde}</strong> a <strong>${hasta}</strong> de <strong>${total}</strong> empleados`);
}

//==============================================================
// MÓDULO DE CONFIGURACIÓN Y GENERACIÓN DE EXCEL
//==============================================================

/**
 * Prepara los valores por defecto del modal antes de abrirlo
 */
function prepararModalExcel() {
    // 1. Si no hay IDs asignados (por ejemplo, desde Configurar Excel), usar los filtrados
    let currentIds = $('#hiddenEmpleadosIds').val();
    if (!currentIds || currentIds === '[]') {
        let idsFiltrados = empleadosFiltrados.map(emp => String(emp.id_empleado));
        $('#hiddenEmpleadosIds').val(JSON.stringify(idsFiltrados));
    }

    // 2. Pre-llenar departamento si hay uno seleccionado en el filtro
    let deptoTexto = $('#selectDepartamento option:selected').text();
    if (deptoTexto && !deptoTexto.includes('Todos')) {
        $('#cfgDepartamento').val(deptoTexto);
    } else if (!$('#cfgDepartamento').val()) {
        $('#cfgDepartamento').val('departamento');
    }
}

/**
 * Inicializa los eventos del formulario y presets del modal
 */
function inicializarEventosModalExcel() {
    // Escuchar cambios de fecha para actualizar automáticamente el texto de la semana
    $('#cfgFechaInicio, #cfgFechaFin').on('change', function() {
        actualizarTextoSemanaYNumero();
    });

    // Presets rápidos para días
    $('#btnPresetVieDom').on('click', function() {
        establecerDiasSeleccionados(['VIERNES', 'SABADO', 'DOMINGO']);
    });

    $('#btnPresetLunVie').on('click', function() {
        establecerDiasSeleccionados(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']);
    });

    $('#btnPresetLunSab').on('click', function() {
        establecerDiasSeleccionados(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']);
    });

    $('#btnPresetTodos').on('click', function() {
        establecerDiasSeleccionados(['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']);
    });

    // Botón Previsualizar Plantilla
    $('#btnPrevisualizarExcel').on('click', function() {
        let diasSeleccionados = $('.check-dia:checked').length;
        if (diasSeleccionados === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona los días',
                text: 'Debes marcar al menos un día de la semana para previsualizar la plantilla.',
                confirmButtonColor: '#22c55e'
            });
            return;
        }

        renderizarVistaPreviaExcel();
        $('#modalConfigExcel').modal('hide');
        setTimeout(() => {
            $('#modalPreviewExcel').modal('show');
        }, 300);
    });

    // Botón Descargar Excel desde la configuración
    $('#btnDescargarExcelConfig').on('click', function() {
        let diasSeleccionados = $('.check-dia:checked').length;
        if (diasSeleccionados === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona los días',
                text: 'Debes marcar al menos un día de la semana para generar la plantilla.',
                confirmButtonColor: '#22c55e'
            });
            return;
        }

        descargarExcelConAlerta();
    });

    // Botón Volver a Configurar desde la vista previa
    $('#btnVolverConfig').on('click', function() {
        $('#modalPreviewExcel').modal('hide');
        setTimeout(() => {
            $('#modalConfigExcel').modal('show');
        }, 300);
    });

    // Botón Descargar Excel desde la vista previa
    $('#btnDescargarDesdePreview').on('click', function() {
        descargarExcelConAlerta();
    });

    // Función reutilizable para descargar Excel con alerta
    function descargarExcelConAlerta() {
        Swal.fire({
            title: 'Generando Excel...',
            text: 'Por favor espera mientras se genera el archivo.',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        // Obtener datos del formulario
        let formData = $('#formGenerarExcel').serialize();

        // Usar AJAX para descargar el archivo
        $.ajax({
            url: '../php/generarExcel.php',
            type: 'POST',
            data: formData,
            xhrFields: {
                responseType: 'blob'
            },
            success: function(data, status, xhr) {
                // Crear enlace de descarga
                let blob = new Blob([data], { type: xhr.getResponseHeader('Content-Type') });
                let link = document.createElement('a');
                let url = window.URL.createObjectURL(blob);
                link.href = url;

                // Obtener nombre del archivo del header
                let contentDisposition = xhr.getResponseHeader('Content-Disposition');
                let filename = 'Lista_Asistencia.xlsx';
                if (contentDisposition) {
                    let filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }

                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                Swal.close();
                Swal.fire({
                    icon: 'success',
                    title: 'Excel generado',
                    text: 'El archivo se ha descargado correctamente.',
                    confirmButtonColor: '#22c55e',
                    timer: 2000,
                    timerProgressBar: true
                });
            },
            error: function() {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al generar el Excel. Inténtalo nuevamente.',
                    confirmButtonColor: '#22c55e'
                });
            }
        });
    }

    // Validación al enviar el formulario
    $('#formGenerarExcel').on('submit', function(e) {
        let diasSeleccionados = $('.check-dia:checked').length;
        if (diasSeleccionados === 0) {
            e.preventDefault();
            Swal.fire({
                icon: 'warning',
                title: 'Selecciona los días',
                text: 'Debes marcar al menos un día de la semana para incluir en la plantilla.',
                confirmButtonColor: '#22c55e'
            });
            return false;
        }

        // Cerrar modales tras iniciar la descarga
        setTimeout(() => {
            $('#modalConfigExcel').modal('hide');
            $('#modalPreviewExcel').modal('hide');
        }, 500);
    });

    // Control de zoom en la vista previa
    $(document).off('click', '.btn-zoom').on('click', '.btn-zoom', function() {
        $('.btn-zoom').removeClass('active');
        $(this).addClass('active');
        let zoomLevel = parseFloat($(this).data('zoom'));
        $('#excelPreviewSheet').css({
            'transform': `scale(${zoomLevel})`,
            'transform-origin': 'top center'
        });
    });
}

/**
 * Renderiza la tabla de vista previa con diseño idéntico al Excel
 */
function renderizarVistaPreviaExcel() {
    // Resetear zoom a 100%
    $('.btn-zoom').removeClass('active');
    $('.btn-zoom[data-zoom="1"]').addClass('active');
    $('#excelPreviewSheet').css('transform', 'scale(1)');

    // 1. Obtener empleados seleccionados
    let rawIds = $('#hiddenEmpleadosIds').val() || '[]';
    let ids = [];
    try {
        ids = JSON.parse(rawIds);
    } catch (e) {
        ids = [];
    }

    let idSet = new Set(ids.map(String));
    let empleadosLista = todosLosEmpleados.filter(emp => idSet.has(String(emp.id_empleado)));

    // Ordenar por Apellido Paterno, Materno y Nombre (idéntico a la consulta SQL del PHP)
    empleadosLista.sort((a, b) => {
        let apA = (a.ap_paterno || '').localeCompare(b.ap_paterno || '', 'es', { sensitivity: 'base' });
        if (apA !== 0) return apA;
        let amA = (a.ap_materno || '').localeCompare(b.ap_materno || '', 'es', { sensitivity: 'base' });
        if (amA !== 0) return amA;
        return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
    });

    // 2. Obtener parámetros del formulario
    let departamento = $('#cfgDepartamento').val().trim() || 'departamento';
    let empresa = $('#cfgEmpresa').val().trim() || 'CITRICOS SAAO';
    let textoSemana = $('#cfgTextoSemana').val().trim() || 'SEMANA';
    let numSemanaRaw = $('#cfgNumSemana').val().trim();
    let numSemana = numSemanaRaw !== '' ? (numSemanaRaw.toUpperCase().includes('SEM') ? numSemanaRaw.toUpperCase() : 'SEM ' + numSemanaRaw) : 'SEM';

    let dias = [];
    $('.check-dia:checked').each(function() {
        dias.push($(this).val());
    });

    let numDias = dias.length;
    let totalColsPorDias = numDias * 4;

    $('#previewSubtitle').text(`${textoSemana} · ${numSemana} · ${empleadosLista.length} Empleado(s)`);

    // Determinar ancho de columna de nombre según cantidad de días
    let anchoNombre = 'min-width: 220px;';
    let anchoColDia = 'width: 55px;';
    let anchoColComida = 'width: 38px;';

    if (numDias === 1) {
        anchoNombre = 'min-width: 150px; max-width: 200px;';
        anchoColDia = 'width: 80px;';
        anchoColComida = 'width: 55px;';
    } else if (numDias === 2) {
        anchoNombre = 'min-width: 180px; max-width: 220px;';
        anchoColDia = 'width: 65px;';
        anchoColComida = 'width: 45px;';
    }

    // 3. Construir la Fila 1 (Encabezados Superiores)
    let colspanSemana = 1;
    let colspanEmpresa = 1;

    if (numDias === 1) {
        colspanSemana = 3;
        colspanEmpresa = 1;
    } else if (numDias === 2) {
        colspanSemana = 6;
        colspanEmpresa = 2;
    } else {
        colspanSemana = Math.max(1, totalColsPorDias - 2);
        colspanEmpresa = 2;
    }

    let html = `
    <table class="table-excel-preview">
        <thead>
            <!-- FILA 1: Departamento, Semana, Empresa, SEM -->
            <tr style="height: 28px;">
                <td colspan="2" class="excel-header-dept">${departamento}</td>
                <td colspan="${colspanSemana}" class="excel-header-semana">${textoSemana.toUpperCase()}</td>
                <td colspan="${colspanEmpresa}" class="excel-header-empresa">${empresa.toUpperCase()}</td>
                <td class="excel-header-sem">${numSemana.toUpperCase()}</td>
            </tr>

            <!-- FILA 2: NOMBRE, DÍAS (LUNES, MARTES...), DIAS SIN GAFET -->
            <tr style="height: 22px;">
                <th rowspan="3" class="excel-no-border" style="width: 36px; border: none !important;"></th>
                <th rowspan="3" class="excel-bg-yellow excel-border-black" style="${anchoNombre} text-align: center; font-weight: bold; font-size: 11px;">NOMBRE</th>
    `;

    // Encabezados de días (Fila 2)
    dias.forEach(dia => {
        html += `<th colspan="4" class="excel-bg-yellow excel-border-black excel-header-dia">${dia.toUpperCase()}</th>`;
    });

    html += `
                <th rowspan="3" class="excel-bg-yellow excel-border-black" style="width: 70px; font-size: 9px; font-weight: bold; line-height: 1.15; text-align: center;">DIAS SIN<br>GAFET</th>
            </tr>

            <!-- FILA 3: SUBENCABEZADO COMIDA (Col A y B ya cubiertas por rowspan=3) -->
            <tr style="height: 19px;">
    `;

    dias.forEach(() => {
        html += `
            <th class="excel-bg-yellow excel-border-black" style="${anchoColDia}"></th>
            <th colspan="2" class="excel-bg-yellow excel-border-black excel-sub-header">COMIDA</th>
            <th class="excel-bg-yellow excel-border-black" style="${anchoColDia}"></th>
        `;
    });

    html += `
            </tr>

            <!-- FILA 4: ENTRADA | Sale | Entra | SALIDA -->
            <tr style="height: 20px;">
    `;

    dias.forEach(() => {
        html += `
            <th class="excel-bg-yellow excel-border-black excel-sub-header" style="font-weight: bold; ${anchoColDia}">ENTRADA</th>
            <th class="excel-border-black excel-sub-header" style="background: #ffffff; font-weight: normal; ${anchoColComida}">Sale</th>
            <th class="excel-border-black excel-sub-header" style="background: #ffffff; font-weight: normal; ${anchoColComida}">Entra</th>
            <th class="excel-bg-yellow excel-border-black excel-sub-header" style="font-weight: bold; ${anchoColDia}">SALIDA</th>
        `;
    });

    html += `
            </tr>
        </thead>
        <tbody>
    `;

    // 4. Filas de Empleados seleccionados
    empleadosLista.forEach((emp, index) => {
        let num = index + 1;
        let nombreCompleto = `${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}`.trim().toUpperCase();

        // Determinar color de fondo según sexo
        let colorFondo = '';
        if (emp.sexo === 'M') {
            colorFondo = 'background-color: #D6EAF8;'; // Azul claro para varones
        } else if (emp.sexo === 'F') {
            colorFondo = 'background-color: #F5B7B1;'; // Rosa claro para mujeres
        }

        html += `
            <tr class="excel-row-emp" style="${colorFondo}">
                <td class="excel-num-cell excel-border-black" style="${colorFondo}">${num}</td>
                <td class="excel-name-cell excel-border-black" style="${colorFondo}">${nombreCompleto}</td>
        `;

        // Celdas vacías por cada día
        dias.forEach(() => {
            html += `
                <td class="excel-border-black" style="${colorFondo}"></td>
                <td class="excel-border-black" style="${colorFondo}"></td>
                <td class="excel-border-black" style="${colorFondo}"></td>
                <td class="excel-border-black" style="${colorFondo}"></td>
            `;
        });

        // Celda DIAS SIN GAFET
        html += `
                <td class="excel-border-black" style="${colorFondo}"></td>
            </tr>
        `;
    });

    // Rellenar filas vacías adicionales si hay pocos empleados para que la hoja luzca como una página completa
    let filasMinimas = Math.max(empleadosLista.length, 12);
    for (let i = empleadosLista.length; i < filasMinimas; i++) {
        let num = i + 1;
        html += `
            <tr class="excel-row-emp">
                <td class="excel-num-cell excel-border-black text-muted" style="opacity: 0.4;">${num}</td>
                <td class="excel-name-cell excel-border-black"></td>
        `;

        dias.forEach(() => {
            html += `
                <td class="excel-border-black"></td>
                <td class="excel-border-black"></td>
                <td class="excel-border-black"></td>
                <td class="excel-border-black"></td>
            `;
        });

        html += `
                <td class="excel-border-black"></td>
            </tr>
        `;
    }

    html += `
        </tbody>
    </table>
    `;

    $('#previewTableContainer').html(html);
}

/**
 * Marca los checkboxes de los días indicados
 */
function establecerDiasSeleccionados(dias) {
    $('.check-dia').each(function() {
        let val = $(this).val();
        $(this).prop('checked', dias.includes(val));
    });
}

/**
 * Calcula y actualiza el texto de la semana (ej: SEMANA DEL 05 AL 11 DE SEPTIEMBRE DEL 2026) y el número
 */
function actualizarTextoSemanaYNumero() {
    let fInicioVal = $('#cfgFechaInicio').val();
    let fFinVal = $('#cfgFechaFin').val();

    if (!fInicioVal) return;

    let meses = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];

    let partesInicio = fInicioVal.split('-');
    let diaIni = partesInicio[2];
    let mesIni = parseInt(partesInicio[1], 10) - 1;
    let anioIni = partesInicio[0];

    let texto = '';
    if (fFinVal) {
        let partesFin = fFinVal.split('-');
        let diaFin = partesFin[2];
        let mesFin = parseInt(partesFin[1], 10) - 1;
        let anioFin = partesFin[0];

        if (mesIni === mesFin && anioIni === anioFin) {
            texto = `SEMANA DEL ${diaIni} AL ${diaFin} DE ${meses[mesIni]} DEL ${anioIni}`;
        } else if (anioIni === anioFin) {
            texto = `SEMANA DEL ${diaIni} DE ${meses[mesIni]} AL ${diaFin} DE ${meses[mesFin]} DEL ${anioIni}`;
        } else {
            texto = `SEMANA DEL ${diaIni} DE ${meses[mesIni]} DEL ${anioIni} AL ${diaFin} DE ${meses[mesFin]} DEL ${anioFin}`;
        }
    } else {
        texto = `SEMANA DEL ${diaIni} DE ${meses[mesIni]} DEL ${anioIni}`;
    }

    $('#cfgTextoSemana').val(texto);
}

