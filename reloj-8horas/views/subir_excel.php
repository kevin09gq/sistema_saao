<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subir Archivos Excel - Reloj 8 Horas</title>
    <link rel="stylesheet" href="../../public/styles/navbar_styles.css">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container-subir {
            max-width: 600px;
            margin: 3rem auto;
            padding: 2rem;
        }
        
        .card-subir {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        
        .card-subir h1 {
            text-align: center;
            color: #2d3748;
            margin-bottom: 0.5rem;
        }
        
        .card-subir p {
            text-align: center;
            color: #718096;
            margin-bottom: 2rem;
        }
        
        .btn-redirect {
            display: block;
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
            text-decoration: none;
            text-align: center;
        }
        
        .btn-redirect:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <?php
    $rutaRaiz = str_replace('\\', '/', dirname(dirname(dirname(__FILE__))));
    $rutaRaiz = '/sistema_saao';
    include "../../public/views/navbar.php";
    ?>

    <div class="container-subir">
        <div class="card-subir">
            <h1>📁 Subir Archivos Excel</h1>
            <p>Para subir y procesar los archivos Excel del reloj checador</p>
            <a href="reloj.php" class="btn-redirect">
                Ir al Reloj 8 Horas
            </a>
        </div>
    </div>
</body>
</html>
