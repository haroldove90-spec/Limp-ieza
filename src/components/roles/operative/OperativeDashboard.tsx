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
  ArrowRight
} from 'lucide-react';
import { CleaningService, IncidentReport, KitItem, PhotoEvidence } from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';

interface OperativeDashboardProps {
  activeTab: string;
  services: CleaningService[];
  incidents: IncidentReport[];
  kitItems: KitItem[];
  onUpdateServiceStatus: (serviceId: string, status: CleaningService['status']) => void;
  onToggleTask: (serviceId: string, taskId: string) => void;
  onAddEvidence: (serviceId: string, evidence: Omit<PhotoEvidence, 'id' | 'timestamp'>) => void;
  onAddIncident: (incident: Omit<IncidentReport, 'id' | 'date' | 'time' | 'status'>) => void;
  onToggleKitCheckin: (kitId: string) => void;
  onReportShortage: (kitId: string, note: string) => void;
}

export const OperativeDashboard: React.FC<OperativeDashboardProps> = ({
  activeTab,
  services,
  incidents,
  kitItems,
  onUpdateServiceStatus,
  onToggleTask,
  onAddEvidence,
  onAddIncident,
  onToggleKitCheckin,
  onReportShortage
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [viewingEvidence, setViewingEvidence] = useState<PhotoEvidence | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);

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
    if (!newArea.trim()) return;

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
      operativeName: 'Carlos Mendoza',
      type: incType,
      title: incTitle,
      description: incDescription,
      photoUrl: incPhotoUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Servicios del Día
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Hoy: 23 de Agosto, 2026 • 3 Asignaciones programadas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Turno en Curso
              </span>
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const isSelected = service.id === selectedServiceId;
              const completedTasks = service.tasks.filter((t) => t.completed).length;
              const progressPct = Math.round((completedTasks / (service.tasks.length || 1)) * 100);

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

                    <p className="text-xs md:text-sm text-slate-400 font-medium flex items-start gap-1.5 mt-2">
                      <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                      <span>{service.clientAddress}</span>
                    </p>

                    {service.specialInstructions && (
                      <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium">
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

                    <div className="mt-5 flex gap-2">
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. REPORTE DE TRABAJO CON EVIDENCIA FOTOGRÁFICA & CHECKLIST */}
      {activeTab === 'evidencias' && (
        <div className="space-y-6">
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
                    {currentService.tasks.filter((t) => t.completed).length}/{currentService.tasks.length} Hechas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {currentService.tasks.map((task) => (
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

              <div className="mt-6 pt-4 border-t border-slate-100">
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

                  <button
                    onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 text-white font-semibold text-xs md:text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Área</span>
                  </button>
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
                {currentService.evidences.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Camera className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-700 font-semibold text-sm">Sin evidencias registradas aún en este servicio</p>
                    <p className="text-slate-400 text-xs mt-1">Haz clic en &quot;Nueva Área&quot; para registrar fotos del antes y después.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentService.evidences.map((ev) => (
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
            <h3 className="font-bold text-slate-800 text-base md:text-lg mb-4">
              Incidencias Reportadas Hoy
            </h3>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => setViewingIncident(inc)}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                      {inc.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{inc.time}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm md:text-base">
                    {inc.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {inc.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">{inc.location}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      inc.status === 'resuelto' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inc.status === 'resuelto' ? 'Resuelto' : 'En Revisión'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CONTROL DE INSUMOS (CAMPO) */}
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
    </div>
  );
};
