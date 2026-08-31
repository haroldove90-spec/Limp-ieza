import React, { useState } from 'react';
import { X, Mail, Send, Copy, Check, Paperclip, MessageSquare, ExternalLink } from 'lucide-react';
import { shareViaWhatsApp, cleanPhoneNumber } from '../../utils/exportUtils';

export interface EmailModalData {
  title: string;
  defaultRecipient?: string;
  defaultPhone?: string;
  defaultSubject: string;
  defaultBody: string;
  reportType?: string;
  attachmentName?: string;
  initialTab?: 'email' | 'whatsapp';
}

interface EmailSenderModalProps {
  data?: EmailModalData | null;
  modalData?: EmailModalData | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const EmailSenderModal: React.FC<EmailSenderModalProps> = ({
  data,
  modalData,
  isOpen,
  onClose
}) => {
  const activeData = modalData || data;
  if (!activeData && isOpen === false) return null;
  if (!activeData) return null;

  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email'>(
    activeData.initialTab || 'whatsapp'
  );
  const [recipient, setRecipient] = useState(activeData.defaultRecipient || '');
  const [phone, setPhone] = useState(activeData.defaultPhone || '');
  const [subject, setSubject] = useState(activeData.defaultSubject || '');
  const [body, setBody] = useState(activeData.defaultBody || '');
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const handleOpenWhatsApp = () => {
    shareViaWhatsApp(body, phone);
    setSentNotice('Abriendo WhatsApp...');
    setTimeout(() => {
      setSentNotice(null);
      onClose();
    }, 2000);
  };

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSentNotice('Abriendo tu cliente de correo...');
    setTimeout(() => {
      setSentNotice(null);
      onClose();
    }, 2000);
  };

  const handleCopyContent = () => {
    const fullText =
      activeTab === 'email'
        ? `Para: ${recipient}\nAsunto: ${subject}\n\n${body}`
        : `${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-100 my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {activeTab === 'whatsapp' ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base md:text-lg">
                {activeData.title || 'Compartir Registro'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Despacho rápido vía WhatsApp o Correo Electrónico
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Compartir por WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeTab === 'email'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Enviar por Correo</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-slate-800 text-sm">
          {sentNotice && (
            <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              {sentNotice}
            </div>
          )}

          {activeData.attachmentName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-2 font-medium">
                <Paperclip className="w-4 h-4 text-blue-600" />
                Documento Referenciado: <strong>{activeData.attachmentName}</strong>
              </span>
              <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                Adjunto
              </span>
            </div>
          )}

          {activeTab === 'whatsapp' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número de Teléfono WhatsApp (Opcional):
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678 (dejar vacío para elegir contacto en WhatsApp)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-emerald-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Si lo dejas en blanco, podrás seleccionar cualquier chat o grupo directamente al abrir WhatsApp.
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mensaje / Contenido del Registro:
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
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              type="button"
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Cerrar
            </button>

            {activeTab === 'whatsapp' ? (
              <button
                onClick={handleOpenWhatsApp}
                type="button"
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-200 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Abrir en WhatsApp</span>
              </button>
            ) : (
              <button
                onClick={handleOpenMailClient}
                type="button"
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Abrir en Mi Correo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
