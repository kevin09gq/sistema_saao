// Ruta base para los plugins y recursos

// Set para guardar las claves de los empleados seleccionados
let clavesSeleccionadas = new Set();
let datosEmpleadosCargados = false; // Variable para controlar si ya se cargaron los datos

$(document).ready(function () {
    // Inicializa los eventos y funciones principales al cargar la página
    datosModal();
   // filtradoPorDepartamento();
    seleccionarTodos();
    filtrarPorNombreEmpleado();
    confirmarSeleccionClaves();

    // Función para abrir el modal y cargar datos cuando se da clic en el botón
    function datosModal(params) {
        $("#btn_mostrar_algunos").click(function (e) {
            e.preventDefault();

            // Solo cargar datos la primera vez
            if (!datosEmpleadosCargados) {
                // Cargar departamentos en el select
                obtenerDepartamentos();
                // Cargar empleados y mostrarlos en el modal
                infoEmpleado();
                datosEmpleadosCargados = true;
            } else {
                // Si ya se cargaron los datos, solo actualizar el estado de los checkboxes
                actualizarEstadoCheckboxes();
            }
            
            // Mostrar el modal
            $("#modalSeleccionEmpleados").modal('show');
        });
    }
});

// Función para obtener los departamentos y llenar el select del filtro
function obtenerDepartamentos() {
    $.ajax({
        type: "POST",
        url: "../php/seleccion_empleados.php",
        data: { accion: 'cargarDepartamento' },
        success: function (response) {
            let departamentos = JSON.parse(response);
            // Opción para mostrar todos los departamentos
            let opciones = ``;

            // Agrega cada departamento como opción en el select
            departamentos.forEach((element) => {
                opciones += `
                    <option value="${element.id_departamento}">${element.nombre_departamento}</option>
                `;
            });

            // Llena el select con las opciones
            $("#filtro-departamento-modal").html(opciones);
        },
        error: function () {

        }
    });
}

// Función para filtrar empleados por departamento usando el select
function filtradoPorDepartamento(params) {
    $('#filtro-departamento-modal').change(function () {
        let idSeleccionado = $(this).val();
        // Llama al backend para obtener solo los empleados de ese departamento
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

// Función para obtener todos los empleados y mostrarlos en el modal
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

// Función para imprimir los empleados y departamentos en el modal
function imprimirDatos(response) {
    // Limpiamos el contenedor antes de llenarlo
    $("#empleados-lista").empty();

    // Contador global para los IDs de los checkboxes (para que sean únicos)
    let contador = 1;

    // Recorremos cada departamento recibido en la respuesta
    $.each(response, function (nombreDepartamento, empleados) {
        // Creamos el HTML para los empleados de este departamento
        let empleadosHtml = '';
        empleados.forEach(function (emp) {
            let idCheckbox = `emp-${contador}`;
            // Si la clave del empleado está en el Set, el checkbox aparecerá marcado
            let checked = clavesSeleccionadas.has(emp.clave_empleado) ? 'checked' : '';
            empleadosHtml += `
                        <div class="empleado-item">
                            <div class="form-check">
                                <input class="form-check-input empleado-checkbox" data-clave="${emp.clave_empleado}" type="checkbox" value="${emp.id_empleado}" id="${idCheckbox}" ${checked}>
                                <label class="form-check-label" for="${idCheckbox}">
                                    <div class="empleado-info-seleccion">
                                        <span class="empleado-nombre">${emp.nombre_completo}</span>
                                        <span class="empleado-clave">Clave: ${emp.clave_empleado}</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    `;
            contador++;
        });

        // id único para el colapsable (acordeón)
        let idCollapse = `collapse-${nombreDepartamento.replace(/\s+/g, '-')}-${contador}`;

        // Creamos el bloque del departamento con botón para mostrar/ocultar empleados
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

    // Evento para mostrar/ocultar empleados de un departamento (acordeón)
    $(".btn-toggle-empleados").off("click").on("click", function () {
        let target = $(this).data("target");
        $(target).slideToggle(200); // Efecto de mostrar/ocultar

        // Cambia el ícono de flecha según el estado
        let icon = $(this).find("i");
        icon.toggleClass("bi-chevron-down bi-chevron-up");
    });

    // Evento para mantener actualizado el Set de claves seleccionadas
    // Así, aunque se oculte un departamento, los seleccionados no se pierden
    $(document).off("change", ".empleado-checkbox").on("change", ".empleado-checkbox", function () {
        const clave = $(this).data("clave");
        if ($(this).is(":checked")) {
            clavesSeleccionadas.add(clave); // Agrega la clave al Set
        } else {
            clavesSeleccionadas.delete(clave); // Quita la clave del Set
        }
        actualizarSeleccionTodos(); // Actualiza el checkbox de "Seleccionar todos"
        actualizarContador(); // Actualiza el contador de seleccionados
    });

    actualizarSeleccionTodos();
    actualizarContador();
}

// Nueva función para actualizar solo el estado de los checkboxes
function actualizarEstadoCheckboxes() {
    $(".empleado-checkbox").each(function () {
        const clave = $(this).data("clave");
        $(this).prop("checked", clavesSeleccionadas.has(clave));
    });
    actualizarSeleccionTodos();
    actualizarContador();
}

// Función para seleccionar o deseleccionar todos los empleados visibles
function seleccionarTodos(params) {
    $("#seleccionar-todos").on("change", function () {
        let isChecked = $(this).is(":checked");

        $(".empleado-checkbox").each(function () {
            const clave = $(this).data("clave");
            $(this).prop("checked", isChecked);
            if (isChecked) {
                clavesSeleccionadas.add(clave);
            } else {
                clavesSeleccionadas.delete(clave);
            }
        });

        actualizarContador();
    })
}

// Función para actualizar el estado del checkbox "Seleccionar todos"
function actualizarSeleccionTodos() {
    let total = $(".empleado-checkbox").length;
    let checked = $(".empleado-checkbox:checked").length;
    $("#seleccionar-todos").prop("checked", total > 0 && total === checked);
}

// Función para actualizar el contador de empleados seleccionados
function actualizarContador() {
    $("#contador-seleccionados").text(clavesSeleccionadas.size);
}

// Función para filtrar empleados por nombre o clave en el buscador del modal
function filtrarPorNombreEmpleado() {
    // Evento al escribir en el input de búsqueda
    $('#busqueda-modal').on('input', function () {
        let texto = $(this).val().toLowerCase();

        // Recorre cada bloque de departamento
        $('.departamento-grupo').each(function () {
            let departamentoVisible = false;
            // Recorre cada empleado del departamento
            $(this).find('.empleado-item').each(function () {
                // Busca por nombre o clave (solo el número de clave)
                let nombre = $(this).find('.empleado-nombre').text().toLowerCase();
                let clave = $(this).find('.empleado-clave').text().replace('Clave:', '').trim().toLowerCase();
                if (nombre.includes(texto) || clave.includes(texto)) {
                    $(this).show();
                    departamentoVisible = true;
                } else {
                    $(this).hide();
                }
            });
            // Muestra u oculta el departamento según si tiene empleados visibles
            if (departamentoVisible) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

// Función para confirmar la selección de empleados por su clave
function confirmarSeleccionClaves() {
    $('#btn-confirmar-seleccion').on('click', function () {
        // 1. Convertir el set de claves seleccionadas a un array
        const clavesArray = Array.from(clavesSeleccionadas);

        // 2. Validar que haya claves seleccionadas
        if (clavesArray.length === 0) {
            alert("No has seleccionado ningún empleado.");
            return;
        }

        // 3. Validar que jsonGlobal exista y esté bien formado
        if (!jsonGlobal || !jsonGlobal.departamentos) {
            alert("El JSON global aún no está cargado. Procesa los archivos primero.");
            return;
        }

        // 4. Filtrar empleados del jsonGlobal usando las claves seleccionadas
        let empleadosSeleccionados = [];
        jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (clavesArray.includes(String(emp.clave)) || clavesArray.includes(Number(emp.clave))) {
                    empleadosSeleccionados.push({
                        ...emp,
                        id_departamento: depto.nombre.split(' ')[0],
                        nombre_departamento: depto.nombre.replace(/^\d+\s*/, '')
                    });
                }
            });
        });

        // 5. Actualizar empleadosFiltrados y empleadosOriginales con los seleccionados
        window.empleadosOriginales = empleadosSeleccionados;
        empleadosFiltrados = [...empleadosSeleccionados];

        // 6. Actualizar la paginación con los empleados seleccionados
        paginaActualNomina = 1;
        setEmpleadosPaginados(empleadosSeleccionados);

        // 7. Mostrar la tabla y ocultar el contenedor de archivos
        $("#tabla-nomina-responsive").removeAttr("hidden");
        $("#container-nomina").attr("hidden", true);

        // 8. Oculta el filtro de departamento y muestra la búsqueda
        $("#filtro-departamento").attr("hidden", true);
        $("#busqueda-container").removeAttr("hidden");
        
        // 9. Cierra el modal
        $("#modalSeleccionEmpleados").modal('hide');
    });
}



