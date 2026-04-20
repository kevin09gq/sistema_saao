$(document).ready(function () {
    // Inicializar submódulo de Tipos de Nómina
    getNominas();
    actualizarNominaForm();
    editarNomina();
    buscarNominas();
    cancelarNomina();
    cargarAreasFormSelect();

    // Eventos del modal
    iniciarModalAsignacion();

    // Actualizar texto del color en el modal de asignación
    $(document).on("change", "#modal_color_departamento", function () {
        $("#modal_color_text").text($(this).val().toUpperCase());
    });
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
                            <td><span class="badge bg-secondary">${element.nombre_area}</span></td>
                            <td>
                                <button class="btn btn-sm btn-info btn-assign-dept text-white me-1" 
                                    data-id="${element.id_nomina}" 
                                    data-nombre="${element.nombre_nomina}" 
                                    data-area-id="${element.id_area}"
                                    title="Asignar Departamentos"><i class="bi bi-diagram-3"></i></button>
                                <button class="btn btn-sm btn-edit btn-edit-nomina me-1" 
                                    data-id="${element.id_nomina}" 
                                    data-area-id="${element.id_area}"
                                    title="Editar"><i class="bi bi-pencil"></i></button>

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

function cargarAreasFormSelect() {
    $.ajax({
        type: "GET",
        url: "../php/configNominas.php?accion=obtenerAreas",
        success: function (response) {
            let areas = JSON.parse(response);
            let opciones = `<option value="" selected disabled>Seleccione un área...</option>`;
            areas.forEach(a => {
                opciones += `<option value="${a.id_area}">${a.nombre_area}</option>`;
            });
            $("#select_area_nomina").html(opciones);
        }
    });
}

function actualizarNominaForm() {
    $("#nominaForm").submit(function (e) {
        e.preventDefault();

        let idNomina = $("#nomina_id").val().trim();
        let nombreNomina = $("#nombre_nomina").val().trim();
        let idArea = $("#select_area_nomina").val();

        if (idNomina && nombreNomina != "" && idArea != null) {
            $.ajax({
                type: "POST",
                url: "../php/configNominas.php",
                data: {
                    accion: "actualizarNomina",
                    nomina_id: idNomina,
                    nombre_nomina: nombreNomina,
                    id_area: idArea
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        resetearFormularioNomina();
                        getNominas();

                        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Nómina actualizada correctamente', confirmButtonColor: '#22c55e' });
                    } else if (response.trim() == "3") {
                        Swal.fire({ icon: 'warning', title: 'Atención', text: 'El nombre de nómina ya existe' });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la operación' });
                    }
                }
            });
        } else {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Debe seleccionar una nómina válida para actualizar' });
        }
    });
}

function editarNomina() {
    $(document).on("click", ".btn-edit-nomina", function () {
        let idNomina = $(this).data("id");
        let nombreNomina = $(this).closest("tr").find("td:eq(1)").text();
        let idArea = $(this).data("area-id");
        let colorNomina = $(this).data("color") || "#FF0000";

        $("#nomina_id").val(idNomina);
        $("#nombre_nomina").val(nombreNomina);
        $("#select_area_nomina").val(idArea);
        $("#color_nomina").val(colorNomina);
        $("#color_nomina_text").text(colorNomina.toUpperCase());
        $("#btn-guardar-nomina").html('<i class="bi bi-save"></i> Actualizar');
        
        // Transición de la Interfaz
        $("#alert-select-nomina").hide();
        $("#form-update-nomina-container").slideDown();
    });
}

function buscarNominas() {
    $("#search-nominas").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#nominas-tbody tr").filter(function () {
            let rowText = $(this).find("td:eq(1)").text() + " " + $(this).find("td:eq(2)").text();
            $(this).toggle(rowText.toLowerCase().indexOf(valor) > -1);
        });
    });
}

function cancelarNomina() {
    $("#btn-cancelar-nomina").on("click", function () {
        resetearFormularioNomina();
    });
}

function resetearFormularioNomina() {
    // Escondemos el form y mostramos la alerta inicial
    $("#form-update-nomina-container").slideUp(200, function() {
        $("#alert-select-nomina").fadeIn();
        $("#nomina_id").val('');
        $("#nombre_nomina").val('');
        $("#select_area_nomina").val('');
    });
}


// ==========================================
// MÓDULO: ASIGNACIÓN NÓMINA - DEPARTAMENTO (MODAL)
// ==========================================

function iniciarModalAsignacion() {
    // Abrir modal y cargar su información
    $(document).on("click", ".btn-assign-dept", function () {
        let idNomina = $(this).data("id");
        let nombreNomina = $(this).data("nombre");
        let idArea = $(this).data("area-id");

        // Configurar UI de Modal
        $("#lblNombreNominaModal").text(nombreNomina);
        $("#modal_nomina_id").val(idNomina);
        $("#modal_nomina_area_id").val(idArea);

        // Cargar departamentos del área de la nómina
        cargarDepartamentosPorAreaModal(idArea);
        cargarDepartamentosAsignados(idNomina);

        $("#modalAsignarDepartamentos").modal("show");
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
                    id_departamento: idDepartamento,
                    color_depto_nomina: $("#modal_color_departamento").val()
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
                        <div class="badge shadow-sm d-flex align-items-center p-0 overflow-hidden border" style="background-color: white; border-color: ${depto.color_depto_nomina || '#FF0000'} !important; min-width: 120px;">
                            <div style="background-color: ${depto.color_depto_nomina || '#FF0000'}; width: 10px; height: 35px;"></div>
                            <span class="px-2 text-dark fw-semibold flex-grow-1">${depto.nombre_departamento}</span>
                            <button class="btn btn-sm btn-link text-danger p-1 me-1 btn-delete-nd-modal" data-id="${depto.id_nomina_departamento}" title="Quitar departamento">
                                <i class="bi bi-x-circle-fill"></i>
                            </button>
                        </div>`;
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

function cargarDepartamentosPorAreaModal(idArea) {
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
