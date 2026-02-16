function mostrarDatosTabla(jsonNominaRelicario, pagina = 1) {
    const empleadosPorPagina = 7;

    // Obtener todos los empleados de todos los departamentos o solo del departamento especificado
    let todosEmpleados = [];
    jsonNominaRelicario.departamentos.forEach(depto => {
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
    $('#tabla-nomina-body-relicario').empty();

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
            const totalPercepciones = 0
        // const totalPercepciones = calcularTotalPercepciones(empleado);

        // Calcular Total Deducciones
        // const totalDeducciones = calcularTotalDeducciones(empleado);

        // const totalNetoRecibir = (parseFloat(totalPercepciones) - parseFloat(totalDeducciones)).toFixed(2);

        // Calcular Total a Cobrar
        // const totalCobrar = calcularTotalCobrar(empleado);

        // Calcular importe en efectivo: totalCobrar - DISPERSION DE TARJETA (empleado.tarjeta)
        // const tarjetaVal = parseFloat(empleado.tarjeta) || 0;
        //const importeEfectivo = (parseFloat(totalNetoRecibir) || 0) - tarjetaVal;

        //Calcular TOTAL A RECIBIR
        //  const totalARecibir = importeEfectivo - (parseFloat(empleado.prestamo) || 0);

        const fila = `
            <tr data-clave="${empleado.clave || 'N/A'}" data-id-empresa="${empleado.id_empresa || 1}" data-id-tipo-puesto="${empleado.id_tipo_puesto || 0}">
                <td>${numeroFila}</td>
                <td>${empleado.nombre}</td>
                <td>${formatearValor(empleado.sueldo_neto || 0)}</td>
                <td>${formatearValor(empleado.pasaje || 0)}</td>
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

                <td></td> <!-- TOTAL DEDUCCIONES -->
                <td></td> <!-- NETO A RECIBIR -->
                <td>${formatearValor(empleado.tarjeta || 0, true)}</td> <!-- DISPERSION DE TARJETA -->
                <td></td> <!-- IMPORTE EN EFECTIVO -->
                <td>${formatearValor(empleado.prestamo || 0, true)}</td> <!-- PRÉSTAMO -->

                <!-- TOTAL A RECIBIR -->
                <td></td>
                
                <!-- REDONDEADO -->
                <td class="${parseFloat(empleado.redondeo) < 0 ? 'redondeo-negativo' : 'redondeo-positivo'}">${formatearValor(empleado.redondeo || 0)}</td>
                
                <!-- TOTAL EFECTIVO REDONDEADO -->
                 <td class=""></td>
             
            </tr>
        `;
        $('#tabla-nomina-body-relicario').append(fila);
    });

    // Crear la paginación
    paginarTabla(jsonNominaRelicario, todosEmpleados.length, pagina, empleadosPorPagina);
}



function paginarTabla(jsonNominaRelicario, totalEmpleados, paginaActual, empleadosPorPagina) {
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
        mostrarDatosTabla(jsonNominaRelicario, nuevaPagina);
    });
}