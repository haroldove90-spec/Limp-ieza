import React, { useState } from 'react';
import { X, ArrowLeftRight, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PhotoEvidence } from '../../types';

interface ImageViewerModalProps {
  evidence?: PhotoEvidence | null;
  incidentPhotoUrl?: string;
  incidentTitle?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  evidence,
  incidentPhotoUrl,
  incidentTitle,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'both' | 'before' | 'after'>('both');

  if (!evidence && !incidentPhotoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-100">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">
              {evidence ? `Evidencia: ${evidence.area}` : `Incidencia: ${incidentTitle}`}
            </h3>
            {evidence && (
              <p className="text-xs md:text-sm text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Registrado a las {evidence.timestamp}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evidence View Mode Toggles */}
        {evidence && evidence.beforePhotoUrl && evidence.afterPhotoUrl && (
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveView('both')}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'both' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5" /> Vista Comparativa
              </span>
            </button>
            <button
              onClick={() => setActiveView('before')}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'before' ? 'bg-orange-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Solo Antes
            </button>
            <button
              onClick={() => setActiveView('after')}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeView === 'after' ? 'bg-green-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Solo Después
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 bg-[#F8FAFC]">
          {incidentPhotoUrl ? (
            <div className="flex flex-col items-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-md max-h-[60vh]">
                <img
                  src={incidentPhotoUrl}
                  alt={incidentTitle || 'Incidencia'}
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
                <div className="absolute top-3 left-3 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Evidencia de Incidencia
                </div>
              </div>
            </div>
          ) : evidence ? (
            <div className="space-y-4">
              {activeView === 'both' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-3 py-1 rounded-full">
                        1. Estado Inicial (Antes)
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center">
                      {evidence.beforePhotoUrl ? (
                        <img
                          src={evidence.beforePhotoUrl}
                          alt="Estado Inicial"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Sin foto previa</span>
                      )}
                    </div>
                  </div>

                  {/* After */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-green-800 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 2. Resultado Final (Después)
                      </span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center">
                      {evidence.afterPhotoUrl ? (
                        <img
                          src={evidence.afterPhotoUrl}
                          alt="Resultado Final"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">Sin foto posterior</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeView === 'before' ? (
                <div className="rounded-2xl overflow-hidden border border-orange-300 shadow-md">
                  <img
                    src={evidence.beforePhotoUrl}
                    alt="Antes"
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-green-300 shadow-md">
                  <img
                    src={evidence.afterPhotoUrl}
                    alt="Después"
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                </div>
              )}

              {evidence.notes && (
                <div className="bg-white p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Observaciones técnicas de la zona:
                  </span>
                  <p className="text-slate-700 text-sm md:text-base font-medium">
                    {evidence.notes}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-md shadow-slate-200"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
