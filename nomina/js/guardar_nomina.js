$(document).ready(function() {
    
    $("#btn_guardar_nomina").on("click", function() {
        if (typeof jsonGlobal === 'undefined' || !jsonGlobal) {
            Swal.fire({
                title: 'Error',
                text: 'No hay datos de nómina para guardar',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        // DEBUG: Verificar el contenido de jsonGlobal
      
        // Verificar que el JSON tenga número de semana
        if (!jsonGlobal.numero_semana) {
            Swal.fire({
                title: 'Error',
                text: 'No se encontró el número de semana en los datos',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        Swal.fire({
            title: '¿Confirmar guardado?',
            text: `¿Está seguro que desea guardar la nómina de la semana ${jsonGlobal.numero_semana}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                guardarNominaEnBD();
            }
        });
    });

  function guardarNominaEnBD() {
    $("#btn_guardar_nomina").prop("disabled", true);
    $("#btn_guardar_nomina").html('<i class="bi bi-hourglass-split"></i> Guardando...');

    // DEBUG: Verificar qué se está enviando
    const jsonString = JSON.stringify(jsonGlobal);
    

    // Verificar si existe horariosSemanalesActualizados
    let horariosString = "";
    if (typeof horariosSemanalesActualizados !== 'undefined' && horariosSemanalesActualizados) {
        // AGREGAR numero_semana automáticamente a los horarios
        const horariosConSemana = {
            ...horariosSemanalesActualizados,
            numero_semana: jsonGlobal.numero_semana // Tomar el numero_semana del jsonGlobal
        };
        
        horariosString = JSON.stringify(horariosConSemana);
       
    } else if (typeof horariosSemanales !== 'undefined' && horariosSemanales) {
        // Si no existe horariosSemanalesActualizados, usar horariosSemanales
        const horariosConSemana = {
            ...horariosSemanales,
            numero_semana: jsonGlobal.numero_semana
        };
        
        horariosString = JSON.stringify(horariosConSemana);
       
    } else {
       
    }

    $.ajax({
        type: "POST",
        url: "../php/guarda_nomina.php",
        data: {
            accion: "guardar_nomina",
            jsonData: jsonString,
            horariosData: horariosString // Agregar los horarios
        },
        dataType: "json",
        success: function(response) {
          
            if (response.success) {
                let titulo = "";
                let mensaje = "";
                let icono = "success";
                
                if (response.action === 'updated') {
                    titulo = "¡Nómina Actualizada!";
                    mensaje = `Nómina de la semana ${response.numero_semana} actualizada exitosamente`;
                } else if (response.action === 'created') {
                    titulo = "¡Nómina Creada!";
                    mensaje = `Nueva nómina de la semana ${response.numero_semana} creada exitosamente`;
                    
                    // Mostrar información sobre eliminación de nómina antigua
                    if (response.nomina_eliminada) {
                        mensaje += `<br><br><strong>⚠️ INFORMACIÓN:</strong> Se alcanzó el límite de 6 nóminas<br>La nómina más antigua (semana ${response.semana_eliminada}) fue eliminada automáticamente`;
                    }
                    
                    // Mostrar total de nóminas almacenadas
                    if (response.total_nominas) {
                        mensaje += `<br><br><strong>📊 Total de nóminas almacenadas:</strong> ${response.total_nominas}/6`;
                    }
                }

                // Agregar información sobre horarios
                if (response.horarios_guardados) {
                    mensaje += `<br><br><strong>✅ Horarios oficiales guardados correctamente</strong>`;
                } else {
                    mensaje += `<br><br><strong>⚠️ No se pudieron guardar los horarios</strong>`;
                }
                
                Swal.fire({
                    title: titulo,
                    html: mensaje,
                    icon: icono,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#28a745'
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: `Error al guardar la nómina: ${response.message}`,
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
              
            }
        },
        error: function(xhr, status, error) {
                      
            Swal.fire({
                title: 'Error de Conexión',
                text: 'Error de conexión al guardar la nómina',
                icon: 'error',
                confirmButtonText: 'Entendido'
            });
        },
        complete: function() {
            $("#btn_guardar_nomina").prop("disabled", false);
            $("#btn_guardar_nomina").html('<i class="bi bi-save"></i> Guardar Nómina');
        }
    });
}
});