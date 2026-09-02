import React, { useState } from 'react';
import { X, Printer, Download, MapPin, Clock, Calendar, User, ShieldAlert, CheckCircle, Mail } from 'lucide-react';
import { IncidentReport } from '../../types';
import { EmailSenderModal, EmailModalData } from './EmailSenderModal';
import { COMPANY_BRAND } from '../../constants/branding';

interface IncidentReportModalProps {
  incident: IncidentReport | null;
  onClose: () => void;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  incident,
  onClose
}) => {
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

  if (!incident) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenEmailModal = () => {
    const subject = `[REPORTE DE INCIDENCIA] ${incident.id} - ${incident.title} (${incident.clientName})`;
    const body = `Estimado equipo / Cliente,\n\nSe comparte el Reporte Técnico Oficial de Incidencia levantado en campo:\n\n` +
      `• Folio de Acta: ${incident.id}\n` +
      `• Cliente / Sede: ${incident.clientName}\n` +
      `• Servicio ID: ${incident.serviceId}\n` +
      `• Ubicación Exacta: ${incident.location}\n` +
      `• Tipo de Incidencia: ${incident.type.toUpperCase().replace('_', ' ')}\n` +
      `• Título: ${incident.title}\n` +
      `• Fecha y Hora: ${incident.date} a las ${incident.time} hrs\n` +
      `• Técnico Responsable: ${incident.operativeName}\n` +
      `• Estado Actual: ${incident.status === 'resuelto' ? 'RESUELTO / VALIDADO' : 'EN REVISIÓN'}\n\n` +
      `DESCRIPCIÓN DEL HECHO:\n${incident.description}\n\n` +
      (incident.adminResolution ? `DICTAMEN ADMINISTRATIVO:\n${incident.adminResolution}\n\n` : '') +
      `Atentamente,\n${COMPANY_BRAND.legalName}\n${COMPANY_BRAND.address} • Tel: ${COMPANY_BRAND.phone}`;

    setEmailModalData({
      title: 'Enviar Reporte de Incidencia por Correo',
      defaultRecipient: COMPANY_BRAND.email,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Incidencia',
      attachmentName: `Acta_Incidencia_${incident.id}.pdf`
    });
  };

  const handleDownloadReport = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Técnico de Incidencia - ${incident.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; align-items: center; }
    .brand-flex { display: flex; align-items: center; gap: 16px; }
    .logo-img { width: 56px; height: 56px; object-fit: contain; }
    .logo { font-size: 22px; font-weight: 800; color: #0f172a; }
    .folio-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 20px; border-radius: 12px; text-align: right; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ffedd5; color: #9a3412; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0; }
    .meta-item label { display: block; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .meta-item strong { font-size: 14px; color: #0f172a; }
    .section-title { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 24px; margin-bottom: 8px; }
    .content-box { border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; background: #ffffff; }
    .photo-box { margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; text-align: center; max-height: 350px; background: #0f172a; }
    .photo-box img { max-height: 350px; max-width: 100%; object-fit: contain; }
    .resolution-box { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 16px; border-radius: 12px; margin-top: 20px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; }
    .sig-line { border-bottom: 1px solid #94a3b8; padding-bottom: 4px; font-weight: 600; margin-bottom: 4px; }
    .sig-label { font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand-flex">
      <img src="${COMPANY_BRAND.logoUrl}" alt="${COMPANY_BRAND.name}" class="logo-img" />
      <div>
        <div class="logo">${COMPANY_BRAND.legalName}</div>
        <div style="font-size: 13px; color: #64748b;">Reporte Técnico Oficial de Incidencias Operativas</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">RFC: ${COMPANY_BRAND.taxId} • ${COMPANY_BRAND.address}</div>
      </div>
    </div>
    <div class="folio-box">
      <div style="font-size: 10px; color: #64748b; font-weight: 700;">FOLIO DE ACTA</div>
      <div style="font-size: 18px; font-weight: 800; font-family: monospace;">${incident.id}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${incident.date} • ${incident.time} hrs</div>
    </div>
  </div>

  <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <span class="badge">${incident.type.toUpperCase().replace('_', ' ')}</span>
      <h2 style="margin: 8px 0 0 0; font-size: 18px; color: #0f172a;">${incident.title}</h2>
    </div>
    <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; color: ${incident.status === 'resuelto' ? '#166534' : '#9a3412'};">
      ${incident.status === 'resuelto' ? 'Resuelto / Validado' : 'En Revisión'}
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <label>Cliente / Instalación</label>
      <strong>${incident.clientName}</strong>
      <div style="font-size: 11px; color: #64748b; font-family: monospace;">Servicio ID: ${incident.serviceId}</div>
    </div>
    <div class="meta-item">
      <label>Ubicación Exacta en Sitio</label>
      <strong>${incident.location}</strong>
    </div>
    <div class="meta-item">
      <label>Hora y Fecha de Detección</label>
      <strong>${incident.time} hrs (${incident.date})</strong>
    </div>
    <div class="meta-item">
      <label>Técnico Operativo Responsable</label>
      <strong>${incident.operativeName}</strong>
    </div>
    ${incident.origin === 'cliente' ? `
    <div class="meta-item" style="grid-column: span 2; background: #eff6ff; padding: 8px 12px; border-radius: 8px;">
      <label style="color: #1d4ed8;">ORIGEN DEL REPORTE</label>
      <strong style="color: #1e3a8a;">Solicitud Levantada Directamente por Cliente en Sitio (Prioridad: ${(incident.priority || 'Normal').toUpperCase()})</strong>
    </div>
    ` : ''}
  </div>

  <div class="section-title">Descripción y Circunstancias del Hecho</div>
  <div class="content-box">
    ${incident.description}
  </div>

  <div style="display: grid; grid-template-columns: ${incident.photoUrl && incident.resolutionPhotoUrl ? '1fr 1fr' : '1fr'}; gap: 16px;">
    ${incident.photoUrl ? `
    <div>
      <div class="section-title">Evidencia Inicial (${incident.origin === 'cliente' ? 'Reporte de Cliente / Antes' : 'Detección Inicial'})</div>
      <div class="photo-box">
        <img src="${incident.photoUrl}" alt="Evidencia Inicial" />
      </div>
    </div>
    ` : ''}

    ${incident.resolutionPhotoUrl ? `
    <div>
      <div class="section-title" style="color: #166534;">Evidencia de Solución / Atención (Después)</div>
      <div class="photo-box" style="border: 2px solid #22c55e;">
        <img src="${incident.resolutionPhotoUrl}" alt="Evidencia de Solución" />
      </div>
    </div>
    ` : ''}
  </div>

  ${(incident.adminResolution || incident.resolutionNotes) ? `
  <div class="resolution-box">
    <strong style="display: block; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">
      Dictamen de Atención y Resolución:
    </strong>
    <div>${incident.resolutionNotes || incident.adminResolution}</div>
    ${incident.resolvedBy ? `<div style="font-size: 11px; margin-top: 6px; color: #166534;"><strong>Atendido por:</strong> ${incident.resolvedBy} ${incident.resolvedAt ? `el ${incident.resolvedAt}` : ''}</div>` : ''}
  </div>
  ` : ''}

  <div class="signatures">
    <div>
      <div class="sig-line">${incident.operativeName}</div>
      <div class="sig-label">Firma Técnico en Campo</div>
    </div>
    <div>
      <div class="sig-line">Dirección de Operaciones / Cliente</div>
      <div class="sig-label">Firma de Conformidad y Validación</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Automatic print trigger if desired
    };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Incidencia_${incident.id}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const typeLabels: Record<string, string> = {
    daño_previo: 'Daño Previo Detectado',
    zona_inaccesible: 'Zona Inaccesible / Bloqueada',
    falta_suministro: 'Falta de Suministro (Agua / Luz)',
    cliente_ausente: 'Sin Acceso / Cliente Ausente',
    otro: 'Incidencia Operativa'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-100 my-auto">
        {/* Modal Top Bar (Actions) */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Vista Previa de Reporte Oficial
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEmailModal}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Enviar este reporte oficial por correo electrónico"
            >
              <Mail className="w-4 h-4" />
              <span>Enviar por Correo</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar HTML / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 md:p-10 space-y-6 text-slate-800 bg-white">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={COMPANY_BRAND.logoUrl}
                    alt={COMPANY_BRAND.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {COMPANY_BRAND.legalName}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Control Operativo y Dictámenes Técnicos
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                RFC: {COMPANY_BRAND.taxId} • {COMPANY_BRAND.address}
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 sm:min-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                FOLIO DE REPORTE
              </span>
              <span className="text-lg font-extrabold text-slate-900 block font-mono">
                {incident.id}
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-1">
                Fecha: <strong>{incident.date}</strong> ({incident.time})
              </span>
            </div>
          </div>

          {/* Title and Classification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-orange-50/70 border border-orange-200 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                    {typeLabels[incident.type] || incident.type}
                  </span>
                  {incident.origin === 'cliente' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Solicitud de Cliente en Sitio
                    </span>
                  )}
                  {incident.priority && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      incident.priority === 'urgente' ? 'bg-red-100 text-red-800' : incident.priority === 'alta' ? 'bg-orange-200 text-orange-900' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {incident.priority}
                    </span>
                  )}
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 mt-0.5">
                  {incident.title}
                </h2>
              </div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                incident.status === 'resuelto' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {incident.status === 'resuelto' ? 'Resuelto / Validado' : 'En Revisión'}
              </span>
            </div>
          </div>

          {/* Service & Location Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Cliente / Instalación:
              </span>
              <strong className="text-slate-900 font-semibold text-sm md:text-base block mt-0.5">
                {incident.clientName}
              </strong>
              <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                Servicio Asociado: {incident.serviceId}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Ubicación Exacta en Sitio:
              </span>
              <strong className="text-slate-900 font-semibold text-sm md:text-base block mt-0.5">
                {incident.location}
              </strong>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Hora del Registro:
              </span>
              <span className="text-slate-800 font-medium text-sm block mt-0.5">
                {incident.time} hrs • {incident.date}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Técnico Operativo Responsable:
              </span>
              <span className="text-slate-800 font-medium text-sm block mt-0.5">
                {incident.operativeName}
              </span>
            </div>
          </div>

          {/* Detailed Observations */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Descripción y Circunstancias del Hecho:
            </h3>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm leading-relaxed">
              {incident.description}
            </div>
          </div>

          {/* Photo Evidence Grid */}
          {(incident.photoUrl || incident.resolutionPhotoUrl) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resguardo Fotográfico y Evidencias:
              </h3>
              <div className={`grid grid-cols-1 ${incident.photoUrl && incident.resolutionPhotoUrl ? 'sm:grid-cols-2' : ''} gap-4`}>
                {incident.photoUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-slate-600">
                      1. Evidencia Inicial ({incident.origin === 'cliente' ? 'Reporte del Cliente' : 'Antes'})
                    </span>
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-64 flex items-center justify-center">
                      <img
                        src={incident.photoUrl}
                        alt="Foto inicial"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {incident.resolutionPhotoUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      2. Evidencia de Solución (Después de la Atención)
                    </span>
                    <div className="rounded-2xl overflow-hidden border-2 border-green-500 bg-slate-900 h-64 flex items-center justify-center shadow-xs">
                      <img
                        src={incident.resolutionPhotoUrl}
                        alt="Foto de solución"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resolution section */}
          {(incident.adminResolution || incident.resolutionNotes) && (
            <div className="p-4.5 rounded-2xl bg-green-50/70 border border-green-200 text-sm space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-green-900 block flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-600" /> Dictamen de Atención y Solución Verificada:
              </span>
              <p className="text-green-950 font-medium leading-relaxed">
                {incident.resolutionNotes || incident.adminResolution}
              </p>
              {incident.resolvedBy && (
                <div className="text-xs text-green-800 pt-1 border-t border-green-200/60 font-medium">
                  Atendido y validado por: <strong>{incident.resolvedBy}</strong> {incident.resolvedAt ? `• ${incident.resolvedAt}` : ''}
                </div>
              )}
            </div>
          )}

          {/* Document Signatures Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-800">
                {incident.operativeName}
              </div>
              <span className="text-slate-400">Firma Técnico en Campo</span>
            </div>
            <div>
              <div className="border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-800">
                Dirección de Operaciones
              </div>
              <span className="text-slate-400">Firma y Sello de Validación</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-md shadow-slate-200"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>

      <EmailSenderModal
        data={emailModalData}
        isOpen={!!emailModalData}
        onClose={() => setEmailModalData(null)}
      />
    </div>
  );
};
