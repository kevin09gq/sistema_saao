$(document).ready(function () {
    getDepartamentos();
    obtenerDatosEmpleados();
    departamentoSeleccionado();

    // Se Obtienen los departamentos
    function getDepartamentos() {
        $.ajax({
            type: "GET",
            url: "../php/obtenerDepartamentos.php",
            success: function (response) {
                if (!response.error) {
                    let departamentos = JSON.parse(response);
                    let opciones = `<option value=\"0\">Todos</option>`;
                    departamentos.forEach((element) => {
                        opciones += `
                        <option value=\"${element.id_departamento}\">${element.nombre_departamento}</option> `;
                    });
                    $("#filtroDepartamento").html(opciones);
                }

            }
        });
    }



    function obtenerDatosEmpleados() {
        $.ajax({
            type: "POST",
            url: "../php/obtenerEmpleados.php",
            data: {
                accion: "cargarEmpleados",
            },
            dataType: "json",
            success: function (empleados) {
                setEmpleadosData(empleados);
            },
            error: function (xhr, status, error) {
                console.error("Error en la petición:", error);
                console.log("Respuesta completa:", xhr.responseText);
            }
        });
    }

    function departamentoSeleccionado() {
        // Si quieres recargar empleados al cambiar el filtro de departamento:
        $("#filtroDepartamento").on("change", function () {
          
            
            setFiltroDepartamento($(this).val());
            $("#buscadorEmpleado").val(""); // Opcional: limpia el buscador al cambiar departamento
            setBusqueda(""); // Resetea búsqueda
        });
    }


    $("#buscadorEmpleado").on("input", function () {
        setBusqueda($(this).val());
    });

    $("#activos-tab").on("click", function() {
        setFiltroEstado("Activo");
    });
    $("#inactivos-tab").on("click", function() {
        setFiltroEstado("Baja");
    });
    $("#all-tab").on("click", function() {
        setFiltroEstado("Todos");
    });


   $(document).on("click", ".btn-actualizar", function () {
       // Luego mostrar el modal
    $("#modal_actualizar_empleado").modal("show");
});


    // Función para cargar los datos del empleado en el modal
  

});