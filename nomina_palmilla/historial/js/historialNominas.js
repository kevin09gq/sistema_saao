//===================================================
// VARIABLES GLOBALES DEL HISTORIAL DE NÓMINAS
//===================================================

var nominas = [];

var nominasFiltradas = [];

var paginaActual = 1;

var registrosPorPagina = 7;

//===================================================
// EJECUTAR EL HISTORIAL DE NÓMINAS AL CARGAR LA PÁGINA
//===================================================

$(document).ready(function () {

    veficarExistenciaNomina();

    // iniciar el historial de nóminas
    inicializarHistorialNominas();

    // Limpiar los filtros 
    limpiarFiltros();

});

function veficarExistenciaNomina() {
    // obtener el id de la nómina guardado en el storage
    var idNomina = localStorage.getItem('id_nomina_palmilla');

    // validar si existe una nómina guardada
    if (idNomina) {

        // construir la dirección del detalle
        var url = '../views/detalle_nomina.php';

        // abrir directamente el detalle de la nómina
        window.location.href = url + '?id_nomina_palmilla=' + idNomina;

        return;
    }

}

//===================================================
// FUNCIÓN PARA INICIALIZAR EL HISTORIAL DE NÓMINAS
//===================================================

function inicializarHistorialNominas() {

    // obtener las nóminas de la base de datos
    obtenerNominas();

    // detectar cambios en el filtro de año
    $('#filtro-anio').change(function () {

        filtrarNominas();

    });

    // detectar cambios en el filtro de semana
    $('#filtro-semana').change(function () {

        filtrarNominas();

    });

    // detectar cambios en el buscador
    $('#busqueda-nomina').keyup(function () {

        filtrarNominas();

    });



}


//===================================================
// FUNCIÓN PARA OBTENER LAS NÓMINAS DESDE LA BASE DE DATOS
//===================================================

function obtenerNominas() {

    $.ajax({

        url: '../php/historialNominas.php',

        type: 'POST',

        dataType: 'json',

        data: {
            accion: 'obtenerNominas'
        },

        success: function (respuesta) {

            // validar si la consulta fue correcta
            if (!respuesta.success) {

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: respuesta.mensaje
                });

                return;
            }

            // guardar las nóminas obtenidas
            nominas = respuesta.nominas;

            // copiar las nóminas para trabajar con los filtros
            nominasFiltradas = nominas.slice();

            // cargar los años disponibles
            cargarFiltroAnios();

            // cargar las semanas disponibles
            cargarFiltroSemanas();

            // regresar a la primera página
            paginaActual = 1;

            // mostrar las nóminas
            mostrarNominas();

            // crear la paginación
            crearPaginacion();

        },

        error: function () {

            // mostrar mensaje cuando ocurre un error de conexión
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No fue posible obtener las nóminas.'
            });

        }

    });

}


//===================================================
// FUNCIÓN PARA CARGAR LOS AÑOS EN EL FILTRO
//===================================================

function cargarFiltroAnios() {

    // limpiar las opciones actuales
    $('#filtro-anio').empty();

    // agregar la opción para mostrar todos los años
    $('#filtro-anio').append(
        '<option value="">Todos los años</option>'
    );

    var anios = [];

    // recorrer las nóminas para obtener los años
    $.each(nominas, function (indice, nomina) {

        // validar que el año todavía no exista
        if ($.inArray(nomina.anio, anios) === -1) {

            anios.push(nomina.anio);

        }

    });

    // ordenar los años del más reciente al más antiguo
    anios.sort(function (a, b) {

        return b - a;

    });

    // agregar los años al selector
    $.each(anios, function (indice, anio) {

        $('#filtro-anio').append(
            '<option value="' + anio + '">' +
            anio +
            '</option>'
        );

    });

}


//===================================================
// FUNCIÓN PARA CARGAR LAS SEMANAS EN EL FILTRO
//===================================================

function cargarFiltroSemanas() {

    // limpiar las opciones actuales
    $('#filtro-semana').empty();

    // agregar la opción para mostrar todas las semanas
    $('#filtro-semana').append(
        '<option value="">Todas las semanas</option>'
    );

    var semanas = [];

    // recorrer las nóminas para obtener las semanas
    $.each(nominas, function (indice, nomina) {

        // validar que la semana todavía no exista
        if ($.inArray(nomina.numero_semana, semanas) === -1) {

            semanas.push(nomina.numero_semana);

        }

    });

    // ordenar las semanas de menor a mayor
    semanas.sort(function (a, b) {

        return a - b;

    });

    // agregar las semanas al selector
    $.each(semanas, function (indice, semana) {

        $('#filtro-semana').append(
            '<option value="' + semana + '">' +
            'Semana ' + semana +
            '</option>'
        );

    });

}


//===================================================
// FUNCIÓN PARA FILTRAR LAS NÓMINAS
//===================================================

function filtrarNominas() {

    // obtener el año seleccionado
    var anio = $('#filtro-anio').val();

    // obtener la semana seleccionada
    var semana = $('#filtro-semana').val();

    // obtener el texto de búsqueda
    var busqueda = $('#busqueda-nomina').val().toLowerCase().trim();

    // limpiar los resultados anteriores
    nominasFiltradas = [];

    // recorrer todas las nóminas
    $.each(nominas, function (indice, nomina) {

        // convertir los valores a texto para realizar las comparaciones
        var anioNomina = nomina.anio.toString();

        var semanaNomina = nomina.numero_semana.toString();

        // validar el año
        if (anio !== '' && anioNomina !== anio) {

            return;

        }

        // validar la semana
        if (semana !== '' && semanaNomina !== semana) {

            return;

        }

        // validar el buscador
        if (
            busqueda !== '' &&
            anioNomina.indexOf(busqueda) === -1 &&
            semanaNomina.indexOf(busqueda) === -1
        ) {

            return;

        }

        // agregar la nómina cuando cumple con los filtros
        nominasFiltradas.push(nomina);

    });

    // regresar a la primera página
    paginaActual = 1;

    // actualizar la tabla
    mostrarNominas();

    // actualizar la paginación
    crearPaginacion();

}


//===================================================
// FUNCIÓN PARA MOSTRAR LAS NÓMINAS EN LA TABLA
//===================================================

function mostrarNominas() {

    // actualizar las tarjetas de resumen de totales
    calcularTotalesHistorial();

    // limpiar el contenido de la tabla
    $('#tbody-historial-nominas').empty();

    // calcular desde qué registro se debe mostrar
    var inicio = (paginaActual - 1) * registrosPorPagina;

    // obtener los registros correspondientes a la página
    var registros = nominasFiltradas.slice(
        inicio,
        inicio + registrosPorPagina
    );

    // validar si no existen registros
    if (registros.length === 0) {

        // mostrar mensaje de tabla vacía
        $('#tbody-historial-nominas').append(
            '<tr>' +
            '<td colspan="7" class="text-center py-4 text-secondary">' +
            '<i class="bi bi-inbox me-1"></i>' +
            'No se encontraron nóminas.' +
            '</td>' +
            '</tr>'
        );

        return;
    }

    // recorrer los registros de la página actual
    $.each(registros, function (indice, nomina) {

        // agregar la fila de la nómina
        $('#tbody-historial-nominas').append(

            '<tr>' +

            '<td class="text-center">' +
            (inicio + indice + 1) +
            '</td>' +

            '<td>' +
            nomina.anio +
            '</td>' +

            '<td>' +
            'Semana ' + nomina.numero_semana +
            '</td>' +

            '<td class="text-end">' +
            formatearMoneda(nomina.total_percepciones) +
            '</td>' +

            '<td class="text-end">' +
            formatearMoneda(nomina.total_deducciones) +
            '</td>' +

            '<td class="text-end fw-semibold">' +
            formatearMoneda(nomina.total_neto) +
            '</td>' +

            '<td class="text-center">' +

            '<button ' +
            'type="button" ' +
            'class="btn btn-sm btn-outline-primary btn-ver-nomina" ' +
            'data-id="' + nomina.id_nomina_palmilla + '" ' +
            'title="Ver nómina">' +

            '<i class="bi bi-eye"></i>' +

            '</button>' +

            '</td>' +

            '</tr>'

        );

    });

    // activar los botones de la tabla
    activarEventosNomina();

}


//===================================================
// FUNCIÓN PARA CREAR LA PAGINACIÓN DE LAS NÓMINAS
//===================================================

function crearPaginacion() {

    // limpiar la paginación actual
    $('#paginacion-nominas').empty();

    // calcular el total de páginas
    var totalPaginas = Math.ceil(
        nominasFiltradas.length / registrosPorPagina
    );

    // no mostrar paginación cuando solamente existe una página
    if (totalPaginas <= 1) {

        return;

    }

    // agregar botón anterior
    $('#paginacion-nominas').append(
        '<li class="page-item ' +
        (paginaActual === 1 ? 'disabled' : '') +
        '">' +

        '<a class="page-link" href="#" data-pagina="' +
        (paginaActual - 1) +
        '">' +

        '<i class="bi bi-chevron-left"></i>' +

        '</a>' +

        '</li>'
    );

    // agregar los números de página
    for (var i = 1; i <= totalPaginas; i++) {

        // agregar la página actual
        $('#paginacion-nominas').append(
            '<li class="page-item ' +
            (i === paginaActual ? 'active' : '') +
            '">' +

            '<a class="page-link" href="#" data-pagina="' +
            i +
            '">' +

            i +

            '</a>' +

            '</li>'
        );

    }

    // agregar botón siguiente
    $('#paginacion-nominas').append(
        '<li class="page-item ' +
        (paginaActual === totalPaginas ? 'disabled' : '') +
        '">' +

        '<a class="page-link" href="#" data-pagina="' +
        (paginaActual + 1) +
        '">' +

        '<i class="bi bi-chevron-right"></i>' +

        '</a>' +

        '</li>'
    );

    // activar los botones de paginación
    $('#paginacion-nominas .page-link').click(function (e) {

        // evitar que el enlace recargue la página
        e.preventDefault();

        // obtener el número de página
        var pagina = parseInt($(this).data('pagina'));

        // cambiar de página
        cambiarPagina(pagina);

    });

}


//===================================================
// FUNCIÓN PARA CAMBIAR DE PÁGINA
//===================================================

function cambiarPagina(pagina) {

    // calcular el total de páginas
    var totalPaginas = Math.ceil(
        nominasFiltradas.length / registrosPorPagina
    );

    // validar que la página exista
    if (pagina < 1 || pagina > totalPaginas) {

        return;

    }

    // actualizar la página actual
    paginaActual = pagina;

    // actualizar la tabla
    mostrarNominas();

    // actualizar la paginación
    crearPaginacion();

}


//===================================================
// FUNCIÓN PARA ACTIVAR LOS BOTONES DE LAS NÓMINAS
//===================================================

function activarEventosNomina() {

    // detectar el clic en el botón de ver nómina
    $('.btn-ver-nomina').click(function () {

        // obtener el id de la nómina
        var idNomina = $(this).data('id');

        // enviar la nómina seleccionada
        verNomina(idNomina);

    });

}


//===================================================
// FUNCIÓN PARA VER LA NÓMINA SELECCIONADA
//===================================================

function verNomina(idNomina) {

    // construir la dirección del detalle
    var url = '../views/detalle_nomina.php';

    // guardar el id de la nómina seleccionada
    localStorage.setItem('id_nomina_palmilla', idNomina);

    // enviar el id de la nómina mediante GET
    window.location.href = url + '?id_nomina_palmilla=' + idNomina;

}


//===================================================
// FUNCIÓN PARA LIMPIAR LOS FILTROS
//===================================================

function limpiarFiltros() {

    // detectar el clic en el botón limpiar
    $('#btn-limpiar-filtros').click(function () {

        // limpiar el selector de año
        $('#filtro-anio').val('');

        // limpiar el selector de semana
        $('#filtro-semana').val('');

        // limpiar el buscador
        $('#busqueda-nomina').val('');

        // restaurar todas las nóminas
        nominasFiltradas = nominas.slice();

        // regresar a la primera página
        paginaActual = 1;

        // actualizar la tabla
        mostrarNominas();

        // actualizar la paginación
        crearPaginacion();

    });

}


//===================================================
// FUNCIÓN PARA FORMATEAR UNA CANTIDAD COMO MONEDA
//===================================================

function formatearMoneda(cantidad) {

    // convertir el valor a número
    cantidad = parseFloat(cantidad) || 0;

    // regresar la cantidad con formato de moneda
    return cantidad.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

}


//===================================================
// FUNCIÓN PARA CALCULAR LOS TOTALES DEL HISTORIAL (CARDS)
//===================================================

function calcularTotalesHistorial() {

    var totalNominas = nominasFiltradas.length;
    var totalPercepciones = 0;
    var totalDeducciones = 0;
    var totalNeto = 0;

    $.each(nominasFiltradas, function (indice, nomina) {
        totalPercepciones += parseFloat(nomina.total_percepciones) || 0;
        totalDeducciones += parseFloat(nomina.total_deducciones) || 0;
        totalNeto += parseFloat(nomina.total_neto) || 0;
    });

    $('#card-total-nominas').text(totalNominas);
    $('#card-total-percepciones').text(formatearMoneda(totalPercepciones));
    $('#card-total-deducciones').text(formatearMoneda(totalDeducciones));
    $('#card-total-neto').text(formatearMoneda(totalNeto));

}


