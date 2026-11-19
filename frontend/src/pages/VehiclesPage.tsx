import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { VehicleCard } from '../components/VehicleCard';
import { api } from '../lib/api';
import type { Vehicle } from '../types';

const emptyVehicle: Omit<Vehicle, 'id' | 'createdAt'> = {
  marca: 'Chevrolet',
  modelo: '',
  anio: 2025,
  precio: 0,
  tipo: 'SUV',
  pasajeros: 5,
  motor: '',
  combustible: 'Gasolina',
  transmision: 'Automática',
  consumo: 12,
  seguridad: 4,
  potencia: 120,
  diseno: 4,
  maletero: 400,
  descripcion: '',
  imagen: '/images/vehicles/chevrolet-tracker.png',
  estado: 'Disponible',
};

function FieldBlock({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {hint ? <span className="mb-1.5 block text-[11px] text-slate-500">{hint}</span> : null}
      {children}
    </label>
  );
}

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<Omit<Vehicle, 'id' | 'createdAt'>>({ ...emptyVehicle });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.updateVehicle(editingId, { ...form, id: editingId });
      } else {
        await api.createVehicle(form);
      }
      setForm({ ...emptyVehicle });
      setEditingId(null);
      fetchVehicles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo guardar el vehículo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desea eliminar este vehículo?')) return;
    try {
      await api.deleteVehicle(id);
      fetchVehicles();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo eliminar');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      anio: vehicle.anio,
      precio: vehicle.precio,
      tipo: vehicle.tipo,
      pasajeros: vehicle.pasajeros,
      motor: vehicle.motor,
      combustible: vehicle.combustible,
      transmision: vehicle.transmision,
      consumo: vehicle.consumo,
      seguridad: vehicle.seguridad,
      potencia: vehicle.potencia,
      diseno: vehicle.diseno,
      maletero: vehicle.maletero,
      descripcion: vehicle.descripcion,
      imagen: vehicle.imagen,
      estado: vehicle.estado,
    });
  };

  return (
    <>
      <PageHeader
        title="Vehículos"
        description="Administre el inventario y mantenga actualizada la información disponible para asesoría comercial."
        action={<button className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white"><Plus size={16} /> Nuevo vehículo</button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Listado y detalle</h2>
          {loading ? <p>Cargando vehículos...</p> : (
            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="relative">
                  <VehicleCard vehicle={vehicle} compact />
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleEdit(vehicle)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"><Pencil size={12} /> Editar</button>
                    <button onClick={() => handleDelete(vehicle.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600"><Trash2 size={12} /> Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <h2 className="text-lg font-semibold text-slate-900">{editingId ? 'Editar vehículo' : 'Registrar vehículo'}</h2>
            <p className="mt-1 text-xs text-slate-600">Complete cada dato para mantener el inventario con información útil, clara y consistente para asesoría comercial.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldBlock label="Marca" hint="Marca del vehículo en el catálogo.">
                <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} placeholder="Ej. Chevrolet" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Modelo" hint="Nombre del modelo comercial.">
                <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} placeholder="Ej. Tracker" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Año" hint="Modelo del vehículo disponible en inventario.">
                <input type="number" value={form.anio} onChange={(e) => setForm({ ...form, anio: Number(e.target.value) })} placeholder="Ej. 2025" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Precio" hint="Precio del vehículo en pesos colombianos.">
                <input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} placeholder="Ej. 98000000" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Tipo" hint="Categoría del vehículo según el uso y perfil del cliente.">
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Vehicle['tipo'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                  {['Sedán','SUV','Hatchback','Pickup','Deportivo'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FieldBlock>
              <FieldBlock label="Pasajeros" hint="Capacidad máxima de ocupantes.">
                <input type="number" value={form.pasajeros} onChange={(e) => setForm({ ...form, pasajeros: Number(e.target.value) })} placeholder="Ej. 5" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Motor" hint="Especificación del motor principal del vehículo.">
                <input value={form.motor} onChange={(e) => setForm({ ...form, motor: e.target.value })} placeholder="Ej. 1.5 Turbo" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Combustible" hint="Tipo de energía recomendado para el vehículo.">
                <select value={form.combustible} onChange={(e) => setForm({ ...form, combustible: e.target.value as Vehicle['combustible'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                  {['Gasolina','Diésel','Híbrido','Eléctrico'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FieldBlock>
              <FieldBlock label="Transmisión" hint="Automática o manual según la configuración del vehículo.">
                <select value={form.transmision} onChange={(e) => setForm({ ...form, transmision: e.target.value as Vehicle['transmision'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                  {['Automática','Manual'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FieldBlock>
              <FieldBlock label="Consumo" hint="Consumo estimado del vehículo en L/100 km.">
                <input type="number" value={form.consumo} onChange={(e) => setForm({ ...form, consumo: Number(e.target.value) })} placeholder="Ej. 7.8" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Seguridad" hint="Calificación general del nivel de seguridad del vehículo (1 a 5).">
                <input type="number" min={1} max={5} value={form.seguridad} onChange={(e) => setForm({ ...form, seguridad: Number(e.target.value) })} placeholder="Ej. 4" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Potencia" hint="Caballos de fuerza estimados del vehículo.">
                <input type="number" value={form.potencia} onChange={(e) => setForm({ ...form, potencia: Number(e.target.value) })} placeholder="Ej. 155" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Diseño" hint="Nivel de preferencia de estilo y estética del vehículo (1 a 5).">
                <input type="number" min={1} max={5} value={form.diseno} onChange={(e) => setForm({ ...form, diseno: Number(e.target.value) })} placeholder="Ej. 4" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Maletero" hint="Capacidad del maletero en litros.">
                <input type="number" value={form.maletero} onChange={(e) => setForm({ ...form, maletero: Number(e.target.value) })} placeholder="Ej. 420" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
            </div>

            <FieldBlock label="Descripción" hint="Resumen breve de las principales ventajas del vehículo.">
              <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej. SUV versátil con espacio familiar, buen consumo y tecnología de seguridad." className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </FieldBlock>
            <FieldBlock label="URL de imagen" hint="Enlace visual del vehículo para mostrarlo en fichas y resultados.">
              <input value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3 py-2" />
            </FieldBlock>

            <FieldBlock label="Estado" hint="Situación actual del vehículo en inventario.">
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as Vehicle['estado'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                {['Disponible','Reservado','Vendido','No disponible'].map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </FieldBlock>

            <button type="submit" className="w-full rounded-xl bg-amber-500 px-4 py-2.5 font-medium text-slate-950">{editingId ? 'Guardar cambios' : 'Registrar vehículo'}</button>
          </form>
        </aside>
      </div>
    </>
  );
}
