import React, { useRef, useState, useEffect } from 'react';
import { X, CheckCircle, RotateCcw, PenTool, User, Briefcase, FileCheck, ShieldCheck } from 'lucide-react';
import { CleaningService } from '../../types';
import { COMPANY_BRAND } from '../../constants/branding';

interface ClientSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: CleaningService;
  onSaveSignature: (
    serviceId: string,
    signature: {
      signedBy: string;
      signatureDataUrl: string;
      signedAt: string;
      comments?: string;
    }
  ) => void;
}

export const ClientSignatureModal: React.FC<ClientSignatureModalProps> = ({
  isOpen,
  onClose,
  service,
  onSaveSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Responsable en Sitio');
  const [comments, setComments] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clear canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setErrorMsg(null);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Drawing mouse/touch handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) {
      setErrorMsg('Por favor introduce el nombre de la persona que firma la conformidad.');
      return;
    }
    if (!hasSignature) {
      setErrorMsg('Por favor solicita la firma del cliente en el recuadro digital.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');

    onSaveSignature(service.id, {
      signedBy: `${signerName.trim()} (${signerRole.trim()})`,
      signatureDataUrl,
      signedAt: new Date().toLocaleString('es-MX'),
      comments: comments.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Firma Digital de Conformidad</h3>
              <p className="text-xs text-slate-400">Validación de servicio en sitio por el cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700">
            <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
              <span>{service.clientName}</span>
              <span className="text-blue-600 uppercase text-[10px] tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {service.id}
              </span>
            </div>
            <p className="text-slate-500">
              Técnico Operativo: <strong className="text-slate-800">{service.operativeName}</strong> • {service.date} ({service.timeSlot})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Nombre del Receptor:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Lic. Laura Gutiérrez"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                Puesto / Cargo:
              </label>
              <input
                type="text"
                placeholder="Ej. Gerente de Instalaciones"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Canvas Signature Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-blue-600" />
                Firma Digital en Pantalla:
              </label>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar trazo
              </button>
            </div>
            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden h-36 touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs">
                  <PenTool className="w-6 h-6 mb-1 text-slate-300" />
                  <span>Firme aquí con el dedo o puntero</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Observaciones o Comentarios del Cliente (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ej. Servicio recibido a entera satisfacción."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-blue-600"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validez digital {COMPANY_BRAND.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Confirmar y Guardar Firma
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
