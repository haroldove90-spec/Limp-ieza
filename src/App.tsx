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
  ServiceTask,
  AppUser
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
  INITIAL_QUOTATIONS,
  INITIAL_USERS
} from './data/mockData';
import { supabaseService } from './services/supabaseService';
import { SupabaseModal } from './components/common/SupabaseModal';
import { ProfileModal } from './components/common/ProfileModal';

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
  Boxes,
  Building,
  UserCheck,
  User as UserIcon
} from 'lucide-react';

export default function App() {
  // Active Authenticated User & Profile Modal
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('cleanpro_current_user') || localStorage.getItem('cleanpro_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.username === 'carlos.mendoza' ||
          parsed.username === 'lucia.santos' ||
          parsed.username === 'miguel.rivas' ||
          parsed.name?.includes('Carlos Mendoza') ||
          parsed.name?.includes('Lucía Santos')
        ) {
          localStorage.removeItem('cleanpro_current_user');
          localStorage.removeItem('cleanpro_auth_user');
          return null;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Persistent authenticated identity (keeps track of who logged in even when admin tests other role views)
  const [authenticatedUser, setAuthenticatedUser] = useState<AppUser | null>(() => {
    try {
      const savedAuth = localStorage.getItem('cleanpro_auth_user') || localStorage.getItem('cleanpro_current_user');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (
          parsed.username !== 'carlos.mendoza' &&
          parsed.username !== 'lucia.santos' &&
          parsed.username !== 'miguel.rivas' &&
          !parsed.name?.includes('Carlos Mendoza')
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Application role & navigation state - restores from session so refreshing browser doesn't log out
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlRole = searchParams.get('role') as UserRole | null;
      if (urlRole && ['operative', 'client', 'admin'].includes(urlRole)) {
        return urlRole;
      }

      const savedRole = localStorage.getItem('cleanpro_current_role') as UserRole | null;
      if (savedRole && ['operative', 'client', 'admin'].includes(savedRole)) {
        return savedRole;
      }

      const savedUser = localStorage.getItem('cleanpro_current_user') || localStorage.getItem('cleanpro_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role && ['operative', 'client', 'admin'].includes(parsed.role)) {
          return parsed.role;
        }
      }
    } catch {
      // ignore
    }
    return 'home';
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    try {
      const savedTab = localStorage.getItem('cleanpro_active_tab');
      if (savedTab) return savedTab;
    } catch {
      // ignore
    }
    return 'agenda';
  });

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [selectedOperativeId, setSelectedOperativeId] = useState<string>('EMP-04');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync role and active tab to localStorage whenever they change
  useEffect(() => {
    try {
      if (currentRole && currentRole !== 'home') {
        localStorage.setItem('cleanpro_current_role', currentRole);
      } else if (currentRole === 'home') {
        localStorage.removeItem('cleanpro_current_role');
      }
    } catch {
      // ignore
    }
  }, [currentRole]);

  useEffect(() => {
    try {
      if (activeTab) {
        localStorage.setItem('cleanpro_active_tab', activeTab);
      }
    } catch {
      // ignore
    }
  }, [activeTab]);

  // Admin access control flag: strictly checks if the logged-in user is an administrator
  const isAdmin = authenticatedUser?.role === 'admin' || currentUser?.role === 'admin';

  // In-memory application data state
  const [services, setServices] = useState<CleaningService[]>(INITIAL_SERVICES);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [kitItems, setKitItems] = useState<KitItem[]>(INITIAL_KIT);
  const [supplies, setSupplies] = useState<SupplyItem[]>(INITIAL_SUPPLIES_INVENTORY);
  const [warehouseMovements, setWarehouseMovements] = useState<WarehouseMovement[]>(INITIAL_WAREHOUSE_MOVEMENTS);
  const [cycleReports, setCycleReports] = useState<Cycle3DayReport[]>(INITIAL_3DAY_REPORTS);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>(INITIAL_SUPPLY_REQUESTS);
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('cleanpro_cached_clients');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  });
  const [employees, setEmployees] = useState<EmployeeProfile[]>(INITIAL_EMPLOYEES);
  const [finances, setFinances] = useState<TransactionRecord[]>(INITIAL_FINANCES);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);

  // Fetch Supabase data if tables exist
  const loadDataFromSupabase = async () => {
    try {
      const data = await supabaseService.fetchAll();

      if (data.clients !== null) {
        setClients(data.clients);
        try {
          localStorage.setItem('cleanpro_cached_clients', JSON.stringify(data.clients));
        } catch {
          // ignore
        }
      }
      if (data.employees !== null) {
        // Filter out any legacy mock employees
        const filtered = data.employees.filter(
          (e) =>
            e.id !== 'EMP-01' &&
            e.id !== 'EMP-02' &&
            e.id !== 'EMP-03' &&
            !e.name.toLowerCase().includes('carlos mendoza') &&
            !e.name.toLowerCase().includes('lucía santos') &&
            !e.name.toLowerCase().includes('miguel rivas')
        );
        // Always ensure Harold and José exist
        const hasHarold = filtered.some(
          (e) => e.id === 'EMP-00' || e.username === 'haroldo90'
        );
        const hasJose = filtered.some(
          (e) => e.id === 'EMP-04' || e.username === 'josesers'
        );
        const finalEmployees = [...filtered];
        if (!hasHarold) {
          const harold = INITIAL_EMPLOYEES.find((e) => e.id === 'EMP-00');
          if (harold) finalEmployees.unshift(harold);
        }
        if (!hasJose) {
          const jose = INITIAL_EMPLOYEES.find((e) => e.id === 'EMP-04');
          if (jose) finalEmployees.push(jose);
        }
        setEmployees(finalEmployees);
      }
      if (data.services !== null) {
        setServices(data.services.filter((s) => s.id !== 'SRV-101' && s.id !== 'SRV-102'));
      }
      if (data.incidents !== null) {
        setIncidents(data.incidents.filter((i) => i.id !== 'INC-101'));
      }
      if (data.supplies !== null) setSupplies(data.supplies);
      if (data.kitItems !== null) setKitItems(data.kitItems);
      if (data.warehouseMovements !== null)
        setWarehouseMovements(data.warehouseMovements);
      if (data.cycleReports !== null) setCycleReports(data.cycleReports);
      if (data.supplyRequests !== null)
        setSupplyRequests(data.supplyRequests);
      if (data.finances !== null) setFinances(data.finances);
      if (data.quotations !== null) setQuotations(data.quotations);

      // Sync fresh user credentials and avatar from app_users
      if (data.users && data.users.length > 0) {
        const saved = localStorage.getItem('cleanpro_current_user') || localStorage.getItem('cleanpro_auth_user');
        let freshUser: AppUser | undefined;

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            freshUser = data.users.find(
              (u) =>
                u.id === parsed.id ||
                (u.username && parsed.username && u.username.toLowerCase() === parsed.username.toLowerCase()) ||
                (parsed.email && u.email && u.email.toLowerCase() === parsed.email.toLowerCase())
            );
          } catch {
            // ignore
          }
        }

        // Si no hay sesión guardada o no coincidió, sincronizar con el rol actual
        if (!freshUser) {
          if (currentRole === 'admin') {
            freshUser = data.users.find((u) => u.username === 'haroldo90' || u.role === 'admin');
          } else if (currentRole === 'operative') {
            freshUser = data.users.find((u) => u.username === 'josesers' || u.role === 'operative');
          } else if (currentRole === 'client') {
            freshUser = data.users.find((u) => u.role === 'client');
          }
        }

        if (freshUser) {
          setCurrentUser((prev) => {
            // Preservar si hay un avatar reciente en memoria que no haya cambiado
            return {
              ...(prev || {}),
              ...freshUser,
              avatarUrl: freshUser.avatarUrl || prev?.avatarUrl
            };
          });
          setAuthenticatedUser((prev) => ({
            ...(prev || {}),
            ...freshUser,
            avatarUrl: freshUser.avatarUrl || prev?.avatarUrl
          }));
          try {
            localStorage.setItem('cleanpro_current_user', JSON.stringify(freshUser));
            localStorage.setItem('cleanpro_auth_user', JSON.stringify(freshUser));
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // Keep local state on error
    }
  };

  const handlePurgeMockData = async () => {
    try {
      await supabaseService.purgeMockDataFromDatabase();
      await loadDataFromSupabase();
    } catch (err) {
      console.error('Error al purgar datos demo:', err);
    }
  };

  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  // Handle direct access via WhatsApp credentials link (e.g. ?role=client&user=...&pass=...)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlRole = searchParams.get('role') as UserRole | null;
      const urlUser = searchParams.get('user');
      const urlPass = searchParams.get('pass');

      if (urlRole && ['operative', 'client', 'admin'].includes(urlRole)) {
        const cleanUser = (urlUser || '').trim();
        const cleanPass = (urlPass || '').trim();

        // 1. Try to find in INITIAL_USERS
        let matchedUser = INITIAL_USERS.find(
          (u) =>
            u.role === urlRole &&
            (cleanUser
              ? u.username?.toLowerCase() === cleanUser.toLowerCase() ||
                u.email?.toLowerCase() === cleanUser.toLowerCase()
              : true)
        );

        // 2. If not in INITIAL_USERS, try in employees or clients
        if (!matchedUser && urlRole === 'operative') {
          const emp = employees.find(
            (e) =>
              cleanUser &&
              (e.username?.toLowerCase() === cleanUser.toLowerCase() ||
                e.email?.toLowerCase() === cleanUser.toLowerCase())
          );
          if (emp) {
            matchedUser = {
              id: emp.id,
              name: emp.name,
              email: emp.email,
              username: emp.username || cleanUser,
              password: emp.password || cleanPass || 'Sers#Segura2025!',
              role: 'operative',
              phone: emp.phone,
              jobTitle: emp.role,
              assignedZone: emp.assignedZone,
              status: 'activo'
            };
          }
        } else if (!matchedUser && urlRole === 'client') {
          const cli = clients.find(
            (c) =>
              cleanUser &&
              (c.username?.toLowerCase() === cleanUser.toLowerCase() ||
                c.email?.toLowerCase() === cleanUser.toLowerCase() ||
                c.name?.toLowerCase().includes(cleanUser.toLowerCase()))
          );
          if (cli) {
            matchedUser = {
              id: cli.id,
              name: cli.contactPerson || cli.name,
              email: cli.email,
              username: cli.username || cleanUser,
              password: cli.password || cleanPass || 'Sers#Cliente2025!',
              role: 'client',
              phone: cli.phone,
              jobTitle: 'Representante de Cliente',
              assignedZone: cli.address,
              status: 'activo'
            };
          }
        }

        // 3. Fallback direct synthesization
        if (!matchedUser) {
          matchedUser = {
            id: `USR-DIRECT-${Date.now()}`,
            name: cleanUser || (urlRole === 'client' ? 'Cliente Registrado' : 'Técnico Operativo'),
            username: cleanUser || (urlRole === 'client' ? 'cliente' : 'operativo'),
            email: cleanUser.includes('@') ? cleanUser : `${cleanUser || 'usuario'}@sers.com`,
            role: urlRole as 'admin' | 'operative' | 'client',
            phone: '+52 55 1234 5678',
            jobTitle: urlRole === 'client' ? 'Portal de Cliente' : 'Técnico de Limpieza',
            assignedZone: 'Zona de Operación',
            password: cleanPass || 'Sers#2025!',
            status: 'activo'
          };
        }

        handleLoginSuccess(matchedUser);
      }
    } catch (err) {
      console.warn('Error parsing direct access URL parameters:', err);
    }
  }, []);

  // Role switching and user synchronization (STRICTLY Admin only)
  const handleSelectRole = (role: UserRole) => {
    // Only administrators can navigate across different roles
    if (!isAdmin && authenticatedUser && role !== authenticatedUser.role) {
      console.warn('Acceso denegado: solo el administrador general tiene permisos para navegar en todos los roles.');
      return;
    }

    setCurrentRole(role);
    if (role === 'operative') {
      setActiveTab('agenda');
      const matching = employees.find((e) => e.id === 'EMP-04' || e.username === 'josesers');
      if (matching) setSelectedOperativeId(matching.id);
      // If operative user profile is needed for operative-specific UI
      const jose = INITIAL_USERS.find((u) => u.username === 'josesers') || {
        id: 'USR-JOSE-02',
        name: 'José del Carmen Sotero',
        username: 'josesers',
        email: 'contacto.sers@gmail.com',
        role: 'operative' as const,
        phone: '+52 99 3123 4567',
        jobTitle: 'Supervisor de Operaciones y Servicios',
        assignedZone: 'Zona Industrial y Corporativa',
        password: 'Sers#Segura2025!',
        status: 'activo'
      };
      if (!isAdmin) {
        setCurrentUser(jose);
        try {
          localStorage.setItem('cleanpro_current_user', JSON.stringify(jose));
        } catch {
          // ignore
        }
      }
    } else if (role === 'client') {
      setActiveTab('evidencias_cliente');
      const clientUser = INITIAL_USERS.find((u) => u.role === 'client') || {
        id: 'USR-CLIENT-01',
        name: 'Lic. Laura Méndez',
        username: 'laura_skytower',
        email: 'admin@skytower.mx',
        role: 'client' as const,
        phone: '+52 55 9876 5432',
        jobTitle: 'Administradora General',
        assignedZone: 'Oficinas Corporativas SkyTower',
        password: 'Cliente#SkyTower2025',
        status: 'activo'
      };
      if (!isAdmin) {
        setCurrentUser(clientUser);
        try {
          localStorage.setItem('cleanpro_current_user', JSON.stringify(clientUser));
        } catch {
          // ignore
        }
      }
    } else if (role === 'admin') {
      setActiveTab('supervision_admin');
      if (authenticatedUser && authenticatedUser.role === 'admin') {
        setCurrentUser(authenticatedUser);
        try {
          localStorage.setItem('cleanpro_current_user', JSON.stringify(authenticatedUser));
        } catch {
          // ignore
        }
      } else {
        const harold = INITIAL_USERS.find((u) => u.username === 'haroldo90') || {
          id: 'USR-HAROLD-01',
          name: 'Harold Anguiano Morales',
          username: 'haroldo90',
          email: 'haroldo90@hotmail.com',
          role: 'admin' as const,
          phone: '+52 55 1234 5678',
          jobTitle: 'Dirección General / Administrador',
          assignedZone: 'Oficina Central / Todas las Zonas',
          password: 'Chevropar#1970',
          status: 'activo'
        };
        setCurrentUser(harold);
        try {
          localStorage.setItem('cleanpro_current_user', JSON.stringify(harold));
        } catch {
          // ignore
        }
      }
    }
  };

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setAuthenticatedUser(user);
    try {
      localStorage.setItem('cleanpro_current_user', JSON.stringify(user));
      localStorage.setItem('cleanpro_auth_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setCurrentRole(user.role);
    if (user.role === 'operative') {
      setActiveTab('agenda');
      const matching = employees.find((e) => e.username === user.username || e.email === user.email);
      if (matching) setSelectedOperativeId(matching.id);
    } else if (user.role === 'client') {
      setActiveTab('evidencias_cliente');
    } else if (user.role === 'admin') {
      setActiveTab('supervision_admin');
    }
  };

  const handleLogout = () => {
    setCurrentRole('home');
    setCurrentUser(null);
    setAuthenticatedUser(null);
    try {
      localStorage.removeItem('cleanpro_current_user');
      localStorage.removeItem('cleanpro_auth_user');
    } catch {
      // ignore
    }
  };

  const handleUpdateCurrentUser = (updatedUser: AppUser) => {
    setCurrentUser(updatedUser);
    setAuthenticatedUser(updatedUser);
    try {
      localStorage.setItem('cleanpro_current_user', JSON.stringify(updatedUser));
      localStorage.setItem('cleanpro_auth_user', JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    setEmployees((prev) =>
      prev.map((e) => {
        if (
          e.username === updatedUser.username ||
          e.email === updatedUser.email ||
          (updatedUser.username === 'haroldo90' && e.id === 'EMP-00') ||
          (updatedUser.username === 'josesers' && e.id === 'EMP-04') ||
          e.id === updatedUser.id ||
          (updatedUser.id && e.id === updatedUser.id.replace('USR-', 'EMP-'))
        ) {
          return {
            ...e,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone || e.phone,
            jobTitle: updatedUser.jobTitle || e.jobTitle,
            avatarUrl: updatedUser.avatarUrl !== undefined ? updatedUser.avatarUrl : e.avatarUrl,
            password: updatedUser.password || e.password,
            notes: updatedUser.notes || e.notes
          };
        }
        return e;
      })
    );
  };

  const handleUpdateEmployee = (updatedEmployee: EmployeeProfile) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmployee.id ? updatedEmployee : e))
    );
    supabaseService.saveEmployee(updatedEmployee).catch((err) => console.error('Error actualizando empleado:', err));
    if (
      currentUser &&
      (currentUser.username === updatedEmployee.username || currentUser.email === updatedEmployee.email)
    ) {
      const syncUser: AppUser = {
        ...currentUser,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        jobTitle: updatedEmployee.jobTitle,
        avatarUrl: updatedEmployee.avatarUrl,
        password: updatedEmployee.password,
        notes: updatedEmployee.notes
      };
      setCurrentUser(syncUser);
      try {
        localStorage.setItem('cleanpro_current_user', JSON.stringify(syncUser));
      } catch {
        // ignore
      }
    }
  };

  // Operative Handlers
  const handleUpdateServiceStatus = (serviceId: string, status: CleaningService['status']) => {
    setServices((prev) => {
      const updated = prev.map((s) => (s.id === serviceId ? { ...s, status } : s));
      const target = updated.find((s) => s.id === serviceId);
      if (target) supabaseService.saveService(target).catch(console.error);
      return updated;
    });
  };

  const handleToggleTask = (serviceId: string, taskId: string) => {
    setServices((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          )
        };
      });
      const target = updated.find((s) => s.id === serviceId);
      if (target) supabaseService.saveService(target).catch(console.error);
      return updated;
    });
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

    setServices((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== serviceId) return s;
        return {
          ...s,
          evidences: [newEvidence, ...s.evidences]
        };
      });
      const target = updated.find((s) => s.id === serviceId);
      if (target) supabaseService.saveService(target).catch(console.error);
      return updated;
    });
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
    supabaseService.saveIncident(newInc).catch((err) => console.error('Error guardando incidencia en Supabase:', err));
  };

  const handleToggleKitCheckin = (kitId: string) => {
    setKitItems((prev) => {
      const updated = prev.map((k) => (k.id === kitId ? { ...k, checkedIn: !k.checkedIn } : k));
      const target = updated.find((k) => k.id === kitId);
      if (target) supabaseService.saveKitItem(target).catch(console.error);
      return updated;
    });
  };

  const handleReportShortage = (kitId: string, note: string) => {
    setKitItems((prev) => {
      const updated = prev.map((k) => (k.id === kitId ? { ...k, status: 'escaso' as const, notes: note } : k));
      const target = updated.find((k) => k.id === kitId);
      if (target) supabaseService.saveKitItem(target).catch(console.error);
      return updated;
    });
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
    setSupplies((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== movement.supplyId) return s;
        const delta = movement.type === 'entrada' ? movement.quantity : -movement.quantity;
        const currentStock = Math.max(0, s.currentStock + delta);
        const upSupply = { ...s, currentStock };
        supabaseService.saveSupply(upSupply).catch(console.error);
        return upSupply;
      });
      return updated;
    });

    setWarehouseMovements((prev) => [newMov, ...prev]);
    supabaseService.saveWarehouseMovement(newMov).catch((err) => console.error('Error guardando movimiento en Supabase:', err));
  };

  const handleEditWarehouseMovement = (updatedMovement: WarehouseMovement) => {
    const oldMovement = warehouseMovements.find((m) => m.id === updatedMovement.id);
    if (oldMovement) {
      setSupplies((prev) => {
        const updated = prev.map((s) => {
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
          const upSupply = { ...s, currentStock };
          if (s.id === oldMovement.supplyId || s.id === updatedMovement.supplyId) {
            supabaseService.saveSupply(upSupply).catch(console.error);
          }
          return upSupply;
        });
        return updated;
      });
    }

    setWarehouseMovements((prev) =>
      prev.map((m) => (m.id === updatedMovement.id ? updatedMovement : m))
    );
    supabaseService.saveWarehouseMovement(updatedMovement).catch(console.error);
  };

  const handleDeleteWarehouseMovement = (movementId: string) => {
    const oldMovement = warehouseMovements.find((m) => m.id === movementId);
    if (oldMovement) {
      // Revert stock effect
      setSupplies((prev) => {
        const updated = prev.map((s) => {
          if (s.id !== oldMovement.supplyId) return s;
          const revertDelta = oldMovement.type === 'entrada' ? -oldMovement.quantity : oldMovement.quantity;
          const upSupply = { ...s, currentStock: Math.max(0, s.currentStock + revertDelta) };
          supabaseService.saveSupply(upSupply).catch(console.error);
          return upSupply;
        });
        return updated;
      });
    }
    setWarehouseMovements((prev) => prev.filter((m) => m.id !== movementId));
    supabaseService.deleteWarehouseMovement(movementId).catch(console.error);
  };

  const handleAdjustSupplyStock = (supplyId: string, newStock: number) => {
    setSupplies((prev) => {
      const updated = prev.map((s) => (s.id === supplyId ? { ...s, currentStock: Math.max(0, newStock) } : s));
      const target = updated.find((s) => s.id === supplyId);
      if (target) supabaseService.saveSupply(target).catch(console.error);
      return updated;
    });
  };

  // Client Handlers
  const handleEmitSupplyRequest = (
    request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>
  ) => {
    const newReq: SupplyRequest = {
      ...request,
      id: `REQ-${Date.now().toString().slice(-4)}`,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pendiente'
    };
    setSupplyRequests((prev) => [newReq, ...prev]);
    supabaseService.saveSupplyRequest(newReq).catch(console.error);
  };

  // Admin Handlers
  const handleApproveService = (serviceId: string) => {
    setServices((prev) => {
      const updated = prev.map((s) => (s.id === serviceId ? { ...s, approvedByAdmin: true } : s));
      const target = updated.find((s) => s.id === serviceId);
      if (target) supabaseService.saveService(target).catch(console.error);
      return updated;
    });
  };

  const handleResolveIncident = (incidentId: string, resolution: string) => {
    setIncidents((prev) => {
      const updated = prev.map((i) =>
        i.id === incidentId
          ? { ...i, status: 'resuelto' as const, adminResolution: resolution, resolutionNotes: resolution }
          : i
      );
      const target = updated.find((i) => i.id === incidentId);
      if (target) supabaseService.saveIncident(target).catch(console.error);
      return updated;
    });
  };

  const handleResolveIncidentWithEvidence = (
    incidentId: string,
    data: {
      resolutionNotes: string;
      resolutionPhotoUrl?: string;
      resolvedBy: string;
      resolvedByRole?: 'operativo' | 'admin';
    }
  ) => {
    const now = new Date();
    const resolvedAt = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    setIncidents((prev) => {
      const updated = prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              status: 'resuelto' as const,
              adminResolution: data.resolutionNotes,
              resolutionNotes: data.resolutionNotes,
              resolutionPhotoUrl: data.resolutionPhotoUrl,
              resolvedAt,
              resolvedBy: data.resolvedBy,
              resolvedByRole: data.resolvedByRole || 'operativo'
            }
          : i
      );
      const target = updated.find((i) => i.id === incidentId);
      if (target) supabaseService.saveIncident(target).catch(console.error);
      return updated;
    });
  };

  const handleUpdateSupplyStock = (supplyId: string, delta: number) => {
    setSupplies((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== supplyId) return s;
        const newStock = Math.max(0, s.currentStock + delta);
        return { ...s, currentStock: newStock };
      });
      const target = updated.find((s) => s.id === supplyId);
      if (target) supabaseService.saveSupply(target).catch(console.error);
      return updated;
    });
  };

  const handleApproveSupplyRequest = (
    requestId: string,
    status: SupplyRequest['status']
  ) => {
    setSupplyRequests((prev) => {
      const updated = prev.map((r) => (r.id === requestId ? { ...r, status } : r));
      const target = updated.find((r) => r.id === requestId);
      if (target) supabaseService.saveSupplyRequest(target).catch(console.error);
      return updated;
    });
  };

  const handleAddClient = async (client: Omit<ClientProfile, 'id'>) => {
    const newCli: ClientProfile = {
      ...client,
      id: `CLI-${Date.now().toString().slice(-6)}`
    };
    setClients((prev) => {
      const updated = [...prev, newCli];
      try {
        localStorage.setItem('cleanpro_cached_clients', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      const res = await supabaseService.saveClient(newCli);
      if (res.success) {
        console.log(`Cliente "${newCli.name}" guardado exitosamente en Supabase.`);
      } else {
        console.warn(`Aviso al guardar cliente "${newCli.name}" en Supabase:`, res.error);
      }
    } catch (err) {
      console.error('Error guardando cliente en Supabase:', err);
    }
  };

  const handleUpdateClient = async (updatedClient: ClientProfile) => {
    setClients((prev) => {
      const updated = prev.map((c) => (c.id === updatedClient.id ? updatedClient : c));
      try {
        localStorage.setItem('cleanpro_cached_clients', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      const res = await supabaseService.saveClient(updatedClient);
      if (!res.success) {
        console.warn('Aviso al actualizar cliente en Supabase:', res.error);
      }
    } catch (err) {
      console.error('Error actualizando cliente en Supabase:', err);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== clientId);
      try {
        localStorage.setItem('cleanpro_cached_clients', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    try {
      await supabaseService.deleteClient(clientId);
    } catch (err) {
      console.error('Error eliminando cliente en Supabase:', err);
    }
  };

  const handleToggleClientStatus = async (clientId: string) => {
    let clientToSave: ClientProfile | null = null;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const currentStatus = (c as any).status || 'activo';
        const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
        const updated = { ...c, status: newStatus as any };
        clientToSave = updated;
        return updated;
      })
    );
    if (clientToSave) {
      try {
        await supabaseService.saveClient(clientToSave);
      } catch (err) {
        console.error('Error cambiando estatus cliente en Supabase:', err);
      }
    }
  };

  const handleAddEmployee = (
    employee: Omit<EmployeeProfile, 'id' | 'servicesCompletedThisMonth'>
  ) => {
    const newEmp: EmployeeProfile = {
      ...employee,
      id: `EMP-${Date.now().toString().slice(-4)}`,
      servicesCompletedThisMonth: 0
    };
    setEmployees((prev) => [...prev, newEmp]);
    supabaseService.saveEmployee(newEmp).catch((err) => console.error('Error guardando empleado en Supabase:', err));
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    supabaseService.deleteEmployee(employeeId).catch((err) => console.error('Error eliminando empleado en Supabase:', err));
  };

  const handleToggleEmployeeStatus = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== employeeId) return e;
        const newStatus = e.status === 'activo' ? 'inactivo' : 'activo';
        const updated = { ...e, status: newStatus as 'activo' | 'inactivo' };
        supabaseService.saveEmployee(updated).catch((err) => console.error('Error cambiando estatus empleado en Supabase:', err));
        return updated;
      })
    );
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
      id: `SRV-${Date.now().toString().slice(-4)}`,
      tasks: service.tasks && service.tasks.length > 0 ? service.tasks : defaultTasks,
      evidences: [],
      approvedByAdmin: false
    };
    setServices((prev) => [newSrv, ...prev]);
    supabaseService.saveService(newSrv).catch((err) => console.error('Error guardando servicio en Supabase:', err));
  };

  const handleUpdateService = (updatedService: CleaningService) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updatedService.id ? updatedService : s))
    );
    supabaseService.saveService(updatedService).catch((err) => console.error('Error actualizando servicio en Supabase:', err));
  };

  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    supabaseService.deleteService(serviceId).catch((err) => console.error('Error eliminando servicio en Supabase:', err));
  };

  const handleDeleteIncident = (incidentId: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
    supabaseService.deleteIncident(incidentId).catch((err) => console.error('Error eliminando incidencia en Supabase:', err));
  };

  const handleAddSupply = (supply: Omit<SupplyItem, 'id'>) => {
    const newSup: SupplyItem = {
      ...supply,
      id: `SUP-${Date.now().toString().slice(-4)}`
    };
    setSupplies((prev) => [...prev, newSup]);
    supabaseService.saveSupply(newSup).catch((err) => console.error('Error guardando insumo en Supabase:', err));
  };

  const handleUpdateSupply = (updatedSupply: SupplyItem) => {
    setSupplies((prev) =>
      prev.map((s) => (s.id === updatedSupply.id ? updatedSupply : s))
    );
    supabaseService.saveSupply(updatedSupply).catch((err) => console.error('Error actualizando insumo en Supabase:', err));
  };

  const handleDeleteSupply = (supplyId: string) => {
    setSupplies((prev) => prev.filter((s) => s.id !== supplyId));
    supabaseService.deleteSupply(supplyId).catch((err) => console.error('Error eliminando insumo en Supabase:', err));
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
    setServices((prev) => {
      const updated = prev.map((s) =>
        s.id === serviceId
          ? {
              ...s,
              clientSignature: signature,
              status: 'completado' as const
            }
          : s
      );
      const target = updated.find((s) => s.id === serviceId);
      if (target) supabaseService.saveService(target).catch(console.error);
      return updated;
    });
  };

  const handleAddTransaction = (transaction: Omit<TransactionRecord, 'id'>) => {
    const newTx: TransactionRecord = {
      ...transaction,
      id: `TX-${Date.now().toString().slice(-4)}`
    };
    setFinances((prev) => [newTx, ...prev]);
    supabaseService.saveTransaction(newTx).catch(console.error);
  };

  const handleToggleAutoReport = (clientId: string) => {
    setClients((prev) => {
      const updated = prev.map((c) =>
        c.id === clientId ? { ...c, auto3DayReport: !c.auto3DayReport } : c
      );
      const target = updated.find((c) => c.id === clientId);
      if (target) supabaseService.saveClient(target).catch(console.error);
      return updated;
    });
  };

  const handleSaveQuotation = (quotation: Quotation) => {
    setQuotations((prev) => {
      const exists = prev.find((q) => q.id === quotation.id);
      if (exists) {
        return prev.map((q) => (q.id === quotation.id ? quotation : q));
      }
      return [quotation, ...prev];
    });
    supabaseService.saveQuotation(quotation).catch(console.error);
  };

  const handleUpdateQuotationStatus = (quotationId: string, status: Quotation['status']) => {
    setQuotations((prev) => {
      const updated = prev.map((q) => (q.id === quotationId ? { ...q, status } : q));
      const target = updated.find((q) => q.id === quotationId);
      if (target) supabaseService.saveQuotation(target).catch(console.error);
      return updated;
    });
  };

  const handleAssignEmployeeToClient = (clientId: string, employeeId: string) => {
    const employee = employees.find((e) => e.id === employeeId);
    if (!employee) return;

    setClients((prev) => {
      const updated = prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              assignedEmployeeId: employee.id,
              assignedEmployeeName: employee.name,
              assignedEmployeePhone: employee.phone,
              assignedEmployeeRole: employee.role
            }
          : c
      );
      const target = updated.find((c) => c.id === clientId);
      if (target) supabaseService.saveClient(target).catch(console.error);
      return updated;
    });

    // Also update any scheduled services for this client
    const targetClient = clients.find((c) => c.id === clientId);
    if (targetClient) {
      setServices((prev) => {
        const updated = prev.map((s) => {
          if (s.clientName.includes(targetClient.name) || targetClient.name.includes(s.clientName)) {
            if (s.status === 'programado' || s.status === 'en_proceso') {
              const upSrv = {
                ...s,
                operativeId: employee.id,
                operativeName: employee.name
              };
              supabaseService.saveService(upSrv).catch(console.error);
              return upSrv;
            }
          }
          return s;
        });
        return updated;
      });
    }
  };

  const currentClientProfile =
    clients.find(
      (c) =>
        (currentUser?.id && (c.id === currentUser.id || c.id === currentUser.id.replace('USR-', ''))) ||
        (currentUser?.email && c.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
        (currentUser?.assignedZone && c.name?.toLowerCase().trim() === currentUser.assignedZone.toLowerCase().trim()) ||
        (currentUser?.name && (c.contactPerson?.toLowerCase().trim() === currentUser.name.toLowerCase().trim() || c.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim()))
    ) || clients[0];
  const assignedEmp = employees.find(
    (e) => e.id === currentClientProfile?.assignedEmployeeId || e.name === currentClientProfile?.assignedEmployeeName
  ) || employees[0];

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
          { id: 'insumos_cliente', name: 'Reporte 3 Días', icon: Layers },
          {
            id: 'incidencias_cliente',
            name: 'Incidencias',
            icon: AlertTriangle,
            badgeCount: incidents.filter((i) => {
              if (i.status === 'resuelto') return false;
              if (currentClientProfile?.name) {
                return i.clientName.toLowerCase().includes(currentClientProfile.name.toLowerCase());
              }
              return true;
            }).length
          },
          { id: 'tecnico_cliente', name: 'Técnico Asignado', icon: UserCheck }
        ];
      case 'admin':
        return [
          { id: 'supervision_admin', name: 'Supervisión', icon: ShieldCheck, badgeCount: services.filter((s) => !s.approvedByAdmin).length },
          { id: 'personal_admin', name: 'Personal & WhatsApp', icon: Users },
          { id: 'operacion_admin', name: 'Clientes & Sedes', icon: Building },
          { id: 'cotizaciones_admin', name: 'Cotizaciones', icon: FileText, badgeCount: quotations.filter((q) => q.status === 'borrador').length },
          { id: 'insumos_admin', name: 'Insumos e Inv.', icon: Package, badgeCount: supplyRequests.filter((r) => r.status === 'pendiente').length },
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
    return (
      <>
        <RoleSelectorHome
          onSelectRole={handleSelectRole}
          onLoginSuccess={handleLoginSuccess}
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
          clientName={currentClientProfile?.name || 'Cliente Corporativo SERS'}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-row">
      {/* Fullscreen Desktop Left Sidebar - Central Role Switcher for Admin */}
      <Sidebar
        currentRole={currentRole}
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isAdmin={isAdmin}
        onSelectRole={handleSelectRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header with Role indicator & Logout button */}
        <Header
          currentRole={currentRole}
          activeModuleName={activeModuleName}
          onLogout={handleLogout}
          clientName={currentClientProfile?.name || 'Cliente Corporativo'}
          operativeName={employees.find((e) => e.id === selectedOperativeId)?.name || 'José del Carmen Sotero'}
          onSelectRole={handleSelectRole}
          onOpenSupabase={() => setIsSupabaseModalOpen(true)}
          onOpenWorkflow={() => setIsWorkflowModalOpen(true)}
          currentUser={currentUser}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          isAdmin={isAdmin}
        />

        {/* Dynamic Role Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentRole === 'operative' && (
            <OperativeDashboard
              activeTab={activeTab}
              onTabChange={setActiveTab}
              services={services}
              incidents={incidents}
              kitItems={kitItems}
              supplies={supplies}
              movements={warehouseMovements}
              employees={employees}
              clients={clients}
              selectedOperativeId={selectedOperativeId}
              onSelectOperative={setSelectedOperativeId}
              operativeName={employees.find((e) => e.id === selectedOperativeId)?.name || 'José del Carmen Sotero'}
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
              onResolveIncidentWithEvidence={handleResolveIncidentWithEvidence}
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
              clientName={currentClientProfile?.name || 'Cliente Corporativo SERS'}
              clientProfile={currentClientProfile}
              assignedEmployee={assignedEmp}
              onEmitSupplyRequest={handleEmitSupplyRequest}
              onClientReportIncident={handleAddIncident}
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
              onResolveIncidentWithEvidence={handleResolveIncidentWithEvidence}
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
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onToggleEmployeeStatus={handleToggleEmployeeStatus}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onToggleClientStatus={handleToggleClientStatus}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
              onDeleteIncident={handleDeleteIncident}
              onAddSupply={handleAddSupply}
              onUpdateSupply={handleUpdateSupply}
              onDeleteSupply={handleDeleteSupply}
              onPurgeMockData={handlePurgeMockData}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              onSelectRole={handleSelectRole}
            />
          )}
        </main>

        {/* Mobile & Tablet Bottom Navigation Bar */}
        <BottomNav
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAdmin={isAdmin}
          currentRole={currentRole}
          onSelectRole={handleSelectRole}
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

      {/* Universal User Profile Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={
            currentUser || {
              id: currentRole === 'admin' ? 'USR-HAROLD-01' : 'USR-JOSE-02',
              name: currentRole === 'admin' ? 'Harold Anguiano Morales' : 'José del Carmen Sotero',
              username: currentRole === 'admin' ? 'haroldo90' : 'josesers',
              email: currentRole === 'admin' ? 'haroldo90@hotmail.com' : 'contacto.sers@gmail.com',
              role: (currentRole === 'admin' ? 'admin' : currentRole === 'client' ? 'client' : 'operative'),
              phone: currentRole === 'admin' ? '+52 55 1234 5678' : '+52 99 3123 4567',
              jobTitle: currentRole === 'admin' ? 'Dirección General SERS' : 'Supervisor Operativo',
              assignedZone: currentRole === 'admin' ? 'Oficina Central / Todas las Zonas' : 'Zona Industrial y Corporativa',
              password: currentRole === 'admin' ? 'Chevropar#1970' : 'Sers#Segura2025!',
              status: 'activo'
            }
          }
          onUpdateUser={handleUpdateCurrentUser}
        />
      )}
    </div>
  );
}

