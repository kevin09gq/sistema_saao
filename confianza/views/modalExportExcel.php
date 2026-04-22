<?php
// Modal Bootstrap para exportar la nómina a Excel
// Este archivo contiene el HTML del modal. El JS `export_nomina_excel.js` deberá
// abrir el modal y poblar los selects si es necesario.
?>

<!-- Modal Exportar a Excel -->
<div class="modal fade" id="modalExportExcel" tabindex="-1" aria-labelledby="modalExportExcelLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalExportExcelLabel">Exportar a Excel</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <p class="small text-muted">Seleccione el departamento y la empresa que desea exportar. "Todos" exporta todos los empleados.</p>

        <div class="row g-2">
          <div class="col-md-6">
            <label for="modal-sw-depto" class="form-label">Departamento</label>
            <select id="modal-sw-depto" class="form-select">
              <option value="Todos">Todos</option>
              <!-- Opciones serán pobladas por JS -->
            </select>
          </div>
          <div class="col-md-6">
            <label for="modal-sw-empresa" class="form-label">Empresa</label>
            <select id="modal-sw-empresa" class="form-select">
              <option value="Todas">Todas</option>
              <option value="1">CITRICOS SAAO</option>
              <option value="2">SB citric´s group</option>
            </select>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn_generar_excel_modal">Generar Excel</button>
      </div>
    </div>
  </div>
</div>

<!-- Nota: el JS debe encargarse de abrir el modal: $('#modalExportExcel').modal('show') o usar Bootstrap Modal API -->
