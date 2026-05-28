
/**
 * Evento para abrir el modal de las configuraciones
 */
$('#btn_configuracion').click(function (e) {
    e.preventDefault();
    // ABRIR EL MODAL DE CONFIGURACIÓN
    modal_configuracion.show();
});


/**
 * PROCESAR LOS DATOS DEL EXCEL DE LAS RAYAS Y AUSENCIAS
 */
$("#form_subir_archivos_raya").submit(function (e) {
    e.preventDefault();

    // Recuperar los 4 archivos
    const archivoRayaSAAO = $("#archivo_lista_raya")[0].files[0];
    const archivoRayaSB = $("#archivo_lista_raya_sb")[0].files[0];

    // Validar que al menos uno de los 4 archivos esté cargado
    if (!archivoRayaSAAO && !archivoRayaSB) {
        alerta("warning", "Archivo requerido.", "Debes seleccionar al menos un archivo para continuar.");
        return;
    }

    // Mostrar un loader mientras se procesa
    Swal.fire({
        title: 'Procesando archivos...',
        text: 'Por favor, espera.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Array para almacenar todas las promesas
    const promesas = [];
    const tiposArchivos = [];

    // Petición para Raya SAAO
    if (archivoRayaSAAO) {
        const formData = new FormData();
        formData.append('archivo_lista_raya', archivoRayaSAAO);
        promesas.push(
            $.ajax({
                url: '../php/procesar_raya.php',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json'
            })
        );
        tiposArchivos.push('raya_saao');
    }

    // Petición para Raya SB
    if (archivoRayaSB) {
        const formData = new FormData();
        formData.append('archivo_lista_raya', archivoRayaSB);
        promesas.push(
            $.ajax({
                url: '../php/procesar_raya.php',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json'
            })
        );
        tiposArchivos.push('raya_sb');
    }


    // Ejecutar todas las promesas
    Promise.all(promesas)
        .then((resultados) => {
            Swal.close();

            // 1. Mapear resultados con sus tipos
            const datosProcessados = {};
            resultados.forEach((resultado, index) => {
                const tipoArchivo = tiposArchivos[index];
                
                // La respuesta ahora es un objeto con estructura
                datosProcessados[tipoArchivo] = resultado.empleados || [];
                
                // Mostrar estadísticas de fechas
                const conFecha = resultado.empleados.filter(emp => emp.fecha_ingreso_imss).length;
                const sinFecha = resultado.total_empleados - conFecha;
                // console.log(`  📅 Con fecha: ${conFecha} | Sin fecha: ${sinFecha}`);
                
                // Mostrar tabla con primeros 5 empleados y sus fechas
                // console.table(resultado.empleados.slice(0, 5).map(emp => ({
                //     clave: emp.clave_empleado,
                //     nombre: emp.nombre,
                //     fecha: emp.fecha_ingreso_imss || 'SIN FECHA',
                //     tarjeta: emp.tarjeta
                // })));
            });

            // 2. Unir la información con jsonAguinaldo
            unirDatos(datosProcessados);

            // 3 MOSTRAR TABLA PRINCIPAL CON LOS DATOS PROCESADOS
            llenar_tabla_ptu();

            // 4. Cerrar el modal
            modal_configuracion.hide();

            // 5. Mostrar mensaje de éxito
            alerta("success", "Archivos procesados", "Los archivos se han procesado correctamente.");

        })
        .catch(error => {
            Swal.close();
            console.error("Error en el procesamiento:", error);
            alerta("error", "Error el procesar", "Error: " + error.responseText);
        });
});

/**
 * Función para unir los datos procesados
 * Se encarga de unir la información de las rayas y las ausencias
 * con el jsonAguinaldo, de esta forma a cada empleado se le asigna
 * el ISR y la Tarjeta y Ausencias
 * @param {Object} datosProcessados - Objeto con los datos procesados de las rayas y ausencias
 */
function unirDatos(datosProcessados) {

    // =========================================================================
    // COMBINAR DATOS DE RAYA DE AMBAS EMPRESAS
    // =========================================================================
    const datosRaya = [];

    if (datosProcessados.raya_saao && Array.isArray(datosProcessados.raya_saao)) {
        datosRaya.push(...datosProcessados.raya_saao);
    }

    if (datosProcessados.raya_sb && Array.isArray(datosProcessados.raya_sb)) {
        datosRaya.push(...datosProcessados.raya_sb);
    }

    // =========================================================================
    // RECUPERAR JSON ACTUAL
    // =========================================================================
    let json = getUtilidad();

    // console.log("===== Datos de raya recibidos =====");
    // console.table(datosRaya);
    
    // console.log("=====  Empleados en json.empleados =====");
    // console.table(json.empleados.map(emp => ({
    //     clave: emp.clave_empleado,
    //     nombre: emp.nombre,
    //     empresa: emp.id_empresa
    // })));

    // =========================================================================
    // PROCESAR DATOS DE RAYA
    // =========================================================================
    datosRaya.forEach(raya => {

        // La clave puede repetirse entre empresas,
        // por eso se valida también el id_empresa
        const empleadoEncontrado = json.empleados.find(emp =>
            String(emp.clave_empleado).trim() === String(raya.clave_empleado).trim() &&
            Number(emp.id_empresa) === Number(raya.id_empresa)
        );

        if (empleadoEncontrado) {

            // =============================================================
            // TARJETA
            // =============================================================
            empleadoEncontrado.tarjeta = raya.tarjeta || empleadoEncontrado.tarjeta || 0;

            // COPIA TEMPORAL
            empleadoEncontrado.tarjeta_copia = empleadoEncontrado.tarjeta;
            
            // =============================================================
            // FECHA INGRESO IMSS (si viene del Excel)
            // =============================================================
            if (raya.fecha_ingreso_imss) {
                empleadoEncontrado.fecha_ingreso_imss = raya.fecha_ingreso_imss;
                empleadoEncontrado.fecha_ingreso_imss_copia = raya.fecha_ingreso_imss;
            }
            
            // console.log(`✓ Encontrado: ${raya.clave_empleado} - ${raya.nombre} - Empresa: ${raya.id_empresa} - Tarjeta: ${raya.tarjeta} - Fecha: ${raya.fecha_ingreso_imss || 'N/A'}`);
        } else {
            console.warn(`✗ No encontrado: Clave: "${raya.clave_empleado}" | Nombre: "${raya.nombre}" | Empresa: ${raya.id_empresa}`);
            
            /**
             * =============================================================================
             * ESTO DE AQUI ME LO DIO CHAT, MEJOR LO 
             * DEJO POR SI ALGO FALLA
             * =============================================================================
             */
            // Debug: Buscar por clave sin importar empresa
            const empleadosPorClave = json.empleados.filter(emp => 
                String(emp.clave_empleado).trim() === String(raya.clave_empleado).trim()
            );
            
            if (empleadosPorClave.length > 0) {
                console.warn(`==== Encontrado por clave pero con empresa diferente:`);
                empleadosPorClave.forEach(emp => {
                    console.warn(`    - Clave: "${raya.clave_empleado}" | Nombre: "${raya.nombre}" | Empresa: ${raya.id_empresa}`);
                });
            }
        }
    });

    // CREAR UNA COPIA TEMPORAL DE LOS EMPLEADOS ANTES DE CALCULAR LOS VALORES
    let empleados_tmp = json.empleados;
    let anio = json.anio;

    // CALCULAR LOS VALORES DE LOS EMPLEADOS CON LA INFORMACIÓN DE LAS RAYAS
    json.empleados = calcular_valores(json.empleados, anio);

    // =========================================================================
    // ACTUALIZAR CONFIGURACIÓN
    // =========================================================================
    json.configuraciones = 1;

    // =========================================================================
    // GUARDAR JSON
    // =========================================================================
    setUtilidad(json);
}