$(document).ready(function () {
    getVersiones();
    registrarVersion();
    editarVersion();
    eliminarVersion();
    buscarVersiones();
    cancelarVersion();
    
    // Gestión de Días
    configurarDias();
    registrarDia();

    // Inicializar evento de pestaña
    eventoTabLFT();
});

function eventoTabLFT() {
    $('#tablas-lft-tab').on('shown.bs.tab', function () {
        getVersiones();
    });
}

/**
 * ============================================================================
 * GESTIÓN DE VERSIONES LFT
 * ============================================================================
 */

function getVersiones() {
    $.ajax({
        type: "GET",
        url: "../php/configTablasLft.php",
        data: { accion: "listarVersiones" },
        success: function (response) {
            try {
                let versiones = JSON.parse(response);
                let html = "";
                let contador = 1;

                versiones.forEach((v) => {
                    let vigencia = v.fecha_inicio_vigencia + (v.fecha_fin_vigencia ? " al " + v.fecha_fin_vigencia : " (Actual)");
                    html += `
                        <tr id="version-row-${v.id_version_vacaciones}">
                            <td>${contador++}</td>
                            <td>${v.nombre_version}</td>
                            <td><small>${vigencia}</small></td>
                            <td>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-primary btn-config-dias" 
                                        data-id="${v.id_version_vacaciones}" 
                                        data-nombre="${v.nombre_version}" 
                                        title="Configurar Días"><i class="bi bi-calendar-check"></i></button>
                                    
                                    <button class="btn btn-sm btn-warning btn-edit-version" 
                                        data-id="${v.id_version_vacaciones}" 
                                        title="Editar"><i class="bi bi-pencil"></i></button>
                                    
                                    <button class="btn btn-sm btn-danger btn-delete-version" 
                                        data-id="${v.id_version_vacaciones}" 
                                        data-nombre="${v.nombre_version}" 
                                        title="Eliminar"><i class="bi bi-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    `;
                });
                $("#versiones-lft-tbody").html(html);
            } catch (e) {
                console.error("Error al procesar versiones:", e);
            }
        }
    });
}

function registrarVersion() {
    $("#versionLftForm").submit(function (e) {
        e.preventDefault();
        
        let idVersion = $("#id_version_vacaciones").val().trim();
        let nombreVersion = $("#nombre_version").val().trim();
        
        if (nombreVersion === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Ingrese un nombre para la versión',
                confirmButtonColor: '#eab308'
            });
            return;
        }

        let formData = new FormData(this);
        formData.append("accion", "guardarVersion");

        $.ajax({
            type: "POST",
            url: "../php/configTablasLft.php",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.trim() == "1") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: idVersion ? 'Versión actualizada correctamente' : 'Versión registrada correctamente',
                        confirmButtonColor: '#22c55e'
                    });
                    resetearFormularioVersion();
                    getVersiones();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo procesar la operación',
                        confirmButtonColor: '#ef4444'
                    });
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor',
                    confirmButtonColor: '#ef4444'
                });
            }
        });
    });
}

function editarVersion() {
    $(document).on("click", ".btn-edit-version", function () {
        let id = $(this).data("id");
        $.ajax({
            type: "POST",
            url: "../php/configTablasLft.php",
            data: { accion: "obtenerInfoVersion", id_version_vacaciones: id },
            success: function (response) {
                try {
                    let v = JSON.parse(response);
                    $("#id_version_vacaciones").val(v.id_version_vacaciones);
                    $("#nombre_version").val(v.nombre_version);
                    $("#fecha_inicio_vigencia_lft").val(v.fecha_inicio_vigencia);
                    $("#fecha_fin_vigencia_lft").val(v.fecha_fin_vigencia);
                    $("#btn-guardar-version-lft").html('<i class="bi bi-save"></i> Actualizar');
                } catch (e) {
                    console.error("Error al cargar versión:", e);
                }
            }
        });
    });
}

function eliminarVersion() {
    $(document).on("click", ".btn-delete-version", function () {
        let id = $(this).data("id");
        let nombre = $(this).data("nombre");

        Swal.fire({
            title: "¿Eliminar versión?",
            text: `¿Seguro que deseas eliminar "${nombre}"? Se borrarán también sus días y primas asociados.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configTablasLft.php",
                    data: { accion: "eliminarVersion", id_version_vacaciones: id },
                    success: function (response) {
                        if (response.trim() == "1") {
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: 'La versión ha sido eliminada correctamente',
                                confirmButtonColor: '#22c55e'
                            });
                            getVersiones();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar la versión',
                                confirmButtonColor: '#ef4444'
                            });
                        }
                    }
                });
            }
        });
    });
}

function cancelarVersion() {
    $("#btn-cancelar-version-lft").on("click", function () {
        resetearFormularioVersion();
    });
}

function resetearFormularioVersion() {
    $("#versionLftForm")[0].reset();
    $("#id_version_vacaciones").val("");
    $("#btn-guardar-version-lft").html('<i class="bi bi-save"></i> Guardar');
}

function buscarVersiones() {
    $("#search-versiones-lft").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#versiones-lft-tbody tr").filter(function () {
            $(this).toggle($(this).find("td:eq(1)").text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

/**
 * ============================================================================
 * GESTIÓN DE DÍAS POR ANTIGÜEDAD
 * ============================================================================
 */

function configurarDias() {
    $(document).on("click", ".btn-config-dias", function() {
        let id = $(this).data("id");
        let nombre = $(this).data("nombre");
        
        $("#id_version_dias").val(id);
        $("#nombre_version_dias").text(nombre);
        listarDias(id);
        $("#modal_dias_lft").modal("show");
    });
}

function listarDias(id) {
    $.ajax({
        type: "POST",
        url: "../php/configTablasLft.php",
        data: { accion: "listarDias", id_version_vacaciones: id },
        success: function (response) {
            try {
                let dias = JSON.parse(response);
                let html = "";
                if (dias.length === 0) {
                    html = '<tr><td colspan="3" class="text-center text-muted">No hay rangos configurados</td></tr>';
                } else {
                    dias.forEach(d => {
                        let textoRango = d.anios_antiguedad_fin ? `De ${d.anios_antiguedad_inicio} a ${d.anios_antiguedad_fin} años` : `Año ${d.anios_antiguedad_inicio}`;
                        html += `
                            <tr>
                                <td>${textoRango}</td>
                                <td>${d.dias_vacaciones_correspondientes} días</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarDia(${d.id_dias_vacaciones}, ${id})"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        `;
                    });
                }
                $("#tbody_dias_lft").html(html);
            } catch (e) {
                console.error("Error al listar días:", e);
            }
        }
    });
}

function registrarDia() {
    $("#form_dias_lft").submit(function (e) {
        e.preventDefault();
        let id_version = $("#id_version_dias").val();
        let formData = new FormData(this);
        formData.append("accion", "guardarDia");

        $.ajax({
            type: "POST",
            url: "../php/configTablasLft.php",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.icono == "success") {
                    listarDias(id_version);
                    $("#form_dias_lft")[0].reset();
                    $("#id_version_dias").val(id_version);
                }
                Swal.fire({
                    icon: response.icono,
                    title: response.titulo,
                    text: response.mensaje,
                    confirmButtonColor: response.icono === 'success' ? '#22c55e' : '#ef4444'
                });
            }
        });
    });
}

function eliminarDia(id, id_version) {
    $.ajax({
        type: "POST",
        url: "../php/configTablasLft.php",
        data: { accion: "eliminarDia", id_dias_vacaciones: id },
        success: function (response) {
            if (response.trim() == "1") {
                listarDias(id_version);
            }
        }
    });
}
