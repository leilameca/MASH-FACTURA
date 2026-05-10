import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import logoSrc from '../../assets/logo.png';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
  const { session, signIn, resetPassword, isSupabaseConfigured } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { email: 'admin@mashflow.com', password: 'MashFlow2026!' } });

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
          <img alt="MASH" className="mx-auto h-16 w-auto object-contain" src={logoSrc} />
          <div className="my-5 h-px bg-mash-border" />
          <h1 className="text-2xl font-bold text-mash-text1">Bienvenido a MASH Flow</h1>
          <p className="mt-2 text-sm text-mash-text3">Ingresa tus credenciales para continuar</p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" prefix={Mail} type="email" {...register('email', { required: true })} />

          <div className="relative">
            <Input
              label="Contraseña"
              prefix={Lock}
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: true })}
            />
            <button
              className="absolute bottom-0 right-0 grid h-12 w-11 place-items-center text-mash-text3 transition hover:text-mash-text1 md:h-10"
              onClick={() => setShowPassword((v) => !v)}
              type="button"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="text-right">
            <button
              className="text-[13px] text-mash-text3 transition hover:text-mash-text1"
              onClick={() => setForgotOpen(true)}
              type="button"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error ? (
            <p className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
          ) : null}
          {!isSupabaseConfigured ? (
            <p className="rounded-[10px] border border-mash-border bg-mash-surface2 p-3 text-xs leading-5 text-mash-text3">
              Supabase no está configurado. Revisa <code>.env.local</code> y reinicia el servidor.
            </p>
          ) : null}

          <Button className="w-full" loading={isSubmitting} type="submit">
            Ingresar al sistema
          </Button>
        </form>

        <p className="mt-8 text-center text-[11px] text-mash-text4">MASH Flow — Solo uso interno</p>
      </section>

      {forgotOpen ? (
        <ForgotPasswordModal
          isSupabaseConfigured={isSupabaseConfigured}
          onClose={() => setForgotOpen(false)}
          resetPassword={resetPassword}
        />
      ) : null}
    </main>
  );
}

function ForgotPasswordModal({ onClose, resetPassword, isSupabaseConfigured }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    try {
      if (!isSupabaseConfigured) {
        await new Promise((r) => window.setTimeout(r, 700));
        setSent(true);
        return;
      }
      const { error: resetError } = await resetPassword(email.trim());
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-mash-text1">Recuperar contraseña</h2>
          <button
            className="grid h-9 w-9 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="rounded-[10px] border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Correo enviado a <strong>{email}</strong>. Revisa tu bandeja y sigue el enlace para restablecer tu contraseña.
              </p>
            </div>
            <Button className="w-full" onClick={onClose} variant="secondary">
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-mash-text3">
              Escribe tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <Input
              autoFocus
              label="Email"
              onChange={(e) => setEmail(e.target.value)}
              prefix={Mail}
              type="email"
              value={email}
            />
            {error ? (
              <p className="rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>
            ) : null}
            <div className="flex gap-3">
              <Button className="flex-1" disabled={sending} onClick={onClose} variant="secondary">
                Cancelar
              </Button>
              <Button className="flex-1" disabled={!email.trim()} loading={sending} onClick={handleReset}>
                Enviar enlace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
