-- ==============================================================================
-- CLEANPRO / SERS SOLUCIONES OPERATIVAS
-- ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- Proyecto: ksnvpnvpajhujmwutumh
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    contract_frequency TEXT DEFAULT 'Lunes a Viernes',
    auto_3day_report BOOLEAN DEFAULT TRUE,
    monthly_fee NUMERIC(12, 2) DEFAULT 0,
    assigned_employee_id TEXT,
    assigned_employee_name TEXT,
    assigned_employee_phone TEXT,
    assigned_employee_role TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMPLEADOS Y PERSONAL
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Técnico Especialista de Limpieza',
    job_title TEXT,
    phone TEXT,
    email TEXT,
    assigned_zone TEXT,
    status TEXT DEFAULT 'activo',
    services_completed_this_month INTEGER DEFAULT 0,
    username TEXT,
    password TEXT,
    avatar_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.1 USUARIOS Y ACCESOS DEL SISTEMA
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operative',
    job_title TEXT,
    phone TEXT,
    assigned_zone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'activo',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICIOS Y BITÁCORAS
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_address TEXT,
    date DATE NOT NULL,
    time_slot TEXT,
    status TEXT DEFAULT 'programado',
    operative_id TEXT,
    operative_name TEXT,
    special_instructions TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    evidences JSONB DEFAULT '[]'::jsonb,
    approved_by_admin BOOLEAN DEFAULT FALSE,
    total_cost NUMERIC(12, 2) DEFAULT 0,
    client_signature JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INCIDENCIAS Y REPORTES DEL CLIENTE
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    client_name TEXT NOT NULL,
    location TEXT,
    operative_name TEXT,
    date DATE NOT NULL,
    time TEXT,
    type TEXT DEFAULT 'otro',
    title TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'pendiente',
    admin_resolution TEXT,
    origin TEXT DEFAULT 'operativo',
    priority TEXT DEFAULT 'normal',
    assigned_employee_id TEXT,
    assigned_employee_name TEXT,
    resolution_photo_url TEXT,
    resolution_notes TEXT,
    resolved_at TEXT,
    resolved_by TEXT,
    resolved_by_role TEXT,
    client_rating NUMERIC(3, 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVENTARIO DE INSUMOS
CREATE TABLE IF NOT EXISTS public.supplies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'quimico',
    current_stock NUMERIC(10, 2) DEFAULT 0,
    unit TEXT DEFAULT 'Pza',
    minimum_stock NUMERIC(10, 2) DEFAULT 0,
    cost_per_unit NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. KIT OPERATIVO
CREATE TABLE IF NOT EXISTS public.kit_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'Pza',
    quantity_assigned NUMERIC(10, 2) DEFAULT 1,
    checked_in BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'completo',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MOVIMIENTOS DE ALMACÉN
CREATE TABLE IF NOT EXISTS public.warehouse_movements (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT,
    supply_id TEXT,
    supply_name TEXT NOT NULL,
    type TEXT DEFAULT 'salida',
    quantity NUMERIC(10, 2) DEFAULT 0,
    unit TEXT,
    operative_name TEXT,
    reason TEXT,
    service_or_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REPORTES DE CONSUMO EN CICLOS DE 3 DÍAS
CREATE TABLE IF NOT EXISTS public.cycle_reports (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cycle_number INTEGER DEFAULT 1,
    generated_date TEXT NOT NULL,
    status TEXT DEFAULT 'vigente',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REQUERIMIENTOS DE INSUMOS
CREATE TABLE IF NOT EXISTS public.supply_requests (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    request_date DATE NOT NULL,
    cycle_report_id TEXT,
    status TEXT DEFAULT 'pendiente',
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    total_estimated_cost NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TRANSACCIONES FINANCIERAS
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'otro',
    concept TEXT NOT NULL,
    client_or_vendor TEXT,
    amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pagado',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. COTIZACIONES
CREATE TABLE IF NOT EXISTS public.quotations (
    id TEXT PRIMARY KEY,
    folio TEXT NOT NULL,
    date DATE NOT NULL,
    valid_until DATE NOT NULL,
    company_name TEXT NOT NULL,
    company_tax_id TEXT,
    company_phone TEXT,
    company_email TEXT,
    company_address TEXT,
    client_name TEXT NOT NULL,
    client_contact TEXT,
    client_tax_id TEXT,
    client_phone TEXT,
    client_email TEXT,
    client_address TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 4) DEFAULT 0.1600,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    service_conditions TEXT,
    payment_terms TEXT,
    delivery_time TEXT,
    notes TEXT,
    status TEXT DEFAULT 'borrador',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MIGRACIÓN DE COLUMNAS NUEVAS (Idempotente)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS client_signature JSONB;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'operativo';
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS assigned_employee_id TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS assigned_employee_name TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS resolution_photo_url TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS resolved_at TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS resolved_by TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS resolved_by_role TEXT;
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS client_rating NUMERIC(3, 1);

-- ROW LEVEL SECURITY (RLS)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'clients', 'employees', 'services', 'incidents', 
        'supplies', 'kit_items', 'warehouse_movements', 
        'cycle_reports', 'supply_requests', 'transactions', 'quotations'
    ]) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_%I" ON public.%I;', t, t);
        EXECUTE format('CREATE POLICY "allow_all_%I" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
    END LOOP;
END $$;

-- REALTIME PUBLICATION
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE 
        public.clients, public.employees, public.services, 
        public.incidents, public.supplies, public.kit_items, 
        public.warehouse_movements, public.cycle_reports, 
        public.supply_requests, public.transactions, public.quotations;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Si ya están agregadas a la publicación, ignorar error
END $$;
