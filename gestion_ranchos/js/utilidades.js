/**
 * Función para mostrar alertas usando SweetAlert2
 * @param {String} icono Iconos: success, error, warning, info, question.
 * @param {String} titulo Titulo prinicipal de la alerta.
 * @param {String} texto Mensaje principal de la alerta.
 * @param {Boolean} toast True para mostrar como toast, false para modal tradicional. Valor por defecto: false.
 * @param {Number} tiempo Duración del toast en ms (si toast=true). Valor por defecto: 3000ms.
 */
function alerta(icono, titulo, texto, toast = false, tiempo = 3000) {
    if (toast) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: tiempo,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: icono,
            title: titulo
        });
    } else {
        // Modal tradicional
        Swal.fire({
            title: titulo,
            text: texto,
            icon: icono,
            confirmButtonText: "Entendido"
        });
    }
}

/**
 * Quita la palabra "Rancho" al inicio y convierte el resto en mayúsculas
 * @param {string} texto Cadena de entrada
 * @returns {string} Cadena sin "Rancho" y en mayúsculas
 */
function quitarPalabraRancho(texto) {
    if (!texto) return "";

    // Eliminar "Rancho" al inicio (con o sin espacios)
    const sinRancho = texto.replace(/^Rancho\s*/i, "");

    // Convertir a mayúsculas
    return sinRancho.toUpperCase();
}

/**
 * Convierte una fecha "YYYY-MM-DD" a "DD/Mes/AAAA"
 * @param {string} fecha Cadena en formato "YYYY-MM-DD"
 * @returns {string} Fecha formateada como "13/Ene/2026"
 */
function formatearFechaEspa(fecha) {
    // Array con abreviaturas de meses
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                   "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    // Separar la fecha en partes
    const [anio, mes, dia] = fecha.split("-");

    // Obtener nombre del mes (restamos 1 porque el array empieza en 0)
    const nombreMes = meses[parseInt(mes, 10) - 1];

    // Retornar en formato deseado
    return `${parseInt(dia, 10)}/${nombreMes}/${anio}`;
}

/**
 * Suma todas las rejas de un Vale es especifico
 * @param {Array} data - Arreglo con objetos {num_tabla, rejas}
 * @returns {number} - Total de rejas
 */
function sumarRejasVale(data) {
    return data.reduce((total, item) => total + item.rejas, 0);
}

/**
 * Obtiene las tablas con más rejas de un conjunto de vales, limitando el resultado a un número específico.
 * Solo se consideran los vales con estado = 1 (activos).
 * @param {Array} vales Valores de entrada, cada uno con un arreglo de rejas.
 * @param {number} limite Límite de resultados a devolver (por defecto 10).
 * @returns {Array} Arreglo de objetos {num_tabla, total_rejas}
 */
function topTablasPorRejas(vales, limite = 10) {
    const acumulados = {};

    // Recorrer todos los vales
    vales.forEach(vale => {
        if (vale.estado === 1 && Array.isArray(vale.rejas)) {
            vale.rejas.forEach(r => {
                const numTabla = r.num_tabla;
                acumulados[numTabla] = (acumulados[numTabla] || 0) + r.rejas;
            });
        }
    });

    // Convertir a arreglo de objetos {num_tabla, total_rejas}
    const resultado = Object.entries(acumulados).map(([tabla, total]) => ({
        num_tabla: parseInt(tabla),
        total_rejas: total
    }));

    // Ordenar de mayor a menor
    resultado.sort((a, b) => b.total_rejas - a.total_rejas);

    // Devolver solo los primeros "limite"
    return resultado.slice(0, limite);
}

/**
 * Función para formatear un número a dos dígitos, agregando un cero al inicio si es necesario.
 * @param {Number} num Número a formatear
 * @returns {Number} Número formateado a dos dígitos
 */
function formatoDosDigitos(num) {
    return String(num).padStart(2, '0');
}

/**
 * Formatea una cantidad como moneda en formato USD.
 * @param {Number} cantidad Cantidad a formatear
 * @returns {String} Cantidad formateada como moneda
 */
function formatoMoneda(cantidad) {
    return '$ ' + cantidad.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}