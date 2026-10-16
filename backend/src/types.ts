export type UsageType = 'Ciudad' | 'Carretera' | 'Mixto' | 'Trabajo' | 'Familiar' | 'Comercial';
export type VehicleType = 'Sedán' | 'SUV' | 'Hatchback' | 'Pickup' | 'Deportivo';
export type FuelType = 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
export type TransmissionType = 'Automática' | 'Manual';
export type VehicleStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'No disponible';

export interface Client {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  ingresos: number;
  presupuesto: number;
  familia: number;
  pasajeros: number;
  uso: UsageType;
  tipoVehiculo: VehicleType;
  combustible: FuelType;
  transmision: TransmissionType;
  importanciaConsumo: number;
  importanciaSeguridad: number;
  preferenciaDiseno: number;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  tipo: VehicleType;
  pasajeros: number;
  motor: string;
  combustible: FuelType;
  transmision: TransmissionType;
  consumo: number;
  seguridad: number;
  potencia: number;
  diseno: number;
  maletero: number;
  descripcion: string;
  imagen: string;
  estado: VehicleStatus;
  createdAt: string;
}

export interface RecommendationFactorScore {
  presupuesto: number;
  tipo: number;
  capacidad: number;
  uso: number;
  combustible: number;
  transmision: number;
  seguridad: number;
  diseno: number;
}

export interface RecommendationResult {
  vehiculoId: string;
  vehiculo: string;
  score: number;
  factores: RecommendationFactorScore;
  fortalezas: string[];
  observaciones: string[];
}

export interface RecommendationRecord {
  id: string;
  clienteId: string;
  fecha: string;
  resultados: RecommendationResult[];
  mejorCoincidencia: number;
  asesor: string;
}

export type ClientInput = Omit<Client, 'id' | 'createdAt'>;
export type VehicleInput = Omit<Vehicle, 'id' | 'createdAt'>;
