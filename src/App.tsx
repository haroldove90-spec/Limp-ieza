import React, { useState, useEffect } from 'react';
import {
  UserRole,
  CleaningService,
  IncidentReport,
  KitItem,
  SupplyItem,
  Cycle3DayReport,
  SupplyRequest,
  ClientProfile,
  EmployeeProfile,
  TransactionRecord,
  PhotoEvidence,
  WarehouseMovement,
  Quotation,
  ServiceTask
} from './types';
import {
  INITIAL_SERVICES,
  INITIAL_INCIDENTS,
  INITIAL_KIT,
  INITIAL_SUPPLIES_INVENTORY,
  INITIAL_3DAY_REPORTS,
  INITIAL_SUPPLY_REQUESTS,
  INITIAL_CLIENTS,
  INITIAL_EMPLOYEES,
  INITIAL_FINANCES,
  INITIAL_WAREHOUSE_MOVEMENTS,
  INITIAL_QUOTATIONS
} from './data/mockData';
import { supabaseService } from './services/supabaseService';
import { SupabaseModal } from './components/common/SupabaseModal';

import { RoleSelectorHome } from './components/common/RoleSelectorHome';
import { SystemWorkflowModal } from './components/common/SystemWorkflowModal';
import { Header } from './components/layout/Header';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

import { OperativeDashboard } from './components/roles/operative/OperativeDashboard';
import { ClientDashboard } from './components/roles/client/ClientDashboard';
import { AdminDashboard } from './components/roles/admin/AdminDashboard';

import {
  Calendar,
  Camera,
  AlertTriangle,
  Package,
  Layers,
  ShieldCheck,
  Users,
  DollarSign,
  FileText,
  Boxes
} from 'lucide-react';

export default function App() {
  // Application role & navigation state
  const [currentRole, setCurrentRole] = useState<UserRole>('home');
  const [activeTab, setActiveTab] = useState<string>('agenda');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [selectedOperativeId, setSelectedOperativeId] = useState<string>('EMP-01');

  // In-memory application data state
  const [services, setServices] = useState<CleaningService[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [kitItems, setKitItems] = useState<KitItem[]>(INITIAL_KIT);
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES_INVENTORY);
  const [warehouseMovements, setWarehouseMovements] = useState<WarehouseMovement[]>(INITIAL_WAREHOUSE_MOVEMENTS);
  const [cycleReports, setCycleReports] = useState<Cycle3DayReport[]>(INITIAL_3DAY_REPORTS);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(INITIAL_SUPPLY_REQUESTS);
  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  const [employees, setEmployees] = useState<EmployeeProfile[]>(INITIAL_EMPLOYEES);
  const [finances, setFinances] = useState<TransactionRecord[]>(INITIAL_FINANCES);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);

  // Fetch Supabase data if tables exist
  const loadDataFromSupabase = async () => {
    try {
      const data = await supabaseService.fetchAll();
      if (data.clients && data.clients.length > 0) setClients(data.clients);
      if (data.employees && data.employees.length > 0) setEmployees(data.employees);
      if (data.services && data.services.length > 0) setServices(data.services);
      if (data.incidents && data.incidents.length > 0) setIncidents(data.incidents);
      if (data.supplies && data.supplies.length > 0) setSupplies(data.supplies);
      if (data.kitItems && data.kitItems.length > 0) setKitItems(data.kitItems);
      if (data.warehouseMovements && data.warehouseMovements.length > 0) setWarehouseMovements(data.warehouseMovements);
      if (data.cycleReports && data.cycleReports.length > 0) setCycleReports(data.cycleReports);
      if (data.supplyRequests && data.supplyRequests.length > 0) setSupplyRequests(data.supplyRequests);
      if (data.finances && data.finances.length > 0) setFinances(data.finances);
      if (data.quotations && data.quotations.length > 0) setQuotations(data.quotations);
    } catch {
      // Keep local state on error
    }
  };

  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  // Role switching
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'operative') setActiveTab('agenda');
    else if (role === 'client') setActiveTab('evidencias_cliente');
    else if (role === 'admin') setActiveTab('supervision_admin');
  };

  const handleLogout = () => {
    setCurrentRole('home');
  };

  // Operative Handlers
  const handleUpdateServiceStatus = (serviceId: string, status: CleaningService['status']) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, status } : s))
    );
  };

  const handleToggleTask = (serviceId: string, taskId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        };
      })
    );
  };

  const handleAddEvidence = (
    serviceId: string,
    evidence: Omit<PhotoEvidence, 'id' | 'timestamp'>
  ) => {
    const newEvidence: PhotoEvidence = {
      ...evidence,
      id: `EV-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          evidences: [newEvidence, ...s.evidences]
        };
      })
    );
  };

  const handleAddIncident = (
    incident: Omit<IncidentReport, 'id' | 'date' | 'time' | 'status'>
  ) => {
    const now = new Date();
    const newInc: IncidentReport = {
      ...incident,
      id: `INC-${Date.now().toString().slice(-4)}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'en_revision'
    };

    setIncidents((prev) => [newInc, ...prev]);
  };

  const handleToggleKitCheckin = (kitId: string) => {
    setKitItems((prev) =>
      prev.map((k) => (k.id === kitId ? { ...k, checkedIn: !k.checkedIn } : k))
    );
  };

  const handleReportShortage = (kitId: string, note: string) => {
    setKitItems((prev) =>
      prev.map((k) => (k.id === kitId ? { ...k, status: 'escaso', notes: note } : k))
    );
  };

  const handleAddWarehouseMovement = (
    movement: Omit<WarehouseMovement, 'id' | 'date' | 'time'>
  ) => {
    const now = new Date();
    const newMov: WarehouseMovement = {
      ...movement,
      id: `MOV-${Date.now().toString().slice(-4)}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update stock in supplies
    setSupplies((prev) =>
      prev.map((s) => {
        if (s.id !== movement.supplyId) return s;
        const delta = movement.type === 'entrada' ? movement.quantity : -movement.quantity;
        return { ...s, currentStock: Math.max(0, s.currentStock + delta) };
      })
    );

    setWarehouseMovements((prev) => [newMov, ...prev]);
  };

  const handleEditWarehouseMovement = (updatedMovement: WarehouseMovement) => {
    const oldMovement = warehouseMovements.find((m) => m.id === updatedMovement.id);
    if (oldMovement) {
      setSupplies((prev) =>
        prev.map((s) => {
          let currentStock = s.currentStock;
          // Revert old effect
          if (s.id === oldMovement.supplyId) {
            const revertDelta = oldMovement.type === 'entrada' ? -oldMovement.quantity : oldMovement.quantity;
            currentStock = Math.max(0, currentStock + revertDelta);
          }
          // Apply new effect
          if (s.id === updatedMovement.supplyId) {
            const applyDelta = updatedMovement.type === 'entrada' ? updatedMovement.quantity : -updatedMovement.quantity;
            currentStock = Math.max(0, currentStock + applyDelta);
          }
          return { ...s, currentStock };
        })
      );
    }

    setWarehouseMovements((prev) =>
      prev.map((m) => (m.id === updatedMovement.id ? updatedMovement : m))
    );
  };

  const handleDeleteWarehouseMovement = (movementId: string) => {
    const oldMovement = warehouseMovements.find((m) => m.id === movementId);
    if (oldMovement) {
      // Revert stock effect
      setSupplies((prev) =>
        prev.map((s) => {
          if (s.id !== oldMovement.supplyId) return s;
          const revertDelta = oldMovement.type === 'entrada' ? -oldMovement.quantity : oldMovement.quantity;
          return { ...s, currentStock: Math.max(0, s.currentStock + revertDelta) };
        })
      );
    }
    setWarehouseMovements((prev) => prev.filter((m) => m.id !== movementId));
  };

  const handleAdjustSupplyStock = (supplyId: string, newStock: number) => {
    setSupplies((prev) =>
      prev.map((s) => (s.id === supplyId ? { ...s, currentStock: Math.max(0, newStock) } : s))
    );
  };

  // Client Handlers
  const handleEmitSupplyRequest = (
    request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>
  ) => {
    const newReq: SupplyRequest = {
      ...request,
      id: `REQ-${Date.now().toString().slice(-3)}`,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pendiente'
    };
    setSupplyRequests((prev) => [newReq, ...prev]);
  };

  // Admin Handlers
  const handleApproveService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, approvedByAdmin: true } : s))
    );
  };

  const handleResolveIncident = (incidentId: string, resolution: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? { ...i, status: 'resuelto', adminResolution: resolution }
          : i
      )
    );
  };

  const handleUpdateSupplyStock = (supplyId: string, delta: number) => {
    setSupplies((prev) =>
      prev.map((s) => {
        if (s.id !== supplyId) return s;
        const newStock = Math.max(0, s.currentStock + delta);
        return { ...s, currentStock: newStock };
      })
    );
  };

  const handleApproveSupplyRequest = (
    requestId: string,
    status: SupplyRequest['status']
  ) => {
    setSupplyRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  };

  const handleAddClient = (client: Omit<ClientProfile, 'id'>) => {
    const newCli: ClientProfile = {
      ...client,
      id: `CLI-${(clients.length + 1).toString().padStart(2, '0')}`
    };
    setClients((prev) => [...prev, newCli]);
  };

  const handleAddEmployee = (
    employee: Omit<EmployeeProfile, 'id' | 'servicesCompletedThisMonth'>
  ) => {
    const newEmp: EmployeeProfile = {
      ...employee,
      id: `EMP-${(employees.length + 1).toString().padStart(2, '0')}`,
      servicesCompletedThisMonth: 0
    };
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleAddService = (
    service: Omit<CleaningService, 'id' | 'evidences' | 'approvedByAdmin'> & { tasks?: ServiceTask[] }
  ) => {
    const defaultTasks: ServiceTask[] = [
      { id: `T-${Date.now()}-1`, name: 'Limpieza y aspirado de pisos y alfombras', category: 'Pisos', completed: false },
      { id: `T-${Date.now()}-2`, name: 'Desinfección de sanitarios y reposición', category: 'Sanitarios', completed: false },
      { id: `T-${Date.now()}-3`, name: 'Retiro y clasificación de residuos', category: 'Residuos', completed: false },
      { id: `T-${Date.now()}-4`, name: 'Limpieza de canceles, cristales y escritorios', category: 'Mobiliario', completed: false }
    ];

    const newSrv: CleaningService = {
      ...service,
      id: `SRV-${Date.now().toString().slice(-3)}`,
      tasks: service.tasks && service.tasks.length > 0 ? service.tasks : defaultTasks,
      evidences: [],
      approvedByAdmin: false
    };
    setServices((prev) => [newSrv, ...prev]);
  };

  const handleSaveClientSignature = (
    serviceId: string,
    signature: {
      signedBy: string;
      signatureDataUrl: string;
      signedAt: string;
      comments?: string;
    }
  ) => {
    setServices((prev) =>
      prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              clientSignature: signature,
              status: 'completado'
            }
          : s
      )
    );
  };

  const handleAddTransaction = (transaction: Omit<TransactionRecord, 'id'>) => {
    const newTx: TransactionRecord = {
      ...transaction,
      id: `TX-${Date.now().toString().slice(-4)}`
    };
    setFinances((prev) => [newTx, ...prev]);
  };

  const handleToggleAutoReport = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, auto3DayReport: !c.auto3DayReport } : c
      )
    );
  };

  const handleSaveQuotation = (quotation: Quotation) => {
    setQuotations((prev) => {
      const exists = prev.find((q) => q.id === quotation.id);
      if (exists) {
        return prev.map((q) => (q.id === quotation.id ? quotation : q));
      }
      return [quotation, ...prev];
    });
  };

  const handleUpdateQuotationStatus = (quotationId: string, status: Quotation['status']) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, status } : q))
    );
  };

  const handleAssignEmployeeToClient = (clientId: string, employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              assignedEmployeeId: employee.id,
              assignedEmployeeName: employee.name,
              assignedEmployeePhone: employee.phone,
              assignedEmployeeRole: employee.role
            }
          : c
      )
    );

    // Also update any scheduled services for this client
    const targetClient = clients.find((c) => c.id === clientId);
    if (targetClient) {
      setServices((prev) =>
        prev.map((s) => {
          if (s.clientName.includes(targetClient.name) || targetClient.name.includes(s.clientName)) {
            if (s.status === 'programado' || s.status === 'en_proceso') {
              return {
                ...s,
                operativeId: employee.id,
                operativeName: employee.name
              };
            }
          }
          return s;
        })
      );
    }
  };

  // Define Navigation Items based on Current Active Role
  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'operative':
        return [
          { id: 'agenda', name: 'Agenda', icon: Calendar },
          { id: 'evidencias', name: 'Evidencias', icon: Camera },
          { id: 'incidencias', name: 'Incidencias', icon: AlertTriangle, badgeCount: incidents.filter((i) => i.status !== 'resuelto').length },
          { id: 'almacen_operativo', name: 'Almacén & Stock', icon: Boxes },
          { id: 'insumos_campo', name: 'Kit Diario', icon: Package, badgeCount: kitItems.filter((k) => k.status === 'escaso').length }
        ];
      case 'client':
        return [
          { id: 'evidencias_cliente', name: 'Evidencias', icon: Camera },
          { id: 'insumos_cliente', name: 'Reporte 3 Días', icon: Layers }
        ];
      case 'admin':
        return [
          { id: 'supervision_admin', name: 'Supervisión', icon: ShieldCheck, badgeCount: services.filter((s) => !s.approvedByAdmin).length },
          { id: 'cotizaciones_admin', name: 'Cotizaciones', icon: FileText, badgeCount: quotations.filter((q) => q.status === 'borrador').length },
          { id: 'insumos_admin', name: 'Insumos e Inv.', icon: Package, badgeCount: supplyRequests.filter((r) => r.status === 'pendiente').length },
          { id: 'operacion_admin', name: 'Operación', icon: Users },
          { id: 'finanzas_admin', name: 'Finanzas', icon: DollarSign }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const activeNavItem = navItems.find((item) => item.id === activeTab);
  const activeModuleName = activeNavItem?.name || 'Panel de Control';

  const currentClientProfile = clients.find((c) => c.name.includes('SkyTower')) || clients[0];
  const assignedEmp = employees.find(
    (e) => e.id === currentClientProfile?.assignedEmployeeId || e.name === currentClientProfile?.assignedEmployeeName
  ) || employees[0];

  // If on Home role selection screen
  if (currentRole === 'home') {
    return (
      <>
        <RoleSelectorHome
          onSelectRole={handleSelectRole}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
        />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onDataSync={loadDataFromSupabase}
        />
        <SystemWorkflowModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
          clientName="Oficinas Corporativas SkyTower"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-row">
      {/* Fullscreen Desktop Left Sidebar */}
      <Sidebar
        currentRole={currentRole}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header with Role indicator & Logout button */}
        <Header
          currentRole={currentRole}
          activeModuleName={activeModuleName}
          onLogout={handleLogout}
          clientName="Oficinas SkyTower"
          operativeName={employees.find((e) => e.id === selectedOperativeId)?.name || 'Carlos Mendoza'}
          onSelectRole={handleSelectRole}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
        />

        {/* Dynamic Role Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentRole === 'operative' && (
            <OperativeDashboard
              activeTab={activeTab}
              services={services}
              incidents={incidents}
              kitItems={kitItems}
              supplies={supplies}
              movements={warehouseMovements}
              employees={employees}
              clients={clients}
              selectedOperativeId={selectedOperativeId}
              onSelectOperative={setSelectedOperativeId}
              operativeName={employees.find((e) => e.id === selectedOperativeId)?.name || 'Carlos Mendoza'}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onToggleTask={handleToggleTask}
              onAddEvidence={handleAddEvidence}
              onAddIncident={handleAddIncident}
              onToggleKitCheckin={handleToggleKitCheckin}
              onReportShortage={handleReportShortage}
              onAddWarehouseMovement={handleAddWarehouseMovement}
              onEditWarehouseMovement={handleEditWarehouseMovement}
              onDeleteWarehouseMovement={handleDeleteWarehouseMovement}
              onAdjustSupplyStock={handleAdjustSupplyStock}
              onSaveClientSignature={handleSaveClientSignature}
            />
          )}

          {currentRole === 'client' && (
            <ClientDashboard
              activeTab={activeTab}
              services={services}
              incidents={incidents}
              cycleReports={cycleReports}
              supplyRequests={supplyRequests}
              clientName="Oficinas Corporativas SkyTower"
              clientProfile={currentClientProfile}
              assignedEmployee={assignedEmp}
              onEmitSupplyRequest={handleEmitSupplyRequest}
              onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
            />
          )}

          {currentRole === 'admin' && (
            <AdminDashboard
              activeTab={activeTab}
              services={services}
              incidents={incidents}
              supplies={supplies}
              cycleReports={cycleReports}
              supplyRequests={supplyRequests}
              clients={clients}
              employees={employees}
              finances={finances}
              quotations={quotations}
              onApproveService={handleApproveService}
              onResolveIncident={handleResolveIncident}
              onUpdateSupplyStock={handleUpdateSupplyStock}
              onApproveSupplyRequest={handleApproveSupplyRequest}
              onAddClient={handleAddClient}
              onAddEmployee={handleAddEmployee}
              onAddService={handleAddService}
              onAddTransaction={handleAddTransaction}
              onToggleAutoReport={handleToggleAutoReport}
              onSaveQuotation={handleSaveQuotation}
              onUpdateQuotationStatus={handleUpdateQuotationStatus}
              onAssignEmployeeToClient={handleAssignEmployeeToClient}
              onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
              onAddEvidence={handleAddEvidence}
            />
          )}
        </main>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        <BottomNav
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Supabase SQL & Connection Manager Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDataSync={loadDataFromSupabase}
      />

      {/* System Workflow & Protocol Modal for Clients */}
      <SystemWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        clientName={currentRole === 'client' ? 'Oficinas Corporativas SkyTower' : 'Estimado Cliente'}
      />
    </div>
  );
}

