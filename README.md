# Sistema Web de Recomendación de Vehículos

Proyecto académico para Country Motors Chevrolet.

## Descripción

Sistema web para registrar clientes, administrar vehículos y generar recomendaciones automáticas mediante un motor de recomendación basado en reglas y puntuación ponderada.

## Stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Datos: almacenamiento local JSON para prototipo académico
- Arquitectura: cliente-servidor con API REST

## Estructura

- `frontend/` — interfaz y experiencia de usuario
- `backend/` — API REST y lógica de negocio
- `database/` — esquemas y datos de prueba
- `docs/` — documentación técnica

## Ejecución local

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Despliegue web

El proyecto puede publicarse como un único servicio web en Render: Express sirve la API y el build de React, por lo que todos los dispositivos usan el mismo dominio.

1. Sube el repositorio a GitHub.
2. En Render, crea un **Blueprint** y conecta este repositorio.
3. Render detectará `render.yaml`; selecciona **Apply** para crear el servicio.
4. Cuando finalice el despliegue, abre la URL `onrender.com` asignada y compártela.

El plan gratuito puede suspender el servicio por inactividad, causando una demora al primer acceso. Como los datos se guardan en archivos JSON, los cambios pueden perderse al reiniciar o volver a desplegar el servicio. Usa datos ficticios para la demostración y no ingreses información personal real.

Más detalles: `docs/README.md`

## Documentación

- `docs/README.md` — descripción general del proyecto
- `docs/API.md` — endpoints de la API
- `docs/ARCHITECTURE.md` — arquitectura del sistema

## Alcance académico

No incluye IA avanzada, ML ni filtrado colaborativo. La recomendación se basa en reglas y puntajes ponderados para mantener la explicabilidad del sistema.
