<!-- MODAL - DETALLES DE NÓMINA -->
<div class="modal fade" id="modalDetallesNominaEmpleado" tabindex="-1" aria-labelledby="modalDetallesNominaEmpleadoLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalDetallesNominaEmpleadoLabel">
                    <i class="bi bi-gear-fill me-2"></i>
                    Detalles de Nómina
                </h5>

                <button
                    type="button"
                    id="btnCerrarModalDetallesNomina"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>

            <!-- CUERPO -->
            <div class="modal-body">


                <!-- Navegación Principal Tabs -->
                <ul class="nav nav-tabs mb-4 sticky-top bg-white pt-2" id="tabsPrincipales" role="tablist" style="top: -1rem; z-index: 1020;">

                    <li class="nav-item" role="presentation">

                        <button
                            class="nav-link active"
                            id="tab-registros-principal-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-registros-principal"
                            type="button"
                            role="tab"
                            aria-controls="tab-registros-principal"
                            aria-selected="true">

                            <i class="bi bi-clock-history me-2"></i>
                            Registros

                        </button>


                    </li>

                    <li class="nav-item" role="presentation">

                        <button
                            class="nav-link"
                            id="tab-modificar-detalles-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#tab-modificar-detalles"
                            type="button"
                            role="tab"
                            aria-controls="tab-modificar-detalles"
                            aria-selected="false">

                            <i class="bi bi-pencil-square me-2"></i>
                            Modificar Detalles

                        </button>

                    </li>

                </ul>

                <!-- Contenido Tabs Principales -->
                <div class="tab-content" id="tabsPrincipalesContent">

                    <!-- Tab Principal: Registros -->
                    <div
                        class="tab-pane fade show active"
                        id="tab-registros-principal"
                        role="tabpanel"
                        aria-labelledby="tab-registros-principal-tab">

                        <!-- Sub-tabs para Registros y Biométrico -->
                        <ul class="nav nav-tabs mb-3" id="tabsRegistrosBiometrico" role="tablist">

                            <li class="nav-item" role="presentation">

                                <button
                                    class="nav-link active"
                                    id="tab-registros-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#tab-registros"
                                    type="button"
                                    role="tab"
                                    aria-controls="tab-registros"
                                    aria-selected="true">

                                    <i class="bi bi-clock-history me-2"></i>
                                    Registros del Empleado

                                </button>

                            </li>

                            <li class="nav-item" role="presentation" id="ocultarBotonHorarioOficial">

                                <button
                                    class="nav-link"
                                    id="tab-biometrico-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#tab-biometrico"
                                    type="button"
                                    role="tab"
                                    aria-controls="tab-biometrico"
                                    aria-selected="false">

                                    <i class="bi bi-fingerprint me-2"></i>
                                    Horario Oficial
                                </button>

                            </li>

                        </ul>

                        <!-- Contenido Sub-tabs -->
                        <div class="tab-content" id="tabsRegistrosBiometricoContent">

                            <!-- Sub-tab: Registros del Empleado -->
                            <div
                                class="tab-pane fade show active"
                                id="tab-registros"
                                role="tabpanel"
                                aria-labelledby="tab-registros-tab">

                                <div class="table-responsive table-scroll-rounded">

                                    <table class="table table-bordered align-middle"
                                        style="table-layout: fixed; width:100%;">

                                        <colgroup>

                                            <col style="width:19.5%;">
                                            <col style="width:30.5%;">
                                            <col style="width:25%;">
                                            <col style="width:25%;">

                                        </colgroup>

                                        <thead class="table-success">

                                            <tr>

                                                <th>Día</th>

                                                <th>Fecha</th>

                                                <th>Entrada</th>

                                                <th>Salida</th>

                                            </tr>

                                        </thead>

                                        <tbody id="tbody-registros-empleado">


                                        </tbody>

                                    </table>

                                </div>

                            </div>

                            <!-- Sub-tab: Horario Oficial -->
                            <div
                                class="tab-pane fade"
                                id="tab-biometrico"
                                role="tabpanel"
                                aria-labelledby="tab-biometrico-tab">

                                <div class="table-responsive table-scroll-rounded">

                                    <table
                                        class="table table-bordered align-middle"
                                        style="table-layout: fixed; width:100%;">

                                        <colgroup>

                                            <col style="width:20%;">
                                            <col style="width:20%;">
                                            <col style="width:20%;">
                                            <col style="width:20%;">
                                            <col style="width:20%;">


                                        </colgroup>
                                        <thead class="table-info">

                                            <tr>

                                                <th>Día</th>

                                                <th>Entrada</th>

                                                <th>Entrada Comida</th>

                                                <th>Término Comida</th>

                                                <th>Salida</th>

                                            </tr>

                                        </thead>

                                        <tbody id="tbody-horario-oficial">



                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                        <!-- Barra de separacion-->
                        <hr class="my-4">

                        <!--  EVENTOS ESPECIALES -->
                        <div class="container-fluid px-0">

                            <!-- Primera fila -->
                            <div class="row">

                                <!-- Entradas Tempranas (Azul) -->
                                <div class="col-md-6 mb-3">

                                    <div class="card border-primary shadow-sm h-100">

                                        <div class="card-header bg-primary text-white d-flex align-items-center">

                                            <i class="bi bi-sunrise me-2"></i>

                                            <strong>Entradas Tempranas</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="entradas-tempranas-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-entradas-tempranas-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                                <!-- Salidas Tardías (Naranja) -->
                                <div class="col-md-6 mb-3">

                                    <div class="card shadow-sm h-100" style="border-color: #fd7e14;">

                                        <div class="card-header text-white d-flex align-items-center" style="background-color: #fd7e14;">

                                            <i class="bi bi-sunset me-2"></i>

                                            <strong>Salidas Tardías</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="salidas-tardias-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-salidas-tardias-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <!-- Segunda fila -->
                            <div class="row">

                                <!-- Salidas Tempranas (Morado) -->
                                <div class="col-md-6 mb-3">

                                    <div class="card shadow-sm h-100" style="border-color: #6f42c1;">

                                        <div class="card-header text-white d-flex align-items-center" style="background-color: #6f42c1;">

                                            <i class="bi bi-clock me-2"></i>

                                            <strong>Salidas Tempranas</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="salidas-tempranas-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-salidas-tempranas-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                                <!-- Olvidos del Biométrico (Rojo) -->
                                <div class="col-md-6 mb-3">

                                    <div class="card border-danger shadow-sm h-100" id="olvidos-checador-card-10lbs">

                                        <div class="card-header bg-danger text-white d-flex align-items-center">

                                            <i class="bi bi-exclamation-triangle me-2"></i>

                                            <strong>Olvidos del Biométrico</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="olvidos-checador-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-olvidos-checador-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <!-- Tercera fila -->
                            <div class="row">

                                <!-- Retardos (Amarillo) -->
                                <div class="col-md-6 mb-3">

                                    <div class="card border-warning shadow-sm h-100" id="retardos-card-10lbs">

                                        <div class="card-header bg-warning text-dark d-flex align-items-center">

                                            <i class="bi bi-clock-fill me-2"></i>

                                            <strong>Retardos</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="retardos-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-retardos-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                                <!-- Ausentismos (Verde) -->
                                <div class="col-md-6 mb-3">

                                    <div class="card border-success shadow-sm h-100" id="inasistencias-card-10lbs">

                                        <div class="card-header bg-success text-white d-flex align-items-center">

                                            <i class="bi bi-x-circle me-2"></i>

                                            <strong>Ausentismos</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="inasistencias-content-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-inasistencias-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            <!-- Cuarta fila -->
                            <div class="row">
                                <!-- Hora Comida Extra (Cafe) -->
                                <div class="col-md-6 mb-3">

                                    <div class="card border-secondary shadow-sm h-100" id="comida-card-10lbs">

                                        <div class="card-header bg-secondary text-white d-flex align-items-center">

                                            <i class="bi bi-clock-fill me-2"></i>

                                            <strong>Hora Comida Extra</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="comida-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-comida-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                                <!-- Hora Extra (Rosa) -->

                                <div class="col-md-6 mb-3">

                                    <div class="card shadow-sm h-100" style="border-color: #e83e8c;">

                                        <div class="card-header text-white d-flex align-items-center" style="background-color: #e83e8c;">

                                            <i class="bi bi-clock me-2"></i>

                                            <strong>Marcajes</strong>

                                        </div>

                                        <div class="card-body">

                                            <div id="marcajes-10lbs"></div>

                                        </div>

                                        <div class="card-footer text-end fw-bold">

                                            Total:
                                            <span id="total-marcajes-10lbs">0</span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                    </div>

                    <!-- Tab Principal: Modificar Detalles -->
                    <div
                        class="tab-pane fade"
                        id="tab-modificar-detalles"
                        role="tabpanel"
                        aria-labelledby="tab-modificar-detalles-tab">

                        <!-- PASO 2 - PERCEPCIONES -->
                        <div class="card mb-4">

                            <div class="card-header bg-primary text-white">

                                <strong>
                                    <i class="bi bi-plus-circle me-2"></i>
                                    Percepciones
                                </strong>

                            </div>

                            <div class="card-body">

                                <div class="row mb-3">

                                    <!-- Salario Semanal -->
                                    <div class="col-md-6 mb-3">

                                        <label for="inputSalarioSemanal" class="form-label fw-bold">
                                            Salario Semanal ($)
                                        </label>

                                        <input
                                            type="number"
                                            class="form-control"
                                            id="inputSalarioSemanal"
                                            placeholder="0.00"
                                            step="0.01">

                                    </div>
                                    <!-- Total Sueldo Extra -->
                                    <div class="col-md-6 mb-3">

                                        <label for="inputTotalSueldoExtra" class="form-label fw-bold">
                                            Total Sueldo Extra ($)
                                        </label>

                                        <input
                                            type="number"
                                            class="form-control bg-light"
                                            id="inputTotalSueldoExtra"
                                            placeholder="0.00"
                                            step="0.01"
                                            readonly>

                                        <small class="text-muted">Calculado automáticamente</small>

                                    </div>

                                </div>

                                <!-- Componentes del Sueldo Extra -->
                                <div class="card">

                                    <div class="card-header bg-light">

                                        <strong>Componentes del Sueldo Extra</strong>

                                        <small class="text-muted d-block mt-1">
                                            Configure los diferentes conceptos que conforman el sueldo extra
                                        </small>

                                    </div>

                                    <div class="card-body">

                                        <!-- Inputs para Percepciones Extras -->
                                        <div class="row mb-3">

                                            <!-- Nombre del Concepto -->
                                            <div class="col-md-6 mb-3">

                                                <label for="inputNombrePercepcionExtra" class="form-label">
                                                    Nombre del Concepto
                                                </label>

                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    id="inputNombrePercepcionExtra"
                                                    placeholder="Ej: Bono Productividad">

                                            </div>

                                            <!-- Cantidad -->
                                            <div class="col-md-6 mb-3">

                                                <label for="inputCantidadPercepcionExtra" class="form-label">
                                                    Cantidad ($)
                                                </label>

                                                <input
                                                    type="number"
                                                    class="form-control"
                                                    id="inputCantidadPercepcionExtra"
                                                    placeholder="0.00"
                                                    step="0.01">

                                            </div>

                                        </div>

                                        <!-- Botón Agregar Otro Concepto -->
                                        <div class="d-grid">

                                            <button
                                                type="button"
                                                class="btn btn-outline-success"
                                                id="btnAgregarOtroConceptoPercepcion">

                                                <i class="bi bi-plus-lg me-2"></i>
                                                Agregar Otro Concepto

                                            </button>

                                        </div>


                                        <!-- Tabla de Percepciones Extras -->
                                        <div class="table-responsive mt-3 mb-3">

                                            <table class="table table-bordered align-middle table-striped">

                                                <thead class="table-light">

                                                    <tr>

                                                        <th>Nombre</th>

                                                        <th>Cantidad</th>

                                                        <th width="60">Acción</th>

                                                    </tr>

                                                </thead>

                                                <tbody id="tbody-percepciones-extras">

                                                    <tr>

                                                        <td colspan="3" class="text-center text-muted">
                                                            No hay percepciones extras agregadas
                                                        </td>

                                                    </tr>

                                                </tbody>

                                            </table>

                                        </div>



                                    </div>

                                </div>

                            </div>

                        </div>

                        <!-- PASO 3 - CONCEPTOS -->
                        <div class="card mb-4">

                            <div class="card-header bg-success text-white">

                                <strong>
                                    <i class="bi bi-list-check me-2"></i>
                                    Conceptos
                                </strong>

                            </div>

                            <div class="card-body">

                                <div class="row">

                                    <!-- ISR -->
                                    <div class="col-md-3 mb-3">

                                        <label for="inputISR" class="form-label fw-bold">
                                            ISR ($)
                                        </label>

                                        <div class="input-group">

                                            <input
                                                type="number"
                                                class="form-control"
                                                id="inputISR"
                                                placeholder="0.00"
                                                step="0.01">

                                            <span class="input-group-text" id="btnActualizarIsr">
                                                <i class="bi bi-calculator"></i>
                                            </span>

                                        </div>

                                    </div>

                                    <!-- IMSS -->
                                    <div class="col-md-3 mb-3">

                                        <label for="inputIMSS" class="form-label fw-bold">
                                            IMSS ($)
                                        </label>

                                        <div class="input-group">

                                            <input
                                                type="number"
                                                class="form-control"
                                                id="inputIMSS"
                                                placeholder="0.00"
                                                step="0.01">

                                            <span class="input-group-text" id="btnActualizarImss">
                                                <i class="bi bi-calculator"></i>
                                            </span>

                                        </div>

                                    </div>

                                    <!-- INFONAVIT -->
                                    <div class="col-md-3 mb-3">

                                        <label for="inputInfonavit" class="form-label fw-bold">
                                            INFONAVIT ($)
                                        </label>

                                        <div class="input-group">

                                            <input
                                                type="number"
                                                class="form-control"
                                                id="inputInfonavit"
                                                placeholder="0.00"
                                                step="0.01">

                                            <span class="input-group-text" id="btnActualizarInfonavit">
                                                <i class="bi bi-calculator"></i>
                                            </span>

                                        </div>

                                    </div>

                                    <!-- Ajustes al Subsidio -->
                                    <div class="col-md-3 mb-3">

                                        <label for="inputAjustesSub" class="form-label fw-bold">
                                            Ajustes al Sub ($)
                                        </label>

                                        <div class="input-group">

                                            <input
                                                type="number"
                                                class="form-control"
                                                id="inputAjustesSub"
                                                placeholder="0.00"
                                                step="0.01">

                                            <span class="input-group-text" id="btnActualizarAjusteSub">
                                                <i class="bi bi-calculator"></i>
                                            </span>

                                        </div>

                                    </div>

                                </div>

                                <!-- Total Conceptos -->
                                <div class="row">

                                    <div class="col-md-12">

                                        <label for="inputTotalConceptos" class="form-label fw-bold">
                                            Total Conceptos ($)
                                        </label>

                                        <input
                                            type="number"
                                            class="form-control bg-light"
                                            id="inputTotalConceptos"
                                            placeholder="0.00"
                                            step="0.01"
                                            readonly>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <!-- PASO 4 - DEDUCCIONES -->
                        <div class="card mb-4">

                            <div class="card-header bg-warning text-white">

                                <div class="d-flex justify-content-between align-items-center">

                                    <strong>
                                        <i class="bi bi-dash-circle me-2"></i>
                                        Deducciones
                                    </strong>

                                </div>

                            </div>

                            <div class="card-body">

                                <div class="row mb-3">

                                    <!-- Tarjeta -->
                                    <div class="col-md-6 mb-3">

                                        <label for="inputTarjeta" class="form-label fw-bold">
                                            Tarjeta ($)
                                        </label>

                                        <div class="input-group">
                                            <input
                                                type="number"
                                                class="form-control"
                                                id="inputTarjeta"
                                                placeholder="0.00"
                                                step="0.01">

                                            <span class="input-group-text" id="btnActualizarTarjeta">
                                                <i class="bi bi-calculator"></i>
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Préstamos -->
                                    <div class="col-md-6 mb-3">

                                        <label for="inputPrestamos" class="form-label fw-bold">
                                            Préstamos ($)
                                        </label>

                                        <input
                                            type="number"
                                            class="form-control"
                                            id="inputPrestamos"
                                            placeholder="0.00"
                                            step="0.01">

                                    </div>

                                </div>

                                <!-- Historial de Olvidos de Biométrico -->
                                <div class="card mt-4">

                                    <div class="card-header bg-danger text-white">

                                        <strong>
                                            <i class="bi bi-clock-history me-2"></i>
                                            Historial de Olvidos de Biométrico
                                        </strong>

                                    </div>

                                    <div class="card-body">

                                        <!-- Input de Biométrico -->
                                        <div class="row mt-3">

                                            <div class="col-md-12">

                                                <label for="inputBiometrico" class="form-label fw-bold">
                                                    Biométrico ($)
                                                </label>

                                                <input
                                                    type="number"
                                                    class="form-control"
                                                    id="inputBiometrico"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    disabled>

                                            </div>

                                        </div>

                                        <div class="table-responsive">

                                            <table class="table table-bordered align-middle table-striped mt-3">

                                                <thead class="table-danger">

                                                    <tr>

                                                        <th>Día</th>

                                                        <th>Fecha</th>

                                                        <th>Descuento</th>

                                                        <th width="60">Acción</th>

                                                    </tr>

                                                </thead>

                                                <tbody id="tbody-historial-olvidos-biometrico">


                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                </div>
                          

                                <!-- Permisos -->
                                <div class="card mt-4">

                                    <div class="card-header text-white" style="background-color: #e83e8c; border-color: #e83e8c;">

                                        <strong>
                                            <i class="bi bi-calendar-check me-2"></i>
                                            Permisos
                                        </strong>

                                    </div>

                                    <div class="card-body">

                                        <!-- Input de Permisos -->
                                        <div class="row mb-3">

                                            <div class="col-md-12">

                                                <label for="inputPermisos" class="form-label fw-bold">
                                                    Permisos ($)
                                                </label>

                                                <input
                                                    type="number"
                                                    class="form-control"
                                                    id="inputPermisos"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    disabled>

                                            </div>

                                        </div>

                                        <!-- Agregar Permiso -->
                                        <div class="card mb-3">

                                            <div class="card-header bg-light">

                                                <strong>Agregar Permiso</strong>

                                            </div>

                                            <div class="card-body">

                                                <div class="row">

                                                    <!-- Día de la Semana -->
                                                    <div class="col-md-3 mb-3">

                                                        <label for="selectDiaPermiso" class="form-label">
                                                            Día de la Semana
                                                        </label>

                                                        <select
                                                            class="form-select"
                                                            id="selectDiaPermiso">

                                                            <option value="">Seleccionar día...</option>

                                                            <option value="Lunes">Lunes</option>

                                                            <option value="Martes">Martes</option>

                                                            <option value="Miercoles">Miércoles</option>

                                                            <option value="Jueves">Jueves</option>

                                                            <option value="Viernes">Viernes</option>

                                                            <option value="Sabado">Sábado</option>

                                                            <option value="Domingo">Domingo</option>

                                                        </select>

                                                    </div>

                                                    <!-- Hrs Trabajadas -->
                                                    <div class="col-md-3 mb-3">

                                                        <label for="inputHrsTrabajadas" class="form-label">
                                                            Horas Trabajadas
                                                        </label>

                                                        <input
                                                            type="number"
                                                            class="form-control"
                                                            id="inputHrsTrabajadas"
                                                            placeholder="0"
                                                            step="1">

                                                    </div>

                                                    <!-- Minutos -->
                                                    <div class="col-md-3 mb-3">

                                                        <label for="inputMinutosPermiso" class="form-label">
                                                            Minutos
                                                        </label>

                                                        <input
                                                            type="number"
                                                            class="form-control"
                                                            id="inputMinutosPermiso"
                                                            placeholder="0"
                                                            step="1">

                                                    </div>

                                                    <!-- Costo por Minuto -->
                                                    <div class="col-md-3 mb-3">

                                                        <label for="inputCostoMinutoPermiso" class="form-label">
                                                            Costo por Minuto ($)
                                                        </label>

                                                        <input
                                                            type="number"
                                                            class="form-control"
                                                            id="inputCostoMinutoPermiso"
                                                            placeholder="0.00"
                                                            step="0.01">

                                                    </div>

                                                    <!-- Descuento -->
                                                    <div class="col-md-3 mb-3">

                                                        <label for="inputDescuentoPermiso" class="form-label">
                                                            Descuento ($)
                                                        </label>

                                                        <input
                                                            type="number"
                                                            class="form-control"
                                                            id="inputDescuentoPermiso"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            readonly>

                                                    </div>

                                                </div>

                                                <!-- Botón Agregar -->
                                                <div class="d-grid">

                                                    <button
                                                        type="button"
                                                        class="btn btn-outline-success"
                                                        id="btnAgregarPermiso">

                                                        <i class="bi bi-plus-lg me-2"></i>
                                                        Agregar Permiso

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                        <!-- Historial de Permisos -->
                                        <div class="table-responsive">

                                            <table class="table table-bordered align-middle table-striped">

                                                <thead class="table-pink">

                                                    <tr>

                                                        <th>Día</th>

                                                        <th>Minutos</th>

                                                        <th>$/min</th>

                                                        <th>Descuento</th>

                                                        <th width="60">Acción</th>

                                                    </tr>

                                                </thead>

                                                <tbody id="tbody-historial-permisos">

                                                    <tr>

                                                        <td colspan="5" class="text-center text-muted">
                                                            No hay permisos registrados
                                                        </td>

                                                    </tr>

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                </div>

                                <!-- Uniformes -->
                                <div class="card mt-4">

                                    <div class="card-header text-white" style="background-color: #ff9900; border-color: #ff9900;">

                                        <strong>
                                            <i class="bi bi-person-workspace me-2"></i>
                                            Uniformes
                                        </strong>

                                    </div>

                                    <div class="card-body">

                                        <!-- Input de Uniformes -->
                                        <div class="row mb-3">

                                            <div class="col-md-12">

                                                <label for="inputUniformes" class="form-label fw-bold">
                                                    Uniformes ($)
                                                </label>

                                                <input
                                                    type="number"
                                                    class="form-control"
                                                    id="inputUniformes"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    disabled>

                                            </div>

                                        </div>

                                        <!-- Agregar Uniforme -->
                                        <div class="card mb-3">

                                            <div class="card-header bg-light">

                                                <strong>Agregar Uniforme</strong>

                                            </div>

                                            <div class="card-body">

                                                <div class="row">

                                                    <!-- Folio -->
                                                    <div class="col-md-6 mb-3">

                                                        <label for="inputFolioUniforme" class="form-label">
                                                            Folio
                                                        </label>

                                                        <input
                                                            type="text"
                                                            class="form-control"
                                                            id="inputFolioUniforme"
                                                            placeholder="Ingrese el folio...">

                                                    </div>

                                                    <!-- Cantidad -->
                                                    <div class="col-md-6 mb-3">

                                                        <label for="inputCantidadUniforme" class="form-label">
                                                            Cantidad ($)
                                                        </label>

                                                        <input
                                                            type="number"
                                                            class="form-control"
                                                            id="inputCantidadUniforme"
                                                            placeholder="0.00"
                                                            step="0.01">

                                                    </div>

                                                </div>

                                                <!-- Botón Agregar -->
                                                <div class="d-grid">

                                                    <button
                                                        type="button"
                                                        class="btn btn-outline-success"
                                                        id="btnAgregarUniforme">

                                                        <i class="bi bi-plus-lg me-2"></i>
                                                        Agregar Uniforme

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                        <!-- Historial de Uniformes -->
                                        <div class="table-responsive">

                                            <table class="table table-bordered align-middle table-striped">

                                                <thead class="table-orange">

                                                    <tr>

                                                        <th>Folio</th>

                                                        <th>Cantidad</th>

                                                        <th width="60">Acción</th>

                                                    </tr>

                                                </thead>

                                                <tbody id="tbody-historial-uniformes">

                                                    <tr>

                                                        <td colspan="3" class="text-center text-muted">
                                                            No hay uniformes registrados
                                                        </td>

                                                    </tr>

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                </div>

                                <!-- F.A/GAFET/COFIA -->
                                <div class="card mt-4">

                                    <div class="card-header bg-primary text-white">

                                        <strong>
                                            <i class="bi bi-card-heading me-2"></i>
                                            F.A/GAFET/COFIA
                                        </strong>

                                    </div>

                                    <div class="card-body">

                                        <!-- Input de F.A/GAFET/COFIA -->
                                        <div class="row mb-3">

                                            <div class="col-md-12">

                                                <label for="inputFAGafetCofia" class="form-label fw-bold">
                                                    F.A/GAFET/COFIA ($)
                                                </label>

                                                <input
                                                    type="number"
                                                    class="form-control bg-light"
                                                    id="inputFAGafetCofia"
                                                    placeholder="0.00"
                                                    step="0.01"
                                                    disabled>

                                                <small class="text-muted">Calculado automáticamente desde deducciones extras</small>

                                            </div>

                                        </div>

                                        <!-- Agregar Concepto Adicional de Deducción -->
                                        <div class="card mb-3">

                                            <div class="card-header bg-light">

                                                <strong>Agregar Concepto Adicional de Deducción</strong>

                                            </div>

                                            <div class="card-body">

                                                <div class="row">

                                                    <!-- Nombre del Concepto -->
                                                    <div class="col-md-6 mb-3">

                                                        <label for="inputNombreDeduccionExtra" class="form-label">
                                                            Nombre del Concepto
                                                        </label>

                                                        <input
                                                            type="text"
                                                            class="form-control"
                                                            id="inputNombreDeduccionExtra"
                                                            placeholder="Ej: Gastos Varios">

                                                    </div>

                                                    <!-- Cantidad -->
                                                    <div class="col-md-6 mb-3">

                                                        <label for="inputCantidadDeduccionExtra" class="form-label">
                                                            Cantidad ($)
                                                        </label>

                                                        <input
                                                            type="number"
                                                            class="form-control"
                                                            id="inputCantidadDeduccionExtra"
                                                            placeholder="0.00"
                                                            step="0.01">

                                                    </div>

                                                </div>

                                                <!-- Botón Agregar -->
                                                <div class="d-grid">

                                                    <button
                                                        type="button"
                                                        class="btn btn-outline-success"
                                                        id="btnAgregarDeduccionExtra">

                                                        <i class="bi bi-plus-lg me-2"></i>
                                                        Agregar Concepto

                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                        <!-- Historial de Deducciones Extras -->
                                        <div class="table-responsive">

                                            <table class="table table-bordered align-middle table-striped">

                                                <thead class="table-secondary">

                                                    <tr>

                                                        <th>Nombre</th>

                                                        <th>Cantidad</th>

                                                        <th width="60">Acción</th>

                                                    </tr>

                                                </thead>

                                                <tbody id="tbody-deducciones-extras">

                                                    <tr>

                                                        <td colspan="3" class="text-center text-muted">
                                                            No hay conceptos adicionales agregados
                                                        </td>

                                                    </tr>

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                </div>


                            </div>

                        </div>

                        <!-- PASO 5 - REDONDEO Y TOTAL DE SUELDO A COBRAR -->
                        <div class="card mb-4">

                            <div class="card-header bg-success text-white">

                                <strong>

                                    <i class="bi bi-cash-coin me-2"></i>
                                    Redondeo y Total de Sueldo a Cobrar

                                </strong>

                            </div>

                            <div class="card-body">

                                <div class="row justify-content-center">

                                    <div class="col-md-6 text-center">

                                        <label
                                            for="inputTotalCobrar"
                                            class="form-label fw-bold fs-5">

                                            Total a Cobrar ($)

                                        </label>

                                        <input
                                            type="number"
                                            class="form-control form-control-lg text-center fw-bold bg-light"
                                            id="inputTotalCobrar"
                                            placeholder="0.00"
                                            step="0.01"
                                            readonly>

                                        <div class="form-check d-flex justify-content-center mt-4">

                                            <input
                                                class="form-check-input me-2"
                                                type="checkbox"
                                                id="checkRedondearNomina">

                                            <label
                                                class="form-check-label fw-bold"
                                                for="checkRedondearNomina">

                                                Redondear Total

                                            </label>

                                        </div>



                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                </div>

            </div>

            <!-- PIE -->
            <div class="modal-footer justify-content-between align-items-center">

                <div class="d-flex gap-3 align-items-center">

                    <div class="bg-success text-white p-2 px-3 rounded shadow-sm d-flex align-items-center gap-2 text-nowrap">
                        <span class="fw-semibold text-white-50">Empleado:</span>
                        <strong id="labelNombreEmpleado" class="text-white"></strong>
                    </div>

                    <div class="bg-success text-white p-2 px-3 rounded shadow-sm d-flex align-items-center gap-2 text-nowrap">
                        <span class="fw-semibold text-white-50">Total:</span>
                        <strong id="labelTotalEmpleado" class="text-white">$0.00</strong>
                    </div>

                </div>

                <div class="d-flex gap-2">

                    <button
                        type="button"
                        class="btn btn-outline-secondary"
                        data-bs-dismiss="modal"
                        id="btnCerrarModalDetallesNomina">

                        Cancelar

                    </button>

                    <button
                        type="button"
                        class="btn btn-success"
                        id="btnGuardarConfiguracionNomina">

                        <i class="bi bi-check-circle me-2"></i>
                        Guardar Configuración

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>