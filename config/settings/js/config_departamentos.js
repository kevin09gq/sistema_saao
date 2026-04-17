$(document).ready(function () {
    getDepartamentos();
    agregarDepartamento();
    buscarDepartamento();
    eliminarDepartamento();
    editarDepartamento();
});


const rutaRaiz = '/sistema_saao/';


// Se Obtienen los departamentos
function getDepartamentos() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerDepartamentos.php",
        success: function (response) {
            if (!response.error) {
                let departamentos = JSON.parse(response);
                let opciones = ``;

                // Agregamos un contador para mostrar números secuenciales
                let contador = 1;

                departamentos.forEach((element) => {
                    opciones += `
                                <tr id="departamento-row-${element.id_departamento}" data-id="${element.id_departamento}">
                                    <td>${contador}</td>
                                    <td>${element.nombre_departamento}</td>
                                    <td>
                                        <button class="btn btn-sm btn-edit btn-edit-departamento" id="btn-edit-departamento-${element.id_departamento}" data-id="${element.id_departamento}" title="Editar"><i class="bi bi-pencil"></i></button>
                                        <button
                                            class="btn btn-sm btn-success btn_ver_area_dep"
                                            data-id="${element.id_departamento}"
                                            data-nombre="${element.nombre_departamento}"
                                            title="Ver a que área pertenece"><i class="bi bi-diagram-3-fill"></i></button>

                                        <button
                                            class="btn btn-sm btn-info text-white btn_ver_puestos_departamento"
                                            data-id="${element.id_departamento}"
                                            data-nombre="${element.nombre_departamento}"
                                            title="Ver puestos"><i class="bi bi-diagram-3-fill"></i></button>

                                        <button class="btn btn-sm btn-delete btn-delete-departamento" id="btn-delete-departamento-${element.id_departamento}" data-id="${element.id_departamento}" title="Eliminar"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>   
                        `;

                    // Incrementamos el contador para el siguiente departamento
                    contador++;
                });
                $("#departamentos-tbody").html(opciones);
            }
        }
    });
}

// Se agregan los departamentos a la tabla
function agregarDepartamento() {
    $("#departamentoForm").submit(function (e) {
        e.preventDefault();

        let idDepartamento = $("#departamento_id").val().trim();
        let nombreDepartamento = $("#nombre_departamento").val().trim();
        let accion = idDepartamento ? "actualizarDepartamento" : "registrarDepartamento";

        if (nombreDepartamento != "") {
            $.ajax({
                type: "POST",
                url: "../php/configDepartamentos.php",
                data: {
                    accion: accion,
                    id_departamento: idDepartamento,
                    nombre_departamento: nombreDepartamento
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        // Operación exitosa
                        limpiarYResetearDepartamento();
                        getDepartamentos();
                        

                        let mensaje = accion === "registrarDepartamento" ?
                            "Departamento registrado correctamente" :
                            "Departamento actualizado correctamente";
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: mensaje,
                            confirmButtonColor: '#22c55e'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo procesar la operación',
                            confirmButtonColor: '#ef4444'
                        });
                    }
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Ingrese un nombre para el departamento',
                confirmButtonColor: '#eab308'
            });
        }
    });

}

// Limpiar formulario al cancelar
$("#btn-cancelar-departamento").on("click", function () {
    limpiarYResetearDepartamento();
});

// Función sencilla para limpiar y resetear el formulario de departamento
function limpiarYResetearDepartamento() {
    $("#departamento_id").val('');
    $("#nombre_departamento").val('');
    $("#id_area_departamento").val('');
    $("#btn-guardar-departamento").html('<i class="fas fa-save"></i> Guardar');
}

// Función para buscar departamentos en la tabla
function buscarDepartamento() {
    $("#search-departamentos").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#departamentos-tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

// Función para eliminar un departamento
function eliminarDepartamento() {
    // Delegación de eventos para capturar clics en botones de eliminación SOLO de departamentos
    $(document).on("click", ".btn-delete-departamento", function () {
        // Obtener el ID del departamento desde el atributo data-id
        let idDepartamento = $(this).data("id");

        // Confirmar la eliminación con SweetAlert2
        Swal.fire({
            icon: 'question',
            title: '¿Eliminar departamento?',
            text: 'Los empleados asociados a este departamento serán actualizados. Esta acción no se puede deshacer.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                // Realizar la petición AJAX para eliminar el departamento
                $.ajax({
                    type: "POST",
                    url: "../php/configDepartamentos.php",
                    data: {
                        accion: "eliminarDepartamento",
                        id_departamento: idDepartamento
                    },
                    success: function (response) {
                        // Parsear la respuesta
                        let resultado = response.trim();

                        if (resultado == "1") {
                            // Eliminación exitosa
                            Swal.fire({
                                icon: 'success',
                                title: 'Departamento eliminado',
                                text: 'El departamento se ha eliminado correctamente',
                                confirmButtonColor: '#22c55e'
                            });

                            // Recargar la lista de departamentos
                            getDepartamentos();

                            // Actualizar la tabla de departamentos-puestos si existe
                            if (typeof getDepartamentoPuesto === 'function') {
                                getDepartamentoPuesto();
                            }



                            // Si existe una función para recargar la tabla de nóminas-departamentos
                            if (typeof cargarDepartamentosDeNomina === 'function') {
                                // Recargar si existe una nómina seleccionada
                                if (typeof nominaActualId !== 'undefined' && nominaActualId !== null) {
                                    cargarDepartamentosDeNomina(nominaActualId);
                                }
                            }
                        } else if (resultado == "2") {
                            // Error al eliminar
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar el departamento',
                                confirmButtonColor: '#ef4444'
                            });
                        } else {
                            // Otro error
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

// Función para editar un departamento
function editarDepartamento() {
    $(document).on("click", ".btn-edit-departamento", function () {
        // Obtener el ID del departamento desde el atributo data-id
        let idDepartamento = $(this).data("id");
        // Obtener el nombre del departamento (está en la celda anterior a la de los botones)
        let nombreDepartamento = $(this).closest("tr").find("td:eq(1)").text();

        // Llenar el formulario con los datos actuales
        $("#departamento_id").val(idDepartamento);
        $("#nombre_departamento").val(nombreDepartamento);

        // Cambiar el texto del botón de guardar para indicar que se está editando
        $("#btn-guardar-departamento").html('<i class="fas fa-save"></i> Actualizar');

        // Hacer scroll al formulario para que el usuario pueda editar
        $('html, body').animate({
            scrollTop: $("#departamentoForm").offset().top - 100
        }, 500);


    });
}


/**
 * ============================================================================
 * HACER RELACION ENTRE DEPARTAMENTOS Y ÁREAS
 * ============================================================================
 */


// Recuperar el modal
const modal_area_departamento = new bootstrap.Modal(document.getElementById('modal_area_departamento'));

// Evento para mostrar el modal con los detalles del departamento y sus áreas asociadas
$(document).on('click', '.btn_ver_area_dep', function (e) {
    e.preventDefault();

    let idDepartamento = $(this).data('id');
    let nombreDepartamento = $(this).data('nombre');

    // Llenar los campos del modal con los datos del departamento
    $("#nombre_depa_area").text(nombreDepartamento);
    $('#id_departamento_modal_area').val(idDepartamento);

    // Recuperar todas las áreas
    llenar_select_area_dep();

    // Recuperar las áreas asociadas al departamento
    llenar_tbody_area_depa(idDepartamento);

    // Mostrar el modal
    modal_area_departamento.show();
});

// Recuperar las areas para el select
function llenar_select_area_dep() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerAreas.php",
        dataType: "json",
        success: function (response) {

            let tmp = `<option value="">Selecciona un área</option>`;

            response.forEach(element => {
                tmp += `<option value="${element.id_area}">${element.nombre_area}</option>`;
            });

            $('#select_area_dep').html(tmp);
        }
    });
}

// Recuperar las áreas asociadas a un departamento y llenar el tbody del modal
function llenar_tbody_area_depa(id_departamento) {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerAreas.php",
        data: { id_departamento: id_departamento },
        dataType: "json",
        success: function (response) {
            let tmp = '';
            let contador = 1;
            if (response.length === 0) {
                tmp = `<tr><td colspan="3" class="text-center">No hay áreas asignadas a este departamento</td></tr>`;
            } else {
                response.forEach(element => {
                    tmp += `<tr>
                            <td>${contador++}</td>
                            <td>${element.nombre_area}</td>
                            <td>
                                <button
                                    class="btn btn-outline-danger btn-sm btn_eliminar_area_dep"
                                    data-dep="${id_departamento}"
                                    data-area="${element.id_area}">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </td>
                        </tr>`;
                });
            }

            $('#tbody_area_dep').html(tmp);
        }
    });
}

$(document).on('click', '#btn_agregar_area_dep', function (e) {
    e.preventDefault();

    let id_area = $('#select_area_dep').val();
    let id_departamento = $('#id_departamento_modal_area').val();

    if (id_area == "" || id_departamento == "") {
        Swal.fire({
            title: "Campos incompletos",
            text: "Debe seleccionar una Área.",
            icon: "info"
        });
        return;
    }

    $.ajax({
        type: "POST",
        url: "../php/configDepartamentos.php",
        data: {
            accion: "registrarAreaDepartamento",
            id_area: id_area,
            id_departamento: id_departamento
        },
        dataType: "json",
        success: function (response) {
            alerta(response.titulo, response.mensaje, response.icono);
            // Volver a llenar el tbody para los cambios
            llenar_tbody_area_depa(id_departamento);
        },
        error: function (xhr, status, error) {
            // Capturar la respuesta
            let dtata = JSON.parse(xhr.responseText);
            // Alerta
            alerta(dtata.titulo, dtata.mensaje, dtata.icono);
        }
    });

});

$(document).on('click', '.btn_eliminar_area_dep', function (e) {
    e.preventDefault();

    let id_area = $(this).data("area");
    let id_departamento = $(this).data("dep");

    Swal.fire({
        title: "Eliminar área",
        text: "El departamento dejará de estar asignado a esta área, ¿desea continuar?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#d23232",
        cancelButtonColor: "rgb(30, 27, 38)",
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "../php/configDepartamentos.php",
                data: {
                    accion: "eliminarAreasDepartamentos",
                    id_area: id_area,
                    id_departamento: id_departamento
                },
                success: function (response) {
                    alerta(response.titulo, response.mensaje, response.icono);
                    // Volver a llenar el tbody para los cambios
                    llenar_tbody_area_depa(id_departamento);
                },
                error: function (xhr, status, error) {
                    // Capturar la respuesta
                    let dtata = JSON.parse(xhr.responseText);
                    // Alerta
                    alerta(dtata.titulo, dtata.mensaje, dtata.icono);
                }
            });
        }
    });
});


/**
 * ============================================================================
 * HACER RELACION ENTRE DEPARTAMENTOS Y PUESTOS
 * ============================================================================
 */

const modal_departamento_puestos = new bootstrap.Modal(document.getElementById('modal_departamento_puestos'));


$(document).on('click', '.btn_ver_puestos_departamento', function (e) {
    e.preventDefault();

    // Obtener el ID y nombre del departamento desde los atributos data-id y data-nombre
    let idDepartamento = $(this).data('id');
    let nombreDepartamento = $(this).data('nombre');

    // Llenar los campos del modal con los datos del departamento
    $("#nombre_depa_puestos").text(nombreDepartamento);
    $('#id_departamento_modal_puesto').val(idDepartamento);

    // Llenar select de los puestos
    llenar_select_puestos();

    // Llenar tbody de los puestos asociados al departamento
    llenar_tbody_puestos_depa(idDepartamento);


    // Mostrar el modal
    modal_departamento_puestos.show();
});

// Recuperar las areas para el select
function llenar_select_puestos() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerPuestos.php",
        dataType: "json",
        success: function (response) {

            let tmp = `<option value="">Selecciona un puesto</option>`;

            response.forEach(element => {
                tmp += `<option value="${element.id_puestoEspecial}">${element.nombre_puesto}</option>`;
            });

            $('#select_puesto_departamento').html(tmp);
        }
    });
}

// Recuperar las áreas asociadas a un departamento y llenar el tbody del modal
function llenar_tbody_puestos_depa(id_departamento) {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerDepartamentosPuestos.php",
        data: { id_departamento: id_departamento },
        dataType: "json",
        success: function (response) {

            console.log(response);


            let tmp = '';
            let contador = 1;
            if (response.length === 0) {
                tmp = `<tr><td colspan="3" class="text-center">No hay puestos asignados a este departamento</td></tr>`;
            } else {
                response.forEach(element => {
                    tmp += `<tr>
                            <td>${contador++}</td>
                            <td>${element.nombre_puesto}</td>
                            <td>
                                <button
                                    class="btn btn-outline-danger btn-sm btn_eliminar_puesto_dep"
                                    data-dep="${id_departamento}"
                                    data-puesto="${element.id_puesto}">
                                    <i class="bi bi-trash-fill"></i>
                                </button>
                            </td>
                        </tr>`;
                });
            }

            $('#tbody_puestos_depa').html(tmp);
        }
    });
}

// Evento para asignar un puesto a un departamento
$(document).on('click', '#btn_agregar_puesto_dep', function (e) {
    e.preventDefault();

    let id_puesto = $('#select_puesto_departamento').val();
    let id_departamento = $('#id_departamento_modal_puesto').val();

    if (id_puesto == "" || id_departamento == "") {
        Swal.fire({
            title: "Campos incompletos",
            text: "Debe seleccionar un puesto.",
            icon: "info"
        });
        return;
    }

    $.ajax({
        type: "POST",
        url: "../php/configPuestos.php",
        data: {
            accion: "registrarDepartamentoPuesto",
            id_puesto: id_puesto,
            id_departamento: id_departamento
        },
        dataType: "json",
        success: function (response) {
            alerta(response.titulo, response.mensaje, response.icono);
            // Volver a llenar el tbody para los cambios
            llenar_tbody_puestos_depa(id_departamento);
        },
        error: function (xhr, status, error) {
            // Capturar la respuesta
            let dtata = JSON.parse(xhr.responseText);
            // Alerta
            alerta(dtata.titulo, dtata.mensaje, dtata.icono);
        }
    });

});

// Evento para eliminar la relación entre un puesto y un departamento
$(document).on('click', '.btn_eliminar_puesto_dep', function (e) {
    e.preventDefault();

    let id_puesto = $(this).data("puesto");
    let id_departamento = $(this).data("dep");

    Swal.fire({
        title: "Eliminar puesto",
        text: "El departamento dejará de estar asignado a este puesto, ¿desea continuar?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#d23232",
        cancelButtonColor: "rgb(30, 27, 38)",
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                type: "POST",
                url: "../php/configPuestos.php",
                data: {
                    accion: "eliminarDepartamentoPuesto",
                    id_puesto: id_puesto,
                    id_departamento: id_departamento
                },
                success: function (response) {
                    alerta(response.titulo, response.mensaje, response.icono);
                    // Volver a llenar el tbody para los cambios
                    llenar_tbody_puestos_depa(id_departamento);
                },
                error: function (xhr, status, error) {
                    // Capturar la respuesta
                    let dtata = JSON.parse(xhr.responseText);
                    // Alerta
                    alerta(dtata.titulo, dtata.mensaje, dtata.icono);
                }
            });
        }
    });
});