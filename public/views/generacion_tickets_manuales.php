<?php
include "../../config/config.php";
verificarSesion(); // Proteger esta página
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generación de Tickets Manuales - Sistema SAAO</title>
    
    <!-- Estilos de Bootstrap y Bootstrap Icons -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="<?= $rutaRaiz ?>/public/styles/tickets_manuales.css">
    
    <script>
        // Variable global para la ruta raíz
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>
</head>

<body>
    <?php include "navbar.php"; ?>
    
    <div class="ticket-selection-container">
        <div class="back-button-top">
            <a href="<?= $rutaRaiz ?>/index.php" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-arrow-left me-1"></i>Volver
            </a>
        </div>
        
        <div class="page-header">
            <h1><i class="bi bi-receipt me-3"></i>Generación de Tickets Manuales</h1>
            <p>Seleccione el tipo de nómina para generar tickets manuales</p>
        </div>
        
        <div class="ticket-options">
            <!-- Ticket Manual Nómina Regular -->
            <div class="ticket-option-card" onclick="openNominaModal()">
                <div class="option-icon">
                    <i class="bi bi-clipboard-data"></i>
                </div>
                <h3>Ticket Manual - Nómina Regular</h3>
                <p>Para empleados de nómina regular con todos los conceptos estándar</p>
                
                <ul class="feature-list">
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Sueldo base y extras</li>
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Incentivos y bonos</li>
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Deducciones completas (ISR, IMSS, INFONAVIT)</li>
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Prestamos y uniformes</li>
                </ul>
                
                <button class="btn-select-ticket">
                    <i class="bi bi-arrow-right-circle me-2"></i>Seleccionar
                </button>
            </div>
            
            <!-- Ticket Manual Nómina Confianza -->
            <div class="ticket-option-card" onclick="openNominaConfianzaModal()">
                <div class="option-icon">
                    <i class="bi bi-shield-lock"></i>
                </div>
                <h3>Ticket Manual - Nómina Confianza</h3>
                <p>Para empleados de confianza con cálculos específicos</p>
                
                <ul class="feature-list">
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Sueldo semanal específico</li>
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Cálculo de ajustes al subsidio</li>
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Deducciones especializadas</li>
                    <li><i class="bi bi-check-circle-fill text-success me-2"></i>Manejo de checador y uniformes</li>
                </ul>
                
                <button class="btn-select-ticket">
                    <i class="bi bi-arrow-right-circle me-2"></i>Seleccionar
                </button>
            </div>
        </div>
        

    </div>
    
    <!-- Incluir ambos modales -->
    <?php include "../../nomina/views/modal_ticket_manual.php"; ?>
    <?php include "../../nomina_confianza/views/modal_ticket_manual.php"; ?>
    
    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    
    <!-- Scripts personalizados -->
    <script src="<?= $rutaRaiz ?>/public/js/tickets_manuales.js"></script>
</body>

</html>