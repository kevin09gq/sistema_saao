let paginaActual_config = 1;
const registrosPorPagina_config = 20;

$(document).ready(function () {
    procesar_rayas();
});


/**
 * PROCESAR LOS DATOS DEL EXCEL DE LAS RAYAS Y AUSENCIAS
 */
function procesar_rayas() {
    $("#form_subir_archivos_raya").submit(function (e) {
        e.preventDefault();

        // Recuperar los 4 archivos
        const archivoRayaSAAO = $("#archivo_lista_raya")[0].files[0];
        const archivoRayaSB = $("#archivo_lista_raya_sb")[0].files[0];
        const archivoAusenciasSAAO = $("#archivo_ausencias")[0].files[0];
        const archivoAusenciasSB = $("#archivo_ausencias_sb")[0].files[0];

        // Validar que al menos uno de los 4 archivos esté cargado
        if (!archivoRayaSAAO && !archivoRayaSB && !archivoAusenciasSAAO && !archivoAusenciasSB) {
            alerta("Archivo Faltante", "Debes seleccionar al menos un archivo para continuar.", "warning");
            return;
        }

        // Mostrar un loader mientras se procesa
        Swal.fire({
            title: 'Procesando archivos...',
            text: 'Por favor, espera.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Array para almacenar todas las promesas
        const promesas = [];
        const tiposArchivos = [];

        // Petición para Raya SAAO
        if (archivoRayaSAAO) {
            const formData = new FormData();
            formData.append('archivo_lista_raya', archivoRayaSAAO);
            promesas.push(
                $.ajax({
                    url: '../php/procesar_raya.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('raya_saao');
        }

        // Petición para Raya SB
        if (archivoRayaSB) {
            const formData = new FormData();
            formData.append('archivo_lista_raya', archivoRayaSB);
            promesas.push(
                $.ajax({
                    url: '../php/procesar_raya.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('raya_sb');
        }

        // Petición para Ausencias SAAO
        if (archivoAusenciasSAAO) {
            const formData = new FormData();
            formData.append('archivo_ausencias', archivoAusenciasSAAO);
            promesas.push(
                $.ajax({
                    url: '../php/procesar_ausencias.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('ausencias_saao');
        }

        // Petición para Ausencias SB
        if (archivoAusenciasSB) {
            const formData = new FormData();
            formData.append('archivo_ausencias', archivoAusenciasSB);
            promesas.push(
                $.ajax({
                    url: '../php/procesar_ausencias.php',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    dataType: 'json'
                })
            );
            tiposArchivos.push('ausencias_sb');
        }

        // Ejecutar todas las promesas
        Promise.all(promesas)
            .then((resultados) => {
                Swal.close();

                // Mapear resultados con sus tipos
                const datosProcessados = {};
                resultados.forEach((resultado, index) => {
                    datosProcessados[tiposArchivos[index]] = resultado;
                });

                // console.log("Datos procesados: ", datosProcessados);

                // Unir la información con jsonAguinaldo
                unirDatos(datosProcessados);

                // Actualizar UI
                $("#cuerpo_form_subir_archivos").hide();
                $("#cuerpo_tabla_configuracion").show();

                // Marcar que se han cargado las configuraciones para mostrar la tabla de configuración
                jsonAguinaldo[0].configuraciones = 1;

                // Llenar la tabla de configuración
                llenarTablaConfiguracion();

            })
            .catch(error => {
                Swal.close();
                console.error("Error en el procesamiento:", error);
                alerta("Error", "Ocurrió un error al procesar los archivos.", "error");
            });
    });
}

/**
 * Función para unir los datos procesados
 */
function unirDatos(datosProcessados) {
    const mapaAusencias = new Map();

    // Procesar datos de ausencias SAAO
    if (datosProcessados.ausencias_saao && Array.isArray(datosProcessados.ausencias_saao)) {
        datosProcessados.ausencias_saao.forEach(aus => {
            const clave = `${aus.clave_empleado}-${aus.id_empresa}`;
            mapaAusencias.set(clave, aus.total_ausencias);
        });
    }

    // Procesar datos de ausencias SB
    if (datosProcessados.ausencias_sb && Array.isArray(datosProcessados.ausencias_sb)) {
        datosProcessados.ausencias_sb.forEach(aus => {
            const clave = `${aus.clave_empleado}-${aus.id_empresa}`;
            mapaAusencias.set(clave, aus.total_ausencias);
        });
    }

    // Combinar datos de raya de ambas empresas
    const datosRaya = [];
    if (datosProcessados.raya_saao && Array.isArray(datosProcessados.raya_saao)) {
        datosRaya.push(...datosProcessados.raya_saao);
    }
    if (datosProcessados.raya_sb && Array.isArray(datosProcessados.raya_sb)) {
        datosRaya.push(...datosProcessados.raya_sb);
    }

    // Procesar datos de raya y actualizar jsonAguinaldo
    datosRaya.forEach(raya => {
        const empleadoEncontrado = jsonAguinaldo.find(emp =>
            emp.clave_empleado === raya.clave_empleado && emp.id_empresa === raya.id_empresa
        );

        if (empleadoEncontrado) {
            // Actualizar fechas y valores iniciales
            empleadoEncontrado.fecha_ingreso_real = raya.fecha_ingreso_real || empleadoEncontrado.fecha_ingreso_real;
            empleadoEncontrado.fecha_ingreso_imss = raya.fecha_ingreso_imss || empleadoEncontrado.fecha_ingreso_imss;
            empleadoEncontrado.usar_ausencias = empleadoEncontrado.usar_ausencias || 0;
            empleadoEncontrado.fecha_pago = empleadoEncontrado.fecha_pago || '';

            // Unir los conceptos de ISR y tarjeta
            empleadoEncontrado.isr = raya.isr || empleadoEncontrado.isr || 0;
            empleadoEncontrado.tarjeta = raya.tarjeta || empleadoEncontrado.tarjeta || 0;

            // Buscar ausencias del empleado
            const claveAusencia = `${raya.clave_empleado}-${raya.id_empresa}`;
            if (mapaAusencias.has(claveAusencia)) {
                empleadoEncontrado.total_ausencias = mapaAusencias.get(claveAusencia);
            }

            // Calcular días trabajados
            const dias = diasTrabajados(empleadoEncontrado.fecha_ingreso_real);

            // Aplicar ausencias solo si usar_ausencias === 1
            let diasFinales = dias;
            if (empleadoEncontrado.usar_ausencias === 1) {
                diasFinales = dias - (empleadoEncontrado.total_ausencias || 0);
            }

            empleadoEncontrado.dias_trabajados = diasFinales > 0 ? diasFinales : 0;

            // Calcular aguinaldo
            empleadoEncontrado.aguinaldo = calcularAguinaldo(empleadoEncontrado.dias_trabajados, empleadoEncontrado.salario_diario);
        }
    });

    // Guardar cambios y refrescar tabla
    saveAguinaldo();
    llenar_tabla();
}

/**
 * Llenar la tabla de configuración
 */
function llenarTablaConfiguracion() {
    const cuerpoTabla = $("#tabla_configuracion_cuerpo");
    cuerpoTabla.empty();

    if (!jsonAguinaldo || jsonAguinaldo.length === 0) {
        cuerpoTabla.html('<tr><td colspan="5" class="text-center">No hay datos para mostrar.</td></tr>');
        return;
    }

    const inicio = (paginaActual_config - 1) * registrosPorPagina_config;
    const fin = inicio + registrosPorPagina_config;
    const empleadosPaginados = jsonAguinaldo.slice(inicio, fin);

    empleadosPaginados.slice(1).forEach(emp => {
        const nombreCompleto = `${emp.nombre} ${emp.ap_paterno} ${emp.ap_materno}`;

        // Determinar si usar fecha real o imss basado en usar_fecha_real
        const isRealChecked = emp.usar_fecha_real === 1 ? 'checked' : '';
        const isImssChecked = emp.usar_fecha_real === 0 ? 'checked' : '';

        let celdaFechaImss = '';
        let celdaAusencias = '';

        if (emp.status_nss == 0) {
            celdaFechaImss = '<td class="text-secondary">-</td>';
            celdaAusencias = '<td class="text-secondary">-</td>';
        } else {
            celdaFechaImss = `
                <td>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="fecha_opcion_${emp.id_empleado}" id="fecha_imss_${emp.id_empleado}" value="${emp.fecha_ingreso_imss}" ${isImssChecked}>
                        <label class="form-check-label" for="fecha_imss_${emp.id_empleado}">${emp.fecha_ingreso_imss || 'N/A'}</label>
                    </div>
                </td>
            `;
            celdaAusencias = `
                <td>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="usar_faltas_${emp.id_empleado}" name="usar_faltas" value="${emp.total_ausencias || 0}" ${emp.usar_ausencias ? 'checked' : ''}>
                        <label class="form-check-label" for="usar_faltas_${emp.id_empleado}">${emp.total_ausencias || 0}</label>
                    </div>
                </td>
            `;
        }

        const fila = `
            <tr data-id="${emp.id_empleado}">
                <td>${emp.clave_empleado || 'CV'}</td>
                <td>${nombreCompleto}</td>
                <td>${emp.status_nss ? '<span class="badge text-bg-success">SI</span>' : '<span class="badge text-bg-danger">NO</span>'}</td>
                <td>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="fecha_opcion_${emp.id_empleado}" id="fecha_real_${emp.id_empleado}" value="${emp.fecha_ingreso_real}" ${isRealChecked}>
                        <label class="form-check-label" for="fecha_real_${emp.id_empleado}">${emp.fecha_ingreso_real || 'N/A'}</label>
                    </div>
                </td>
                ${celdaFechaImss}
                ${celdaAusencias}
                <td>
                    <input type="date" class="form-control fecha_pago" id="fecha_pago_${emp.id_empleado}" name="fecha_pago" value="${emp.fecha_pago || ''}">
                </td>
            </tr>
        `;
        cuerpoTabla.append(fila);
    });

    generarPaginacionConfig(jsonAguinaldo.length);
}

/**
 * Generar la paginación para la tabla de la configuración
 */
function generarPaginacionConfig(totalRegistros) {
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina_config);
    const contenedorPaginacion = $('<div class="d-flex justify-content-center mt-3"></div>');
    const nav = $('<nav><ul class="pagination shadow-sm"></ul></nav>');

    // Botón Anterior
    nav.find('ul').append(`
        <li class="page-item ${paginaActual_config === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaConfig(${paginaActual_config - 1})">Anterior</a>
        </li>
    `);

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        nav.find('ul').append(`
            <li class="page-item ${paginaActual_config === i ? 'active' : ''}">
                <a class="page-link" href="#" onclick="cambiarPaginaConfig(${i})">${i}</a>
            </li>
        `);
    }

    // Botón Siguiente
    nav.find('ul').append(`
        <li class="page-item ${paginaActual_config === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="cambiarPaginaConfig(${paginaActual_config + 1})">Siguiente</a>
        </li>
    `);

    // Limpiar paginación anterior y agregar la nueva
    $("#cuerpo_tabla_configuracion .card-body .d-flex").remove();
    $("#cuerpo_tabla_configuracion .card-body").append(contenedorPaginacion.append(nav));
}

/**
 * Cambiar la página actual en la tabla de configuración
 */
function cambiarPaginaConfig(nuevaPagina) {
    const totalRegistros = jsonAguinaldo.length;
    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina_config);

    if (nuevaPagina < 1 || nuevaPagina > totalPaginas) {
        return;
    }
    paginaActual_config = nuevaPagina;
    llenarTablaConfiguracion();
}


// Evento para asignar fecha real a todos los empleados
$(document).on('click', '#btn_seleccionar_todas_real', function (e) {
    e.preventDefault();
    jsonAguinaldo.slice(1).forEach(emp => emp.usar_fecha_real = 1);
    llenarTablaConfiguracion();
});

// Evento para asignar fecha imss a todos los empleados con NSS
$(document).on('click', '#btn_seleccionar_todas_imss', function (e) {
    e.preventDefault();
    jsonAguinaldo.slice(1).forEach(emp => {
        if (emp.status_nss != 0) {
            emp.usar_fecha_real = 0;
        }
    });
    llenarTablaConfiguracion();
});

// Evento para cambiar entre fecha real e imss para un empleado específico
$(document).on('change', '#tabla_configuracion_cuerpo input[type="radio"]', function () {
    const idEmpleado = $(this).closest('tr').data('id');
    const usarFechaReal = $(this).attr('id').includes('fecha_real_') ? 1 : 0;

    const empleado = jsonAguinaldo.slice(1).find(emp => emp.id_empleado == idEmpleado);
    if (empleado) {
        empleado.usar_fecha_real = usarFechaReal;
    }
});

// Evento para asignar ausencias a todos los empleados con NSS
$(document).on('click', '#btn_seleccionar_todas_ausencias', function (e) {
    e.preventDefault();
    jsonAguinaldo.slice(1).forEach(emp => {
        if (emp.status_nss != 0) {
            emp.usar_ausencias = 1;
        }
    });
    llenarTablaConfiguracion();
});

// Evento para quitar ausencias a todos los empleados
$(document).on('click', '#btn_quitar_todas_ausencias', function (e) {
    e.preventDefault();
    jsonAguinaldo.slice(1).forEach(emp => emp.usar_ausencias = 0);
    llenarTablaConfiguracion();
});

// Evento para cambiar uso de ausencias para un empleado específico
$(document).on('change', '#tabla_configuracion_cuerpo input[type="checkbox"]', function () {
    const idEmpleado = $(this).closest('tr').data('id');
    const usarAusencias = $(this).is(':checked');

    const empleado = jsonAguinaldo.slice(1).find(emp => emp.id_empleado == idEmpleado);
    if (empleado) {
        empleado.usar_ausencias = usarAusencias ? 1 : 0;
    }
});

// Evento para copiar fecha de pago a todos los empleados
$(document).on('click', '#btn_copiar_fecha_pago', function (e) {
    e.preventDefault();
    const fechaPago = $('#fecha_pago_masiva').val();
    if (!fechaPago) {
        alerta("Campo vacío", "Debes seleccionar una fecha de pago para copiar.", "warning");
        return;
    }
    jsonAguinaldo.slice(1).forEach(emp => emp.fecha_pago = fechaPago);
    llenarTablaConfiguracion();
});

// Evento para cambiar la fecha de pago para un empleado específico
$(document).on('change', '#tabla_configuracion_cuerpo input[type="date"]', function () {
    const idEmpleado = $(this).closest('tr').data('id');
    const nuevaFecha = $(this).val();

    const empleado = jsonAguinaldo.slice(1).find(emp => emp.id_empleado == idEmpleado);
    if (empleado) {
        empleado.fecha_pago = nuevaFecha;
    }
});

// ======================================================
// Guardar cambios al cerrar el modal de configuración
// ======================================================
$(document).on('submit', '#form_tabla_configuracion', function (e) {
    e.preventDefault();

    // Iterar sobre cada empleado en jsonAguinaldo y actualizar aguinaldo
    jsonAguinaldo.slice(1).forEach(empleado => {
        // 1. Determinar días trabajados según la opción seleccionada
        if (empleado.usar_fecha_real === 1) {
            empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_real);
        } else {
            empleado.dias_trabajados = diasTrabajados(empleado.fecha_ingreso_imss);
        }

        // 2. Aplicar ausencias si la opción está activada
        if (empleado.usar_ausencias === 1 && empleado.dias_trabajados > 0) {
            empleado.dias_trabajados -= empleado.total_ausencias || 0;
        }

        // 3. Calcular los meses trabajados a partir de los días trabajados
        empleado.meses_trabajados = mesesTrabajados(empleado.dias_trabajados);

        // 4. Calcular aguinaldo tomando en cuenta los días trabajados y el salario diario
        empleado.aguinaldo = calcularAguinaldo(empleado.dias_trabajados, empleado.salario_diario);

        // 5. Neto a pagar se calcula con el aguinaldo, menos ISR y tarjeta
        empleado.neto_pagar = calcularNetoPagar(empleado.aguinaldo, empleado.isr, empleado.tarjeta);
    });

    // 6. Guardar cambios en localStorage
    saveAguinaldo();

    // 7. Actualizar tabla principal
    llenar_tabla();

    // 8. Cerrar modal
    modal_configuracion.hide();

    // Mostrar mensaje de éxito
    alerta("Cambios guardados", "success", "success", true, 3000);

    // Limpiar tabla de configuración para que se recargue en la próxima apertura
    paginaActual_config = 1;
});




// ===========================================
// GUARDAR EL AGUINALDO EN LA BASE DE DATOS
// ===========================================
$("#btn_guardar_aguinaldo").click(function (e) {
    e.preventDefault();

    const anioActual = $('#anio').val();
    const total_empleados = jsonAguinaldo.length;

    Swal.fire({
        title: "¿Guardar registros de aguinaldo?",
        text: "Se guardarán los registros de aguinaldo para el año " + anioActual + " de " + total_empleados + " empleados. ¿Deseas continuar?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, guardar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            // Mostrar alerta de carga
            Swal.fire({
                title: 'Guardando...',
                html: 'Por favor espera mientras se guarda la información.',
                icon: 'info',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: (modal) => {
                    Swal.showLoading();
                }
            });

            setTimeout(() => {
                $.ajax({
                    type: "POST",
                    url: "../php/aguinaldo.php",
                    data: {
                        anio: anioActual,
                        json: JSON.stringify(jsonAguinaldo),
                        accion: "guardar_aguinaldo"
                    },
                    dataType: "json", // esperamos JSON de respuesta
                    success: function (response) {
                        Swal.close();
                        alerta(response.titulo, response.mensaje, response.icono);
                    },
                    error: function (xhr, status, error) {
                        console.error("Error en la petición:", error);
                        // Aquí puedes intentar parsear la respuesta JSON del servidor
                        try {
                            let resp = JSON.parse(xhr.responseText);
                            console.error("Mensaje de error del Servidor:", resp.mensaje);
                            alerta(resp.titulo, resp.mensaje, resp.icono);
                        } catch (e) {
                            console.error("Respuesta no es JSON:", xhr.responseText);
                        }
                    }
                });
            }, 1500);
        }
    });
});