-- ==============================================================================
-- CLEANPRO - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- Proyecto: ksnvpnvpajhujmwutumh
-- ==============================================================================

-- 1. HABILITAR EXTENSIÓN UUID (SI SE REQUIERE)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREACIÓN DE TABLAS
-- ==============================================================================

-- A. TABLA DE CLIENTES Y SEDES
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

-- B. TABLA DE EMPLEADOS / PERSONAL TÉCNICO
CREATE TABLE IF NOT EXISTS public.employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Técnico Especialista de Limpieza',
    phone TEXT,
    email TEXT,
    assigned_zone TEXT,
    status TEXT DEFAULT 'activo',
    services_completed_this_month INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. TABLA DE SERVICIOS DE LIMPIEZA
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_address TEXT,
    date DATE NOT NULL,
    time_slot TEXT,
    status TEXT DEFAULT 'programado', -- 'programado', 'en_proceso', 'completado', 'cancelado'
    operative_id TEXT,
    operative_name TEXT,
    special_instructions TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    evidences JSONB DEFAULT '[]'::jsonb,
    approved_by_admin BOOLEAN DEFAULT FALSE,
    total_cost NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- D. TABLA DE INCIDENCIAS OPERATIVAS
CREATE TABLE IF NOT EXISTS public.incidents (
    id TEXT PRIMARY KEY,
    service_id TEXT,
    client_name TEXT NOT NULL,
    location TEXT,
    operative_name TEXT,
    date DATE NOT NULL,
    time TEXT,
    type TEXT DEFAULT 'otro', -- 'daño_previo', 'zona_inaccesible', 'falta_suministro', 'cliente_ausente', 'otro'
    title TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'pendiente', -- 'pendiente', 'en_revision', 'resuelto'
    admin_resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. TABLA DE INVENTARIO CENTRAL DE INSUMOS
CREATE TABLE IF NOT EXISTS public.supplies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'quimico', -- 'quimico', 'utensilio', 'desechable', 'maquinaria'
    current_stock NUMERIC(10, 2) DEFAULT 0,
    unit TEXT DEFAULT 'Pza',
    minimum_stock NUMERIC(10, 2) DEFAULT 0,
    cost_per_unit NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- F. TABLA DE KIT OPERATIVO DE CAMPO
CREATE TABLE IF NOT EXISTS public.kit_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'Pza',
    quantity_assigned NUMERIC(10, 2) DEFAULT 1,
    checked_in BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'completo', -- 'completo', 'escaso', 'agotado'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- G. TABLA DE MOVIMIENTOS DE ALMACÉN
CREATE TABLE IF NOT EXISTS public.warehouse_movements (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT,
    supply_id TEXT,
    supply_name TEXT NOT NULL,
    type TEXT DEFAULT 'salida', -- 'entrada', 'salida'
    quantity NUMERIC(10, 2) DEFAULT 0,
    unit TEXT,
    operative_name TEXT,
    reason TEXT,
    service_or_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- H. TABLA DE REPORTES DE INSUMOS DE 3 DÍAS
CREATE TABLE IF NOT EXISTS public.cycle_reports (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cycle_number INTEGER DEFAULT 1,
    generated_date DATE NOT NULL,
    status TEXT DEFAULT 'vigente', -- 'vigente', 'requerimiento_emitido', 'abastecido'
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- I. TABLA DE REQUERIMIENTOS DE INSUMOS POR CLIENTE
CREATE TABLE IF NOT EXISTS public.supply_requests (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    request_date DATE NOT NULL,
    cycle_report_id TEXT,
    status TEXT DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'despachado', 'rechazado'
    items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    total_estimated_cost NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- J. TABLA DE MOVIMIENTOS FINANCIEROS Y FLUJO
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'ingreso', 'gasto'
    category TEXT DEFAULT 'otro', -- 'poliza_mensual', 'servicio_extra', 'compra_insumos', 'nomina', 'mantenimiento', 'otro'
    concept TEXT NOT NULL,
    client_or_vendor TEXT,
    amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'pagado', -- 'pagado', 'pendiente'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- K. TABLA DE COTIZACIONES FORMALES
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
    status TEXT DEFAULT 'borrador', -- 'borrador', 'enviada', 'aceptada', 'rechazada'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS) CON ACCESO PÚBLICO / ANON
-- ==============================================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso completo para desarrollo y uso con anon key
CREATE POLICY "Acceso total a clientes" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a empleados" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a servicios" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a incidencias" ON public.incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a insumos" ON public.supplies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a kit_items" ON public.kit_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a movimientos" ON public.warehouse_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a reportes 3 dias" ON public.cycle_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a requerimientos" ON public.supply_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a transacciones" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a cotizaciones" ON public.quotations FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. HABILITAR PUBLICACIÓN EN TIEMPO REAL (REALTIME)
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.clients, 
    public.employees, 
    public.services, 
    public.incidents, 
    public.supplies, 
    public.kit_items, 
    public.warehouse_movements, 
    public.cycle_reports, 
    public.supply_requests, 
    public.transactions, 
    public.quotations;

-- ==============================================================================
-- 5. SEMILLA DE DATOS INICIALES (DEMO CLEANPRO)
-- ==============================================================================

-- Empleados
INSERT INTO public.employees (id, name, role, phone, email, assigned_zone, status, services_completed_this_month)
VALUES
('EMP-01', 'Carlos Mendoza', 'Técnico Especialista de Limpieza', '+52 55 4192 8831', 'carlos.mendoza@cleanpro.com', 'Zona Corporativa Poniente (Reforma / Polanco)', 'activo', 24),
('EMP-02', 'Lucía Santos', 'Técnica en Desinfección Hospitalaria', '+52 55 8821 9904', 'lucia.santos@cleanpro.com', 'Zona Sur / Del Valle', 'activo', 19),
('EMP-03', 'Roberto Valdés', 'Especialista en Pulido y Cristales de Altura', '+52 55 3301 2289', 'roberto.valdes@cleanpro.com', 'Zona Norte / Satélite', 'activo', 21)
ON CONFLICT (id) DO NOTHING;

-- Clientes
INSERT INTO public.clients (id, name, contact_person, email, phone, address, contract_frequency, auto_3day_report, monthly_fee, assigned_employee_id, assigned_employee_name, assigned_employee_phone, assigned_employee_role, notes)
VALUES
('CLI-01', 'Oficinas Corporativas SkyTower', 'Lic. Mariana Garza', 'mgarza@skytower.mx', '+52 55 9876 5432', 'Av. Reforma #450, Piso 8, CDMX', 'Lunes a Viernes', true, 18500, 'EMP-01', 'Carlos Mendoza', '+52 55 4192 8831', 'Técnico Especialista de Limpieza', 'Acceso por elevador de servicio con gafete de contratista.'),
('CLI-02', 'Clínica Dental Sonrisas', 'Dr. Eduardo Morales', 'contacto@dentalsonrisas.com', '+52 55 5544 3322', 'Av. Insurgentes Sur #890, Col. del Valle', 'Lunes, Miércoles y Viernes', true, 12000, 'EMP-01', 'Carlos Mendoza', '+52 55 4192 8831', 'Técnico Especialista de Limpieza', 'Sanitización con protocolo grado médico.'),
('CLI-03', 'Gimnasio FitZone Centro', 'Ing. Roberto Silva', 'rsilva@fitzone.com.mx', '+52 55 7766 5544', 'Calle Durango #310, Roma Norte', 'Diario (Matutino)', true, 14500, 'EMP-02', 'Lucía Santos', '+52 55 8821 9904', 'Técnica en Desinfección Hospitalaria', 'Desinfección intensiva de vestidores y mancuernas.')
ON CONFLICT (id) DO NOTHING;

-- Insumos
INSERT INTO public.supplies (id, name, category, current_stock, unit, minimum_stock, cost_per_unit)
VALUES
('INS-01', 'Desinfectante Multisuperficies Neutro 5L', 'quimico', 18, 'Bidón', 5, 240.00),
('INS-02', 'Jabón Líquido Antibacterial Manos 5L', 'quimico', 6, 'Bidón', 6, 180.00),
('INS-03', 'Sanitizante Cuaternario de Amonio 5L', 'quimico', 12, 'Bidón', 4, 320.00),
('INS-04', 'Papel Toalla Interdoblada 200 Hojas', 'desechable', 45, 'Paquete', 15, 45.00),
('INS-05', 'Papel Higiénico Jumbo Roll 400m', 'desechable', 28, 'Pieza', 10, 68.00),
('INS-06', 'Bolsas para Basura Jumbo Uso Rudo 90x120', 'desechable', 80, 'Paquete', 20, 85.00),
('INS-07', 'Paños Microfibra Uso Rudo 40x40 (Pack 12)', 'utensilio', 14, 'Pack', 5, 150.00),
('INS-08', 'Guantes de Nitrilo Industrial Caja 100 Pzas', 'desechable', 9, 'Caja', 4, 195.00),
('INS-09', 'Abrillantador y Cera de Porcelanato 5L', 'quimico', 7, 'Bidón', 3, 290.00),
('INS-10', 'Atomizadores Industriales Graduados 1L', 'utensilio', 22, 'Pieza', 8, 38.00)
ON CONFLICT (id) DO NOTHING;

-- Transacciones Financieras
INSERT INTO public.transactions (id, date, type, category, concept, client_or_vendor, amount, status)
VALUES
('TX-01', '2026-08-20', 'ingreso', 'poliza_mensual', 'Pago Póliza Mensual de Limpieza Integral', 'Oficinas Corporativas SkyTower', 18500, 'pagado'),
('TX-02', '2026-08-21', 'ingreso', 'poliza_mensual', 'Pago Mensualidad y Protocolo Grado Médico', 'Clínica Dental Sonrisas', 12000, 'pagado'),
('TX-03', '2026-08-22', 'gasto', 'compra_insumos', 'Adquisición de Insumos Químicos y Desechables', 'Químicos Industriales del Centro S.A.', 5800, 'pagado'),
('TX-04', '2026-08-23', 'ingreso', 'servicio_extra', 'Servicio Extraordinario de Pulido de Cristales', 'Gimnasio FitZone Centro', 3400, 'pagado'),
('TX-05', '2026-08-24', 'gasto', 'nomina', 'Dispersión de Nómina y Viáticos Quincenales', 'Equipo Operativo CleanPro', 14200, 'pagado')
ON CONFLICT (id) DO NOTHING;
