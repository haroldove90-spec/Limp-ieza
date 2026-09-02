import React, { useState, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Camera,
  Upload,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  MessageSquare,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { IncidentReport, ClientProfile, EmployeeProfile } from '../../types';
import { COMPANY_BRAND } from '../../constants/branding';
import { shareViaWhatsApp } from '../../utils/exportUtils';

interface ClientReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientProfile?: ClientProfile;
  assignedEmployee?: EmployeeProfile;
  onSubmit: (incident: Omit<IncidentReport, 'id' | 'date' | 'time' | 'status'>) => void;
}

const SAMPLE_CLIENT_INCIDENT_PHOTOS = [
  {
    name: 'Derrame en piso / pasillo',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    title: 'Derrame imprevisto en piso'
  },
  {
    name: 'Dispensador o insumo vacío',
    url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&auto=format&fit=crop&q=80',
    title: 'Falta de jabón/papel en módulo'
  },
  {
    name: 'Mancha en alfombra / mobiliario',
    url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
    title: 'Mancha en alfombra de oficina'
  },
  {
    name: 'Vidrio o superficie desatendida',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    title: 'Desperfecto en cristal o cancelería'
  }
];

export const ClientReportModal: React.FC<ClientReportModalProps> = ({
  isOpen,
  onClose,
  clientName,
  clientProfile,
  assignedEmployee,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<IncidentReport['type']>('solicitud_cliente');
  const [priority, setPriority] = useState<IncidentReport['priority']>('alta');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<IncidentReport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotoUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartCamera = async () => {
    setIsCapturingCamera(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch {
      // Fallback if camera is unavailable in browser/iframe
      setIsCapturingCamera(false);
      setPhotoUrl(SAMPLE_CLIENT_INCIDENT_PHOTOS[0].url);
    }
  };

  const handleCaptureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
      }
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCapturingCamera(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) return;

    const opName = assignedEmployee?.name || clientProfile?.assignedEmployeeName || 'Técnico en Turno';
    const opId = assignedEmployee?.id || clientProfile?.assignedEmployeeId || 'EMP-01';

    const incidentData: Omit<IncidentReport, 'id' | 'date' | 'time' | 'status'> = {
      serviceId: 'SOL-CLIENTE',
      clientName: clientName,
      location: location.trim(),
      operativeName: opName,
      type: type,
      title: title.trim(),
      description: description.trim(),
      photoUrl: photoUrl || undefined,
      origin: 'cliente',
      priority: priority,
      assignedEmployeeId: opId,
      assignedEmployeeName: opName
    };

    onSubmit(incidentData);

    // Save temporary reference for immediate WhatsApp dispatch
    const now = new Date();
    setSubmittedIncident({
      ...incidentData,
      id: `REP-${Date.now().toString().slice(-4)}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pendiente'
    });
  };

  const handleShareWhatsAppAlert = (inc: IncidentReport) => {
    const priorityIcon = inc.priority === 'urgente' ? '🚨 URGENTE' : inc.priority === 'alta' ? '⚠️ PRIORIDAD ALTA' : '📌 PRIORIDAD NORMAL';
    const message =
      `*${priorityIcon} - REPORTE DE CLIENTE EN SITIO*\n\n` +
      `🏢 *Cliente:* ${inc.clientName}\n` +
      `📍 *Ubicación:* ${inc.location}\n` +
      `🏷️ *Asunto:* ${inc.title}\n` +
      `👷 *Técnico Asignado:* ${inc.operativeName}\n` +
      `⏰ *Fecha y Hora:* ${inc.date} a las ${inc.time} hrs\n` +
      `🔢 *Folio Ticket:* #${inc.id}\n\n` +
      `📝 *Descripción del Reporte:*\n"${inc.description}"\n\n` +
      (inc.photoUrl ? `📸 *Foto Adjunta:* ${inc.photoUrl.length > 120 ? 'Foto adjuntada en plataforma' : inc.photoUrl}\n\n` : '') +
      `_Favor de atender y registrar evidencia fotográfica de solución en la plataforma CleanPro._`;

    shareViaWhatsApp(message);
  };

  const handleResetAndClose = () => {
    setTitle('');
    setLocation('');
    setDescription('');
    setPhotoUrl('');
    setSubmittedIncident(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl tracking-tight">
                Levantar Solicitud o Reporte en Sitio
              </h3>
              <p className="text-xs text-orange-100 font-medium">
                Notificación inmediata al Técnico Asignado y a la Dirección Operativa
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {submittedIncident ? (
            /* Success confirmation screen */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900">
                  ¡Reporte Registrado con Éxito!
                </h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Se ha generado el folio <strong className="text-slate-800 font-mono">#{submittedIncident.id}</strong>. Tanto el técnico asignado como la central administrativa ya lo tienen en su tablero.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Cliente:</span>
                  <strong className="text-slate-800">{submittedIncident.clientName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Ubicación:</span>
                  <strong className="text-slate-800">{submittedIncident.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Técnico Asignado:</span>
                  <strong className="text-slate-800">{submittedIncident.operativeName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Prioridad:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    submittedIncident.priority === 'urgente'
                      ? 'bg-red-100 text-red-800'
                      : submittedIncident.priority === 'alta'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {submittedIncident.priority}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={() => handleShareWhatsAppAlert(submittedIncident)}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-200 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Notificar por WhatsApp
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  Aceptar y Volver al Panel
                </button>
              </div>
            </div>
          ) : (
            /* Ticket Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Technician Notice Banner */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-blue-900 block">
                    Personal Asignado a tu Sede:
                  </span>
                  <p className="text-blue-700 mt-0.5">
                    <strong>{assignedEmployee?.name || clientProfile?.assignedEmployeeName || 'Carlos Mendoza'}</strong> ({assignedEmployee?.role || 'Técnico Especialista'}) • Tel: {assignedEmployee?.phone || clientProfile?.assignedEmployeePhone || '55-4819-2033'}
                  </p>
                  <span className="text-[11px] text-blue-600/80 block mt-1">
                    Al confirmar, el técnico verá esta solicitud destacada en su aplicación móvil para resolverla con evidencia fotográfica.
                  </span>
                </div>
              </div>

              {/* Title / Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Asunto o Motivo del Reporte *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Derrame de café en pasillo norte, jabonera vacía en piso 2..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Location & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Ubicación Exacta en Sitio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sanitarios Piso 8, Sala de Juntas B..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-600" /> Nivel de Urgencia *
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['normal', 'alta', 'urgente'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setPriority(lvl)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-bold uppercase transition-all cursor-pointer border ${
                          priority === lvl
                            ? lvl === 'urgente'
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : lvl === 'alta'
                              ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                              : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Type selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tipo de Situación
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'solicitud_cliente', label: 'Limpieza / Atención' },
                    { id: 'falta_suministro', label: 'Insumo Agotado' },
                    { id: 'daño_previo', label: 'Desperfecto / Daño' },
                    { id: 'otro', label: 'Otra Solicitud' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                        type === t.id
                          ? 'border-orange-500 bg-orange-50 text-orange-800'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Descripción Detallada *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escribe los detalles para que el técnico acuda con los implementos o insumos adecuados..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Photo attachment section */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Foto de Evidencia (Opcional pero Recomendada)
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                    >
                      Quitar Foto
                    </button>
                  )}
                </div>

                {isCapturingCamera ? (
                  <div className="p-4 bg-slate-900 rounded-2xl space-y-3 text-center">
                    <video ref={videoRef} className="w-full max-h-56 object-cover rounded-xl mx-auto" />
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Tomar Foto
                    </button>
                  </div>
                ) : photoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-52 flex items-center justify-center">
                    <img src={photoUrl} alt="Evidencia" className="w-full h-full max-h-52 object-contain" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="px-3.5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 text-orange-600" />
                        Usar Cámara
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 text-slate-500" />
                        Subir Imagen
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {/* Pre-set sample photos */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5">
                        O selecciona un ejemplo visual rápido:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SAMPLE_CLIENT_INCIDENT_PHOTOS.map((sample, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setPhotoUrl(sample.url);
                              if (!title) setTitle(sample.title);
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 hover:border-orange-400 bg-white hover:bg-orange-50/50 cursor-pointer transition-all text-left group"
                          >
                            <img
                              src={sample.url}
                              alt={sample.name}
                              className="w-full h-14 object-cover rounded-lg mb-1"
                            />
                            <span className="text-[10px] font-semibold text-slate-700 line-clamp-1 group-hover:text-orange-900">
                              {sample.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs md:text-sm cursor-pointer shadow-lg shadow-orange-200 flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Emitir Reporte al Técnico y Admin
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
