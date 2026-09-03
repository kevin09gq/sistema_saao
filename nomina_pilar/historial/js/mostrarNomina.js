jsonHistorialPilar = null

//  VARIABLES PARA LA PAGINACIÓN

// Cantidad de empleados que se mostrarán por página
const registrosPorPagina = 7;

// Página actual que se está visualizando
let paginaActual = 1;


//===================================================
// EJECUTAR LA OBTENCIÓN DE LA NÓMINA AL CARGAR LA PÁGINA
//===================================================

$(document).ready(function () {

    // obtener la nómina seleccionada
    obtenerNomina();

    eventoFiltroDepartamento();
    eventoBusquedaEmpleado();
    limpiarBusqueda();
    mostrarContextMenu();
    mostrarModalHistorialEmpleado();
    regresarHistorialPilar();


});


//===================================================
// FUNCIÓN PARA OBTENER EL ID DE LA NÓMINA DESDE LA URL
//===================================================

function obtenerIdNomina() {

    // obtener los parámetros de la dirección actual
    var parametros = new URLSearchParams(window.location.search);

    // regresar el id de la nómina
    return parametros.get('id_nomina_pilar');

}

//===================================================
// FUNCIÓN PARA OBTENER LA NÓMINA DESDE LA BASE DE DATOS
//===================================================

function obtenerNomina() {

    // obtener el id de la nómina desde la url
    var idNomina = obtenerIdNomina();

    // validar que exista el id
    if (!idNomina) {

        console.error('No se recibió el ID de la nómina.');

        return;
    }

    // consultar la nómina seleccionada
    $.ajax({

        url: '../php/historialNominas.php',

        type: 'GET',

        dataType: 'json',

        data: {
            accion: 'obtenerNominaPorId',
            id_nomina: idNomina
        },

        success: function (respuesta) {

            // mostrar la respuesta recibida
            console.log('Respuesta recibida:', respuesta);

            // validar si la respuesta fue correcta
            if (!respuesta.success) {

                console.error('Error del servidor:', respuesta.mensaje);

                return;
            }

            // obtener la información de la nómina
            var nomina = respuesta.nomina;

            jsonHistorialPilar = nomina.nomina_pilar;

            // llenar el filtro de departamentos
            cargarFiltroDepartamentos();

            // llenar la tabla de la nómina
            llenarTablaNominaHistorial();

        },

        error: function (xhr, status, error) {

            // mostrar el código de respuesta
            console.error('HTTP:', xhr.status);

            // mostrar el estado de jquery
            console.error('Status:', status);

            // mostrar el error de jquery
            console.error('Error:', error);

            // mostrar la respuesta completa del servidor
            console.error('Respuesta:', xhr.responseText);

        }

    });

}


function llenarTablaNominaHistorial() {

    // Limpiar el contenido actual de la tabla
    $('#detalle-tabla-nomina-body-pilar').empty();

    // Obtener el departamento seleccionado
    let filtro = $('#detalle-filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#detalle-busqueda-nomina-pilar').val().trim().toUpperCase();

    let datos = filtro.split("-");

    let idDepartamento = Number(datos[0]);


    // Calcular el primer y último registro que se mostrarán en la página
    let inicio = (paginaActual - 1) * registrosPorPagina;
    let fin = paginaActual * registrosPorPagina;

    // Contador general de empleados recorridos
    let contador = 0;

    // Número consecutivo que aparecerá en la columna "#"
    let numeroFila = inicio + 1;

    // Recorrer todos los departamentos
    jsonHistorialPilar.departamentos.forEach(departamento => {

        if (departamento.id_departamento != idDepartamento) {
            return;
        }

        // Recorrer todos los empleados del departamento
        departamento.empleados.forEach(empleado => {

            // Verificar si el empleado está oculto, si es así, no mostrarlo
            if (empleado.mostrar === false) {
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
                $('#detalle-tabla-nomina-body-pilar').append(`
                    <tr data-id-empleado="${empleado.id_empleado}">
                      
                        <td>${numeroFila}</td>
                        <td>${empleado.nombre}</td>
                        <td class="col-jornalero">${empleado.dias_trabajados || ""}</td>
                        <td>${formatoMoneda(empleado.salario_semanal || "")}</td>
                        <td>${formatoMoneda(empleado.pasaje || "")}</td>
                        <td>${formatoMoneda(empleado.comida || "")}</td>
                        <td>${formatoMoneda(empleado.sueldo_extra_total || "")}</td>
                        <td>${formatoMoneda(obtenerTotalPercepciones(empleado) || "")}</td>

                        <td>${formatoMoneda(obtenerConcepto(empleado, 45))}</td>
                        <td>${formatoMoneda(obtenerConcepto(empleado, 52))}</td>
                        <td>${formatoMoneda(obtenerConcepto(empleado, 16))}</td>
                        <td>${formatoMoneda(obtenerConcepto(empleado, 107))}</td> 
                        <td>${formatoMoneda(empleado.inasistencia)}</td>
                        <td>${formatoMoneda(empleado.permiso)}</td>
                        <td>${formatoMoneda(empleado.retardos)}</td>
                        <td>${formatoMoneda(empleado.uniformes)}</td>    
                        <td>${formatoMoneda(empleado.checador)}</td>
                        <td>${formatoMoneda(empleado.fa_gafet_cofia)}</td>
                        <td>${formatoMoneda(obtenerTotalDeducciones(empleado))}</td>

                        <td>${formatoMoneda(obtenerNetoPagar(empleado))}</td>
                        <td>${formatoMoneda(empleado.tarjeta)}</td>
                        <td>${formatoMoneda(obtenerImporteEfectivo(empleado))}</td>
                        <td>${formatoMoneda(empleado.prestamo)}</td>
                        <td>${formatoMoneda(obtenerTotalRecibir(empleado))}</td>
                        <td class="${parseFloat(empleado.redondeo) < 0 ? 'redondeo-negativo' : 'redondeo-positivo'}">${formatoMoneda(empleado.redondeo || 0)}</td>
                        <td class="${formatoMoneda(empleado.total_cobrar) < 0 ? 'sueldo-negativo' : ''}">${formatoMoneda(empleado.total_cobrar)}</td>

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
    calcularTotalesPorColumna();

    // Ocultar o mostrar la columna de Días Trabajados (col-jornalero) según el tipo_horario del departamento seleccionado
    let deptoSeleccionado = jsonHistorialPilar.departamentos.find(d => d.id_departamento == idDepartamento);
    if (deptoSeleccionado && deptoSeleccionado.tipo_horario == 1) {
        $('.col-jornalero').hide();
    } else {
        $('.col-jornalero').show();
    }

    crearPaginacion();

    actualizarCabeceraNomina(jsonHistorialPilar)

}


//======================================================================
// FUNCIÓN PARA CALCULAR Y RENDERIZAR LOS TOTALES DE CADA COLUMNA
//======================================================================

function calcularTotalesPorColumna() {

    // Limpiar el contenido actual del pie de la tabla
    $('#detalle-tabla-nomina-foot-pilar').empty();

    // Obtener el departamento seleccionado
    let filtro = $('#detalle-filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#detalle-busqueda-nomina-pilar').val().trim().toUpperCase();

    let datos = filtro.split("-");

    let idDepartamento = Number(datos[0]);


    // Estructura de acumuladores para cada columna
    let totales = {
        empleados: 0,
        diasTrabajados: 0,
        salarioSemanal: 0,
        pasaje: 0,
        comida: 0,
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
    jsonHistorialPilar.departamentos.forEach(departamento => {

        // Solo trabajar con el departamento seleccionado
        if (departamento.id_departamento != idDepartamento) {
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
            totales.diasTrabajados += parseInt(empleado.dias_trabajados || 0);
            totales.salarioSemanal += parseFloat(empleado.salario_semanal || 0);
            totales.pasaje += parseFloat(empleado.pasaje || 0);
            totales.comida += parseFloat(empleado.comida || 0);
            totales.extras += parseFloat(empleado.sueldo_extra_total || 0);
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
            totales.faGafetCofia += parseFloat(empleado.faGafetCofia || 0);
            totales.totalDeducciones += parseFloat(obtenerTotalDeducciones(empleado) || 0);

            totales.netoPagar += parseFloat(obtenerNetoPagar(empleado) || 0);
            totales.tarjeta += parseFloat(empleado.tarjeta || 0);
            totales.importeEfectivo += parseFloat(obtenerImporteEfectivo(empleado) || 0);
            totales.prestamo += parseFloat(empleado.prestamo || 0);
            totales.totalRecibir += parseFloat(obtenerTotalRecibir(empleado) || 0);

            totales.redondeo += parseFloat(empleado.redondeo || 0);
            totales.totalCobrar += parseFloat(empleado.total_cobrar || 0);

        });

    });

    // Agregar la fila de totales al pie de la tabla
    $('#detalle-tabla-nomina-foot-pilar').append(`
        <tr>
            <td><strong>TOTALES</strong></td>
            <td><strong>${totales.empleados} Empleado(s)</strong></td>
            <td class="col-jornalero"><strong>${totales.diasTrabajados}</strong></td>
            <td><strong>${formatoMoneda(totales.salarioSemanal)}</strong></td>
            <td><strong>${formatoMoneda(totales.pasaje)}</strong></td>
            <td><strong>${formatoMoneda(totales.comida)}</strong></td>           
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
    let filtro = $('#detalle-filtro-departamento').val();

    // Obtener el texto escrito en el buscador
    let textoBusqueda = $('#detalle-busqueda-nomina-pilar').val().trim().toUpperCase();


    // El valor tiene el formato: "idDepartamento-TipoEmpleado"
    let datos = filtro.split("-");

    let idDepartamento = Number(datos[0]);

    // Variable para almacenar el total de empleados que cumplen el filtro
    let totalEmpleados = 0;

    // Recorrer los departamentos
    jsonHistorialPilar.departamentos.forEach(departamento => {

        // Solo trabajar con el departamento seleccionado
        if (departamento.id_departamento != idDepartamento) {
            return;
        }

        // Recorrer los empleados del departamento
        departamento.empleados.forEach(empleado => {

            // Verificar si el empleado está oculto, si es así, no mostrarlo
            if (empleado.mostrar === false) {
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
    llenarTablaNominaHistorial();

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


//==========================================================
// FUNCIÓN PARA OBTENER EL TOTAL DE PERCEPCIONES
// Calcula el sueldo_extra_total a partir de sus componentes
// y percepciones extras para que siempre esté actualizado
//==========================================================

function obtenerTotalPercepciones(empleado) {

    let total = 0;

    total += parseFloat(empleado.salario_semanal || 0);

    total += parseFloat(empleado.comida || 0);

    total += parseFloat(empleado.pasaje || 0);

    total += parseFloat(empleado.sueldo_extra_total || 0);

    return parseFloat(total.toFixed(2));

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




