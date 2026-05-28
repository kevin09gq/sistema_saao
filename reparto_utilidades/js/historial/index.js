// Constantes y variables globales
const RUTA_RAIZ = window.rutaRaiz || '/sistema_saao';

// Modales
const modal_detalles_utilidad = new bootstrap.Modal(document.getElementById('modal_detalles_utilidad'));

// Inicialización del módulo
$(document).ready(function () {
    init();
});

/**
 * Función para llenar la tabla de utilidades con datos del servidor
 */
function obtener_utilidades_historial(pagina = 1) {

    const busqueda = $('#busqueda').val().trim();

    $.ajax({
        type: "GET",
        url: `${RUTA_RAIZ}/reparto_utilidades/php/utilidades.php`,
        data: {
            accion: 'obtener_utilidades_historial',
            pagina: pagina,
            busqueda: busqueda
        },
        dataType: "json",
        success: function (response) {

            // Recuperar los datos del historial de utilidades
            let dataRespuesta = response.data || {};
            let data = dataRespuesta.registros || [];

            data.forEach((elemento, index) => {

                // Obtener la lista de empleados del aguinaldo
                let empleados = elemento.jsonUtilidad.empleados || [];

                // OBTENER EL TOTAL DE PTU SUMANDO LOS VALORES DE CADA EMPLEADO
                // SOLO SE SUMAN LOS EMPLEADOS QUE ESTÉN MARCADOS COMO VISIBLES (visible === true)
                const totalPTU = empleados
                    .filter(emp => emp.visible === true)
                    .reduce((acc, emp) => {
                        return acc + (parseFloat(emp.ptu) || 0);
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
                elemento.totalPTU = totalPTU;
                elemento.totalTarjeta = totalTarjeta;
                elemento.totalNeto = totalNeto;
                elemento.total_empleados_visibles = totalEmpleadosVisibles;

                // AGREGAR LOS EMPLEADOS DIRECTAMENTE EN EL OBJETO
                elemento.empleados = empleados;

                // ELIMINAR EL jsonUtilidad PARA EVITAR CONFUSIONES
                delete elemento.jsonUtilidad;
            });

            // Renderizar la tabla de utilidades en el historial con los datos obtenidos
            render_tabla_utilidades_historial(data);

            // Generar la paginación
            generar_paginacion(dataRespuesta);

        }
    });
}

/**
 * Función para renderizar la tabla de utilidades en el historial
 * @param {JsonArray} data La data obtenida del servidor para renderizar la tabla de utilidades en el historial
 */
function render_tabla_utilidades_historial(data) {
    // Limpiar tabla
    const tbody = $('#cuerpo_tabla_historial');
    tbody.empty();

    // Verificar si no hay datos para mostrar
    if (data.length === 0) {
        const filaVacia = `
            <tr>
                <td colspan="7" class="text-center">No hay datos para mostrar</td>
            </tr>
        `;
        tbody.append(filaVacia);
        return;
    }

    console.log(data);
    

    // RECORRER LOS DATOS OBTENIDOS Y CREAR LAS FILAS DE LA TABLA
    data.forEach((elemento, index) => {

        const contador = index + 1;

        const fila = `
            <tr>
                <td class="ps-4 fw-bold">${contador}</td>
                <td class="ps-4 fw-bold text-primary">${elemento.anio}</td>
                <td class="text-center">${elemento.total_empleados_visibles}</td>
                <td class="text-center">${estructuraDinero(elemento.totalPTU)}</td>
                <td class="text-center">${estructuraDinero(elemento.totalTarjeta)}</td>
                <td class="text-center fw-bold">${estructuraDinero(elemento.totalNeto)}</td>
                <td class="text-center">
                    <button
                        data-empleados='${JSON.stringify(elemento.empleados)}'
                        data-anio='${elemento.anio}'
                        data-total='${elemento.total_empleados_visibles}'
                        type="button"
                        class="btn btn-outline-primary btn-sm px-3 shadow-sm btn_ver_detalles"
                        title="Ver Detalles">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                    <button
                        data-id='${elemento.id_utilidad}'
                        type="button"
                        class="btn btn-outline-danger btn-sm px-3 shadow-sm btn_borrar"
                        title="Borrar Utilidad">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                    <!-- 
                    <a
                        href="generar_aguinaldo.php?cv=${elemento.anio}"
                        class="btn btn-outline-success btn-sm px-3 shadow-sm"
                        title="Editar Aguinaldo">
                        <i class="bi bi-pencil-fill"></i>
                    </a> -->
                </td>
            </tr>
        `;

        // AGREGAR LA FILA AL CUERPO DE LA TABLA
        tbody.append(fila);
    });
}

/**
 * Función para generar la paginación de los resultados
 * @param {Object} dataPaginacion Objeto con información de paginación
 */
function generar_paginacion(dataPaginacion) {
    const contenedorPaginacion = document.getElementById('paginacion');
    contenedorPaginacion.innerHTML = '';

    const paginaActual = dataPaginacion.paginaActual || 1;
    const totalPaginas = dataPaginacion.totalPaginas || 1;

    // Si hay solo una página, no mostrar paginación
    if (totalPaginas <= 1) {
        return;
    }

    // BOTÓN INICIO
    if (paginaActual > 1) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="obtener_utilidades_historial(1); return false;"><i class="bi bi-skip-start-fill"></i> Inicio</a>`;
        contenedorPaginacion.appendChild(li);
    }

    // BOTÓN ANTERIOR
    if (paginaActual > 1) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="obtener_utilidades_historial(${paginaActual - 1}); return false;">Anterior</a>`;
        contenedorPaginacion.appendChild(li);
    }

    // NÚMEROS DE PÁGINA
    // Mostrar máximo 5 números de página
    let paginaInicio = Math.max(1, paginaActual - 2);
    let paginaFin = Math.min(totalPaginas, paginaActual + 2);

    // Ajustar si estamos al inicio o final
    if (paginaFin - paginaInicio < 4) {
        if (paginaInicio === 1) {
            paginaFin = Math.min(totalPaginas, paginaInicio + 4);
        } else {
            paginaInicio = Math.max(1, paginaFin - 4);
        }
    }

    // Mostrar botón a primera página si no está en el rango
    if (paginaInicio > 1) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="obtener_utilidades_historial(1); return false;">1</a>`;
        contenedorPaginacion.appendChild(li);

        if (paginaInicio > 2) {
            const liPuntos = document.createElement('li');
            liPuntos.className = 'page-item disabled';
            liPuntos.innerHTML = '<span class="page-link">...</span>';
            contenedorPaginacion.appendChild(liPuntos);
        }
    }

    // Números de página
    for (let i = paginaInicio; i <= paginaFin; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" onclick="obtener_utilidades_historial(${i}); return false;">${i}</a>`;
        contenedorPaginacion.appendChild(li);
    }

    // Mostrar botón a última página si no está en el rango
    if (paginaFin < totalPaginas) {
        if (paginaFin < totalPaginas - 1) {
            const liPuntos = document.createElement('li');
            liPuntos.className = 'page-item disabled';
            liPuntos.innerHTML = '<span class="page-link">...</span>';
            contenedorPaginacion.appendChild(liPuntos);
        }

        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="obtener_utilidades_historial(${totalPaginas}); return false;">${totalPaginas}</a>`;
        contenedorPaginacion.appendChild(li);
    }

    // BOTÓN SIGUIENTE
    if (paginaActual < totalPaginas) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="obtener_utilidades_historial(${paginaActual + 1}); return false;">Siguiente</a>`;
        contenedorPaginacion.appendChild(li);
    }

    // BOTÓN FINAL
    if (paginaActual < totalPaginas) {
        const li = document.createElement('li');
        li.className = 'page-item';
        li.innerHTML = `<a class="page-link" href="#" onclick="obtener_utilidades_historial(${totalPaginas}); return false;">Final <i class="bi bi-skip-end-fill"></i></a>`;
        contenedorPaginacion.appendChild(li);
    }
}

// EVENTO DE BÚSQUEDA EN TIEMPO REAL
$(document).on('input', '#busqueda', function (e) {
    e.preventDefault();

    obtener_utilidades_historial(1);
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
 * Función de inicialización para el módulo de historial de utilidades
 */
function init() {
    // CARGAR EL HISTORIAL DE UTILIDADES
    obtener_utilidades_historial();
    // CARGAR LA LISTA DE DEPARTAMENTOS PARA EL FILTRO
    obtener_departamentos();
    // CARGAR LA LISTA DE EMPRESAS PARA EL FILTRO
    obtener_empresas();
}