<?php
// contratos/views/generar.php
include_once '../../config/config.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generar Contrato</title>
 <link rel="stylesheet" href="<?= BOOTSTRAP_CSS ?>">
  <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>"
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/contratos.css">
  <link rel="stylesheet" href="<?= $rutaRaiz ?>/contratos/styles/generar-moderno.css">
</head>
<body>
  <?php include '../../public/views/navbar.php'; ?>
  <div class="container py-4">
    <!-- Header con gradiente -->
    <div class="page-header">
      <h1>📋 Generar Contrato</h1>
      <p>Complete los datos del empleado y la empresa para generar el contrato laboral</p>
    </div>

    <div class="row mb-3">
      <div class="col-12">
        <a href="lista_empleados.php" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-arrow-left-circle me-1"></i>
          Regresar a Lista de Empleados
        </a>
      </div>
    </div>

    <!-- Formulario con diseño moderno -->
    <div class="form-card">
      <div class="form-card-header">
        <h2>💼 Información del Contrato</h2>
      </div>
      <div class="form-card-body">
        <form id="formDatosContrato">
          
          <!-- SECCIÓN 1: Datos de la Empresa -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">🏢</span>
              <h3>Datos de la Empresa</h3>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <label class="form-label">Nombre de la Empresa</label>
                <input type="text" id="nombreEmpresa" name="empresa" class="form-control form-control-sm" placeholder="Ej: Corporativo XYZ S.A." />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">RFC de la Empresa</label>
                <input type="text" id="rfcEmpresa" name="rfc_empresa" class="form-control form-control-sm" placeholder="13 caracteres" />
              </div>
              <div class="col-12">
                <label class="form-label">Domicilio Fiscal</label>
                <input type="text" id="domicilioFiscal" name="domicilio_fiscal" class="form-control form-control-sm" placeholder="Calle, número, colonia, ciudad, estado, CP" />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: Datos del Trabajador -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">👤</span>
              <h3>Datos Personales del Trabajador</h3>
            </div>
            <div class="row">
              <div class="col-12">
                <label class="form-label">Nombre Completo</label>
                <input type="text" id="nombreTrabajador" name="nombre_trabajador" class="form-control form-control-sm" placeholder="Nombre(s) Apellido Paterno Apellido Materno" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Fecha de Nacimiento</label>
                <input type="date" id="fechaNacimiento" name="fecha_nacimiento" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-2">
                <label class="form-label">Edad</label>
                <input type="number" id="edad" name="edad" class="form-control form-control-sm" placeholder="0" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Estado Civil</label>
                <input type="text" id="estadoCivil" name="estado_civil" class="form-control form-control-sm" placeholder="Ej: Soltero(a)" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">CURP</label>
                <input type="text" id="curp" name="curp" class="form-control form-control-sm" placeholder="18 caracteres" maxlength="18" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">RFC del Empleado</label>
                <input type="text" id="rfcEmpleado" name="rfc_empleado" class="form-control form-control-sm" placeholder="13 caracteres" maxlength="13" />
              </div>
              <div class="col-12">
                <label class="form-label">Domicilio del Trabajador</label>
                <input type="text" id="domicilioTrabajador" name="domicilio_trabajador" class="form-control form-control-sm" placeholder="Calle, número, colonia, ciudad, estado, CP" />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 3: Datos del Puesto -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">💼</span>
              <h3>Información del Puesto de Trabajo</h3>
            </div>
            <div class="row">
              <div class="col-12 col-md-6">
                <label class="form-label">Puesto</label>
                <input type="text" id="puestoTrabajador" name="puesto_trabajador" class="form-control form-control-sm" placeholder="Ej: Gerente de Ventas" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Ubicación del Puesto</label>
                <input type="text" id="direccionPuesto" name="direccion_puesto_trabajador" class="form-control form-control-sm" placeholder="Dirección donde laborará" />
              </div>
              <div class="col-12">
                <label class="form-label">Descripción del Puesto</label>
                <input type="text" id="descripcionPuesto" name="descripcion_puesto" class="form-control form-control-sm" placeholder="Breve descripción de funciones" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Fecha de Ingreso</label>
                <input type="date" id="fechaIngreso" name="fecha_ingreso" class="form-control form-control-sm" readonly />
                <div class="form-text">Se calcula automáticamente</div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 4: Fechas y Tipo de Contrato -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">📅</span>
              <h3>Fechas y Tipo de Contrato</h3>
            </div>
            <div class="row">
              <div class="col-12 col-md-4">
                <label class="form-label">Inicio de Labores</label>
                <input type="date" id="inicioLabores" name="inicio_labores" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Fecha del Contrato</label>
                <input type="date" id="fechaContrato" name="fecha_contrato" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Tipo de Contrato</label>
                <select id="tipoContrato" name="tipo_contrato" class="form-select form-select-sm">
                  <option value="">Seleccione</option>
                  <option value="Determinado">Tiempo Determinado</option>
                  <option value="Indeterminado">Tiempo Indeterminado</option>
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Formato de Fecha (Contrato)</label>
                <select id="formatoFechaContrato" name="formato_fecha_contrato" class="form-select form-select-sm">
                  <option value="clasico">Clásico: 20 DÍAS DEL MES DE ENERO DEL AÑO 2025</option>
                  <option value="a_los">A LOS 20 DÍAS DEL MES DE ENERO DEL 2025</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label">Inicio Periodo de Prueba</label>
                <input type="date" id="periodoPruebaInicio" name="periodo_prueba_inicio" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label">Fin Periodo de Prueba</label>
                <input type="date" id="periodoPruebaFin" name="periodo_prueba_fin" class="form-control form-control-sm" />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 5: Salarios y Pagos -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">💰</span>
              <h3>Salarios y Condiciones de Pago</h3>
            </div>
            <div class="row">
              <div class="col-12 col-md-4">
                <label class="form-label">Salario Semanal</label>
                <input type="number" id="salarioSemanal" name="salario_semanal" class="form-control form-control-sm" step="0.01" placeholder="0.00" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Salario Diario</label>
                <input type="text" id="salarioDiario" name="salario_diario" class="form-control form-control-sm" placeholder="$0.00" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Sueldo</label>
                <input type="text" id="sueldo" name="sueldo" class="form-control form-control-sm" placeholder="$0.00" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Periodicidad de Pago</label>
                <select id="periodicidadPago" name="periodicidad_pago" class="form-select form-select-sm">
                  <option value="">Seleccione</option>
                  <option value="semanales">Semanal</option>
                  <option value="quincenales">Quincenal</option>
                  <option value="mensuales">Mensual</option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Día de Pago</label>
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
              <div class="col-12 col-md-4">
                <label class="form-label">Tipo de Recibo</label>
                <input type="text" id="tipoRecibo" name="tipo_recibo" class="form-control form-control-sm" placeholder="Ej: Nómina" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Fecha de Recibo</label>
                <input type="date" id="fechaRecibo" name="fecha_recibo" class="form-control form-control-sm" />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 6: Horarios y Jornada Laboral -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">⏰</span>
              <h3>Horarios y Jornada Laboral</h3>
            </div>
            <div class="row">
              <div class="col-12">
                <label class="form-label d-flex justify-content-between align-items-center">
                  <span>Horario Laboral</span>
                  <button type="button" id="agregarHorarioLaboral" class="btn btn-outline-primary btn-sm">+ Agregar Horario</button>
                </label>
                <div id="laboralHorariosContainer" class="row g-2">
                  <div class="col-6 col-md-3">
                    <input type="time" class="form-control form-control-sm laboral-entrada" id="horarioEntrada" placeholder="Entrada" />
                  </div>
                  <div class="col-6 col-md-3">
                    <input type="time" class="form-control form-control-sm laboral-salida" id="horarioSalida" placeholder="Salida" />
                  </div>
                </div>
                <div class="form-text">Puedes agregar varios rangos de horario</div>
              </div>
              <div class="col-12">
                <label class="form-label d-flex justify-content-between align-items-center">
                  <span>Horarios de Comida</span>
                  <button type="button" id="agregarHorarioComida" class="btn btn-outline-primary btn-sm">+ Agregar Horario</button>
                </label>
                <div id="comidaHorariosContainer" class="row g-2">
                  <div class="col-6 col-md-3">
                    <input type="time" class="form-control form-control-sm comida-entrada" placeholder="Entrada" />
                  </div>
                  <div class="col-6 col-md-3">
                    <input type="time" class="form-control form-control-sm comida-salida" placeholder="Salida" />
                  </div>
                </div>
                <div class="form-text">Puedes agregar varios rangos de comida</div>
              </div>
              <div class="col-12">
                <label class="form-label">Horario de Prestaciones</label>
                <div class="row g-2">
                  <div class="col-6 col-md-3">
                    <input type="time" id="prestacionesEntrada" class="form-control form-control-sm" placeholder="Entrada" />
                  </div>
                  <div class="col-6 col-md-3">
                    <input type="time" id="prestacionesSalida" class="form-control form-control-sm" placeholder="Salida" />
                  </div>
                </div>
                <div class="form-text">Formato: 09:12 a las 13:11 (los números se subrayan automáticamente)</div>
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label">Sábado Entrada</label>
                <input type="time" id="sabadoEntrada" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-3">
                <label class="form-label">Sábado Salida</label>
                <input type="time" id="sabadoSalida" class="form-control form-control-sm" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Días de Descanso</label>
                <input type="text" id="diasDescanso" name="dias_descanso" class="form-control form-control-sm" placeholder="Ej: Domingo y lunes" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Horas de Descanso</label>
                <input type="number" id="horasDescanso" class="form-control form-control-sm" placeholder="Ej: 2" min="0" step="1" />
                <div class="form-text">Ingresa el número de horas. En la plantilla se mostrará como texto (ej. "una hora", "dos horas").</div>
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Duración de la Jornada (horas)</label>
                <input type="number" id="duracionJornada" class="form-control form-control-sm" placeholder="Ej: 8" min="0" step="1" />
              </div>
            </div>
          </div>

          <!-- SECCIÓN 6B: Horarios de Turno -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">🔄</span>
              <h3>Horarios de Turno</h3>
            </div>
            <div class="row">
              <div class="col-12">
                <label class="form-label d-flex justify-content-between align-items-center">
                  <span>Horario de Turno</span>
                  <button type="button" id="agregarHorarioTurno" class="btn btn-outline-primary btn-sm">+ Agregar Horario</button>
                </label>
                <div id="turnoHorariosContainer" class="row g-2">
                  <div class="col-6 col-md-3">
                    <input type="time" class="form-control form-control-sm turno-entrada" placeholder="Entrada" />
                  </div>
                  <div class="col-6 col-md-3">
                    <input type="time" class="form-control form-control-sm turno-salida" placeholder="Salida" />
                  </div>
                </div>
                <div class="form-text">Puedes agregar varios horarios de turno (formato: 8:00 am a 17:00, 9:00 am a 18:00)</div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 7: Beneficiarios -->
          <div class="form-section">
            <div class="section-title">
              <span class="icon">👥</span>
              <h3>Beneficiarios del Empleado</h3>
            </div>
            <div class="row">
              <div class="col-12">
                <div id="beneficiariosLista" class="list-group"></div>
                <div class="form-text mt-2">Se muestran automáticamente los beneficiarios registrados (máximo 5)</div>
              </div>
            </div>
          </div>

          <!-- Botón de previsualización -->
          <div class="text-end mt-4">
            <button id="btnVerVistaPrevia" type="button" class="btn btn-primary">
              👁️ Previsualizar Contrato
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Vista previa con diseño moderno -->
    <div class="form-card">
      <div class="form-card-header">
        <h2>📄 Vista Previa del Contrato</h2>
      </div>
      <div class="card-body p-4" style="background: #f8fafc;">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 no-print">
          <div class="d-flex align-items-center gap-2">
            <span class="badge badge-info" id="infoPlantilla"></span>
          </div>
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <input type="text" id="nombreArchivo" class="form-control form-control-sm" placeholder="Nombre del archivo (opcional)" style="min-width: 200px; max-width: 300px;" />
            <button id="btnImprimir" class="btn btn-outline-secondary btn-sm" disabled>
              🖨️ Imprimir
            </button>
<button id="btnDescargarWord" class="btn btn-success btn-sm" disabled>
              📄 Descargar Word
            </button>
          </div>
        </div>
        <div id="previewContent" class="preview-area a4-container bg-white" style="min-height: 500px; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);"></div>
      </div>
    </div>

  </div>

   <script src="<?= JQUERY_JS ?>"></script>
  <script src="<?= BOOTSTRAP_JS ?>"></script>
  <script src="<?= $rutaRaiz ?>/public/js/navbar.js"></script>
  <script>
    // Mapear parámetros de URL a los nombres esperados por generar.js
    (function(){
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