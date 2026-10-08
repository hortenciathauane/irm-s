import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, User, Phone, MapPin, DollarSign } from 'lucide-react';
import { InventoryItem } from '../types/inventory';
import { Order, OrderItem, OrderType, PaymentMethod } from '../types/orders';

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onCreateOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const ManualOrderModal: React.FC<ManualOrderModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onCreateOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('balcao' as any === 'balcao' ? 'retirada' : 'retirada');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [deliveryFee, setDeliveryFee] = useState<string>('0.00');
  const [generalNotes, setGeneralNotes] = useState('');

  // Selected items in the order
  const [selectedItems, setSelectedItems] = useState<
    { item: InventoryItem; quantity: number; notes: string }[]
  >([]);

  // Add item selector state
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedItemId) return;
    const invItem = inventory.find((i) => i.id === selectedItemId);
    if (!invItem) return;

    if (itemQuantity <= 0) {
      setError('A quantidade deve ser de pelo menos 1.');
      return;
    }

    const existingIndex = selectedItems.findIndex((it) => it.item.id === selectedItemId);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += itemQuantity;
      if (itemNotes) {
        updated[existingIndex].notes = itemNotes;
      }
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        { item: invItem, quantity: itemQuantity, notes: itemNotes },
      ]);
    }

    setSelectedItemId('');
    setItemQuantity(1);
    setItemNotes('');
    setError(null);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  const subtotal = selectedItems.reduce(
    (acc, it) => acc + it.quantity * it.item.price,
    0
  );
  const numDeliveryFee = orderType === 'delivery' ? parseFloat(deliveryFee) || 0 : 0;
  const total = subtotal + numDeliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Informe o nome do cliente.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('Adicione pelo menos 1 item ao pedido.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setError('Informe o endereço de entrega para pedidos delivery.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = selectedItems.map((it) => ({
        itemId: it.item.id,
        name: it.item.name,
        category: it.item.category,
        quantity: it.quantity,
        unitPrice: it.item.price,
        subtotal: it.quantity * it.item.price,
        notes: it.notes.trim() || undefined,
      }));

      await onCreateOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        tableNumber: orderType === 'salao' ? tableNumber.trim() : undefined,
        items: orderItems,
        subtotal,
        deliveryFee: numDeliveryFee,
        total,
        paymentMethod,
        paymentStatus: 'pago',
        notes: generalNotes.trim() || undefined,
        status: 'pendente',
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-stone-900">
                Lançar Pedido Manual
              </h3>
              <p className="text-xs text-stone-500">
                Cadastro para pedidos no balcão, telefone ou salão
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
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Customer & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Nome do Cliente *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Gabriel Martins"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                WhatsApp / Telefone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

          {/* Order Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Tipo de Atendimento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                🛵 Delivery
              </button>
              <button
                type="button"
                onClick={() => setOrderType('retirada')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  orderType === 'retirada'
                    ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                🥡 Retirada Balcão
              </button>
              <button
                type="button"
                onClick={() => setOrderType('salao')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  orderType === 'salao'
                    ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                🍽️ Salão / Mesa
              </button>
            </div>
          </div>

          {/* Conditional Address or Table Number */}
          {orderType === 'delivery' ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Endereço de Entrega *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro, Complemento"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          ) : orderType === 'salao' ? (
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Número da Mesa / Comanda
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ex: Mesa 03 ou Balcão 1"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          ) : null}

          {/* Add Items to Order Section */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
              Adicionar Itens do Cardápio
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-6">
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  <option value="">Selecione um prato ou bebida...</option>
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (R$ {inv.price.toFixed(2)}) - Restam {inv.quantity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                  placeholder="Qtd"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-center font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="sm:col-span-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedItemId}
                  className="w-full py-2 px-3 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 disabled:opacity-40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* List of currently added items */}
            {selectedItems.length > 0 ? (
              <div className="mt-3 divide-y divide-stone-200/80 bg-white rounded-xl border border-stone-200 overflow-hidden">
                {selectedItems.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-stone-800">
                        {it.quantity}x {it.item.name}
                      </span>
                      <span className="text-stone-500 ml-2">
                        (R$ {(it.quantity * it.item.price).toFixed(2).replace('.', ',')})
                      </span>
                      {it.notes && (
                        <p className="text-[11px] text-amber-800 italic">{it.notes}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stone-400 text-center py-2">
                Nenhum item adicionado ainda.
              </p>
            )}
          </div>

          {/* Payment & Delivery Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>

            {orderType === 'delivery' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Taxa de Entrega (R$)
                </label>
                <input
                  type="text"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Observações Gerais do Pedido
            </label>
            <input
              type="text"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Ex: Troco para R$ 100,00 ou cliente prefere ponto bem passado"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          {/* Total Bar */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between text-sm">
            <span className="font-semibold text-amber-950">Total do Pedido:</span>
            <span className="font-bold text-lg font-display text-amber-900">
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedItems.length === 0}
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>{isSubmitting ? 'Gravando...' : 'Confirmar & Lançar Pedido'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
