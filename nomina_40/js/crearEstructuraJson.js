// VARIABLES GLOBALES

jsonNomina40lbs = null;

$(document).ready(function () {

    // Llamada de la función para crear la estructura del JSON (crearEstructuraJson.js)
    crearEstructuraJson();

    // Llamada de la función para dar funcionalidad al select de departamentos (filtroBusqueda.js)
    eventoFiltroDepartamento();

    // Llamada de la función para dar funcionalidad al buscador de empleados (filtroBusqueda.js)
    eventoBusquedaEmpleado();

    // Llamada de la función para eliminar la busqueda del input de busqueda (filtroBusqueda.js)
    limpiarBusqueda();

});

// FUNCION PARA CREAR LA ESTRUCTURA DEL JSON OBTENIENDO LOS DATOS 
// DE LAS FECHA DE INCIO, FIN Y EL NUMERO DE SEMANA Y AÑO

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

// FUNCION PARA OBTENER LA INFORMACION DE LOS DEPARTAMENTOS RELACIONADOS A LA NOMINA 40LBS 
// Y AGREGAR DATOS ID, NOMBRE Y COLOR DE LOS DEPARTAMENTOS

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

// FUNCION PARA OBTENER LA INFORMACION DE LOS EMPLEADOS RELACIONADOS A LA NOMINA 40LBS 
// OBTENIENDO DATOS COMO ID, NOMBRE, PUESTO, ETC. DE CADA EMPLEADO Y AGREGARLOS AL ARREGLO
// DE EMPLEADOS DENTRO DE CADA DEPARTAMENTO

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

                            clave: empleado.clave_empleado,
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

            console.log(jsonNomina40lbs);
            cambiarVistaNomina40lbs(); // Cambiar la vista para mostrar la tabla de nómina
            // Cargar el select
            cargarFiltroDepartamentos();
            llenarTablaNomina(); // Llenar la tabla con los empleados

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