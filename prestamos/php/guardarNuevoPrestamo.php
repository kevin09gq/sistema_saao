<?php
require_once __DIR__ . '/../../config/config.php';

// Respuesta
function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}

if (isset($_SESSION["logged_in"])) {

    require_once __DIR__ . "/../../conexion/conexion.php";

    if (!empty($_POST["id_empleado"]) and !empty($_POST["folio"]) and !empty($_POST["monto"]) and !empty($_POST["fecha"]) and !empty($_POST["semana_inicio"]) and !empty($_POST["anio_inicio"]) and !empty($_POST["semana_fin"]) and !empty($_POST["anio_fin"]) and !empty($_POST["detalle_plan"])) {


        $id_empleado   = intval($_POST["id_empleado"]);
        $folio = trim($_POST["folio"]);
        $monto = floatval($_POST["monto"]);
        $fecha = trim($_POST["fecha"]) . " " . date("H:i:s");

        $anio = intval(date("Y", strtotime($fecha)));
        $semana = intval(date("W", strtotime($fecha)));

        // Datos del plan de pago
        $semana_inicio = intval($_POST["semana_inicio"]);
        $anio_inicio = intval($_POST["anio_inicio"]);
        $semana_fin = intval($_POST["semana_fin"]);
        $anio_fin = intval($_POST["anio_fin"]);


        // ===================================
        // Insertar un prestamo
        // ===================================

        $insertarPrestamo = $conexion->prepare("INSERT INTO prestamos (id_empleado, folio, monto, anio, semana, fecha_registro, estado) VALUES (?, ?, ?, ?, ?, ?, 'activo')");
        $insertarPrestamo->bind_param("isdiss", $id_empleado, $folio, $monto, $anio, $semana, $fecha);
        if (!$insertarPrestamo->execute()) {
            respuestas(500, "Error de ejecución", "Error al ejecutar el insert en prestamos", "error", []);
            exit;
        }
        $id_prestamo = $conexion->insert_id;
        $insertarPrestamo->close();

        
        // ===================================
        // Insertar el plan de pago
        // ===================================

        $insertarPlan = $conexion->prepare("INSERT INTO planes_pagos (id_prestamo, sem_inicio, anio_inicio, sem_fin, anio_fin, fecha_registro ) VALUES (?, ?, ?, ?, ?, ?)");
        $insertarPlan->bind_param("iiiiss", $id_prestamo, $semana_inicio, $anio_inicio, $semana_fin, $anio_fin, $fecha);
        if (!$insertarPlan->execute()) {
            respuestas(500, "Error de ejecución", "Error al ejecutar el insert en planes_pagos", "error", []);
            exit;
        }
        $id_plan = $conexion->insert_id;
        $insertarPlan->close();


        // ======================================
        // Insertar los detalles del plan de pago
        // ======================================
        if (!empty($_POST["detalle_plan"])) {
            $detalle_plan = json_encode($_POST["detalle_plan"], JSON_UNESCAPED_UNICODE);
            
            $insertarDetalle = $conexion->prepare("INSERT INTO detalle_planes (id_plan, detalle, fecha_registro) VALUES (?, ?, NOW())");
            $insertarDetalle->bind_param("is", $id_plan, $detalle_plan);
            if (!$insertarDetalle->execute()) {
                respuestas(500, "Error de ejecución", "Error al ejecutar el insert en detalle_planes", "error", []);
                exit;
            }
            $insertarDetalle->close();
        }

        respuestas(201, "Registro completado", "Se registro con exito el prestamo.", "success", []);
        exit;

    } else {
        respuestas(400, "Datos incompletos", "Debe proporcionar todos los datos requeridos", "warning", []);
        exit;
    }
} else {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
    exit;
}
