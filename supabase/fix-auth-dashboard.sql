-- MASH Flow - emergency fix for Supabase Authentication > Users dashboard
-- Run this in Supabase SQL Editor if the Auth Users page crashes after schema.sql.
--
-- This only removes the automatic profile trigger on auth.users.
-- It does NOT delete clients, products, quotes, invoices, orders, or any app data.

begin;

drop trigger if exists create_profile_on_signup on auth.users;
drop function if exists public.create_profile_for_new_user();

commit;

