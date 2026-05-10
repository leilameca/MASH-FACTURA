import { Building2, Globe, Percent, Save, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Toast } from '../../components/ui/Toast';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';

const DEFAULT_SETTINGS = {
  business_name: 'Martinez Star Home',
  brand_name: 'MASH',
  tax_id: '',
  email: '',
  phone: '',
  whatsapp: '',
  address: '',
  default_tax_rate: '0.18',
  currency: 'DOP',
  quote_prefix: 'COT',
  invoice_prefix: 'FAC',
  order_prefix: 'PED',
  repair_prefix: 'REP',
  quote_terms: 'Anticipo del 50% requerido para confirmar el pedido. El saldo se cancela a la entrega. Precios válidos por 30 días.',
  invoice_terms: 'El incumplimiento del pago en la fecha acordada generará cargos adicionales. MASH agradece su confianza.',
};

export function SettingsPage() {
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: DEFAULT_SETTINGS,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from('business_settings')
      .select('*')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettingsId(data.id);
          reset({ ...DEFAULT_SETTINGS, ...data });
        }
      });
  }, [reset]);

  async function onSubmit(values) {
    setSaving(true);
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => window.setTimeout(r, 600));
        setToast({ type: 'success', message: 'Cambios guardados (modo demo).' });
        return;
      }
      const payload = {
        ...values,
        default_tax_rate: Number(values.default_tax_rate),
      };
      if (settingsId) {
        await supabase.from('business_settings').update(payload).eq('id', settingsId);
      } else {
        await supabase.from('business_settings').insert(payload);
      }
      setToast({ type: 'success', message: 'Configuración guardada.' });
    } catch {
      setToast({ type: 'error', message: 'No se pudo guardar. Verifica los campos.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <Toast message={toast?.message} type={toast?.type} />

      <PageHeader
        subtitle="Datos corporativos, impuestos, prefijos y términos de documentos."
        title="Configuración"
        actions={
          <Button icon={Save} loading={saving} onClick={handleSubmit(onSubmit)}>
            Guardar cambios
          </Button>
        }
      />

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <SettingsSection icon={Building2} title="Datos de la empresa">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              error={errors.business_name?.message}
              label="Nombre de la empresa"
              {...register('business_name', { required: 'Requerido.' })}
            />
            <Input label="Marca / Brand name" {...register('brand_name')} />
            <Input label="RNC / Cédula fiscal" {...register('tax_id')} />
            <Input label="Email" type="email" {...register('email')} />
            <Input label="Teléfono" {...register('phone')} />
            <Input label="WhatsApp" {...register('whatsapp')} />
            <div className="md:col-span-2">
              <Textarea label="Dirección" rows={2} {...register('address')} />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection icon={Percent} title="Impuestos y moneda">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Moneda" {...register('currency')}>
              <option value="DOP">DOP — Peso dominicano</option>
              <option value="USD">USD — Dólar americano</option>
              <option value="EUR">EUR — Euro</option>
            </Select>
            <Select label="ITBIS por defecto" {...register('default_tax_rate')}>
              <option value="0.18">18%</option>
              <option value="0.16">16%</option>
              <option value="0">Sin ITBIS</option>
            </Select>
          </div>
        </SettingsSection>

        <SettingsSection icon={Tag} title="Prefijos de documentos">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              helper='Ej: "COT" → COT-0001'
              label="Prefijo cotizaciones"
              {...register('quote_prefix')}
            />
            <Input
              helper='Ej: "FAC" → FAC-0001'
              label="Prefijo facturas"
              {...register('invoice_prefix')}
            />
            <Input
              helper='Ej: "PED" → PED-0001'
              label="Prefijo pedidos"
              {...register('order_prefix')}
            />
            <Input
              helper='Ej: "REP" → REP-0001'
              label="Prefijo reparaciones"
              {...register('repair_prefix')}
            />
          </div>
        </SettingsSection>

        <SettingsSection icon={Globe} title="Términos de documentos">
          <div className="space-y-4">
            <Textarea
              helper="Aparece al final de cada cotización generada en PDF."
              label="Términos y condiciones — Cotización"
              rows={4}
              {...register('quote_terms')}
            />
            <Textarea
              helper="Aparece al final de cada factura generada en PDF."
              label="Términos y condiciones — Factura"
              rows={4}
              {...register('invoice_terms')}
            />
          </div>
        </SettingsSection>

      </form>
    </div>
  );
}

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <Card>
      <div className="mb-5 flex items-center gap-2.5 border-b border-mash-border pb-4">
        <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-mash-surface2">
          <Icon className="h-4 w-4 text-mash-text2" />
        </div>
        <h2 className="text-[15px] font-semibold text-mash-text1">{title}</h2>
      </div>
      {children}
    </Card>
  );
}
