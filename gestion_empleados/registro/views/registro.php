<!DOCTYPE html>
<html lang="es">

<!--Incluir config.php para iniciar sesión -->
<?php
include "../../../config/config.php";
verificarSesion(); // Proteger esta página
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Registrar Nuevo Empleado</title>
    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <!-- Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Bootstrap Iconos 5 -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>

    <link rel="stylesheet" href="../../registro/css/registro.css">
</head>

<body class="bg-light">

    <?php
    // Incluir el navbar (config.php ya fue incluido en el head)
    include "../../../public/views/navbar.php"
    ?>

    <div class="container-fluid py-4">

        <div class="row justify-content-center">

            <div class="col-lg-10">

                <!-- Encabezado -->
                <div class="card border-0 shadow-sm mb-4">

                    <div class="card-body py-4">

                        <div class="d-flex align-items-center justify-content-between">

                            <div>

                                <h3 class="fw-bold mb-1">
                                    <i class="bi bi-person-plus-fill text-success me-2"></i>
                                    Registrar Nuevo Empleado
                                </h3>

                                <p class="text-muted mb-0">
                                    Complete la información del empleado paso a paso
                                </p>

                            </div>

                            <!-- Indicador de progreso -->
                            <div class="d-flex align-items-center gap-2">

                                <span class="text-muted small">Paso</span>

                                <div class="btn-group" role="group">

                                    <button type="button" class="btn btn-sm btn-success" id="stepIndicator1">
                                        1
                                    </button>

                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="stepIndicator2">
                                        2
                                    </button>

                                    <button type="button" class="btn btn-sm btn-outline-secondary" id="stepIndicator3">
                                        3
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- Formulario principal -->
                <form id="formRegistroEmpleado">

                    <!-- Campo oculto para guardar el ID del empleado -->
                    <input type="hidden" id="registroIdEmpleado" name="id_empleado">
                    <!-- ID del empleado registrado (se asigna dinámicamente tras el Paso 1) -->
                    <input type="hidden" id="registroIdEmpleado" name="id_empleado" value="">

                    <!-- ========================================= -->
                    <!-- PASO 1: INFORMACIÓN DEL EMPLEADO -->
                    <!-- ========================================= -->

                    <div class="card border-0 shadow-sm mb-4" id="step1">

                        <div class="card-header bg-white py-3">

                            <h5 class="mb-0 fw-bold">
                                <i class="bi bi-person me-2 text-primary"></i>
                                Información del Empleado
                            </h5>

                        </div>

                        <div class="card-body">

                            <!-- DATOS PERSONALES -->
                            <div class="card border-0 bg-light mb-4">

                                <div class="card-body">

                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-person me-2"></i>
                                        Datos personales
                                    </h6>

                                    <div class="row g-3">

                                        <!-- Clave -->
                                        <div class="col-md-3">

                                            <label for="registroClave" class="form-label fw-semibold">
                                                Clave
                                            </label>

                                            <div class="input-group">

                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    id="registroClave"
                                                    name="clave"
                                                    placeholder="Clave">

                                                <button
                                                    type="button"
                                                    class="btn btn-outline-success"
                                                    id="btnAbrirClavesDisponibles"
                                                    title="Ver disponibilidad de claves">
                                                    <i class="bi bi-key-fill"></i>
                                                </button>

                                            </div>

                                        </div>


                                        <!-- Nombre -->
                                        <div class="col-md-3">

                                            <label for="registroNombre" class="form-label fw-semibold">
                                                Nombre
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroNombre"
                                                name="nombre"
                                                required>

                                        </div>


                                        <!-- Apellido Paterno -->
                                        <div class="col-md-3">

                                            <label for="registroApellidoPaterno" class="form-label fw-semibold">
                                                Apellido Paterno
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroApellidoPaterno"
                                                name="apellido_paterno"
                                                required>

                                        </div>


                                        <!-- Apellido Materno -->
                                        <div class="col-md-3">

                                            <label for="registroApellidoMaterno" class="form-label fw-semibold">
                                                Apellido Materno
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroApellidoMaterno"
                                                name="apellido_materno"
                                                required>

                                        </div>


                                        <!-- IMSS -->
                                        <div class="col-md-4">

                                            <label for="registroImss" class="form-label fw-semibold">
                                                IMSS
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control"
                                                id="registroImss"
                                                name="imss">

                                        </div>


                                        <!-- CURP -->
                                        <div class="col-md-4">

                                            <label for="registroCurp" class="form-label fw-semibold">
                                                CURP
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroCurp"
                                                name="curp"
                                                maxlength="18">

                                        </div>


                                        <!-- RFC -->
                                        <div class="col-md-4">

                                            <label for="registroRfc" class="form-label fw-semibold">
                                                RFC
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroRfc"
                                                name="rfc"
                                                maxlength="13">

                                        </div>


                                        <!-- Domicilio -->
                                        <div class="col-md-8">

                                            <label for="registroDomicilio" class="form-label fw-semibold">
                                                Domicilio
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control"
                                                id="registroDomicilio"
                                                name="domicilio">

                                        </div>


                                        <!-- Sexo -->
                                        <div class="col-md-2">

                                            <label for="registroSexo" class="form-label fw-semibold">
                                                Sexo
                                            </label>

                                            <select
                                                class="form-select"
                                                id="registroSexo"
                                                name="sexo">

                                                <option value="">
                                                    Seleccionar
                                                </option>

                                                <option value="M">
                                                    Masculino
                                                </option>

                                                <option value="F">
                                                    Femenino
                                                </option>

                                            </select>

                                        </div>


                                        <!-- Grupo Sanguíneo -->
                                        <div class="col-md-2">

                                            <label for="registroGrupoSanguineo" class="form-label fw-semibold">
                                                Grupo Sanguíneo
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control"
                                                id="registroGrupoSanguineo"
                                                name="grupo_sanguineo">

                                        </div>


                                        <!-- Fecha nacimiento -->
                                        <div class="col-md-4">

                                            <label for="registroFechaNacimiento" class="form-label fw-semibold">
                                                Fecha de nacimiento
                                            </label>

                                            <input
                                                type="date"
                                                class="form-control"
                                                id="registroFechaNacimiento"
                                                name="fecha_nacimiento">

                                        </div>


                                        <!-- Edad -->
                                        <div class="col-md-2">

                                            <label for="registroEdad" class="form-label fw-semibold">
                                                Edad
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control"
                                                id="registroEdad"
                                                readonly>

                                        </div>


                                        <!-- Estado civil -->
                                        <div class="col-md-3">

                                            <label for="registroEstadoCivil" class="form-label fw-semibold">
                                                Estado Civil
                                            </label>

                                            <select
                                                class="form-select"
                                                id="registroEstadoCivil"
                                                name="estado_civil">

                                                <option value="">
                                                    Seleccionar
                                                </option>

                                                <option value="SOLTERO">
                                                    Soltero(a)
                                                </option>

                                                <option value="CASADO">
                                                    Casado(a)
                                                </option>

                                                <option value="DIVORCIADO">
                                                    Divorciado(a)
                                                </option>

                                                <option value="VIUDO">
                                                    Viudo(a)
                                                </option>

                                                <option value="UNION_LIBRE">
                                                    Unión Libre
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <!-- DATOS DE CONTACTO -->
                            <div class="card border-0 bg-light mb-4">

                                <div class="card-body">

                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-telephone me-2"></i>
                                        Datos de contacto
                                    </h6>

                                    <div class="row g-3">

                                        <!-- Teléfono -->
                                        <div class="col-md-4">

                                            <label for="registroTelefono" class="form-label fw-semibold">
                                                Teléfono
                                            </label>

                                            <input
                                                type="tel"
                                                class="form-control"
                                                id="registroTelefono"
                                                name="telefono"
                                                maxlength="10"
                                                inputmode="numeric"
                                                pattern="[0-9]{10}"
                                                placeholder="10 dígitos">

                                        </div>


                                        <!-- Enfermedades / Alergias -->
                                        <div class="col-md-8">

                                            <label for="registroEnfermedades" class="form-label fw-semibold">
                                                Enfermedades / Alergias
                                            </label>

                                            <textarea
                                                class="form-control"
                                                id="registroEnfermedades"
                                                name="enfermedades_alergias"
                                                rows="2"
                                                placeholder="Escriba las enfermedades o alergias del empleado..."></textarea>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <!-- DATOS LABORALES -->
                            <div class="card border-0 bg-light mb-4">

                                <div class="card-body">

                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-building me-2"></i>
                                        Datos laborales
                                    </h6>

                                    <div class="row g-3">

                                        <!-- Número de casillero -->
                                        <div class="col-md-3">

                                            <label for="registroCasillero" class="form-label fw-semibold">
                                                Número de Casillero
                                            </label>

                                            <div class="input-group">

                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    id="registroCasillero"
                                                    name="numero_casillero"
                                                    placeholder="Casillero"
                                                    inputmode="numeric"
                                                    oninput="this.value = this.value.replace(/[^0-9]/g, '')">

                                                <button
                                                    type="button"
                                                    class="btn btn-outline-success"
                                                    id="btnAbrirCasillerosDisponibles"
                                                    title="Ver casilleros disponibles">
                                                    <i class="bi bi-grid-3x3-gap-fill"></i>
                                                </button>

                                            </div>

                                        </div>


                                        <!-- Biométrico -->
                                        <div class="col-md-3">

                                            <label for="registroBiometrico" class="form-label fw-semibold">
                                                Biométrico
                                            </label>

                                            <div class="input-group">

                                                <input
                                                    type="text"
                                                    class="form-control"
                                                    id="registroBiometrico"
                                                    name="biometrico"
                                                    placeholder="Biométrico"
                                                    inputmode="numeric"
                                                    oninput="this.value = this.value.replace(/[^0-9]/g, '')">

                                                <button
                                                    type="button"
                                                    class="btn btn-outline-success"
                                                    id="btnAbrirBiometricoDisponible"
                                                    title="Ver disponibilidad de biométricos">
                                                    <i class="bi bi-fingerprint"></i>
                                                </button>

                                            </div>

                                        </div>


                                        <!-- Empresa -->
                                        <div class="col-md-6">

                                            <label for="registroEmpresa" class="form-label fw-semibold">
                                                Empresa
                                            </label>

                                            <select
                                                class="form-select"
                                                id="registroEmpresa"
                                                name="id_empresa">

                                                <option value="">
                                                    Seleccionar empresa
                                                </option>

                                            </select>

                                        </div>


                                        <!-- Área -->
                                        <div class="col-md-4">

                                            <label for="registroArea" class="form-label fw-semibold">
                                                Área
                                            </label>

                                            <select
                                                class="form-select"
                                                id="registroArea"
                                                name="id_area">

                                                <option value="">
                                                    Seleccionar área
                                                </option>

                                            </select>

                                        </div>


                                        <!-- Departamento -->
                                        <div class="col-md-4">

                                            <label for="registroDepartamento" class="form-label fw-semibold">
                                                Departamento
                                            </label>

                                            <select
                                                class="form-select"
                                                id="registroDepartamento"
                                                name="id_departamento">

                                                <option value="">
                                                    Seleccionar departamento
                                                </option>

                                            </select>

                                        </div>


                                        <!-- Puesto -->
                                        <div class="col-md-4">

                                            <label for="registroPuesto" class="form-label fw-semibold">
                                                Puesto
                                            </label>

                                            <select
                                                class="form-select"
                                                id="registroPuesto"
                                                name="id_puesto">

                                                <option value="">
                                                    Seleccionar puesto
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <!-- DATOS SALARIALES -->
                            <div class="card border-0 bg-light">

                                <div class="card-body">

                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-cash-stack me-2"></i>
                                        Información salarial
                                    </h6>

                                    <div class="row g-3">

                                        <!-- Salario semanal -->
                                        <div class="col-md-6">

                                            <label for="registroSalarioSemanal" class="form-label fw-semibold">
                                                Salario Semanal
                                            </label>

                                            <div class="input-group">

                                                <span class="input-group-text">
                                                    $
                                                </span>

                                                <input
                                                    type="number"
                                                    class="form-control"
                                                    id="registroSalarioSemanal"
                                                    name="salario_semanal"
                                                    step="0.01"
                                                    min="0">

                                            </div>

                                        </div>


                                        <!-- Salario diario -->
                                        <div class="col-md-6">

                                            <label for="registroSalarioDiario" class="form-label fw-semibold">
                                                Salario Diario
                                            </label>

                                            <div class="input-group">

                                                <span class="input-group-text">
                                                    $
                                                </span>

                                                <input
                                                    type="number"
                                                    class="form-control"
                                                    id="registroSalarioDiario"
                                                    name="salario_diario"
                                                    step="0.01"
                                                    min="0">

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div class="card-footer bg-white text-end">

                            <button
                                type="button"
                                class="btn btn-primary"
                                id="btnInfoEmpleado">

                                <i class="bi bi-arrow-right me-1"></i>
                                Guardar y continuar: Contacto de Emergencia

                            </button>

                        </div>

                    </div>


                    <!-- ========================================= -->
                    <!-- PASO 2: CONTACTO DE EMERGENCIA -->
                    <!-- ========================================= -->

                    <div class="card border-0 shadow-sm mb-4 d-none" id="step2">

                        <div class="card-header bg-white py-3">

                            <h5 class="mb-0 fw-bold">
                                <i class="bi bi-person-lines-fill me-2 text-warning"></i>
                                Contacto de Emergencia
                            </h5>

                        </div>

                        <div class="card-body">

                            <div class="card border-0 bg-light">

                                <div class="card-body">

                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-person-lines-fill me-2"></i>
                                        Información del contacto
                                    </h6>

                                    <div class="row g-3">

                                        <!-- Nombre -->
                                        <div class="col-md-4">

                                            <label for="registroContactoNombre" class="form-label fw-semibold">
                                                Nombre
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroContactoNombre"
                                                name="contacto_nombre"
                                                required>

                                        </div>


                                        <!-- Apellido Paterno -->
                                        <div class="col-md-4">

                                            <label for="registroContactoApellidoPaterno" class="form-label fw-semibold">
                                                Apellido Paterno
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroContactoApellidoPaterno"
                                                name="contacto_apellido_paterno"
                                                required>

                                        </div>


                                        <!-- Apellido Materno -->
                                        <div class="col-md-4">

                                            <label for="registroContactoApellidoMaterno" class="form-label fw-semibold">
                                                Apellido Materno
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroContactoApellidoMaterno"
                                                name="contacto_apellido_materno">

                                        </div>


                                        <!-- Teléfono -->
                                        <div class="col-md-4">

                                            <label for="registroContactoTelefono" class="form-label fw-semibold">
                                                Teléfono
                                            </label>

                                            <input
                                                type="tel"
                                                class="form-control"
                                                id="registroContactoTelefono"
                                                name="contacto_telefono"
                                                maxlength="10"
                                                inputmode="numeric"
                                                pattern="[0-9]{10}"
                                                placeholder="10 dígitos"
                                                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                                                required>

                                        </div>


                                        <!-- Parentesco -->
                                        <div class="col-md-4">

                                            <label for="registroContactoParentesco" class="form-label fw-semibold">
                                                Parentesco
                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroContactoParentesco"
                                                name="contacto_parentesco">

                                        </div>


                                        <!-- Domicilio -->
                                        <div class="col-md-12">

                                            <label for="registroContactoDomicilio" class="form-label fw-semibold">
                                                Domicilio
                                            </label>

                                            <textarea
                                                class="form-control"
                                                id="registroContactoDomicilio"
                                                name="contacto_domicilio"
                                                rows="2"
                                                placeholder="Ingrese el domicilio del contacto de emergencia..."
                                                required></textarea>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div class="card-footer bg-white d-flex justify-content-end gap-2">

                            <button
                                type="button"
                                class="btn btn-primary"
                                id="btnRegistroContactoEmergencia">

                                <i class="bi bi-arrow-right me-1"></i>
                                Guardar y continuar: Beneficiarios

                            </button>

                            <button
                                type="button"
                                class="btn btn-secondary"
                                id="btnContinuarBeneficiarios">

                                <i class="bi bi-arrow-right me-1"></i>
                                Siguiente

                            </button>

                        </div>

                    </div>


                    <!-- ========================================= -->
                    <!-- PASO 3: BENEFICIARIOS -->
                    <!-- ========================================= -->

                    <div class="card border-0 shadow-sm mb-4 d-none" id="step3">

                        <div class="card-header bg-white py-3">

                            <h5 class="mb-0 fw-bold">
                                <i class="bi bi-people-fill me-2 text-info"></i>
                                Beneficiarios
                            </h5>

                        </div>

                        <div class="card-body">

                            <!-- AGREGAR BENEFICIARIO -->
                            <div class="card border-0 bg-light mb-4">

                                <div class="card-body">

                                    <h6 class="fw-bold text-secondary mb-3">

                                        <i class="bi bi-person-plus-fill me-2"></i>

                                        Agregar beneficiario

                                    </h6>


                                    <div class="row g-3">

                                        <!-- Nombre -->
                                        <div class="col-md-3">

                                            <label for="registroBeneficiarioNombre" class="form-label fw-semibold">

                                                Nombre

                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroBeneficiarioNombre"
                                                name="beneficiario_nombre"
                                                placeholder="Nombre">

                                        </div>


                                        <!-- Apellido Paterno -->
                                        <div class="col-md-3">

                                            <label for="registroBeneficiarioApellidoPaterno" class="form-label fw-semibold">

                                                Apellido Paterno

                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroBeneficiarioApellidoPaterno"
                                                name="beneficiario_apellido_paterno"
                                                placeholder="Apellido paterno">

                                        </div>


                                        <!-- Apellido Materno -->
                                        <div class="col-md-3">

                                            <label for="registroBeneficiarioApellidoMaterno" class="form-label fw-semibold">

                                                Apellido Materno

                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroBeneficiarioApellidoMaterno"
                                                name="beneficiario_apellido_materno"
                                                placeholder="Apellido materno">

                                        </div>


                                        <!-- Parentesco -->
                                        <div class="col-md-3">

                                            <label for="registroBeneficiarioParentesco" class="form-label fw-semibold">

                                                Parentesco

                                            </label>

                                            <input
                                                type="text"
                                                class="form-control text-uppercase"
                                                id="registroBeneficiarioParentesco"
                                                name="beneficiario_parentesco"
                                                placeholder="Parentesco">

                                        </div>


                                        <!-- Porcentaje -->
                                        <div class="col-md-3">

                                            <label for="registroBeneficiarioPorcentaje" class="form-label fw-semibold">

                                                Porcentaje

                                            </label>

                                            <div class="input-group">

                                                <input
                                                    type="number"
                                                    class="form-control"
                                                    id="registroBeneficiarioPorcentaje"
                                                    name="beneficiario_porcentaje"
                                                    min="0.01"
                                                    max="100"
                                                    step="0.01"
                                                    placeholder="0.00">

                                                <span class="input-group-text">
                                                    %
                                                </span>

                                            </div>

                                        </div>


                                        <!-- Botón agregar -->
                                        <div class="col-md-9 d-flex align-items-end">

                                            <button
                                                type="button"
                                                class="btn btn-primary"
                                                id="btnAgregarBeneficiario">

                                                <i class="bi bi-plus-lg me-1"></i>

                                                Agregar beneficiario

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <!-- LISTADO DE BENEFICIARIOS -->
                            <div class="card border-0 bg-light">

                                <div class="card-body">

                                    <div class="d-flex justify-content-between align-items-center mb-3">

                                        <h6 class="fw-bold text-secondary mb-0">

                                            <i class="bi bi-list-ul me-2"></i>

                                            Beneficiarios registrados

                                        </h6>


                                        <!-- Porcentaje total -->
                                        <div>

                                            <span class="fw-semibold">
                                                Porcentaje total:
                                            </span>

                                            <span
                                                id="registroBeneficiariosPorcentajeTotal"
                                                class="badge bg-primary fs-6">

                                                0.00%

                                            </span>

                                        </div>

                                    </div>


                                    <!-- Tabla -->

                                    <div class="table-responsive">

                                        <table class="table table-hover align-middle mb-0">

                                            <thead class="table-light">

                                                <tr>

                                                    <th>
                                                        #
                                                    </th>

                                                    <th>
                                                        Nombre
                                                    </th>

                                                    <th>
                                                        Apellido Paterno
                                                    </th>

                                                    <th>
                                                        Apellido Materno
                                                    </th>

                                                    <th>
                                                        Parentesco
                                                    </th>

                                                    <th class="text-center">
                                                        Porcentaje
                                                    </th>

                                                    <th class="text-center">
                                                        Acción
                                                    </th>

                                                </tr>

                                            </thead>


                                            <tbody id="registroTablaBeneficiarios">

                                                <!--
                                                    Los beneficiarios
                                                    se agregarán aquí
                                                -->

                                                <tr id="registroFilaSinBeneficiarios">

                                                    <td
                                                        colspan="7"
                                                        class="text-center text-muted py-4">

                                                        <i
                                                            class="bi bi-person-x fs-3 d-block mb-2">
                                                        </i>

                                                        No hay beneficiarios registrados

                                                    </td>

                                                </tr>

                                            </tbody>

                                        </table>

                                    </div>


                                    <!-- RESUMEN DEL PORCENTAJE -->

                                    <div class="row mt-4">

                                        <div class="col-md-8"></div>

                                        <div class="col-md-4">

                                            <div class="border rounded p-3 bg-white">

                                                <div class="d-flex justify-content-between mb-2">

                                                    <span class="fw-semibold">
                                                        Porcentaje asignado:
                                                    </span>

                                                    <span
                                                        id="registroPorcentajeAsignado"
                                                        class="fw-bold">

                                                        0.00%

                                                    </span>

                                                </div>

                                                <div class="d-flex justify-content-between">

                                                    <span class="fw-semibold">
                                                        Porcentaje disponible:
                                                    </span>

                                                    <span
                                                        id="registroPorcentajeDisponible"
                                                        class="fw-bold text-success">

                                                        100.00%

                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div class="card-footer bg-white d-flex justify-content-end gap-2">

                            <button
                                type="button"
                                class="btn btn-success"
                                id="btnFinalizarRegistro">

                                <i class="bi bi-check-lg me-1"></i>
                                Finalizar registro

                            </button>

                        </div>

                    </div>

                </form>

            </div>

        </div>

    </div>

    <!-- Modals de Empleados reutilizados -->
    <?php include "../../empleados/views/modalsPerfil/modalClavesDisponibles.php"; ?>
    <?php include "../../empleados/views/modalsPerfil/modalBiometricoDisponible.php"; ?>
    <?php include "../../empleados/views/modalsPerfil/modalCasillerosDisponibles.php"; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Archivo JS específico -->
    <script src="../js/registrarInformacionPersonal.js"></script>
    <script src="../js/registrarBeneficiarios.js"></script>
    <script src="../js/configAdicionales.js"></script>
    <script src="../../empleados/js/modalsPerfil/establecerClaveDisponible.js"></script>
    <script src="../../empleados/js/modalsPerfil/establecerBiometricoDisponible.js"></script>
    <script src="../../empleados/js/modalsPerfil/establecerCasillerosDisponibles.js"></script>

</body>

</html>