$(document).ready(function () {
    getPuestos();
    agregarPuesto();
    buscarPuesto();
    eliminarPuesto();
    editarPuesto();
});



// Se Obtienen los puestos
function getPuestos() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerPuestos.php",
        success: function (response) {
            if (!response.error) {
                let puestos = JSON.parse(response);
                let opciones = ``;

                // Agregamos un contador para mostrar números secuenciales
                let contador = 1;

                puestos.forEach((element) => {
                    opciones += `
                                <tr id="puesto-row-${element.id_puestoEspecial}" data-id="${element.id_puestoEspecial}">
                                    <td>${contador}</td>
                                    <td>${element.nombre_puesto}</td>
                                    <td>
                                        <button class="btn btn-sm btn-edit btn-edit-puesto" id="btn-edit-puesto-${element.id_puestoEspecial}" data-id="${element.id_puestoEspecial}" title="Editar"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-delete btn-delete-puesto" id="btn-delete-puesto-${element.id_puestoEspecial}" data-id="${element.id_puestoEspecial}" title="Eliminar"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>   
                        `;

                    // Incrementamos el contador para el siguiente puesto
                    contador++;
                });
                $("#puestos-tbody").html(opciones);
            }
        }
    });
}

function agregarPuesto() {
    $("#puestoForm").submit(function (e) {
        e.preventDefault();
        
        let idPuesto = $("#puesto_id").val().trim();
        let nombrePuesto = $("#nombre_puesto").val().trim();
        let accion = idPuesto ? "actualizarPuesto" : "registrarPuesto";
        
        if (nombrePuesto != "") {
            $.ajax({
                type: "POST",
                url: "../php/configuration.php",
                data: {
                    accion: accion,
                    id_puesto: idPuesto,
                    nombre_puesto: nombrePuesto
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        limpiarYResetearPuesto();
                        getPuestos();
                        
                        // Mostrar mensaje de éxito con SweetAlert2
                        let mensaje = accion === "registrarPuesto" ? 
                            "Puesto registrado correctamente" : 
                            "Puesto actualizado correctamente";
                        
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
                }
            });
        } else {
            // Mostrar mensaje de advertencia con SweetAlert2
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Ingrese un nombre para el puesto',
                confirmButtonColor: '#eab308'
            });
        }
    });
}

// Limpiar formulario al cancelar
$("#btn-cancelar-puesto").on("click", function () {
    limpiarYResetearPuesto();
});

// Función sencilla para limpiar y resetear el formulario de puesto
function limpiarYResetearPuesto() {
    $("#puesto_id").val('');
    $("#nombre_puesto").val('');
    $("#btn-guardar-puesto").html('<i class="fas fa-save"></i> Guardar');
}

function limpiarFormulario() {
    $("#btn-cancelar-puesto").click(function (e) {
        e.preventDefault();
        resetearFormulario();
    });
}

function buscarPuesto() {
    $("#search-puestos").on("keyup", function() {
        let valor = $(this).val().toLowerCase();
        $("#puestos-tbody tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

function eliminarPuesto() {
    // Delegación de eventos para capturar clics en botones de eliminación
    $(document).on("click", ".btn-delete-puesto", function() {
        // Obtener el ID del puesto desde el atributo data-id
        let idPuesto = $(this).data("id");
        
        // Confirmar la eliminación con SweetAlert2
        Swal.fire({
            icon: 'question',
            title: '¿Eliminar puesto?',
            text: 'Los empleados asociados a este puesto serán actualizados. Esta acción no se puede deshacer.',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b'
        }).then((result) => {
            if (result.isConfirmed) {
                // Realizar la petición AJAX para eliminar el puesto
                $.ajax({
                    type: "POST",
                    url: "../php/configuration.php",
                    data: {
                        accion: "eliminarPuesto",
                        id_puesto: idPuesto
                    },
                    success: function(response) {
                        // Parsear la respuesta
                        let resultado = response.trim();
                        
                        if (resultado == "1") {
                            // Eliminación exitosa
                            Swal.fire({
                                icon: 'success',
                                title: 'Puesto eliminado',
                                text: 'El puesto se ha eliminado correctamente',
                                confirmButtonColor: '#22c55e'
                            });
                            
                            // Recargar la lista de puestos
                            getPuestos();
                        } else if (resultado == "2") {
                            // Error al eliminar
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar el puesto',
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
                    error: function() {
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

function editarPuesto() {
    // Delegación de eventos para capturar clics en botones de edición
    $(document).on("click", ".btn-edit-puesto", function() {
        // Obtener el ID del puesto desde el atributo data-id
        let idPuesto = $(this).data("id");
        
        // Obtener el nombre del puesto (está en la celda anterior a la de los botones)
        let nombrePuesto = $(this).closest("tr").find("td:eq(1)").text();
        
        // Llenar el formulario con los datos actuales
        $("#puesto_id").val(idPuesto);
        $("#nombre_puesto").val(nombrePuesto);
        
        // Cambiar el texto del botón de guardar para indicar que se está editando
        $("#btn-guardar-puesto").html('<i class="fas fa-save"></i> Actualizar');
        
        // Hacer scroll al formulario para que el usuario pueda editar
        $('html, body').animate({
            scrollTop: $("#puestoForm").offset().top - 100
        }, 500);
    });
}

// Función para resetear el formulario a su estado inicial
function resetearFormulario() {
    $("#puesto_id").val('');
    $("#nombre_puesto").val('');
    $("#btn-guardar-puesto").html('<i class="fas fa-save"></i> Guardar');
}
