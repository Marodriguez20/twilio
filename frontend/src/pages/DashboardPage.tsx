import { BarChart3, CarFront, CircleGauge, Users, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { api } from '../lib/api';
import type { Client, RecommendationRecord, Vehicle } from '../types';

export function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsData, vehiclesData, recommendationsData] = await Promise.all([
          api.getClients(),
          api.getVehicles(),
          api.getRecommendations(),
        ]);
        setClients(clientsData);
        setVehicles(vehiclesData);
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const availableVehicles = vehicles.filter((vehicle) => vehicle.estado === 'Disponible').length;
    const avgMatch = recommendations.length
      ? Math.round(recommendations.reduce((sum, item) => sum + (item.mejorCoincidencia ?? 0), 0) / recommendations.length)
      : 0;

    return {
      clients: clients.length,
      vehicles: vehicles.length,
      availableVehicles,
      recommendations: recommendations.length,
      avgMatch,
    };
  }, [clients, vehicles, recommendations]);

  const topVehicles = useMemo(() => {
    const counts = new Map<string, { vehicle: Vehicle; score: number }>();

    recommendations.forEach((record) => {
      record.resultados.forEach((item) => {
        const vehicle = vehicles.find((v) => v.id === item.vehiculoId);
        if (!vehicle) return;
        const existing = counts.get(item.vehiculoId);
        counts.set(item.vehiculoId, {
          vehicle,
          score: existing ? Math.max(existing.score, item.score) : item.score,
        });
      });
    });

    return [...counts.values()].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [vehicles, recommendations]);

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Cargando dashboard...</div>;
  }

  return (
    <>
      <div className="premium-hero premium-surface mb-6 rounded-3xl p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="premium-badge">Country Motors Chevrolet</span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">Dashboard ejecutivo</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300 md:text-base">
              Resumen operativo del concesionario para apoyar a los asesores con decisiones rápidas, claras y alineadas con el perfil del cliente.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Coincidencia promedio</p>
            <p className="mt-2 text-3xl font-black text-amber-300">{stats.avgMatch}%</p>
          </div>
        </div>
      </div>

      <PageHeader
        title="Dashboard"
        description="Resumen del negocio, clientes activos, inventario disponible y recomendaciones realizadas con enfoque comercial."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Clientes registrados" value={stats.clients} helper="Total de perfiles en sistema" icon={<Users size={18} />} />
        <StatCard label="Vehículos" value={stats.vehicles} helper="Inventario total" icon={<CarFront size={18} />} />
        <StatCard label="Disponibles" value={stats.availableVehicles} helper="Vehículos listos para ofertar" icon={<TrendingUp size={18} />} />
        <StatCard label="Recomendaciones" value={stats.recommendations} helper="Procesos ejecutados" icon={<BarChart3 size={18} />} />
        <StatCard label="Tasa de coincidencia" value={`${stats.avgMatch}%`} helper="Coincidencia promedio" icon={<CircleGauge size={18} />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="premium-surface rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recomendaciones recientes</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Historial</span>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 5).map((item) => {
              const client = clients.find((entry) => entry.id === item.clienteId);
              const topVehicle = item.resultados[0];

              return (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{client?.nombre ?? 'Cliente'}</p>
                    <p className="text-xs text-slate-500">{new Date(item.fecha).toLocaleDateString('es-CO')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">{topVehicle?.vehiculo ?? 'Sin vehículo'}</p>
                    <p className="text-xs text-slate-500">Coincidencia {item.mejorCoincidencia}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-700">Asesor</p>
                    <p className="text-xs text-slate-500">{item.asesor}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Vehículos más recomendados</h2>
          </div>

          <div className="space-y-4">
            {topVehicles.map((entry) => (
              <div key={entry.vehicle.id} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <img src={entry.vehicle.imagen} alt={entry.vehicle.modelo} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{entry.vehicle.modelo}</p>
                  <p className="text-xs text-slate-500">{entry.vehicle.tipo} • ${entry.vehicle.precio.toLocaleString('es-CO')}</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${entry.score}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-medium text-emerald-700">Coincidencia {entry.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
