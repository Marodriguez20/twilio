import type { Client, RecommendationFactorScore, RecommendationResult, Vehicle } from './types.js';

const round = (value: number) => Math.round(value);

const typeCompatibilityMap: Record<string, string[]> = {
  Sedán: ['Sedán', 'Hatchback', 'SUV'],
  SUV: ['SUV', 'Sedán', 'Hatchback', 'Pickup'],
  Hatchback: ['Hatchback', 'Sedán', 'SUV'],
  Pickup: ['Pickup', 'SUV'],
  Deportivo: ['Deportivo', 'SUV'],
  Ciudad: ['Hatchback', 'Sedán'],
  Carretera: ['Sedán', 'SUV'],
  Mixto: ['SUV', 'Hatchback', 'Sedán'],
  Trabajo: ['Pickup', 'SUV'],
  Familiar: ['SUV', 'Sedán', 'Hatchback'],
  Comercial: ['Pickup', 'SUV', 'Sedán'],
};

const normalizeType = (value: string) => value.toLowerCase();

export function calculateBudgetScore(precio: number, presupuesto: number): number {
  if (precio <= presupuesto) return 100;
  const ratio = (precio - presupuesto) / presupuesto;
  if (ratio <= 0.05) return 80;
  if (ratio <= 0.1) return 60;
  if (ratio <= 0.2) return 30;
  return 0;
}

export function calculateCapacityScore(vehiclePassengers: number, requiredPassengers: number): number {
  const diff = vehiclePassengers - requiredPassengers;
  if (diff >= 0) return 100;
  if (diff === -1) return 70;
  if (diff === -2) return 40;
  return 0;
}

export function calculateVehicleTypeScore(clientType: string, vehicleType: string): number {
  const normalizedClient = normalizeType(clientType);
  const normalizedVehicle = normalizeType(vehicleType);

  if (normalizedClient === normalizedVehicle) return 100;

  const related = typeCompatibilityMap[clientType]?.includes(vehicleType) || false;
  if (related) return 60;
  return 0;
}

export function calculateUsageScore(clientUsage: string, vehicleType: string): number {
  const compatible = typeCompatibilityMap[clientUsage] ?? [];
  return compatible.includes(vehicleType) ? 100 : 0;
}

export function calculateFuelScore(clientFuel: string | undefined, vehicleFuel: string): number {
  if (!clientFuel) return 50;
  if (clientFuel === vehicleFuel) return 100;
  return 20;
}

export function calculateTransmissionScore(clientTransmission: string | undefined, vehicleTransmission: string): number {
  if (!clientTransmission) return 50;
  if (clientTransmission === vehicleTransmission) return 100;
  return 20;
}

export function calculateSafetyScore(clientImportance: number, vehicleSafety: number): number {
  const weight = Math.max(1, clientImportance);
  const safetyValue = Math.min(5, Math.max(1, vehicleSafety));
  const score = (safetyValue / 5) * 100;
  return round(score * (0.5 + weight / 10));
}

export function calculateDesignScore(clientDesignPreference: number, vehicleDesign: number): number {
  const value = Math.min(5, Math.max(1, vehicleDesign));
  const preference = Math.min(5, Math.max(1, clientDesignPreference));
  const average = (value + preference) / 2;
  return round((average / 5) * 100);
}

export function buildRecommendation(client: Client, vehicle: Vehicle): RecommendationResult {
  const presupuesto = calculateBudgetScore(vehicle.precio, client.presupuesto);
  const tipo = calculateVehicleTypeScore(client.tipoVehiculo, vehicle.tipo);
  const capacidad = calculateCapacityScore(vehicle.pasajeros, client.pasajeros);
  const uso = calculateUsageScore(client.uso, vehicle.tipo);
  const combustible = calculateFuelScore(client.combustible, vehicle.combustible);
  const transmision = calculateTransmissionScore(client.transmision, vehicle.transmision);
  const seguridad = calculateSafetyScore(client.importanciaSeguridad, vehicle.seguridad);
  const diseno = calculateDesignScore(client.preferenciaDiseno, vehicle.diseno);

  const factors: RecommendationFactorScore = {
    presupuesto,
    tipo,
    capacidad,
    uso,
    combustible,
    transmision,
    seguridad,
    diseno,
  };

  const score =
    presupuesto * 0.3 +
    tipo * 0.2 +
    capacidad * 0.15 +
    uso * 0.15 +
    combustible * 0.05 +
    transmision * 0.05 +
    seguridad * 0.05 +
    diseno * 0.05;

  const finalScore = round(score);

  const fortalezas: string[] = [];
  const observaciones: string[] = [];

  if (presupuesto >= 80) fortalezas.push('Se encuentra dentro del presupuesto');
  else observaciones.push('El precio está ligeramente por encima del presupuesto');

  if (capacidad >= 80) fortalezas.push('Cumple con la capacidad requerida');
  else observaciones.push('La capacidad es inferior a la requerida');

  if (tipo >= 80) fortalezas.push('Coincide con el tipo de vehículo preferido');
  else observaciones.push('El tipo de vehículo no coincide exactamente con la preferencia');

  if (uso >= 80) fortalezas.push('Es adecuado para el uso seleccionado');
  else observaciones.push('El tipo de vehículo no es el ideal para ese uso');

  if (combustible >= 80) fortalezas.push('Coincide con la preferencia de combustible');
  else observaciones.push('El combustible no coincide totalmente con la preferencia');

  if (transmision >= 80) fortalezas.push('Coincide con la preferencia de transmisión');
  else observaciones.push('La transmisión no coincide con la preferencia');

  if (seguridad >= 80) fortalezas.push('Cuenta con seguridad acorde a la prioridad del cliente');
  else observaciones.push('La seguridad podría ajustarse mejor a la preferencia del cliente');

  if (diseno >= 80) fortalezas.push('Ajusta bien a la preferencia de diseño');
  else observaciones.push('El diseño es menos alineado a la preferencia del cliente');

  return {
    vehiculoId: vehicle.id,
    vehiculo: `${vehicle.marca} ${vehicle.modelo}`,
    score: finalScore,
    factores: factors,
    fortalezas,
    observaciones,
  };
}

export function generateRecommendationsForClient(client: Client, vehicles: Vehicle[]): RecommendationResult[] {
  return vehicles
    .filter((vehicle) => vehicle.estado === 'Disponible')
    .map((vehicle) => buildRecommendation(client, vehicle))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
