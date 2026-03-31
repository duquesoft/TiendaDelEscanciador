-- Migración: Fix store_settings table to accept TEXT values
-- Ejecutar esto en Supabase SQL Editor si ya has corrido el setup-admin.sql anterior

-- Primero, hacer un backup de los datos existentes
-- Luego, recrear la tabla con el tipo correcto
ALTER TABLE public.store_settings 
  ALTER COLUMN value TYPE TEXT;

-- Insertar valor por defecto para shipping_fee si no existe
INSERT INTO public.store_settings (key, value)
VALUES ('shipping_fee', '0')
ON CONFLICT (key) DO NOTHING;
