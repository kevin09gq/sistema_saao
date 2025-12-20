$(document).ready(function () {
    // Inicializar el procesamiento del Excel
    processExcelData();
});


function processExcelData(params) {
    $('#btn_procesar_archivos').on('click', function (e) {
        e.preventDefault();

        var $form = $('#form_excel');
        var form = $form[0];

        // 1. Enviar el primer archivo Excel
        var formData1 = new FormData();
        if (!form.archivo_excel || form.archivo_excel.files.length === 0) {
            Swal.fire({
                title: "Archivo requerido",
                text: "Seleccione el primero archivo.",
                icon: "info"
            });
            return;
        }
        formData1.append('archivo_excel', form.archivo_excel.files[0]);

        // Mostrar indicador de carga
        $(this).addClass('loading').prop('disabled', true);

        $.ajax({
            url: '../php/leer_lista_raya.php',
            type: 'POST',
            data: formData1,
            processData: false,
            contentType: false,
            success: function (res1) {
                try {
                    const JsonListaRaya = JSON.parse(res1);

                    // 2. Si fue exitoso, enviar el segundo archivo Excel
                    var formData2 = new FormData();
                    if (!form.archivo_excel2 || form.archivo_excel2.files.length === 0) {
                        Swal.fire({
                            title: "Archivo requerido",
                            text: "Seleccione el segundo archivo.",
                            icon: "info"
                        });
                        $('#btn_procesar_archivos').removeClass('loading').prop('disabled', false);
                        return;
                    }
                    formData2.append('archivo_excel2', form.archivo_excel2.files[0]);

                    $.ajax({
                        url: '../php/leer_biometrico.php',
                        type: 'POST',
                        data: formData2,
                        processData: false,
                        contentType: false,
                        success: function (res2) {
                            try {

                                const JsonBiometrico = JSON.parse(res2);

                                // console.log('Lista de Raya:', JsonListaRaya);
                                console.log(JsonBiometrico);

                                const jsonRellenado = ajustarRegistros(JsonBiometrico);

                                console.log(jsonRellenado);
                                

                                //const jsonUnido = unirJson(JsonListaRaya, JsonBiometrico);

                                // console.log(jsonUnido);


                                // Ocultar el formulario
                                $("#container-nomina").attr("hidden", true);
                                // Mostrar la tabla principal y ocultar las demás
                                $('#tabla-nomina-responsive').removeAttr('hidden');


                            } catch (e) {

                            } finally {
                                $('#btn_procesar_archivos').removeClass('loading').prop('disabled', false);
                            }
                        },

                    });

                } catch (e) {

                }
            },

        });
    });
}

// Función para poner las entradas y salidas automaticas:
function ajustarRegistros(json) {
    // Función auxiliar para generar hora aleatoria dentro de un rango
    function horaAleatoria(horaMin, horaMax) {
        const [h1, m1] = horaMin.split(":").map(Number);
        const [h2, m2] = horaMax.split(":").map(Number);
        const minTotal = h1 * 60 + m1;
        const maxTotal = h2 * 60 + m2;
        const rand = Math.floor(Math.random() * (maxTotal - minTotal + 1)) + minTotal;
        const h = Math.floor(rand / 60);
        const m = rand % 60;
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }

    // Calcular diferencia entre horas
    function calcularTrabajado(entrada, salida) {
        if (!entrada || !salida) return "";
        const [h1, m1] = entrada.split(":").map(Number);
        const [h2, m2] = salida.split(":").map(Number);
        const minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (minutos <= 0) return "";
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return `${horas.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    }

    json.forEach(emp => {
        let totalMinutos = 0;

        emp.registros.forEach(r => {
            const fechaObj = new Date(r.fecha.split("/").reverse().join("-"));
            const esDomingo = fechaObj.getDay() === 0; // 0 = domingo

            if (esDomingo) {
                r.entrada = r.salida = r.trabajado = "";
                return;
            }

            // Primera entrada
            if (!r.entrada || r.entrada < "07:50" || r.entrada > "08:15") {
                r.entrada = horaAleatoria("07:50", "08:15");
            }

            // Salida a comer
            if (!r.salida || r.salida < "12:50" || r.salida > "13:10") {
                r.salida = horaAleatoria("12:50", "13:10");
            }

            // Calcular trabajado
            r.trabajado = calcularTrabajado(r.entrada, r.salida);
            if (r.trabajado) {
                const [h, m] = r.trabajado.split(":").map(Number);
                totalMinutos += h * 60 + m;
            }
        });

        // Ajustar total máximo 8 horas
        if (totalMinutos > 480) totalMinutos = 480; // 8h = 480 min

        const horasDecimales = (totalMinutos / 60).toFixed(2);
        const horas = Math.floor(totalMinutos / 60);
        const mins = totalMinutos % 60;
        emp.horas_totales = horasDecimales;
        emp.tiempo_total = `${horas}:${mins.toString().padStart(2, "0")}`;
    });

    return json;
}


// Función para unir dos JSON con normalización
function unirJson(json1, json2) {
    // Normalización de nombres: quita tildes, espacios extra, mayúsculas y ordena palabras
    const normalizar = s => s
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");

    // Crear mapa de empleados de json2
    const empleados2Map = {};
    if (json2 && json2.empleados) {
        json2.empleados.forEach(emp => {
            empleados2Map[normalizar(emp.nombre)] = emp;
        });
    }

    // Recorrer departamentos y empleados de json1
    if (json1 && json1.departamentos) {
        json1.departamentos.forEach(depto => {
            if (depto.empleados) {
                depto.empleados.forEach(emp1 => {
                    const nombreNormalizado = normalizar(emp1.nombre);
                    if (empleados2Map[nombreNormalizado]) {
                        const emp2 = empleados2Map[nombreNormalizado];
                        // Ahora se agregan registros para TODOS los departamentos
                        emp1.registros = emp2.registros;
                    }
                });
            }
        });
    }

    return json1;
}
