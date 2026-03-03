
// Modal para los detalles del rancho
const modal_detalles_info_rancho = new bootstrap.Modal(document.getElementById('modalInfoRancho'));

$(document).ready(function () {
    // iniciar la funcion
    obtenerRanchos();
    copiarHorario();
    limpiarFilaHorario();
    esDescanso();
    obtenerInfoRanchos();

});


// Función para mostrar alertas con SweetAlert2
function alerta(titulo, mensaje, icono) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono,
        confirmButtonText: 'Entendido'
    });
}


/**
 * ==============================================
 * Función para obtener la información de los ranchos
 * ==============================================
 */
function obtenerInfoRanchos() {
    $.ajax({
        url: "../php/configRanchos.php",
        method: "GET",
        data: { accion: "obtenerInfoRanchos" },
        dataType: "json",
        beforeSend: function () {
            $("#ranchos-tbody").html(`<tr><td colspan="3" class="text-center">Cargando información de ranchos...</td></tr>`);
        },
        success: function (response) {
            let tmp = "";
            let data = response.data;
            let contador = 1;

            console.log(data);


            data.forEach(element => {
                tmp += `
                <tr>
                    <td>${contador++}</td>
                    <td>${element.nombre_area}</td>
                    <td>
                        <button
                            title="Editar información del rancho"
                            type="button"
                            data-id="${element.id_info_rancho}" 
                            data-rancho="${element.id_area}"
                            data-arboles="${element.num_arboles}"
                            data-horario='${element.horario_jornalero ? JSON.stringify(element.horario_jornalero) : ''}'
                            class="btn btn-sm btn-outline-primary btn-editar-rancho"><i class="bi bi-pencil-fill"></i></button>

                        <button
                            title="Ver detalles de la información del rancho"
                            type="button"
                            data-nombre="${element.nombre_area}"
                            data-arboles="${element.num_arboles}"
                            data-horario='${element.horario_jornalero ? JSON.stringify(element.horario_jornalero) : ''}'
                            class="btn btn-sm btn-outline-success btn-ver-info-rancho"><i class="bi bi-search"></i></button>

                        <button
                            title="Borrar información del rancho"
                            type="button"
                            data-id="${element.id_info_rancho}" 
                            class="btn btn-sm btn-outline-danger btn-borrar-rancho"><i class="bi bi-trash-fill"></i></button>

                    </td>
                </tr>|`;
            });

            $("#ranchos-tbody").html(tmp);
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener ranchos:", error);
            let dtata = JSON.parse(xhr.responseText);
            $("#ranchos-tbody").html(`<tr><td colspan="3" class="text-center">${dtata.mensaje}</td></tr>`);
        }
    });
}


/**
 * ==============================================
 * Funcion para obtener las areas que son ranchos
 * ==============================================
 */
function obtenerRanchos() {
    $.ajax({
        url: "../php/configRanchos.php",
        method: "GET",
        data: { accion: "obtenerRanchos" },
        dataType: "json",
        success: function (response) {

            let data = response.data;
            let tmp = `<option value="">Selecciona un rancho</option>`;

            data.forEach(element => {
                tmp += `<option value="${element.id_area}">${element.nombre_area}</option>`;
            });

            $("#id_rancho").html(tmp);
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener ranchos:", error);
            let dtata = JSON.parse(xhr.responseText);
        }
    });
}


/**
 * =====================================================
 * Funciones para manejar los horarios de los jornaleros
 * =====================================================
 */
function copiarHorario() {
    $(document).on("click", "#btnCopiarHorarios", function (e) {
        e.preventDefault();

        // Obtener valores del formulario de referencia
        const entrada = $('#ref_entrada').val();
        const salida = $('#ref_salida').val();

        // Verificar si al menos uno tiene valor
        if (!entrada && !salida) return;

        // Copiar a las primeras 7 filas
        $('#tbody_horarios tr').each(function (index) {
            if (index < 7) { // solo las primeras 7 filas
                if (entrada) {
                    $(this).find('input[name="horario_entrada[]"]').val(entrada);
                }
                if (salida) {
                    $(this).find('input[name="horario_salida[]"]').val(salida);
                }
            }
        });

        // Limpiar los campos de referencia
        $('#ref_entrada').val('');
        $('#ref_salida').val('');
    });
}

function limpiarFilaHorario() {
    $(document).on("click", ".btn-eliminar-fila", function (e) {
        e.preventDefault();

        // Recuperar la fila donde se hizo clic
        const $fila = $(this).closest('tr');
        // Limpiar todos los campos de la fila
        $fila.find('input[name="horario_entrada[]"]').val('');
        $fila.find('input[name="horario_salida[]"]').val('');
    });
}

function esDescanso() {
    $(document).on("click", ".chk-descanso", function () {
        // Recuperar la fila donde se hizo clic
        const $fila = $(this).closest('tr');
        // Limpiar todos los campos de la fila
        $fila.find('input[name="horario_entrada[]"]').val('');
        $fila.find('input[name="horario_salida[]"]').val('');
    });
}


/**
 * ================================
 * Funcion para resetear el form
 * ================================
 */
function resetearFormulario() {
    $("#ranchosForm").trigger("reset");
    $("#btn-guardar-rancho").html("Guardar");
}


/**
 * ================================================
 * Función para guardar la configuración del rancho
 * ================================================
 */
$(document).on("submit", "#ranchosForm", function (e) {
    e.preventDefault();

    const id_info_rancho = $("#id_info_rancho").val();

    const accion = id_info_rancho ? "actualizarInfoRancho" : "registrarInfoRancho";

    const id_area = $("#id_rancho").val();
    const num_arboles = $("#num_arboles").val();

    // Recoger los datos del horario
    let horarios = [];
    $('select[name="horario_dia[]"]').each(function (index) {
        const dia = $(this).val().trim();
        const entrada = $('input[name="horario_entrada[]"]').eq(index).val().trim();
        const salida = $('input[name="horario_salida[]"]').eq(index).val().trim();
        const descanso = $('input[name="horario_descanso[]"]').eq(index).is(':checked') ? 1 : 0;

        // Solo agregar si al menos un campo tiene valor
        if (dia || entrada || salida) {
            horarios.push({
                dia: dia || "",
                entrada: entrada || "",
                salida: salida || "",
                descanso: descanso
            });
        }
    });

    // ==========================================================================================
    //                                Validar campos requeridos
    // ==========================================================================================
    if (!id_area) {
        alerta("Rancho requerido", "Debe seleccionar un rancho.", "error");
        return;
    }
    if (!num_arboles) {
        alerta("Número de árboles requerido", "Ingresar el número de árboles.", "error");
        return;
    }

    // Validar que el usuario haya llenado al menos un horario
    if (horarios.length === 0) {
        alerta("Horario requerido", "Debe ingresar al menos un horario para los jornaleros.", "info");
        return;
    }

    const datos = {
        accion: accion,
        id_info_rancho: id_info_rancho,

        id_area: id_area,
        num_arboles: num_arboles,
        horarios: horarios
    }

    console.log(datos);


    $.ajax({
        type: "POST",
        url: "../php/configRanchos.php",
        data: datos,
        dataType: "json",
        success: function (response) {

            alerta(response.titulo, response.mensaje, response.icono);

            // Si se registró o actualizó correctamente, resetear el formulario
            if (response.icono === "success") {
                resetearFormulario();
                obtenerInfoRanchos();
            }

        },
        error: function (xhr, status, error) {
            // Capturar la respuesta
            let dtata = JSON.parse(xhr.responseText);
            // Alerta
            alerta(dtata.titulo, dtata.mensaje, dtata.icono);
        }
    });


});


/**
 * ================================================
 * Evento para el boton editar rancho
 * ================================================
 */
$(document).on("click", ".btn-editar-rancho", function (e) {
    e.preventDefault();

    const id_info_rancho = $(this).data("id");
    const id_area = $(this).data("rancho");
    const num_arboles = $(this).data("arboles");
    const horario_jornalero = $(this).data("horario");

    // Llenar los campos del formulario con los datos del rancho
    $("#id_info_rancho").val(id_info_rancho);
    $("#id_rancho").val(id_area);
    $("#num_arboles").val(num_arboles);

    // Llenar los campos del horario
    const $tbodyHorarios = $('#tbody_horarios');

    if ($tbodyHorarios.length) {
        // Limpiar las filas existentes
        $tbodyHorarios.find('input').val('');
        $tbodyHorarios.find('select').prop('selectedIndex', 0);

        // Llenar con los datos de horario_jornalero
        horario_jornalero.forEach((horario, index) => {
            if (index < 7) { // Solo llenar las primeras 7 filas
                const $fila = $tbodyHorarios.find('tr').eq(index);
                // Ahora horario_dia es un select
                $fila.find('select[name="horario_dia[]"]').val(horario.dia || '');
                $fila.find('input[name="horario_entrada[]"]').val(horario.entrada || '');
                $fila.find('input[name="horario_salida[]"]').val(horario.salida || '');
                if (horario.descanso && horario.descanso == 1) {
                    $fila.find('input[name="horario_descanso[]"]').prop('checked', true);
                } else {
                    $fila.find('input[name="horario_descanso[]"]').prop('checked', false);
                }
            }
        });
    }

    $("#btn-guardar-rancho").html("Guardar Cambios");
});


/**
 * ============================================
 * Evento para el boton ver detalles del rancho
 * ============================================
 */
$(document).on("click", ".btn-ver-info-rancho", function (e) {
    e.preventDefault();

    const nombre_area = $(this).data("nombre");
    const num_arboles = $(this).data("arboles");
    const horario_jornalero = $(this).data("horario");

    // Llenar los detalles en el modal
    $("#body-info-rancho").html(`
    <tr class="text-center">
        <td><span class="badge text-bg-success fs-6">${nombre_area}</span></td>
        <td>${num_arboles}</td>  
    `);

    // Llenar los horarios en el modal
    let tmp = "";
    horario_jornalero.forEach(element => {
        tmp += `
        <tr class="text-center">
            <td>${element.dia}</td>
            <td>${element.entrada}</td>
            <td>${element.salida}</td>
            <td>${element.descanso == 1 ? '<span class="badge bg-warning-subtle border border-warning-subtle text-warning-emphasis rounded-pill">Descanso</span>' : ""}</td>
        </tr>`;
    });

    $("#body-rancho-horario-jornaleros").html(tmp);

    modal_detalles_info_rancho.show();
});


/**
 * ==================================================
 * Evento para el boton borrar información del rancho
 * ==================================================
 */
$(document).on("click", ".btn-borrar-rancho", function (e) {
    e.preventDefault();
    // Obtener el ID de la información del rancho a borrar
    const id_info_rancho = $(this).data("id");

    Swal.fire({
        title: "Eliminar información del rancho",
        text: "Toda la información relacionada con este rancho se eliminará, incluyendo los horarios de los jornaleros. ¿Estás seguro de que deseas eliminar esta información?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#be2d2d",
        cancelButtonColor: "rgb(61, 59, 71)",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "../php/configRanchos.php",
                data: { accion: "borrarInfoRancho", id_info_rancho: id_info_rancho },
                dataType: "json",
                success: function (response) {
                    alerta(response.titulo, response.mensaje, response.icono);
                    if (response.icono === "success") {
                        obtenerInfoRanchos();
                    }
                },
                error: function (xhr, status, error) {
                    console.error(error);
                    let dtata = JSON.parse(xhr.responseText);
                    alerta(dtata.titulo, dtata.mensaje, dtata.icono);
                }
            });
        }
    });

});


/**
 * ================================================
 * Funcion para la busqueda
 * ================================================
 */
$("#search-ranchos").on("keyup", function () {
    let valor = $(this).val().toLowerCase();
    $("#ranchos-tbody tr").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(valor) > -1);
    });
});