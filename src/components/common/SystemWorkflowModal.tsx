import React, { useState } from 'react';
import {
  Calendar,
  Camera,
  FileSignature,
  Layers,
  ShieldCheck,
  Download,
  Printer,
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  HardHat,
  Building2,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Users
} from 'lucide-react';
import { COMPANY_BRAND } from '../../constants/branding';
import {
  downloadSystemWorkflowPDF,
  shareWorkflowViaWhatsApp,
  buildWorkflowWhatsAppSummary
} from '../../utils/workflowDocumentUtils';
import { shareViaEmail } from '../../utils/exportUtils';

interface SystemWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
}

export const SystemWorkflowModal: React.FC<SystemWorkflowModalProps> = ({
  isOpen,
  onClose,
  clientName = 'Oficinas Corporativas SkyTower'
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [copiedAlert, setCopiedAlert] = useState(false);

  if (!isOpen) return null;

  const phases = [
    {
      id: 1,
      title: 'Fase 1: Programación y Despacho Digital',
      subtitle: 'Planificación de turnos y notificación al técnico',
      badge: 'Despacho',
      badgeColor: 'bg-blue-100 text-blue-700',
      icon: Calendar,
      actor: 'Administrador / Supervisor',
      details: [
        'Planificación del calendario de servicios según requerimiento del cliente.',
        'Asignación de técnicos operativos certificados con su Kit de limpieza y EPP completo.',
        'Despacho digital directo por WhatsApp con ubicación en Google Maps, folio y checklist preconfigurado de tareas.',
        'Trazabilidad en tiempo real del estado de asignación.'
      ],
      clientBenefit: 'Puntualidad garantizada, confirmación previa del personal que asistirá y trazabilidad desde el primer minuto.'
    },
    {
      id: 2,
      title: 'Fase 2: Ejecución en Sitio y Control de Calidad',
      subtitle: 'Limpieza especializada y auditoría fotográfica',
      badge: 'En Campo',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: Camera,
      actor: 'Técnico Operativo en Sitio',
      details: [
        'Check-In en plataforma al ingresar a las instalaciones del cliente.',
        'Cumplimiento sistemático del Checklist (sanitarios, pisos, escritorios, canceles, recolección de basura).',
        'Registro obligatorio de fotos de ANTES y DESPUÉS con sello automático de fecha y hora.',
        'Levantamiento inmediato de Incidencias Previas (fugas, desperfectos o daños preexistentes) para deslinde y notificación inmediata al cliente.'
      ],
      clientBenefit: 'Verificación visual irrefutable de la calidad del servicio realizado y protección contra reclamos de daños preexistentes.'
    },
    {
      id: 3,
      title: 'Fase 3: Firma en Sitio y Envío por WhatsApp',
      subtitle: 'Validación física y entrega inmediata de evidencias con fotos',
      badge: 'WhatsApp + Firma',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: FileSignature,
      actor: 'Cliente en Sitio + Técnico',
      details: [
        'Revisión presencial del estado de las instalaciones con el responsable designado por el cliente.',
        'Captura de Firma Electrónica en pantalla táctil del móvil del técnico con nombre y cargo.',
        'Envío Automatizado por WhatsApp del reporte completo con fotografías de ANTES y DESPUÉS de cada área y checklist auditado.',
        'Generación de la Orden Oficial de Servicio firmada para respaldo mutuo.'
      ],
      clientBenefit: 'Recibe en tiempo real en su WhatsApp el reporte con fotos de alta calidad y la firma de conformidad sin esperas.'
    },
    {
      id: 4,
      title: 'Fase 4: Bóveda de Resguardo Histórico ante Reclamaciones',
      subtitle: 'Trazabilidad inmutable para solventar dudas o reclamos posteriores',
      badge: 'Resguardo Inmutable',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Layers,
      actor: 'Administración del Cliente y Supervisión Sers',
      details: [
        'Bóveda de Resguardo Inmutable: Fotos, bitácoras y firmas archivadas de forma permanente y no alterable.',
        'Blindaje ante Reclamaciones Posteriores (Ej. reclamo el viernes por servicio de lunes): Consulta inmediata por fecha o folio y descarga del Expediente de Auditoría en PDF para deslinde y aclaración transparente.',
        'Portal del Cliente 24/7 con control de insumos en ciclos de 3 días (papel, jabón, toallas) para prevenir desabastos.',
        'Módulo de Pedido de Insumos en 1 clic y descarga de bitácoras en Excel/PDF.'
      ],
      clientBenefit: 'Certeza jurídica y operativa total: cualquier reclamo posterior se solventa en minutos con evidencias fechadas y firmadas.'
    },
    {
      id: 5,
      title: 'Fase 5: Supervisión y Acuerdos de Nivel de Servicio (SLA)',
      subtitle: 'Dirección operativa, mejora continua y facturación',
      badge: 'Gobernanza',
      badgeColor: 'bg-slate-100 text-slate-800',
      icon: ShieldCheck,
      actor: 'Dirección General Sers',
      details: [
        'Auditorías periódicas de calidad y supervisión de protocolos por el personal administrativo.',
        'Reportes mensuales consolidados de rendimiento, horas de atención y satisfacción.',
        'Facturación transparente y conciliación de cuotas de mantenimiento mensual.',
        'Atención prioritaria para requerimientos especiales o eventos corporativos.'
      ],
      clientBenefit: 'Tranquilidad absoluta de contar con una empresa formal, estructurada y comprometida con altos estándares de calidad.'
    }
  ];

  const handleCopyText = () => {
    const text = buildWorkflowWhatsAppSummary(clientName);
    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 3000);
  };

  const handleEmailSend = () => {
    const subject = `[PROTOCOLO DE SERVICIO Y FLUJO OPERATIVO] ${COMPANY_BRAND.name} - ${clientName}`;
    const body = buildWorkflowWhatsAppSummary(clientName);
    shareViaEmail('', subject, body);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-fadeIn">
        {/* Modal Top Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
              <img
                src={COMPANY_BRAND.logoUrl}
                alt={COMPANY_BRAND.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Flujo de Trabajo Operativo
                </h3>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase">
                  Para Clientes
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Protocolo oficial de operación, control de calidad y auditoría de <strong className="text-slate-700">{COMPANY_BRAND.legalName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Quick Action Bar (Download PDF & Share) */}
        <div className="p-3 sm:px-6 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-blue-900 font-semibold">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Documento listo para entrega comercial y validación con el cliente: <strong>{clientName}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => downloadSystemWorkflowPDF(clientName)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={() => shareWorkflowViaWhatsApp(clientName)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleEmailSend}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Correo</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              {copiedAlert ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Phase Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {phases.map((phase) => {
              const Icon = phase.icon;
              const isSelected = selectedPhase === phase.id;
              return (
                <button
                  key={phase.id}
                  onClick={() => setSelectedPhase(phase.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                        isSelected ? 'bg-white text-blue-700' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {phase.id}
                    </span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-xs font-bold leading-tight line-clamp-2">
                    {phase.title.split(':')[1] || phase.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Phase Deep Dive */}
          {(() => {
            const current = phases.find((p) => p.id === selectedPhase) || phases[0];
            const Icon = current.icon;
            return (
              <div className="p-5 sm:p-6 bg-slate-50/70 rounded-3xl border border-slate-200/80 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        {current.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{current.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Responsable: <strong className="text-slate-800">{current.actor}</strong>
                    </span>
                  </div>
                </div>

                {/* Step details checklist */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actividades y Protocolos Ejecutados:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {current.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white rounded-2xl border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2 shadow-2xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Value for client */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-emerald-950 mb-0.5">
                      Beneficio y Garantía para el Cliente:
                    </strong>
                    <span>{current.clientBenefit}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SLA Quick Summary Table */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Acuerdos de Nivel de Servicio (SLA) y Tiempos de Respuesta
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2.5 rounded-l-xl">Concepto</th>
                    <th className="p-2.5">Estándar de Calidad</th>
                    <th className="p-2.5">Canal Oficial</th>
                    <th className="p-2.5 rounded-r-xl">Comprobación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">Puntualidad en Turnos</td>
                    <td className="p-2.5">Arribo en ventana asignada</td>
                    <td className="p-2.5">WhatsApp / Notificación</td>
                    <td className="p-2.5">Check-in con GPS en tiempo real</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">Reporte de Incidencias</td>
                    <td className="p-2.5">&lt; 30 min con evidencia gráfica</td>
                    <td className="p-2.5">WhatsApp y Correo</td>
                    <td className="p-2.5">Acta formal con Folio único</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">Reabastecimiento de Insumos</td>
                    <td className="p-2.5">Entrega en 24 a 48 hrs</td>
                    <td className="p-2.5">Portal de Suministros</td>
                    <td className="p-2.5">Vale digital de entrega</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-800">Auditoría Fotográfica</td>
                    <td className="p-2.5">Fotos Antes/Después por área</td>
                    <td className="p-2.5">Portal Web Cliente</td>
                    <td className="p-2.5">Descargable en PDF / Excel</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span>© 2026 {COMPANY_BRAND.legalName} • {COMPANY_BRAND.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => downloadSystemWorkflowPDF(clientName)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-200 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Documento Oficial en PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
