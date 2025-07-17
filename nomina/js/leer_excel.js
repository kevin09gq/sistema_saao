$(document).ready(function () {
    $('#btn_procesar_ambos').on('click', function (e) {
        e.preventDefault();

        // 1. Enviar el primer archivo Excel
        var form = $('#form_excel')[0];
        var formData1 = new FormData();
        if (form.archivo_excel.files.length === 0) {
            alert('Selecciona el primer archivo Excel.');
            return;
        }
        formData1.append('archivo_excel', form.archivo_excel.files[0]);

        $.ajax({
            url: '../php/leer_excel_backend.php',
            type: 'POST',
            data: formData1,
            processData: false,
            contentType: false,
            success: function (res1) {
                try {
                    const json1 = JSON.parse(res1);
                    console.log('Respuesta Excel 1:', json1);

                    // 2. Si fue exitoso, enviar el segundo archivo Excel
                    var formData2 = new FormData();
                    if (form.archivo_excel2.files.length === 0) {
                        alert('Selecciona el segundo archivo Excel.');
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
                                console.log('Respuesta Excel 2:', json2);
                                // Unir ambos JSON y mostrar el resultado
                                const jsonUnido = mergeEmpleados(json1, json2);
                                console.log('JSON UNIDO:', jsonUnido);
                            } catch (e) {
                                console.error('No es un JSON válido (Excel 2):', res2);
                            }
                        },
                        error: function (err2) {
                            console.error('Error al leer el archivo Excel 2:', err2);
                        }
                    });

                } catch (e) {
                    console.error('No es un JSON válido (Excel 1):', res1);
                }
            },
            error: function (err1) {
                console.error('Error al leer el archivo Excel 1:', err1);
            }
        });
    });
});

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
    json2.empleados.forEach(emp => {
        empleados2Map[normalizar(emp.nombre)] = emp;
    });

    // Recorre departamentos y empleados
    json1.departamentos.forEach(depto => {
        depto.empleados.forEach(emp1 => {
            const nombreNormalizado = normalizar(emp1.nombre);
            if (empleados2Map[nombreNormalizado]) {
                const emp2 = empleados2Map[nombreNormalizado];
                emp1.horas_totales = emp2.horas_totales;
                emp1.tiempo_total = emp2.tiempo_total;
                emp1.registros = emp2.registros;
            }
        });
    });

    return json1;
}


