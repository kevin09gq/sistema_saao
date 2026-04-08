
<div class="modal fade" id="modal-marcajes" tabindex="-1" aria-hidden="true">
     <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
         <div class="modal-content">
             <div class="modal-header">
                 <h5 class="modal-title"><i class="bi bi-clock-history"></i> Ajustar marcajes</h5>
                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
             </div>
 
             <div class="modal-body">
                 <div class="row g-3">
                     <div class="col-12 col-lg-6">
                     
 
                         <div class="d-flex gap-2 mb-2">
                             <button type="button" class="btn btn-sm btn-success flex-fill" id="btn-seleccionar-todos-marcajes"><i class="bi bi-check-all"></i> Todos</button>
                             <button type="button" class="btn btn-sm btn-warning flex-fill" id="btn-deseleccionar-todos-marcajes"><i class="bi bi-x-circle"></i> Ninguno</button>
                         </div>

                         <div id="lista-empleados-marcajes" class="list-group border rounded overflow-auto" style="max-height: 420px;"></div>
                     </div>
 
                     <div class="col-12 col-lg-6">
                         <div class="mb-3">
                             <label class="form-label" for="select-dia-marcajes">Día</label>
                             <select id="select-dia-marcajes" class="form-select">
                                 <option value="">Selecciona...</option>
                                 <option value="lunes">Lunes</option>
                                 <option value="martes">Martes</option>
                                 <option value="miércoles">Miércoles</option>
                                 <option value="jueves">Jueves</option>
                                 <option value="viernes">Viernes</option>
                                 <option value="sábado">Sábado</option>
                                 <option value="domingo">Domingo</option>
                             </select>
                         </div>
 
                         <div class="border rounded p-3">
                             <div class="row g-2 align-items-center mb-2">
                                 <div class="col-5">
                                     <div class="form-check">
                                         <input class="form-check-input chk-marcaje" type="checkbox" id="chk-entrada-marcajes" data-campo="entrada">
                                         <label class="form-check-label" for="chk-entrada-marcajes">Entrada</label>
                                     </div>
                                 </div>
                                 <div class="col-7">
                                     <input type="time" class="form-control form-control-sm input-marcaje" id="input-entrada-marcajes" data-campo="entrada" disabled>
                                 </div>
                             </div>
 
                             <div class="row g-2 align-items-center mb-2">
                                 <div class="col-5">
                                     <div class="form-check">
                                         <input class="form-check-input chk-marcaje" type="checkbox" id="chk-entrada-comida-marcajes" data-campo="entrada_comida">
                                         <label class="form-check-label" for="chk-entrada-comida-marcajes">Salida a comida</label>
                                     </div>
                                 </div>
                                 <div class="col-7">
                                     <input type="time" class="form-control form-control-sm input-marcaje" id="input-entrada-comida-marcajes" data-campo="entrada_comida" disabled>
                                 </div>
                             </div>
 
                             <div class="row g-2 align-items-center mb-2">
                                 <div class="col-5">
                                     <div class="form-check">
                                         <input class="form-check-input chk-marcaje" type="checkbox" id="chk-termino-comida-marcajes" data-campo="termino_comida">
                                         <label class="form-check-label" for="chk-termino-comida-marcajes">Regreso comida</label>
                                     </div>
                                 </div>
                                 <div class="col-7">
                                     <input type="time" class="form-control form-control-sm input-marcaje" id="input-termino-comida-marcajes" data-campo="termino_comida" disabled>
                                 </div>
                             </div>
 
                             <div class="row g-2 align-items-center">
                                 <div class="col-5">
                                     <div class="form-check">
                                         <input class="form-check-input chk-marcaje" type="checkbox" id="chk-salida-marcajes" data-campo="salida">
                                         <label class="form-check-label" for="chk-salida-marcajes">Salida</label>
                                     </div>
                                 </div>
                                 <div class="col-7">
                                     <input type="time" class="form-control form-control-sm input-marcaje" id="input-salida-marcajes" data-campo="salida" disabled>
                                 </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
 
             <div class="modal-footer">
                 <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                 <button type="button" class="btn btn-primary" id="btn-aplicar-marcajes"><i class="bi bi-check-lg"></i> Aplicar</button>
             </div>
         </div>
     </div>
 </div>
