<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

// Respuesta
function respuestas(int $code, array $data, String $mensaje, String $titulo, String $icono)
{
    http_response_code($code);
    echo json_encode([
        "data"    => $data,
        "mensaje" => $mensaje,
        "titulo"  => $titulo,
        "icono"   => $icono
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verificar sesión
if (!isset($_SESSION["logged_in"])) {
    respuestas(401, [], "Debes primero iniciar sesión", "Sesión no válida", "error");
}

// ==============================
// CONSULTA SQL
// ==============================
$sqlDatos = "SELECT
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.id_empresa,
                e.status_nss,
                e.salario_diario,

                -- Fecha ingreso real considerando reingresos
                CASE 
                    WHEN MAX(hr.fecha_reingreso) IS NOT NULL 
                        THEN MAX(hr.fecha_reingreso)
                    ELSE e.fecha_ingreso
                END AS fecha_ingreso_real,

                d.nombre_departamento,
                d.id_departamento,

                e.id_puestoEspecial AS id_puesto,
                p.nombre_puesto,

                e.id_area

            FROM info_empleados e

            LEFT JOIN departamentos d 
                ON e.id_departamento = d.id_departamento

            LEFT JOIN puestos_especiales p
                ON e.id_puestoEspecial = p.id_puestoEspecial

            LEFT JOIN historial_reingresos hr 
                ON e.id_empleado = hr.id_empleado

            WHERE e.id_status = 1

            GROUP BY e.id_empleado

            ORDER BY e.nombre ASC";

$stmtDatos = $conexion->prepare($sqlDatos);

if (!$stmtDatos) {
    respuestas(500, [], "Error en la consulta SQL", "Error", "error");
}

$stmtDatos->execute();
$resultDatos = $stmtDatos->get_result();

// ==============================
// ARMAR ESTRUCTURA
// ==============================
$data = [];

while ($row = $resultDatos->fetch_assoc()) {

    $empleado = [
        "id_empleado"        => (int)$row["id_empleado"],
        "clave_empleado"     => $row["clave_empleado"],
        "nombre"             => $row["nombre"],
        "ap_paterno"         => $row["ap_paterno"],
        "ap_materno"         => $row["ap_materno"],
        "id_empresa"         => (int)$row["id_empresa"],
        "status_nss"         => (int)$row["status_nss"],
        "salario_diario"     => $row["salario_diario"],

        "fecha_ingreso_real" => $row["fecha_ingreso_real"],
        // Por defecto es null, se obtiene luego
        "fecha_ingreso_imss" => null,

        "nombre_departamento"=> $row["nombre_departamento"],
        "id_departamento"    => (int)$row["id_departamento"],
        "nombre_puesto"      => $row["nombre_puesto"],
        "id_puesto"          => (int)$row["id_puesto"],
        "id_area"            => (int)$row["id_area"],

        // Conceptos inicializados en 0
        "isr" => 0,
        "tarjeta" => 0,

        // Dias trabajados total
        "tmp_dias_trabajados" => 0,
        // Inicializaciones para calcular luego
        "total_ausencias"   => null,
        // Por defecto es 0, será la resta de tmp_dias_trabajados - total_ausencias
        "dias_trabajados"   => 0,
        // Por defecto es 0, se calcula luego con dias_trabajados/30.4
        "meses_trabajados"  => 0,
        // Por defecto es null, se calcula luego
        "aguinaldo"         => null,
        // Neto = aguinaldo - isr - tarjeta, por defecto es 0
        "neto_pagar"        => 0,

        // Por defecto se usa la fecha real, si es 0 entonces usa la fecha de ingreso del IMSS
        "usar_fecha_real" => 1,
        // Por defecto no se usan las ausencias, si es 1 entonces se toman en cuenta para el cálculo
        "usar_ausencias"  => 0,
        // Por defecto es null, la define el usuario
        "fecha_pago"      => null
    ];

    $data[] = $empleado;
}

// Forma de validar si usar o no las configuraciones
$nuevo = [
    "configuraciones" => 0,
];

array_unshift($data, $nuevo);

// ==============================
// RESPUESTA FINAL
// ==============================
respuestas(200, $data, "Consulta exitosa", "success", "success");