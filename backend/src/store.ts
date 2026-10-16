import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

const filePathMap = {
  clients: path.join(dataDir, 'clients.json'),
  vehicles: path.join(dataDir, 'vehicles.json'),
  recommendations: path.join(dataDir, 'recommendations.json'),
};

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readFile<T>(key: keyof typeof filePathMap): Promise<T> {
  await ensureDataDir();
  const file = filePathMap[key];
  try {
    const content = await fs.readFile(file, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return [] as T;
  }
}

async function writeFile<T>(key: keyof typeof filePathMap, value: T) {
  await ensureDataDir();
  const file = filePathMap[key];
  await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf-8');
}

export async function getClients<T>() {
  return readFile<T>('clients');
}

export async function getVehicles<T>() {
  return readFile<T>('vehicles');
}

export async function getRecommendations<T>() {
  return readFile<T>('recommendations');
}

export async function saveClients<T>(data: T) {
  await writeFile('clients', data);
}

export async function saveVehicles<T>(data: T) {
  await writeFile('vehicles', data);
}

export async function saveRecommendations<T>(data: T) {
  await writeFile('recommendations', data);
}

export function normalizeObject<T>(value: T | undefined | null): T {
  return (value ?? []) as T;
}
