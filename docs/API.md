# API REST – Country Motors Chevrolet

## Base URL
http://localhost:4000/api

## Endpoints

### Salud del backend
GET /api/health

Respuesta:
```json
{
  "ok": true,
  "message": "Backend Country Motors active"
}
```

### Clientes
GET /api/clientes
GET /api/clientes/:id
POST /api/clientes
PUT /api/clientes/:id
DELETE /api/clientes/:id

Ejemplo de creación:
```json
{
  "nombre": "Ana López",
  "documento": "1234567890",
  "telefono": "+57 300 123 4567",
  "email": "ana@demo.com",
  "ingresos": 4200000,
  "presupuesto": 95000000,
  "familia": 3,
  "pasajeros": 5,
  "uso": "Familiar",
  "tipoVehiculo": "SUV",
  "combustible": "Gasolina",
  "transmision": "Automática",
  "importanciaConsumo": 4,
  "importanciaSeguridad": 5,
  "preferenciaDiseno": 4
}
```

### Vehículos
GET /api/vehiculos
GET /api/vehiculos/:id
POST /api/vehiculos
PUT /api/vehiculos/:id
DELETE /api/vehiculos/:id

Ejemplo de creación:
```json
{
  "marca": "Chevrolet",
  "modelo": "Tracker",
  "anio": 2025,
  "precio": 98000000,
  "tipo": "SUV",
  "pasajeros": 5,
  "motor": "1.5 Turbo",
  "combustible": "Gasolina",
  "transmision": "Automática",
  "consumo": 13.4,
  "seguridad": 5,
  "potencia": 153,
  "diseno": 4,
  "maletero": 410,
  "descripcion": "SUV cómodo para uso familiar.",
  "imagen": "https://example.com/tracker.jpg",
  "estado": "Disponible"
}
```

### Recomendaciones
POST /api/recomendaciones
GET /api/recomendaciones
GET /api/recomendaciones/:id
POST /api/recomendaciones/generar

Request para generar recomendación:
```json
{
  "clienteId": "CL-001"
}
```

Respuesta:
```json
{
  "cliente": {
    "id": "CL-001",
    "nombre": "Ana María López"
  },
  "recomendaciones": [
    {
      "vehiculoId": "VE-002",
      "vehiculo": "Chevrolet Tracker",
      "score": 91,
      "factores": {
        "presupuesto": 100,
        "tipo": 100,
        "capacidad": 90,
        "uso": 100,
        "combustible": 80,
        "transmision": 100,
        "seguridad": 90,
        "diseno": 80
      },
      "fortalezas": [
        "Se encuentra dentro del presupuesto",
        "Cumple con la capacidad requerida"
      ],
      "observaciones": [
        "El precio está ligeramente por encima del presupuesto"
      ]
    }
  ]
}
```

## Códigos de error
- 400: información inválida
- 404: recurso no encontrado
- 409: conflicto de duplicidad
- 500: error interno del servidor
