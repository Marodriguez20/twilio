import { Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { RecommendationCard } from '../components/RecommendationCard';
import { VehicleComparison } from '../components/VehicleComparison';
import { api } from '../lib/api';
import type { Client, Recommendation, Vehicle } from '../types';

export function RecommendationsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clientId, setClientId] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsData, vehiclesData] = await Promise.all([api.getClients(), api.getVehicles()]);
        setClients(clientsData);
        setVehicles(vehiclesData);
        if (clientsData[0]) setClientId(clientsData[0].id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!clientId) return;
    try {
      const response = await api.generateRecommendations(clientId);
      setRecommendations(response.recomendaciones);
      setSelectedForCompare([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No fue posible generar la recomendación');
    }
  };

  const visibleRecommendations = useMemo(
    () => [...recommendations].sort((a, b) => b.score - a.score).slice(0, 5),
    [recommendations],
  );

  const compareVehicles = useMemo(
    () => vehicles.filter((vehicle) => selectedForCompare.includes(vehicle.id)),
    [vehicles, selectedForCompare],
  );

  const toggleCompare = (vehicleId: string) => {
    setSelectedForCompare((current) => {
      if (current.includes(vehicleId)) {
        return current.filter((id) => id !== vehicleId);
      }
      if (current.length >= 3) return [...current.slice(1), vehicleId];
      return [...current, vehicleId];
    });
  };

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Cargando perfiles y vehículos...</div>;
  }

  return (
    <>
      <PageHeader
        title="Recomendación de vehículo"
        description="Analiza el perfil del cliente y encuentra los vehículos que mejor se adaptan a sus necesidades y preferencias."
      />

      <div className="premium-surface mb-6 rounded-3xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">Seleccionar cliente</label>
            <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus:border-amber-400 focus:outline-none">
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.nombre}</option>
              ))}
            </select>
          </div>
          <button onClick={handleGenerate} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-105">
            <Sparkles size={16} /> Generar recomendaciones
          </button>
        </div>
      </div>

      {visibleRecommendations.length > 0 ? (
        <>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
            <TrendingUp size={18} />
            Se muestran los {visibleRecommendations.length} vehículos más acordes al perfil del cliente.
          </div>

          {compareVehicles.length > 0 ? (
            <div className="sticky top-4 z-10 mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Comparación rápida</h2>
              <VehicleComparison vehicles={compareVehicles} />
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-3">
            {visibleRecommendations.map((item) => (
              <RecommendationCard
                key={item.vehiculoId}
                recommendation={item}
                onCompare={() => toggleCompare(item.vehiculoId)}
                onSelect={() => {}} 
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No hay recomendaciones aún. Selecciona un cliente y genera la evaluación.
        </div>
      )}
    </>
  );
}
