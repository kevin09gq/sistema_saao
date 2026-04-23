<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tickets Manuales</title>
    <?php
    include "../../config/config.php";
    verificarSesion();
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../../public/styles/main.css">
    <link rel="stylesheet" href="../css/estilos.css">
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <?php include "../../public/views/navbar.php"; ?>

    <div class="tm-container">
        <div class="tm-header">
            <div class="tm-header-content">
                <div class="tm-title-section">
                    <h1 class="tm-title"><i class="bi bi-receipt-cutoff"></i> Tickets Manuales</h1>
                    <p class="tm-subtitle">Generador de tickets de nómina por tipo</p>
                </div>
            </div>
        </div>

        <div class="tm-content">
            <div class="tm-card tm-card-selector">
                <div class="tm-card-header">
                    <h3><i class="bi bi-list-ul"></i> Seleccionar Nómina</h3>
                </div>
                <div class="tm-card-body">
                    <select id="selectorNomina" class="tm-select">
                        <option value="">-- Seleccione el tipo de nómina --</option>
                        <option value="nomina_40lbs">📦 Nómina 40 Libras</option>
                        <option value="nomina_huasteca">🏔️ Nómina Huasteca</option>
                        <option value="nomina_palmilla">🌴 Nómina Palmilla</option>
                        <option value="nomina_pilar">🏛️ Nómina Pilar</option>
                        <option value="nomina_relicario">⛪ Nómina Relicario</option>
                        <option value="nomina_confianza">⭐ Nómina Confianza</option>
                    </select>
                </div>
            </div>

            <div id="seccionFormulario" class="tm-form-section" hidden>
                <div class="tm-card tm-card-empleado mb-4">
                    <div class="tm-card-header">
                        <h3><i class="bi bi-person-badge"></i> Datos del Empleado</h3>
                    </div>
                    <div class="tm-card-body">
                        <div class="tm-form-grid tm-form-grid-3">
                            <div class="tm-form-group">
                                <label>Clave</label>
                                <input type="text" id="inputClave" class="tm-input" placeholder="001">
                            </div>
                            <div class="tm-form-group">
                                <label>Semana</label>
                                <input type="text" id="inputSemana" class="tm-input" placeholder="51">
                            </div>
                            <div class="tm-form-group">
                                <label>Fecha Ingreso</label>
                                <input type="date" id="inputFechaIngreso" class="tm-input">
                            </div>
                            <div class="tm-form-group tm-span-2">
                                <label>Nombre Completo</label>
                                <input type="text" id="inputNombre" class="tm-input" placeholder="Nombre del empleado">
                            </div>
                            <div class="tm-form-group">
                                <label>Departamento</label>
                                <input type="text" id="inputDepartamento" class="tm-input" placeholder="Departamento">
                            </div>
                            <div class="tm-form-group">
                                <label>Puesto</label>
                                <input type="text" id="inputPuesto" class="tm-input" placeholder="Puesto">
                            </div>
                            <div class="tm-form-group">
                                <label>Salario Diario</label>
                                <input type="number" step="0.01" id="inputSalarioDiario" class="tm-input" placeholder="0.00">
                            </div>
                            <div class="tm-form-group">
                                <label>Salario Semanal</label>
                                <input type="number" step="0.01" id="inputSalarioSemanal" class="tm-input" placeholder="0.00">
                            </div>
                            <div class="tm-form-group" id="groupDiasLaborados" hidden>
                                <label>Días Laborados</label>
                                <input type="number" step="1" id="inputDiasLaborados" class="tm-input" placeholder="0">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tm-grid tm-grid-2-cols">
                    <div class="tm-card tm-card-percepciones">
                        <div class="tm-card-header tm-header-success">
                            <h3><i class="bi bi-plus-circle-fill"></i> Percepciones</h3>
                        </div>
                        <div class="tm-card-body">
                            <div id="contenedorPercepciones" class="tm-fields-grid mb-3"></div>
                            
                            <div class="tm-additional-section">
                                <h4 class="tm-section-subtitle"><i class="bi bi-plus-circle"></i> Conceptos Adicionales</h4>
                                <div id="adicionalesPercepciones" class="tm-dynamic-fields"></div>
                                <button type="button" class="tm-btn-add tm-btn-add-success" id="btnAgregarPercepcion">
                                    <i class="bi bi-plus-lg"></i> Agregar Percepción
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="tm-card tm-card-deducciones">
                        <div class="tm-card-header tm-header-danger">
                            <h3><i class="bi bi-dash-circle-fill"></i> Deducciones</h3>
                        </div>
                        <div class="tm-card-body">
                            <div id="contenedorDeducciones" class="tm-fields-grid mb-3"></div>

                            <div class="tm-additional-section">
                                <h4 class="tm-section-subtitle"><i class="bi bi-dash-circle"></i> Conceptos Adicionales</h4>
                                <div id="adicionalesDeducciones" class="tm-dynamic-fields"></div>
                                <button type="button" class="tm-btn-add tm-btn-add-danger" id="btnAgregarDeduccion">
                                    <i class="bi bi-plus-lg"></i> Agregar Deducción
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tm-totals-card mt-4">
                    <div class="tm-totals-grid">
                        <div class="tm-total-item">
                            <span class="tm-total-label">Total Percepciones</span>
                            <span class="tm-total-value text-success" id="totalPercepciones">$ 0.00</span>
                        </div>
                        <div class="tm-total-item">
                            <span class="tm-total-label">Total Deducciones</span>
                            <span class="tm-total-value text-danger" id="totalDeducciones">$ 0.00</span>
                        </div>
                        <div class="tm-total-item tm-total-main">
                            <span class="tm-total-label">Neto a Recibir</span>
                            <span class="tm-total-value" id="netoRecibir">$ 0.00</span>
                        </div>
                    </div>
                </div>

                <div class="tm-actions">
                    <button type="button" class="tm-btn tm-btn-secondary" id="btnLimpiar">
                        <i class="bi bi-eraser-fill"></i> Limpiar
                    </button>
                    <button type="button" class="tm-btn tm-btn-success" id="btnDescargarTicket">
                        <i class="bi bi-download"></i> Descargar Ticket
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="../js/app.js"></script>
</body>

</html>
