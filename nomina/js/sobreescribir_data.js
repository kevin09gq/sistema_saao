
// Función para sobrescribir únicamente la propiedad 'registros' desde el JSON de horarios (json2)
// hacia el JSON destino (jsonGlobal o similar), SOLO para departamentos Producción 40/10 Libras.
function sobrescribirRegistrosDesdeHorarios(jsonDestino, jsonHorarios, jsonNomina) {
    if (!jsonDestino || !jsonDestino.departamentos || !jsonHorarios || !jsonHorarios.empleados) return;

    const normalizar = s => (s || "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase()
        .split(" ")
        .sort()
        .join(" ");

    const empleados2Map = {};
    jsonHorarios.empleados.forEach(emp => {
        empleados2Map[normalizar(emp.nombre)] = emp;
    });

    // Mapa de neto_pagar desde jsonNomina (leer_excel_backend.php), si está disponible
    const netoMap = {};
    if (jsonNomina && Array.isArray(jsonNomina.departamentos)) {
        jsonNomina.departamentos.forEach(depto => {
            const nombreDepto = (depto.nombre || '').toUpperCase();
            const esProd = nombreDepto.includes('PRODUCCION 40 LIBRAS') || nombreDepto.includes('PRODUCCION 10 LIBRAS');
            if (!esProd || !Array.isArray(depto.empleados)) return;
            depto.empleados.forEach(emp => {
                const key = normalizar(emp.nombre);
                if (emp.hasOwnProperty('neto_pagar')) {
                    netoMap[key] = emp.neto_pagar;
                }
            });
        });
    }

    // 1) Actualizar registros y neto_pagar_original para empleados existentes (Producción 40/10 y SIN SEGURO)
    jsonDestino.departamentos.forEach(depto => {
        const nombre = (depto.nombre || '').toUpperCase();
        const esProduccion40 = nombre.includes('PRODUCCION 40 LIBRAS');
        const esProduccion10 = nombre.includes('PRODUCCION 10 LIBRAS');
        const esSinSeguro   = nombre.includes('SIN SEGURO');
        if (!(esProduccion40 || esProduccion10 || esSinSeguro)) return;

        if (Array.isArray(depto.empleados)) {
            depto.empleados.forEach(emp => {
                const key = normalizar(emp.nombre);
                const empHorario = empleados2Map[key];
                if (empHorario && Array.isArray(empHorario.registros)) {
                    emp.registros = empHorario.registros;
                }
                if (netoMap.hasOwnProperty(key)) {
                    emp.neto_pagar_original = netoMap[key];
                }
                        // Asegurar propiedad redondeo por defecto
                        if (emp.redondeo === undefined) {
                            emp.redondeo = false;
                        }
                        // Asegurar propiedad redondeo_cantidad por defecto
                        if (emp.redondeo_cantidad === undefined) {
                            emp.redondeo_cantidad = 0;
                        }
            });
        }
    });

    // 2) Agregar nuevos empleados y mover empleados de departamento según jsonNomina
    try {
        if (jsonNomina && Array.isArray(jsonNomina.departamentos)) {
            // Construir índice de departamentos destino por nombre en mayúsculas
            const idxDeptoDestino = new Map();
            jsonDestino.departamentos.forEach(d => idxDeptoDestino.set((d.nombre || '').toUpperCase(), d));

            // Helper: asegurar que exista el departamento en jsonDestino
            function asegurarDepto(nombreDeptoOriginal) {
                const nombreUpper = (nombreDeptoOriginal || '').toUpperCase();
                let depto = idxDeptoDestino.get(nombreUpper);
                if (!depto) {
                    depto = { nombre: nombreDeptoOriginal, empleados: [] };
                    jsonDestino.departamentos.push(depto);
                    idxDeptoDestino.set(nombreUpper, depto);
                }
                return depto;
            }

            // Recorrer departamentos relevantes de jsonNomina
            jsonNomina.departamentos.forEach(deptoNom => {
                const nombreUpper = (deptoNom.nombre || '').toUpperCase();
                const esRelevante = nombreUpper.includes('PRODUCCION 40 LIBRAS') || nombreUpper.includes('PRODUCCION 10 LIBRAS') || nombreUpper.includes('SIN SEGURO');
                if (!esRelevante || !Array.isArray(deptoNom.empleados)) return;

                const deptoDestino = asegurarDepto(deptoNom.nombre);
                const esDeptoSinSeguroDestino = nombreUpper.includes('SIN SEGURO');

                deptoNom.empleados.forEach(empNom => {
                    const keyNom = normalizar(empNom.nombre);
                    const claveNom = String(empNom.clave || '');

                    // Buscar empleado en cualquier departamento del destino por clave o nombre normalizado
                    let deptoActual = null, indexActual = -1;
                    for (const d of jsonDestino.departamentos) {
                        const arr = d.empleados || [];
                        indexActual = arr.findIndex(e => (e && (String(e.clave || '') === claveNom && claveNom !== '')) || normalizar(e.nombre) === keyNom);
                        if (indexActual !== -1) { deptoActual = d; break; }
                    }

                    // Armar merge de datos base preservando info existente
                    const datosHorario = empleados2Map[keyNom];
                    const registros = Array.isArray(datosHorario?.registros) ? datosHorario.registros : undefined;
                    const netoOriginal = netoMap.hasOwnProperty(keyNom) ? netoMap[keyNom] : undefined;

                    if (!deptoActual) {
                        // No existe: agregar como nuevo al departamento destino
                        const nuevoEmp = { ...empNom };
                        if (registros) nuevoEmp.registros = registros;
                        if (typeof netoOriginal !== 'undefined') nuevoEmp.neto_pagar_original = netoOriginal;
                        // Para SIN SEGURO, asegurar que 'puesto' quede según la fuente si viene
                        if (esDeptoSinSeguroDestino && typeof empNom.puesto === 'string' && empNom.puesto.trim() !== '') {
                            nuevoEmp.puesto = empNom.puesto.trim();
                        }
                        // Inicializaciones mínimas si faltan
                        if (typeof nuevoEmp.incentivo === 'undefined') nuevoEmp.incentivo = 250;
                        if (typeof nuevoEmp.sueldo_extra_final === 'undefined') nuevoEmp.sueldo_extra_final = nuevoEmp.sueldo_extra || 0;
                        if (typeof nuevoEmp.prestamo === 'undefined') nuevoEmp.prestamo = 0;
                        if (typeof nuevoEmp.uniformes === 'undefined') nuevoEmp.uniformes = 0;
                        if (typeof nuevoEmp.checador === 'undefined') nuevoEmp.checador = 0;
                        if (typeof nuevoEmp.fa_gafet_cofia === 'undefined') nuevoEmp.fa_gafet_cofia = 0;
                        if (typeof nuevoEmp.inasistencias_minutos === 'undefined') nuevoEmp.inasistencias_minutos = 0;
                        if (typeof nuevoEmp.inasistencias_descuento === 'undefined') nuevoEmp.inasistencias_descuento = 0;
                        if (typeof nuevoEmp.sueldo_a_cobrar === 'undefined') nuevoEmp.sueldo_a_cobrar = 0;
                        // Inicializar flag de redondeo
                        if (typeof nuevoEmp.redondeo === 'undefined') nuevoEmp.redondeo = false;
                        // Inicializar propiedad redondeo_cantidad
                        if (typeof nuevoEmp.redondeo_cantidad === 'undefined') nuevoEmp.redondeo_cantidad = 0;
                        if (!Array.isArray(nuevoEmp.conceptos_adicionales)) nuevoEmp.conceptos_adicionales = [];
                        if (typeof nuevoEmp.bono_antiguedad === 'undefined') nuevoEmp.bono_antiguedad = 0;
                        if (typeof nuevoEmp.actividades_especiales === 'undefined') nuevoEmp.actividades_especiales = 0;
                        if (typeof nuevoEmp.bono_puesto === 'undefined') nuevoEmp.bono_puesto = 0;

                        if (!Array.isArray(deptoDestino.empleados)) deptoDestino.empleados = [];
                        deptoDestino.empleados.push(nuevoEmp);
                    } else {
                        // Existe: mover si cambió de departamento y preservar datos
                        if (deptoActual !== deptoDestino) {
                            const empExistente = deptoActual.empleados[indexActual];
                            // Remover del depto actual
                            deptoActual.empleados.splice(indexActual, 1);
                            // Actualizar registros/neto_pagar_original si aplica
                            if (registros) empExistente.registros = registros;
                            if (typeof netoOriginal !== 'undefined') empExistente.neto_pagar_original = netoOriginal;
                            // Para SIN SEGURO, actualizar 'puesto' si se provee en la fuente
                            if (esDeptoSinSeguroDestino && typeof empNom.puesto === 'string' && empNom.puesto.trim() !== '') {
                                empExistente.puesto = empNom.puesto.trim();
                            }
                            // Agregar al nuevo depto
                            if (!Array.isArray(deptoDestino.empleados)) deptoDestino.empleados = [];
                            deptoDestino.empleados.push(empExistente);
                        } else {
                            // Mismo depto: solo actualizar registros y neto_pagar_original si aplica
                            const empExistente = deptoActual.empleados[indexActual];
                            if (registros) empExistente.registros = registros;
                            if (typeof netoOriginal !== 'undefined') empExistente.neto_pagar_original = netoOriginal;
                            // Asegurar propiedad redondeo si no existía
                            if (empExistente.redondeo === undefined) empExistente.redondeo = false;
                            // Asegurar propiedad redondeo_cantidad si no existía
                            if (empExistente.redondeo_cantidad === undefined) empExistente.redondeo_cantidad = 0;
                            // Para SIN SEGURO dentro del mismo depto, también refrescar 'puesto' si viene
                            if (esDeptoSinSeguroDestino && typeof empNom.puesto === 'string' && empNom.puesto.trim() !== '') {
                                empExistente.puesto = empNom.puesto.trim();
                            }
                        }
                    }
                });
            });
        }
    } catch (e) { /* noop */ }
}


// Listener para aplicar el filtro de departamento en la tabla principal cuando cambie el select
$(document).ready(function() {
    $(document).on('change', '#departamentos-nomina', function() {
        if (window.empleadosOriginales && window.empleadosOriginales.length > 0) {
            setEmpleadosPaginados(window.empleadosOriginales);
        }
        
    });
    
    // Listener para el filtro de categoría en la tabla de empleados sin seguro
    $(document).on('change', '#filtro-puesto', function() {
        const filtroPuesto = $(this).val();
        // Guardar el filtro actual en la variable global
        window.filtroPuestoSinSeguro = filtroPuesto;
        // Resetear a la primera página cuando se cambia el filtro
        paginaActualSinSeguro = 1;
        mostrarEmpleadosSinSeguro(false, filtroPuesto);
    });
    
    // Inicializar el filtro actual
    if (typeof window.filtroPuestoSinSeguro === 'undefined') {
        window.filtroPuestoSinSeguro = 'Produccion 40 Libras';
    }

    // Aplicar Tarjeta a todos: establece neto_pagar desde neto_pagar_original y refresca la tabla principal (con confirmación)
    $(document).on('click', '#btn_aplicar_tarjeta', function(e) {
        e.preventDefault();
        if (!window.jsonGlobal || !Array.isArray(window.jsonGlobal.departamentos)) return;

        // Confirmación SweetAlert2
        Swal.fire({
            title: '¿Aplicar Tarjeta a todos?',
            text: 'Se actualizará la Tarjeta (neto_pagar) de todos los empleados con su valor original.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aplicar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (!result.isConfirmed) return;

            // Actualizar jsonGlobal
            window.jsonGlobal.departamentos.forEach(depto => {
                (depto.empleados || []).forEach(emp => {
                    if (emp && typeof emp.neto_pagar_original !== 'undefined') {
                        emp.neto_pagar = emp.neto_pagar_original;
                    }
                });
            });

            // Actualizar espejos en memoria
            if (Array.isArray(window.empleadosOriginales)) {
                window.empleadosOriginales.forEach(emp => {
                    if (typeof emp.neto_pagar_original !== 'undefined') {
                        emp.neto_pagar = emp.neto_pagar_original;
                    }
                    if (typeof calcularSueldoACobraPorEmpleado === 'function') {
                        calcularSueldoACobraPorEmpleado(emp);
                    }
                });
            }
            if (Array.isArray(window.empleadosFiltrados)) {
                window.empleadosFiltrados.forEach(emp => {
                    if (typeof emp.neto_pagar_original !== 'undefined') {
                        emp.neto_pagar = emp.neto_pagar_original;
                    }
                });
            }

            // Refrescar la tabla principal de nómina
            if (typeof setEmpleadosPaginados === 'function' && Array.isArray(window.empleadosOriginales)) {
                setEmpleadosPaginados(window.empleadosOriginales);
            } else if (typeof mostrarDatosTabla === 'function') {
                mostrarDatosTabla();
            }

            // Guardar
            if (typeof guardarDatosNomina === 'function') {
                guardarDatosNomina();
            }

            // Notificación de éxito
            Swal.fire({
                icon: 'success',
                title: 'Aplicado',
                text: 'La Tarjeta se aplicó a todos los empleados.',
                timer: 1500,
                showConfirmButton: false
            });
        });
    });
});