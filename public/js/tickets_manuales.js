// Variables para controlar qué modal está activo
let activeModalType = null;

// Función para abrir el modal de nómina regular
function openNominaModal() {
    activeModalType = 'regular';
    
    // Cargar el CSS y JS específico de nómina regular
    loadNominaStylesAndScripts(function() {
        // Mostrar el modal de nómina regular
        const modalElement = document.getElementById('modalTicketManual');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Inicializar autocompletado después de mostrar el modal
            setTimeout(function() {
                // Inicializar autocompletado dentro del modal específico
                setupAutocompletadoNomina(modalElement);
            }, 300);
        } else {
            alert('Error: No se encontró el modal de nómina regular');
        }
    });
}

// Función para abrir el modal de nómina confianza
function openNominaConfianzaModal() {
    activeModalType = 'confianza';
    
    // Cargar el CSS y JS específico de nómina confianza
    loadNominaConfianzaStylesAndScripts(function() {
        // Mostrar el modal de nómina confianza
        const modalElement = document.getElementById('modalTicketManualConfianza');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Inicializar autocompletado después de mostrar el modal
            setTimeout(function() {
                // Inicializar autocompletado dentro del modal específico
                setupAutocompletadoConfianza(modalElement);
            }, 300);
        } else {
            alert('Error: No se encontró el modal de nómina confianza');
        }
    });
}

// Cargar estilos y scripts de nómina regular
function loadNominaStylesAndScripts(callback) {
    callback = callback || function() {};
    
    // Verificar si ya están cargados
    if (!document.querySelector('link[href*="nomina/styles/ticket_manual.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = rutaRaiz + '/nomina/styles/ticket_manual.css';
        document.head.appendChild(link);
    }
    
    if (!window.nominaTicketManualLoaded) {
        const script = document.createElement('script');
        script.src = rutaRaiz + '/nomina/js/ticket_manual.js';
        script.onload = function() {
            window.nominaTicketManualLoaded = true;
            callback();
        };
        document.body.appendChild(script);
    } else {
        callback();
    }
}

// Cargar estilos y scripts de nómina confianza
function loadNominaConfianzaStylesAndScripts(callback) {
    callback = callback || function() {};
    
    // Verificar si ya están cargados
    // Forzar recarga (cache-bust) por sesión para que se reflejen cambios de CSS
    if (!window.nominaConfianzaTicketManualCssVersion) {
        window.nominaConfianzaTicketManualCssVersion = Date.now();
    }
    const cssHref = rutaRaiz + '/nomina_confianza/css/ticket_manual.css?v=' + window.nominaConfianzaTicketManualCssVersion;

    // Si quedó un <link> viejo (sin versionado), eliminarlo para evitar que se imponga el estilo anterior
    document.querySelectorAll('link[href*="/nomina_confianza/css/ticket_manual.css"]').forEach(function(l) {
        if (l.getAttribute('data-ticket-manual') !== 'confianza') {
            l.parentNode && l.parentNode.removeChild(l);
        }
    });

    let link = document.querySelector('link[data-ticket-manual="confianza"]');
    if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.setAttribute('data-ticket-manual', 'confianza');
        document.head.appendChild(link);
    }
    // Siempre asignar el href para asegurar que tome la versión correcta
    link.href = cssHref;
    
    if (!window.nominaConfianzaTicketManualLoaded) {
        const script = document.createElement('script');
        script.src = rutaRaiz + '/nomina_confianza/js/ticket_manual.js';
        script.onload = function() {
            window.nominaConfianzaTicketManualLoaded = true;
            callback();
        };
        document.body.appendChild(script);
    } else {
        callback();
    }
}

// Función para inicializar autocompletado en el modal de nómina regular
function setupAutocompletadoNomina(modalElement) {
    if (!modalElement) return;
    
    const inputClave = modalElement.querySelector('#input_clave');
    const suggestionsClave = modalElement.querySelector('#suggestions_clave');
    const inputNombre = modalElement.querySelector('#input_nombre');
    const suggestionsNombre = modalElement.querySelector('#suggestions_nombre');
    const form = modalElement.querySelector('#formTicketManual');
    
    if (!inputClave || !suggestionsClave || !inputNombre || !suggestionsNombre || !form) return;
    
    // Prevenir submit tradicional y usar AJAX
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generarTicketManualNomina(form);
    });
    
    let timeoutBusqueda = null;
    
    // Helper: asigna valor solo si existe el input
    function setInputValue(selector, value) {
        const els = form.querySelectorAll(selector);
        if (!els || els.length === 0) return;
        els.forEach(el => {
            el.value = value;
        });
    }

    // Botones para limpiar clave / nombre
    const btnClearClave = modalElement.querySelector('.btn-clear-clave');
    const btnClearNombre = modalElement.querySelector('.btn-clear-nombre');

    function limpiarEmpleado() {
        setInputValue('input[name="clave"]', '');
        setInputValue('input[name="nombre"]', '');
        setInputValue('input[name="departamento"]', '');
        setInputValue('input[name="rfc_empleado"]', '');
        setInputValue('input[name="imss"]', '');
        setInputValue('input[name="nombre_puesto"]', '');
        setInputValue('input[name="fecha_ingreso"]', '');
        setInputValue('input[name="salario_diario"]', '');
        setInputValue('input[name="salario_semanal"]', '');
        suggestionsClave.style.display = 'none';
        suggestionsNombre.style.display = 'none';
        inputClave && inputClave.focus();
    }

    if (btnClearClave) {
        btnClearClave.addEventListener('click', function() {
            limpiarEmpleado();
        });
    }
    if (btnClearNombre) {
        btnClearNombre.addEventListener('click', function() {
            limpiarEmpleado();
        });
    }
    
    // Función para cargar datos del empleado
    function cargarDatosEmpleado(empleado) {
        setInputValue('input[name="clave"]', empleado.clave_empleado || '');
        setInputValue('input[name="nombre"]', empleado.nombre_completo || '');
        setInputValue('input[name="departamento"]', empleado.departamento || '');
        setInputValue('input[name="rfc_empleado"]', empleado.rfc_empleado || '');
        setInputValue('input[name="imss"]', empleado.imss || '');
        setInputValue('input[name="nombre_puesto"]', empleado.puesto || '');
        setInputValue('input[name="fecha_ingreso"]', empleado.fecha_ingreso || '');
        setInputValue('input[name="salario_diario"]', empleado.salario_diario || '0.00');
        setInputValue('input[name="salario_semanal"]', empleado.salario_semanal || '0.00');
        
        suggestionsClave.style.display = 'none';
        suggestionsNombre.style.display = 'none';
    }
    
    // Autocompletado por clave
    inputClave.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length === 0) {
            suggestionsClave.style.display = 'none';
            setInputValue('input[name="nombre"]', '');
            setInputValue('input[name="departamento"]', '');
            setInputValue('input[name="rfc_empleado"]', '');
            setInputValue('input[name="imss"]', '');
            setInputValue('input[name="nombre_puesto"]', '');
            setInputValue('input[name="fecha_ingreso"]', '');
            setInputValue('input[name="salario_diario"]', '');
            setInputValue('input[name="salario_semanal"]', '');
            return;
        }
        
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            fetch(rutaRaiz + '/nomina/php/buscar_empleado.php?query=' + encodeURIComponent(query) + '&tipo=clave')
                .then(response => response.json())
                .then(empleados => {
                    suggestionsClave.innerHTML = '';
                    
                    if (empleados.length === 0) {
                        suggestionsClave.style.display = 'none';
                        return;
                    }
                    
                    if (empleados.length === 1 && empleados[0].clave_empleado === query) {
                        cargarDatosEmpleado(empleados[0]);
                        suggestionsClave.style.display = 'none';
                    } else {
                        empleados.forEach(emp => {
                            const item = document.createElement('a');
                            item.href = '#';
                            item.className = 'list-group-item list-group-item-action';
                            item.innerHTML = `<strong>${emp.clave_empleado}</strong> - ${emp.nombre_completo} <br><small class='text-muted'>${emp.empresa ? emp.empresa : ''}</small>`;
                            item.addEventListener('click', function(e) {
                                e.preventDefault();
                                cargarDatosEmpleado(emp);
                            });
                            suggestionsClave.appendChild(item);
                        });
                        suggestionsClave.style.display = 'block';
                    }
                })
                .catch(error => console.error('Error:', error));
        }, 300);
    });
    
    // Autocompletado por nombre
    inputNombre.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length < 2) {
            suggestionsNombre.style.display = 'none';
            setInputValue('input[name="clave"]', '');
            setInputValue('input[name="departamento"]', '');
            setInputValue('input[name="rfc_empleado"]', '');
            setInputValue('input[name="imss"]', '');
            setInputValue('input[name="nombre_puesto"]', '');
            setInputValue('input[name="fecha_ingreso"]', '');
            setInputValue('input[name="salario_diario"]', '');
            setInputValue('input[name="salario_semanal"]', '');
            return;
        }
        
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            fetch(rutaRaiz + '/nomina/php/buscar_empleado.php?query=' + encodeURIComponent(query) + '&tipo=nombre')
                .then(response => response.json())
                .then(empleados => {
                    suggestionsNombre.innerHTML = '';
                    
                    if (empleados.length === 0) {
                        suggestionsNombre.style.display = 'none';
                        return;
                    }
                    
                    empleados.forEach(emp => {
                        const item = document.createElement('a');
                        item.href = '#';
                        item.className = 'list-group-item list-group-item-action';
                        item.innerHTML = `<strong>${emp.nombre_completo}</strong><br><small class="text-muted">Clave: ${emp.clave_empleado} | ${emp.departamento}</small>`;
                        item.addEventListener('click', function(e) {
                            e.preventDefault();
                            cargarDatosEmpleado(emp);
                        });
                        suggestionsNombre.appendChild(item);
                    });
                    
                    // Asegurar que el contenedor padre tenga position relative
                    const parentCol = inputNombre.closest('.col-md-4');
                    if (parentCol) {
                        parentCol.style.position = 'relative';
                    }
                    
                    // Forzar estilos para asegurar visibilidad
                    suggestionsNombre.style.display = 'block';
                    suggestionsNombre.style.position = 'absolute';
                    suggestionsNombre.style.zIndex = '10000';
                    suggestionsNombre.style.backgroundColor = 'white';
                    suggestionsNombre.style.border = '1px solid #ddd';
                    suggestionsNombre.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    suggestionsNombre.style.width = '100%';
                    suggestionsNombre.style.maxHeight = '300px';
                    suggestionsNombre.style.overflowY = 'auto';
                })
                .catch(error => console.error('Error:', error));
        }, 300);
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!inputClave.contains(e.target) && !suggestionsClave.contains(e.target)) {
            suggestionsClave.style.display = 'none';
        }
        if (!inputNombre.contains(e.target) && !suggestionsNombre.contains(e.target)) {
            suggestionsNombre.style.display = 'none';
        }
    });
}

// Función para generar ticket manual de nómina regular
function generarTicketManualNomina(form) {
    const formData = new FormData(form);
    const data = {};

    // Obtener todos los campos del formulario
    for (let [key, value] of formData.entries()) {
        if (!key.includes('[]')) {
            // Si hay campos duplicados con el mismo name, no pisar un valor ya capturado con uno vacío
            if (!(key in data) || (data[key] === '' && value !== '')) {
                data[key] = value || '';
            }
        }
    }

    // Asegurar que los campos numéricos tengan valor 0 si están vacíos
    const camposNumericos = [
        'vacaciones', 'sueldo_base', 'incentivo', 'sueldo_extra_final', 'sueldo_extra',
        'bono_antiguedad', 'aplicar_bono', 'actividades_especiales', 'bono_puesto',
        'neto_pagar', 'prestamo', 'uniformes', 'checador', 'fa_gafet_cofia',
        'inasistencias_minutos', 'inasistencias_descuento', 'salario_diario', 'salario_semanal'
    ];
    
    camposNumericos.forEach(campo => {
        if (!data[campo] || data[campo] === '') {
            data[campo] = 0;
        }
    });

    // Procesar percepciones adicionales
    data.conceptos_adicionales = [];
    const nombresPercepcion = formData.getAll('percepcion_nombre[]');
    const valoresPercepcion = formData.getAll('percepcion_valor[]');
    
    for (let i = 0; i < nombresPercepcion.length; i++) {
        if (nombresPercepcion[i] && valoresPercepcion[i]) {
            data.conceptos_adicionales.push({
                nombre: nombresPercepcion[i],
                valor: parseFloat(valoresPercepcion[i]) || 0
            });
        }
    }

    // Procesar deducciones
    data.conceptos = [];
    const nombresDeduccion = formData.getAll('deduccion_nombre[]');
    const valoresDeduccion = formData.getAll('deduccion_valor[]');
    
    for (let i = 0; i < nombresDeduccion.length; i++) {
        if (nombresDeduccion[i] && valoresDeduccion[i]) {
            data.conceptos.push({
                nombre: nombresDeduccion[i],
                resultado: parseFloat(valoresDeduccion[i]) || 0
            });
        }
    }

    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Generando...';
    submitBtn.disabled = true;

    // Enviar petición al servidor
    fetch(rutaRaiz + '/nomina/php/generar_ticket_manual.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al generar el ticket');
        }
        return response.blob();
    })
    .then(blob => {
        // Descargar el PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticket_manual_' + new Date().getTime() + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Mostrar mensaje de éxito
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Ticket generado',
                text: 'El ticket se ha generado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            alert('Ticket generado correctamente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el ticket: ' + error.message
            });
        } else {
            alert('Error al generar el ticket: ' + error.message);
        }
    });
}

// Función para generar ticket manual de nómina confianza
function generarTicketManualConfianza(form) {
    const formData = new FormData(form);
    const data = {};

    // Obtener todos los campos del formulario
    for (let [key, value] of formData.entries()) {
        if (!key.includes('[]')) {
            // Si hay campos duplicados con el mismo name, no pisar un valor ya capturado con uno vacío
            if (!(key in data) || (data[key] === '' && value !== '')) {
                data[key] = value || '';
            }
        }
    }

    // Fallbacks por si algún campo viene duplicado/vacío
    if ((data.sueldo_semanal === '' || data.sueldo_semanal === null || typeof data.sueldo_semanal === 'undefined') && data.salario_semanal) {
        data.sueldo_semanal = data.salario_semanal;
    }
    if ((data.sueldo_diario === '' || data.sueldo_diario === null || typeof data.sueldo_diario === 'undefined') && data.salario_diario) {
        data.sueldo_diario = data.salario_diario;
    }

    // Asegurar que los campos numéricos tengan valor 0 si están vacíos
    const camposNumericos = [
        'vacaciones', 'sueldo_semanal', 'sueldo_extra_final',
        'ajustes_sub', 'retardos', 'permisos', 'inasistencias',
        'neto_pagar', 'prestamo', 'uniformes', 'checador',
        'isr', 'imss_descuento', 'infonavit', 'sueldo_diario'
    ];
    
    camposNumericos.forEach(campo => {
        if (!data[campo] || data[campo] === '') {
            data[campo] = 0;
        }
    });

    // Procesar percepciones adicionales
    data.conceptos_adicionales = [];
    const nombresPercepcion = formData.getAll('percepcion_nombre[]');
    const valoresPercepcion = formData.getAll('percepcion_valor[]');
    
    for (let i = 0; i < nombresPercepcion.length; i++) {
        if (nombresPercepcion[i] && valoresPercepcion[i]) {
            data.conceptos_adicionales.push({
                nombre: nombresPercepcion[i],
                valor: parseFloat(valoresPercepcion[i]) || 0
            });
        }
    }

    // Procesar deducciones
    data.conceptos = [];
    const nombresDeduccion = formData.getAll('deduccion_nombre[]');
    const valoresDeduccion = formData.getAll('deduccion_valor[]');
    
    for (let i = 0; i < nombresDeduccion.length; i++) {
        if (nombresDeduccion[i] && valoresDeduccion[i]) {
            data.conceptos.push({
                nombre: nombresDeduccion[i],
                resultado: parseFloat(valoresDeduccion[i]) || 0
            });
        }
    }

    // Mostrar loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Generando...';
    submitBtn.disabled = true;

    // Enviar petición al servidor
    fetch(rutaRaiz + '/nomina_confianza/php/generar_ticket_manual.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al generar el ticket');
        }
        return response.blob();
    })
    .then(blob => {
        // Descargar el PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticket_manual_confianza_' + new Date().getTime() + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Mostrar mensaje de éxito
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Ticket generado',
                text: 'El ticket se ha generado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            alert('Ticket generado correctamente');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el ticket: ' + error.message
            });
        } else {
            alert('Error al generar el ticket: ' + error.message);
        }
    });
}

// Función para inicializar autocompletado en el modal de nómina confianza
function setupAutocompletadoConfianza(modalElement) {
    if (!modalElement) return;
    const inputClave = modalElement.querySelector('#input_clave');
    const suggestionsClave = modalElement.querySelector('#suggestions_clave');
    const inputNombre = modalElement.querySelector('#input_nombre');
    const suggestionsNombre = modalElement.querySelector('#suggestions_nombre');
    const form = modalElement.querySelector('#formTicketManual');
    if (!inputClave || !suggestionsClave || !inputNombre || !suggestionsNombre || !form) return;
    
    // Prevenir submit tradicional y usar AJAX
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generarTicketManualConfianza(form);
    });
    
    let timeoutBusqueda = null;
    
    // Helper: asigna valor solo si existe el input
    function setInputValue(selector, value) {
        const els = form.querySelectorAll(selector);
        if (!els || els.length === 0) return;
        els.forEach(el => {
            el.value = value;
        });
    }

    // Botones para limpiar clave / nombre
    const btnClearClave = modalElement.querySelector('.btn-clear-clave');
    const btnClearNombre = modalElement.querySelector('.btn-clear-nombre');

    function limpiarEmpleado(focusTarget) {
        setInputValue('input[name="clave"]', '');
        setInputValue('input[name="nombre"]', '');
        setInputValue('input[name="departamento"]', '');
        setInputValue('input[name="rfc_empleado"]', '');
        setInputValue('input[name="imss"]', '');
        setInputValue('input[name="nombre_puesto"]', '');
        setInputValue('input[name="fecha_ingreso"]', '');
        setInputValue('input[name="sueldo_diario"]', '');
        setInputValue('input[name="sueldo_semanal"]', '');
        suggestionsClave.style.display = 'none';
        suggestionsNombre.style.display = 'none';
        if (focusTarget) focusTarget.focus();
    }

    if (btnClearClave) {
        btnClearClave.addEventListener('click', function() {
            limpiarEmpleado(inputClave);
        });
    }
    if (btnClearNombre) {
        btnClearNombre.addEventListener('click', function() {
            limpiarEmpleado(inputNombre);
        });
    }

    // Función para cargar datos del empleado
    function cargarDatosEmpleado(empleado) {
        setInputValue('input[name="clave"]', empleado.clave_empleado || '');
        setInputValue('input[name="nombre"]', empleado.nombre_completo || '');
        setInputValue('input[name="departamento"]', empleado.departamento || '');
        // Estos campos pueden no existir en el modal
        setInputValue('input[name="rfc_empleado"]', empleado.rfc_empleado || '');
        setInputValue('input[name="imss"]', empleado.imss || '');
        // Campos visibles en confianza
        setInputValue('input[name="nombre_puesto"]', empleado.puesto || '');
        setInputValue('input[name="fecha_ingreso"]', empleado.fecha_ingreso || '');
        setInputValue('input[name="sueldo_diario"]', empleado.salario_diario || '0.00');
        setInputValue('input[name="sueldo_semanal"]', empleado.salario_semanal || '0.00');
        
        suggestionsClave.style.display = 'none';
        suggestionsNombre.style.display = 'none';
    }
    
    // Autocompletado por clave
    inputClave.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length === 0) {
            suggestionsClave.style.display = 'none';
            setInputValue('input[name="nombre"]', '');
            setInputValue('input[name="departamento"]', '');
            setInputValue('input[name="rfc_empleado"]', '');
            setInputValue('input[name="imss"]', '');
            setInputValue('input[name="nombre_puesto"]', '');
            setInputValue('input[name="fecha_ingreso"]', '');
            setInputValue('input[name="sueldo_diario"]', '');
            setInputValue('input[name="sueldo_semanal"]', '');
            return;
        }
        
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            fetch(rutaRaiz + '/nomina_confianza/php/buscar_empleado.php?query=' + encodeURIComponent(query) + '&tipo=clave')
                .then(response => response.json())
                .then(empleados => {
                    suggestionsClave.innerHTML = '';
                    
                    if (empleados.length === 0) {
                        suggestionsClave.style.display = 'none';
                        return;
                    }
                    
                    if (empleados.length === 1 && empleados[0].clave_empleado === query) {
                        cargarDatosEmpleado(empleados[0]);
                        suggestionsClave.style.display = 'none';
                    } else {
                        empleados.forEach(emp => {
                            const item = document.createElement('a');
                            item.href = '#';
                            item.className = 'list-group-item list-group-item-action';
                            item.innerHTML = `<strong>${emp.clave_empleado}</strong> - ${emp.nombre_completo} <br><small class='text-muted'>${emp.empresa ? emp.empresa : ''}</small>`;
                            item.addEventListener('click', function(e) {
                                e.preventDefault();
                                cargarDatosEmpleado(emp);
                            });
                            suggestionsClave.appendChild(item);
                        });
                        
                        // Asegurar que el contenedor padre tenga position relative
                        const parentCol = inputClave.closest('.col-md-2');
                        if (parentCol) {
                            parentCol.style.position = 'relative';
                        }
                        
                        // Forzar estilos para asegurar visibilidad
                        suggestionsClave.style.display = 'block';
                        suggestionsClave.style.position = 'absolute';
                        suggestionsClave.style.zIndex = '10000';
                        suggestionsClave.style.backgroundColor = 'white';
                        suggestionsClave.style.border = '1px solid #ddd';
                        suggestionsClave.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        suggestionsClave.style.maxHeight = '300px';
                        suggestionsClave.style.overflowY = 'auto';
                    }
                })
                .catch(error => console.error('Error:', error));
        }, 300);
    });
    
    // Autocompletado por nombre
    inputNombre.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length < 2) {
            suggestionsNombre.style.display = 'none';
            setInputValue('input[name="clave"]', '');
            setInputValue('input[name="departamento"]', '');
            setInputValue('input[name="rfc_empleado"]', '');
            setInputValue('input[name="imss"]', '');
            setInputValue('input[name="nombre_puesto"]', '');
            setInputValue('input[name="fecha_ingreso"]', '');
            setInputValue('input[name="sueldo_diario"]', '');
            setInputValue('input[name="sueldo_semanal"]', '');
            return;
        }
        
        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(() => {
            const url = rutaRaiz + '/nomina_confianza/php/buscar_empleado.php?query=' + encodeURIComponent(query) + '&tipo=nombre';
            fetch(url)
                .then(response => response.json())
                .then(empleados => {
                    suggestionsNombre.innerHTML = '';
                    if (empleados.length === 0) {
                        suggestionsNombre.style.display = 'none';
                        return;
                    }
                    empleados.forEach(emp => {
                        const item = document.createElement('a');
                        item.href = '#';
                        item.className = 'list-group-item list-group-item-action';
                        item.innerHTML = `<strong>${emp.nombre_completo}</strong><br><small class="text-muted">Clave: ${emp.clave_empleado} | ${emp.departamento}</small>`;
                        item.addEventListener('click', function(e) {
                            e.preventDefault();
                            cargarDatosEmpleado(emp);
                        });
                        suggestionsNombre.appendChild(item);
                    });
                    // Asegurar que el contenedor padre tenga position relative
                    const parentCol = inputNombre.closest('.col-md-4');
                    if (parentCol) {
                        parentCol.style.position = 'relative';
                    }
                    // Forzar estilos para asegurar visibilidad (z-index mayor que modal de Bootstrap que es 1055)
                    suggestionsNombre.style.display = 'block';
                    suggestionsNombre.style.position = 'absolute';
                    suggestionsNombre.style.zIndex = '10000';
                    suggestionsNombre.style.backgroundColor = 'white';
                    suggestionsNombre.style.border = '1px solid #ddd';
                    suggestionsNombre.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    suggestionsNombre.style.width = '100%';
                    suggestionsNombre.style.maxHeight = '300px';
                    suggestionsNombre.style.overflowY = 'auto';
                })
                .catch(error => {
                    // ...existing code...
                });
        }, 300);
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!inputClave.contains(e.target) && !suggestionsClave.contains(e.target)) {
            suggestionsClave.style.display = 'none';
        }
        if (!inputNombre.contains(e.target) && !suggestionsNombre.contains(e.target)) {
            suggestionsNombre.style.display = 'none';
        }
    });
}