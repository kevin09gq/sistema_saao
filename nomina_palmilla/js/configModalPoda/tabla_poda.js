
// Cuerpo de tabla para mostrar los datos de poda
const tabla_body_poda = document.getElementById('tabla_body_poda');

// Mapeo de días a abreviaturas y números de día
const DIAS_SEMANA = {
    'VIERNES': { abrev: 'V', index: 0 },
    'SABADO': { abrev: 'SA', index: 1 },
    'DOMINGO': { abrev: 'DO', index: 2 },
    'LUNES': { abrev: 'L', index: 3 },
    'MARTES': { abrev: 'MA', index: 4 },
    'MIERCOLES': { abrev: 'MI', index: 5 },
    'JUEVES': { abrev: 'J', index: 6 }
};

/**
 * Función para mostrar los datos de poda en la tabla correspondiente
 * @param {JsonObject} json Es el Json de la nómina que contiene la información de departamentos, empleados y movimientos
 */
function mostrarDatosTablaPoda(json) {
    // Filtrar el departamento de Poda
    let departamentoPoda = json.departamentos.find(d => d.nombre === "Poda");

    // Limpiar la tabla
    $('#tabla_body_poda').empty();

    // Si no existe el departamento de poda, no mostrar nada
    if (!departamentoPoda || !departamentoPoda.empleados || departamentoPoda.empleados.length === 0) {
        $('#tabla_body_poda').html('<tr><td colspan="13">No se encontraron datos para mostrar.</td></tr>');
        return;
    }

    let numeroFila = 1;
    const filas = [];
    // Array para almacenar los datos de todas las filas (para calcular totales)
    const datosFilas = [];

    // Procesar cada empleado del departamento de Poda
    departamentoPoda.empleados.forEach(emp => {
        const movimientosPoda = emp.movimientos.filter(m => m.concepto === "PODA");
        const movimientosExtras = emp.movimientos.filter(m => m.concepto !== "PODA");

        // Procesar movimientos de PODA agrupados por monto
        const gruposPoda = agruparMovimientosConceptoPoda(movimientosPoda);
        gruposPoda.forEach(grupo => {
            const filaObjeto = crearFilaPoda(emp.nombre, grupo, numeroFila++);
            filas.push(filaObjeto.html);
            datosFilas.push(filaObjeto.datos);
        });

        // Procesar movimientos extras agrupados por concepto y monto
        const gruposExtras = agruparMovimientosExtras(movimientosExtras);
        gruposExtras.forEach(grupo => {
            const filaObjeto = crearFilaExtra(emp.nombre, grupo, numeroFila++);
            filas.push(filaObjeto.html);
            datosFilas.push(filaObjeto.datos);
        });
    });

    // Renderizar todas las filas en la tabla
    filas.forEach(fila => {
        $('#tabla_body_poda').append(fila);
    });

    // Agregar fila de totales si hay filas en la tabla
    if (datosFilas.length > 0) {
        const filaTotal = generarFilaTotalesPoda(datosFilas);
        $('#tabla_body_poda').append(filaTotal);
    }
}

/**
 * Agrupa los movimientos de PODA por monto
 * @param {Array} movimientos Array de movimientos de PODA
 * @returns {Array} Array de grupos con formato {monto, movimientos}
 */
function agruparMovimientosConceptoPoda(movimientos) {
    const mapa = {};

    movimientos.forEach(mov => {
        const monto = mov.monto;
        if (!mapa[monto]) {
            mapa[monto] = [];
        }
        mapa[monto].push(mov);
    });

    return Object.entries(mapa).map(([monto, movs]) => ({
        monto: parseFloat(monto),
        movimientos: movs
    }));
}

/**
 * Agrupa los movimientos extras por concepto y monto
 * @param {Array} movimientos Array de movimientos extras
 * @returns {Array} Array de grupos con formato {concepto, monto, movimientos}
 */
function agruparMovimientosExtras(movimientos) {
    const mapa = {};

    movimientos.forEach(mov => {
        const clave = `${mov.concepto}|${mov.monto}`;
        if (!mapa[clave]) {
            mapa[clave] = {
                concepto: mov.concepto,
                monto: mov.monto,
                movimientos: []
            };
        }
        mapa[clave].movimientos.push(mov);
    });

    return Object.values(mapa);
}

/**
 * Crea una fila HTML para un grupo de movimientos de PODA
 * @param {String} nombreEmpleado Nombre del empleado
 * @param {Object} grupo Grupo con {monto, movimientos}
 * @param {Number} numeroFila Número de fila para identificación
  * @returns {Object} Objeto con propiedades {html: String, datos: Object}
 */
function crearFilaPoda(nombreEmpleado, grupo, numeroFila) {
    const diasArray = new Array(7).fill(null); // [V, SA, DO, L, MA, MI, J]
    let totalArboles = 0;

    // Llenar los datos de cada día
    grupo.movimientos.forEach(mov => {
        const diaNombre = mov.fecha ? obtenerDiaSemanaPoda(mov.fecha) : null;
        if (diaNombre && DIAS_SEMANA[diaNombre]) {
            const index = DIAS_SEMANA[diaNombre].index;
            // Sumar múltiples movimientos del mismo día
            diasArray[index] = (diasArray[index] || 0) + (mov.arboles_podados || 0);
            totalArboles += mov.arboles_podados || 0;
        }
    });

    const totalEfectivo = totalArboles * grupo.monto;

    const celdas = [
        `<td>${numeroFila}</td>`,
        `<td>${nombreEmpleado}</td>`,
        `<td>PODA</td>`,
        ...diasArray.map(valor => `<td class="text-center">${valor !== null ? valor : ''}</td>`),
        `<td class="text-center">${totalArboles}</td>`,
        `<td class="text-center">${grupo.monto.toFixed(2)}</td>`,
        `<td class="text-center">${totalEfectivo.toFixed(2)}</td>`
    ];

    return {
        html: `<tr data-concepto="PODA" data-nombre="${nombreEmpleado}" data-monto="${grupo.monto}">${celdas.join('')}</tr>`,
        datos: {
            concepto: 'PODA',
            totalArboles: totalArboles,
            totalEfectivo: totalEfectivo
        }
    };
}

/**
 * Crea una fila HTML para un grupo de movimientos extras
 * @param {String} nombreEmpleado Nombre del empleado
 * @param {Object} grupo Grupo con {concepto, monto, movimientos}
 * @param {Number} numeroFila Número de fila para identificación
 * @returns {Object} Objeto con propiedades {html: String, datos: Object}
 */
function crearFilaExtra(nombreEmpleado, grupo, numeroFila) {
    const diasArray = new Array(7).fill(null); // [V, SA, DO, L, MA, MI, J]
    let totalEfectivo = 0;

    // Llenar los datos de cada día
    grupo.movimientos.forEach(mov => {
        const diaNombre = mov.fecha ? obtenerDiaSemanaPoda(mov.fecha) : null;
        if (diaNombre && DIAS_SEMANA[diaNombre]) {
            const index = DIAS_SEMANA[diaNombre].index;
            // Sumar múltiples movimientos del mismo día
            diasArray[index] = (diasArray[index] || 0) + (mov.monto || 0);
            totalEfectivo += mov.monto || 0;
        }
    });

    const celdas = [
        `<td>${numeroFila}</td>`,
        `<td>${nombreEmpleado}</td>`,
        `<td>${grupo.concepto}</td>`,
        ...diasArray.map(valor => `<td class="text-center">${valor !== null ? valor.toFixed(2) : ''}</td>`),
        `<td class="text-center"></td>`, // Total árboles vacío
        `<td class="text-center"></td>`, // Pago vacío
        `<td class="text-center">${totalEfectivo.toFixed(2)}</td>`
    ];

    return {
        html: `<tr data-concepto="${grupo.concepto}" data-nombre="${nombreEmpleado}" data-monto="${grupo.monto}">${celdas.join('')}</tr>`,
        datos: {
            concepto: grupo.concepto,
            totalArboles: null, // Las extras no tienen árboles
            totalEfectivo: totalEfectivo
        }
    };
}

/**
 * Obtiene el día de la semana en español a partir de una fecha
 * @param {Date|String} fecha Objeto de fecha o string de fecha (YYYY-MM-DD)
 * @returns {String} Día de la semana en mayúsculas sin acentos (VIERNES, SABADO, DOMINGO, LUNES, etc.)
 */
function obtenerDiaSemanaPoda(fecha) {
    const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

    let fechaObj;

    // Si es un string, parsearlo manualmente para evitar problemas de zona horaria
    if (typeof fecha === 'string') {
        // Formato esperado: YYYY-MM-DD
        const partes = fecha.split('-');
        if (partes.length === 3) {
            const year = parseInt(partes[0]);
            const month = parseInt(partes[1]) - 1; // Meses en JavaScript son 0-11
            const day = parseInt(partes[2]);
            fechaObj = new Date(year, month, day);
        } else {
            fechaObj = new Date(fecha);
        }
    } else {
        fechaObj = fecha;
    }

    // Verificar si es un objeto Date válido
    if (!(fechaObj instanceof Date) || isNaN(fechaObj.getTime())) {
        console.error('Fecha inválida:', fecha);
        return null;
    }

    return dias[fechaObj.getDay()];
}

/**
 * Función que calcula y genera la fila de totales para la tabla
 * de poda. Suma los árboles y el efectivo de todas las filas,
 * considerando tanto conceptos PODA como extras.
 * @param {Array} datosFilas Array de objetos con datos de cada fila (concepto, totalArboles, totalEfectivo)
 * @returns {String} HTML de la fila de totales
 */
function generarFilaTotalesPoda(datosFilas) {
    // Inicializar totales
    let totalArboles = 0;
    let totalEfectivo = 0;

    // Sumar todos los valores de árboles y efectivo
    datosFilas.forEach(fila => {
        // Sumar árboles si la fila tiene ese valor (no es null)
        if (fila.totalArboles !== null && fila.totalArboles !== undefined) {
            totalArboles += fila.totalArboles;
        }

        // Sumar siempre el total efectivo
        if (fila.totalEfectivo !== null && fila.totalEfectivo !== undefined) {
            totalEfectivo += fila.totalEfectivo;
        }
    });

    // Generar fila HTML de totales con estilo distintivo
    const filaTotal = `
        <tr style="background-color: #e8f4f8; font-weight: bold; border-top: 2px solid #333;">
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">---</td>
            <td style="text-align: center;">TOTAL</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="text-center"><strong>${totalArboles}</strong></td>
            <td></td>
            <td class="text-center"><strong>$${totalEfectivo.toFixed(2)}</strong></td>
        </tr>
    `;

    return filaTotal;
}