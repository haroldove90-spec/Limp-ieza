import React, { useState } from 'react';
import {
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { SupplyItem, WarehouseMovement } from '../../../types';

interface WarehouseOperativeModuleProps {
  supplies: SupplyItem[];
  movements: WarehouseMovement[];
  operativeName: string;
  onAddMovement: (movement: Omit<WarehouseMovement, 'id' | 'date' | 'time'>) => void;
  onEditMovement?: (movement: WarehouseMovement) => void;
  onDeleteMovement?: (movementId: string) => void;
  onAdjustStock?: (supplyId: string, newStock: number) => void;
}

export const WarehouseOperativeModule: React.FC<WarehouseOperativeModuleProps> = ({
  supplies,
  movements,
  operativeName,
  onAddMovement,
  onEditMovement,
  onDeleteMovement,
  onAdjustStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [movementFilterType, setMovementFilterType] = useState<'todos' | 'entrada' | 'salida'>('todos');
  const [kardexSearch, setKardexSearch] = useState('');

  // Modals state
  const [showAddMovementModal, setShowAddMovementModal] = useState(false);
  const [editingMovement, setEditingMovement] = useState<WarehouseMovement | null>(null);
  const [adjustingSupply, setAdjustingSupply] = useState<SupplyItem | null>(null);
  const [newAdjustStockValue, setNewAdjustStockValue] = useState<number>(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Add Movement Form State
  const [selectedSupplyId, setSelectedSupplyId] = useState(supplies[0]?.id || '');
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('salida');
  const [movementQty, setMovementQty] = useState<number>(1);
  const [movementReason, setMovementReason] = useState('');
  const [movementLocation, setMovementLocation] = useState('');

  // Edit Movement Form State
  const [editSupplyId, setEditSupplyId] = useState('');
  const [editType, setEditType] = useState<'entrada' | 'salida'>('salida');
  const [editQty, setEditQty] = useState<number>(1);
  const [editReason, setEditReason] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Filter supplies for stock panel
  const filteredSupplies = supplies.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter Kardex movements
  const filteredMovements = movements.filter((m) => {
    const matchesType = movementFilterType === 'todos' || m.type === movementFilterType;
    const matchesSearch =
      m.supplyName.toLowerCase().includes(kardexSearch.toLowerCase()) ||
      m.reason.toLowerCase().includes(kardexSearch.toLowerCase()) ||
      (m.serviceOrLocation && m.serviceOrLocation.toLowerCase().includes(kardexSearch.toLowerCase())) ||
      m.id.toLowerCase().includes(kardexSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate totals
  const totalEntradasCount = movements.filter((m) => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0);
  const totalSalidasCount = movements.filter((m) => m.type === 'salida').reduce((sum, m) => sum + m.quantity, 0);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenAddModal = (presetSupplyId?: string, presetType?: 'entrada' | 'salida') => {
    if (presetSupplyId) setSelectedSupplyId(presetSupplyId);
    if (presetType) setMovementType(presetType);
    setMovementQty(1);
    setMovementReason('');
    setMovementLocation('');
    setShowAddMovementModal(true);
  };

  const handleSubmitNewMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const supply = supplies.find((s) => s.id === selectedSupplyId);
    if (!supply || movementQty <= 0) return;

    onAddMovement({
      supplyId: supply.id,
      supplyName: supply.name,
      type: movementType,
      quantity: Number(movementQty),
      unit: supply.unit,
      operativeName: operativeName || 'Carlos Mendoza',
      reason: movementReason || (movementType === 'salida' ? 'Toma de insumos a discreción para servicio' : 'Reingreso de insumos'),
      serviceOrLocation: movementLocation || 'Servicio en Campo'
    });

    setShowAddMovementModal(false);
    showFeedback(`Movimiento registrado: ${movementType === 'salida' ? 'Salida' : 'Entrada'} de ${movementQty} ${supply.unit} de ${supply.name}`);
  };

  const handleOpenEditModal = (movement: WarehouseMovement) => {
    setEditingMovement(movement);
    setEditSupplyId(movement.supplyId);
    setEditType(movement.type);
    setEditQty(movement.quantity);
    setEditReason(movement.reason);
    setEditLocation(movement.serviceOrLocation || '');
  };

  const handleSubmitEditMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement || !onEditMovement || editQty <= 0) return;

    const supply = supplies.find((s) => s.id === editSupplyId) || supplies[0];

    const updated: WarehouseMovement = {
      ...editingMovement,
      supplyId: supply.id,
      supplyName: supply.name,
      unit: supply.unit,
      type: editType,
      quantity: Number(editQty),
      reason: editReason,
      serviceOrLocation: editLocation
    };

    onEditMovement(updated);
    setEditingMovement(null);
    showFeedback(`Movimiento ${updated.id} actualizado correctamente.`);
  };

  const handleDeleteMovement = (movement: WarehouseMovement) => {
    if (!onDeleteMovement) return;
    const confirm = window.confirm(`¿Seguro que deseas eliminar el registro ${movement.id} (${movement.supplyName})? Se revertirá su impacto en las existencias.`);
    if (confirm) {
      onDeleteMovement(movement.id);
      showFeedback(`Registro ${movement.id} eliminado. Existencias recalculadas.`);
    }
  };

  const handleOpenStockAdjust = (supply: SupplyItem) => {
    setAdjustingSupply(supply);
    setNewAdjustStockValue(supply.currentStock);
  };

  const handleSubmitStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingSupply || !onAdjustStock) return;
    onAdjustStock(adjustingSupply.id, Math.max(0, Number(newAdjustStockValue)));
    showFeedback(`Existencia de ${adjustingSupply.name} ajustada a ${newAdjustStockValue} ${adjustingSupply.unit}.`);
    setAdjustingSupply(null);
  };

  // Export to CSV / Excel
  const handleExportCSV = () => {
    const headers = ['Folio', 'Fecha', 'Hora', 'Tipo Movimiento', 'Insumo', 'Cantidad', 'Unidad', 'Operador Responsable', 'Motivo / Concepto', 'Destino / Ubicación'];
    const rows = filteredMovements.map((m) => [
      m.id,
      m.date,
      m.time,
      m.type.toUpperCase(),
      `"${m.supplyName.replace(/"/g, '""')}"`,
      m.quantity,
      m.unit,
      `"${m.operativeName.replace(/"/g, '""')}"`,
      `"${m.reason.replace(/"/g, '""')}"`,
      `"${(m.serviceOrLocation || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kardex_Almacen_Insumos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5" /> Almacén General de Suministros
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Control de Existencias, Entradas y Salidas de Material
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1 max-w-2xl">
            Toma insumos a discreción para tus servicios en campo, edita entradas/salidas de material y exporta reportes en Excel o PDF.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleOpenAddModal()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-200 transition-all"
          >
            <Plus className="w-4 h-4" /> Registrar Toma / Entrada
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Descargar Excel (.csv)
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Insumos en Catálogo
            </span>
            <span className="text-2xl font-bold text-slate-800">
              {supplies.length} Productos
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Entradas / Devoluciones
            </span>
            <span className="text-2xl font-bold text-green-700">
              +{totalEntradasCount} U.
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Salidas a Servicios en Campo
            </span>
            <span className="text-2xl font-bold text-orange-700">
              -{totalSalidasCount} U.
            </span>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">
              Panel de Existencias y Stock Actual
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Consulta inmediata de cantidades disponibles en almacén central
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar insumo o químico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-2 rounded-2xl border border-slate-200 text-xs md:text-sm bg-white focus:outline-blue-500 w-full sm:w-60"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 text-xs md:text-sm bg-white text-slate-700 font-medium focus:outline-blue-500"
            >
              <option value="todos">Todas las categorías</option>
              <option value="quimico">Químicos</option>
              <option value="desechable">Desechables</option>
              <option value="utensilio">Utensilios</option>
              <option value="maquinaria">Maquinaria</option>
            </select>
          </div>
        </div>

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSupplies.map((item) => {
            const isLowStock = item.currentStock <= item.minimumStock;
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLowStock ? 'bg-orange-50/40 border-orange-200' : 'bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2.5 py-0.5 rounded-full border border-slate-100">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        isLowStock ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isLowStock ? 'Stock Bajo' : 'Disponible'}
                    </span>
                    {onAdjustStock && (
                      <button
                        title="Ajustar conteo físico de stock"
                        onClick={() => handleOpenStockAdjust(item)}
                        className="p-1 rounded-lg bg-white hover:bg-slate-200 text-slate-500 border border-slate-200 transition-colors"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 text-base mb-1">
                  {item.name}
                </h4>

                <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-slate-200/60">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Existencia en Almacén:</span>
                    <span className="text-2xl font-bold text-slate-900">
                      {item.currentStock}{' '}
                      <span className="text-xs font-semibold text-slate-400">{item.unit}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block font-medium">Mínimo sugerido</span>
                    <span className="text-xs font-bold text-slate-700">{item.minimumStock} {item.unit}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/40 flex gap-2">
                  <button
                    onClick={() => handleOpenAddModal(item.id, 'salida')}
                    className="flex-1 py-1.5 px-2.5 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-orange-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Tomar Insumo (Salida)
                  </button>
                  <button
                    onClick={() => handleOpenAddModal(item.id, 'entrada')}
                    className="flex-1 py-1.5 px-2.5 bg-white hover:bg-green-50 border border-slate-200 hover:border-green-300 text-green-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" /> Devolución (Entrada)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movements Kardex Table with Edit & Filter */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base md:text-lg">
              Kardex de Movimientos (Entradas y Salidas de Material)
            </h3>
            <p className="text-xs text-slate-400">
              Bitácora editable de tomas a discreción y devoluciones de insumos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
              <button
                onClick={() => setMovementFilterType('todos')}
                className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  movementFilterType === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Todos ({movements.length})
              </button>
              <button
                onClick={() => setMovementFilterType('salida')}
                className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  movementFilterType === 'salida' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Salidas ({movements.filter((m) => m.type === 'salida').length})
              </button>
              <button
                onClick={() => setMovementFilterType('entrada')}
                className={`px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                  movementFilterType === 'entrada' ? 'bg-green-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Entradas ({movements.filter((m) => m.type === 'entrada').length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar kardex..."
                value={kardexSearch}
                onChange={(e) => setKardexSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-blue-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Folio / Fecha</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3">Insumo</th>
                <th className="py-3 px-3 text-center">Cantidad</th>
                <th className="py-3 px-3">Operador</th>
                <th className="py-3 px-3">Motivo / Destino</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    No se encontraron movimientos registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-3 text-xs text-slate-500 font-medium">
                      <span className="font-mono font-bold text-slate-700 block">{mov.id}</span>
                      {mov.date} • <span className="text-slate-400">{mov.time}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          mov.type === 'entrada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {mov.type === 'entrada' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {mov.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {mov.supplyName}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-slate-900">
                      {mov.type === 'salida' ? '-' : '+'}{mov.quantity} {mov.unit}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 font-medium">
                      {mov.operativeName}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500">
                      <span className="block font-medium text-slate-700">{mov.reason}</span>
                      {mov.serviceOrLocation && (
                        <span className="text-slate-400 text-[11px]">Destino: {mov.serviceOrLocation}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(mov)}
                          title="Editar este movimiento"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovement(mov)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Movement Modal */}
      {showAddMovementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-slate-800">
                Registrar Movimiento de Material
              </h3>
              <button
                onClick={() => setShowAddMovementModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-5 font-medium">
              Toma o reingreso de insumos a discreción para servicios en campo
            </p>

            <form onSubmit={handleSubmitNewMovement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tipo de Movimiento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('salida')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      movementType === 'salida'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Salida / Toma para Servicio
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('entrada')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      movementType === 'entrada'
                        ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Entrada / Reingreso
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Insumo o Material:
                </label>
                <select
                  value={selectedSupplyId}
                  onChange={(e) => setSelectedSupplyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:outline-blue-500"
                >
                  {supplies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Stock actual: {s.currentStock} {s.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cantidad a {movementType === 'salida' ? 'tomar' : 'ingresar'}:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQty}
                    onChange={(e) => setMovementQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Operativo Responsable:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={operativeName || 'Carlos Mendoza'}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Destino / Cliente / Sede:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Oficinas SkyTower Piso 8 / Van #04"
                  value={movementLocation}
                  onChange={(e) => setMovementLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Motivo / Observaciones:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Limpieza profunda y reposición de sanitarios"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMovementModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm cursor-pointer shadow-md shadow-blue-200 transition-colors"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Movement Modal */}
      {editingMovement && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  EDITAR MOVIMIENTO • {editingMovement.id}
                </span>
                <h3 className="text-xl font-bold text-slate-800">
                  Modificar Entrada/Salida de Material
                </h3>
              </div>
              <button
                onClick={() => setEditingMovement(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-5 font-medium">
              Ajusta las cantidades, tipo o concepto. Las existencias se recalcularán automáticamente.
            </p>

            <form onSubmit={handleSubmitEditMovement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Tipo de Movimiento:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditType('salida')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      editType === 'salida'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Salida (Toma)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('entrada')}
                    className={`py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      editType === 'entrada'
                        ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Entrada (Reingreso)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Insumo o Material:
                </label>
                <select
                  value={editSupplyId}
                  onChange={(e) => setEditSupplyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-medium focus:outline-blue-500"
                >
                  {supplies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Stock actual: {s.currentStock} {s.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cantidad Utilizada:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editQty}
                    onChange={(e) => setEditQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white font-mono focus:outline-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Operativo:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editingMovement.operativeName}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Destino / Ubicación:
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Motivo / Observaciones:
                </label>
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMovement(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm cursor-pointer shadow-md shadow-blue-200 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingSupply && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-slate-800">
                Ajuste Físico de Existencias
              </h3>
              <button
                onClick={() => setAdjustingSupply(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Producto: <strong>{adjustingSupply.name}</strong>
            </p>

            <form onSubmit={handleSubmitStockAdjust} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nueva Existencia Contada Físicamente ({adjustingSupply.unit}):
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newAdjustStockValue}
                  onChange={(e) => setNewAdjustStockValue(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 text-base font-bold font-mono rounded-xl border border-slate-200 bg-white focus:outline-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingSupply(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs md:text-sm cursor-pointer shadow-md shadow-blue-200 transition-colors"
                >
                  Actualizar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
