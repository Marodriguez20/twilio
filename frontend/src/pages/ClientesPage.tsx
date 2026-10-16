import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { api } from '../lib/api';
import type { Client } from '../types';

const emptyClient: Omit<Client, 'id' | 'createdAt'> = {
  nombre: '',
  documento: '',
  telefono: '',
  email: '',
  ingresos: 0,
  presupuesto: 0,
  familia: 1,
  pasajeros: 2,
  uso: 'Mixto',
  tipoVehiculo: 'SUV',
  combustible: 'Gasolina',
  transmision: 'Automática',
  importanciaConsumo: 3,
  importanciaSeguridad: 3,
  preferenciaDiseno: 3,
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

export function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<Omit<Client, 'id' | 'createdAt'>>({ ...emptyClient });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.updateClient(editingId, { ...form, id: editingId });
      } else {
        await api.createClient(form);
      }

      setForm({ ...emptyClient });
      setEditingId(null);
      fetchClients();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo guardar el cliente');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setForm({
      nombre: client.nombre,
      documento: client.documento,
      telefono: client.telefono,
      email: client.email,
      ingresos: client.ingresos,
      presupuesto: client.presupuesto,
      familia: client.familia,
      pasajeros: client.pasajeros,
      uso: client.uso,
      tipoVehiculo: client.tipoVehiculo,
      combustible: client.combustible,
      transmision: client.transmision,
      importanciaConsumo: client.importanciaConsumo,
      importanciaSeguridad: client.importanciaSeguridad,
      preferenciaDiseno: client.preferenciaDiseno,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desea eliminar este cliente?')) return;
    try {
      await api.deleteClient(id);
      fetchClients();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo eliminar');
    }
  };

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Registre y actualice los perfiles de clientes para generar recomendaciones relevantes."
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            <Plus size={16} /> Nuevo cliente
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Listado de clientes</h2>
          {loading ? (
            <p className="text-slate-500">Cargando clientes...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Documento</th>
                    <th className="px-3 py-2">Presupuesto</th>
                    <th className="px-3 py-2">Uso</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-t border-slate-200">
                      <td className="px-3 py-2 font-medium text-slate-900">{client.nombre}</td>
                      <td className="px-3 py-2 text-slate-600">{client.documento}</td>
                      <td className="px-3 py-2 text-slate-600">${client.presupuesto.toLocaleString('es-CO')}</td>
                      <td className="px-3 py-2 text-slate-600">{client.uso}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(client)} className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(client.id)} className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{editingId ? 'Editar cliente' : 'Registrar cliente'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldBlock label="Nombre completo" hint="Nombre del cliente tal como lo registrará el asesor.">
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Ana García" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Documento" hint="Cédula o NIT para identificar al cliente.">
                <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} placeholder="Ej. 1032456789" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Teléfono" hint="Número de contacto principal del cliente.">
                <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Ej. 3001234567" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Correo electrónico" hint="Correo para seguimiento y cotizaciones.">
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@correo.com" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Ingresos mensuales" hint="Ingresos del cliente en pesos colombianos para evaluar capacidad de compra.">
                <input type="number" value={form.ingresos} onChange={(e) => setForm({ ...form, ingresos: Number(e.target.value) })} placeholder="Ej. 6500000" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Presupuesto disponible" hint="Monto máximo que el cliente puede pagar por el vehículo.">
                <input type="number" value={form.presupuesto} onChange={(e) => setForm({ ...form, presupuesto: Number(e.target.value) })} placeholder="Ej. 85000000" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Integrantes de la familia" hint="Número total de personas que usarán el vehículo en casa.">
                <input type="number" min={1} value={form.familia} onChange={(e) => setForm({ ...form, familia: Number(e.target.value) })} placeholder="Ej. 4" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Pasajeros requeridos" hint="Capacidad mínima de ocupantes necesaria para el cliente.">
                <input type="number" min={1} value={form.pasajeros} onChange={(e) => setForm({ ...form, pasajeros: Number(e.target.value) })} placeholder="Ej. 5" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldBlock label="Tipo de uso" hint="Cómo se usará el vehículo: ciudad, carretera, familiar, trabajo, etc.">
                <select value={form.uso} onChange={(e) => setForm({ ...form, uso: e.target.value as Client['uso'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                  {['Ciudad','Carretera','Mixto','Trabajo','Familiar','Comercial'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FieldBlock>
              <FieldBlock label="Tipo de vehículo preferido" hint="Categoría principal que más le gusta al cliente.">
                <select value={form.tipoVehiculo} onChange={(e) => setForm({ ...form, tipoVehiculo: e.target.value as Client['tipoVehiculo'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                  {['Sedán','SUV','Hatchback','Pickup','Deportivo'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FieldBlock>
              <FieldBlock label="Combustible preferido" hint="Tipo de energía que el cliente prioriza.">
                <select value={form.combustible} onChange={(e) => setForm({ ...form, combustible: e.target.value as Client['combustible'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                  {['Gasolina','Diésel','Híbrido','Eléctrico'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FieldBlock>
              <FieldBlock label="Transmisión preferida" hint="Automática o manual según la experiencia del cliente.">
                <select value={form.transmision} onChange={(e) => setForm({ ...form, transmision: e.target.value as Client['transmision'] })} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                  {['Automática','Manual'].map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </FieldBlock>
              <FieldBlock label="Importancia del consumo" hint="Calificación del 1 al 5 para priorizar eficiencia de combustible.">
                <input type="number" min={1} max={5} value={form.importanciaConsumo} onChange={(e) => setForm({ ...form, importanciaConsumo: Number(e.target.value) })} placeholder="Ej. 4" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <FieldBlock label="Importancia de seguridad" hint="Calificación del 1 al 5 para priorizar elementos de seguridad.">
                <input type="number" min={1} max={5} value={form.importanciaSeguridad} onChange={(e) => setForm({ ...form, importanciaSeguridad: Number(e.target.value) })} placeholder="Ej. 5" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              </FieldBlock>
              <div className="sm:col-span-2">
                <FieldBlock label="Preferencia de diseño" hint="Nivel de prioridad que el cliente asigna al estilo y presencia del vehículo.">
                  <input type="number" min={1} max={5} value={form.preferenciaDiseno} onChange={(e) => setForm({ ...form, preferenciaDiseno: Number(e.target.value) })} placeholder="Ej. 3" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
                </FieldBlock>
              </div>
            </div>

            <button type="submit" className="w-full rounded-xl bg-amber-500 px-4 py-2.5 font-medium text-slate-950">
              {editingId ? 'Guardar cambios' : 'Registrar cliente'}
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
