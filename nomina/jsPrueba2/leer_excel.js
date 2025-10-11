jsonGlobal = null;
window.empleadosOriginales = [];
window.empleadosOriginalesDispersion = [];
const ruta = '/sistema_saao/';
// Variables para manejo de búsqueda y paginación
let empleadosFiltrados = [];
let timeoutBusqueda = null;
let empleadosFiltradosDispersion = [];
let timeoutBusquedaDispersion = null;

// Función para mostrar las tablas correspondientes
function configTablas() {
    // Funcionalidad para los mini-tabs
    $(document).on('click', '.mini-tab', function () {
        // Remover clase active de todos los tabs
        $('.mini-tab').removeClass('active');
        // Agregar clase active al tab clickeado
        $(this).addClass('active');
    });

    $('#btn_tabla_nomina').click(function (e) {
        e.preventDefault();
        $('#tabla-nomina-container').removeAttr("hidden");
        $('#tabla-dispersion-tarjeta').attr("hidden", true);
        $("#filtro-departamento").attr("hidden", true);
        $("#busqueda-container").removeAttr("hidden");
        $("#busqueda-container-dispersion").attr("hidden", true);
        $("#btn_suma").removeAttr("hidden");
        $("#btn_suma_dispersion").attr("hidden", true);
        $("#filtro-seguro").removeAttr("hidden");

        // Refrescar la tabla de nómina para asegurar que los cálculos estén actualizados
        if (typeof setEmpleadosPaginados === 'function' && window.empleadosOriginales) {
            // Recalcular sueldos antes de mostrar
            window.empleadosOriginales.forEach(emp => {
                if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                    calcularSueldoACobraPorEmpleado(emp);
                }
            });
            setEmpleadosPaginados(window.empleadosOriginales);
        }
    });

    $('#btn_tabla_dispersión').click(function (e) {
        e.preventDefault();
        $('#tabla-nomina-container').attr("hidden", true);
        $('#tabla-dispersion-tarjeta').removeAttr("hidden");
        $("#filtro-departamento").removeAttr("hidden");
        cargarDepartamentosFiltro();
        obtenerEmpleadosPorDepartamento();
        validarClaves();
        $("#busqueda-container-dispersion").removeAttr("hidden");
        $("#busqueda-container").attr("hidden", true);
        $("#btn_suma_dispersion").removeAttr("hidden");
        $("#btn_suma").attr("hidden", true);

        // Refrescar la tabla de dispersión para asegurar que los datos estén actualizados
        if (typeof setEmpleadosDispersionPaginados === 'function' && window.empleadosOriginalesDispersion) {
            // Recalcular sueldos antes de mostrar
            window.empleadosOriginalesDispersion.forEach(emp => {
                if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                    calcularSueldoACobraPorEmpleado(emp);
                }
            });
            setEmpleadosDispersionPaginados(window.empleadosOriginalesDispersion);
        }
    });
}

$(document).ready(function () {
    // Verificar si hay datos guardados de nómina
    verificarDatosGuardados();
    obtenerArchivos();
    configTablas();



    $('#btn_horarios').click(function (e) {
        e.preventDefault();
        setDataTableHorarios(window.horariosSemanalesActualizados);
        activarFormatoHora();
        actualizarHorariosSemanalesActualizados();

        // Calcular minutos para cada fila inmediatamente después de cargar
        setTimeout(function () {
            $(".tabla-horarios tbody tr").each(function () {
                calcularMinutosTotales($(this));
            });
            calcularTotalesSemana();
        }, 100);
    });

    // Establecer Datos Por Defecto en la tabla de Horarios
    // Este Evento se llamara cuando se una el JsonGlobal

    // Llamamos la función pasándole el JSON que está en rangos_horarios.js
    function setDataTableHorarios(data) {
        var tbody = $(".tabla-horarios tbody");
        tbody.empty();

        //  DEFINIR EL ORDEN CORRECTO DE LOS DÍAS (empezando desde viernes)
        const ordenDias = ['viernes', 'sabado', 'domingo', 'lunes', 'martes', 'miercoles', 'jueves'];

        //  PROCESAR LOS DÍAS EN EL ORDEN CORRECTO
        ordenDias.forEach(function (claveDia) {
            // Verificar que el día existe en los datos
            if (data.semana && data.semana[claveDia]) {
                var diaInfo = data.semana[claveDia];
                var fila = $("<tr>").addClass("fila-horario");

                fila.append($("<td>").addClass("etiqueta-dia").text(diaInfo.dia));
                fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.entrada));
                fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.salidaComida));
                fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.entradaComida));
                fila.append($("<td>").addClass("celda-hora editable").attr("contenteditable", "true").text(diaInfo.salida));
                fila.append($("<td>").addClass("celda-total editable").attr("contenteditable", "true").text(diaInfo.totalHoras));
                fila.append($("<td>").addClass("celda-comida editable").attr("contenteditable", "true").text(diaInfo.horasComida));
                fila.append($("<td>").addClass("celda-minutos").text("0"));

                tbody.append(fila);
            }
        });
    }

    // Guardar datos antes de cambiar de página
    $(window).on('beforeunload', function () {
        if (jsonGlobal && window.empleadosOriginales && window.empleadosOriginales.length > 0) {
            guardarDatosNomina();
        }
    });

    // Botón para limpiar datos y volver al inicio
    $('#btn_limpiar_datos').on('click', function (e) {
        e.preventDefault();

        // Confirmar antes de limpiar usando SweetAlert2
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¿Deseas limpiar todos los datos y volver al inicio?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, limpiar datos',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Limpiar datos del localStorage
                limpiarDatosNomina();
                $("#container-nomina").attr("hidden", true);

                // Restaurar horarios oficiales a su estado original
                if (typeof window.horariosSemanales !== 'undefined') {
                    window.horariosSemanalesActualizados = JSON.parse(JSON.stringify(window.horariosSemanales));
                }

                // Mostrar el contenedor inicial y ocultar la tabla
                $("#container-nomina").removeAttr("hidden");
                $("#tabla-nomina-responsive").attr("hidden", true);

                // Limpiar variables globales
                jsonGlobal = null;
                window.empleadosOriginales = [];
                window.empleadosOriginalesDispersion = [];

                // Resetear formulario
                $('#form_excel')[0].reset();

                // Limpiar tabla si existe
                $('#tabla-nomina-body').empty();
                $('#tabla-dispersion-body').empty();

                // Mostrar mensaje de éxito
                Swal.fire({
                    title: '¡Limpieza completada!',
                    text: 'Los datos han sido limpiados correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    });

    // Escuchar cambios en la tabla de nómina para guardar automáticamente
    $(document).on('input', '#tabla-nomina-body td[contenteditable]', function () {
        const $celda = $(this);
        const $fila = $celda.closest('tr');
        const clave = $fila.data('clave');
        const columna = $celda.index();
        const valor = $celda.text().trim();


        // Actualizar el empleado correspondiente
        actualizarEmpleadoEnDatos(clave, columna, valor);

        // Guardar cambios automáticamente
        guardarDatosNomina();
    });

    // Cuando la página se carga completamente, asegurarse de que los sueldos estén actualizados
    setTimeout(function () {
        if (window.empleadosOriginales && window.empleadosOriginales.length > 0) {
            // Recalcular todos los sueldos a cobrar
            window.empleadosOriginales.forEach(emp => {
                if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                    calcularSueldoACobraPorEmpleado(emp);
                }
            });

            // Actualizar la tabla si está visible
            if (!$('#tabla-nomina-container').attr("hidden")) {
                if (typeof setEmpleadosPaginados === 'function') {
                    setEmpleadosPaginados(window.empleadosOriginales);
                }
            }
        }
    }, 500);
});
/*
 * ================================================================
 * MÓDULO DE PERSISTENCIA DE DATOS DE NÓMINA
 * ================================================================
 * Funciones para guardar y recuperar el estado de la nómina
 * ================================================================
 */

// Guardar datos en localStorage
function guardarDatosNomina() {
    // Sincronizar cambios antes de guardar
    sincronizarCambiosConJsonGlobal();

    if (jsonGlobal && window.empleadosOriginales) {
        // Crear una copia profunda de los datos para guardar
        const datosAGuardar = {
            jsonGlobal: JSON.parse(JSON.stringify(jsonGlobal)),
            empleadosOriginales: JSON.parse(JSON.stringify(window.empleadosOriginales)),
            empleadosOriginalesDispersion: JSON.parse(JSON.stringify(window.empleadosOriginalesDispersion || [])),
            horariosSemanalesActualizados: window.horariosSemanalesActualizados ? JSON.parse(JSON.stringify(window.horariosSemanalesActualizados)) : null,
            timestamp: new Date().getTime()
        };

        // Asegurarse de que todos los valores numéricos estén formateados correctamente antes de guardar
        datosAGuardar.empleadosOriginales.forEach(emp => {
            // Recalcular sueldo a cobrar antes de guardar
            if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                calcularSueldoACobraPorEmpleado(emp);
            }

            // Formatear todos los campos numéricos con dos decimales
            const camposNumericos = [
                'incentivo', 'sueldo_extra_final', 'neto_pagar', 'prestamo',
                'inasistencias_descuento', 'uniformes', 'checador', 'fa_gafet_cofia',
                'sueldo_a_cobrar', 'sueldo_base', 'sueldo_extra', 'bono_antiguedad',
                'actividades_especiales', 'bono_puesto'
            ];

            camposNumericos.forEach(campo => {
                if (emp[campo] !== undefined && typeof emp[campo] === 'number') {
                    emp[campo] = parseFloat(emp[campo].toFixed(2));
                }
            });
        });

        // También formatear empleados de dispersión
        if (datosAGuardar.empleadosOriginalesDispersion) {
            datosAGuardar.empleadosOriginalesDispersion.forEach(emp => {
                // Recalcular sueldo a cobrar antes de guardar
                if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                    calcularSueldoACobraPorEmpleado(emp);
                }

                // Formatear todos los campos numéricos con dos decimales
                const camposNumericos = [
                    'incentivo', 'sueldo_extra_final', 'neto_pagar', 'prestamo',
                    'inasistencias_descuento', 'uniformes', 'checador', 'fa_gafet_cofia',
                    'sueldo_a_cobrar', 'sueldo_base', 'sueldo_extra', 'bono_antiguedad',
                    'actividades_especiales', 'bono_puesto'
                ];

                camposNumericos.forEach(campo => {
                    if (emp[campo] !== undefined && typeof emp[campo] === 'number') {
                        emp[campo] = parseFloat(emp[campo].toFixed(2));
                    }
                });
            });
        }

        try {
            localStorage.setItem('datosNomina_saao', JSON.stringify(datosAGuardar));
        } catch (error) {
        }
    }
}

// Recuperar datos del localStorage
function recuperarDatosNomina() {
    try {
        const datos = localStorage.getItem('datosNomina_saao');
        if (datos) {
            const datosNomina = JSON.parse(datos);

            // Verificar que los datos no sean muy antiguos (24 horas)
            const ahora = new Date().getTime();
            const tiempoLimite = 24 * 60 * 60 * 1000; // 24 horas

            if (ahora - datosNomina.timestamp < tiempoLimite) {
                return datosNomina;
            } else {
                // Limpiar datos antiguos
                limpiarDatosNomina();
            }
        }
    } catch (error) {
        limpiarDatosNomina(); // Limpiar datos corruptos
    }
    return null;
}

// Limpiar datos guardados
function limpiarDatosNomina() {
    localStorage.removeItem('datosNomina_saao');
}

// Verificar y restaurar datos al cargar la página
function verificarDatosGuardados() {
    const datosGuardados = recuperarDatosNomina();

    if (datosGuardados) {
        // 🆕 VERIFICAR SI HAY DATOS VÁLIDOS ANTES DE RESTAURAR LA VISTA
        if (!datosGuardados.jsonGlobal || !datosGuardados.empleadosOriginales || datosGuardados.empleadosOriginales.length === 0) {
            // Si no hay datos válidos, limpiar y mostrar formulario
            limpiarDatosNomina();
            $("#container-nomina").removeAttr("hidden");
            $("#tabla-nomina-responsive").attr("hidden", true);
            return;
        }

        // Restaurar variables globales tal como fueron guardadas
        jsonGlobal = datosGuardados.jsonGlobal;
        window.empleadosOriginales = datosGuardados.empleadosOriginales;
        window.empleadosOriginalesDispersion = datosGuardados.empleadosOriginalesDispersion || [];

        if (datosGuardados.horariosSemanalesActualizados) {
            window.horariosSemanalesActualizados = datosGuardados.horariosSemanalesActualizados;
        }

        // Recalcular sueldos a cobrar para todos los empleados restaurados
        if (window.empleadosOriginales && window.empleadosOriginales.length > 0) {
            window.empleadosOriginales.forEach(emp => {
                if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                    calcularSueldoACobraPorEmpleado(emp);
                }
            });
        }

        // También recalcular sueldos de empleados de dispersión
        if (window.empleadosOriginalesDispersion && window.empleadosOriginalesDispersion.length > 0) {
            window.empleadosOriginalesDispersion.forEach(emp => {
                if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                    calcularSueldoACobraPorEmpleado(emp);
                }
            });
        }

        // 🆕 RESTAURAR LA VISTA DIRECTA SIN MOSTRAR PRIMERO EL FORMULARIO
        restaurarVistaNominaDirecta();
    } else {
        // 🆕 ASEGURAR QUE EL FORMULARIO ESTÉ VISIBLE SI NO HAY DATOS
        $("#container-nomina").removeAttr("hidden");
        $("#tabla-nomina-responsive").attr("hidden", true);
    }
}

// 🆕 NUEVA FUNCIÓN PARA RESTAURAR VISTA DIRECTAMENTE
function restaurarVistaNominaDirecta() {
    // Cambiar de vista inmediatamente sin mostrar el formulario primero
    $("#container-nomina").attr("hidden", true);
    $("#tabla-nomina-responsive").removeAttr("hidden");

    // Actualizar cabecera
    actualizarCabeceraNomina(jsonGlobal);

    // Reconfigurar datos y tabla sin recalcular automáticamente
    establecerDatosEmpleados();
    busquedaNomina();

    // Mostrar los datos tal como fueron guardados
    setEmpleadosPaginados(window.empleadosOriginales);

    // Configurar controles de búsqueda
    $("#busqueda-container").removeAttr("hidden");
    $("#filtro-seguro").removeAttr("hidden");


    // Formatear números en los empleados restaurados y recalcular sueldos
    if (window.empleadosOriginales && window.empleadosOriginales.length > 0) {
        window.empleadosOriginales.forEach(emp => {
            // Asegurarse de que los valores numéricos estén formateados correctamente
            if (typeof emp.incentivo === 'number') emp.incentivo = parseFloat(emp.incentivo.toFixed(2));
            if (typeof emp.sueldo_extra_final === 'number') emp.sueldo_extra_final = parseFloat(emp.sueldo_extra_final.toFixed(2));
            if (typeof emp.neto_pagar === 'number') emp.neto_pagar = parseFloat(emp.neto_pagar.toFixed(2));
            if (typeof emp.prestamo === 'number') emp.prestamo = parseFloat(emp.prestamo.toFixed(2));
            if (typeof emp.inasistencias_descuento === 'number') emp.inasistencias_descuento = parseFloat(emp.inasistencias_descuento.toFixed(2));
            if (typeof emp.uniformes === 'number') emp.uniformes = parseFloat(emp.uniformes.toFixed(2));
            if (typeof emp.checador === 'number') emp.checador = parseFloat(emp.checador.toFixed(2));
            if (typeof emp.fa_gafet_cofia === 'number') emp.fa_gafet_cofia = parseFloat(emp.fa_gafet_cofia.toFixed(2));
            if (typeof emp.sueldo_base === 'number') emp.sueldo_base = parseFloat(emp.sueldo_base.toFixed(2));
            if (typeof emp.sueldo_extra === 'number') emp.sueldo_extra = parseFloat(emp.sueldo_extra.toFixed(2));

            // Recalcular sueldo a cobrar para asegurar que esté actualizado
            if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                calcularSueldoACobraPorEmpleado(emp);
            }

            // Asegurarse de que el sueldo a cobrar también esté formateado correctamente
            if (typeof emp.sueldo_a_cobrar === 'number') emp.sueldo_a_cobrar = parseFloat(emp.sueldo_a_cobrar.toFixed(2));
        });
    }

    // También formatear y recalcular empleados de dispersión
    if (window.empleadosOriginalesDispersion && window.empleadosOriginalesDispersion.length > 0) {
        window.empleadosOriginalesDispersion.forEach(emp => {
            // Asegurarse de que los valores numéricos estén formateados correctamente
            if (typeof emp.incentivo === 'number') emp.incentivo = parseFloat(emp.incentivo.toFixed(2));
            if (typeof emp.sueldo_extra_final === 'number') emp.sueldo_extra_final = parseFloat(emp.sueldo_extra_final.toFixed(2));
            if (typeof emp.neto_pagar === 'number') emp.neto_pagar = parseFloat(emp.neto_pagar.toFixed(2));
            if (typeof emp.prestamo === 'number') emp.prestamo = parseFloat(emp.prestamo.toFixed(2));
            if (typeof emp.inasistencias_descuento === 'number') emp.inasistencias_descuento = parseFloat(emp.inasistencias_descuento.toFixed(2));
            if (typeof emp.uniformes === 'number') emp.uniformes = parseFloat(emp.uniformes.toFixed(2));
            if (typeof emp.checador === 'number') emp.checador = parseFloat(emp.checador.toFixed(2));
            if (typeof emp.fa_gafet_cofia === 'number') emp.fa_gafet_cofia = parseFloat(emp.fa_gafet_cofia.toFixed(2));
            if (typeof emp.sueldo_base === 'number') emp.sueldo_base = parseFloat(emp.sueldo_base.toFixed(2));
            if (typeof emp.sueldo_extra === 'number') emp.sueldo_extra = parseFloat(emp.sueldo_extra.toFixed(2));

            // Recalcular sueldo a cobrar para asegurar que esté actualizado
            if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                calcularSueldoACobraPorEmpleado(emp);
            }

            // Asegurarse de que el sueldo a cobrar también esté formateado correctamente
            if (typeof emp.sueldo_a_cobrar === 'number') emp.sueldo_a_cobrar = parseFloat(emp.sueldo_a_cobrar.toFixed(2));
        });
    }
}

// 🆕 MANTENER LA FUNCIÓN ORIGINAL PARA CUANDO SE USA DESDE OTROS LUGARES
function restaurarVistaNomina() {
    // Esta función se mantiene para compatibilidad con otras partes del código
    restaurarVistaNominaDirecta();
}

/*
 * ================================================================
 *                         TABLA NOMINA
 * ================================================================
 */

/*
 * ================================================================
 * MÓDULO DE PROCESAMIENTO Y UNIÓN DE ARCHIVOS EXCEL
 * ================================================================
 * Este módulo se encarga de:
 * - Leer y procesar dos archivos Excel (nómina y horarios)
 * - Unir la información de ambos archivos mediante normalización de nombres
 * - Generar un JSON consolidado con toda la información de empleados
 * ================================================================
 */

function obtenerArchivos(params) {

    $('#btn_procesar_ambos').on('click', function (e) {
        e.preventDefault();

        var $form = $('#form_excel');
        var form = $form[0];

        // 1. Enviar el primer archivo Excel
        var formData1 = new FormData();
        if (!form.archivo_excel || form.archivo_excel.files.length === 0) {
            alert('Selecciona el primer archivo Excel.');
            return;
        }
        formData1.append('archivo_excel', form.archivo_excel.files[0]);

        // Mostrar indicador de carga
        $(this).addClass('loading').prop('disabled', true);

        $.ajax({
            url: '../php/leer_excel_backend.php',
            type: 'POST',
            data: formData1,
            processData: false,
            contentType: false,
            success: function (res1) {
                try {
                    const json1 = JSON.parse(res1);

                    // 2. Si fue exitoso, enviar el segundo archivo Excel
                    var formData2 = new FormData();
                    if (!form.archivo_excel2 || form.archivo_excel2.files.length === 0) {
                        alert('Selecciona el segundo archivo Excel.');
                        $('#btn_procesar_ambos').removeClass('loading').prop('disabled', false);
                        return;
                    }
                    formData2.append('archivo_excel2', form.archivo_excel2.files[0]);

                    $.ajax({
                        url: '../php/leer_excel_horario.php',
                        type: 'POST',
                        data: formData2,
                        processData: false,
                        contentType: false,
                        success: function (res2) {
                            try {
                                const json2 = JSON.parse(res2);
                                // Unir ambos JSON y mostrar el resultado
                                const jsonUnido = unirJson(json1, json2);
                                empleadosNoUnidos(json1, json2);
                                // MOVER enviarIdBiometricosNoUnidos DESPUÉS de asignar jsonGlobal

                                verificarNominaExistente(jsonUnido.numero_semana, function (existe) {
                                    if (existe) {
                                        // Obtener el JSON de la base de datos y asignarlo a jsonGlobal
                                        obtenerNominaDeBaseDatos(jsonUnido.numero_semana, function (jsonBaseDatos) {
                                            if (jsonBaseDatos) {
                                                jsonGlobal = jsonBaseDatos; // Usar el JSON de la base de datos
                                            } else {
                                                jsonGlobal = jsonUnido; // En caso de error, usar el JSON unido
                                            }

                                            // ESTABLECER HORARIOS DESPUÉS DE OBTENER LA NÓMINA
                                            establecerHorariosSemanales(jsonGlobal.numero_semana, function () {
                                                // Verificar que el JSON tenga las fechas necesarias antes de continuar
                                                if (jsonGlobal && jsonGlobal.fecha_inicio && jsonGlobal.fecha_cierre) {
                                                    actualizarCabeceraNomina(jsonGlobal);
                                                }

                                                // AHORA SÍ EJECUTAR enviarIdBiometricosNoUnidos CON jsonGlobal DISPONIBLE
                                                enviarIdBiometricosNoUnidos(json1, json2);

                                                $("#tabla-nomina-responsive").removeAttr("hidden");
                                                $("#container-nomina").attr("hidden", true);

                                                //  USAR FUNCIÓN ESPECIAL PARA DATOS EXISTENTES
                                                establecerDatosEmpleadosExistentes();
                                                busquedaNomina();
                                                //  NO RECALCULAR REGISTROS PARA NÓMINA EXISTENTE
                                                redondearRegistrosEmpleados(false, false);

                                                // Guardar datos en localStorage después de procesar
                                                guardarDatosNomina();
                                                console.log(jsonGlobal);
                                                
                                            });
                                        });
                                        return;
                                    } else {
                                        jsonGlobal = jsonUnido; // Guardar en variable global

                                        // ESTABLECER HORARIOS PARA NÓMINA NUEVA
                                        establecerHorariosSemanales(jsonGlobal.numero_semana, function () {
                                            actualizarCabeceraNomina(jsonUnido);

                                            // AHORA SÍ EJECUTAR enviarIdBiometricosNoUnidos CON jsonGlobal DISPONIBLE
                                            enviarIdBiometricosNoUnidos(json1, json2);

                                            $("#tabla-nomina-responsive").removeAttr("hidden");
                                            $("#container-nomina").attr("hidden", true);

                                            // 🆕 PASAR PARÁMETRO INDICANDO QUE ES NÓMINA NUEVA
                                            establecerDatosEmpleados(true);
                                            busquedaNomina();
                                            // 🆕 RECALCULAR PARA NÓMINA NUEVA
                                            redondearRegistrosEmpleados(true, true);

                                            // Guardar datos en localStorage después de procesar
                                            guardarDatosNomina();
                                            console.log(jsonGlobal);
                                                
                                        });
                                    }
                                });
                            } catch (e) {

                            } finally {
                                $('#btn_procesar_ambos').removeClass('loading').prop('disabled', false);
                            }
                        },

                    });

                } catch (e) {

                }
            },

        });
    });
}

// Función para unir dos JSON con normalización
function unirJson(json1, json2) {
    // Mejor normalización: quita tildes, dobles espacios, mayúsculas y ordena palabras
    const normalizar = s => s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");

    const empleados2Map = {};
    if (json2 && json2.empleados) {
        json2.empleados.forEach(emp => {
            empleados2Map[normalizar(emp.nombre)] = emp;
        });
    }

    // Recorre departamentos y empleados
    if (json1 && json1.departamentos) {
        json1.departamentos.forEach(depto => {
            //   SOLO AGREGAR REGISTROS PARA PRODUCCION 40 LIBRAS
            const esProduccion40 = (depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS');

            if (depto.empleados) {
                depto.empleados.forEach(emp1 => {
                    const nombreNormalizado = normalizar(emp1.nombre);
                    if (empleados2Map[nombreNormalizado]) {
                        const emp2 = empleados2Map[nombreNormalizado];

                        // Solo agregar datos de horarios si es el departamento de Producción 40 Libras
                        if (esProduccion40) {

                            emp1.registros = emp2.registros;
                        }
                        // Para otros departamentos, no agregar registros de horarios
                    }
                });
            }
        });
    }

    return json1;
}

/*
 * ================================================================
 * MÓDULO DE CONFIGURACIÓN DE ENCABEZADOS DE NÓMINA
 * ================================================================
 * Este módulo se encarga de:
 * - Establecer el número de semana en el encabezado
 * - Configurar las fechas que abarca la nómina (fecha inicio y fin)
 * - Mostrar información temporal del período de nómina procesado
 * ================================================================
 */

// Función para actualizar la cabecera de la nómina
function actualizarCabeceraNomina(json) {
    if (!json) return;

    // Función para obtener el nombre del mes en español
    function mesEnLetras(mes) {
        const meses = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        return meses[mes - 1];
    }

    // Extraer día, mes y año de las fechas
    function descomponerFecha(fecha) {
        // Verificar que la fecha no sea null o undefined
        if (!fecha) {
            return { dia: '', mes: '', anio: '' };
        }

        // Ejemplo: "21/Jun/2025" o "21/05/2025"
        const partes = fecha.split('/');
        let dia = partes[0] || '';
        let mes = partes[1] || '';
        let anio = partes[2] || '';

        // Si el mes es numérico, conviértelo a nombre
        if (/^\d+$/.test(mes)) {
            mes = mesEnLetras(parseInt(mes, 10));
        } else {
            // Si el mes es abreviado (Jun), conviértelo a nombre completo
            const mesesAbrev = {
                'Ene': 'Enero', 'Feb': 'Febrero', 'Mar': 'Marzo', 'Abr': 'Abril', 'May': 'Mayo', 'Jun': 'Junio',
                'Jul': 'Julio', 'Ago': 'Agosto', 'Sep': 'Septiembre', 'Oct': 'Octubre', 'Nov': 'Noviembre', 'Dic': 'Diciembre'
            };
            mes = mesesAbrev[mes] || mes;
        }
        return { dia, mes, anio };
    }

    // Verificar que las fechas existan antes de procesarlas
    if (!json.fecha_inicio || !json.fecha_cierre) {
        $('#nombre_nomina').text('NÓMINA');
        $('#num_semana').text(`SEM ${json.numero_semana || ''}`);
        return;
    }

    const ini = descomponerFecha(json.fecha_inicio);
    const fin = descomponerFecha(json.fecha_cierre);

    let nombreNomina = '';
    if (ini.anio === fin.anio) {
        if (ini.mes === fin.mes) {
            // Mismo mes y año
            nombreNomina = `NÓMINA DEL ${ini.dia} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        } else {
            // Mismo año, diferente mes
            nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
        }
    } else {
        // Diferente año
        nombreNomina = `NÓMINA DEL ${ini.dia} ${ini.mes.toUpperCase()} DEL ${ini.anio} AL ${fin.dia} DE ${fin.mes.toUpperCase()} DEL ${fin.anio}`;
    }

    $('#nombre_nomina').text(nombreNomina);
    $('#num_semana').text(`SEM ${json.numero_semana}`);
}

/*
 * ================================================================
 * MÓDULO DE ORDENAMIENTO ALFABÉTICO POR APELLIDOS
 * ================================================================
 * Este módulo se encarga de:
 * - Ordenar los empleados alfabéticamente por apellido paterno, materno y nombre
 * - Descomponer nombres completos en sus componentes individuales
 * - Realizar comparaciones localizadas en español para ordenamiento correcto
 * ================================================================
 */

// Función para comparar por apellido paterno, materno y nombre(s)
function compararPorApellidos(a, b) {
    const [apPatA, apMatA, nomA] = descomponerNombre(a.nombre);
    const [apPatB, apMatB, nomB] = descomponerNombre(b.nombre);

    let cmp = apPatA.localeCompare(apPatB, 'es', { sensitivity: 'base' });
    if (cmp !== 0) return cmp;
    cmp = apMatA.localeCompare(apMatB, 'es', { sensitivity: 'base' });
    if (cmp !== 0) return cmp;
    return nomA.localeCompare(nomB, 'es', { sensitivity: 'base' });
}

// Función para descomponer el nombre en apellido paterno, materno y nombres
function descomponerNombre(nombreCompleto) {
    const partes = nombreCompleto.trim().toUpperCase().split(/\s+/);
    return [
        partes[0] || '', // Apellido paterno
        partes[1] || '', // Apellido materno
        partes.slice(2).join(' ') || '' // Nombre(s)
    ];
}

/*
 * ================================================================
 * MÓDULO DE GESTIÓN Y VISUALIZACIÓN DE DATOS DE EMPLEADOS
 * ================================================================
 * Este módulo se encarga de:
 * - Establecer los datos de empleados en el JSON global
 * - Actualizar el JSON con empleados originales procesados
 * - Obtener claves de empleados para validación
 * - Mostrar los datos procesados en la tabla de nómina
 * - Coordinar el flujo completo desde procesamiento hasta visualización
 * ================================================================
 */

// Funcion para agregar datos de los empleados al JSON global
function establecerDatosEmpleados() {
    let empleadosPlanos = [];
    if (jsonGlobal && jsonGlobal.departamentos) {
        jsonGlobal.departamentos.forEach(depto => {
            // Solo procesar empleados del departamento "PRODUCCION 40 LIBRAS"
            if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
                let empleadosOrdenados = (depto.empleados || []).slice().sort(compararPorApellidos);
                empleadosOrdenados.forEach(emp => {
                    // Solo inicializar valores si no existen (para preservar modificaciones)
                    if (emp.incentivo === undefined) {
                        emp.incentivo = 250;
                    }

                    //   INICIALIZAR BONO DE ANTIGÜEDAD si no existe
                    if (emp.bono_antiguedad === undefined) {
                        emp.bono_antiguedad = 0;
                    }

                    //   INICIALIZAR ACTIVIDADES ESPECIALES si no existe
                    if (emp.actividades_especiales === undefined) {
                        emp.actividades_especiales = 0;
                    }

                    //   INICIALIZAR BONO RESPONSABILIDAD si no existe
                    if (emp.bono_puesto === undefined) {
                        emp.bono_puesto = 0;
                    }

                    //   INICIALIZAR CONCEPTOS ADICIONALES si no existe
                    if (emp.conceptos_adicionales === undefined) {
                        emp.conceptos_adicionales = [];
                    }

                    //   INICIALIZAR SUELDO EXTRA FINAL si no existe
                    if (emp.sueldo_extra_final === undefined) {
                        emp.sueldo_extra_final = emp.sueldo_extra || 0;
                    }

                    // Agregar propiedades de deducciones solo si no existen (para preservar modificaciones)
                    if (emp.prestamo === undefined) {
                        emp.prestamo = 0;
                    }
                    if (emp.uniformes === undefined) {
                        emp.uniformes = 0;
                    }
                    if (emp.checador === undefined) {
                        emp.checador = 0;
                    }
                    if (emp.fa_gafet_cofia === undefined) {
                        emp.fa_gafet_cofia = 0;
                    }
                    if (emp.inasistencias_minutos === undefined) {
                        emp.inasistencias_minutos = 0;
                    }
                    if (emp.inasistencias_descuento === undefined) {
                        emp.inasistencias_descuento = 0;
                    }

                    //   INICIALIZAR SUELDO A COBRAR si no existe
                    if (emp.sueldo_a_cobrar === undefined) {
                        emp.sueldo_a_cobrar = 0;
                    }

                    // Asegurarse de que todos los valores numéricos tengan formato correcto
                    emp.incentivo = typeof emp.incentivo === 'number' ? parseFloat(emp.incentivo.toFixed(2)) : emp.incentivo;
                    emp.bono_antiguedad = typeof emp.bono_antiguedad === 'number' ? parseFloat(emp.bono_antiguedad.toFixed(2)) : emp.bono_antiguedad;
                    emp.actividades_especiales = typeof emp.actividades_especiales === 'number' ? parseFloat(emp.actividades_especiales.toFixed(2)) : emp.actividades_especiales;
                    emp.bono_puesto = typeof emp.bono_puesto === 'number' ? parseFloat(emp.bono_puesto.toFixed(2)) : emp.bono_puesto;
                    emp.sueldo_extra_final = typeof emp.sueldo_extra_final === 'number' ? parseFloat(emp.sueldo_extra_final.toFixed(2)) : emp.sueldo_extra_final;
                    emp.prestamo = typeof emp.prestamo === 'number' ? parseFloat(emp.prestamo.toFixed(2)) : emp.prestamo;
                    emp.uniformes = typeof emp.uniformes === 'number' ? parseFloat(emp.uniformes.toFixed(2)) : emp.uniformes;
                    emp.checador = typeof emp.checador === 'number' ? parseFloat(emp.checador.toFixed(2)) : emp.checador;
                    emp.fa_gafet_cofia = typeof emp.fa_gafet_cofia === 'number' ? parseFloat(emp.fa_gafet_cofia.toFixed(2)) : emp.fa_gafet_cofia;
                    emp.inasistencias_descuento = typeof emp.inasistencias_descuento === 'number' ? parseFloat(emp.inasistencias_descuento.toFixed(2)) : emp.inasistencias_descuento;
                    emp.sueldo_a_cobrar = typeof emp.sueldo_a_cobrar === 'number' ? parseFloat(emp.sueldo_a_cobrar.toFixed(2)) : emp.sueldo_a_cobrar;

                    empleadosPlanos.push({
                        ...emp,
                        id_departamento: depto.nombre.split(' ')[0],
                        nombre_departamento: depto.nombre.replace(/^\d+\s*/, ''),
                        puesto: emp.puesto || emp.nombre_departamento || depto.nombre.replace(/^\d+\s*/, '') // Preservar puesto original
                    });
                });
            }
        });
    }

    window.empleadosOriginales = empleadosPlanos;
    empleadosFiltrados = [...empleadosPlanos];

    actualizarJsonGlobalConEmpleadosOriginales();

    $("#busqueda-container").removeAttr("hidden");
    $("#filtro-seguro").removeAttr("hidden");

    // Guardar datos después de establecer empleados
    guardarDatosNomina();
}

//  NUEVA FUNCIÓN PARA CARGAR DATOS EXISTENTES SIN RECALCULAR
function establecerDatosEmpleadosExistentes() {
    let empleadosPlanos = [];
    if (jsonGlobal && jsonGlobal.departamentos) {
        jsonGlobal.departamentos.forEach(depto => {
            // Solo procesar empleados del departamento "PRODUCCION 40 LIBRAS"
            if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
                let empleadosOrdenados = (depto.empleados || []).slice().sort(compararPorApellidos);
                empleadosOrdenados.forEach(emp => {
                    // PRESERVAR TODOS LOS VALORES EXISTENTES - NO INICIALIZAR NADA
                    empleadosPlanos.push({
                        ...emp,
                        id_departamento: depto.nombre.split(' ')[0],
                        nombre_departamento: depto.nombre.replace(/^\d+\s*/, ''),
                        puesto: emp.puesto || emp.nombre_departamento || depto.nombre.replace(/^\d+\s*/, '') // Preservar puesto original
                    });
                });
            }
        });
    }

    window.empleadosOriginales = empleadosPlanos;
    empleadosFiltrados = [...empleadosPlanos];

    // NO actualizar jsonGlobal porque ya viene correcto de la BD
    $("#busqueda-container").removeAttr("hidden");
    $("#filtro-seguro").removeAttr("hidden");


    // Guardar datos después de establecer empleados
    guardarDatosNomina();
}

// Actualiza jsonGlobal con los datos de empleadosOriginales
function actualizarJsonGlobalConEmpleadosOriginales() {
    if (!jsonGlobal || !jsonGlobal.departamentos || !window.empleadosOriginales) return;
    jsonGlobal.departamentos.forEach(depto => {
        // Solo actualizar departamento "PRODUCCION 40 LIBRAS" con empleados procesados
        if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
            // Filtra empleados que pertenecen a este departamento
            const empleadosDepto = window.empleadosOriginales.filter(emp =>
                (emp.id_departamento === depto.nombre.split(' ')[0]) &&
                (emp.nombre_departamento === depto.nombre.replace(/^\d+\s*/, ''))
            );
            // Quita los campos auxiliares si no los quieres en el JSON final
            depto.empleados = empleadosDepto.map(emp => {
                const { id_departamento, nombre_departamento, ...rest } = emp;
                return rest;
            });
        }
        // Los demás departamentos mantienen sus empleados originales sin procesar
    });
}

// Función para sincronizar cambios de la tabla con jsonGlobal
function sincronizarCambiosConJsonGlobal() {
    if (!jsonGlobal || !jsonGlobal.departamentos || !window.empleadosOriginales) return;

    // Actualizar empleados en jsonGlobal con los valores actuales de empleadosOriginales
    jsonGlobal.departamentos.forEach(depto => {
        if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
            depto.empleados = depto.empleados.map(emp => {
                // Buscar empleado actualizado en empleadosOriginales
                const empActualizado = window.empleadosOriginales.find(e => e.clave === emp.clave);
                if (empActualizado) {
                    // Conservar todos los campos actualizados
                    return { ...emp, ...empActualizado };
                }
                return emp;
            });
        }
    });
}

// Función para actualizar un empleado en los datos cuando se modifican en la tabla
function actualizarEmpleadoEnDatos(clave, columna, valor) {
    // Encontrar el empleado en empleadosOriginales
    const empleado = window.empleadosOriginales.find(emp => emp.clave == clave);
    if (!empleado) return;

    // Convertir valor a número si es posible
    let valorNumerico = valor === '' ? 0 : parseFloat(valor) || valor;

    // Si es un número, formatearlo con dos decimales
    if (typeof valorNumerico === 'number' && !isNaN(valorNumerico)) {
        valorNumerico = parseFloat(valorNumerico.toFixed(2));
    }

    // Actualizar el campo correspondiente según la columna
    switch (columna) {
        case 4: // Incentivo
            empleado.incentivo = valorNumerico;
            break;
        case 5: // Extra
            empleado.sueldo_extra_final = valorNumerico;
            break;
        case 6: // Tarjeta
            empleado.neto_pagar = valorNumerico;
            break;
        case 7: // Préstamo
            empleado.prestamo = valorNumerico;
            break;
        case 8: // Inasistencias
            empleado.inasistencias_descuento = valorNumerico;
            break;
        case 9: // Uniformes
            empleado.uniformes = valorNumerico;
            break;
        case 13: // Checador
            empleado.checador = valorNumerico;
            break;
        case 14: // F.A / GAFET / COFIA
            empleado.fa_gafet_cofia = valorNumerico;
            break;
        // No actualizamos ISR, IMSS, INFONAVIT ni Sueldo a cobrar ya que son calculados
    }

    // Recalcular sueldo a cobrar
    calcularSueldoACobraPorEmpleado(empleado);

    // Actualizar en jsonGlobal
    sincronizarCambiosConJsonGlobal();
}

/*
 * ================================================================
 * MÓDULO DE MENÚ CONTEXTUAL Y DETALLES DE EMPLEADOS
 * ================================================================
 * Este módulo se encarga de:
 * - Crear y gestionar el menú contextual (clic derecho) en filas de empleados
 * - Mostrar modal con detalles completos del empleado seleccionado
 * - Manejar la navegación entre pestañas del modal de detalles
 * - Controlar eventos de apertura y cierre del modal
 * ================================================================
 */

// Función para mostrar el menu contextual de empleados
function inicializarMenuContextual() {
    // Limpiar eventos previos para evitar acumulación
    $(document).off('contextmenu', '#tabla-nomina-body tr');
    $(document).off('click', '#menu-contextual');
    $(document).off('click', '#cerrar-modal-detalles, #btn-cancelar-detalles');
    $('#modalTabs .nav-link').off('click');

    // Crear un mapa de empleados para búsqueda rápida
    const empleadosMap = new Map();
    if (window.jsonGlobal && window.jsonGlobal.departamentos) {
        window.jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                empleadosMap.set(String(emp.clave), {
                    empleado: emp,
                    esProduccion40: (depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')
                });
            });
        });
    }

    // Mostrar menú contextual solo para "Produccion 40 Libras"
    $(document).on('contextmenu', '#tabla-nomina-body tr', function (e) {
        e.preventDefault();
        const clave = $(this).data('clave');

        // Búsqueda rápida usando Map
        const empleadoInfo = empleadosMap.get(String(clave));

        if (empleadoInfo && empleadoInfo.esProduccion40) {
            // Guardar la clave para usar en "Ver detalles" sin buscar de nuevo
            $('#menu-contextual').data('clave-actual', clave);
            $('#menu-contextual')
                .css({ left: e.pageX, top: e.pageY })
                .removeAttr('hidden');
        } else {
            $('#menu-contextual').attr('hidden', true);
        }
    });

    // Ocultar menú contextual al hacer clic fuera
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#menu-contextual').length) {
            $('#menu-contextual').attr('hidden', true);
        }
    });

    // Mostrar modal de detalles al hacer clic en "Ver detalles"
    $(document).on('click', '#menu-contextual', function () {
        $('#menu-contextual').attr('hidden', true);

        // Obtener la clave guardada y buscar datos
        const clave = $(this).data('clave-actual');
        if (clave) {
            buscarDatos(clave);
        }

        $('#modal-detalles').fadeIn();

        // Mostrar primer tab al abrir
        $('#modalTabs .nav-link').removeClass('active');
        $('#tab-info').addClass('active');
        $('.tab-pane').removeClass('show active');
        $('#tab_info').addClass('show active');
    });

    // Cerrar modal
    $(document).on('click', '#cerrar-modal-detalles, #btn-cancelar-detalles', function () {
        $('#modal-detalles').fadeOut();
    });

    // Cambiar pestañas en el modal (si no usas Bootstrap JS)
    $('#modalTabs .nav-link').on('click', function () {
        const target = $(this).attr('data-bs-target');
        $('#modalTabs .nav-link').removeClass('active');
        $(this).addClass('active');
        $('.tab-pane').removeClass('show active');
        $(target).addClass('show active');
    });
}

/*
 * ================================================================
 * MÓDULO DE BÚSQUEDA Y FILTRADO DE EMPLEADOS
 * ================================================================
 * Este módulo se encarga de:
 * - Implementar búsqueda en tiempo real por nombre o clave de empleado
 * ================================================================
 */

function busquedaNomina() {
    $('#campo-busqueda').on('input', function () {
        const termino = $(this).val().trim().toLowerCase();

        // Debounce: esperar 300ms después de que el usuario deje de escribir
        if (timeoutBusqueda) clearTimeout(timeoutBusqueda);

        timeoutBusqueda = setTimeout(function () {
            // Filtrar empleados por nombre o clave
            empleadosFiltrados = termino ?
                window.empleadosOriginales.filter(emp =>
                    (emp.nombre || '').toLowerCase().includes(termino) ||
                    (emp.clave || '').toString().includes(termino)
                ) :
                [...window.empleadosOriginales];

            // Actualizar paginación con resultados filtrados
            // Nota: setEmpleadosPaginados ahora filtra empleados registrados automáticamente
            paginaActualNomina = 1;
            setEmpleadosPaginados(empleadosFiltrados);
        }, 300);
    });

    $('#campo-busqueda-dispersion').on('input', function () {
        const termino = $(this).val().trim().toLowerCase();

        // Debounce: esperar 300ms después de que el usuario deje de escribir
        if (timeoutBusquedaDispersion) clearTimeout(timeoutBusquedaDispersion);

        timeoutBusquedaDispersion = setTimeout(function () {
            // Filtrar empleados por nombre o clave
            empleadosFiltradosDispersion = termino ?
                window.empleadosOriginalesDispersion.filter(emp =>
                    (emp.nombre || '').toLowerCase().includes(termino) ||
                    (emp.clave || '').toString().includes(termino)
                ) :
                [...window.empleadosOriginalesDispersion];

            // Actualizar paginación con resultados filtrados
            paginaActualDispersion = 1;
            setEmpleadosDispersionPaginados(empleadosFiltradosDispersion);
        }, 300);
    });


}

/*
 * ================================================================
 * MÓDULO DE REDONDEO DE REGISTROS DE EMPLEADOS
 * ================================================================
 * Este módulo se encarga de:
 * - Redondear los registros de checador según las reglas establecidas
 * - Aplicar diferentes lógicas según el tipo de horario configurado
 * - Mostrar los resultados en consola para verificación
 * ================================================================
 */

let registrosYaRedondeados = false;




function redondearRegistrosEmpleados(forzarRecalculo = false, esNominaNueva = true) {
    if (!jsonGlobal || !jsonGlobal.departamentos || !window.horariosSemanalesActualizados || !window.empleadosOriginales) {
        return;
    }

    // Si es nómina existente y no se fuerza recálculo, NO recalcular sueldos base
    if (!esNominaNueva && !forzarRecalculo) {
        // Solo mostrar datos sin recalcular
        setEmpleadosPaginados(window.empleadosOriginales);
        return;
    }

    // Verificar si los datos vienen de la base de datos (ya tienen total_minutos_redondeados)
    const datosVienenDeBD = window.empleadosOriginales.some(emp =>
        emp.total_minutos_redondeados !== undefined && emp.total_minutos_redondeados > 0
    );

    // Si se fuerza recálculo (modificación de horarios oficiales), no preservar datos de BD
    const debeRecalcularTodo = forzarRecalculo || !datosVienenDeBD;

    // Función auxiliar para encontrar empleado en jsonGlobal
    function encontrarEmpleadoEnJsonGlobal(clave) {
        if (!jsonGlobal || !jsonGlobal.departamentos) return null;
        for (let depto of jsonGlobal.departamentos) {
            // Buscar en PRODUCCION 40 LIBRAS y SIN SEGURO
            if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS') || 
                (depto.nombre || '').toUpperCase().includes('SIN SEGURO')) {
                for (let emp of depto.empleados || []) {
                    // Buscar por clave o por id_biometrico para empleados no unidos
                    if (emp.clave === clave || emp.id_biometrico === clave) {
                        return emp;
                    }
                }
            }
        }
        return null;
    }

    // Si se debe recalcular todo, no preservar datos de BD
    let minutosTotalesBD = new Map();
    if (datosVienenDeBD && !debeRecalcularTodo) {

        // Preservar los minutos totales de la BD antes del redondeo
        window.empleadosOriginales.forEach(empleado => {
            const empleadoEnJson = encontrarEmpleadoEnJsonGlobal(empleado.clave);
            if (empleadoEnJson && empleadoEnJson.total_minutos_redondeados) {
                minutosTotalesBD.set(empleado.clave, empleadoEnJson.total_minutos_redondeados);
            }
        });
    } else if (debeRecalcularTodo) {
    }

    function obtenerDiaSemana(fecha) {
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(anio, mes - 1, dia);
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        return dias[fechaObj.getDay()];
    }

    function horaAMinutos(hora) {
        if (!hora || hora === "" || hora === "00:00") return null;
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
    }
    function minutosAHora(minutos) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    function detectarEntradaTemprana(horaReal, horaOficial) {
        const minutosReal = horaAMinutos(horaReal);
        const minutosOficial = horaAMinutos(horaOficial);
        if (minutosReal && minutosOficial && minutosReal < minutosOficial) {
            const diferencia = minutosOficial - minutosReal;
            return (diferencia >= 50) ? diferencia : 0;
        }
        return 0;
    }
    function detectarSalidaTardia(horaReal, horaOficial) {
        const minutosReal = horaAMinutos(horaReal);
        const minutosOficial = horaAMinutos(horaOficial);
        if (minutosReal && minutosOficial && minutosReal > minutosOficial) {
            const diferencia = minutosReal - minutosOficial;
            return (diferencia >= 50) ? diferencia : 0;
        }
        return 0;
    }

    function detectarLlegadaTardiaComer(horaReal, horaOficial) {
        const minutosReal = horaAMinutos(horaReal);
        const minutosOficial = horaAMinutos(horaOficial);
        if (minutosReal && minutosOficial && minutosReal > minutosOficial) {
            const diferencia = minutosReal - minutosOficial;
            return (diferencia > 30) ? diferencia : 0;
        }
        return 0;
    }

    function redondearHora(horaReal, horaOficial, tipo) {
        if (!horaReal || horaReal === "") return horaReal;
        const minutosReal = horaAMinutos(horaReal);
        const minutosOficial = horaAMinutos(horaOficial);
        if (!minutosOficial) return horaReal;

        switch (tipo) {
            case 'entrada':
                // Redondear a la hora oficial de entrada si se marca hasta 40 minutos después
                if (minutosReal >= minutosOficial && minutosReal <= minutosOficial + 40) {
                    return horaOficial;
                }
                return minutosReal <= minutosOficial ? horaOficial : horaReal;
            case 'salidaComer':
                // Redondear a la hora oficial de salida a comer si está dentro de -30 a +30 minutos
                if (minutosReal >= minutosOficial - 30 && minutosReal <= minutosOficial + 30) {
                    return horaOficial;
                }
                return horaReal;
            case 'entradaComer':
                // Redondear a la hora oficial de entrada después de comer si está dentro de -30 a +30 minutos
                if (minutosReal >= minutosOficial - 30 && minutosReal <= minutosOficial + 30) {
                    return horaOficial;
                }
                return horaReal;
            case 'salida':

                if (minutosReal >= minutosOficial && minutosReal <= minutosOficial + 50) {
                    return horaOficial;
                }
                if (minutosReal > minutosOficial + 50) {
                    return horaOficial;
                }
                if (minutosReal >= minutosOficial - 30 && minutosReal < minutosOficial) {
                    return horaOficial;
                }
                return horaReal;
            default:
                return horaReal;
        }
    }

    function calcularTiempoTrabajado(registrosDia, horarioOficial) {
        if (!registrosDia || registrosDia.length === 0) return 0;
        let primeraEntrada = null;
        let ultimaSalida = null;

        for (let registro of registrosDia) {
            if (registro.entrada && registro.entrada !== "00:00") {
                primeraEntrada = horaAMinutos(registro.entrada);
                break;
            }
        }
        for (let i = registrosDia.length - 1; i >= 0; i--) {
            const registro = registrosDia[i];
            if (registro.salida && registro.salida !== "00:00") {
                ultimaSalida = horaAMinutos(registro.salida);
                break;
            }
        }

        let totalMinutos = 0;
        if (primeraEntrada !== null && ultimaSalida !== null) {
            totalMinutos = ultimaSalida - primeraEntrada;
        }
        if (horarioOficial && horarioOficial.horasComida && horarioOficial.horasComida !== "00:00") {
            const minutosComida = horaAMinutos(horarioOficial.horasComida);
            if (minutosComida) {
                totalMinutos -= minutosComida;
            }
        }
        return Math.max(0, totalMinutos);
    }

    function detectarOlvidosChecador(registrosDia, horarioOficial) {
        const olvidos = [];
        const tieneHorarioCompleto =
            horarioOficial.entrada !== "00:00" &&
            horarioOficial.salidaComida !== "00:00" &&
            horarioOficial.entradaComida !== "00:00" &&
            horarioOficial.salida !== "00:00";

        if (tieneHorarioCompleto) {
            if (registrosDia.length < 2) {
                olvidos.push("Faltan registros completos");
                return olvidos;
            }
            if (!registrosDia[0] || !registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                olvidos.push("Entrada");
            }
            if (!registrosDia[0] || !registrosDia[0].salida || registrosDia[0].salida === "00:00") {
                olvidos.push("Salir a comer");
            }
            if (!registrosDia[1] || !registrosDia[1].entrada || registrosDia[1].entrada === "00:00") {
                olvidos.push("Regreso de comer");
            }
            if (!registrosDia[1] || !registrosDia[1].salida || registrosDia[1].salida === "00:00") {
                olvidos.push("Salida final");
            }
        } else {
            const tieneEntradaSalida =
                horarioOficial.entrada !== "00:00" &&
                horarioOficial.salida !== "00:00";
            if (tieneEntradaSalida) {
                if (registrosDia.length === 0) {
                    olvidos.push("Entrada y Salida");
                    return olvidos;
                }
                if (!registrosDia[0] || !registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                    olvidos.push("Entrada");
                }
                const ultimoRegistro = registrosDia[registrosDia.length - 1];
                if (!ultimoRegistro || !ultimoRegistro.salida || ultimoRegistro.salida === "00:00") {
                    olvidos.push("Salida");
                }
            }
        }
        return olvidos;
    }

    function completarRegistrosFaltantes(registrosDia, horarioOficial) {
        const tieneHorarioCompleto =
            horarioOficial.entrada !== "00:00" &&
            horarioOficial.salidaComida !== "00:00" &&
            horarioOficial.entradaComida !== "00:00" &&
            horarioOficial.salida !== "00:00";

        const tieneEntradaSalida =
            horarioOficial.entrada !== "00:00" &&
            horarioOficial.salida !== "00:00";

        if (tieneHorarioCompleto) {
            while (registrosDia.length < 2) {
                registrosDia.push({ entrada: "00:00", salida: "00:00" });
            }
            if (!registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                registrosDia[0].entrada = horarioOficial.entrada;
            }
            if (!registrosDia[0].salida || registrosDia[0].salida === "00:00") {
                registrosDia[0].salida = horarioOficial.salidaComida;
            }
            if (!registrosDia[1].entrada || registrosDia[1].entrada === "00:00") {
                registrosDia[1].entrada = horarioOficial.entradaComida;
            }
            if (!registrosDia[1].salida || registrosDia[1].salida === "00:00") {
                registrosDia[1].salida = horarioOficial.salida;
            }
        } else if (tieneEntradaSalida) {
            if (registrosDia.length === 0) {
                registrosDia.push({ entrada: "00:00", salida: "00:00" });
            }
            if (!registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                registrosDia[0].entrada = horarioOficial.entrada;
            }
            if (registrosDia.length === 1) {
                if (!registrosDia[0].salida || registrosDia[0].salida === "00:00") {
                    registrosDia[0].salida = horarioOficial.salida;
                }
            } else {
                const ultimoIndex = registrosDia.length - 1;
                if (!registrosDia[ultimoIndex].salida || registrosDia[ultimoIndex].salida === "00:00") {
                    registrosDia[ultimoIndex].salida = horarioOficial.salida;
                }
            }
        }
        return registrosDia;
    }

    window.empleadosOriginales.forEach(empleado => {
        const registrosPorFecha = {};
        let totalMinutosSemana = 0;
        // Para empleados no unidos, usar id_biometrico como clave
        const claveBusqueda = empleado.no_unido ? empleado.id_biometrico : empleado.clave;
        const empleadoEnJson = encontrarEmpleadoEnJsonGlobal(claveBusqueda);
        const registrosRedondeados = [];

        //    CONTADOR DE OLVIDOS DEL CHECADOR PARA DESCUENTO
        let totalOlvidosChecadorSemana = 0;

        if (empleado.registros) {
            empleado.registros.forEach(registro => {
                if (registro.fecha && (registro.entrada || registro.salida)) {
                    if (!registrosPorFecha[registro.fecha]) registrosPorFecha[registro.fecha] = [];
                    registrosPorFecha[registro.fecha].push(registro);
                }
            });
        }

        Object.keys(registrosPorFecha).forEach(fecha => {
            const diaSemana = obtenerDiaSemana(fecha);
            const horarioOficial = window.horariosSemanalesActualizados.semana[diaSemana];
            if (!horarioOficial) return;
            const registrosDia = JSON.parse(JSON.stringify(registrosPorFecha[fecha]));
            const tieneHorarioCompleto =
                horarioOficial.entrada !== "00:00" &&
                horarioOficial.salidaComida !== "00:00" &&
                horarioOficial.entradaComida !== "00:00" &&
                horarioOficial.salida !== "00:00";

            const tieneEntradaSalida =
                horarioOficial.entrada !== "00:00" &&
                horarioOficial.salida !== "00:00" &&
                (horarioOficial.salidaComida === "00:00" || horarioOficial.entradaComida === "00:00");

            const olvidosChecador = detectarOlvidosChecador(registrosDia, horarioOficial);

            //    CONTAR OLVIDOS PARA EL DESCUENTO SEMANAL
            if (olvidosChecador.length > 0) {
                totalOlvidosChecadorSemana++;
            }

            completarRegistrosFaltantes(registrosDia, horarioOficial);
            let entradaTemprana = 0;
            let salidaTardia = 0;
            let llegadaTardiaComer = 0;

            if (registrosDia.length >= 1 && horarioOficial.entrada !== "00:00") {
                entradaTemprana = detectarEntradaTemprana(registrosDia[0].entrada, horarioOficial.entrada);
            }
            if (registrosDia.length >= 1 && horarioOficial.salida !== "00:00") {
                const ultimo = registrosDia[registrosDia.length - 1];
                salidaTardia = detectarSalidaTardia(ultimo.salida, horarioOficial.salida);
            }
            if (tieneHorarioCompleto && registrosDia.length >= 2 && horarioOficial.entradaComida !== "00:00") {
                llegadaTardiaComer = detectarLlegadaTardiaComer(registrosDia[1].entrada, horarioOficial.entradaComida);
            }

            if (tieneHorarioCompleto && registrosDia.length >= 2) {
                registrosDia[0].entrada = redondearHora(registrosDia[0].entrada, horarioOficial.entrada, 'entrada');
                registrosDia[0].salida = redondearHora(registrosDia[0].salida, horarioOficial.salidaComida, 'salidaComer');
                registrosDia[1].entrada = redondearHora(registrosDia[1].entrada, horarioOficial.entradaComida, 'entradaComer');
                registrosDia[1].salida = redondearHora(registrosDia[1].salida, horarioOficial.salida, 'salida');
                for (let i = 2; i < registrosDia.length; i++) {
                    registrosDia[i].entrada = "00:00";
                    registrosDia[i].salida = "00:00";
                }
            } else if (tieneEntradaSalida) {
                registrosDia.forEach((registro, index) => {
                    if (index === 0) {
                        registro.entrada = redondearHora(registro.entrada, horarioOficial.entrada, 'entrada');
                        registro.salida = (registrosDia.length > 1) ? "00:00" :
                            redondearHora(registro.salida, horarioOficial.salida, 'salida');
                    } else if (index === registrosDia.length - 1) {
                        registro.entrada = "00:00";
                        registro.salida = redondearHora(registro.salida, horarioOficial.salida, 'salida');
                    } else {
                        registro.entrada = "00:00";
                        registro.salida = "00:00";
                    }
                });
            }

            const minutosTrabajados = calcularTiempoTrabajado(registrosDia, horarioOficial);
            const horasTrabajadas = minutosAHora(minutosTrabajados);
            totalMinutosSemana += minutosTrabajados;

            if (empleadoEnJson) {
                const registroRedondeado = {
                    fecha: fecha,
                    dia: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
                    entrada: registrosDia[0]?.entrada || "00:00",
                    salida_comer: tieneHorarioCompleto ? (registrosDia[0]?.salida || "00:00") : "00:00",
                    entrada_comer: tieneHorarioCompleto ? (registrosDia[1]?.entrada || "00:00") : "00:00",
                    salida: registrosDia[registrosDia.length - 1]?.salida || "00:00",
                    hora_comida: horarioOficial.horasComida || "00:00",
                    trabajado: horasTrabajadas,
                    olvido_checador: olvidosChecador.length > 0,
                    entrada_temprana: minutosAHora(entradaTemprana),
                    salida_tardia: minutosAHora(salidaTardia)
                };
                registrosRedondeados.push(registroRedondeado);
            }
        });

        if (empleadoEnJson) {
            // Si se debe recalcular todo, usar los minutos calculados
            if (debeRecalcularTodo) {
                empleadoEnJson.tiempo_total_redondeado = minutosAHora(totalMinutosSemana);
                empleadoEnJson.total_minutos_redondeados = totalMinutosSemana;
            } else if (datosVienenDeBD && minutosTotalesBD.has(empleado.clave)) {
                // Si los datos vienen de la BD y no se fuerza recálculo, usar los minutos totales preservados
                const minutosBD = minutosTotalesBD.get(empleado.clave);
                empleadoEnJson.tiempo_total_redondeado = minutosAHora(minutosBD);
                empleadoEnJson.total_minutos_redondeados = minutosBD;
            } else {
                // Si son datos nuevos, calcular normalmente
                empleadoEnJson.tiempo_total_redondeado = minutosAHora(totalMinutosSemana);
                empleadoEnJson.total_minutos_redondeados = totalMinutosSemana;
            }
            empleadoEnJson.registros_redondeados = registrosRedondeados;

            //    APLICAR DESCUENTO POR OLVIDOS DEL CHECADOR
            // Calcular descuento: $20 por cada día que olvidó checar
            const descuentoPorOlvido = totalOlvidosChecadorSemana * 20;

            // Asignar al empleadoEnJson para que se incluya en el cálculo del sueldo a cobrar
            empleadoEnJson.checador = descuentoPorOlvido;
        }

        const horasSemanales = minutosAHora(totalMinutosSemana);

        // Asignar directamente al empleado para mostrar en la tabla
        const descuentoPorOlvido = totalOlvidosChecadorSemana * 20;
        empleado.checador_tabla_descuento = descuentoPorOlvido;
    });

    window.empleadosOriginales.forEach(empleado => {
        const empleadoEnJson = encontrarEmpleadoEnJsonGlobal(empleado.clave);
        if (empleadoEnJson && empleadoEnJson.tiempo_total_redondeado) {


            calcularCamposEmpleado(empleadoEnJson);
            empleado.sueldo_base = empleadoEnJson.sueldo_base;
            empleado.sueldo_extra = empleadoEnJson.sueldo_extra;
            empleado.sueldo_extra_final = empleadoEnJson.sueldo_extra;
            empleado.tiempo_total_redondeado = empleadoEnJson.tiempo_total_redondeado;
            empleado.total_minutos_redondeados = empleadoEnJson.total_minutos_redondeados;
            empleado.Minutos_trabajados = empleadoEnJson.Minutos_trabajados;
            empleado.Minutos_normales = empleadoEnJson.Minutos_normales;
            empleado.Minutos_extra = empleadoEnJson.Minutos_extra;
            empleado.sueldo_a_cobrar = empleadoEnJson.sueldo_a_cobrar;

            //    ASIGNAR DESCUENTO POR OLVIDOS AL jsonGlobal
            // Si existe el descuento calculado por olvidos, asignarlo al jsonGlobal
            if (empleado.checador_tabla_descuento !== undefined) {
                empleadoEnJson.checador = empleado.checador_tabla_descuento;
            }

            // Sincronizar con empleado para la tabla
            empleado.checador = empleadoEnJson.checador;
        }
    });
    setEmpleadosPaginados(window.empleadosOriginales);
}

// Función auxiliar para convertir hora (HH:MM) a minutos
function horaToMinutos(tiempo) {
    if (!tiempo || tiempo === "00:00") return 0;
    const [horas, minutos] = tiempo.split(':').map(Number);
    return (horas * 60) + minutos;
}

// Función para calcular y actualizar campos en cada empleado
function calcularCamposEmpleado(emp) {
    if (!window.rangosHorasJson) {

        return emp;
    }

    // Convierte tiempo_total_redondeado a minutos
    const tiempoTotal = emp.tiempo_total_redondeado || "00:00";
    const minutosTotales = horaToMinutos(tiempoTotal);

    // Si no hay minutos trabajados, retornar con sueldo base 0
    if (minutosTotales === 0) {
        emp.sueldo_base = 0;
        emp.sueldo_extra = 0;
        emp.Minutos_trabajados = 0;
        emp.Minutos_normales = 0;
        emp.Minutos_extra = 0;
        return emp;
    }

    let sueldoBase = 0;
    let sueldoFinal = 0;
    let minutosExtras = 0;
    let extra = 0;
    let rangoNormal = null;
    let rangoExtra = null;
    let maxMinutosNormales = 0;

    window.rangosHorasJson.forEach(rango => {
        if (rango.tipo === "hora_extra") {
            rangoExtra = rango;
        } else {
            if (rango.minutos > maxMinutosNormales) {
                maxMinutosNormales = rango.minutos;
            }
            if (minutosTotales <= rango.minutos && !rangoNormal) {
                rangoNormal = rango;
            }
        }
    });

    // CASO 1: Más de maxMinutosNormales (tiene horas extra)
    if (minutosTotales > maxMinutosNormales && rangoExtra) {
        minutosExtras = minutosTotales - maxMinutosNormales;
        extra = minutosExtras * rangoExtra.costo_por_minuto;
        const ultimoRango = window.rangosHorasJson.find(r => r.minutos === maxMinutosNormales);
        sueldoBase = ultimoRango ? ultimoRango.sueldo_base : 0;
        sueldoFinal = sueldoBase + extra;
    }
    // CASO 2: Dentro de cualquier rango normal (hasta 48 horas) - Asignar sueldo base del rango
    else if (rangoNormal) {
        sueldoBase = rangoNormal.sueldo_base;
        sueldoFinal = sueldoBase;
    }

    // Actualiza el objeto empleado
    emp.Minutos_trabajados = minutosTotales;
    emp.Minutos_normales = Math.min(minutosTotales, maxMinutosNormales);
    emp.Minutos_extra = minutosExtras;
    emp.sueldo_base = Number(sueldoBase.toFixed(2));
    emp.sueldo_extra = Number(extra.toFixed(2));

    //  CALCULAR SUELDO A COBRAR
    calcularSueldoACobraPorEmpleado(emp);

    return emp;
}

// Función para calcular sueldo a cobrar de un empleado específico
function calcularSueldoACobraPorEmpleado(emp) {
    // === CALCULAR TOTAL PERCEPCIONES ===
    const sueldoNeto = parseFloat(emp.sueldo_base) || 0;  // Sueldo Neto
    const incentivo = parseFloat(emp.incentivo) || 0;

    //   CALCULAR SUELDO EXTRA FINAL (horas extras + bonos + actividades + conceptos adicionales)
    const horasExtras = parseFloat(emp.sueldo_extra) || 0;
    const bonoAntiguedad = parseFloat(emp.bono_antiguedad) || 0;
    const actividadesEspeciales = parseFloat(emp.actividades_especiales) || 0;
    const bonoPuesto = parseFloat(emp.bono_puesto) || 0;

    // Sumar conceptos adicionales si existen
    let conceptosAdicionalesTotales = 0;
    if (emp.conceptos_adicionales && Array.isArray(emp.conceptos_adicionales)) {
        conceptosAdicionalesTotales = emp.conceptos_adicionales.reduce((total, concepto) => {
            return total + (parseFloat(concepto.valor) || 0);
        }, 0);
    }

    // Total de sueldo extra final
    const sueldoExtraFinal = horasExtras + bonoAntiguedad + actividadesEspeciales + bonoPuesto + conceptosAdicionalesTotales;

    // Actualizar sueldo_extra_final en el empleado
    emp.sueldo_extra_final = parseFloat(sueldoExtraFinal.toFixed(2));

    const totalPercepciones = sueldoNeto + incentivo + sueldoExtraFinal;

    // === CALCULAR TOTAL CONCEPTOS (ISR, IMSS, INFONAVIT) ===
    let totalConceptos = 0;
    const conceptos = emp.conceptos || [];
    conceptos.forEach(concepto => {
        if (['45', '52', '16'].includes(concepto.codigo)) { // ISR, IMSS, INFONAVIT
            totalConceptos += parseFloat(concepto.resultado) || 0;
        }
    });

    // === CALCULAR TOTAL DEDUCCIONES ===
    const tarjeta = parseFloat(emp.neto_pagar) || 0;  // TARJETA (campo neto_pagar)
    const prestamo = parseFloat(emp.prestamo) || 0;
    const inasistencias = parseFloat(emp.inasistencias_descuento) || 0;
    const uniformes = parseFloat(emp.uniformes) || 0;

    //    USAR EL DESCUENTO CALCULADO POR OLVIDOS DEL CHECADOR PARA EL SUELDO A COBRAR
    // Si existe el descuento calculado, usarlo; sino, usar el valor original del checador
    const checador = parseFloat(emp.checador) !== undefined && !isNaN(parseFloat(emp.checador)) ?
        parseFloat(emp.checador) :
        parseFloat(emp.checador) || 0;

    const faGafetCofia = parseFloat(emp.fa_gafet_cofia) || 0;

    // Total de deducciones incluye conceptos + otras deducciones
    const totalDeducciones = tarjeta + prestamo + inasistencias + uniformes + checador + faGafetCofia + totalConceptos;

    // === CALCULAR SUELDO A COBRAR ===
    emp.sueldo_a_cobrar = parseFloat((totalPercepciones - totalDeducciones).toFixed(2));

    return emp.sueldo_a_cobrar;
}

// Hacer la función disponible globalmente
window.calcularSueldoACobraPorEmpleado = calcularSueldoACobraPorEmpleado;

/*
 * ================================================================
 *                         TABLA DISPERSCIÓN
 * ================================================================
 */


// Función para cargar los departamentos en el filtro
function cargarDepartamentosFiltro() {
    $.ajax({
        type: "POST",
        url: ruta + "public/php/obtenerDepartamentos.php",

        success: function (response) {
            if (!response.error) {
                let departamentos = JSON.parse(response);
                // Opción para mostrar todos los departamentos
                let opciones = ``;
                opciones += `
                <option value="0">Todos</option>
                `;

                // Agrega cada departamento como opción en el select
                departamentos.forEach((element) => {
                    opciones += `
                    <option value="${element.id_departamento}">${element.nombre_departamento}</option>
                `;
                });

                // Llena el select con las opciones
                $("#filtro-departamento").html(opciones);
            }
        },


    });
}


// Función para obtener empleados por departamento al cambiar el filtro
function obtenerEmpleadosPorDepartamento() {
    $('#filtro-departamento').change(function () {
        let idSeleccionado = $(this).val();

        let empleadosPlanos = [];
        if (idSeleccionado == "0") {
            // Todos los empleados de todos los departamentos (orden y agrupación como el JSON)
            if (jsonGlobal && jsonGlobal.departamentos) {
                jsonGlobal.departamentos.forEach(depto => {
                    let empleadosOrdenados = (depto.empleados || []).slice().sort(compararPorApellidos);
                    empleadosOrdenados.forEach(emp => {
                        empleadosPlanos.push({
                            ...emp,
                            id_departamento: depto.nombre.split(' ')[0],
                            nombre_departamento: depto.nombre.replace(/^\d+\s*/, '')
                        });
                    });
                });
            }
        } else {
            // Solo empleados del departamento seleccionado
            if (jsonGlobal && jsonGlobal.departamentos) {
                // Busca por id_departamento (que es un número o string)
                let depto = jsonGlobal.departamentos.find(d =>
                    (d.id_departamento && String(d.id_departamento) === String(idSeleccionado)) ||
                    (d.nombre && d.nombre.split(' ')[0] === idSeleccionado)
                );
                if (depto && depto.empleados) {
                    let empleadosOrdenados = (depto.empleados || []).slice().sort(compararPorApellidos);
                    empleadosOrdenados.forEach(emp => {
                        empleadosPlanos.push({
                            ...emp,
                            id_departamento: depto.id_departamento || (depto.nombre ? depto.nombre.split(' ')[0] : ''),
                            nombre_departamento: depto.nombre_departamento || (depto.nombre ? depto.nombre.replace(/^\d+\s*/, '') : '')
                        });
                    });
                }
            }
        }

        //  FILTRAR SOLO EMPLEADOS REGISTRADOS EN BASE DE DATOS
        if (clavesValidasGlobal.length > 0) {
            const empleadosRegistrados = empleadosPlanos.filter(emp => {
                return clavesValidasGlobal.includes(String(emp.clave)) ||
                    clavesValidasGlobal.includes(Number(emp.clave));
            });


            window.empleadosOriginalesDispersion = empleadosRegistrados;
            setEmpleadosDispersionPaginados(empleadosRegistrados);
            empleadosFiltradosDispersion = [...empleadosRegistrados];
        } else {
            // Si no hay claves válidas cargadas, usar todos (fallback)
            window.empleadosOriginalesDispersion = empleadosPlanos;
            setEmpleadosDispersionPaginados(empleadosPlanos);
            empleadosFiltradosDispersion = [...empleadosPlanos];
        }
    });
}

// Función para obtener las claves de todos los empleados
function clavesEmpleados() {
    let claves = [];
    if (jsonGlobal && jsonGlobal.departamentos) {
        jsonGlobal.departamentos.forEach(depto => {
            (depto.empleados || []).forEach(emp => {
                if (emp.clave) {
                    claves.push(emp.clave);
                }
            });
        });
    }

    return claves;
}

function validarClaves() {
    // AJAX para validar claves directamente aquí
    let claves = clavesEmpleados();
    $.ajax({
        type: "POST",
        url: "../php/validar_clave.php",
        data: JSON.stringify({ claves: claves }),
        contentType: "application/json",
        success: function (clavesValidasJSON) {
            const clavesValidas = JSON.parse(clavesValidasJSON);

            //  GUARDAR CLAVES VÁLIDAS GLOBALMENTE
            clavesValidasGlobal = clavesValidas;

            //  HACER CLAVES DISPONIBLES PARA EL MODAL DE DISPERSIÓN
            if (typeof window.clavesValidasGlobal === 'undefined') {
                window.clavesValidasGlobal = clavesValidas;
            }


            // Obtener todos los empleados y filtrar solo los válidos
            let todosEmpleados = obtenerTodosEmpleadosDispersion();
            let empleadosValidos = todosEmpleados.filter(emp =>
                clavesValidas.includes(String(emp.clave)) || clavesValidas.includes(Number(emp.clave))
            );


            // Establecer empleados paginados para dispersión
            setEmpleadosDispersionPaginados(empleadosValidos);

            // ACTUALIZAR EL FILTRO PARA QUE MUESTRE "TODOS" PERO SOLO REGISTRADOS
            $('#filtro-departamento').val('0').trigger('change');

            // INICIALIZAR MENÚ CONTEXTUAL DE DISPERSIÓN DESPUÉS DE CARGAR CLAVES VÁLIDAS
            if (typeof inicializarMenuContextualDispersion === 'function') {
                inicializarMenuContextualDispersion();

            }
        },
        error: function (xhr, status, error) {

            // En caso de error, mostrar todos los empleados
            let todosEmpleados = obtenerTodosEmpleadosDispersion();
            setEmpleadosDispersionPaginados(todosEmpleados);
        }
    });
}

//  MODIFICAR FUNCIÓN PARA FILTRAR DESDE EL INICIO
function obtenerTodosEmpleadosDispersion() {
    let todosEmpleados = [];
    if (jsonGlobal && jsonGlobal.departamentos) {
        // Ordenar departamentos por nombre (alfabético)
        const departamentosOrdenados = jsonGlobal.departamentos.slice().sort((a, b) => {
            const nombreA = (a.nombre_departamento || a.nombre || '').toUpperCase();
            const nombreB = (b.nombre_departamento || b.nombre || '').toUpperCase();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        });

        departamentosOrdenados.forEach(depto => {
            if (depto.empleados) {
                // Ordenar empleados del departamento por apellido paterno (A-Z)
                depto.empleados = depto.empleados.slice().sort(compararPorApellidos);
                depto.empleados.forEach(emp => {
                    if (emp && emp.clave && emp.nombre) {
                        emp._nombre_departamento = depto.nombre_departamento || depto.nombre || '';
                        todosEmpleados.push(emp);
                    }
                });
            }
        });
    }

    //  NO ASIGNAR DIRECTAMENTE, DEJAR QUE LAS FUNCIONES DE FILTRADO LO HAGAN
    return todosEmpleados;
}



// Función para verificar si ya existe una nómina con el mismo número de semana
function verificarNominaExistente(numeroSemana, callback) {
    $.ajax({
        type: "POST",
        url: "../php/verificar_nomina.php",
        data: {
            accion: "verificar",
            numero_semana: numeroSemana
        },
        dataType: "json",
        success: function (response) {
            if (response.existe) {
                callback(true);
            } else {
                callback(false);
            }
        },
        error: function (xhr, status, error) {
            callback(false);
        }
    });
}

// Función para obtener el JSON de la base de datos
function obtenerNominaDeBaseDatos(numeroSemana, callback) {
    $.ajax({
        type: "POST",
        url: "../php/verificar_nomina.php",
        data: {
            accion: "obtener",
            numero_semana: numeroSemana
        },
        dataType: "json",
        success: function (response) {
            if (response.success && response.nomina) {
                callback(response.nomina);
            } else {
                callback(null);
            }
        },
        error: function (xhr, status, error) {
            callback(null);
        }
    });
}

// Función para verificar si existen horarios oficiales guardados
function verificarHorariosExistentes(numeroSemana, callback) {
    $.ajax({
        type: "POST",
        url: "../php/verificar_nomina.php",
        data: {
            accion: "verificar_horarios",
            numero_semana: numeroSemana
        },
        dataType: "json",
        success: function (response) {
            if (response.existe) {
                callback(true);
            } else {
                callback(false);
            }
        },
        error: function (xhr, status, error) {
            callback(false);
        }
    });
}

// Función para obtener horarios de la base de datos
function obtenerHorariosDeBD(numeroSemana, callback) {
    $.ajax({
        type: "POST",
        url: "../php/verificar_nomina.php",
        data: {
            accion: "obtener_horarios",
            numero_semana: numeroSemana
        },
        dataType: "json",
        success: function (response) {
            if (response.success && response.horarios) {
                callback(response.horarios);
            } else {
                callback(null);
            }
        },
        error: function (xhr, status, error) {
            callback(null);
        }
    });
}

// Función para establecer horarios (desde BD o por defecto)
function establecerHorariosSemanales(numeroSemana, callback) {
    // Primero verificar si existen horarios guardados para esta semana
    verificarHorariosExistentes(numeroSemana, function (existenHorarios) {
        if (existenHorarios) {
            // Obtener horarios de la base de datos
            obtenerHorariosDeBD(numeroSemana, function (horariosDB) {
                if (horariosDB) {
                    // Usar horarios de la base de datos
                    window.horariosSemanalesActualizados = horariosDB;
                } else {
                    // Si hay error, usar horarios por defecto con número de semana
                    establecerHorariosPorDefecto(numeroSemana);
                }
                if (callback) callback();
            });
        } else {
            // No existen horarios, usar los por defecto con número de semana
            establecerHorariosPorDefecto(numeroSemana);
            if (callback) callback();
        }
    });
}

// Función para establecer horarios por defecto con número de semana
function establecerHorariosPorDefecto(numeroSemana) {
    if (window.horariosSemanales) {
        window.horariosSemanalesActualizados = JSON.parse(JSON.stringify(window.horariosSemanales));
        // Agregar número de semana
        window.horariosSemanalesActualizados.numero_semana = numeroSemana;
    }
}


/*
 * ================================================================
 * MÓDULO DE NOMINA PARA QUE NO TIENEN SEGUROS
 * ================================================================
 * 
 * ================================================================
 */

function empleadosNoUnidos(json1, json2) {
    const normalizar = s => s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

    // Crear set de nombres normalizados de json1
    const nombresJson1 = new Set();
    if (json1 && json1.departamentos) {
        json1.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp1 => {
                    nombresJson1.add(normalizar(emp1.nombre));
                });
            }
        });
    }

    // Buscar empleados de json2 que NO están en json1
    const noUnidos = [];
    if (json2 && json2.empleados) {
        json2.empleados.forEach(emp2 => {
            const nombreOrdenado = ordenarNombre(emp2.nombre); // Reordenar el nombre
            if (!nombresJson1.has(normalizar(nombreOrdenado))) {
                noUnidos.push({
                    ...emp2,
                    nombre: nombreOrdenado // Actualizar el nombre con el orden correcto
                });
            }
        });
    }

    // validaEmpleadosEnServidor(noUnidos);
    console.log(noUnidos);

    return noUnidos;
}
function ordenarNombre(nombreCompleto) {
    // Dividir el nombre completo en partes
    const partes = nombreCompleto.trim().split(/\s+/);

    // Verificar que haya al menos 3 partes (Nombres, Apellido Paterno, Apellido Materno)
    if (partes.length < 3) {
        return nombreCompleto; // Si no hay suficientes partes, devolver el nombre original
    }

    // Las últimas dos partes son los apellidos y las primeras son los nombres
    const apellidoMaterno = partes.pop(); // Último elemento
    const apellidoPaterno = partes.pop(); // Penúltimo elemento
    const nombres = partes.join(' '); // El resto son los nombres

    // Retornar el nombre reordenado: Apellido Paterno + Apellido Materno + Nombres
    return `${apellidoPaterno} ${apellidoMaterno} ${nombres}`;
}

function obtenerIdBiometricoEmpleadosNoUnidos(json1, json2) {
    const normalizar = s => s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

    // Crear set de nombres normalizados de json1
    const nombresJson1 = new Set();
    if (json1 && json1.departamentos) {
        json1.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp1 => {
                    if (emp1.nombre) {
                        nombresJson1.add(normalizar(emp1.nombre));
                    }
                });
            }
        });
    }

    // Buscar empleados de json2 que NO están en json1 y obtener sus datos completos
    const empleadosNoUnidos = [];
    if (json2 && json2.empleados) {
        json2.empleados.forEach(emp2 => {
            if (!emp2) return;

            const nombreOrdenado = emp2.nombre ? ordenarNombre(emp2.nombre) : '';
            const nombreNormalizado = emp2.nombre ? normalizar(nombreOrdenado) : '';

            // Verificar si el empleado no está en json1 por nombre
            if (!nombresJson1.has(nombreNormalizado) && emp2.id_biometrico) {
                // Agregar el empleado completo al array de no unidos
                empleadosNoUnidos.push({
                    id_biometrico: emp2.id_biometrico,
                    nombre: emp2.nombre || '',
                    ap_paterno: emp2.ap_paterno || '',
                    ap_materno: emp2.ap_materno || '',
                    // Agregar otros campos relevantes que necesites
                    ...emp2 // Incluir todas las demás propiedades del empleado
                });
            }
        });
    }

    // Devolver tanto los IDs como los registros completos

    return {
        ids: empleadosNoUnidos.map(emp => emp.id_biometrico),
        empleados: empleadosNoUnidos
    };
}

function enviarIdBiometricosNoUnidos(json1, json2) {
    const { ids: idsBiometricos, empleados: empleadosNoUnidos } = obtenerIdBiometricoEmpleadosNoUnidos(json1, json2);


    if (idsBiometricos.length > 0) {
        $.ajax({
            type: "POST",
            url: "../php/validar_biometrico.php",
            data: JSON.stringify({ biometricos: idsBiometricos }),
            contentType: "application/json",
            success: function (response) {
                try {
                    const empleadosRegistrados = JSON.parse(response);

                    // Crear un nuevo departamento para empleados no unidos
                    if (empleadosRegistrados.length > 0 && jsonGlobal) {
                        // Verificar si ya existe el departamento de empleados no unidos
                        let deptoNoUnidos = jsonGlobal.departamentos.find(depto =>
                            depto.nombre && depto.nombre.includes("SIN SEGURO"));

                        // Si no existe, crearlo con el nombre correcto
                        if (!deptoNoUnidos) {
                            deptoNoUnidos = {
                                nombre: "SIN SEGURO",
                                empleados: []
                            };
                            jsonGlobal.departamentos.push(deptoNoUnidos);
                        } else {
                            // Limpiar empleados sin id_biometrico y duplicados existentes
                            const empleadosUnicos = [];
                            const idsBiometricosVistos = new Set();

                            deptoNoUnidos.empleados.forEach(emp => {
                                // Solo mantener empleados que tengan id_biometrico válido
                                if (emp.id_biometrico && emp.id_biometrico !== null && emp.id_biometrico !== undefined) {
                                    if (!idsBiometricosVistos.has(emp.id_biometrico)) {
                                        empleadosUnicos.push(emp);
                                        idsBiometricosVistos.add(emp.id_biometrico);
                                    } else {
                                    }
                                } else {
                                }
                            });

                            deptoNoUnidos.empleados = empleadosUnicos;
                        }


                        const empleadosConvertidos = empleadosRegistrados.map(emp => {
                            // Buscar el empleado correspondiente en empleadosNoUnidos para obtener registros y horas
                            // Comparar tanto string como número para evitar problemas de tipo
                            const empleadoNoUnido = empleadosNoUnidos.find(e =>
                                String(e.id_biometrico) === String(emp.biometrico)
                            );


                            return {
                                nombre: `${emp.ap_paterno} ${emp.ap_materno} ${emp.nombre}`,
                                clave: emp.clave_empleado,
                                id_biometrico: emp.biometrico,
                                // Valores por defecto para campos requeridos
                                incentivo: 0,
                                bono_antiguedad: 0,
                                actividades_especiales: 0,
                                bono_puesto: 0,
                                conceptos: [],
                                conceptos_adicionales: [],
                                sueldo_extra_final: 0,
                                prestamo: 0,
                                uniformes: 0,
                                checador: 0,
                                fa_gafet_cofia: 0,
                                inasistencias_minutos: 0,
                                inasistencias_descuento: 0,
                                sueldo_a_cobrar: 0,
                                // Asignar horas_totales y registros del empleado no unido
                                horas_totales: empleadoNoUnido?.horas_totales || "0.00",
                                registros: empleadoNoUnido?.registros || [],
                                tiempo_total: empleadoNoUnido?.tiempo_total || "00:00",
                                // Campos específicos para empleados no unidos
                                no_unido: true
                            };
                        });

                        // Agregar empleados al departamento (solo con id_biometrico válido)
                        empleadosConvertidos.forEach(empConvertido => {
                            // Solo procesar empleados que tengan id_biometrico válido
                            if (empConvertido.id_biometrico && empConvertido.id_biometrico !== null && empConvertido.id_biometrico !== undefined) {
                                // Verificar si el id_biometrico ya existe en el departamento
                                const existeBiometrico = deptoNoUnidos.empleados.some(emp =>
                                    emp.id_biometrico === empConvertido.id_biometrico
                                );

                                if (!existeBiometrico) {
                                    deptoNoUnidos.empleados.push(empConvertido);
                                    
                                    // Agregar empleado no unido a empleadosOriginales para que pase por redondeo
                                    window.empleadosOriginales.push(empConvertido);
                                }
                            }
                        });
                        
                        // Ejecutar redondeo de registros para empleados no unidos
                        if (empleadosConvertidos.length > 0) {
                             redondearRegistrosEmpleados(false, false); // No forzar recálculo, no es nómina nueva
                        }

                    } else {

                    }

                    // Aquí puedes manejar los datos recibidos, como mostrarlos en la interfaz
                } catch (error) {
                }
            },
            error: function (xhr, status, error) {
            }
        });
    } else {
    }
}



