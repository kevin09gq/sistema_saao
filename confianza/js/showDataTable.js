// Variable global para rastrear la página actual
var paginaActualNomina = 1;

function setInitialVisibility() {
    $('#container-nomina').attr('hidden', true);
    $("#tabla-nomina-responsive").removeAttr("hidden");
}


function mostrarDatosTabla(jsonNominaConfianza, pagina = 1) {
    const empleadosPorPagina = 7;

    // Obtener todos los empleados de todos los departamentos
    let todosEmpleados = [];
    jsonNominaConfianza.departamentos.forEach(departamento => {
        // Filtrar solo empleados con mostrar=true
        const empleadosFiltrados = departamento.empleados.filter(emp => emp.mostrar !== false);
        todosEmpleados = todosEmpleados.concat(empleadosFiltrados);
    });
    // Ordenar todos los empleados A→Z por nombre (sin modificar el JSON original)
    todosEmpleados.sort((a, b) => {
        return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
    });

    // Calcular índices para la paginación
    const inicio = (pagina - 1) * empleadosPorPagina;
    const fin = inicio + empleadosPorPagina;
    const empleadosPagina = todosEmpleados.slice(inicio, fin);

    // Limpiar la tabla
    $('#tabla-nomina-body').empty();

    // Mostrar empleados de la página actual
    empleadosPagina.forEach((empleado, index) => {
        const numeroFila = inicio + index + 1;

        // Función para buscar concepto por código (segura si no existe 'conceptos')
        const buscarConcepto = (codigo) => {
            if (!Array.isArray(empleado.conceptos)) return '0.00';
            const concepto = empleado.conceptos.find(c => String(c.codigo) === String(codigo));
            if (concepto) {
                const valor = parseFloat(concepto.resultado) || 0;
                return valor.toFixed(2);
            }
            return '0.00';
        };

        // Función para formatear valores (mostrar — si es 0.00)
        // alwaysNegative: si true, forzar visualmente el signo negativo aunque el valor sea positivo
        const formatearValor = (valor, alwaysNegative = false) => {
            const num = parseFloat(valor) || 0;
            if (num === 0) return '<span class="valor-vacio">—</span>';
            const abs = Math.abs(num).toFixed(2);
            const mostrarNegativo = (num < 0) || (alwaysNegative && num >= 0);
            if (mostrarNegativo) {
                return `<span class="valor-negativo">-${abs}</span>`;
            }
            return abs;
        }; 

        // Calcular Total Percepciones
        const totalPercepciones = calcularTotalPercepciones(empleado);

        // Calcular Total Deducciones
        const totalDeducciones = calcularTotalDeducciones(empleado);

        const totalNetoRecibir = (parseFloat(totalPercepciones) - parseFloat(totalDeducciones)).toFixed(2);

        // Calcular Total a Cobrar
        const totalCobrar = calcularTotalCobrar(empleado);

        // Calcular importe en efectivo: totalCobrar - DISPERSION DE TARJETA (empleado.tarjeta)
        const tarjetaVal = parseFloat(empleado.tarjeta) || 0;
        const importeEfectivo = (parseFloat(totalNetoRecibir) || 0) - tarjetaVal;

        //Calcular TOTAL A RECIBIR
        const totalARecibir = importeEfectivo - (parseFloat(empleado.prestamo) || 0);

        const fila = `
            <tr data-clave="${empleado.clave || 'N/A'}" data-id-empresa="${empleado.id_empresa || 1}">
                <td>${numeroFila}</td>
                <td>${empleado.nombre}</td>
                <td>${formatearValor(empleado.sueldo_semanal || 0)}</td>
                <td>${formatearValor(empleado.sueldo_extra_total || 0)}</td>
                <td>${formatearValor(totalPercepciones)}</td>

                <!-- Deducciones individuales -->
                <td>${formatearValor(buscarConcepto('45'), true)}</td> <!-- ISR -->
                <td>${formatearValor(buscarConcepto('52'), true)}</td> <!-- IMSS -->
                <td>${formatearValor(buscarConcepto('16'), true)}</td> <!-- INFONAVIT -->
                <td>${formatearValor(buscarConcepto('107'), true)}</td> <!-- AJUSTES AL SUB -->

                <td>${formatearValor(empleado.inasistencia || 0, true)}</td> <!-- AUSENTISMO -->
                <td>${formatearValor(empleado.permiso || 0, true)}</td> <!-- PERMISO -->
                <td>${formatearValor(empleado.retardos || 0, true)}</td> <!-- RETARDOS -->
                <td>${formatearValor(empleado.uniformes || 0, true)}</td> <!-- UNIFORMES -->
                <td>${formatearValor(empleado.checador || 0, true)}</td> <!-- CHECADOR -->
                <td>${formatearValor(empleado.fa_gafet_cofia || 0, true)}</td> <!-- F.A/GAFET/COFIA -->

                <td>${formatearValor(totalDeducciones, true)}</td> <!-- TOTAL DEDUCCIONES -->
                <td>${formatearValor(totalNetoRecibir)}</td> <!-- NETO A RECIBIR -->
                <td>${formatearValor(empleado.tarjeta || 0, true)}</td> <!-- DISPERSION DE TARJETA -->
                <td>${formatearValor(importeEfectivo)}</td> <!-- IMPORTE EN EFECTIVO -->
                <td>${formatearValor(empleado.prestamo || 0, true)}</td> <!-- PRÉSTAMO -->

                <!-- TOTAL A RECIBIR -->
                <td>${formatearValor(totalARecibir || 0)}</td>
                
                <!-- REDONDEADO -->
                <td class="${parseFloat(empleado.redondeo) < 0 ? 'redondeo-negativo' : 'redondeo-positivo'}">${formatearValor(empleado.redondeo || 0)}</td>
                
                <!-- TOTAL EFECTIVO REDONDEADO -->
                 <td class="${totalCobrar < 0 ? 'sueldo-negativo' : ''}"><strong>${formatearValor(totalCobrar)}</strong></td>
             
            </tr>
        `;
        $('#tabla-nomina-body').append(fila);
    });

    // Crear la paginación
    paginarTabla(jsonNominaConfianza, todosEmpleados.length, pagina, empleadosPorPagina);
}

// Función para calcular Total Percepciones
function calcularTotalPercepciones(empleado) {
    const sueldo = parseFloat(empleado.sueldo_semanal) || 0;
    const extras = parseFloat(empleado.sueldo_extra_total) || 0;
    
    // Sumar extras_adicionales (conceptos personalizados de percepciones)
    let extrasAdicionales = 0;
    if (Array.isArray(empleado.extras_adicionales)) {
        empleado.extras_adicionales.forEach(extra => {
            extrasAdicionales += parseFloat(extra.resultado) || 0;
        });
    }
    
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
    
    // Sumar deducciones_adicionales (deducciones personalizadas)
    let deduccionesAdicionales = 0;
    if (Array.isArray(empleado.deducciones_adicionales)) {
        empleado.deducciones_adicionales.forEach(deduccion => {
            deduccionesAdicionales += parseFloat(deduccion.resultado) || parseFloat(deduccion.valor) || parseFloat(deduccion.monto) || 0;
        });
    }

    const total = retardos + isr + imss + ajusteSub + infonavit + permiso + inasistencias + uniformes + checador  + deduccionesAdicionales;
    return total.toFixed(2);
}

// Función para calcular Total a Cobrar (Neto a Recibir)
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