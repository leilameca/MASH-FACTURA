import { Eye, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { session, signIn, isSupabaseConfigured } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { email: 'admin@mashflow.local', password: 'mashflow' } });

  if (session) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(values) {
    setError('');
    const { error: authError } = await signIn(values.email, values.password);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0A0A0B] px-4 py-10">
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(201,185,154,0.10),transparent_65%)]" />
      <p className="absolute left-8 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[11px] tracking-[0.2em] text-[#2A2A2E] lg:block">
        MARTINEZ STAR HOME - SISTEMA INTERNO
      </p>

      <section className="relative w-full max-w-[400px] rounded-3xl bg-white px-6 py-8 shadow-[0_32px_64px_rgba(0,0,0,0.35)] md:px-9 md:py-10">
        <div className="text-center">
          <div className="mx-auto grid h-10 w-28 place-items-center rounded-[10px] border border-mash-border text-xl font-bold tracking-[-0.015em] text-mash-brand">
            MASH
          </div>
          <div className="my-5 h-px bg-mash-border" />
          <h1 className="text-2xl font-bold text-mash-text1">Bienvenido a MASH Flow</h1>
          <p className="mt-2 text-sm text-mash-text3">Ingresa tus credenciales para continuar</p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" prefix={Mail} type="email" {...register('email', { required: true })} />
          <div className="relative">
            <Input label="Contraseña" prefix={Lock} type="password" {...register('password', { required: true })} />
            <button className="absolute bottom-0 right-0 grid h-12 w-11 place-items-center text-mash-text3 md:h-10" type="button">
              <Eye className="h-4 w-4" />
            </button>
          </div>
          <div className="text-right">
            <button className="text-[13px] text-mash-text3 hover:text-mash-text1" type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {error ? <p className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
          {!isSupabaseConfigured ? (
            <p className="rounded-[10px] border border-mash-border bg-mash-surface2 p-3 text-xs leading-5 text-mash-text3">
              Modo demo activo hasta configurar Supabase en `.env`.
            </p>
          ) : null}
          <Button className="w-full" loading={isSubmitting} type="submit">
            Ingresar al sistema
          </Button>
        </form>

        <p className="mt-8 text-center text-[11px] text-mash-text4">MASH Flow - Solo uso interno</p>
      </section>
    </main>
  );
}
