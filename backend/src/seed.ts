import { demoClients, demoVehicles } from './demoData.js';
import { saveClients, saveRecommendations, saveVehicles } from './store.js';

async function seedData() {
  await saveClients(demoClients);
  await saveVehicles(demoVehicles);
  await saveRecommendations([]);
  console.log('Seed data initialized with 10 clients and 15 vehicles.');
}

seedData().catch((error) => {
  console.error('Unable to generate seed data', error);
  process.exit(1);
});
