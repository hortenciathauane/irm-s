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

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustQty: (id: string, delta: number) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEdit,
  onDelete,
  onAdjustQty,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">Prato / Bebida</th>
              <th className="py-3.5 px-3">Categoria</th>
              <th className="py-3.5 px-4 text-center">Quantidade no Estoque</th>
              <th className="py-3.5 px-4">Preço (R$)</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-sm">
            {items.map((item) => {
              const isOutOfStock = item.quantity === 0;
              const isLowStock = !isOutOfStock && item.quantity <= item.minStockAlert;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-amber-50/30 transition-colors ${
                    isOutOfStock ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Name & details */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div>
                      <span className="font-semibold text-stone-900 block font-display">
                        {item.name}
                      </span>
                      {item.description && (
                        <span className="text-xs text-stone-400 line-clamp-1">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-3">
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
                  </td>

                  {/* Quantity with quick buttons */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="inline-flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => onAdjustQty(item.id, -1)}
                          disabled={item.quantity <= 0}
                          title="Diminuir"
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-600 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800 min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustQty(item.id, 1)}
                          title="Aumentar"
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-stone-400 font-medium">
                        {item.unit}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-medium text-stone-800">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3 h-3" />
                        <span>Esgotado</span>
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Estoque Baixo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Normal</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:text-amber-900 hover:bg-amber-100/70 border border-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Alterar prato/bebida"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Alterar</span>
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Excluir da lista"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
