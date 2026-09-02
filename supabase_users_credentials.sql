-- ==============================================================================
-- CLEANPRO / SERS SOLUCIONES OPERATIVAS
-- SCRIPT DE MÓDULO PERSONAL, CREDENCIALES DE ACCESO Y PERFILES DE USUARIO
-- Supabase SQL Editor
-- ==============================================================================

-- 1. TABLA DE USUARIOS Y ACCESOS DEL SISTEMA (app_users)
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operative', -- 'admin', 'operative', 'client'
    job_title TEXT,
    phone TEXT,
    assigned_zone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'activo',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. AMPLIAR TABLA EMPLEADOS PARA COMPATIBILIDAD CON CREDENCIALES
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS job_title TEXT;

-- 3. HABILITAR SEGURIDAD A NIVEL DE FILAS (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACCESO PARA app_users (Permitir lectura y actualización por la app)
DROP POLICY IF EXISTS "Permitir lectura completa de app_users" ON public.app_users;
CREATE POLICY "Permitir lectura completa de app_users" ON public.app_users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercion en app_users" ON public.app_users;
CREATE POLICY "Permitir insercion en app_users" ON public.app_users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion en app_users" ON public.app_users;
CREATE POLICY "Permitir actualizacion en app_users" ON public.app_users
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir eliminacion en app_users" ON public.app_users;
CREATE POLICY "Permitir eliminacion en app_users" ON public.app_users
    FOR DELETE USING (true);

-- 5. PUBLICACIÓN REALTIME PARA app_users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'app_users'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.app_users;
    END IF;
END $$;

-- 6. INSERTAR / ACTUALIZAR CREDENCIALES OFICIALES SOLICITADAS
INSERT INTO public.app_users (
    id, name, email, username, password, role, job_title, phone, assigned_zone, avatar_url, status, notes
) VALUES 
-- Credencial 1: Harold Anguiano Morales (Administrador)
(
    'USR-HAROLD-01',
    'Harold Anguiano Morales',
    'haroldo90@hotmail.com',
    'haroldo90',
    'Chevropar#1970',
    'admin',
    'Director General / Administrador',
    '+52 55 1234 5678',
    'Oficina Central / Todas las Zonas',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'activo',
    'Acceso total como Administrador General de SERS Soluciones Operativas'
),
-- Credencial 2: José del Carmen Sotero (Operativo / Supervisor con clave segura generada)
(
    'USR-JOSE-02',
    'José del Carmen Sotero',
    'contacto.sers@gmail.com',
    'josesers',
    'Sers#Segura2025!',
    'operative',
    'Supervisor Operativo / Técnico Especialista',
    '+52 99 3123 4567',
    'Zona Industrial y Corporativa',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'activo',
    'Supervisor de Calidad en Sitio y Responsable de Cuadrilla'
),
-- Credencial 3: Carlos Mendoza (Operativo)
(
    'USR-CARLOS-03',
    'Carlos Mendoza',
    'carlos.mendoza@limpiezapro.com',
    'carlos.mendoza',
    'Carlos#Operativo2025',
    'operative',
    'Técnico Especialista de Limpieza',
    '+52 55 6789 0123',
    'Corredor Reforma / Centro',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    'activo',
    'Técnico líder asignado a Oficinas Corporativas SkyTower'
),
-- Credencial 4: Lic. Sofía Martínez (Cliente SkyTower)
(
    'USR-CLIENTE-04',
    'Lic. Sofía Martínez',
    'smartinez@skytower.com',
    'cliente.skytower',
    'SkyTower#Cliente2025',
    'client',
    'Gerente Administrativa - SkyTower',
    '+52 55 4321 9876',
    'Paseo de la Reforma #505',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    'activo',
    'Acceso a portal de cliente, reportes de 3 días y cotizaciones'
)
ON CONFLICT (username) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    job_title = EXCLUDED.job_title,
    phone = EXCLUDED.phone,
    assigned_zone = EXCLUDED.assigned_zone,
    avatar_url = EXCLUDED.avatar_url,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- 7. SINCRONIZAR A TABLA EMPLEADOS
INSERT INTO public.employees (
    id, name, role, phone, email, assigned_zone, status, services_completed_this_month, username, password, avatar_url, notes, job_title
) VALUES
(
    'EMP-00',
    'Harold Anguiano Morales',
    'Director General / Administrador',
    '+52 55 1234 5678',
    'haroldo90@hotmail.com',
    'Oficina Central / Todas las Zonas',
    'activo',
    0,
    'haroldo90',
    'Chevropar#1970',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'Administrador General del Sistema SERS Soluciones Operativas',
    'Director General / Administrador'
),
(
    'EMP-04',
    'José del Carmen Sotero',
    'Supervisor Operativo / Especialista',
    '+52 99 3123 4567',
    'contacto.sers@gmail.com',
    'Zona Industrial y Corporativa',
    'activo',
    38,
    'josesers',
    'Sers#Segura2025!',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'Supervisor Operativo en Sitio y Coordinador de Insumos',
    'Supervisor Operativo / Especialista'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    assigned_zone = EXCLUDED.assigned_zone,
    status = EXCLUDED.status,
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    avatar_url = EXCLUDED.avatar_url,
    notes = EXCLUDED.notes,
    job_title = EXCLUDED.job_title,
    updated_at = NOW();
