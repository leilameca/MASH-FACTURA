import { LogOut, Save, UserCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';

const DEFAULT_PROFILE = {
  full_name: '',
  email: '',
  phone: '',
  avatar_url: '',
};

export function AccountPage() {
  const { user, signOut } = useAuth();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fallbackName = useMemo(
    () => user?.user_metadata?.full_name ?? user?.email ?? 'Martinez Star Home',
    [user],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: DEFAULT_PROFILE,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!user) return;

    reset({
      ...DEFAULT_PROFILE,
      full_name: fallbackName,
      email: user.email ?? '',
    });

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase
      .from('profiles')
      .select('full_name,email,phone,avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          reset({
            ...DEFAULT_PROFILE,
            ...data,
            email: data.email ?? user.email ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, [fallbackName, reset, user]);

  async function onSubmit(values) {
    setSaving(true);
    try {
      if (!isSupabaseConfigured || !user) {
        setToast({ type: 'error', message: 'Supabase no está configurado para guardar la cuenta.' });
        return;
      }

      const payload = {
        full_name: values.full_name.trim(),
        phone: values.phone?.trim() || null,
        avatar_url: values.avatar_url?.trim() || null,
      };

      const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
      if (error) throw error;

      setToast({ type: 'success', message: 'Cuenta actualizada.' });
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
        subtitle="Perfil interno, contacto y datos visibles para el equipo."
        title="Mi cuenta"
        actions={
          <Button icon={Save} loading={saving} onClick={handleSubmit(onSubmit)}>
            Guardar
          </Button>
        }
      />

      <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <div className="mb-5 flex items-center gap-2.5 border-b border-mash-border pb-4">
            <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-mash-surface2">
              <UserCircle className="h-4 w-4 text-mash-text2" />
            </div>
            <h2 className="text-[15px] font-semibold text-mash-text1">Datos de usuario</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              disabled={loading}
              error={errors.full_name?.message}
              label="Nombre completo"
              {...register('full_name', { required: 'El nombre es requerido.' })}
            />
            <Input disabled label="Email de acceso" type="email" {...register('email')} />
            <Input disabled={loading} label="Teléfono" {...register('phone')} />
            <Input disabled={loading} label="URL de avatar" {...register('avatar_url')} />
          </div>
        </Card>

        <Card className="self-start">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-mash-brand text-sm font-semibold text-white">
              MS
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-mash-text1">{fallbackName}</p>
              <p className="truncate text-xs text-mash-text3">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-mash-border bg-mash-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-mash-text3">Acceso</p>
            <p className="mt-2 text-sm text-mash-text2">
              Esta cuenta usa la autenticación de Supabase. El email de acceso se cambia desde el panel de Auth si hace falta.
            </p>
          </div>
          <Button className="mt-5 w-full" icon={LogOut} onClick={signOut} variant="secondary">
            Cerrar sesión
          </Button>
        </Card>
      </form>
    </div>
  );
}
