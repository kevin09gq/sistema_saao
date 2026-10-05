let todosLosEmpleados = [];
let empleadosFiltrados = [];
let empleadosSeleccionados = new Set(); // IDs de empleados seleccionados
let paginaActual = 1;
const filasPorPagina = 10;

// Multi-selección de departamentos en el filtro principal
let filtroDeptoIds = []; // Array de IDs seleccionados
let mapaDepartamentos = {}; // Mapa id_departamento -> nombre_departamento

// Colores por sexo (se cargan desde la BD)
let colorSexo = { M: '#D6EAF8', F: '#F5B7B1' };

$(document).ready(function () {
    obtenerAreas();
    obtenerEmpleados();
    obtenerColoresConfig();
    inicializarEventosFiltrado();
    inicializarEventosColores();
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
// OBTIENE LOS DEPARTAMENTOS LIGADOS AL ÁREA SELECCIONADA
//==============================
function obtenerDepartamentos(idArea = '') {
    let $opts = $('#optionsFilterDeptos');

    if (!idArea) {
        $opts.html('<div class="text-muted text-center py-2 multicheck-empty" style="font-size:0.8rem;">Selecciona un área primero</div>');
        mapaDepartamentos = {};
        return;
    }

    $.post('../php/filtrado.php', { action: 'obtenerDepartamentos', id_area: idArea }, function (departamentos) {
        $opts.empty();
        mapaDepartamentos = {};

        if (!departamentos || departamentos.length === 0) {
            $opts.html('<div class="text-muted text-center py-2 multicheck-empty" style="font-size:0.8rem;">Sin departamentos en esta área</div>');
            return;
        }

        // Opción para seleccionar "Todos los Departamentos"
        let $todosOpt = $(`
            <div class="multicheck-option multicheck-all ${filtroDeptoIds.length === 0 ? 'checked' : ''}" data-id="">
                <span class="mc-label fw-semibold text-secondary"><i class="bi bi-grid-fill me-1" style="font-size:0.75rem;"></i>Todos los Departamentos</span>
            </div>
        `);
        $opts.append($todosOpt);

        $.each(departamentos, function (i, depto) {
            let id = String(depto.id_departamento);
            let nombre = depto.nombre_departamento;
            mapaDepartamentos[id] = nombre;

            let isChecked = filtroDeptoIds.includes(id);

            let $opt = $(`
                <div class="multicheck-option ${isChecked ? 'checked' : ''}" data-id="${id}" data-nombre="${nombre}">
                    <div class="mc-check-wrapper">
                        <input type="checkbox" class="mc-checkbox" id="fmc_d_${id}" value="${id}" ${isChecked ? 'checked' : ''}>
                    </div>
                    <span class="mc-label text-truncate">${nombre}</span>
                </div>
            `);
            $opts.append($opt);
        });
    }, 'json');
}

//==============================
// ACTUALIZA EL TEXTO Y BADGE DEL BOTÓN DE DEPARTAMENTO
//==============================
function actualizarLabelFilterDeptos() {
    let $label = $('#labelFilterDeptos');
    let $badge = $('#badgeCountDeptos');

    if (filtroDeptoIds.length === 0) {
        $label.text('Todos los Departamentos');
        $badge.addClass('d-none').text('0');
    } else if (filtroDeptoIds.length === 1) {
        let id = filtroDeptoIds[0];
        let nombre = mapaDepartamentos[id] || $(`#optionsFilterDeptos .multicheck-option[data-id="${id}"]`).data('nombre') || '1 depto.';
        $label.text(nombre);
        $badge.addClass('d-none').text('1');
    } else {
        $label.text(`${filtroDeptoIds.length} departamentos`);
        $badge.removeClass('d-none').text(filtroDeptoIds.length);
    }
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
// APLICA LOS FILTROS DE BÚSQUEDA, ÁREA, DEPARTAMENTO, IMSS Y SEXO
//==============================
function aplicarFiltros() {
    let textoBusqueda = $('#inputBusqueda').val().toLowerCase();
    let idArea = $('#selectArea').val();
    let statusIMSS = $('#selectIMSS').val();
    let sexo = $('#selectSexo').val();

    empleadosFiltrados = todosLosEmpleados.filter(empleado => {
        let nombreCompleto = `${empleado.nombre} ${empleado.ap_paterno} ${empleado.ap_materno}`.toLowerCase();

        let coincideTexto = nombreCompleto.includes(textoBusqueda) ||
            empleado.clave_empleado.toLowerCase().includes(textoBusqueda);

        let coincideArea = (idArea === "" || empleado.id_area == idArea);

        // Si no hay departamentos seleccionados, entran todos.
        // Si hay 1 o más seleccionados, el empleado debe pertenecer a alguno de ellos.
        let coincideDepto = (filtroDeptoIds.length === 0 || filtroDeptoIds.includes(String(empleado.id_departamento)));

        let coincideIMSS = (statusIMSS === "" || empleado.status_nss == statusIMSS);
        let coincideSexo = (sexo === "" || empleado.sexo == sexo);

        return coincideTexto && coincideArea && coincideDepto && coincideIMSS && coincideSexo;
    });

    // Limpiar selección de empleados que ya no están en el filtro actual
    let idsFiltrados = new Set(empleadosFiltrados.map(emp => String(emp.id_empleado)));
    for (let id of empleadosSeleccionados) {
        if (!idsFiltrados.has(id)) {
            empleadosSeleccionados.delete(id);
        }
    }

    paginarEmpleados(1);
}

//==============================
// INICIALIZA LOS EVENTOS DE LOS FILTROS Y BOTONES
//==============================
function inicializarEventosFiltrado() {
    // Eventos para filtros en tiempo real
    $('#inputBusqueda').on('input keyup', function () {
        let val = $(this).val().trim();
        if (val.length > 0) {
            $('#btnClearSearch').removeClass('d-none');
        } else {
            $('#btnClearSearch').addClass('d-none');
        }
        aplicarFiltros();
    });

    // Botón X interno para limpiar el campo de búsqueda
    $('#btnClearSearch').on('click', function () {
        $('#inputBusqueda').val('').focus();
        $(this).addClass('d-none');
        aplicarFiltros();
    });

    // Cambio de área: controla estado del departamento y resetea selección sincronizadamente
    $('#selectArea').on('change', function () {
        let idArea = $(this).val();

        // 1. Resetear selección de departamentos sincrónicamente para evitar desfases de filtro
        filtroDeptoIds = [];
        actualizarLabelFilterDeptos();

        if (idArea === "") {
            // Bloqueado si no hay área seleccionada
            $('#toggleFilterDeptos').prop('disabled', true);
            $('#filterDropdownDeptos').removeClass('open');
            $('#optionsFilterDeptos').html('<div class="text-muted text-center py-2 multicheck-empty" style="font-size:0.8rem;">Selecciona un área primero</div>');
        } else {
            // Desbloqueado cuando se elige un área
            $('#toggleFilterDeptos').prop('disabled', false);
            obtenerDepartamentos(idArea);
        }

        // 2. Aplicar filtros inmediatamente: al estar filtroDeptoIds vacío muestra todos los de la nueva área
        aplicarFiltros();
    });

    // Abrir/cerrar dropdown de departamentos
    $('#toggleFilterDeptos').on('click', function (e) {
        e.stopPropagation();
        if ($(this).prop('disabled')) return;
        $('#filterDropdownDeptos').toggleClass('open');
        if ($('#filterDropdownDeptos').hasClass('open')) {
            $('#searchFilterDeptos').val('').trigger('input').focus();
        }
    });

    // Cerrar menú al hacer click afuera
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#filterDropdownDeptos').length) {
            $('#filterDropdownDeptos').removeClass('open');
        }
    });

    // Buscador dentro del dropdown de departamentos
    $('#searchFilterDeptos').on('input', function () {
        let q = $(this).val().toLowerCase().trim();
        $('#optionsFilterDeptos .multicheck-option:not(.multicheck-all)').each(function () {
            let txt = $(this).find('.mc-label').text().toLowerCase();
            $(this).toggle(txt.includes(q));
        });
    });

    // 1. CLICK DIRECTO EN EL CUADRITO DEL CHECKBOX:
    // Permite seleccionar dos o más departamentos sumándolos al filtro
    $('#optionsFilterDeptos').on('click', '.mc-checkbox', function (e) {
        e.stopPropagation(); // NO activar el click de la fila para no cambiar a selección única
        let id = String($(this).val());
        let isChecked = $(this).is(':checked');

        if (isChecked) {
            if (!filtroDeptoIds.includes(id)) {
                filtroDeptoIds.push(id);
            }
        } else {
            filtroDeptoIds = filtroDeptoIds.filter(item => item !== id);
        }

        $(this).closest('.multicheck-option').toggleClass('checked', isChecked);
        actualizarLabelFilterDeptos();
        aplicarFiltros();
    });

    // 2. CLICK EN LA FILA / TEXTO DEL DEPARTAMENTO (fuera del cuadrito):
    // Permite ir cambiando de departamento como un select normal (selección única)
    $('#optionsFilterDeptos').on('click', '.multicheck-option:not(.multicheck-all)', function (e) {
        // Si el click fue en el checkbox o en su envoltorio, salir
        if ($(e.target).is('.mc-checkbox') || $(e.target).closest('.mc-check-wrapper').length) {
            return;
        }

        let id = String($(this).data('id'));

        // Desmarcar todos y marcar exclusivamente este departamento
        $('#optionsFilterDeptos .mc-checkbox').prop('checked', false);
        $('#optionsFilterDeptos .multicheck-option').removeClass('checked');

        let $chk = $(this).find('.mc-checkbox');
        $chk.prop('checked', true);
        $(this).addClass('checked');

        filtroDeptoIds = [id];
        actualizarLabelFilterDeptos();
        aplicarFiltros();

        // Cierra el menú al elegir el departamento por texto
        $('#filterDropdownDeptos').removeClass('open');
    });

    // 3. CLICK EN "TODOS LOS DEPARTAMENTOS":
    $('#optionsFilterDeptos').on('click', '.multicheck-all', function () {
        $('#optionsFilterDeptos .mc-checkbox').prop('checked', false);
        $('#optionsFilterDeptos .multicheck-option').removeClass('checked');
        filtroDeptoIds = [];
        actualizarLabelFilterDeptos();
        aplicarFiltros();
        $('#filterDropdownDeptos').removeClass('open');
    });

    $('#selectIMSS').on('change', aplicarFiltros);
    $('#selectSexo').on('change', aplicarFiltros);

    // Botón para limpiar filtros
    $('#btnLimpiar').on('click', function () {
        $('#inputBusqueda').val('');
        $('#btnClearSearch').addClass('d-none');
        $('#selectArea').val('');
        filtroDeptoIds = [];
        actualizarLabelFilterDeptos();
        $('#toggleFilterDeptos').prop('disabled', true);
        $('#filterDropdownDeptos').removeClass('open');
        $('#optionsFilterDeptos').html('<div class="text-muted text-center py-2 multicheck-empty" style="font-size:0.8rem;">Selecciona un área primero</div>');
        $('#selectIMSS').val('');
        $('#selectSexo').val('');
        aplicarFiltros();
    });

    // Checkbox principal "seleccionar todos" de los empleados filtrados
    $(document).on('change', '#checkAll', function () {
        let isChecked = $(this).is(':checked');

        if (isChecked) {
            // Seleccionar todos los empleados filtrados
            empleadosFiltrados.forEach(emp => {
                empleadosSeleccionados.add(String(emp.id_empleado));
            });
        } else {
            // Deseleccionar todos los empleados filtrados (eliminar solo los que están en el filtro actual)
            empleadosFiltrados.forEach(emp => {
                empleadosSeleccionados.delete(String(emp.id_empleado));
            });
        }

        // Redibujar la tabla para actualizar checkboxes
        let inicio = (paginaActual - 1) * filasPorPagina;
        let fin = inicio + filasPorPagina;
        cargarDatos(empleadosFiltrados.slice(inicio, fin), inicio);
    });

    // Checkbox individual de empleado
    $(document).on('change', '.check-empleado', function () {
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
    $(document).on('click', '#tbodyAsistencia tr td:not(:first-child)', function () {
        let $checkbox = $(this).closest('tr').find('.check-empleado');
        $checkbox.prop('checked', !$checkbox.is(':checked')).trigger('change');
    });

    // Botón Generar Excel: Generar Excel con los empleados seleccionados o filtrados
    $('#btnGenerarExcel').on('click', function () {
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

    // 2. Pre-llenar departamento en la configuración:
    // Si es un solo departamento se coloca su nombre, si son dos o más se coloca simplemente 'departamento'
    if (filtroDeptoIds.length === 1) {
        let id = filtroDeptoIds[0];
        let nombre = mapaDepartamentos[id] || $(`#optionsFilterDeptos .multicheck-option[data-id="${id}"]`).data('nombre') || '';
        $('#cfgDepartamento').val(nombre || 'departamento');
    } else {
        // Dos o más departamentos (o ninguno)
        $('#cfgDepartamento').val('departamento');
    }

    // 3. Generar días dinámicos si hay fechas seleccionadas
    generarDiasDinamicos();
}

/**
 * Inicializa los eventos del formulario y presets del modal
 */
function inicializarEventosModalExcel() {
    // Escuchar cambios de fecha para actualizar automáticamente el texto de la semana y generar días
    $('#cfgFechaInicio, #cfgFechaFin').on('change', function () {
        actualizarTextoSemanaYNumero();
        generarDiasDinamicos();
    });

    // Presets rápidos para días (se inicializan dinámicamente cuando se generan los días)
    // Los eventos se asignan en la función actualizarPresetsDinamicos

    // Botón Previsualizar Plantilla
    $('#btnPrevisualizarExcel').on('click', function () {
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

        // Agregar las fechas de los días seleccionados al campo oculto
        agregarFechasDiasSeleccionados();

        renderizarVistaPreviaExcel();
        $('#modalConfigExcel').modal('hide');
        setTimeout(() => {
            $('#modalPreviewExcel').modal('show');
        }, 300);
    });

    // Botón Descargar Excel desde la configuración
    $('#btnDescargarExcelConfig').on('click', function () {
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

        // Agregar las fechas de los días seleccionados al campo oculto
        agregarFechasDiasSeleccionados();

        descargarExcelConAlerta();
    });

    // Botón Volver a Configurar desde la vista previa
    $('#btnVolverConfig').on('click', function () {
        $('#modalPreviewExcel').modal('hide');
        setTimeout(() => {
            $('#modalConfigExcel').modal('show');
        }, 300);
    });

    // Botón Descargar Excel desde la vista previa
    $('#btnDescargarDesdePreview').on('click', function () {
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
            success: function (data, status, xhr) {
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
            error: function () {
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
    $('#formGenerarExcel').on('submit', function (e) {
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
    $(document).off('click', '.btn-zoom').on('click', '.btn-zoom', function () {
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

    // Ordenar alfabéticamente de la A a la Z por nombre completo
    empleadosLista.sort((a, b) => {
        let nombreCompletoA = `${a.nombre} ${a.ap_paterno} ${a.ap_materno}`.trim();
        let nombreCompletoB = `${b.nombre} ${b.ap_paterno} ${b.ap_materno}`.trim();
        return nombreCompletoA.localeCompare(nombreCompletoB, 'es', { sensitivity: 'base' });
    });

    // 2. Obtener parámetros del formulario
    let departamento = $('#cfgDepartamento').val().trim() || 'departamento';
    let empresa = $('#cfgEmpresa').val().trim() || 'CITRICOS SAAO';
    let textoSemana = $('#cfgTextoSemana').val().trim() || 'SEMANA';
    let numSemanaRaw = $('#cfgNumSemana').val().trim();
    let numSemana = numSemanaRaw !== '' ? (numSemanaRaw.toUpperCase().includes('SEM') ? numSemanaRaw.toUpperCase() : 'SEM ' + numSemanaRaw) : 'SEM';

    let dias = [];
    let diasConFechas = [];
    $('.check-dia:checked').each(function () {
        let diaValor = $(this).val();
        let fechaCompleta = $(this).data('fecha');
        dias.push(diaValor);
        diasConFechas.push({
            dia: diaValor,
            fecha: fechaCompleta
        });
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
    diasConFechas.forEach(diaInfo => {
        let nombreDia = diaInfo.dia;
        html += `<th colspan="4" class="excel-bg-yellow excel-border-black excel-header-dia">${nombreDia.toUpperCase()}</th>`;
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

        // Determinar color de fondo según sexo (desde configuración de BD)
        let colorFondo = '';
        if (emp.sexo === 'M') {
            colorFondo = `background-color: ${colorSexo.M};`;
        } else if (emp.sexo === 'F') {
            colorFondo = `background-color: ${colorSexo.F};`;
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
    $('.check-dia').each(function () {
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

/**
 * Genera los días dinámicamente según el rango de fechas seleccionado
 */
function generarDiasDinamicos() {
    let fInicioVal = $('#cfgFechaInicio').val();
    let fFinVal = $('#cfgFechaFin').val();

    if (!fInicioVal || !fFinVal) {
        $('#contenedorDias').html('<div class="text-muted small w-100 text-center">Selecciona las fechas para ver los días disponibles</div>');
        return;
    }

    // Parsear fechas correctamente para evitar problemas de zona horaria
    let partesInicio = fInicioVal.split('-');
    let partesFin = fFinVal.split('-');

    let fechaInicio = new Date(parseInt(partesInicio[0]), parseInt(partesInicio[1]) - 1, parseInt(partesInicio[2]));
    let fechaFin = new Date(parseInt(partesFin[0]), parseInt(partesFin[1]) - 1, parseInt(partesFin[2]));

    if (fechaInicio > fechaFin) {
        $('#contenedorDias').html('<div class="text-danger small w-100 text-center">La fecha de inicio debe ser anterior a la fecha fin</div>');
        return;
    }

    let diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    let diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let diasDisponibles = [];

    let fechaActual = new Date(fechaInicio);
    while (fechaActual <= fechaFin) {
        let diaSemana = fechaActual.getDay();
        let nombreDia = diasSemana[diaSemana];
        let nombreCorto = diasNombres[diaSemana];
        let fechaFormateada = fechaActual.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

        // Generar fecha completa sin problemas de zona horaria
        let year = fechaActual.getFullYear();
        let month = String(fechaActual.getMonth() + 1).padStart(2, '0');
        let day = String(fechaActual.getDate()).padStart(2, '0');
        let fechaCompleta = `${year}-${month}-${day}`;

        diasDisponibles.push({
            valor: nombreDia,
            nombre: nombreCorto,
            fecha: fechaFormateada,
            fechaCompleta: fechaCompleta
        });

        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    if (diasDisponibles.length === 0) {
        $('#contenedorDias').html('<div class="text-muted small w-100 text-center">No hay días en el rango seleccionado</div>');
        return;
    }

    let html = '';
    diasDisponibles.forEach((dia, index) => {
        html += `
            <div class="form-check">
                <input class="form-check-input check-dia" type="checkbox" name="dias[]" value="${dia.valor}" data-fecha="${dia.fechaCompleta}" id="dia${index}" checked>
                <label class="form-check-label fw-medium" for="dia${index}">
                    ${dia.nombre} <small class="text-muted">(${dia.fecha})</small>
                </label>
            </div>
        `;
    });

    $('#contenedorDias').html(html);

    // Guardar los días disponibles con sus fechas para usar en el PHP
    window.diasDisponiblesInfo = diasDisponibles;

    // Actualizar los botones de preset para que funcionen con los días disponibles
    actualizarPresetsDinamicos(diasDisponibles);
}

/**
 * Actualiza los botones de preset para que funcionen con los días disponibles dinámicamente
 */
function actualizarPresetsDinamicos(diasDisponibles) {
    // Mapeo de días disponibles a sus valores
    let diasMap = {};
    diasDisponibles.forEach(dia => {
        diasMap[dia.valor] = true;
    });

    // Actualizar preset Vie-Dom
    $('#btnPresetVieDom').off('click').on('click', function () {
        let diasSeleccionar = diasDisponibles
            .filter(d => ['VIERNES', 'SABADO', 'DOMINGO'].includes(d.valor))
            .map(d => d.valor);
        establecerDiasSeleccionados(diasSeleccionar);
    });

    // Actualizar preset Lun-Vie
    $('#btnPresetLunVie').off('click').on('click', function () {
        let diasSeleccionar = diasDisponibles
            .filter(d => ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'].includes(d.valor))
            .map(d => d.valor);
        establecerDiasSeleccionados(diasSeleccionar);
    });

    // Actualizar preset Lun-Sab
    $('#btnPresetLunSab').off('click').on('click', function () {
        let diasSeleccionar = diasDisponibles
            .filter(d => ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'].includes(d.valor))
            .map(d => d.valor);
        establecerDiasSeleccionados(diasSeleccionar);
    });

    // Actualizar preset Todos
    $('#btnPresetTodos').off('click').on('click', function () {
        let diasSeleccionar = diasDisponibles.map(d => d.valor);
        establecerDiasSeleccionados(diasSeleccionar);
    });
}

/**
 * Agrega las fechas de los días seleccionados al campo oculto para enviar al PHP
 */
function agregarFechasDiasSeleccionados() {
    let diasFechas = [];
    $('.check-dia:checked').each(function () {
        let diaValor = $(this).val();
        let fechaCompleta = $(this).data('fecha');
        diasFechas.push({
            dia: diaValor,
            fecha: fechaCompleta
        });
    });
    $('#hiddenDiasFechas').val(JSON.stringify(diasFechas));
}

//==============================
// CARGA LOS COLORES CONFIGURADOS DESDE LA BASE DE DATOS
//==============================
function obtenerColoresConfig() {
    $.post('../php/colores.php', { action: 'obtenerColores' }, function (resp) {
        if (resp.success && resp.colores) {
            colorSexo.M = resp.colores.M || '#D6EAF8';
            colorSexo.F = resp.colores.F || '#F5B7B1';
        }
    }, 'json');
}

//==============================
// INICIALIZA LOS EVENTOS DEL MODAL DE CONFIGURACIÓN DE COLORES
//==============================
function inicializarEventosColores() {

    // Abrir modal
    $('#btnAbrirConfigColores').on('click', function () {
        // Pre-cargar los colores actuales en los pickers e inputs hex
        $('#colorPickerM').val(colorSexo.M);
        $('#colorPickerF').val(colorSexo.F);
        $('#hexInputM').val(colorSexo.M.toUpperCase());
        $('#hexInputF').val(colorSexo.F.toUpperCase());
        actualizarPreviaColores();
        $('#modalConfigColores').modal('show');
    });

    // Sincronizar picker → hex input y previa (M)
    $(document).on('input change', '#colorPickerM', function () {
        let hex = $(this).val().toUpperCase();
        $('#hexInputM').val(hex);
        $('#prevRowM').css('background-color', hex);
    });

    // Sincronizar hex input → picker y previa (M)
    $(document).on('input', '#hexInputM', function () {
        let val = $(this).val().trim();
        if (!/^#/.test(val)) val = '#' + val;
        $(this).val(val.toUpperCase());
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            $('#colorPickerM').val(val);
            $('#prevRowM').css('background-color', val);
        }
    });

    // Sincronizar picker → hex input y previa (F)
    $(document).on('input change', '#colorPickerF', function () {
        let hex = $(this).val().toUpperCase();
        $('#hexInputF').val(hex);
        $('#prevRowF').css('background-color', hex);
    });

    // Sincronizar hex input → picker y previa (F)
    $(document).on('input', '#hexInputF', function () {
        let val = $(this).val().trim();
        if (!/^#/.test(val)) val = '#' + val;
        $(this).val(val.toUpperCase());
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            $('#colorPickerF').val(val);
            $('#prevRowF').css('background-color', val);
        }
    });

    // Guardar colores
    $('#btnGuardarColores').on('click', function () {
        let colorM = $('#colorPickerM').val();
        let colorF = $('#colorPickerF').val();

        $(this).prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-1"></span> Guardando...');

        $.post('../php/colores.php', {
            action: 'guardarColores',
            color_M: colorM,
            color_F: colorF
        }, function (resp) {
            $('#btnGuardarColores').prop('disabled', false).html('<i class="bi bi-check-lg"></i> Guardar colores');

            if (resp.success) {
                // Actualizar variable global
                colorSexo.M = colorM;
                colorSexo.F = colorF;

                $('#modalConfigColores').modal('hide');
                Swal.fire({
                    icon: 'success',
                    title: 'Colores actualizados',
                    text: 'Los colores se aplicarán en la siguiente vista previa y descarga de Excel.',
                    confirmButtonColor: '#6366f1',
                    timer: 2500,
                    timerProgressBar: true
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: resp.message || 'No se pudieron guardar los colores.',
                    confirmButtonColor: '#6366f1'
                });
            }
        }, 'json');
    });
}

// Aplica los colores actuales a la vista previa del modal de colores
function actualizarPreviaColores() {
    $('#prevRowM').css('background-color', colorSexo.M);
    $('#prevRowF').css('background-color', colorSexo.F);
}
