// VARIABLES GLOBALES

jsonNomina40lbs = null;

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
    limpiarBusqueda();

    // Llamada de la función para mostrar el menú contextual al hacer click derecho en una fila de la tabla (configVista.js)
    mostrarContextMenu();

    // Llamada de la función para mostrar el modal con los detalles de la nómina del empleado seleccionado (configVista.js)
    mostrarModalDetallesNominaEmpleado();

    //agregarHorarioSemanalPrueba();

    // Limpiar la nómina y regresar a la vista de datos
    limpiarNomina40lbs();

    console.log(jsonNomina40lbs);


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
        jsonNomina40lbs = {
            numero_semana: numeroSemana,
            anio: anio,
            fecha_inicio: fechaInicio,
            fecha_cierre: fechaFin,
            departamentos: []
        };

        obtenerInfoDepartamento(jsonNomina40lbs);
        ;
    });

}

//==========================================================================================
// FUNCION PARA OBTENER LA INFORMACION DE LOS DEPARTAMENTOS RELACIONADOS A LA NOMINA 40LBS 
// Y AGREGAR DATOS ID, NOMBRE Y COLOR DE LOS DEPARTAMENTOS
//==========================================================================================

function obtenerInfoDepartamento(jsonNomina40lbs) {

    // Realizar la petición AJAX para obtener la información de los departamentos
    $.ajax({
        url: "../php/infoDepartamentos.php",
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

                // Agregar cada departamento al jsonNomina40lbs 
                jsonNomina40lbs.departamentos.push({

                    id_departamento: parseInt(depto.id_departamento),
                    nombre: depto.nombre_departamento,
                    color_reporte: [depto.color_depto_nomina],
                    empleados: []

                });

            });

            // Llamar a la función para obtener los empleados relacionados a la nómina 40LBS
            obtenerEmpleados(jsonNomina40lbs);


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

function obtenerEmpleados(jsonNomina40lbs) {

    $.ajax({
        url: "../php/infoDepartamentos.php",
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

            // Si la respuesta es exitosa, recorrer los empleados y agregarlos al arreglo de empleados 
            // dentro de cada departamento correspondiente en el JSON

            respuesta.empleados.forEach(empleado => {

                // Recorrer el arreglo de departamentos en el JSON para encontrar el departamento correspondiente al empleado
                jsonNomina40lbs.departamentos.forEach(departamento => {

                    // Si el id del departamento del empleado coincide con el id del departamento en el JSON, 
                    // agregar el empleado al arreglo de empleados de ese departamento

                    if (departamento.id_departamento == empleado.id_departamento) {

                        // Agregar el empleado al arreglo de empleados del departamento correspondiente
                        departamento.empleados.push({

                            id_empleado: empleado.id_empleado,
                            clave: empleado.clave_empleado,
                            id_biometrico: empleado.biometrico,
                            nombre: empleado.ap_paterno + " " + empleado.ap_materno + " " + empleado.nombre,
                            id_departamento: empleado.id_departamento,
                            id_empresa: empleado.id_empresa,
                            color_puesto: empleado.color_puesto,
                            mostrar: true,

                            //Validamos si tiene seguro social, si no tiene, se asigna false, si tiene, se asigna true
                            seguroSocial: empleado.status_nss === "1" ? true : false

                        });

                    }

                });

            });

            
            asignarPropiedadesEmpleado(jsonNomina40lbs); // Asignar propiedades a los empleados
            console.log(jsonNomina40lbs);
            cargarFiltroDepartamentos(); // Cargar el select
            llenarTablaNomina(); // Llenar la tabla con los empleados
            saveNomina(jsonNomina40lbs); // Guardar el JSON de la nómina en el local storage
            cambiarVistaNomina40lbs(); // Cambiar la vista para mostrar la tabla de nómina

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

function asignarPropiedadesEmpleado(jsonNomina40lbs) {
    if (!jsonNomina40lbs || !Array.isArray(jsonNomina40lbs.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNomina40lbs.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // --- PROPIEDADES DE NÓMINA (Solo para departamentos con editar: true) ---

            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }

            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
            empleado.sueldo_neto = empleado.sueldo_neto ?? 0;
            empleado.incentivo = empleado.incentivo ?? 0;
            empleado.horas_extra = empleado.horas_extra ?? 0;
            empleado.bono_antiguedad = empleado.bono_antiguedad ?? 0;
            empleado.actividades_especiales = empleado.actividades_especiales ?? 0;
            empleado.puesto = empleado.puesto ?? 0;
            empleado.color_puesto = empleado.color_puesto ?? null;
            empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
            empleado.prestamo = empleado.prestamo ?? 0;
            empleado.permiso = empleado.permiso ?? 0;
            empleado.inasistencia = empleado.inasistencia ?? 0;
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