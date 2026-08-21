// VARIABLES GLOBALES

jsonNomina10lbs = null;

$(document).ready(function () {
    // Si no se logra restaurar una nómina previa, mostrar el contenedor de carga
    if (!restoreNomina()) {
        $("#contenedor-data").removeAttr("hidden");
    }


    // Llamada de la función para crear la estructura del JSON (crearEstructuraJson.js)
    crearEstructuraJson();

    // Llamada de la función para dar funcionalidad al select de departamentos (filtroBusqueda.js)
    eventoFiltroDepartamento();

    // Llamada de la función para dar funcionalidad al buscador de empleados (filtroBusqueda.js)
    eventoBusquedaEmpleado();

    // Llamada de la función para eliminar la busqueda del input de busqueda (filtroBusqueda.js)
    //  limpiarBusqueda();

    // Llamada de la función para mostrar el menú contextual al hacer click derecho en una fila de la tabla (configVista.js)
    mostrarContextMenu();

    // Llamada de la función para mostrar el modal con los detalles de la nómina del empleado seleccionado (configVista.js)
    mostrarModalDetallesNominaEmpleado();


    // Limpiar la nómina y regresar a la vista de datos
    //   limpiarNomina10lbs();

    console.log(jsonNomina10lbs);


});

//================================================================
// FUNCION PARA CREAR LA ESTRUCTURA DEL JSON OBTENIENDO LOS DATOS 
// DE LAS FECHA DE INCIO, FIN Y EL NUMERO DE SEMANA Y AÑO
//================================================================

function crearEstructuraJson() {

    // Presionar el botón de continuar para crear la estructura del JSON
    $('#btn-continuar').click(function (e) {
        e.preventDefault();

        // Obtener los valores de los campos de fecha y semana
        var fechaInicio = formatearFecha($('#fecha_inicio').val());
        var fechaFin = formatearFecha($('#fecha_fin').val());
        var numeroSemana = $('#numero_semana').val();
        var anio = $('#anio').val();

        // Validar que los campos no estén vacíos
        if (!fechaInicio || !fechaFin || !numeroSemana || !anio) {
            mostrarAlerta('error', 'Campos vacíos', 'Por favor, complete todos los campos antes de continuar.');
            return;
        }

        //Validar que la fecha de inicio sea menor a la fecha de fin
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            mostrarAlerta('error', 'Fechas inválidas', 'La fecha de inicio no puede ser mayor a la fecha de fin.');
            return;
        }

        // Crear la estructura del JSON con los datos principales y un arreglo vacío para los departamentos
        jsonNomina10lbs = {
            numero_semana: numeroSemana,
            anio: anio,
            fecha_inicio: fechaInicio,
            fecha_cierre: fechaFin,
            precio_cajas: [],
            departamentos: []
        };

        obtenerPreciosCajas(jsonNomina10lbs);
    });

}

//================================================================
// FUNCION PARA OBTENER LOS PRECIOS DE LAS CAJAS DE LA NOMINA 10LBS
//================================================================

function obtenerPreciosCajas(jsonNomina10lbs) {

    $.ajax({
        url: "../php/infoEmpleados.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerPreciosCajas"
        },
        success: function (respuesta) {

            if (!respuesta.success) {

                mostrarAlerta(
                    "error",
                    "Error",
                    respuesta.mensaje
                );

                return;
            }

            jsonNomina10lbs.precio_cajas = respuesta.precio_cajas;

            obtenerInfoDepartamento(jsonNomina10lbs);
        },

        error: function () {

            mostrarAlerta(
                "error",
                "Error",
                "Ocurrió un error al obtener los precios de las cajas."
            );
        }
    });
}

//==========================================================================================
// FUNCION PARA OBTENER LA INFORMACION DE LOS DEPARTAMENTOS RELACIONADOS A LA NOMINA 40LBS 
// Y AGREGAR DATOS ID, NOMBRE Y COLOR DE LOS DEPARTAMENTOS
//==========================================================================================

function obtenerInfoDepartamento(jsonNomina10lbs) {

    // Realizar la petición AJAX para obtener la información de los departamentos
    $.ajax({
        url: "../php/infoEmpleados.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerInfoDepartamento",
        },
        success: function (respuesta) {
            if (!respuesta.success) {
                mostrarAlerta('error', 'Error al obtener la información de los departamentos.', respuesta.message);
                return;
            }
            // Si la respuesta es exitosa, recorrer los departamentos y agregarlos al arreglo de departamentos en el JSON
            respuesta.departamentos.forEach(depto => {

                // Agregar cada departamento al jsonNomina10lbs 
                jsonNomina10lbs.departamentos.push({

                    id_departamento: parseInt(depto.id_departamento),
                    id_empresa: parseInt(depto.id_empresa),
                    nombre: depto.nombre_departamento,
                    color_reporte: [depto.color_depto_nomina],
                    empleados: []

                });

            });

            console.log(jsonNomina10lbs);

            // Obtener Informacion de los empleados
            obtenerEmpleados(jsonNomina10lbs);


        },
        error: function () {

            alert("Error al obtener la información de los departamentos.");

        }
    });

}



//==========================================================================================
// FUNCION PARA OBTENER LA INFORMACION DE LOS EMPLEADOS RELACIONADOS A LA NOMINA 40LBS 
// OBTENIENDO DATOS COMO ID, NOMBRE, PUESTO, ETC. DE CADA EMPLEADO Y AGREGARLOS AL ARREGLO
// DE EMPLEADOS DENTRO DE CADA DEPARTAMENTO
//==========================================================================================


function obtenerEmpleados(jsonNomina10lbs) {

    $.ajax({
        url: "../php/infoEmpleados.php",
        type: "POST",
        dataType: "json",
        data: {
            accion: "obtenerEmpleados"
        },
        success: function (respuesta) {

            if (!respuesta.success) {
                mostrarAlerta(
                    "error",
                    "Error",
                    respuesta.mensaje
                );
                return;
            }

            // Recorrer todos los empleados obtenidos de la base de datos
            respuesta.empleados.forEach(function (empleado) {

                // Recorrer los departamentos del JSON para localizar
                // el departamento al que pertenece el empleado
                jsonNomina10lbs.departamentos.forEach(function (departamento) {

                    // Validar que el empleado pertenezca al departamento actual y a la empresa 
                    if (departamento.id_departamento == empleado.id_departamento && departamento.id_empresa == empleado.id_empresa) {

                        // Crear el objeto del empleado
                        var nuevoEmpleado = {

                            id_empleado: empleado.id_empleado,
                            clave: empleado.clave_empleado,
                            id_biometrico: empleado.biometrico,
                            nombre: empleado.ap_paterno + " " + empleado.ap_materno + " " + empleado.nombre,
                            id_departamento: empleado.id_departamento,
                            id_empresa: empleado.id_empresa,
                            mostrar: true,

                            // Validar si el empleado cuenta con seguro social
                            seguroSocial: empleado.status_nss === "1" ? true : false
                        };


                        // Agregar el empleado al departamento correspondiente
                        departamento.empleados.push(nuevoEmpleado);

                    }

                });

            });


            console.log(jsonNomina10lbs);

            // Llamar a la función para asignar las propiedades a los empleados dentro del JSON

            asignarPropiedadesEmpleado(jsonNomina10lbs);

            // Cambiar de vista a la tabla de la nomina

            cambiarVistaTablaNomina();

            // Cargar datos al Select de filtrado de departamentos

            cargarFiltroDepartamentos();

            // Llenar la tabla y mostrar 

            llenarTablaNomina();

        },
        error: function () {

            mostrarAlerta(
                "error",
                "Error",
                "Ocurrió un error al obtener los empleados."
            );

        }

    });

}

//==========================================================================================
// FUNCION PARA ASIGNAR LAS PROPIEDADES A LOS EMPLEADOS DENTRO DEL JSON DE LA NOMINA 40LBS
//==========================================================================================

function asignarPropiedadesEmpleado(jsonNomina10lbs) {
    if (!jsonNomina10lbs || !Array.isArray(jsonNomina10lbs.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNomina10lbs.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // --- PROPIEDADES DE NÓMINA (Solo para departamentos con editar: true) ---

            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }

            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
            empleado.sueldo_neto = empleado.sueldo_neto ?? 0;
            empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
            empleado.prestamo = empleado.prestamo ?? 0;
            empleado.permiso = empleado.permiso ?? 0;
            empleado.uniformes = empleado.uniformes ?? 0;
            empleado.checador = empleado.checador ?? 0;
            empleado.fa_gafet_cofia = empleado.fa_gafet_cofia ?? 0;
            empleado.total_cobrar = empleado.total_cobrar ?? 0;
            empleado.id_empresa = empleado.id_empresa ?? null;
            empleado.redondeo = empleado.redondeo ?? 0;
            empleado.redondeo_activo = empleado.redondeo_activo ?? false;


            // Crear array de conceptos solo si tiene seguro social
            if (empleado.seguroSocial) {
                if (!empleado.conceptos || !Array.isArray(empleado.conceptos)) {
                    empleado.conceptos = [
                        { codigo: "45", resultado: '' },   // ISR
                        { codigo: "52", resultado: '' },   // IMSS
                        { codigo: "16", resultado: '' },   // Infonavit
                        { codigo: "107", resultado: '' }   // Ajuste al Sub
                    ];
                }
                // Crear copias solo si NO existen ya (para no pisar las actualizadas en Validación 3)
                if (!empleado.conceptos_copia || !Array.isArray(empleado.conceptos_copia)) {
                    empleado.conceptos_copia = JSON.parse(JSON.stringify(empleado.conceptos));
                }
            }


        });
    });
}

// FUNCIONES AUXILIARES

// FUNCION PARA FORMATEAR LA FECHA DE "YYYY-MM-DD" A "DD/MMM/YYYY"
function formatearFecha(fecha) {

    if (!fecha) return "";

    const meses = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic"
    ];

    const partes = fecha.split("-");

    const anio = partes[0];
    const mes = meses[parseInt(partes[1]) - 1];
    const dia = partes[2];

    return `${dia}/${mes}/${anio}`;

}

// FUNCION PARA MOSTRAR ALERTAS CON SWEETALERT2
function mostrarAlerta(icono, titulo, mensaje) {

    Swal.fire({
        icon: icono,
        title: titulo,
        text: mensaje,
        confirmButtonText: "Aceptar"
    });

}