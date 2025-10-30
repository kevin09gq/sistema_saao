<?php
// contratos/views/plantillas.php
include_once '../../config/config.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Plantillas de Contratos</title>
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/public/libs/bootstrap/css/bootstrap.min.css">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/contratos.css">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/plantillas-profesional.css">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/editor-quill.css">
  <!-- Quill Editor CSS -->
  <link href="https://cdn.quilljs.com/2.0.0-dev.3/quill.snow.css" rel="stylesheet">
  <!-- quill-better-table CSS -->
  <link href="https://unpkg.com/quill-better-table@1.2.10/dist/quill-better-table.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  <!-- Estilos para logos -->
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/logos-gafetes.css">
  <!-- jQuery -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
  <?php include '../../public/views/navbar.php'; ?>
  <?php include 'modal_logos.php'; ?>
  <div class="container py-4">
    <div class="mb-4">
      <h1 class="h3 mb-1">Plantillas de Contratos</h1>
      <div class="text-muted">Crea y edita contratos con campos dinámicos y vista de edición profesional.</div>
    </div>

    <div class="row mb-3">
      <div class="col-12">
        <a href="<?= $rutaRaiz ?>/contratos/contratos.php" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left-circle me-1"></i>
          Regresar a Contratos
        </a>
      </div>
    </div>

    <!-- Barra compacta de plantillas -->
    <div class="row g-3 mb-3">
      <div class="col-12">
        <div class="plantillas-compact-bar">
          <button id="btnTogglePlantillas" class="btn-toggle-plantillas">
            <span class="icon">📋</span>
            <span class="text">Plantillas</span>
            <span id="iconFlecha" class="arrow">▼</span>
          </button>
          
          <div class="separator"></div>
          
          <input type="text" id="nuevoNombre" class="input-nueva" placeholder="Nueva plantilla">
          <button id="btnNueva" class="btn-nueva">+ Nueva</button>
          
          <div class="separator"></div>
          
          <button id="actualizarLogos" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalActualizarLogos">
            <i class="bi bi-images"></i> Actualizar Logos
          </button>
        </div>
        
        <!-- Panel colapsable de plantillas -->
        <div id="panelPlantillas" class="plantillas-panel" style="display: none;">
          <ul id="listaPlantillas" class="plantillas-list"></ul>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <!-- Placeholder selection with clean, professional design -->
      <div class="col-12 col-lg-4">
        <div class="card shadow-sm" style="position: sticky; top: 1rem;">
          <div class="card-header d-flex align-items-center gap-2">
            <span class="fw-semibold">Placeholders</span>
            <span class="text-muted small">Campos disponibles</span>
          </div>
          <div class="card-body">
            <!-- All Placeholders as Buttons - Clean and Minimal -->
            <div class="mb-3 placeholders-scroll">
              <div class="row g-2">
                <div class="col-12">
                  <div class="text-uppercase text-muted small fw-semibold">Empleado</div>
                  <hr class="my-2" />
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empleado.nombre" type="button">
                    Nombre
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="puesto_trabajador" type="button">
                    Puesto
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empleado.curp" type="button">
                    CURP
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="rfc_empleado" type="button">
                    RFC del Empleado
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="domicilio_trabajador" type="button">
                    Domicilio del Trabajador
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="direccion_puesto" type="button">
                    Dirección del Puesto
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="descripcion_puesto" type="button">
                    Descripción del Puesto
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empleado.nss" type="button">
                    NSS
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empleado.fecha_ingreso" type="button">
                    Fecha Ingreso
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empleado.fecha_nacimiento" type="button">
                    Fecha Nacimiento
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="edad" type="button">
                    Edad
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="estado_civil" type="button">
                    Estado Civil
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empleado.departamento" type="button">
                    Departamento
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empleado.area" type="button">
                    Área
                  </button>
                </div>
                <div class="col-12 mt-1">
                  <div class="text-uppercase text-muted small fw-semibold">Contrato</div>
                  <hr class="my-2" />
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="FECHA_INICIO" type="button">
                    Fecha Inicio
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="sueldo" type="button">
                    Sueldo
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="salario_diario" type="button">
                    Salario diario
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="periodicidad_pago" type="button">
                    Periodicidad de pago
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="dia_pago" type="button">
                    Día de pago
                  </button>
                </div>
                <div class="col-12 mt-1">
                  <div class="text-uppercase text-muted small fw-semibold">Empresa</div>
                  <hr class="my-2" />
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empresa" type="button">
                    Empresa
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="rfc_empresa" type="button">
                    RFC Empresa
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="tipo_recibo" type="button">
                    Tipo de Recibo
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="fecha_recibo" type="button">
                    Fecha de Recibo
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="empresa" type="button">
                    RFC Empresa
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="SALARIO_SEMANAL" type="button">
                    Salario Semanal
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="domicilio_fiscal" type="button">
                    Domicilio Fiscal
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="articulo" type="button">
                    Artículo(EL, La)
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="nacionalidad" type="button">
                    Nacionalidad(o/a)
                  </button>
                </div>
                <div class="col-12 mt-1">
                  <div class="text-uppercase text-muted small fw-semibold">Horarios y descanso</div>
                  <hr class="my-2" />
                </div>
                <!-- Nuevos placeholders solicitados -->
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="INICIO_LABORES" type="button">
                    Inicio Labores
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="HORARIO_LABORAL" type="button">
                    Horario Laboral
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="HORARIO_COMIDA" type="button">
                    Horario Comida
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="HORARIO_SABADO" type="button">
                    Horario Sábado
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="HORARIO_PRESTACIONES" type="button">
                    Horario de Prestaciones
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="DIAS_DESCANSO" type="button">
                    Días Descanso
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="HORAS_DESCANSO" type="button">
                    Horas de Descanso (texto)
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="DURACION_JORNADA" type="button">
                    Duración de la Jornada
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="FECHA_CONTRATO" type="button">
                    Fecha Contrato (largo)
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="PERIODO_PRUEBA" type="button">
                    Periodo de Prueba
                  </button>
                </div>
                <!-- Nuevo placeholder para horarios de turno -->
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="HORARIO_TURNO" type="button">
                    Horario de Turno
                  </button>
                </div>
                <!-- Beneficiario -->
                <div class="col-12 mt-1">
                  <div class="text-uppercase text-muted small fw-semibold">Beneficiarios</div>
                  <hr class="my-2" />
                </div>
                
                <div class="col-6">
                  <button class="btn btn-outline-secondary btn-sm w-100 quick-insert" data-value="beneficiarios" type="button">
                    Lista de Beneficiarios
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Botón para insertar tabla -->
            <div class="mb-3">
              <div class="text-uppercase text-muted small fw-semibold mb-1">Herramientas</div>
              <div class="d-grid gap-2">
                <button id="btnInsertarTabla" class="btn btn-outline-primary btn-sm" type="button">
                  <i class="bi bi-table"></i> Insertar Tabla
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Editor section -->
      <div class="col-12 col-lg-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span id="tituloEdicion">Sin plantilla seleccionada</span>
            <div class="d-flex gap-2">
              <button id="btnGuardar" class="btn btn-success btn-sm" disabled>Guardar</button>
              <button id="btnEliminar" class="btn btn-outline-danger btn-sm" disabled>Eliminar</button>
              <button id="btnRenombrar" class="btn btn-outline-warning btn-sm" disabled>Renombrar</button>
            </div>
          </div>
          <div class="card-body">
            <p class="text-muted mb-2">Escribe tu contrato y utiliza campos con llaves dobles. Ejemplos: {{empleado.nombre}}, {{FECHA_INICIO}}, {{SALARIO_SEMANAL}}.</p>
            
            <!-- Contenedor para el editor Quill -->
            <div id="editorContainer">
              <div id="editorPlantilla" style="height: 520px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Quill Editor JS -->
  <script src="https://cdn.quilljs.com/2.0.0-dev.3/quill.min.js"></script>
  <!-- Script para manejo de logos -->
  <script src="<?= $rutaRaiz ?>/contratos/js/actualizarLogos.js"></script>
  <!-- quill-better-table JS -->
  <script src="https://unpkg.com/quill-better-table@1.2.10/dist/quill-better-table.js"></script>
  <script src="<?= $rutaRaiz ?>/public/libs/jquery/jquery.min.js"></script>
  <script src="<?= $rutaRaiz ?>/public/libs/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="<?= $rutaRaiz ?>/public/js/navbar.js"></script>
  <script src="<?= $rutaRaiz ?>/contratos/js/plantillas.js"></script>
</body>
</html>