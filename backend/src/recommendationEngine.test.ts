import { describe, expect, it } from 'vitest';
import { buildRecommendation, calculateBudgetScore, calculateCapacityScore, calculateFuelScore, calculateTransmissionScore, generateRecommendationsForClient } from './recommendationEngine.js';
import type { Client, Vehicle } from './types.js';

const baseClient: Client = {
  id: 'CL-TEST',
  nombre: 'Cliente prueba',
  documento: '123456',
  telefono: '3001112222',
  email: 'cliente@demo.com',
  ingresos: 5000000,
  presupuesto: 100000000,
  familia: 3,
  pasajeros: 5,
  uso: 'Familiar',
  tipoVehiculo: 'SUV',
  combustible: 'Gasolina',
  transmision: 'Automática',
  importanciaConsumo: 4,
  importanciaSeguridad: 5,
  preferenciaDiseno: 4,
  createdAt: '2026-09-01T00:00:00.000Z',
};

const baseVehicle: Vehicle = {
  id: 'VE-TEST',
  marca: 'Chevrolet',
  modelo: 'Tracker',
  anio: 2025,
  precio: 95000000,
  tipo: 'SUV',
  pasajeros: 5,
  motor: '1.5 Turbo',
  combustible: 'Gasolina',
  transmision: 'Automática',
  consumo: 13.4,
  seguridad: 5,
  potencia: 153,
  diseno: 4,
  maletero: 410,
  descripcion: 'SUV para uso familiar.',
  imagen: 'https://example.com/vehicle.jpg',
  estado: 'Disponible',
  createdAt: '2026-09-01T00:00:00.000Z',
};

describe('Motor de recomendación basado en reglas', () => {
  it('1. Cliente con presupuesto suficiente obtiene puntaje alto', () => {
    expect(calculateBudgetScore(95000000, 100000000)).toBe(100);
  });

  it('2. Cliente con presupuesto insuficiente recibe penalización', () => {
    expect(calculateBudgetScore(150000000, 100000000)).toBe(0);
  });

  it('3. Coincidencia exacta de tipo asigna 100 puntos', () => {
    const result = buildRecommendation(baseClient, baseVehicle);
    expect(result.factores.tipo).toBe(100);
  });

  it('4. Diferencia de capacidad reducida representa puntuación inferior', () => {
    const vehicle = { ...baseVehicle, pasajeros: 4 };
    const result = buildRecommendation(baseClient, vehicle);
    expect(result.factores.capacidad).toBe(70);
  });

  it('5. Coincidencia de combustible asigna máximo puntaje', () => {
    expect(calculateFuelScore('Gasolina', 'Gasolina')).toBe(100);
  });

  it('6. Diferencia de combustible recibe penalización', () => {
    expect(calculateFuelScore('Gasolina', 'Diésel')).toBe(20);
  });

  it('7. Coincidencia de transmisión asigna máximo puntaje', () => {
    expect(calculateTransmissionScore('Automática', 'Automática')).toBe(100);
  });

  it('8. Vehículo no disponible no es recomendado', () => {
    const vehicle = { ...baseVehicle, estado: 'No disponible' as const };
    const results = generateRecommendationsForClient(baseClient, [vehicle]);
    expect(results).toEqual([]);
  });

  it('9. Cliente sin preferencias opcionales no falla', () => {
    const client = { ...baseClient, combustible: undefined as never, transmision: undefined as never };
    expect(calculateFuelScore(undefined, 'Gasolina')).toBe(50);
    expect(calculateTransmissionScore(undefined, 'Automática')).toBe(50);
    const result = buildRecommendation(client, baseVehicle);
    expect(result.score).toBeGreaterThan(0);
  });

  it('10. Empate entre vehículos mantiene la misma puntuación', () => {
    const vehicleA = { ...baseVehicle, id: 'VE-A' };
    const vehicleB = { ...baseVehicle, id: 'VE-B', modelo: 'Spin' };
    const resultA = buildRecommendation(baseClient, vehicleA);
    const resultB = buildRecommendation(baseClient, vehicleB);
    expect(resultA.score).toBe(resultB.score);
  });

  it('11. Capacidad mínima es consistente', () => {
    expect(calculateCapacityScore(5, 5)).toBe(100);
    expect(calculateCapacityScore(4, 5)).toBe(70);
    expect(calculateCapacityScore(3, 5)).toBe(40);
    expect(calculateCapacityScore(2, 5)).toBe(0);
  });
});
