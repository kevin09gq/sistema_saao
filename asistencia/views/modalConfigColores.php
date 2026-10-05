<!-- Modal de Configuración de Colores por Sexo -->
<div class="modal fade" id="modalConfigColores" tabindex="-1" aria-labelledby="modalConfigColoresLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" style="max-width: 580px;">
        <div class="modal-content border-0 shadow-lg rounded-4">

            <!-- Header -->
            <div class="modal-header border-0 pb-0" style="background: #f8fafc; border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
                <div class="d-flex align-items-center gap-2">
                    <div class="p-2 rounded-3 text-white" style="background: #6366f1;">
                        <i class="bi bi-palette-fill fs-5"></i>
                    </div>
                    <div>
                        <h5 class="modal-title fw-bold text-dark mb-0" id="modalConfigColoresLabel">Colores de Asistencia</h5>
                        <small class="text-muted">Color de fila por género en la lista Excel</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body px-5 py-4">

                <!-- Vista previa de ejemplo -->
                <div class="mb-4">
                    <label class="form-label fw-semibold text-secondary small mb-2">Vista previa</label>
                    <div class="rounded-3 border overflow-hidden" style="font-size: 0.85rem; font-family: Arial, sans-serif;">
                        <div class="d-flex align-items-center px-4 py-3 gap-2" id="prevRowM" style="border-bottom: 1px solid #dee2e6;">
                            <span class="fw-bold text-muted me-2" style="min-width:20px;">1</span>
                            <span class="fw-bold">GARCIA LOPEZ JUAN</span>
                            <span class="ms-auto badge" style="background: rgba(0,0,0,0.06); color: #555; font-weight:500;">Varón</span>
                        </div>
                        <div class="d-flex align-items-center px-4 py-3 gap-2" id="prevRowF">
                            <span class="fw-bold text-muted me-2" style="min-width:20px;">2</span>
                            <span class="fw-bold">MARTINEZ RUIZ ANA</span>
                            <span class="ms-auto badge" style="background: rgba(0,0,0,0.06); color: #555; font-weight:500;">Mujer</span>
                        </div>
                    </div>
                </div>

                <!-- Selector de colores -->
                <div class="d-flex flex-column gap-3">

                    <!-- Color Masculino -->
                    <div class="p-3 rounded-3 border" style="background: #fafafa;">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                 style="width:40px; height:40px; background:#3b82f6; font-size:0.9rem;">M</div>
                            <div>
                                <div class="fw-semibold" style="font-size:0.95rem;">Masculino</div>
                                <div class="text-muted" style="font-size:0.78rem;">Color de fila para varones</div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <input type="color" id="colorPickerM" value="#D6EAF8"
                                   style="width:48px; height:42px; border:none; border-radius:8px; cursor:pointer; padding:2px; flex-shrink:0;"
                                   title="Elegir color para varones">
                            <input type="text" id="hexInputM" class="form-control form-control-sm font-monospace"
                                   value="#D6EAF8" maxlength="7"
                                   placeholder="#RRGGBB"
                                   style="font-size:0.95rem; letter-spacing:0.05em; text-transform:uppercase;">
                        </div>
                    </div>

                    <!-- Color Femenino -->
                    <div class="p-3 rounded-3 border" style="background: #fafafa;">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                 style="width:40px; height:40px; background:#ec4899; font-size:0.9rem;">F</div>
                            <div>
                                <div class="fw-semibold" style="font-size:0.95rem;">Femenino</div>
                                <div class="text-muted" style="font-size:0.78rem;">Color de fila para mujeres</div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <input type="color" id="colorPickerF" value="#F5B7B1"
                                   style="width:48px; height:42px; border:none; border-radius:8px; cursor:pointer; padding:2px; flex-shrink:0;"
                                   title="Elegir color para mujeres">
                            <input type="text" id="hexInputF" class="form-control form-control-sm font-monospace"
                                   value="#F5B7B1" maxlength="7"
                                   placeholder="#RRGGBB"
                                   style="font-size:0.95rem; letter-spacing:0.05em; text-transform:uppercase;">
                        </div>
                    </div>

                </div>

            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 px-5 pb-4 pt-0 d-flex justify-content-between">
                <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" id="btnGuardarColores" class="btn text-white px-5 fw-semibold d-flex align-items-center gap-1"
                        style="background: #6366f1;">
                    <i class="bi bi-check-lg"></i> Guardar colores
                </button>
            </div>

        </div>
    </div>
</div>

<script>
(function () {
    function isValidHex(val) {
        return /^#[0-9A-Fa-f]{6}$/.test(val);
    }

    function syncPickerToHex(picker, hexInput, previewRow) {
        picker.addEventListener('input', function () {
            hexInput.value = picker.value.toUpperCase();
            previewRow.style.backgroundColor = picker.value;
        });

        hexInput.addEventListener('input', function () {
            let val = hexInput.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            hexInput.value = val.toUpperCase();
            if (isValidHex(val)) {
                picker.value = val;
                previewRow.style.backgroundColor = val;
            }
        });

        hexInput.addEventListener('blur', function () {
            if (!isValidHex(hexInput.value)) {
                hexInput.value = picker.value.toUpperCase();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const pickerM   = document.getElementById('colorPickerM');
        const hexM      = document.getElementById('hexInputM');
        const prevM     = document.getElementById('prevRowM');

        const pickerF   = document.getElementById('colorPickerF');
        const hexF      = document.getElementById('hexInputF');
        const prevF     = document.getElementById('prevRowF');

        // Inicializar vistas previas
        if (prevM) prevM.style.backgroundColor = pickerM.value;
        if (prevF) prevF.style.backgroundColor = pickerF.value;

        syncPickerToHex(pickerM, hexM, prevM);
        syncPickerToHex(pickerF, hexF, prevF);
    });
})();
</script>
