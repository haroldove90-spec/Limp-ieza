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

// Servicios de limpieza (Vacío para inicio de pruebas reales)
export const INITIAL_SERVICES: CleaningService[] = [];

// Incidencias (Vacío para inicio de pruebas reales)
export const INITIAL_INCIDENTS: IncidentReport[] = [];

// Kit de herramientas e insumos base para personal en campo
export const INITIAL_KIT: KitItem[] = [
  { id: 'KIT-1', name: 'Desinfectante Multiusos Amonio 4ta Gen', unit: 'Litros (1.5L)', quantityAssigned: 2, checkedIn: true, status: 'completo' },
  { id: 'KIT-2', name: 'Detergente Desengrasante Industrial', unit: 'Litros (1L)', quantityAssigned: 1, checkedIn: true, status: 'completo' },
  { id: 'KIT-3', name: 'Pack Paños Microfibra Código Color (x6)', unit: 'Sets', quantityAssigned: 2, checkedIn: true, status: 'completo' },
  { id: 'KIT-4', name: 'Mop Industrial con mango ergonómico', unit: 'Pieza', quantityAssigned: 1, checkedIn: true, status: 'completo' },
  { id: 'KIT-5', name: 'Bolsas Negras Calibre 600 (Rollo 20pz)', unit: 'Rollos', quantityAssigned: 2, checkedIn: true, status: 'completo' },
  { id: 'KIT-6', name: 'Guantes Nitrilo Alta Resistencia', unit: 'Pares', quantityAssigned: 3, checkedIn: true, status: 'completo' },
  { id: 'KIT-7', name: 'Limpiavidrios Anti-estático', unit: 'Atomizador (750ml)', quantityAssigned: 1, checkedIn: true, status: 'completo' }
];

// Catálogo maestro de insumos de almacén
export const INITIAL_SUPPLIES_INVENTORY: SupplyItem[] = [
  { id: 'SUP-01', name: 'Desinfectante Multiusos Pino & Lavanda 5L', category: 'quimico', currentStock: 50, unit: 'Garrafas', minimumStock: 15, costPerUnit: 180, status: 'activo' },
  { id: 'SUP-02', name: 'Cloro Concentrado al 6% (5 Litros)', category: 'quimico', currentStock: 30, unit: 'Garrafas', minimumStock: 10, costPerUnit: 95, status: 'activo' },
  { id: 'SUP-03', name: 'Jabón Líquido Espumante Manos 4L', category: 'quimico', currentStock: 40, unit: 'Bidones', minimumStock: 12, costPerUnit: 220, status: 'activo' },
  { id: 'SUP-04', name: 'Papel Higiénico Jumbo Bobina Doble Hoja', category: 'desechable', currentStock: 100, unit: 'Rollos', minimumStock: 30, costPerUnit: 48, status: 'activo' },
  { id: 'SUP-05', name: 'Toalla Sanitaria Interdoblada Kraft (Fajilla 250pz)', category: 'desechable', currentStock: 120, unit: 'Paquetes', minimumStock: 40, costPerUnit: 35, status: 'activo' },
  { id: 'SUP-06', name: 'Bolsas Basura Negras 90x120 cm (Calibre 600)', category: 'desechable', currentStock: 500, unit: 'Unidades', minimumStock: 150, costPerUnit: 4.5, status: 'activo' },
  { id: 'SUP-07', name: 'Paños Microfibra Antimicrobiana', category: 'utensilio', currentStock: 80, unit: 'Piezas', minimumStock: 25, costPerUnit: 28, status: 'activo' },
  { id: 'SUP-08', name: 'Pastillas Sanitarias para Inodoro con Enzimas', category: 'quimico', currentStock: 100, unit: 'Piezas', minimumStock: 30, costPerUnit: 18, status: 'activo' },
  { id: 'SUP-09', name: 'Aspiradora Industrial Seco/Húmedo 5HP', category: 'maquinaria', currentStock: 5, unit: 'Equipos', minimumStock: 2, costPerUnit: 4200, status: 'activo' }
];

// Reportes ciclo 3 días (Vacío para inicio de pruebas reales)
export const INITIAL_3DAY_REPORTS: Cycle3DayReport[] = [];

// Requerimientos de insumos (Vacío para inicio de pruebas reales)
export const INITIAL_SUPPLY_REQUESTS: SupplyRequest[] = [];

// Directorio de clientes (Vacío para registrar clientes reales)
export const INITIAL_CLIENTS: ClientProfile[] = [];

// Plantilla de Personal Oficial (Únicamente Harold Anguiano y José del Carmen Sotero)
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

// Finanzas y movimientos contables (Vacío para inicio de pruebas reales)
export const INITIAL_FINANCES: TransactionRecord[] = [];

// Movimientos de almacén (Vacío para inicio de pruebas reales)
export const INITIAL_WAREHOUSE_MOVEMENTS: WarehouseMovement[] = [];

// Cotizaciones emitidas (Vacío para inicio de pruebas reales)
export const INITIAL_QUOTATIONS: Quotation[] = [];
