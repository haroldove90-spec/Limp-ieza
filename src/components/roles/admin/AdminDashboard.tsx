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
  Eye,
  FileText,
  Printer,
  Mail,
  Download,
  MessageSquare,
  FileSpreadsheet,
  UserCheck,
  UserPlus,
  Phone,
  Database,
  Power,
  AlertCircle,
  Boxes,
  HardHat,
  Building2,
  ArrowRight,
  KeyRound
} from 'lucide-react';
import {
  UserRole,
  CleaningService,
  IncidentReport,
  SupplyItem,
  Cycle3DayReport,
  SupplyRequest,
  ClientProfile,
  EmployeeProfile,
  TransactionRecord,
  PhotoEvidence,
  Quotation,
  ServiceTask
} from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';
import { IncidentReportModal } from '../../common/IncidentReportModal';
import { IncidentResolutionModal } from '../../common/IncidentResolutionModal';
import { QuotationManager } from './QuotationManager';
import { EmailSenderModal, EmailModalData } from '../../common/EmailSenderModal';
import { EvidenceUploadModal } from '../../common/EvidenceUploadModal';
import { HistoricalAuditModal } from '../../common/HistoricalAuditModal';
import { StaffManager } from './StaffManager';
import {
  ClientDetailsModal,
  EditClientModal,
  EditServiceModal,
  SupplyFormModal,
  DeleteConfirmModal,
  PurgeMockDataModal
} from './AdminCrudModals';
import { COMPANY_BRAND } from '../../../constants/branding';
import {
  exportToExcel,
  exportToHTMLPDF,
  shareViaWhatsApp,
  cleanPhoneNumber
} from '../../../utils/exportUtils';
import {
  SERVICE_TASK_PRESETS,
  sendServiceOrderToEmployee,
  generateServiceOrderHTML,
  buildServiceOrderWhatsAppMessage,
  downloadHistoricalAuditPDF,
  shareServiceReportWithEvidencesViaWhatsApp
} from '../../../utils/serviceOrderUtils';
import { downloadSystemWorkflowPDF, shareWorkflowViaWhatsApp } from '../../../utils/workflowDocumentUtils';
import {
  shareClientViaWhatsApp,
  shareEmployeeViaWhatsApp,
  buildDirectAccessUrl,
  SYSTEM_PRODUCTION_URL
} from '../../../utils/credentialsShareUtils';

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
  quotations: Quotation[];
  onApproveService: (serviceId: string) => void;
  onResolveIncident: (incidentId: string, resolution: string) => void;
  onResolveIncidentWithEvidence?: (
    incidentId: string,
    data: {
      resolutionNotes: string;
      resolutionPhotoUrl?: string;
      resolvedBy: string;
      resolvedByRole?: 'operativo' | 'admin';
    }
  ) => void;
  onUpdateSupplyStock: (supplyId: string, delta: number) => void;
  onApproveSupplyRequest: (requestId: string, status: SupplyRequest['status']) => void;
  onAddClient: (client: Omit<ClientProfile, 'id'>) => void;
  onAddEmployee: (employee: Omit<EmployeeProfile, 'id' | 'servicesCompletedThisMonth'>) => void;
  onAddService: (service: Omit<CleaningService, 'id' | 'evidences' | 'approvedByAdmin'> & { tasks?: ServiceTask[] }) => void;
  onAddTransaction: (transaction: Omit<TransactionRecord, 'id'>) => void;
  onToggleAutoReport: (clientId: string) => void;
  onSaveQuotation: (quotation: Quotation) => void;
  onUpdateQuotationStatus: (quotationId: string, status: Quotation['status']) => void;
  onAssignEmployeeToClient?: (clientId: string, employeeId: string) => void;
  onOpenWorkflow?: () => void;
  onAddEvidence?: (serviceId: string, evidence: Omit<PhotoEvidence, 'id' | 'timestamp'>) => void;
  onUpdateEmployee?: (employee: EmployeeProfile) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onToggleEmployeeStatus?: (employeeId: string) => void;
  onUpdateClient?: (client: ClientProfile) => void;
  onDeleteClient?: (clientId: string) => void;
  onToggleClientStatus?: (clientId: string) => void;
  onUpdateService?: (service: CleaningService) => void;
  onDeleteService?: (serviceId: string) => void;
  onDeleteIncident?: (incidentId: string) => void;
  onAddSupply?: (supply: Omit<SupplyItem, 'id'>) => void;
  onUpdateSupply?: (supply: SupplyItem) => void;
  onDeleteSupply?: (supplyId: string) => void;
  onPurgeMockData?: () => void;
  onOpenSupabaseModal?: () => void;
  onSelectRole?: (role: UserRole) => void;
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
  quotations,
  onApproveService,
  onResolveIncident,
  onResolveIncidentWithEvidence,
  onUpdateSupplyStock,
  onApproveSupplyRequest,
  onAddClient,
  onAddEmployee,
  onAddService,
  onAddTransaction,
  onToggleAutoReport,
  onSaveQuotation,
  onUpdateQuotationStatus,
  onAssignEmployeeToClient,
  onOpenWorkflow,
  onAddEvidence,
  onUpdateEmployee,
  onDeleteEmployee,
  onToggleEmployeeStatus,
  onUpdateClient,
  onDeleteClient,
  onToggleClientStatus,
  onUpdateService,
  onDeleteService,
  onDeleteIncident,
  onAddSupply,
  onUpdateSupply,
  onDeleteSupply,
  onPurgeMockData,
  onOpenSupabaseModal,
  onSelectRole
}) => {
  const [viewingEvidence, setViewingEvidence] = useState<PhotoEvidence | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);
  const [selectedIncidentForReport, setSelectedIncidentForReport] = useState<IncidentReport | null>(null);
  const [historicalAuditModalOpen, setHistoricalAuditModalOpen] = useState(false);
  const [historicalAuditInitialServiceId, setHistoricalAuditInitialServiceId] = useState<string | undefined>(undefined);
  const [evidenceUploadService, setEvidenceUploadService] = useState<CleaningService | null>(null);

  // Resolution modal state
  const [resolvingIncId, setResolvingIncId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [resolvingIncident, setResolvingIncident] = useState<IncidentReport | null>(null);

  // Stock update modal
  const [stockModalSupply, setStockModalSupply] = useState<SupplyItem | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(10);

  // Assignment modal state
  const [assignModalClient, setAssignModalClient] = useState<ClientProfile | null>(null);
  const [selectedEmpForAssign, setSelectedEmpForAssign] = useState<string>('');

  // Forms modals
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('+52 55 1234 5678');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientUsername, setNewClientUsername] = useState('');
  const [newClientPassword, setNewClientPassword] = useState('Sers#Cliente2025!');
  const [sendClientWhatsAppOnCreate, setSendClientWhatsAppOnCreate] = useState(true);
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientFee, setNewClientFee] = useState(12000);
  const [newClientAssignedEmp, setNewClientAssignedEmp] = useState(employees[0]?.id || '');

  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Técnico Especialista de Limpieza');
  const [newEmpZone, setNewEmpZone] = useState('Zona Centro');
  const [newEmpPhone, setNewEmpPhone] = useState('+52 55 1234 5678');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpUsername, setNewEmpUsername] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('Sers#Segura2025!');
  const [sendEmpWhatsAppOnCreate, setSendEmpWhatsAppOnCreate] = useState(true);

  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [srvClientName, setSrvClientName] = useState(clients[0]?.name || '');
  const [srvOperativeName, setSrvOperativeName] = useState(employees[0]?.name || '');
  const [srvDate, setSrvDate] = useState(new Date().toISOString().split('T')[0]);
  const [srvTimeSlot, setSrvTimeSlot] = useState('08:00 - 12:00');
  const [srvNotes, setSrvNotes] = useState('');
  const [srvPreset, setSrvPreset] = useState<string>('Oficinas y Corporativo');
  const [srvCustomTasks, setSrvCustomTasks] = useState<{ id: string; name: string; category: string }[]>([
    { id: '1', name: 'Limpieza y aspirado de pisos y alfombras', category: 'Pisos' },
    { id: '2', name: 'Desinfección de escritorios y estaciones', category: 'Mobiliario' },
    { id: '3', name: 'Sanitización profunda de baños y reposición', category: 'Sanitarios' },
    { id: '4', name: 'Retiro y clasificación de residuos', category: 'Residuos' }
  ]);
  const [newCustomTaskName, setNewCustomTaskName] = useState('');
  const [newCustomTaskCategory, setNewCustomTaskCategory] = useState('General');
  const [sendWhatsAppOnCreate, setSendWhatsAppOnCreate] = useState(true);

  // Real Testing & CRUD state modals
  const [viewingClient, setViewingClient] = useState<ClientProfile | null>(null);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientProfile | null>(null);

  const [editingService, setEditingService] = useState<CleaningService | null>(null);
  const [deletingService, setDeletingService] = useState<CleaningService | null>(null);

  const [deletingIncident, setDeletingIncident] = useState<IncidentReport | null>(null);

  const [showNewSupplyModal, setShowNewSupplyModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState<SupplyItem | null>(null);
  const [deletingSupply, setDeletingSupply] = useState<SupplyItem | null>(null);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyCategory, setNewSupplyCategory] = useState('Químicos');
  const [newSupplyStock, setNewSupplyStock] = useState(20);
  const [newSupplyMin, setNewSupplyMin] = useState(5);
  const [newSupplyUnit, setNewSupplyUnit] = useState('L');

  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // Dispatch & Printable Order helpers
  const handleDownloadServiceOrderPDF = (service: CleaningService) => {
    const client = clients.find((c) => c.name === service.clientName);
    const html = generateServiceOrderHTML(service, client);
    exportToHTMLPDF(`Orden_Servicio_${service.id}_${service.clientName.replace(/\s+/g, '_')}`, html);
  };

  const handleSendOrderWhatsApp = (service: CleaningService) => {
    const client = clients.find((c) => c.name === service.clientName);
    const emp = employees.find((e) => e.name === service.operativeName || e.id === service.operativeId);
    sendServiceOrderToEmployee(service, client, emp);
  };

  const handleSelectPreset = (presetName: string) => {
    setSrvPreset(presetName);
    const tasks = SERVICE_TASK_PRESETS[presetName];
    if (tasks) {
      setSrvCustomTasks(
        tasks.map((t, idx) => ({
          id: `task-preset-${idx + 1}`,
          name: t.name,
          category: t.category
        }))
      );
    }
  };

  const handleAddCustomTask = () => {
    if (!newCustomTaskName.trim()) return;
    setSrvCustomTasks((prev) => [
      ...prev,
      {
        id: `task-custom-${Date.now()}`,
        name: newCustomTaskName.trim(),
        category: newCustomTaskCategory
      }
    ]);
    setNewCustomTaskName('');
  };

  const handleRemoveCustomTask = (taskId: string) => {
    setSrvCustomTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

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

  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

  // 1. SUPERVISION & SERVICES: EXPORT & SHARE
  const handleExportSupervisionExcel = () => {
    const headers = ['ID Servicio', 'Cliente / Sede', 'Personal Técnico', 'Fecha', 'Horario', 'Estado', 'Aprobado Admin', 'Tareas Completadas', 'Total Tareas', 'Evidencias'];
    const rows = services.map((s) => [
      s.id,
      s.clientName,
      s.operativeName,
      s.date,
      s.timeSlot,
      s.status.toUpperCase(),
      s.approvedByAdmin ? 'SI' : 'NO',
      s.tasks.filter((t) => t.completed).length,
      s.tasks.length,
      s.evidences.length
    ]);
    exportToExcel(`Bitacora_Servicios_Supervision_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleShareSupervisionWhatsApp = () => {
    const today = new Date().toLocaleDateString('es-MX');
    const completed = services.filter((s) => s.status === 'completado').length;
    const pending = services.filter((s) => !s.approvedByAdmin).length;
    const activeIncidents = incidents.filter((i) => i.status !== 'resuelto').length;

    const text =
      `🛡️ *REPORTE GERENCIAL DE SUPERVISIÓN - CLEANPRO*\n` +
      `📅 *Fecha:* ${today}\n\n` +
      `📊 *RESUMEN GENERAL:*\n` +
      `• Servicios Totales: ${services.length}\n` +
      `• Completados: ${completed}\n` +
      `• Pendientes de Auditoría: ${pending}\n` +
      `• Incidencias Activas: ${activeIncidents}\n\n` +
      `📋 *DETALLE OPERATIVO:*\n` +
      services
        .map(
          (s) =>
            `• [${s.status.toUpperCase()}] *${s.clientName}*\n  Técnico: ${s.operativeName} (${s.timeSlot}) | Auditoría: ${s.approvedByAdmin ? '✅ Aprobado' : '⏳ Pendiente'}`
        )
        .join('\n\n') +
      `\n\n💼 *Dirección de Operaciones CleanPro*`;

    shareViaWhatsApp(text);
  };

  const handleSendSupervisionEmail = () => {
    const completed = services.filter((s) => s.status === 'completado').length;
    const pendingApproval = services.filter((s) => !s.approvedByAdmin).length;
    const activeIncidents = incidents.filter((i) => i.status !== 'resuelto').length;

    const subject = `[INFORME GERENCIAL] Balance de Servicios y Calidad - CleanPro (${new Date().toLocaleDateString('es-MX')})`;
    const body =
      `Estimada Dirección / Supervisión General,\n\n` +
      `A continuación se presenta el resumen ejecutivo de operaciones y control de calidad:\n\n` +
      `MÉTRICAS CLAVE DEL DÍA:\n` +
      `• Servicios Totales Programados: ${services.length}\n` +
      `• Servicios Ejecutados con Éxito: ${completed}\n` +
      `• Auditorías Pendientes de Aprobación: ${pendingApproval}\n` +
      `• Incidencias Técnicas Activas: ${activeIncidents}\n\n` +
      `DETALLE DE SERVICIOS EN CURSO:\n` +
      services
        .map(
          (s, idx) =>
            ` ${idx + 1}. [${s.status.toUpperCase()}] ${s.clientName} - Personal: ${s.operativeName} (${s.timeSlot})\n    Tareas: ${s.tasks.filter((t) => t.completed).length}/${s.tasks.length} | Evidencias: ${s.evidences.length}`
        )
        .join('\n') +
      `\n\nINCIDENCIAS REPORTADAS:\n` +
      (incidents.length > 0
        ? incidents
            .map(
              (i, idx) =>
                ` ${idx + 1}. [${i.status.toUpperCase()}] ${i.title} - ${i.clientName} (${i.location})`
            )
            .join('\n')
        : 'Sin incidencias técnicas registradas.') +
      `\n\nQuedamos atentos a cualquier instrucción.\n\n` +
      `Atentamente,\nDirección de Operaciones\nCleanPro Servicios Integrales S.A. de C.V.`;

    setEmailModalData({
      title: 'Enviar Informe Gerencial de Supervisión por Correo',
      defaultRecipient: 'direccion@cleanproservicios.com',
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Informe Gerencial de Supervisión',
      attachmentName: `Informe_Supervision_${new Date().toISOString().split('T')[0]}.html`
    });
  };

  const handleDownloadSupervisionHTML = () => {
    const completed = services.filter((s) => s.status === 'completado').length;
    const pendingApproval = services.filter((s) => !s.approvedByAdmin).length;
    const activeIncidents = incidents.filter((i) => i.status !== 'resuelto').length;

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe Gerencial de Calidad y Supervisión - ${COMPANY_BRAND.name}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; align-items: center; }
    .brand-box { display: flex; align-items: center; gap: 14px; }
    .brand-logo { width: 52px; height: 52px; object-fit: contain; }
    .badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: center; }
    .kpi-val { font-size: 24px; font-weight: bold; color: #0f172a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
    th { background: #f1f5f9; font-weight: bold; color: #475569; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-box">
      <img src="${COMPANY_BRAND.logoUrl}" alt="${COMPANY_BRAND.name}" class="brand-logo" />
      <div>
        <h1 style="margin:0; font-size: 22px; color: #0f172a;">${COMPANY_BRAND.legalName}</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #64748b;">Informe Gerencial de Supervisión, Calidad y Operaciones</p>
      </div>
    </div>
    <div style="text-align: right;">
      <span class="badge">AUDITORÍA CENTRAL</span>
      <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Fecha: ${new Date().toLocaleDateString('es-MX')}</p>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <div style="font-size: 11px; color: #64748b;">Servicios Programados</div>
      <div class="kpi-val">${services.length}</div>
    </div>
    <div class="kpi-card">
      <div style="font-size: 11px; color: #64748b;">Completados</div>
      <div class="kpi-val" style="color: #16a34a;">${completed}</div>
    </div>
    <div class="kpi-card">
      <div style="font-size: 11px; color: #64748b;">Pendientes Auditoría</div>
      <div class="kpi-val" style="color: #ea580c;">${pendingApproval}</div>
    </div>
    <div class="kpi-card">
      <div style="font-size: 11px; color: #64748b;">Incidencias Activas</div>
      <div class="kpi-val" style="color: #dc2626;">${activeIncidents}</div>
    </div>
  </div>

  <h3 style="margin-top: 24px; color: #0f172a;">Bitácora de Servicios Auditados</h3>
  <table>
    <thead>
      <tr>
        <th>Cliente / Sede</th>
        <th>Personal Técnico</th>
        <th>Horario</th>
        <th>Estado Calidad</th>
        <th>Tareas Realizadas</th>
        <th>Evidencias</th>
      </tr>
    </thead>
    <tbody>
      ${services
        .map(
          (s) => `
        <tr>
          <td><strong>${s.clientName}</strong></td>
          <td>${s.operativeName}</td>
          <td>${s.timeSlot}</td>
          <td><span style="font-weight:bold; color:${s.approvedByAdmin ? '#16a34a' : '#ca8a04'};">${s.approvedByAdmin ? 'Aprobado' : 'Pendiente'}</span></td>
          <td>${s.tasks.filter((t) => t.completed).length} de ${s.tasks.length}</td>
          <td>${s.evidences.length} fotos adjuntas</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    ${COMPANY_BRAND.legalName} • Sistema de Gestión de Operaciones y Calidad
  </div>
</body>
</html>`;

    exportToHTMLPDF(`Reporte_Supervision_${COMPANY_BRAND.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, htmlContent);
  };

  // 2. INCIDENTS: EXPORT & SHARE
  const handleExportIncidentsExcel = () => {
    const headers = ['Folio', 'Fecha', 'Hora', 'Tipo', 'Título', 'Cliente / Sede', 'Ubicación', 'Técnico', 'Estado', 'Resolución'];
    const rows = incidents.map((i) => [
      i.id,
      i.date,
      i.time,
      i.type.replace('_', ' ').toUpperCase(),
      i.title,
      i.clientName,
      i.location,
      i.operativeName,
      i.status.toUpperCase(),
      i.adminResolution || 'En proceso de seguimiento'
    ]);
    exportToExcel(`Bitacora_Incidencias_${COMPANY_BRAND.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleShareIncidentWhatsApp = (inc: IncidentReport) => {
    const text =
      `⚠️ *REPORTE DE INCIDENCIA TÉCNICA - FOLIO #${inc.id}*\n` +
      `📍 *Cliente / Sede:* ${inc.clientName} (${inc.location})\n` +
      `🕒 *Fecha/Hora:* ${inc.date} a las ${inc.time}\n` +
      `📌 *Tipo:* ${inc.type.replace('_', ' ').toUpperCase()}\n` +
      `📝 *Título:* ${inc.title}\n` +
      `🔍 *Descripción:* ${inc.description}\n` +
      `👷 *Técnico:* ${inc.operativeName}\n` +
      `📊 *Estado:* ${inc.status.toUpperCase()}\n` +
      (inc.adminResolution ? `✅ *Resolución:* ${inc.adminResolution}\n` : '') +
      `\n🛡️ *${COMPANY_BRAND.name} Control Central*`;

    shareViaWhatsApp(text);
  };

  const handleSendIncidentEmail = (inc: IncidentReport) => {
    const subject = `[ALERTA INCIDENCIA] ${inc.title} - ${inc.clientName}`;
    const body =
      `Estimado Equipo Directivo / Cliente,\n\n` +
      `Se comparte el informe técnico de la incidencia registrada en instalaciones:\n\n` +
      `• Folio: #${inc.id}\n` +
      `• Tipo: ${inc.type.replace('_', ' ').toUpperCase()}\n` +
      `• Cliente / Sede: ${inc.clientName} (${inc.location})\n` +
      `• Fecha y Hora: ${inc.date} - ${inc.time}\n` +
      `• Técnico que Reporta: ${inc.operativeName}\n` +
      `• Estado Actual: ${inc.status.toUpperCase()}\n\n` +
      `DESCRIPCIÓN DEL SUCESO:\n${inc.description}\n\n` +
      (inc.adminResolution ? `RESOLUCIÓN / SOLUCIÓN ACORDADA:\n${inc.adminResolution}\n\n` : '') +
      `Para mayor detalle y evidencia fotográfica consulte el portal oficial o el reporte PDF adjunto.\n\n` +
      `Atentamente,\nSupervisión y Control de Calidad\n${COMPANY_BRAND.legalName}`;

    setEmailModalData({
      title: 'Enviar Incidencia por Correo',
      defaultRecipient: COMPANY_BRAND.email,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Incidencia Operativa',
      attachmentName: `Incidencia_${inc.id}.pdf`
    });
  };

  // 3. WAREHOUSE & SUPPLIES: EXPORT & SHARE
  const handleExportWarehouseExcel = () => {
    const headers = ['ID', 'Nombre Insumo', 'Categoría', 'Unidad', 'Stock Actual', 'Stock Mínimo', 'Costo Unitario MXN', 'Valor Total MXN', 'Estado Stock'];
    const rows = supplies.map((s) => [
      s.id,
      s.name,
      s.category,
      s.unit,
      s.currentStock,
      s.minimumStock,
      s.costPerUnit,
      (s.currentStock * s.costPerUnit).toFixed(2),
      s.currentStock <= s.minimumStock ? 'BAJO STOCK' : 'OPTIMO'
    ]);
    exportToExcel(`Inventario_Almacen_${COMPANY_BRAND.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleShareWarehouseWhatsApp = () => {
    const lowStock = supplies.filter((s) => s.currentStock <= s.minimumStock);
    const totalVal = supplies.reduce((acc, s) => acc + s.currentStock * s.costPerUnit, 0);

    const text =
      `📦 *REPORTE DE ALMACÉN E INSUMOS CENTRALES - ${COMPANY_BRAND.name.toUpperCase()}*\n` +
      `📅 *Fecha:* ${new Date().toLocaleDateString('es-MX')}\n` +
      `💰 *Valor Total Inventario:* $${totalVal.toLocaleString('es-MX')} MXN\n` +
      `⚠️ *Insumos Bajo Stock:* ${lowStock.length}\n\n` +
      `📋 *ESTADO DE INSUMOS CRÍTICOS:*\n` +
      (lowStock.length > 0
        ? lowStock
            .map(
              (s) =>
                `• ⚠️ *${s.name}*: Stock actual ${s.currentStock} ${s.unit} (Mínimo: ${s.minimumStock} ${s.unit})`
            )
            .join('\n')
        : '✅ Todos los insumos cuentan con stock óptimo.') +
      `\n\n🛒 *Control de Almacén y Suministros ${COMPANY_BRAND.name}*`;

    shareViaWhatsApp(text);
  };

  const handleSendWarehouseEmail = () => {
    const lowStockCount = supplies.filter((s) => s.currentStock <= s.minimumStock).length;
    const totalInventoryValue = supplies.reduce((acc, s) => acc + s.currentStock * s.costPerUnit, 0);

    const subject = `[REPORTE ALMACÉN] Estado de Stock e Insumos Centrales - ${COMPANY_BRAND.name} (${new Date().toLocaleDateString('es-MX')})`;
    const body =
      `Estimada Administración / Compras,\n\n` +
      `A continuación se detalla el balance de existencias e insumos del Almacén Central:\n\n` +
      `RESUMEN DE ALMACÉN:\n` +
      `• Insumos Catalogados: ${supplies.length}\n` +
      `• Insumos en Alerta (Bajo Stock): ${lowStockCount}\n` +
      `• Valorización de Inventario: $${totalInventoryValue.toLocaleString('es-MX')} MXN\n` +
      `• Requerimientos Pendientes de Despacho: ${supplyRequests.filter((r) => r.status === 'pendiente').length}\n\n` +
      `DETALLE DE EXISTENCIAS:\n` +
      supplies
        .map(
          (s, idx) =>
            ` ${idx + 1}. ${s.name} (${s.category}) | Stock: ${s.currentStock} ${s.unit} (Mín: ${s.minimumStock}) | Costo: $${s.costPerUnit} MXN ${s.currentStock <= s.minimumStock ? '⚠️ [REPOSICIÓN URGENTE]' : '✅'}`
        )
        .join('\n') +
      `\n\nAtentamente,\nControl de Almacén y Suministros\n${COMPANY_BRAND.legalName}`;

    setEmailModalData({
      title: 'Enviar Balance de Almacén por Correo',
      defaultRecipient: COMPANY_BRAND.email,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Balance de Almacén e Inventario',
      attachmentName: `Inventario_Almacen_${new Date().toISOString().split('T')[0]}.csv`
    });
  };

  // 4. DIRECTORY & ASSIGNMENTS: EXPORT & SHARE
  const handleExportDirectoryExcel = () => {
    const headers = [
      'ID Cliente',
      'Nombre Cliente / Sede',
      'Contacto',
      'Teléfono Cliente',
      'Dirección',
      'Cuota Mensual MXN',
      'Frecuencia',
      'ID Técnico Asignado',
      'Técnico Asignado',
      'Teléfono Técnico',
      'Rol Técnico'
    ];
    const rows = clients.map((c) => [
      c.id,
      c.name,
      c.contactPerson,
      c.phone,
      c.address,
      c.monthlyFee,
      c.contractFrequency,
      c.assignedEmployeeId || 'SIN_ASIGNAR',
      c.assignedEmployeeName || 'Sin Técnico Asignado',
      c.assignedEmployeePhone || 'N/A',
      c.assignedEmployeeRole || 'N/A'
    ]);
    exportToExcel(`Directorio_Clientes_Asignaciones_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleShareDirectoryWhatsApp = () => {
    const text =
      `🏢 *DIRECTORIO DE CLIENTES Y PERSONAL ASIGNADO - ${COMPANY_BRAND.name.toUpperCase()}*\n` +
      `📅 *Fecha:* ${new Date().toLocaleDateString('es-MX')}\n` +
      `👥 *Clientes Totales:* ${clients.length} | 👷 *Técnicos:* ${employees.length}\n\n` +
      `📍 *ASIGNACIONES POR SEDE:*\n` +
      clients
        .map(
          (c) =>
            `• *${c.name}*\n  Contacto: ${c.contactPerson} (${c.phone})\n  👷 Técnico Asignado: *${c.assignedEmployeeName || 'Sin Asignar'}* (${c.assignedEmployeePhone || 'N/A'})`
        )
        .join('\n\n') +
      `\n\n✨ *Gestión y Asignación Operativa ${COMPANY_BRAND.name}*`;

    shareViaWhatsApp(text);
  };

  const handleSendDirectoryEmail = () => {
    const subject = `[DIRECTORIO DE ASIGNACIONES] Clientes y Personal Operativo ${COMPANY_BRAND.name} (${new Date().toLocaleDateString('es-MX')})`;
    const body =
      `Estimado Equipo Administrativo,\n\n` +
      `Se adjunta el directorio operativo oficial con la asignación vigente de técnicos por cliente:\n\n` +
      clients
        .map(
          (c, idx) =>
            ` ${idx + 1}. ${c.name} (${c.address})\n    - Contacto: ${c.contactPerson} | Tel: ${c.phone}\n    - Técnico Asignado: ${c.assignedEmployeeName || 'Sin Asignar'} (${c.assignedEmployeeRole || 'Técnico'})\n    - Teléfono Técnico: ${c.assignedEmployeePhone || 'N/A'}\n    - Póliza: $${c.monthlyFee.toLocaleString('es-MX')} MXN (${c.contractFrequency})\n`
        )
        .join('\n') +
      `\nAtentamente,\nDirección de Operaciones y Recursos Humanos\n${COMPANY_BRAND.legalName}`;

    setEmailModalData({
      title: 'Enviar Directorio de Asignaciones por Correo',
      defaultRecipient: COMPANY_BRAND.email,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Directorio y Asignaciones',
      attachmentName: `Directorio_Asignaciones_${new Date().toISOString().split('T')[0]}.csv`
    });
  };

  // 5. FINANCES: EXPORT & SHARE
  const handleExportFinancesExcel = () => {
    const headers = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Concepto', 'Cliente / Proveedor', 'Monto MXN'];
    const rows = finances.map((tx) => [
      tx.id,
      tx.date,
      tx.type.toUpperCase(),
      tx.category,
      tx.concept,
      tx.entity || '',
      tx.amount
    ]);
    exportToExcel(`Libro_Financiero_${COMPANY_BRAND.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleShareFinancesWhatsApp = () => {
    const text =
      `💰 *ESTADO FINANCIERO Y BALANCE GENERAL - ${COMPANY_BRAND.name.toUpperCase()}*\n` +
      `📅 *Fecha:* ${new Date().toLocaleDateString('es-MX')}\n\n` +
      `📈 *Ingresos Totales (Cobros):* $${totalIncome.toLocaleString('es-MX')} MXN\n` +
      `📉 *Gastos Operativos (Egresos):* $${totalExpense.toLocaleString('es-MX')} MXN\n` +
      `💵 *BALANCE NETO:* +$${netBalance.toLocaleString('es-MX')} MXN\n\n` +
      `💼 *${COMPANY_BRAND.name} Contabilidad y Finanzas*`;

    shareViaWhatsApp(text);
  };

  const handleSendFinancesEmail = () => {
    const subject = `[ESTADO FINANCIERO] Balance General y Flujo de Operaciones - ${COMPANY_BRAND.name} (${new Date().toLocaleDateString('es-MX')})`;
    const body =
      `Estimada Dirección General / Contabilidad,\n\n` +
      `Se remite el estado de cuenta y balance financiero operativo correspondiente al período:\n\n` +
      `RESUMEN CONTABLE:\n` +
      `• Ingresos Totales (Cobros): $${totalIncome.toLocaleString('es-MX')} MXN\n` +
      `• Gastos Operativos (Egresos): $${totalExpense.toLocaleString('es-MX')} MXN\n` +
      `• BALANCE NETO RESULTANTE: $${netBalance.toLocaleString('es-MX')} MXN\n\n` +
      `ÚLTIMOS MOVIMIENTOS REGISTRADOS:\n` +
      finances
        .slice(0, 10)
        .map(
          (tx, idx) =>
            ` ${idx + 1}. [${tx.type.toUpperCase()}] ${tx.date} - ${tx.concept} (${tx.entity || 'N/A'}): $${tx.amount.toLocaleString('es-MX')} MXN`
        )
        .join('\n') +
      `\n\nAtentamente,\nDirección de Administración y Finanzas\n${COMPANY_BRAND.legalName}`;

    setEmailModalData({
      title: 'Enviar Estado Financiero por Correo',
      defaultRecipient: COMPANY_BRAND.email,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Estado Financiero y Libro Mayor',
      attachmentName: `Libro_Financiero_${new Date().toISOString().split('T')[0]}.csv`
    });
  };

  // Resolution
  const handleResolveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIncId || !resolutionText.trim()) return;
    onResolveIncident(resolvingIncId, resolutionText);
    setResolvingIncId(null);
    setResolutionText('');
  };

  // Client Creation
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName) return;

    const assignedEmp = employees.find((e) => e.id === newClientAssignedEmp);
    const finalPhone = newClientPhone || '+52 55 1234 5678';
    const finalEmail =
      newClientEmail.trim() ||
      'contacto@' + newClientName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    const finalUsername =
      newClientUsername.trim() ||
      'cliente_' + newClientName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
    const finalPassword = newClientPassword.trim() || 'Sers#Cliente2025!';

    const clientPayload = {
      name: newClientName,
      contactPerson: newClientContact || 'Responsable de Sede',
      email: finalEmail,
      phone: finalPhone,
      address: newClientAddress || 'Ciudad de México',
      contractFrequency: 'Lunes a Sábado',
      auto3DayReport: true,
      monthlyFee: newClientFee,
      assignedEmployeeId: assignedEmp?.id,
      assignedEmployeeName: assignedEmp?.name,
      assignedEmployeePhone: assignedEmp?.phone,
      assignedEmployeeRole: assignedEmp?.role,
      username: finalUsername,
      password: finalPassword,
      status: 'activo' as const
    };

    onAddClient(clientPayload);

    if (sendClientWhatsAppOnCreate) {
      shareClientViaWhatsApp(clientPayload);
    }

    setShowNewClientModal(false);
    setNewClientName('');
    setNewClientContact('');
    setNewClientAddress('');
    setNewClientEmail('');
    setNewClientUsername('');
    setNewClientPassword('Sers#Cliente2025!');
  };

  // Employee Creation
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) return;

    const finalPhone = newEmpPhone || '+52 55 1234 5678';
    const finalEmail =
      newEmpEmail.trim() ||
      newEmpName.toLowerCase().replace(/\s+/g, '.') + '@cleanpro.com';
    const finalUsername =
      newEmpUsername.trim() ||
      newEmpName.toLowerCase().replace(/\s+/g, '.');
    const finalPassword = newEmpPassword.trim() || 'Sers#Segura2025!';

    const employeePayload = {
      name: newEmpName,
      role: newEmpRole,
      phone: finalPhone,
      email: finalEmail,
      assignedZone: newEmpZone,
      username: finalUsername,
      password: finalPassword,
      status: 'activo' as const
    };

    onAddEmployee(employeePayload);

    if (sendEmpWhatsAppOnCreate) {
      shareEmployeeViaWhatsApp(employeePayload);
    }

    setShowNewEmployeeModal(false);
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpUsername('');
    setNewEmpPassword('Sers#Segura2025!');
  };

  // Service Creation
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.name === srvClientName);
    const emp = employees.find((em) => em.name === srvOperativeName);

    const generatedTasks: ServiceTask[] =
      srvCustomTasks.length > 0
        ? srvCustomTasks.map((t, idx) => ({
            id: `T-${Date.now()}-${idx + 1}`,
            name: t.name,
            category: t.category,
            completed: false
          }))
        : [
            { id: `T-${Date.now()}-1`, name: 'Limpieza y aspirado general', category: 'General', completed: false },
            { id: `T-${Date.now()}-2`, name: 'Desinfección de sanitarios', category: 'Sanitarios', completed: false },
            { id: `T-${Date.now()}-3`, name: 'Retiro y clasificación de residuos', category: 'Residuos', completed: false }
          ];

    const servicePayload = {
      clientName: srvClientName,
      clientAddress: client?.address || 'Dirección registrada',
      date: srvDate,
      timeSlot: srvTimeSlot,
      status: 'programado' as const,
      operativeId: emp?.id || 'EMP-04',
      operativeName: srvOperativeName || 'José del Carmen Sotero',
      specialInstructions: srvNotes,
      totalCost: client?.monthlyFee ? Math.round(client.monthlyFee / 20) : 1500,
      tasks: generatedTasks
    };

    onAddService(servicePayload);

    if (sendWhatsAppOnCreate) {
      sendServiceOrderToEmployee(
        {
          ...servicePayload,
          id: `SRV-${Date.now().toString().slice(-3)}`,
          evidences: [],
          approvedByAdmin: false
        },
        client,
        emp
      );
    }

    setShowNewServiceModal(false);
    setSrvNotes('');
  };

  // Finance Transaction Creation
  const handleCreateFinance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txConcept) return;

    onAddTransaction({
      date: new Date().toISOString().split('T')[0],
      type: txType,
      category: txCategory,
      concept: txConcept,
      clientOrVendor: txEntity || 'General',
      entity: txEntity,
      amount: Number(txAmount),
      status: 'pagado'
    });

    setShowNewFinanceModal(false);
    setTxConcept('');
    setTxEntity('');
  };

  // Assignment Handler
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalClient || !selectedEmpForAssign) return;

    if (onAssignEmployeeToClient) {
      onAssignEmployeeToClient(assignModalClient.id, selectedEmpForAssign);
    }
    setAssignModalClient(null);
    setSelectedEmpForAssign('');
  };

  const handleOpenAssignModal = (client: ClientProfile) => {
    setAssignModalClient(client);
    setSelectedEmpForAssign(client.assignedEmployeeId || employees[0]?.id || '');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* BARRA EXCLUSIVA ADMIN: ACCESO A BASE DE DATOS SUPABASE, FLUJO SERS Y PURGA DE DATOS DEMO */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Panel de Control Exclusivo Admin</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Supabase Conectado
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Modo Pruebas Reales: Personal autenticado ({employees.length} usuarios activos: Harold Anguiano y José del Carmen Sotero).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {onSelectRole && (
            <>
              <button
                type="button"
                onClick={() => onSelectRole('operative')}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Explorar interfaz del personal técnico operativo"
              >
                <HardHat className="w-3.5 h-3.5 text-blue-600" />
                <span>Ver como Operativo</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('client')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Explorar portal de sedes y evidencias del cliente"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ver como Cliente</span>
              </button>
            </>
          )}

          {onOpenWorkflow && (
            <button
              type="button"
              onClick={onOpenWorkflow}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Flujo del Sistema</span>
            </button>
          )}

          {onOpenSupabaseModal && (
            <button
              type="button"
              onClick={onOpenSupabaseModal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-emerald-200" />
              <span>Gestionar Supabase</span>
            </button>
          )}

          {onPurgeMockData && (
            <button
              type="button"
              onClick={() => setShowPurgeModal(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Limpiar registros residuales de muestra en Supabase"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Purgar Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: NAVEGACIÓN MULTIRROL EXCLUSIVA PARA ADMINISTRADOR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-5 sm:p-6 rounded-3xl text-white border border-slate-700/60 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Navegación de Roles y Vistas del Sistema
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Acceso Exclusivo Administrador
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Como Administrador General, puedes ingresar directamente a auditar, probar e interactuar con cualquiera de las interfaces del sistema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Usuario autenticado: <strong>Harold Anguiano</strong></span>
          </div>
        </div>

        {/* Grid de 3 Roles del Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Rol Operativo */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-blue-400/50 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-900/50 text-blue-300 border border-blue-700/50">
                  Personal Operativo
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  Técnico Operativo en Campo
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Agenda diaria de trabajo, checklist paso a paso con evidencia fotográfica antes/después, kit diario de arranque y almacén de insumos.
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/40 text-[11px] text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Técnico asignado: <strong>José del Carmen Sotero</strong></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => onSelectRole?.('operative')}
                className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-950 transition-all group-hover:translate-y-[-1px]"
              >
                <HardHat className="w-4 h-4" />
                <span>Navegar como Operativo</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          </div>

          {/* 2. Rol Cliente */}
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-emerald-400/50 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                  Portal Cliente
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Portal de Clientes y Sedes
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Supervisión de evidencias fotográficas en tiempo real con geolocalización, reportes automáticos de ciclo de 3 días y acuse de calidad.
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/40 text-[11px] text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Sede conectada: <strong>Oficinas SkyTower</strong></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => onSelectRole?.('client')}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950 transition-all group-hover:translate-y-[-1px]"
              >
                <Building2 className="w-4 h-4" />
                <span>Navegar como Cliente</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </button>
            </div>
          </div>

          {/* 3. Rol Administrador (Vista Actual) */}
          <div className="bg-slate-800/80 border-2 border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Panel Activo
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">
                  Dirección General SERS
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Supervisión general, aprobación de servicios, bitácora de incidencias, directorio de asignaciones, cotizaciones, inventario y finanzas.
                </p>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-700/40 text-[11px] text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Administrador: <strong>Harold Anguiano Morales</strong></span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/50">
              <div className="w-full py-2.5 px-3 bg-slate-900/90 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Estás en este panel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. SUPERVISIÓN Y AUDITORÍA DE CALIDAD */}
      {activeTab === 'supervision_admin' && (
        <div className="space-y-6">
          {/* Protocolo Oficial y Flujo de Trabajo del Sistema SERS */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-5 sm:p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700/50">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold tracking-wide uppercase border border-blue-400/30">
                <FileText className="w-3.5 h-3.5" />
                <span>Protocolo Oficial del Sistema SERS</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white">
                Flujo de Trabajo Operativo y Evidencias para Clientes
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Guía completa del ciclo de 3 días, supervisión de bitácoras, evidencias fotográficas antes/después y control de suministros en comodato.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
              {onOpenWorkflow && (
                <button
                  type="button"
                  onClick={onOpenWorkflow}
                  className="flex-1 md:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-blue-200" />
                  <span>Ver Flujo Completo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => downloadSystemWorkflowPDF()}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-300" />
                <span>Descargar PDF</span>
              </button>
              <button
                type="button"
                onClick={() => shareWorkflowViaWhatsApp()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                title="Compartir Flujo a Cliente por WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="md:hidden lg:inline text-[11px]">Enviar WhatsApp</span>
              </button>
            </div>
          </div>

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
                <span>Auditorías en regla</span>
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
              <p className="mt-4 text-xs text-slate-400 font-medium">Margen neto operativo</p>
            </div>
          </div>

          {/* BÓVEDA DE RESGUARDO HISTÓRICO & BLINDAJE BANNER */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                Bóveda de Resguardo Histórico Inmutable
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Blindaje ante Reclamaciones Posteriores y Auditoría Digital
              </h2>
              <p className="text-xs md:text-sm text-purple-100/80 leading-relaxed">
                Todas las evidencias fotográficas (Antes/Después), firmas electrónicas, checklists y bitácoras de incidentes quedan archivadas de forma permanente y fechada. Responda al instante a reclamaciones de clientes con un <strong>Expediente de Auditoría Oficial en PDF</strong> o envíelo por WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <button
                onClick={() => {
                  setHistoricalAuditInitialServiceId(undefined);
                  setHistoricalAuditModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-white hover:bg-purple-50 text-purple-950 font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                Abrir Bóveda de Resguardo
              </button>
            </div>
          </div>

          {/* Evidence Review Panel */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
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

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setHistoricalAuditInitialServiceId(undefined);
                    setHistoricalAuditModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Abrir Bóveda de Resguardo Histórico"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Bóveda Histórica
                </button>
                <button
                  onClick={handleShareSupervisionWhatsApp}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Compartir informe gerencial por WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  onClick={handleSendSupervisionEmail}
                  className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Enviar informe ejecutivo de supervisión por correo"
                >
                  <Mail className="w-3.5 h-3.5" /> Correo
                </button>
                <button
                  onClick={handleExportSupervisionExcel}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Exportar bitácora de servicios a Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (CSV)
                </button>
                <button
                  onClick={handleDownloadSupervisionHTML}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Descargar informe en formato HTML"
                >
                  <Download className="w-3.5 h-3.5" /> HTML
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {services.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No hay servicios programados</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    No hay servicios de limpieza activos. Puede registrar un nuevo servicio real desde la pestaña de Clientes o programarlo directamente.
                  </p>
                  <button
                    onClick={() => setShowNewServiceModal(true)}
                    className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Calendar className="w-4 h-4 text-blue-400" /> Programar Primer Servicio
                  </button>
                </div>
              ) : (
                services.map((service) => {
                const completedTasks = (service.tasks || []).filter((t) => t.completed).length;
                const clientObj = clients.find((c) => c.name === service.clientName);
                const srvIncidents = incidents.filter((i) => i.serviceId === service.id || (i.clientName === service.clientName && i.date === service.date));

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
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-base md:text-lg">
                            {service.clientName}
                          </span>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                            👷 {service.operativeName}
                          </span>
                          {service.approvedByAdmin ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Aprobado
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase">
                              {service.status === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
                            </span>
                          )}

                          {service.clientSignature && (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                              ✍️ Firmado por {service.clientSignature.signedBy} ({service.clientSignature.signedAt})
                            </span>
                          )}

                          {(service.evidences || []).length > 0 && (
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                              📷 {(service.evidences || []).length} Evidencias
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Folio: <strong>{service.id}</strong> • {service.date} • {service.timeSlot} • {service.clientAddress}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* WhatsApp with Evidences button */}
                        <button
                          onClick={() => {
                            shareServiceReportWithEvidencesViaWhatsApp(
                              service,
                              clientObj,
                              srvIncidents
                            );
                          }}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          title="Enviar reporte por WhatsApp con fotos de antes/después y firmas"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp c/ Fotos
                        </button>

                        {/* Upload Evidence button */}
                        <button
                          onClick={() => setEvidenceUploadService(service)}
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Subir fotos de evidencia para este servicio"
                        >
                          <Camera className="w-3.5 h-3.5" /> + Evidencia
                        </button>

                        {/* Historical Dossier PDF button */}
                        <button
                          onClick={() => downloadHistoricalAuditPDF(service, clientObj, srvIncidents)}
                          className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Descargar Expediente de Auditoría Inmutable en PDF (Blindaje ante reclamos)"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Expediente PDF
                        </button>

                        {/* Vault shortcut */}
                        <button
                          onClick={() => {
                            setHistoricalAuditInitialServiceId(service.id);
                            setHistoricalAuditModalOpen(true);
                          }}
                          className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Consultar en Bóveda Histórica"
                        >
                          <Eye className="w-3.5 h-3.5" /> Bóveda
                        </button>

                        <button
                          onClick={() => handleSendOrderWhatsApp(service)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Enviar orden de trabajo al técnico"
                        >
                          <Send className="w-3.5 h-3.5" /> Despachar
                        </button>

                        {!service.approvedByAdmin && (
                          <button
                            onClick={() => onApproveService(service.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-200 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Aprobar y Cerrar
                          </button>
                        )}

                        {/* EDIT SERVICE BUTTON */}
                        <button
                          type="button"
                          onClick={() => setEditingService(service)}
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Editar fecha, horario o técnico del servicio"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Editar
                        </button>

                        {/* DELETE SERVICE BUTTON */}
                        {onDeleteService && (
                          <button
                            type="button"
                            onClick={() => setDeletingService(service)}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Eliminar este servicio del sistema"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Evidences Photo Grid */}
                    {(service.evidences || []).length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                        {(service.evidences || []).map((ev, idx) => (
                          <div
                            key={ev.id || `admin-ev-${service.id}-${idx}`}
                            onClick={() => setViewingEvidence(ev)}
                            className="group relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 cursor-pointer"
                          >
                            <img
                              src={ev.afterPhotoUrl || ev.beforePhotoUrl}
                              alt={ev.area}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-2">
                              <span className="text-white text-[10px] font-bold truncate">
                                {ev.area}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Incidents Table / Resolution Section */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Incidencias Reportadas en Campo
                  </h3>
                  <p className="text-xs text-slate-400">Resolución de daños previos, faltantes y fallas</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportIncidentsExcel}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar (CSV)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {incidents.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Sin incidencias registradas</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    El sistema no cuenta con incidencias pendientes. Las fallas o daños reportados desde campo por el personal o clientes aparecerán aquí.
                  </p>
                </div>
              ) : (
                incidents.map((inc) => {
                const isResolved = inc.status === 'resuelto';

                return (
                  <div
                    key={inc.id}
                    className={`p-5 rounded-2xl border space-y-3 transition-all ${
                      isResolved
                        ? 'border-green-200 bg-green-50/20'
                        : inc.origin === 'cliente'
                        ? 'border-orange-300 bg-orange-50/30 ring-1 ring-orange-200'
                        : 'border-orange-100 bg-orange-50/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {inc.origin === 'cliente' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-600" /> Solicitud Cliente
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            Hallazgo Operativo
                          </span>
                        )}

                        {inc.priority && (
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              inc.priority === 'urgente'
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : inc.priority === 'alta'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {inc.priority}
                          </span>
                        )}

                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                          {inc.type.replace('_', ' ')} • Folio #{inc.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base">{inc.title}</h4>
                      </div>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                          isResolved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {isResolved ? '✅ Resuelto y Verificado' : '⏳ En Seguimiento'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{inc.description}</p>

                    <div className="p-3 bg-white rounded-xl text-xs text-slate-600 flex flex-wrap justify-between gap-2 border border-slate-100">
                      <span><strong>Sede / Cliente:</strong> {inc.clientName} ({inc.location})</span>
                      <span><strong>Técnico Asignado:</strong> {inc.operativeName}</span>
                      <span><strong>Fecha Reporte:</strong> {inc.date} {inc.time}</span>
                    </div>

                    {/* RESOLUTION STATUS WITH EVIDENCE */}
                    {isResolved ? (
                      <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 uppercase text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            Resolución Confirmada con Evidencia
                          </span>
                          {inc.resolvedAt && (
                            <span className="text-[10px] text-green-700">{inc.resolvedAt}</span>
                          )}
                        </div>

                        <p className="text-xs text-green-950 font-medium bg-white/70 p-2 rounded-xl border border-green-100">
                          "{inc.resolutionNotes || inc.adminResolution}"
                        </p>

                        {inc.resolvedBy && (
                          <div className="text-[11px] text-green-800">
                            Atendido por: <strong>{inc.resolvedBy}</strong> ({inc.resolvedByRole === 'operativo' ? 'Técnico en Campo' : 'Dirección Operativa'})
                          </div>
                        )}

                        {inc.resolutionPhotoUrl && (
                          <div className="pt-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-800">
                              📸 Foto de Solución:
                            </span>
                            <button
                              onClick={() =>
                                setViewingIncident({
                                  ...inc,
                                  title: `Solución: ${inc.title}`,
                                  photoUrl: inc.resolutionPhotoUrl!
                                })
                              }
                              className="px-2.5 py-1 bg-white hover:bg-green-100 text-green-800 border border-green-300 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <Camera className="w-3 h-3 text-green-700" /> Ver Evidencia de Solución
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-orange-100">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleShareIncidentWhatsApp(inc)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </button>
                        <button
                          onClick={() => handleSendIncidentEmail(inc)}
                          className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" /> Correo
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedIncidentForReport(inc)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Reporte PDF
                        </button>
                        {inc.photoUrl && (
                          <button
                            onClick={() => setViewingIncident(inc)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Foto Inicial
                          </button>
                        )}
                        {!isResolved && (
                          <button
                            onClick={() => setResolvingIncident(inc)}
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolver con Evidencia
                          </button>
                        )}
                        {onDeleteIncident && (
                          <button
                            type="button"
                            onClick={() => setDeletingIncident(inc)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                            title="Eliminar reporte de incidencia de Supabase"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      )}

      {/* 2. INSUMOS, ALMACÉN E INVENTARIO CENTRAL */}
      {activeTab === 'insumos_admin' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Almacén Central e Inventario
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Control de existencias, requerimientos de clientes y pedidos de reabastecimiento
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {onAddSupply && (
                <button
                  type="button"
                  onClick={() => setShowNewSupplyModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> + Nuevo Insumo
                </button>
              )}
              <button
                onClick={handleShareWarehouseWhatsApp}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button
                onClick={handleSendWarehouseEmail}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Mail className="w-3.5 h-3.5" /> Correo
              </button>
              <button
                onClick={handleExportWarehouseExcel}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (CSV)
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir
              </button>
            </div>
          </div>

          {/* Supply Requests from Clients */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">
              Requerimientos de Insumos Emitidos por Clientes ({supplyRequests.length})
            </h3>

            <div className="space-y-3">
              {supplyRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{req.clientName}</span>
                      <span className="text-xs text-slate-400">({req.id} • {req.requestDate})</span>
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

                    <p className="text-xs text-slate-600 font-medium">
                      {req.items.map((i) => `${i.quantity} ${i.unit} de ${i.supplyName}`).join(' • ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pendiente' && (
                      <button
                        onClick={() => onApproveSupplyRequest(req.id, 'aprobado')}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Aprobar Entrega
                      </button>
                    )}
                    {req.status === 'aprobado' && (
                      <button
                        onClick={() => onApproveSupplyRequest(req.id, 'despachado')}
                        className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Confirmar Despacho
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Central Stock Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {supplies.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <Boxes className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No hay insumos registrados en inventario</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Agregue insumos de limpieza y comodato utilizando el botón "+ Nuevo Insumo" arriba para gestionar el stock real.
                </p>
                {onAddSupply && (
                  <button
                    onClick={() => setShowNewSupplyModal(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Agregar Primer Insumo
                  </button>
                )}
              </div>
            ) : (
              supplies.map((sup) => {
              const isLow = sup.currentStock <= sup.minimumStock;
              return (
                <div
                  key={sup.id}
                  className={`bg-white rounded-3xl p-6 border transition-all space-y-3 ${
                    isLow ? 'border-orange-200 bg-orange-50/20' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {sup.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        isLow ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isLow ? 'Stock Crítico' : 'Nivel Óptimo'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{sup.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Mínimo sugerido: {sup.minimumStock} {sup.unit}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">{sup.currentStock}</span>
                      <span className="text-xs text-slate-400 font-medium ml-1">{sup.unit}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setStockModalSupply(sup);
                          setStockDelta(10);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                        title="Ajustar cantidad en almacén"
                      >
                        Ajustar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSupply(sup)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs cursor-pointer transition-colors"
                        title="Editar nombre, categoría o mínimo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteSupply && (
                        <button
                          type="button"
                          onClick={() => setDeletingSupply(sup)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs cursor-pointer transition-colors"
                          title="Eliminar insumo de la base de datos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* 3. OPERACIÓN Y DIRECTORIO: CLIENTES, PERSONAL Y ASIGNACIONES */}
      {activeTab === 'operacion_admin' && (
        <div className="space-y-6">
          {/* Quick Action Buttons & Exports */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Operación y Directorio</h2>
              <p className="text-xs md:text-sm text-slate-400">
                Gestión de clientes, personal técnico y asignación directa de empleados a sedes
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareDirectoryWhatsApp}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Compartir asignaciones por WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>

              <button
                onClick={handleSendDirectoryEmail}
                className="px-3.5 py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Enviar directorio por correo"
              >
                <Mail className="w-3.5 h-3.5" /> Correo
              </button>

              <button
                onClick={handleExportDirectoryExcel}
                className="px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="Exportar clientes y asignaciones a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (CSV)
              </button>

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

          {/* Directory Grids: Clients with Employee Assignments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clients List with Assignment Feature */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Clientes Activos ({clients.length})
                </h3>
                <span className="text-xs text-slate-400 font-medium">Asignaciones directas</span>
              </div>

              <div className="space-y-4">
                {clients.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">No hay clientes registrados</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Haga clic en "+ Cliente" para registrar el primer cliente real en Supabase con personal asignado.
                    </p>
                    <button
                      onClick={() => setShowNewClientModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Building className="w-4 h-4" /> Registrar Primer Cliente
                    </button>
                  </div>
                ) : (
                  clients.map((c) => (
                    <div
                      key={c.id}
                      className="p-4.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                c.status === 'inactivo'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {c.status === 'inactivo' ? 'Inactivo' : 'Activo'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{c.address}</p>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          ${c.monthlyFee.toLocaleString('es-MX')} /mes
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 grid grid-cols-2 gap-1 py-1">
                        <div><strong>Contacto:</strong> {c.contactPerson}</div>
                        <div><strong>Teléfono:</strong> {c.phone}</div>
                        <div><strong>Frecuencia:</strong> {c.contractFrequency}</div>
                        <div><strong>Reporte 3 Días:</strong> {c.auto3DayReport ? 'Activado' : 'Manual'}</div>
                      </div>

                      {/* ASSIGNED EMPLOYEE BADGE & ACTION */}
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Técnico Asignado
                            </p>
                            <p className="text-xs font-bold text-slate-900">
                              {c.assignedEmployeeName || 'Sin Asignar'}
                            </p>
                            {c.assignedEmployeePhone && (
                              <p className="text-[11px] text-slate-400 font-medium">
                                Tel: {c.assignedEmployeePhone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => downloadSystemWorkflowPDF(c.name)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                            title="Descargar Flujo de Trabajo PDF para este cliente"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400" />
                            <span>Flujo PDF</span>
                          </button>
                          <button
                            onClick={() => shareWorkflowViaWhatsApp(c.name, c.phone)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                            title="Enviar resumen del Flujo por WhatsApp al cliente"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handleOpenAssignModal(c)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Asignar Empleado
                          </button>
                        </div>
                      </div>

                      {/* CRUD ACTION BAR: VER, EDITAR, DESACTIVAR/ACTIVAR, BORRAR */}
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => shareClientViaWhatsApp(c)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                          title="Enviar credenciales y enlace de acceso directo al rol de cliente por WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Credenciales WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingClient(c)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ver ficha completa del cliente"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Ver Ficha</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingClient(c)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Editar datos del cliente"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Editar</span>
                        </button>
                        {onToggleClientStatus && (
                          <button
                            type="button"
                            onClick={() => onToggleClientStatus(c.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              c.status === 'inactivo'
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                            }`}
                            title={c.status === 'inactivo' ? 'Reactivar cliente' : 'Pausar/Desactivar cliente'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{c.status === 'inactivo' ? 'Activar' : 'Desactivar'}</span>
                          </button>
                        )}
                        {onDeleteClient && (
                          <button
                            type="button"
                            onClick={() => setDeletingClient(c)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Eliminar cliente de la base de datos"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Employees List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-base md:text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Personal Operativo ({employees.length})
                </h3>
                <span className="text-xs text-slate-400 font-medium">Plantilla Oficial</span>
              </div>

              <div className="space-y-3">
                {employees.map((emp) => {
                  const assignedClientsCount = clients.filter(
                    (c) => c.assignedEmployeeId === emp.id || c.assignedEmployeeName === emp.name
                  ).length;

                  return (
                    <div key={emp.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm md:text-base">{emp.name}</h4>
                            <p className="text-xs text-slate-500">{emp.role}</p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                          {assignedClientsCount} Sedes Asignadas
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium flex justify-between pt-1 border-t border-slate-100">
                        <span>Zona: {emp.assignedZone}</span>
                        <span>Tel: {emp.phone}</span>
                        <span>{emp.servicesCompletedThisMonth} servicios/mes</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MÓDULO PERSONAL, CREDENCIALES & WHATSAPP */}
      {activeTab === 'personal_admin' && (
        <StaffManager
          employees={employees}
          clients={clients}
          onAddEmployee={onAddEmployee}
          onUpdateEmployee={onUpdateEmployee}
          onDeleteEmployee={onDeleteEmployee}
          onToggleEmployeeStatus={onToggleEmployeeStatus}
        />
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
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Libro de Movimientos Financieros
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Registro detallado de ingresos, egresos y balance operativo
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleShareFinancesWhatsApp}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  onClick={handleSendFinancesEmail}
                  className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Correo
                </button>
                <button
                  onClick={handleExportFinancesExcel}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (CSV)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
                <button
                  onClick={() => setShowNewFinanceModal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-slate-200"
                >
                  <Plus className="w-3.5 h-3.5" /> + Movimiento
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Concepto</th>
                    <th className="p-4">Cliente / Proveedor</th>
                    <th className="p-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {finances.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-slate-500">{tx.date}</td>
                      <td className="p-4">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full uppercase text-[10px] ${
                            tx.type === 'ingreso'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{tx.category.replace('_', ' ')}</td>
                      <td className="p-4 font-bold text-slate-800">{tx.concept}</td>
                      <td className="p-4 text-slate-500">{tx.entity || '-'}</td>
                      <td
                        className={`p-4 text-right font-bold text-sm ${
                          tx.type === 'ingreso' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'ingreso' ? '+' : '-'}${tx.amount.toLocaleString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. COTIZACIONES Y PRESUPUESTOS */}
      {activeTab === 'cotizaciones_admin' && (
        <QuotationManager
          quotations={quotations}
          onSaveQuotation={onSaveQuotation}
          onUpdateStatus={onUpdateQuotationStatus}
        />
      )}

      {/* MODAL: ASIGNAR EMPLEADO A CLIENTE */}
      {assignModalClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Asignar Empleado a Cliente
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Cliente: <strong className="text-slate-700">{assignModalClient.name}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Selecciona el Técnico que atenderá esta sede:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {employees.map((emp) => {
                    const isSelected = selectedEmpForAssign === emp.id;
                    return (
                      <div
                        key={`assign-emp-${emp.id}`}
                        onClick={() => setSelectedEmpForAssign(emp.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                            <p className="text-xs text-slate-400">
                              {emp.role} • {emp.assignedZone} • Tel: {emp.phone}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalClient(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold cursor-pointer shadow-md shadow-blue-200 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Guardar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO CLIENTE */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Registrar Nuevo Cliente</h3>
            <p className="text-xs text-slate-400 mb-4">Ingresa los datos para la póliza de servicio</p>

            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre / Razón Social:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Corporativo Santa Fe"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Persona de Contacto:</label>
                <input
                  type="text"
                  placeholder="Ej. Lic. Laura Méndez"
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="tel"
                    required
                    placeholder="+52 55 1234 5678"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Dirección de Sede:</label>
                <input
                  type="text"
                  placeholder="Ej. Av. Reforma 500, Piso 14"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Técnico Operativo Asignado:</label>
                  <select
                    value={newClientAssignedEmp}
                    onChange={(e) => setNewClientAssignedEmp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500 bg-white font-medium"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Cuota Mensual (MXN):</label>
                  <input
                    type="number"
                    value={newClientFee}
                    onChange={(e) => setNewClientFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Credenciales de Acceso Cliente */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Credenciales para Acceso al Portal de Cliente</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Usuario / Nickname:</label>
                    <input
                      type="text"
                      placeholder="ej. cliente_corporativo"
                      value={newClientUsername}
                      onChange={(e) => setNewClientUsername(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Contraseña:</label>
                    <input
                      type="text"
                      placeholder="ej. Sers#Cliente2025!"
                      value={newClientPassword}
                      onChange={(e) => setNewClientPassword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendClientWhatsAppOnCreate}
                    onChange={(e) => setSendClientWhatsAppOnCreate(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Enviar credenciales y enlace directo al cliente por WhatsApp
                  </span>
                </label>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-emerald-200 flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Registrar Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO EMPLEADO */}
      {showNewEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Registrar Nuevo Empleado</h3>
            <p className="text-xs text-slate-400 mb-4">Personal técnico y operativo de campo</p>

            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Sánchez"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Puesto / Especialidad:</label>
                  <input
                    type="text"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Zona Asignada:</label>
                  <input
                    type="text"
                    value={newEmpZone}
                    onChange={(e) => setNewEmpZone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="tel"
                    required
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    placeholder="empleado@sers.com"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Credenciales de Acceso Operativo */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Credenciales para Acceso Operativo</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Usuario / Nickname:</label>
                    <input
                      type="text"
                      placeholder="ej. roberto.sanchez"
                      value={newEmpUsername}
                      onChange={(e) => setNewEmpUsername(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Contraseña:</label>
                    <input
                      type="text"
                      placeholder="ej. Sers#Segura2025!"
                      value={newEmpPassword}
                      onChange={(e) => setNewEmpPassword(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-emerald-500 bg-white font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmpWhatsAppOnCreate}
                    onChange={(e) => setSendEmpWhatsAppOnCreate(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Enviar credenciales y enlace directo al empleado por WhatsApp
                  </span>
                </label>
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
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-slate-200 flex items-center gap-1.5"
                >
                  <HardHat className="w-4 h-4" />
                  <span>Registrar Empleado</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROGRAMAR SERVICIO CON TAREAS Y DESPACHO WHATSAPP */}
      {showNewServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Programar y Asignar Orden de Servicio</h3>
                <p className="text-xs text-slate-400">Configura el turno, personal asignado y checklist de tareas</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewServiceModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Cliente / Sede:</label>
                  <select
                    value={srvClientName}
                    onChange={(e) => {
                      setSrvClientName(e.target.value);
                      const cli = clients.find((c) => c.name === e.target.value);
                      if (cli?.assignedEmployeeName) {
                        setSrvOperativeName(cli.assignedEmployeeName);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-blue-500 font-medium"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Técnico Operativo Asignado:</label>
                  <select
                    value={srvOperativeName}
                    onChange={(e) => setSrvOperativeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-blue-500 font-medium"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Fecha Programada:</label>
                  <input
                    type="date"
                    required
                    value={srvDate}
                    onChange={(e) => setSrvDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Horario / Ventana de Trabajo:</label>
                  <input
                    type="text"
                    required
                    value={srvTimeSlot}
                    onChange={(e) => setSrvTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                    placeholder="Ej. 08:00 - 12:00"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Instrucciones Especiales:</label>
                <input
                  type="text"
                  placeholder="Ej. Desinfección profunda de salas de juntas y área de cafetería"
                  value={srvNotes}
                  onChange={(e) => setSrvNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-blue-500"
                />
              </div>

              {/* Plantilla y Checklist de Tareas */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">Plantilla de Checklist / Protocolo:</label>
                    <span className="text-[11px] text-slate-400">Selecciona un preset o agrega tareas personalizadas</span>
                  </div>
                  <select
                    value={srvPreset}
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-blue-500"
                  >
                    {Object.keys(SERVICE_TASK_PRESETS).map((presetName) => (
                      <option key={presetName} value={presetName}>
                        {presetName}
                      </option>
                    ))}
                    <option value="Personalizado">Personalizado (Manual)</option>
                  </select>
                </div>

                {/* Task list preview */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {srvCustomTasks.map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{t.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                          {t.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomTask(t.id)}
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new task inline */}
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Agregar tarea específica..."
                    value={newCustomTaskName}
                    onChange={(e) => setNewCustomTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTask();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500"
                  />
                  <select
                    value={newCustomTaskCategory}
                    onChange={(e) => setNewCustomTaskCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500 font-medium"
                  >
                    <option value="General">General</option>
                    <option value="Pisos">Pisos</option>
                    <option value="Sanitarios">Sanitarios</option>
                    <option value="Cristales">Cristales</option>
                    <option value="Mobiliario">Mobiliario</option>
                    <option value="Residuos">Residuos</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomTask}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* Instant WhatsApp Dispatch Checkbox */}
              <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sendWhatsAppOnCreate}
                  onChange={(e) => setSendWhatsAppOnCreate(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                    Despachar orden inmediatamente por WhatsApp al técnico
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Abre WhatsApp con la ubicación en Google Maps, folio y el checklist para el personal
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold cursor-pointer shadow-lg shadow-slate-200 flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Confirmar y Asignar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR MOVIMIENTO FINANCIERO */}
      {showNewFinanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">Registrar Movimiento Financiero</h3>
            <p className="text-xs text-slate-400 mb-4">Ingreso o egreso en el libro mayor</p>

            <form onSubmit={handleCreateFinance} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('ingreso')}
                  className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                    txType === 'ingreso'
                      ? 'bg-green-600 text-white border-green-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  + Ingreso (Cobro)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('gasto')}
                  className={`py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                    txType === 'gasto'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
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

      {/* MODAL: AJUSTE DE STOCK */}
      {stockModalSupply && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Ajustar Stock de Insumo</h3>
            <p className="text-xs text-slate-500 mb-4">{stockModalSupply.name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cantidad a ingresar (+):</label>
                <input
                  type="number"
                  value={stockDelta}
                  onChange={(e) => setStockDelta(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModalSupply(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateSupplyStock(stockModalSupply.id, stockDelta);
                    setStockModalSupply(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Actualizar Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVER INCIDENCIA CON EVIDENCIA FOTOGRÁFICA */}
      {resolvingIncident && (
        <IncidentResolutionModal
          isOpen={true}
          incident={resolvingIncident}
          onClose={() => setResolvingIncident(null)}
          currentUserRole="admin"
          currentUserName="Dirección Operativa"
          onResolve={(incId, data) => {
            if (onResolveIncidentWithEvidence) {
              onResolveIncidentWithEvidence(incId, data);
            } else {
              onResolveIncident(incId, data.resolutionNotes);
            }
            setResolvingIncident(null);
          }}
        />
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

      {/* Incident Printable Report PDF Modal */}
      {selectedIncidentForReport && (
        <IncidentReportModal
          incident={selectedIncidentForReport}
          onClose={() => setSelectedIncidentForReport(null)}
        />
      )}

      {/* Email / WhatsApp Share Modal */}
      {emailModalData && (
        <EmailSenderModal
          modalData={emailModalData}
          isOpen={!!emailModalData}
          onClose={() => setEmailModalData(null)}
        />
      )}

      {/* BÓVEDA DE RESGUARDO HISTÓRICO & BLINDAJE ANTE RECLAMACIONES MODAL */}
      <HistoricalAuditModal
        isOpen={historicalAuditModalOpen}
        onClose={() => setHistoricalAuditModalOpen(false)}
        services={services}
        clients={clients}
        incidents={incidents}
        initialServiceId={historicalAuditInitialServiceId}
        onOpenEvidenceViewer={(ev) => setViewingEvidence(ev)}
      />

      {/* SUBIDA DE EVIDENCIAS FOTOGRÁFICAS MODAL */}
      {evidenceUploadService && (
        <EvidenceUploadModal
          isOpen={!!evidenceUploadService}
          onClose={() => setEvidenceUploadService(null)}
          service={evidenceUploadService}
          onSaveEvidence={(srvId, ev) => {
            onAddEvidence?.(srvId, ev);
            setEvidenceUploadService(null);
          }}
        />
      )}

      {/* ============================================== */}
      {/* MODALES CRUD PARA MODO PRUEBAS REALES EN SUPABASE */}
      {/* ============================================== */}

      {/* 1. VER FICHA DE CLIENTE */}
      {viewingClient && (
        <ClientDetailsModal
          client={viewingClient}
          onClose={() => setViewingClient(null)}
          onEdit={() => {
            const c = viewingClient;
            setViewingClient(null);
            setEditingClient(c);
          }}
          onToggleStatus={(clientId) => {
            onToggleClientStatus?.(clientId);
            setViewingClient(null);
          }}
          onDelete={() => {
            const c = viewingClient;
            setViewingClient(null);
            setDeletingClient(c);
          }}
        />
      )}

      {/* 2. EDITAR CLIENTE */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          employees={employees}
          onClose={() => setEditingClient(null)}
          onSave={async (_clientId, updates) => {
            await onUpdateClient?.({ ...editingClient, ...updates });
          }}
        />
      )}

      {/* 3. ELIMINAR CLIENTE */}
      {deletingClient && (
        <DeleteConfirmModal
          title="Eliminar Registro de Cliente"
          message="¿Está seguro de eliminar a este cliente? Esta acción removerá su contrato y asignaciones de la base de datos de Supabase."
          itemName={deletingClient.name}
          onClose={() => setDeletingClient(null)}
          onConfirm={async () => {
            await onDeleteClient?.(deletingClient.id);
          }}
        />
      )}

      {/* 4. EDITAR SERVICIO DE LIMPIEZA */}
      {editingService && (
        <EditServiceModal
          service={editingService}
          employees={employees}
          onClose={() => setEditingService(null)}
          onSave={async (_serviceId, updates) => {
            await onUpdateService?.({ ...editingService, ...updates });
          }}
        />
      )}

      {/* 5. ELIMINAR SERVICIO DE LIMPIEZA */}
      {deletingService && (
        <DeleteConfirmModal
          title="Eliminar Servicio de Limpieza"
          message="¿Está seguro de eliminar esta orden de trabajo? Esta acción eliminará el servicio y su historial de la base de datos."
          itemName={`${deletingService.clientName} (${deletingService.date} • ${deletingService.timeSlot})`}
          onClose={() => setDeletingService(null)}
          onConfirm={async () => {
            await onDeleteService?.(deletingService.id);
          }}
        />
      )}

      {/* 6. ELIMINAR INCIDENCIA */}
      {deletingIncident && (
        <DeleteConfirmModal
          title="Eliminar Reporte de Incidencia"
          message="¿Está seguro de eliminar esta incidencia técnica de campo? Se removerá permanentemente de Supabase."
          itemName={`${deletingIncident.title} (${deletingIncident.clientName})`}
          onClose={() => setDeletingIncident(null)}
          onConfirm={async () => {
            await onDeleteIncident?.(deletingIncident.id);
          }}
        />
      )}

      {/* 7. NUEVO O EDITAR INSUMO */}
      {(showNewSupplyModal || editingSupply) && (
        <SupplyFormModal
          supply={editingSupply}
          onClose={() => {
            setShowNewSupplyModal(false);
            setEditingSupply(null);
          }}
          onSave={async (supplyData) => {
            if (editingSupply) {
              await onUpdateSupply?.({ ...editingSupply, ...supplyData });
            } else {
              await onAddSupply?.(supplyData);
            }
          }}
        />
      )}

      {/* 8. ELIMINAR INSUMO */}
      {deletingSupply && (
        <DeleteConfirmModal
          title="Eliminar Insumo del Almacén"
          message="¿Está seguro de eliminar este insumo de la base de datos de inventario central?"
          itemName={`${deletingSupply.name} (Stock: ${deletingSupply.currentStock} ${deletingSupply.unit})`}
          onClose={() => setDeletingSupply(null)}
          onConfirm={async () => {
            await onDeleteSupply?.(deletingSupply.id);
          }}
        />
      )}

      {/* 9. PURGA DE DATOS DE MUESTRA RESIDUALES */}
      {showPurgeModal && (
        <PurgeMockDataModal
          onClose={() => setShowPurgeModal(false)}
          onConfirm={async () => {
            await onPurgeMockData?.();
          }}
        />
      )}
    </div>
  );
};
