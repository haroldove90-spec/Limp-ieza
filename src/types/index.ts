export type UserRole = 'home' | 'operative' | 'client' | 'admin';

export interface ServiceTask {
  id: string;
  name: string;
  category: string;
  completed: boolean;
}

export interface PhotoEvidence {
  id: string;
  area: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  notes?: string;
  timestamp: string;
}

export interface IncidentReport {
  id: string;
  serviceId: string;
  clientName: string;
  location: string;
  operativeName: string;
  date: string;
  time: string;
  type: 'daño_previo' | 'zona_inaccesible' | 'falta_suministro' | 'cliente_ausente' | 'otro';
  title: string;
  description: string;
  photoUrl?: string;
  status: 'pendiente' | 'en_revision' | 'resuelto';
  adminResolution?: string;
}

export interface CleaningService {
  id: string;
  clientName: string;
  clientAddress: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:00 - 12:00"
  status: 'programado' | 'en_proceso' | 'completado' | 'cancelado';
  operativeId: string;
  operativeName: string;
  specialInstructions: string;
  tasks: ServiceTask[];
  evidences: PhotoEvidence[];
  approvedByAdmin?: boolean;
  totalCost: number;
}

export interface KitItem {
  id: string;
  name: string;
  unit: string;
  quantityAssigned: number;
  checkedIn: boolean;
  status: 'completo' | 'escaso' | 'agotado';
  notes?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  category: 'quimico' | 'utensilio' | 'desechable' | 'maquinaria';
  currentStock: number;
  unit: string;
  minimumStock: number;
  costPerUnit: number;
}

export interface Cycle3DayReport {
  id: string;
  clientId: string;
  clientName: string;
  periodStart: string;
  periodEnd: string;
  cycleNumber: number;
  generatedDate: string;
  status: 'vigente' | 'requerimiento_emitido' | 'abastecido';
  items: {
    supplyName: string;
    initialStock: number;
    consumed: number;
    remainingStock: number;
    recommendedOrder: number;
    unit: string;
  }[];
}

export interface SupplyRequest {
  id: string;
  clientId: string;
  clientName: string;
  requestDate: string;
  cycleReportId?: string;
  status: 'pendiente' | 'aprobado' | 'despachado' | 'rechazado';
  items: {
    supplyName: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
  totalEstimatedCost: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  contractFrequency: string;
  auto3DayReport: boolean;
  monthlyFee: number;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  assignedZone: string;
  status: 'activo' | 'inactivo';
  servicesCompletedThisMonth: number;
}

export interface TransactionRecord {
  id: string;
  date: string;
  type: 'ingreso' | 'gasto';
  category: 'pago_servicio' | 'compra_insumos' | 'nomina' | 'mantenimiento' | 'otro';
  concept: string;
  clientOrVendor: string;
  amount: number;
  status: 'pagado' | 'pendiente';
}
