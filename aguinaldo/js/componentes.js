$(document).ready(function () {
    obtener_departamentos();
    resetear_aguinaldo();
    abrir_modal_configuracione();
    validarEstadoCargaArchivos();
});

/**
 * Obtener la lista de departamentos para el filtro
 */
function obtener_departamentos() {
    $.ajax({
        url: RUTA_RAIZ + "/public/php/obtenerDepartamentos.php",
        type: "GET",
        dataType: "json",
        success: function (data) {    
            // console.log(data);
            // Llenar el select de departamentos de la tabla
            render_select_departamentos(data);
            // Llenar el modal de exportación con los departamentos
            render_exportar_departamentos(ordenarDepartamentos(data));
        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
}

/**
 * Ordenar los departamentos alfabéticamente por su nombre, ignorando mayúsculas y acentos
 * @param {Array} departamentos Array de departamentos con id_departamento y nombre_departamento
 * @returns Array de departamentos ordenados alfabéticamente por nombre_departamento
 */
function ordenarDepartamentos(departamentos) {
    return departamentos.sort((a, b) => 
        a.nombre_departamento.localeCompare(b.nombre_departamento, 'es', {
            sensitivity: 'base'
        })
    );
}

/**
 * Renderizar la lista de departamentos en el modal de exportación
 * @param {Array} data Array de departamentos con id_departamento y nombre_departamento
 */
function render_select_departamentos(data) {
    const select = $("#departamento");
    // Mantener la opción por defecto
    select.find("option:not(:first)").remove();

    data.forEach(function (depto) {
        select.append(
            `<option value="${depto.id_departamento}">${depto.nombre_departamento}</option>`
        );
    });
}

/**
 * Renderizar la lista de departamentos en el modal de exportación
 * @param {Array} data Array de departamentos con id_departamento y nombre_departamento
 */
function render_exportar_departamentos(data) {
    let tmp = ``;

    data.forEach(departamento => {
        tmp += `
        <label class="list-group-item list-group-item-action d-flex align-items-center py-3">
            <input
                class="form-check-input me-3 mt-0"
                type="checkbox" 
                value="${departamento.id_departamento}"
                id="departamento_${departamento.nombre_departamento}"
                data-id="${departamento.id_departamento}"
                data-nombre="${departamento.nombre_departamento}" 
                name="departamentos_seleccionados[]" checked>
            <span class="flex-grow-1 fw-medium">${departamento.nombre_departamento}</span>
        </label>
        `;
    });

    $('#contenedor_lista_deptamentos').html(tmp);
}

/**
 * Resetear el aguinaldo, limpiando localStorage y recargando los empleados
 */
function resetear_aguinaldo() {
    $("#btn_resetear_aguinaldo").click(function (e) {
        e.preventDefault();

        Swal.fire({
            title: "Resetear aguinaldo",
            text: "Si no ha guardado los cambios, la información se perderán. ¿Desea continuar?",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, resetear",
            cancelButtonText: "cancelar"
        }).then((result) => {
            // Verificar si el usuario confirmó
            if (result.isConfirmed) {
                if (clearAguinaldo()) {
                    console.log("Se reseteó el aguinaldo correctamente.");

                    // 1. Resetear la interfaz del modal de configuración
                    $("#cuerpo_tabla_configuracion").hide();
                    $("#tabla_configuracion_cuerpo").empty();
                    $("#cuerpo_form_subir_archivos").show();
                    $("#form_subir_archivos_raya")[0].reset();

                    // 2. Volver a cargar los empleados para reiniciar el proceso
                    obtener_empleados();

                    // 3. Mostrar mensaje de éxito
                    alerta("Reiniciado", "El aguinaldo ha sido reiniciado correctamente.", "success");
                } else {
                    console.error("error al resetear aguinaldo");
                }
            }
        });
    });
}

/**
 * Abrir modal de configuración
 */
function abrir_modal_configuracione() {
    $("#btn_modal_configuracion").click(function (e) {
        e.preventDefault();
        modal_configuracion.show();
    });
}

/**
 * Al recargar la página, verifica si ya se han cargado datos de archivos
 * para mostrar la tabla de configuración en lugar del formulario.
 */
function validarEstadoCargaArchivos() {
    // Esperar un breve momento para asegurar que jsonAguinaldo se haya restaurado
    setTimeout(() => {
        if (!jsonAguinaldo || jsonAguinaldo.length === 0) {
            return; // No hay datos, no hacer nada
        }

        // Comprobar si algún empleado fue modificado por la carga de archivos
        const yaSeCargaronArchivos = jsonAguinaldo[0].configuraciones;

        if (yaSeCargaronArchivos !== 0) {
            // Ocultar formulario y mostrar tabla
            $("#cuerpo_form_subir_archivos").hide();
            $("#cuerpo_tabla_configuracion").show();

            // Llenar la tabla con los datos existentes
            llenarTablaConfiguracion();
        } else {
            $('#tabla_configuracion_cuerpo').html('');
            $("#cuerpo_form_subir_archivos").show();
            $("#cuerpo_tabla_configuracion").hide();
        }
    }, 1000); // 100ms de espera es usualmente suficiente
}