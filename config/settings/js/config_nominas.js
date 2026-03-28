$(document).ready(function () {
    // Inicializar submódulo de Tipos de Nómina
    getNominas();
    registrarNomina();
    eliminarNomina();
    editarNomina();
    buscarNominas();
    cancelarNomina();

    // Eventos del modal
    iniciarModalAsignacion();
    iniciarModalRolesPuesto();
});

// ==========================================
// MÓDULO: NOMBRES DE NÓMINA
// ==========================================

function getNominas() {
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php?accion=obtenerNominas",
        success: function (response) {
            if (!response.error) {
                let nominas = JSON.parse(response);
                let opciones = ``;
                let contador = 1;

                nominas.forEach((element) => {
                    opciones += `
                        <tr id="nomina-row-${element.id_nomina}" data-id="${element.id_nomina}">
                            <td>${contador}</td>
                            <td>${element.nombre_nomina}</td>
                            <td>
                                <button class="btn btn-sm btn-info btn-assign-dept text-white me-1" data-id="${element.id_nomina}" data-nombre="${element.nombre_nomina}" title="Asignar Departamentos"><i class="bi bi-diagram-3"></i></button>
                                <button class="btn btn-sm btn-warning btn-config-roles text-white me-1" data-id="${element.id_nomina}" data-nombre="${element.nombre_nomina}" title="Configurar Roles por Puesto"><i class="bi bi-person-badge"></i></button>
                                <button class="btn btn-sm btn-edit btn-edit-nomina me-1" data-id="${element.id_nomina}" title="Editar"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-delete btn-delete-nomina" data-id="${element.id_nomina}" title="Eliminar"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>   
                    `;
                    contador++;
                });
                $("#nominas-tbody").html(opciones);
            }
        }
    });
}

function registrarNomina() {
    $("#nominaForm").submit(function (e) {
        e.preventDefault();
        
        let idNomina = $("#nomina_id").val().trim();
        let nombreNomina = $("#nombre_nomina").val().trim();
        let accion = idNomina ? "actualizarNomina" : "registrarNomina";
        
        if (nombreNomina != "") {
            $.ajax({
                type: "POST",
                url: "../php/configNominas.php",
                data: {
                    accion: accion,
                    nomina_id: idNomina,
                    nombre_nomina: nombreNomina
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        resetearFormularioNomina();
                        getNominas();
                        
                        let mensaje = accion === "registrarNomina" ? "Nómina registrada" : "Nómina actualizada";
                        Swal.fire({ icon: 'success', title: 'Éxito', text: mensaje, confirmButtonColor: '#22c55e' });
                    } else if (response.trim() == "3") {
                        Swal.fire({ icon: 'warning', title: 'Atención', text: 'El nombre de nómina ya existe' });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la operación' });
                    }
                }
            });
        }
    });
}

function eliminarNomina() {
    $(document).on("click", ".btn-delete-nomina", function () {
        let idNomina = $(this).data("id");
        let nombreNomina = $(this).closest("tr").find("td:eq(1)").text();

        Swal.fire({
            title: '¿Eliminar nómina?',
            text: '¿Seguro que deseas eliminar la nómina "' + nombreNomina + '"? Esto eliminará todos los departamentos asignados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configNominas.php",
                    data: { accion: "eliminarNomina", id_nomina: idNomina },
                    success: function (response) {
                        if (response.trim() == "1") {
                            Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Nómina eliminada', confirmButtonColor: '#22c55e' });
                            getNominas();
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar' });
                        }
                    }
                });
            }
        });
    });
}

function editarNomina() {
    $(document).on("click", ".btn-edit-nomina", function () {
        let idNomina = $(this).data("id");
        let nombreNomina = $(this).closest("tr").find("td:eq(1)").text();
        
        $("#nomina_id").val(idNomina);
        $("#nombre_nomina").val(nombreNomina);
        $("#btn-guardar-nomina").html('<i class="bi bi-save"></i> Actualizar');
    });
}

function buscarNominas() {
    $("#search-nominas").on("keyup", function() {
        let valor = $(this).val().toLowerCase();
        $("#nominas-tbody tr").filter(function() {
            $(this).toggle($(this).find("td:eq(1)").text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

function cancelarNomina() {
    $("#btn-cancelar-nomina").on("click", function () {
        resetearFormularioNomina();
    });
}

function resetearFormularioNomina() {
    $("#nomina_id").val('');
    $("#nombre_nomina").val('');
    $("#btn-guardar-nomina").html('<i class="bi bi-save"></i> Guardar');
}


// ==========================================
// MÓDULO: ASIGNACIÓN NÓMINA - DEPARTAMENTO (MODAL)
// ==========================================

function iniciarModalAsignacion() {
    // Abrir modal y cargar su información
    $(document).on("click", ".btn-assign-dept", function () {
        let idNomina = $(this).data("id");
        let nombreNomina = $(this).data("nombre");

        // Limpiar selects y cargarlos
        $("#modal_select_area").prop('selectedIndex', 0);
        $("#modal_select_departamento").html('<option value="" selected disabled>Primero elija un área...</option>').prop('disabled', true);
        cargarAreasSelect();

        // Configurar UI de Modal
        $("#lblNombreNominaModal").text(nombreNomina);
        $("#modal_nomina_id").val(idNomina);
        
        cargarDepartamentosAsignados(idNomina);
        
        $("#modalAsignarDepartamentos").modal("show");
    });

    // Evento al cambiar el área
    $("#modal_select_area").on("change", function() {
        let idArea = $(this).val();
        if (idArea) {
            cargarDepartamentosPorArea(idArea);
        } else {
            $("#modal_select_departamento").html('<option value="" selected disabled>Primero elija un área...</option>').prop('disabled', true);
        }
    });

    // Formulario de agregar un departamento a la nómina del modal actual
    $("#formAgregarDeptoNomina").submit(function (e) {
        e.preventDefault();
        
        let idNomina = $("#modal_nomina_id").val();
        let idDepartamento = $("#modal_select_departamento").val();
        
        if (idNomina && idDepartamento) {
            $.ajax({
                type: "POST",
                url: "../php/configNominas.php",
                data: {
                    accion: "registrarNominaDepartamento",
                    id_nomina: idNomina,
                    id_departamento: idDepartamento
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        // Limpiar formulario y recargar insignias
                        $("#modal_select_departamento").prop('selectedIndex', 0);
                        cargarDepartamentosAsignados(idNomina);
                    } else if (response.trim() == "3") {
                        Swal.fire({ icon: 'info', title: 'Atención', text: 'El departamento ya está asignado a esta nómina' });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la operación' });
                    }
                }
            });
        }
    });

    // Eliminar relación de la nómina haciendo clic en la X de un badge
    $(document).on("click", ".btn-delete-nd-modal", function () {
        let idRelacion = $(this).data("id");
        let idNominaEnModal = $("#modal_nomina_id").val(); // Mantenemos contexto

        Swal.fire({
            title: '¿Quitar asignación?',
            text: '¿Seguro de quitar este departamento?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configNominas.php",
                    data: { accion: "eliminarNominaDepartamento", id_relacion: idRelacion },
                    success: function (response) {
                        if (response.trim() == "1") {
                            cargarDepartamentosAsignados(idNominaEnModal);
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo quitar la asignación' });
                        }
                    }
                });
            }
        });
    });
}

function cargarDepartamentosAsignados(idNomina) {
    $("#contenedorDepartamentosAsignados").html('<div class="text-center w-100 text-muted py-3"><div class="spinner-border spinner-border-sm me-2" role="status"></div> Cargando departamentos...</div>');
    
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php",
        data: {
            accion: "obtenerDepartamentosPorNomina",
            id_nomina: idNomina
        },
        success: function (response) {
            try {
                let deptos = JSON.parse(response);
                let badges = ``;

                if (deptos.length > 0) {
                    deptos.forEach(depto => {
                        badges += `
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2" style="font-weight: 500; font-size: 0.9rem;">
                            ${depto.nombre_departamento} 
                            <i class="bi bi-x-circle ms-2 cursor-pointer fw-bold btn-delete-nd-modal" data-id="${depto.id_nomina_departamento}" title="Quitar departamento" style="cursor: pointer; font-size: 1.1rem; vertical-align: middle;"></i>
                        </span>`;
                    });
                } else {
                    badges = `<div class="text-center w-100 text-muted fst-italic py-3">No hay departamentos asignados a esta nómina.</div>`;
                }

                $("#contenedorDepartamentosAsignados").html(badges);
            } catch (e) {
                console.error("Error al procesar departamentos", e);
                $("#contenedorDepartamentosAsignados").html('<div class="text-center text-danger w-100">Error al cargar listado.</div>');
            }
        }
    });
}

function cargarAreasSelect() {
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php?accion=obtenerAreas", 
        success: function (response) {
            try {
                let areas = JSON.parse(response);
                let opciones = `<option value="" selected disabled>Seleccione un área...</option>`;
                areas.forEach((element) => {
                    opciones += `<option value="${element.id_area}">${element.nombre_area}</option>`;
                });
                $("#modal_select_area").html(opciones);
            } catch (e) {
                console.log("Error al procesar áreas.");
            }
        }
    });
}

function cargarDepartamentosPorArea(idArea) {
    $("#modal_select_departamento").html('<option value="" selected disabled>Cargando...</option>').prop('disabled', true);
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php",
        data: { accion: "obtenerDepartamentosPorArea", id_area: idArea },
        success: function (response) {
            try {
                let deptos = JSON.parse(response);
                let opciones = `<option value="" selected disabled>Elegir departamento...</option>`;
                deptos.forEach((element) => {
                    opciones += `<option value="${element.id_departamento}">${element.nombre_departamento}</option>`;
                });
                $("#modal_select_departamento").html(opciones).prop('disabled', false);
            } catch (e) {
                console.log("Error al procesar departamentos por área.");
            }
        }
    });
}


// ==========================================
// MÓDULO: CONFIGURACIÓN ROLES - PUESTO (MODAL)
// ==========================================

function iniciarModalRolesPuesto() {
    // Abrir modal
    $(document).on("click", ".btn-config-roles", function () {
        let idNomina = $(this).data("id");
        let nombreNomina = $(this).data("nombre");

        $("#lblNombreNominaRolesModal").text(nombreNomina);
        $("#modal_roles_nomina_id").val(idNomina);

        // Cargar selects
        cargarSelectPuestosRoles(idNomina);
        cargarSelectRolesLaborales();
        
        // Cargar mapeo actual
        cargarMapeoRolesPuestos(idNomina);

        $("#modalConfigurarRolesPuesto").modal("show");
    });

    // Formulario para agregar relación
    $("#formRelacionRolPuesto").submit(function (e) {
        e.preventDefault();
        let idNomina = $("#modal_roles_nomina_id").val();
        let idPuesto = $("#modal_select_puesto_rol").val();
        let idRol = $("#modal_select_rol_laboral").val();

        if (idNomina && idPuesto && idRol) {
            $.ajax({
                type: "POST",
                url: "../php/configNominas.php",
                data: {
                    accion: "registrarRelacionRolPuesto",
                    id_nomina: idNomina,
                    id_puesto: idPuesto,
                    id_rol: idRol
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        cargarMapeoRolesPuestos(idNomina);
                        cargarSelectPuestosRoles(idNomina); // RECARGAR SELECT
                        // Resetear selects si se desea
                        $("#modal_select_puesto_rol").prop('selectedIndex', 0);
                        // No reseteamos el de rol por si quiere asignar varios al mismo rol
                    } else if (response.trim() == "3") {
                        Swal.fire({ icon: 'info', title: 'Atención', text: 'Este puesto ya tiene un rol asignado en esta nómina' });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar la relación' });
                    }
                }
            });
        }
    });

    // Eliminar relación
    $(document).on("click", ".btn-remove-role-puesto", function () {
        let idNomina = $("#modal_roles_nomina_id").val();
        let idPuesto = $(this).data("puesto");
        let idRol = $(this).data("rol");

        Swal.fire({
            title: '¿Quitar rol?',
            text: '¿Seguro que deseas eliminar esta asociación?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configNominas.php",
                    data: {
                        accion: "eliminarRelacionRolPuesto",
                        id_nomina: idNomina,
                        id_puesto: idPuesto,
                        id_rol: idRol
                    },
                    success: function (response) {
                        if (response.trim() == "1") {
                            cargarMapeoRolesPuestos(idNomina);
                            cargarSelectPuestosRoles(idNomina); // RECARGAR SELECT
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar' });
                        }
                    }
                });
            }
        });
    });

    // Botón para gestionar el catálogo de Roles (opcional si el usuario quiere agregar nuevos)
    $("#btn-gestionar-catalogo-roles").on("click", function() {
        Swal.fire({
            title: 'Nuevo Rol Laboral',
            input: 'text',
            inputLabel: 'Nombre del Rol (ej. Jornalero Base)',
            inputPlaceholder: 'Escribe el nombre...',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                $.ajax({
                    type: "POST",
                    url: "../php/configNominas.php",
                    data: { accion: "registrarRolLaboral", nombre_rol: result.value },
                    success: function (response) {
                        if (response.trim() == "1") {
                            Swal.fire('Guardado', 'Rol agregado al catálogo', 'success');
                            cargarSelectRolesLaborales();
                        } else if (response.trim() == "3") {
                            Swal.fire('Atención', 'Ese rol ya existe', 'warning');
                        }
                    }
                });
            }
        });
    });
}

function cargarSelectPuestosRoles(idNomina) {
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php",
        data: {
            accion: "obtenerPuestosPorNominaDepartamentos",
            id_nomina: idNomina
        },
        success: function (response) {
            let puestos = JSON.parse(response);
            let opciones = `<option value="" selected disabled>Seleccione puesto...</option>`;
            puestos.forEach(p => {
                opciones += `<option value="${p.id_puestoEspecial}">${p.nombre_puesto}</option>`;
            });
            $("#modal_select_puesto_rol").html(opciones);
        }
    });
}

function cargarSelectRolesLaborales() {
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php?accion=obtenerRolesLaborales",
        success: function (response) {
            let roles = JSON.parse(response);
            let opciones = `<option value="" selected disabled>Seleccione rol...</option>`;
            roles.forEach(r => {
                opciones += `<option value="${r.id_rol_laboral}">${r.nombre_rol}</option>`;
            });
            $("#modal_select_rol_laboral").html(opciones);
        }
    });
}

function cargarMapeoRolesPuestos(idNomina) {
    $("#contenedorMapeoRolesPuestos").html('<div class="text-center py-3 text-muted"><div class="spinner-border spinner-border-sm me-2"></div> Cargando mapeo...</div>');
    
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php",
        data: { accion: "obtenerConfiguracionRolesPuesto", id_nomina: idNomina },
        success: function (response) {
            try {
                let mapeo = JSON.parse(response);
                let content = ``;

                if (mapeo.length > 0) {
                    // Agrupar por Rol
                    let agrupados = {};
                    mapeo.forEach(m => {
                        if (!agrupados[m.nombre_rol]) {
                            agrupados[m.nombre_rol] = [];
                        }
                        agrupados[m.nombre_rol].push({
                            id_puesto: m.id_puestoEspecial,
                            nombre_puesto: m.nombre_puesto,
                            id_rol: m.id_rol_laboral
                        });
                    });

                    for (let rol in agrupados) {
                        let puestosHtml = '';
                        agrupados[rol].forEach(p => {
                            puestosHtml += `
                            <div class="d-flex justify-content-between align-items-center mb-1 p-2 bg-white border rounded shadow-sm">
                                <span class="text-secondary small fw-bold">${p.nombre_puesto}</span>
                                <i class="bi bi-x-circle text-danger cursor-pointer btn-remove-role-puesto" 
                                   data-puesto="${p.id_puesto}" 
                                   data-rol="${p.id_rol}"
                                   title="Eliminar asociación" style="font-size: 1.1rem;"></i>
                            </div>`;
                        });

                        content += `
                        <div class="col-md-6 mb-4">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-header bg-warning bg-opacity-10 py-2 border-0">
                                    <h6 class="mb-0 text-warning d-flex align-items-center">
                                        <i class="bi bi-person-badge me-2"></i> ${rol}
                                    </h6>
                                </div>
                                <div class="card-body p-2 bg-light bg-opacity-50">
                                    ${puestosHtml}
                                </div>
                            </div>
                        </div>`;
                    }
                } else {
                    content = `<div class="text-center text-muted fst-italic py-3 w-100">No hay roles configurados para los puestos de esta nómina.</div>`;
                }
                $("#contenedorMapeoRolesPuestos").html(`<div class="row g-3">${content}</div>`);
            } catch(e) {
                console.error(e);
                $("#contenedorMapeoRolesPuestos").html('<div class="text-center text-danger w-100">Error al cargar datos.</div>');
            }
        }
    });
}
