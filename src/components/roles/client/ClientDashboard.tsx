import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Send,
  ArrowRight,
  FileText,
  ChevronRight,
  Printer
} from 'lucide-react';
import {
  CleaningService,
  IncidentReport,
  Cycle3DayReport,
  SupplyRequest
} from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';

interface ClientDashboardProps {
  activeTab: string;
  services: CleaningService[];
  incidents: IncidentReport[];
  cycleReports: Cycle3DayReport[];
  supplyRequests: SupplyRequest[];
  clientName: string;
  onEmitSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeTab,
  services,
  incidents,
  cycleReports,
  supplyRequests,
  clientName,
  onEmitSupplyRequest
}) => {
  const [viewingEvidence, setViewingEvidence] = useState<any | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);

  // New Supply Request Form State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState([
    { supplyName: 'Jabón Líquido Antibacterial', quantity: 3, unit: 'Garrafas' },
    { supplyName: 'Papel Higiénico Jumbo Bobina', quantity: 20, unit: 'Rollos' },
    { supplyName: 'Toallas Interdobladas Manos', quantity: 25, unit: 'Paquetes' },
    { supplyName: 'Bolsas Basura 90x120 Cal. 600', quantity: 80, unit: 'Piezas' }
  ]);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccessAlert, setOrderSuccessAlert] = useState(false);

  // Filter client data
  const clientServices = services.filter((s) => s.clientName.includes(clientName) || s.clientName.includes('SkyTower'));
  const clientIncidents = incidents.filter((i) => i.clientName.includes(clientName) || i.clientName.includes('SkyTower'));
  const currentReport = cycleReports[0] || cycleReports[0];

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = orderItems.filter((item) => item.quantity > 0);
    if (validItems.length === 0) return;

    onEmitSupplyRequest({
      clientId: 'CLI-01',
      clientName: clientName || 'Oficinas Corporativas SkyTower',
      cycleReportId: currentReport?.id,
      items: validItems,
      notes: orderNotes,
      totalEstimatedCost: 0
    });

    setShowOrderModal(false);
    setOrderSuccessAlert(true);
    setTimeout(() => setOrderSuccessAlert(false), 4000);
  };

  const handleUpdateItemQty = (index: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* 1. EVIDENCIAS DE TRABAJO */}
      {activeTab === 'evidencias_cliente' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Evidencias de Trabajo y Calidad
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Comprobación fotográfica del antes y después de cada servicio ejecutado en tus instalaciones
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-semibold px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl">
                Sede: SkyTower Piso 8
              </span>
            </div>
          </div>

          {/* Evidence Grid by Service */}
          <div className="space-y-6">
            {clientServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base md:text-lg">
                        Servicio: {service.date} ({service.timeSlot})
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        Técnico Operativo: {service.operativeName}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full uppercase self-start sm:self-auto">
                    {service.status === 'completado' ? 'Completado y Auditado' : 'En Ejecución'}
                  </span>
                </div>

                {/* Photo Evidence Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {service.evidences.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setViewingEvidence(ev)}
                      className="group p-3.5 rounded-2xl border border-slate-100 hover:border-blue-300 bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-xs"
                    >
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                        <img
                          src={ev.afterPhotoUrl || ev.beforePhotoUrl}
                          alt={ev.area}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {ev.timestamp}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{ev.area}</h4>
                        <span className="text-xs text-blue-600 font-semibold group-hover:underline">
                          Comparativa →
                        </span>
                      </div>
                      {ev.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Incidents Section */}
          {clientIncidents.length > 0 && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    Notificaciones de Incidencias Operativas
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setViewingIncident(inc)}
                    className="p-4 rounded-2xl border border-orange-100 bg-orange-50/20 hover:bg-orange-50/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                        {inc.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{inc.time}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">{inc.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {inc.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-orange-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{inc.location}</span>
                      <span className="text-blue-600 font-semibold">Ver detalle con foto →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. REPORTE CADA 3 DÍAS Y PEDIDO DE INSUMOS */}
      {activeTab === 'insumos_cliente' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" /> Monitoreo y Suministro
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Consumo y Reabastecimiento de Insumos
              </h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Informe de inventario en tus instalaciones con solicitud directa de reposición de insumos
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
              >
                <Plus className="w-4 h-4" /> Solicitar Suministro Faltante
              </button>
            </div>
          </div>

          {orderSuccessAlert && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              Tu requerimiento de insumos ha sido emitido con éxito a la central de CleanPro.
            </div>
          )}

          {/* Current 3-Day Report Card */}
          {currentReport && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    {currentReport.reportName}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Período auditado: {currentReport.period} • Supervisado por:{' '}
                    <strong className="text-slate-700">{currentReport.supervisorName}</strong>
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase self-start sm:self-auto">
                  Reporte Vigente
                </span>
              </div>

              {/* Items Inventory Status (Quantities only, NO prices) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentReport.items.map((item) => {
                  const percent = Math.round((item.currentRemaining / item.initialStock) * 100);
                  const isCriticallyLow = percent < 30;

                  return (
                    <div
                      key={item.supplyId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCriticallyLow
                          ? 'bg-orange-50/40 border-orange-200'
                          : 'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.unit}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isCriticallyLow
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {isCriticallyLow ? 'Reposición Sugerida' : 'Nivel Adecuado'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm mb-1">{item.supplyName}</h4>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Restante en Sitio:</span>
                          <span className="text-slate-800 font-bold">
                            {item.currentRemaining} / {item.initialStock} {item.unit}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCriticallyLow ? 'bg-orange-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                          <span>Consumido: {item.consumed3Days} {item.unit}</span>
                          <span className="font-medium">{percent}% restante</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommended Reorder Summary (Quantities ONLY) */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm md:text-base">
                    Sugerencia Operativa de Reposición:
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {currentReport.items
                      .filter((i) => i.suggestedReorder > 0)
                      .map((i) => `${i.suggestedReorder} ${i.unit} de ${i.supplyName}`)
                      .join(' • ')}
                  </p>
                </div>

                <button
                  onClick={() => setShowOrderModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all shrink-0"
                >
                  <Send className="w-4 h-4" /> Solicitar este Lote
                </button>
              </div>
            </div>
          )}

          {/* Supply Requests History */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base md:text-lg">
              Historial de Requerimientos de Insumos Emitidos
            </h3>

            <div className="space-y-3">
              {supplyRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{req.id}</span>
                      <span className="text-xs text-slate-400">({req.requestDate})</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          req.status === 'despachado'
                            ? 'bg-green-100 text-green-700'
                            : req.status === 'aprobado'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {req.status === 'despachado'
                          ? 'Despachado en Sede'
                          : req.status === 'aprobado'
                          ? 'Aprobado para Entrega'
                          : 'Pendiente de Aprobación'}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-600 font-medium">
                      {req.items.map((i) => `${i.quantity} ${i.unit} de ${i.supplyName}`).join(' • ')}
                    </p>
                    {req.notes && (
                      <p className="text-xs text-slate-400 italic mt-1">Nota: {req.notes}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                      {req.items.reduce((sum, item) => sum + item.quantity, 0)} unidades solicitadas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Emit Supply Request */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              Emitir Requerimiento de Insumos
            </h3>
            <p className="text-xs text-slate-400 mb-5 font-medium">
              Ajusta las cantidades con base en el informe de 3 días para su despacho
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 text-sm block">
                        {item.supplyName}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Unidad: {item.unit}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, -1)}
                        className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateItemQty(idx, 1)}
                        className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white flex items-center justify-center cursor-pointer shadow-sm shadow-blue-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Instrucciones o notas de entrega:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entregar en piso 8 con la asistente de recepción"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-semibold text-xs md:text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200"
                >
                  <Send className="w-4 h-4" /> Confirmar Solicitud
                </button>
              </div>
            </form>
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
