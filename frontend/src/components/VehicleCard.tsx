import { ArrowRight, Gauge, Shield, Users } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  compact?: boolean;
}

export function VehicleCard({ vehicle, compact = false }: VehicleCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <img src={vehicle.imagen} alt={vehicle.modelo} className="h-52 w-full object-cover" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-slate-950/65 to-transparent p-3">
          <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {vehicle.marca}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{vehicle.modelo}</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-400">{vehicle.tipo}</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">{vehicle.estado}</span>
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
          <span className="text-lg font-black text-slate-900">${vehicle.precio.toLocaleString('es-CO')}</span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500"><Shield size={14} className="text-amber-600" /> Seguridad {vehicle.seguridad}/5</span>
        </div>

        {!compact ? (
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
            Ver detalle <ArrowRight size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
