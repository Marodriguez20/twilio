import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
}

export function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div className="rounded-xl bg-amber-100 p-2 text-amber-700">{icon}</div>
      </div>
      <div className="mt-4 text-3xl font-bold text-slate-900">{value}</div>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </div>
  );
}
