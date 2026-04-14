# Documentación de Marcajes

## Resumen
Este documento describe los casos de marcajes que el sistema identifica y cómo los procesa.

---

## Categorías de Casos

### **A. Casos con 4 marcas (ideal con comida)**

| Código | Descripción | Acción del Sistema |
|--------|-------------|-------------------|
| A-1 | **Ideal**: E1 → S1 → E2 → S2 en orden correcto | Procesa normalmente |
| A-2 | **Orden invertido en comidas**: E1 → E2 → S1 → S2 | Intercambia S1 y E2, marca `requiere_revision` |
| A-4 | **Comida muy corta** (<10 minutos) | Marca como anomalía `COMIDA ANÓMALA` |

### **B. Casos con 3 marcas (falta 1)**

| Código | Descripción | Acción del Sistema |
|--------|-------------|-------------------|
| B-5 | **Sin salida a comida**: E1 → E2 → S2 | Genera S1 automáticamente |
| B-6 | **Sin entrada de comida**: E1 → S1 → S2 | Genera E2 automáticamente |
| B-7 | **Sin salida final**: E1 → S1 → E2 | Genera S2 automáticamente |
| B-8 | **Sin entrada inicial**: S1 → E2 → S2 | Genera E1 automáticamente |
| B-XX | **3 marcas no clasificables** | Clasifica por proximidad |

### **C. Casos con 2 marcas**

| Código | Descripción | Acción del Sistema |
|--------|-------------|-------------------|
| C-10 | **Solo E1 y S2** (sin comidas) | Genera comidas automáticamente |
| C-11 | **Solo comidas** (sin E1 y S2) | Genera entrada y salida |
| C-12 | **E1 y S1** (no regresó de comer) | Genera E2 y S2 |
| C-13 | **E1 y E2** (faltan salidas) | Genera S1 y S2 |
| C-XX | **2 marcas no clasificables** | Clasifica por proximidad |

### **D. Casos con 1 marca**

| Código | Descripción | Acción del Sistema |
|--------|-------------|-------------------|
| D-15 | **Solo entrada inicial** (E1) | Genera resto de marcas |
| D-16 | **Solo salida a comida** (S1) | Genera E1, E2, S2 |
| D-17 | **Solo entrada comida** (E2) | Genera E1, S1, S2 |
| D-18 | **Solo salida final** (S2) | Genera E1, S1, E2 |
| D-XX | **Marca no clasificable** | Asigna al tipo más cercano |

### **E. Casos con 0 marcas**

| Código | Descripción | Acción del Sistema |
|--------|-------------|-------------------|
| E-19 | **Sin marcas** (olvido total o inasistencia) | Marca como `INASISTENCIA` si tiene días trabajados; genera automático si no tiene registros en el reloj |

### **F. Casos con 5+ marcas (extras)**

| Código | Descripción | Acción del Sistema |
|--------|-------------|-------------------|
| F-20 | **Marcas extras** (duplicadas o error) | Usa primera como E1, última como S2, busca mejores candidatos para comidas |

### **G. Anomalías de Horarios**

| Código | Descripción | Umbral |
|--------|-------------|--------|
| G-23 | **Jornada muy corta** | < 4 horas trabajadas |
| G-24 | **Jornada muy larga** | > 12 horas totales |
| G-25 | **Comida muy corta** | < 10 minutos |
| G-25B | **Comida muy larga** | > 2x duración esperada |

---

## Campos Nuevos en `registros_procesados`

Cada registro procesado ahora incluye:

```javascript
{
    fecha: "DD/MM/YYYY",
    tipo: "asistencia|inasistencia|vacaciones|etc",
    registros: [...],
    trabajado_minutos: Number,
    trabajado_hhmm: "HH:MM",
    trabajado_decimal: Number,
    observacion_dia: "Descripción detallada del caso",
    tipo_turno: "DIURNA|MIXTA|NOCTURNA",
    max_horas: Number,
    incidencia: "A-1|B-5|C-10|etc",  // NUEVO: Código de incidencia
    requiere_revision: Boolean        // NUEVO: Si necesita revisión manual
}
```

---

## Reglas de Generación de Horas (Actualizadas)

El sistema genera horas siguiendo reglas específicas para cada tipo de marca:

### **ENTRADA AL TRABAJO**
| Situación | Ejemplo | Acción |
|-----------|---------|--------|
| MUY TEMPRANO | 7:30 para entrada 8:00 | **GENERAR** entre 7:55-8:00 |
| DENTRO DEL RANGO (-5 a 0 min) | 7:56 para entrada 8:00 | **CONSERVAR** |
| TARDE | 8:20 para entrada 8:00 | **CONSERVAR** (conviene: no paga esos min) |

**Rango generación**: `-5` a `0` minutos de la hora oficial

---

### **SALIDA A COMIDA**
| Situación | Ejemplo | Acción |
|-----------|---------|--------|
| TEMPRANO | 12:45 para comida 13:00 | **CONSERVAR** (conviene: trabajó menos) |
| DENTRO DEL RANGO (0 a +5 min) | 13:03 para comida 13:00 | **CONSERVAR** |
| MUY TARDE (+5 min) | 13:15 para comida 13:00 | **GENERAR** entre 13:00-13:03 |

**Rango generación**: `-5` a `0` minutos de la hora oficial  
**Rango tardanza**: `0` a `+3` minutos

---

### **ENTRADA DE COMIDA (REGRESO)**
| Situación | Ejemplo | Acción |
|-----------|---------|--------|
| MUY TEMPRANO (comida < 57 min) | 13:40 para entrada 14:00 | **GENERAR** asegurando mínimo 57 min |
| DENTRO DEL RANGO (-3 a 0 min) | 13:57 para entrada 14:00 | **CONSERVAR** |
| TARDE | 14:15 para entrada 14:00 | **CONSERVAR** (conviene: no paga esos min) |

**Rango generación**: `-3` a `0` minutos de la hora oficial  
**Mínimo comida**: `57` minutos (hora oficial - 3 min)

> ⚠️ **Importante**: Si la salida a comida fue temprana, la entrada se calcula para asegurar los 57 minutos mínimos

---

### **SALIDA FINAL**
| Situación | Ejemplo | Acción |
|-----------|---------|--------|
| ANTES de la hora | 16:45 para salida 17:00 | **GENERAR** entre 17:00-17:07 |
| A LA HORA | 17:00 para salida 17:00 | **GENERAR** entre 17:00-17:07 |
| DESPUÉS | 17:30, 18:55 para salida 17:00 | **GENERAR** entre 17:00-17:07 |

**Rango generación**: `0` a `+7` minutos de la hora oficial  
> 🔒 **SIEMPRE se genera** - No se conserva el biométrico real

---

## Regla de Oro del Sistema

> **Lo que CONVIENE a la empresa → CONSERVAR el registro real**  
> **Lo que NO le conviene → GENERAR hacia el horario estándar**

### Resumen de Acciones:

| Situación | Acción | Razón |
|-----------|--------|-------|
| Llegó TARDE al trabajo | **CONSERVAR** | No paga esos minutos |
| Llegó MUY TEMPRANO | **GENERAR** | No pagar tiempo extra |
| Salió TEMPRANO a comer | **CONSERVAR** | Trabajó menos |
| Salió MUY TARDE a comer | **GENERAR** | No pagar trabajo extra |
| Regresó TARDE de comer | **CONSERVAR** | No paga esos minutos |
| Regresó MUY TEMPRANO de comer | **GENERAR** | Asegurar mínimo 57 min comida |
| Salió del trabajo (cualquier hora) | **GENERAR** | Siempre 17:00-17:07 |

---

## Constantes de Configuración

```javascript
const REGLAS_GENERACION = {
    entrada: { min: -5, max: 0 },           // -5 a 0 min antes
    salida_comida: { min: -5, max: 0 },     // -5 a 0 min antes
    salida_comida_tarde: { min: 0, max: 3 },// Si salió tarde, 0 a +3
    entrada_comida: { min: -3, max: 0 },    // -3 a 0 min antes
    salida: { min: 0, max: 7 },             // SIEMPRE 0 a +7 min después
    MINUTOS_MENOS_COMIDA: 3                 // Comida mínima = oficial - 3
};

const RANGOS_CONSERVAR = {
    entrada: { min: -5, max: Infinity },    // -5 min o más tarde
    salida_comida: { min: -Infinity, max: 5 }, // Antes o hasta +5 min
    entrada_comida: { min: -3, max: Infinity }, // -3 min o más tarde
    salida: { min: 0, max: 7 }              // NUNCA se conserva
};
```

---

## Duración de Comida Variable

| Horario Comida | Duración Oficial | Duración Mínima |
|----------------|------------------|-----------------|
| 1 hora (13:00-14:00) | 60 min | 57 min |
| 2 horas (13:00-15:00) | 120 min | 117 min |

---

## Deduplicación de Marcas

El sistema elimina marcas duplicadas/accidentales:
- **Umbral**: 15 minutos mínimo entre marcas
- **Lógica**: Si hay dos marcas a menos de 15 minutos, conserva solo la primera
- **Ejemplo**: 08:45 y 08:55 → Solo se conserva 08:45

---

## Validación de Máximo de Horas

Después de procesar las marcas, el sistema valida que no se excedan las horas máximas por turno:

| Turno | Máximo Horas | Tolerancia |
|-------|-------------|------------|
| DIURNA | 8 horas | +15 minutos |
| MIXTA | 7.5 horas | +15 minutos |
| NOCTURNA | 7 horas | +15 minutos |

Si se excede, la salida final se ajusta para cumplir con el límite.

---

## Archivos Modificados

1. **process_excel.js** - Procesamiento principal
2. **llenar_modal.js** - Modal de detalles del empleado
3. **horarios_variable.js** - Horarios variables de producción

Todos los archivos incluyen:
- `clasificarIncidenciaMarcajes()` - Clasifica el tipo de incidencia
- `validarHorariosAnomalos()` - Detecta anomalías de horario
