<?php
// contratos/php/obtener_empleados.php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

// En Contratos solo duplicamos la funcionalidad que se consume desde generar.js
// Soporta: accion=cargarEmpleados (GET) y accion=dataEmpleado (POST)

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        case 'cargarEmpleados':
            cargarEmpleadosContratos($conexion);
            break;
        case 'dataEmpleado':
            if (isset($_POST['id_empleado']) && isset($_POST['clave_empleado'])) {
                $idEmpleado = (int)$_POST['id_empleado'];
                $clave = $_POST['clave_empleado'];
                dataEmpleadoContratos($conexion, $idEmpleado, $clave);
            } else {
                echo json_encode([]);
            }
            break;
        default:
            echo json_encode([]);
    }
} else {
    echo json_encode([]);
}

function cargarEmpleadosContratos(mysqli $conexion)
{
    $sql = $conexion->prepare("SELECT 
        e.id_empleado, 
        e.clave_empleado, 
        e.nombre, 
        e.ap_paterno, 
        e.ap_materno, 
        e.imss,
        e.status_nss,
        s.id_status, 
        s.nombre_status, 
        d.id_departamento, 
        d.nombre_departamento
        FROM info_empleados e
        LEFT JOIN status s ON e.id_status = s.id_status
        LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
        ORDER BY e.nombre ASC");
    $sql->execute();
    $resultado = $sql->get_result();
    $empleados = [];
    while ($row = $resultado->fetch_assoc()) {
        $empleados[] = [
            'id_empleado' => $row['id_empleado'],
            'clave_empleado' => $row['clave_empleado'],
            'nombre' => $row['nombre'],
            'ap_paterno' => $row['ap_paterno'],
            'ap_materno' => $row['ap_materno'],
            'imss' => $row['imss'],
            'status_nss' => $row['status_nss'],
            'id_status' => $row['id_status'],
            'nombre_status' => $row['nombre_status'],
            'id_departamento' => $row['id_departamento'],
            'nombre_departamento' => $row['nombre_departamento']
        ];
    }
    echo json_encode($empleados, JSON_UNESCAPED_UNICODE);
}

function dataEmpleadoContratos(mysqli $conexion, int $idEmpleado, string $idClave)
{
    $sql = $conexion->prepare("SELECT 
        e.nombre AS nombre_empleado,
        e.ap_paterno AS apellido_paterno_empleado,
        e.ap_materno AS apellido_materno_empleado,
        e.domicilio AS domicilio_empleado,
        e.imss,
        e.curp,
        e.sexo,
        e.grupo_sanguineo,
        e.enfermedades_alergias,
        e.fecha_ingreso,
        e.fecha_nacimiento,
        (SELECT GROUP_CONCAT(c.num_casillero SEPARATOR ', ') FROM empleado_casillero ec INNER JOIN 
         casilleros c ON ec.num_casillero = c.num_casillero WHERE ec.id_empleado = e.id_empleado) AS num_casillero,
        e.ruta_foto,
        e.salario_semanal,
        e.salario_mensual,
        e.biometrico,
        e.telefono_empleado,
        e.status_nss,
        e.rfc_empleado,
        e.estado_civil,
        d.id_departamento AS id_departamento,
        d.nombre_departamento AS departamento,
        emp.id_empresa AS id_empresa,
        emp.nombre_empresa AS nombre_empresa,
        emp.rfc_empresa AS rfc_empresa,
        emp.domicilio_fiscal AS domicilio_fiscal,
        a.id_area AS id_area,
        a.nombre_area AS nombre_area,
        p.id_puestoEspecial AS id_puesto,
        p.nombre_puesto AS nombre_puesto,
        p.direccion_puesto AS direccion_puesto,
        cont.nombre AS nombre_contacto,
        cont.ap_paterno AS apellido_paterno_contacto,
        cont.ap_materno AS apellido_materno_contacto,
        cont.telefono AS telefono_contacto,
        cont.domicilio AS domicilio_contacto,
        ec.parentesco,
        (
            SELECT hr.fecha_reingreso
            FROM historial_reingresos hr
            WHERE hr.id_empleado = e.id_empleado
            ORDER BY hr.fecha_reingreso DESC
            LIMIT 1
        ) AS ultima_fecha_reingreso
    FROM info_empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
    LEFT JOIN empresa emp ON e.id_empresa = emp.id_empresa
    LEFT JOIN areas a ON e.id_area = a.id_area
    LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
    LEFT JOIN empleado_contacto ec ON e.id_empleado = ec.id_empleado
    LEFT JOIN contacto_emergencia cont ON ec.id_contacto = cont.id_contacto 
    WHERE e.id_empleado = ? AND e.clave_empleado = ?
    LIMIT 1");

    $sql->bind_param("is", $idEmpleado, $idClave);
    $sql->execute();
    $resultado = $sql->get_result();
    $empleado = [];
    if ($resultado->num_rows > 0) {
        $row = $resultado->fetch_assoc();
        $empleado = [
            'nombre_empleado' => $row['nombre_empleado'],
            'apellido_paterno_empleado' => $row['apellido_paterno_empleado'],
            'apellido_materno_empleado' => $row['apellido_materno_empleado'],
            'domicilio_empleado' => $row['domicilio_empleado'],
            'imss' => $row['imss'],
            'curp' => $row['curp'],
            'sexo' => $row['sexo'],
            'grupo_sanguineo' => $row['grupo_sanguineo'],
            'enfermedades_alergias' => $row['enfermedades_alergias'],
            'fecha_ingreso' => $row['fecha_ingreso'],
            'fecha_nacimiento' => $row['fecha_nacimiento'],
            'num_casillero' => $row['num_casillero'],
            'ruta_foto' => $row['ruta_foto'],
            'salario_semanal' => $row['salario_semanal'],
            'salario_mensual' => $row['salario_mensual'],
            'biometrico' => $row['biometrico'],
            'telefono_empleado' => $row['telefono_empleado'],
            'status_nss' => $row['status_nss'],
            'rfc_empleado' => $row['rfc_empleado'],
            'estado_civil' => $row['estado_civil'],
            'id_departamento' => $row['id_departamento'],
            'departamento' => $row['departamento'],
            'id_empresa' => $row['id_empresa'],
            'nombre_empresa' => $row['nombre_empresa'],
            'rfc_empresa' => $row['rfc_empresa'],
            'domicilio_fiscal' => $row['domicilio_fiscal'],
            'id_area' => $row['id_area'],
            'nombre_area' => $row['nombre_area'],
            'id_puesto' => $row['id_puesto'],
            'nombre_puesto' => $row['nombre_puesto'],
            'direccion_puesto' => $row['direccion_puesto'],
            'nombre_contacto' => $row['nombre_contacto'],
            'apellido_paterno_contacto' => $row['apellido_paterno_contacto'],
            'apellido_materno_contacto' => $row['apellido_materno_contacto'],
            'telefono_contacto' => $row['telefono_contacto'],
            'domicilio_contacto' => $row['domicilio_contacto'],
            'parentesco' => $row['parentesco'],
            'ultima_fecha_reingreso' => $row['ultima_fecha_reingreso']
        ];

        // Historial completo de reingresos
        $historial = [];
        $stmtHist = $conexion->prepare("SELECT id_historial, fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = ? ORDER BY fecha_reingreso ASC, id_historial ASC");
        $stmtHist->bind_param("i", $idEmpleado);
        $stmtHist->execute();
        $resHist = $stmtHist->get_result();
        while ($rowH = $resHist->fetch_assoc()) {
            $historial[] = [
                'id_historial' => (int)$rowH['id_historial'],
                'fecha_reingreso' => $rowH['fecha_reingreso'],
                'fecha_salida' => $rowH['fecha_salida']
            ];
        }
        $stmtHist->close();
        $empleado['historial'] = $historial;

        // Beneficiarios
        $beneficiarios = [];
        $stmtBenef = $conexion->prepare("SELECT 
            b.id_beneficiario,
            b.nombre AS nombre_beneficiario,
            b.ap_paterno AS apellido_paterno_beneficiario,
            b.ap_materno AS apellido_materno_beneficiario,
            eb.parentesco,
            eb.porcentaje
        FROM empleado_beneficiario eb
        INNER JOIN beneficiarios b ON eb.id_beneficiario = b.id_beneficiario
        WHERE eb.id_empleado = ?");
        $stmtBenef->bind_param("i", $idEmpleado);
        $stmtBenef->execute();
        $resBenef = $stmtBenef->get_result();
        while ($rowB = $resBenef->fetch_assoc()) {
            $beneficiarios[] = [
                'id_beneficiario' => (int)$rowB['id_beneficiario'],
                'nombre_beneficiario' => $rowB['nombre_beneficiario'],
                'apellido_paterno_beneficiario' => $rowB['apellido_paterno_beneficiario'],
                'apellido_materno_beneficiario' => $rowB['apellido_materno_beneficiario'],
                'parentesco' => $rowB['parentesco'],
                'porcentaje' => (float)$rowB['porcentaje']
            ];
        }
        $stmtBenef->close();
        $empleado['beneficiarios'] = $beneficiarios;
    }

    echo json_encode($empleado, JSON_UNESCAPED_UNICODE);
}
