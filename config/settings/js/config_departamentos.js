$(document).ready(function () {
    getDepartamentos();
    getObtenerAreasSelect();
    agregarDepartamento();
    buscarDepartamento();
    eliminarDepartamento();
    editarDepartamento();
});


const rutaRaiz = '/sistema_saao/';
const areasSelect = document.getElementById('id_area_departamento');


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
                                <tr id="departamento-row-${element.id_departamento}" data-id="${element.id_departamento}" data-area="${element.id_area}">
                                    <td>${contador}</td>
                                    <td>${element.nombre_departamento}</td>
                                    <td>
                                        <button class="btn btn-sm btn-edit btn-edit-departamento" id="btn-edit-departamento-${element.id_departamento}" data-id="${element.id_departamento}" data-area="${element.id_area}" title="Editar"><i class="bi bi-pencil"></i></button>
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

// ===========================================================================
// Se obtienen las áreas para llenar el select del formulario de departamentos
// ===========================================================================
function getObtenerAreasSelect() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerAreas.php",
        success: function (response) {
            if (!response.error) {
                let areas = JSON.parse(response);

                // Limpiar el select antes de llenarlo
                areasSelect.innerHTML = '';

                let temp = `<option value=""selected>Seleccione un área</option>`;

                areas.forEach(area => {
                    temp += `<option value="${area.id_area}">${area.nombre_area}</option>`;
                });

                areasSelect.innerHTML = temp;
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
        let idArea = $("#id_area_departamento").val();
        let accion = idDepartamento ? "actualizarDepartamento" : "registrarDepartamento";

        if (nombreDepartamento != "") {
            $.ajax({
                type: "POST",
                url: "../php/configDepartamentos.php",
                data: {
                    accion: accion,
                    id_departamento: idDepartamento,
                    id_area: idArea,
                    nombre_departamento: nombreDepartamento
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        // Operación exitosa
                        limpiarYResetearDepartamento();
                        getDepartamentos();
                        getObtenerDepartamentosSelect();
                        // Actualizar la tabla de departamentos-puestos si existe
                        if (typeof getDepartamentoPuesto === 'function') {
                            getDepartamentoPuesto();
                        }

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
                            getObtenerDepartamentosSelect();
                            
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
        let idArea = $(this).data("area");

        console.log(idArea);
        

        // Obtener el nombre del departamento (está en la celda anterior a la de los botones)
        let nombreDepartamento = $(this).closest("tr").find("td:eq(1)").text();

        // Llenar el formulario con los datos actuales
        $("#departamento_id").val(idDepartamento);
        $("#nombre_departamento").val(nombreDepartamento);
        $("#id_area_departamento").val(idArea);

        // Cambiar el texto del botón de guardar para indicar que se está editando
        $("#btn-guardar-departamento").html('<i class="fas fa-save"></i> Actualizar');

        // Hacer scroll al formulario para que el usuario pueda editar
        $('html, body').animate({
            scrollTop: $("#departamentoForm").offset().top - 100
        }, 500);


    });



}

