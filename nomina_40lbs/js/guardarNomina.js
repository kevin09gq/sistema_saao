$(document).ready(function () {
    // Evento click para el botón de guardar nómina
    guardarNomina();
});

//==========================================================
// FUNCIÓN PARA GUARDAR O ACTUALIZAR LA NÓMINA
//==========================================================

function guardarNomina() {

    $('#btn_guardar_nomina_40lbs').click(function (e) {
        e.preventDefault();

        // Validar que exista el JSON de la nómina
        if (!jsonNomina40lbs) {
            mostrarAlerta('error', 'Error', 'No hay datos de nómina para guardar.');
            return;
        }

        // Calcular totales de percepciones y deducciones
        const totales = calcularTotalesNomina(jsonNomina40lbs);

        // Mostrar confirmación
        Swal.fire({
            title: '¿Guardar nómina?',
            text: `Total percepciones: $${totales.totalPercepciones.toFixed(2)}\nTotal deducciones: $${totales.totalDeducciones.toFixed(2)}\nTotal neto: $${totales.totalNeto.toFixed(2)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                // Limpiamos los datos 
                eliminarPropiedades(jsonNomina40lbs)

                // Enviar datos al servidor
                $.ajax({
                    url: "../php/infoDepartamentos.php",
                    type: "POST",
                    dataType: "json",
                    data: {
                        accion: "guardarNomina",
                        nomina_40lbs: JSON.stringify(jsonNomina40lbs),
                        anio: jsonNomina40lbs.anio,
                        numero_semana: jsonNomina40lbs.numero_semana,
                        id_empresa: 1,
                        total_percepciones: totales.totalPercepciones,
                        total_deducciones: totales.totalDeducciones,
                        total_neto: totales.totalNeto
                    },
                    success: function (respuesta) {
                        if (respuesta.success) {
                            const mensaje = respuesta.accion === 'actualizar'
                                ? 'Nómina actualizada correctamente.'
                                : 'Nómina guardada correctamente.';
                            mostrarAlerta('success', 'Éxito', mensaje);
                        } else {
                            mostrarAlerta('error', 'Error', respuesta.mensaje);
                        }
                    },
                    error: function () {
                        mostrarAlerta('error', 'Error', 'Ocurrió un error al guardar la nómina.');
                    }
                });
            }
        });
    });
}

//==========================================================
// FUNCIÓN PARA CALCULAR TOTALES DE PERCEPCIONES Y DEDUCCIONES
//==========================================================

function calcularTotalesNomina(jsonNomina) {
    let totalPercepciones = 0;
    let totalDeducciones = 0;

    // Definición de percepciones alineada con conceptos_totales.js
    const PERCEPCIONES_GUARDAR = [
        { propiedad: 'sueldo_neto' },
        { propiedad: 'incentivo' },
        { propiedad: 'horas_extra' },
        { propiedad: 'bono_antiguedad' },
        { propiedad: 'actividades_especiales' },
        { propiedad: 'puesto' }
    ];

    // Definición de deducciones alineada con conceptos_totales.js
    // Deducciones por código (se buscan en empleado.conceptos[])
    const DEDUCCIONES_POR_CODIGO = ['45', '52', '107', '16']; // ISR, IMSS, Ajuste al Sub, Infonavit
    // Deducciones por propiedad directa del empleado
    const DEDUCCIONES_POR_PROPIEDAD = [
        'permiso', 'inasistencia', 'uniformes', 'checador', 'prestamo', 'tarjeta'
    ];

    // Recorrer todos los departamentos y empleados
    jsonNomina.departamentos.forEach(departamento => {
        departamento.empleados.forEach(empleado => {
            // Saltar empleados ocultos (igual que conceptos_totales.js)
            if (empleado.mostrar === false) return;

            // ── PERCEPCIONES ──
            PERCEPCIONES_GUARDAR.forEach(perc => {
                const valor = parseFloat(empleado[perc.propiedad]) || 0;
                if (valor > 0) {
                    totalPercepciones += valor;
                }
            });

            // Percepciones extras (conceptos adicionales agregados manualmente)
            if (Array.isArray(empleado.percepciones_extra)) {
                empleado.percepciones_extra.forEach(extra => {
                    const valor = parseFloat(extra.cantidad) || 0;
                    if (valor > 0) {
                        totalPercepciones += valor;
                    }
                });
            }

            // ── DEDUCCIONES ──
            // Deducciones por propiedad directa
            DEDUCCIONES_POR_PROPIEDAD.forEach(prop => {
                const valor = parseFloat(empleado[prop]) || 0;
                if (valor > 0) {
                    totalDeducciones += valor;
                }
            });

            // Deducciones por código (ISR, IMSS, Ajuste al Sub, Infonavit)
            if (Array.isArray(empleado.conceptos)) {
                DEDUCCIONES_POR_CODIGO.forEach(codigo => {
                    const concepto = empleado.conceptos.find(c => String(c.codigo) === codigo);
                    const valor = concepto ? (parseFloat(concepto.resultado) || 0) : 0;
                    if (valor > 0) {
                        totalDeducciones += valor;
                    }
                });
            }

            // Deducciones extras (F.A/Gafet/Cofia y otros conceptos adicionales)
            if (Array.isArray(empleado.deducciones_extra)) {
                empleado.deducciones_extra.forEach(extra => {
                    const valor = parseFloat(extra.cantidad) || 0;
                    if (valor > 0) {
                        totalDeducciones += valor;
                    }
                });
            }
        });
    });

    const totalNeto = totalPercepciones - totalDeducciones;

    return {
        totalPercepciones: totalPercepciones,
        totalDeducciones: totalDeducciones,
        totalNeto: totalNeto
    };
}


//=======================================
// ELIMINAR PROPIEDADES CON VALOR 0 PARA OPTIMIZAR ALMACENAMIENTO EN BASE DE DATOS
//=======================================

function eliminarPropiedades(json) {
    if (!json || !json.departamentos || !Array.isArray(json.departamentos)) return;

    json.departamentos.forEach(departamento => {
        if (departamento.empleados && Array.isArray(departamento.empleados)) {
            departamento.empleados.forEach(empleado => {
                // Verificamos y eliminamos individualmente cada propiedad si es 0
                if (empleado.sueldo_neto === 0) delete empleado.sueldo_neto;
                if (empleado.incentivo === 0) delete empleado.incentivo;
                if (empleado.horas_extra === 0) delete empleado.horas_extra;
                if (empleado.bono_antiguedad === 0) delete empleado.bono_antiguedad;
                if (empleado.puesto === 0) delete empleado.puesto;
                if (empleado.actividades_especiales === 0) delete empleado.actividades_especiales;
                if (empleado.sueldo_extra_total === 0) delete empleado.sueldo_extra_total;
                if (empleado.prestamo === 0) delete empleado.prestamo;
                if (empleado.permiso === 0) delete empleado.permiso;
                if (empleado.inasistencia === 0) delete empleado.inasistencia;
                if (empleado.uniformes === 0) delete empleado.uniformes;
                if (empleado.checador === 0) delete empleado.checador;
                if (empleado.fa_gafet_cofia === 0) delete empleado.fa_gafet_cofia;

                // Eliminar la propiedad claseEvento de cada registro
                if (Array.isArray(empleado.registros)) {

                    empleado.registros.forEach(function (registro) {

                        delete registro.claseEvento;

                    });

                }

                // --- LIMPIEZA DE HISTORIALES Y CONCEPTOS EXTRAS (Si están vacíos) ---
                if (Array.isArray(empleado.historial_olvidos) && empleado.historial_olvidos.length === 0) delete empleado.historial_olvidos;
                if (Array.isArray(empleado.historial_inasistencias) && empleado.historial_inasistencias.length === 0) delete empleado.historial_inasistencias;
                if (Array.isArray(empleado.historial_permisos) && empleado.historial_permisos.length === 0) delete empleado.historial_permisos;
                if (Array.isArray(empleado.historial_uniforme) && empleado.historial_uniforme.length === 0) delete empleado.historial_uniforme;

                // Limpieza de percepciones y deducciones extras
                if (Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.length === 0) delete empleado.percepciones_extra;
                if (Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length === 0) delete empleado.deducciones_extra;


            });
        }
    });
}

