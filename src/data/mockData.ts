import {
  CleaningService,
  IncidentReport,
  KitItem,
  SupplyItem,
  Cycle3DayReport,
  SupplyRequest,
  ClientProfile,
  EmployeeProfile,
  AppUser,
  TransactionRecord,
  WarehouseMovement,
  Quotation
} from '../types';

// Servicios de limpieza (Vacío para inicio de producción real)
export const INITIAL_SERVICES: CleaningService[] = [];

// Incidencias activas y resueltas (Vacío para inicio de producción real)
export const INITIAL_INCIDENTS: IncidentReport[] = [];

// Kit de herramientas e insumos base para personal en campo (Vacío para inicio de producción real)
export const INITIAL_KIT: KitItem[] = [];

// Catálogo maestro de insumos de almacén (Vacío para inicio de producción real)
export const INITIAL_SUPPLIES_INVENTORY: SupplyItem[] = [];

// Reportes ciclo 3 días con consumo e inventario en sitio (Vacío para inicio de producción real)
export const INITIAL_3DAY_REPORTS: Cycle3DayReport[] = [];

// Requerimientos de insumos (Vacío para inicio de producción real)
export const INITIAL_SUPPLY_REQUESTS: SupplyRequest[] = [];

// Directorio de clientes oficiales (Vacío para inicio de producción real)
export const INITIAL_CLIENTS: ClientProfile[] = [];

// Plantilla de Personal Oficial (Únicamente los 2 colaboradores registrados)
export const INITIAL_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'EMP-00',
    name: 'Harold Anguiano Morales',
    role: 'Director General / Administrador',
    jobTitle: 'Director General / Administrador',
    phone: '+52 55 1234 5678',
    email: 'haroldo90@hotmail.com',
    assignedZone: 'Oficina Central / Todas las Zonas',
    status: 'activo',
    servicesCompletedThisMonth: 0,
    username: 'haroldo90',
    password: 'Chevropar#1970',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    notes: 'Dirección General y administración central de la plataforma SERS'
  },
  {
    id: 'EMP-04',
    name: 'José del Carmen Sotero',
    role: 'Supervisor Operativo',
    jobTitle: 'Supervisor Operativo y Técnico Especialista',
    phone: '+52 99 3123 4567',
    email: 'contacto.sers@gmail.com',
    assignedZone: 'Zona Industrial y Corporativa',
    status: 'activo',
    servicesCompletedThisMonth: 0,
    username: 'josesers',
    password: 'Sers#Segura2025!',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    notes: 'Supervisión en campo, bitácoras fotográficas y control operativo'
  }
];

// Usuarios con acceso al sistema (Únicamente Harold Anguiano y José del Carmen Sotero)
export const INITIAL_USERS: AppUser[] = [
  {
    id: 'USR-HAROLD-01',
    name: 'Harold Anguiano Morales',
    email: 'haroldo90@hotmail.com',
    username: 'haroldo90',
    password: 'Chevropar#1970',
    role: 'admin',
    jobTitle: 'Director General / Administrador',
    phone: '+52 55 1234 5678',
    assignedZone: 'Oficina Central / Todas las Zonas',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    status: 'activo',
    notes: 'Acceso total y administración central de la plataforma SERS'
  },
  {
    id: 'USR-JOSE-02',
    name: 'José del Carmen Sotero',
    email: 'contacto.sers@gmail.com',
    username: 'josesers',
    password: 'Sers#Segura2025!',
    role: 'operative',
    jobTitle: 'Supervisor Operativo y Técnico Especialista',
    phone: '+52 99 3123 4567',
    assignedZone: 'Zona Industrial y Corporativa',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    status: 'activo',
    notes: 'Supervisión en campo, bitácoras fotográficas y control de almacén'
  }
];

// Finanzas y movimientos contables (Vacío para inicio de producción real)
export const INITIAL_FINANCES: TransactionRecord[] = [];

// Movimientos de almacén (Vacío para inicio de producción real)
export const INITIAL_WAREHOUSE_MOVEMENTS: WarehouseMovement[] = [];

// Cotizaciones emitidas (Vacío para inicio de producción real)
export const INITIAL_QUOTATIONS: Quotation[] = [];
