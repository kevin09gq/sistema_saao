jsonGlobal = null;
window.empleadosOriginales = [];
// Variables para manejo de búsqueda y paginación
let empleadosFiltrados = [];
let timeoutBusqueda = null;

$(document).ready(function () {
    obtenerArchivos();
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

                                    establecerDatosEmpleados();
                                    actualizarCabeceraNomina(jsonGlobal);



                                    $("#tabla-nomina-responsive").removeAttr("hidden");
                                    $("#container-nomina").attr("hidden", true);

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

    inicializarMenuContextual();
});


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
                    calcularCamposEmpleado(emp);
                    
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

    setEmpleadosPaginados(empleadosPlanos);

    // Actualiza jsonGlobal con los empleados planos Y mantiene los demás departamentos
    actualizarJsonGlobalConEmpleadosOriginales();
    console.log('jsonGlobal actualizado:', jsonGlobal);

    //$("#filtro-departamento").removeAttr("hidden");
    $("#busqueda-container").removeAttr("hidden");
}


// Función para calcular y actualizar campos en cada empleado
function calcularCamposEmpleado(emp) {
    if (!window.rangosHorasJson) {

        return;
    }
    // Convierte tiempo_total a minutos
    const tiempoTotal = emp.tiempo_total || "00:00";
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


    return emp;
}

// Utilidad para convertir "hh:mm" a minutos
function horaToMinutos(hora) {
    if (!hora || hora.indexOf(':') === -1) return 0;
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

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


// Función para manejar la búsqueda en la tabla
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

