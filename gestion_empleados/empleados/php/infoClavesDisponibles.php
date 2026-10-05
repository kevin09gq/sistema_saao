<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerClaves':
        obtenerClaves($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER TODAS LAS CLAVES Y SU DISPONIBILIDAD
// POR EMPRESA (1 CLAVE ÚNICA POR EMPRESA)
//===========================================================

function obtenerClaves(mysqli $conexion)
{
    // 1. Obtener todas las empresas del sistema
    $sqlEmpresas = "SELECT id_empresa, nombre_empresa 
                    FROM empresa 
                    ORDER BY nombre_empresa ASC";

    $resEmpresas = mysqli_query($conexion, $sqlEmpresas);

    if (!$resEmpresas) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar las empresas: " . mysqli_error($conexion)
        ]);
        return;
    }

    $empresasCatalogo = [];
    while ($emp = mysqli_fetch_assoc($resEmpresas)) {
        $empresasCatalogo[] = [
            'id_empresa' => (int) $emp['id_empresa'],
            'nombre_empresa' => trim($emp['nombre_empresa'])
        ];
    }

    // 2. Obtener todos los empleados que tienen una clave asignada
    $sqlEmpleados = "SELECT 
                        e.id_empleado,
                        e.clave_empleado,
                        e.nombre,
                        e.ap_paterno,
                        e.ap_materno,
                        e.id_empresa,
                        COALESCE(emp.nombre_empresa, 'Sin empresa') AS nombre_empresa
                    FROM info_empleados e
                    LEFT JOIN empresa emp ON emp.id_empresa = e.id_empresa
                    WHERE e.clave_empleado IS NOT NULL 
                      AND e.clave_empleado != ''
                    ORDER BY 
                        e.clave_empleado ASC,
                        emp.nombre_empresa ASC";

    $resEmpleados = mysqli_query($conexion, $sqlEmpleados);

    if (!$resEmpleados) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar los empleados con clave: " . mysqli_error($conexion)
        ]);
        return;
    }

    $clavesAgrupadas = [];

    while ($fila = mysqli_fetch_assoc($resEmpleados)) {

        $numClave = trim((string) $fila['clave_empleado']);

        if (!isset($clavesAgrupadas[$numClave])) {
            $clavesAgrupadas[$numClave] = [
                'clave' => $numClave,
                'ocupantes' => []
            ];
        }

        $nombreCompleto = trim(
            $fila['nombre'] . ' ' . 
            $fila['ap_paterno'] . ' ' . 
            ($fila['ap_materno'] ?? '')
        );

        $idEmpresa = !empty($fila['id_empresa']) ? (int)$fila['id_empresa'] : 0;

        $clavesAgrupadas[$numClave]['ocupantes'][] = [
            'id_empleado' => (int) $fila['id_empleado'],
            'clave' => $numClave,
            'nombre_completo' => $nombreCompleto,
            'id_empresa' => $idEmpresa,
            'nombre_empresa' => $fila['nombre_empresa']
        ];
    }

    $listaFinal = [];

    // Calcular empresas ocupadas y disponibles para cada clave
    foreach ($clavesAgrupadas as $num => $datos) {

        $idsEmpresasOcupadas = array_map(function ($ocupante) {
            return $ocupante['id_empresa'];
        }, $datos['ocupantes']);

        $empresasDisponibles = [];
        foreach ($empresasCatalogo as $emp) {
            if (!in_array($emp['id_empresa'], $idsEmpresasOcupadas)) {
                $empresasDisponibles[] = $emp;
            }
        }

        $datos['empresas_disponibles'] = $empresasDisponibles;
        $datos['total_ocupadas'] = count($datos['ocupantes']);
        $datos['total_disponibles'] = count($empresasDisponibles);

        $listaFinal[] = $datos;
    }

    // Ordenamiento natural (alfanumérico y numérico por clave)
    usort($listaFinal, function ($a, $b) {
        return strnatcasecmp($a['clave'], $b['clave']);
    });

    echo json_encode([
        "success" => true,
        "empresas" => $empresasCatalogo,
        "claves" => $listaFinal,
        "total_claves" => count($listaFinal)
    ]);
}
