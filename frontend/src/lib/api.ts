import type { Client, RecommendationApiResponse, RecommendationRecord, Vehicle } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message ?? 'La operación falló');
  }

  return response.json() as Promise<T>;
}

export const api = {
  getClients: () => request<Client[]>('/clientes'),
  getClient: (id: string) => request<Client>(`/clientes/${id}`),
  createClient: (payload: Partial<Client>) => request<Client>('/clientes', { method: 'POST', body: JSON.stringify(payload) }),
  updateClient: (id: string, payload: Partial<Client>) => request<Client>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteClient: (id: string) => request<{ ok: boolean; message: string }>(`/clientes/${id}`, { method: 'DELETE' }),

  getVehicles: () => request<Vehicle[]>('/vehiculos'),
  getVehicle: (id: string) => request<Vehicle>(`/vehiculos/${id}`),
  createVehicle: (payload: Partial<Vehicle>) => request<Vehicle>('/vehiculos', { method: 'POST', body: JSON.stringify(payload) }),
  updateVehicle: (id: string, payload: Partial<Vehicle>) => request<Vehicle>(`/vehiculos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteVehicle: (id: string) => request<{ ok: boolean; message: string }>(`/vehiculos/${id}`, { method: 'DELETE' }),

  getRecommendations: () => request<RecommendationRecord[]>('/recomendaciones'),
  generateRecommendations: (clienteId: string) => request<RecommendationApiResponse>('/recomendaciones/generar', {
    method: 'POST',
    body: JSON.stringify({ clienteId }),
  }),
  createRecommendation: (clienteId: string, asesor = 'Asesor principal') =>
    request<RecommendationRecord>('/recomendaciones', {
      method: 'POST',
      body: JSON.stringify({ clienteId, asesor }),
    }),
};
