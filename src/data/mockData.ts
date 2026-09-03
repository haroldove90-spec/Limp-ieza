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

// Servicios de limpieza con bitácoras, checklists y evidencias fotográficas reales
export const INITIAL_SERVICES: CleaningService[] = [
  {
    id: 'SRV-101',
    clientName: 'Oficinas Corporativas SkyTower',
    clientAddress: 'Av. Paseo de la Reforma 404, Piso 12, CDMX',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 - 12:00',
    status: 'completado',
    operativeId: 'EMP-04',
    operativeName: 'José del Carmen Sotero',
    specialInstructions: 'Sanitización profunda en salas de juntas y reposición de toallas kraft en sanitarios piso 12.',
    approvedByAdmin: true,
    totalCost: 1850,
    tasks: [
      { id: 'TSK-1', name: 'Desinfección de escritorios y mamparas de acrílico', category: 'Oficinas', completed: true },
      { id: 'TSK-2', name: 'Aspirado profundo de alfombra y zoclos perimetrales', category: 'Pisos', completed: true },
      { id: 'TSK-3', name: 'Limpieza de cristales interiores con solución anti-empañante', category: 'Cristales', completed: true },
      { id: 'TSK-4', name: 'Sanitización con amonio cuaternario en sanitarios y grifería', category: 'Sanitarios', completed: true },
      { id: 'TSK-5', name: 'Vaciado de botes y sustitución de bolsas calibre 600', category: 'Desechos', completed: true }
    ],
    evidences: [
      {
        id: 'EVD-01',
        area: 'Recepción y Lobby Principal',
        beforePhotoUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        notes: 'Desinfección de mostrador, pulido de piso porcelanato y aromatización neutra.',
        timestamp: '09:15 hrs'
      },
      {
        id: 'EVD-02',
        area: 'Sanitarios Ejecutivos Piso 12',
        beforePhotoUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        notes: 'Desmanchado de grifería cromada, reposición de jabón líquido y papel jumbo.',
        timestamp: '10:40 hrs'
      },
      {
        id: 'EVD-03',
        area: 'Cocina & Comedor Corporativo',
        beforePhotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
        notes: 'Desengrase de tarja de acero inoxidable, desinfección de mesas y microondas.',
        timestamp: '11:30 hrs'
      }
    ],
    clientSignature: {
      signedBy: 'Lic. Mariana Ramos (Administración)',
      signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 60 Q 60 10 110 50 T 190 30" fill="none" stroke="%231e3a8a" stroke-width="2.5"/></svg>',
      signedAt: 'Hoy, 12:05 hrs',
      comments: 'Servicio excelente y a tiempo. Se confirmó la reposición de insumos de 3 días.'
    }
  },
  {
    id: 'SRV-102',
    clientName: 'Clínica Dental Sonrisas Sanas',
    clientAddress: 'Insurgentes Sur 1602, Consultorio 301, CDMX',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '13:00 - 16:00',
    status: 'en_proceso',
    operativeId: 'EMP-04',
    operativeName: 'José del Carmen Sotero',
    specialInstructions: 'Protocolo clínico hospitalario nivel 2 en sillones odontológicos y sala de esterilización.',
    approvedByAdmin: false,
    totalCost: 2100,
    tasks: [
      { id: 'TSK-10', name: 'Desinfección quirúrgica de superficies y bandejas', category: 'Clínica', completed: true },
      { id: 'TSK-11', name: 'Trapeado con cloro concentrado diluido al 0.5%', category: 'Pisos', completed: true },
      { id: 'TSK-12', name: 'Limpieza de sala de espera y recepción', category: 'Recepción', completed: false }
    ],
    evidences: [
      {
        id: 'EVD-10',
        area: 'Consultorio 1 y Sillón Dental',
        beforePhotoUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        notes: 'Aplicación de biocida de amplio espectro en lámpara y área operativa.',
        timestamp: '13:50 hrs'
      }
    ]
  }
];

// Incidencias activas y resueltas con trazabilidad
export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'INC-101',
    serviceId: 'SRV-101',
    clientName: 'Oficinas Corporativas SkyTower',
    location: 'Piso 12 - Sala de Juntas Diamante',
    operativeName: 'José del Carmen Sotero',
    date: new Date().toISOString().split('T')[0],
    time: '08:45',
    type: 'daño_previo',
    title: 'Vidrio de mampara con fisura previa al inicio',
    description: 'Se detecta fisura de 12cm en el borde inferior derecho de la mampara de cristal templado antes de comenzar la limpieza.',
    photoUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop&q=80',
    status: 'resuelto',
    origin: 'operativo',
    priority: 'alta',
    adminResolution: 'Se notificó por WhatsApp a la administración de SkyTower. Se confirmó que el daño data de la mudanza del fin de semana.',
    resolvedAt: 'Hoy, 09:30 hrs',
    resolvedBy: 'Harold Anguiano Morales',
    resolvedByRole: 'admin',
    resolutionNotes: 'Aclarado con Lic. Mariana Ramos. SERS queda deslindado formalmente.'
  }
];

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

// Reportes ciclo 3 días con consumo e inventario en sitio
export const INITIAL_3DAY_REPORTS: Cycle3DayReport[] = [
  {
    id: 'REP-3D-101',
    clientId: 'CLI-01',
    clientName: 'Oficinas Corporativas SkyTower',
    periodStart: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0],
    cycleNumber: 14,
    generatedDate: new Date().toISOString().split('T')[0],
    status: 'vigente',
    items: [
      {
        supplyName: 'Desinfectante Multiusos Pino & Lavanda 5L',
        initialStock: 4,
        consumed: 1,
        remainingStock: 3,
        recommendedOrder: 0,
        unit: 'Garrafas'
      },
      {
        supplyName: 'Papel Higiénico Jumbo Bobina Doble Hoja',
        initialStock: 12,
        consumed: 8,
        remainingStock: 4,
        recommendedOrder: 12,
        unit: 'Rollos'
      },
      {
        supplyName: 'Toalla Sanitaria Interdoblada Kraft (250pz)',
        initialStock: 10,
        consumed: 7,
        remainingStock: 3,
        recommendedOrder: 10,
        unit: 'Paquetes'
      },
      {
        supplyName: 'Bolsas Basura Negras 90x120 cm (Cal. 600)',
        initialStock: 50,
        consumed: 35,
        remainingStock: 15,
        recommendedOrder: 50,
        unit: 'Unidades'
      }
    ]
  }
];

// Requerimientos de insumos
export const INITIAL_SUPPLY_REQUESTS: SupplyRequest[] = [
  {
    id: 'REQ-101',
    clientId: 'CLI-01',
    clientName: 'Oficinas Corporativas SkyTower',
    requestDate: new Date().toISOString().split('T')[0],
    cycleReportId: 'REP-3D-101',
    status: 'pendiente',
    items: [
      { supplyName: 'Papel Higiénico Jumbo Bobina Doble Hoja', quantity: 12, unit: 'Rollos' },
      { supplyName: 'Toalla Sanitaria Interdoblada Kraft (250pz)', quantity: 10, unit: 'Paquetes' },
      { supplyName: 'Bolsas Basura Negras 90x120 cm (Cal. 600)', quantity: 50, unit: 'Unidades' }
    ],
    notes: 'Reabastecimiento automático del ciclo de 3 días para sanitarios piso 12.',
    totalEstimatedCost: 1151
  }
];

// Directorio de clientes oficiales
export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'CLI-01',
    name: 'Oficinas Corporativas SkyTower',
    contactPerson: 'Lic. Mariana Ramos (Administración)',
    email: 'mramos@skytower.mx',
    phone: '+52 55 9876 5432',
    address: 'Av. Paseo de la Reforma 404, Piso 12, CDMX',
    contractFrequency: 'Lunes a Viernes (Diario)',
    auto3DayReport: true,
    monthlyFee: 24500,
    assignedEmployeeId: 'EMP-04',
    assignedEmployeeName: 'José del Carmen Sotero',
    assignedEmployeePhone: '+52 99 3123 4567',
    assignedEmployeeRole: 'Supervisor Operativo y Técnico Especialista',
    username: 'skytower',
    password: 'Sers#SkyTower2025!',
    notes: 'Sede corporativa. Se requiere bitácora fotográfica de antes/después diaria y revisión de insumos cada 3 días.'
  },
  {
    id: 'CLI-02',
    name: 'Clínica Dental Sonrisas Sanas',
    contactPerson: 'Dra. Andrea Morales (Directora)',
    email: 'contacto@sonrisassanas.com',
    phone: '+52 55 4321 8765',
    address: 'Insurgentes Sur 1602, Consultorio 301, CDMX',
    contractFrequency: 'Lunes, Miércoles y Viernes',
    auto3DayReport: true,
    monthlyFee: 16800,
    assignedEmployeeId: 'EMP-04',
    assignedEmployeeName: 'José del Carmen Sotero',
    assignedEmployeePhone: '+52 99 3123 4567',
    assignedEmployeeRole: 'Supervisor Operativo y Técnico Especialista',
    username: 'sonrisas',
    password: 'Sers#Sonrisas2025!',
    notes: 'Protocolo de desinfección grado clínico con bitácora firmada.'
  }
];

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
