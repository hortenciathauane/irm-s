import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-display font-bold text-stone-900 mb-2">
            Remover do Estoque?
          </h3>
          <p className="text-sm text-stone-600 mb-4 leading-relaxed">
            Tem certeza que deseja excluir <strong className="text-stone-900">{item.name}</strong> da lista de estoque?
          </p>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 mb-6 text-xs text-stone-500 flex justify-between items-center">
            <span>Categoria: <strong className="text-stone-700 capitalize">{item.category}</strong></span>
            <span>Quantidade atual: <strong className="text-stone-700">{item.quantity} {item.unit}</strong></span>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm shadow-rose-900/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Item</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
