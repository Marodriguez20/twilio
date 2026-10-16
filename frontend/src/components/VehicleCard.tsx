import { ArrowRight, Gauge, Shield, Users } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  compact?: boolean;
}

export function VehicleCard({ vehicle, compact = false }: VehicleCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <img src={vehicle.imagen} alt={vehicle.modelo} className="h-52 w-full object-cover" />
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{vehicle.marca}</p>
            <h3 className="text-xl font-semibold text-slate-900">{vehicle.modelo}</h3>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{vehicle.estado}</span>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
          <div className="rounded-xl bg-slate-100 p-2">
            <p className="text-slate-500">Año</p>
            <p className="mt-1 font-semibold text-slate-800">{vehicle.anio}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-2">
            <p className="text-slate-500">Tipo</p>
            <p className="mt-1 font-semibold text-slate-800">{vehicle.tipo}</p>
          </div>
          <div className="rounded-xl bg-slate-100 p-2">
            <p className="text-slate-500">Pas.</p>
            <p className="mt-1 font-semibold text-slate-800">{vehicle.pasajeros}</p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-2"><Users size={15} className="text-amber-600" /> {vehicle.combustible}</div>
          <div className="flex items-center gap-2"><Gauge size={15} className="text-amber-600" /> {vehicle.consumo} L/100km</div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">${vehicle.precio.toLocaleString('es-CO')}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><Shield size={14} className="text-amber-600" /> Seguridad {vehicle.seguridad}/5</span>
        </div>

        {!compact ? (
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            Ver detalle <ArrowRight size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
