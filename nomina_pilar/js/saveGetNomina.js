function confirmarsaveNomina() {
    $('#btn_guardar_nomina_pilar').on('click', function () {
        Swal.fire({
            title: '¿Confirmar guardado?',
            text: `¿Está seguro que desea guardar la nómina de la semana ${jsonNominaPilar.numero_semana}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                saveNominaPilar();
            }
        });
    });
}

function saveNominaPilar() {
    eliminarPropiedades(jsonNominaPilar); // Limpiar propiedades con valor 0 antes de guardar

    // Quitar el departamento "Corte" del objeto global para no guardarlo en la nómina (se procesa aparte)
    const jsonData = { ...jsonNominaPilar, departamentos: jsonNominaPilar.departamentos.filter(d => d.nombre !== "Corte") };
    const numeroSemana = jsonData.numero_semana;

    // Obtener el dep Corte por separado
    const departamentoCorte = jsonNominaPilar.departamentos.find(d => d.nombre === "Corte");
    const empleadosCorte = departamentoCorte ? departamentoCorte.empleados : [];

    // Obtener el dep Poda por separado
    const departamentoPoda = jsonNominaPilar.departamentos.find(d => d.nombre === "Poda");
    const empleadosPoda = departamentoPoda ? departamentoPoda.empleados : [];



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
            corte: JSON.stringify(empleadosCorte), // Enviar solo los empleados del departamento de Corte
            poda: JSON.stringify(empleadosPoda), // Enviar solo los empleados del departamento de Poda
            actualizar: true,
            case: 'guardarNominaPilar' // Agregar el caso para identificar la función en el servidor
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

function getNominaPilar(numeroSemana, anio) {
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
            console.error('getNominaPilar parse error', e, resp);
            return null;
        }
    }).catch(function (err) {
        console.error('getNominaPilar AJAX failed', err);
        return null;
    });
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
                if (empleado.salario_semanal === 0) delete empleado.salario_semanal;
                if (empleado.salario_diario === 0) delete empleado.salario_diario;
                if (empleado.sueldo_extra_total === 0) delete empleado.sueldo_extra_total;
                if (empleado.retardos === 0) delete empleado.retardos;
                if (empleado.prestamo === 0) delete empleado.prestamo;
                if (empleado.permiso === 0) delete empleado.permiso;
                if (empleado.inasistencia === 0) delete empleado.inasistencia;
                if (empleado.uniformes === 0) delete empleado.uniformes;
                if (empleado.checador === 0) delete empleado.checador;
                if (empleado.fa_gafet_cofia === 0) delete empleado.fa_gafet_cofia;
                if (empleado.pasaje === 0) delete empleado.pasaje;
                if (empleado.comida === 0) delete empleado.comida;
                if (empleado.tardeada === 0) delete empleado.tardeada;
                if (empleado.dias_extra === 0) delete empleado.dias_extra;
                if (empleado.dias_menos === 0) delete empleado.dias_menos;


                // --- LIMPIEZA DE HISTORIALES Y CONCEPTOS EXTRAS (Si están vacíos) ---
                if (Array.isArray(empleado.historial_olvidos) && empleado.historial_olvidos.length === 0) delete empleado.historial_olvidos;
                if (Array.isArray(empleado.historial_inasistencias) && empleado.historial_inasistencias.length === 0) delete empleado.historial_inasistencias;
                if (Array.isArray(empleado.historial_permisos) && empleado.historial_permisos.length === 0) delete empleado.historial_permisos;
                if (Array.isArray(empleado.historial_uniforme) && empleado.historial_uniforme.length === 0) delete empleado.historial_uniforme;
                if (Array.isArray(empleado.historial_retardos) && empleado.historial_retardos.length === 0) delete empleado.historial_retardos;
                if (Array.isArray(empleado.dias_menos_detalle) && empleado.dias_menos_detalle.length === 0) delete empleado.dias_menos_detalle;
                if (Array.isArray(empleado.dias_extra_detalle) && empleado.dias_extra_detalle.length === 0) delete empleado.dias_extra_detalle;

                // Limpieza de percepciones y deducciones extras
                if (Array.isArray(empleado.percepciones_extra) && empleado.percepciones_extra.length === 0) delete empleado.percepciones_extra;
                if (Array.isArray(empleado.deducciones_extra) && empleado.deducciones_extra.length === 0) delete empleado.deducciones_extra;


            });
        }
    });
}