import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv(['.env.local', '.env']);

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.env.MASH_ADMIN_EMAIL || env.MASH_ADMIN_EMAIL || 'admin@mashflow.com';
const password = process.env.MASH_ADMIN_PASSWORD || env.MASH_ADMIN_PASSWORD || 'MashFlow2026!';
const fullName = process.env.MASH_ADMIN_NAME || env.MASH_ADMIN_NAME || 'MASH Admin';

if (!supabaseUrl || !anonKey) {
  fail('Faltan VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local.');
}

if (supabaseUrl.includes('your-project.supabase.co')) {
  fail('VITE_SUPABASE_URL todavía usa el placeholder. Copia la URL real desde Supabase > Project Settings > API.');
}

if (serviceRoleKey && !serviceRoleKey.includes('your-service-role-key')) {
  await createWithServiceRole();
} else {
  await createWithSignUp();
}

async function createWithServiceRole() {
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error && !String(error.message).toLowerCase().includes('already')) {
    fail(error.message);
  }

  const userId = data?.user?.id || await findUserIdByEmail(admin, email);
  if (!userId) {
    fail('No pude obtener el ID del usuario creado.');
  }

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    full_name: fullName,
    email,
    role: 'admin',
    is_active: true,
  });

  if (profileError) {
    fail(profileError.message);
  }

  console.log('ADMIN_CREATED=true');
  console.log(`EMAIL=${email}`);
  console.log('PASSWORD_CONFIGURED=true');
  console.log('PROFILE_ROLE=admin');
}

async function createWithSignUp() {
  const supabase = createClient(supabaseUrl, anonKey);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    fail(`${error.message}. Si el registro está desactivado o requiere confirmación, agrega SUPABASE_SERVICE_ROLE_KEY a .env.local y vuelve a correr el script.`);
  }

  console.log('ADMIN_SIGNUP_REQUESTED=true');
  console.log(`EMAIL=${email}`);
  console.log(`EMAIL_CONFIRMATION_REQUIRED=${Boolean(data.user && !data.session)}`);
  console.log('NOTE=Si requiere confirmación, revisa Authentication > Users o usa SUPABASE_SERVICE_ROLE_KEY.');
}

async function findUserIdByEmail(admin, targetEmail) {
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return null;
  return data.users.find((user) => user.email === targetEmail)?.id ?? null;
}

function loadEnv(files) {
  const result = {};
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const line of content.split(/\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      result[key] = value;
    }
  }
  return result;
}

function fail(message) {
  console.error(`SETUP_ADMIN_ERROR=${message}`);
  process.exit(1);
}
