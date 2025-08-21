jsonGlobal = null;
window.empleadosOriginales = [];
window.empleadosOriginalesDispersion = [];
const ruta = '/sistema_saao/';
// Variables para manejo de búsqueda y paginación
let empleadosFiltrados = [];
let timeoutBusqueda = null;
let empleadosFiltradosDispersion = [];
let timeoutBusquedaDispersion = null;

$(document).ready(function () {
    obtenerArchivos();
    $('#btn_horarios').click(function (e) {
        e.preventDefault();
        setDataTableHorarios(window.horariosSemanales);
        activarFormatoHora();
        actualizarHorariosSemanalesActualizados();

        // Inicializar totales después de cargar la tabla
        inicializarTotales();

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
                                console.log('JSON unido:', jsonUnido);
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
            if (depto.empleados) {
                depto.empleados.forEach(emp1 => {
                    const nombreNormalizado = normalizar(emp1.nombre);
                    if (empleados2Map[nombreNormalizado]) {
                        const emp2 = empleados2Map[nombreNormalizado];
                        emp1.horas_totales = emp2.horas_totales;
                        emp1.tiempo_total = emp2.tiempo_total;
                        emp1.registros = emp2.registros;
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
                    // Aplicar calcularCamposEmpleado para "Produccion 40 Libras"
                    // calcularCamposEmpleado(emp);

                    // Agregar incentivo solo para empleados de 40 libras
                    emp.incentivo = 250; // Inicializar incentivo en 250

                    // Agregar propiedades de deducciones solo para empleados de 40 libras
                    emp.prestamo = 0;
                    emp.uniformes = 0;
                    emp.checador = 0;
                    emp.fa_gafet_cofia = 0;
                    emp.inasistencias_horas = 0;
                    emp.inasistencias_descuento = 0;

                    empleadosPlanos.push({
                        ...emp,
                        id_departamento: depto.nombre.split(' ')[0],
                        nombre_departamento: depto.nombre.replace(/^\d+\s*/, '')
                    });
                });
            }
        });

    }
    window.empleadosOriginales = empleadosPlanos;
    empleadosFiltrados = [...empleadosPlanos]; // Inicializar empleados filtrados
    console.log('Empleados originales:', empleadosPlanos);


    setEmpleadosPaginados(empleadosPlanos);

    // Actualiza jsonGlobal con los empleados planos Y mantiene los demás departamentos
    actualizarJsonGlobalConEmpleadosOriginales();
    console.log('jsonGlobal actualizado:', jsonGlobal);

    //$("#filtro-departamento").removeAttr("hidden");
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


// Función para obtener las claves de empleados del departamento "PRODUCCION 40 LIBRAS"
function obtenerClavesEmpleados() {
    // Obtiene solo las claves de empleados del departamento "PRODUCCION 40 LIBRAS"
    let claves = [];
    if (jsonGlobal && jsonGlobal.departamentos) {
        jsonGlobal.departamentos.forEach(depto => {
            if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {
                (depto.empleados || []).forEach(emp => {
                    if (emp.clave) {
                        claves.push(emp.clave);
                    }
                });
            }
        });
    }

    return claves;
}

// Función para mostrar datos de la tabla con paginación
function mostrarDatosTablaPaginada(empleadosPagina) {
    // Obtener todas las claves de empleados del departamento "PRODUCCION 40 LIBRAS"
    let claves = obtenerClavesEmpleados();


    // Enviar todas las claves de "PRODUCCION 40 LIBRAS" en un request AJAX
    $.ajax({
        type: "POST",
        url: "../php/validar_clave.php",
        data: JSON.stringify({ claves: claves }),
        contentType: "application/json",
        success: function (clavesValidasJSON) {
            const clavesValidas = JSON.parse(clavesValidasJSON);
            let numeroFila = ((paginaActualNomina - 1) * empleadosPorPagina) + 1;
            $('#tabla-nomina-body').empty();

            // Renderizar solo los empleados de la página actual
            empleadosPagina.forEach(emp => {
                // Como empleadosPagina ya contiene solo empleados de "PRODUCCION 40 LIBRAS", 
                // solo verificamos que la clave sea válida
                if (clavesValidas.includes(String(emp.clave)) || clavesValidas.includes(Number(emp.clave))) {
                    // Obtener conceptos
                    const conceptos = emp.conceptos || [];
                    const getConcepto = (codigo) => {
                        const c = conceptos.find(c => c.codigo === codigo);
                        return c ? parseFloat(c.resultado).toFixed(2) : '';
                    };
                    const infonavit = getConcepto('16');
                    const isr = getConcepto('45');
                    const imss = getConcepto('52');

                    // Solo mostrar el nombre del departamento sin el número inicial
                    let nombreDepartamento = (emp.nombre_departamento || '').trim();

                    // Obtener el incentivo si existe
                    const incentivo = emp.incentivo ? emp.incentivo.toFixed(2) : '';

                    // Función para mostrar cadena vacía en lugar de 0, NaN o valores vacíos
                    const mostrarValor = (valor) => {
                        if (valor === 0 || valor === '0' || valor === '' || valor === null || valor === undefined || isNaN(valor)) {
                            return '';
                        }
                        return valor;
                    };

                    let fila = `
                        <tr data-clave="${emp.clave}">
                            <td>${numeroFila++}</td>
                            <td>${emp.nombre}</td>
                            <td>${nombreDepartamento}</td>
                            <td>${mostrarValor(emp.sueldo_base)}</td>
                            <td>${mostrarValor(incentivo)}</td>
                            <td>${mostrarValor(emp.sueldo_extra)}</td>
                            <td>${mostrarValor(emp.neto_pagar)}</td>
                            <td>${mostrarValor(emp.prestamo)}</td>
                            <td>${mostrarValor(emp.inasistencias_descuento)}</td>
                            <td>${mostrarValor(emp.uniformes)}</td>
                            <td>${mostrarValor(infonavit)}</td>
                            <td>${mostrarValor(isr)}</td>
                            <td>${mostrarValor(imss)}</td>
                            <td>${mostrarValor(emp.checador)}</td>
                            <td>${mostrarValor(emp.fa_gafet_cofia)}</td>
                            <td></td>
                        </tr>
                    `;
                    $('#tabla-nomina-body').append(fila);
                }
            });
        }
    });

    inicializarMenuContextual(); // Re-inicializar el menú contextual después de renderizar la tabla
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
            paginaActualNomina = 1;
            setEmpleadosPaginados(empleadosFiltrados);
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

function redondearRegistrosEmpleados() {
    window.horariosSemanalesActualizados = JSON.parse(JSON.stringify(window.horariosSemanales));

    if (!jsonGlobal || !jsonGlobal.departamentos || !window.horariosSemanalesActualizados || !window.empleadosOriginales) {
        return;
    }

    // Función para obtener día de la semana desde fecha
    function obtenerDiaSemana(fecha) {
        const [dia, mes, anio] = fecha.split('/');
        const fechaObj = new Date(anio, mes - 1, dia);
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        return dias[fechaObj.getDay()];
    }

    // Conversión hora ↔ minutos
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

    // Detectar entrada temprana / salida tardía
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
    
    // Nueva función para detectar llegada tardía después de comer
    function detectarLlegadaTardiaComer(horaReal, horaOficial) {
        const minutosReal = horaAMinutos(horaReal);
        const minutosOficial = horaAMinutos(horaOficial);
        if (minutosReal && minutosOficial && minutosReal > minutosOficial) {
            const diferencia = minutosReal - minutosOficial;
            // Tolerancia de 30 minutos
            return (diferencia > 30) ? diferencia : 0;
        }
        return 0;
    }

    // Redondeo por tipo
    function redondearHora(horaReal, horaOficial, tipo) {
        if (!horaReal || horaReal === "") return horaReal;
        const minutosReal = horaAMinutos(horaReal);
        const minutosOficial = horaAMinutos(horaOficial);
        if (!minutosOficial) return horaReal;

        switch (tipo) {
            case 'entrada':
                return minutosReal <= minutosOficial ? horaOficial : horaReal;
            case 'salidaComer':
                // Usar rango dinámico basado en la hora oficial de salida a comer
                const rangoMinSalidaComer = minutosOficial - 30; // 30 minutos antes
                const rangoMaxSalidaComer = minutosOficial + 15; // 15 minutos después
                if (minutosReal >= rangoMinSalidaComer && minutosReal <= rangoMaxSalidaComer) {
                    return horaOficial;
                }
                return horaReal;
            case 'entradaComer':
                // Usar rango dinámico basado en la hora oficial de entrada de comer
                const rangoMinEntradaComer = minutosOficial - 30; // 30 minutos antes
                const rangoMaxEntradaComer = minutosOficial + 15; // 15 minutos después
                if (minutosReal >= rangoMinEntradaComer && minutosReal <= rangoMaxEntradaComer) {
                    return horaOficial;
                }
                return horaReal;
            case 'salida':
                // Si sale dentro del rango ±50 minutos después, redondear a oficial
                if (minutosReal >= minutosOficial && minutosReal <= minutosOficial + 50) {
                    return horaOficial;
                }
                // Si sale muy tarde (más de 50 minutos después), también redondear a oficial
                if (minutosReal > minutosOficial + 50) {
                    return horaOficial;
                }
                // Si sale antes pero dentro de 15 minutos de tolerancia, redondear a oficial
                if (minutosReal >= minutosOficial - 15 && minutosReal < minutosOficial) {
                    return horaOficial;
                }
                // Si sale más de 15 minutos antes, mantener hora real
                return horaReal;
            default:
                return horaReal;
        }
    }

    // Calcular tiempo trabajado
    function calcularTiempoTrabajado(registrosDia, horarioOficial) {
        if (!registrosDia || registrosDia.length === 0) return 0;
        
        // Buscar primera entrada válida y última salida válida
        let primeraEntrada = null;
        let ultimaSalida = null;
        
        // Buscar primera entrada diferente de "00:00"
        for (let registro of registrosDia) {
            if (registro.entrada && registro.entrada !== "00:00") {
                primeraEntrada = horaAMinutos(registro.entrada);
                break;
            }
        }
        
        // Buscar última salida diferente de "00:00"
        for (let i = registrosDia.length - 1; i >= 0; i--) {
            const registro = registrosDia[i];
            if (registro.salida && registro.salida !== "00:00") {
                ultimaSalida = horaAMinutos(registro.salida);
                break;
            }
        }
        
        // Si tenemos entrada y salida válidas, calcular diferencia
        let totalMinutos = 0;
        if (primeraEntrada !== null && ultimaSalida !== null) {
            totalMinutos = ultimaSalida - primeraEntrada;
        }

        // Descontar tiempo de comida solo si está definido y es diferente de 00:00
        if (horarioOficial && horarioOficial.horasComida && horarioOficial.horasComida !== "00:00") {
            const minutosComida = horaAMinutos(horarioOficial.horasComida);
            if (minutosComida) {
                totalMinutos -= minutosComida;
            }
        }
        
        return Math.max(0, totalMinutos);
    }

    // Nueva función para detectar olvidos del checador
    function detectarOlvidosChecador(registrosDia, horarioOficial) {
        const olvidos = [];
        
        // Para horarios completos (con comida)
        const tieneHorarioCompleto = 
            horarioOficial.entrada !== "00:00" &&
            horarioOficial.salidaComida !== "00:00" &&
            horarioOficial.entradaComida !== "00:00" &&
            horarioOficial.salida !== "00:00";
            
        if (tieneHorarioCompleto) {
            // Verificar los 4 registros esperados
            if (registrosDia.length < 2) {
                olvidos.push("Faltan registros completos");
                return olvidos;
            }
            
            // Verificar entrada
            if (!registrosDia[0] || !registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                olvidos.push("Entrada");
            }
            
            // Verificar salida a comer
            if (!registrosDia[0] || !registrosDia[0].salida || registrosDia[0].salida === "00:00") {
                olvidos.push("Salir a comer");
            }
            
            // Verificar regreso de comer
            if (!registrosDia[1] || !registrosDia[1].entrada || registrosDia[1].entrada === "00:00") {
                olvidos.push("Regreso de comer");
            }
            
            // Verificar salida final
            if (!registrosDia[1] || !registrosDia[1].salida || registrosDia[1].salida === "00:00") {
                olvidos.push("Salida final");
            }
        } else {
            // Para horarios simples (sin comida) - solo verificar entrada y salida
            const tieneEntradaSalida = 
                horarioOficial.entrada !== "00:00" && 
                horarioOficial.salida !== "00:00";
                
            if (tieneEntradaSalida) {
                if (registrosDia.length === 0) {
                    olvidos.push("Entrada y Salida");
                    return olvidos;
                }
                
                // Verificar entrada
                if (!registrosDia[0] || !registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                    olvidos.push("Entrada");
                }
                
                // Verificar salida
                const ultimoRegistro = registrosDia[registrosDia.length - 1];
                if (!ultimoRegistro || !ultimoRegistro.salida || ultimoRegistro.salida === "00:00") {
                    olvidos.push("Salida");
                }
            }
        }
        
        return olvidos;
    }

    // Nueva función para completar registros faltantes con horarios oficiales
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
            // Asegurar que hay 2 registros para horario completo
            while (registrosDia.length < 2) {
                registrosDia.push({ entrada: "00:00", salida: "00:00" });
            }

            // Completar entrada si está vacía
            if (!registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                registrosDia[0].entrada = horarioOficial.entrada;
            }

            // Completar salida a comer si está vacía
            if (!registrosDia[0].salida || registrosDia[0].salida === "00:00") {
                registrosDia[0].salida = horarioOficial.salidaComida;
            }

            // Completar regreso de comer si está vacío
            if (!registrosDia[1].entrada || registrosDia[1].entrada === "00:00") {
                registrosDia[1].entrada = horarioOficial.entradaComida;
            }

            // Completar salida final si está vacía
            if (!registrosDia[1].salida || registrosDia[1].salida === "00:00") {
                registrosDia[1].salida = horarioOficial.salida;
            }

        } else if (tieneEntradaSalida) {
            // Asegurar que hay al menos 1 registro para horario simple
            if (registrosDia.length === 0) {
                registrosDia.push({ entrada: "00:00", salida: "00:00" });
            }

            // Completar entrada si está vacía
            if (!registrosDia[0].entrada || registrosDia[0].entrada === "00:00") {
                registrosDia[0].entrada = horarioOficial.entrada;
            }

            // Para horarios simples, determinar si necesita más registros
            if (registrosDia.length === 1) {
                // Si solo hay un registro, completar la salida
                if (!registrosDia[0].salida || registrosDia[0].salida === "00:00") {
                    registrosDia[0].salida = horarioOficial.salida;
                }
            } else {
                // Si hay múltiples registros, poner salida en el último
                const ultimoIndex = registrosDia.length - 1;
                if (!registrosDia[ultimoIndex].salida || registrosDia[ultimoIndex].salida === "00:00") {
                    registrosDia[ultimoIndex].salida = horarioOficial.salida;
                }
            }
        }

        return registrosDia;
    }

    // Procesar empleados
    window.empleadosOriginales.forEach(empleado => {
        console.log(`\n=== EMPLEADO: ${empleado.nombre} (Clave: ${empleado.clave}) ===`);
        
        const registrosPorFecha = {};
        let totalMinutosSemana = 0; // Variable para acumular minutos de toda la semana
        
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

            const registrosDia = registrosPorFecha[fecha];
            console.log(`\nFECHA: ${fecha} (${diaSemana.toUpperCase()})`);
            
            // Mostrar registros ORIGINALES
            console.log('Registros ORIGINALES:');
            registrosDia.forEach((reg, i) => {
                console.log(`  ${i + 1}. Entrada: ${reg.entrada} | Salida: ${reg.salida}`);
            });
            
            // Crear copia para comparar
            const registrosOriginales = JSON.parse(JSON.stringify(registrosDia));
            
            const tieneHorarioCompleto =
                horarioOficial.entrada !== "00:00" &&
                horarioOficial.salidaComida !== "00:00" &&
                horarioOficial.entradaComida !== "00:00" &&
                horarioOficial.salida !== "00:00";

            const tieneEntradaSalida =
                horarioOficial.entrada !== "00:00" &&
                horarioOficial.salida !== "00:00" &&
                (horarioOficial.salidaComida === "00:00" || horarioOficial.entradaComida === "00:00");

            // Detectar olvidos del checador ANTES del redondeo
            const olvidosChecador = detectarOlvidosChecador(registrosDia, horarioOficial);

            // Completar registros faltantes con horarios oficiales
            completarRegistrosFaltantes(registrosDia, horarioOficial);

            // Detectar entrada temprana y salida tardía ANTES del redondeo
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
            
            // Detectar llegada tardía después de comer (solo para horarios completos)
            if (tieneHorarioCompleto && registrosDia.length >= 2 && horarioOficial.entradaComida !== "00:00") {
                llegadaTardiaComer = detectarLlegadaTardiaComer(registrosDia[1].entrada, horarioOficial.entradaComida);
            }

            // Aplicar redondeo
            if (tieneHorarioCompleto && registrosDia.length >= 2) {
                // Para horario completo, esperamos al menos 2 registros
                // Registro 1: entrada + salida a comer
                registrosDia[0].entrada = redondearHora(registrosDia[0].entrada, horarioOficial.entrada, 'entrada');
                registrosDia[0].salida = redondearHora(registrosDia[0].salida, horarioOficial.salidaComida, 'salidaComer');
                
                // Registro 2: entrada de comer + salida final
                registrosDia[1].entrada = redondearHora(registrosDia[1].entrada, horarioOficial.entradaComida, 'entradaComer');
                registrosDia[1].salida = redondearHora(registrosDia[1].salida, horarioOficial.salida, 'salida');
                
                // Limpiar registros adicionales si los hay (poner en 00:00)
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

            // Mostrar registros REDONDEADOS
            console.log('Registros REDONDEADOS:');
            registrosDia.forEach((reg, i) => {
                const entradaLabel = i === 0 ? 'Entrada' : i === 1 ? 'Regreso Comer' : 'Entrada';
                const salidaLabel = i === 0 ? 'Salir Comer' : i === 1 ? 'Salida' : 'Salida';
                console.log(`  ${i + 1}. ${entradaLabel}: ${reg.entrada} | ${salidaLabel}: ${reg.salida}`);
            });

            // Calcular tiempo trabajado
            const minutosTrabajados = calcularTiempoTrabajado(registrosDia, horarioOficial);
            const horasTrabajadas = minutosAHora(minutosTrabajados);
            console.log(`Tiempo total trabajado: ${horasTrabajadas} (${minutosTrabajados} minutos)`);

            // Acumular minutos para el total semanal
            totalMinutosSemana += minutosTrabajados;

            // Mostrar hora de comida si existe
            if (horarioOficial && horarioOficial.horasComida && horarioOficial.horasComida !== "00:00") {
                console.log(`Hora de comida: ${horarioOficial.horasComida}`);
            }

            // Mostrar entrada temprana si existe
            if (entradaTemprana > 0) {
                console.log(`Entrada temprana: ${minutosAHora(entradaTemprana)}`);
            }

            // Mostrar salida tardía si existe
            if (salidaTardia > 0) {
                console.log(`Salida tardía: ${minutosAHora(salidaTardia)}`);
            }
            
            // Mostrar llegada tardía después de comer si existe
            if (llegadaTardiaComer > 0) {
                console.log(`Llegada tardía después de comer: ${minutosAHora(llegadaTardiaComer)} (se perdieron ${minutosAHora(llegadaTardiaComer)} de trabajo)`);
            }
            
            // Mostrar olvidos del checador si existen
            if (olvidosChecador.length > 0) {
                console.log(`⚠️ OLVIDOS DEL CHECADOR: ${olvidosChecador.join(', ')}`);
            }
            
            console.log('─'.repeat(50));
        });
        
        // Mostrar totales semanales al final de cada empleado
        const horasSemanales = minutosAHora(totalMinutosSemana);
        console.log(`\n🕒 TOTAL SEMANAL: ${horasSemanales} (${totalMinutosSemana} minutos)`);
        console.log('═'.repeat(60));
    });

    console.log('\n=== REDONDEO COMPLETADO ===');
}
