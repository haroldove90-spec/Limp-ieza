import React, { useState } from 'react';
import {
  ShieldCheck,
  Camera,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Users,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Truck,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Send,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';
import {
  CleaningService,
  IncidentReport,
  SupplyItem,
  Cycle3DayReport,
  SupplyRequest,
  ClientProfile,
  EmployeeProfile,
  TransactionRecord,
  PhotoEvidence
} from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';

interface AdminDashboardProps {
  activeTab: string;
  services: CleaningService[];
  incidents: IncidentReport[];
  supplies: SupplyItem[];
  cycleReports: Cycle3DayReport[];
  supplyRequests: SupplyRequest[];
  clients: ClientProfile[];
  employees: EmployeeProfile[];
  finances: TransactionRecord[];
  onApproveService: (serviceId: string) => void;
  onResolveIncident: (incidentId: string, resolution: string) => void;
  onUpdateSupplyStock: (supplyId: string, delta: number) => void;
  onApproveSupplyRequest: (requestId: string, status: SupplyRequest['status']) => void;
  onAddClient: (client: Omit<ClientProfile, 'id'>) => void;
  onAddEmployee: (employee: Omit<EmployeeProfile, 'id' | 'servicesCompletedThisMonth'>) => void;
  onAddService: (service: Omit<CleaningService, 'id' | 'tasks' | 'evidences' | 'approvedByAdmin'>) => void;
  onAddTransaction: (transaction: Omit<TransactionRecord, 'id'>) => void;
  onToggleAutoReport: (clientId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  services,
  incidents,
  supplies,
  cycleReports,
  supplyRequests,
  clients,
  employees,
  finances,
  onApproveService,
  onResolveIncident,
  onUpdateSupplyStock,
  onApproveSupplyRequest,
  onAddClient,
  onAddEmployee,
  onAddService,
  onAddTransaction,
  onToggleAutoReport
}) => {
  const [viewingEvidence, setViewingEvidence] = useState<PhotoEvidence | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);

  // Resolution modal state
  const [resolvingIncId, setResolvingIncId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Stock update modal
  const [stockModalSupply, setStockModalSupply] = useState<SupplyItem | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);

  // Forms modals
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientFee, setNewClientFee] = useState(12000);

  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Técnico Especialista de Limpieza');
  const [newEmpZone, setNewEmpZone] = useState('Zona Centro');

  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [srvClientName, setSrvClientName] = useState(clients[0]?.name || '');
  const [srvOperativeName, setSrvOperativeName] = useState(employees[0]?.name || '');
  const [srvDate, setSrvDate] = useState('2026-08-25');
  const [srvTimeSlot, setSrvTimeSlot] = useState('08:00 - 12:00');
  const [srvNotes, setSrvNotes] = useState('');

  const [showNewFinanceModal, setShowNewFinanceModal] = useState(false);
  const [txType, setTxType] = useState<'ingreso' | 'gasto'>('ingreso');
  const [txCategory, setTxCategory] = useState<TransactionRecord['category']>('pago_servicio');
  const [txConcept, setTxConcept] = useState('');
  const [txEntity, setTxEntity] = useState('');
  const [txAmount, setTxAmount] = useState(2500);

  // Calculations for Finance Overview
  const totalIncome = finances
    .filter((f) => f.type === 'ingreso')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = finances
    .filter((f) => f.type === 'gasto')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleResolveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIncId || !resolutionText.trim()) return;
    onResolveIncident(resolvingIncId, resolutionText);
    setResolvingIncId(null);
    setResolutionText('');
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;
    onAddClient({
      name: newClientName,
      contactPerson: newClientContact || 'Responsable de Sede',
      email: 'contacto@' + newClientName.toLowerCase().replace(/\s+/g, '') + '.com',
      phone: '+52 55 0000 0000',
      address: newClientAddress || 'Ciudad de México',
      contractFrequency: 'Lunes a Viernes',
      auto3DayReport: true,
      monthlyFee: newClientFee
    });
    setShowNewClientModal(false);
    setNewClientName('');
    setNewClientContact('');
    setNewClientAddress('');
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) return;
    onAddEmployee({
      name: newEmpName,
      role: newEmpRole,
      phone: '+52 55 1234 5678',
      email: newEmpName.toLowerCase().replace(/\s+/g, '.') + '@limpiezapro.com',
      assignedZone: newEmpZone,
      status: 'activo'
    });
    setShowNewEmployeeModal(false);
    setNewEmpName('');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.name === srvClientName);
    const emp = employees.find((em) => em.name === srvOperativeName);

    onAddService({
      clientName: srvClientName,
      clientAddress: client?.address || 'Dirección registrada',
      date: srvDate,
      timeSlot: srvTimeSlot,
      status: 'programado',
      operativeId: emp?.id || 'EMP-01',
      operativeName: srvOperativeName,
      specialInstructions: srvNotes,
      totalCost: 1500
    });
    setShowNewServiceModal(false);
  };

  const handleCreateFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txConcept || !txAmount) return;
    onAddTransaction({
      date: '2026-08-23',
      type: txType,
      category: txCategory,
      concept: txConcept,
      clientOrVendor: txEntity || 'General',
      amount: Number(txAmount),
      status: 'pagado'
    });
    setShowNewFinanceModal(false);
    setTxConcept('');
    setTxEntity('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* 1. SUPERVISIÓN Y CONTROL DE CALIDAD */}
      {activeTab === 'supervision_admin' && (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Servicios Finalizados</p>
              <h3 className="text-4xl font-bold mt-1 text-slate-900">
                {services.filter((s) => s.status === 'completado').length}
              </h3>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-green-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% vs ayer</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Incidencias Activas</p>
              <h3 className="text-4xl font-bold mt-1 text-slate-900">
                {incidents.filter((i) => i.status !== 'resuelto').length.toString().padStart(2, '0')}
              </h3>
              <p className="mt-4 text-xs text-slate-400 font-medium">
                {incidents.filter((i) => i.status !== 'resuelto').length} en seguimiento
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Por Auditar</p>
              <h3 className="text-4xl font-bold mt-1 text-slate-900">
                {services.filter((s) => !s.approvedByAdmin).length.toString().padStart(2, '0')}
              </h3>
              <p className="mt-4 text-xs text-slate-400 font-medium">Pendientes de revisión</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Balance Semanal</p>
              <h3 className="text-4xl font-bold mt-1 text-slate-900">
                ${netBalance.toLocaleString('es-MX')}
              </h3>
              <p className="mt-4 text-xs text-slate-400 font-medium">Proyectado: $35,000</p>
            </div>
          </div>

          {/* Evidence Review Panel */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Revisiones de Calidad y Evidencias
                  </h3>
                  <p className="text-xs text-slate-400">Auditoría fotográfica y tareas realizadas en campo</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {services.map((service) => {
                const completedTasks = service.tasks.filter((t) => t.completed).length;

                return (
                  <div
                    key={service.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      service.approvedByAdmin
                        ? 'border-slate-100 bg-slate-50/50'
                        : 'border-slate-200 bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-base md:text-lg">
                            {service.clientName}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                            {service.operativeName}
                          </span>
                          {service.approvedByAdmin ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Aprobado
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          {service.date} • {service.timeSlot} • Tareas: {completedTasks}/{service.tasks.length}
                        </p>
                      </div>

                      {!service.approvedByAdmin && (
                        <button
                          onClick={() => onApproveService(service.id)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm transition-colors flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-sm shadow-blue-200"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Aprobar Calidad
                        </button>
                      )}
                    </div>

                    {/* Evidence Thumbnails */}
                    {service.evidences.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {service.evidences.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setViewingEvidence(ev)}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-300 transition-all cursor-pointer flex items-center gap-3 group"
                          >
                            <div className="flex -space-x-2 shrink-0">
                              <img
                                src={ev.beforePhotoUrl}
                                alt="Antes"
                                className="w-10 h-10 rounded-xl object-cover border border-white"
                              />
                              <img
                                src={ev.afterPhotoUrl}
                                alt="Después"
                                className="w-10 h-10 rounded-xl object-cover border border-blue-500"
                              />
                            </div>
                            <div className="overflow-hidden">
                              <span className="font-semibold text-slate-800 text-xs block truncate group-hover:text-blue-600">
                                {ev.area}
                              </span>
                              <span className="text-[10px] text-blue-600 font-bold">Ver fotos</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Sin fotos cargadas en este servicio aún.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incidents Management */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Gestión y Resolución de Incidencias
                  </h3>
                  <p className="text-xs text-slate-400">Seguimiento en tiempo real de reportes de campo</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    inc.status === 'resuelto'
                      ? 'border-slate-100 bg-slate-50/50'
                      : 'border-orange-200 bg-orange-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {inc.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{inc.date}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base mb-1">
                    {inc.title}
                  </h4>
                  <p className="text-xs text-slate-500 mb-3 font-medium">
                    Cliente: <strong className="text-slate-800">{inc.clientName}</strong> • Reporta: {inc.operativeName}
                  </p>
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 mb-3">
                    {inc.description}
                  </p>

                  {inc.photoUrl && (
                    <button
                      onClick={() => setViewingIncident(inc)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-3 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver foto de evidencia adjunta
                    </button>
                  )}

                  {inc.status === 'resuelto' ? (
                    <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900">
                      <span className="font-bold block text-green-950">Resolución emitida:</span>
                      {inc.adminResolution}
                    </div>
                  ) : (
                    <div>
                      {resolvingIncId === inc.id ? (
                        <form onSubmit={handleResolveIncident} className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="Escribe la solución acordada o resolución..."
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setResolvingIncId(null)}
                              className="px-3 py-1.5 text-xs font-semibold text-slate-500 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Guardar Solución
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => {
                            setResolvingIncId(inc.id);
                            setResolutionText('');
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Emitir Resolución
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. GESTIÓN DE INSUMOS E INVENTARIOS */}
      {activeTab === 'insumos_admin' && (
        <div className="space-y-6">
          {/* Client Supply Requests Approvals */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Aprobación y Despacho de Pedidos
                  </h3>
                  <p className="text-xs text-slate-400">Requerimientos emitidos por clientes tras ciclo de 3 días</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {supplyRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-base">
                        {req.clientName}
                      </span>
                      <span className="text-xs text-slate-400">#{req.id} • {req.requestDate}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          req.status === 'despachado'
                            ? 'bg-green-100 text-green-700'
                            : req.status === 'aprobado'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 font-medium">
                      {req.items.map((i) => `${i.quantity} ${i.unit} de ${i.supplyName}`).join(' • ')}
                    </p>
                    {req.notes && (
                      <p className="text-xs text-slate-400 italic mt-0.5">Nota: {req.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'pendiente' && (
                      <>
                        <button
                          onClick={() => onApproveSupplyRequest(req.id, 'aprobado')}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors cursor-pointer shadow-sm shadow-blue-200"
                        >
                          Aprobar Pedido
                        </button>
                        <button
                          onClick={() => onApproveSupplyRequest(req.id, 'rechazado')}
                          className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </>
                    )}

                    {req.status === 'aprobado' && (
                      <button
                        onClick={() => onApproveSupplyRequest(req.id, 'despachado')}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5 text-blue-400" /> Marcar Despachado
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Central Inventory Grid */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Inventario Central y Almacén
                </h3>
                <p className="text-xs text-slate-400">
                  Control de stock actual, entradas por compra y niveles mínimos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {supplies.length} Insumos registrados
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Insumo</th>
                    <th className="py-3.5 px-4">Categoría</th>
                    <th className="py-3.5 px-4 text-center">Stock Actual</th>
                    <th className="py-3.5 px-4 text-center">Mínimo</th>
                    <th className="py-3.5 px-4 text-right">Costo Unitario</th>
                    <th className="py-3.5 px-6 text-center">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {supplies.map((item) => {
                    const isLow = item.currentStock <= item.minimumStock;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {item.name}
                          <span className="block text-xs font-normal text-slate-400">{item.unit}</span>
                        </td>
                        <td className="py-4 px-4 capitalize text-slate-500 text-xs font-semibold">
                          {item.category}
                        </td>
                        <td className="py-4 px-4 text-center font-bold">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-slate-400 text-xs">
                          {item.minimumStock}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-800">
                          ${item.costPerUnit.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => onUpdateSupplyStock(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-xs cursor-pointer"
                              title="Salida (-1)"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => onUpdateSupplyStock(item.id, 5)}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs cursor-pointer"
                              title="Entrada Compra (+5)"
                            >
                              +5
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3-Day Cycle Reports Automation Config */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Automatización de Reportes (Cada 3 Días)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configuración de balance automático para balance de consumos por cliente
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clients.map((cli) => (
                <div
                  key={cli.id}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{cli.name}</h4>
                    <p className="text-xs text-slate-400 mb-4">{cli.contractFrequency}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-600">Auto-Generar 3D</span>
                    <button
                      onClick={() => onToggleAutoReport(cli.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        cli.auto3DayReport
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {cli.auto3DayReport ? 'Activo' : 'Pausado'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. OPERACIÓN GENERAL Y CALENDARIO */}
      {activeTab === 'operacion_admin' && (
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Operación y Directorio</h2>
              <p className="text-xs md:text-sm text-slate-400">Gestión de clientes, personal técnico y asignaciones</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowNewServiceModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs md:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-200"
              >
                <Calendar className="w-4 h-4 text-blue-400" /> Programar Servicio
              </button>
              <button
                onClick={() => setShowNewClientModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200"
              >
                <Building className="w-4 h-4" /> + Cliente
              </button>
              <button
                onClick={() => setShowNewEmployeeModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs md:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" /> + Empleado
              </button>
            </div>
          </div>

          {/* Directory Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clients List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base md:text-lg mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Clientes Activos ({clients.length})
              </h3>

              <div className="space-y-3">
                {clients.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                        ${c.monthlyFee.toLocaleString('es-MX')} /mes
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{c.address}</p>
                    <div className="mt-2 text-[11px] text-slate-400 font-medium flex justify-between">
                      <span>Contacto: {c.contactPerson}</span>
                      <span>{c.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employees List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base md:text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Personal Operativo ({employees.length})
              </h3>

              <div className="space-y-3">
                {employees.map((emp) => (
                  <div key={emp.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-900 text-base">{emp.name}</h4>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {emp.servicesCompletedThisMonth} Servicios este mes
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{emp.role}</p>
                    <div className="mt-2 text-[11px] text-slate-400 font-medium flex justify-between">
                      <span>Zona: {emp.assignedZone}</span>
                      <span>{emp.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FINANZAS Y BALANCE */}
      {activeTab === 'finanzas_admin' && (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Ingresos Totales</p>
              <h3 className="text-4xl font-bold mt-1 text-slate-900">
                ${totalIncome.toLocaleString('es-MX')}
              </h3>
              <p className="text-xs text-slate-400 mt-4 font-medium">Cobros de pólizas y servicios</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Gastos Operativos</p>
              <h3 className="text-4xl font-bold mt-1 text-slate-900">
                ${totalExpense.toLocaleString('es-MX')}
              </h3>
              <p className="text-xs text-slate-400 mt-4 font-medium">Insumos, nómina y transporte</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm font-medium">Balance Neto</p>
              <h3 className="text-4xl font-bold mt-1 text-blue-600">
                +${netBalance.toLocaleString('es-MX')}
              </h3>
              <p className="text-xs text-slate-400 mt-4 font-medium">Margen operativo saludable</p>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Libro de Movimientos Financieros
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Registro detallado de ingresos y egresos
                </p>
              </div>

              <button
                onClick={() => setShowNewFinanceModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs md:text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-200"
              >
                <Plus className="w-4 h-4" /> Registrar Movimiento
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Fecha</th>
                    <th className="py-3.5 px-4">Tipo</th>
                    <th className="py-3.5 px-4">Concepto</th>
                    <th className="py-3.5 px-4">Cliente / Proveedor</th>
                    <th className="py-3.5 px-6 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {finances.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                        {tx.date}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            tx.type === 'ingreso'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {tx.concept}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        {tx.clientOrVendor}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-base">
                        <span className={tx.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                          {tx.type === 'ingreso' ? '+' : '-'}${tx.amount.toLocaleString('es-MX')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Client */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Alta de Cliente</h3>
            <p className="text-xs text-slate-400 mb-5">Ingresa la información comercial del cliente</p>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre / Razón Social:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Corporativo Insurgentes"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Persona de Contacto:</label>
                <input
                  type="text"
                  placeholder="Ej. Lic. Ana Morales"
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Dirección de Sede:</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Insurgentes 1200"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Póliza Mensual (MXN):</label>
                <input
                  type="number"
                  value={newClientFee}
                  onChange={(e) => setNewClientFee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-md shadow-blue-200"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Employee */}
      {showNewEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Alta de Empleado</h3>
            <p className="text-xs text-slate-400 mb-5">Registra nuevo personal técnico operativo</p>
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rodrigo Vargas"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cargo / Especialidad:</label>
                <input
                  type="text"
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Zona Asignada:</label>
                <input
                  type="text"
                  value={newEmpZone}
                  onChange={(e) => setNewEmpZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewEmployeeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-semibold cursor-pointer"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Service */}
      {showNewServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Programar Servicio</h3>
            <p className="text-xs text-slate-400 mb-5">Asigna fecha, cliente y operativo responsable</p>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cliente:</label>
                <select
                  value={srvClientName}
                  onChange={(e) => setSrvClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500 bg-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Personal Asignado:</label>
                <select
                  value={srvOperativeName}
                  onChange={(e) => setSrvOperativeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500 bg-white"
                >
                  {employees.map((em) => (
                    <option key={em.id} value={em.name}>{em.name} ({em.role})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={srvDate}
                    onChange={(e) => setSrvDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Horario:</label>
                  <input
                    type="text"
                    value={srvTimeSlot}
                    onChange={(e) => setSrvTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-blue-500 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Instrucciones especiales:</label>
                <input
                  type="text"
                  placeholder="Ej. Uso de químicos desinfectantes de grado médico"
                  value={srvNotes}
                  onChange={(e) => setSrvNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-lg shadow-slate-200"
                >
                  Confirmar Programación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Finance Transaction */}
      {showNewFinanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Registrar Movimiento</h3>
            <p className="text-xs text-slate-400 mb-5">Ingreso de cobro o egreso de operación</p>
            <form onSubmit={handleCreateFinance} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTxType('ingreso')}
                  className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                    txType === 'ingreso' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  + Ingreso (Cobro)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('gasto')}
                  className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                    txType === 'gasto' ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  - Gasto (Egreso)
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Concepto:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Compra de 10 garrafas desinfectante"
                  value={txConcept}
                  onChange={(e) => setTxConcept(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cliente / Proveedor:</label>
                <input
                  type="text"
                  placeholder="Ej. Proveedora Química del Norte"
                  value={txEntity}
                  onChange={(e) => setTxEntity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Monto (MXN):</label>
                <input
                  type="number"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewFinanceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-semibold cursor-pointer shadow-lg shadow-slate-200"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modals */}
      {viewingEvidence && (
        <ImageViewerModal
          evidence={viewingEvidence}
          onClose={() => setViewingEvidence(null)}
        />
      )}
      {viewingIncident && (
        <ImageViewerModal
          incidentTitle={viewingIncident.title}
          incidentPhotoUrl={viewingIncident.photoUrl}
          onClose={() => setViewingIncident(null)}
        />
      )}
    </div>
  );
};
