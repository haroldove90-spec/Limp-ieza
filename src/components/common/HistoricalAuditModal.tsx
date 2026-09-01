import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Camera,
  Download,
  MessageSquare,
  Mail,
  FileText,
  Clock,
  ChevronRight,
  AlertTriangle,
  FileSignature,
  X,
  ExternalLink,
  Filter,
  CheckSquare
} from 'lucide-react';
import { CleaningService, ClientProfile, IncidentReport } from '../../types';
import { COMPANY_BRAND } from '../../constants/branding';
import {
  downloadHistoricalAuditPDF,
  shareServiceReportWithEvidencesViaWhatsApp,
  generateHistoricalAuditDossierHTML
} from '../../utils/serviceOrderUtils';

interface HistoricalAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: CleaningService[];
  clients: ClientProfile[];
  incidents: IncidentReport[];
  initialServiceId?: string;
  onOpenEvidenceViewer?: (evidence: any) => void;
}

export const HistoricalAuditModal: React.FC<HistoricalAuditModalProps> = ({
  isOpen,
  onClose,
  services,
  clients,
  incidents,
  initialServiceId,
  onOpenEvidenceViewer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('ALL');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || services[0]?.id || ''
  );
  const [filterSignature, setFilterSignature] = useState<boolean | null>(null);

  if (!isOpen) return null;

  // Filter services
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.operativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.date.includes(searchTerm);

    const matchesClient =
      selectedClientId === 'ALL' || s.clientName === selectedClientId;

    const matchesSignature =
      filterSignature === null || (filterSignature ? !!s.clientSignature : !s.clientSignature);

    return matchesSearch && matchesClient && matchesSignature;
  });

  const currentService =
    services.find((s) => s.id === selectedServiceId) || filteredServices[0] || services[0];

  const currentClient = clients.find((c) => c.name === currentService?.clientName);
  const currentIncidents = incidents.filter(
    (i) => i.serviceId === currentService?.id || i.clientName === currentService?.clientName
  );

  const completedTasks = currentService?.tasks.filter((t) => t.completed).length || 0;
  const totalTasks = currentService?.tasks.length || 1;
  const progressPct = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-3xl max-w-6xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 md:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Bóveda de Resguardo Histórico y Auditoría
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                  Protección de Reclamaciones
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evidencias inmutables de entrega, firmas digitales y trazabilidad de servicios finalizados
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Claim Scenario Explanatory Banner */}
        <div className="bg-blue-50/90 border-b border-blue-100 px-6 py-3 flex items-center justify-between text-xs text-blue-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />
            <span>
              <strong>¿Reclamación de servicio posterior?</strong> (Ej. servicio realizado el lunes y reclamado el viernes): Consulta la fecha, descarga el <strong>Expediente de Conformidad en PDF</strong> o compártelo por WhatsApp con las fotos de antes/después y la firma en sitio.
            </span>
          </div>
        </div>

        {/* Modal Body: Left List + Right Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Search & Service Selector (4 cols) */}
          <div className="lg:col-span-4 bg-white border-r border-slate-200 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto max-h-[400px] lg:max-h-full">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar por folio, cliente, técnico o fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden bg-slate-50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => setFilterSignature(null)}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  filterSignature === null
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({services.length})
              </button>
              <button
                onClick={() => setFilterSignature(true)}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  filterSignature === true
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                ✍️ Con Firma
              </button>
              <button
                onClick={() => setFilterSignature(false)}
                className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                  filterSignature === false
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                ⏳ Sin Firma
              </button>
            </div>

            {/* Services List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {filteredServices.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron servicios históricos con los criterios de búsqueda.
                </div>
              ) : (
                filteredServices.map((srv) => {
                  const isSelected = srv.id === currentService?.id;
                  const srvDoneTasks = srv.tasks.filter((t) => t.completed).length;

                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-left ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black text-blue-700">
                          {srv.id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {srv.date}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-xs line-clamp-1">
                        {srv.clientName}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {srv.operativeName.split(' ')[0]}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">
                            📷 {srv.evidences.length} fotos
                          </span>
                          {srv.clientSignature ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              ✓ Firmado
                            </span>
                          ) : (
                            <span className="text-slate-400">Sin firma</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Service Dossier Details (8 cols) */}
          <div className="lg:col-span-8 p-5 sm:p-6 overflow-y-auto max-h-[600px] lg:max-h-full space-y-6">
            {currentService ? (
              <>
                {/* Dossier Header Card */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-black text-xs">
                        FOLIO: {currentService.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                        {currentService.status}
                      </span>
                      {currentService.clientSignature && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Certificado con Firma
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {currentService.clientName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>📍 {currentService.clientAddress}</span>
                      <span>•</span>
                      <span>📅 {currentService.date} ({currentService.timeSlot})</span>
                    </p>
                  </div>

                  {/* Quick Export / Defense Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        shareServiceReportWithEvidencesViaWhatsApp(
                          currentService,
                          currentClient,
                          currentIncidents
                        )
                      }
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-200 transition-all"
                      title="Compartir evidencias y reporte por WhatsApp al cliente"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp con Fotos</span>
                    </button>

                    <button
                      onClick={() =>
                        downloadHistoricalAuditPDF(
                          currentService,
                          currentClient,
                          currentIncidents
                        )
                      }
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-slate-200 transition-all"
                      title="Descargar Expediente Completo de Auditoría en PDF"
                    >
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>Descargar Expediente PDF</span>
                    </button>
                  </div>
                </div>

                {/* Audit Breakdown Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Personal Técnico</span>
                    <span className="text-sm font-bold text-slate-800 mt-1 block">👷 {currentService.operativeName}</span>
                    <span className="text-[11px] text-slate-500">Responsable operativo certificado</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Cumplimiento Checklist</span>
                    <span className="text-sm font-bold text-emerald-700 mt-1 block">
                      {completedTasks}/{totalTasks} Tareas ({progressPct}%)
                    </span>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Evidencias Registradas</span>
                    <span className="text-sm font-bold text-blue-700 mt-1 block">
                      📷 {currentService.evidences.length} Áreas Auditadas
                    </span>
                    <span className="text-[11px] text-slate-500">Con comparativo Antes/Después</span>
                  </div>
                </div>

                {/* Photo Evidences Comparison Gallery */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-slate-800 text-sm">
                        Galería de Evidencias Fotográficas de Entrega
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      {currentService.evidences.length} registros fotográficos
                    </span>
                  </div>

                  {currentService.evidences.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                      No se registraron fotos de evidencia para este turno.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentService.evidences.map((ev, idx) => (
                        <div
                          key={ev.id || idx}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              {ev.area}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {ev.timestamp}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Antes */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                                Estado Inicial (ANTES)
                              </span>
                              {ev.beforePhotoUrl ? (
                                <div
                                  onClick={() => onOpenEvidenceViewer && onOpenEvidenceViewer(ev)}
                                  className="group relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900 border border-orange-200 cursor-pointer"
                                >
                                  <img
                                    src={ev.beforePhotoUrl}
                                    alt="Antes"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2">
                                    <span className="bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                                      ANTES
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-16/10 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 text-xs">
                                  Sin foto inicial
                                </div>
                              )}
                            </div>

                            {/* Después */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                                Entrega Final (DESPUÉS)
                              </span>
                              {ev.afterPhotoUrl ? (
                                <div
                                  onClick={() => onOpenEvidenceViewer && onOpenEvidenceViewer(ev)}
                                  className="group relative aspect-16/10 rounded-xl overflow-hidden bg-slate-900 border border-emerald-200 cursor-pointer"
                                >
                                  <img
                                    src={ev.afterPhotoUrl}
                                    alt="Después"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2">
                                    <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                                      DESPUÉS
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-16/10 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 text-xs">
                                  Sin foto final
                                </div>
                              )}
                            </div>
                          </div>

                          {ev.notes && (
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                              <strong>Nota técnica:</strong> {ev.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Digital Signature on Site */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileSignature className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-slate-800 text-sm">
                        Constancia y Firma Digital de Conformidad en Sitio
                      </h4>
                    </div>
                    {currentService.clientSignature && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Certificado por Cliente
                      </span>
                    )}
                  </div>

                  {currentService.clientSignature ? (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {currentService.clientSignature.signatureDataUrl && (
                          <div className="w-28 h-14 bg-white border border-emerald-200 rounded-xl p-1 flex items-center justify-center shadow-xs">
                            <img
                              src={currentService.clientSignature.signatureDataUrl}
                              alt="Firma"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-emerald-950">
                            {currentService.clientSignature.signedBy}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Registrado el {currentService.clientSignature.signedAt}
                          </p>
                          {currentService.clientSignature.comments && (
                            <p className="text-xs text-emerald-900 mt-1 italic">
                              "{currentService.clientSignature.comments}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          Validez Legal en Sede
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <span>Este servicio aún no cuenta con firma electrónica del cliente en sitio.</span>
                    </div>
                  )}
                </div>

                {/* Checklist of Performed Tasks */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-slate-800 text-sm">
                        Protocolo de Tareas Ejecutadas
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      {completedTasks} de {totalTasks} concluidas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentService.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          task.completed
                            ? 'bg-green-50/40 border-green-200 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            task.completed ? 'text-green-600' : 'text-slate-300'
                          }`}
                        />
                        <div>
                          <span className={`font-semibold block ${task.completed ? 'text-slate-900' : 'line-through text-slate-400'}`}>
                            {task.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Incidents Section if any */}
                {currentIncidents.length > 0 && (
                  <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-900">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-sm">
                        Actas de Incidencia / Daños Previos (Deslinde de Responsabilidad)
                      </h4>
                    </div>
                    {currentIncidents.map((inc) => (
                      <div key={inc.id} className="p-3 bg-white rounded-2xl border border-amber-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                          <span>[{inc.id}] {inc.title}</span>
                          <span className="text-[10px] text-slate-500">{inc.date} {inc.time}</span>
                        </div>
                        <p className="text-slate-600">{inc.description}</p>
                        {inc.adminResolution && (
                          <p className="mt-2 text-emerald-800 font-semibold">
                            Resolución: {inc.adminResolution}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm">
                Selecciona un servicio histórico de la lista para ver su expediente completo de auditoría.
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-white p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Resguardo inmutable operado bajo la póliza de calidad de <strong>{COMPANY_BRAND.legalName}</strong>.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Cerrar Bóveda
          </button>
        </div>
      </div>
    </div>
  );
};
