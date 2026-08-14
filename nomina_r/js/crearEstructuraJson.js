// VARIABLES GLOBALES

jsonNominaRelicario = null;

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

    // Llamada de la función para guardar la configuración general de la nómina (crearEstructuraJson.js)
    guardarConfiguracionRelicario();

    // Limpiar la nómina y regresar a la vista de datos
    limpiarNominaRelicario();

    console.log(jsonNominaRelicario);

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
        jsonNominaRelicario = {
            numero_semana: numeroSemana,
            anio: anio,
            fecha_inicio: fechaInicio,
            fecha_cierre: fechaFin,
            departamentos: []
        };

        obtenerInfoDepartamento(jsonNominaRelicario);
        ;
    });

}

//==========================================================================================
// FUNCION PARA OBTENER LA INFORMACION DE LOS DEPARTAMENTOS RELACIONADOS A LA NOMINA 40LBS 
// Y AGREGAR DATOS ID, NOMBRE Y COLOR DE LOS DEPARTAMENTOS
//==========================================================================================

function obtenerInfoDepartamento(jsonNominaRelicario) {

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

                // Agregar cada departamento al jsonNominaRelicario 
                jsonNominaRelicario.departamentos.push({

                    id_departamento: parseInt(depto.id_departamento),
                    nombre: depto.nombre_departamento,
                    color_reporte: [depto.color_depto_nomina],
                    empleados: []

                });

            });

            console.log(jsonNominaRelicario);

            // Llamar a la función para obtener el horario del rancho y guardarlo en el JSON
            obtenerHorarioRancho();

            // Cambiar de vista a la configuración de valores económicos del relicario
            cambiarVistaConfigValores();

            // Cargar la tabla de configuración de horarios
            cargarConfiguracionHorarios();

        },
        error: function () {

            alert("Error al obtener la información de los departamentos.");

        }
    });

}


//===============================================================
// FUNCION PARA OBTENER EL HORARIO DEL RANCHO
// Y GUARDARLO EN EL JSON DE LA NOMINA RELICARIO
//===============================================================

function obtenerHorarioRancho() {

    $.ajax({

        url: "../php/infoEmpleados.php",

        type: "POST",

        dataType: "json",

        data: {
            accion: "obtenerHorarioRancho"
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

            // Guardar horario del rancho dentro del JSON

            jsonNominaRelicario.horarioRancho = respuesta.horario_jornalero;


            console.log(
                "Horario Rancho:",
                jsonNominaRelicario.horarioRancho
            );


        },

        error: function () {


            mostrarAlerta(
                "error",
                "Error",
                "No se pudo obtener el horario del rancho."
            );


        }

    });


}

//============================================================================
// FUNCION PARA CARGAR LA TABLA DE CONFIGURACION DE HORARIOS
// RECORRE LOS DEPARTAMENTOS DEL JSON Y LOS MUESTRA EN LA TABLA
// PERMITIENDO SELECCIONAR EL TIPO DE HORARIO PARA CADA UNO
//============================================================================

function cargarConfiguracionHorarios() {

    // Obtener el cuerpo de la tabla
    var tbody = $("#tabla-config-horarios");

    // Limpiar el contenido anterior
    tbody.empty();

    // Validar que exista el JSON y que tenga departamentos
    if (!jsonNominaRelicario || jsonNominaRelicario.departamentos.length === 0) {

        tbody.html(`
            <tr>
                <td colspan="2" class="text-center text-muted">
                    No hay departamentos para mostrar.
                </td>
            </tr>
        `);

        return;
    }

    // Recorrer todos los departamentos del JSON
    jsonNominaRelicario.departamentos.forEach(function (departamento) {

        // Agregar una fila para cada departamento
        tbody.append(`
            <tr>
                <td>${departamento.nombre}</td>

                <td class="text-center">

                    <div class="form-check form-check-inline">
                        <input
                            class="form-check-input horario-relicario"
                            type="radio"
                            name="horario_${departamento.id_departamento}"
                            value="oficial">

                        <label class="form-check-label">
                            Oficial
                        </label>
                    </div>

                    <div class="form-check form-check-inline">
                        <input
                            class="form-check-input horario-relicario"
                            type="radio"
                            name="horario_${departamento.id_departamento}"
                            value="ranchos">

                        <label class="form-check-label">
                            Ranchos
                        </label>
                    </div>

                </td>
            </tr>
        `);

    });

}

//============================================================================
// FUNCION PARA GUARDAR LA CONFIGURACION GENERAL DE LA NOMINA
// OBTIENE LOS VALORES ECONOMICOS Y EL TIPO DE HORARIO
// SELECCIONADO PARA CADA DEPARTAMENTO
//============================================================================

function guardarConfiguracionRelicario() {

    // Evento del botón para continuar al procesamiento de la nómina
    $("#btn_config_avanzar_relicario").click(function () {

        // Obtener los valores económicos
        var precioPasaje = parseFloat($("#precio_pasaje_relicario").val()) || 0;
        var pagoTardeada = parseFloat($("#pago_tardeada_relicario").val()) || 0;
        var pagoComida = parseFloat($("#pago_comida_relicario").val()) || 0;

        // Guardar los valores en el JSON principal
        jsonNominaRelicario.precio_pasaje = precioPasaje;
        jsonNominaRelicario.pago_tardeada = pagoTardeada;
        jsonNominaRelicario.pago_comida = pagoComida;

        // Variable para validar que todos los departamentos tengan horario
        var horarioCompleto = true;

        // Recorrer todos los departamentos
        jsonNominaRelicario.departamentos.forEach(function (departamento) {

            // Obtener el horario seleccionado
            var horarioSeleccionado = $(
                "input[name='horario_" + departamento.id_departamento + "']:checked"
            ).val();

            // Validar que exista un horario seleccionado
            if (!horarioSeleccionado) {
                horarioCompleto = false;
                return;
            }

            // Asignar el tipo de horario
            if (horarioSeleccionado === "oficial") {

                departamento.tipo_horario = 1;

            } else {

                departamento.tipo_horario = 2;

            }

        });

        // Validar que todos los departamentos tengan horario
        if (!horarioCompleto) {

            mostrarAlerta(
                "warning",
                "Horario pendiente",
                "Debe seleccionar un horario para todos los departamentos."
            );

            return;
        }



        // Aquí continúa el siguiente proceso...
        obtenerEmpleados(jsonNominaRelicario);

    });

}

//==========================================================================================
// FUNCION PARA OBTENER LA INFORMACION DE LOS EMPLEADOS RELACIONADOS A LA NOMINA 40LBS 
// OBTENIENDO DATOS COMO ID, NOMBRE, PUESTO, ETC. DE CADA EMPLEADO Y AGREGARLOS AL ARREGLO
// DE EMPLEADOS DENTRO DE CADA DEPARTAMENTO
//==========================================================================================


function obtenerEmpleados(jsonNominaRelicario) {

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
                jsonNominaRelicario.departamentos.forEach(function (departamento) {

                    // Validar que el empleado pertenezca al departamento actual
                    if (departamento.id_departamento == empleado.id_departamento) {

                        // Crear el objeto del empleado
                        var nuevoEmpleado = {

                            id_empleado: empleado.id_empleado,
                            clave: empleado.clave_empleado,
                            id_biometrico: empleado.biometrico,
                            nombre: empleado.nombre + " " + empleado.ap_paterno + " " + empleado.ap_materno,
                            id_departamento: empleado.id_departamento,
                            id_empresa: empleado.id_empresa,
                            mostrar: true,

                            // Validar si el empleado cuenta con seguro social
                            seguroSocial: empleado.status_nss === "1" ? true : false

                        };

                        // Si el departamento tiene horario oficial,
                        // agregar el salario semanal y el horario oficial
                        if (departamento.tipo_horario == 1) {

                            nuevoEmpleado.salario_semanal = parseFloat(empleado.salario_semanal);
                            nuevoEmpleado.horario_oficial = empleado.horario_oficial != null
                                ? JSON.parse(empleado.horario_oficial)
                                : [];

                        }

                        if(departamento.tipo_horario == 2) {
                            nuevoEmpleado.salario_diario = parseFloat(empleado.salario_diario);
                        }

                        // Agregar el empleado al departamento correspondiente
                        departamento.empleados.push(nuevoEmpleado);

                    }

                });

            });


            console.log(jsonNominaRelicario);

            // Llamar a la función para asignar las propiedades a los empleados dentro del JSON

            asignarPropiedadesEmpleado(jsonNominaRelicario);

            // Cambiar de vista a la tabla de la nomina

            cambiarVistaTablaNomina();

            cargarFiltroDepartamentos();

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

function asignarPropiedadesEmpleado(jsonNominaRelicario) {
    if (!jsonNominaRelicario || !Array.isArray(jsonNominaRelicario.departamentos)) return;

    // Recorrer todos los departamentos
    jsonNominaRelicario.departamentos.forEach(departamento => {
        if (!Array.isArray(departamento.empleados)) return;

        departamento.empleados.forEach(empleado => {
            // --- PROPIEDADES DE NÓMINA (Solo para departamentos con editar: true) ---

            // Inicializar registros como array vacío si no existen
            if (!empleado.registros || !Array.isArray(empleado.registros)) {
                empleado.registros = [];
            }

            // Agregar o mantener las propiedades necesarias (no sobrescribir si ya vienen de la BD)
            empleado.salario_semanal = empleado.salario_semanal ?? 0;
            empleado.sueldo_extra_total = empleado.sueldo_extra_total ?? 0;
            empleado.retardos = empleado.retardos ?? 0;
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
            empleado.dias_justificados = empleado.dias_justificados ?? [];

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