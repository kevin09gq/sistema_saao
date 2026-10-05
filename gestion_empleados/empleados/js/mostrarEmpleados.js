//====================================================
// VARIABLES GLOBALES DE EMPLEADOS
//====================================================

// Contiene todos los empleados obtenidos de la base de datos
let empleados = [];

// Contiene los empleados después de aplicar los filtros
let empleadosFiltrados = [];


//====================================================
// VARIABLES DE PAGINACIÓN
//====================================================

// Página que se está mostrando actualmente
let paginaActual = 1;

// Cantidad de empleados que se mostrarán por página
let registrosPorPagina = 5;


//====================================================
// VARIABLES DE FILTROS
//====================================================

// Status seleccionado actualmente
// Valores posibles: todos, activos, inactivos
let statusSeleccionado = "todos";

// Status IMSS seleccionado actualmente
// Valores posibles: todos, activos, inactivos
let statusNssSeleccionado = "todos";


//====================================================
// VARIABLES DE ORDENAMIENTO
//====================================================

// Criterio de ordenamiento actual: 'nombre' o 'clave'
let criterioOrdenActual = 'nombre';

// Dirección actual del ordenamiento: 'asc' (A a la Z) o 'desc' (Z a la A)
let direccionOrdenActual = 'asc';


$(document).ready(function () {
    obtenerEmpleados();
});



//====================================================
// FUNCIÓN PARA OBTENER TODOS LOS EMPLEADOS
//====================================================

function obtenerEmpleados(mantenerPagina = false) {

    $.ajax({
        type: "POST",
        url: "../php/infoAreasDepartamento.php",
        data: {
            accion: "obtenerEmpleados"
        },
        dataType: "json",

        success: function (respuesta) {

            if (respuesta.success) {

                // Guardar todos los empleados
                empleados = respuesta.empleados;

                // Si la función de filtros ya está disponible, coordinar
                aplicarFiltros(mantenerPagina);


            } else {

                console.error(respuesta.mensaje);
            }
        },

        error: function (xhr, estado, error) {

            console.error(
                "Error al obtener los empleados:",
                error
            );

            console.error(xhr.responseText);
        }
    });
}

//====================================================
// FUNCIÓN PARA MOSTRAR LOS EMPLEADOS EN LA TABLA
//====================================================

function mostrarEmpleados() {

    // Limpiar el contenido actual de la tabla
    $('#tbodyEmpleados').empty();

    // Validar si no hay empleados que mostrar
    if (empleadosFiltrados.length === 0) {
        $('#tbodyEmpleados').append(`
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-search fs-3 d-block mb-2 text-secondary"></i>
                    No se encontraron empleados con los filtros aplicados.
                </td>
            </tr>
        `);

        crearPaginacion();
        return;
    }

    // Calcular desde qué registro se comenzará a mostrar
    let inicio = (paginaActual - 1) * registrosPorPagina;

    // Calcular hasta qué registro se mostrarán
    let fin = inicio + registrosPorPagina;

    // Obtener únicamente los empleados correspondientes a la página actual
    let empleadosPagina = empleadosFiltrados.slice(inicio, fin);

    // Recorrer los empleados de la página actual
    empleadosPagina.forEach(empleado => {

        // Obtener las iniciales del empleado
        let iniciales = obtenerIniciales(
            empleado.nombre,
            empleado.ap_paterno
        );

        // Renderizar avatar: imagen si existe o círculo con iniciales si no existe o falla
        let avatarHtml = empleado.ruta_foto
            ? `<img
                    src="../../../gafetes/${empleado.ruta_foto}"
                    alt="Foto del empleado"
                    class="rounded-circle"
                    width="45"
                    height="45"
                    onerror="this.outerHTML='<div class=\\'avatar-iniciales\\'>${iniciales}</div>'">`
            : `<div class="avatar-iniciales">${iniciales}</div>`;

        // Agregar la fila del empleado
        $('#tbodyEmpleados').append(`
            <tr>

                <!-- Foto -->
                <td class="text-center">
                    ${tienePermiso('empleados.actualizar_foto') ? `
                    <div role="button" class="d-inline-block position-relative avatar-clickable" onclick="abrirModalActualizarFoto(${empleado.id_empleado})" title="Clic para actualizar foto de perfil">
                        ${avatarHtml}
                    </div>
                    ` : `
                    <div class="d-inline-block position-relative">
                        ${avatarHtml}
                    </div>
                    `}
                </td>

                <!-- Nombre -->
                <td>
                    <div class="fw-semibold">
                        ${empleado.nombre}
                        ${empleado.ap_paterno}
                        ${empleado.ap_materno}
                    </div>

                    <small class="text-secondary">
                        ${empleado.nombre_departamento ?? 'Sin departamento'}
                    </small>
                </td>

                <!-- Clave -->
                <td class="fw-semibold">
                    ${empleado.clave_empleado}
                </td>

                <!-- NSS -->
                <td class="text-center">
                    <span
                        role="button"
                        class="badge ${empleado.status_nss == 1 ? 'bg-success' : 'bg-danger'} badge-nss-clickable"
                        onclick="cambiarStatusNss(${empleado.id_empleado}, ${empleado.status_nss})"
                        title="Clic para cambiar estatus de NSS">
                        ${empleado.status_nss == 1 ? '✓ Sí' : '✗ No'}
                    </span>
                </td>

                <!-- Status -->
                <td class="text-center">
                    <span
                        role="button"
                        class="badge rounded-pill ${empleado.id_status == 1 ? 'bg-success' : 'bg-secondary'} badge-status-clickable"
                        onclick="cambiarStatusEmpleado(${empleado.id_empleado}, ${empleado.id_status})"
                        title="${empleado.id_status == 1 ? 'Clic para dar de baja al empleado' : 'Clic para reactivar / dar de alta al empleado'}">
                        ${empleado.id_status == 1 ? 'Activo' : 'Inactivo'}
                    </span>
                </td>

                <!-- Acción -->
                <td class="text-center">
                    <div class="dropdown">
                        <button
                            type="button"
                            class="btn btn-sm btn-light border"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-id="${empleado.id_empleado}">
                            ⋮
                        </button>

                        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                            ${tienePermiso('empleados.ver_informacion') ? `
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2" onclick="accionEmpleado('editar', ${empleado.id_empleado})">
                                    <i class="bi bi-pencil-square text-primary"></i>
                                    <span>Editar Información del empleado</span>
                                </a>
                            </li>
                            ` : ''}

                            ${tienePermiso('empleados.ver_contacto_emergencia') ? `
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2" onclick="accionEmpleado('contacto_emergencia', ${empleado.id_empleado})">
                                    <i class="bi bi-telephone-plus text-danger"></i>
                                    <span>Contacto de emergencia</span>
                                </a>
                            </li>
                            ` : ''}

                            ${tienePermiso('empleados.ver_beneficiarios') ? `
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2" onclick="accionEmpleado('beneficiarios', ${empleado.id_empleado})">
                                    <i class="bi bi-people text-success"></i>
                                    <span>Beneficiarios</span>
                                </a>
                            </li>
                            ` : ''}

                            ${tienePermiso('empleados.ver_reingresos') ? `
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2" onclick="accionEmpleado('reingresos', ${empleado.id_empleado})">
                                    <i class="bi bi-arrow-repeat text-warning"></i>
                                    <span>Reingresos</span>
                                </a>
                            </li>
                            ` : ''}

                            <li>
                                <hr class="dropdown-divider">
                            </li>

                            ${tienePermiso('empleados.ver_horarios') ? `
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2" onclick="accionEmpleado('horarios', ${empleado.id_empleado})">
                                    <i class="bi bi-clock text-info"></i>
                                    <span>Horarios</span>
                                </a>
                            </li>
                            ` : ''}

                            ${tienePermiso('empleados.ver_horarios_oficiales') ? `
                            <li>
                                <a class="dropdown-item d-flex align-items-center gap-2" href="javascript:void(0)" onclick="accionEmpleado('horarios_oficiales', ${empleado.id_empleado})">
                                    <i class="bi bi-calendar-check text-secondary"></i>
                                    <span>Horarios Oficiales</span>
                                </a>
                            </li>
                            ` : ''}

                        </ul>
                    </div>
                </td>

            </tr>
        `);
    });

    // Crear la paginación
    crearPaginacion();

    // Aplicar permisos de NSS después de renderizar la tabla
    aplicarPermisosNss();

    // Aplicar permisos de estatus después de renderizar la tabla
    aplicarPermisosStatusEmpleado();
}



//====================================================
// FUNCIÓN PARA CREAR LA PAGINACIÓN
//====================================================

function crearPaginacion() {

    // Limpiar la paginación actual
    $('#paginacionEmpleados').empty();

    // Calcular el total de páginas
    let totalPaginas = Math.ceil(
        empleadosFiltrados.length / registrosPorPagina
    );

    // Si no hay páginas, terminar la función
    if (totalPaginas === 0) {
        return;
    }


    //================================================
    // BOTÓN ANTERIOR
    //================================================

    $('#paginacionEmpleados').append(`
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">

            <button
                type="button"
                class="page-link"
                onclick="cambiarPagina(${paginaActual - 1})">

                <i class="bi bi-chevron-left"></i>

            </button>

        </li>
    `);


    //================================================
    // SI HAY POCAS PÁGINAS
    //================================================

    if (totalPaginas <= 7) {

        // Recorrer todas las páginas
        for (let pagina = 1; pagina <= totalPaginas; pagina++) {

            agregarBotonPagina(pagina);
        }

    } else {

        //================================================
        // PRIMERA PÁGINA
        //================================================

        agregarBotonPagina(1);


        //================================================
        // PÁGINAS CERCANAS A LA ACTUAL
        //================================================

        let paginaInicio = paginaActual - 1;
        let paginaFin = paginaActual + 1;


        // Si estamos cerca del inicio
        if (paginaActual <= 3) {

            paginaInicio = 2;
            paginaFin = 4;
        }


        // Si estamos cerca del final
        if (paginaActual >= totalPaginas - 2) {

            paginaInicio = totalPaginas - 3;
            paginaFin = totalPaginas - 1;
        }


        // Mostrar puntos si hay páginas ocultas al inicio
        if (paginaInicio > 2) {

            agregarPuntos();
        }


        // Mostrar las páginas cercanas
        for (
            let pagina = paginaInicio;
            pagina <= paginaFin;
            pagina++
        ) {

            agregarBotonPagina(pagina);
        }


        // Mostrar puntos si hay páginas ocultas al final
        if (paginaFin < totalPaginas - 1) {

            agregarPuntos();
        }


        //================================================
        // ÚLTIMA PÁGINA
        //================================================

        agregarBotonPagina(totalPaginas);
    }


    //================================================
    // BOTÓN SIGUIENTE
    //================================================

    $('#paginacionEmpleados').append(`
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">

            <button
                type="button"
                class="page-link"
                onclick="cambiarPagina(${paginaActual + 1})">

                <i class="bi bi-chevron-right"></i>

            </button>

        </li>
    `);
}


//====================================================
// FUNCIÓN PARA AGREGAR UN BOTÓN DE PÁGINA
//====================================================

function agregarBotonPagina(pagina) {

    // Agregar el botón de la página
    $('#paginacionEmpleados').append(`
        <li class="page-item ${pagina === paginaActual ? 'active' : ''}">

            <button
                type="button"
                class="page-link"
                onclick="cambiarPagina(${pagina})">

                ${pagina}

            </button>

        </li>
    `);
}


//====================================================
// FUNCIÓN PARA AGREGAR LOS PUNTOS
//====================================================

function agregarPuntos() {

    // Agregar los tres puntos
    $('#paginacionEmpleados').append(`
        <li class="page-item disabled">

            <span class="page-link">
                ...
            </span>

        </li>
    `);
}

//====================================================
// FUNCIÓN PARA CAMBIAR DE PÁGINA
//====================================================

function cambiarPagina(pagina) {

    // Calcular el total de páginas
    let totalPaginas = Math.ceil(
        empleadosFiltrados.length / registrosPorPagina
    );

    // Verificar que la página sea válida
    if (pagina < 1 || pagina > totalPaginas) {
        return;
    }

    // Cambiar la página actual
    paginaActual = pagina;

    // Mostrar los empleados
    mostrarEmpleados();
}


//====================================================
// FUNCIÓN PARA OBTENER LAS INICIALES DEL EMPLEADO
//====================================================

function obtenerIniciales(nombre, apellido) {

    // Obtener la primera letra del nombre
    let inicialNombre = nombre
        ? nombre.trim().charAt(0).toUpperCase()
        : '';

    // Obtener la primera letra del apellido
    let inicialApellido = apellido
        ? apellido.trim().charAt(0).toUpperCase()
        : '';

    // Regresar las dos iniciales
    return inicialNombre + inicialApellido;
}


//====================================================
// FUNCIÓN PARA EJECUTAR ACCIONES DEL MENÚ DE EMPLEADO
//====================================================

function accionEmpleado(accion, idEmpleado) {


    // verificar la acción seleccionada
    switch (accion) {

        case 'editar':
            // abrir edición de información del empleado
            abrirModalEditarEmpleado(idEmpleado);
            break;

        case 'contacto_emergencia':
            // abrir contacto de emergencia del empleado
            abrirModalContactoEmergencia(idEmpleado);
            break;

        case 'beneficiarios':
            // abrir beneficiarios del empleado
            abrirModalBeneficiarios(idEmpleado);
            break;

        case 'reingresos':
            // abrir reingresos del empleado
            abrirModalReingresos(idEmpleado);
            break;

        case 'horarios':
            // abrir horarios del empleado
            abrirModalHorarios(idEmpleado);
            break;

        case 'horarios_oficiales':
            // abrir horarios oficiales del empleado
            abrirModalHorariosOficiales(idEmpleado);
            break;

        case 'actualizar_foto':
            // abrir actualización de foto de perfil
            abrirModalActualizarFoto(idEmpleado);
            break;
    }
}

