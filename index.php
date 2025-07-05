<?php
include("config/config.php");
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Empacadora de Limón</title>
    <!-- Bootstrap CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="public/styles/main.css">
</head>

<body>
    <?php include("public/views/navbar.php"); ?>

    <!-- Sección principal de bienvenida (Hero Section) -->
    <section class="hero-section text-center">
        <div class="container">
            <h1 class="display-5 fw-bold text-success">Sistema Integral de Gestión</h1>
            <p class="lead mb-4">Administra gafetes, contratos y nóminas de los empleados de la empacadora de limón de manera eficiente y profesional.</p>
        </div>
    </section>

    <!-- Tarjetas de funcionalidades principales del sistema -->
    <div class="container my-5">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <img src="https://img.icons8.com/color/48/id-verified.png" alt="Gafetes">
                        <h5 class="card-title mt-3">Gestión de Gafetes</h5>
                        <p class="card-text">Crea, imprime y administra gafetes personalizados para los empleados.</p>
                        <a href="#" class="btn btn-success">Ir a Gafetes</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <img src="https://img.icons8.com/color/48/agreement.png" alt="Contratos">
                        <h5 class="card-title mt-3">Contratos Laborales</h5>
                        <p class="card-text">Genera y gestiona contratos de trabajo de manera sencilla y segura.</p>
                        <a href="#" class="btn btn-success">Ir a Contratos</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <img src="https://img.icons8.com/color/48/payroll.png" alt="Nómina">
                        <h5 class="card-title mt-3">Cálculo de Nómina</h5>
                        <p class="card-text">Automatiza el cálculo y control de nóminas para todos los empleados.</p>
                        <a href="#" class="btn btn-success">Ir a Nómina</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Pie de página simple -->
    <footer class="bg-success text-white text-center py-3">
        <small>&copy; 2024 Empacadora de Limón. Todos los derechos reservados.</small>
    </footer>

    <!-- Bootstrap JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>