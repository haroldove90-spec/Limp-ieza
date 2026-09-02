import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Server,
  CloudUpload,
  ExternalLink,
  Shield,
  Layers,
  X,
  Code
} from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSync?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onDataSync
}) => {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: ''
  });
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'sql'>('info');

  const projectId = 'ksnvpnvpajhujmwutumh';
  const supabaseUrl = 'https://ksnvpnvpajhujmwutumh.supabase.co';

  useEffect(() => {
    if (isOpen && !connectionStatus.tested) {
      handleTestConnection();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    const res = await supabaseService.testConnection();
    setConnectionStatus({
      tested: true,
      success: res.success,
      message: res.message
    });
    setTesting(false);
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedMessage(null);
    const res = await supabaseService.seedAllData();
    setSeedMessage(res.message);
    setSeeding(false);
    if (res.success && onDataSync) {
      onDataSync();
    }
  };

  const sqlScript = `-- ==============================================================================
-- CLEANPRO - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- Proyecto: ksnvpnvpajhujmwutumh
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE CLIENTES
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

-- 2. TABLA DE EMPLEADOS
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

-- 3. TABLA DE SERVICIOS
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

-- 4. TABLA DE INCIDENCIAS Y REPORTES DEL CLIENTE
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

-- 5. TABLA DE INSUMOS
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

-- 6. TABLA DE KIT OPERATIVO
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

-- 7. TABLA DE MOVIMIENTOS DE ALMACÉN
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

-- 8. TABLA DE REPORTES DE 3 DÍAS
CREATE TABLE IF NOT EXISTS public.cycle_reports (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cycle_number INTEGER DEFAULT 1,
    generated_date DATE NOT NULL,
    status TEXT DEFAULT 'vigente',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA DE REQUERIMIENTOS DE INSUMOS
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

-- 10. TABLA DE TRANSACCIONES FINANCIERAS
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

-- 11. TABLA DE COTIZACIONES
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

-- MIGRACIONES SEGURAS POR SI YA EXISTÍAN LAS TABLAS
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

-- POLÍTICAS ROW LEVEL SECURITY (RLS)
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

DROP POLICY IF EXISTS "Acceso total a clientes" ON public.clients;
CREATE POLICY "Acceso total a clientes" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a empleados" ON public.employees;
CREATE POLICY "Acceso total a empleados" ON public.employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a servicios" ON public.services;
CREATE POLICY "Acceso total a servicios" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a incidencias" ON public.incidents;
CREATE POLICY "Acceso total a incidencias" ON public.incidents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a insumos" ON public.supplies;
CREATE POLICY "Acceso total a insumos" ON public.supplies FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a kit_items" ON public.kit_items;
CREATE POLICY "Acceso total a kit_items" ON public.kit_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a movimientos" ON public.warehouse_movements;
CREATE POLICY "Acceso total a movimientos" ON public.warehouse_movements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a reportes 3 dias" ON public.cycle_reports;
CREATE POLICY "Acceso total a reportes 3 dias" ON public.cycle_reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a requerimientos" ON public.supply_requests;
CREATE POLICY "Acceso total a requerimientos" ON public.supply_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a transacciones" ON public.transactions;
CREATE POLICY "Acceso total a transacciones" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a cotizaciones" ON public.quotations;
CREATE POLICY "Acceso total a cotizaciones" ON public.quotations FOR ALL USING (true) WITH CHECK (true);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.clients, public.employees, public.services, 
    public.incidents, public.supplies, public.kit_items, 
    public.warehouse_movements, public.cycle_reports, 
    public.supply_requests, public.transactions, public.quotations;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Configuración de Supabase</h3>
              <p className="text-xs text-slate-300">Base de datos PostgreSQL en la Nube</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="w-4 h-4" /> Conexión y Estado
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4" /> Script SQL para Supabase
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Credentials card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Credenciales del Proyecto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">Project ID</span>
                    <span className="font-mono font-bold text-slate-800">{projectId}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block mb-0.5">Proyecto</span>
                    <span className="font-bold text-slate-800">limpieza@appdesignsoftware.com</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Endpoint URL</span>
                    <span className="font-mono text-emerald-700 font-semibold break-all">
                      {supabaseUrl}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status card */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {connectionStatus.tested ? (
                      connectionStatus.success ? (
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Server className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900">Estado de Conexión</h4>
                      <p className="text-xs text-slate-500">
                        {connectionStatus.tested
                          ? connectionStatus.message
                          : 'Comprobando conexión con Supabase...'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    Probar Conexión
                  </button>
                </div>

                {seedMessage && (
                  <div className="p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-medium">
                    {seedMessage}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
                >
                  <CloudUpload className={`w-4 h-4 ${seeding ? 'animate-bounce' : ''}`} />
                  {seeding ? 'Sincronizando...' : 'Sembrar Datos Iniciales en Supabase'}
                </button>

                <a
                  href="https://supabase.com/dashboard/project/ksnvpnvpajhujmwutumh/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Editor SQL de Supabase
                </a>
              </div>

              {/* Quick instructions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600">
                <p className="font-bold text-slate-800">Pasos para activar la base de datos:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Ve a la pestaña <strong>"Script SQL para Supabase"</strong> arriba y haz clic en <strong>Copiar SQL</strong>.</li>
                  <li>Abre el <strong>SQL Editor</strong> en tu panel de Supabase.</li>
                  <li>Pega el script y haz clic en <strong>Run</strong> (Ejecutar).</li>
                  <li>Regresa aquí y haz clic en <strong>"Sembrar Datos Iniciales"</strong> para poblar todas las tablas con clientes, servicios y reportes.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Script SQL DDL y RLS Completo</h4>
                  <p className="text-xs text-slate-500">Copia este código y ejecútalo en el SQL Editor de Supabase</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '¡Copiado al Portapapeles!' : 'Copiar Script SQL'}
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 max-h-96 overflow-y-auto">
                <pre className="font-mono text-xs text-emerald-400 whitespace-pre leading-relaxed">
                  {sqlScript}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
