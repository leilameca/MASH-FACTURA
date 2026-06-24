import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

function ensureSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.');
  }
}

export async function listRows(table, { select = '*', search, searchColumns = [], filters = {}, orderBy = 'created_at', ascending = false } = {}) {
  ensureSupabase();
  let query = supabase.from(table).select(select);

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query = query.eq(key, value);
    }
  });

  if (search && searchColumns.length) {
    const term = `%${search}%`;
    query = query.or(searchColumns.map((column) => `${column}.ilike.${term}`).join(','));
  }

  const { data, error } = await query.order(orderBy, { ascending });
  if (error) throw error;
  return data ?? [];
}

export async function getRow(table, id, select = '*') {
  ensureSupabase();
  const { data, error } = await supabase.from(table).select(select).eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createRow(table, values) {
  ensureSupabase();
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data;
}

export async function updateRow(table, id, values) {
  ensureSupabase();
  const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table, id) {
  ensureSupabase();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export async function replaceChildren(table, foreignKey, parentId, rows) {
  ensureSupabase();
  const { error: deleteError } = await supabase.from(table).delete().eq(foreignKey, parentId);
  if (deleteError) throw deleteError;
  if (!rows.length) return [];
  const { data, error } = await supabase.from(table).insert(rows).select();
  if (error) throw error;
  return data ?? [];
}
