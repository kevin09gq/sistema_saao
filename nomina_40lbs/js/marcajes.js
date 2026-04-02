
 abrirModalMarcajes();
 initMarcajesForm();


 function abrirModalMarcajes() {
     $(document).on('click', '#btn_marcajes', function () {
         if (!window.jsonNomina40lbs || !Array.isArray(window.jsonNomina40lbs.departamentos)) {
             alert('No hay nómina cargada');
             return;
         }

         resetMarcajesModal();
         cargarListaEmpleadosMarcajes();

        const modalEl = document.getElementById('modal-marcajes');
        if (modalEl) {
            if (modalEl.parentElement !== document.body) {
                document.body.appendChild(modalEl);
            }

            modalEl.removeAttribute('hidden');

            const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
     });
 }

 function resetMarcajesModal() {
     $('#buscar-empleado-marcajes').val('');
     $('#select-dia-marcajes').val('');
     $('#lista-empleados-marcajes').empty();
     $('#contador-total-marcajes').text('0');
     $('#contador-seleccionados-marcajes').text('0');

     $('.chk-marcaje').prop('checked', false);
     $('.input-marcaje').prop('disabled', true).val('');
 }

 function initMarcajesForm() {
     // Habilitar/deshabilitar inputs de horas
     $(document).on('change', '.chk-marcaje', function () {
         const campo = $(this).data('campo');
         const checked = $(this).is(':checked');
         $(`.input-marcaje[data-campo="${campo}"]`).prop('disabled', !checked);
         if (!checked) {
             $(`.input-marcaje[data-campo="${campo}"]`).val('');
         }
     });

  

     // Seleccionar/Deseleccionar
     $(document).on('click', '#btn-seleccionar-todos-marcajes', function () {
         $('#lista-empleados-marcajes .empleado-item-marcajes:visible input[type="checkbox"]').prop('checked', true);
         actualizarContadorMarcajes();
     });
     $(document).on('click', '#btn-deseleccionar-todos-marcajes', function () {
         $('#lista-empleados-marcajes .empleado-item-marcajes:visible input[type="checkbox"]').prop('checked', false);
         actualizarContadorMarcajes();
     });

     // Contador al cambiar
     $(document).on('change', '#lista-empleados-marcajes input[type="checkbox"]', function () {
         actualizarContadorMarcajes();
     });

     // Aplicar marcaje al presionar el botón
     $(document).on('click', '#btn-aplicar-marcajes', function () {
         aplicarMarcajeSeleccionado();
     });
 }

 function obtenerEmpleadosNomina() {
     const empleados = [];
     if (!jsonNomina40lbs || !Array.isArray(jsonNomina40lbs.departamentos)) return empleados;

    
     jsonNomina40lbs.departamentos.forEach(depto => {
         if (!depto || !Array.isArray(depto.empleados)) return;
         depto.empleados.forEach(emp => {
             // Igual que en actualizarBiomtrico.js: solo deptos 4 y 5
             if (emp?.id_departamento !== 4 && emp?.id_departamento !== 5) return;
             // Respetar flag de ocultamiento si existe
             if (emp?.mostrar === false) return;
             empleados.push({
                 emp,
                 depto: depto.nombre || ''
             });
         });
     });
     return empleados;
 }

 function cargarListaEmpleadosMarcajes() {
     const $lista = $('#lista-empleados-marcajes');
     $lista.empty();

     const empleados = obtenerEmpleadosNomina();
     let total = 0;
     let seleccionados = 0;

     empleados.forEach(({ emp, depto }) => {
         if (!emp) return;

         // En este modal, por defecto no pre-seleccionamos empleados.
         // (La propiedad emp.mostrar se usa en otros contextos.)
         const marcado = false;
         total += 1;
         if (marcado) seleccionados += 1;

         const id = `marcajes-${emp.clave}-${emp.id_empresa}`;
         const html = `
             <label class="empleado-item-marcajes list-group-item d-flex align-items-start gap-2 py-2">
                 <input class="form-check-input mt-1" type="checkbox" id="${id}" data-clave="${emp.clave}" data-id-empresa="${emp.id_empresa}" ${marcado ? 'checked' : ''}>
                 <span class="flex-grow-1">
                     <span class="text-muted">[${emp.clave}]</span> ${emp.nombre || ''}
                 </span>
             </label>
         `;
         $lista.append(html);
     });

     $('#contador-total-marcajes').text(total);
     $('#contador-seleccionados-marcajes').text(seleccionados);
 }

 function actualizarContadorMarcajes() {
     const total = $('#lista-empleados-marcajes .empleado-item-marcajes:visible input[type="checkbox"]').length;
     const seleccionados = $('#lista-empleados-marcajes .empleado-item-marcajes:visible input[type="checkbox"]:checked').length;
     $('#contador-total-marcajes').text(total);
     $('#contador-seleccionados-marcajes').text(seleccionados);
 }

 // =============================================
 // AUXILIAR: convierte HH:MM a minutos de forma segura (evita NaN)
 // convertirHoraAMinutos() nativa no valida cadenas vacías → retorna NaN
 // =============================================
 function _horaAMin(h) {
     if (!h || typeof h !== 'string') return 0;
     var s = h.trim();
     if (!s || s === '00:00') return 0;
     var p = s.split(':');
     if (p.length < 2) return 0;
     var hh = parseInt(p[0], 10);
     var mm = parseInt(p[1], 10);
     if (isNaN(hh) || isNaN(mm)) return 0;
     return hh * 60 + mm;
 }

 // =============================================
 // AUXILIAR: calcula minutos netos de un registro de biometrico_redondeado
 // =============================================
 function _calcularMinutosRegistro(reg) {
     var entrada = _horaAMin(reg.entrada);
     var salida  = _horaAMin(reg.salida);
     if (salida === 0 && entrada === 0) return 0; // inasistencia o vacío
     var turno   = Math.max(0, salida - entrada);
     var ecMin   = _horaAMin(reg.entrada_comida);
     var tcMin   = _horaAMin(reg.termino_comida);
     var comida  = (ecMin > 0 && tcMin > ecMin) ? (tcMin - ecMin) : 0;
     return Math.max(0, turno - comida);
 }

 // =============================================
 // AUXILIAR: formatea minutos a HH:MM
 // =============================================
 function _minAHHMM(min) {
     var m = Math.max(0, Math.floor(min) || 0);
     return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
 }

 // =============================================
 // APLICAR MARCAJE: sobrescribe campos específicos del día seleccionado
 // en biometrico_redondeado para los empleados marcados, y recalcula
 // horas_trabajadas, minutos_trabajados, sueldo_neto, horas_extra.
 // =============================================
 function aplicarMarcajeSeleccionado() {
     const dia = $('#select-dia-marcajes').val();
     if (!dia) {
         alert('Selecciona un día.');
         return;
     }

     // Recopilar SOLO los campos habilitados (checkbox marcado) y con valor
     const campos = {};
     $('.chk-marcaje:checked').each(function () {
         const campo = $(this).data('campo');
         const valor = $(`.input-marcaje[data-campo="${campo}"]`).val();
         if (valor) campos[campo] = valor;
     });

     if (Object.keys(campos).length === 0) {
         alert('Habilita y llena al menos un campo para aplicar.');
         return;
     }

     // Obtener claves+empresa de empleados seleccionados
     const seleccionados = new Set();
     $('#lista-empleados-marcajes input[type="checkbox"]:checked').each(function () {
         seleccionados.add(`${String($(this).data('clave'))}|${String($(this).data('id-empresa'))}`);
     });

     if (seleccionados.size === 0) {
         alert('Selecciona al menos un empleado.');
         return;
     }

     let actualizados = 0;
     const empleadosModificados = [];

     window.jsonNomina40lbs.departamentos.forEach(depto => {
         if (!Array.isArray(depto.empleados)) return;

         depto.empleados.forEach(emp => {
             const key = `${String(emp.clave)}|${String(emp.id_empresa)}`;
             if (!seleccionados.has(key)) return;
             if (!Array.isArray(emp.biometrico_redondeado)) return;

             // Buscar el registro del día seleccionado
             const registro = emp.biometrico_redondeado.find(r => r.dia === dia);
             if (!registro) {
                 console.warn(`"${dia}" no encontrado en biometrico_redondeado de ${emp.nombre}`);
                 return;
             }

             // 1) Sobrescribir SOLO los campos habilitados
             Object.keys(campos).forEach(c => { registro[c] = campos[c]; });

             // 2) Recalcular totales del registro del día modificado (auxiliar segura, sin NaN)
             const minReg = _calcularMinutosRegistro(registro);
             registro.minutos_trabajados = minReg;
             registro.horas_trabajadas   = _minAHHMM(minReg);
             registro.horas_comida       = _minAHHMM(
                 Math.max(0, _horaAMin(registro.termino_comida) - _horaAMin(registro.entrada_comida))
             );

             // 3) Recalcular totales del empleado sumando TODOS los registros
             let totalMinEmp = 0;
             emp.biometrico_redondeado.forEach(r => { totalMinEmp += _calcularMinutosRegistro(r); });
             emp.minutos_trabajados = totalMinEmp;
             emp.horas_trabajadas   = _minAHHMM(totalMinEmp);

             // 4) Recalcular incentivo
             if (typeof aplicarIncentivoEmpleado === 'function') aplicarIncentivoEmpleado(emp);

             empleadosModificados.push(emp);
             actualizados++;

             console.log(`Marcaje aplicado → ${emp.nombre} | ${dia}:`, campos,
                         `| horas_trabajadas: ${emp.horas_trabajadas}`);
         });
     });

     if (actualizados === 0) {
         alert('No se pudo aplicar. Verifica que los empleados tengan biométrico_redondeado.');
         return;
     }

     // 5) Recalcular sueldo_neto, horas_extra, minutos_extras_trabajados
     //    Mismo patrón que actualizarBiomtrico.js
     if (typeof imprimirSueldoBasePorHorasTrabajadas === 'function' &&
         typeof jsonTabulador !== 'undefined' && jsonTabulador) {
         imprimirSueldoBasePorHorasTrabajadas(jsonTabulador, empleadosModificados);
     } else if (typeof getTabulador === 'function') {
         getTabulador(empleadosModificados);
     }

     refrescarTabla();
     alert(`Marcaje aplicado a ${actualizados} empleado(s).`);
 }
