$(document).ready(function () {
    obtenerDepartamentos();
    cargarAreasEnSelects();
    editarDepartamento();
    agregarDepartamento();
    filtrarPorArea();
    buscarDepartamentos();
});

// Variables globales para paginación
let departamentosData = [];
let paginaActual = 1;
let registrosPorPagina = 5;

//=========================================
// FUNCIÓN PARA OBTENER LOS DEPARTAMENTOS
// MOSTRARLOS EN LA TABLA DE LA VISTA
//=========================================

function obtenerDepartamentos(filtroArea = '') {

    $.ajax({
        type: "POST",
        url: "../php/departamentos.php",

        data: {
            accion: "obtenerDepartamentos",
            filtroArea: filtroArea
        },

        dataType: "json",

        success: function (response) {

            if (response.success) {

                // Guardamos los datos en la variable global
                departamentosData = response.departamentos;
                
                // Reiniciamos a la primera página
                paginaActual = 1;
                
                // Renderizamos la tabla con paginación
                renderizarTablaDepartamentos();

            } else {

                console.error(response.mensaje);

            }
        },

        error: function (xhr, status, error) {

            console.error("Error AJAX:", error);
            console.error(xhr.responseText);

        }
    });
}

//=========================================
// FUNCIÓN PARA RENDERIZAR TABLA CON PAGINACIÓN
//=========================================

function renderizarTablaDepartamentos() {
    
    // Limpiamos la tabla
    $("#tablaDepartamentos").empty();
    
    // Obtenemos el texto de búsqueda
    let busqueda = $("#busquedaDepartamentos").val().toLowerCase();
    
    // Filtramos por búsqueda
    let departamentosFiltrados = departamentosData.filter(function(departamento) {
        return departamento.nombre_departamento.toLowerCase().includes(busqueda);
    });
    
    // Calculamos paginación
    let totalRegistros = departamentosFiltrados.length;
    let totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
    
    // Ajustamos la página actual si excede el total
    if (paginaActual > totalPaginas && totalPaginas > 0) {
        paginaActual = totalPaginas;
    }
    
    // Obtenemos los registros de la página actual
    let inicio = (paginaActual - 1) * registrosPorPagina;
    let fin = inicio + registrosPorPagina;
    let departamentosPagina = departamentosFiltrados.slice(inicio, fin);
    
    // Recorremos los departamentos de la página actual
    departamentosPagina.forEach(function (departamento, index) {
        
        let numeroRegistro = inicio + index + 1;
        let conteoAreas = departamento.areas ? departamento.areas.length : 0;
        
        // Creamos la fila
        let fila = `
            <tr>
                <td class="text-muted small">${numeroRegistro}</td>
                <td class="fw-semibold">
                    ${departamento.nombre_departamento}
                </td>
                <td class="text-center">
                    <button 
                        class="btn btn-sm btn-outline-success"
                        onclick="verAreasDepartamento('${departamento.id_departamento}', '${departamento.nombre_departamento}', ${JSON.stringify(departamento.areas || [])})"
                        title="Ver áreas asignadas">
                        <i class="bi bi-diagram-3"></i>
                        <span class="badge bg-success ms-1">${conteoAreas}</span>
                    </button>
                </td>
                <td class="text-end">
                    <div class="dropdown">
                        <button 
                            type="button"
                            class="btn btn-sm btn-light"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            title="Acciones">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <button
                                    type="button"
                                    class="dropdown-item"
                                    onclick="abrirModalEditarDepartamento('${departamento.id_departamento}', '${departamento.nombre_departamento}', ${JSON.stringify(departamento.areas || [])})">
                                    <i class="bi bi-pencil me-2 text-primary"></i>
                                    Editar
                                </button>
                            </li>
                        </ul>
                    </div>
                </td>
            </tr>
        `;

        // Agregamos la fila a la tabla
        $("#tablaDepartamentos").append(fila);
    });
    
    // Actualizamos contadores
    $("#registrosVisibles").text(departamentosPagina.length);
    $("#totalRegistros").text(totalRegistros);
    
    // Renderizamos la paginación
    renderizarPaginacion(totalPaginas);
}

//=========================================
// FUNCIÓN PARA RENDERIZAR PAGINACIÓN
//=========================================

function renderizarPaginacion(totalPaginas) {
    
    let paginacionHtml = '';
    
    if (totalPaginas <= 1) {
        $("#paginacionDepartamentos").empty();
        return;
    }
    
    // Botón anterior
    paginacionHtml += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
            paginacionHtml += `
                <li class="page-item ${i === paginaActual ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="cambiarPagina(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === paginaActual - 2 || i === paginaActual + 2) {
            paginacionHtml += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
        }
    }
    
    // Botón siguiente
    paginacionHtml += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;
    
    $("#paginacionDepartamentos").html(paginacionHtml);
}

//=========================================
// FUNCIÓN PARA CAMBIAR DE PÁGINA
//=========================================

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    renderizarTablaDepartamentos();
}

//=========================================
// FUNCIÓN PARA BUSCAR DEPARTAMENTOS
//=========================================

function buscarDepartamentos() {
    
    $("#busquedaDepartamentos").on('input', function () {
        paginaActual = 1; // Reiniciar a primera página al buscar
        renderizarTablaDepartamentos();
    });
}

//=========================================
// FUNCIÓN PARA VER ÁREAS DE UN DEPARTAMENTO
//=========================================

function verAreasDepartamento(id_departamento, nombre_departamento, areas) {
    
    // Mostrar nombre del departamento
    $("#nombreDepartamentoInfo").text(`Departamento: ${nombre_departamento}`);
    
    // Limpiar tabla
    $("#tablaAreasAsignadas").empty();
    
    if (areas && areas.length > 0) {
        // Mostrar tabla de áreas
        $("#tablaAreasAsignadas").show();
        $("#sinAreasMensaje").hide();
        
        areas.forEach(function (area, index) {
            
            // Obtener iniciales
            let iniciales = obtenerIniciales(area.nombre_area);
            
            // Renderizar avatar
            let avatarHtml = area.logo_area
                ? `<img
                        src="${rutaRaiz}public/logosAreas/${area.logo_area}"
                        alt="Logo de ${area.nombre_area}"
                        class="rounded-circle"
                        width="40"
                        height="40"
                        style="object-fit: contain;"
                        onerror="this.outerHTML='<div class=\\'avatar-iniciales\\'>${iniciales}</div>'">`
                : `<div class="avatar-iniciales">${iniciales}</div>`;
            
            let fila = `
                <tr>
                    <td class="text-muted small">${index + 1}</td>
                    <td class="text-center">${avatarHtml}</td>
                    <td class="fw-semibold">${area.nombre_area}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="color-preview" style="background-color: ${area.colores || '#6c757d'}; width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border-color);"></div>
                            <span>${area.colores || '#6c757d'}</span>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="color-preview" style="background-color: ${area.colores_texto || '#ffffff'}; width: 24px; height: 24px; border-radius: 4px; border: 1px solid var(--border-color);"></div>
                            <span>${area.colores_texto || '#ffffff'}</span>
                        </div>
                    </td>
                </tr>
            `;
            
            $("#tablaAreasAsignadas").append(fila);
        });
    } else {
        // Mostrar mensaje sin áreas
        $("#tablaAreasAsignadas").hide();
        $("#sinAreasMensaje").show();
    }
    
    // Abrir modal
    $('#modalVerAreasDepartamento').modal('show');
}

//=========================================
// FUNCIÓN PARA CARGAR ÁREAS EN LOS SELECTS
//=========================================

function cargarAreasEnSelects() {

    $.ajax({
        type: "POST",
        url: "../php/areas.php",
        data: {
            accion: "obtenerAreas"
        },
        dataType: "json",
        success: function (response) {

            if (response.success) {

                // Limpiar selects
                $("#filtroAreaDepartamentos").find('option:not(:first)').remove();
                $("#agregarAreasDepartamento").empty();
                $("#editarAreasDepartamento").empty();

                // Agregar opciones
                response.areas.forEach(function (area) {
                    let option = `<option value="${area.id_area}">${area.nombre_area}</option>`;
                    
                    $("#filtroAreaDepartamentos").append(option);
                    $("#agregarAreasDepartamento").append(option);
                    $("#editarAreasDepartamento").append(option);
                });

            }
        }
    });
}

//=========================================
// FUNCIÓN PARA FILTRAR POR ÁREA
//=========================================

function filtrarPorArea() {

    $("#filtroAreaDepartamentos").on('change', function () {
        let filtroArea = $(this).val();
        obtenerDepartamentos(filtroArea);
    });
}

//=========================================
// FUNCIÓN PARA ABRIR EL MODAL PARA
// EDITAR UN DEPARTAMENTO
//=========================================

function abrirModalEditarDepartamento(id_departamento, nombre_departamento, areas) {

    // Guardar id del departamento en el formulario
    $("#editarIdDepartamento").val(id_departamento);

    // Asignar Nombre del departamento
    $("#editarNombreDepartamento").val(nombre_departamento);

    // Seleccionar áreas asignadas
    $("#editarAreasDepartamento").val([]); // Limpiar selección primero
    if (areas && areas.length > 0) {
        let areasIds = areas.map(function (area) {
            return area.id_area.toString();
        });
        $("#editarAreasDepartamento").val(areasIds);
    }

    // Mostramos el modal de edición
    $('#modalEditarDepartamento').modal('show');
}

//=========================================
// FUNCIÓN PARA EDITAR LA INFORMACION DE 
// EL DEPARTAMENTO
//=========================================

function editarDepartamento() {

    $("#btnActualizarDepartamento").click(function (e) {

        e.preventDefault();

        // Obtenemos los datos del formulario
        let datosDepartamento = {
            id_departamento: $("#editarIdDepartamento").val(),
            nombre_departamento: $("#editarNombreDepartamento").val(),
            areas: $("#editarAreasDepartamento").val() || []
        };

        // Validamos que el nombre del departamento no esté vacío
        if (datosDepartamento.nombre_departamento == null || datosDepartamento.nombre_departamento.trim() === "") {
            mostrarAlerta("error", "Error", "El nombre del departamento no puede estar vacío.");
            return;
        }

        // Enviamos los datos al servidor mediante AJAX
        $.ajax({
            type: "POST",
            url: "../php/departamentos.php",
            data: {
                datosDepartamento: datosDepartamento,
                accion: "editarDepartamento"
            },
            dataType: "json",
            success: function (response) {

                if (response.success) {

                    // Mostramos un mensaje de éxito
                    mostrarAlerta("success", "Éxito", response.mensaje);

                    // Actualizamos la lista de departamentos
                    let filtroArea = $("#filtroAreaDepartamentos").val();
                    obtenerDepartamentos(filtroArea);

                    // Limpiamos el formulario de edición
                    limpiarFormularioEditarDepartamento();

                    // Cerramos el modal
                    $('#modalEditarDepartamento').modal('hide');
                } else {
                    mostrarAlerta("error", "Error", response.mensaje);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error AJAX:", error);
                console.error(xhr.responseText);
                mostrarAlerta("error", "Error", "Ocurrió un error al editar el departamento.");
            }
        });

    });
}

//=========================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE 
// EDICIÓN DE DEPARTAMENTO
//=========================================

function limpiarFormularioEditarDepartamento() {
    $("#editarIdDepartamento").val("");
    $("#editarNombreDepartamento").val("");
    $("#editarAreasDepartamento").val([]);
}

//=========================================
// FUNCIÓN PARA LIMPIAR EL FORMULARIO DE 
// AGREGAR DEPARTAMENTO
//=========================================

function limpiarFormularioAgregarDepartamento() {
    $("#agregarNombreDepartamento").val("");
    $("#agregarAreasDepartamento").val([]);
}

//=========================================
// FUNCIÓN PARA AGREGAR UN NUEVO DEPARTAMENTO
//=========================================

function agregarDepartamento() {
    $("#btnGuardarDepartamento").click(function (e) {
        e.preventDefault();

        // Validamos que el nombre del departamento no esté vacío
        let nombre_departamento = $("#agregarNombreDepartamento").val();
        if (nombre_departamento == null || nombre_departamento.trim() === "") {
            mostrarAlerta("error", "Error", "El nombre del departamento no puede estar vacío.");
            return;
        }

        // Obtenemos las áreas seleccionadas
        let areas = $("#agregarAreasDepartamento").val() || [];

        // Obtenemos los datos del formulario
        let datosDepartamento = {
            nombre_departamento: nombre_departamento,
            areas: areas
        };

        // Enviamos los datos al servidor mediante AJAX
        $.ajax({
            type: "POST",
            url: "../php/departamentos.php",
            data: {
                datosDepartamento: datosDepartamento,
                accion: "agregarDepartamento"
            },
            dataType: "json",
            success: function (response) {

                if (response.success) {

                    // Mostramos un mensaje de éxito
                    mostrarAlerta("success", "Éxito", response.mensaje);

                    // Actualizamos la lista de departamentos
                    let filtroArea = $("#filtroAreaDepartamentos").val();
                    obtenerDepartamentos(filtroArea);

                    // Limpiamos el formulario de agregado
                    limpiarFormularioAgregarDepartamento();

                    // Cerramos el modal
                    $('#modalAgregarDepartamento').modal('hide');
                } else {
                    mostrarAlerta("error", "Error", response.mensaje);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error AJAX:", error);
                console.error(xhr.responseText);
                mostrarAlerta("error", "Error", "Ocurrió un error al agregar el departamento.");
            }
        });
    });
}
