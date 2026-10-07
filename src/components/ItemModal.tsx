import React, { useState, useEffect } from 'react';
import { X, Utensils, GlassWater, CakeSlice, AlertCircle, Save } from 'lucide-react';
import { InventoryItem, ItemCategory } from '../types/inventory';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'updatedAt'>) => Promise<void>;
  itemToEdit: InventoryItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('prato');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<string>('porções');
  const [price, setPrice] = useState<string>('35.00');
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setQuantity(itemToEdit.quantity);
      setUnit(itemToEdit.unit || (itemToEdit.category === 'bebida' ? 'garrafas' : 'porções'));
      setPrice(itemToEdit.price.toFixed(2));
      setMinStockAlert(itemToEdit.minStockAlert ?? 5);
      setDescription(itemToEdit.description || '');
    } else {
      setName('');
      setCategory('prato');
      setQuantity(10);
      setUnit('porções');
      setPrice('35.00');
      setMinStockAlert(5);
      setDescription('');
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  // Adjust default unit when category changes if user hasn't typed custom
  const handleCategoryChange = (cat: ItemCategory) => {
    setCategory(cat);
    if (!itemToEdit) {
      if (cat === 'prato') setUnit('porções');
      else if (cat === 'bebida') setUnit('garrafas');
      else if (cat === 'sobremesa') setUnit('fatias');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor, informe o nome do item.');
      return;
    }

    const numPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Por favor, insira um preço válido.');
      return;
    }

    if (quantity < 0) {
      setError('A quantidade não pode ser negativa.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        category,
        quantity: Math.floor(quantity),
        unit: unit.trim() || 'unidades',
        price: numPrice,
        minStockAlert: Math.max(1, Math.floor(minStockAlert)),
        description: description.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar item no estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              {category === 'prato' ? (
                <Utensils className="w-5 h-5" />
              ) : category === 'bebida' ? (
                <GlassWater className="w-5 h-5" />
              ) : (
                <CakeSlice className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-stone-900">
                {itemToEdit ? 'Alterar Item do Estoque' : 'Incluir Novo Item'}
              </h3>
              <p className="text-xs text-stone-500">
                {itemToEdit
                  ? 'Atualize a quantidade e detalhes deste prato ou bebida'
                  : 'Cadastre um prato ou bebida para o estoque do restaurante'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange('prato')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'prato'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50/50'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Prato</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('bebida')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'bebida'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50/50'
                }`}
              >
                <GlassWater className="w-3.5 h-3.5" />
                <span>Bebida</span>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange('sobremesa')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  category === 'sobremesa'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50/50'
                }`}
              >
                <CakeSlice className="w-3.5 h-3.5" />
                <span>Sobremesa</span>
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Nome do Item *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Risoto de Alho-Poró com Parmesão Curado"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
            />
          </div>

          {/* Quantity and Unit in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Quantidade em Estoque *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
              >
                <option value="porções">porções</option>
                <option value="unidades">unidades</option>
                <option value="garrafas">garrafas</option>
                <option value="latas">latas</option>
                <option value="copos">copos</option>
                <option value="jarras">jarras</option>
                <option value="fatias">fatias</option>
                <option value="litros">litros</option>
              </select>
            </div>
          </div>

          {/* Price and Minimum Alert Threshold in 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Preço de Cardápio (R$)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-stone-400 font-medium">
                  R$
                </span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Alerta de Reposição
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                title="Avisar quando a quantidade for menor ou igual a esse número"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
              />
              <span className="text-[10px] text-stone-400 block mt-0.5">Aviso de estoque baixo</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Descrição / Ingredientes (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Preparado com legumes orgânicos e tempero caseiro das irmãs..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white text-sm font-semibold flex items-center gap-2 shadow-sm shadow-orange-900/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{itemToEdit ? 'Salvar Alterações' : 'Incluir no Estoque'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
