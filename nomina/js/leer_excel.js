jsonGlobal = null; // Variable global para almacenar el JSON unido

$(document).ready(function () {
    obtenerArchivos();
    

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
                                    console.log('JSON unido:', jsonUnido);
                                    // Llamar a la función para mostrar los datos


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
         mostrarDatos(jsonGlobal);
    });
    
 
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








