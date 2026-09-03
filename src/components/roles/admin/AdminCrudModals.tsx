import React, { useState } from 'react';
import {
  X,
  Building,
  UserCheck,
  Calendar,
  AlertTriangle,
  Boxes,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  Save,
  Power,
  MessageSquare,
  KeyRound,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import {
  ClientProfile,
  CleaningService,
  SupplyItem,
  IncidentReport,
  EmployeeProfile
} from '../../../types';
import {
  shareClientViaWhatsApp,
  buildDirectAccessUrl
} from '../../../utils/credentialsShareUtils';

// ==========================================
// 1. CLIENT DETAILS MODAL
// ==========================================
interface ClientDetailsModalProps {
  client: ClientProfile;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus?: (clientId: string) => void;
  onDelete?: () => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                Ficha Técnica de Cliente
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">{client.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status & Monthly Fee Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Estado del Contrato
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-bold ${
                  client.status === 'inactivo'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'inactivo' ? 'bg-slate-500' : 'bg-emerald-600'}`}></span>
                {client.status === 'inactivo' ? 'Inactivo / Pausado' : 'Activo con Póliza'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cuota Mensual
              </span>
              <span className="text-base font-extrabold text-slate-900">
                ${client.monthlyFee?.toLocaleString('es-MX')} <span className="text-xs font-normal text-slate-500">MXN</span>
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Datos de Contacto</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700">Responsable / Enlace:</strong>
                  <span className="text-slate-600">{client.contactPerson || 'No registrado'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700">Teléfono:</strong>
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline">
                    {client.phone || 'No registrado'}
                  </a>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 sm:col-span-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700">Correo Electrónico:</strong>
                  <span className="text-slate-600">{client.email || 'No registrado'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-700">Dirección de la Sede / Inmueble:</strong>
                  <span className="text-slate-600">{client.address || 'No registrada'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Technician */}
          <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 block">
              Personal Técnico Asignado
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {client.assignedEmployeeName || 'Sin técnico asignado'}
                  </p>
                  {client.assignedEmployeePhone && (
                    <p className="text-[11px] text-slate-500">Tel: {client.assignedEmployeePhone}</p>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-blue-700 font-semibold">
                Frecuencia: {client.contractFrequency || 'Lunes a Sábado'}
              </span>
            </div>
          </div>

          {/* Access Credentials & Direct Link for Client */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Credenciales y Acceso Directo (Portal de Cliente)</span>
              </div>
              <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                Rol: Cliente
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Usuario o Correo:</span>
                <span className="font-bold text-slate-800 break-all">{client.username || client.email || 'cliente_sers'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Contraseña:</span>
                <span className="font-bold text-slate-800">{client.password || 'Sers#Cliente2025!'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => shareClientViaWhatsApp(client)}
                className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Compartir credenciales y enlace directo al portal por WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Compartir Acceso por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const url = buildDirectAccessUrl('client', client.username || client.email, client.password || 'Sers#Cliente2025!');
                  navigator.clipboard.writeText(url);
                  alert('Enlace copiado al portapapeles:\n' + url);
                }}
                className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Copiar enlace directo con credenciales"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copiar Enlace Directo</span>
              </button>
            </div>
          </div>

          {/* Configuration */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span>Reportes de Ciclo de 3 Días:</span>
            <span className="font-bold text-slate-800">
              {client.auto3DayReport ? 'Generación Automática' : 'Revisión Manual'}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Cliente</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {onToggleStatus && (
              <button
                type="button"
                onClick={() => onToggleStatus(client.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  client.status === 'inactivo'
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{client.status === 'inactivo' ? 'Activar' : 'Desactivar'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Editar Datos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. EDIT CLIENT MODAL
// ==========================================
interface EditClientModalProps {
  client: ClientProfile;
  employees: EmployeeProfile[];
  onClose: () => void;
  onSave: (clientId: string, updates: Partial<ClientProfile>) => Promise<void> | void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  client,
  employees,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: client.name || '',
    contactPerson: client.contactPerson || '',
    phone: client.phone || '',
    email: client.email || '',
    address: client.address || '',
    contractFrequency: client.contractFrequency || 'Lunes a Sábado',
    monthlyFee: client.monthlyFee || 0,
    auto3DayReport: client.auto3DayReport ?? true,
    status: client.status || 'activo',
    assignedEmployeeId: client.assignedEmployeeId || '',
    username: client.username || '',
    password: client.password || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const assignedEmp = employees.find((emp) => emp.id === formData.assignedEmployeeId);
      await onSave(client.id, {
        ...formData,
        assignedEmployeeName: assignedEmp?.name || (formData.assignedEmployeeId ? undefined : ''),
        assignedEmployeePhone: assignedEmp?.phone || (formData.assignedEmployeeId ? undefined : '')
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Editar Cliente</h3>
            <p className="text-xs text-slate-400">Actualizar contrato, contacto y asignación de personal</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre de la Empresa o Sede:</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Contacto Principal:</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Teléfono:</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Correo Electrónico:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Dirección Completa:</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Frecuencia de Servicio:</label>
              <select
                value={formData.contractFrequency}
                onChange={(e) => setFormData({ ...formData, contractFrequency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500 bg-white"
              >
                <option value="Lunes a Viernes">Lunes a Viernes</option>
                <option value="Lunes a Sábado">Lunes a Sábado</option>
                <option value="Diario (24/7)">Diario (24/7)</option>
                <option value="3 Veces por Semana">3 Veces por Semana</option>
                <option value="Fin de Semana">Fin de Semana</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Cuota Mensual (MXN):</label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Empleado Técnico Asignado:</label>
            <select
              value={formData.assignedEmployeeId}
              onChange={(e) => setFormData({ ...formData, assignedEmployeeId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-blue-500 bg-white"
            >
              <option value="">-- Sin Asignar --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role}) - Tel: {emp.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Estado:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'activo' | 'inactivo' })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-blue-500 bg-white"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo / Pausado</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.auto3DayReport}
                  onChange={(e) => setFormData({ ...formData, auto3DayReport: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                Reporte de 3 Días Auto
              </label>
            </div>
          </div>

          {/* Client Portal Credentials */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Credenciales para Portal de Cliente</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  shareClientViaWhatsApp({
                    ...client,
                    name: formData.name,
                    contactPerson: formData.contactPerson,
                    phone: formData.phone,
                    email: formData.email,
                    username: formData.username,
                    password: formData.password
                  });
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                title="Compartir enlace directo y credenciales por WhatsApp"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Enviar WhatsApp</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Usuario de Acceso:</label>
                <input
                  type="text"
                  placeholder="ej. cliente_corporativo"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contraseña:</label>
                <input
                  type="text"
                  placeholder="ej. Sers#Cliente2025!"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-500 bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Permite al cliente ingresar con este usuario/correo y contraseña a <span className="font-mono text-slate-600">https://limp-ieza.vercel.app/</span>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. EDIT SERVICE MODAL
// ==========================================
interface EditServiceModalProps {
  service: CleaningService;
  employees: EmployeeProfile[];
  onClose: () => void;
  onSave: (serviceId: string, updates: Partial<CleaningService>) => Promise<void> | void;
}

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  employees,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    date: service.date || '',
    timeSlot: service.timeSlot || '08:00 - 12:00',
    operativeId: service.operativeId || '',
    status: service.status || 'programado',
    specialInstructions: service.specialInstructions || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const assignedEmp = employees.find((emp) => emp.id === formData.operativeId);
      await onSave(service.id, {
        ...formData,
        operativeName: assignedEmp?.name || service.operativeName
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Editar Servicio de Limpieza</h3>
            <p className="text-xs text-slate-400">{service.clientName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Fecha programada:</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Horario:</label>
              <input
                type="text"
                required
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Técnico Operativo Asignado:</label>
            <select
              value={formData.operativeId}
              onChange={(e) => setFormData({ ...formData, operativeId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-blue-500 bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Estado del Servicio:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-blue-500 bg-white"
            >
              <option value="programado">Programado</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Instrucciones Especiales / Notas:</label>
            <textarea
              rows={3}
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-blue-500"
              placeholder="Instrucciones para el personal..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. SUPPLY FORM MODAL (CREATE / EDIT)
// ==========================================
interface SupplyFormModalProps {
  supply?: SupplyItem | null;
  onClose: () => void;
  onSave: (supplyData: Omit<SupplyItem, 'id'> | SupplyItem) => Promise<void> | void;
}

export const SupplyFormModal: React.FC<SupplyFormModalProps> = ({
  supply,
  onClose,
  onSave
}) => {
  const isEditing = !!supply;
  const [formData, setFormData] = useState({
    name: supply?.name || '',
    category: supply?.category || 'quimico',
    currentStock: supply?.currentStock ?? 10,
    minimumStock: supply?.minimumStock ?? 5,
    unit: supply?.unit || 'L',
    costPerUnit: supply?.costPerUnit ?? 45,
    status: supply?.status || 'activo'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing && supply) {
        await onSave({ ...supply, ...formData });
      } else {
        await onSave(formData as any);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{isEditing ? 'Editar Insumo' : 'Nuevo Insumo de Limpieza'}</h3>
            <p className="text-xs text-slate-400">Control de existencias e inventario central</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre del Insumo / Producto:</label>
            <input
              type="text"
              required
              placeholder="Ej. Desinfectante Cuaternario Grado Hospitalario"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Categoría:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-blue-500 bg-white"
              >
                <option value="quimico">Químico / Detergente</option>
                <option value="utensilio">Utensilio / Mopa / Microfibra</option>
                <option value="desechable">Desechable / Papel / Bolsas</option>
                <option value="maquinaria">Maquinaria / Equipo</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Unidad de Medida:</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-blue-500 bg-white"
              >
                <option value="L">Litros (L)</option>
                <option value="Garrafa 5L">Garrafa 5L</option>
                <option value="Pieza">Pieza / Unidad</option>
                <option value="Paquete">Paquete</option>
                <option value="Caja">Caja</option>
                <option value="Kg">Kilogramos (Kg)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Actual:</label>
              <input
                type="number"
                min="0"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Mínimo (Alerta):</label>
              <input
                type="number"
                min="1"
                required
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Costo Unitario Estimado (MXN):</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.costPerUnit}
              onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : isEditing ? 'Actualizar Insumo' : 'Crear Insumo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. REUSABLE DELETE CONFIRMATION MODAL
// ==========================================
interface DeleteConfirmModalProps {
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  title,
  message,
  itemName,
  onConfirm,
  onClose
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>

        <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 text-center">
          <span className="text-xs font-bold text-rose-900 break-words">{itemName}</span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-rose-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Eliminando...' : 'Eliminar Registro'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. PURGE DEMO DATA MODAL
// ==========================================
interface PurgeMockDataModalProps {
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const PurgeMockDataModal: React.FC<PurgeMockDataModalProps> = ({
  onConfirm,
  onClose
}) => {
  const [isPurging, setIsPurging] = useState(false);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  const handlePurge = async () => {
    setIsPurging(true);
    try {
      await onConfirm();
      setPurgedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Limpieza de Datos Residuales</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Esta acción eliminará de Supabase cualquier registro de prueba o muestra residual (servicios y cotizaciones de muestra).
          </p>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Personal Auténtico Protegido:</span>
          </div>
          <p className="text-[11px] text-emerald-700 pl-5">
            Los usuarios reales <strong>Harold Anguiano</strong> y <strong>José del Carmen Sotero</strong> permanecerán intactos en la base de datos con sus credenciales y accesos.
          </p>
        </div>

        {purgedSuccess ? (
          <div className="p-4 bg-emerald-100 text-emerald-900 rounded-2xl text-center text-xs font-bold">
            ✓ ¡Datos residuales purgados exitosamente!
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isPurging}
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isPurging}
              onClick={handlePurge}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-rose-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging ? 'Purgando...' : 'Confirmar Purga'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
