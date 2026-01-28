<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Incidencias Semanales</title>
    <link rel="stylesheet" href="../../public/styles/navbar_styles.css">
    <link rel="stylesheet" href="../css/historial.css">
    <?php
    include "../../config/config.php";
    ?>

    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

</head>

<body>
    <?php
    $rutaRaiz = str_replace('\\', '/', dirname(dirname(dirname(__FILE__))));
    $rutaRaiz = '/sistema_saao';
    include "../../public/views/navbar.php";
    ?>

    <div class="container-historial">
        <div class="header-historial">
            <h1>📊 Historial de Incidencias Semanales</h1>
            <p class="subtitle">Resumen general de asistencias, faltas, vacaciones y retardos por semana</p>
        </div>

        <div style="display:flex; gap:8px; margin-bottom:1rem;">
            <button id="btn_modo_semana" style="padding:8px 12px; border:1px solid #ccc; background:#f9fafb; border-radius:8px; font-weight:600;">Por semana</button>
            <button id="btn_modo_persona" style="padding:8px 12px; border:1px solid #ccc; background:#fff; border-radius:8px; font-weight:600;">Por persona</button>
        </div>

        <div id="filtros_semana_bar" style="display:flex; gap:1rem; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap;">
            <label for="filtro_empresa" style="font-weight:500;">Empresa:</label>
            <select id="filtro_empresa" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:160px;">
                <option value="">Todas</option>
            </select>
            <label for="filtro_anio" style="font-weight:500;">Año:</label>
            <select id="filtro_anio" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:100px;" disabled>
                <option value="">Selecciona año</option>
            </select>
            <label for="filtro_semana" style="font-weight:500;">Semana:</label>
            <select id="filtro_semana" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:100px;" disabled>
                <option value="">Selecciona semana</option>
            </select>
            <label for="filtro_departamento" style="font-weight:500;">Departamento:</label>
            <select id="filtro_departamento" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:160px;">
                <option value="">Todos</option>
            </select>
        </div>
        <div class="table-container" id="contenedor_semana">
            <table class="tabla-historial" id="tabla_historial">
                <thead>
                    <tr>
                        <th>Semana</th>
                        <th class="col-azul">Vacaciones</th>
                        <th class="col-morado">Ausencias</th>
                        <th class="col-gris">Incapacidades</th>
                        <th class="col-negro">Días Pagados</th>
                    </tr>
                </thead>
                <tbody id="tbody_historial">
                    <tr>
                        <td colspan="5" class="loading">
                            <div class="spinner"></div>
                            Cargando historial...
                        </td>
                    </tr>
                </tbody>
            </table>
            <div id="semana_paginacion" style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:1rem;"></div>
        </div>



        <div id="contenedor_persona" style="display:none;">
            <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap; margin-bottom:0.5rem;">
                <label for="persona_empresa" style="font-weight:500;">Empresa:</label>
                <select id="persona_empresa" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:160px;">
                    <option value="">Todas</option>
                </select>
                <label for="persona_anio" style="font-weight:500;">Año:</label>
                <select id="persona_anio" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:100px;" disabled>
                    <option value="">Selecciona año</option>
                </select>
                <label for="persona_semana" style="font-weight:500;">Semana:</label>
                <select id="persona_semana" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:100px;" disabled>
                    <option value="">Selecciona semana</option>
                </select>
                <label for="persona_departamento" style="font-weight:500;">Departamento:</label>
                <select id="persona_departamento" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:160px;">
                    <option value="">Todos</option>
                </select>
            </div>
            <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1rem;">
                <label for="persona_mostrar" style="font-weight:500;">Mostrar:</label>
                <select id="persona_mostrar" style="padding:0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; min-width:200px;">
                    <option value="todos">Todos</option>
                    <option value="vacaciones-desc">Vacaciones (descendente)</option>
                    <option value="vacaciones-asc">Vacaciones (ascendente)</option>
                    <option value="ausencias-desc">Ausencias (descendente)</option>
                    <option value="ausencias-asc">Ausencias (ascendente)</option>
                    <option value="incapacidades-desc">Incapacidades (descendente)</option>
                    <option value="incapacidades-asc">Incapacidades (ascendente)</option>
                    <option value="dias_trabajados-desc">Días Pagados (descendente)</option>
                    <option value="dias_trabajados-asc">Días Pagados (ascendente)</option>
                </select>
                <div style="position:relative; min-width:250px; max-width:350px; flex:1;">
                    <input type="text" id="persona_buscar" placeholder="Buscar empleado..." style="width:100%; padding:0.4rem 2.2rem 0.4rem 0.7rem; border-radius:4px; border:1px solid #ccc; box-sizing:border-box;">
                    <button id="btn_limpiar_persona_buscar" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0;">&#10006;</button>
                </div>
            </div>
            <div class="table-container">
                <table class="tabla-historial" style="width:100%; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(60,60,60,0.08);">
                    <thead>
                        <tr>
                            <th style="min-width:180px;">Empleado</th>
                            <th class="col-azul">Vacaciones</th>
                            <th class="col-morado">Ausencias</th>
                            <th class="col-gris">Incapacidades</th>
                            <th class="col-negro">Días pagados</th>
                        </tr>
                    </thead>
                    <tbody id="persona_tbody">
                        <tr>
                            <td colspan="5">Selecciona año y semana</td>
                        </tr>
                    </tbody>
                </table>
                <div id="persona_paginacion" style="display:flex; justify-content:center; align-items:center; gap:8px; margin-top:1rem;"></div>
            </div>
        </div>

        <!-- Modal para detalle de semana -->
        <div id="modal_detalle_semana" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; overflow:auto; padding-top:20px;">
            <div style="background:white; margin:80px auto; max-width:900px; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                <div style="padding:20px; border-bottom:2px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; background:#f9fafb;">
                    <h2 id="modal_titulo_semana" style="margin:0; font-size:1.5rem; color:#1f2937;">Detalle de Semana</h2>
                    <button onclick="cerrarModalDetalle()" style="background:none; border:none; font-size:28px; cursor:pointer; color:#666; transition:color 0.2s;">&times;</button>
                </div>
                <div style="padding:20px;">
                    <div style="margin-bottom:1rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        <label for="modal_orden_dir_simple" style="font-weight:500;">Orden:</label>
                        <select id="modal_orden_dir_simple" style="padding:0.5rem; border-radius:4px; border:1px solid #ccc; min-width:160px;">
                            <option value="desc">Descendente</option>
                            <option value="asc">Ascendente</option>
                        </select>
                        <div style="position:relative; min-width:250px; max-width:350px; flex:1;">
                            <input type="text" id="modal_buscar_empleado" placeholder="Buscar por nombre o clave..." style="width:100%; padding:0.5rem 2.2rem 0.5rem 0.5rem; border-radius:4px; border:1px solid #ccc; box-sizing:border-box;">
                            <button id="btn_limpiar_modal_buscar" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; padding:0;">&#10006;</button>
                        </div>
                    </div>
                    <div style="max-height:500px; overflow-y:auto;">
                        <table class="tabla-historial" style="width:100%; border-radius:10px; overflow:hidden; box-shadow:0 2px 8px rgba(60,60,60,0.08);">
                            <thead>
                                <tr>
                                    <th style="min-width:180px;">Empleado</th>
                                    <th class="col-azul">Vacaciones</th>
                                    <th class="col-morado">Ausencias</th>
                                    <th class="col-gris">Incapacidades</th>
                                    <th class="col-negro">Días pagados</th>
                                </tr>
                            </thead>
                            <tbody id="modal_tbody_detalle">
                                <tr>
                                    <td colspan="5">Cargando...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <script src="<?= SWEETALERT ?>"></script>

    <script src="../js/historial.js"></script>
</body>

</html>