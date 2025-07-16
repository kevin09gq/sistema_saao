<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>

    <div class="mb-4">
        <form id="form_excel" enctype="multipart/form-data" class="row g-2 align-items-center bg-light p-3 rounded shadow-sm">
            <div class="col-auto">
                <label for="archivo_excel" class="form-label mb-0 fw-semibold text-success">
                    <i class="bi bi-file-earmark-excel-fill fs-3"></i> Subir archivo Excel:
                </label>
            </div>
            <div class="col">
                <!-- Input para seleccionar el archivo Excel -->
                <input type="file" class="form-control border-success" id="archivo_excel" name="archivo_excel" accept=".xls,.xlsx" required>
            </div>
            <div class="col-auto">
                <!-- Botón para cargar el archivo, NO hace submit tradicional -->
                <button type="button" class="btn btn-success px-4 shadow" id="btn_cargar_excel">
                    <i class="bi bi-upload me-1"></i> Cargar Excel
                </button>
            </div>
        </form>
    </div>

    <!-- NUEVO FORMULARIO PARA OTRO EXCEL -->
    <div class="mb-4">
        <form id="form_excel2" enctype="multipart/form-data" class="row g-2 align-items-center bg-light p-3 rounded shadow-sm">
            <div class="col-auto">
                <label for="archivo_excel2" class="form-label mb-0 fw-semibold text-primary">
                    <i class="bi bi-file-earmark-excel-fill fs-3"></i> Subir otro archivo Excel:
                </label>
            </div>
            <div class="col">
                <!-- Input para seleccionar el segundo archivo Excel -->
                <input type="file" class="form-control border-primary" id="archivo_excel2" name="archivo_excel2" accept=".xls,.xlsx" required>
            </div>
            <div class="col-auto">
                <!-- Botón para cargar el segundo archivo -->
                <button type="button" class="btn btn-primary px-4 shadow" id="btn_cargar_excel2">
                    <i class="bi bi-upload me-1"></i> Cargar Excel 2
                </button>
            </div>
        </form>
    </div>


     <!-- jQuery CDN -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
     <!-- Bootstrap JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!--JS Personalizado-->
    <script src="../js/leer_excel.js"></script>
</body>

</html>