<?php
// contratos/views/generar.php
require_once __DIR__ . "/../../public/php/config.php";
require_once __DIR__ . "/../../public/php/verificarSesion.php";
verificarSesion();
verificarPermiso("contratos.ver_menu");
verificarPermiso("contratos.personalizar_contratos");
?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generar Contrato - SAAO</title>
  <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

  <!-- Bootstrap 5 -->
  <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
  <!-- Estilos de contratos y diseño moderno -->
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/contratos.css">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/generar-moderno.css">
  <!-- SweetAlert2 -->
  <script src="<?= SWEETALERT ?>"></script>
</head>

<body class="bg-light">
  <?php require_once __DIR__ . "/../../navbar/navbar.php"; ?>

  <div class="container-xl py-4">

    <!-- ==========================================
         ENCABEZADO / ACCIÓN SUPERIOR
         ========================================== -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div>
        <h1 class="h4 mb-1 fw-bold text-dark d-flex align-items-center gap-2">
          <i class="bi bi-file-earmark-text text-success"></i> Generar Contrato Laboral
        </h1>
        <div class="text-muted small">Complete y valide los datos del empleado y de la empresa para generar el documento oficial</div>
      </div>
      <div>
        <a href="lista_empleados.php" class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
          <i class="bi bi-arrow-left-circle"></i>
          Regresar a Lista de Empleados
        </a>
      </div>
    </div>

    <!-- ==========================================
         FORMULARIO PRINCIPAL ORGANIZADO POR CARDS
         ========================================== -->
    <form id="formDatosContrato">

      <!-- ==========================================
           CARD 1: DATOS DE LA EMPRESA Y PUESTO
           ========================================== -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-building text-success"></i> Información de la Empresa y Puesto de Trabajo
            </h6>
            <span class="badge bg-light text-muted border small">Sección 1</span>
          </div>
        </div>
        <div class="card-body p-4">

          <!-- Subsección: Empresa -->
          <div class="section-label mb-3">
            <i class="bi bi-buildings me-2"></i> Datos de la Empresa
          </div>

          <div class="row g-3 mb-4">
            <div class="col-12 col-md-5">
              <label for="nombreEmpresa" class="form-label">Nombre de la Empresa</label>
              <input type="text" id="nombreEmpresa" name="empresa" class="form-control form-control-sm" placeholder="Ej: Corporativo XYZ S.A." />
            </div>
            <div class="col-12 col-md-3">
              <label for="rfcEmpresa" class="form-label">RFC de la Empresa</label>
              <input type="text" id="rfcEmpresa" name="rfc_empresa" class="form-control form-control-sm" placeholder="12 o 13 caracteres" />
            </div>
            <div class="col-12 col-md-4">
              <label for="domicilioFiscal" class="form-label">Domicilio Fiscal</label>
              <input type="text" id="domicilioFiscal" name="domicilio_fiscal" class="form-control form-control-sm" placeholder="Calle, número, colonia, ciudad, estado, CP" />
            </div>
          </div>

          <!-- Subsección: Puesto -->
          <div class="section-label mb-3">
            <i class="bi bi-briefcase me-2"></i> Información del Puesto
          </div>

          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label for="puestoTrabajador" class="form-label">Puesto</label>
              <input type="text" id="puestoTrabajador" name="puesto_trabajador" class="form-control form-control-sm" placeholder="Ej: Operador de Maquinaria" />
            </div>
            <div class="col-12 col-md-5">
              <label for="direccionPuesto" class="form-label">Ubicación del Puesto</label>
              <input type="text" id="direccionPuesto" name="direccion_puesto_trabajador" class="form-control form-control-sm" placeholder="Dirección donde laborará" />
            </div>
            <div class="col-12 col-md-3">
              <label for="fechaIngreso" class="form-label">Fecha de Ingreso</label>
              <input type="date" id="fechaIngreso" name="fecha_ingreso" class="form-control form-control-sm" readonly />
              <div class="form-text">Calculado automáticamente</div>
            </div>
            <div class="col-12">
              <label for="descripcionPuesto" class="form-label">Descripción del Puesto</label>
              <input type="text" id="descripcionPuesto" name="descripcion_puesto" class="form-control form-control-sm" placeholder="Breve descripción de funciones y actividades asignadas" />
            </div>
          </div>

        </div>
      </div>

      <!-- ==========================================
           CARD 2: DATOS PERSONALES DEL TRABAJADOR
           ========================================== -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-person text-success"></i> Datos Personales del Trabajador
            </h6>
            <span class="badge bg-light text-muted border small">Sección 2</span>
          </div>
        </div>
        <div class="card-body p-4">

          <div class="row g-3">
            <div class="col-12 col-md-5">
              <label for="nombreTrabajador" class="form-label">Nombre Completo</label>
              <input type="text" id="nombreTrabajador" name="nombre_trabajador" class="form-control form-control-sm" placeholder="Nombre(s) Apellido Paterno Apellido Materno" />
            </div>
            <div class="col-12 col-md-4">
              <label for="curp" class="form-label">CURP</label>
              <input type="text" id="curp" name="curp" class="form-control form-control-sm" placeholder="18 caracteres" maxlength="18" />
            </div>
            <div class="col-12 col-md-3">
              <label for="rfcEmpleado" class="form-label">RFC del Empleado</label>
              <input type="text" id="rfcEmpleado" name="rfc_empleado" class="form-control form-control-sm" placeholder="13 caracteres" maxlength="13" />
            </div>

            <div class="col-12 col-md-3">
              <label for="fechaNacimiento" class="form-label">Fecha de Nacimiento</label>
              <input type="date" id="fechaNacimiento" name="fecha_nacimiento" class="form-control form-control-sm" />
            </div>
            <div class="col-12 col-md-2">
              <label for="edad" class="form-label">Edad</label>
              <input type="number" id="edad" name="edad" class="form-control form-control-sm" placeholder="0" />
            </div>
            <div class="col-12 col-md-3">
              <label for="estadoCivil" class="form-label">Estado Civil</label>
              <select id="estadoCivil" name="estado_civil" class="form-select form-select-sm">
                <option value="">Seleccione una opción</option>
                <option value="Soltero(a)">Soltero(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Viudo(a)">Viudo(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Unión Libre">Unión Libre</option>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label for="domicilioTrabajador" class="form-label">Domicilio del Trabajador</label>
              <input type="text" id="domicilioTrabajador" name="domicilio_trabajador" class="form-control form-control-sm" placeholder="Calle, número, colonia, ciudad, estado, CP" />
            </div>
          </div>

        </div>
      </div>

      <!-- ==========================================
           CARD 3: TIPO DE CONTRATO Y CONDICIONES ECONÓMICAS
           ========================================== -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-calendar-check text-success"></i> Tipo de Contrato y Condiciones Salariales
            </h6>
            <span class="badge bg-light text-muted border small">Sección 3</span>
          </div>
        </div>
        <div class="card-body p-4">

          <!-- Subsección: Modalidad y Fechas -->
          <div class="section-label mb-3">
            <i class="bi bi-calendar3 me-2"></i> Fechas y Modalidad de Contrato
          </div>

          <div class="row g-3 mb-4">
            <div class="col-12 col-md-4">
              <label for="tipoContrato" class="form-label">Tipo de Contrato</label>
              <select id="tipoContrato" name="tipo_contrato" class="form-select form-select-sm">
                <option value="">Seleccione</option>
                <option value="Determinado">Tiempo Determinado</option>
                <option value="Indeterminado">Tiempo Indeterminado</option>
              </select>
            </div>
            <div class="col-12 col-md-4">
              <label for="fechaContrato" class="form-label">Fecha del Contrato</label>
              <input type="date" id="fechaContrato" name="fecha_contrato" class="form-control form-control-sm" />
            </div>
            <div class="col-12 col-md-4">
              <label for="inicioLabores" class="form-label">Inicio de Labores</label>
              <input type="date" id="inicioLabores" name="inicio_labores" class="form-control form-control-sm" />
            </div>
            <div class="col-12 col-md-6">
              <label for="periodoPruebaInicio" class="form-label">Inicio Periodo de Prueba</label>
              <input type="date" id="periodoPruebaInicio" name="periodo_prueba_inicio" class="form-control form-control-sm" />
            </div>
            <div class="col-12 col-md-6">
              <label for="periodoPruebaFin" class="form-label">Fin Periodo de Prueba</label>
              <input type="date" id="periodoPruebaFin" name="periodo_prueba_fin" class="form-control form-control-sm" />
            </div>
          </div>

          <!-- Subsección: Salarios y Condiciones de Pago -->
          <div class="section-label mb-3">
            <i class="bi bi-cash-stack me-2"></i> Salarios y Condiciones de Pago
          </div>

          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label for="salarioSemanal" class="form-label">Salario Semanal</label>
              <input type="number" id="salarioSemanal" name="salario_semanal" class="form-control form-control-sm" step="0.01" placeholder="0.00" />
            </div>
            <div class="col-12 col-md-4">
              <label for="salarioDiario" class="form-label">Salario Diario</label>
              <input type="text" id="salarioDiario" name="salario_diario" class="form-control form-control-sm" placeholder="$0.00" />
            </div>
            <div class="col-12 col-md-4">
              <label for="sueldo" class="form-label">Sueldo</label>
              <input type="text" id="sueldo" name="sueldo" class="form-control form-control-sm" placeholder="$0.00" />
            </div>

            <div class="col-12 col-md-3">
              <label for="periodicidadPago" class="form-label">Periodicidad de Pago</label>
              <select id="periodicidadPago" name="periodicidad_pago" class="form-select form-select-sm">
                <option value="">Seleccione</option>
                <option value="semanales">Semanal</option>
                <option value="quincenales">Quincenal</option>
                <option value="mensuales">Mensual</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <label for="diaPago" class="form-label">Día de Pago</label>
              <select id="diaPago" name="dia_pago" class="form-select form-select-sm">
                <option value="">Seleccione</option>
                <option value="lunes">Lunes</option>
                <option value="martes">Martes</option>
                <option value="miércoles">Miércoles</option>
                <option value="jueves">Jueves</option>
                <option value="viernes">Viernes</option>
                <option value="sábado">Sábado</option>
                <option value="domingo">Domingo</option>
              </select>
            </div>
            <div class="col-12 col-md-3">
              <label for="tipoRecibo" class="form-label">Tipo de Recibo</label>
              <input type="text" id="tipoRecibo" name="tipo_recibo" class="form-control form-control-sm" placeholder="Ej: Nómina" />
            </div>
            <div class="col-12 col-md-3">
              <label for="fechaRecibo" class="form-label">Fecha de Recibo</label>
              <input type="date" id="fechaRecibo" name="fecha_recibo" class="form-control form-control-sm" />
            </div>
          </div>

        </div>
      </div>

      <!-- ==========================================
           CARD 4: HORARIOS, JORNADA LABORAL Y TURNOS
           ========================================== -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <div class="d-flex align-items-center justify-content-between">
            <h6 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-clock-history text-success"></i> Jornada Laboral, Horarios y Descansos
            </h6>
            <span class="badge bg-light text-muted border small">Sección 4</span>
          </div>
        </div>
        <div class="card-body p-4">

          <!-- Horario Laboral Dinámico -->
          <div class="horario-slot mb-3">
            <div class="horario-header-bar">
              <label class="form-label mb-0 fw-bold text-dark">
                <i class="bi bi-clock me-1 text-success"></i> Horario Laboral Habitual
              </label>
              <button type="button" id="agregarHorarioLaboral" class="btn btn-outline-success btn-sm">
                <i class="bi bi-plus-circle me-1"></i> Agregar Horario
              </button>
            </div>
            <div id="laboralHorariosContainer" class="row g-2">
              <div class="col-6 col-md-3">
                <input type="time" class="form-control form-control-sm laboral-entrada" id="horarioEntrada" placeholder="Entrada" />
              </div>
              <div class="col-6 col-md-3">
                <input type="time" class="form-control form-control-sm laboral-salida" id="horarioSalida" placeholder="Salida" />
              </div>
            </div>
            <div class="form-text">Puedes agregar varios rangos de horario si la jornada es dividida.</div>
          </div>

          <!-- Horarios de Comida Dinámicos -->
          <div class="horario-slot mb-3">
            <div class="horario-header-bar">
              <label class="form-label mb-0 fw-bold text-dark">
                <i class="bi bi-cup-hot me-1 text-success"></i> Horarios de Comida
              </label>
              <button type="button" id="agregarHorarioComida" class="btn btn-outline-success btn-sm">
                <i class="bi bi-plus-circle me-1"></i> Agregar Horario
              </button>
            </div>
            <div id="comidaHorariosContainer" class="row g-2">
              <div class="col-6 col-md-3">
                <input type="time" class="form-control form-control-sm comida-entrada" placeholder="Entrada" />
              </div>
              <div class="col-6 col-md-3">
                <input type="time" class="form-control form-control-sm comida-salida" placeholder="Salida" />
              </div>
            </div>
            <div class="form-text">Puedes agregar varios rangos de horario para el periodo de comida.</div>
          </div>

          <!-- Horarios Especiales (Prestaciones y Sábado) -->
          <div class="row g-3 mb-3">
            <div class="col-12 col-md-6">
              <div class="horario-slot h-100">
                <label class="form-label fw-bold text-dark">
                  <i class="bi bi-star me-1 text-success"></i> Horario de Prestaciones
                </label>
                <div class="row g-2">
                  <div class="col-6">
                    <input type="time" id="prestacionesEntrada" class="form-control form-control-sm" placeholder="Entrada" />
                  </div>
                  <div class="col-6">
                    <input type="time" id="prestacionesSalida" class="form-control form-control-sm" placeholder="Salida" />
                  </div>
                </div>
                <div class="form-text">Formato contractual para prestaciones especiales.</div>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="horario-slot h-100">
                <label class="form-label fw-bold text-dark">
                  <i class="bi bi-calendar-event me-1 text-success"></i> Horario de Sábado
                </label>
                <div class="row g-2">
                  <div class="col-6">
                    <input type="time" id="sabadoEntrada" class="form-control form-control-sm" placeholder="Entrada" />
                  </div>
                  <div class="col-6">
                    <input type="time" id="sabadoSalida" class="form-control form-control-sm" placeholder="Salida" />
                  </div>
                </div>
                <div class="form-text">Horario aplicable para sábados laborales.</div>
              </div>
            </div>
          </div>

          <!-- Horarios de Turno Dinámicos -->
          <div class="horario-slot mb-3">
            <div class="horario-header-bar">
              <label class="form-label mb-0 fw-bold text-dark">
                <i class="bi bi-arrow-repeat me-1 text-success"></i> Horarios de Turno
              </label>
              <button type="button" id="agregarHorarioTurno" class="btn btn-outline-success btn-sm">
                <i class="bi bi-plus-circle me-1"></i> Agregar Horario
              </button>
            </div>
            <div id="turnoHorariosContainer" class="row g-2">
              <div class="col-6 col-md-3">
                <input type="time" class="form-control form-control-sm turno-entrada" placeholder="Entrada" />
              </div>
              <div class="col-6 col-md-3">
                <input type="time" class="form-control form-control-sm turno-salida" placeholder="Salida" />
              </div>
            </div>
            <div class="form-text">Puedes agregar varios horarios de turnos rotativos.</div>
          </div>

          <!-- Días y Horas de Descanso -->
          <div class="row g-3">
            <div class="col-12 col-md-4">
              <label for="diasDescanso" class="form-label">Días de Descanso</label>
              <input type="text" id="diasDescanso" name="dias_descanso" class="form-control form-control-sm" placeholder="Ej: Domingo" />
            </div>
            <div class="col-12 col-md-4">
              <label for="horasDescanso" class="form-label">Horas de Descanso</label>
              <input type="number" id="horasDescanso" class="form-control form-control-sm" placeholder="Ej: 1" min="0" step="1" />
              <div class="form-text">En el contrato se redactará en texto (ej. "una hora").</div>
            </div>
            <div class="col-12 col-md-4">
              <label for="duracionJornada" class="form-label">Duración de Jornada (Horas)</label>
              <input type="number" id="duracionJornada" class="form-control form-control-sm" placeholder="Ej: 8" min="0" step="1" />
            </div>
          </div>

        </div>
      </div>

      <!-- ==========================================
           CARD 5: BENEFICIARIOS DEL EMPLEADO
           ========================================== -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h6 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-people text-success"></i> Beneficiarios Designados
            </h6>
            <button type="button" id="btnAgregarBeneficiario" class="btn btn-outline-success btn-sm">
              <i class="bi bi-plus-circle me-1"></i> Agregar Beneficiario
            </button>
          </div>
        </div>
        <div class="card-body p-4">

          <div id="beneficiariosContainer">
            <!-- Fila base de beneficiario -->
            <div class="beneficiario-row row g-2 align-items-end" data-index="0">
              <div class="col-12 col-md-5">
                <label class="form-label">Nombre del Beneficiario</label>
                <input type="text" name="beneficiario_nombre[]" class="form-control form-control-sm beneficiario-nombre" placeholder="Nombre completo" />
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label">Parentesco</label>
                <input type="text" name="beneficiario_parentesco[]" class="form-control form-control-sm beneficiario-parentesco" placeholder="Ej: Esposo(a), Hijo(a)" />
              </div>
              <div class="col-12 col-md-2">
                <label class="form-label">Porcentaje (%)</label>
                <input type="text" name="beneficiario_porcentaje[]" class="form-control form-control-sm beneficiario-porcentaje" placeholder="Ej: 100" />
              </div>
              <div class="col-12 col-md-2">
                <button type="button" class="btn btn-outline-danger btn-sm btn-remove-beneficiario w-100" style="display: none;">
                  <i class="bi bi-trash me-1"></i> Quitar
                </button>
              </div>
            </div>
          </div>

          <div class="form-text mt-3">
            <i class="bi bi-info-circle me-1 text-muted"></i>
            Máximo 5 beneficiarios. Estos datos se aplican exclusivamente al documento generado.
          </div>

        </div>
      </div>

      <!-- ==========================================
           BARRA DE ACCIÓN: PREVISUALIZAR CONTRATO
           ========================================== -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <span class="text-muted small">
            <i class="bi bi-check2-circle text-success me-1"></i>
            Verifica todos los campos antes de generar la vista previa del contrato laboral.
          </span>
          <button id="btnVerVistaPrevia" type="button" class="btn btn-success px-4 py-2">
            <i class="bi bi-eye me-1"></i> Previsualizar Contrato
          </button>
        </div>
      </div>

    </form>

    <!-- ==========================================
         CARD 6: VISTA PREVIA DEL CONTRATO
         ========================================== -->
    <div class="card border-0 shadow-sm mb-5">
      <div class="card-header bg-white py-3">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="d-flex align-items-center gap-2">
            <h6 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-check text-success"></i> Documento Generado
            </h6>
            <span class="badge badge-clave" id="infoPlantilla"></span>
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap no-print">
            <input type="text" id="nombreArchivo" class="form-control form-control-sm" placeholder="Nombre de archivo (opcional)" style="min-width: 220px;" />
            <button id="btnImprimir" class="btn btn-outline-secondary btn-sm" disabled>
              <i class="bi bi-printer me-1"></i> Imprimir
            </button>
            <button id="btnDescargarWord" class="btn btn-success btn-sm" disabled>
              <i class="bi bi-file-earmark-word me-1"></i> Descargar Word
            </button>
          </div>
        </div>
      </div>

      <div class="card-body preview-card-body">
        <div id="previewContent" class="preview-area"></div>
      </div>
    </div>

  </div>

  <script src="<?= JQUERY_JS ?>"></script>
  <script src="<?= BOOTSTRAP_JS ?>"></script>
  <script src="<?= $rutaRaiz ?>/navbar/js/navbar.js"></script>
  <script>
    // Mapear parámetros de URL a los nombres esperados por generar.js
    (function () {
      try {
        var params = new URLSearchParams(window.location.search);
        window.parametrosUrl = {
          empleadoId: params.get('empleadoId'),
          empleadoClave: params.get('clave'),
          plantillaNombre: params.get('plantilla')
        };
      } catch (e) {
        window.parametrosUrl = {};
      }
    })();
  </script>
  <script src="<?= $rutaRaiz ?>/contratos/js/generar.js"></script>
</body>

</html>