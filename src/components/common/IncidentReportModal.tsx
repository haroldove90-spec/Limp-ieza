import React from 'react';
import { X, Printer, Download, MapPin, Clock, Calendar, User, ShieldAlert, CheckCircle } from 'lucide-react';
import { IncidentReport } from '../../types';

interface IncidentReportModalProps {
  incident: IncidentReport | null;
  onClose: () => void;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  incident,
  onClose
}) => {
  if (!incident) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `=====================================================
CLEANPRO - REPORTE TÉCNICO OFICIAL DE INCIDENCIA
Folio: ${incident.id}
Fecha de Emisión: ${incident.date} ${incident.time}
=====================================================

DATOS DEL CLIENTE Y SERVICIO:
- Cliente: ${incident.clientName}
- Servicio / Folio: ${incident.serviceId}
- Ubicación Exacta: ${incident.location}
- Técnico Operativo: ${incident.operativeName}

DETALLES DE LA INCIDENCIA:
- Tipo: ${incident.type.toUpperCase().replace('_', ' ')}
- Título: ${incident.title}
- Descripción: ${incident.description}
- Estatus: ${incident.status.toUpperCase()}

RESOLUCIÓN / DICTAMEN DE ADMINISTRACIÓN:
${incident.adminResolution || 'En proceso de dictamen y seguimiento.'}

Evidencia Fotográfica: ${incident.photoUrl || 'No adjunta'}
=====================================================
CleanPro Servicios Integrales S.A. de C.V.
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Incidencia_${incident.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const typeLabels: Record<string, string> = {
    daño_previo: 'Daño Previo Detectado',
    zona_inaccesible: 'Zona Inaccesible / Bloqueada',
    falta_suministro: 'Falta de Suministro (Agua / Luz)',
    cliente_ausente: 'Sin Acceso / Cliente Ausente',
    otro: 'Incidencia Operativa'
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-100 my-auto">
        {/* Modal Top Bar (Actions) */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Vista Previa de Reporte Oficial
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>TXT</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 md:p-10 space-y-6 text-slate-800 bg-white">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-start pb-6 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg">
                  CP
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    CleanPro Servicios Integrales
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Control Operativo y Dictámenes Técnicos
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                RFC: CSI190423-LK9 • Insurgentes Sur #1450, Benito Juárez, CDMX
              </p>
            </div>

            <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 sm:min-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                FOLIO DE REPORTE
              </span>
              <span className="text-lg font-extrabold text-slate-900 block font-mono">
                {incident.id}
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-1">
                Fecha: <strong>{incident.date}</strong> ({incident.time})
              </span>
            </div>
          </div>

          {/* Title and Classification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-orange-50/70 border border-orange-200 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                  {typeLabels[incident.type] || incident.type}
                </span>
                <h2 className="text-base md:text-lg font-bold text-slate-900">
                  {incident.title}
                </h2>
              </div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                incident.status === 'resuelto' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {incident.status === 'resuelto' ? 'Resuelto / Validado' : 'En Revisión'}
              </span>
            </div>
          </div>

          {/* Service & Location Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Cliente / Instalación:
              </span>
              <strong className="text-slate-900 font-semibold text-sm md:text-base block mt-0.5">
                {incident.clientName}
              </strong>
              <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                Servicio Asociado: {incident.serviceId}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Ubicación Exacta en Sitio:
              </span>
              <strong className="text-slate-900 font-semibold text-sm md:text-base block mt-0.5">
                {incident.location}
              </strong>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Hora del Registro:
              </span>
              <span className="text-slate-800 font-medium text-sm block mt-0.5">
                {incident.time} hrs • {incident.date}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Técnico Operativo Responsable:
              </span>
              <span className="text-slate-800 font-medium text-sm block mt-0.5">
                {incident.operativeName}
              </span>
            </div>
          </div>

          {/* Detailed Observations */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Descripción y Circunstancias del Hecho:
            </h3>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm leading-relaxed">
              {incident.description}
            </div>
          </div>

          {/* Photo Evidence */}
          {incident.photoUrl && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evidencia Fotográfica Adjunta:
              </h3>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72 flex items-center justify-center">
                <img
                  src={incident.photoUrl}
                  alt={incident.title}
                  className="w-full h-full max-h-72 object-contain"
                />
              </div>
            </div>
          )}

          {/* Resolution section */}
          {incident.adminResolution && (
            <div className="p-4.5 rounded-2xl bg-green-50/70 border border-green-200 text-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-green-900 block flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" /> Dictamen de Administración / Acción Tomada:
              </span>
              <p className="text-green-950 font-medium">
                {incident.adminResolution}
              </p>
            </div>
          )}

          {/* Document Signatures Footer */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-800">
                {incident.operativeName}
              </div>
              <span className="text-slate-400">Firma Técnico en Campo</span>
            </div>
            <div>
              <div className="border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-800">
                Dirección de Operaciones
              </div>
              <span className="text-slate-400">Firma y Sello de Validación</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors cursor-pointer shadow-md shadow-slate-200"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};
