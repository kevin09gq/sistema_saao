$(document).ready(function () {
	const endpointEmpleados = '../php/obtenerEmpleados.php';
	const endpointExcel = '../php/exportar_informacion_excel.php';
	const endpointAreas = '../../public/php/obtenerAreas.php';
	const endpointDepartamentos = '../../public/php/obtenerDepartamentos.php';
	let empleadosCache = [];

	function obtenerNombreCompleto(empleado) {
		return [empleado.nombre, empleado.ap_paterno, empleado.ap_materno].filter(Boolean).join(' ').trim();
	}

	function textoBusqueda(empleado) {
		const texto = [
			obtenerNombreCompleto(empleado),
			empleado.clave_empleado,
			empleado.imss,
			empleado.nombre_departamento
		].filter(Boolean).join(' ').toLowerCase();

		// Normalizar acentos y limpiar espacios extras
		return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ');
	}

	function actualizarContador() {
		const total = $('.empleado-exportar-checkbox').length;
		const visibles = $('.empleado-exportar-checkbox:visible').length;
		const seleccionados = $('.empleado-exportar-checkbox:checked').length;

		let textoContador = `${seleccionados} de ${total} empleados`;
		if (total !== visibles) {
			textoContador = `${seleccionados} seleccionados (${visibles} filtrados de ${total})`;
		}

		$('#contador_empleados_exportar').text(textoContador);
	}

	function renderizarEmpleados(empleados) {
		empleadosCache = Array.isArray(empleados) ? empleados : [];

		if (!empleadosCache.length) {
			$('#lista_empleados_exportar').html('<div class="alert alert-light border mb-0 text-center text-muted py-4">No hay empleados disponibles.</div>');
			actualizarContador();
			return;
		}

		const html = empleadosCache.map((empleado) => {
			const nombre = obtenerNombreCompleto(empleado) || 'Sin nombre';
			const clave = empleado.clave_empleado || 'Sin clave';
			const imss = empleado.imss || 'Sin IMSS';
			const departamento = empleado.nombre_departamento || 'Sin departamento';
			const search = textoBusqueda(empleado);

			// Determinar si tiene seguro (status_nss == 1)
			const tieneSeguro = empleado.status_nss == 1 || empleado.status_nss == '1';
			const seguroAttr = tieneSeguro ? 'con_seguro' : 'sin_seguro';

			const idArea = empleado.id_area || '';
			const idDepartamento = empleado.id_departamento || '';

			return `
				<label class="list-group-item d-flex align-items-start gap-2 empleado-item" data-search="${search}" data-seguro="${seguroAttr}" data-area="${idArea}" data-departamento="${idDepartamento}">
					<input class="form-check-input mt-1 empleado-exportar-checkbox" type="checkbox" value="${empleado.id_empleado}">
					<div class="flex-grow-1">
						<div class="fw-semibold">${nombre}</div>
						<div class="small text-muted">Clave: ${clave} · IMSS: ${imss}</div>
						<div class="small text-success-emphasis">${departamento}</div>
					</div>
				</label>
			`;
		}).join('');

		$('#lista_empleados_exportar').html(`<div class="list-group list-group-flush">${html}</div>`);
		actualizarContador();
	}

	function cargarEmpleados() {
		$.ajax({
			type: 'POST',
			url: endpointEmpleados,
			data: { accion: 'cargarEmpleados' },
			dataType: 'json',
			success: function (response) {
				renderizarEmpleados(response);
			},
			error: function () {
				$('#lista_empleados_exportar').html('<div class="alert alert-danger mb-0">No se pudo cargar la lista de empleados.</div>');
				actualizarContador();
			}
		});
	}

	function cargarAreasExportar() {
		$.ajax({
			type: 'GET',
			url: endpointAreas,
			success: function (response) {
				if (response.error) return;
				const areas = JSON.parse(response);
				let opciones = '<option value="todos">Todas las áreas</option>';
				areas.forEach(function (area) {
					opciones += '<option value="' + area.id_area + '">' + area.nombre_area + '</option>';
				});
				$('#filtro-area-exportar').html(opciones);
			}
		});
	}

	function cargarDepartamentosExportar(idArea) {
		const ajaxConfig = {
			type: 'GET',
			url: endpointDepartamentos,
			success: function (response) {
				if (response.error) return;
				const departamentos = JSON.parse(response);
				let opciones = '<option value="todos">Todos los departamentos</option>';
				departamentos.forEach(function (dep) {
					opciones += '<option value="' + dep.id_departamento + '">' + dep.nombre_departamento + '</option>';
				});
				$('#filtro-departamento-exportar').html(opciones);
			}
		};

		if (idArea) {
			ajaxConfig.type = 'POST';
			ajaxConfig.data = { id_area: idArea };
		}

		$.ajax(ajaxConfig);
	}

	function obtenerSeleccionados() {
		const empleados = $('.empleado-exportar-checkbox:checked').map(function () {
			return $(this).val();
		}).get();

		const campos = $('.campo-exportacion-checkbox:checked').map(function () {
			return $(this).val();
		}).get();

		const unirHojas = $('#check_unir_hojas_exportar').is(':checked') ? '1' : '0';

		return { empleados, campos, unirHojas };
	}

	function descargarExcel() {
		const seleccion = obtenerSeleccionados();

		if (!seleccion.empleados.length) {
			Swal.fire({ icon: 'warning', title: 'Selecciona empleados', text: 'Marca al menos un empleado para exportar.' });
			return;
		}

		const formData = new FormData();
		formData.append('empleados', JSON.stringify(seleccion.empleados));
		formData.append('campos', JSON.stringify(seleccion.campos));
		formData.append('unir_hojas', seleccion.unirHojas);

		fetch(endpointExcel, {
			method: 'POST',
			body: formData
		})
			.then(async (response) => {
				const contentType = response.headers.get('content-type') || '';

				if (!response.ok || contentType.includes('application/json')) {
					const errorData = contentType.includes('application/json') ? await response.json() : { mensaje: await response.text() };
					throw new Error(errorData.mensaje || 'No fue posible generar el archivo Excel.');
				}

				const blob = await response.blob();
				const disposition = response.headers.get('content-disposition') || '';
				const match = disposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
				const nombreArchivo = decodeURIComponent((match && (match[1] || match[2])) || 'exportacion_empleados.xlsx');

				const url = window.URL.createObjectURL(blob);
				const enlace = document.createElement('a');
				enlace.href = url;
				enlace.download = nombreArchivo;
				document.body.appendChild(enlace);
				enlace.click();
				enlace.remove();
				window.URL.revokeObjectURL(url);

				const modal = bootstrap.Modal.getInstance(document.getElementById('modal_exportar_informacion'));
				if (modal) {
					modal.hide();
				}
			})
			.catch((error) => {
				Swal.fire({ icon: 'error', title: 'Error al exportar', text: error.message || 'No se pudo generar el Excel.' });
			});
	}

	function filtrarListaEmpleados() {
		const texto = $('#buscador-empleados-exportar').val().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();
		const filtroSeguro = $('#filtro-seguro-exportar').val(); // 'todos', 'con_seguro', 'sin_seguro'
		const filtroArea = $('#filtro-area-exportar').val();
		const filtroDepartamento = $('#filtro-departamento-exportar').val();

		$('#lista_empleados_exportar .empleado-item').each(function () {
			const $item = $(this);
			const search = String($item.attr('data-search') || '');
			const seguro = String($item.attr('data-seguro') || '');
			const area = String($item.attr('data-area') || '');
			const departamento = String($item.attr('data-departamento') || '');

			const coincideTexto = search.includes(texto);
			const coincideSeguro = filtroSeguro === 'todos' || seguro === filtroSeguro;
			const coincideArea = filtroArea === 'todos' || area === filtroArea;
			const coincideDepartamento = filtroDepartamento === 'todos' || departamento === filtroDepartamento;

			if (coincideTexto && coincideSeguro && coincideArea && coincideDepartamento) {
				$item.removeClass('d-none').addClass('d-flex');
			} else {
				$item.removeClass('d-flex').addClass('d-none');
			}
		});

		// Actualizar contador y estado de "seleccionar todos"
		actualizarContador();
		actualizarEstadoCheckTodos();
	}

	function actualizarEstadoCheckTodos() {
		const visibles = $('.empleado-exportar-checkbox:visible');
		const seleccionados = visibles.filter(':checked').length;
		$('#check_todos_empleados_exportar').prop('checked', visibles.length > 0 && seleccionados === visibles.length);
	}

	$(document).on('input', '#buscador-empleados-exportar', function () {
		const valor = $(this).val();
		// Mostrar/ocultar botón de limpiar
		$('#btn-clear-buscador-exportar').toggleClass('d-none', valor === '');
		filtrarListaEmpleados();
	});

	$(document).on('change', '#filtro-seguro-exportar', function () {
		filtrarListaEmpleados();
	});

	$(document).on('change', '#filtro-area-exportar', function () {
		const idArea = $(this).val();
		// Resetear departamento al cambiar de área
		$('#filtro-departamento-exportar').val('todos');
		// Recargar departamentos filtrados por área
		cargarDepartamentosExportar(idArea !== 'todos' ? idArea : null);
		filtrarListaEmpleados();
	});

	$(document).on('change', '#filtro-departamento-exportar', function () {
		filtrarListaEmpleados();
	});

	$(document).on('click', '#btn-clear-buscador-exportar', function () {
		const $input = $('#buscador-empleados-exportar');
		$input.val('').trigger('input').focus();
	});

	$(document).on('change', '#check_todos_empleados_exportar', function () {
		const checked = $(this).is(':checked');
		$('.empleado-exportar-checkbox:visible').prop('checked', checked);
		actualizarContador();
	});

	$(document).on('change', '.empleado-exportar-checkbox', function () {
		actualizarEstadoCheckTodos();
		actualizarContador();
	});

	$(document).on('click', '#btn_descargar_excel_empleados', function () {
		const $boton = $(this);
		$boton.prop('disabled', true);
		descargarExcel();
		setTimeout(function () {
			$boton.prop('disabled', false);
		}, 900);
	});

	// ==========================
	// PREVISUALIZACIÓN
	// ==========================
	function escapeHtml(texto) {
		if (texto === null || texto === undefined) return '';
		return String(texto)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	function previsualizar() {
		const seleccion = obtenerSeleccionados();

		if (!seleccion.empleados.length) {
			Swal.fire({ icon: 'warning', title: 'Selecciona empleados', text: 'Marca al menos un empleado para previsualizar.' });
			return;
		}

		// Abrir modal y mostrar loading
		const modalPreview = new bootstrap.Modal(document.getElementById('modal_previsualizar'));
		modalPreview.show();

		// Resetear pestañas
		$('#preview_tabs').addClass('d-none');
		$('#preview_tab_horario_item').addClass('d-none');
		$('#preview_tab_horario_oficial_item').addClass('d-none');
		$('#preview_tab_reingresos_item').addClass('d-none');
		$('#preview_horarios_reloj_content').html('');
		$('#preview_horarios_oficial_content').html('');
		$('#preview_reingresos_content').html('');

		$('#preview_estado_carga').removeClass('d-none');
		$('#preview_table_container').addClass('d-none');
		$('#preview_sin_datos').addClass('d-none');
		$('#preview_total_empleados').text('Cargando...');

		const formData = new FormData();
		formData.append('empleados', JSON.stringify(seleccion.empleados));
		formData.append('campos', JSON.stringify(seleccion.campos));
		formData.append('preview', '1');

		fetch(endpointExcel, {
			method: 'POST',
			body: formData
		})
			.then(function (response) {
				if (!response.ok) {
					throw new Error('No fue posible generar la previsualización.');
				}
				return response.json();
			})
			.then(function (data) {
				renderPreview(data);
			})
			.catch(function (error) {
				$('#preview_estado_carga').addClass('d-none');
				$('#preview_sin_datos').removeClass('d-none').find('.alert').text(error.message || 'Error al previsualizar.');
				$('#preview_total_empleados').text('Error');
			});
	}

	function renderPreview(data) {
		const columnas = data.columnas || [];
		const filas = data.filas || [];
		const total = data.total || 0;
		const horariosReloj   = data.horarios_reloj   || null;
		const horariosOficial  = data.horarios_oficial  || null;
		const reingresos       = data.reingresos         || null;
		const mostrarTabInfo = columnas.length > 0;

		$('#preview_estado_carga').addClass('d-none');
		$('#preview_tab_info_item').toggleClass('d-none', !mostrarTabInfo);

		// Determinar qué pestañas mostrar (ahora se muestran si fueron seleccionadas, aunque estén vacías)
		const mostrarTabHorario       = horariosReloj   !== null;
		const mostrarTabHorarioOficial = horariosOficial  !== null;
		const mostrarTabReingresos    = reingresos       !== null;
		const hayPestanas = mostrarTabHorario || mostrarTabHorarioOficial || mostrarTabReingresos;

		// Mostrar/ocultar contenedor de pestañas
		if (hayPestanas) {
			$('#preview_tabs').removeClass('d-none');
		} else {
			$('#preview_tabs').addClass('d-none');
		}

		// Pestaña Horarios
		if (mostrarTabHorario) {
			$('#preview_tab_horario_item').removeClass('d-none');
			$('#preview_horarios_reloj_content').html(renderHorarioBloques(horariosReloj, true));
		} else {
			$('#preview_tab_horario_item').addClass('d-none');
		}

		// Pestaña Horario Oficial
		if (mostrarTabHorarioOficial) {
			$('#preview_tab_horario_oficial_item').removeClass('d-none');
			$('#preview_horarios_oficial_content').html(renderHorarioBloques(horariosOficial, true));
		} else {
			$('#preview_tab_horario_oficial_item').addClass('d-none');
		}

		// Pestaña Reingresos
		if (mostrarTabReingresos) {
			$('#preview_tab_reingresos_item').removeClass('d-none');
			$('#preview_reingresos_content').html(renderReingresosBloques(reingresos, true));
		} else {
			$('#preview_tab_reingresos_item').addClass('d-none');
		}

		if (!mostrarTabInfo) {
			$('#preview_table_container').addClass('d-none');
			$('#preview_sin_datos').addClass('d-none');
		}

		if (mostrarTabInfo && !filas.length) {
			$('#preview_sin_datos').removeClass('d-none');
			$('#preview_table_container').addClass('d-none');
			$('#preview_total_empleados').text(total + ' empleado' + (total !== 1 ? 's' : ''));
			$('#preview-tab-info').tab('show');
			return;
		}

		if (!mostrarTabInfo && !hayPestanas) {
			$('#preview_tab_info_item').removeClass('d-none');
			$('#preview_sin_datos').removeClass('d-none');
			$('#preview_table_container').addClass('d-none');
			$('#preview_total_empleados').text(total + ' empleado' + (total !== 1 ? 's' : ''));
			$('#preview-tab-info').tab('show');
			return;
		}

		if (mostrarTabInfo) {
			// Construir encabezados (pestaña Información)
			const groupLabels = {
				empleado:     'Empleado',
				emergencia:   'Emergencia',
				beneficiario: 'Beneficiario'
			};

			// Calcular spans de grupos
			const groupSpans = [];
			let currentGroup = null;
			let currentSpan  = 0;
			columnas.forEach(function (col) {
				const grupo = col.grupo || 'empleado';
				if (grupo === currentGroup) {
					currentSpan++;
				} else {
					if (currentGroup !== null) {
						groupSpans.push({ group: currentGroup, span: currentSpan });
					}
					currentGroup = grupo;
					currentSpan  = 1;
				}
			});
			if (currentGroup !== null) {
				groupSpans.push({ group: currentGroup, span: currentSpan });
			}

			// Fila de grupo (encabezado superior) — solo si hay más de un grupo
			let groupHeaderRow = '';
			const tieneGrupos = groupSpans.length > 1;
			if (tieneGrupos) {
				groupHeaderRow = '<tr>';
				groupHeaderRow += '<th class="group-header-cell row-number-header"></th>'; // celda vacía para columna #
				groupSpans.forEach(function (gs) {
					const label = groupLabels[gs.group] || gs.group;
					const clase = 'group-header-cell group-' + gs.group;
					groupHeaderRow += '<th colspan="' + gs.span + '" class="' + clase + '">' + escapeHtml(label) + '</th>';
				});
				groupHeaderRow += '</tr>';
			}

			// Fila de columnas
			let colHeaderRow = '<tr><th class="row-number-header">#</th>';
			columnas.forEach(function (col) {
				colHeaderRow += '<th>' + escapeHtml(col.label) + '</th>';
			});
			colHeaderRow += '</tr>';

			$('#preview_thead').html(groupHeaderRow + colHeaderRow);

			// Calcular altura del group header para posicionar sticky de columnas
			if (tieneGrupos) {
				requestAnimationFrame(function () {
					const groupRow = document.querySelector('#preview_thead tr:first-child');
					if (groupRow) {
						const h = groupRow.offsetHeight;
						document.getElementById('preview_table').style.setProperty('--group-header-height', h + 'px');
					}
				});
			}

			// Construir filas
			let tbody = '';
			filas.forEach(function (fila, index) {
				tbody += '<tr><td class="row-number-cell">' + (index + 1) + '</td>';
				columnas.forEach(function (col) {
					const valor = fila[col.key] !== undefined && fila[col.key] !== null ? String(fila[col.key]) : '';
					const escaped = escapeHtml(valor);
					const tieneSaltos = escaped.indexOf('\n') !== -1;
					const htmlCelda = tieneSaltos ? escaped.replace(/\n/g, '<br>') : escaped;
					const clase = tieneSaltos ? ' class="has-breaks"' : '';
					tbody += '<td' + clase + '>' + htmlCelda + '</td>';
				});
				tbody += '</tr>';
			});
			$('#preview_tbody').html(tbody);

			$('#preview_table_container').removeClass('d-none');
			$('#preview_sin_datos').addClass('d-none');
		}

		if (mostrarTabInfo) {
			$('#preview-tab-info').tab('show');
		} else if (mostrarTabHorario) {
			$('#preview-tab-horario').tab('show');
		} else if (mostrarTabHorarioOficial) {
			$('#preview-tab-horario-oficial').tab('show');
		} else if (mostrarTabReingresos) {
			$('#preview-tab-reingresos').tab('show');
		}

		$('#preview_total_empleados').text(total + ' empleado' + (total !== 1 ? 's' : ''));
	}

	function formatHora(valor) {
		if (!valor) return '';
		valor = String(valor).trim();
		// Si ya tiene am/pm
		if (/\b(am|pm)\b|a\.?\s*m\.?|p\.?\s*m\./i.test(valor)) return valor;
		// Formato HH:MM o HH:MM:SS
		const match = valor.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
		if (!match) return valor;
		let h = parseInt(match[1], 10);
		const m = match[2];
		if (h < 0 || h > 23) return valor;
		const sufijo = h >= 12 ? 'p. m.' : 'a. m.';
		h = h % 12;
		if (h === 0) h = 12;
		return ('0' + h).slice(-2) + ':' + m + ' ' + sufijo;
	}

	function renderHorarioBloques(listaEmpleados, mostrarIdentificacionEmpleado) {
		if (!Array.isArray(listaEmpleados) || !listaEmpleados.length) {
			return '<div class="text-center text-muted py-4">Sin datos de horario disponibles.</div>';
		}

		let html = '';
		listaEmpleados.forEach(function (emp) {
			const clave  = escapeHtml(emp.clave  || '');
			const nombre = escapeHtml(emp.nombre || '');
			const detalle = emp.detalle || {};

			// Normalizar a arreglo de filas
			let filas = [];
			if (Array.isArray(detalle)) {
				// Viene como arreglo de objetos con "dia"
				detalle.forEach(function (item) {
					if (item && typeof item === 'object' && item.dia) {
						filas.push(item);
					}
				});
			} else {
				// Viene como objeto con días como keys
				Object.keys(detalle).forEach(function (dia) {
					const h = detalle[dia];
					if (h && typeof h === 'object') {
						filas.push({ dia: dia, entrada: h.entrada, salida_comida: h.salida_comida, entrada_comida: h.entrada_comida, salida: h.salida });
					}
				});
			}

			if (!filas.length) {
				filas.push({ dia: 'Sin horarios registrados', entrada: '', salida_comida: '', entrada_comida: '', salida: '' });
			}

			html += '<div class="preview-horario-bloque">';
			if (mostrarIdentificacionEmpleado) {
				html += '<div class="empleado-header">';
				html += '<span class="text-muted me-2">Clave:</span>' + clave;
				html += '&nbsp;&nbsp;&middot;&nbsp;&nbsp;';
				html += '<span class="text-muted me-2">Nombre:</span>' + nombre;
				html += '</div>';
			}
			html += '<table>';
			html += '<thead><tr><th>Día</th><th>Entrada</th><th>Salida comida</th><th>Entrada comida</th><th>Salida</th></tr></thead>';
			html += '<tbody>';
			filas.forEach(function (f) {
				html += '<tr>';
				html += '<td>' + escapeHtml(f.dia || '') + '</td>';
				html += '<td>' + escapeHtml(formatHora(f.entrada)) + '</td>';
				html += '<td>' + escapeHtml(formatHora(f.salida_comida)) + '</td>';
				html += '<td>' + escapeHtml(formatHora(f.entrada_comida)) + '</td>';
				html += '<td>' + escapeHtml(formatHora(f.salida)) + '</td>';
				html += '</tr>';
			});
			html += '</tbody>';
			html += '</table>';
			html += '</div>';
		});

		return html;
	}

	function renderReingresosBloques(listaEmpleados, mostrarIdentificacionEmpleado) {
		if (!Array.isArray(listaEmpleados) || !listaEmpleados.length) {
			return '<div class="text-center text-muted py-4">Sin datos de reingresos disponibles.</div>';
		}

		let html = '';
		listaEmpleados.forEach(function (emp) {
			const clave  = escapeHtml(emp.clave  || '');
			const nombre = escapeHtml(emp.nombre || '');
			const detalle = emp.detalle || [];

			html += '<div class="preview-horario-bloque">';
			if (mostrarIdentificacionEmpleado) {
				html += '<div class="empleado-header">';
				html += '<span class="text-muted me-2">Clave:</span>' + clave;
				html += '&nbsp;&nbsp;&middot;&nbsp;&nbsp;';
				html += '<span class="text-muted me-2">Nombre:</span>' + nombre;
				html += '</div>';
			}
			html += '<table>';
			html += '<thead><tr><th>#</th><th>Fecha de Reingreso</th><th>Fecha Baja</th></tr></thead>';
			html += '<tbody>';
			
			if (!Array.isArray(detalle) || !detalle.length) {
				html += '<tr><td class="text-center">-</td><td>Sin reingresos</td><td class="text-center">-</td></tr>';
			} else {
				detalle.forEach(function (row, index) {
					const fechaReingreso = escapeHtml((row.fecha_reingreso || '').toString());
					const fechaBaja      = escapeHtml((row.fecha_baja      || '').toString());
					if (!fechaReingreso && !fechaBaja) return;
					html += '<tr>';
					html += '<td>' + (index + 1) + '</td>';
					html += '<td>' + fechaReingreso + '</td>';
					html += '<td>' + fechaBaja + '</td>';
					html += '</tr>';
				});
			}
			html += '</tbody>';
			html += '</table>';
			html += '</div>';
		});

		return html;
	}

	$(document).on('click', '#btn_previsualizar_empleados', function () {
		previsualizar();
	});

	// Descargar desde el modal de previsualización
	$(document).on('click', '#btn_preview_descargar', function () {
		// Cerrar modal de preview y disparar descarga
		const modalPreview = bootstrap.Modal.getInstance(document.getElementById('modal_previsualizar'));
		if (modalPreview) {
			modalPreview.hide();
		}
		$('#btn_descargar_excel_empleados').trigger('click');
	});

	$('#modal_exportar_informacion').on('show.bs.modal', function () {
		if (!empleadosCache.length) {
			cargarEmpleados();
		}
		cargarAreasExportar();
		cargarDepartamentosExportar();
	});

	cargarEmpleados();
});
