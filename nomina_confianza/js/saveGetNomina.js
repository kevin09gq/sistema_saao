function confirmarsaveNomina() {
  $('#btn_guardar_nomina_confianza').on('click', function () {
        Swal.fire({
            title: '¿Confirmar guardado?',
            text: `¿Está seguro que desea guardar la nómina de la semana ${jsonNominaConfianza.numero_semana}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                saveNominaConfianza();
            }
        });
    });
}

function saveNominaConfianza(){

    // Recalcular total_cobrar y redondeo de todos los empleados antes de guardar
    if (typeof calcularTotalCobrar === 'function') {
        jsonNominaConfianza.departamentos.forEach(depto => {
            if (Array.isArray(depto.empleados)) {
                depto.empleados.forEach(emp => {
                    calcularTotalCobrar(emp);
                });
            }
        });
    }

    eliminarPropiedades(jsonNominaConfianza); // Limpieza de propiedades innecesarias antes de enviar al servidor
    const jsonData = jsonNominaConfianza;
    const numeroSemana = jsonData.numero_semana;
    
    // IMPORTANTE: Usar fecha_cierre para determinar el año (NO fecha_inicio)
    // Esto es crítico para semanas que cruzan el cambio de año
    // Ejemplo: Semana 1 del 2026 que va del 27/Dic/2025 al 02/Ene/2026
    let anio = null;
    if (jsonData.fecha_cierre) {
        const partes = jsonData.fecha_cierre.split('/');
        anio = parseInt(partes[2]);
        if (!anio || isNaN(anio)) {
            anio = new Date().getFullYear();
        }
    } else if (jsonData.fecha_inicio) {
        // Fallback solo si no existe fecha_cierre
        const partes = jsonData.fecha_inicio.split('/');
        anio = parseInt(partes[2]);
        if (!anio || isNaN(anio)) {
            anio = new Date().getFullYear();
        }
    } else {
        anio = new Date().getFullYear();
    }
    
   
    $.ajax({
        url: '../php/saveGetNomina.php',
        type: 'POST',
        data: JSON.stringify({
            id_empresa: 1,
            numero_semana: numeroSemana,
            anio: anio,
            nomina: JSON.stringify(jsonData),
            actualizar: true,
            case: 'guardarNomina' // Agregar el caso para identificar la función en el servidor
        }),
        contentType: 'application/json; charset=UTF-8',
        success: function (response, textStatus, xhr) {
           

            // Parseo simple y seguro (más conciso)
            let parsed = null;
            try {
                if (typeof response === 'string') parsed = JSON.parse(response);
                else if (response && typeof response === 'object') parsed = response;
                else parsed = JSON.parse(xhr && xhr.responseText ? xhr.responseText : '{}');
            } catch (e) {
                console.error('Error parseando respuesta del servidor:', e, 'raw:', xhr && xhr.responseText ? xhr.responseText : response);
                Swal.fire({ title: 'Error', text: 'Respuesta inválida del servidor. Revisa la consola.', icon: 'error' });
                return;
            }
            response = parsed;

            const successFlag = response && (response.success === true || response.success === 'true' || response.success === 1 || response.success === '1');

            if (successFlag) {
                Swal.fire({
                    title: 'Éxito',
                    text: response.message || 'Nómina guardada exitosamente.',
                    icon: 'success'
                });

            } else {
                console.error('Servidor respondió con error:', response);
                Swal.fire({
                    title: 'Error',
                    text: response.message || 'Error al guardar la nómina.',
                    icon: 'error'
                });
            }
        },

        error: function (xhr, status, error) {
            Swal.fire({
                title: 'Error',
                text: `Error de comunicación con el servidor: ${error}`,
                icon: 'error'
            });
        }
    });

}

//=======================================
// ELIMINAR PROPIEDADES CON VALOR 0 PARA OPTIMIZAR ALMACENAMIENTO EN BASE DE DATOS
//=======================================

function validarExistenciaNomina(numeroSemana, anio) {
    // Versión simplificada: devuelve una Promise que resuelve a true/false
    return $.ajax({
        url: '../php/saveGetNomina.php',
        type: 'POST',
        data: JSON.stringify({ case: 'validarExistenciaNomina', id_empresa: 1, numero_semana: numeroSemana, anio: anio }),
        contentType: 'application/json; charset=UTF-8'
    }).then(function (resp) {
        try {
            const r = (typeof resp === 'string') ? JSON.parse(resp) : resp;
            return !!r.exists;
        } catch (e) {
            console.error('validarExistenciaNomina parse error', e, resp);
            return false;
        }
    }).catch(function (err) {
        console.error('validarExistenciaNomina AJAX failed', err);
        return false;
    });
}

function getNominaConfianza(numeroSemana, anio) {
    // Devuelve una Promise que resuelve con el objeto de nómina o null si no existe/error
    return $.ajax({
        url: '../php/saveGetNomina.php',
        type: 'POST',
        data: JSON.stringify({ case: 'obtenerNomina', id_empresa: 1, numero_semana: numeroSemana, anio: anio }),
        contentType: 'application/json; charset=UTF-8'
    }).then(function (resp) {
        try {
            const r = (typeof resp === 'string') ? JSON.parse(resp) : resp;
            if (r && r.success && r.found) {
                return r.nomina;
            }
            return null;
        } catch (e) {
            console.error('getNominaConfianza parse error', e, resp);
            return null;
        }
    }).catch(function (err) {
        console.error('getNominaConfianza AJAX failed', err);
        return null;
    });
}


function eliminarPropiedades(json) {
    if (!json || !Array.isArray(json.departamentos)) return;

    json.departamentos.forEach(departamento => {
        if (Array.isArray(departamento.empleados)) {
            departamento.empleados.forEach(empleado => {
                // Eliminar propiedades numéricas si son 0
                if (empleado.salario_semanal === 0) delete empleado.salario_semanal;
                if (empleado.sueldo_extra_total === 0) delete empleado.sueldo_extra_total;
                if (empleado.retardos === 0) delete empleado.retardos;
                if (empleado.prestamo === 0) delete empleado.prestamo;
                if (empleado.permiso === 0) delete empleado.permiso;
                if (empleado.inasistencia === 0) delete empleado.inasistencia;
                if (empleado.uniformes === 0) delete empleado.uniformes;
                if (empleado.checador === 0) delete empleado.checador;
                if (empleado.fa_gafet_cofia === 0) delete empleado.fa_gafet_cofia;
               
                // Eliminar arreglos de historial si están vacíos
                if (Array.isArray(empleado.historial_retardos) && empleado.historial_retardos.length === 0) delete empleado.historial_retardos;
                if (Array.isArray(empleado.historial_olvidos) && empleado.historial_olvidos.length === 0) delete empleado.historial_olvidos;
                if (Array.isArray(empleado.historial_inasistencias) && empleado.historial_inasistencias.length === 0) delete empleado.historial_inasistencias;
                if (Array.isArray(empleado.historial_permisos) && empleado.historial_permisos.length === 0) delete empleado.historial_permisos;
                if (Array.isArray(empleado.historial_uniforme) && empleado.historial_uniforme.length === 0) delete empleado.historial_uniforme;

                // Eliminar conceptos extra si están vacíos
                if (Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.length === 0) delete empleado.percepciones_extra;
                if (Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length === 0) delete empleado.deducciones_extra;

             
            });
        }
    });
}
