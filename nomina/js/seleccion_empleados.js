const rutaPlugins = '/sistema_saao/';

$(document).ready(function () {
    datosModal();
    filtradoPorDepartamento();

    function datosModal(params) {
        $("#btn_mostrar_algunos").click(function (e) {
            e.preventDefault();

            //obtener departamentos
            obtenerDepartamentos();
            //obtener empleados

            infoEmpleado();
            //abrir modal
            $("#modalSeleccionEmpleados").modal('show');

        });


    }
});



//Funcion para obtener los departamentos
function obtenerDepartamentos() {
    $.ajax({
        type: "GET",
        url: rutaPlugins + "public/php/obtenerDepartamentos.php",
        success: function (response) {
            let departamentos = JSON.parse(response);
            let opciones = `<option value="0">Todos</option>`;

            departamentos.forEach((element) => {
                opciones += `
                    <option value="${element.id_departamento}">${element.nombre_departamento}</option>
                `;
            });

            // Asegúrate de usar el ID correcto del select
            $("#filtro-departamento-modal").html(opciones);
        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
}

function filtradoPorDepartamento(params) {
    $('#filtro-departamento-modal').change(function () {
        let idSeleccionado = $(this).val();
        $.ajax({
            type: "POST",
            url: "../php/seleccion_empleados.php",
            data: { accion: 'cargarEmpleadosPorDepa', id_departamento: idSeleccionado },
            success: function (response) {
                  imprimirDatos(response)

            }
        });
    });


}


function infoEmpleado() {
    $.ajax({
        type: "POST",
        data: { accion: 'cargarTodosEmpleados' },
        url: "../php/seleccion_empleados.php",
        success: function (response) {
            imprimirDatos(response)
        },
        error: function () {
            console.error("Error al cargar empleados");
        }
    });
}

function imprimirDatos(response) {
    // Limpiamos el contenedor antes de llenarlo
    $("#empleados-lista").empty();

    // Contador global para los IDs de los checkboxes
    let contador = 1;

    // Recorremos cada departamento
    $.each(response, function (nombreDepartamento, empleados) {
        // Creamos el HTML para los empleados de este departamento
        let empleadosHtml = '';
        empleados.forEach(function (emp) {
            let idCheckbox = `emp-${contador}`;
            empleadosHtml += `
                        <div class="empleado-item">
                            <div class="form-check">
                                <input class="form-check-input empleado-checkbox" type="checkbox" value="${emp.id_empleado}" id="${idCheckbox}">
                                <label class="form-check-label" for="${idCheckbox}">
                                    <div class="empleado-info">
                                        <span class="empleado-nombre">${emp.nombre_completo}</span>
                                        <span class="empleado-clave">Clave: ${emp.clave_empleado}</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    `;
            contador++;
        });

        // id único para el colapsable
        let idCollapse = `collapse-${nombreDepartamento.replace(/\s+/g, '-')}-${contador}`;

        // Creamos el bloque del departamento con botón para mostrar/ocultar
        let departamentoHtml = `
                    <div class="departamento-grupo" data-departamento="${nombreDepartamento}">
                        <div class="d-flex align-items-center justify-content-between">
                            <h6 class="departamento-titulo mb-0">${nombreDepartamento}</h6>
                            <button class="btn btn-sm btn-outline-secondary btn-toggle-empleados" type="button" data-target="#${idCollapse}">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                        </div>
                        <div class="empleados-departamento" id="${idCollapse}">
                            ${empleadosHtml}
                        </div>
                    </div>
                `;

        // Agregamos el bloque al contenedor principal
        $("#empleados-lista").append(departamentoHtml);
    });

    // Actualiza el contador de empleados (opcional)
    let totalEmpleados = contador - 1;
    $(".empleados-count").text(`${totalEmpleados} empleados`);

    // Evento para mostrar/ocultar empleados de un departamento
    $(".btn-toggle-empleados").off("click").on("click", function () {
        let target = $(this).data("target");
        $(target).slideToggle(200);

        // Cambia el ícono de flecha
        let icon = $(this).find("i");
        icon.toggleClass("bi-chevron-down bi-chevron-up");
    });

}