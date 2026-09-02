import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Send,
  ArrowRight,
  FileText,
  ChevronRight,
  Printer,
  Mail,
  MessageSquare,
  Users,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  UserCheck,
  Building
} from 'lucide-react';
import {
  CleaningService,
  IncidentReport,
  Cycle3DayReport,
  SupplyRequest,
  PhotoEvidence,
  ClientProfile,
  EmployeeProfile
} from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';
import { IncidentReportModal } from '../../common/IncidentReportModal';
import { ClientReportModal } from '../../common/ClientReportModal';
import { EmailSenderModal, EmailModalData } from '../../common/EmailSenderModal';
import { HistoricalAuditModal } from '../../common/HistoricalAuditModal';
import { COMPANY_BRAND } from '../../../constants/branding';
import {
  exportToExcel,
  exportToHTMLPDF,
  shareViaWhatsApp,
  cleanPhoneNumber
} from '../../../utils/exportUtils';
import { downloadSystemWorkflowPDF } from '../../../utils/workflowDocumentUtils';
import {
  downloadHistoricalAuditPDF,
  shareServiceReportWithEvidencesViaWhatsApp
} from '../../../utils/serviceOrderUtils';

interface ClientDashboardProps {
  activeTab: string;
  services: CleaningService[];
  incidents: IncidentReport[];
  cycleReports: Cycle3DayReport[];
  supplyRequests: SupplyRequest[];
  clientName: string;
  clientProfile?: ClientProfile;
  assignedEmployee?: EmployeeProfile;
  onEmitSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>) => void;
  onClientReportIncident?: (incident: Omit<IncidentReport, 'id' | 'date' | 'time' | 'status'>) => void;
  onOpenWorkflow?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeTab,
  services,
  incidents,
  cycleReports,
  supplyRequests,
  clientName = 'Oficinas Corporativas SkyTower',
  clientProfile,
  assignedEmployee,
  onEmitSupplyRequest,
  onClientReportIncident,
  onOpenWorkflow
}) => {
  const [viewingEvidence, setViewingEvidence] = useState<PhotoEvidence | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);
  const [selectedIncidentForReport, setSelectedIncidentForReport] = useState<IncidentReport | null>(null);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);
  const [showHistoricalVault, setShowHistoricalVault] = useState(false);
  const [vaultInitialServiceId, setVaultInitialServiceId] = useState<string | undefined>(undefined);
  const [showClientReportModal, setShowClientReportModal] = useState(false);
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'pendientes' | 'resueltos'>('all');

  // Sub-tab state for internal client navigation when activeTab is generic
  const [clientSection, setClientSection] = useState<'evidencias' | 'insumos' | 'incidencias' | 'tecnico'>(
    activeTab === 'insumos_cliente'
      ? 'insumos'
      : activeTab === 'incidencias_cliente'
      ? 'incidencias'
      : activeTab === 'tecnico_cliente'
      ? 'tecnico'
      : 'evidencias'
  );

  // Sync internal section if parent activeTab changes
  React.useEffect(() => {
    if (activeTab === 'insumos_cliente') setClientSection('insumos');
    else if (activeTab === 'incidencias_cliente') setClientSection('incidencias');
    else if (activeTab === 'tecnico_cliente') setClientSection('tecnico');
    else if (activeTab === 'evidencias_cliente') setClientSection('evidencias');
  }, [activeTab]);

  // New Supply Request Form State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState([
    { supplyName: 'Jabón Líquido Antibacterial', quantity: 3, unit: 'Garrafas' },
    { supplyName: 'Papel Higiénico Jumbo Bobina', quantity: 20, unit: 'Rollos' },
    { supplyName: 'Toallas Interdobladas Manos', quantity: 25, unit: 'Paquetes' },
    { supplyName: 'Bolsas Basura 90x120 Cal. 600', quantity: 80, unit: 'Piezas' }
  ]);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccessAlert, setOrderSuccessAlert] = useState(false);

  // Filter client data
  const clientServices = services.filter(
    (s) => s.clientName.toLowerCase().includes(clientName.toLowerCase()) || s.clientName.includes('SkyTower')
  );
  const clientIncidents = incidents.filter(
    (i) => i.clientName.toLowerCase().includes(clientName.toLowerCase()) || i.clientName.includes('SkyTower')
  );
  const currentReport = cycleReports[0] || cycleReports[0];

  // Technician in charge
  const technicianName =
    clientProfile?.assignedEmployeeName || assignedEmployee?.name || 'José del Carmen Sotero';
  const technicianPhone =
    clientProfile?.assignedEmployeePhone || assignedEmployee?.phone || '+52 99 3123 4567';
  const technicianRole =
    clientProfile?.assignedEmployeeRole || assignedEmployee?.role || 'Supervisor Operativo';

  // --- EXPORT & SHARE: SERVICES ---
  const handleExportServicesExcel = () => {
    const headers = ['Folio Servicio', 'Fecha', 'Horario', 'Técnico Asignado', 'Estado', 'Tareas Totales', 'Evidencias'];
    const rows = clientServices.map((s) => [
      s.id,
      s.date,
      s.timeSlot,
      s.operativeName,
      s.status.toUpperCase(),
      `${s.tasks.filter((t) => t.completed).length}/${s.tasks.length} completadas`,
      `${s.evidences.length} fotos adjuntas`
    ]);
    exportToExcel(`Bitacora_Servicios_${clientName.replace(/\s+/g, '_')}`, headers, rows);
  };

  const handleShareServicesWhatsApp = () => {
    const today = new Date().toISOString().split('T')[0];
    const completed = clientServices.filter((s) => s.status === 'completado').length;
    const text =
      `🏢 *REPORTE DE SERVICIOS Y CALIDAD - ${COMPANY_BRAND.name.toUpperCase()}*\n` +
      `📍 *Cliente / Sede:* ${clientName}\n` +
      `📅 *Fecha:* ${today}\n` +
      `📊 *Resumen:* ${completed} de ${clientServices.length} servicios completados\n` +
      `👷 *Técnico Responsable:* ${technicianName}\n\n` +
      `📋 *SERVICIOS REGISTRADOS:*\n` +
      clientServices
        .map(
          (s) =>
            `• ${s.date} (${s.timeSlot}) - *${s.status.toUpperCase()}*\n  Técnico: ${s.operativeName} | ${s.evidences.length} fotos de evidencia`
        )
        .join('\n\n') +
      `\n\n✨ *Gestión y Transparencia Operativa ${COMPANY_BRAND.name}*`;

    shareViaWhatsApp(text);
  };

  const handleSendServicesReportEmail = () => {
    const today = new Date().toISOString().split('T')[0];
    const totalServices = clientServices.length;
    const completedServices = clientServices.filter((s) => s.status === 'completado').length;

    const subject = `[REPORTE EJECUTIVO DE LIMPIEZA Y CALIDAD] ${clientName} - ${today}`;
    const body =
      `Estimado Equipo Directivo / Administración,\n\n` +
      `Se adjunta el reporte ejecutivo del servicio de limpieza y calidad operativa:\n\n` +
      `• Cliente / Sede: ${clientName}\n` +
      `• Fecha de Reporte: ${today}\n` +
      `• Servicios Auditados: ${completedServices} de ${totalServices} completados\n` +
      `• Técnico de Cabecera: ${technicianName} (Tel: ${technicianPhone})\n` +
      `• Incidencias Reportadas: ${clientIncidents.length}\n\n` +
      `DETALLE DE SERVICIOS:\n` +
      clientServices
        .map(
          (s) =>
            ` - ${s.date} (${s.timeSlot}) | Operador: ${s.operativeName} | Estado: ${s.status.toUpperCase()} (${s.evidences.length} evidencias)`
        )
        .join('\n') +
      `\n\nAtentamente,\nPortal de Transparencia ${COMPANY_BRAND.name}`;

    setEmailModalData({
      title: 'Compartir Reporte de Servicios',
      defaultRecipient: clientProfile?.email || 'direccion@skytower.com',
      defaultPhone: technicianPhone,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Reporte de Servicios y Calidad',
      attachmentName: `Reporte_Servicios_${today}.pdf`
    });
  };

  const handleDownloadServicesReportHTML = () => {
    const today = new Date().toISOString().split('T')[0];
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte de Servicios y Calidad - ${clientName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 35px; color: #0f172a; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand-box { display: flex; align-items: center; gap: 14px; }
    .brand-logo { width: 50px; height: 50px; object-fit: contain; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; }
    .service-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 15px; background: #f8fafc; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
    .photo-box { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; font-size: 11px; background: #fff; padding: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-box">
      <img src="${COMPANY_BRAND.logoUrl}" alt="${COMPANY_BRAND.name}" class="brand-logo" />
      <div>
        <div class="title">${COMPANY_BRAND.legalName}</div>
        <div style="color: #64748b; font-size: 13px;">Reporte Ejecutivo de Servicios y Evidencias de Calidad</div>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold;">${clientName}</div>
      <div style="color: #64748b; font-size: 12px;">Técnico Asignado: ${technicianName} • Fecha: ${today}</div>
    </div>
  </div>

  <h3>Servicios Ejecutados y Evidencias de Trabajo</h3>
  ${clientServices
    .map(
      (s) => `
    <div class="service-card">
      <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        <span>Servicio: ${s.date} (${s.timeSlot}) - Técnico: ${s.operativeName}</span>
        <span class="badge">${s.status.toUpperCase()}</span>
      </div>
      <div class="grid">
        ${s.evidences
          .map(
            (ev) => `
          <div class="photo-box">
            <strong>${ev.area}</strong> (${ev.timestamp})<br>
            <div style="color: #64748b; font-size: 10px; margin-top: 3px;">${ev.notes || 'Evidencia de trabajo realizada'}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;

    exportToHTMLPDF(`Reporte_Servicios_${clientName.replace(/\s+/g, '_')}_${today}`, html);
  };

  // --- EXPORT & SHARE: 3-DAY SUPPLY REPORT ---
  const handleExport3DayReportExcel = () => {
    if (!currentReport) return;
    const headers = ['Insumo', 'Stock Inicial', 'Consumido (3 Días)', 'Stock Restante', 'Unidad', 'Pedido Sugerido'];
    const rows = currentReport.items.map((i) => [
      i.supplyName,
      i.initialStock,
      (i as any).consumed ?? (i as any).consumed3Days ?? 0,
      (i as any).remainingStock ?? 0,
      i.unit,
      (i as any).recommendedOrder ?? (i as any).suggestedReorder ?? 0
    ]);
    exportToExcel(`Reporte_Insumos_3Dias_${clientName.replace(/\s+/g, '_')}`, headers, rows);
  };

  const handleShare3DayReportWhatsApp = () => {
    if (!currentReport) return;
    const period = (currentReport as any).period || `${currentReport.periodStart} al ${currentReport.periodEnd}`;
    const text =
      `📦 *BALANCE DE CONSUMO DE INSUMOS (3 DÍAS) - ${COMPANY_BRAND.name.toUpperCase()}*\n` +
      `📍 *Cliente:* ${clientName}\n` +
      `🗓️ *Período:* ${period}\n` +
      `👮 *Auditor:* ${(currentReport as any).supervisorName || 'Ing. Marco Valdés'}\n\n` +
      `📊 *ESTADO DE EXISTENCIAS Y REPOSICIÓN:*\n` +
      currentReport.items
        .map(
          (i) =>
            `• *${i.supplyName}*\n  Existencia: ${(i as any).remainingStock ?? 0} ${i.unit} | 🛒 Pedido sugerido: *${(i as any).recommendedOrder ?? 0} ${i.unit}*`
        )
        .join('\n\n') +
      `\n\n💬 *Portal de Suministros ${COMPANY_BRAND.name}*`;

    shareViaWhatsApp(text);
  };

  const handleSend3DayReportEmail = () => {
    if (!currentReport) return;
    const period = (currentReport as any).period || `${currentReport.periodStart} al ${currentReport.periodEnd}`;
    const subject = `[INFORME DE CONSUMO DE INSUMOS] ${clientName} - Ciclo (${period})`;
    const body =
      `Estimado Departamento de Compras / Administración,\n\n` +
      `Se remite el informe de consumo y sugerencias de reabastecimiento de insumos:\n\n` +
      `• Sede: ${clientName}\n` +
      `• Período: ${period}\n` +
      `• Supervisor / Auditor: ${(currentReport as any).supervisorName || 'Ing. Marco Valdés'}\n\n` +
      `BALANCE DE INVENTARIO Y REPOSICIÓN:\n` +
      currentReport.items
        .map(
          (i) =>
            ` - ${i.supplyName}: Restante ${(i as any).remainingStock ?? 0} ${i.unit} (Sugerencia pedido: ${(i as any).recommendedOrder ?? 0} ${i.unit})`
        )
        .join('\n') +
      `\n\nAtentamente,\nPortal de Gestión de Insumos ${COMPANY_BRAND.name}`;

    setEmailModalData({
      title: 'Enviar Informe de Insumos (3 Días)',
      defaultRecipient: 'compras@skytower.com',
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Consumo de Insumos (3 Días)',
      attachmentName: `Consumo_Insumos_${currentReport.id || 'Ciclo'}.pdf`
    });
  };

  const handleDownload3DayReportHTML = () => {
    if (!currentReport) return;
    const period = (currentReport as any).period || `${currentReport.periodStart} al ${currentReport.periodEnd}`;
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Informe de Consumo de Insumos - ${period}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 35px; color: #0f172a; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .brand-box { display: flex; align-items: center; gap: 14px; }
    .brand-logo { width: 50px; height: 50px; object-fit: contain; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
    td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-box">
      <img src="${COMPANY_BRAND.logoUrl}" alt="${COMPANY_BRAND.name}" class="brand-logo" />
      <div>
        <div class="title">${COMPANY_BRAND.legalName}</div>
        <div style="color: #64748b; font-size: 13px;">Informe de Consumo y Monitoreo de Insumos (Ciclo de 3 Días)</div>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold;">${clientName}</div>
      <div style="color: #64748b; font-size: 12px;">Período: ${period}</div>
    </div>
  </div>

  <h3>Control de Existencias y Reposición Sugerida</h3>
  <table>
    <thead>
      <tr>
        <th>Insumo</th>
        <th>Stock Inicial</th>
        <th>Consumo Período</th>
        <th>Existencia Actual</th>
        <th>Unidad</th>
        <th>Pedido Sugerido</th>
      </tr>
    </thead>
    <tbody>
      ${currentReport.items
        .map(
          (i) => `
        <tr>
          <td><strong>${i.supplyName}</strong></td>
          <td>${i.initialStock}</td>
          <td>${(i as any).consumed ?? (i as any).consumed3Days ?? 0}</td>
          <td style="font-weight: bold; color: ${((i as any).remainingStock ?? 0) <= 2 ? '#dc2626' : '#0f172a'};">${(i as any).remainingStock ?? 0}</td>
          <td>${i.unit}</td>
          <td style="font-weight: bold; color: #2563eb;">${(i as any).recommendedOrder ?? (i as any).suggestedReorder ?? 0} ${i.unit}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

    exportToHTMLPDF(`Informe_Insumos_3Dias_${new Date().toISOString().split('T')[0]}`, html);
  };

  // --- EXPORT & SHARE: INCIDENTS ---
  const handleExportIncidentsExcel = () => {
    const headers = ['Folio', 'Fecha', 'Hora', 'Tipo', 'Título', 'Ubicación', 'Técnico', 'Estado', 'Resolución'];
    const rows = clientIncidents.map((i) => [
      i.id,
      i.date,
      i.time,
      i.type.replace('_', ' ').toUpperCase(),
      i.title,
      i.location,
      i.operativeName,
      i.status.toUpperCase(),
      i.adminResolution || 'En revisión operativa'
    ]);
    exportToExcel(`Incidencias_${clientName.replace(/\s+/g, '_')}`, headers, rows);
  };

  const handleShareIncidentWhatsApp = (inc: IncidentReport) => {
    const text =
      `⚠️ *REPORTE DE INCIDENCIA TÉCNICA - FOLIO ${inc.id}*\n` +
      `📍 *Ubicación:* ${inc.location} (${inc.clientName})\n` +
      `🕒 *Fecha/Hora:* ${inc.date} a las ${inc.time} hrs\n` +
      `📌 *Tipo:* ${inc.type.replace('_', ' ').toUpperCase()}\n` +
      `📝 *Título:* ${inc.title}\n` +
      `🔍 *Detalle:* ${inc.description}\n` +
      `👮 *Técnico:* ${inc.operativeName}\n` +
      (inc.adminResolution ? `✅ *Resolución:* ${inc.adminResolution}\n` : `⏳ *Estado:* En revisión\n`) +
      `\n✨ *CleanPro Control de Calidad*`;

    shareViaWhatsApp(text);
  };

  const handleSendIncidentEmail = (inc: IncidentReport) => {
    const subject = `[REPORTE DE INCIDENCIA] Folio ${inc.id} - ${inc.title}`;
    const body =
      `Estimada Administración / Mantenimiento,\n\n` +
      `Se comparte el informe de incidencia registrado en sitio:\n\n` +
      `• Folio: ${inc.id}\n` +
      `• Sede: ${inc.clientName}\n` +
      `• Ubicación: ${inc.location}\n` +
      `• Tipo: ${inc.type.replace('_', ' ').toUpperCase()}\n` +
      `• Fecha / Hora: ${inc.date} ${inc.time} hrs\n` +
      `• Reportado por Técnico: ${inc.operativeName}\n\n` +
      `DESCRIPCIÓN DEL HECHO:\n${inc.description}\n\n` +
      (inc.adminResolution ? `RESOLUCIÓN ADMINISTRATIVA:\n${inc.adminResolution}\n\n` : '') +
      `Atentamente,\nPortal del Cliente CleanPro`;

    setEmailModalData({
      title: 'Compartir Reporte de Incidencia',
      defaultRecipient: 'mantenimiento@skytower.com',
      defaultPhone: technicianPhone,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Incidencia',
      attachmentName: `Incidencia_${inc.id}.pdf`
    });
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = orderItems.filter((item) => item.quantity > 0);
    if (validItems.length === 0) return;

    onEmitSupplyRequest({
      clientId: clientProfile?.id || 'CLI-01',
      clientName: clientName,
      cycleReportId: currentReport?.id,
      items: validItems,
      notes: orderNotes,
      totalEstimatedCost: 0
    });

    setShowOrderModal(false);
    setOrderSuccessAlert(true);
    setTimeout(() => setOrderSuccessAlert(false), 4000);
  };

  const handleUpdateItemQty = (index: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Sub-Navigation Bar for Client Portal */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setClientSection('evidencias')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
              clientSection === 'evidencias'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Evidencias ({clientServices.length})</span>
          </button>

          <button
            onClick={() => setClientSection('insumos')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
              clientSection === 'insumos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Reporte 3 Días</span>
          </button>

          <button
            onClick={() => setClientSection('incidencias')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
              clientSection === 'incidencias'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Incidencias ({clientIncidents.length})</span>
          </button>

          <button
            onClick={() => setClientSection('tecnico')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all ${
              clientSection === 'tecnico'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Técnico Asignado</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClientReportModal(true)}
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-orange-200 hover:scale-[1.02]"
            title="Levantar reporte o solicitud en sitio al técnico y administración"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>+ Levantar Reporte</span>
          </button>

          {onOpenWorkflow && (
            <button
              onClick={onOpenWorkflow}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
              title="Consultar protocolo y flujo del sistema"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Flujo (PDF)</span>
            </button>
          )}

          <button
            onClick={() => downloadSystemWorkflowPDF(clientName)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
            title="Descargar protocolo oficial en PDF"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Descargar Flujo PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>{clientName}</span>
          </div>
        </div>
      </div>

      {/* 1. SECCIÓN: EVIDENCIAS DE TRABAJO */}
      {clientSection === 'evidencias' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Evidencias de Trabajo y Calidad
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Comprobación fotográfica del antes y después de cada servicio ejecutado en tus instalaciones
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareServicesWhatsApp}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Compartir resumen por WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>

              <button
                onClick={handleSendServicesReportEmail}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Compartir reporte de servicios por correo"
              >
                <Mail className="w-3.5 h-3.5" /> Correo
              </button>

              <button
                onClick={handleExportServicesExcel}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Exportar bitácora a Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (CSV)
              </button>

              <button
                onClick={handleDownloadServicesReportHTML}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> HTML
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
              </button>
            </div>
          </div>

          {/* Evidence Grid by Service */}
          <div className="space-y-6">
            {clientServices.map((service, sIdx) => (
              <div
                key={service.id || `client-srv-${sIdx}`}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base md:text-lg">
                        Servicio: {service.date} ({service.timeSlot})
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Técnico Operativo: <strong className="text-slate-700">{service.operativeName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        const srvInc = incidents.filter((i) => i.serviceId === service.id || (i.clientName === service.clientName && i.date === service.date));
                        shareServiceReportWithEvidencesViaWhatsApp(service, clientProfile, srvInc);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Compartir reporte por WhatsApp con fotos y firmas"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp c/ Fotos
                    </button>

                    <button
                      onClick={() => {
                        const srvInc = incidents.filter((i) => i.serviceId === service.id || (i.clientName === service.clientName && i.date === service.date));
                        downloadHistoricalAuditPDF(service, clientProfile, srvInc);
                      }}
                      className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Descargar Expediente de Auditoría y Resguardo Inmutable (PDF)"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-700" /> Expediente PDF
                    </button>

                    <button
                      onClick={() => {
                        setVaultInitialServiceId(service.id);
                        setShowHistoricalVault(true);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ver en Bóveda Histórica"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Bóveda
                    </button>

                    <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase">
                      {service.status === 'completado' ? 'Completado y Auditado' : 'En Ejecución'}
                    </span>
                  </div>
                </div>

                {/* Photo Evidence Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {service.evidences.map((ev, evIdx) => (
                    <div
                      key={ev.id || `client-ev-${service.id}-${evIdx}`}
                      onClick={() => setViewingEvidence(ev)}
                      className="group p-3.5 rounded-2xl border border-slate-100 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-xs"
                    >
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                        <img
                          src={ev.afterPhotoUrl || ev.beforePhotoUrl}
                          alt={ev.area}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {ev.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{ev.area}</h4>
                        <span className="text-xs text-blue-600 font-semibold group-hover:underline">
                          Comparativa →
                        </span>
                      </div>
                      {ev.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECCIÓN: REPORTE DE 3 DÍAS Y PEDIDO DE INSUMOS */}
      {clientSection === 'insumos' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" /> Monitoreo y Suministro
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Consumo y Reabastecimiento de Insumos
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Informe de inventario en tus instalaciones con solicitud directa de reposición de insumos
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
              >
                <Plus className="w-4 h-4" /> Solicitar Suministro
              </button>

              <button
                onClick={handleShare3DayReportWhatsApp}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>

              <button
                onClick={handleSend3DayReportEmail}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Mail className="w-3.5 h-3.5" /> Correo
              </button>

              <button
                onClick={handleExport3DayReportExcel}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (CSV)
              </button>

              <button
                onClick={handleDownload3DayReportHTML}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> HTML
              </button>
            </div>
          </div>

          {orderSuccessAlert && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              Tu requerimiento de insumos ha sido emitido con éxito a la central de CleanPro.
            </div>
          )}

          {/* Current 3-Day Report Card */}
          {currentReport && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    {(currentReport as any).reportName || `Reporte de Consumo (Ciclo #${currentReport.cycleNumber || '28'})`}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Período auditado: {(currentReport as any).period || `${currentReport.periodStart} al ${currentReport.periodEnd}`} • Supervisado por:{' '}
                    <strong className="text-slate-700">{(currentReport as any).supervisorName || 'Ing. Marco Valdés (Auditor de Calidad)'}</strong>
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase self-start sm:self-auto">
                  Reporte Vigente
                </span>
              </div>

              {/* Items Inventory Status (Quantities only, NO prices) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentReport.items.map((item, itemIdx) => {
                  const remaining = (item as any).remainingStock ?? (item as any).currentRemaining ?? 0;
                  const initial = item.initialStock || 1;
                  const percent = Math.min(100, Math.max(0, Math.round((remaining / initial) * 100)));
                  const isCriticallyLow = percent < 30;
                  const consumed = (item as any).consumed ?? (item as any).consumed3Days ?? 0;

                  return (
                    <div
                      key={`report-item-${item.supplyName}-${itemIdx}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCriticallyLow
                          ? 'bg-orange-50/40 border-orange-200'
                          : 'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.unit}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isCriticallyLow
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {isCriticallyLow ? 'Reposición Sugerida' : 'Nivel Adecuado'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm mb-1">{item.supplyName}</h4>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Restante en Sitio:</span>
                          <span className="text-slate-800 font-bold">
                            {remaining} / {initial} {item.unit}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCriticallyLow ? 'bg-orange-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                          <span>Consumido: {consumed} {item.unit}</span>
                          <span className="font-medium">{percent}% restante</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Reorder Summary */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm md:text-base">
                    Sugerencia Operativa de Reposición:
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {currentReport.items
                      .filter((i) => ((i as any).recommendedOrder ?? (i as any).suggestedReorder ?? 0) > 0)
                      .map((i) => `${(i as any).recommendedOrder ?? (i as any).suggestedReorder} ${i.unit} de ${i.supplyName}`)
                      .join(' • ')}
                  </p>
                </div>

                <button
                  onClick={() => setShowOrderModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" /> Solicitar este Lote
                </button>
              </div>
            </div>
          )}

          {/* Supply Requests History */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base md:text-lg">
              Historial de Requerimientos de Insumos Emitidos
            </h3>

            <div className="space-y-3">
              {supplyRequests.map((req, reqIdx) => (
                <div
                  key={req.id || `client-req-${reqIdx}`}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{req.id}</span>
                      <span className="text-xs text-slate-400">({req.requestDate})</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          req.status === 'despachado'
                            ? 'bg-green-100 text-green-700'
                            : req.status === 'aprobado'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {req.status === 'despachado'
                          ? 'Despachado en Sede'
                          : req.status === 'aprobado'
                          ? 'Aprobado para Entrega'
                          : 'Pendiente de Aprobación'}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 font-medium">
                      {req.items.map((i) => `${i.quantity} ${i.unit} de ${i.supplyName}`).join(' • ')}
                    </p>
                    {req.notes && (
                      <p className="text-xs text-slate-400 italic mt-1">Nota: {req.notes}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                      {req.items.reduce((sum, item) => sum + item.quantity, 0)} unidades solicitadas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SECCIÓN: INCIDENCIAS TÉCNICAS */}
      {clientSection === 'incidencias' && (() => {
        const pendingCount = clientIncidents.filter((i) => i.status !== 'resuelto').length;
        const resolvedCount = clientIncidents.filter((i) => i.status === 'resuelto').length;
        const filteredIncidents = clientIncidents.filter((i) => {
          if (incidentFilter === 'pendientes') return i.status !== 'resuelto';
          if (incidentFilter === 'resueltos') return i.status === 'resuelto';
          return true;
        });

        return (
          <div className="space-y-6">
            {/* Header with Metrics & Actions */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                    Incidencias y Solicitudes en Sitio
                  </h2>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Levantamiento de reportes directos con notificación a tu técnico asignado y verificación de solución con evidencia fotográfica
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowClientReportModal(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-orange-200 hover:scale-[1.02]"
                  >
                    <AlertTriangle className="w-4 h-4 text-white" />
                    + Levantar Reporte en Sitio
                  </button>
                  <button
                    onClick={handleExportIncidentsExcel}
                    className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar (CSV)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir
                  </button>
                </div>
              </div>

              {/* Status Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setIncidentFilter('all')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    incidentFilter === 'all'
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Reportes
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {clientIncidents.length}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Registrados en historial</span>
                </div>

                <div
                  onClick={() => setIncidentFilter('pendientes')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    incidentFilter === 'pendientes'
                      ? 'bg-orange-50/70 border-orange-300 ring-2 ring-orange-500/20'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
                      Pendientes de Solución
                    </span>
                    {pendingCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    )}
                  </div>
                  <span className="text-2xl font-black text-orange-600 mt-1 block">
                    {pendingCount}
                  </span>
                  <span className="text-xs text-orange-700 font-medium">
                    {pendingCount > 0 ? 'Técnico y Admin notificados' : 'Sin reportes pendientes'}
                  </span>
                </div>

                <div
                  onClick={() => setIncidentFilter('resueltos')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    incidentFilter === 'resueltos'
                      ? 'bg-green-50/70 border-green-300 ring-2 ring-green-500/20'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 block">
                    Resueltas con Evidencia
                  </span>
                  <span className="text-2xl font-black text-green-700 mt-1 block">
                    {resolvedCount}
                  </span>
                  <span className="text-xs text-green-700 font-medium">Con foto de solución validada</span>
                </div>
              </div>
            </div>

            {/* Incident Cards Grid */}
            {filteredIncidents.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">
                  {incidentFilter === 'pendientes'
                    ? '¡No hay reportes pendientes!'
                    : 'No hay registros en esta categoría.'}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Si detectas cualquier necesidad en tus instalaciones, puedes levantar un reporte directo usando el botón superior.
                </p>
                <button
                  onClick={() => setShowClientReportModal(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Levantar Reporte en Sitio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredIncidents.map((inc, incIdx) => {
                  const isResolved = inc.status === 'resuelto';

                  return (
                    <div
                      key={inc.id || `client-inc-${incIdx}`}
                      className={`bg-white p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
                        isResolved
                          ? 'border-green-200/80 hover:border-green-300'
                          : 'border-orange-200 hover:border-orange-300 ring-1 ring-orange-100'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {inc.origin === 'cliente' ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                              <User className="w-3 h-3 text-blue-600" /> Solicitud de Cliente
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              Hallazgo Operativo
                            </span>
                          )}

                          {inc.priority && (
                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                inc.priority === 'urgente'
                                  ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                  : inc.priority === 'alta'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {inc.priority}
                            </span>
                          )}

                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            #{inc.id}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isResolved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isResolved ? '✅ Resuelto y Verificado' : '⏳ Pendiente de Solución'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{inc.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{inc.description}</p>
                      </div>

                      {/* Location & Personnel Info */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600 space-y-1.5 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span><strong>Ubicación:</strong> {inc.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span><strong>Técnico Asignado:</strong> {inc.operativeName} {assignedEmployee?.phone ? `• Tel: ${assignedEmployee.phone}` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Reportado el {inc.date} a las {inc.time} hrs</span>
                        </div>
                      </div>

                      {/* RESOLUTION STATUS WITH EVIDENCE SECTION */}
                      {isResolved ? (
                        <div className="p-4 rounded-2xl bg-green-50/80 border border-green-200 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-green-900 flex items-center gap-1.5 uppercase text-[11px]">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Solución Confirmada en Sitio
                            </span>
                            {inc.resolvedAt && (
                              <span className="text-[10px] text-green-700 font-medium">
                                {inc.resolvedAt}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-green-950 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-green-100">
                            <strong>Dictamen:</strong> "{inc.resolutionNotes || inc.adminResolution}"
                          </p>

                          {inc.resolvedBy && (
                            <div className="text-[11px] text-green-800">
                              Atendido por: <strong>{inc.resolvedBy}</strong> ({inc.resolvedByRole === 'operativo' ? 'Técnico en Campo' : 'Dirección Operativa'})
                            </div>
                          )}

                          {/* Resolution Photo Evidence */}
                          {inc.resolutionPhotoUrl && (
                            <div className="pt-2 border-t border-green-200/80">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 block mb-1.5">
                                📸 Evidencia de Solución (Foto Después):
                              </span>
                              <div
                                onClick={() =>
                                  setViewingEvidence({
                                    id: `res-${inc.id}`,
                                    serviceId: inc.serviceId,
                                    clientName: inc.clientName,
                                    serviceType: 'Solución a Reporte',
                                    type: 'despues',
                                    photoUrl: inc.resolutionPhotoUrl!,
                                    timestamp: inc.resolvedAt || inc.time,
                                    location: inc.location,
                                    notes: inc.resolutionNotes || 'Atención realizada con éxito'
                                  })
                                }
                                className="relative rounded-xl overflow-hidden border-2 border-green-400 bg-slate-900 h-36 cursor-pointer group shadow-xs"
                              >
                                <img
                                  src={inc.resolutionPhotoUrl}
                                  alt="Solución"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-end p-2">
                                  <span className="text-[10px] font-bold text-white bg-green-700/90 backdrop-blur-xs px-2 py-0.5 rounded-md">
                                    Ver Foto de Solución en Grande
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                          <span className="font-bold flex items-center gap-1 text-[11px] uppercase">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> En Proceso de Atención
                          </span>
                          <p className="text-[11px] text-amber-800">
                            Tu técnico asignado <strong>{inc.operativeName}</strong> y el administrador han recibido esta solicitud. Tan pronto acudan a resolverla, registrarán la evidencia fotográfica aquí.
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleShareIncidentWhatsApp(inc)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                          </button>
                          <button
                            onClick={() => handleSendIncidentEmail(inc)}
                            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5" /> Correo
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedIncidentForReport(inc)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" /> Reporte Oficial PDF
                          </button>
                          {inc.photoUrl && (
                            <button
                              onClick={() => setViewingIncident(inc)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Foto Inicial
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* 4. SECCIÓN: TÉCNICO ASIGNADO */}
      {clientSection === 'tecnico' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              Personal Técnico Asignado a tu Sede
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Personal operativo oficial asignado por la administración para el mantenimiento de tus instalaciones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Assigned Technician Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-200 shrink-0">
                  {technicianName.charAt(0)}
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase mb-1">
                    <UserCheck className="w-3 h-3" /> Técnico Asignado
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{technicianName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{technicianRole}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Teléfono Directo:</span>
                  <span className="font-bold text-slate-900">{technicianPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Frecuencia de Atención:</span>
                  <span className="font-bold text-slate-900">
                    {clientProfile?.contractFrequency || 'Lunes, Miércoles y Viernes'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Supervisión:</span>
                  <span className="font-bold text-blue-600">CleanPro Calidad Certificada</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    const text = `Hola ${technicianName}, te contacto desde ${clientName} para coordinar el servicio de limpieza.`;
                    shareViaWhatsApp(text, technicianPhone);
                  }}
                  className="w-full sm:w-1/2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-200 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat por WhatsApp</span>
                </button>

                <a
                  href={`tel:${cleanPhoneNumber(technicianPhone)}`}
                  className="w-full sm:w-1/2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-200 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Llamar al Técnico</span>
                </a>
              </div>
            </div>

            {/* Protocol & Guidelines Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Protocolo de Confianza y Seguridad
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Todo el personal de CleanPro cuenta con identificación oficial, verificación de antecedentes, seguro de responsabilidad civil y capacitación continua en desinfección hospitalaria y corporativa.
              </p>

              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Check-in fotográfico con geolocalización al iniciar y finalizar turno.</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Kit de químicos sellados y certificados para cuidado de mobiliario.</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Soporte 24/7 con la administración central ante cualquier eventualidad.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Emit Supply Request */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              Emitir Requerimiento de Insumos
            </h3>
            <p className="text-xs text-slate-400 mb-5 font-medium">
              Ajusta las cantidades con base en el informe de 3 días para su despacho
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {orderItems.map((item, idx) => (
                  <div
                    key={`order-item-${item.supplyName}-${idx}`}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 text-sm block">
                        {item.supplyName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Unidad: {item.unit}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, -1)}
                        className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, 1)}
                        className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white flex items-center justify-center cursor-pointer shadow-sm shadow-blue-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Instrucciones o notas de entrega:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entregar en piso 8 con la asistente de recepción"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-semibold text-xs md:text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200"
                >
                  <Send className="w-4 h-4" /> Confirmar Solicitud
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

      {/* Incident Official Report Modal */}
      {selectedIncidentForReport && (
        <IncidentReportModal
          incident={selectedIncidentForReport}
          onClose={() => setSelectedIncidentForReport(null)}
        />
      )}

      {/* Email Sender Modal */}
      <EmailSenderModal
        data={emailModalData}
        isOpen={!!emailModalData}
        onClose={() => setEmailModalData(null)}
      />

      {/* Client Report Creation Modal */}
      <ClientReportModal
        isOpen={showClientReportModal}
        onClose={() => setShowClientReportModal(false)}
        clientName={clientName}
        clientProfile={clientProfile}
        assignedEmployee={assignedEmployee}
        onSubmit={(incData) => {
          if (onClientReportIncident) {
            onClientReportIncident(incData);
          }
        }}
      />

      {/* BÓVEDA DE RESGUARDO HISTÓRICO & AUDITORÍA MODAL */}
      <HistoricalAuditModal
        isOpen={showHistoricalVault}
        onClose={() => setShowHistoricalVault(false)}
        services={clientServices}
        clients={clientProfile ? [clientProfile] : []}
        incidents={clientIncidents}
        initialServiceId={vaultInitialServiceId}
        onOpenEvidenceViewer={(ev) => setViewingEvidence(ev)}
      />
    </div>
  );
};
