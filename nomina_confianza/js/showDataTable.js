/**
 * Formatea un valor numérico como moneda mexicana (MXN)
 * @param {number|string} valor - El valor a formatear
 * @param {boolean} alwaysNegative - Si es true, añade un signo negativo aunque sea positivo
 * @returns {string} HTML con el valor formateado
 */
function formatearMonedaMXN(valor, alwaysNegative = false) {
    const num = parseFloat(valor) || 0;
    // Si el valor es efectivamente 0 (o muy cercano), mostrar guion
    if (Math.abs(num) < 0.01) return '<span class="valor-vacio">—</span>';

    const absFormateado = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(Math.abs(num));

    const mostrarNegativo = (num < 0) || (alwaysNegative && num >= 0);
    if (mostrarNegativo) {
        return `<span class="valor-negativo">-${absFormateado}</span>`;
    }
    return absFormateado;
}

function mostrarDatosTabla(jsonNominaConfianza, pagina = 1) {
    const empleadosPorPagina = 7;

    // Obtener todos los empleados de todos los departamentos o solo del departamento especificado
    let todosEmpleados = [];
    jsonNominaConfianza.departamentos.forEach(depto => {
        // Si se especifica un departamento, solo procesar ese departamento

        // Filtrar solo empleados con mostrar=true y agregar nombre del departamento
        const empleadosFiltrados = depto.empleados
            .filter(emp => emp.mostrar !== false)
            .map(emp => ({ ...emp, departamento: depto.nombre }));
        todosEmpleados = todosEmpleados.concat(empleadosFiltrados);
    });


    // Calcular índices para la paginación
    const inicio = (pagina - 1) * empleadosPorPagina;
    const fin = inicio + empleadosPorPagina;
    const empleadosPagina = todosEmpleados.slice(inicio, fin);

    // Limpiar la tabla
    $('#tabla-nomina-body-confianza').empty();

    // Mostrar empleados de la página actual
    empleadosPagina.forEach((empleado, index) => {
        const numeroFila = inicio + index + 1;

        //Función para buscar concepto por código (segura si no existe 'conceptos')
        const buscarConcepto = (codigo) => {
            if (!Array.isArray(empleado.conceptos)) return '0.00';
            const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
            if (concepto) {
                const valor = parseFloat(concepto.resultado) || 0;
                return valor.toFixed(2);
            }
            return '0.00';
        };

        // Usar la función auxiliar global para formatear valores
        const formatearValor = (valor, alwaysNegative = false) => formatearMonedaMXN(valor, alwaysNegative);

        // Calcular Total Percepciones
        const totalPercepciones = calcularTotalPercepciones(empleado);

        // Calcular Total Deducciones
        const totalDeducciones = calcularTotalDeducciones(empleado);

        // Calcular Neto a Recibir 
        const totalNetoRecibir = (parseFloat(totalPercepciones) - parseFloat(totalDeducciones)).toFixed(2);

        // Calcular Importe Efectivo 
        const tarjetaVal = parseFloat(empleado.tarjeta) || 0;
        const importeEfectivo = (parseFloat(totalNetoRecibir) || 0) - tarjetaVal;

        //Calcular TOTAL A RECIBIR
        const totalRecibir = importeEfectivo - (parseFloat(empleado.prestamo) || 0);

        // Calcular Total a Cobrar
        const totalCobrar = calcularTotalCobrar(empleado);

        const fila = `
            <tr data-clave="${empleado.clave || 'N/A'}" data-id-empresa="${empleado.id_empresa || 1}">
                <td>${numeroFila}</td>
                <td>${empleado.nombre}</td>
                <td>${formatearValor(empleado.salario_semanal || 0)}</td>
                <td>${formatearValor(empleado.sueldo_extra_total || 0)}</td>  
                <td>${formatearValor(totalPercepciones)}</td>             

                <!-- Deducciones individuales -->
                <td>${formatearValor(buscarConcepto('45') || 0, true)}</td> <!-- ISR -->
                <td>${formatearValor(buscarConcepto('52') || 0, true)}</td> <!-- IMSS -->
                <td>${formatearValor(buscarConcepto('16') || 0, true)}</td> <!-- INFONAVIT -->
                <td>${formatearValor(buscarConcepto('107') || 0, true)}</td> <!-- AJUSTES AL SUB -->

                <td>${formatearValor(empleado.inasistencia || 0, true)}</td> <!-- AUSENTISMO -->
                <td>${formatearValor(empleado.permiso || 0, true)}</td> <!-- PERMISO -->
                <td>${formatearValor(empleado.retardos || 0, true)}</td> <!-- RETARDOS -->
                <td>${formatearValor(empleado.uniformes || 0, true)}</td> <!-- UNIFORMES -->
                <td>${formatearValor(empleado.checador || 0, true)}</td> <!-- CHECADOR -->
                <td>${formatearValor(empleado.fa_gafet_cofia || 0, true)}</td> <!-- F.A/GAFET/COFIA -->

                <td>${formatearValor(totalDeducciones, true)}</td> <!-- TOTAL DEDUCCIONES -->
                <td>${formatearValor(totalNetoRecibir || 0)}</td> <!-- NETO A RECIBIR -->
                <td>${formatearValor(empleado.tarjeta || 0, true)}</td> <!-- DISPERSION DE TARJETA -->
                <td>${formatearValor(importeEfectivo || 0)}</td> <!-- IMPORTE EN EFECTIVO -->
                <td>${formatearValor(empleado.prestamo || 0, true)}</td> <!-- PRÉSTAMO -->        
                <td>${formatearValor(totalRecibir || 0)}</td>  <!-- TOTAL A RECIBIR -->
                
                <!-- REDONDEADO -->
                <td class="${parseFloat(empleado.redondeo) < 0 ? 'redondeo-negativo' : 'redondeo-positivo'}">${formatearValor(empleado.redondeo || 0)}</td>
               
                <!-- TOTAL EFECTIVO REDONDEADO -->
                <td class="${totalCobrar < 0 ? 'sueldo-negativo' : ''}"><strong>${formatearValor(totalCobrar)}</strong></td>
             
            </tr>
        `;
        $('#tabla-nomina-body-confianza').append(fila);
    });

    // Crear la paginación
    paginarTabla(jsonNominaConfianza, todosEmpleados.length, pagina, empleadosPorPagina);

    // Agregar fila de totales si es la última página
    const totalPaginas = Math.ceil(todosEmpleados.length / empleadosPorPagina);
    if (pagina === totalPaginas && todosEmpleados.length > 0) {
        const filaTotal = generarFilaTotalesDepartamento(todosEmpleados);
        $('#tabla-nomina-body-confianza').append(filaTotal);
    }
}

function paginarTabla(jsonNominaConfianza, totalEmpleados, paginaActual, empleadosPorPagina) {
    // Calcular total de páginas
    const totalPaginas = Math.ceil(totalEmpleados / empleadosPorPagina);

    // Limpiar paginación
    $('#paginacion-nomina').empty();

    // Botón anterior
    if (paginaActual > 1) {
        $('#paginacion-nomina').append(`
            <li class="page-item">
                <a class="page-link" href="#" data-pagina="${paginaActual - 1}">&laquo;</a>
            </li>
        `);
    }

    // Botones de páginas
    for (let i = 1; i <= totalPaginas; i++) {
        const activo = i === paginaActual ? 'active' : '';
        $('#paginacion-nomina').append(`
            <li class="page-item ${activo}">
                <a class="page-link" href="#" data-pagina="${i}">${i}</a>
            </li>
        `);
    }

    // Botón siguiente
    if (paginaActual < totalPaginas) {
        $('#paginacion-nomina').append(`
            <li class="page-item">
                <a class="page-link" href="#" data-pagina="${paginaActual + 1}">&raquo;</a>
            </li>
        `);
    }

    // Evento click en los botones de paginación
    $('#paginacion-nomina .page-link').on('click', function (e) {
        e.preventDefault();
        const nuevaPagina = parseInt($(this).data('pagina'));
        paginaActualNomina = nuevaPagina; // Guardar la página actual
        mostrarDatosTabla(jsonNominaConfianza, nuevaPagina);
    });
}

function calcularTotalPercepciones(empleado) {
    const sueldo = parseFloat(empleado.salario_semanal || 0);
    const extras = parseFloat(empleado.sueldo_extra_total || 0);

    return (sueldo + extras);
}

// Función para calcular Total Deducciones
function calcularTotalDeducciones(empleado) {
    // Función auxiliar para buscar concepto
    const buscarConcepto = (codigo) => {
        if (!Array.isArray(empleado.conceptos)) return 0;
        const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
        return concepto ? (parseFloat(concepto.resultado) || 0) : 0;
    };

    const retardos = parseFloat(empleado.retardos) || 0;
    const isr = buscarConcepto('45');
    const imss = buscarConcepto('52');
    const ajusteSub = buscarConcepto('107');
    const infonavit = buscarConcepto('16');
    const permiso = parseFloat(empleado.permiso) || 0;
    const inasistencias = parseFloat(empleado.inasistencia) || 0;
    const uniformes = parseFloat(empleado.uniformes) || 0;
    const checador = parseFloat(empleado.checador) || 0;
    const faGafetCofia = parseFloat(empleado.fa_gafet_cofia) || 0;



    const total = retardos + isr + imss + ajusteSub + infonavit + permiso + inasistencias + uniformes + checador + faGafetCofia;
    return total.toFixed(2);
}

function calcularTotalCobrar(empleado) {
    const percepciones = parseFloat(calcularTotalPercepciones(empleado)) || 0;
    const deducciones = parseFloat(calcularTotalDeducciones(empleado)) || 0;
    const prestamo = parseFloat(empleado.prestamo) || 0;
    const tarjeta = parseFloat(empleado.tarjeta) || 0;

    let totalCobrar = percepciones - deducciones - prestamo - tarjeta;
    const totalOriginal = totalCobrar;

    // Aplicar redondeo al entero más cercano si el empleado lo tiene activo
    if (empleado.redondeo_activo) {
        totalCobrar = Math.round(totalCobrar);
    }

    // Calcular y guardar la cantidad redondeada (diferencia entre el valor redondeado y el original)
    empleado.redondeo = empleado.redondeo_activo ? (totalCobrar - totalOriginal) : 0;
    empleado.total_cobrar = totalCobrar.toFixed(2); // Guardar en el empleado objeto

    return totalCobrar.toFixed(2);
}

/**
 * GENERAR FILA DE TOTALES POR DEPARTAMENTO
 * @param {array} empleados Lista de empleados del departamento para calcular los totales
 * @returns {string} HTML de la fila de totales para el departamento
 */
function generarFilaTotalesDepartamento(empleados) {
    // Inicializar objeto para almacenar totales
    const totales = {
        salarioSemanal: 0,
        extras: 0,
        totalPercepciones: 0,
        isr: 0,
        imss: 0,
        infonavit: 0,
        ajustes: 0,
        inasistencias: 0,
        permiso: 0,
        retardos: 0,
        uniformes: 0,
        checador: 0,
        faGafetCofia: 0,
        totalDeducciones: 0,
        netoRecibir: 0,
        tarjeta: 0,
        importeEfectivo: 0,
        prestamo: 0,
        totalRecibir: 0,
        redondeo: 0,
        totalCobrar: 0
    };

    // Función auxiliar para buscar concepto en un empleado
    const buscarConceptoEmpleado = (empleado, codigo) => {
        if (!Array.isArray(empleado.conceptos)) return 0;
        const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
        return concepto ? (parseFloat(concepto.resultado) || 0) : 0;
    };

    // Iterar sobre todos los empleados y acumular los totales
    empleados.forEach(empleado => {
        // Sumar componentes de percepciones
        totales.salarioSemanal += parseFloat(empleado.salario_semanal) || 0;
        totales.extras += parseFloat(empleado.sueldo_extra_total) || 0;

        // Calcular y sumar total percepciones
        const percepcionesEmpleado = calcularTotalPercepciones(empleado);
        totales.totalPercepciones += parseFloat(percepcionesEmpleado) || 0;

        // Sumar conceptos (deducciones)
        totales.isr += buscarConceptoEmpleado(empleado, '45');
        totales.imss += buscarConceptoEmpleado(empleado, '52');
        totales.infonavit += buscarConceptoEmpleado(empleado, '16');
        totales.ajustes += buscarConceptoEmpleado(empleado, '107');

        // Sumar deducciones individuales
        totales.inasistencias += parseFloat(empleado.inasistencia) || 0;
        totales.permiso += parseFloat(empleado.permiso) || 0;
        totales.retardos += parseFloat(empleado.retardos) || 0;
        totales.uniformes += parseFloat(empleado.uniformes) || 0;
        totales.checador += parseFloat(empleado.checador) || 0;
        totales.faGafetCofia += parseFloat(empleado.fa_gafet_cofia) || 0;

        // Calcular y sumar total deducciones
        const deduccionesEmpleado = calcularTotalDeducciones(empleado);
        totales.totalDeducciones += parseFloat(deduccionesEmpleado) || 0;

        // Sumar tarjeta y calcular importe en efectivo
        totales.tarjeta += parseFloat(empleado.tarjeta) || 0;

        // Sumar prestamos
        totales.prestamo += parseFloat(empleado.prestamo) || 0;

        // Sumar redondeado y total cobrar
        totales.redondeo += parseFloat(empleado.redondeo) || 0;
        const totalCobrar = parseFloat(calcularTotalCobrar(empleado)) || 0;
        totales.totalCobrar += totalCobrar;
    });

    // Calcular valores derivados
    totales.netoRecibir = totales.totalPercepciones - totales.totalDeducciones;
    totales.importeEfectivo = totales.netoRecibir - totales.tarjeta;
    totales.totalRecibir = totales.importeEfectivo - totales.prestamo;

    // Usar la función auxiliar global para formatear valores en la fila de totales
    const formatearTotalValor = (valor, alwaysNegative = false) => formatearMonedaMXN(valor, alwaysNegative);

    // Generar fila HTML de totales con estilo distintivo
    const filaTotal = `
        <tr style="background-color: #e8f4f8; font-weight: bold; border-top: 2px solid #333;">
            <td colspan="1" style="text-align: center;">-</td>
            <td style="text-align: right;">TOTAL</td>
            <td>${formatearTotalValor(totales.salarioSemanal)}</td>
            <td>${formatearTotalValor(totales.extras)}</td>
            <td>${formatearTotalValor(totales.totalPercepciones)}</td>
            
            <!-- Deducciones totales por concepto -->
            <td>${formatearTotalValor(totales.isr, true)}</td> <!-- ISR -->
            <td>${formatearTotalValor(totales.imss, true)}</td> <!-- IMSS -->
            <td>${formatearTotalValor(totales.infonavit, true)}</td> <!-- INFONAVIT -->
            <td>${formatearTotalValor(totales.ajustes, true)}</td> <!-- AJUSTES AL SUB -->
            
            <td>${formatearTotalValor(totales.inasistencias, true)}</td> <!-- AUSENTISMO -->
            <td>${formatearTotalValor(totales.permiso, true)}</td> <!-- PERMISO -->
            <td>${formatearTotalValor(totales.retardos, true)}</td> <!-- RETARDOS -->
            <td>${formatearTotalValor(totales.uniformes, true)}</td> <!-- UNIFORMES -->
            <td>${formatearTotalValor(totales.checador, true)}</td> <!-- CHECADOR -->
            <td>${formatearTotalValor(totales.faGafetCofia, true)}</td> <!-- F.A/GAFET/COFIA -->
            
            <td>${formatearTotalValor(totales.totalDeducciones, true)}</td> <!-- TOTAL DEDUCCIONES -->
            <td>${formatearTotalValor(totales.netoRecibir)}</td> <!-- NETO A RECIBIR -->
            <td>${formatearTotalValor(totales.tarjeta, true)}</td> <!-- DISPERSION DE TARJETA -->
            <td>${formatearTotalValor(totales.importeEfectivo)}</td> <!-- IMPORTE EN EFECTIVO -->
            <td>${formatearTotalValor(totales.prestamo, true)}</td> <!-- PRÉSTAMO -->
            <td>${formatearTotalValor(totales.totalRecibir)}</td> <!-- TOTAL A RECIBIR -->
            
            <td class="${totales.redondeo < 0 ? 'redondeo-negativo' : 'redondeo-positivo'}">${formatearTotalValor(totales.redondeo)}</td> <!-- REDONDEADO -->
            <td><strong>${formatearTotalValor(totales.totalCobrar)}</strong></td> <!-- TOTAL EFECTIVO REDONDEADO -->
        </tr>
    `;

    return filaTotal;
}


