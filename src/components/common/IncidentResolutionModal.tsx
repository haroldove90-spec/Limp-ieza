import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Camera,
  Upload,
  User,
  Clock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { IncidentReport } from '../../types';
import { shareViaWhatsApp } from '../../utils/exportUtils';

interface IncidentResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentReport | null;
  currentUserName: string;
  currentUserRole?: 'operativo' | 'admin';
  onResolve: (
    incidentId: string,
    data: {
      resolutionNotes: string;
      resolutionPhotoUrl?: string;
      resolvedBy: string;
      resolvedByRole?: 'operativo' | 'admin';
    }
  ) => void;
}

const SAMPLE_RESOLUTION_PHOTOS = [
  {
    name: 'Área limpia y desinfectada',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
    description: 'Piso lavado, aspirado y secado'
  },
  {
    name: 'Dispensadores abastecidos',
    url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800&auto=format&fit=crop&q=80',
    description: 'Insumos sanitarios reabastecidos al 100%'
  },
  {
    name: 'Mobiliario y cristales impecables',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    description: 'Vidrios y superficies abrillantadas'
  },
  {
    name: 'Zona despejada y ordenada',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80',
    description: 'Área completamente rehabilitada'
  }
];

export const IncidentResolutionModal: React.FC<IncidentResolutionModalProps> = ({
  isOpen,
  onClose,
  incident,
  currentUserName,
  currentUserRole = 'operativo',
  onResolve
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [resolverName, setResolverName] = useState(currentUserName || 'Carlos Mendoza');
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [successConfirmation, setSuccessConfirmation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen || !incident) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setResolutionPhotoUrl(ev.target.result as string);
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
      setIsCapturingCamera(false);
      setResolutionPhotoUrl(SAMPLE_RESOLUTION_PHOTOS[0].url);
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
        setResolutionPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
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
    if (!resolutionNotes.trim()) return;

    onResolve(incident.id, {
      resolutionNotes: resolutionNotes.trim(),
      resolutionPhotoUrl: resolutionPhotoUrl || undefined,
      resolvedBy: resolverName.trim() || currentUserName,
      resolvedByRole: currentUserRole
    });

    setSuccessConfirmation(true);
  };

  const handleNotifyClientWhatsApp = () => {
    const message =
      `✅ *SOLICITUD ATENDIDA Y RESUELTA EN SITIO*\n\n` +
      `🏢 *Cliente:* ${incident.clientName}\n` +
      `📍 *Ubicación:* ${incident.location}\n` +
      `🏷️ *Folio de Reporte:* #${incident.id} (${incident.title})\n` +
      `👷 *Atendido por:* ${resolverName} (${currentUserRole === 'operativo' ? 'Técnico en Campo' : 'Dirección Operativa'})\n` +
      `⏰ *Fecha de Cierre:* ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hrs\n\n` +
      `📋 *Trabajo Realizado:*\n"${resolutionNotes}"\n\n` +
      (resolutionPhotoUrl ? `📸 *Evidencia Fotográfica de Solución:* Registrada y visible en su portal de cliente.\n\n` : '') +
      `_Agradecemos su confianza. El estado de este reporte ha pasado a RESUELTO Y AUDITADO._`;

    shareViaWhatsApp(message);
  };

  const handleCloseAll = () => {
    setResolutionNotes('');
    setResolutionPhotoUrl('');
    setSuccessConfirmation(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg md:text-xl tracking-tight">
                Resolver con Evidencia Fotográfica
              </h3>
              <p className="text-xs text-green-100 font-medium">
                Atención y solventación de reporte para notificación al cliente
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAll}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          {successConfirmation ? (
            /* Success confirmation view */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900">
                  ¡Reporte Solventado y Verificado!
                </h4>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  El reporte <strong className="text-slate-800 font-mono">#{incident.id}</strong> ha sido marcado como resuelto con evidencia fotográfica. El cliente ya puede ver en su portal el estatus actualizado y la fotografía de la solución.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={handleNotifyClientWhatsApp}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-200 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Notificar al Cliente por WhatsApp
                </button>

                <button
                  onClick={handleCloseAll}
                  className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  Listo / Finalizar
                </button>
              </div>
            </div>
          ) : (
            /* Incident summary + Resolution form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Original Incident Context Card */}
              <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    {incident.origin === 'cliente' ? 'Solicitud de Cliente' : 'Incidencia Operativa'} • Folio #{incident.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {incident.date} {incident.time}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm md:text-base">{incident.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{incident.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-200/80">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" /> {incident.clientName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> {incident.location}
                  </span>
                </div>

                {/* Original Photo preview if available */}
                {incident.photoUrl && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Foto Reportada (Antes):
                    </span>
                    <div className="w-24 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                      <img src={incident.photoUrl} alt="Antes" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>

              {/* Responder Info */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nombre del Responsable que Atendió *
                </label>
                <input
                  type="text"
                  required
                  value={resolverName}
                  onChange={(e) => setResolverName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-green-500 focus:border-green-500 bg-white"
                />
              </div>

              {/* Technical Resolution Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Trabajo Realizado / Explicación de la Solución *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej. Se acudió de inmediato al área, se limpió y desinfectó la superficie con solución antibacteriana y se reemplazó el insumo faltante..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-green-500 focus:border-green-500 bg-white"
                />
              </div>

              {/* Photo Evidence of Resolution (After) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Evidencia Fotográfica de Solución (Después) *
                  </label>
                  {resolutionPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setResolutionPhotoUrl('')}
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
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Tomar Foto de Solución
                    </button>
                  </div>
                ) : resolutionPhotoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-green-300 bg-slate-900 max-h-52 flex items-center justify-center">
                    <img src={resolutionPhotoUrl} alt="Solución" className="w-full h-full max-h-52 object-contain" />
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm">
                      Evidencia de Solución
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        className="px-3.5 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Camera className="w-4 h-4 text-green-600" />
                        Tomar Foto con Cámara
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 text-slate-500" />
                        Subir Archivo
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {/* Pre-set sample resolution photos */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5">
                        O selecciona un resultado de muestra para verificar:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SAMPLE_RESOLUTION_PHOTOS.map((sample, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setResolutionPhotoUrl(sample.url);
                              if (!resolutionNotes) setResolutionNotes(sample.description);
                            }}
                            className="p-1.5 rounded-xl border border-slate-200 hover:border-green-500 bg-white hover:bg-green-50/50 cursor-pointer transition-all text-left group"
                          >
                            <img
                              src={sample.url}
                              alt={sample.name}
                              className="w-full h-14 object-cover rounded-lg mb-1"
                            />
                            <span className="text-[10px] font-semibold text-slate-700 line-clamp-1 group-hover:text-green-900">
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
                  onClick={handleCloseAll}
                  className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs md:text-sm cursor-pointer shadow-lg shadow-green-200 flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Solución con Evidencia
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
