import React from 'react';
import { Utensils, GlassWater, AlertTriangle, CheckCircle2, CakeSlice } from 'lucide-react';
import { InventoryItem, FilterCategory, StockStatusFilter } from '../types/inventory';

interface InventorySummaryProps {
  items: InventoryItem[];
  selectedCategory: FilterCategory;
  onSelectCategory: (cat: FilterCategory) => void;
  selectedStatus: StockStatusFilter;
  onSelectStatus: (status: StockStatusFilter) => void;
}

export const InventorySummary: React.FC<InventorySummaryProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
}) => {
  const pratos = items.filter((i) => i.category === 'prato');
  const bebidas = items.filter((i) => i.category === 'bebida');
  const sobremesas = items.filter((i) => i.category === 'sobremesa');

  const totalPratosQty = pratos.reduce((acc, i) => acc + i.quantity, 0);
  const totalBebidasQty = bebidas.reduce((acc, i) => acc + i.quantity, 0);
  const totalSobremesasQty = sobremesas.reduce((acc, i) => acc + i.quantity, 0);

  const lowStockItems = items.filter((i) => i.quantity <= i.minStockAlert);
  const zeroStockItems = items.filter((i) => i.quantity === 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Pratos Card */}
      <div
        onClick={() => {
          onSelectCategory(selectedCategory === 'prato' ? 'todos' : 'prato');
          onSelectStatus('todos');
        }}
        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          selectedCategory === 'prato'
            ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-500/20'
            : 'bg-white hover:bg-amber-50/30 border-stone-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Pratos do Dia
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Utensils className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-display text-stone-900">
            {pratos.length}
          </span>
          <span className="text-xs text-stone-500">
            opções ({totalPratosQty} porções)
          </span>
        </div>
        <div className="mt-2 text-[11px] text-amber-800 font-medium flex items-center gap-1">
          <span>Ver apenas pratos</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* Bebidas Card */}
      <div
        onClick={() => {
          onSelectCategory(selectedCategory === 'bebida' ? 'todos' : 'bebida');
          onSelectStatus('todos');
        }}
        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          selectedCategory === 'bebida'
            ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-500/20'
            : 'bg-white hover:bg-amber-50/30 border-stone-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Bebidas
          </span>
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <GlassWater className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-display text-stone-900">
            {bebidas.length}
          </span>
          <span className="text-xs text-stone-500">
            tipos ({totalBebidasQty} unid.)
          </span>
        </div>
        <div className="mt-2 text-[11px] text-orange-800 font-medium flex items-center gap-1">
          <span>Ver apenas bebidas</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* Sobremesas Card */}
      <div
        onClick={() => {
          onSelectCategory(selectedCategory === 'sobremesa' ? 'todos' : 'sobremesa');
          onSelectStatus('todos');
        }}
        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          selectedCategory === 'sobremesa'
            ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-500/20'
            : 'bg-white hover:bg-amber-50/30 border-stone-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Sobremesas
          </span>
          <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CakeSlice className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-display text-stone-900">
            {sobremesas.length}
          </span>
          <span className="text-xs text-stone-500">
            doces ({totalSobremesasQty} fatias)
          </span>
        </div>
        <div className="mt-2 text-[11px] text-yellow-800 font-medium flex items-center gap-1">
          <span>Ver sobremesas</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>

      {/* Alerta de Reposição Card */}
      <div
        onClick={() => {
          onSelectStatus(selectedStatus === 'baixo' ? 'todos' : 'baixo');
        }}
        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
          selectedStatus === 'baixo'
            ? 'bg-rose-50/90 border-rose-500 shadow-md ring-2 ring-rose-500/20'
            : lowStockItems.length > 0
            ? 'bg-white hover:bg-rose-50/30 border-stone-200/90 shadow-xs'
            : 'bg-white hover:bg-emerald-50/30 border-stone-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Alerta de Estoque
          </span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
              lowStockItems.length > 0
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {lowStockItems.length > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl sm:text-3xl font-bold font-display ${
              lowStockItems.length > 0 ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {lowStockItems.length}
          </span>
          <span className="text-xs text-stone-500">
            {lowStockItems.length === 1 ? 'item requer atenção' : 'itens requerem atenção'}
            {zeroStockItems.length > 0 && ` (${zeroStockItems.length} zerado)`}
          </span>
        </div>
        <div className="mt-2 text-[11px] text-rose-700 font-medium flex items-center gap-1">
          <span>{selectedStatus === 'baixo' ? 'Mostrando críticos' : 'Filtrar reposição'}</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>
    </div>
  );
};
