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
Este proyecto está preparado para publicarse como aplicación web accesible desde otra PC.

### Configuración sugerida
- Frontend en Vercel
- Backend en Render
- Repositorio en GitHub

Más detalles: `docs/README.md`

## Documentación
- `docs/README.md` — descripción general del proyecto
- `docs/API.md` — endpoints de la API
- `docs/ARCHITECTURE.md` — arquitectura del sistema

## Alcance académico
No incluye IA avanzada, ML ni filtrado colaborativo. La recomendación se basa en reglas y puntajes ponderados para mantener la explicabilidad del sistema.
