$('#btn_export_excel').on('click',  async function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    // Verificar si hay sueldos negativos antes de exportar
    const haySueldosNegativos = await verificarSueldosNegativos();
    if (haySueldosNegativos) {
        return; // Si hay sueldos negativos, no continuar con la exportación
    }

    const tituloNomina = ($('#nombre_nomina').length ? $('#nombre_nomina').text() : '').trim();
    const numeroSemana = jsonGlobal.numero_semana;
    const fechaCierre = jsonGlobal.fecha_cierre;
    const partesFecha = fechaCierre.split('/');
    const anio = partesFecha[2];
    const tituloExcel = `SEMANA ${numeroSemana}-${anio}`;

    const payload = {
        datos: jsonGlobal,
        tituloNomina: tituloNomina,
        tituloExcel: tituloExcel
    };

    $.ajax({
        url: '../php/generar_excel.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        xhrFields: { responseType: 'blob' },
        success: async function (blob) {
            if (!(blob instanceof Blob) || blob.size === 0) {
                alert('Error: no se recibió un archivo válido.');
                return;
            }

            const fileName = tituloExcel + '.xlsx';

            // Intentar siempre diálogo Guardar como (Chromium + https/localhost)
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'Archivo Excel',
                            accept: {
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                            }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return;
                } catch (e) {
                    if (e.name === 'AbortError') return; // Canceló
                    // Si falla continua al fallback
                }
            }

            // Fallback: descarga directa (sin poder forzar el diálogo)
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // Sin esto algunos navegadores abrirían pestaña en blanco
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        },
        error: function (xhr) {
            let errorMessage = 'Error al generar el archivo Excel.';
            if (xhr.responseJSON && xhr.responseJSON.error) {
                errorMessage = xhr.responseJSON.error;
            }
            alert(errorMessage);
        }
    });
});

// Modificar el botón de exportar PDF
$('#btn_export_pdf').on('click', async function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    // Verificar si hay sueldos negativos antes de exportar
    const haySueldosNegativos = await verificarSueldosNegativos();
    if (haySueldosNegativos) {
        return; // Si hay sueldos negativos, no continuar con la exportación
    }

    const tituloNomina = ($('#nombre_nomina').length ? $('#nombre_nomina').text() : '').trim();
    const numeroSemana = jsonGlobal.numero_semana;
    const fechaCierre = jsonGlobal.fecha_cierre;
    const partesFecha = fechaCierre.split('/');
    const anio = partesFecha[2];
    const tituloExcel = `SEMANA ${numeroSemana}-${anio}`;

    const payload = {
        datos: jsonGlobal,
        tituloNomina: tituloNomina,
        tituloExcel: tituloExcel
    };

    $.ajax({
        url: '../php/generar_pdf.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        xhrFields: { responseType: 'blob' },
        success: async function (blob, textStatus, xhr) {
            // Verificar si es un error JSON
            if (xhr.getResponseHeader('content-type') === 'application/json') {
                const text = await blob.text();
                const errorData = JSON.parse(text);
                alert('Error del servidor: ' + (errorData.error || 'Error desconocido'));
                return;
            }

            if (!(blob instanceof Blob) || blob.size === 0) {
                alert('Error: no se recibió un archivo PDF válido.');
                return;
            }

            const fileName = tituloExcel + '.pdf';

            // Intentar diálogo Guardar como
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'Archivo PDF',
                            accept: { 'application/pdf': ['.pdf'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                    return;
                } catch (e) {
                    if (e.name === 'AbortError') return;
                }
            }

            // Fallback: descarga directa
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        },
        error: function (xhr, textStatus, errorThrown) {

            let errorMessage = 'Error al generar el archivo PDF.';
            try {
                if (xhr.responseText) {
                    const errorData = JSON.parse(xhr.responseText);
                    errorMessage = errorData.error || errorMessage;
                }
            } catch (e) {
                errorMessage = `Error de conexión: ${textStatus}`;
            }

            alert(errorMessage);
        }
    });
});

// Modificar el botón de exportar reporte PDF
$('#btn_export_pdf_reporte').on('click', async function () {
    if (!jsonGlobal) {
        alert('No hay datos disponibles para exportar.');
        return;
    }

    // Verificar si hay sueldos negativos antes de exportar
    const haySueldosNegativos = await verificarSueldosNegativos();
    if (haySueldosNegativos) {
        return; // Si hay sueldos negativos, no continuar con la exportación
    }

    // Mostrar indicador de carga
    Swal.fire({
        title: 'Generando reporte...',
        text: 'Por favor espere mientras se genera el reporte PDF',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Obtener información de la nómina
    const tituloNomina = ($('#nombre_nomina').length ? $('#nombre_nomina').text() : '').trim();
    const numeroSemana = jsonGlobal.numero_semana || 'N/A';
    const fechaCierre = jsonGlobal.fecha_cierre || new Date().toLocaleDateString();

    const payload = {
        datos: jsonGlobal,
        tituloNomina: tituloNomina,
        numeroSemana: numeroSemana,
        fechaCierre: fechaCierre
    };

    $.ajax({
        url: '../php/generar_pdf_reporte.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        xhrFields: { responseType: 'blob' },
        success: async function (blob, textStatus, xhr) {
            // Cerrar indicador de carga
            Swal.close();

            // Verificar si es un error JSON
            if (xhr.getResponseHeader('content-type') === 'application/json') {
                const text = await blob.text();
                const errorData = JSON.parse(text);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error del servidor: ' + (errorData.error || 'Error desconocido')
                });
                return;
            }

            if (!(blob instanceof Blob) || blob.size === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se recibió un archivo PDF válido.'
                });
                return;
            }

            const partesFecha = fechaCierre.split('/');
            const anio = partesFecha[2] || new Date().getFullYear();
            const fileName = `Reporte_Nomina_Semana_${numeroSemana}_${anio}.pdf`;

            // Intentar diálogo Guardar como
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{
                            description: 'Archivo PDF',
                            accept: { 'application/pdf': ['.pdf'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();

                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'Reporte generado correctamente',
                        timer: 2000
                    });
                    return;
                } catch (e) {
                    if (e.name === 'AbortError') return;
                }
            }

            // Fallback: descarga directa
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Reporte descargado correctamente',
                timer: 2000
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            // Cerrar indicador de carga
            Swal.close();

            let errorMessage = 'Error al generar el reporte PDF.';
            try {
                if (xhr.responseText) {
                    const errorData = JSON.parse(xhr.responseText);
                    errorMessage = errorData.error || errorMessage;
                }
            } catch (e) {
                errorMessage = `Error de conexión: ${textStatus}`;
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage
            });
        }
    });
});

// Función para verificar si hay sueldos negativos en la nómina (CON VALIDACIÓN DE CLAVES)
function verificarSueldosNegativos() {
    if (!jsonGlobal || !jsonGlobal.departamentos) {
        return false;
    }


    // 1️⃣ RECOPILAR TODAS LAS CLAVES de empleados en los departamentos relevantes
    const clavesAValidar = [];
    const empleadosPorClave = new Map();

    jsonGlobal.departamentos.forEach((depto, indexDepto) => {
        const nombreDepto = (depto.nombre || '').toLowerCase();

        // Solo departamentos relevantes: 40 libras, 10 libras y sin seguro
        const es40Libras = nombreDepto.includes('40 libras') || nombreDepto.includes('40libras');
        const es10Libras = nombreDepto.includes('10 libras') || nombreDepto.includes('10libras');
        const esSinSeguro = nombreDepto.includes('sin seguro');

        if ((es40Libras || es10Libras || esSinSeguro) && depto.empleados) {
            depto.empleados.forEach((empleado, indexEmp) => {
                if (empleado.clave) {
                    clavesAValidar.push(empleado.clave);

                    // Guardar referencia al empleado con su departamento
                    empleadosPorClave.set(String(empleado.clave), {
                        empleado: empleado,
                        departamento: depto.nombre,
                        es40Libras: es40Libras,
                        es10Libras: es10Libras,
                        esSinSeguro: esSinSeguro
                    });
                }
            });
        }
    });

    if (clavesAValidar.length === 0) {
        return false;
    }


    // 2️⃣ VALIDAR CLAVES CON EL SERVIDOR (verificar id_status = 1)
    return new Promise((resolve) => {
        $.ajax({
            type: "POST",
            url: "../php/validar_clave.php",
            data: JSON.stringify({ claves: clavesAValidar }),
            contentType: "application/json",
            success: function (clavesValidasJSON) {
                const clavesValidas = JSON.parse(clavesValidasJSON);

                // 3️⃣ CREAR SET DE CLAVES VÁLIDAS
                const clavesValidasSet = new Set(clavesValidas.map(c => String(c)));

                // 4️⃣ VERIFICAR SUELDOS NEGATIVOS SOLO EN EMPLEADOS VÁLIDOS
                let haySueldosNegativos = false;
                let mensajeError = '<strong>Se encontraron sueldos negativos en:</strong><br><br>';
                let empleadosConProblemas = [];

                let hayNegativosSoloEnDiez = true; // asumimos que si hay negativos son solo de 10, hasta probar lo contrario
                empleadosPorClave.forEach((data, claveStr) => {
                    // ✅ SOLO verificar empleados con id_status = 1
                    if (clavesValidasSet.has(claveStr)) {
                        const empleado = data.empleado;
                        const sueldoACobrar = parseFloat(empleado.sueldo_a_cobrar) || 0;

                        if (sueldoACobrar < 0) {
                            haySueldosNegativos = true;

                            // Determinar el departamento para el mensaje
                            let deptoDisplay = 'Desconocido';
                            if (data.es40Libras) {
                                deptoDisplay = '40 Libras';
                            } else if (data.es10Libras) {
                                deptoDisplay = '10 Libras';
                            } else if (data.esSinSeguro) {
                                // Para sin seguro, intentar determinar por puesto
                                const puesto = (empleado.puesto || '').toLowerCase();
                                if (puesto.includes('40')) {
                                    deptoDisplay = 'Sin Seguro - 40 Libras';
                                } else if (puesto.includes('10')) {
                                    deptoDisplay = 'Sin Seguro - 10 Libras';
                                } else {
                                    deptoDisplay = 'Sin Seguro';
                                }
                            }

                            // Determinar si este negativo pertenece a 10 Libras (incl. Sin Seguro 10)
                            const puestoLower = (empleado.puesto || '').toLowerCase();
                            const esNegativoDiez = data.es10Libras || (data.esSinSeguro && puestoLower.includes('10'));
                            if (!esNegativoDiez) {
                                hayNegativosSoloEnDiez = false;
                            }

                            const claveEmpleado = empleado.clave || empleado.clave_empleado || 'Sin clave';
                            const nombreEmpleado = empleado.nombre || empleado.nombre_completo || 'Sin nombre';



                            empleadosConProblemas.push({
                                departamento: deptoDisplay,
                                clave: claveEmpleado,
                                nombre: nombreEmpleado,
                                sueldo: sueldoACobrar
                            });

                            mensajeError += `<strong>Departamento:</strong> ${deptoDisplay}<br>`;
                            mensajeError += `<strong>Clave:</strong> ${claveEmpleado}<br>`;
                            mensajeError += `<strong>Empleado:</strong> ${nombreEmpleado}<br>`;
                            mensajeError += `<strong>Sueldo a cobrar:</strong> <span style="color: #dc3545; font-weight: bold;">$${sueldoACobrar.toFixed(2)}</span><br><br>`;
                        }
                    } else {
                        // Empleado NO válido (id_status ≠ 1)
                    }
                });


                if (haySueldosNegativos) {
                    if (hayNegativosSoloEnDiez) {
                        // Ofrecer continuar de todas formas cuando TODOS los negativos son de 10 Libras
                        Swal.fire({
                            icon: 'warning',
                            title: 'Sueldos negativos en 10 Libras',
                            html: mensajeError + '<hr><div style="text-align:left">Se detectaron sueldos negativos exclusivamente en <b>10 Libras</b> (incluye Sin Seguro 10). ¿Desea continuar con la exportación de todos modos?</div>',
                            showCancelButton: true,
                            confirmButtonText: 'Continuar de todas formas',
                            cancelButtonText: 'Corregir antes',
                            width: '700px',
                            customClass: { htmlContainer: 'text-start' }
                        }).then((res) => {
                            if (res.isConfirmed) {
                                resolve(false); // permitir continuar con la exportación
                            } else {
                                resolve(true); // bloquear exportación
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Sueldos Negativos Detectados',
                            html: mensajeError,
                            confirmButtonText: 'Entendido',
                            width: '700px',
                            customClass: {
                                htmlContainer: 'text-start'
                            },
                            footer: '<small>Por favor, corrige estos empleados antes de exportar la nómina</small>'
                        });
                        resolve(true);
                    }
                } else {
                    resolve(false);
                }
            },
            error: function (xhr, status, error) {

                // En caso de error, mostrar advertencia
                Swal.fire({
                    icon: 'warning',
                    title: 'Error de Validación',
                    text: 'No se pudieron validar las claves de empleados. ¿Desea continuar sin validación?',
                    showCancelButton: true,
                    confirmButtonText: 'Continuar sin validar',
                    cancelButtonText: 'Cancelar exportación'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Verificar sin validar (método anterior)
                        resolve(verificarSueldosNegativosSinValidacion());
                    } else {
                        resolve(true); // Cancelar exportación
                    }
                });
            }
        });
    });
}

// Función auxiliar para verificar sin validación (fallback)
function verificarSueldosNegativosSinValidacion() {
    let haySueldosNegativos = false;
    let mensajeError = '<strong>Se encontraron sueldos negativos en:</strong><br><br>';

    jsonGlobal.departamentos.forEach(depto => {
        const nombreDepto = (depto.nombre || '').toLowerCase();

        const es40Libras = nombreDepto.includes('40 libras') || nombreDepto.includes('40libras');
        const es10Libras = nombreDepto.includes('10 libras') || nombreDepto.includes('10libras');
        const esSinSeguro = nombreDepto.includes('sin seguro');

        if ((es40Libras || es10Libras || esSinSeguro) && depto.empleados) {
            depto.empleados.forEach(empleado => {
                const sueldoACobrar = parseFloat(empleado.sueldo_a_cobrar) || 0;

                if (sueldoACobrar < 0) {
                    haySueldosNegativos = true;

                    let deptoDisplay = 'Desconocido';
                    if (es40Libras) deptoDisplay = '40 Libras';
                    else if (es10Libras) deptoDisplay = '10 Libras';
                    else if (esSinSeguro) deptoDisplay = 'Sin Seguro';

                    mensajeError += `<strong>Departamento:</strong> ${deptoDisplay}<br>`;
                    mensajeError += `<strong>Empleado:</strong> ${empleado.nombre || empleado.nombre_completo || 'Sin nombre'}<br>`;
                    mensajeError += `<strong>Sueldo a cobrar:</strong> $${sueldoACobrar.toFixed(2)}<br><br>`;
                }
            });
        }
    });

    if (haySueldosNegativos) {
        Swal.fire({
            icon: 'error',
            title: 'Sueldos Negativos Detectados',
            html: mensajeError,
            confirmButtonText: 'Entendido',
            width: '600px'
        });
        return true;
    }

    return false;
}