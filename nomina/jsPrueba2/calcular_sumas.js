/*
 * ================================================================
 * MÓDULO DE CÁLCULO DE SUMAS TOTALES DE NÓMINA
 * ================================================================
 * Este módulo se encarga de:
 * - Calcular los totales de todos los conceptos de nómina
 * - Mostrar los resultados en el modal de sumas
 * - Procesar solo empleados del departamento 40 LIBRAS
 * ================================================================
 */

$(document).ready(function () {

    /**
     * Función para abrir el modal de sumas y calcular totales
     */
    function abrirModalSumas() {
        // Calcular totales antes de mostrar el modal
        calcularTotalesNomina();

        // Mostrar el modal
        $('#modal_sumas').modal('show');
    }

    /**
     * Evento click para el botón de calcular sumas
     */
    $('#btn_suma').on('click', function () {
        abrirModalSumas();
        console.log(jsonGlobal)
    });

    /**
     * Función principal para calcular todos los totales de nómina
     * Recorre el jsonGlobal y suma todos los conceptos del departamento 40 LIBRAS
     */
    function calcularTotalesNomina() {
        // Inicializar totales
        let totales = {
            sueldo_neto: 0,
            incentivo: 0,
            extra: 0,
            tarjeta: 0,
            prestamo: 0,
            inasistencias: 0,
            uniformes: 0,
            infonavit: 0,
            isr: 0,
            imss: 0,
            checador: 0,
            fa_gafet: 0,
            sueldo_cobrar: 0
        };

        // Verificar que existe jsonGlobal
        if (!window.jsonGlobal || !window.jsonGlobal.departamentos) {
            actualizarModalConTotales(totales);
            return;
        }

        let empleadosProcesados = 0;

        // Recorrer departamentos
        window.jsonGlobal.departamentos.forEach(depto => {
            // Solo procesar empleados del departamento "PRODUCCION 40 LIBRAS"
            if ((depto.nombre || '').toUpperCase().includes('PRODUCCION 40 LIBRAS')) {

                // Recorrer empleados del departamento 40 LIBRAS
                (depto.empleados || []).forEach(empleado => {
                    empleadosProcesados++;

                    // === PERCEPCIONES ===
                    totales.sueldo_neto += parseFloat(empleado.sueldo_base) || 0;
                    totales.incentivo += parseFloat(empleado.incentivo) || 0;
                    totales.extra += parseFloat(empleado.sueldo_extra_final) || parseFloat(empleado.sueldo_extra) || 0;

                    // === DEDUCCIONES ===
                    totales.tarjeta += parseFloat(empleado.neto_pagar) || 0;
                    totales.prestamo += parseFloat(empleado.prestamo) || 0;
                    totales.inasistencias += parseFloat(empleado.inasistencias_descuento) || 0;
                    totales.uniformes += parseFloat(empleado.uniformes) || 0;
                    totales.checador += parseFloat(empleado.checador) || 0;
                    totales.fa_gafet += parseFloat(empleado.fa_gafet_cofia) || 0;

                    // === CONCEPTOS (ISR, IMSS, INFONAVIT) ===
                    const conceptos = empleado.conceptos || [];
                    conceptos.forEach(concepto => {
                        if (concepto.codigo === '45') { // ISR
                            totales.isr += parseFloat(concepto.resultado) || 0;
                        } else if (concepto.codigo === '52') { // IMSS
                            totales.imss += parseFloat(concepto.resultado) || 0;
                        } else if (concepto.codigo === '16') { // INFONAVIT
                            totales.infonavit += parseFloat(concepto.resultado) || 0;
                        }
                    });

                    // === SUELDO A COBRAR ===
                    totales.sueldo_cobrar += parseFloat(empleado.sueldo_a_cobrar) || 0;
                });
            }
        });

        // Actualizar el modal con los totales calculados
        actualizarModalConTotales(totales);
    }

    /**
     * Función para actualizar el modal con los totales calculados
     * @param {Object} totales - Objeto con todos los totales calculados
     */
    function actualizarModalConTotales(totales) {
        // Función para formatear números con comas y decimales
        function formatearNumero(numero) {
            return numero.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Actualizar cada campo en el modal (con formato de comas)
        $('#suma_sueldo_neto').text(formatearNumero(totales.sueldo_neto));
        $('#suma_incentivo').text(formatearNumero(totales.incentivo));
        $('#suma_extra').text(formatearNumero(totales.extra));
        $('#suma_tarjeta').text(formatearNumero(totales.tarjeta));
        $('#suma_prestamo').text(formatearNumero(totales.prestamo));
        $('#suma_inasistencias').text(formatearNumero(totales.inasistencias));
        $('#suma_uniformes').text(formatearNumero(totales.uniformes));
        $('#suma_infonavit').text(formatearNumero(totales.infonavit));
        $('#suma_isr').text(formatearNumero(totales.isr));
        $('#suma_imss').text(formatearNumero(totales.imss));
        $('#suma_checador').text(formatearNumero(totales.checador));
        $('#suma_fa_gafet').text(formatearNumero(totales.fa_gafet));

        // Total final - SUELDO A COBRAR
        $('#suma_sueldo_cobrar').text(formatearNumero(totales.sueldo_cobrar));

    }

    /*
     * ================================================================
     * SECCIÓN DE DISPERSIÓN DE TARJETA
     * ================================================================
     * Esta sección maneja el modal de suma total de dispersión de tarjeta
     * ================================================================
     */

    /**
     * Función para abrir el modal de dispersión y calcular totales
     */
    function abrirModalDispersion() {
        // Calcular totales de dispersión antes de mostrar el modal
        calcularTotalesDispersion();

        // Mostrar el modal
        $('#modal_suma_dispersion').modal('show');
    }

    /**
     * Evento click para el botón de suma de dispersión
     */
    $('#btn_suma_dispersion').on('click', function () {
        abrirModalDispersion();
    });

    /**
     * Función para calcular el total de sueldo neto de todos los empleados
     * en la tabla de dispersión (todos los departamentos)
     */
    function calcularTotalesDispersion() {
        // Inicializar totales
        let totalSueldoNeto = 0;
        let empleadosProcesados = 0;

        // Verificar que existe jsonGlobal
        if (!window.jsonGlobal || !window.jsonGlobal.departamentos) {
            actualizarModalDispersionConTotales(0, 0);
            return;
        }

        // Recorrer todos los departamentos y todos los empleados
        window.jsonGlobal.departamentos.forEach(depto => {
            // Procesar empleados de todos los departamentos
            (depto.empleados || []).forEach(empleado => {
                empleadosProcesados++;

                // Sumar el sueldo neto (neto_pagar) de cada empleado
                const sueldoNeto = parseFloat(empleado.neto_pagar) || 0;
                totalSueldoNeto += sueldoNeto;
            });
        });

        // Actualizar el modal con los totales calculados
        actualizarModalDispersionConTotales(totalSueldoNeto, empleadosProcesados);
    }

    /**
     * Función para actualizar el modal de dispersión con los totales calculados
     * @param {number} totalSueldoNeto - Total del sueldo neto de todos los empleados
     * @param {number} empleadosProcesados - Número de empleados procesados
     */
    function actualizarModalDispersionConTotales(totalSueldoNeto, empleadosProcesados) {
        // Función para formatear números con comas y decimales
        function formatearNumero(numero) {
            return numero.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Actualizar el total en el modal (sin símbolo de dólar)
        $('#total_tarjeta_dispersion').text(formatearNumero(totalSueldoNeto));

        // Actualizar el número de empleados procesados
        $('#empleados_count_dispersion').text(empleadosProcesados);
    }

});
