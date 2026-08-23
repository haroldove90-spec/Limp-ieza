import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Calendar,
  CreditCard,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  Send,
  ArrowRight,
  Receipt,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingDown,
  Printer
} from 'lucide-react';
import {
  CleaningService,
  IncidentReport,
  Cycle3DayReport,
  SupplyRequest,
  TransactionRecord
} from '../../../types';
import { ImageViewerModal } from '../../common/ImageViewerModal';

interface ClientDashboardProps {
  activeTab: string;
  services: CleaningService[];
  incidents: IncidentReport[];
  cycleReports: Cycle3DayReport[];
  supplyRequests: SupplyRequest[];
  finances: TransactionRecord[];
  clientName: string;
  onEmitSupplyRequest: (request: Omit<SupplyRequest, 'id' | 'requestDate' | 'status'>) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  activeTab,
  services,
  incidents,
  cycleReports,
  supplyRequests,
  finances,
  clientName,
  onEmitSupplyRequest
}) => {
  const [viewingEvidence, setViewingEvidence] = useState<any | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);

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
      totalEstimatedCost: 2850
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
                Inspección fotográfica de zonas atendidas y registro de incidencias en sus instalaciones
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Garantía de Servicio
              </span>
            </div>
          </div>

          {/* Photo Gallery of Completed/In-Progress Areas */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Galería Fotográfica Antes / Después</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientServices.flatMap((service) =>
                service.evidences.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setViewingEvidence(ev)}
                    className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-slate-400">
                          {service.date} • {ev.timestamp}
                        </span>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                          Ver Comparativa
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-4 bg-slate-900 aspect-16/9">
                        <div className="relative group/img overflow-hidden">
                          <img
                            src={ev.beforePhotoUrl}
                            alt="Antes"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <span className="absolute bottom-2 left-2 bg-slate-900/80 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Antes
                          </span>
                        </div>
                        <div className="relative group/img overflow-hidden">
                          <img
                            src={ev.afterPhotoUrl}
                            alt="Después"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <span className="absolute bottom-2 left-2 bg-slate-900/80 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Después
                          </span>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                        {ev.area}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {ev.notes || 'Limpieza profunda y desinfección completada con éxito.'}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                      <span>Abrir visor completo</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incidents on Client Property */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Reportes de Incidencias en su Inmueble</span>
            </h3>

            {clientIncidents.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium">Sin incidencias registradas en sus instalaciones.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setViewingIncident(inc)}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {inc.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {inc.date} • {inc.time}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm md:text-base">
                      {inc.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {inc.description}
                    </p>

                    {inc.adminResolution && (
                      <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900 font-medium">
                        <span className="font-bold block text-green-950 mb-0.5">
                          Resolución / Acción Tomada:
                        </span>
                        {inc.adminResolution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CONTROL DE INSUMOS (CICLOS DE 3 DÍAS) */}
      {activeTab === 'insumos_cliente' && (
        <div className="space-y-6">
          {orderSuccessAlert && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm md:text-base font-semibold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              ¡Requerimiento de insumos enviado con éxito al Administrador para despacho inmediato!
            </div>
          )}

          {/* 3-Day Cycle Header Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5" /> Ciclo Automático Cada 3 Días
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Informe de Consumo y Balance de Stock
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">
                Periodo Actual: {currentReport.periodStart} al {currentReport.periodEnd} (Ciclo #{currentReport.cycleNumber})
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs md:text-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir / PDF
              </button>
              <button
                onClick={() => setShowOrderModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm transition-all shadow-md shadow-blue-200 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Emitir Requerimiento</span>
              </button>
            </div>
          </div>

          {/* 3-Day Cycle Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base md:text-lg">
                  Balance Detallado de Insumos en Instalaciones
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Monitoreo de mermas, consumo del turno y recomendación de reabastecimiento
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Insumo / Producto</th>
                    <th className="py-3.5 px-4 text-center">Stock Inicial</th>
                    <th className="py-3.5 px-4 text-center text-orange-600">Consumo (3 Días)</th>
                    <th className="py-3.5 px-4 text-center text-green-600">Stock Restante</th>
                    <th className="py-3.5 px-6 text-center">Sugerencia Pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentReport.items.map((item, idx) => {
                    const isLow = item.remainingStock <= (item.initialStock * 0.35);

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {item.supplyName}
                          <span className="block text-xs font-normal text-slate-400">{item.unit}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-slate-700">
                          {item.initialStock}
                        </td>
                        <td className="py-4 px-4 text-center font-bold text-orange-600">
                          -{item.consumed}
                        </td>
                        <td className="py-4 px-4 text-center font-bold">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            isLow ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {item.remainingStock}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                            +{item.recommendedOrder} {item.unit}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supply Requests History */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base md:text-lg mb-4">
              Historial de Pedidos y Requerimientos
            </h3>

            <div className="space-y-3">
              {supplyRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm md:text-base">
                        Pedido #{req.id}
                      </span>
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
                    <span className="text-xs font-medium text-slate-400 block">Total Estimado</span>
                    <span className="text-base font-bold text-slate-900">
                      ${req.totalEstimatedCost.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. AGENDA Y PAGOS */}
      {activeTab === 'agenda_pagos_cliente' && (
        <div className="space-y-6">
          {/* Upcoming visits and history */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visits & Schedule (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg">
                    Calendario de Visitas Programadas
                  </h3>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  Póliza Activa
                </span>
              </div>

              <div className="space-y-3">
                {clientServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm md:text-base">
                          {service.date}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {service.timeSlot}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 font-medium">
                        Personal asignado: <strong className="text-slate-800">{service.operativeName}</strong>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                        service.status === 'completado'
                          ? 'bg-green-100 text-green-700'
                          : service.status === 'en_proceso'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {service.status === 'completado' ? 'Concluido' : service.status === 'en_proceso' ? 'En Curso' : 'Programado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account statement & receipts (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base md:text-lg">
                      Estado de Cuenta
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    Al Corriente
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 text-white mb-4">
                  <span className="text-xs text-slate-400 font-medium block">Póliza Mensual Contratada:</span>
                  <div className="text-3xl font-bold text-green-400 mt-1">
                    $14,500.00 MXN
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    Próximo corte: 31 de Agosto, 2026
                  </p>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Comprobantes y Recibos
                </h4>

                <div className="space-y-2">
                  {finances
                    .filter((f) => f.type === 'ingreso')
                    .slice(0, 3)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedReceipt(tx)}
                        className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-300 bg-slate-50/70 hover:bg-white transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Receipt className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-xs md:text-sm font-semibold text-slate-900 block">
                              {tx.concept}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">{tx.date}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs md:text-sm font-bold text-slate-900 block">
                            ${tx.amount.toLocaleString('es-MX')}
                          </span>
                          <span className="text-[10px] text-green-600 font-bold uppercase">Pagado</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
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
            <p className="text-xs md:text-sm text-slate-400 mb-5 font-medium">
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
                  <Send className="w-4 h-4" /> Confirmar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receipt View */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Comprobante de Pago</h3>
              <p className="text-xs text-slate-400">Folio: {selectedReceipt.id} • {selectedReceipt.date}</p>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Concepto:</span>
                <span className="font-semibold text-slate-800 text-right">{selectedReceipt.concept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emisor:</span>
                <span className="font-medium text-slate-700">CleanPro Servicios Integrales</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Receptor:</span>
                <span className="font-medium text-slate-700">{selectedReceipt.clientOrVendor}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-base">
                <span>Monto Total:</span>
                <span className="text-green-600">${selectedReceipt.amount.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm cursor-pointer"
              >
                Cerrar Comprobante
              </button>
            </div>
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
