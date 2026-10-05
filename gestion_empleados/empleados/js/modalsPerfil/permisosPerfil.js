//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE 
// INFORMACIÓN PERSONAL
//================================================

function aplicarPermisosInformacionPersonal() {
    // Verificar si el usuario tiene permiso para editar información
    if (!tienePermiso('empleados.editar_informacion')) {
        // Cambiar título del modal
        $('#modalEditarEmpleadoLabel').text('Información del empleado');

        // Deshabilitar todos los inputs del formulario
        $('#formEditarEmpleado input, #formEditarEmpleado select, #formEditarEmpleado textarea').prop('disabled', true);

        // Ocultar botones de ayuda (claves, casilleros, biométricos)
        $('#btnAbrirClavesDisponibles, #btnAbrirCasillerosDisponibles, #btnAbrirBiometricoDisponible').hide();

        // Ocultar botón de guardar
        $('#btnGuardarEmpleado').hide();
    }
}


//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE 
// CONTACTO DE EMERGENCIA
//================================================

function aplicarPermisosContactoEmergencia() {
    // Verificar si el usuario tiene permiso para editar información
    if (!tienePermiso('empleados.editar_contacto_emergencia')) {
        // Cambiar título del modal
        $('#modalContactoEmergenciaLabel').text('Contacto de emergencia');

        // Deshabilitar todos los inputs del formulario
        $('#formContactoEmergencia input, #formContactoEmergencia textarea').prop('disabled', true);

        // Ocultar botón de guardar
        $('#btnGuardarContactoEmergencia').hide();
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE
// INFORMACIÓN PERSONAL VIZUALIZAR SALARIOS
//================================================

function aplicarPermisosSalarios() {
    // Verificar si el usuario tiene permiso para ver salarios
    if (!tienePermiso('empleados.ver_salarios')) {

        // Ocultar el contenedor de datos salariales
        $('#datosSalarialesContainer').hide();
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE 
// BENEFICIARIOS
//================================================

function aplicarPermisosBeneficiarios() {
    // Verificar si el usuario tiene permiso para editar beneficiarios
    if (!tienePermiso('empleados.editar_beneficiarios')) {
        // Cambiar título del modal
        $('#modalBeneficiariosLabel').text('Beneficiarios del empleado');

        // Deshabilitar todos los inputs del formulario de agregar
        $('#beneficiarioNombre, #beneficiarioApellidoPaterno, #beneficiarioApellidoMaterno, #beneficiarioParentesco, #beneficiarioPorcentaje').prop('disabled', true);

        // Ocultar botón de agregar
        $('#btnAgregarBeneficiario').hide();

        // Ocultar formulario de agregar beneficiario
        $('#cardAgregarBeneficiario').hide();

        // Ocultar columna de Acción en la tabla
        $('#tablaBeneficiarios th:last-child, #tablaBeneficiarios td:last-child').hide();
    }
}


//===============================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE 
// REINGRESOS, FECHAS EMPRESA Y FECHA IMSS
//===============================================

function aplicarPermisosReingresosFechas() {

    // Verificar si el usuario tiene permiso para ver la fecha de alta en la empresa
    if (!tienePermiso('empleados.ver_fecha_alta_empresa')) {
        // Ocultar el campo de fecha de alta en la empresa
        $('#fechaAltaEmpresaContainer').hide();
    }

    // Verificar si el usuario tiene permiso para ver la fecha de alta en IMSS
    if (!tienePermiso('empleados.ver_fecha_alta_imss')) {
        // Ocultar el campo de fecha de alta en IMSS
        $('#fechaAltaImssContainer').hide();
    }

    // Verificar si el usuario tiene permiso para ver el historial de reingresos
    if (!tienePermiso('empleados.ver_historial_reingresos')) {
       // Ocultar el historial de reingresos
       $('#historialReingresosContainer').hide();
    }

    // Verificar si el usuario tiene permiso de editar la fecha de alta en la empresa
    if (!tienePermiso('empleados.editar_fecha_alta_empresa')) {
        // Deshabilitar el campo de fecha de alta en la empresa
        $('#btnActualizarFechaAltaEmpresa').hide();

        // Deshabilitar el campo de fecha de alta en la empresa
        $('#editarFechaAltaEmpresa').prop('disabled', true);
    }

    // Verificar si el usuario tiene permiso de editar la fecha de alta en IMSS
    if (!tienePermiso('empleados.editar_fecha_alta_imss')) {
        // Deshabilitar el campo de fecha de alta en IMSS
        $('#btnActualizarFechaAltaImss').hide();
        // Deshabilitar el campo de fecha de alta en IMSS
        $('#editarFechaAltaImss').prop('disabled', true);
    }

    // Verificar si el usuario tiene permiso de editar el historial de reingresos
    if (!tienePermiso('empleados.editar_historial_reingresos')) {
        // Deshabilitar el botón de actualizar historial de reingresos
        $('#btnActualizarHistorialReingresos').hide();
        // Ocultar columna de Acción en la tabla de reingresos
        $('#tablaHistorialReingresos th:last-child, #tablaHistorialReingresos td:last-child').hide();
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE 
// HORARIOS PARA EL RELOJ DE 8 HRS
//================================================

function aplicarPermisosHorariosReloj8Hrs() {
    // Verificar si el usuario tiene permiso de editar horarios para el reloj de 8 hrs
    if (!tienePermiso('empleados.editar_horarios')) {
        // Ocultar contenedor de copiar horarios
        $('#copiarHorariosContainer').hide();

        // Deshabilitar todos los inputs del formulario de horarios
        $('#tablaHorarios input').prop('disabled', true);

        // Ocultar columna de Acción en la tabla de horarios
        $('#tablaHorarios th:last-child, #tablaHorarios td:last-child').hide();

        // Ocultar botón de guardar horarios
        $('#btnGuardarHorarios').hide();
    }
}
//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE 
// HORARIOS OFICIALES 
//================================================

function aplicarPermisosHorariosOficiales() {
    // Verificar si el usuario tiene permiso de editar horarios oficiales
    if (!tienePermiso('empleados.editar_horarios_oficiales')) {
        // Ocultar contenedor de copiar horarios
        $('#copiarHorariosOficialesContainer').hide();

        // Deshabilitar todos los inputs del formulario de horarios
        $('#tablaHorariosOficiales input').prop('disabled', true);

        // Ocultar columna de Acción en la tabla de horarios
        $('#tablaHorariosOficiales th:last-child, #tablaHorariosOficiales td:last-child').hide();

        // Ocultar botón de guardar horarios
        $('#btnGuardarHorariosOficiales').hide();
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN EL MODAL DE 
// ACTUALIZAR FOTO DE PERFIL
//================================================

function aplicarPermisosActualizarFoto() {
    // Verificar si el usuario tiene permiso para actualizar foto
    if (!tienePermiso('empleados.actualizar_foto')) {
        // Deshabilitar el input de archivo
        $('#inputFotoEmpleado').prop('disabled', true);

        // Ocultar botón de guardar foto
        $('#btnGuardarFoto').hide();
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA TABLA DE 
// EMPLEADOS - STATUS NSS
//================================================

function aplicarPermisosNss() {
    // Verificar si el usuario tiene permiso para actualizar NSS
    if (!tienePermiso('empleados.actualizar_nss')) {
        // Remover el onclick y el role button de los badges de NSS
        $('.badge-nss-clickable').removeAttr('onclick').removeAttr('role').removeClass('badge-nss-clickable');
    }
}

//================================================
// FUNCIÓN PARA APLICAR PERMISOS EN LA TABLA DE
// EMPLEADOS - STATUS DEL EMPLEADO
//================================================

function aplicarPermisosStatusEmpleado() {
    // Verificar si el usuario tiene permiso para actualizar status del empleado
    if (!tienePermiso('empleados.actualizar_status')) {
        // Remover el onclick y el role button de los badges de status del empleado
        $('.badge-status-clickable').removeAttr('onclick').removeAttr('role').removeClass('badge-status-clickable');
    }
}

