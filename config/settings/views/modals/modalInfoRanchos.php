 <div class="modal fade" id="modalInfoRancho" tabindex="-1" aria-labelledby="modalInfoRanchoLabel"
     aria-hidden="true">
     <div class="modal-dialog modal-xl">
         <div class="modal-content">
             <div class="modal-header">
                 <h1 class="modal-title fs-5" id="modalInfoRanchoLabel">Detalles de la información del rancho</h1>
                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
             </div>
             <div class="modal-body">
                 <div class="table-responsive mb-4">
                     <h6 class="mb-3">Información general</h6>
                     <table class="table table-hover table-bordered shadow-sm">
                         <thead>
                             <tr class="text-center">
                                 <th>Rancho</th>
                                 <th>Número de Tablas</th>
                             </tr>
                         </thead>
                         <tbody id="body-info-rancho"></tbody>
                     </table>
                 </div>

                 <div class="table-responsive">
                     <h6 class="mb-3">Horarios de los jornaleros</h6>
                     <table class="table table-hover table-bordered shadow-sm">
                         <thead>
                             <tr class="text-center">
                                 <th>Día</th>
                                 <th>Entrada</th>
                                 <th>Salida</th>
                                 <th>Descanso</th>
                             </tr>
                         </thead>
                         <tbody id="body-rancho-horario-jornaleros"></tbody>
                     </table>
                 </div>
             </div>
         </div>
     </div>
 </div>