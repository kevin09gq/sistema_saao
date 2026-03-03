alternarTablasJornalero();
// ========================================
// ALTERNAR ENTRE TABLAS: BIOMÉTRICO Y DIAS TRABAJADOS
// ========================================
function alternarTablasJornalero() {
    // BOTÓN BIOMÉTRICO: Mostrar registros biométricos del checador
    $('#btn-biometrico-jornaleros').on('click', function () {
        // Mostrar tabla biométrico
        $('#tabla-biometrico-jornaleros').removeAttr('hidden');
        // Ocultar tabla de horarios oficiales
        $('#tabla-dias-trabajados-jornaleros').attr('hidden', 'hidden');

        // Marcar botones: biométrico activo, horarios inactivo
        $(this).addClass('active');
        $('#btn-dias-trabajados-jornaleros').removeClass('active');
    });

    // BOTÓN HORARIOS OFICIALES: Mostrar horarios de la base de datos
    $('#btn-dias-trabajados-jornaleros').on('click', function () {
        // Ocultar tabla biométrico
        $('#tabla-biometrico-jornaleros').attr('hidden', 'hidden');
        // Mostrar tabla de horarios oficiales
        $('#tabla-dias-trabajados-jornaleros').removeAttr('hidden');

        // Marcar botones: horarios activo, biométrico inactivo
        $(this).addClass('active');
        $('#btn-biometrico-jornaleros').removeClass('active');
    });
}

// ========================================
// SUMAS AUTOMATICAS PERCEPCIONES EXTRA
// ========================================

sumasAutomaticasPercepcionesJornalero();

function sumasAutomaticasPercepcionesJornalero() {

    // Evento cuando cambia una percepción extra o la tardeada
    $(document).on('input', '.cantidad-percepcion, #mod-tardeada-jornalero', function () {
        calcularTotalPercepcionesEnTiempoRealJornalero();
    });
}

function calcularTotalPercepcionesEnTiempoRealJornalero() {

    // Sumar todas las percepciones extras
    let totalExtras = 0;
    $('#contenedor-conceptos-adicionales-jornalero').find('.cantidad-percepcion').each(function () {
        const cantidad = parseFloat($(this).val()) || 0;
        totalExtras += cantidad;
    });
    // incluir tardeada en percepciones
    const tardeada = parseFloat($('#mod-tardeada-jornalero').val()) || 0;
    totalExtras += tardeada;
    $('#mod-total-extra-jornalero').val(totalExtras.toFixed(2));
    //calcularSueldoACobrar();
}



// ========================================
// SUMAS AUTOMATICAS CONCEPTOS
// ========================================

sumasAutomaticasConceptosJornalero();

function sumasAutomaticasConceptosJornalero() {
    // Evento cuando cambia un concepto (ISR, IMSS, INFONAVIT, AJUSTES)
    $(document).on('input', '#mod-isr-jornalero, #mod-imss-jornalero, #mod-infonavit-jornalero, #mod-ajustes-sub-jornalero', function () {
        calcularTotalConceptosEnTiempoRealJornalero();
    });
}

function calcularTotalConceptosEnTiempoRealJornalero() {
    // Obtener valores de cada concepto
    const isr = parseFloat($('#mod-isr-jornalero').val()) || 0;
    const imss = parseFloat($('#mod-imss-jornalero').val()) || 0;
    const infonavit = parseFloat($('#mod-infonavit-jornalero').val()) || 0;
    const ajustes = parseFloat($('#mod-ajustes-sub-jornalero').val()) || 0;

    // Sumar todos los conceptos
    const totalConceptos = isr + imss + infonavit + ajustes;

    // Actualizar el total en el campo readonly
    $('#mod-total-conceptos-jornalero').val(totalConceptos.toFixed(2));
   // calcularSueldoACobrar();
}


// ========================================
// ACTUALIZAR CONCEPTOS ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================
actualizarConceptosJornalero();

function actualizarConceptosJornalero() {
    $(document).on('click', '#btn-aplicar-isr-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

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

        $('#mod-isr-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });

    $(document).on('click', '#btn-aplicar-imss-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

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

        $('#mod-imss-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });

    $(document).on('click', '#mod-infonavit-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copia = Array.isArray(empleado.conceptos_copia) ? empleado.conceptos_copia.find(c => String(c.codigo) === '16') : null;
        if (!copia) {
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

        $('#mod-infonavit-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });

    $(document).on('click', '#btn-aplicar-ajuste-sub-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

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

        $('#mod-ajustes-sub-jornalero').val(copia.resultado);
        calcularTotalConceptosEnTiempoRealJornalero();
    });


    $(document).on('click', '#btn-aplicar-tarjeta-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

        // Si no hay empleado, salir
        if (!empleado) return;

        const copiaTarjeta = (empleado.tarjeta_copia !== undefined && empleado.tarjeta_copia !== null) ? empleado.tarjeta_copia : null;
        if (copiaTarjeta === null) {
            return;
        }

        // Actualizar la propiedad tarjeta con el valor de tarjeta_copia
        empleado.tarjeta = copiaTarjeta;
        // Actualizar input del modal
        $('#mod-tarjeta-jornalero').val(copiaTarjeta);
        // calcularSueldoACobrar();
    });
}


// ========================================
// VALIDAR CONCEPTOS MAXIMO ISR, IMSS, INFONAVIT AJUSTE AL SUB, TARJETA DEL EMPLEADO CON LOS VALORES DEL MODAL
// ========================================

function validarConceptoMaxJornalero(inputSelector, codigo) {
    $(document).on('input', inputSelector, function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

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
function validarConceptoMaxTarjetaJornalero() {
       $(document).on('input', '#mod-tarjeta-jornalero', function () {
        const empleado = objEmpleadoJornalero.getEmpleado();

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

validarConceptoMaxJornalero('#mod-isr-jornalero', '45');
validarConceptoMaxJornalero('#mod-imss-jornalero', '52');
validarConceptoMaxJornalero('#mod-infonavit-jornalero', '16');
validarConceptoMaxJornalero('#mod-ajustes-sub-jornalero', '107');
validarConceptoMaxTarjetaJornalero();
    