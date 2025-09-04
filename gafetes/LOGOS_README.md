# Sistema de Logos Dinámicos para Gafetes

## Descripción
Este sistema reemplaza automáticamente los logos estáticos (`img/logo.jpg` e `img/logo2.png`) con los logos correspondientes al área y empresa de cada empleado al generar gafetes.

## Cómo Funciona

### 🔄 Reemplazo Automático
Cuando subes nuevos logos:
1. **Los logos estáticos ya NO se usan**
2. **El sistema usa automáticamente el logo del área** (si existe)
3. **El sistema usa automáticamente el logo de la empresa** (si existe)
4. **Si no hay logo específico, NO se muestra ningún logo** (sin fallback)

### 🎯 Ejemplo:
- Empleado trabaja en **"Rancho El Pilar"** → Se usará el logo de esa área
- Empleado trabaja en empresa **"Cítricos SAAO"** → Se usará el logo de esa empresa
- **Los logos aparecen automáticamente** en los gafetes sin hacer nada más

## Características Principales

### 1. Modal de Actualización de Logos
- **Botón**: "Actualizar Logos" ubicado al lado del botón "Subir Fotos"
- **Funcionalidad**: 
  - Muestra las empresas y áreas existentes
  - Permite subir nuevos logos para cada empresa y área
  - Vista previa de logos existentes
  - Actualización múltiple de logos

### 2. Almacenamiento de Archivos
- **Carpetas**:
  - `gafetes/logos_empresa/` - Para logos de empresas
  - `gafetes/logos_area/` - Para logos de áreas
- **Base de Datos**:
  - Campo `logo_empresa` en tabla `empresa`
  - Campo `logo_area` en tabla `areas`

### 3. Integración con Gafetes
- Los gafetes ahora muestran los logos correspondientes:
  - Logo del área en la esquina superior izquierda
  - Logo de la empresa en la esquina superior derecha
- Fallback a logos por defecto si no hay logo específico

### 4. Limpieza Automática
- Botón "Limpiar Logos" para eliminar archivos huérfanos
- Identifica y elimina logos que no están asociados a ningún registro

## Archivos Creados/Modificados

### Archivos JavaScript
1. `js/actualizarLogos.js` - Manejo del modal y funcionalidad de actualización
2. `js/gafetesConLogos.js` - Extensión para generar gafetes con logos dinámicos

### Archivos PHP
1. `php/actualizar_logo.php` - Subida y actualización de logos
2. `php/obtener_logos.php` - Obtención de logos existentes
3. `php/obtenerEmpleadosConLogos.php` - Empleados con información de logos
4. `php/obtenerDatosCompletos.php` - Datos completos para gafetes
5. `php/limpiar_logos_huerfanos.php` - Limpieza de archivos huérfanos

### Archivos CSS
1. `css/actualizar-logos.css` - Estilos para el modal de logos
2. `css/logos-gafetes.css` - Estilos específicos para logos en gafetes

### Archivos Modificados
1. `index.php` - Agregado modal y referencias a nuevos archivos
2. `public/php/obtenerEmpresa.php` - Actualizado para incluir logos
3. `public/php/obtenerAreas.php` - Actualizado para incluir logos

## Estructura de la Base de Datos

### Tabla `empresa`
```sql
ALTER TABLE empresa ADD COLUMN logo_empresa VARCHAR(255) AFTER nombre_empresa;
```

### Tabla `areas`
```sql
ALTER TABLE areas ADD COLUMN logo_area VARCHAR(255) AFTER nombre_area;
```

## Flujo de Trabajo

### Para Actualizar Logos:
1. Hacer clic en "Actualizar Logos"
2. Seleccionar archivo de logo para empresa/área deseada
3. Vista previa automática
4. Hacer clic en "Actualizar Logos" para guardar cambios

### ✨ Para Generar Gafetes (AUTOMÁTICO):
1. Seleccionar empleados normalmente
2. Hacer clic en "Generar Gafetes" como siempre
3. **🎆 ¡Los logos aparecen automáticamente!**
   - Logo del área del empleado (esquina izquierda)
   - Logo de la empresa del empleado (esquina derecha)
4. **NO necesitas hacer nada especial** - funciona automáticamente

### Para Limpiar Logos Huérfanos:
1. Abrir modal "Actualizar Logos"
2. Hacer clic en "Limpiar Logos"
3. Confirmar la acción
4. El sistema elimina archivos no utilizados

## Validaciones y Seguridad

### Validaciones de Archivo:
- Solo imágenes (JPG, PNG, GIF, WebP)
- Tamaño máximo: 5MB
- Nombres únicos con timestamp

### Manejo de Errores:
- Validación de tipos MIME
- Verificación de permisos de escritura
- Rollback en caso de errores en base de datos
- Logs de errores detallados

## Compatibilidad
- Compatible con el sistema existente
- Fallback eliminado: si no hay logos específicos, no se muestran logos
- No interfiere con funcionalidades existentes
- Responsive design para diferentes dispositivos

## Consideraciones de Mantenimiento
- Los logos se almacenan localmente en el servidor
- Backup regular de las carpetas de logos recomendado
- Limpieza periódica de archivos huérfanos
- Monitoreo del espacio en disco utilizado por los logos