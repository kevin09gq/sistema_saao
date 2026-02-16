function confirmarsaveNomina() {
  $('#btn_guardar_nomina_relicario').on('click', function () {
        Swal.fire({
            title: '¿Confirmar guardado?',
            text: `¿Está seguro que desea guardar la nómina de la semana ${jsonNominaRelicario.numero_semana}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                saveNominaRelicario();
            }
        });
    });
}

function saveNominaRelicario(){

    const jsonData = jsonNominaRelicario;
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
            case: 'guardarNominaRelicario' // Agregar el caso para identificar la función en el servidor
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

function getNominaRelicario(numeroSemana, anio) {
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
            console.error('getNominaRelicario parse error', e, resp);
            return null;
        }
    }).catch(function (err) {
        console.error('getNominaRelicario AJAX failed', err);
        return null;
    });
}