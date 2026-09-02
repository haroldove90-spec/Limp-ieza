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

export const INITIAL_SERVICES: CleaningService[] = [
  {
    id: 'SRV-101',
    clientName: 'Oficinas Corporativas SkyTower',
    clientAddress: 'Av. Reforma #450, Piso 8, CDMX',
    date: '2026-08-23',
    timeSlot: '08:00 - 11:30',
    status: 'en_proceso',
    operativeId: 'EMP-01',
    operativeName: 'Carlos Mendoza',
    specialInstructions: 'Utilizar desinfectante neutro en escritorios de madera. No desconectar equipos de cómputo.',
    tasks: [
      { id: 'T-1', name: 'Desinfección de escritorios y mamparas', category: 'General', completed: true },
      { id: 'T-2', name: 'Aspirado y pulido de alfombra ejecutiva', category: 'Pisos', completed: true },
      { id: 'T-3', name: 'Limpieza profunda de sanitarios (3 módulos)', category: 'Sanitarios', completed: false },
      { id: 'T-4', name: 'Vaciado y reposición de bolsas ecológicas', category: 'Residuos', completed: true },
      { id: 'T-5', name: 'Limpieza de cristales interiores de salas de juntas', category: 'Vidrios', completed: false }
    ],
    evidences: [
      {
        id: 'EV-1',
        area: 'Recepción y Sala de Juntas A',
        beforePhotoUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
        notes: 'Pisos aspirados y superficies tratadas con abrillantador ecológico.',
        timestamp: '08:45 AM'
      },
      {
        id: 'EV-2',
        area: 'Área de Cocina y Cafetería',
        beforePhotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
        notes: 'Tarja desincrustada y microondas higienizados con vapor.',
        timestamp: '09:30 AM'
      }
    ],
    approvedByAdmin: false,
    totalCost: 1850
  },
  {
    id: 'SRV-102',
    clientName: 'Residencial Los Álamos (Depto 402)',
    clientAddress: 'Calle Nogales #122, Polanco',
    date: '2026-08-23',
    timeSlot: '13:00 - 16:30',
    status: 'programado',
    operativeId: 'EMP-01',
    operativeName: 'Carlos Mendoza',
    specialInstructions: 'El perro de la familia está en la terraza. Llave en caseta de vigilancia.',
    tasks: [
      { id: 'T-6', name: 'Limpieza completa de cocina y extractor', category: 'Cocina', completed: false },
      { id: 'T-7', name: 'Limpieza profunda de 2 baños completos', category: 'Baños', completed: false },
      { id: 'T-8', name: 'Trapeado y desinfección de pisos de porcelanato', category: 'Pisos', completed: false },
      { id: 'T-9', name: 'Limpieza de ventanales sala y balcón', category: 'Vidrios', completed: false }
    ],
    evidences: [],
    approvedByAdmin: false,
    totalCost: 1400
  },
  {
    id: 'SRV-100',
    clientName: 'Clínica Dental Sonrisas',
    clientAddress: 'Av. Insurgentes Sur #890, Col. del Valle',
    date: '2026-08-22',
    timeSlot: '18:00 - 21:00',
    status: 'completado',
    operativeId: 'EMP-01',
    operativeName: 'Carlos Mendoza',
    specialInstructions: 'Protocolo hospitalario nivel 2. Doble sanitización en sillones de atención.',
    tasks: [
      { id: 'T-10', name: 'Sanitización de sillones quirúrgicos', category: 'Médico', completed: true },
      { id: 'T-11', name: 'Esterilización de superficies de instrumental', category: 'Médico', completed: true },
      { id: 'T-12', name: 'Fregado de piso con cuaternario de amonio', category: 'Pisos', completed: true },
      { id: 'T-13', name: 'Desinfección de sala de espera y recepción', category: 'General', completed: true }
    ],
    evidences: [
      {
        id: 'EV-3',
        area: 'Consultorio Quirúrgico 1',
        beforePhotoUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
        afterPhotoUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
        notes: 'Protocolo completado con nebulización en frío.',
        timestamp: '20:15 PM'
      }
    ],
    approvedByAdmin: true,
    totalCost: 2200
  },
  {
    id: 'SRV-103',
    clientName: 'Gimnasio FitZone Centro',
    clientAddress: 'Calle Durango #310, Roma Norte',
    date: '2026-08-24',
    timeSlot: '06:00 - 09:30',
    status: 'programado',
    operativeId: 'EMP-02',
    operativeName: 'Lucía Santos',
    specialInstructions: 'Enfoque especial en regaderas y área de pesas con desengrasante antibacteriano.',
    tasks: [
      { id: 'T-14', name: 'Desinfección de mancuernas y bancas', category: 'Gimnasio', completed: false },
      { id: 'T-15', name: 'Lavado con vapor de regaderas y lockers', category: 'Vestidores', completed: false },
      { id: 'T-16', name: 'Mapeo y abrillantado de piso de caucho', category: 'Pisos', completed: false }
    ],
    evidences: [],
    approvedByAdmin: false,
    totalCost: 1950
  }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'INC-201',
    serviceId: 'SRV-101',
    clientName: 'Oficinas Corporativas SkyTower',
    location: 'Sanitarios Piso 8 - Módulo Mujeres',
    operativeName: 'Carlos Mendoza',
    date: '2026-08-23',
    time: '08:35 AM',
    type: 'falta_suministro',
    title: 'Baja presión de agua en llaves',
    description: 'La toma principal del módulo 3 presenta goteo y sin presión de agua para el llenado de cubetas.',
    photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    status: 'en_revision',
    adminResolution: 'Se contactó a mantenimiento del edificio. Reportaron que el hidroneumático se reiniciará a las 11:00 AM.'
  },
  {
    id: 'INC-202',
    serviceId: 'SRV-100',
    clientName: 'Clínica Dental Sonrisas',
    location: 'Sala de Espera',
    operativeName: 'Carlos Mendoza',
    date: '2026-08-22',
    time: '18:10 PM',
    type: 'daño_previo',
    title: 'Vidrio de mesa de centro estrellado',
    description: 'Se detecta fisura previa en la esquina derecha del vidrio templado al iniciar la limpieza.',
    photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    status: 'resuelto',
    adminResolution: 'Verificado con el Dr. Morales. El daño ocurrió por traslado de paquetería antes de nuestro turno.'
  }
];

export const INITIAL_KIT: KitItem[] = [
  { id: 'KIT-1', name: 'Desinfectante Multiusos Amonio 4ta Gen', unit: 'Litros (1.5L)', quantityAssigned: 2, checkedIn: true, status: 'completo' },
  { id: 'KIT-2', name: 'Detergente Desengrasante Industrial', unit: 'Litros (1L)', quantityAssigned: 1, checkedIn: true, status: 'escaso', notes: 'Quedan solo 250ml para el segundo servicio' },
  { id: 'KIT-3', name: 'Pack Paños Microfibra Código Color (x6)', unit: 'Sets', quantityAssigned: 2, checkedIn: true, status: 'completo' },
  { id: 'KIT-4', name: 'Mop Industrial con mango ergonómico', unit: 'Pieza', quantityAssigned: 1, checkedIn: true, status: 'completo' },
  { id: 'KIT-5', name: 'Bolsas Negras Calibre 600 (Rollo 20pz)', unit: 'Rollos', quantityAssigned: 2, checkedIn: false, status: 'completo' },
  { id: 'KIT-6', name: 'Guantes Nitrilo Alta Resistencia', unit: 'Pares', quantityAssigned: 3, checkedIn: true, status: 'completo' },
  { id: 'KIT-7', name: 'Limpiavidrios Anti-estático', unit: 'Atomizador (750ml)', quantityAssigned: 1, checkedIn: true, status: 'escaso' }
];

export const INITIAL_SUPPLIES_INVENTORY: SupplyItem[] = [
  { id: 'SUP-01', name: 'Desinfectante Multiusos Pino & Lavanda 5L', category: 'quimico', currentStock: 48, unit: 'Garrafas', minimumStock: 15, costPerUnit: 180 },
  { id: 'SUP-02', name: 'Cloro Concentrado al 6% (5 Litros)', category: 'quimico', currentStock: 22, unit: 'Garrafas', minimumStock: 10, costPerUnit: 95 },
  { id: 'SUP-03', name: 'Jabón Líquido Espumante Manos 4L', category: 'quimico', currentStock: 35, unit: 'Bidones', minimumStock: 12, costPerUnit: 220 },
  { id: 'SUP-04', name: 'Papel Higiénico Jumbo Bobina Doble Hoja', category: 'desechable', currentStock: 80, unit: 'Rollos', minimumStock: 30, costPerUnit: 48 },
  { id: 'SUP-05', name: 'Toalla Sanitaria Interdoblada Kraft (Fajilla 250pz)', category: 'desechable', currentStock: 110, unit: 'Paquetes', minimumStock: 40, costPerUnit: 35 },
  { id: 'SUP-06', name: 'Bolsas Basura Negras 90x120 cm (Calibre 600)', category: 'desechable', currentStock: 450, unit: 'Unidades', minimumStock: 150, costPerUnit: 4.5 },
  { id: 'SUP-07', name: 'Paños Microfibra Antimicrobiana', category: 'utensilio', currentStock: 65, unit: 'Piezas', minimumStock: 25, costPerUnit: 28 },
  { id: 'SUP-08', name: 'Pastillas Sanitarias para Inodoro con Enzimas', category: 'quimico', currentStock: 90, unit: 'Piezas', minimumStock: 30, costPerUnit: 18 },
  { id: 'SUP-09', name: 'Aspiradora Industrial Seco/Húmedo 5HP', category: 'maquinaria', currentStock: 6, unit: 'Equipos', minimumStock: 2, costPerUnit: 4200 }
];

export const INITIAL_3DAY_REPORTS: Cycle3DayReport[] = [
  {
    id: 'RPT-3D-2026-08A',
    clientId: 'CLI-01',
    clientName: 'Oficinas Corporativas SkyTower',
    periodStart: '2026-08-20',
    periodEnd: '2026-08-22',
    cycleNumber: 28,
    generatedDate: '2026-08-23 06:00',
    status: 'requerimiento_emitido',
    items: [
      { supplyName: 'Jabón Líquido Antibacterial (Garrafa)', initialStock: 4, consumed: 2, remainingStock: 2, recommendedOrder: 3, unit: 'Garrafas' },
      { supplyName: 'Papel Higiénico Jumbo Bobina', initialStock: 24, consumed: 18, remainingStock: 6, recommendedOrder: 20, unit: 'Rollos' },
      { supplyName: 'Toallas Interdobladas Manos', initialStock: 30, consumed: 22, remainingStock: 8, recommendedOrder: 25, unit: 'Paquetes' },
      { supplyName: 'Bolsas Basura 90x120 Cal. 600', initialStock: 100, consumed: 75, remainingStock: 25, recommendedOrder: 80, unit: 'Piezas' },
      { supplyName: 'Desinfectante de Superficies Grado Hospital', initialStock: 6, consumed: 3, remainingStock: 3, recommendedOrder: 4, unit: 'Litros' }
    ]
  },
  {
    id: 'RPT-3D-2026-08B',
    clientId: 'CLI-02',
    clientName: 'Clínica Dental Sonrisas',
    periodStart: '2026-08-19',
    periodEnd: '2026-08-21',
    cycleNumber: 24,
    generatedDate: '2026-08-22 07:30',
    status: 'vigente',
    items: [
      { supplyName: 'Desinfectante Hospitalario Cuaternario', initialStock: 5, consumed: 2.5, remainingStock: 2.5, recommendedOrder: 3, unit: 'Garrafas' },
      { supplyName: 'Guantes de Nitrilo Quirúrgico (Cajas)', initialStock: 6, consumed: 4, remainingStock: 2, recommendedOrder: 5, unit: 'Cajas' },
      { supplyName: 'Papel Toalla Interdoblada Grado Médico', initialStock: 18, consumed: 12, remainingStock: 6, recommendedOrder: 15, unit: 'Paquetes' }
    ]
  }
];

export const INITIAL_SUPPLY_REQUESTS: SupplyRequest[] = [
  {
    id: 'REQ-501',
    clientId: 'CLI-01',
    clientName: 'Oficinas Corporativas SkyTower',
    requestDate: '2026-08-23',
    cycleReportId: 'RPT-3D-2026-08A',
    status: 'pendiente',
    items: [
      { supplyName: 'Jabón Líquido Antibacterial', quantity: 3, unit: 'Garrafas' },
      { supplyName: 'Papel Higiénico Jumbo Bobina', quantity: 20, unit: 'Rollos' },
      { supplyName: 'Toallas Interdobladas Manos', quantity: 25, unit: 'Paquetes' },
      { supplyName: 'Bolsas Basura 90x120 Cal. 600', quantity: 80, unit: 'Piezas' }
    ],
    notes: 'Priorizar entrega para el lunes antes de las 9:00 AM por junta de consejo.',
    totalEstimatedCost: 2850
  },
  {
    id: 'REQ-498',
    clientId: 'CLI-03',
    clientName: 'Gimnasio FitZone Centro',
    requestDate: '2026-08-20',
    status: 'despachado',
    items: [
      { supplyName: 'Desinfectante Multiusos Pino & Lavanda 5L', quantity: 4, unit: 'Garrafas' },
      { supplyName: 'Paños Microfibra Antimicrobiana', quantity: 15, unit: 'Piezas' }
    ],
    notes: 'Entregado al supervisor de turno matutino.',
    totalEstimatedCost: 1140
  }
];

export const INITIAL_CLIENTS: ClientProfile[] = [
  {
    id: 'CLI-01',
    name: 'Oficinas Corporativas SkyTower',
    contactPerson: 'Lic. Laura Martínez',
    email: 'laura.martinez@skytower.com',
    phone: '+52 55 4912 8820',
    address: 'Av. Reforma #450, Piso 8, CDMX',
    contractFrequency: 'Lunes, Miércoles, Viernes',
    auto3DayReport: true,
    monthlyFee: 14500,
    assignedEmployeeId: 'EMP-01',
    assignedEmployeeName: 'Carlos Mendoza',
    assignedEmployeePhone: '+52 55 6789 0123',
    assignedEmployeeRole: 'Técnico Especialista de Limpieza'
  },
  {
    id: 'CLI-02',
    name: 'Clínica Dental Sonrisas',
    contactPerson: 'Dr. Roberto Morales',
    email: 'administracion@dentalsonrisas.mx',
    phone: '+52 55 3309 1144',
    address: 'Av. Insurgentes Sur #890, Col. del Valle',
    contractFrequency: 'Diario (Lunes a Sábado)',
    auto3DayReport: true,
    monthlyFee: 18200,
    assignedEmployeeId: 'EMP-01',
    assignedEmployeeName: 'Carlos Mendoza',
    assignedEmployeePhone: '+52 55 6789 0123',
    assignedEmployeeRole: 'Técnico Especialista de Limpieza'
  },
  {
    id: 'CLI-03',
    name: 'Gimnasio FitZone Centro',
    contactPerson: 'Andrea Gómez',
    email: 'gerencia@fitzonecentro.com',
    phone: '+52 55 7761 9022',
    address: 'Calle Durango #310, Roma Norte',
    contractFrequency: 'Martes, Jueves, Sábado',
    auto3DayReport: true,
    monthlyFee: 11800,
    assignedEmployeeId: 'EMP-02',
    assignedEmployeeName: 'Lucía Santos',
    assignedEmployeePhone: '+52 55 4567 8901',
    assignedEmployeeRole: 'Operativa Senior de Sanitización'
  },
  {
    id: 'CLI-04',
    name: 'Residencial Los Álamos (Depto 402)',
    contactPerson: 'Ing. Fernando Valdés',
    email: 'fernando.valdes@gmail.com',
    phone: '+52 55 1290 4433',
    address: 'Calle Nogales #122, Polanco',
    contractFrequency: 'Servicio por evento / Semanal',
    auto3DayReport: false,
    monthlyFee: 5600,
    assignedEmployeeId: 'EMP-03',
    assignedEmployeeName: 'Miguel Ángel Rivas',
    assignedEmployeePhone: '+52 55 8901 2345',
    assignedEmployeeRole: 'Operativo de Maquinaria y Pulido'
  }
];

export const INITIAL_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'EMP-00',
    name: 'Harold Anguiano Morales',
    role: 'Director General / Administrador',
    phone: '+52 55 1234 5678',
    email: 'haroldo90@hotmail.com',
    assignedZone: 'Oficina Central / Todas las Zonas',
    status: 'activo',
    servicesCompletedThisMonth: 0,
    username: 'haroldo90',
    password: 'Chevropar#1970',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    notes: 'Administrador General del Sistema SERS Soluciones Operativas'
  },
  {
    id: 'EMP-04',
    name: 'José del Carmen Sotero',
    role: 'Supervisor Operativo / Especialista',
    phone: '+52 99 3123 4567',
    email: 'contacto.sers@gmail.com',
    assignedZone: 'Zona Industrial y Corporativa',
    status: 'activo',
    servicesCompletedThisMonth: 38,
    username: 'josesers',
    password: 'Sers#Segura2025!',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    notes: 'Supervisor Operativo en Sitio y Coordinador de Insumos'
  },
  {
    id: 'EMP-01',
    name: 'Carlos Mendoza',
    role: 'Técnico Especialista de Limpieza',
    phone: '+52 55 6789 0123',
    email: 'carlos.mendoza@limpiezapro.com',
    assignedZone: 'Corredor Reforma / Centro',
    status: 'activo',
    servicesCompletedThisMonth: 34,
    username: 'carlos.mendoza',
    password: 'Carlos#Operativo2025',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    notes: 'Especialista en desinfección de oficinas corporativas'
  },
  {
    id: 'EMP-02',
    name: 'Lucía Santos',
    role: 'Operativa Senior de Sanitización',
    phone: '+52 55 4567 8901',
    email: 'lucia.santos@limpiezapro.com',
    assignedZone: 'Zona Sur / Del Valle',
    status: 'activo',
    servicesCompletedThisMonth: 41,
    username: 'lucia.santos',
    password: 'Lucia#Sers2025!',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    notes: 'Especialista en áreas de vestidores y gimnasios'
  },
  {
    id: 'EMP-03',
    name: 'Miguel Ángel Rivas',
    role: 'Operativo de Maquinaria y Pulido',
    phone: '+52 55 8901 2345',
    email: 'miguel.rivas@limpiezapro.com',
    assignedZone: 'Zona Poniente / Polanco',
    status: 'activo',
    servicesCompletedThisMonth: 29,
    username: 'miguel.rivas',
    password: 'Miguel#Sers2025!',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    notes: 'Especialista en pulido de pisos y maquinaria pesada'
  }
];

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'USR-01',
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
    id: 'USR-02',
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
  },
  {
    id: 'USR-03',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@limpiezapro.com',
    username: 'carlos.mendoza',
    password: 'Carlos#Operativo2025',
    role: 'operative',
    jobTitle: 'Técnico Especialista de Limpieza',
    phone: '+52 55 6789 0123',
    assignedZone: 'Corredor Reforma / Centro',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    status: 'activo',
    notes: 'Operativo líder asignado a Oficinas SkyTower'
  },
  {
    id: 'USR-04',
    name: 'Lic. Sofía Martínez',
    email: 'smartinez@skytower.com',
    username: 'cliente.skytower',
    password: 'SkyTower#Cliente2025',
    role: 'client',
    jobTitle: 'Gerente Administrativa - SkyTower',
    phone: '+52 55 4321 9876',
    assignedZone: 'Paseo de la Reforma #505',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    status: 'activo',
    notes: 'Portal de cliente y autorización de insumos 3 días'
  }
];

export const INITIAL_FINANCES: TransactionRecord[] = [
  {
    id: 'TX-101',
    date: '2026-08-20',
    type: 'ingreso',
    category: 'poliza_mensual',
    concept: 'Pago mensualidad Póliza Oficinas SkyTower',
    clientOrVendor: 'Oficinas Corporativas SkyTower',
    amount: 14500,
    status: 'pagado'
  },
  {
    id: 'TX-102',
    date: '2026-08-18',
    type: 'ingreso',
    category: 'poliza_mensual',
    concept: 'Pago mensualidad Clínica Dental Sonrisas',
    clientOrVendor: 'Clínica Dental Sonrisas',
    amount: 18200,
    status: 'pagado'
  },
  {
    id: 'TX-103',
    date: '2026-08-21',
    type: 'gasto',
    category: 'compra_insumos',
    concept: 'Adquisición mayoreo Químicos y Desinfectantes',
    clientOrVendor: 'Distribuidora Química del Valle',
    amount: 6400,
    status: 'pagado'
  },
  {
    id: 'TX-104',
    date: '2026-08-15',
    type: 'gasto',
    category: 'nomina',
    concept: 'Pago nómina quincenal cuadrilla operativa (3 técnicos)',
    clientOrVendor: 'Nómina Operativa',
    amount: 19500,
    status: 'pagado'
  }
];

export const INITIAL_WAREHOUSE_MOVEMENTS: WarehouseMovement[] = [
  {
    id: 'MOV-101',
    date: '2026-08-23',
    time: '07:45 AM',
    supplyId: 'SUP-01',
    supplyName: 'Desinfectante Multiusos Pino & Lavanda 5L',
    type: 'salida',
    quantity: 2,
    unit: 'Garrafas',
    operativeName: 'Carlos Mendoza',
    reason: 'Servicio en Oficinas Corporativas SkyTower',
    serviceOrLocation: 'SkyTower Piso 8'
  },
  {
    id: 'MOV-102',
    date: '2026-08-23',
    time: '07:50 AM',
    supplyId: 'SUP-07',
    supplyName: 'Paños Microfibra Antimicrobiana',
    type: 'salida',
    quantity: 6,
    unit: 'Piezas',
    operativeName: 'Carlos Mendoza',
    reason: 'Reposición kit van de servicio',
    serviceOrLocation: 'Van #04'
  },
  {
    id: 'MOV-103',
    date: '2026-08-22',
    time: '17:30 PM',
    supplyId: 'SUP-02',
    supplyName: 'Cloro Concentrado al 6% (5 Litros)',
    type: 'entrada',
    quantity: 10,
    unit: 'Garrafas',
    operativeName: 'Lucía Santos',
    reason: 'Devolución de excedente de servicio masivo',
    serviceOrLocation: 'Almacén Central'
  },
  {
    id: 'MOV-104',
    date: '2026-08-22',
    time: '08:15 AM',
    supplyId: 'SUP-06',
    supplyName: 'Bolsas Basura Negras 90x120 cm (Calibre 600)',
    type: 'salida',
    quantity: 50,
    unit: 'Unidades',
    operativeName: 'Carlos Mendoza',
    reason: 'Suministro en Clínica Dental Sonrisas',
    serviceOrLocation: 'Clínica Sonrisas'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'QUO-2026-001',
    folio: 'COT-0824-01',
    date: '2026-08-24',
    validUntil: '2026-09-08',
    companyName: 'Sers Soluciones Operativas S.A. de C.V.',
    companyTaxId: 'SSO210315-9K2',
    companyPhone: '+52 (55) 8000-9200',
    companyEmail: 'contacto@sers.com.mx',
    companyAddress: 'Av. Paseo de la Reforma #450, Piso 8, Cuauhtémoc, CDMX',
    clientName: 'Grupo Financiero Altavista S.A.',
    clientContact: 'Lic. Rodrigo Elizondo (Gerente de Operaciones)',
    clientTaxId: 'GFA150912-7X1',
    clientPhone: '+52 (55) 4120-7799',
    clientEmail: 'relizondo@altavista.com.mx',
    clientAddress: 'Paseo de la Reforma #222, Piso 14, Cuauhtémoc, CDMX',
    items: [
      {
        id: 'QI-1',
        serviceType: 'Limpieza Corporativa Integral y Desinfección',
        description: 'Servicio integral 5 días por semana (Lunes a Viernes). Incluye aspirado de alfombra, desinfección de sanitarios, limpieza de mamparas y cristales interiores.',
        unit: 'Mensual',
        unitCost: 18500,
        quantity: 1,
        subtotal: 18500
      },
      {
        id: 'QI-2',
        serviceType: 'Lavado y Desinfección Profunda de Alfombras',
        description: 'Limpieza de alfombra de alto tráfico con inyección-succión y vapor a 120°C en salas de juntas y pasillos principales.',
        unit: 'm²',
        unitCost: 45,
        quantity: 250,
        subtotal: 11250
      },
      {
        id: 'QI-3',
        serviceType: 'Kit de Insumos y Dispensadores en Comodato',
        description: 'Suministro continuo de jabón en espuma, toalla interdoblada kraft y aromatizantes temporizados para 4 módulos de baño.',
        unit: 'Mes',
        unitCost: 3200,
        quantity: 1,
        subtotal: 3200
      }
    ],
    subtotal: 32950,
    taxRate: 0.16,
    taxAmount: 5272,
    total: 38222,
    serviceConditions: '• Los servicios se realizarán en horarios matutinos de 07:00 a 16:00 hrs.\n• Todo el personal cuenta con IMSS, EPP reglamentario y carta de no antecedentes penales.\n• Productos químicos 100% biodegradables con ficha técnica avalada por COFEPRIS.',
    paymentTerms: '50% de anticipo al inicio de operaciones y 50% al cierre mensual / Crédito a 15 días tras emisión de factura.',
    deliveryTime: 'Inicio de operaciones a partir de las 48 horas posteriores a la firma de contrato.',
    notes: 'Precios en Moneda Nacional (MXN). Incluye supervisión quincenal y reportes fotográficos de evidencia.',
    status: 'enviada'
  }
];
