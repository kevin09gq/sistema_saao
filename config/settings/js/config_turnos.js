
let hora_inicio = document.getElementById('hora_inicio')
let hora_fin = document.getElementById('hora_fin')

$(document).ready(function () {
    getTurnos();
    registrarTurno();
    eliminarTurno();
    editarTurno();
    buscarTurnos();
    cancelarTurno();
});


// Se Obtienen las áreas
function getTurnos() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerTurnos.php",
        success: function (response) {
            if (!response.error) {
                let turnos = JSON.parse(response);
                let opciones = ``;

                // Agregamos un contador para mostrar números secuenciales
                let contador = 1;

                turnos.forEach((element) => {
                    opciones += `
                                <tr id="area-row-${element.id_turno}" data-id="${element.id_turno}">
                                    <td>${contador}</td>
                                    <td>${element.descripcion} (${element.inicio_hora} - ${element.fin_hora})</td>
                                    <td>
                                        <button class="btn btn-sm btn-edit btn-edit-turno" id="btn-edit-turno-${element.id_turno}" data-id="${element.id_turno}" title="Editar"><i class="bi bi-pencil"></i></button>
                                        <button class="btn btn-sm btn-delete btn-delete-turno" id="btn-delete-turno-${element.id_turno}" data-id="${element.id_turno}" title="Eliminar"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>   
                        `;

                    // Incrementamos el contador para la siguiente área
                    contador++;
                });
                $("#turnos-tbody").html(opciones);
            }
        }
    });
}

// Función para registrar un área nueva
function registrarTurno() {
    $("#turnoForm").submit(function (e) {
        e.preventDefault();

        // Crear un objeto FormData para manejar la carga de archivos
        let formData = new FormData(this);

        // Obtener los valores del formulario
        let idTurno = $("#turno_id").val().trim();
        let descripcion = $("#descripcion").val().trim();
        let hora_inicio = $("#hora_inicio").val().trim();
        let hora_fin    = $("#hora_fin").val().trim();
        let max        = $("#max").val().trim();

        let accion = idTurno ? "actualizarTurno" : "registrarTurno";

        // Agregar la acción al FormData
        formData.append("accion", accion);

        if (descripcion != "" && max != "") {
            $.ajax({
                type: "POST",
                url: "../php/configTurnos.php",
                data: formData,
                contentType: false,
                processData: false,
                cache: false,
                success: function (response) {
                    if (response.trim() == "1") {
                        // Operación exitosa
                        // Resetear el formulario
                        resetearFormulario();
                        // Recargar la lista de áreas
                        getTurnos();

                        // Mostrar mensaje de éxito con SweetAlert2
                        let mensaje = accion === "registrarTurno" ?
                            "Turno registrado correctamente" :
                            "Turno actualizado correctamente";

                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: mensaje,
                            confirmButtonColor: '#22c55e'
                        });
                    } else {
                        // Mostrar mensaje de error con SweetAlert2
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
        } else {
            // Mostrar mensaje de advertencia con SweetAlert2
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Debe completar todo el formulario.',
                confirmButtonColor: '#eab308'
            });
        }
    });
}

// Función para resetear el formulario a su estado inicial
function resetearFormulario() {
    $("#turno_id").val('');
    $("#descripcion").val('DIURNA');
    $("#hora_inicio").val('');
    $("#hora_fin").val('');
    $("#max").val('');
    $("#btn-guardar-turno").html('<i class="bi bi-save"></i> Guardar');
}

function eliminarTurno() {
    $(document).on("click", ".btn-delete-turno", function () {
        let idTurno = $(this).data("id");
        let descripcion = $(this).closest("tr").find("td:eq(1)").text();

        Swal.fire({
            icon: 'question',
            title: '¿Eliminar turno?',
            text: '¿Seguro que deseas eliminar el turno "' + descripcion + '"? Los empleados asociados serán afectados.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    type: "POST",
                    url: "../php/configTurnos.php",
                    data: {
                        accion: "eliminarTurno",
                        id_turno: idTurno
                    },
                    success: function (response) {
                        let resultado = response.trim();
                        if (resultado == "1") {
                            Swal.fire({
                                icon: 'success',
                                title: 'Turno eliminado',
                                text: 'El turno se ha eliminado correctamente',
                                confirmButtonColor: '#22c55e'
                            });
                            getTurnos();
                        } else if (resultado == "2") {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar el turno',
                                confirmButtonColor: '#ef4444'
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Ocurrió un problema: ' + response,
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
            }
        });
    });
}

// NUEVA FUNCIÓN PARA EDITAR TURNO
function editarTurno() {
    $(document).on("click", ".btn-edit-turno", function () {
        let idTurno = $(this).data("id");
        $.ajax({
            type: "POST",
            url: "../php/configTurnos.php",
            data: {
                accion: "obtenerInfoTurno",
                id_turno: idTurno
            },
            success: function (response) {
                
                try {
                    let data = JSON.parse(response);
                    if (data.error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message || 'No se pudo obtener la información del turno',
                            confirmButtonColor: '#ef4444'
                        });
                        return;
                    }

                    $("#turno_id").val(data.id_turno);
                    $("#descripcion").val(data.descripcion);
                    $("#hora_inicio").val(data.hora_inicio);
                    $("#hora_fin").val(data.hora_fin);
                    $("#max").val(data.max);

                    $("#btn-guardar-turno").html('<i class="fas fa-save"></i> Actualizar');
                } catch (e) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al procesar la información del turno',
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

// FUNCIÓN PARA BUSCAR TUNROS EN LA TABLA
function buscarTurnos() {
    $("#search-turnos").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#turnos-tbody tr").filter(function () {
            $(this).toggle($(this).find("td:eq(1)").text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

// FUNCIÓN PARA LIMPIAR EL FORMULARIO AL CANCELAR
function cancelarTurno() {
    $("#btn-cancelar-turno").on("click", function () {
        $("#turnoForm").trigger("reset");
    });
}

/**
 * Eventos adicionales
 */
$(hora_inicio).on('change', function (e) {
    e.preventDefault();
    const valor = $(this).val();

    // Con esto se separa en horas y minutos
    let [h, m] = valor.split(":").map(Number);

    // convertir las horas en minutos y luego se suma con los minutos
    let minutosTotales = h * 60 + m;

    // Sumar 9 horas (540 minutos)
    minutosTotales += 9 * 60;

    // Ajustar si pasa de 24h (1440 minutos)
    minutosTotales = minutosTotales % (24 * 60);

    /**
     * Al chile ni me acordaba de esto
     * y se lo pedi a copilot
     */
    let nuevaHora = String(Math.floor(minutosTotales / 60)).padStart(2, "0") + ":" + String(minutosTotales % 60).padStart(2, "0");

    hora_fin.value = nuevaHora;

});