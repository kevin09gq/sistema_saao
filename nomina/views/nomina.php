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
            <div class="col-12 mb-2">
                <label for="archivo_excel" class="form-label mb-0 fw-semibold text-success">
                    <i class="bi bi-file-earmark-excel-fill fs-3"></i> Subir archivo Excel:
                </label>
                <input type="file" class="form-control border-success mt-1" id="archivo_excel" name="archivo_excel" accept=".xls,.xlsx" required>
            </div>
            <div class="col-12 mb-2">
                <label for="archivo_excel2" class="form-label mb-0 fw-semibold text-primary">
                    <i class="bi bi-file-earmark-excel-fill fs-3"></i> Subir otro archivo Excel:
                </label>
                <input type="file" class="form-control border-primary mt-1" id="archivo_excel2" name="archivo_excel2" accept=".xls,.xlsx" required>
            </div>
            <div class="col-12">
                <button type="button" class="btn btn-warning px-4 shadow" id="btn_procesar_ambos">
                    <i class="bi bi-arrow-repeat me-1"></i> Procesar ambos Excels
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