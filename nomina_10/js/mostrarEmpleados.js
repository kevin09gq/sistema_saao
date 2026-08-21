//  VARIABLES PARA LA PAGINACIÓN

// Cantidad de empleados que se mostrarán por página
const registrosPorPagina = 7;

// Página actual que se está visualizando
let paginaActual = 1;

//======================================================================
// FUNCIÓN PARA LLENAR LA TABLA DE LA NÓMINA
// MUESTRA UNICAMENTE LOS EMPLEADOS DE LA PÁGINA ACTUAL EN LA TABLA
// Y QUE CONTENGAN LA PROPIEDAD MOSTRAR EN TRUE, ES DECIR, QUE NO ESTÉN OCULTOS
//======================================================================

function llenarTablaNomina() {

    // Limpiar el contenido actual de la tabla
    $('#tabla-nomina-body-10lbs').empty();

    // Obtener el departamento seleccionado
    let filtro = $('#filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#busqueda-nomina-10lbs').val().trim().toUpperCase();

    // Separar id_empresa e id_departamento
    let datos = filtro.split("|");

    let idEmpresa = Number(datos[0]);
    let idDepartamento = Number(datos[1]);
    let tipoEmpleado = datos[2];

    // Calcular el primer y último registro que se mostrarán en la página
    let inicio = (paginaActual - 1) * registrosPorPagina;
    let fin = paginaActual * registrosPorPagina;

    // Contador general de empleados recorridos
    let contador = 0;

    // Número consecutivo que aparecerá en la columna "#"
    let numeroFila = inicio + 1;

    // Recorrer todos los departamentos
    jsonNomina10lbs.departamentos.forEach(departamento => {

        if (departamento.id_empresa != idEmpresa || departamento.id_departamento != idDepartamento) {
            return;
        }

        // Recorrer todos los empleados del departamento
        departamento.empleados.forEach(empleado => {

            // Verificar si el empleado está oculto, si es así, no mostrarlo
            if (empleado.mostrar === false) {
                return;
            }

            // Si se seleccionó CSS,
            // solamente mostrar empleados con seguro social
            if (tipoEmpleado === "CSS" && !empleado.seguroSocial) {
                return;
            }

            // Si se seleccionó SSS,
            // solamente mostrar empleados sin seguro social
            if (tipoEmpleado === "SSS" && empleado.seguroSocial) {
                return;
            }



            // Si existe un texto de búsqueda, buscar por nombre o clave
            if (textoBusqueda != "") {

                let nombreEmpleado = empleado.nombre.toUpperCase();
                let claveEmpleado = empleado.clave.toUpperCase();

                // Si no coincide el nombre ni la clave, pasar al siguiente empleado
                if (!nombreEmpleado.includes(textoBusqueda) &&
                    !claveEmpleado.includes(textoBusqueda)) {
                    return;
                }

            }


            // Verificar si el empleado pertenece al rango de la página actual
            if (contador >= inicio && contador < fin) {

                // Agregar la fila del empleado a la tabla
                $('#tabla-nomina-body-10lbs').append(`
                    <tr data-id-empleado="${empleado.id_empleado}">
                      
                        <td>${numeroFila}</td>
                        <td>${empleado.nombre}</td>
                        <td>${formatoMoneda(empleado.sueldo_neto)}</td>
                        <td>${formatoMoneda(obtenerSueldoExtraTotal(empleado))}</td>
                        <td>${formatoMoneda(obtenerTotalPercepciones(empleado))}</td>

                        <td>${formatoMoneda(obtenerConcepto(empleado, 45))}</td>
                        <td>${formatoMoneda(obtenerConcepto(empleado, 52))}</td>
                        <td>${formatoMoneda(obtenerConcepto(empleado, 16))}</td>
                        <td>${formatoMoneda(obtenerConcepto(empleado, 107))}</td> 
                        <td>${formatoMoneda(empleado.permiso)}</td>
                        <td>${formatoMoneda(empleado.uniformes)}</td>    
                        <td>${formatoMoneda(empleado.checador)}</td>
                        <td>${formatoMoneda(obtenerTotalFAGafetCofia(empleado))}</td>
                        <td>${formatoMoneda(obtenerTotalDeducciones(empleado))}</td>

                        <td>${formatoMoneda(obtenerNetoPagar(empleado))}</td>
                        <td>${formatoMoneda(empleado.tarjeta)}</td>
                        <td>${formatoMoneda(obtenerImporteEfectivo(empleado))}</td>
                        <td>${formatoMoneda(empleado.prestamo)}</td>
                        <td>${formatoMoneda(obtenerTotalRecibir(empleado))}</td>
                        <td class="${parseFloat(empleado.redondeo) < 0 ? 'redondeo-negativo' : 'redondeo-positivo'}">${formatoMoneda(empleado.redondeo || 0)}</td>
                        <td>${formatoMoneda(obtenerTotalCobrar(empleado))}</td>
                     
                    </tr>
                `);
                // Incrementar el número consecutivo
                numeroFila++;
            }
            // Incrementar el contador general de empleados
            contador++;

        });

    });

    // Calcular y pintar los totales de cada columna en el pie de la tabla
    //  calcularTotalesPorColumna();


    crearPaginacion();

}

//======================================================================
// FUNCIÓN PARA CALCULAR Y RENDERIZAR LOS TOTALES DE CADA COLUMNA
//======================================================================

function calcularTotalesPorColumna() {

    // Limpiar el contenido actual del pie de la tabla
    $('#tabla-nomina-foot-10lbs').empty();

    // Obtener el departamento seleccionado
    let filtro = $('#filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#busqueda-nomina-10lbs').val().trim().toUpperCase();

    let datos = filtro.split("|");

    let idEmpresa = Number(datos[0]);
    let idDepartamento = Number(datos[1]);


    // Estructura de acumuladores para cada columna
    let totales = {
        empleados: 0,
        salarioSemanal: 0,
        extras: 0,
        totalPercepciones: 0,
        isr: 0,
        imss: 0,
        infonavit: 0,
        ajusteSub: 0,
        inasistencia: 0,
        permiso: 0,
        retardos: 0,
        uniformes: 0,
        checador: 0,
        faGafetCofia: 0,
        totalDeducciones: 0,
        netoPagar: 0,
        tarjeta: 0,
        importeEfectivo: 0,
        prestamo: 0,
        totalRecibir: 0,
        redondeo: 0,
        totalCobrar: 0
    };

    // Recorrer los departamentos
    jsonNomina10lbs.departamentos.forEach(departamento => {

        // Solo trabajar con el departamento seleccionado
        if (
            departamento.id_empresa != idEmpresa ||
            departamento.id_departamento != idDepartamento
        ) {
            return;
        }

        // Recorrer los empleados del departamento
        departamento.empleados.forEach(empleado => {

            // Verificar si el empleado está oculto
            if (empleado.mostrar === false) {
                return;
            }



            // Si existe texto de búsqueda, filtrar por nombre o clave
            if (textoBusqueda != "") {

                let nombreEmpleado = empleado.nombre.toUpperCase();
                let claveEmpleado = empleado.clave.toUpperCase();

                if (!nombreEmpleado.includes(textoBusqueda) &&
                    !claveEmpleado.includes(textoBusqueda)) {
                    return;
                }

            }

            // Acumular los totales de cada columna
            totales.empleados++;
            totales.salarioSemanal += parseFloat(empleado.sueldo_neto || 0);
            totales.extras += parseFloat(obtenerSueldoExtraTotal(empleado) || 0);
            totales.totalPercepciones += parseFloat(obtenerTotalPercepciones(empleado) || 0);

            totales.isr += parseFloat(obtenerConcepto(empleado, 45) || 0);
            totales.imss += parseFloat(obtenerConcepto(empleado, 52) || 0);
            totales.infonavit += parseFloat(obtenerConcepto(empleado, 16) || 0);
            totales.ajusteSub += parseFloat(obtenerConcepto(empleado, 107) || 0);
            totales.inasistencia += parseFloat(empleado.inasistencia || 0);
            totales.permiso += parseFloat(empleado.permiso || 0);
            totales.retardos += parseFloat(empleado.retardos || 0);
            totales.uniformes += parseFloat(empleado.uniformes || 0);
            totales.checador += parseFloat(empleado.checador || 0);
            totales.faGafetCofia += parseFloat(obtenerTotalFAGafetCofia(empleado) || 0);
            totales.totalDeducciones += parseFloat(obtenerTotalDeducciones(empleado) || 0);

            totales.netoPagar += parseFloat(obtenerNetoPagar(empleado) || 0);
            totales.tarjeta += parseFloat(empleado.tarjeta || 0);
            totales.importeEfectivo += parseFloat(obtenerImporteEfectivo(empleado) || 0);
            totales.prestamo += parseFloat(empleado.prestamo || 0);
            totales.totalRecibir += parseFloat(obtenerTotalRecibir(empleado) || 0);

            let cobro = obtenerTotalCobrar(empleado);
            totales.redondeo += parseFloat(empleado.redondeo || 0);
            totales.totalCobrar += parseFloat(cobro || 0);

        });

    });

    // Agregar la fila de totales al pie de la tabla
    $('#tabla-nomina-foot-10lbs').append(`
        <tr>
            <td><strong>TOTALES</strong></td>
            <td><strong>${totales.empleados} Empleado(s)</strong></td>
            <td><strong>${formatoMoneda(totales.sueldo_neto)}</strong></td>
            <td><strong>${formatoMoneda(totales.extras)}</strong></td>
            <td><strong>${formatoMoneda(totales.totalPercepciones)}</strong></td>

            <td><strong>${formatoMoneda(totales.isr)}</strong></td>
            <td><strong>${formatoMoneda(totales.imss)}</strong></td>
            <td><strong>${formatoMoneda(totales.infonavit)}</strong></td>
            <td><strong>${formatoMoneda(totales.ajusteSub)}</strong></td>
            <td><strong>${formatoMoneda(totales.inasistencia)}</strong></td>
            <td><strong>${formatoMoneda(totales.permiso)}</strong></td>
            <td><strong>${formatoMoneda(totales.retardos)}</strong></td>
            <td><strong>${formatoMoneda(totales.uniformes)}</strong></td>
            <td><strong>${formatoMoneda(totales.checador)}</strong></td>
            <td><strong>${formatoMoneda(totales.faGafetCofia)}</strong></td>
            <td><strong>${formatoMoneda(totales.totalDeducciones)}</strong></td>

            <td><strong>${formatoMoneda(totales.netoPagar)}</strong></td>
            <td><strong>${formatoMoneda(totales.tarjeta)}</strong></td>
            <td><strong>${formatoMoneda(totales.importeEfectivo)}</strong></td>
            <td><strong>${formatoMoneda(totales.prestamo)}</strong></td>
            <td><strong>${formatoMoneda(totales.totalRecibir)}</strong></td>
            <td class="${totales.redondeo < 0 ? 'redondeo-negativo' : 'redondeo-positivo'}"><strong>${formatoMoneda(totales.redondeo)}</strong></td>
            <td class="${totales.totalCobrar < 0 ? 'sueldo-negativo' : ''}"><strong>${formatoMoneda(totales.totalCobrar)}</strong></td>
        </tr>
    `);

}

//======================================================================
// FUNCIÓN PARA CREAR LA PAGINACIÓN
// GENERA LOS BOTONES DE ACUERDO CON LA CANTIDAD DE EMPLEADOS
// DEL DEPARTAMENTO Y TIPO (CSS O SSS) SELECCIONADO.
//======================================================================

function crearPaginacion() {

    // Obtener el departamento seleccionado
    let filtro = $('#filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#busqueda-nomina-10lbs').val().trim().toUpperCase();


    // El valor tiene el formato: "idDepartamento-TipoEmpleado"
    let datos = filtro.split("|");

    let idEmpresa = Number(datos[0]);
    let idDepartamento = Number(datos[1]);
    let tipoEmpleado = datos[2];


    // Variable para almacenar el total de empleados que cumplen el filtro
    let totalEmpleados = 0;

    // Recorrer los departamentos
    jsonNomina10lbs.departamentos.forEach(departamento => {

        // Solo trabajar con el departamento seleccionado
        if (
            departamento.id_empresa != idEmpresa ||
            departamento.id_departamento != idDepartamento
        ) {
            return;
        }
        // Recorrer los empleados del departamento
        departamento.empleados.forEach(empleado => {

            // Verificar si el empleado está oculto, si es así, no mostrarlo
            if (empleado.mostrar === false) {
                return;
            }

            // Si se seleccionó CSS, contar únicamente empleados con seguro social
            if (tipoEmpleado == "CSS" && !empleado.seguroSocial) {
                return;
            }

            // Si se seleccionó SSS, contar únicamente empleados sin seguro social
            if (tipoEmpleado == "SSS" && empleado.seguroSocial) {
                return;
            }


            // Si existe un texto de búsqueda, buscar por nombre o clave
            if (textoBusqueda != "") {

                let nombreEmpleado = empleado.nombre.toUpperCase();
                let claveEmpleado = empleado.clave.toUpperCase();

                // Si no coincide el nombre ni la clave, pasar al siguiente empleado
                if (!nombreEmpleado.includes(textoBusqueda) &&
                    !claveEmpleado.includes(textoBusqueda)) {
                    return;
                }

            }

            // Incrementar el total de empleados que se mostrarán
            totalEmpleados++;

        });

    });

    // Calcular el número total de páginas
    let totalPaginas = Math.ceil(totalEmpleados / registrosPorPagina);

    // Si la página actual sobrepasa el total de páginas, ajustarla
    if (paginaActual > totalPaginas && totalPaginas > 0) {
        paginaActual = totalPaginas;
    } else if (totalPaginas === 0) {
        paginaActual = 1;
    }

    // Limpiar la paginación actual
    $('#paginacion-nomina').empty();

    // Crear un botón por cada página
    for (let i = 1; i <= totalPaginas; i++) {

        $('#paginacion-nomina').append(`
            <li class="page-item ${i == paginaActual ? 'active' : ''}">
                <button class="page-link" onclick="cambiarPagina(${i})">
                    ${i}
                </button>
            </li>
        `);

    }

}

//======================================================================
// FUNCIÓN PARA CAMBIAR DE PÁGINA
// ACTUALIZA LA PÁGINA ACTUAL Y VUELVE A CARGAR LA TABLA CON LOS REGISTROS DE ESA PÁGINA
//======================================================================

function cambiarPagina(pagina) {

    // Guardar la página seleccionada
    paginaActual = pagina;

    // Volver a llenar la tabla con los registros de la nueva página
    llenarTablaNomina();

}

//======================================================================
// FUNCIÓN PARA FORMATEAR UNA CANTIDAD EN MONEDA MEXICANA
//======================================================================

function formatoMoneda(cantidad) {

    // Convertir a número
    cantidad = Number(cantidad);

    if (!cantidad) {
        return '<span class="valor-vacio">—</span>';
    }


    // Regresar la cantidad en formato de moneda mexicana
    return cantidad.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });

}

//======================================================================
// FUNCIÓN PARA OBTENER EL RESULTADO DE UN CONCEPTO DEL EMPLEADO 
// PARA MOSTRARLO EN LA TABLA DE LA NÓMINA 40 LBS
//======================================================================

function obtenerConcepto(empleado, codigo) {

    // Verificar que el empleado tenga conceptos
    if (!empleado.conceptos) {
        return 0;
    }

    // Recorrer los conceptos del empleado
    for (const concepto of empleado.conceptos) {

        // Comparar el código
        if (concepto.codigo == codigo) {
            return Number(concepto.resultado);
        }

    }

    // Si el concepto no existe regresar 0
    return 0;

}

//=================================================================
// FUNCIÓN PARA ACTUALIZAR EL TOTAL DE SUELDO EXTRA DEL EMPLEADO
// Calcula el sueldo_extra_total a partir de sus componentes y 
// percepciones extras
//=================================================================

function obtenerSueldoExtraTotal(empleado) {
    let total = 0;

    // Sumar las percepciones extras del arreglo
    let totalPercepcionesExtras = 0;
    if (empleado.percepciones_extra) {
        for (let i = 0; i < empleado.percepciones_extra.length; i++) {
            totalPercepcionesExtras += parseFloat(empleado.percepciones_extra[i].cantidad) || 0;
        }
    }

    // Actualizar la propiedad sueldo_extra_total en el empleado
    empleado.sueldo_extra_total = totalPercepcionesExtras;
    return empleado.sueldo_extra_total;
}



//==========================================================
// FUNCIÓN PARA OBTENER EL TOTAL DE PERCEPCIONES
// Calcula el sueldo_extra_total a partir de sus componentes
// y percepciones extras para que siempre esté actualizado
//==========================================================

function obtenerTotalPercepciones(empleado) {

    let total = 0;

    total += parseFloat(empleado.sueldo_neto || 0);

    total += empleado.sueldo_extra_total;

    return parseFloat(total.toFixed(2));

}

//==========================================================
// FUNCIÓN PARA OBTENER EL TOTAL DE FA/ GAFET / COFIA
// Calcula fa_gafet_cofia a partir de las deducciones extras
// para que siempre esté actualizado
//==========================================================

function obtenerTotalFAGafetCofia(empleado) {
    // Sumar las deducciones extras del arreglo
    let totalDeduccionesExtras = 0;
    if (empleado.deducciones_extra) {
        for (let i = 0; i < empleado.deducciones_extra.length; i++) {
            totalDeduccionesExtras += parseFloat(empleado.deducciones_extra[i].cantidad) || 0;
        }
    }

    // Actualizar la propiedad fa_gafet_cofia en el empleado
    empleado.fa_gafet_cofia = totalDeduccionesExtras;
    return empleado.fa_gafet_cofia;
}

//==========================================================
// FUNCIÓN PARA OBTENER EL TOTAL DE DEDUCCIONES
// Calcula fa_gafet_cofia a partir de las deducciones extras
// para que siempre esté actualizado
//==========================================================

function obtenerTotalDeducciones(empleado) {

    let total = 0;

    // Conceptos
    total += parseFloat(obtenerConcepto(empleado, 45) || 0);   // ISR
    total += parseFloat(obtenerConcepto(empleado, 52) || 0);   // IMSS
    total += parseFloat(obtenerConcepto(empleado, 16) || 0);   // INFONAVIT
    total += parseFloat(obtenerConcepto(empleado, 107) || 0);  // Ajuste al Subsidio

    // Deducciones
    total += parseFloat(empleado.retardos || 0);
    total += parseFloat(empleado.inasistencia || 0);
    total += parseFloat(empleado.permiso || 0);
    total += parseFloat(empleado.uniformes || 0);
    total += parseFloat(empleado.checador || 0);
    total += parseFloat(empleado.fa_gafet_cofia || 0);

    return parseFloat(total.toFixed(2));

}

//==========================================================
// FUNCIÓN PARA OBTENER EL NETO A PAGAR DEL EMPLEADO
//==========================================================

function obtenerNetoPagar(empleado) {

    let totalPercepciones = obtenerTotalPercepciones(empleado);

    let totalDeducciones = obtenerTotalDeducciones(empleado);

    return parseFloat((totalPercepciones - totalDeducciones).toFixed(2));
}

//==========================================================
// FUCNCIÓN PARA OBTENER EL IMPORTE EN EFECTIVO DE 
// LOS EMPLEADOS
//==========================================================

function obtenerImporteEfectivo(empleado) {

    let tarjeta = parseFloat(empleado.tarjeta || 0);

    let netoPagar = obtenerNetoPagar(empleado);

    return parseFloat((netoPagar - tarjeta).toFixed(2));

}

//==========================================================
// FUCNCIÓN PARA OBTENER EL TOTAL A RECIBIR DE
// LOS EMPLEADOS
//==========================================================

function obtenerTotalRecibir(empleado) {

    let prestamo = parseFloat(empleado.prestamo || 0);

    let importeEfectivo = obtenerImporteEfectivo(empleado);

    return parseFloat((importeEfectivo - prestamo).toFixed(2));

}

//==========================================================
// FUNCIÓN PARA OBTENER EL TOTAL A COBRAR
//==========================================================

function obtenerTotalCobrar(empleado) {

    // Obtener total sin redondear
    let total = obtenerTotalRecibir(empleado);

    // Aplicar redondeo si está activo
    if (empleado.redondeo_activo) {

        let totalRedondeado = Math.round(total);

        empleado.redondeo = parseFloat(
            (totalRedondeado - total).toFixed(2)
        );

        empleado.total_cobrar = parseFloat(
            totalRedondeado.toFixed(2)
        );

    } else {

        empleado.redondeo = 0;

        empleado.total_cobrar = parseFloat(
            total.toFixed(2)
        );

    }


    return empleado.total_cobrar;

}