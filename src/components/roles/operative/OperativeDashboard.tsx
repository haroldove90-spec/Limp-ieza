import React, { useState } from 'react';
import {
  Calendar,
  Camera,
  CheckSquare,
  AlertTriangle,
  Package,
  Clock,
  MapPin,
  CheckCircle2,
  UploadCloud,
  ChevronRight,
  Plus,
  Send,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  FileText,
  Printer,
  Download,
  Mail,
  MessageSquare,
  FileSignature,
  User,
  ExternalLink
} from 'lucide-react';
import {
  CleaningService,
  IncidentReport,
  KitItem,
  PhotoEvidence,
  SupplyItem,
  WarehouseMovement,
  ClientProfile,
  EmployeeProfile
} from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';
import { IncidentReportModal } from '../../common/IncidentReportModal';
import { IncidentResolutionModal } from '../../common/IncidentResolutionModal';
import { WarehouseOperativeModule } from './WarehouseOperativeModule';
import { EmailSenderModal, EmailModalData } from '../../common/EmailSenderModal';
import { ClientSignatureModal } from '../../common/ClientSignatureModal';
import { EvidenceUploadModal } from '../../common/EvidenceUploadModal';
import { HistoricalAuditModal } from '../../common/HistoricalAuditModal';
import { COMPANY_BRAND } from '../../../constants/branding';
import { exportToHTMLPDF, shareViaWhatsApp } from '../../../utils/exportUtils';
import {
  generateServiceOrderHTML,
  buildServiceOrderWhatsAppMessage,
  downloadHistoricalAuditPDF,
  shareServiceReportWithEvidencesViaWhatsApp
} from '../../../utils/serviceOrderUtils';

interface OperativeDashboardProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void;
  services: CleaningService[];
  incidents: IncidentReport[];
  kitItems: KitItem[];
  supplies: SupplyItem[];
  movements: WarehouseMovement[];
  operativeName?: string;
  employees?: EmployeeProfile[];
  clients?: ClientProfile[];
  selectedOperativeId?: string;
  onSelectOperative?: (empId: string) => void;
  onUpdateServiceStatus: (serviceId: string, status: CleaningService['status']) => void;
  onToggleTask: (serviceId: string, taskId: string) => void;
  onAddEvidence: (serviceId: string, evidence: Omit<PhotoEvidence, 'id' | 'timestamp'>) => void;
  onAddIncident: (incident: Omit<IncidentReport, 'id' | 'date' | 'time' | 'status'>) => void;
  onToggleKitCheckin: (kitId: string) => void;
  onReportShortage: (kitId: string, note: string) => void;
  onAddWarehouseMovement: (movement: Omit<WarehouseMovement, 'id' | 'date' | 'time'>) => void;
  onEditWarehouseMovement: (movement: WarehouseMovement) => void;
  onDeleteWarehouseMovement: (movementId: string) => void;
  onAdjustSupplyStock: (supplyId: string, newStock: number) => void;
  onResolveIncidentWithEvidence?: (
    incidentId: string,
    data: {
      resolutionNotes: string;
      resolutionPhotoUrl?: string;
      resolvedBy: string;
      resolvedByRole?: 'operativo' | 'admin';
    }
  ) => void;
  onSaveClientSignature?: (
    serviceId: string,
    signature: {
      signedBy: string;
      signatureDataUrl: string;
      signedAt: string;
      comments?: string;
    }
  ) => void;
}

export const OperativeDashboard: React.FC<OperativeDashboardProps> = ({
  activeTab,
  onTabChange,
  services,
  incidents,
  kitItems,
  supplies,
  movements,
  operativeName = 'José del Carmen Sotero',
  employees = [],
  clients = [],
  selectedOperativeId,
  onSelectOperative,
  onUpdateServiceStatus,
  onToggleTask,
  onAddEvidence,
  onAddIncident,
  onToggleKitCheckin,
  onReportShortage,
  onAddWarehouseMovement,
  onEditWarehouseMovement,
  onDeleteWarehouseMovement,
  onAdjustSupplyStock,
  onResolveIncidentWithEvidence,
  onSaveClientSignature
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [viewingEvidence, setViewingEvidence] = useState<PhotoEvidence | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);
  const [selectedIncidentForReport, setSelectedIncidentForReport] = useState<IncidentReport | null>(null);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showEvidenceUploadModal, setShowEvidenceUploadModal] = useState(false);
  const [showHistoricalVaultModal, setShowHistoricalVaultModal] = useState(false);
  const [resolvingIncident, setResolvingIncident] = useState<IncidentReport | null>(null);

  // New Evidence Form State
  const [newArea, setNewArea] = useState('');
  const [newBeforeUrl, setNewBeforeUrl] = useState('');
  const [newAfterUrl, setNewAfterUrl] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  // Incident Form State
  const [incType, setIncType] = useState<IncidentReport['type']>('daño_previo');
  const [incTitle, setIncTitle] = useState('');
  const [incLocation, setIncLocation] = useState('');
  const [incDescription, setIncDescription] = useState('');
  const [incPhotoUrl, setIncPhotoUrl] = useState('');
  const [incidentSubmittedAlert, setIncidentSubmittedAlert] = useState(false);

  // Shortage modal state
  const [reportingShortageKitId, setReportingShortageKitId] = useState<string | null>(null);
  const [shortageNote, setShortageNote] = useState('');

  const handleSendIncidentEmail = (inc: IncidentReport) => {
    const subject = `[INCIDENCIA OPERATIVA] Folio ${inc.id} - ${inc.title} (${inc.clientName})`;
    const body = `Estimada Administración / Cliente,\n\nSe reporta la siguiente incidencia técnica en campo:\n\n` +
      `• Folio: ${inc.id}\n` +
      `• Sede / Cliente: ${inc.clientName} (Servicio: ${inc.serviceId})\n` +
      `• Ubicación Exacta: ${inc.location}\n` +
      `• Tipo: ${inc.type.replace('_', ' ').toUpperCase()}\n` +
      `• Título: ${inc.title}\n` +
      `• Fecha / Hora: ${inc.date} a las ${inc.time} hrs\n` +
      `• Técnico en Sitio: ${inc.operativeName}\n\n` +
      `DESCRIPCIÓN:\n${inc.description}\n\n` +
      `Atentamente,\nEquipo Operativo ${COMPANY_BRAND.legalName}`;

    setEmailModalData({
      title: 'Enviar Notificación de Incidencia por Correo',
      defaultRecipient: COMPANY_BRAND.email,
      defaultSubject: subject,
      defaultBody: body,
      reportType: 'Incidencia Operativa',
      attachmentName: `Incidencia_${inc.id}.pdf`
    });
  };

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Preset sample photo helper for fast demo
  const samplePhotos = [
    { label: 'Recepción Antes', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&auto=format&fit=crop&q=80' },
    { label: 'Recepción Después', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80' },
    { label: 'Cocina Antes', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80' },
    { label: 'Cocina Después', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sanitarios Antes', url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=600&auto=format&fit=crop&q=80' },
    { label: 'Sanitarios Después', url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleCreateEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService || !newArea.trim()) return;

    onAddEvidence(currentService.id, {
      area: newArea,
      beforePhotoUrl: newBeforeUrl || samplePhotos[0].url,
      afterPhotoUrl: newAfterUrl || samplePhotos[1].url,
      notes: newNotes
    });

    setNewArea('');
    setNewBeforeUrl('');
    setNewAfterUrl('');
    setNewNotes('');
    setShowEvidenceForm(false);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim() || !incDescription.trim()) return;

    onAddIncident({
      serviceId: currentService?.id || 'SRV-101',
      clientName: currentService?.clientName || 'Cliente General',
      location: incLocation || 'Área Principal',
      operativeName: operativeName || 'José del Carmen Sotero',
      type: incType,
      title: incTitle,
      description: incDescription,
      photoUrl: incPhotoUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
      origin: 'operativo',
      priority: 'normal'
    });

    setIncTitle('');
    setIncLocation('');
    setIncDescription('');
    setIncPhotoUrl('');
    setIncidentSubmittedAlert(true);
    setTimeout(() => setIncidentSubmittedAlert(false), 4000);
  };

  const handleSendShortage = (kitId: string) => {
    if (!shortageNote.trim()) return;
    onReportShortage(kitId, shortageNote);
    setReportingShortageKitId(null);
    setShortageNote('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* 1. AGENDA Y ASIGNACIONES */}
      {activeTab === 'agenda' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Servicios del Día
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Técnico Activo: <strong className="text-slate-700">{operativeName}</strong> • {services.length} Servicios en plataforma
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {employees.length > 0 && onSelectOperative && (
                <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-2xl transition-all">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-500">Técnico:</span>
                  <select
                    value={selectedOperativeId || employees[0]?.id}
                    onChange={(e) => onSelectOperative(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className="px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Turno en Curso
              </span>
            </div>
          </div>

          {/* Banner de Solicitudes de Cliente Pendientes de Atención */}
          {(() => {
            const pendingClientReports = incidents.filter(
              (i) => i.origin === 'cliente' && i.status !== 'resuelto'
            );
            if (pendingClientReports.length === 0) return null;
            return (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white shadow-lg shadow-orange-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-orange-400">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                    <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        Atención Requerida
                      </span>
                      <h4 className="font-bold text-sm sm:text-base tracking-tight">
                        {pendingClientReports.length} Solicitud(es) de Cliente en Sitio
                      </h4>
                    </div>
                    <p className="text-xs text-orange-100 mt-1 font-medium">
                      "{pendingClientReports[0].title}" en <strong>{pendingClientReports[0].location}</strong> ({pendingClientReports[0].clientName})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setResolvingIncident(pendingClientReports[0])}
                    className="px-4 py-2.5 bg-white text-orange-800 hover:bg-orange-50 rounded-2xl text-xs font-extrabold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Resolver con Evidencia Fotográfica
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Service Cards Grid */}
          {services.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 text-center border border-slate-100 shadow-sm space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-bold text-slate-800 text-lg">No hay servicios programados en la agenda</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  En cuanto se asignen servicios de limpieza desde la administración central, aparecerán aquí con su horario, checklist y sede.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const isSelected = service.id === selectedServiceId;
                const completedTasks = (service.tasks || []).filter((t) => t.completed).length;
                const progressPct = Math.round((completedTasks / ((service.tasks || []).length || 1)) * 100);

                const statusBadge =
                  service.status === 'en_proceso'
                    ? 'bg-yellow-100 text-yellow-800'
                    : service.status === 'completado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800';

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isSelected ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusBadge}`}>
                        {service.status === 'en_proceso'
                          ? 'En Proceso'
                          : service.status === 'completado'
                          ? 'Completado'
                          : 'Programado'}
                      </span>
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {service.timeSlot}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-lg md:text-xl leading-snug">
                      {service.clientName}
                    </h3>

                    <div className="mt-2 flex items-start justify-between gap-2">
                      <p className="text-xs md:text-sm text-slate-400 font-medium flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                        <span>{service.clientAddress}</span>
                      </p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.clientAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Ver en Google Maps"
                      >
                        <ExternalLink className="w-3 h-3" /> Maps
                      </a>
                    </div>

                    {service.clientSignature && (
                      <div className="mt-3 p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Firmado por <strong>{service.clientSignature.signedBy}</strong> ({service.clientSignature.signedAt})</span>
                      </div>
                    )}

                    {service.specialInstructions && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium">
                        <span className="font-bold block text-slate-800 mb-1 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-blue-600" /> Nota especial:
                        </span>
                        {service.specialInstructions}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                      <span>Progreso de Tareas</span>
                      <span>{completedTasks}/{service.tasks.length} ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.status !== 'en_proceso' && service.status !== 'completado' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateServiceStatus(service.id, 'en_proceso');
                          }}
                          className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-900 text-white font-semibold text-xs md:text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-lg shadow-slate-200"
                        >
                          Iniciar Servicio
                        </button>
                      )}
                      {service.status === 'en_proceso' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateServiceStatus(service.id, 'completado');
                          }}
                          className="flex-1 py-2.5 px-4 rounded-2xl bg-green-600 text-white font-semibold text-xs md:text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-green-200"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Concluir Servicio
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const cli = clients.find((c) => c.name === service.clientName);
                          const html = generateServiceOrderHTML(service, cli);
                          exportToHTMLPDF(`Orden_Servicio_${service.id}`, html);
                        }}
                        className="px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Descargar Orden PDF"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* 2. REPORTE DE TRABAJO CON EVIDENCIA FOTOGRÁFICA & CHECKLIST */}
      {activeTab === 'evidencias' && (
        <div className="space-y-6">
          {!currentService ? (
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm text-center space-y-5">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto border border-blue-100 shadow-xs">
                <Camera className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-bold text-slate-800">
                  Bitácora de Evidencias Fotográficas
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                  No hay ningún servicio seleccionado o activo en tu agenda. Selecciona un servicio programado para comenzar a capturar fotos de antes/después y completar checklists.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onTabChange?.('agenda')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-200 cursor-pointer transition-all"
                >
                  <Calendar className="w-4 h-4" /> Ir a Agenda de Servicios
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Service Selector Pill Bar */}
              <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Servicio Seleccionado:</span>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800">
                    {currentService.clientName}
                  </h2>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        s.id === currentService.id
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                      }`}
                    >
                      {s.clientName.split(' ')[0]} ({s.timeSlot.split('-')[0]})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Checklist Column (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <CheckSquare className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-base md:text-lg">
                          Checklist de Tareas
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                        {(currentService.tasks || []).filter((t) => t.completed).length}/{(currentService.tasks || []).length} Hechas
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {(currentService.tasks || []).map((task) => (
                    <label
                      key={task.id}
                      onClick={() => onToggleTask(currentService.id, task.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                        task.completed
                          ? 'bg-green-50/50 border-green-200 text-slate-800'
                          : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded-md text-blue-600 accent-blue-600 shrink-0 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className={`text-sm font-semibold block ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {task.category}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Client Signature & Approval Section */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                {currentService.clientSignature ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Firma de Conformidad Registrada
                      </span>
                      <button
                        onClick={() => setShowSignatureModal(true)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Cambiar Firma
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      {currentService.clientSignature.signatureDataUrl && (
                        <div className="w-20 h-10 bg-white border border-emerald-200 rounded-lg overflow-hidden flex items-center justify-center p-0.5">
                          <img
                            src={currentService.clientSignature.signatureDataUrl}
                            alt="Firma del cliente"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="text-xs text-emerald-900">
                        <p className="font-semibold">{currentService.clientSignature.signedBy}</p>
                        <p className="text-[10px] text-emerald-700">{currentService.clientSignature.signedAt}</p>
                      </div>
                    </div>
                    {currentService.clientSignature.comments && (
                      <p className="text-[11px] text-emerald-800 mt-2 italic">
                        "{currentService.clientSignature.comments}"
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSignatureModal(true)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4 text-amber-700" />
                    Solicitar Firma Digital del Cliente
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const cli = clients.find((c) => c.name === currentService.clientName);
                      const srvInc = incidents.filter((i) => i.serviceId === currentService.id || (i.clientName === currentService.clientName && i.date === currentService.date));
                      shareServiceReportWithEvidencesViaWhatsApp(currentService, cli, srvInc);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                    title="Compartir reporte por WhatsApp con evidencias fotográficas y firmas"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp c/ Fotos
                  </button>

                  <button
                    onClick={() => {
                      const cli = clients.find((c) => c.name === currentService.clientName);
                      const srvInc = incidents.filter((i) => i.serviceId === currentService.id || (i.clientName === currentService.clientName && i.date === currentService.date));
                      downloadHistoricalAuditPDF(currentService, cli, srvInc);
                    }}
                    className="py-2.5 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Descargar Expediente de Auditoría y Resguardo en PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-700" />
                    Expediente PDF
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const cli = clients.find((c) => c.name === currentService.clientName);
                      const html = generateServiceOrderHTML(currentService, cli);
                      exportToHTMLPDF(`Orden_Servicio_${currentService.id}`, html);
                    }}
                    className="py-2 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Orden Simple
                  </button>

                  <button
                    onClick={() => setShowHistoricalVaultModal(true)}
                    className="py-2 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    title="Consultar Bóveda de Resguardo Histórico"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Bóveda Histórica
                  </button>
                </div>

                <button
                  onClick={() => onUpdateServiceStatus(currentService.id, 'completado')}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-200"
                >
                  <Send className="w-4 h-4" /> Enviar Reporte de Servicio
                </button>
              </div>
            </div>

            {/* Evidences Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base md:text-lg">
                      Fotos Antes y Después
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEvidenceUploadModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Subir fotos desde cámara o archivo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Subir Foto/Archivo</span>
                    </button>

                    <button
                      onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 text-white font-semibold text-xs md:text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Nueva Área</span>
                    </button>
                  </div>
                </div>

                {/* New Evidence Capture Form */}
                {showEvidenceForm && (
                  <form onSubmit={handleCreateEvidence} className="mb-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">Registrar Evidencia de Área</h4>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre del Área / Zona:</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Sala de juntas principal, Baño ejecutivos"
                        value={newArea}
                        onChange={(e) => setNewArea(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-orange-800 block mb-1">Foto Antes (URL o Muestra):</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={newBeforeUrl}
                          onChange={(e) => setNewBeforeUrl(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setNewBeforeUrl(samplePhotos[0].url)}
                          className="text-[11px] text-orange-700 font-semibold mt-1 underline cursor-pointer"
                        >
                          Usar foto de muestra
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-green-800 block mb-1">Foto Después (URL o Muestra):</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={newAfterUrl}
                          onChange={(e) => setNewAfterUrl(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setNewAfterUrl(samplePhotos[1].url)}
                          className="text-[11px] text-green-700 font-semibold mt-1 underline cursor-pointer"
                        >
                          Usar foto de muestra
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Notas técnicas:</label>
                      <input
                        type="text"
                        placeholder="Tratamiento realizado, desinfección con vapor..."
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowEvidenceForm(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs md:text-sm font-semibold hover:bg-blue-700 cursor-pointer shadow-sm shadow-blue-200"
                      >
                        Guardar Evidencia
                      </button>
                    </div>
                  </form>
                )}

                {/* Evidence List */}
                {(currentService.evidences || []).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-700 font-semibold text-sm">Sin evidencias registradas aún en este servicio</p>
                    <p className="text-slate-400 text-xs mt-1">Haz clic en &quot;Nueva Área&quot; para registrar fotos del antes y después.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(currentService.evidences || []).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setViewingEvidence(ev)}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-blue-300 bg-slate-50/40 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex -space-x-3 overflow-hidden">
                            {ev.beforePhotoUrl && (
                              <img
                                src={ev.beforePhotoUrl}
                                alt="Antes"
                                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs"
                              />
                            )}
                            {ev.afterPhotoUrl && (
                              <img
                                src={ev.afterPhotoUrl}
                                alt="Después"
                                className="w-12 h-12 rounded-xl object-cover border-2 border-green-500 shadow-xs"
                              />
                            )}
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-800 text-sm md:text-base">
                              {ev.area}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium truncate max-w-xs">
                              {ev.notes || 'Evidencia fotográfica lista para revisión'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-xs md:text-sm">
                          <span>Comparar</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}
        </div>
      )}

      {/* 3. REPORTE DE INCIDENCIAS CON FOTOS */}
      {activeTab === 'incidencias' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Incident Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800">
                  Reportar Incidencia en Campo
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Objetos previamente dañados, zonas inaccesibles o fallas de suministro
                </p>
              </div>
            </div>

            {incidentSubmittedAlert && (
              <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Incidencia registrada y notificada al Administrador en tiempo real.
              </div>
            )}

            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tipo de Incidencia:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'daño_previo', label: 'Daño Previo' },
                    { id: 'zona_inaccesible', label: 'Inaccesible' },
                    { id: 'falta_suministro', label: 'Falta de Suministro' },
                    { id: 'cliente_ausente', label: 'Sin Acceso' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setIncType(t.id as any)}
                      className={`p-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                        incType === t.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200'
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título breve del problema:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Vidrio de escritorio cuarteado antes de iniciar"
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ubicación exacta / Área:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sala de conferencias B"
                    value={incLocation}
                    onChange={(e) => setIncLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Foto de Evidencia (URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={incPhotoUrl}
                    onChange={(e) => setIncPhotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detalles y Observaciones:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe la situación encontrada con precisión para deslindar responsabilidades..."
                  value={incDescription}
                  onChange={(e) => setIncDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-200 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" /> Enviar Reporte de Incidencia
              </button>
            </form>
          </div>

          {/* Incidents List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                Incidencias Registradas ({incidents.length})
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                Formato PDF
              </span>
            </div>

            <div className="space-y-3">
              {incidents.map((inc) => {
                const isResolved = inc.status === 'resuelto';

                return (
                  <div
                    key={inc.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isResolved
                        ? 'border-green-200 bg-green-50/20 hover:bg-white'
                        : inc.origin === 'cliente'
                        ? 'border-orange-300 bg-orange-50/30 hover:bg-white ring-1 ring-orange-200'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {inc.origin === 'cliente' ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                            <User className="w-3 h-3 text-blue-600" /> Solicitud Cliente
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                            Hallazgo en Campo
                          </span>
                        )}

                        {inc.priority && (
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                              inc.priority === 'urgente'
                                ? 'bg-red-100 text-red-800'
                                : inc.priority === 'alta'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {inc.priority}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isResolved ? '✅ Resuelto' : '⏳ Pendiente'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base">
                        {inc.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {inc.description}
                      </p>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-white/80 p-2.5 rounded-xl border border-slate-100">
                      <div><strong>Ubicación:</strong> {inc.location}</div>
                      <div><strong>Cliente:</strong> {inc.clientName}</div>
                      <div className="text-[11px] text-slate-400">
                        {inc.date} a las {inc.time} hrs
                      </div>
                    </div>

                    {/* RESOLUTION STATUS / EVIDENCE */}
                    {isResolved ? (
                      <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-xs space-y-1.5 text-green-900">
                        <div className="font-bold flex items-center gap-1 text-[11px] uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          Solución Confirmada ({inc.resolvedAt || 'Completado'})
                        </div>
                        <p className="text-[11px] text-green-950 italic">
                          "{inc.resolutionNotes || inc.adminResolution}"
                        </p>
                        {inc.resolvedBy && (
                          <div className="text-[10px] text-green-800">
                            Atendido por: <strong>{inc.resolvedBy}</strong>
                          </div>
                        )}
                        {inc.resolutionPhotoUrl && (
                          <div className="pt-1.5">
                            <button
                              onClick={() =>
                                setViewingIncident({
                                  ...inc,
                                  photoUrl: inc.resolutionPhotoUrl!
                                })
                              }
                              className="text-[11px] font-bold text-green-800 underline flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" /> Ver Foto de Solución
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => setResolvingIncident(inc)}
                          className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolver con Evidencia Fotográfica
                        </button>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <span className="text-[11px] text-slate-400">Folio #{inc.id}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSendIncidentEmail(inc)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Enviar Notificación por Correo"
                        >
                          <Mail className="w-3.5 h-3.5" /> Correo
                        </button>
                        <button
                          onClick={() => setSelectedIncidentForReport(inc)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ver / Exportar Reporte Técnico PDF"
                        >
                          <Printer className="w-3.5 h-3.5" /> PDF
                        </button>
                        {inc.photoUrl && (
                          <button
                            onClick={() => setViewingIncident(inc)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
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
          </div>
        </div>
      )}

      {/* 4. ALMACÉN Y MOVIMIENTOS DE INSUMOS (NUEVO MÓDULO OPERATIVO) */}
      {activeTab === 'almacen_operativo' && (
        <WarehouseOperativeModule
          supplies={supplies}
          movements={movements}
          operativeName={operativeName}
          onAddMovement={onAddWarehouseMovement}
          onEditMovement={onEditWarehouseMovement}
          onDeleteMovement={onDeleteWarehouseMovement}
          onAdjustStock={onAdjustSupplyStock}
        />
      )}

      {/* 5. CONTROL DE KIT EN CAMPO */}
      {activeTab === 'insumos_campo' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Check-in de Kit y Materiales
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Valida el kit entregado antes de iniciar y reporta insumos por agotarse
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-semibold px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700">
                Kit Asignado: Van #04
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kitItems.map((item) => {
              const isShortageModalOpen = reportingShortageKitId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-6 border transition-all shadow-sm flex flex-col justify-between ${
                    item.status === 'escaso'
                      ? 'border-orange-300 bg-orange-50/10'
                      : item.checkedIn
                      ? 'border-green-200'
                      : 'border-slate-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {item.unit}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          item.status === 'completo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {item.status === 'completo' ? 'Stock Óptimo' : 'Por Agotarse'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base md:text-lg mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 mb-3">
                      Cantidad Asignada: <span className="text-slate-800 font-bold">{item.quantityAssigned}</span>
                    </p>

                    {item.notes && (
                      <p className="text-xs text-orange-800 bg-orange-50 p-2.5 rounded-xl border border-orange-200 mb-3">
                        ⚠️ {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => onToggleKitCheckin(item.id)}
                      className={`w-full py-2.5 px-3 rounded-2xl font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        item.checkedIn
                          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {item.checkedIn ? 'Kit Validado en Recepción' : 'Confirmar Check-in'}
                    </button>

                    {isShortageModalOpen ? (
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Reportar Faltante en Sitio:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Quedan solo 100ml para el próximo piso"
                          value={shortageNote}
                          onChange={(e) => setShortageNote(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                        />
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => setReportingShortageKitId(null)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-500 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSendShortage(item.id)}
                            className="px-3.5 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-orange-200"
                          >
                            Enviar Alerta
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReportingShortageKitId(item.id);
                          setShortageNote('');
                        }}
                        className="w-full py-2 px-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        ⚡ Notificar Faltante en Tiempo Real
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Incident Official Printable PDF Modal */}
      {selectedIncidentForReport && (
        <IncidentReportModal
          incident={selectedIncidentForReport}
          onClose={() => setSelectedIncidentForReport(null)}
        />
      )}

      {/* Incident Resolution with Evidence Modal */}
      <IncidentResolutionModal
        isOpen={!!resolvingIncident}
        onClose={() => setResolvingIncident(null)}
        incident={resolvingIncident}
        currentUserName={operativeName}
        currentUserRole="operativo"
        onResolve={(incidentId, data) => {
          if (onResolveIncidentWithEvidence) {
            onResolveIncidentWithEvidence(incidentId, data);
          }
          setResolvingIncident(null);
        }}
      />

      {/* Digital Signature Modal */}
      {showSignatureModal && currentService && (
        <ClientSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          service={currentService}
          onSaveSignature={(serviceId, signature) => {
            if (onSaveClientSignature) {
              onSaveClientSignature(serviceId, signature);
            }
            setShowSignatureModal(false);
          }}
        />
      )}

      {/* Email Dispatch Modal */}
      <EmailSenderModal
        data={emailModalData}
        isOpen={!!emailModalData}
        onClose={() => setEmailModalData(null)}
      />

      {/* SUBIDA DE EVIDENCIAS FOTOGRÁFICAS MODAL */}
      {currentService && (
        <EvidenceUploadModal
          isOpen={showEvidenceUploadModal}
          onClose={() => setShowEvidenceUploadModal(false)}
          service={currentService}
          onSaveEvidence={(srvId, ev) => {
            onAddEvidence(srvId, ev);
            setShowEvidenceUploadModal(false);
          }}
        />
      )}

      {/* BÓVEDA DE RESGUARDO HISTÓRICO & BLINDAJE ANTE RECLAMACIONES MODAL */}
      <HistoricalAuditModal
        isOpen={showHistoricalVaultModal}
        onClose={() => setShowHistoricalVaultModal(false)}
        services={services}
        clients={clients}
        incidents={incidents}
        initialServiceId={currentService?.id}
        onOpenEvidenceViewer={(ev) => setViewingEvidence(ev)}
      />
    </div>
  );
};
