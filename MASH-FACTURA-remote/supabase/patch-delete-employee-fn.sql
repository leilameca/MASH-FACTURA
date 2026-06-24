-- Función para borrar empleado y todos sus registros hijos.
-- Corre con privilegios elevados (security definer) para evitar bloqueos de RLS.

create or replace function public.delete_employee(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.production_records where employee_id = p_id;
  delete from public.payroll_payments   where employee_id = p_id;
  delete from public.payroll_adjustments where employee_id = p_id;
  delete from public.employees          where id = p_id;
end;
$$;

-- Permitir que usuarios autenticados llamen la función
grant execute on function public.delete_employee(uuid) to authenticated;
