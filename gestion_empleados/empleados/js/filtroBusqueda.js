$(document).ready(function () {

    // Función para obtener las áreas y llenar el select
    obtenerAreas();

    // Función para obtener el id del área seleccionada
    obtenerIdAreaSeleccionada();

    // Función para aplicar filtros a los componentes de búsqueda
    aplicarFiltrosComponentes();

    // Actualizar icono inicial de ordenamiento (A a la Z)
    actualizarIconosOrden();

});

//====================================================
// APLICAR FILTROS A LOS COMPONENTES DE BÚSQUEDA
//====================================================

function aplicarFiltrosComponentes() {

    // Filtrar cuando cambie el departamento
    $('#selectDepartamento').change(function () {

        // Aplicar filtros
        aplicarFiltros();
    });


    // Filtrar mientras se escribe en el buscador
    $('#inputBuscar').on('input', function () {

        // Aplicar filtros
        aplicarFiltros();
    });


    // Botón Todos
    $('#tabTodos').click(function () {

        // Cambiar estilo activo
        $('.status-tab').removeClass('active');
        $(this).addClass('active');

        // Cambiar el status seleccionado
        statusSeleccionado = "todos";

        // Aplicar filtros
        aplicarFiltros();
    });


    // Botón Activos
    $('#tabActivos').click(function () {

        // Cambiar estilo activo
        $('.status-tab').removeClass('active');
        $(this).addClass('active');

        // Cambiar el status seleccionado
        statusSeleccionado = "activos";

        // Aplicar filtros
        aplicarFiltros();
    });


    // Botón Inactivos
    $('#tabInactivos').click(function () {

        // Cambiar estilo activo
        $('.status-tab').removeClass('active');
        $(this).addClass('active');

        // Cambiar el status seleccionado
        statusSeleccionado = "inactivos";

        // Aplicar filtros
        aplicarFiltros();
    });


    // Botón IMSS Todos
    $('#tabImssTodos').click(function () {

        // Cambiar estilo activo
        $('.imss-tab').removeClass('active');
        $(this).addClass('active');

        // Cambiar el status IMSS seleccionado
        statusNssSeleccionado = "todos";

        // Aplicar filtros
        aplicarFiltros();
    });


    // Botón IMSS Activos
    $('#tabImssActivos').click(function () {

        // Cambiar estilo activo
        $('.imss-tab').removeClass('active');
        $(this).addClass('active');

        // Cambiar el status IMSS seleccionado
        statusNssSeleccionado = "activos";

        // Aplicar filtros
        aplicarFiltros();
    });


    // Botón IMSS Inactivos
    $('#tabImssInactivos').click(function () {

        // Cambiar estilo activo
        $('.imss-tab').removeClass('active');
        $(this).addClass('active');

        // Cambiar el status IMSS seleccionado
        statusNssSeleccionado = "inactivos";

        // Aplicar filtros
        aplicarFiltros();
    });

}

//====================================================
// FUNCIÓN PARA OBTENER LAS ÁREAS Y LLENAR EL SELECT
// A TRAVÉS DE UN AJAX AL PHP infoAreasDepartamento.php
//====================================================

function obtenerAreas() {
    $.ajax({
        type: "POST",
        url: "../php/infoAreasDepartamento.php",
        data: { accion: "obtenerAreas" },
        dataType: "json",

        // Ejecutar cuando la petición sea exitosa
        success: function (respuesta) {

            // Verificar si la respuesta fue exitosa
            if (respuesta.success) {

                // Limpiar el select de áreas
                $('#selectArea').empty();

                // Inicializar select de departamentos bloqueado y con opción por defecto
                $('#selectDepartamento').prop('disabled', true);
                $('#selectDepartamento').empty().append(`
                    <option value="1000">
                        Todos los departamentos
                    </option>
                `);
                $('#selectDepartamento').val("1000");

                // Agregar opción por defecto en áreas
                $('#selectArea').append(`
                    <option value="1000">
                       Todas las áreas
                    </option>
                `);

                // Recorrer las áreas obtenidas
                respuesta.areas.forEach(area => {

                    // Agregar cada área al select
                    $('#selectArea').append(`
                        <option value="${area.id_area}">
                            ${area.nombre_area}
                        </option>
                    `);

                });

            } else {

                // Mostrar el mensaje de error
                console.error(respuesta.mensaje);

            }
        },
        // Ejecutar cuando ocurra un error
        error: function (xhr, estado, error) {

            // Mostrar el error ocurrido
            console.error("Error al obtener las áreas:", error);

        }

    });
}


//============================================================
// FUNCIÓN PARA OBTENER EL ID DEL ÁREA SELECCIONADA 
// PARA OBTENER LOS DEPARTAMENTOS CORRESPONDIENTES A ESA ÁREA
//============================================================
function obtenerIdAreaSeleccionada() {

    // Detectar cuando se seleccione un área
    $('#selectArea').change(function () {

        // Obtener el área seleccionada
        let idArea = $(this).val();

        // Si se seleccionaron todas las áreas
        if (idArea == 1000) {

            // Bloquear departamentos
            $('#selectDepartamento').prop('disabled', true);

            // Limpiar departamentos
            $('#selectDepartamento').empty();

            // Agregar opción por defecto
            $('#selectDepartamento').append(`
                <option value="1000">
                    Todos los departamentos
                </option>
            `);

            $('#selectDepartamento').val("1000");

            // Aplicar filtros inmediatamente
            aplicarFiltros();

        } else {

            // Desbloquear departamentos
            $('#selectDepartamento').prop('disabled', false);

            // Colocar opción por defecto inmediatamente para evitar valores null
            $('#selectDepartamento').empty().append(`
                <option value="1000">
                    Todos los departamentos
                </option>
            `);
            $('#selectDepartamento').val("1000");

            // Aplicar filtros inmediatamente para mostrar todos los empleados del área
            aplicarFiltros();

            // Obtener los departamentos del área seleccionada
            obtenerDepartamentos(idArea);
        }

    });
}

//====================================================
// FUNCIÓN PARA OBTENER LOS DEPARTAMENTOS DE UN ÁREA
//====================================================

function obtenerDepartamentos(idArea) {
    $.ajax({
        type: "POST",
        url: "../php/infoAreasDepartamento.php",
        data: { accion: "obtenerDepartamentos", id_area: idArea },
        dataType: "json",

        // Ejecutar cuando la petición sea exitosa
        success: function (respuesta) {

            // Verificar si la respuesta fue exitosa
            if (respuesta.success) {

                let deptoActual = $('#selectDepartamento').val() || "1000";

                // Limpiar el select de departamentos
                $('#selectDepartamento').empty();

                // Agregar opción por defecto para ver todos los departamentos de este área
                $('#selectDepartamento').append(`
                    <option value="1000">
                        Todos los departamentos
                    </option>
                `);

                // Recorrer los departamentos obtenidos
                respuesta.departamentos.forEach(departamento => {

                    // Agregar cada departamento al select
                    $('#selectDepartamento').append(`
                        <option value="${departamento.id_departamento}">
                            ${departamento.nombre_departamento}
                        </option>
                    `);

                });

                // Si el departamento anteriormente seleccionado aún existe, conservarlo; sino 1000
                if ($('#selectDepartamento').find(`option[value="${deptoActual}"]`).length > 0) {
                    $('#selectDepartamento').val(deptoActual);
                } else {
                    $('#selectDepartamento').val("1000");
                }

                // Sincronizar filtros con la tabla
                aplicarFiltros();

            } else {

                // Mostrar el mensaje de error
                console.error(respuesta.mensaje);

            }
        },
        // Ejecutar cuando ocurra un error
        error: function (xhr, estado, error) {

            // Mostrar el error ocurrido
            console.error("Error al obtener los departamentos:", error);

        }

    });
}


//====================================================
// FUNCIÓN PARA APLICAR TODOS LOS FILTROS
//====================================================

function aplicarFiltros(mantenerPagina = false) {

    // Si aún no se han cargado los empleados desde la base de datos, salir
    if (!Array.isArray(empleados) || empleados.length === 0) {
        return;
    }

    // Obtener el área seleccionada
    let idArea = $('#selectArea').val();

    // Obtener el departamento seleccionado
    let idDepartamento = $('#selectDepartamento').val();

    // Obtener el texto de búsqueda
    let textoBusqueda = ($('#inputBuscar').val() || "").toLowerCase().trim();


    // Filtrar los empleados
    empleadosFiltrados = empleados.filter(function (empleado) {


        //================================================
        // FILTRO POR ÁREA
        //================================================

        let coincideArea =
            !idArea ||
            idArea == 1000 ||
            String(empleado.id_area) === String(idArea);


        //================================================
        // FILTRO POR DEPARTAMENTO
        //================================================

        let coincideDepartamento =
            !idDepartamento ||
            idDepartamento == 1000 ||
            idDepartamento === "" ||
            String(empleado.id_departamento) === String(idDepartamento);


        //================================================
        // NOMBRE COMPLETO
        //================================================

        let nombreCompleto = `${empleado.nombre ?? ''} ${empleado.ap_paterno ?? ''} ${empleado.ap_materno ?? ''}`.toLowerCase().trim();


        //================================================
        // CLAVE DEL EMPLEADO
        //================================================

        let claveEmpleado = (empleado.clave_empleado ?? '').toLowerCase();


        //================================================
        // NOMBRE DEL DEPARTAMENTO
        //================================================

        let nombreDepartamento = (empleado.nombre_departamento ?? '').toLowerCase();


        //================================================
        // FILTRO DE BÚSQUEDA
        //================================================

        let coincideBusqueda =
            textoBusqueda === "" ||
            nombreCompleto.includes(textoBusqueda) ||
            claveEmpleado.includes(textoBusqueda) ||
            nombreDepartamento.includes(textoBusqueda);


        //================================================
        // FILTRO POR STATUS
        //================================================

        let coincideStatus = true;


        // Si seleccionó activos
        if (statusSeleccionado === "activos") {

            coincideStatus = empleado.id_status == 1;
        }


        // Si seleccionó inactivos
        if (statusSeleccionado === "inactivos") {

            coincideStatus = empleado.id_status != 1;
        }


        //================================================
        // FILTRO POR STATUS IMSS
        //================================================

        let coincideStatusNss = true;


        // Si seleccionó activos en IMSS
        if (statusNssSeleccionado === "activos") {

            coincideStatusNss = empleado.status_nss == 1;
        }


        // Si seleccionó inactivos en IMSS
        if (statusNssSeleccionado === "inactivos") {

            coincideStatusNss = empleado.status_nss != 1;
        }


        //================================================
        // VERIFICAR TODOS LOS FILTROS
        //================================================

        return (
            coincideArea &&
            coincideDepartamento &&
            coincideBusqueda &&
            coincideStatus &&
            coincideStatusNss
        );

    });


    // mantener el orden actual seleccionado
    if (typeof aplicarOrdenamientoActual === 'function') {
        aplicarOrdenamientoActual(empleadosFiltrados);
    }

    // Manejo de paginación: conservar la actual si se solicita o resetear a la primera
    if (!mantenerPagina) {
        paginaActual = 1;
    } else {
        let totalPaginas = Math.ceil(empleadosFiltrados.length / registrosPorPagina) || 1;
        if (paginaActual > totalPaginas) {
            paginaActual = totalPaginas;
        }
    }

    // Mostrar los resultados
    mostrarEmpleados();
}



//====================================================
// FUNCIÓN PARA DESGLOSAR LA CLAVE DEL EMPLEADO
//====================================================

function desglosarClave(clave) {

    // obtener texto de la clave
    let texto = String(clave ?? '').trim();

    // extraer letras y símbolos quitando los números
    let prefijo = texto.replace(/[0-9]/g, '').toUpperCase();

    // extraer solo los dígitos numéricos
    let soloDigitos = texto.replace(/\D/g, '');
    let numero = soloDigitos !== '' ? parseInt(soloDigitos, 10) : 0;

    // regresar datos desglosados
    return {
        prefijo: prefijo,
        numero: numero,
        original: texto
    };
}


//====================================================
// FUNCIÓN PARA COMPARAR CLAVES DE EMPLEADOS
//====================================================

function compararClaves(claveA, claveB, orden = 'desc') {

    // desglosar ambas claves
    let a = desglosarClave(claveA);
    let b = desglosarClave(claveB);

    // si los números son distintos, comparar por el valor numérico
    if (a.numero !== b.numero) {
        return orden === 'asc'
            ? a.numero - b.numero
            : b.numero - a.numero;
    }

    // si tienen el mismo número, desempatar por prefijo
    let compPrefijo = a.prefijo.localeCompare(b.prefijo);
    return orden === 'asc' ? compPrefijo : -compPrefijo;
}


//====================================================
// FUNCIÓN PARA COMPARAR NOMBRES DE EMPLEADOS
//====================================================

function compararNombres(empA, empB, orden = 'desc') {

    // obtener nombres completos
    let nombreA = `${empA.nombre ?? ''} ${empA.ap_paterno ?? ''} ${empA.ap_materno ?? ''}`.trim();
    let nombreB = `${empB.nombre ?? ''} ${empB.ap_paterno ?? ''} ${empB.ap_materno ?? ''}`.trim();

    // comparar texto en español respetando acentos
    let comp = nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });

    // retornar según el orden deseado
    return orden === 'asc' ? comp : -comp;
}


//====================================================
// FUNCIÓN PARA APLICAR EL ORDENAMIENTO ACTUAL
//====================================================

function aplicarOrdenamientoActual(lista) {

    // validar que la lista exista
    if (!Array.isArray(lista) || lista.length === 0) {
        return;
    }

    // ordenar la lista según el criterio seleccionado
    lista.sort((a, b) => {
        if (criterioOrdenActual === 'clave') {
            return compararClaves(a.clave_empleado, b.clave_empleado, direccionOrdenActual);
        } else {
            return compararNombres(a, b, direccionOrdenActual);
        }
    });
}


//====================================================
// FUNCIÓN PARA ORDENAR EMPLEADOS
//====================================================

function ordenarEmpleados(criterio = 'nombre', orden = 'asc') {

    // guardar el criterio y dirección actual
    criterioOrdenActual = criterio;
    direccionOrdenActual = orden;

    // aplicar ordenamiento a los empleados filtrados
    aplicarOrdenamientoActual(empleadosFiltrados);

    // regresar a la primera página
    paginaActual = 1;

    // actualizar iconos de orden en la interfaz
    actualizarIconosOrden();

    // mostrar empleados en la tabla
    mostrarEmpleados();
}


//====================================================
// FUNCIÓN PARA ALTERNAR EL ORDENAMIENTO
//====================================================

function alternarOrden(criterio) {

    // si es el mismo criterio alternar dirección, si no iniciar de la A a la Z
    if (criterioOrdenActual === criterio) {
        direccionOrdenActual = direccionOrdenActual === 'asc' ? 'desc' : 'asc';
    } else {
        criterioOrdenActual = criterio;
        direccionOrdenActual = 'asc';
    }

    // ejecutar el ordenamiento
    ordenarEmpleados(criterioOrdenActual, direccionOrdenActual);
}


//====================================================
// FUNCIÓN PARA ACTUALIZAR LOS ICONOS DE ORDEN
//====================================================

function actualizarIconosOrden() {

    // resetear iconos de los encabezados
    $('#iconoOrdenNombre').attr('class', 'bi bi-arrow-down-up text-muted ms-1 small');
    $('#iconoOrdenClave').attr('class', 'bi bi-arrow-down-up text-muted ms-1 small');

    // actualizar icono según el criterio y dirección
    if (criterioOrdenActual === 'nombre') {
        let icono = direccionOrdenActual === 'desc'
            ? 'bi bi-sort-alpha-up-alt text-success ms-1 small'
            : 'bi bi-sort-alpha-down text-success ms-1 small';
        $('#iconoOrdenNombre').attr('class', icono);
        $('#btnOrdenar').html(`<i class="${direccionOrdenActual === 'desc' ? 'bi bi-sort-alpha-up-alt' : 'bi bi-sort-alpha-down'} me-1"></i> Ordenar`);
    } else if (criterioOrdenActual === 'clave') {
        let icono = direccionOrdenActual === 'desc'
            ? 'bi bi-sort-numeric-up-alt text-success ms-1 small'
            : 'bi bi-sort-numeric-down text-success ms-1 small';
        $('#iconoOrdenClave').attr('class', icono);
        $('#btnOrdenar').html(`<i class="${direccionOrdenActual === 'desc' ? 'bi bi-sort-numeric-up-alt' : 'bi bi-sort-numeric-down'} me-1"></i> Ordenar`);
    }
}