-- MASH Flow - enum patch for module implementation
-- Run after schema.sql if you already created the database.

alter type public.payment_method add value if not exists 'qik';

alter type public.expense_category add value if not exists 'suplidores';
alter type public.expense_category add value if not exists 'transporte';
alter type public.expense_category add value if not exists 'publicidad';

alter type public.document_type add value if not exists 'albaran_entrega';
alter type public.document_type add value if not exists 'albaran_recogida';
alter type public.document_type add value if not exists 'recibo_pago';

alter table public.repairs add column if not exists pickup_time time;
alter table public.repairs add column if not exists delivered_by text;
