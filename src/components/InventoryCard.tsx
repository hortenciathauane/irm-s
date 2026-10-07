import React from 'react';
import {
  Utensils,
  GlassWater,
  CakeSlice,
  Edit2,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustQty: (id: string, delta: number) => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  onEdit,
  onDelete,
  onAdjustQty,
}) => {
  const isOutOfStock = item.quantity === 0;
  const isLowStock = !isOutOfStock && item.quantity <= item.minStockAlert;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group ${
        isOutOfStock
          ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/10'
          : isLowStock
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-stone-200/90 hover:border-amber-300'
      }`}
    >
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
              item.category === 'prato'
                ? 'bg-amber-100/80 text-amber-900'
                : item.category === 'bebida'
                ? 'bg-orange-100/80 text-orange-900'
                : 'bg-yellow-100/80 text-yellow-900'
            }`}
          >
            {item.category === 'prato' && <Utensils className="w-3 h-3" />}
            {item.category === 'bebida' && <GlassWater className="w-3 h-3" />}
            {item.category === 'sobremesa' && <CakeSlice className="w-3 h-3" />}
            <span>{item.category}</span>
          </span>

          {/* Stock Status Badge */}
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              <XCircle className="w-3 h-3" />
              <span>Esgotado</span>
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>Repor Estoque</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3" />
              <span>Disponível</span>
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="mb-4">
          <h4 className="text-base font-semibold text-stone-900 font-display leading-snug group-hover:text-amber-900 transition-colors">
            {item.name}
          </h4>
          {item.description && (
            <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Price & Current Quantity Display */}
        <div className="flex items-baseline justify-between pt-2 border-t border-stone-100">
          <div>
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">
              Preço
            </span>
            <span className="text-sm font-semibold text-stone-800">
              R$ {item.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-stone-400 uppercase tracking-wider block">
              Disponível
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span
                className={`text-2xl font-display font-bold ${
                  isOutOfStock
                    ? 'text-rose-600'
                    : isLowStock
                    ? 'text-amber-700'
                    : 'text-stone-900'
                }`}
              >
                {item.quantity}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {item.unit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Bottom Bar */}
      <div className="px-5 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
        {/* Quick Stepper for Sisters */}
        <div className="inline-flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => onAdjustQty(item.id, -1)}
            disabled={item.quantity <= 0}
            title="Reduzir 1 porção/unidade"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-400 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-xs font-bold text-stone-700 min-w-[20px] text-center">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onAdjustQty(item.id, 1)}
            title="Adicionar 1 porção/unidade"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Buttons: Alterar & Excluir */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 border border-stone-200/80 transition-colors flex items-center gap-1 cursor-pointer"
            title="Alterar prato ou bebida"
          >
            <Edit2 className="w-3 h-3" />
            <span>Alterar</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Excluir da lista"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
