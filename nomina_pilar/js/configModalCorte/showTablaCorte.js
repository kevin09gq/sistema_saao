function mostrarDatosTablaCorte(jsonNominaPilar) {
    // Aquí sí filtras sobre el arreglo de departamentos
    let departamentoCorte = jsonNominaPilar.departamentos.find(d => d.nombre === "Corte");

    // Limpiar la tabla
    $('#tabla-body-corte-pilar').empty();

    // Si no existe el departamento de corte, no mostrar nada
    if (!departamentoCorte || !departamentoCorte.empleados) {
        return;
    }

    let numeroFila = 1;

    // Procesar cada empleado
    departamentoCorte.empleados.forEach(empleado => {
        if (empleado.concepto === "REJA") {
            // Procesar empleados con concepto REJA (lógica original)
            const ticketsPorPrecio = agruparTicketsPorPrecio(empleado.tickets);

            // Para cada grupo de precio, crear una fila
            Object.keys(ticketsPorPrecio).forEach(precio => {
                const tickets = ticketsPorPrecio[precio];
                const datosFila = procesarTicketsParaFila(empleado.nombre, empleado.concepto, tickets, parseFloat(precio));
                
                // Generar fila HTML
                const filaHTML = generarFilaTablaCorte(numeroFila, datosFila);
                $('#tabla-body-corte-pilar').append(filaHTML);
                
                numeroFila++;
            });

        } else if (empleado.concepto === "NOMINA") {
            // Procesar empleados con concepto NOMINA
            const datosFila = procesarNominaParaFila(empleado.nombre, empleado.concepto, empleado.nomina);
            
            // Generar fila HTML
            const filaHTML = generarFilaTablaCorte(numeroFila, datosFila);
            $('#tabla-body-corte-pilar').append(filaHTML);
            
            numeroFila++;
        }
    });
}

/**
 * Agrupa los tickets de un empleado por precio_reja
 * @param {Array} tickets - Array de tickets del empleado
 * @returns {Object} Objeto donde las claves son los precios y los valores son arrays de tickets
 */
function agruparTicketsPorPrecio(tickets) {
    const ticketsPorPrecio = {};
    
    tickets.forEach(ticket => {
        const precio = ticket.precio_reja.toString();
        
        if (!ticketsPorPrecio[precio]) {
            ticketsPorPrecio[precio] = [];
        }
        
        ticketsPorPrecio[precio].push(ticket);
    });
    
    return ticketsPorPrecio;
}

/**
 * Procesa los tickets de un empleado para una fila específica (un precio específico)
 * @param {String} nombreEmpleado - Nombre del empleado
 * @param {String} concepto - Concepto (REJA o NOMINA)
 * @param {Array} tickets - Array de tickets con el mismo precio
 * @param {Number} precio - Precio por reja
 * @returns {Object} Datos procesados para la fila
 */
function procesarTicketsParaFila(nombreEmpleado, concepto, tickets, precio) {
    // Inicializar contadores por día
    const rejasPorDia = {
        'VIERNES': 0,
        'SABADO': 0,
        'DOMINGO': 0,
        'LUNES': 0,
        'MARTES': 0,
        'MIERCOLES': 0,
        'JUEVES': 0
    };

    let totalRejas = 0;

    // Procesar cada ticket
    tickets.forEach(ticket => {
        const diaSemana = obtenerDiaSemanaCorte(ticket.fecha);
        
        // Sumar todas las rejas de todas las tablas de este ticket
        const rejasTicket = ticket.datosRejas.reduce((suma, tabla) => suma + tabla.cantidad, 0);
        
        // Agregar al día correspondiente
        if (rejasPorDia.hasOwnProperty(diaSemana)) {
            rejasPorDia[diaSemana] += rejasTicket;
        }
        
        totalRejas += rejasTicket;
    });

    const totalEfectivo = totalRejas * precio;

    return {
        nombre: nombreEmpleado,
        concepto: concepto,
        viernes: rejasPorDia['VIERNES'],
        sabado: rejasPorDia['SABADO'],
        domingo: rejasPorDia['DOMINGO'],
        lunes: rejasPorDia['LUNES'],
        martes: rejasPorDia['MARTES'],
        miercoles: rejasPorDia['MIERCOLES'],
        jueves: rejasPorDia['JUEVES'],
        totalRejas: totalRejas,
        precio: precio,
        totalEfectivo: totalEfectivo,
        tipoConcepto: 'REJA'
    };
}

/**
 * Procesa la nómina de un empleado para una fila específica
 * @param {String} nombreEmpleado - Nombre del empleado
 * @param {String} concepto - Concepto (siempre "NOMINA")
 * @param {Array} nomina - Array de pagos por día
 * @returns {Object} Datos procesados para la fila
 */
function procesarNominaParaFila(nombreEmpleado, concepto, nomina) {
    // Inicializar contadores por día (en este caso serán pagos)
    const pagosPorDia = {
        'VIERNES': 0,
        'SABADO': 0,
        'DOMINGO': 0,
        'LUNES': 0,
        'MARTES': 0,
        'MIERCOLES': 0,
        'JUEVES': 0
    };

    let totalEfectivo = 0;

    // Procesar cada día de pago
    nomina.forEach(diaPago => {
        const dia = diaPago.dia.toUpperCase();
        const pago = parseFloat(diaPago.pago) || 0;
        
        // Agregar al día correspondiente
        if (pagosPorDia.hasOwnProperty(dia)) {
            pagosPorDia[dia] = pago;
        }
        
        totalEfectivo += pago;
    });

    return {
        nombre: nombreEmpleado,
        concepto: concepto,
        viernes: pagosPorDia['VIERNES'],
        sabado: pagosPorDia['SABADO'],
        domingo: pagosPorDia['DOMINGO'],
        lunes: pagosPorDia['LUNES'],
        martes: pagosPorDia['MARTES'],
        miercoles: pagosPorDia['MIERCOLES'],
        jueves: pagosPorDia['JUEVES'],
        totalRejas: null, // Vacío para concepto NOMINA
        precio: null, // Vacío para concepto NOMINA
        totalEfectivo: totalEfectivo,
        tipoConcepto: 'NOMINA'
    };
}

/**
 * Genera el HTML para una fila de la tabla de corte
 * @param {Number} numeroFila - Número de la fila
 * @param {Object} datos - Datos procesados para la fila
 * @returns {String} HTML de la fila
 */
function generarFilaTablaCorte(numeroFila, datos) {
    // Determinar qué mostrar según el tipo de concepto
    const totalRejas = datos.tipoConcepto === 'REJA' ? `<strong>${datos.totalRejas}</strong>` : '';
    const precioReja = datos.tipoConcepto === 'REJA' ? `$${datos.precio.toFixed(2)}` : '';
    const valorDia = datos.tipoConcepto === 'REJA' ? (valor) => valor || 0 : (valor) => valor > 0 ? `$${valor.toFixed(2)}` : '$0.00';

    // Agregar el atributo data-concepto para aplicar estilos dinámicos
    return `
        <tr data-concepto="${datos.tipoConcepto}" data-nombre="${datos.nombre}" data-precio="${datos.precio || ''}">
            <td>${numeroFila}</td>
            <td>${datos.nombre}</td>
            <td>${datos.concepto}</td>
            <td>${valorDia(datos.viernes)}</td>
            <td>${valorDia(datos.sabado)}</td>
            <td>${valorDia(datos.domingo)}</td>
            <td>${valorDia(datos.lunes)}</td>
            <td>${valorDia(datos.martes)}</td>
            <td>${valorDia(datos.miercoles)}</td>
            <td>${valorDia(datos.jueves)}</td>
            <td>${totalRejas}</td>
            <td>${precioReja}</td>
            <td><strong>$${datos.totalEfectivo.toFixed(2)}</strong></td>
        </tr>
    `;
}

/**
 * Función para obtener el día de la semana a partir de una fecha
 * @param {string} fechaStr - Fecha en formato 'YYYY-MM-DD'
 * @returns {string} Nombre del día de la semana en español
 */
function obtenerDiaSemanaCorte(fechaStr) {
    // Dividir la fecha para evitar problemas de zona horaria
    const [año, mes, dia] = fechaStr.split('-').map(Number);
    
    // Crear objeto Date (mes -1 porque Date cuenta los meses desde 0)
    let fecha = new Date(año, mes - 1, dia);

    // Array con los nombres de los días en español
    const dias = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

    // Obtener el índice del día (0 = Domingo, 1 = Lunes, etc.)
    let indice = fecha.getDay();

    // Devolver el nombre del día
    return dias[indice];
}