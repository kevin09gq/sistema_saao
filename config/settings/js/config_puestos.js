$(document).ready(function () {
    // Se llenando las dos tablas
    getPuestos();
    getDepartamentoPuesto();

    // Funciones para CRUD
    buscarDepartamentoPuesto();
    agregarPuesto();
    agregarPuestoDepartamento();
    buscarPuesto();
    eliminarPuesto();
    editarPuesto();

    editarDepartamentoPuesto();
    eliminarDepartamentoPuesto();
    limpiarDepartamentoPuesto();

    getObtenerPuestosSelect();
    getObtenerDepartamentosSelect();

    // Sincronizar selector de color y campo hex
    $(document).on('input', '#color_picker', function () {
        const val = $(this).val();
        $('#color_hex').val(val);
    });
    $(document).on('input', '#color_hex', function () {
        let v = $(this).val();
        // Normalizar formato: iniciar con # y permitir solo 7 caracteres
        if (v && v[0] !== '#') v = '#' + v.replace(/#/g, '');
        v = v.substring(0, 7);
        $(this).val(v);
        // Actualizar picker si formato válido
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
            $('#color_picker').val(v);
        }
    });
});


const puestoSelect = document.getElementById('select_puesto');
const depaSelect = document.getElementById('select_departamento');



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
                                        <button class="btn btn-sm btn-edit btn-edit-puesto" id="btn-edit-puesto-${element.id_puestoEspecial}" data-id="${element.id_puestoEspecial}" title="Editar"><i class="bi bi-pencil"></i></button>
                                        <button class="btn btn-sm btn-delete btn-delete-puesto" id="btn-delete-puesto-${element.id_puestoEspecial}" data-id="${element.id_puestoEspecial}" title="Eliminar"><i class="bi bi-trash"></i></button>
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

// Se obtienen los departamentos asociados a un puesto
function getDepartamentoPuesto() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerDepartamentosPuestos.php",
        success: function (response) {
            if (!response.error) {
                let departamentosPuestos = JSON.parse(response);
                let opciones = ``;

                // Agregamos un contador para mostrar números secuenciales
                let contador = 1;

                departamentosPuestos.forEach((element) => {
                    opciones += `
                                <tr id="puesto-row-${element.id_departamento_puesto}">
                                    <td>${contador}</td>
                                    <td>${element.nombre_departamento}</td>
                                    <td>${element.nombre_puesto}</td>
                                    <td>
                                        <button
                                            class="btn btn-sm btn-edit btn-edit-departamento-puesto mb-2"
                                            data-id="${element.id_departamento_puesto}" 
                                            data-idPuesto="${element.id_puestoEspecial}" 
                                            data-idDepartamento="${element.id_departamento}" 
                                            title="Editar"><i class="bi bi-pencil"></i></button>
                                        <button 
                                            class="btn btn-sm btn-delete btn-delete-departamento-puesto"
                                            data-id="${element.id_departamento_puesto}" 
                                            title="Eliminar"><i class="bi bi-trash"></i></button>
                                    </td>
                                </tr>   
                        `;

                    // Incrementamos el contador para el siguiente puesto
                    contador++;
                });
                $("#departamentos-puestos-tbody").html(opciones);
            }
        }
    });
}

// ======================================
// Se obtienen los puestos para el select
// ======================================
function getObtenerPuestosSelect() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerPuestos.php",
        success: function (response) {
            if (!response.error) {
                let puestos = JSON.parse(response);

                // Limpiar el select antes de llenarlo
                puestoSelect.innerHTML = '';

                let temp = `<option value=""selected>Seleccione un puesto...</option>`;

                puestos.forEach(p => {
                    temp += `<option value="${p.id_puestoEspecial}">${p.nombre_puesto}</option>`;
                });

                puestoSelect.innerHTML = temp;
            }
        }
    });
}

// ============================================
// Se obtienen los departamentos para el select
// ============================================
function getObtenerDepartamentosSelect() {
    $.ajax({
        type: "GET",
        url: rutaRaiz + "public/php/obtenerDepartamentos.php",
        success: function (response) {
            if (!response.error) {
                let departamentos = JSON.parse(response);

                // Limpiar el select antes de llenarlo
                depaSelect.innerHTML = '';

                let temp = `<option value=""selected>Seleccione un departamento...</option>`;

                departamentos.forEach(d => {
                    temp += `<option value="${d.id_departamento}">${d.nombre_departamento}</option>`;
                });

                depaSelect.innerHTML = temp;
            }
        }
    });
}

function agregarPuesto() {
    $("#puestoForm").submit(function (e) {
        e.preventDefault();

        let idPuesto = $("#puesto_id").val().trim();
        let nombrePuesto = $("#nombre_puesto").val().trim();
        let direccionPuesto = $("#direccion_puesto").val().trim();
        let colorHex = $("#color_hex").val().trim();
        let accion = idPuesto ? "actualizarPuesto" : "registrarPuesto";

        if (nombrePuesto != "") {
            $.ajax({
                type: "POST",
                url: "../php/configPuestos.php",
                data: {
                    accion: accion,
                    id_puesto: idPuesto,
                    nombre_puesto: nombrePuesto,
                    direccion_puesto: direccionPuesto,
                    color_hex: colorHex
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        limpiarYResetearPuesto();
                        getPuestos();
                        getObtenerPuestosSelect();
                        // Actualizar la tabla de departamentos-puestos
                        getDepartamentoPuesto();

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

function agregarPuestoDepartamento() {
    $("#departamento-puesto-form").submit(function (e) {
        e.preventDefault();

        let id = $("#departamento_puesto_id").val().trim();
        let idPuesto = $("#select_puesto").val().trim();
        let idDepartamento = $("#select_departamento").val().trim();

        let accion = id ? "actualizarDepartamentoPuesto" : "registrarDepartamentoPuesto";

        if (idPuesto != "" && idDepartamento != "") {
            $.ajax({
                type: "POST",
                url: "../php/configPuestos.php",
                data: {
                    accion: accion,
                    id_puesto: idPuesto,
                    id_departamento: idDepartamento,
                    id_departamento_puesto: id
                },
                success: function (response) {
                    if (response.trim() == "1") {
                        limpiarYResetearPuesto();
                        getDepartamentoPuesto();

                        // Mostrar mensaje de éxito con SweetAlert2
                        let mensaje = accion === "registrarDepartamentoPuesto" ?
                            "Puesto asignado correctamente" :
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
                text: 'Seleccione un puesto y un departamento',
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
    $("#direccion_puesto").val('');
    $("#color_hex").val('');
    $("#color_picker").val('#000000');
    $("#btn-guardar-puesto").html('<i class="fas fa-save"></i> Guardar');

    $("#select_departamento").val('');
    $("#select_puesto").val('');
    $("#departamento_puesto_id").val('');
    $("#btn-guardar-departamento-puesto").html('<i class="fas fa-save"></i> Guardar');
}

function limpiarFormulario() {
    $("#btn-cancelar-puesto").click(function (e) {
        e.preventDefault();
        resetearFormulario();
    });
}

function buscarPuesto() {
    $("#search-puestos").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#puestos-tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(valor) > -1);
        });
    });
}

function eliminarPuesto() {
    // Delegación de eventos para capturar clics en botones de eliminación
    $(document).on("click", ".btn-delete-puesto", function () {
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
                    url: "../php/configPuestos.php",
                    data: {
                        accion: "eliminarPuesto",
                        id_puesto: idPuesto
                    },
                    success: function (response) {
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
                            getObtenerPuestosSelect();
                            // Actualizar la tabla de departamentos-puestos
                            getDepartamentoPuesto();
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

function editarPuesto() {
    $(document).on("click", ".btn-edit-puesto", function () {
        let idPuesto = $(this).data("id");

        // Obtener información del puesto
        $.ajax({
            type: "GET",
            url: "../php/configPuestos.php",
            data: {
                accion: "obtenerInfoPuesto",
                id_puesto: idPuesto
            },
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    $("#puesto_id").val(response.puesto.id_puestoEspecial);
                    $("#nombre_puesto").val(response.puesto.nombre_puesto);
                    $("#direccion_puesto").val(response.puesto.direccion_puesto || '');
                    const color = response.puesto.color_hex || '#000000';
                    $("#color_hex").val(color);
                    $("#color_picker").val(/^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#000000');
                    $("#btn-guardar-puesto").html('<i class="fas fa-save"></i> Actualizar');
                    $("#nombre_puesto").focus();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message || 'No se pudo cargar la información del puesto',
                        confirmButtonColor: '#ef4444'
                    });
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo conectar con el servidor',
                    confirmButtonColor: '#ef4444'
                });
            }
        });
    });
}

// Función para resetear el formulario a su estado inicial
function resetearFormulario() {
    $("#puesto_id").val('');
    $("#nombre_puesto").val('');
    $("#direccion_puesto").val('');
    $("#btn-guardar-puesto").html('<i class="fas fa-save"></i> Guardar');
}

function editarDepartamentoPuesto() {
    $(document).on('click', '.btn-edit-departamento-puesto', function (e) {
        e.preventDefault();
        let id = $(this).data("id");
        let idPuesto = $(this).data("idpuesto");
        let idDepartamento = $(this).data("iddepartamento");

        $("#departamento_puesto_id").val(id);
        $("#select_puesto").val(idPuesto);
        $("#select_departamento").val(idDepartamento);
        $("#btn-guardar-departamento-puesto").html('<i class="fas fa-save"></i> Actualizar');
    });
}

function eliminarDepartamentoPuesto() {
    // Delegación de eventos para capturar clics en botones de eliminación
    $(document).on("click", ".btn-delete-departamento-puesto", function () {
        // Obtener el ID del puesto desde el atributo data-id
        let idDepartamentoPuesto = $(this).data("id");

        // Confirmar la eliminación con SweetAlert2
        Swal.fire({
            icon: 'question',
            title: '¿Eliminar asignación?',
            text: 'Esta acción no se puede deshacer.',
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
                    url: "../php/configPuestos.php",
                    data: {
                        accion: "eliminarDepartamentoPuesto",
                        id_departamento_puesto: idDepartamentoPuesto
                    },
                    success: function (response) {
                        // Parsear la respuesta
                        let resultado = response.trim();

                        if (resultado == "1") {
                            // Eliminación exitosa
                            Swal.fire({
                                icon: 'success',
                                title: 'Asignación eliminada',
                                text: 'La asignación se ha eliminado correctamente',
                                confirmButtonColor: '#22c55e'
                            });

                            // Recargar la lista de puestos
                            getDepartamentoPuesto();

                        } else if (resultado == "2") {
                            // Error al eliminar
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'No se pudo eliminar la asignación',
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

function limpiarDepartamentoPuesto() {
    $(document).on("click", "#btn-cancelar-departamento-puesto", function (e) {
        e.preventDefault();
        $("#departamento-puesto-form").trigger("reset");
        $("#btn-guardar-departamento-puesto").html('<i class="fas fa-save"></i> Guardar');
    });
}

function buscarDepartamentoPuesto() {
    $("#search-departamentos-puestos").on("keyup", function () {
        let valor = $(this).val().toLowerCase();
        $("#departamentos-puestos-tbody tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(valor) > -1);
        });
    });
}