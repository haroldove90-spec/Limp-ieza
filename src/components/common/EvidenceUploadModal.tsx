import React, { useState, useRef } from 'react';
import { Camera, Upload, Plus, X, Image as ImageIcon, CheckCircle2, Sparkles } from 'lucide-react';
import { PhotoEvidence, CleaningService } from '../../types';

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: CleaningService;
  onSaveEvidence: (serviceId: string, evidence: Omit<PhotoEvidence, 'id' | 'timestamp'>) => void;
}

const SAMPLE_BEFORE_PHOTOS = [
  { label: 'Pisos / Alfombras con polvo', url: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sanitarios / Grifería con sarro', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80' },
  { label: 'Escritorios / Estaciones sucias', url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Ventanales / Canceles con marcas', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80' }
];

const SAMPLE_AFTER_PHOTOS = [
  { label: 'Pisos abrillantados y aspirados', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sanitarios desinfectados al 100%', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80' },
  { label: 'Oficinas higienizadas con aroma', url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cristales transparentes e impecables', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&auto=format&fit=crop&q=80' }
];

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  service,
  onSaveEvidence
}) => {
  const [area, setArea] = useState('');
  const [beforePhotoUrl, setBeforePhotoUrl] = useState('');
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area.trim()) return;

    onSaveEvidence(service.id, {
      area: area.trim(),
      beforePhotoUrl: beforePhotoUrl || undefined,
      afterPhotoUrl: afterPhotoUrl || undefined,
      notes: notes.trim() || undefined
    });

    // Reset & close
    setArea('');
    setBeforePhotoUrl('');
    setAfterPhotoUrl('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Adjuntar Evidencia Fotográfica
              </h3>
              <p className="text-xs text-slate-500">
                Servicio: <strong>{service.clientName}</strong> (Folio #{service.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Área */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Área o Zona de Trabajo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sanitarios Piso 3, Cristales Fachada, Sala Ejecutiva A"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Grid Fotos Antes y Después */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foto Antes */}
            <div className="p-4 rounded-2xl border border-orange-200/80 bg-orange-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                  [1] Foto Inicial (Antes)
                </span>
                {beforePhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setBeforePhotoUrl('')}
                    className="text-[10px] text-red-600 font-semibold hover:underline cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>

              {beforePhotoUrl ? (
                <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-orange-200 bg-slate-900">
                  <img
                    src={beforePhotoUrl}
                    alt="Antes"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    ANTES
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => beforeFileInputRef.current?.click()}
                    className="aspect-4/3 rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-white flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-xs font-bold text-orange-950">Tomar / Subir Foto</span>
                    <span className="text-[10px] text-slate-400">Cámara móvil o archivo</span>
                  </div>
                  <input
                    ref={beforeFileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setBeforePhotoUrl)}
                  />

                  {/* Preset rápido */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">O selecciona una muestra:</span>
                    <div className="flex flex-wrap gap-1">
                      {SAMPLE_BEFORE_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBeforePhotoUrl(p.url)}
                          className="px-2 py-1 bg-white border border-slate-200 hover:border-orange-300 text-[10px] font-semibold text-slate-600 rounded-lg cursor-pointer transition-colors"
                        >
                          {p.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Foto Después */}
            <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  [2] Foto Entrega (Después)
                </span>
                {afterPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => setAfterPhotoUrl('')}
                    className="text-[10px] text-red-600 font-semibold hover:underline cursor-pointer"
                  >
                    Quitar
                  </button>
                )}
              </div>

              {afterPhotoUrl ? (
                <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-emerald-200 bg-slate-900">
                  <img
                    src={afterPhotoUrl}
                    alt="Después"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    DESPUÉS
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => afterFileInputRef.current?.click()}
                    className="aspect-4/3 rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-white flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-6 h-6 text-emerald-500 mb-1" />
                    <span className="text-xs font-bold text-emerald-950">Tomar / Subir Foto</span>
                    <span className="text-[10px] text-slate-400">Cámara móvil o archivo</span>
                  </div>
                  <input
                    ref={afterFileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setAfterPhotoUrl)}
                  />

                  {/* Preset rápido */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">O selecciona una muestra:</span>
                    <div className="flex flex-wrap gap-1">
                      {SAMPLE_AFTER_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAfterPhotoUrl(p.url)}
                          className="px-2 py-1 bg-white border border-slate-200 hover:border-emerald-300 text-[10px] font-semibold text-slate-600 rounded-lg cursor-pointer transition-colors"
                        >
                          {p.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notas Técnicas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notas Técnicas / Procedimiento Realizado
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Pulido de porcelanato con sellador, desinfección de mamparas con sales de amonio..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-hidden bg-slate-50/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 text-sm font-semibold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-200 cursor-pointer flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Guardar y Adjuntar Evidencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
