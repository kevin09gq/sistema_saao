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
    });
}

$(document).ready(function () {
    obtenerArchivos();
    configTablas();
    window.horariosSemanalesActualizados = JSON.parse(JSON.stringify(window.horariosSemanales));
    $('#btn_horarios').click(function (e) {
        e.preventDefault();
        setDataTableHorarios(window.horariosSemanalesActualizados);
        activarFormatoHora();
        actualizarHorariosSemanalesActualizados();

        // Calcular minutos para cada fila inmediatamente después de cargar
        setTimeout(function() {
            $(".tabla-horarios tbody tr").each(function () {
                calcularMinutosTotales($(this));
            });
            calcularTotalesSemana();
        }, 100);

    });
});

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
                                jsonGlobal = jsonUnido; // Guardar en variable global
                                actualizarCabeceraNomina(jsonUnido);

                                $("#tabla-nomina-responsive").removeAttr("hidden");
                                $("#container-nomina").attr("hidden", true);
                                establecerDatosEmpleados(); // Llama a la función para establecer los datos de empleados
                                busquedaNomina();
                                redondearRegistrosEmpleados(); // Nueva función para redondear registros

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
        // Ejemplo: "21/Jun/2025" o "21/05/2025"
        const partes = fecha.split('/');
        let dia = partes[0];
        let mes = partes[1];
        let anio = partes[2];

        // Si el mes es numérico, conviértelo a nombre
        if (/^\\d+$/.test(mes)) {
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
                    // Agregar incentivo solo para empleados de 40 libras
                    emp.incentivo = 250;

                    //   INICIALIZAR BONO DE ANTIGÜEDAD
                    emp.bono_antiguedad = 0;

                    //   INICIALIZAR ACTIVIDADES ESPECIALES
                    emp.actividades_especiales = 0;

                    //   INICIALIZAR BONO RESPONSABILIDAD
                    emp.bono_responsabilidad = 0;

                    //   INICIALIZAR CONCEPTOS ADICIONALES
                    emp.conceptos_adicionales = [];

                    //   INICIALIZAR SUELDO EXTRA FINAL con el valor de sueldo_extra (horas extras)
                    emp.sueldo_extra_final = emp.sueldo_extra || 0;

                    // Agregar propiedades de deducciones solo para empleados de 40 libras
                    emp.prestamo = 0;
                    emp.uniformes = 0;
                    emp.checador = 0;
                    emp.fa_gafet_cofia = 0;
                    emp.inasistencias_minutos = 0;
                    emp.inasistencias_descuento = 0;

                    //   INICIALIZAR SUELDO A COBRAR
                    emp.sueldo_a_cobrar = 0;

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




function redondearRegistrosEmpleados() {
    if (!jsonGlobal || !jsonGlobal.departamentos || !window.horariosSemanalesActualizados || !window.empleadosOriginales) {
        return;
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
                return minutosReal <= minutosOficial ? horaOficial : horaReal;
            case 'salidaComer':
                const rangoMinSalidaComer = minutosOficial - 30;
                const rangoMaxSalidaComer = minutosOficial + 15;
                if (minutosReal >= rangoMinSalidaComer && minutosReal <= rangoMaxSalidaComer) {
                    return horaOficial;
                }
                return horaReal;
            case 'entradaComer':
                const rangoMinEntradaComer = minutosOficial - 30;
                const rangoMaxEntradaComer = minutosOficial + 15;
                if (minutosReal >= rangoMinEntradaComer && minutosReal <= rangoMaxEntradaComer) {
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
                if (minutosReal >= minutosOficial - 15 && minutosReal < minutosOficial) {
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
        const empleadoEnJson = encontrarEmpleadoEnJsonGlobal(empleado.clave);
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
            empleadoEnJson.tiempo_total_redondeado = minutosAHora(totalMinutosSemana);
            empleadoEnJson.total_minutos_redondeados = totalMinutosSemana;
            empleadoEnJson.registros_redondeados = registrosRedondeados;
            
            //    APLICAR DESCUENTO POR OLVIDOS DEL CHECADOR
            // Calcular descuento: $20 por cada día que olvidó checar
            const descuentoPorOlvido = totalOlvidosChecadorSemana * 20;
            
            // Asignar al empleadoEnJson para que se incluya en el cálculo del sueldo a cobrar
            empleadoEnJson.checador_descuento_olvidos = descuentoPorOlvido;
        }

        const horasSemanales = minutosAHora(totalMinutosSemana);
        
        // Asignar directamente al empleado para mostrar en la tabla
        const descuentoPorOlvido = totalOlvidosChecadorSemana * 20;
        empleado.checador_tabla_descuento = descuentoPorOlvido;
    });

    function encontrarEmpleadoEnJsonGlobal(clave) {
        if (!jsonGlobal || !jsonGlobal.departamentos) return null;
        for (let depto of jsonGlobal.departamentos) {
            if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
                for (let emp of depto.empleados || []) {
                    if (emp.clave === clave) {
                        return emp;
                    }
                }
            }
        }
        return null;
    }

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
    // CASO 2: Igual al rango exacto → sueldo base
    else if (rangoNormal && minutosTotales === rangoNormal.minutos) {
        sueldoBase = rangoNormal.sueldo_base;
        sueldoFinal = sueldoBase;
    }
    // CASO 3: Menor al rango → costo por minuto
    else if (rangoNormal && minutosTotales < rangoNormal.minutos) {
        sueldoBase = minutosTotales * rangoNormal.costo_por_minuto;
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
    const bonoResponsabilidad = parseFloat(emp.bono_responsabilidad) || 0;

    // Sumar conceptos adicionales si existen
    let conceptosAdicionalesTotales = 0;
    if (emp.conceptos_adicionales && Array.isArray(emp.conceptos_adicionales)) {
        conceptosAdicionalesTotales = emp.conceptos_adicionales.reduce((total, concepto) => {
            return total + (parseFloat(concepto.valor) || 0);
        }, 0);
    }

    // Total de sueldo extra final
    const sueldoExtraFinal = horasExtras + bonoAntiguedad + actividadesEspeciales + bonoResponsabilidad + conceptosAdicionalesTotales;

    // Actualizar sueldo_extra_final en el empleado
    emp.sueldo_extra_final = sueldoExtraFinal;

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
    const checador = parseFloat(emp.checador_descuento_olvidos) !== undefined && !isNaN(parseFloat(emp.checador_descuento_olvidos)) ? 
                     parseFloat(emp.checador_descuento_olvidos) : 
                     parseFloat(emp.checador) || 0;
                     
    const faGafetCofia = parseFloat(emp.fa_gafet_cofia) || 0;

    // Total de deducciones incluye conceptos + otras deducciones
    const totalDeducciones = tarjeta + prestamo + inasistencias + uniformes + checador + faGafetCofia + totalConceptos;

    // === CALCULAR SUELDO A COBRAR ===
    emp.sueldo_a_cobrar = totalPercepciones - totalDeducciones;



    return emp.sueldo_a_cobrar;
}



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

        // 🆕 FILTRAR SOLO EMPLEADOS REGISTRADOS EN BASE DE DATOS
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
            
            // 🆕 GUARDAR CLAVES VÁLIDAS GLOBALMENTE
            clavesValidasGlobal = clavesValidas;
           
            // Obtener todos los empleados y filtrar solo los válidos
            let todosEmpleados = obtenerTodosEmpleadosDispersion();
            let empleadosValidos = todosEmpleados.filter(emp =>
                clavesValidas.includes(String(emp.clave)) || clavesValidas.includes(Number(emp.clave))
            );

            // Establecer empleados paginados para dispersión
            setEmpleadosDispersionPaginados(empleadosValidos);
            
            // 🆕 ACTUALIZAR EL FILTRO PARA QUE MUESTRE "TODOS" PERO SOLO REGISTRADOS
            $('#filtro-departamento').val('0').trigger('change');
        },
        error: function(xhr, status, error) {
           // En caso de error, mostrar todos los empleados
            let todosEmpleados = obtenerTodosEmpleadosDispersion();
            setEmpleadosDispersionPaginados(todosEmpleados);
        }
    });
}

// 🆕 MODIFICAR FUNCIÓN PARA FILTRAR DESDE EL INICIO
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

    // 🆕 NO ASIGNAR DIRECTAMENTE, DEJAR QUE LAS FUNCIONES DE FILTRADO LO HAGAN
    return todosEmpleados;
}
