//======================================================================
// FUNCION PARA GUARDAR LA NOMINA CUANDO SE RECARGA LA PAGINA 
//======================================================================

window.addEventListener('beforeunload', function () {
    if (typeof jsonNominasResponsivas !== 'undefined') {
        saveNomina(jsonNominasResponsivas);
    }
});

//======================================================================
// FUNCIONES PARA MOSTRAR U OCULTAR LOS APARTADOS DE LA VISTA
//======================================================================

function mostrarApartadoFiltros() {
    $("#card_filtros_responsiva").show().prop("hidden", false);
    $("#card_seleccion_departamentos").hide().prop("hidden", true);
    $("#btn_generar_responsivas").hide().prop("hidden", true);
    $("#container_responsivas").hide().prop("hidden", true);
}

function mostrarApartadoSeleccion() {
    $("#card_filtros_responsiva").hide().prop("hidden", true);
    $("#card_seleccion_departamentos").show().prop("hidden", false);
    $("#btn_generar_responsivas").show().prop("hidden", false);
    $("#container_responsivas").hide().prop("hidden", true);
}

function mostrarApartadoResponsivas(datos) {
    $("#card_filtros_responsiva").hide().prop("hidden", true);
    $("#card_seleccion_departamentos").hide().prop("hidden", true);
    $("#btn_generar_responsivas").hide().prop("hidden", true);
    $("#container_responsivas").show().prop("hidden", false);

    if (datos && typeof mostrarInformacionGeneral === "function") {
        mostrarInformacionGeneral(datos);
    }
}

//======================================================================
//FUNCION PARA GUARDAR EL JSON DE LA NOMINA EN EL LOCAL STORAGE
//======================================================================

function saveNomina(jsonNominasResponsivas) {
    try {
        const str = JSON.stringify(jsonNominasResponsivas);
        localStorage.setItem('jsonNominasResponsivas', str);
        return true;
    } catch (err) {
        return false;
    }
}

//======================================================================
// FUNCION PARA OBTENER EL JSON DE LA NOMINA DESDE EL LOCAL STORAGE
//======================================================================

function loadNomina() {
    try {
        const str = localStorage.getItem('jsonNominasResponsivas');
        if (!str) return null;
        return JSON.parse(str);
    } catch (err) {
        return null;
    }
}

//====================================================================================
// FUNCION PARA RESTAURAR LA NOMINA DESDE EL LOCAL STORAGE CUANDO SE CARGA LA PAGINA
//====================================================================================

function restoreNomina() {
    try {
        const stored = loadNomina();
        if (!stored) return false;

        if (!stored.datos_generales) return false;

        // Poner la variable global para que el resto del código la use
        jsonNominasResponsivas = stored;
        mostrarApartadoResponsivas(jsonNominasResponsivas);
        return true;
    } catch (err) {
        return false;
    }
}

//=========================================================================
// FUNCION PARA LIMPIAR LA NOMINA DEL LOCAL STORAGE Y DE LA VARIABLE GLOBAL
//=========================================================================

function clearNomina() {
    try {
        localStorage.removeItem('jsonNominasResponsivas');
        // También limpiar la variable global para evitar que se vuelva a guardar en beforeunload
        jsonNominasResponsivas = null;
        return true;
    } catch (err) {
        return false;
    }
}

//=========================================================================
// EVENTO: BOTÓN LIMPIAR RESPONSIVAS Y REGRESAR AL APARTADO 1
//=========================================================================
$(document).on("click", "#btn_limpiar_responsivas", function () {
    Swal.fire({
        title: "¿Limpiar responsivas?",
        text: "Se borrarán los datos actuales y podrás seleccionar un nuevo período.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, limpiar",
        cancelButtonText: "Cancelar"
    }).then(function (result) {
        if (result.isConfirmed) {
            clearNomina();

            // Limpiar inputs de información general
            $("#info_folio, #info_fecha, #info_semana, #info_periodo, #info_elaboro, #info_sobres, #info_importe, #info_sobres_devueltos, #info_total_devuelto").val("");

            // Limpiar las tablas de responsivas individuales
            $("#container_responsivas_individuales").empty();

            // Regresar al apartado 1 (filtros centrados tipo login)
            mostrarApartadoFiltros();

            // Recargar catálogo de años si existe la función
            if (typeof cargarAnios === "function") {
                cargarAnios();
            }

            Swal.fire({
                icon: "success",
                title: "Responsivas limpiadas",
                text: "Puedes seleccionar un nuevo año y semana.",
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
});

