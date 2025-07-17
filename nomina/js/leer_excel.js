$(document).ready(function () {
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
                                const jsonUnido = mergeEmpleados(json1, json2);
                                console.log('JSON unido:', jsonUnido);
                                validarClaveJson(jsonUnido);
                            } catch (e) {
                                console.error('No es un JSON válido (Excel 2):', res2);
                                alert('Error al procesar el segundo archivo Excel.');
                            } finally {
                                $('#btn_procesar_ambos').removeClass('loading').prop('disabled', false);
                            }
                        },
                        error: function (err2) {
                            console.error('Error al leer el archivo Excel 2:', err2);
                            alert('Error al procesar el segundo archivo Excel.');
                            $('#btn_procesar_ambos').removeClass('loading').prop('disabled', false);
                        }
                    });

                } catch (e) {
                    console.error('No es un JSON válido (Excel 1):', res1);
                    alert('Error al procesar el primer archivo Excel.');
                    $('#btn_procesar_ambos').removeClass('loading').prop('disabled', false);
                }
            },
            error: function (err1) {
                console.error('Error al leer el archivo Excel 1:', err1);
                alert('Error al procesar el primer archivo Excel.');
                $('#btn_procesar_ambos').removeClass('loading').prop('disabled', false);
            }
        });
    });


});

function validarClaveJson(jsonUnido) {
    // Guardar el JSON unido en una variable 

    json = jsonUnido;

    //Recorrer Json para obtner la clave del empleado
    if (json && json.departamentos) {
        json.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp => {
                    let clave = emp.clave;

                    //Enviamos la clave al ajax para si existe en la base de datos
                    $.ajax({
                        type: "POST",
                        url: "../php/validar_clave.php",
                        data: { clave: clave },
                        success: function (response) {
                            if (!response.error) {
                                if (response == true) {
                                    clave = emp.clave;
                                    // Buscamos y obtenemos el nombre en el JSON
                                    let nombre = emp.nombre;

                                    //Lo mostramos en la tabla 
                                    
                                   

                                    

                                }

                            }

                        }
                    });


                });
            }
        });
    }


}



function mergeEmpleados(json1, json2) {
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


