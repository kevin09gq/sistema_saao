$(document).ready(function () {

    // ================================================================
    // CONSTANTES Y VARIABLES GLOBALES
    // ================================================================
    const URL_APP = "/sistema_saao/";
    let paginaActual = 1;
    const registrosPorPagina = 5;

    // ================================================================
    // INICIALIZACIÓN
    // ================================================================
    inicializarModulo();

    function inicializarModulo() {
        // Funciones para crear nueva clave
        buscar_empleado();
        validarClave();
        togglePassword();
        guardarNuevaClave();
        limpiarModalAlCerrar();

        // Funciones para listar información
        cargarDepartamentos();
        listarClaves();
        configurarFiltros();
    }

    // ================================================================
    // SECCIÓN: CREAR NUEVA CLAVE DE AUTORIZACIÓN
    // ================================================================

    /**
     * Función para buscar empleado con autocompletado (jQuery UI)
     */
    function buscar_empleado() {
        $("#empleado").autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: "../php/buscarEmpleado.php",
                    type: "GET",
                    data: { buscar: request.term },
                    dataType: "json",
                    success: function (data) {
                        response($.map(data.data, function (item) {
                            return {
                                label: item.empleado,
                                value: item.empleado
                            };
                        }));
                    }
                });
            },
            select: function (event, ui) {
                let cadena = ui.item.value;
                let partes = cadena.split(" - ");
                let id_empleado = partes[0];
                $("#id_empleado").val(id_empleado);
            },
            minLength: 2,
            appendTo: "#exampleModal .modal-body" // Esto ayuda con el z-index
        });
    }

    /**
     * Validación de la clave en tiempo real
     * Reglas:
     * - Debe empezar con letra mayúscula
     * - Mínimo 3 letras
     * - Mínimo 3 números
     * - Debe terminar con carácter especial (@, *, #, $)
     */
    function validarClave() {
        $("#clave").on("input", function () {
            const clave = $(this).val();
            
            // Regla 1: Debe empezar con letra mayúscula
            const empiezaMayuscula = /^[A-Z]/.test(clave);
            actualizarRegla("#rule-mayuscula", empiezaMayuscula);

            // Regla 2: Mínimo 3 letras
            const letras = (clave.match(/[a-zA-Z]/g) || []).length >= 3;
            actualizarRegla("#rule-letras", letras);

            // Regla 3: Mínimo 3 números
            const numeros = (clave.match(/[0-9]/g) || []).length >= 3;
            actualizarRegla("#rule-numeros", numeros);

            // Regla 4: Debe terminar con carácter especial (@, *, #, $)
            const terminaEspecial = /[@*#$]$/.test(clave);
            actualizarRegla("#rule-especial", terminaEspecial);

            // Habilitar/deshabilitar botón de guardar
            const todasValidas = empiezaMayuscula && letras && numeros && terminaEspecial;
            $("#btn-guardar-clave").prop("disabled", !todasValidas);
        });
    }

    /**
     * Actualiza el estado visual de cada regla de validación
     */
    function actualizarRegla(selector, valida) {
        const elemento = $(selector);
        if (valida) {
            elemento.removeClass("invalid").addClass("valid");
        } else {
            elemento.removeClass("valid").addClass("invalid");
        }
    }

    /**
     * Toggle para mostrar/ocultar contraseña
     */
    function togglePassword() {
        $("#togglePassword").on("click", function () {
            const inputClave = $("#clave");
            const icono = $("#iconoOjo");
            
            if (inputClave.attr("type") === "password") {
                inputClave.attr("type", "text");
                icono.removeClass("bi-eye").addClass("bi-eye-slash");
            } else {
                inputClave.attr("type", "password");
                icono.removeClass("bi-eye-slash").addClass("bi-eye");
            }
        });
    }

    /**
     * Guardar nueva clave de autorización
     */
    function guardarNuevaClave() {
        $("#form-nueva-clave").on("submit", function (e) {
            e.preventDefault();

            const id_empleado = $("#id_empleado").val();
            const clave = $("#clave").val();

            // Validaciones básicas
            if (!id_empleado || id_empleado === "") {
                Swal.fire({
                    icon: "warning",
                    title: "Atención",
                    text: "Debe seleccionar un empleado de la lista"
                });
                return;
            }

            if (!validarClaveCompleta(clave)) {
                Swal.fire({
                    icon: "warning",
                    title: "Atención",
                    text: "La clave no cumple con todas las reglas de validación"
                });
                return;
            }

            // Enviar datos al servidor
            $.ajax({
                url: "../php/guardarNuevaClave.php",
                type: "POST",
                data: {
                    id_empleado: id_empleado,
                    clave: clave
                },
                dataType: "json",
                beforeSend: function () {
                    $("#btn-guardar-clave").prop("disabled", true).html(
                        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
                    );
                },
                success: function (response) {
                    Swal.fire({
                        icon: response.icono,
                        title: response.titulo,
                        text: response.mensaje
                    });

                    if (response.icono === "success") {
                        // Cerrar modal y limpiar formulario
                        $("#exampleModal").modal("hide");
                        limpiarFormulario();
                        // Recargar tabla
                        listarClaves();
                    }
                },
                error: function (xhr) {
                    const response = xhr.responseJSON || {};
                    Swal.fire({
                        icon: response.icono || "error",
                        title: response.titulo || "Error",
                        text: response.mensaje || "Ocurrió un error al procesar la solicitud"
                    });
                },
                complete: function () {
                    $("#btn-guardar-clave").prop("disabled", false).html("Crear clave");
                }
            });
        });
    }

    /**
     * Valida que la clave cumpla con todas las reglas
     */
    function validarClaveCompleta(clave) {
        const empiezaMayuscula = /^[A-Z]/.test(clave);
        const letras = (clave.match(/[a-zA-Z]/g) || []).length >= 3;
        const numeros = (clave.match(/[0-9]/g) || []).length >= 3;
        const terminaEspecial = /[@*#$]$/.test(clave);

        return empiezaMayuscula && letras && numeros && terminaEspecial;
    }

    /**
     * Limpiar formulario del modal
     */
    function limpiarFormulario() {
        $("#form-nueva-clave")[0].reset();
        $("#id_empleado").val("");
        $(".password-rules li").removeClass("valid invalid");
        $("#btn-guardar-clave").prop("disabled", true);
    }

    /**
     * Limpiar modal al cerrarlo
     */
    function limpiarModalAlCerrar() {
        $("#exampleModal").on("hidden.bs.modal", function () {
            limpiarFormulario();
        });
    }

    // ================================================================
    // SECCIÓN: LISTAR CLAVES DE AUTORIZACIÓN
    // ================================================================

    /**
     * Cargar departamentos en el select
     */
    function cargarDepartamentos() {
        $.ajax({
            url: URL_APP + "public/php/obtenerDepartamentos.php",
            type: "GET",
            dataType: "json",
            success: function (data) {
                const select = $("#departamento");
                // Mantener la opción por defecto
                select.find("option:not(:first)").remove();
                
                data.forEach(function (depto) {
                    select.append(
                        `<option value="${depto.id_departamento}">${depto.nombre_departamento}</option>`
                    );
                });
            },
            error: function () {
                console.error("Error al cargar departamentos");
            }
        });
    }

    /**
     * Listar claves de autorización con paginación y filtros
     */
    function listarClaves() {
        const busqueda = $("#busqueda").val();
        const departamento = $("#departamento").val();

        $.ajax({
            url: "../php/listarClaves.php",
            type: "GET",
            data: {
                pagina: paginaActual,
                limite: registrosPorPagina,
                busqueda: busqueda,
                departamento: departamento
            },
            dataType: "json",
            beforeSend: function () {
                $("#cuerpo-tabla-autorizacion").html(
                    '<tr><td colspan="3" class="text-center"><span class="spinner-border spinner-border-sm"></span> Cargando...</td></tr>'
                );
            },
            success: function (response) {
                renderizarTabla(response.data);
                renderizarPaginacion(response.total, response.pagina, response.limite);
            },
            error: function () {
                $("#cuerpo-tabla-autorizacion").html(
                    '<tr><td colspan="3" class="text-center text-danger">Error al cargar los datos</td></tr>'
                );
            }
        });
    }

    /**
     * Renderizar datos en la tabla
     */
    function renderizarTabla(datos) {
        const tbody = $("#cuerpo-tabla-autorizacion");
        tbody.empty();

        if (!datos || datos.length === 0) {
            tbody.html(
                '<tr><td colspan="3" class="text-center text-muted">No se encontraron registros</td></tr>'
            );
            return;
        }

        datos.forEach(function (registro) {
            const fila = `
                <tr>
                    <td class="text-center">${registro.nombre_empleado}</td>
                    <td class="text-center">${registro.nombre_departamento}</td>
                    <td class="text-center">${formatearFecha(registro.fecha_creacion)}</td>
                </tr>
            `;
            tbody.append(fila);
        });
    }

    /**
     * Formatear fecha para mostrar
     */
    function formatearFecha(fechaStr) {
        if (!fechaStr) return "-";
        const fecha = new Date(fechaStr);
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-MX', opciones);
    }

    /**
     * Renderizar paginación
     */
    function renderizarPaginacion(total, paginaActualParam, limite) {
        const totalPaginas = Math.ceil(total / limite);
        const paginacion = $("#paginacion");
        paginacion.empty();

        if (totalPaginas <= 1) {
            $("#contenedor-paginacion").hide();
            return;
        }

        $("#contenedor-paginacion").show();

        // Botón anterior
        const btnAnterior = `
            <li class="page-item ${paginaActualParam <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActualParam - 1}" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        paginacion.append(btnAnterior);

        // Números de página
        let inicio = Math.max(1, paginaActualParam - 2);
        let fin = Math.min(totalPaginas, paginaActualParam + 2);

        // Ajustar para mostrar siempre 5 páginas si es posible
        if (fin - inicio < 4) {
            if (inicio === 1) {
                fin = Math.min(totalPaginas, inicio + 4);
            } else if (fin === totalPaginas) {
                inicio = Math.max(1, fin - 4);
            }
        }

        for (let i = inicio; i <= fin; i++) {
            const activo = i === paginaActualParam ? 'active' : '';
            const pagina = `
                <li class="page-item ${activo}">
                    <a class="page-link" href="#" data-pagina="${i}">${i}</a>
                </li>
            `;
            paginacion.append(pagina);
        }

        // Botón siguiente
        const btnSiguiente = `
            <li class="page-item ${paginaActualParam >= totalPaginas ? 'disabled' : ''}">
                <a class="page-link" href="#" data-pagina="${paginaActualParam + 1}" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
        paginacion.append(btnSiguiente);

        // Eventos de paginación
        $(".page-link").off("click").on("click", function (e) {
            e.preventDefault();
            const nuevaPagina = $(this).data("pagina");
            if (nuevaPagina && nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
                paginaActual = nuevaPagina;
                listarClaves();
            }
        });
    }

    /**
     * Configurar filtros de búsqueda
     */
    function configurarFiltros() {
        // Búsqueda con debounce
        let timeoutBusqueda;
        $("#busqueda").on("input", function () {
            clearTimeout(timeoutBusqueda);
            timeoutBusqueda = setTimeout(function () {
                paginaActual = 1;
                listarClaves();
            }, 500);
        });

        // Filtro por departamento
        $("#departamento").on("change", function () {
            paginaActual = 1;
            listarClaves();
        });
    }

});