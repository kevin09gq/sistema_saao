// Configuración de colores por área (modal dentro de Gafetes)
$(function () {
    const $modal = $('#modalColoresAreas');
    const $tbody = $('#cuerpoColoresAreas');
    const $btnRecargar = $('#btnRecargarAreas');
    let soportaColorTexto = true;

    function clamp255(n) {
        n = parseInt(n, 10);
        if (Number.isNaN(n)) return 0;
        return Math.min(255, Math.max(0, n));
    }

    function parseColorToRgb(color) {
        if (!color) return null;
        const c = String(color).trim();

        // #RGB / #RRGGBB
        const hexMatch = c.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
        if (hexMatch) {
            let hex = hexMatch[1];
            if (hex.length === 3) {
                hex = hex.split('').map(ch => ch + ch).join('');
            }
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return { r, g, b };
        }

        // rgb(r,g,b)
        const rgbMatch = c.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
        if (rgbMatch) {
            const r = clamp255(rgbMatch[1]);
            const g = clamp255(rgbMatch[2]);
            const b = clamp255(rgbMatch[3]);
            return { r, g, b };
        }

        return null;
    }

    function rgbToHex(rgb) {
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return `#${toHex(clamp255(rgb.r))}${toHex(clamp255(rgb.g))}${toHex(clamp255(rgb.b))}`.toUpperCase();
    }

    function normalizarColorEntrada(color) {
        const c = String(color ?? '').trim();
        if (c === '') return null;
        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)) return c.toUpperCase();

        const rgbMatch = c.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
        if (rgbMatch) {
            const r = clamp255(rgbMatch[1]);
            const g = clamp255(rgbMatch[2]);
            const b = clamp255(rgbMatch[3]);
            return `rgb(${r}, ${g}, ${b})`;
        }

        return false;
    }

    function colorContrasteBasico(colorFondo) {
        const rgb = parseColorToRgb(colorFondo);
        if (!rgb) return '#FFFFFF';
        const luminancia = (0.2126 * rgb.r) + (0.7152 * rgb.g) + (0.0722 * rgb.b);
        return luminancia > 170 ? '#000000' : '#FFFFFF';
    }

    function renderRow(area) {
        const fondoActual = area.colores ? String(area.colores).trim() : '';
        const textoActual = area.colores_texto ? String(area.colores_texto).trim() : '';

        const rgbFondo = parseColorToRgb(fondoActual);
        const hexFondoPicker = rgbFondo ? rgbToHex(rgbFondo) : '#06320C';
        const fondoInput = fondoActual || hexFondoPicker;

        const rgbTexto = parseColorToRgb(textoActual);
        const hexTextoPicker = rgbTexto ? rgbToHex(rgbTexto) : colorContrasteBasico(fondoInput);
        const textoInput = soportaColorTexto ? (textoActual || hexTextoPicker) : '';

        const $tr = $(
            `<tr data-id="${area.id_area}">
                <td>${area.nombre_area}</td>
                <td>
                    <div class="rounded border d-flex align-items-center justify-content-center" style="width:70px;height:26px;background:${fondoInput};">
                        <span style="font-weight:700;font-size:12px;color:${soportaColorTexto ? textoInput : colorContrasteBasico(fondoInput)};">Nombre</span>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <input type="color" class="form-control form-control-color input-color-fondo" value="${hexFondoPicker}" title="Elegir fondo">
                        <input type="text" class="form-control form-control-sm input-valor-fondo" placeholder="#RRGGBB o rgb(r,g,b)" value="${fondoInput}">
                    </div>
                    <div class="form-text text-danger d-none error-fondo">Fondo inválido</div>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <input type="color" class="form-control form-control-color input-color-texto" value="${hexTextoPicker}" title="Elegir texto" ${soportaColorTexto ? '' : 'disabled'}>
                        <input type="text" class="form-control form-control-sm input-valor-texto" placeholder="${soportaColorTexto ? '#RRGGBB o rgb(r,g,b)' : 'Requiere columna colores_texto'}" value="${textoInput}" ${soportaColorTexto ? '' : 'disabled'}>
                    </div>
                    <div class="form-text text-danger d-none error-texto">Texto inválido</div>
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-primary btn-guardar-color">
                        <i class="bi bi-save"></i> Guardar
                    </button>
                </td>
            </tr>`
        );

        return $tr;
    }

    function cargarAreas() {
        $tbody.html('<tr><td colspan="5" class="text-muted">Cargando...</td></tr>');

        $.ajax({
            url: 'php/obtenerAreas.php',
            type: 'GET',
            dataType: 'json'
        }).done(function (resp) {
            if (!resp || resp.success !== true) {
                const msg = resp && resp.message ? resp.message : 'No se pudieron cargar las áreas.';
                $tbody.html(`<tr><td colspan="5" class="text-danger">${msg}</td></tr>`);
                return;
            }

            soportaColorTexto = !(resp.meta && resp.meta.tieneColoresTexto === false);
            if (!soportaColorTexto && typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'info',
                    title: 'Color de texto no disponible',
                    text: "Para habilitarlo ejecuta: ALTER TABLE areas ADD COLUMN colores_texto VARCHAR(20) DEFAULT NULL AFTER colores;",
                });
            }

            const areas = Array.isArray(resp.data) ? resp.data : [];
            if (areas.length === 0) {
                $tbody.html('<tr><td colspan="5" class="text-muted">No hay áreas registradas.</td></tr>');
                return;
            }

            $tbody.empty();
            areas.forEach(a => $tbody.append(renderRow(a)));
        }).fail(function () {
            $tbody.html('<tr><td colspan="5" class="text-danger">Error de red al cargar áreas.</td></tr>');
        });
    }

    function setPreview($tr) {
        const fondo = $tr.find('.input-valor-fondo').val();
        const texto = $tr.find('.input-valor-texto').val();
        $tr.find('div.rounded.border').css('background', fondo || 'transparent');
        const colorTextoPreview = soportaColorTexto
            ? (texto || colorContrasteBasico(fondo))
            : colorContrasteBasico(fondo);
        $tr.find('div.rounded.border span').css('color', colorTextoPreview);
    }

    $modal.on('show.bs.modal', function () {
        cargarAreas();
    });

    $btnRecargar.on('click', function () {
        cargarAreas();
    });

    // Fondo: cambios desde picker
    $tbody.on('input', '.input-color-fondo', function () {
        const $tr = $(this).closest('tr');
        const hex = $(this).val();
        $tr.find('.input-valor-fondo').val(hex);
        $tr.find('.error-fondo').addClass('d-none');

        // Si el texto no fue definido explícitamente, ajustar contraste como sugerencia visual
        const textoActual = String($tr.find('.input-valor-texto').val() || '').trim();
        if (textoActual === '') {
            const sugerido = colorContrasteBasico(hex);
            $tr.find('.input-valor-texto').val(sugerido);
            $tr.find('.input-color-texto').val(sugerido);
        }

        setPreview($tr);
    });

    // Texto: cambios desde picker
    $tbody.on('input', '.input-color-texto', function () {
        const $tr = $(this).closest('tr');
        const hex = $(this).val();
        $tr.find('.input-valor-texto').val(hex);
        $tr.find('.error-texto').addClass('d-none');
        setPreview($tr);
    });

    // Fondo: cambios desde texto
    $tbody.on('input', '.input-valor-fondo', function () {
        const $tr = $(this).closest('tr');
        const valor = $(this).val();
        const normalizado = normalizarColorEntrada(valor);

        if (normalizado === false) {
            $tr.find('.error-fondo').removeClass('d-none');
            setPreview($tr);
            return;
        }

        $tr.find('.error-fondo').addClass('d-none');

        const rgb = parseColorToRgb(normalizado);
        if (rgb) {
            $tr.find('.input-color-fondo').val(rgbToHex(rgb));
        }

        setPreview($tr);
    });

    // Texto: cambios desde texto
    $tbody.on('input', '.input-valor-texto', function () {
        const $tr = $(this).closest('tr');
        const valor = $(this).val();
        const normalizado = normalizarColorEntrada(valor);

        if (normalizado === false) {
            $tr.find('.error-texto').removeClass('d-none');
            setPreview($tr);
            return;
        }

        $tr.find('.error-texto').addClass('d-none');
        const rgb = parseColorToRgb(normalizado);
        if (rgb) {
            $tr.find('.input-color-texto').val(rgbToHex(rgb));
        }

        setPreview($tr);
    });

    // Guardar
    $tbody.on('click', '.btn-guardar-color', function () {
        const $tr = $(this).closest('tr');
        const idArea = parseInt($tr.attr('data-id'), 10);
        const valorFondo = $tr.find('.input-valor-fondo').val();
        const valorTexto = soportaColorTexto ? $tr.find('.input-valor-texto').val() : '';
        const normalizadoFondo = normalizarColorEntrada(valorFondo);
        const normalizadoTexto = normalizarColorEntrada(valorTexto);

        if (normalizadoFondo === false) {
            $tr.find('.error-fondo').removeClass('d-none');
            return;
        }
        if (normalizadoTexto === false) {
            $tr.find('.error-texto').removeClass('d-none');
            return;
        }

        $.ajax({
            url: 'php/guardarColorArea.php',
            type: 'POST',
            dataType: 'json',
            data: {
                id_area: idArea,
                color_fondo: normalizadoFondo || '',
                color_texto: soportaColorTexto ? (normalizadoTexto || '') : ''
            }
        }).done(function (resp) {
            if (resp && resp.success) {
                const fondoGuardado = resp.data && resp.data.color_fondo ? resp.data.color_fondo : (normalizadoFondo || '');
                const textoGuardado = resp.data && resp.data.color_texto ? resp.data.color_texto : (normalizadoTexto || '');

                $tr.find('.input-valor-fondo').val(fondoGuardado);
                $tr.find('.input-valor-texto').val(textoGuardado);
                $tr.find('.error-fondo').addClass('d-none');
                $tr.find('.error-texto').addClass('d-none');

                const rgbF = parseColorToRgb(fondoGuardado);
                if (rgbF) {
                    $tr.find('.input-color-fondo').val(rgbToHex(rgbF));
                }
                const rgbT = parseColorToRgb(textoGuardado);
                if (rgbT) {
                    $tr.find('.input-color-texto').val(rgbToHex(rgbT));
                }

                setPreview($tr);

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Guardado',
                        text: 'Color actualizado para el área.',
                        timer: 1200,
                        showConfirmButton: false
                    });
                }
            } else {
                const msg = resp && resp.message ? resp.message : 'No se pudo guardar el color.';
                if (typeof Swal !== 'undefined') {
                    Swal.fire({ icon: 'error', title: 'Error', text: msg });
                }
            }
        }).fail(function () {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error de red al guardar el color.' });
            }
        });
    });
});
