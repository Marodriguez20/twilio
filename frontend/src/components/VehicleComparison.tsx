import type { Vehicle } from '../types';

interface VehicleComparisonProps {
  vehicles: Vehicle[];
}

const comparisonFields = [
  'precio',
  'tipo',
  'pasajeros',
  'motor',
  'combustible',
  'transmision',
  'consumo',
  'seguridad',
  'potencia',
  'maletero',
];

export function VehicleComparison({ vehicles }: VehicleComparisonProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold">Atributo</th>
            {vehicles.map((vehicle) => (
              <th key={vehicle.id} className="px-4 py-3 font-semibold text-slate-900">
                {vehicle.marca} {vehicle.modelo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFields.map((field) => (
            <tr key={field} className="border-t border-slate-200">
              <td className="px-4 py-3 font-medium capitalize text-slate-700">{field}</td>
              {vehicles.map((vehicle) => (
                <td key={`${field}-${vehicle.id}`} className="px-4 py-3 text-slate-600">
                  {field === 'precio' ? `$${vehicle.precio.toLocaleString('es-CO')}` : field === 'tipo' ? vehicle.tipo : field === 'pasajeros' ? vehicle.pasajeros : field === 'motor' ? vehicle.motor : field === 'combustible' ? vehicle.combustible : field === 'transmision' ? vehicle.transmision : field === 'consumo' ? `${vehicle.consumo} L/100km` : field === 'seguridad' ? `${vehicle.seguridad}/5` : field === 'potencia' ? `${vehicle.potencia} HP` : `${vehicle.maletero} L`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
