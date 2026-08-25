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
  Mail
} from 'lucide-react';
import {
  CleaningService,
  IncidentReport,
  Cycle3DayReport,
  SupplyRequest,
  PhotoEvidence
} from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';
import { IncidentReportModal } from '../../common/IncidentReportModal';
import { EmailSenderModal, EmailModalData } from '../../common/EmailSenderModal';

interface ClientDashboardProps {
  activeTab: string;
  services: CleaningService[];
  incidents: IncidentReport[];
  cycleReports: Cycle3DayReport[];
  supplyRequests: SupplyRequest[];
  clientName: string;
  onEmitSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeTab,
  services,
  incidents,
  cycleReports,
  supplyRequests,
  clientName,
  onEmitSupplyRequest
}) => {
  const [viewingEvidence, setViewingEvidence] = useState<any | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);
  const [selectedIncidentForReport, setSelectedIncidentForReport] = useState<IncidentReport | null>(null);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

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
  const clientServices = services.filter((s) => s.clientName.includes(clientName) || s.clientName.includes('SkyTower'));
  const clientIncidents = incidents.filter((i) => i.clientName.includes(clientName) || i.clientName.includes('SkyTower'));
  const currentReport = cycleReports[0] || cycleReports[0];

  const handleSendServicesReportEmail = () => {
    const today = new Date().toISOString().split('T')[0];
    const totalServices = clientServices.length;
    const completedServices = clientServices.filter((s) => s.status === 'completado').length;

    const subject = `[REPORTE EJECUTIVO DE LIMPIEZA Y CALIDAD] ${clientName || 'SkyTower'} - ${today}`;
    const body = `Estimado Equipo Directivo / Administración,\n\n` +
      `Se adjunta el reporte ejecutivo del servicio de limpieza y calidad operativa:\n\n` +
      `• Cliente / Sede: ${clientName || 'Oficinas Corporativas SkyTower'}\n` +
      `• Fecha de Reporte: ${today}\n` +
      `• Servicios Auditados: ${completedServices} de ${totalServices} completados\n` +
      `• Incidencias Reportadas: ${clientIncidents.length}\n\n` +
      `DETALLE DE SERVICIOS:\n` +
      clientServices.map((s) => ` - ${s.date} (${s.timeSlot}) | Operador: ${s.operativeName} | Estado: ${s.status.toUpperCase()}`).join('\n') +
      `\n\nAtentamente,\nPortal de Transparencia CleanPro Servicios Integrales`;

    setEmailModalData({
      title: 'Compartir Reporte de Servicios por Correo',
      defaultRecipient: 'direccion@cliente.com',
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
  <title>Reporte de Servicios y Calidad - ${clientName || 'SkyTower'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 35px; color: #0f172a; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .title { font-size: 24px; font-weight: 800; color: #2563eb; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; }
    .service-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 15px; background: #f8fafc; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
    .photo-box { border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; font-size: 11px; background: #fff; padding: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">CleanPro Servicios Integrales</div>
      <div style="color: #64748b; font-size: 14px;">Reporte Ejecutivo de Servicios y Evidencias de Calidad</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold;">${clientName || 'Oficinas Corporativas SkyTower'}</div>
      <div style="color: #64748b; font-size: 12px;">Fecha: ${today}</div>
    </div>
  </div>

  <h3>Servicios Ejecutados y Evidencias de Trabajo</h3>
  ${clientServices.map((s) => `
    <div class="service-card">
      <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
        <span>Servicio: ${s.date} (${s.timeSlot}) - Técnico: ${s.operativeName}</span>
        <span class="badge">${s.status.toUpperCase()}</span>
      </div>
      <div class="grid">
        ${s.evidences.map((ev) => `
          <div class="photo-box">
            <strong>${ev.area}</strong> (${ev.timestamp})<br>
            <div style="color: #64748b; font-size: 10px; margin-top: 3px;">${ev.notes || 'Evidencia de trabajo realizada'}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Calidad_Servicios_${today}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend3DayReportEmail = () => {
    if (!currentReport) return;
    const period = (currentReport as any).period || `${currentReport.periodStart} al ${currentReport.periodEnd}`;
    const subject = `[INFORME DE CONSUMO DE INSUMOS] ${clientName || 'SkyTower'} - Ciclo (${period})`;
    const body = `Estimado Departamento de Compras / Administración,\n\n` +
      `Se remite el informe de consumo y sugerencias de reabastecimiento de insumos:\n\n` +
      `• Sede: ${clientName || 'Oficinas Corporativas SkyTower'}\n` +
      `• Período: ${period}\n` +
      `• Supervisor: ${(currentReport as any).supervisorName || 'Ing. Marco Valdés'}\n\n` +
      `BALANCE DE INVENTARIO Y REPOSICIÓN:\n` +
      currentReport.items.map((i) => ` - ${i.supplyName}: Restante ${(i as any).remainingStock ?? 0} ${i.unit} (Sugerencia pedido: ${(i as any).recommendedOrder ?? 0} ${i.unit})`).join('\n') +
      `\n\nAtentamente,\nPortal de Gestión de Insumos CleanPro`;

    setEmailModalData({
      title: 'Enviar Informe de Consumo de Insumos por Correo',
      defaultRecipient: 'compras@cliente.com',
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
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .title { font-size: 22px; font-weight: 800; color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
    td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">CleanPro Servicios Integrales</div>
      <div style="color: #64748b; font-size: 13px;">Informe de Consumo y Monitoreo de Insumos (Ciclo de 3 Días)</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold;">${clientName || 'Oficinas Corporativas SkyTower'}</div>
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
      ${currentReport.items.map((i) => `
        <tr>
          <td><strong>${i.supplyName}</strong></td>
          <td>${i.initialStock}</td>
          <td>${(i as any).consumed ?? (i as any).consumed3Days ?? 0}</td>
          <td style="font-weight: bold; color: ${((i as any).remainingStock ?? 0) <= 2 ? '#dc2626' : '#0f172a'};">${(i as any).remainingStock ?? 0}</td>
          <td>${i.unit}</td>
          <td style="font-weight: bold; color: #2563eb;">${(i as any).recommendedOrder ?? (i as any).suggestedReorder ?? 0} ${i.unit}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Insumos_3Dias_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendIncidentEmail = (inc: IncidentReport) => {
    const subject = `[REPORTE DE INCIDENCIA] Folio ${inc.id} - ${inc.title}`;
    const body = `Estimada Administración / Mantenimiento,\n\n` +
      `Se comparte el informe de incidencia registrado en sitio:\n\n` +
      `• Folio: ${inc.id}\n` +
      `• Ubicación: ${inc.location}\n` +
      `• Tipo: ${inc.type.replace('_', ' ').toUpperCase()}\n` +
      `• Fecha / Hora: ${inc.date} ${inc.time} hrs\n` +
      `• Reportado por Técnico: ${inc.operativeName}\n\n` +
      `DESCRIPCIÓN DEL HECHO:\n${inc.description}\n\n` +
      `Atentamente,\nPortal del Cliente CleanPro`;

    setEmailModalData({
      title: 'Compartir Reporte de Incidencia por Correo',
      defaultRecipient: 'mantenimiento@cliente.com',
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
      clientId: 'CLI-01',
      clientName: clientName || 'Oficinas Corporativas SkyTower',
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
      {/* 1. EVIDENCIAS DE TRABAJO */}
      {activeTab === 'evidencias_cliente' && (
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
              <span className="text-xs md:text-sm font-semibold px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl">
                Sede: SkyTower Piso 8
              </span>
              <button
                onClick={handleSendServicesReportEmail}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Compartir reporte de servicios por correo"
              >
                <Mail className="w-3.5 h-3.5" /> Enviar por Correo
              </button>
              <button
                onClick={handleDownloadServicesReportHTML}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Descargar Reporte (HTML)
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
                        Técnico Operativo: {service.operativeName}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase self-start sm:self-auto">
                    {service.status === 'completado' ? 'Completado y Auditado' : 'En Ejecución'}
                  </span>
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

          {/* Incidents Section */}
          {clientIncidents.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    Notificaciones de Incidencias Operativas
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientIncidents.map((inc, incIdx) => (
                  <div
                    key={inc.id || `client-inc-${incIdx}`}
                    className="p-4 rounded-2xl border border-orange-100 bg-orange-50/20 hover:bg-orange-50/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                        {inc.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{inc.time}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{inc.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-orange-100 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">{inc.location}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSendIncidentEmail(inc)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Enviar Notificación por Correo"
                        >
                          <Mail className="w-3.5 h-3.5" /> Correo
                        </button>
                        <button
                          onClick={() => setSelectedIncidentForReport(inc)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ver / Exportar Reporte Técnico PDF"
                        >
                          <Printer className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button
                          onClick={() => setViewingIncident(inc)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Foto
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. REPORTE CADA 3 DÍAS Y PEDIDO DE INSUMOS */}
      {activeTab === 'insumos_cliente' && (
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

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
              >
                <Plus className="w-4 h-4" /> Solicitar Suministro Faltante
              </button>
              <button
                onClick={handleSend3DayReportEmail}
                className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
                title="Enviar reporte de consumo por correo"
              >
                <Mail className="w-4 h-4" /> Enviar por Correo
              </button>
              <button
                onClick={handleDownload3DayReportHTML}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" /> Descargar Reporte (HTML)
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" /> Imprimir / PDF
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

              {/* Recommended Reorder Summary (Quantities ONLY) */}
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
    </div>
  );
};
