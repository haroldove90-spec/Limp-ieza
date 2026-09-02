-- ==============================================================================
-- CLEANPRO / SERS SOLUCIONES OPERATIVAS
-- SCRIPT PARA LIMPIAR / BORRAR DATOS DE MUESTRA EN SUPABASE
-- Proyecto: ksnvpnvpajhujmwutumh
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- OPCIÓN 1: VACIADO TOTAL (RECOMENDADO PARA INICIAR PRODUCCIÓN EN LIMPIO)
-- Borra todos los datos de muestra pero MANTIENE todas las tablas, columnas,
-- políticas de seguridad (RLS) e índices intactos.
-- ------------------------------------------------------------------------------

TRUNCATE TABLE 
    public.services,
    public.incidents,
    public.cycle_reports,
    public.supply_requests,
    public.warehouse_movements,
    public.transactions,
    public.quotations,
    public.kit_items,
    public.supplies,
    public.employees,
    public.clients
RESTART IDENTITY CASCADE;

-- Confirmación visual en Supabase:
SELECT 'Base de datos vaciada exitosamente. Lista para registros reales de producción.' AS resultado;


-- ------------------------------------------------------------------------------
-- OPCIÓN 2: LIMPIEZA SELECTIVA (SOLO REGISTROS OPERATIVOS)
-- Usa esta opción si deseas CONSERVAR tu catálogo de Clientes, Técnicos e Insumos,
-- pero deseas borrar servicios, bitácoras, incidencias, transacciones y cotizaciones de prueba.
-- ------------------------------------------------------------------------------

/*
DELETE FROM public.services;
DELETE FROM public.incidents;
DELETE FROM public.cycle_reports;
DELETE FROM public.supply_requests;
DELETE FROM public.warehouse_movements;
DELETE FROM public.transactions;
DELETE FROM public.quotations;

SELECT 'Registros operativos de prueba eliminados. Catálogos conservados.' AS resultado;
*/


-- ------------------------------------------------------------------------------
-- OPCIÓN 3: BORRADO ESPECÍFICO DE REGISTROS DE MUESTRA (POR FOLIO/ID)
-- Borra únicamente los registros creados por el seeder inicial:
-- ------------------------------------------------------------------------------

/*
DELETE FROM public.services WHERE id IN ('SRV-101', 'SRV-102', 'SRV-103', 'SRV-104', 'SRV-105');
DELETE FROM public.incidents WHERE id IN ('INC-801', 'INC-802', 'INC-803', 'INC-804', 'INC-805');
DELETE FROM public.transactions WHERE id IN ('TX-001', 'TX-002', 'TX-003', 'TX-004', 'TX-005', 'TX-006', 'TX-007', 'TX-008');
DELETE FROM public.quotations WHERE id IN ('COT-2025-001', 'COT-2025-002', 'COT-2025-003');
DELETE FROM public.cycle_reports WHERE id IN ('REP-3D-001', 'REP-3D-002', 'REP-3D-003');
DELETE FROM public.supply_requests WHERE id IN ('REQ-001', 'REQ-002');
DELETE FROM public.warehouse_movements WHERE id IN ('MOV-001', 'MOV-002', 'MOV-003', 'MOV-004');

SELECT 'Datos de prueba específicos eliminados.' AS resultado;
*/
