<?php
// contratos/views/plantillas.php
include_once '../../config/config.php';
verificarSesion();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Plantillas de Contratos</title>
  <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/contratos.css">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/plantillas-profesional.css">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/editor-quill.css">
  <!-- Quill Editor CSS -->
  <link href="https://cdn.quilljs.com/2.0.0-dev.3/quill.snow.css" rel="stylesheet">
  <!-- quill-better-table CSS -->
  <link href="https://unpkg.com/quill-better-table@1.2.10/dist/quill-better-table.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
  <!-- Estilos para logos -->
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/logos-gafetes.css">
  <!-- jQuery -->
  <script src="<?= JQUERY_JS ?>"></script>
  <!-- SweetAlert2 -->
  <script src="<?= SWEETALERT ?>"></script>
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
            <i class="bi bi-images"></i> Actualizar Marca de Agua
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
                <button id="btnVerDetalles" class="btn btn-outline-info btn-sm" type="button" data-bs-toggle="modal" data-bs-target="#modalDetallesPlaceholders">
                  <i class="bi bi-info-circle"></i> Detalles de Placeholders
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

  <!-- Modal para detalles de placeholders -->
  <div class="modal fade" id="modalDetallesPlaceholders" tabindex="-1" aria-labelledby="modalDetallesPlaceholdersLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="modalDetallesPlaceholdersLabel">
            <i class="bi bi-info-circle me-2"></i>Detalles de Placeholders
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted">
            A continuación se muestran todos los placeholders disponibles, su descripción y ejemplos de cómo aparecerán en el contrato.
          </p>
          
          <div class="accordion" id="placeholdersAccordion">
            <!-- Empleado -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEmpleado">
                  <i class="bi bi-person me-2"></i>Empleado
                </button>
              </h2>
              <div id="collapseEmpleado" class="accordion-collapse collapse show" data-bs-parent="#placeholdersAccordion">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Placeholder</th>
                          <th>Descripción</th>
                          <th>Ejemplo en contrato</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>{{empleado.nombre}}</code></td>
                          <td>Nombre completo del empleado</td>
                          <td>JUAN PEREZ GARCIA</td>
                        </tr>
                        <tr>
                          <td><code>{{puesto_trabajador}}</code></td>
                          <td>Puesto del empleado</td>
                          <td>GERENTE DE VENTAS</td>
                        </tr>
                        <tr>
                          <td><code>{{empleado.curp}}</code></td>
                          <td>CURP del empleado</td>
                          <td>PEGJ800101HDFRRR01</td>
                        </tr>
                        <tr>
                          <td><code>{{rfc_empleado}}</code></td>
                          <td>RFC del empleado</td>
                          <td>PEGJ800101AAA</td>
                        </tr>
                        <tr>
                          <td><code>{{domicilio_trabajador}}</code></td>
                          <td>Domicilio del empleado</td>
                          <td>AV. REFORMA 123, COL. CENTRO, CDMX</td>
                        </tr>
                        <tr>
                          <td><code>{{direccion_puesto}}</code></td>
                          <td>Dirección donde laborará el empleado</td>
                          <td>AV. INSURGENTES 456, COL. ROMA, CDMX</td>
                        </tr>
                        <tr>
                          <td><code>{{descripcion_puesto}}</code></td>
                          <td>Descripción de las funciones del puesto</td>
                          <td>RESPONSABLE DE LA GESTIÓN DE VENTAS Y EQUIPO DE TRABAJO</td>
                        </tr>
                        <tr>
                          <td><code>{{empleado.nss}}</code></td>
                          <td>Número de Seguridad Social</td>
                          <td>12345678901</td>
                        </tr>
                        <tr>
                          <td><code>{{empleado.fecha_ingreso}}</code></td>
                          <td>Fecha de ingreso</td>
                          <td>01/01/2020</td>
                        </tr>
                        <tr>
                          <td><code>{{empleado.fecha_nacimiento}}</code></td>
                          <td>Fecha de nacimiento</td>
                          <td>01/01/1980</td>
                        </tr>
                        <tr>
                          <td><code>{{edad}}</code></td>
                          <td>Edad calculada del empleado</td>
                          <td>43</td>
                        </tr>
                        <tr>
                          <td><code>{{estado_civil}}</code></td>
                          <td>Estado civil del empleado (ajustado por género)</td>
                          <td>CASADO / CASADA</td>
                        </tr>
                        <tr>
                          <td><code>{{empleado.departamento}}</code></td>
                          <td>Departamento del empleado</td>
                          <td>VENTAS</td>
                        </tr>
                        <tr>
                          <td><code>{{empleado.area}}</code></td>
                          <td>Área del empleado</td>
                          <td>COMERCIAL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contrato -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseContrato">
                  <i class="bi bi-file-text me-2"></i>Contrato
                </button>
              </h2>
              <div id="collapseContrato" class="accordion-collapse collapse" data-bs-parent="#placeholdersAccordion">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Placeholder</th>
                          <th>Descripción</th>
                          <th>Ejemplo en contrato</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>{{FECHA_INICIO}}</code></td>
                          <td>Fecha de inicio de labores</td>
                          <td>01/01/2024</td>
                        </tr>
                        <tr>
                          <td><code>{{sueldo}}</code></td>
                          <td>Sueldo mensual con formato monetario</td>
                          <td>$15,000.00</td>
                        </tr>
                        <tr>
                          <td><code>{{salario_diario}}</code></td>
                          <td>Salario diario con formato monetario</td>
                          <td>$500.00</td>
                        </tr>
                        <tr>
                          <td><code>{{periodicidad_pago}}</code></td>
                          <td>Frecuencia de pago</td>
                          <td>QUINCENAL</td>
                        </tr>
                        <tr>
                          <td><code>{{dia_pago}}</code></td>
                          <td>Día específico de pago</td>
                          <td>VIERNES</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empresa -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEmpresa">
                  <i class="bi bi-building me-2"></i>Empresa
                </button>
              </h2>
              <div id="collapseEmpresa" class="accordion-collapse collapse" data-bs-parent="#placeholdersAccordion">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Placeholder</th>
                          <th>Descripción</th>
                          <th>Ejemplo en contrato</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>{{empresa}}</code></td>
                          <td>Nombre de la empresa</td>
                          <td>EMPRESA S.A. DE C.V.</td>
                        </tr>
                        <tr>
                          <td><code>{{rfc_empresa}}</code></td>
                          <td>RFC de la empresa</td>
                          <td>ESA900101AAA</td>
                        </tr>
                        <tr>
                          <td><code>{{tipo_recibo}}</code></td>
                          <td>Tipo de recibo de nómina</td>
                          <td>NÓMINA</td>
                        </tr>
                        <tr>
                          <td><code>{{fecha_recibo}}</code></td>
                          <td>Fecha de emisión del recibo</td>
                          <td><u>15</u> DE <u>ENERO</u> DEL <u>2024</u></td>
                        </tr>
                        <tr>
                          <td><code>{{domicilio_fiscal}}</code></td>
                          <td>Domicilio fiscal de la empresa</td>
                          <td>AV. REFORMA 789, COL. JUAREZ, CDMX</td>
                        </tr>
                        <tr>
                          <td><code>{{articulo}}</code></td>
                          <td>Artículo definido según género</td>
                          <td>EL / LA</td>
                        </tr>
                        <tr>
                          <td><code>{{nacionalidad}}</code></td>
                          <td>Nacionalidad según género</td>
                          <td>MEXICANO / MEXICANA</td>
                        </tr>
                        <tr>
                          <td><code>{{SALARIO_SEMANAL}}</code></td>
                          <td>Salario semanal con formato monetario</td>
                          <td>$3,500.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Horarios y descanso -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseHorarios">
                  <i class="bi bi-clock me-2"></i>Horarios y Descanso
                </button>
              </h2>
              <div id="collapseHorarios" class="accordion-collapse collapse" data-bs-parent="#placeholdersAccordion">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Placeholder</th>
                          <th>Descripción</th>
                          <th>Ejemplo en contrato</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>{{INICIO_LABORES}}</code></td>
                          <td>Fecha de inicio de labores</td>
                          <td>01/01/2024</td>
                        </tr>
                        <tr>
                          <td><code>{{HORARIO_LABORAL}}</code></td>
                          <td>Horario de trabajo principal</td>
                          <td>DE LAS 09:00 A LAS 18:00 HORAS</td>
                        </tr>
                        <tr>
                          <td><code>{{HORARIO_COMIDA}}</code></td>
                          <td>Horario de descanso para comida</td>
                          <td>DE LAS 13:00 A LAS 14:00</td>
                        </tr>
                        <tr>
                          <td><code>{{HORARIO_SABADO}}</code></td>
                          <td>Horario específico para sábados</td>
                          <td>09:00 A 14:00</td>
                        </tr>
                        <tr>
                          <td><code>{{HORARIO_PRESTACIONES}}</code></td>
                          <td>Horario para prestaciones</td>
                          <td>09:00 A 18:00</td>
                        </tr>
                        <tr>
                          <td><code>{{DIAS_DESCANSO}}</code></td>
                          <td>Días de descanso del empleado</td>
                          <td>domingo y lunes</td>
                        </tr>
                        <tr>
                          <td><code>{{HORAS_DESCANSO}}</code></td>
                          <td>Horas de descanso en texto</td>
                          <td>una hora</td>
                        </tr>
                        <tr>
                          <td><code>{{DURACION_JORNADA}}</code></td>
                          <td>Duración total de la jornada laboral</td>
                          <td>8</td>
                        </tr>
                        <tr>
                          <td><code>{{FECHA_CONTRATO}}</code></td>
                          <td>Fecha del contrato en formato largo</td>
                          <td><u>15</u> DÍAS DEL MES DE <u>ENERO</u> DEL AÑO 2024</td>
                        </tr>
                        <tr>
                          <td><code>{{PERIODO_PRUEBA}}</code></td>
                          <td>Período de prueba del empleado</td>
                          <td><u>01</u> de enero del 2024 al <u>30</u> de abril del 2024</td>
                        </tr>
                        <tr>
                          <td><code>{{HORARIO_TURNO}}</code></td>
                          <td>Horario de turnos (si aplica)</td>
                          <td>DE LAS 08:00 A LAS 16:00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Beneficiarios -->
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBeneficiarios">
                  <i class="bi bi-people me-2"></i>Beneficiarios
                </button>
              </h2>
              <div id="collapseBeneficiarios" class="accordion-collapse collapse" data-bs-parent="#placeholdersAccordion">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="table table-striped table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Placeholder</th>
                          <th>Descripción</th>
                          <th>Ejemplo en contrato</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code>{{beneficiarios}}</code></td>
                          <td>Lista completa de beneficiarios del empleado</td>
                          <td><strong>ESPOSA:</strong> MARIA GONZALEZ PEREZ 50%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
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
  <script src="<?= BOOTSTRAP_JS ?>"></script>
  <script src="<?= $rutaRaiz ?>/public/js/navbar.js"></script>
  <script src="<?= $rutaRaiz ?>/contratos/js/plantillas.js"></script>
</body>
</html>