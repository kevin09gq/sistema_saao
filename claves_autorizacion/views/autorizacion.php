<?php
include __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claves de Autorización | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!--
    * ==============================================================
    * Hojas de estilo necesarias para el funcionamiento de la página
    * ==============================================================
    -->
     <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <style>
        .concept-title {
            flex: 1;
            text-align: left;
        }

        /* Solución para que jQuery UI autocomplete aparezca sobre el modal de Bootstrap */
        .ui-autocomplete {
            z-index: 1060 !important;
            max-height: 200px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        /* Estilos para validación de contraseña */
        .password-rules {
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }

        .password-rules li {
            color: #6c757d;
            margin-bottom: 0.25rem;
        }

        .password-rules li.valid {
            color: #198754;
        }

        .password-rules li.valid::before {
            content: "✓ ";
        }

        .password-rules li.invalid {
            color: #dc3545;
        }

        .password-rules li.invalid::before {
            content: "✗ ";
        }
    </style>

</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main>

        <div class="container">

            <!-- Filtros de búsqueda -->
            <div class="row g-2  my-3">

                <!-- Campo de búsqueda -->
                <div class="col-12 col-md-4">
                    <label for="busqueda" class="form-label visually-hidden">Buscar</label>
                    <input type="text" class="form-control shadow-sm" id="busqueda" name="busqueda" placeholder="Buscar...">
                </div>

                <!-- Selección de departamento -->
                <div class="col-12 col-md-4">
                    <label for="departamento" class="form-label visually-hidden">Departamento</label>
                    <select class="form-select shadow-sm" id="departamento" name="departamento">
                        <option value="-1">Todos los departamentos</option>
                        <!-- Opciones dinámicas aquí -->
                    </select>
                </div>

                <!-- Botón para nuevo préstamo -->
                <div class="col-12 col-md-4 d-flex align-items-end justify-content-md-end">
                    <!-- Button trigger modal -->
                    <button type="button" class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#exampleModal">
                        <i class="bi bi-key-fill me-2"></i>Crear clave
                    </button>

                    <!-- Button trigger modal -->
                    <a href="historial.php" class="btn btn-secondary">
                        <i class="bi bi-check2-circle me-2"></i>Ver Autorizaciones
                    </a>
                </div>

            </div>

            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <form id="form-nueva-clave" method="post">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="exampleModalLabel">Crear clave de autorización</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label" for="empleado">Empleado</label>
                                    <input type="text" class="form-control form-control-lg border-3 shadow-sm" id="empleado" name="empleado" placeholder="Buscar empleado..." autocomplete="off">
                                    <input type="hidden" id="id_empleado" name="id_empleado">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label" for="clave">Clave de Autorización</label>
                                    <div class="input-group">
                                        <input type="password" class="form-control form-control-lg border-3 shadow-sm" id="clave" name="clave" placeholder="Ingrese la clave..." autocomplete="new-password">
                                        <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                                            <i class="bi bi-eye" id="iconoOjo"></i>
                                        </button>
                                    </div>
                                    <ul class="password-rules list-unstyled mt-2">
                                        <li id="rule-mayuscula">Debe empezar con letra mayúscula</li>
                                        <li id="rule-letras">Mínimo 3 letras</li>
                                        <li id="rule-numeros">Mínimo 3 números</li>
                                        <li id="rule-especial">Debe terminar con carácter especial (@, *, #, $)</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                <button type="submit" class="btn btn-primary" id="btn-guardar-clave" disabled>Crear clave</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Tabla de resultados -->
            <div class="table-responsive my-3">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <table class="table table-hover table-bordered">
                            <thead>
                                <tr>
                                    <th class="bg-success text-white text-center">Empleado</th>
                                    <th class="bg-success text-white text-center">Departamento</th>
                                    <th class="bg-success text-white text-center">Fecha de Creación</th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider" id="cuerpo-tabla-autorizacion">
                                <tr>
                                    <td colspan="3" class="text-center text-muted">Cargando información...</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Paginación -->
                        <nav aria-label="Page navigation" id="contenedor-paginacion">
                            <ul class="pagination justify-content-center" id="paginacion">
                                <!-- Se genera dinámicamente -->
                            </ul>
                        </nav>

                    </div>
                </div>
            </div>

        </div>

    </main>


    <!--
    * ======================================================
    * Scripts necesarios para el funcionamiento de la página
    * ======================================================
    -->

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
     <script src="<?= JQUERY_UI_JS ?>"></script>

    <script src="../js/autorizacion.js"></script>

</body>

</html>