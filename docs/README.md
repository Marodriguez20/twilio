# Sistema Web de Recomendación de Vehículos para Country Motors Chevrolet

## Descripción
Este proyecto es un prototipo académico funcional de un sistema web para asesores comerciales de Country Motors Chevrolet. Permite registrar clientes y vehículos, evaluar el perfil del cliente y generar recomendaciones automáticas de vehículos mediante reglas explícitas y puntuación ponderada.

No incluye inteligencia artificial ni machine learning. El sistema usa un motor de recomendación basado en reglas, con explicabilidad para mostrar por qué un vehículo fue recomendado.

## Objetivo
- Registrar clientes y sus necesidades.
- Administrar inventario de vehículos.
- Generar recomendaciones con una lógica transparente.
- Comparar vehículos recomendados.
- Consultar historial de recomendaciones.
- Presentar un prototipo profesional, responsive y funcional.

## Tecnologías
### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- Zod
- API REST

### Datos
- Persistencia con archivos JSON (prototipo académico)
- Separación lógica en clientes, vehículos y recomendaciones

## Arquitectura
La arquitectura sigue el modelo cliente-servidor, con clara separación entre frontend, API REST y lógica de negocio.

- Frontend: React + Tailwind
- API: Express + TypeScript
- Lógica: motor de recomendación basado en reglas
- Datos: archivos JSON bajo /backend/data y /database

## Instalación
### Prerrequisitos
- Node.js 18+
- npm

### 1. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 2. Instalar dependencias del frontend
```bash
cd frontend
npm install
```

### 3. Sembrar datos de prueba
```bash
cd backend
npm run seed
```

## Configuración
Crea un archivo `.env` si necesitas variables de entorno.

Ejemplos:

Backend (`backend/.env`):
```env
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:5173,http://localhost:4173
```

Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000/api
```

## Publicación web
Este proyecto está preparado para ser desplegado como aplicación web accesible desde otra PC sin necesidad de instalar Node o ejecutar procesos manualmente.

### Opción recomendada
- Frontend: Vercel
- Backend: Render
- Repositorio: GitHub

### Pasos
1. Subir ambos proyectos a GitHub.
2. Conectar el frontend a Vercel y configurar la variable:
   - `VITE_API_URL=https://tu-backend-render-url.onrender.com/api`
3. Conectar el backend a Render y configurar:
   - `PORT=4000`
   - `HOST=0.0.0.0`
   - `CORS_ORIGIN=https://tu-frontend-vercel-url.vercel.app`
4. Publicar y compartir la URL del frontend.

De esta manera, cualquiera con acceso a la URL puede usar la aplicación desde navegador sin instalar nada.

## Base de datos
El prototipo usa almacenamiento en archivos JSON para mantener el alcance académico y la simplicidad operativa.

Carpetas:
- /backend/data
- /database/schemas
- /database/seed

Colecciones conceptuales:
- clientes
- vehiculos
- recomendaciones

## API
El backend expone endpoints REST para clientes, vehículos y recomendaciones.

Inicia el backend:
```bash
cd backend
npm run dev
```

## Motor de recomendación
El algoritmo usa una suma ponderada de los siguientes criterios:
- Presupuesto: 30%
- Tipo de vehículo: 20%
- Capacidad: 15%
- Uso: 15%
- Combustible: 5%
- Transmisión: 5%
- Seguridad: 5%
- Diseño: 5%

Cada criterio tiene puntajes explícitos y explicables. El resultado final se expresa como porcentaje.

## Ejecución
### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

La app quedará accesible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Pruebas
Ejecuta las pruebas del motor de recomendación:
```bash
cd backend
npm run test
```

## Alcance académico
El proyecto respeta la restricción del enunciado:
- No utiliza IA avanzada
- No utiliza machine learning
- No utiliza filtrado colaborativo
- No incluye predicción de ventas ni integraciones reales

## Proyecto académico
Ajustado al alcance de un prototipo funcional de Ingeniería de Sistemas orientado a la asesoría comercial.
