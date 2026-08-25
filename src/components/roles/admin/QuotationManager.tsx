import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Building,
  User,
  CheckCircle,
  FileCheck,
  Percent,
  Calendar,
  Send,
  Eye,
  Edit3
} from 'lucide-react';
import { Quotation, QuotationItem } from '../../../types';

interface QuotationManagerProps {
  quotations: Quotation[];
  onSaveQuotation: (quotation: Quotation) => void;
  onUpdateStatus: (quotationId: string, status: Quotation['status']) => void;
}

export const QuotationManager: React.FC<QuotationManagerProps> = ({
  quotations,
  onSaveQuotation,
  onUpdateStatus
}) => {
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(quotations[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form states for creating / editing
  const [formData, setFormData] = useState<Quotation>(
    selectedQuotation || {
      id: `QUO-${Date.now()}`,
      folio: `COT-${new Date().getMonth() + 1}${new Date().getDate()}-01`,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      companyName: 'CleanPro Servicios Integrales S.A. de C.V.',
      companyTaxId: 'CSI190423-LK9',
      companyPhone: '+52 (55) 8000-9200',
      companyEmail: 'contacto@cleanproservicios.com',
      companyAddress: 'Av. Insurgentes Sur #1450, Piso 5, Benito Juárez, CDMX',
      clientName: '',
      clientContact: '',
      clientTaxId: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      items: [
        {
          id: 'QI-1',
          serviceType: 'Limpieza Corporativa Diaria',
          description: 'Limpieza profunda de áreas comunes, oficinas y sanitarios.',
          unit: 'Mensual',
          unitCost: 15000,
          quantity: 1,
          subtotal: 15000
        }
      ],
      subtotal: 15000,
      taxRate: 0.16,
      taxAmount: 2400,
      total: 17400,
      serviceConditions: '• Todo el personal cuenta con Seguro Social (IMSS) y EPP completo.\n• Insumos y químicos ecológicos incluidos.\n• Horario convenido de lunes a viernes.',
      paymentTerms: '50% anticipo al iniciar y 50% al término de mes / Crédito a 15 días.',
      deliveryTime: 'Inicio de labores dentro de los 3 días hábiles posteriores a la aceptación.',
      notes: 'Precios expresados en Moneda Nacional (MXN). Incluye supervisión semanal.',
      status: 'borrador'
    }
  );

  const calculateTotals = (items: QuotationItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const updatedItems = [...formData.items];
    const currentItem = { ...updatedItems[index], [field]: value };
    if (field === 'unitCost' || field === 'quantity') {
      const cost = field === 'unitCost' ? Number(value) || 0 : currentItem.unitCost;
      const qty = field === 'quantity' ? Number(value) || 0 : currentItem.quantity;
      currentItem.subtotal = cost * qty;
    }
    updatedItems[index] = currentItem;

    const { subtotal, taxAmount, total } = calculateTotals(updatedItems, formData.taxRate);
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: `QI-${Date.now()}`,
      serviceType: 'Servicio Específico',
      description: '',
      unit: 'm²',
      unitCost: 100,
      quantity: 1,
      subtotal: 100
    };
    const updatedItems = [...formData.items, newItem];
    const { subtotal, taxAmount, total } = calculateTotals(updatedItems, formData.taxRate);
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    const updatedItems = formData.items.filter((_, idx) => idx !== index);
    const { subtotal, taxAmount, total } = calculateTotals(updatedItems, formData.taxRate);
    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount,
      total
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveQuotation(formData);
    setSelectedQuotation(formData);
    setIsEditing(false);
  };

  const handleNewQuotation = () => {
    const newQuo: Quotation = {
      id: `QUO-${Date.now()}`,
      folio: `COT-${new Date().getMonth() + 1}${new Date().getDate()}-${(quotations.length + 1).toString().padStart(2, '0')}`,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      companyName: 'CleanPro Servicios Integrales S.A. de C.V.',
      companyTaxId: 'CSI190423-LK9',
      companyPhone: '+52 (55) 8000-9200',
      companyEmail: 'contacto@cleanproservicios.com',
      companyAddress: 'Av. Insurgentes Sur #1450, Piso 5, Benito Juárez, CDMX',
      clientName: '',
      clientContact: '',
      clientTaxId: '',
      clientPhone: '',
      clientEmail: '',
      clientAddress: '',
      items: [
        {
          id: `QI-${Date.now()}-1`,
          serviceType: 'Limpieza y Sanitización Profesional',
          description: 'Mapeo, aspirado de alfombra, desinfección de sanitarios y cristales.',
          unit: 'Mensual',
          unitCost: 14500,
          quantity: 1,
          subtotal: 14500
        }
      ],
      subtotal: 14500,
      taxRate: 0.16,
      taxAmount: 2320,
      total: 16820,
      serviceConditions: '• El servicio incluye supervisión continua y reporte fotográfico de evidencias.\n• Personal con IMSS y equipo de protección personal reglamentario.',
      paymentTerms: 'Pago mensual o quincenal contra factura.',
      deliveryTime: 'Inicio a convenir con el cliente tras la formalización.',
      notes: 'Cotización sujeta a términos y condiciones generales.',
      status: 'borrador'
    };
    setFormData(newQuo);
    setIsEditing(true);
  };

  const currentViewing = selectedQuotation || formData;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" /> Módulo Comercial y Cotizaciones
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Cotizador Profesional de Servicios
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Genera presupuestos formales con datos de la empresa, cliente, conceptos, costos y condiciones con exportación en PDF
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleNewQuotation}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva Cotización
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quotations List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">
              Cotizaciones Emitidas ({quotations.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {quotations.map((q) => {
              const isSelected = selectedQuotation?.id === q.id && !isEditing;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuotation(q);
                    setFormData(q);
                    setIsEditing(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                      : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-blue-700">
                      {q.folio}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        q.status === 'aceptada'
                          ? 'bg-green-100 text-green-800'
                          : q.status === 'enviada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm truncate">
                    {q.clientName || 'Cliente sin asignar'}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200/60 font-medium">
                    <span>{q.date}</span>
                    <strong className="text-slate-900 font-bold">
                      ${q.total.toLocaleString('es-MX')} MXN
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor or Preview (8 cols) */}
        <div className="lg:col-span-8">
          {isEditing ? (
            /* FORM EDITOR */
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {formData.id ? 'Editar Cotización' : 'Nueva Cotización'}
                  </h3>
                  <p className="text-xs text-slate-400">Folio asignado: {formData.folio}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-200"
                  >
                    <CheckCircle className="w-4 h-4" /> Guardar Cotización
                  </button>
                </div>
              </div>

              {/* Company & Client Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" /> Datos de la Empresa (Emisor)
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Razón Social / Nombre:</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">RFC / Tax ID:</label>
                      <input
                        type="text"
                        value={formData.companyTaxId}
                        onChange={(e) => setFormData({ ...formData, companyTaxId: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Teléfono:</label>
                      <input
                        type="text"
                        value={formData.companyPhone}
                        onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Dirección:</label>
                    <input
                      type="text"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* Client Details */}
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" /> Datos del Cliente (Receptor)
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Nombre / Empresa:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Corporativo Santa Fe"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Atención a / Contacto:</label>
                    <input
                      type="text"
                      placeholder="Lic. Mario Estrada (Gerente de Compras)"
                      value={formData.clientContact}
                      onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Teléfono:</label>
                      <input
                        type="text"
                        placeholder="+52 55..."
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Correo:</label>
                      <input
                        type="email"
                        placeholder="contacto@empresa.com"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">Dirección de Servicio:</label>
                    <input
                      type="text"
                      placeholder="Calle, Número, Colonia, Ciudad"
                      value={formData.clientAddress}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items / Concepts Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">
                    Conceptos y Servicios a Cotizar
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Concepto
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Servicio:</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Limpieza Profunda de Pisos"
                            value={item.serviceType}
                            onChange={(e) => handleItemChange(idx, 'serviceType', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Unidad:</label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="m²">m²</option>
                            <option value="Mensual">Mensual</option>
                            <option value="Turno">Turno</option>
                            <option value="Día">Día</option>
                            <option value="Horas">Horas</option>
                            <option value="Pza">Pza</option>
                            <option value="Lote">Lote</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Costo Unit.:</label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitCost}
                            onChange={(e) => handleItemChange(idx, 'unitCost', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Cant.:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono text-center"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-end justify-between gap-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Subtotal:</span>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              ${item.subtotal.toLocaleString('es-MX')}
                            </span>
                          </div>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Descripción detallada de alcances, áreas a intervenir, productos a emplear..."
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions & Payment Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Condiciones del Servicio:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.serviceConditions}
                    onChange={(e) => setFormData({ ...formData, serviceConditions: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  ></textarea>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Forma de Pago y Validez:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  ></textarea>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-xs space-y-1">
                  <span className="text-slate-400">Vigencia: {formData.validUntil}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Tasa IVA:</span>
                    <span className="font-bold text-blue-400">{(formData.taxRate * 100)}%</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs text-slate-300">
                    Subtotal: <strong className="text-white">${formData.subtotal.toLocaleString('es-MX')} MXN</strong>
                  </div>
                  <div className="text-xs text-slate-300">
                    IVA (16%): <strong className="text-white">${formData.taxAmount.toLocaleString('es-MX')} MXN</strong>
                  </div>
                  <div className="text-xl font-bold text-green-400 pt-1 border-t border-slate-700">
                    Total: ${formData.total.toLocaleString('es-MX')} MXN
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* PROFESSIONAL PREVIEW & ACTIONS */
            <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-8 print:p-0">
              {/* Preview Action Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 print:hidden">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentViewing.status === 'aceptada'
                      ? 'bg-green-100 text-green-800'
                      : currentViewing.status === 'enviada'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentViewing.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Vigencia hasta: <strong>{currentViewing.validUntil}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Editar
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
                  >
                    <Printer className="w-4 h-4" /> Imprimir / PDF
                  </button>
                </div>
              </div>

              {/* PRINTABLE DOCUMENT BODY */}
              <div className="space-y-6">
                {/* Header: Emisor & Folio */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xl">
                        CP
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {currentViewing.companyName}
                        </h2>
                        <span className="text-xs text-slate-500 font-medium">
                          Servicios Profesionales de Limpieza y Mantenimiento
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 space-y-0.5">
                      <p>RFC: {currentViewing.companyTaxId} • Tel: {currentViewing.companyPhone}</p>
                      <p>{currentViewing.companyEmail} • {currentViewing.companyAddress}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 sm:min-w-[220px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      COTIZACIÓN / PRESUPUESTO
                    </span>
                    <span className="text-xl font-extrabold text-blue-700 block font-mono">
                      {currentViewing.folio}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      Fecha: <strong>{currentViewing.date}</strong>
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Vigencia: <strong>{currentViewing.validUntil}</strong>
                    </span>
                  </div>
                </div>

                {/* Client Info Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    PROPUESTA ECONÓMICA PREPARADA PARA:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <strong className="text-base text-slate-900 block">
                        {currentViewing.clientName || 'Cliente Corporativo'}
                      </strong>
                      <span className="text-xs text-slate-600 block">
                        Atención: {currentViewing.clientContact || 'Dirección de Operaciones'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5 sm:text-right">
                      <p>{currentViewing.clientPhone || 'Teléfono no especificado'}</p>
                      <p>{currentViewing.clientEmail || 'Correo no especificado'}</p>
                      <p>{currentViewing.clientAddress || 'Dirección a convenir'}</p>
                    </div>
                  </div>
                </div>

                {/* Concepts Table */}
                <div>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3 px-4">Concepto / Tipo de Servicio</th>
                        <th className="py-3 px-3 text-center">Unidad</th>
                        <th className="py-3 px-3 text-right">Costo Unit.</th>
                        <th className="py-3 px-3 text-center">Cant.</th>
                        <th className="py-3 px-4 text-right">Importe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentViewing.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-900 block">
                              {item.serviceType}
                            </span>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center text-xs font-semibold text-slate-600">
                            {item.unit}
                          </td>
                          <td className="py-4 px-3 text-right font-mono text-slate-700">
                            ${item.unitCost.toLocaleString('es-MX')}
                          </td>
                          <td className="py-4 px-3 text-center font-bold text-slate-800">
                            {item.quantity}
                          </td>
                          <td className="py-4 px-4 text-right font-bold font-mono text-slate-900">
                            ${item.subtotal.toLocaleString('es-MX')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary & Totals */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500 max-w-sm space-y-1.5">
                    {currentViewing.notes && (
                      <p><strong>Nota:</strong> {currentViewing.notes}</p>
                    )}
                    <p><strong>Condiciones de entrega:</strong> {currentViewing.deliveryTime}</p>
                  </div>

                  <div className="w-full sm:w-64 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>Subtotal:</span>
                      <span className="font-bold font-mono text-slate-900">
                        ${currentViewing.subtotal.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>IVA (16%):</span>
                      <span className="font-bold font-mono text-slate-900">
                        ${currentViewing.taxAmount.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total:</span>
                      <span className="text-blue-700 font-mono">
                        ${currentViewing.total.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Conditions & Payment terms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                      Condiciones del Servicio:
                    </span>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                      {currentViewing.serviceConditions}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                      Condiciones Comerciales y de Pago:
                    </span>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                      {currentViewing.paymentTerms}
                    </p>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-800">
                      {currentViewing.companyName}
                    </div>
                    <span className="text-slate-400">Por la Empresa Prestadora</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 pb-1 mb-1 font-semibold text-slate-800">
                      {currentViewing.clientContact || currentViewing.clientName || 'Aceptación de Cliente'}
                    </div>
                    <span className="text-slate-400">Firma de Aceptación / Sello</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
