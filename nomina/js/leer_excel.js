jsonGlobal = null; // Variable global para almacenar el JSON unido
window.empleadosOriginales = [];

$(document).ready(function () {
    obtenerArchivos();
    cargarDepartamentos();
    filtroDepartamento();

 
    // Función para obtener los archivos y procesarlos
    function obtenerArchivos(params) {
        // Verificar que los elementos existen antes de usarlos
        if ($('#btn_procesar_ambos').length === 0) {
            console.warn('Elemento #btn_procesar_ambos no encontrado');
            return;
        }

        $('#btn_procesar_ambos').on('click', function (e) {
            e.preventDefault();

            // Verificar que el formulario existe
            var $form = $('#form_excel');
            if ($form.length === 0) {
                alert('Formulario no encontrado.');
                return;
            }

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
                                    actualizarCabeceraNomina(jsonGlobal); // <-- Agrega esto
                                    console.log('JSON unido:', jsonUnido);

                                    $("#tabla-nomina-responsive").removeAttr("hidden");
                                    $("#container-nomina").attr("hidden", true);

                                    /*
                                    // Guardar el JSON unido en info_nomina.json
                                    $.ajax({
                                        url: '../php/guardar_info_nomina.php',
                                        type: 'POST',
                                        data: JSON.stringify(jsonUnido),
                                        contentType: 'application/json',
                                        success: function (res) {
                                            console.log('JSON guardado en info_nomina.json:', res);
                                        },
                                      
                                    });
                                   
                                    */


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


    // Evento para mostrar todos los datos en la tabla
    $("#btn_mostrar_todos").click(function (e) {
        e.preventDefault();
        // Convierte el JSON global a un array plano de empleados, agrupados y ordenados por el orden del JSON y por apellidos dentro de cada departamento
        let empleadosPlanos = [];
        if (jsonGlobal && jsonGlobal.departamentos) {
            jsonGlobal.departamentos.forEach(depto => {
                // Ordena los empleados del departamento por apellidos
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
        window.empleadosOriginales = empleadosPlanos; // Guarda el array base actual
        setEmpleadosPaginados(empleadosPlanos); // Inicializa la paginación
        $("#filtro-departamento").removeAttr("hidden");
        $("#busqueda-container").removeAttr("hidden");
    });

    // Evento de búsqueda por nombre o clave
    $('#campo-busqueda').on('input', function () {
        const texto = $(this).val().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        console.log("Empleados base para filtrar:", window.empleadosOriginales); // <-- Depuración
        if (texto === "") {
            setEmpleadosPaginados(window.empleadosOriginales);
            return;
        }
        const filtrados = window.empleadosOriginales.filter(emp => {
            // Usa el campo correcto según tu estructura de datos
            const nombre = (emp.nombre || emp.nombre_completo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const clave = String(emp.clave || emp.clave_empleado || '').toLowerCase();
            return nombre.includes(texto) || clave.includes(texto);
        });
        console.log("Filtrados:", filtrados); // <-- Depuración
        setEmpleadosPaginados(filtrados);
    });

    inicializarMenuContextual();
});

// Función para descomponer el nombre en apellido paterno, materno y nombres
function descomponerNombre(nombreCompleto) {
    const partes = nombreCompleto.trim().toUpperCase().split(/\s+/);
    return [
        partes[0] || '', // Apellido paterno
        partes[1] || '', // Apellido materno
        partes.slice(2).join(' ') || '' // Nombre(s)
    ];
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

// Función para validar claves y llenar la tabla
function mostrarDatos(jsonUnido) {
    $('#tabla-nomina-body').empty();

    if (!jsonUnido || !jsonUnido.departamentos) return;

    let claves = [];

    // Reunir todas las claves para validar en lote
    jsonUnido.departamentos.forEach(depto => {
        if (depto.empleados) {
            depto.empleados.forEach(emp => {
                if (emp.clave) {
                    claves.push(parseInt(emp.clave));
                }
            });
        }
    });

    // Enviar todas las claves en un solo request
    $.ajax({
        type: "POST",
        url: "../php/validar_clave.php",
        data: JSON.stringify({ claves: claves }),
        contentType: "application/json",
        success: function (clavesValidasJSON) {
            const clavesValidas = JSON.parse(clavesValidasJSON);
            let numeroFila = 1;

            jsonUnido.departamentos.forEach(depto => {
                if (depto.empleados) {
                    // Ordenar empleados correctamente
                    depto.empleados.sort(compararPorApellidos);

                    depto.empleados.forEach(emp => {
                        if (clavesValidas.includes(parseInt(emp.clave))) {

                            // Obtener conceptos
                            const conceptos = emp.conceptos || [];
                            const getConcepto = (codigo) => {
                                const c = conceptos.find(c => c.codigo === codigo);
                                return c ? parseFloat(c.resultado).toFixed(2) : '';
                            };

                            const infonavit = getConcepto('16');
                            const isr = getConcepto('45');
                            const imss = getConcepto('52');

                            let fila = `
                                <tr>
                                    <td>${numeroFila++}</td>
                                    <td>${emp.nombre}</td>
                                    <td>${depto.nombre.replace(/^\d+\s*/, '')}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td>${emp.neto_pagar ?? ''}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td>${infonavit}</td>
                                    <td>${isr}</td>
                                    <td>${imss}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            `;
                            $('#tabla-nomina-body').append(fila);
                        }
                    });
                }
            });
        }
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

function cargarDepartamentos() {
    $.ajax({
        type: "GET",
        url: rutaPlugins + "public/php/obtenerDepartamentos.php",
        success: function (response) {
            let departamentos = JSON.parse(response);
            // Opción para mostrar todos los departamentos
            let opciones = `<option value="0">Todos</option>`;

            // Agrega cada departamento como opción en el select
            departamentos.forEach((element) => {
                opciones += `
                    <option value="${element.id_departamento}">${element.nombre_departamento}</option>
                `;
            });

            // Llena el select con las opciones
            $("#filtro-departamento").html(opciones);
        },
        error: function () {
            console.error("Error al cargar departamentos");
        }
    });
}

function filtroDepartamento() {
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
                let depto = jsonGlobal.departamentos.find(d => d.nombre.split(' ')[0] === idSeleccionado);
                if (depto && depto.empleados) {
                    let empleadosOrdenados = (depto.empleados || []).slice().sort(compararPorApellidos);
                    empleadosOrdenados.forEach(emp => {
                        empleadosPlanos.push({
                            ...emp,
                            id_departamento: idSeleccionado,
                            nombre_departamento: depto.nombre.replace(/^\d+\s*/, '')
                        });
                    });
                }
            }
        }
        window.empleadosOriginales = empleadosPlanos; // Guarda el array base actual
        setEmpleadosPaginados(empleadosPlanos); // Esto actualiza la paginación y la tabla
    });
}

// Función global para renderizar la tabla de nómina con los empleados de la página actual
function renderEmpleadosTabla(empleadosPagina, inicio) {

    let numeroFila = inicio + 1;

    // 1. Junta las claves de los empleados de la página actual
    let claves = empleadosPagina.map(emp => parseInt(emp.clave));

    // 2. Valida las claves antes de mostrar
    $.ajax({
        type: "POST",
        url: "../php/validar_clave.php",
        data: JSON.stringify({ claves: claves }),
        contentType: "application/json",
        success: function (clavesValidasJSON) {
            const clavesValidas = JSON.parse(clavesValidasJSON);
            $('#tabla-nomina-body').empty();

            empleadosPagina.forEach(emp => {
                if (clavesValidas.includes(parseInt(emp.clave))) {
                    // Obtener conceptos
                    const conceptos = emp.conceptos || [];
                    const getConcepto = (codigo) => {
                        const c = conceptos.find(c => c.codigo === codigo);
                        return c ? parseFloat(c.resultado).toFixed(2) : '';
                    };
                    const infonavit = getConcepto('16');
                    const isr = getConcepto('45');
                    const imss = getConcepto('52');
                    let fila = `
                        <tr data-clave="${emp.clave}">
                            <td>${numeroFila++}</td>
                            <td>${emp.nombre}</td>
                            <td>${emp.nombre_departamento}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>${emp.neto_pagar ?? ''}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>${infonavit}</td>
                            <td>${isr}</td>
                            <td>${imss}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    `;
                    $('#tabla-nomina-body').append(fila);
                }
            });
        }
    });
}
window.renderEmpleadosTabla = renderEmpleadosTabla;

function inicializarMenuContextual() {
    // Mostrar menú contextual al hacer clic derecho en una fila
    $(document).on('contextmenu', '#tabla-nomina-body tr', function (e) {
        e.preventDefault();
        const clave = $(this).data('clave');
        buscarDatos(clave); // Llama a la función para establecer datos en el modal

        $('#menu-contextual')
            .css({ left: e.pageX, top: e.pageY })
            .removeAttr('hidden');
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

