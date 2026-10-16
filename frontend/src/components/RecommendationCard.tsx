import { CheckCircle2, ChevronRight, TriangleAlert } from 'lucide-react';
import type { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onCompare?: () => void;
  onSelect?: () => void;
}

export function RecommendationCard({ recommendation, onCompare, onSelect }: RecommendationCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Recomendación</p>
            <h3 className="text-xl font-bold text-slate-900">{recommendation.vehiculo}</h3>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{recommendation.score}%</div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${recommendation.score}%` }} />
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(recommendation.factores).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                <span>{key}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Fortalezas</p>
            <ul className="space-y-2">
              {recommendation.fortalezas.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="mt-0.5 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">Aspectos que no coinciden</p>
            <ul className="space-y-2">
              {recommendation.observaciones.length > 0 ? (
                recommendation.observaciones.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-amber-700">
                    <TriangleAlert size={16} className="mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">No se presentan observaciones relevantes.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Ver detalles
          </button>
          <button onClick={onCompare} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Comparar <ChevronRight size={16} />
          </button>
          <button onClick={onSelect} className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950">
            Seleccionar
          </button>
        </div>
      </div>
    </div>
  );
}
