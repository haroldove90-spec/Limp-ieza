import React, { useState } from 'react';
import { X, Mail, Send, Copy, Check, ExternalLink, FileText, Paperclip } from 'lucide-react';

export interface EmailModalData {
  title: string;
  defaultRecipient: string;
  defaultSubject: string;
  defaultBody: string;
  reportType?: string;
  attachmentName?: string;
}

interface EmailSenderModalProps {
  data: EmailModalData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSenderModal: React.FC<EmailSenderModalProps> = ({
  data,
  isOpen,
  onClose
}) => {
  if (!isOpen || !data) return null;

  const [recipient, setRecipient] = useState(data.defaultRecipient || '');
  const [subject, setSubject] = useState(data.defaultSubject || '');
  const [body, setBody] = useState(data.defaultBody || '');
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(false);

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      onClose();
    }, 2500);
  };

  const handleCopyContent = () => {
    const fullText = `Para: ${recipient}\nAsunto: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-100 my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                {data.title || 'Enviar Reporte por Correo'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Despacho formal con datos y formato estructurado
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-slate-800 text-sm">
          {sentNotice && (
            <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Abriendo tu cliente de correo (Gmail/Outlook)... Despacho en proceso.
            </div>
          )}

          {data.attachmentName && (
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
              <span className="flex items-center gap-2 font-medium">
                <Paperclip className="w-4 h-4 text-blue-600" />
                Documento Referenciado: <strong>{data.attachmentName}</strong>
              </span>
              <span className="text-[10px] font-bold uppercase bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded-md">
                Incluido
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Destinatario (Email):
            </label>
            <input
              type="email"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="cliente@empresa.com, direccion@cleanpro.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Asunto del Correo:
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Cuerpo del Mensaje:
            </label>
            <textarea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm bg-white focus:outline-blue-500 font-mono leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyContent}
            type="button"
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span>Copiado al Portapapeles</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Contenido</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleOpenMailClient}
              type="button"
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Abrir en Mi Correo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
