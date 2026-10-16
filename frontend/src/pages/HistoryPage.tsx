import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { api } from '../lib/api';
import type { Client, RecommendationRecord } from '../types';

export function HistoryPage() {
  const [records, setRecords] = useState<RecommendationRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [history, clientsData] = await Promise.all([api.getRecommendations(), api.getClients()]);
        setRecords(history);
        setClients(clientsData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <PageHeader
        title="Historial de recomendaciones"
        description="Consulta el historial de evaluaciones comerciales ejecutadas y compáralas con resultados previos."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Vehículo recomendado</th>
                <th className="px-3 py-2">Porcentaje</th>
                <th className="px-3 py-2">Asesor</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const client = clients.find((entry) => entry.id === record.clienteId);
                const recommendedVehicle = record.resultados[0];
                return (
                  <tr key={record.id} className="border-t border-slate-200">
                    <td className="px-3 py-2 font-medium text-slate-900">{client?.nombre ?? record.clienteId}</td>
                    <td className="px-3 py-2 text-slate-600">{new Date(record.fecha).toLocaleDateString('es-CO')}</td>
                    <td className="px-3 py-2 text-slate-600">{recommendedVehicle?.vehiculo ?? 'Sin resultado'}</td>
                    <td className="px-3 py-2 font-semibold text-emerald-700">{record.mejorCoincidencia}%</td>
                    <td className="px-3 py-2 text-slate-600">{record.asesor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
