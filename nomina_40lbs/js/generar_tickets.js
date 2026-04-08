/**
 * Genera y descarga tickets PDF para todos los empleados de la nómina
 */

function generarTicketsPDF() {
    // Validar que haya datos cargados
    if (typeof jsonNomina40lbs === 'undefined' || !jsonNomina40lbs.departamentos) {
        Swal.fire({
            title: 'Error',
            text: 'No hay datos de nómina cargados. Carga los archivos Excel primero.',
            icon: 'error'
        });
        return;
    }

    // Mostrar muestra de carga
    Swal.fire({
        title: 'Generando tickets...',
        text: 'Por favor espera mientras se generan los PDFs.',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Preparar estructura de datos para enviar al PHP
    const nomina_para_enviar = {
        numero_semana: jsonNomina40lbs.numero_semana,
        fecha_inicio: jsonNomina40lbs.fecha_inicio,
        fecha_cierre: jsonNomina40lbs.fecha_cierre,
        departamentos: jsonNomina40lbs.departamentos.map(depto => ({
            nombre: depto.nombre || '',
            empleados: depto.empleados.map(emp => {
                // Mapeo de códigos de concepto a nombres de deducción
                const codigosDeduccion = {
                    '45': 'ISR',
                    '52': 'IMSS',
                    '16': 'INFONAVIT',
                    '107': 'AJUSTES AL SUB'
                };

                // Crear array de deducciones desde conceptos
                let deduccionesArray = [];
                if (Array.isArray(emp.conceptos)) {
                    emp.conceptos.forEach(concepto => {
                        const codigo = String(concepto.codigo || '');
                        const nombre = codigosDeduccion[codigo] || concepto.nombre || '';
                        const valor = parseFloat(concepto.resultado) || 0;
                        
                        // Solo agregar si tiene nombre y valor > 0
                        if (nombre && valor > 0) {
                            deduccionesArray.push({
                                nombre: nombre,
                                resultado: valor
                            });
                        }
                    });
                }

                // Agregar permiso como deducción si existe y es > 0
                if ((emp.permiso || 0) > 0) {
                    deduccionesArray.push({
                        nombre: 'PERMISO',
                        resultado: emp.permiso
                    });
                }

                // Crear estructura de empleado para el PDF
                const empleado = {
                    clave: emp.clave || '',
                    nombre: emp.nombre || '',
                    id_empresa: emp.id_empresa || 1,
                    sueldo_base: emp.sueldo_neto || 0,
                    incentivo: emp.incentivo || 0,
                    sueldo_extra: emp.horas_extra || 0,  // Usar horas_extra del JSON
                    sueldo_extra_final: emp.sueldo_extra_final || 0,
                    bono_antiguedad: emp.bono_antiguedad || 0,
                    aplicar_bono: emp.aplicar_bono || 0,
                    actividades_especiales: emp.actividades_especiales || 0,
                    bono_puesto: emp.puesto || 0,  // Mapear campo 'puesto' del JSON
                    neto_pagar: emp.tarjeta || 0,
                    prestamo: emp.prestamo || 0,
                    uniformes: emp.uniformes || 0,
                    checador: emp.checador || 0,
                    inasistencias_descuento: emp.inasistencia || 0,
                    vacaciones: emp.vacaciones || 0,
                    conceptos: deduccionesArray, // Enviar deducciones mapeadas
                    // Mapear percepciones_extra a conceptos_adicionales con estructura esperada por PHP
                    conceptos_adicionales: (emp.percepciones_extra || []).map(item => ({
                        nombre: item.nombre || '',
                        valor: item.cantidad || 0
                    })),
                    // Mapear deducciones_extra a deducciones_adicionales con estructura esperada por PHP
                    deducciones_adicionales: (emp.deducciones_extra || []).map(item => ({
                        nombre: item.nombre || '',
                        valor: item.cantidad || 0
                    })),
                    mostrar: emp.mostrar !== false, // Solo incluir si mostrar=true
                    salario_semanal: emp.salario_semanal || 0,
                    salario_diario: emp.salario_diario || 0,
                    departamento: depto.nombre || '',
                    id_departamento: emp.id_departamento || null,
                    seguroSocial: emp.seguroSocial !== undefined ? emp.seguroSocial : true,
                    // Información adicional del empleado que puede venir de BD
                    nombre_departamento: depto.nombre || '',
                    nombre_puesto: emp.nombre_puesto || '',
                    rfc_empleado: emp.rfc || '',
                    imss: emp.imss || '',
                    fecha_ingreso: emp.fecha_ingreso || ''
                };
                return empleado;
            })
        }))
    };

    // Obtener departamento filtrado si está seleccionado en la interfaz
    let departamentoFiltrado = null;
    const filtroDepto = $('#filtro-departamento').val();
    if (filtroDepto === '1') {
        departamentoFiltrado = '40 Libras CSS';
    } else if (filtroDepto === '2') {
        departamentoFiltrado = '40 Libras SSS';
    } else if (filtroDepto === '3') {
        departamentoFiltrado = '10 Libras CSS';
    } else if (filtroDepto === '4') {
        departamentoFiltrado = '10 Libras SSS';
    }

    // Preparar datos para enviar
    const datos = {
        nomina: nomina_para_enviar,
        departamento_filtrado: departamentoFiltrado,
        solo_sin_seguro: false
    };

    // Enviar POST usando XMLHttpRequest directamente para manejar archivos binarios
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '../php/descargar_ticket_pdf.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.responseType = 'blob'; // Recibir como blob

    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                // Ya es un blob, crear URL directamente
                const blob = xhr.response;
                
                // Generar nombre de archivo con fecha/semana
                const numeroSemana = jsonNomina40lbs.numero_semana || 'SEM';
                const ahora = new Date();
                const timestamp = ahora.getTime();
                const nombreArchivo = `tickets_nomina_semana_${numeroSemana}_${timestamp}.pdf`;

                // Crear URL para descargar
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = nombreArchivo;
                
                // Simular click para descargar
                document.body.appendChild(link);
                link.click();
                
                // Limpiar
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                }, 100);

                Swal.fire({
                    title: 'Éxito',
                    text: `Tickets generados y descargados como ${nombreArchivo}`,
                    icon: 'success'
                });
            } catch (error) {
                console.error('Error al procesar PDF:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al procesar el archivo PDF generado.',
                    icon: 'error'
                });
            }
        } else {
            console.error('Error HTTP:', xhr.status);
            Swal.fire({
                title: 'Error',
                text: `Error del servidor: ${xhr.status}`,
                icon: 'error'
            });
        }
    };

    xhr.onerror = function() {
        console.error('Error en la solicitud XML');
        Swal.fire({
            title: 'Error',
            text: 'Error de conexión al servidor.',
            icon: 'error'
        });
    };

    xhr.send(JSON.stringify(datos));
}

// Manejador del botón de descargar tickets - Genera TODOS los tickets
$(document).ready(function() {
    $('#btn_ticket_pdf').on('click', function() {
        generarTicketsPDF();
    });
    
    // Botón para seleccionar empleados manualmente
    $('#btn_ticket_manual_40lbs').on('click', function() {
        if (!window.jsonNomina40lbs) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay datos de nómina cargados. Primero procesa los archivos.'
            });
            return;
        }
        
        cargarEmpleadosParaTickets40lbs();
        $('#modal_seleccion_tickets_40lbs').modal('show');
    });
});
