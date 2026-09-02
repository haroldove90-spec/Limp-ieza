import React, { useState } from 'react';
import { EmployeeProfile, AppUser, ClientProfile, UserRole } from '../../../types';
import { supabaseService } from '../../../services/supabaseService';
import {
  Users,
  UserPlus,
  ShieldCheck,
  HardHat,
  Phone,
  Mail,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  Building2,
  Briefcase,
  Lock
} from 'lucide-react';
import { COMPANY_BRAND } from '../../../constants/branding';
import { cleanPhoneNumber } from '../../../utils/exportUtils';

interface StaffManagerProps {
  employees: EmployeeProfile[];
  clients: ClientProfile[];
  onAddEmployee: (employee: Omit<EmployeeProfile, 'id' | 'servicesCompletedThisMonth'>) => void;
  onUpdateEmployee?: (employee: EmployeeProfile) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onToggleEmployeeStatus?: (employeeId: string) => void;
}

export const StaffManager: React.FC<StaffManagerProps> = ({
  employees,
  clients,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onToggleEmployeeStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'operative'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);

  // New Employee Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleType, setRoleType] = useState<UserRole>('operative');
  const [jobTitle, setJobTitle] = useState('Técnico Especialista de Limpieza');
  const [assignedZone, setAssignedZone] = useState('Zona Industrial y Corporativa');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notes, setNotes] = useState('');
  const [empStatus, setEmpStatus] = useState<'activo' | 'inactivo'>('activo');
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeProfile | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Generate secure username based on name
  const handleAutoGenerateUsername = (fullName: string) => {
    if (!fullName) return;
    const parts = fullName.trim().toLowerCase().split(/\s+/);
    let generated = parts[0];
    if (parts.length > 1) {
      generated += parts[1].slice(0, 3);
    }
    const rand = Math.floor(10 + Math.random() * 90);
    setUsername(`${generated}${rand}`);
  };

  // Generate secure password
  const handleGenerateSecurePassword = () => {
    const prefix = 'Sers#';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const securePwd = `${prefix}${rand}!`;
    setPassword(securePwd);
    setShowPassword(true);
  };

  // Open modal for new registration
  const handleOpenNewModal = () => {
    setEditingEmployee(null);
    setName('');
    setEmail('');
    setPhone('+52 ');
    setRoleType('operative');
    setJobTitle('Técnico Especialista de Limpieza');
    setAssignedZone('Zona Centro / Oficinas');
    setUsername('');
    setPassword('');
    setNotes('');
    setEmpStatus('activo');
    setShowPassword(false);
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (emp: EmployeeProfile) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setRoleType(emp.role.toLowerCase().includes('admin') ? 'admin' : 'operative');
    setJobTitle(emp.jobTitle || emp.role);
    setAssignedZone(emp.assignedZone || 'Zona General');
    setUsername(emp.username || `user_${emp.id.toLowerCase()}`);
    setPassword(emp.password || 'Sers#Segura2025!');
    setNotes(emp.notes || '');
    setEmpStatus(emp.status === 'inactivo' ? 'inactivo' : 'activo');
    setShowPassword(false);
    setShowModal(true);
  };

  // Toggle active/inactive status
  const handleToggleStatus = async (emp: EmployeeProfile) => {
    const newStatus: 'activo' | 'inactivo' = emp.status === 'inactivo' ? 'activo' : 'inactivo';
    if (onToggleEmployeeStatus) {
      onToggleEmployeeStatus(emp.id);
    } else if (onUpdateEmployee) {
      onUpdateEmployee({ ...emp, status: newStatus });
    }
    try {
      await supabaseService.saveEmployee({ ...emp, status: newStatus });
    } catch (e) {
      console.warn('Error updating employee status in Supabase:', e);
    }
    setStatusNotification({
      type: 'success',
      text: `Estado de "${emp.name}" actualizado a ${newStatus === 'activo' ? 'Activo' : 'Inactivo'}.`
    });
  };

  // Prompt delete
  const handleDeleteEmployeePrompt = (emp: EmployeeProfile) => {
    if (emp.id === 'EMP-00' || emp.username === 'haroldo90' || emp.name.toLowerCase().includes('harold')) {
      setStatusNotification({
        type: 'error',
        text: 'No es posible eliminar a Harold Anguiano (Director General / Administrador Principal).'
      });
      return;
    }
    setEmployeeToDelete(emp);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    const target = employeeToDelete;
    setEmployeeToDelete(null);

    if (onDeleteEmployee) {
      onDeleteEmployee(target.id);
    }
    try {
      await supabaseService.deleteEmployee(target.id);
    } catch (e) {
      console.warn('Error deleting employee from Supabase:', e);
    }
    setStatusNotification({
      type: 'success',
      text: `Empleado "${target.name}" eliminado correctamente.`
    });
  };

  // Build WhatsApp Credentials Message
  const buildWhatsAppMessage = (
    empName: string,
    empUser: string,
    empPass: string,
    empRole: string,
    empZone: string
  ) => {
    const origin = window.location.origin;
    return `👋 *¡Hola ${empName}!*
Te damos la bienvenida oficial al equipo de *${COMPANY_BRAND.name}*.

Tus credenciales de acceso al sistema operativo son:
👤 *Usuario:* ${empUser}
🔑 *Contraseña:* ${empPass}
🛡️ *Rol:* ${empRole}
📍 *Zona de Servicio:* ${empZone}

🌐 *Enlace de Ingreso:*
${origin}

_Por favor inicia sesión para consultar tu agenda diaria, registrar evidencias fotográficas antes/después y gestionar tu kit de insumos._`;
  };

  // Send credentials via WhatsApp directly
  const handleSendWhatsAppCredentials = (emp: EmployeeProfile) => {
    const empUser = emp.username || 'usuario';
    const empPass = emp.password || 'Clave asignada';
    const msg = buildWhatsAppMessage(emp.name, empUser, empPass, emp.role, emp.assignedZone);
    const cleanPhone = cleanPhoneNumber(emp.phone);

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = (emp: EmployeeProfile) => {
    const text = `CLEANPRO / SERS - Credenciales de Acceso
Personal: ${emp.name}
Usuario: ${emp.username || 'No asignado'}
Clave: ${emp.password || 'No asignada'}
Rol: ${emp.role}
Enlace: ${window.location.origin}`;

    navigator.clipboard.writeText(text);
    setCopiedId(emp.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Save new or updated employee
  const handleSubmit = async (e: React.FormEvent, sendWhatsAppImmediately = false) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const finalUsername = username.trim() || `user_${Date.now().toString().slice(-4)}`;
    const finalPassword = password.trim() || 'Sers#Segura2025!';

    if (editingEmployee) {
      // Update existing
      const updated: EmployeeProfile = {
        ...editingEmployee,
        name,
        email,
        phone,
        role: jobTitle,
        assignedZone,
        jobTitle,
        username: finalUsername,
        password: finalPassword,
        notes,
        status: empStatus
      };

      if (onUpdateEmployee) {
        onUpdateEmployee(updated);
      }

      // Sync to Supabase
      try {
        await supabaseService.saveEmployee(updated);
      } catch (sbErr) {
        console.warn('Error syncing employee to Supabase:', sbErr);
      }

      setStatusNotification({
        type: 'success',
        text: `Personal "${name}" actualizado y sincronizado exitosamente.`
      });

      if (sendWhatsAppImmediately) {
        handleSendWhatsAppCredentials(updated);
      }
    } else {
      // Create new
      const newEmployeeData: Omit<EmployeeProfile, 'id' | 'servicesCompletedThisMonth'> = {
        name,
        email,
        phone,
        role: jobTitle,
        assignedZone,
        status: empStatus,
        jobTitle,
        username: finalUsername,
        password: finalPassword,
        notes
      };

      onAddEmployee(newEmployeeData);

      // Sincronizar en Supabase
      try {
        const fullEmp: EmployeeProfile = {
          ...newEmployeeData,
          id: `EMP-${(employees.length + 1).toString().padStart(2, '0')}`,
          servicesCompletedThisMonth: 0
        };
        await supabaseService.saveEmployee(fullEmp);
      } catch (sbErr) {
        console.warn('Error saving new employee to Supabase:', sbErr);
      }

      setStatusNotification({
        type: 'success',
        text: `Personal "${name}" registrado con credenciales exitosamente.`
      });

      if (sendWhatsAppImmediately) {
        const tempEmp: EmployeeProfile = {
          id: 'TEMP',
          ...newEmployeeData,
          servicesCompletedThisMonth: 0
        };
        handleSendWhatsAppCredentials(tempEmp);
      }
    }

    setSaving(false);
    setShowModal(false);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.username && emp.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.assignedZone && emp.assignedZone.toLowerCase().includes(searchTerm.toLowerCase()));

    const isAdm = emp.role.toLowerCase().includes('admin') || emp.jobTitle?.toLowerCase().includes('admin');
    if (selectedRoleFilter === 'admin') return matchesSearch && isAdm;
    if (selectedRoleFilter === 'operative') return matchesSearch && !isAdm;
    return matchesSearch;
  });

  const totalOperatives = employees.filter(
    (e) => !e.role.toLowerCase().includes('admin') && !e.jobTitle?.toLowerCase().includes('admin')
  ).length;
  const totalAdmins = employees.length - totalOperatives;

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Módulo de Personal & Accesos SERS
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
            Gestión de Personal, Credenciales y WhatsApp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Da de alta al personal, asigna usuarios y contraseñas seguras, y comparte sus accesos por WhatsApp en un clic.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-300 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4 text-blue-400" />
          <span>+ Dar de Alta Personal</span>
        </button>
      </div>

      {/* Notification */}
      {statusNotification && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
            statusNotification.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusNotification.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Total Personal</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{employees.length}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Plantilla registrada</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-500 font-bold uppercase">Personal Operativo</p>
            <h3 className="text-2xl font-black text-blue-700 mt-1">{totalOperatives}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Técnicos y supervisores</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <HardHat className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Administradores</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalAdmins}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Dirección y gerencia</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario, puesto o zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              selectedRoleFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({employees.length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('operative')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              selectedRoleFilter === 'operative'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Operativos ({totalOperatives})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              selectedRoleFilter === 'admin'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admins ({totalAdmins})
          </button>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEmployees.map((emp) => {
          const assignedClientsCount = clients.filter(
            (c) => c.assignedEmployeeId === emp.id || c.assignedEmployeeName === emp.name
          ).length;
          const isAdmin = emp.role.toLowerCase().includes('admin') || emp.jobTitle?.toLowerCase().includes('admin');
          const isCopied = copiedId === emp.id;

          return (
            <div
              key={emp.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Top: Avatar, Name, Role Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {emp.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center">
                          {emp.name.charAt(0)}
                        </div>
                      )}
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-1 -right-1"></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{emp.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isAdmin ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isAdmin ? 'Administrador' : 'Operativo'}
                        </span>
                        <span className="text-[11px] font-mono text-blue-700 bg-blue-50/50 px-1.5 py-0.5 rounded">
                          @{emp.username || 'sin_usuario'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Status button */}
                    <button
                      onClick={() => handleToggleStatus(emp)}
                      className={`px-2 py-1 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                        emp.status === 'inactivo'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title={emp.status === 'inactivo' ? 'Habilitar acceso' : 'Desactivar acceso temporalmente'}
                    >
                      {emp.status === 'inactivo' ? 'Inactivo' : 'Activo'}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                      title="Editar datos y credenciales"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button (protected for Harold Anguiano) */}
                    {emp.id !== 'EMP-00' && emp.username !== 'haroldo90' && !emp.name.toLowerCase().includes('harold') && (
                      <button
                        onClick={() => handleDeleteEmployeePrompt(emp)}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
                        title="Eliminar empleado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details list */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.phone || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email || 'Sin correo'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.assignedZone || 'Zona General'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-800">
                      {assignedClientsCount} Sedes asignadas
                    </span>
                  </div>
                </div>

                {/* Security preview box */}
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Clave:</span>
                    <span className="font-bold text-slate-800">
                      {emp.password ? '••••••••••••' : 'No configurada'}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-sans font-bold ${
                    emp.status === 'inactivo'
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    {emp.status === 'inactivo' ? 'Acceso Inactivo' : 'Acceso Activo'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Copy */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSendWhatsAppCredentials(emp)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  title="Enviar credenciales completas directamente por WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handleCopyCredentials(emp)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                    isCopied
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Copiar usuario y clave al portapapeles"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ALTA Y EDICIÓN DE PERSONAL CON CREDENCIALES */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900">
                    {editingEmployee ? 'Editar Personal y Credenciales' : 'Dar de Alta Personal con Acceso'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Genera usuario, contraseña segura y comparte por WhatsApp
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Completo */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. José del Carmen Sotero o Roberto Sánchez"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!username && !editingEmployee) {
                        handleAutoGenerateUsername(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500 font-medium"
                  />
                </div>

                {/* Rol del Sistema */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Rol en la Plataforma:
                  </label>
                  <select
                    value={roleType}
                    onChange={(e) => {
                      const newR = e.target.value as UserRole;
                      setRoleType(newR);
                      if (newR === 'admin') setJobTitle('Administrador / Supervisor');
                      else setJobTitle('Técnico Especialista de Limpieza');
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500 bg-white font-medium"
                  >
                    <option value="operative">👷 Personal Operativo / Campo</option>
                    <option value="admin">👑 Administrador / Dirección</option>
                  </select>
                </div>

                {/* Puesto Oficial */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Puesto / Especialidad:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Supervisor Operativo en Sitio"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>

                {/* Teléfono WhatsApp */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Teléfono Celular (WhatsApp):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +52 99 3123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">Incluye código de país (+52)</span>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>

                {/* Zona Asignada */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Zona o Sede de Operación:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Zona Industrial y Corporativa"
                    value={assignedZone}
                    onChange={(e) => setAssignedZone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>

                {/* Estado de Acceso */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estado de Acceso:
                  </label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as 'activo' | 'inactivo')}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-blue-500"
                  >
                    <option value="activo">Activo (Acceso Autorizado)</option>
                    <option value="inactivo">Inactivo (Acceso Suspendido)</option>
                  </select>
                </div>
              </div>

              {/* Credenciales de Acceso */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    Credenciales de Acceso al Sistema
                  </h4>
                  <button
                    type="button"
                    onClick={handleGenerateSecurePassword}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Generar Clave Segura
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nombre de Usuario:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej. josesers"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white font-mono focus:outline-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Contraseña:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm bg-white font-mono focus:outline-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Guardado y Despacho WhatsApp */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Guardar en Sistema
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Guardar y Compartir por WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">¿Eliminar Colaborador?</h3>
                <p className="text-xs text-slate-400">Esta acción removerá el acceso al sistema</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><strong>Nombre:</strong> {employeeToDelete.name}</p>
              <p><strong>Puesto:</strong> {employeeToDelete.role}</p>
              <p><strong>Usuario:</strong> @{employeeToDelete.username || 'sin_usuario'}</p>
              <p className="text-[11px] text-slate-400 pt-1">
                Se eliminará su registro de Supabase y no podrá volver a iniciar sesión.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-rose-200 transition-all"
              >
                Sí, Eliminar Personal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
