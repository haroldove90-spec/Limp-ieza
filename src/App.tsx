import React, { useState } from 'react';
import { UserRole, CleaningService, IncidentReport, KitItem, SupplyItem, Cycle3DayReport, SupplyRequest, ClientProfile, EmployeeProfile, TransactionRecord, PhotoEvidence } from './types';
import {
  INITIAL_SERVICES,
  INITIAL_INCIDENTS,
  INITIAL_KIT,
  INITIAL_SUPPLIES_INVENTORY,
  INITIAL_3DAY_REPORTS,
  INITIAL_SUPPLY_REQUESTS,
  INITIAL_CLIENTS,
  INITIAL_EMPLOYEES,
  INITIAL_FINANCES
} from './data/mockData';

import { RoleSelectorHome } from './components/common/RoleSelectorHome';
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
  CreditCard,
  ShieldCheck,
  Users,
  DollarSign
} from 'lucide-react';

export default function App() {
  // Application role & navigation state (in-memory only, no localStorage saving)
  const [currentRole, setCurrentRole] = useState<UserRole>('home');
  const [activeTab, setActiveTab] = useState<string>('agenda');

  // In-memory application data state
  const [services, setServices] = useState<CleaningService[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [kitItems, setKitItems] = useState<KitItem[]>(INITIAL_KIT);
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES_INVENTORY);
  const [cycleReports, setCycleReports] = useState<Cycle3DayReport[]>(INITIAL_3DAY_REPORTS);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(INITIAL_SUPPLY_REQUESTS);
  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  const [employees, setEmployees] = useState<EmployeeProfile[]>(INITIAL_EMPLOYEES);
  const [finances, setFinances] = useState<TransactionRecord[]>(INITIAL_FINANCES);

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
    service: Omit<CleaningService, 'id' | 'tasks' | 'evidences' | 'approvedByAdmin'>
  ) => {
    const newSrv: CleaningService = {
      ...service,
      id: `SRV-${Date.now().toString().slice(-3)}`,
      tasks: [
        { id: `T-${Date.now()}-1`, name: 'Limpieza y aspirado general', category: 'General', completed: false },
        { id: `T-${Date.now()}-2`, name: 'Desinfección de sanitarios', category: 'Sanitarios', completed: false },
        { id: `T-${Date.now()}-3`, name: 'Retiro y clasificación de residuos', category: 'Residuos', completed: false }
      ],
      evidences: [],
      approvedByAdmin: false
    };
    setServices((prev) => [newSrv, ...prev]);
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

  // Define Navigation Items based on Current Active Role
  const getNavItems = (): NavItem[] => {
    switch (currentRole) {
      case 'operative':
        return [
          { id: 'agenda', name: 'Agenda', icon: Calendar },
          { id: 'evidencias', name: 'Evidencias', icon: Camera },
          { id: 'incidencias', name: 'Incidencias', icon: AlertTriangle, badgeCount: incidents.filter((i) => i.status !== 'resuelto').length },
          { id: 'insumos_campo', name: 'Insumos', icon: Package, badgeCount: kitItems.filter((k) => k.status === 'escaso').length }
        ];
      case 'client':
        return [
          { id: 'evidencias_cliente', name: 'Evidencias', icon: Camera },
          { id: 'insumos_cliente', name: 'Reporte 3 Días', icon: Layers },
          { id: 'agenda_pagos_cliente', name: 'Agenda y Pagos', icon: CreditCard }
        ];
      case 'admin':
        return [
          { id: 'supervision_admin', name: 'Supervisión', icon: ShieldCheck, badgeCount: services.filter((s) => !s.approvedByAdmin).length },
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

  // If on Home role selection screen
  if (currentRole === 'home') {
    return <RoleSelectorHome onSelectRole={handleSelectRole} />;
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
          operativeName="Carlos Mendoza"
        />

        {/* Dynamic Role Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentRole === 'operative' && (
            <OperativeDashboard
              activeTab={activeTab}
              services={services}
              incidents={incidents}
              kitItems={kitItems}
              onUpdateServiceStatus={handleUpdateServiceStatus}
              onToggleTask={handleToggleTask}
              onAddEvidence={handleAddEvidence}
              onAddIncident={handleAddIncident}
              onToggleKitCheckin={handleToggleKitCheckin}
              onReportShortage={handleReportShortage}
            />
          )}

          {currentRole === 'client' && (
            <ClientDashboard
              activeTab={activeTab}
              services={services}
              incidents={incidents}
              cycleReports={cycleReports}
              supplyRequests={supplyRequests}
              finances={finances}
              clientName="Oficinas Corporativas SkyTower"
              onEmitSupplyRequest={handleEmitSupplyRequest}
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
              onApproveService={handleApproveService}
              onResolveIncident={handleResolveIncident}
              onUpdateSupplyStock={handleUpdateSupplyStock}
              onApproveSupplyRequest={handleApproveSupplyRequest}
              onAddClient={handleAddClient}
              onAddEmployee={handleAddEmployee}
              onAddService={handleAddService}
              onAddTransaction={handleAddTransaction}
              onToggleAutoReport={handleToggleAutoReport}
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
    </div>
  );
}
