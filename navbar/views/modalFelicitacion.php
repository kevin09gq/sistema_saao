<!-- ==========================================================================
     MODAL DE TARJETA CONMEMORATIVA DE ANIVERSARIO
     Cítricos SAAO - Estilo institucional idéntico al modal de empleados
     ========================================================================== -->
<div class="modal fade" id="modalFelicitacionAniversario" tabindex="-1"
     aria-labelledby="felicitacionModalLabel" aria-hidden="true" style="z-index: 1065;">
    <div class="modal-dialog modal-dialog-centered modal-xl felicitacion-dialog">
        <div class="modal-content border-0 shadow">

            <!-- Canvas de confeti para lluvia festiva -->
            <canvas id="confettiCanvas"></canvas>

            <!-- Toast de confirmación de copiado / descarga -->
            <div id="felicitacionToast" class="felicitacion-toast">
                <i class="bi bi-check-circle-fill"></i>
                <span id="felicitacionToastText">¡Operación exitosa!</span>
            </div>

            <!-- Cabecera del modal: Estilo gestión empleados -->
            <div class="modal-header flex-shrink-0">
                <h5 class="modal-title d-flex align-items-center gap-2 m-0" id="felicitacionModalLabel">
                    <i class="bi bi-award-fill text-success fs-5"></i>
                    <span class="fw-bold text-dark">Tarjeta Conmemorativa de Aniversario</span>
                    <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill fs-7 fw-semibold ms-1" id="modalAnivBadge">Aniversario</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <!-- Cuerpo del modal -->
            <div class="modal-body felicitacion-body">

                <!-- Barra de herramientas: En un solo renglón sin saltos -->
                <div class="felicitacion-palette-bar">
                    <div class="felicitacion-palette-row">
                        <span class="felicitacion-palette-label">
                            <i class="bi bi-palette-fill me-1 text-success"></i> Fondo:
                        </span>

                        <!-- Muestras de Fondo: Clásicos de Gala y Tonos Suaves para Señoras y Señores -->
                        <button type="button" class="felicitacion-swatch active" data-tema="esmeralda" title="🌿 Esmeralda & Oro" style="background: linear-gradient(135deg, #10b981, #064e3b);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="gala" title="✨ Noche de Gala" style="background: linear-gradient(135deg, #1e3a8a, #030712);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="citrus" title="🍊 Cálido Citrus" style="background: linear-gradient(135deg, #f97316, #451a03);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="rubi" title="🍷 Rubí & Oro Rosa" style="background: linear-gradient(135deg, #fb7185, #4c0519);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="obsidiana" title="👑 Obsidiana 24K" style="background: linear-gradient(135deg, #ffd700, #000000);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="rosanacar" title="🌸 Rosa Nácar & Oro Rosa (Suave)" style="background: linear-gradient(135deg, #f4b6c2, #5a3543);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="salvia" title="🌿 Salvia Suave & Perla" style="background: linear-gradient(135deg, #a7d4bc, #2a483b);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="champagne" title="🥂 Champaña & Marfil Suave" style="background: linear-gradient(135deg, #e8cf99, #4a3e2c);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="azul_sereno" title="🌫️ Azul Sereno & Platino" style="background: linear-gradient(135deg, #93c5fd, #2b3e52);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="lavanda" title="🪻 Lavanda Seda Suave" style="background: linear-gradient(135deg, #d8b4fe, #423052);"></button>
                        <button type="button" class="felicitacion-swatch" data-tema="moca" title="🌰 Moca & Almendra Cálido" style="background: linear-gradient(135deg, #d4b297, #47372d);"></button>

                        <!-- Paneles de color de fondo (Centro + Contraste) comentados temporalmente:
                        <div class="felicitacion-swatch-divider"></div>

                        <div class="felicitacion-custom-colors" id="grupoColoresPersonalizados">
                            <label class="felicitacion-color-panel" id="labelColorCentral" title="Color del centro del degradado">
                                <input type="color" id="inputColorCentral" value="#10b981">
                                <span class="felicitacion-color-panel-dot" id="previewColorCentral" style="background:#10b981;"></span>
                                <span class="felicitacion-color-panel-txt">Centro</span>
                            </label>

                            <div class="felicitacion-color-gradient-preview" id="previewGradiente"
                                 style="background: linear-gradient(to right, #10b981, #064e3b);"></div>

                            <label class="felicitacion-color-panel" id="labelColorContraste" title="Color de contraste (esquinas / oscuro)">
                                <span class="felicitacion-color-panel-txt">Contraste</span>
                                <span class="felicitacion-color-panel-dot" id="previewColorContraste" style="background:#064e3b;"></span>
                                <input type="color" id="inputColorContraste" value="#064e3b">
                            </label>
                        </div>
                        -->

                        <!-- Divisor sutil -->
                       <!-- <div class="felicitacion-swatch-divider"></div>-->

                        <!-- Paleta de Letras: Selector directo de color -->
                       <!-- <div class="felicitacion-custom-colors" id="grupoColoresTexto">
                            <label class="felicitacion-color-panel" id="labelColorTexto" title="Color de las palabras / letras">
                                <input type="color" id="inputColorTexto" value="#ffffff">
                                <span class="felicitacion-color-panel-dot" id="previewColorTexto" style="background:#ffffff;"></span>
                                <span class="felicitacion-color-panel-txt">Letras</span>
                            </label>
                        </div>-->

                        <!-- Divisor sutil -->
                        <div class="felicitacion-swatch-divider"></div>

                        <!-- Botón de nueva frase con IA -->
                        <button type="button" class="felicitacion-btn-frase" id="btnCambiarFraseIA"
                                title="Generar una redacción totalmente nueva al instante">
                            <i class="bi bi-stars text-warning"></i>
                            <span>Nueva Frase</span>
                        </button>
                    </div>
                </div>

                <!-- Contenedor del Canvas de 1080x1080 -->
                <div class="felicitacion-canvas-wrap">
                    <canvas id="canvasFelicitacion" width="1080" height="1080"></canvas>
                </div>
            </div>

            <!-- Pie del Modal: Estilo gestión empleados -->
            <div class="modal-footer bg-light flex-shrink-0 d-flex justify-content-between align-items-center">
                <span class="text-muted small d-none d-md-inline-flex align-items-center">
                    <i class="bi bi-info-circle text-success me-1"></i>
                    Formato cuadrado 1080x1080 px 
                </span>
                <div class="d-flex align-items-center gap-2 ms-auto">
                    <button type="button" class="btn btn-secondary px-3" data-bs-dismiss="modal">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-outline-success px-3" id="btnCopiarTarjeta"
                            title="Copiar imagen al portapapeles">
                        <i class="bi bi-clipboard-check me-1"></i> Copiar
                    </button>
                    <button type="button" class="btn btn-success px-4 fw-semibold" id="btnDescargarTarjeta"
                            title="Descargar imagen en PNG de alta resolución">
                        <i class="bi bi-download me-1"></i> Descargar PNG
                    </button>
                </div>
            </div>

        </div>
    </div>
</div>
