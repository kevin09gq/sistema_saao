// Constantes y variables globales
const RUTA_RAIZ = window.rutaRaiz || '/sistema_saao';

// Modales
const modal_detalles_aguinaldo = new bootstrap.Modal(document.getElementById('modal_detalles_aguinaldo'));

// Inicialización del módulo
$(document).ready(function () {
    init();

    aplicarPermisosGenerarAguinaldo(); // Aplicar permisos para el botón de generar aguinaldo
    aplicarPermisosEliminarAguinaldo(); // Aplicar permisos para los botones de eliminar aguinaldo
});


/**
 * Función para llenar la tabla de aguinaldos con datos del servidor
 */
function obtener_aguinaldos_historial() {
    // Obtener los valores seleccionados en los filtros
    let busqueda = $("#busqueda").val();
    let anioSeleccionado = $("#filtro_anio").val();
    let areaSeleccionada = $("#filtro_area").val();
    let departamentoSeleccionado = $("#filtro_departamento").val();
    let limite = $("#filtro_limite").val() || 20;
    let paginaActual = parseInt($("#pagina_actual").data("pagina")) || 1;


    $.ajax({
        type: "POST",
        url: RUTA_RAIZ + "/aguinaldo/php/aguinaldo.php",
        data: {
            accion: "obtener_aguinaldos",
            busqueda: busqueda,
            anio: anioSeleccionado,
            area: areaSeleccionada,
            departamento: departamentoSeleccionado,
            limite: limite,
            pagina: paginaActual
        },
        dataType: "json",
        success: function (response) {
            // OBTENER SOLO LA DATA DE LA BASE
            let data = response.data.data;

            console.log(response.data);


            // RECORRER CADA ELEMENTO DE LA INFORMACION
            data.forEach(elemento => {

                // Obtener la lista de empleados del aguinaldo
                let empleados = elemento.jsonAguinaldo.empleados || [];

                // OBTENER EL TOTAL DE AGUINALDOS SUMANDO LOS VALORES DE CADA EMPLEADO
                // SOLO SE SUMAN LOS EMPLEADOS QUE ESTÉN MARCADOS COMO VISIBLES (visible === true)
                const totalAguinaldo = empleados
                    .filter(emp => emp.visible === true)
                    .reduce((acc, emp) => {
                        return acc + (parseFloat(emp.aguinaldo) || 0);
                    }, 0);

                // OBTENER EL TOTAL DE ISR SUMANDO LOS VALORES DE ISR DE CADA EMPLEADO
                const totalISR = empleados
                    .filter(emp => emp.visible === true)
                    .reduce((acc, emp) => {
                        return acc + (parseFloat(emp.isr) || 0);
                    }, 0);

                // OBTENER DE TARJETA
                const totalTarjeta = empleados
                    .filter(emp => emp.visible === true)
                    .reduce((acc, emp) => {
                        return acc + (parseFloat(emp.tarjeta) || 0);
                    }, 0);

                // TOTAL DEL NETO A PAGAR
                const totalNeto = empleados
                    .filter(emp => emp.visible === true)
                    .reduce((acc, emp) => {
                        return acc + (parseFloat(emp.neto_pagar_redondeado) || 0);
                    }, 0);

                // OBTENER EL TOTAL DE EMPLEADOS VISIBLES
                const totalEmpleadosVisibles = empleados
                    .filter(emp => emp.visible === true)
                    .length;

                // AGREGAR LOS TOTALES CALCULADOS AL OBJETO DEL ELEMENTO
                elemento.totalAguinaldo = totalAguinaldo;
                elemento.totalISR = totalISR;
                elemento.totalTarjeta = totalTarjeta;
                elemento.totalNeto = totalNeto;
                elemento.total_empleados_visibles = totalEmpleadosVisibles;

                // AGREGAR LOS EMPLEADOS DIRECTAMENTE EN EL OBJETO
                elemento.empleados = empleados;

                // ELIMINAR EL jsonAguinaldo PARA EVITAR CONFUSIONES
                delete elemento.jsonAguinaldo;

            });

            // LLENAR LA TABLA PRINCIPAL CON LOS DATOS FILTRADOS
            llenar_tabla_principal(data, response.data.inicio);

            // RENDERIZAR LA PAGINACION
            renderizar_paginacion_principal(response.data.total, response.data.pagina, response.data.limite);
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener los departamentos:", error);
        }
    });
}

/**
 * Función para llenar la tabla principal con los datos obtenidos
 */
function llenar_tabla_principal(data, inicio) {
    // Limpiar la tabla antes de llenarla
    $("#cuerpo_tabla_principal").empty();
    // VERIFICAR QUE LA DATA NO ESTE VACIA
    if (data.length === 0) {
        // Si no hay datos, mostrar un mensaje en la tabla
        $("#cuerpo_tabla_principal").html('<tr><td colspan="9" class="text-center">No se encontraron registros.</td></tr>');
        return;
    }

    // Recorrer los datos y agregarlos a la tabla
    data.forEach((elemento, index) => {

        const contador = (inicio || 0) + index + 1; // Ajustar el contador según el inicio de la página

        let opciones = ``;

        if (elemento.id_aguinaldo != 0) {
            opciones = `
                <div class="dropdown">
                    <button class="btn btn-sm btn-dropdown-custom" type="button" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li>
                            <button
                                data-anio="${elemento.anio}"
                                data-departamento="${elemento.nombre_departamento}"
                                data-iddepartamento="${elemento.id_departamento}"
                                data-id="${elemento.id_aguinaldo}"
                                data-empleados='${JSON.stringify(elemento.empleados)}'
                                data-fecha_creacion="${elemento.fecha_creacion}"
                                data-total="${elemento.total_empleados_visibles}"
                                class="dropdown-item btn_ver_detalles">
                                <i class="bi bi-eye me-2"></i>Ver Detalles</button>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <button
                                data-id="${elemento.id_aguinaldo}"
                                data-empleados='${JSON.stringify(elemento.empleados)}'
                                data-anio="${elemento.anio}"
                                data-iddepartamento="${elemento.id_departamento}"
                                data-departamento="${elemento.nombre_departamento}"
                                data-fecha="${elemento.fecha_creacion}"
                                class="dropdown-item btn_descargar_excel">
                                <i class="bi bi-file-earmark-excel-fill text-success me-2"></i>Descargar Excel</button>
                        </li>
                         <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <button
                                data-id="${elemento.id_aguinaldo}"
                                class="dropdown-item text-danger btn_borrar_aguinaldo">
                                <i class="bi bi-trash me-2"></i>Eliminar</button>
                        </li>
                    </ul>
                </div>
            `;
        } else {
            opciones = `<span class="text-muted">Pendiente</span>`;
        }

        const fila = `
         <tr>
            <td class="ps-4 fw-bold">${contador}</td>
            <td>${elemento.anio}</td>
            <td><span class="badge bg-primary-subtle text-primary">${elemento.nombre_departamento.toUpperCase()}</span></td>
            <td class="fw-bold text-center">${elemento.total_empleados_visibles == 0 ? '<span class="text-muted">Pendiente</span>' : elemento.total_empleados_visibles}</td>
            <td class="fw-semibold text-end">${ elemento.id_aguinaldo != 0 ? formatoMoneda(elemento.totalAguinaldo) : '<span class="text-muted">Pendiente</span>' }</td>
            <td class="text-end">${ elemento.id_aguinaldo != 0 ? formatoMoneda(elemento.totalISR) : '<span class="text-muted">Pendiente</span>' }</td>
            <td class="text-end">${ elemento.id_aguinaldo != 0 ? formatoMoneda(elemento.totalTarjeta) : '<span class="text-muted">Pendiente</span>' }</td>
            <td class="text-end">${ elemento.id_aguinaldo != 0 ? formatoMoneda(elemento.totalNeto) : '<span class="text-muted">Pendiente</span>' }</td>
            <td class="small text-center">${elemento.fecha_creacion == "Pendiente" ? '<span class="text-muted">Pendiente</span>' : formatearFecha(elemento.fecha_creacion)}</td>
            <td class="text-center">
                ${opciones}
            </td>
        </tr>
        `;

        // Agregar la fila a la tabla
        $("#cuerpo_tabla_principal").append(fila);
    });
    // Aplicar permisos después de renderizar la tabla
    aplicarPermisosEliminarAguinaldo();
}

/**
 * Renderizar los botones de paginación
 */
function renderizar_paginacion_principal(totalEmpleados, paginaActual, limite) {
    if (limite === -1) {
        $('#paginacion').empty();
        return;
    }

    const totalPaginas = Math.ceil(totalEmpleados / limite);
    const paginacion = $('#paginacion');
    paginacion.empty();

    // Botón Inicio
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPaginaPrincipal(1); return false;"><i class="bi bi-chevron-double-left me-1"></i>Inicio</a>
            </li>
        `);
    }

    // Botón anterior
    if (paginaActual > 1) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPaginaPrincipal(${paginaActual - 1}); return false;">Anterior</a>
            </li>
        `);
    }

    // Botones de páginas
    const rangoInicio = Math.max(1, paginaActual - 2);
    const rangoFin = Math.min(totalPaginas, paginaActual + 2);

    for (let i = rangoInicio; i <= rangoFin; i++) {
        const activa = i === paginaActual ? 'active' : '';
        paginacion.append(`
            <li class="page-item ${activa}">
                <a class="page-link" href="#" onclick="cambiarPaginaPrincipal(${i}); return false;">${i}</a>
            </li>
        `);
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPaginaPrincipal(${paginaActual + 1}); return false;">Siguiente</a>
            </li>
        `);
    }

    // Botón Final
    if (paginaActual < totalPaginas) {
        paginacion.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="cambiarPaginaPrincipal(${totalPaginas}); return false;">Final <i class="bi bi-chevron-double-right ms-1"></i></a>
            </li>
        `);
    }
}

/**
 * Cambiar a una página específica
 */
function cambiarPaginaPrincipal(nuevaPagina) {
    $('#pagina_actual').data('pagina', nuevaPagina);
    obtener_aguinaldos_historial();
}

// ===================================================================================================
// EVENTOS: CONTROLA LOS CAMBIOS EN LOS FILTROS PARA CAMBIAR LA TABLA PRINCIPAL
// ===================================================================================================
$(document).ready(function () {
    // Evento de búsqueda
    $('#busqueda').on('keyup', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_aguinaldos_historial();
    });

    // Evento de filtro área — carga departamentos filtrados y habilita el select
    $('#filtro_area').on('change', function () {
        const idArea = $(this).val();
        $('#pagina_actual').data('pagina', 1);

        if (!idArea) {
            // Sin área: bloquear y resetear departamento
            $('#filtro_departamento')
                .prop('disabled', true)
                .html('<option value="">-- Selecciona un área --</option>');
        } else {
            // Con área: cargar departamentos del área seleccionada
            obtener_departamentos_por_area_historial(idArea);
        }

        obtener_aguinaldos_historial();
    });

    // Evento de filtro departamento
    $('#filtro_departamento').on('change', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_aguinaldos_historial();
    });

    // Evento de filtro empresa
    $('#filtro_anio').on('change', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_aguinaldos_historial();
    });

    // Evento de límite por página
    $('#filtro_limite').on('change', function () {
        $('#pagina_actual').data('pagina', 1);
        obtener_aguinaldos_historial();
    });

    // Inicializar variable de página actual si no existe
    if (!$('#pagina_actual').length) {
        $('body').append('<div id="pagina_actual" data-pagina="1" style="display:none;"></div>');
    }
});








/**
 * =======================================================================================
 * FUNCIONES AUXILIARES PARA PREPARAR LA INTERFAZ 
 * =======================================================================================
 */

/**
 * Dar formato a una cantidad numérica para mostrarla en la tabla con colores según si es positiva, negativa o cero
 * @param {Float} cantidad 
 * @returns 
 */
function estructuraDinero(cantidad) {
    switch (true) {
        case (cantidad < 0):
            return `<span class="text-danger">- $ ${formatoMoneda(cantidad * -1)}</span>`;
            break;
        case (cantidad === 0):
            return '<span class="text-secondary">-</span>';
            break;
        case (cantidad > 0):
            return `<span class="text-success">$ ${formatoMoneda(cantidad)}</span>`;
            break;
        default:
            return '<span class="text-secondary">-</span>';
    }
}

/**
 * Dar formulato de moneda a un número, con dos decimales y separador de miles, sin símbolo de moneda
 * @param {Number} numero 
 * @returns 
 */
function formatoMoneda(numero) {
    return numero.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Obtener la lista de departamentos para el filtro
 */
function obtener_departamentos() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        dataType: "json",
        success: function (data) {

            // render_select_departamentos({
            //     selector: '#filtro_departamento',
            //     data: data,
            //     keepFirstOption: true,
            //     selectFirst: true
            // });

            // Renderizar departamentos en el select del filtro
            render_select_departamentos({
                selector: '#id_departamento',
                data: data,
                keepFirstOption: true,
                selectFirst: true
            });

        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
}

/**
 * Cargar departamentos de un área específica en el filtro de historial
 * @param {number|string} idArea
 */
function obtener_departamentos_por_area_historial(idArea) {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        data: { id_area: idArea },
        dataType: "json",
        success: function (data) {
            const select = $('#filtro_departamento');
            select.html('<option value="">-- Todos los dep. del área --</option>');
            data.forEach(function (depto) {
                select.append(`<option value="${depto.id_departamento}">${depto.nombre_departamento}</option>`);
            });
            select.prop('disabled', false);
        },
        error: function () {
            console.error("Error al cargar departamentos por área");
        }
    });
}

/**
 * Obtener la lista de áreas para el filtro del historial
 */
function obtener_areas_historial() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerAreas.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            const select = $('#filtro_area');
            select.find('option:not(:first)').remove();
            data.forEach(function (area) {
                select.append(`<option value="${area.id_area}">${area.nombre_area}</option>`);
            });
        },
        error: function () {
            console.error("Error al cargar áreas");
        }
    });
}

/**
 * Función para obtener las empresas
 */
function obtener_empresas() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerEmpresas.php",
        type: "GET",
        dataType: "json",
        success: function (data) {
            // console.log(data);
            // Llenar el select de empresas de la tabla
            render_select_empresas(data);
        },
        error: function () {
            console.error("Error al cargar empresas");
        }
    });
}

/**
 * Función para obtener los años disponibles desde el servidor.
 */
function obtener_anios() {
    $.ajax({
        type: "GET",
        url: RUTA_RAIZ + "/aguinaldo/php/aguinaldo.php",
        data: { accion: "obtener_anios" },
        dataType: "json",
        success: function (response) {
            // Manejar la respuesta del servidor
            let anios = response.data;
            // LLENAR EL SELECT filtro_anio con un -1 para indicar "Todos los años" y luego los años obtenidos
            $("#filtro_anio").append('<option value="">-- Todos los años --</option>');
            // Recorrer los años y agregarlos al select
            anios.forEach(anio => {
                $("#filtro_anio").append(`<option value="${anio}">${anio}</option>`);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener los años:", error);
        }
    });
}

/**
 * Renderiza departamentos en un select
 * 
 * @param {Object} config
 * @param {string} config.selector Selector del select
 * @param {Array} config.data Lista de departamentos
 * @param {boolean} [config.keepFirstOption=false] Mantener primera opción existente
 * @param {boolean} [config.selectFirst=false] Seleccionar automáticamente el primer elemento
 */
function render_select_departamentos({
    selector,
    data,
    keepFirstOption = false,
    selectFirst = false
}) {

    const select = $(selector);

    // =========================
    // MANTENER PRIMERA OPCIÓN
    // =========================
    if (keepFirstOption) {

        // Seleccionar primera opción existente
        if (selectFirst) {
            select.find('option:first').prop('selected', true);
        }

        // Eliminar resto
        select.find('option:not(:first)').remove();

    } else {

        // Vaciar completamente
        select.empty();
    }

    // =========================
    // AGREGAR NUEVAS OPCIONES
    // =========================
    data.forEach((depto, index) => {

        // Solo seleccionar primer elemento del arreglo
        // si NO se está manteniendo una opción previa
        const selected = (
            !keepFirstOption &&
            selectFirst &&
            index === 0
        )
            ? 'selected'
            : '';

        select.append(`
            <option ${selected} value="${depto.id_departamento}">
                ${depto.nombre_departamento}
            </option>
        `);
    });
}

/**
 * Renderizar la lista de empresas en el modal de exportación
 * @param {Array} data Array de empresas con id_empresa y nombre_empresa
 */
function render_select_empresas(data) {
    const select = $("#id_empresa");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (depto) {
        select.append(
            `<option value="${depto.id_empresa}">${depto.nombre_empresa}</option>`
        );
    });
}


/**
 * ======================================================================================
 * INICIALIZACIÓN DEL MÓDULO
 * ======================================================================================
 */

/**
 * Función de inicialización para el módulo de historial de aguinaldos
 */
function init() {
    // CARGAR EL HISTORIAL DE AGUINALDOS
    obtener_aguinaldos_historial();
    // CARGAR LA LISTA DE ÁREAS PARA EL FILTRO
    obtener_areas_historial();
    // CARGAR LA LISTA DE EMPRESAS PARA EL FILTRO
    obtener_empresas();
    // CARGAR LA LISTA DE AÑOS PARA EL FILTRO
    obtener_anios();
    // CARGAR LA LISTA DE DEPARTAMENTOS PARA EL FILTRO
    obtener_departamentos();
}

/**
 * Evento para descargar el reporte de Excel de un cálculo de aguinaldo específico desde el historial
 */
$(document).on('click', '.btn_descargar_excel', function (e) {
    e.preventDefault();

    const anio = $(this).data('anio');
    const idDepartamento = $(this).data('iddepartamento');
    const nombreDepartamento = $(this).data('departamento') || 'Departamento';
    let empleados = $(this).data('empleados');

    if (typeof empleados === 'string') {
        try {
            empleados = JSON.parse(empleados);
        } catch (err) {
            empleados = [];
        }
    }

    if (!empleados || empleados.length === 0) {
        Swal.fire('Sin datos', 'No hay colaboradores registrados en este cálculo para exportar.', 'warning');
        return;
    }

    // Enviar todas las empresas para generar pestañas separadas por empresa
    const empresa = 'todas';

    const jsonAguinaldo = {
        anio: anio,
        empleados: empleados
    };

    const departamentosSeleccionados = [{
        id_departamento: idDepartamento,
        nombre_departamento: nombreDepartamento
    }];

    Swal.fire({
        title: 'Generando Reporte...',
        html: `Preparando Excel de aguinaldo para <b>${nombreDepartamento}</b> (${anio}) con ambas empresas...`,
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    $.ajax({
        url: RUTA_RAIZ + '/aguinaldo/php/exportar_excel.php',
        type: 'POST',
        data: {
            jsonAguinaldo: JSON.stringify(jsonAguinaldo),
            anio: anio,
            departamentos: JSON.stringify(departamentosSeleccionados),
            empresa: empresa
        },
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob) {
            Swal.close();

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
            const deptoLimpio = nombreDepartamento.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]/g, '_');
            const nombreArchivo = `REPORTE_AGUINALDOS_${anio}_AMBAS_EMPRESAS_${deptoLimpio}_${timestamp}.xlsx`;

            link.href = url;
            link.download = nombreArchivo;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
        error: function (xhr, status, error) {
            Swal.close();
            console.error('Error al descargar el Excel:', error);
            Swal.fire('Error', 'No se pudo generar el archivo Excel.', 'error');
        }
    });
});