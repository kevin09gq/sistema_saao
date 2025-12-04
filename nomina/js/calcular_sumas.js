/*
 * ================================================================
 * MÓDULO DE CÁLCULO DE SUMAS TOTALES DE NÓMINA
 * ================================================================
 * Este módulo se encarga de:
 * - Calcular los totales de todos los conceptos de nómina
 * - Mostrar los resultados en el modal de sumas
 * - Procesar solo empleados del departamento 40 LIBRAS que estén registrados en BD
 * ================================================================
 */

$(document).ready(function () {

    /**
     * Función para obtener las claves de empleados registrados en BD
     * @param {Function} callback - Función callback que recibe las claves válidas
     */
    function obtenerClavesRegistradas(callback, nombreDepto) {
        // Obtener todas las claves de empleados del departamento seleccionado
        let claves = [];
        const filtroDepto = (nombreDepto || '').toUpperCase();
        if (window.jsonGlobal && window.jsonGlobal.departamentos) {
            window.jsonGlobal.departamentos.forEach(depto => {
                if ((depto.nombre || '').toUpperCase().includes(filtroDepto)) {
                    (depto.empleados || []).forEach(emp => {
                        if (emp.clave) {
                            claves.push(emp.clave);
                        }
                    });
                }
            });
        }

        // Validar claves con la base de datos
        $.ajax({
            type: "POST",
            url: "../php/validar_clave.php",
            data: JSON.stringify({ claves: claves }),
            contentType: "application/json",
            success: function (clavesValidasJSON) {
                const clavesValidas = JSON.parse(clavesValidasJSON);
                callback(clavesValidas);
            },
            error: function(xhr, status, error) {
               // En caso de error, devolver array vacío
                callback([]);
            }
        });
    }

    /**
     * Función para verificar si un empleado está registrado en BD
     * @param {string|number} clave - Clave del empleado
     * @param {Array} clavesRegistradas - Array de claves registradas en BD
     * @returns {boolean} - True si está registrado
     */
    function empleadoEstaRegistrado(clave, clavesRegistradas) {
        return clavesRegistradas.includes(String(clave)) || clavesRegistradas.includes(Number(clave));
    }

    /**
     * Función para abrir el modal de sumas y calcular totales
     */
    function abrirModalSumas() {
        // Tomar el departamento seleccionado del select principal
        const nombreDepto = ($('#departamentos-nomina').val() || 'PRODUCCION 40 LIBRAS');

        // Actualizar título si existe
        if ($('#modal_suma_titulo').length) {
            const titulo = nombreDepto.toUpperCase().includes('10') ? 'SUMA TOTAL DE 10 LIBRAS' : 'SUMA TOTAL DE 40 LIBRAS';
            $('#modal_suma_titulo').text(titulo);
        }

        // Calcular totales antes de mostrar el modal
        calcularTotalesNomina(nombreDepto);

        // Mostrar el modal (compatibilidad con distintos IDs)
        if ($('#modal_suma').length) {
            $('#modal_suma').modal('show');
        } else {
            $('#modal_sumas').modal('show');
        }
    }

    /**
     * Evento click para el botón de calcular sumas
     */
    $('#btn_suma').on('click', function () {
        abrirModalSumas();
       
    });

    /**
     * Función principal para calcular todos los totales de nómina
     * Recorre el jsonGlobal y suma todos los conceptos del departamento 40 LIBRAS
     * Solo incluye empleados registrados en la base de datos
     */
    function calcularTotalesNomina(nombreDeptoSeleccionado) {
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

        const nombreDepto = (nombreDeptoSeleccionado || 'PRODUCCION 40 LIBRAS');
        obtenerClavesRegistradas(function(clavesRegistradas) {
            let empleadosProcesados = 0;

            // Recorrer departamentos
            window.jsonGlobal.departamentos.forEach(depto => {
                // Solo procesar empleados del departamento seleccionado
                if ((depto.nombre || '').toUpperCase().includes(nombreDepto.toUpperCase())) {

                    // Recorrer empleados del departamento seleccionado
                    (depto.empleados || []).forEach(empleado => {
                        // Verificar si el empleado está registrado en BD
                        if (empleadoEstaRegistrado(empleado.clave, clavesRegistradas)) {
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
                        }
                    });
                }
            });

            // Actualizar el modal con los totales calculados
            actualizarModalConTotales(totales);
        }, nombreDepto);
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
     * Solo incluye empleados registrados en la base de datos
     * ================================================================
     */

    /**
     * Función para obtener todas las claves de empleados de todos los departamentos
     * @returns {Array} - Array con todas las claves de empleados
     */
    function clavesEmpleados() {
        let claves = [];
        if (jsonGlobal && jsonGlobal.departamentos) {
            jsonGlobal.departamentos.forEach(depto => {
                (depto.empleados || []).forEach(emp => {
                    if (emp.clave) {
                        claves.push(emp.clave);
                    }
                });
            });
        }
        return claves;
    }

    /**
     * Función para obtener las claves de empleados registrados en BD (dispersión)
     * @param {Function} callback - Función callback que recibe las claves válidas
     */
    function obtenerClavesRegistradasDispersion(callback) {
        // Obtener todas las claves de empleados de todos los departamentos
        const claves = clavesEmpleados();

        // Validar claves con la base de datos
        $.ajax({
            type: "POST",
            url: "../php/validar_clave.php",
            data: JSON.stringify({ claves: claves }),
            contentType: "application/json",
            success: function (clavesValidasJSON) {
                const clavesValidas = JSON.parse(clavesValidasJSON);
                callback(clavesValidas);
            },
            error: function(xhr, status, error) {
                // En caso de error, devolver array vacío
                callback([]);
            }
        });
    }

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
     * Solo incluye empleados registrados en la base de datos
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

        // Obtener claves registradas y luego calcular totales
        obtenerClavesRegistradasDispersion(function(clavesRegistradas) {
            // Recorrer todos los departamentos y todos los empleados
            window.jsonGlobal.departamentos.forEach(depto => {
                // Procesar empleados de todos los departamentos
                (depto.empleados || []).forEach(empleado => {
                    // Verificar si el empleado está registrado en BD
                    if (empleadoEstaRegistrado(empleado.clave, clavesRegistradas)) {
                        empleadosProcesados++;

                        // Sumar el sueldo neto (neto_pagar) de cada empleado registrado
                        const sueldoNeto = parseFloat(empleado.neto_pagar) || 0;
                        totalSueldoNeto += sueldoNeto;
                    }
                });
            });

            // Actualizar el modal con los totales calculados
            actualizarModalDispersionConTotales(totalSueldoNeto, empleadosProcesados);
        });
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

    /*
     * ================================================================
     * SECCIÓN DE EMPLEADOS SIN SEGURO
     * ================================================================
     * Esta sección maneja el modal de suma total para empleados sin seguro
     * Solo incluye empleados del departamento "SIN SEGURO"
     * ================================================================
     */

    /**
     * Función para abrir el modal de empleados sin seguro y calcular totales
     */
    function abrirModalSinSeguro() {
        // Calcular totales de empleados sin seguro antes de mostrar el modal
        calcularTotalesSinSeguro();

        // Mostrar el modal
        $('#modal_suma_sin_seguro').modal('show');
    }

    /**
     * Evento click para el botón de suma de empleados sin seguro
     */
    $('#btn_suma_sin_seguro').on('click', function () {
        abrirModalSinSeguro();
    });

    /**
     * Función para calcular todos los totales de empleados sin seguro
     * Recorre el jsonGlobal y suma todos los conceptos del departamento "SIN SEGURO"
     */
    function calcularTotalesSinSeguro() {
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

        let empleadosProcesados = 0;

        // Verificar que existe jsonGlobal
        if (!window.jsonGlobal || !window.jsonGlobal.departamentos) {
            actualizarModalSinSeguroConTotales(totales, empleadosProcesados);
            return;
        }

        // Detectar filtro actual (si existe): '40' o '10'
        const filtroTexto = (($('#filtro-puesto').val() || '') + '').toLowerCase();
        const exigir10 = filtroTexto.includes('10');
        const exigir40 = filtroTexto.includes('40');

        // Recorrer departamentos
        window.jsonGlobal.departamentos.forEach(depto => {
            // Solo procesar empleados del departamento "SIN SEGURO"
            if ((depto.nombre || '').toUpperCase().includes('SIN SEGURO')) {

                // Recorrer empleados del departamento SIN SEGURO
                (depto.empleados || []).forEach(empleado => {
                    const puestoEmp = ((empleado.puesto || '') + '').toLowerCase();
                    if (exigir10 && !puestoEmp.includes('10')) return;
                    if (exigir40 && !puestoEmp.includes('40')) return;
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
        actualizarModalSinSeguroConTotales(totales, empleadosProcesados);
    }

    /**
     * Función para actualizar el modal de empleados sin seguro con los totales calculados
     * @param {Object} totales - Objeto con todos los totales calculados
     * @param {number} empleadosProcesados - Número de empleados procesados
     */
    function actualizarModalSinSeguroConTotales(totales, empleadosProcesados) {
        // Función para formatear números con comas y decimales
        function formatearNumero(numero) {
            return numero.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        // Actualizar cada campo en el modal (con formato de comas)
        $('#suma_sin_seguro_sueldo_neto').text(formatearNumero(totales.sueldo_neto));
        $('#suma_sin_seguro_incentivo').text(formatearNumero(totales.incentivo));
        $('#suma_sin_seguro_extra').text(formatearNumero(totales.extra));
        $('#suma_sin_seguro_tarjeta').text(formatearNumero(totales.tarjeta));
        $('#suma_sin_seguro_prestamo').text(formatearNumero(totales.prestamo));
        $('#suma_sin_seguro_inasistencias').text(formatearNumero(totales.inasistencias));
        $('#suma_sin_seguro_uniformes').text(formatearNumero(totales.uniformes));
        $('#suma_sin_seguro_infonavit').text(formatearNumero(totales.infonavit));
        $('#suma_sin_seguro_isr').text(formatearNumero(totales.isr));
        $('#suma_sin_seguro_imss').text(formatearNumero(totales.imss));
        $('#suma_sin_seguro_checador').text(formatearNumero(totales.checador));
        $('#suma_sin_seguro_fa_gafet').text(formatearNumero(totales.fa_gafet));

        // Total final - SUELDO A COBRAR
        $('#suma_sin_seguro_sueldo_cobrar').text(formatearNumero(totales.sueldo_cobrar));
    }

});
