-- Cambia la FK de production_records.employee_id a ON DELETE CASCADE
-- para permitir eliminar empleados eliminando sus registros automáticamente.

begin;

alter table public.production_records
  drop constraint if exists production_records_employee_id_fkey;

alter table public.production_records
  add constraint production_records_employee_id_fkey
  foreign key (employee_id)
  references public.employees(id)
  on delete cascade;

commit;
