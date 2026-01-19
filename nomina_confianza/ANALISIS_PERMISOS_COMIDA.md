# Sistema de Análisis Automático de Permisos y Comidas

## Descripción General

Este sistema analiza automáticamente los registros del biométrico y determina qué ausencias corresponden a **comida** y cuáles a **permisos**, basándose en el horario oficial del empleado y la duración de las ausencias.

## Características Principales

### 1. Flexibilidad en el Horario de Comida
- La empresa permite que la comida sea flexible en cuanto a la hora de inicio
- Lo importante es que se respete la **duración total** establecida en el horario oficial
- **Ejemplo**: Si el horario oficial es 13:00-14:00 (1 hora):
  - ✅ Válido: 13:30-14:30 (1 hora)
  - ✅ Válido: 14:00-15:00 (1 hora)
  - ❌ Excede: 13:30-15:00 (1.5 horas)

### 2. Detección Automática
El sistema identifica automáticamente:
- **Entrada (E)**: Primera entrada del día
- **Salida a comida (SC)**: Salida cerca del horario de comida oficial
- **Regreso de comida (RC)**: Regreso después de la comida
- **Salida por permiso (SP)**: Salida fuera del horario de comida
- **Regreso de permiso (RP)**: Regreso de un permiso
- **Salida final (SF)**: Salida al terminar la jornada

## Escenarios Cubiertos

### 1. Permiso antes de la comida
**Secuencia**: E → SP → RP → SC → RC → SF

**Ejemplo**:
```
09:00 - Entrada
10:30 - Salida por permiso (doctor)
11:00 - Regreso de permiso
13:00 - Salida a comida
14:00 - Regreso de comida
18:00 - Salida final
```

### 2. Permiso después de la comida
**Secuencia**: E → SC → RC → SP → RP → SF

**Ejemplo**:
```
09:00 - Entrada
13:00 - Salida a comida
14:00 - Regreso de comida
15:30 - Salida por permiso (banco)
16:00 - Regreso de permiso
18:00 - Salida final
```

### 3. Permiso que cruza la comida
**Secuencia**: E → SP → RP → SF

**Ejemplo**:
```
09:00 - Entrada
12:00 - Salida por permiso (incluye hora de comida)
15:00 - Regreso de permiso
18:00 - Salida final
```
*Nota: El permiso cubre la hora de comida*

### 4. Permiso antes y comida dentro del permiso
**Secuencia**: E → SP → SC → RC → RP → SF

**Ejemplo**:
```
09:00 - Entrada
11:00 - Salida por permiso
13:00 - Salida a comida (durante el permiso)
14:00 - Regreso de comida
15:00 - Regreso de permiso
18:00 - Salida final
```

### 5. Permiso largo que incluye comida
**Secuencia**: E → SP → RP → SF

**Ejemplo**:
```
09:00 - Entrada
10:00 - Salida por permiso largo
16:00 - Regreso de permiso
18:00 - Salida final
```

### 6. Sale a permiso y ya no regresa
**Secuencia**: E → SP

**Ejemplo**:
```
09:00 - Entrada
15:00 - Salida por permiso (no regresa)
```
*Advertencia: Ausencia no justificada*

### 7. Sale a permiso después de la comida y no regresa
**Secuencia**: E → SC → RC → SP

**Ejemplo**:
```
09:00 - Entrada
13:00 - Salida a comida
14:00 - Regreso de comida
16:00 - Salida por permiso (no regresa)
```

### 8. Sale a comer y no regresa
**Secuencia**: E → SC

**Ejemplo**:
```
09:00 - Entrada
13:00 - Salida a comida (no regresa)
```
*Advertencia: Ausencia injustificada*

### 9. Regresa del permiso pero no checa salida
**Secuencia**: E → SC → RC → SP → RP

**Ejemplo**:
```
09:00 - Entrada
13:00 - Salida a comida
14:00 - Regreso de comida
16:00 - Salida por permiso
17:00 - Regreso de permiso (no checa salida final)
```
*Advertencia: Olvido de checador*

### 10. Permiso antes de comida y no regresa después
**Secuencia**: E → SP → RP → SC

**Ejemplo**:
```
09:00 - Entrada
10:00 - Salida por permiso
11:00 - Regreso de permiso
13:00 - Salida a comida (no regresa)
```

## Algoritmo de Detección

### Paso 1: Identificar eventos
El sistema ordena todos los registros de entrada/salida del día cronológicamente.

### Paso 2: Calcular duraciones
Para cada par de salida-entrada, se calcula:
- Duración de la ausencia
- Hora central de la ausencia
- Distancia temporal respecto al horario de comida oficial

### Paso 3: Clasificar como comida o permiso
Se considera **COMIDA** si:
- La hora central está cerca del horario de comida oficial (±90 minutos)
- La duración es similar a la duración oficial de comida (±tolerancia)

Se considera **PERMISO** si:
- No cumple los criterios de comida
- Ocurre fuera del rango de comida

### Paso 4: Validar flexibilidad
Para la comida, se valida:
- ✅ Duración dentro del rango permitido
- ⚠️ Excede el tiempo oficial (se marca como advertencia)

## Datos Almacenados

Para cada día analizado se guarda:

```javascript
{
    fecha: "15/12/2025",
    dia: "Viernes",
    eventos: [
        {tipo: 'entrada', hora: '09:00', minutos: 540},
        {tipo: 'salida', hora: '13:00', minutos: 780},
        {tipo: 'entrada', hora: '14:00', minutos: 840},
        {tipo: 'salida', hora: '18:00', minutos: 1080}
    ],
    interpretacion: [
        {hora: '09:00', tipo: 'E', descripcion: 'Entrada a la jornada laboral'},
        {hora: '13:00', tipo: 'SC', descripcion: 'Salida a comida'},
        {hora: '14:00', tipo: 'RC', descripcion: 'Regreso de comida', duracion: '60 minutos'},
        {hora: '18:00', tipo: 'SF', descripcion: 'Salida final'}
    ],
    comida: {
        salida: '13:00',
        entrada: '14:00',
        duracion: 60,
        duracionOficial: 60,
        excede: false
    },
    permisos: [],
    escenario: 'Jornada normal con comida completa'
}
```

## Visualización en el Modal

El análisis se muestra en el modal de conceptos, en la sección **"Análisis de Permisos y Comidas"**, con:

- 🟢 Entrada (E)
- 🍽️ Salida a comida (SC)
- 🍽️ Regreso de comida (RC)
- ⏸️ Salida por permiso (SP)
- ▶️ Regreso de permiso (RP)
- 🔴 Salida final (SF)

Cada día muestra:
1. **Fecha y día de la semana**
2. **Escenario identificado**
3. **Secuencia de eventos con iconos**
4. **Resumen de comida** (si existe)
5. **Resumen de permisos** (si existen)
6. **Alertas** (excesos de tiempo, ausencias sin regreso)

## Integración con el Sistema

### Archivo: eventos.js
- `detectarPermisosYComida(claveEmpleado)`: Función principal de detección
- `analizarRegistrosDia()`: Analiza los registros de un día específico
- `clasificarEventos()`: Clasifica cada evento como E, SC, RC, SP, RP o SF
- `identificarEscenario()`: Identifica cuál de los 10 escenarios se presenta
- `mostrarAnalisisPermisosComida()`: Muestra el análisis en el modal

### Archivo: establecer_data.js
- Se llama a `detectarPermisosYComida()` al cargar los datos del empleado
- Se llama a `mostrarAnalisisPermisosComida()` para visualizar el análisis

### Archivo: conceptsModal.php
- Nueva tarjeta visual "Análisis de Permisos y Comidas"
- Muestra el análisis detallado con iconos y colores

## Beneficios

1. **Automatización**: No requiere intervención manual para clasificar eventos
2. **Flexibilidad**: Respeta la política de comida flexible de la empresa
3. **Transparencia**: Muestra claramente qué se consideró comida y qué permiso
4. **Alertas**: Identifica automáticamente excesos de tiempo y ausencias sin regreso
5. **Auditoría**: Mantiene un registro detallado de cada día analizado

## Notas Importantes

- La **tolerancia** para considerar algo como comida es de 30 minutos
- El sistema analiza automáticamente todos los días con registros
- Los análisis se regeneran cada vez que se abre el modal del empleado
- El horario oficial es fundamental para el correcto funcionamiento del análisis
