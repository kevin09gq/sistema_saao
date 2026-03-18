alternarTablas();
sumasAutomaticasPercepciones();
sumasAutomaticasConceptos();
actualizarConceptos();
// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y HORARIOS OFICIALES
// ========================================
function alternarTablas() {
    // BOTÓN BIOMÉTRICO: Mostrar registros biométricos del checador
    $('#btn-biometrico-40lbs').on('click', function () {
        // Mostrar tabla biométrico
        $('#tabla-biometrico-40lbs').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-biometrico-redondeado').attr('hidden', 'hidden');

        // Marcar botones: biométrico activo, horarios inactivo
        $(this).addClass('active');
        $('#btn-biometrico-redondeado-40lbs').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-biometrico-redondeado-40lbs').on('click', function () {
        // Ocultar tabla biométrico
        $('#tabla-biometrico-40lbs').attr('hidden', 'hidden');
        // Mostrar tabla de horarios oficiales
        $('#tabla-biometrico-redondeado').removeAttr('hidden');

        // Marcar botones: horarios activo, biométrico inactivo
        $(this).addClass('active');
        $('#btn-biometrico-40lbs').removeClass('active');
    });
}


// ========================================
// SUMAS AUTOMATICAS PERCEPCIONES EXTRA
// ========================================

function sumasAutomaticasPercepciones() {

    // Evento cuando cambia cualquier percepción extra
    $(document).on('input', '.cantidad-percepcion', function () {
        calcularTotalPercepcionesEnTiempoReal();
    });

    // Evento cuando cambian horas extras, bono o actividades especiales
    $(document).on('input', '#mod-horas-extras-40lbs, #mod-bono-antiguedad-40lbs, #mod-actividades-especiales-40lbs, #mod-puesto-40lbs', function () {
        calcularTotalPercepcionesEnTiempoReal();
    });
}

function calcularTotalPercepcionesEnTiempoReal() {

    // Sumar percepciones extras del contenedor
    let totalExtras = 0;
    $('#contenedor-conceptos-adicionales-40lbs').find('.cantidad-percepcion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalExtras += cantidad;
    });

    // Sumar horas extras
    const horasExtras = parseFloat($('#mod-horas-extras-40lbs').val()) || 0;
    totalExtras += horasExtras;

    // Sumar bono de antiguedad
    const bonoAntiguedad = parseFloat($('#mod-bono-antiguedad-40lbs').val()) || 0;
    totalExtras += bonoAntiguedad;

    // Sumar actividades especiales
    const actividadesEspeciales = parseFloat($('#mod-actividades-especiales-40lbs').val()) || 0;
    totalExtras += actividadesEspeciales;

    // Sumar puesto
    const puesto = parseFloat($('#mod-puesto-40lbs').val()) || 0;
    totalExtras += puesto;

    // Establecer el total en el campo
    $('#mod-total-extra-40lbs').val(totalExtras.toFixed(2));
}


// ========================================
// SUMAS AUTOMATICAS CONCEPTOS
// ========================================

function sumasAutomaticasConceptos() {
    // Evento cuando cambia un concepto (ISR, IMSS, INFONAVIT, AJUSTES)
    $(document).on('input', '#mod-isr-40lbs, #mod-imss-40lbs, #mod-infonavit-40lbs, #mod-ajustes-sub-40lbs', function () {
        calcularTotalConceptosEnTiempoReal();
    });
}


function calcularTotalConceptosEnTiempoReal() {
    // Obtener valores de cada concepto
    const isr = parseFloat($('#mod-isr-40lbs').val()) || 0;
    const imss = parseFloat($('#mod-imss-40lbs').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-40lbs').val()) || 0;
    const ajustes = parseFloat($('#mod-ajustes-sub-40lbs').val()) || 0;

    // Sumar todos los conceptos
    const totalConceptos = isr + imss + infonavit + ajustes;

    // Actualizar el total en el campo readonly
    $('#mod-total-conceptos-40lbs').val(totalConceptos.toFixed(2));
    //calcularSueldoACobrarJornalero();
}

// ========================================
// ACTUALIZAR CONCEPTOS ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================


function actualizarConceptos() {
    $(document).on('click', '#btn-aplicar-isr-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '45') : null;
        if (!copia) {
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '45');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-isr-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-imss-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '52') : null;
        if (!copia) {
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '52');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-imss-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-infonavit-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '16') : null;
        if (!copia) {
            console.log("no");
            
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '16');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-infonavit-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

    $(document).on('click', '#btn-aplicar-ajuste-sub-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '107') : null;
        if (!copia) {
            return;
        }

        if (!Array.isArray(empleado.conceptos)) empleado.conceptos = [];
        let actual = empleado.conceptos.find(c => String(c.codigo) === '107');
        if (actual) {
            actual.resultado = copia.resultado;
            actual.nombre = actual.nombre || copia.nombre;
        } else {
            empleado.conceptos.push({ codigo: copia.codigo, nombre: copia.nombre, resultado: copia.resultado });
        }

        $('#mod-ajustes-sub-40lbs').val(copia.resultado);
        calcularTotalConceptosEnTiempoReal();
    });

 
    $(document).on('click', '#btn-aplicar-tarjeta-40lbs', function () {
       const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copiaTarjeta = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? empleado.tarjeta_copia : null;
        if (copiaTarjeta === null) {
            return;
        }

        // Actualizar la propiedad tarjeta con el valor de tarjeta_copia
        empleado.tarjeta = copiaTarjeta;
        // Actualizar input del modal
        $('#mod-tarjeta-40lbs').val(copiaTarjeta);
        //calcularSueldoACobrar();
    });
}

// ========================================
// VALIDAR CONCEPTOS MAXIMO ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================

function validarConceptoMax(inputSelector, codigo) {
    $(document).on('input', inputSelector, function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === String(codigo)) : null;
        if (!copia) return;

        const maxVal = parseFloat(copia.resultado) || 0;
        const $this = $(this);
        let val = parseFloat($this.val()) || 0;
        if (val > maxVal) {
            $this.val(maxVal);
        }
    });
}
function validarConceptoMaxTarjeta() {
       $(document).on('input', '#mod-tarjeta-40lbs', function () {
        const empleado = objEmpleado.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const maxVal = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? parseFloat(empleado.tarjeta_copia) : null;
        if (maxVal === null) return;

        const $this = $(this);
        let val = parseFloat($this.val()) || 0;
        if (val > maxVal) {
            $this.val(maxVal);
        }
    });

}

validarConceptoMax('#mod-isr-40lbs', '45');
validarConceptoMax('#mod-imss-40lbs', '52');
validarConceptoMax('#mod-infonavit-40lbs', '16');
validarConceptoMax('#mod-ajustes-sub-40lbs', '107');
validarConceptoMaxTarjeta();
    
