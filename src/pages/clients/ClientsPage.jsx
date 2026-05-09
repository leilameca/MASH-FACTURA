import { ChevronRight, Eye, Pencil, Plus } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { clients } from '../../constants/mockData';

const columns = [
  { key: 'id', label: '#' },
  { key: 'client', label: 'Cliente' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'last', label: 'Última actividad' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: 'Acciones', align: 'right' },
];

export function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        actions={<Button icon={Plus}>Nuevo cliente</Button>}
        count="48"
        subtitle="Relaciones, historial y facturación de cada cliente."
        title="Clientes"
      />

      <div className="space-y-3">
        <SearchBar placeholder="Buscar por nombre, email o teléfono..." />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {['Todos', 'Activos', 'Con deuda', 'Sin pedidos'].map((chip, index) => (
            <Chip active={index === 0} key={chip}>{chip}</Chip>
          ))}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {clients.map((client) => (
          <Card className="p-4" clickable key={client.id}>
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mash-surface2 text-xs font-semibold text-mash-text1">
                {client.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[15px] font-semibold text-mash-text1">{client.name}</p>
                  <Badge variant={client.status === 'Activo' ? 'olive' : 'warning'}>{client.status}</Badge>
                </div>
                <p className="mt-1 truncate text-[13px] text-mash-text3">{client.email}</p>
                <p className="mt-3 text-xs text-mash-text3">
                  {client.phone} · {client.last} · <span className="font-mono text-mash-text1">{client.total}</span>
                </p>
              </div>
              <ChevronRight className="mt-2 h-4 w-4 text-mash-borderMd" />
            </div>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={clients}
        renderRow={(client) => (
          <tr className="border-b border-mash-surface2 transition hover:bg-mash-bg" key={client.id}>
            <td className="px-4 py-4 font-mono text-xs text-mash-text3">{client.id}</td>
            <td className="px-4 py-4 text-sm font-semibold text-mash-text1">{client.name}</td>
            <td className="px-4 py-4 text-sm text-mash-text3">{client.email}</td>
            <td className="px-4 py-4 text-sm text-mash-text3">{client.phone}</td>
            <td className="px-4 py-4 text-sm text-mash-text3">{client.last}</td>
            <td className="px-4 py-4 text-right font-mono text-sm text-mash-text1">{client.total}</td>
            <td className="px-4 py-4"><Badge variant={client.status === 'Activo' ? 'olive' : 'warning'}>{client.status}</Badge></td>
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end gap-1">
                <button className="grid h-9 w-9 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2 hover:text-mash-text1" type="button"><Eye className="h-4 w-4" /></button>
                <button className="grid h-9 w-9 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2 hover:text-mash-text1" type="button"><Pencil className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
