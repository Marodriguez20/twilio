import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { demoClients, demoVehicles } from './demoData.js';
import { generateRecommendationsForClient } from './recommendationEngine.js';
import { getClients, getRecommendations, getVehicles, normalizeObject, saveClients, saveRecommendations, saveVehicles } from './store.js';
import type { Client, RecommendationRecord, Vehicle } from './types.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';
const allowedOrigins = [process.env.RENDER_EXTERNAL_URL, ...(process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:4173').split(',')]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));
const isLocalDevOrigin = (origin: string | undefined) => !!origin && /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

function errorResponse(res: Response, status: number, message: string, details?: unknown) {
  res.status(status).json({
    ok: false,
    message,
    details: details ?? null,
  });
}

const clientSchema = z.object({
  nombre: z.string().min(3),
  documento: z.string().min(5),
  telefono: z.string().min(7),
  email: z.string().email(),
  ingresos: z.number().positive(),
  presupuesto: z.number().positive(),
  familia: z.number().int().positive(),
  pasajeros: z.number().int().positive(),
  uso: z.enum(['Ciudad', 'Carretera', 'Mixto', 'Trabajo', 'Familiar', 'Comercial']),
  tipoVehiculo: z.enum(['Sedán', 'SUV', 'Hatchback', 'Pickup', 'Deportivo']),
  combustible: z.enum(['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico']),
  transmision: z.enum(['Automática', 'Manual']),
  importanciaConsumo: z.number().min(1).max(5),
  importanciaSeguridad: z.number().min(1).max(5),
  preferenciaDiseno: z.number().min(1).max(5),
});

const vehicleSchema = z.object({
  marca: z.string().min(2),
  modelo: z.string().min(2),
  anio: z.number().int().min(2010),
  precio: z.number().positive(),
  tipo: z.enum(['Sedán', 'SUV', 'Hatchback', 'Pickup', 'Deportivo']),
  pasajeros: z.number().int().positive(),
  motor: z.string().min(2),
  combustible: z.enum(['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico']),
  transmision: z.enum(['Automática', 'Manual']),
  consumo: z.number().positive(),
  seguridad: z.number().min(1).max(5),
  potencia: z.number().min(1),
  diseno: z.number().min(1).max(5),
  maletero: z.number().positive(),
  descripcion: z.string().min(10),
  imagen: z.string().url(),
  estado: z.enum(['Disponible', 'Reservado', 'Vendido', 'No disponible']),
});

async function ensureSeedData() {
  const clients = await getClients<Client[]>();
  const vehicles = await getVehicles<Vehicle[]>();

  if (!clients.length) {
    await saveClients(demoClients);
  }

  if (!vehicles.length) {
    await saveVehicles(demoVehicles);
  }

  const recommendations = await getRecommendations<RecommendationRecord[]>();
  if (!recommendations) {
    await saveRecommendations([]);
  }
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'Backend Country Motors active' });
});

app.get('/api/clientes', async (_req: Request, res: Response) => {
  try {
    await ensureSeedData();
    const clients = normalizeObject<Client[]>(await getClients<Client[]>());
    res.json(clients);
  } catch (error) {
    errorResponse(res, 500, 'No se pudieron consultar los clientes.', error);
  }
});

app.get('/api/clientes/:id', async (req: Request, res: Response) => {
  try {
    const clients = normalizeObject<Client[]>(await getClients<Client[]>());
    const client = clients.find((item) => item.id === req.params.id);
    if (!client) {
      return errorResponse(res, 404, 'Cliente no encontrado');
    }
    return res.json(client);
  } catch (error) {
    return errorResponse(res, 500, 'Error al consultar el cliente.', error);
  }
});

app.post('/api/clientes', async (req: Request, res: Response) => {
  try {
    const payload = clientSchema.parse(req.body);
    const clients = normalizeObject<Client[]>(await getClients<Client[]>());

    const duplicate = clients.some((item) => item.documento === payload.documento || item.email === payload.email);
    if (duplicate) {
      return errorResponse(res, 409, 'El cliente ya existe con el mismo documento o correo.');
    }

    const client: Client = {
      id: `CL-${String(clients.length + 1).padStart(3, '0')}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };

    const nextClients = [...clients, client];
    await saveClients(nextClients);
    return res.status(201).json(client);
  } catch (error) {
    return errorResponse(res, 400, 'La información del cliente no es válida.', error);
  }
});

app.put('/api/clientes/:id', async (req: Request, res: Response) => {
  try {
    const payload = clientSchema.parse(req.body);
    const clients = normalizeObject<Client[]>(await getClients<Client[]>());
    const index = clients.findIndex((client) => client.id === req.params.id);

    if (index === -1) {
      return errorResponse(res, 404, 'Cliente no encontrado');
    }

    const updatedClient: Client = {
      ...clients[index],
      ...payload,
      id: clients[index].id,
      createdAt: clients[index].createdAt,
    };

    clients[index] = updatedClient;
    await saveClients(clients);
    return res.json(updatedClient);
  } catch (error) {
    return errorResponse(res, 400, 'No se pudo actualizar el cliente.', error);
  }
});

app.delete('/api/clientes/:id', async (req: Request, res: Response) => {
  try {
    const clients = normalizeObject<Client[]>(await getClients<Client[]>());
    const next = clients.filter((client) => client.id !== req.params.id);
    if (next.length === clients.length) {
      return errorResponse(res, 404, 'Cliente no encontrado');
    }

    await saveClients(next);
    return res.json({ ok: true, message: 'Cliente eliminado correctamente' });
  } catch (error) {
    return errorResponse(res, 500, 'No se pudo eliminar el cliente.', error);
  }
});

app.get('/api/vehiculos', async (_req: Request, res: Response) => {
  try {
    await ensureSeedData();
    const vehicles = normalizeObject<Vehicle[]>(await getVehicles<Vehicle[]>());
    res.json(vehicles);
  } catch (error) {
    errorResponse(res, 500, 'No se pudieron consultar los vehículos.', error);
  }
});

app.get('/api/vehiculos/:id', async (req: Request, res: Response) => {
  try {
    const vehicles = normalizeObject<Vehicle[]>(await getVehicles<Vehicle[]>());
    const vehicle = vehicles.find((item) => item.id === req.params.id);
    if (!vehicle) {
      return errorResponse(res, 404, 'Vehículo no encontrado');
    }
    return res.json(vehicle);
  } catch (error) {
    return errorResponse(res, 500, 'Error consultando el vehículo.', error);
  }
});

app.post('/api/vehiculos', async (req: Request, res: Response) => {
  try {
    const payload = vehicleSchema.parse(req.body);
    const vehicles = normalizeObject<Vehicle[]>(await getVehicles<Vehicle[]>());

    const vehicle: Vehicle = {
      id: `VE-${String(vehicles.length + 1).padStart(3, '0')}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };

    await saveVehicles([...vehicles, vehicle]);
    return res.status(201).json(vehicle);
  } catch (error) {
    return errorResponse(res, 400, 'Los datos del vehículo no son válidos.', error);
  }
});

app.put('/api/vehiculos/:id', async (req: Request, res: Response) => {
  try {
    const payload = vehicleSchema.parse(req.body);
    const vehicles = normalizeObject<Vehicle[]>(await getVehicles<Vehicle[]>());
    const index = vehicles.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return errorResponse(res, 404, 'Vehículo no encontrado');
    }

    const updatedVehicle: Vehicle = {
      ...vehicles[index],
      ...payload,
      id: vehicles[index].id,
      createdAt: vehicles[index].createdAt,
    };

    vehicles[index] = updatedVehicle;
    await saveVehicles(vehicles);
    return res.json(updatedVehicle);
  } catch (error) {
    return errorResponse(res, 400, 'No se pudo actualizar el vehículo.', error);
  }
});

app.delete('/api/vehiculos/:id', async (req: Request, res: Response) => {
  try {
    const vehicles = normalizeObject<Vehicle[]>(await getVehicles<Vehicle[]>());
    const next = vehicles.filter((vehicle) => vehicle.id !== req.params.id);
    if (next.length === vehicles.length) {
      return errorResponse(res, 404, 'Vehículo no encontrado');
    }

    await saveVehicles(next);
    return res.json({ ok: true, message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    return errorResponse(res, 500, 'No se pudo eliminar el vehículo.', error);
  }
});

app.get('/api/recomendaciones', async (_req: Request, res: Response) => {
  try {
    const recommendations = normalizeObject<RecommendationRecord[]>(await getRecommendations<RecommendationRecord[]>());
    res.json(recommendations);
  } catch (error) {
    errorResponse(res, 500, 'No se pudo consultar el historial de recomendaciones.', error);
  }
});

app.get('/api/recomendaciones/:id', async (req: Request, res: Response) => {
  try {
    const recommendations = normalizeObject<RecommendationRecord[]>(await getRecommendations<RecommendationRecord[]>());
    const recommendation = recommendations.find((item) => item.id === req.params.id);
    if (!recommendation) {
      return errorResponse(res, 404, 'Recomendación no encontrada');
    }
    return res.json(recommendation);
  } catch (error) {
    return errorResponse(res, 500, 'Error consultando la recomendación.', error);
  }
});

app.post('/api/recomendaciones', async (req: Request, res: Response) => {
  try {
    const { clienteId, asesor = 'Asesor demo' } = req.body as { clienteId: string; asesor?: string };
    const clients = normalizeObject<Client[]>(await getClients<Client[]>());
    const vehicles = normalizeObject<Vehicle[]>(await getVehicles<Vehicle[]>());
    const client = clients.find((item) => item.id === clienteId);

    if (!client) {
      return errorResponse(res, 404, 'Cliente no encontrado');
    }

    const resultados = generateRecommendationsForClient(client, vehicles);
    const record: RecommendationRecord = {
      id: randomUUID(),
      clienteId,
      fecha: new Date().toISOString(),
      resultados,
      mejorCoincidencia: resultados[0]?.score ?? 0,
      asesor,
    };

    const recommendations = normalizeObject<RecommendationRecord[]>(await getRecommendations<RecommendationRecord[]>());
    await saveRecommendations([record, ...recommendations]);
    return res.status(201).json(record);
  } catch (error) {
    return errorResponse(res, 400, 'No se pudo guardar la recomendación.', error);
  }
});

app.post('/api/recomendaciones/generar', async (req: Request, res: Response) => {
  try {
    const { clienteId } = req.body as { clienteId: string };
    const clients = normalizeObject<Client[]>(await getClients<Client[]>());
    const client = clients.find((item) => item.id === clienteId);
    if (!client) {
      return errorResponse(res, 404, 'Cliente no encontrado');
    }

    const vehicles = normalizeObject<Vehicle[]>(await getVehicles<Vehicle[]>());
    const recommendations = generateRecommendationsForClient(client, vehicles);
    const responsePayload = {
      cliente: { id: client.id, nombre: client.nombre },
      recomendaciones: recommendations,
    };

    const record: RecommendationRecord = {
      id: randomUUID(),
      clienteId,
      fecha: new Date().toISOString(),
      resultados: recommendations,
      mejorCoincidencia: recommendations[0]?.score ?? 0,
      asesor: 'Asesor principal',
    };

    const history = normalizeObject<RecommendationRecord[]>(await getRecommendations<RecommendationRecord[]>());
    await saveRecommendations([record, ...history]);

    return res.json(responsePayload);
  } catch (error) {
    return errorResponse(res, 400, 'No fue posible generar la recomendación.', error);
  }
});

await ensureSeedData();

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

app.listen(port, host, () => {
  console.log(`Country Motors backend running on http://${host}:${port}`);
});
