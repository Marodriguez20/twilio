# Arquitectura del sistema

## Visión general
El proyecto está dividido en tres capas principales:

1. Frontend
2. API REST
3. Lógica de negocio y persistencia

La separación permite que el cliente y el backend puedan evolucionar de manera independiente.

## Capa frontend
Se implementa con React + TypeScript + Tailwind CSS.

Incluye:
- Dashboard
- Gestión de clientes
- Gestión de vehículos
- Recomendaciones
- Historial
- Comparación de vehículos

## Capa API
La capa de servicio se implementa con Express y TypeScript.

Responsabilidades:
- Recepción de peticiones HTTP
- Validación con Zod
- Lógica de acceso a datos
- Generación de recomendaciones
- Persistencia de historial

## Capa de negocio
El motor de recomendación no usa IA ni aprendizaje automático. Se basa en reglas explícitas y ponderación.

Criterios importantes:
- Presupuesto
- Tipo de vehículo
- Capacidad
- Uso
- Combustible
- Transmisión
- Seguridad
- Diseño

## Base de datos
Para el prototipo académico, la solución usa almacenamiento basado en archivos JSON.

Esto permite:
- Diseñar la separación conceptual de colecciones
- Mantener la claridad académica
- Reducir la complejidad de la implementación

## Estructura conceptual
```text
/backend
  /src
  /data
/frontend
  /src
/database
  /schemas
  /seed
docs
```

## Patrones adoptados
- Separación de responsabilidades
- Validación de entrada en backend
- Diseño modular
- Componentes reutilizables
- APIs REST bien definidas
- Transparencia explicable en la recomendación

## Mantenimiento
La lógica del negocio está centralizada en el motor de recomendación y no mezclada dentro de los componentes visuales.

Esto facilita su prueba, análisis y evolución académica.
