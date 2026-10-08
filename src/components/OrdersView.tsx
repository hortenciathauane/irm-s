import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
  Search,
  Plus,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  DollarSign,
  Printer,
  Volume2,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import { Order, OrderFilterStatus, OrderStatus } from '../types/orders';
import { playOrderNotificationSound } from '../services/orderService';

interface OrdersViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onDeleteOrder: (orderId: string) => Promise<void>;
  onSimulateCustomerOrder: () => Promise<void>;
  onOpenManualOrderModal: () => void;
  isSimulating: boolean;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onSimulateCustomerOrder,
  onOpenManualOrderModal,
  isSimulating,
}) => {
  const [filterStatus, setFilterStatus] = useState<OrderFilterStatus>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Counters
  const pendingOrders = orders.filter((o) => o.status === 'pendente');
  const inPrepOrders = orders.filter((o) => o.status === 'em_preparo');
  const inDeliveryOrders = orders.filter((o) => o.status === 'saiu_entrega');
  const completedOrders = orders.filter((o) => o.status === 'concluido');

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, o) => acc + o.total, 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'todos' && o.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchNumber = String(o.orderNumber).includes(q) || o.id.toLowerCase().includes(q);
      const matchAddress = o.deliveryAddress?.toLowerCase().includes(q);
      if (!matchName && !matchNumber && !matchAddress) return false;
    }
    return true;
  });

  const formatRelativeTime = (isoString: string) => {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Agora mesmo';
    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours} h`;
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const printOrderTicket = (order: Order) => {
    const ticketWindow = window.open('', '_blank', 'width=380,height=600');
    if (!ticketWindow) return;

    ticketWindow.document.write(`
      <html>
        <head>
          <title>Comanda #${order.orderNumber} - Restaurante das Irmãs</title>
          <style>
            body { font-family: monospace; padding: 16px; font-size: 13px; color: black; line-height: 1.4; }
            h2, h3 { text-align: center; margin: 4px 0; }
            hr { border: none; border-top: 1px dashed black; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .total { font-weight: bold; font-size: 15px; text-align: right; margin-top: 8px; }
            .notes { font-style: italic; margin-top: 6px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h2>RESTAURANTE DAS IRMÃS</h2>
          <h3>COMANDA DE PRODUÇÃO #${order.orderNumber}</h3>
          <p style="text-align:center;">${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          <hr/>
          <p><strong>Cliente:</strong> ${order.customerName}</p>
          <p><strong>Tipo:</strong> ${order.orderType.toUpperCase()} ${order.tableNumber ? `(${order.tableNumber})` : ''}</p>
          ${order.deliveryAddress ? `<p><strong>Endereço:</strong> ${order.deliveryAddress}</p>` : ''}
          ${order.customerPhone ? `<p><strong>Tel:</strong> ${order.customerPhone}</p>` : ''}
          <hr/>
          <h4>ITENS DO PEDIDO:</h4>
          ${order.items
            .map(
              (it) => `
            <div class="item">
              <span>${it.quantity}x ${it.name}</span>
              <span>R$ ${it.subtotal.toFixed(2)}</span>
            </div>
            ${it.notes ? `<div class="notes">* Obs: ${it.notes}</div>` : ''}
          `
            )
            .join('')}
          <hr/>
          <div class="item">
            <span>Subtotal:</span>
            <span>R$ ${order.subtotal.toFixed(2)}</span>
          </div>
          ${
            order.deliveryFee > 0
              ? `
          <div class="item">
            <span>Taxa Entrega:</span>
            <span>R$ ${order.deliveryFee.toFixed(2)}</span>
          </div>
          `
              : ''
          }
          <div class="total">TOTAL: R$ ${order.total.toFixed(2)}</div>
          <p><strong>Pagamento:</strong> ${order.paymentMethod.toUpperCase()} (${order.paymentStatus})</p>
          ${order.notes ? `<div class="notes"><strong>Observações gerais:</strong> ${order.notes}</div>` : ''}
          <hr/>
          <p style="text-align:center;">Bom apetite! Feito com carinho pelas irmãs.</p>
        </body>
      </html>
    `);
    ticketWindow.document.close();
    ticketWindow.focus();
    setTimeout(() => {
      ticketWindow.print();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner for Orders Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-orange-950 rounded-3xl p-6 sm:p-7 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-2 border border-white/10">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Fila da Cozinha & Recepção</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Recepção de Pedidos em Tempo Real
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
            Receba pedidos enviados pelo aplicativo do cliente ou lance novos pedidos diretamente do balcão.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound Test Button */}
          <button
            type="button"
            onClick={playOrderNotificationSound}
            title="Testar campainha de novo pedido"
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Som</span>
          </button>

          {/* Simulate Client Order Button */}
          <button
            type="button"
            onClick={onSimulateCustomerOrder}
            disabled={isSimulating}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-60"
            title="Simula um cliente realizando pedido no outro aplicativo"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSimulating ? 'Recebendo...' : 'Simular Pedido do App'}</span>
          </button>

          {/* Manual Order Button */}
          <button
            type="button"
            onClick={onOpenManualOrderModal}
            className="px-4 py-2.5 bg-white text-stone-900 hover:bg-amber-50 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-700" />
            <span>Novo Pedido no Balcão</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Novos / Pendentes */}
        <div
          onClick={() => setFilterStatus('pendente')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            pendingOrders.length > 0
              ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/20'
              : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Novos / Pendentes
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                pendingOrders.length > 0
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-rose-700">
            {pendingOrders.length}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">
            {pendingOrders.length > 0 ? 'Aguardando confirmação!' : 'Fila limpa'}
          </span>
        </div>

        {/* Em Preparo */}
        <div
          onClick={() => setFilterStatus('em_preparo')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'em_preparo'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              No Fogão / Preparo
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-amber-800">
            {inPrepOrders.length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Na cozinha das irmãs</span>
        </div>

        {/* Em Entrega / Prontos */}
        <div
          onClick={() => setFilterStatus('saiu_entrega')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'saiu_entrega'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
              : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Em Entrega / Prontos
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-blue-800">
            {inDeliveryOrders.length}
          </div>
          <span className="text-[11px] text-blue-700 font-medium">A caminho do cliente</span>
        </div>

        {/* Concluídos Hoje */}
        <div
          onClick={() => setFilterStatus('concluido')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterStatus === 'concluido'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Concluídos Hoje
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-emerald-800">
            {completedOrders.length}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">Entregues com sucesso</span>
        </div>

        {/* Faturamento */}
        <div className="p-4 rounded-2xl border bg-white border-stone-200 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Faturado
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-display text-stone-900 truncate">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {orders.length} pedidos registrados
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, endereço ou #..."
            className="w-full pl-10 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'todos'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'pendente'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Pendentes ({pendingOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('em_preparo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'em_preparo'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Em Preparo ({inPrepOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('saiu_entrega')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'saiu_entrega'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            Em Entrega ({inDeliveryOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('concluido')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'concluido'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Concluídos ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-stone-200 text-center">
          <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 font-display">
            Nenhum pedido encontrado nesta lista
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Assim que um cliente realizar um pedido no outro aplicativo, ele aparecerá aqui instantaneamente.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={onSimulateCustomerOrder}
              className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 transition-colors cursor-pointer"
            >
              Simular Pedido de Teste
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pendente';
            const isPrep = order.status === 'em_preparo';
            const isDelivery = order.status === 'saiu_entrega';
            const isCompleted = order.status === 'concluido';
            const isCancelled = order.status === 'cancelado';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isPending
                    ? 'border-rose-400 ring-2 ring-rose-300/40'
                    : isPrep
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-stone-200'
                }`}
              >
                {/* Order Card Top Bar */}
                <div
                  className={`px-5 py-3 border-b flex items-center justify-between ${
                    isPending
                      ? 'bg-rose-50/80 border-rose-200'
                      : isPrep
                      ? 'bg-amber-50/80 border-amber-200'
                      : isDelivery
                      ? 'bg-blue-50/80 border-blue-200'
                      : isCompleted
                      ? 'bg-emerald-50/80 border-emerald-200'
                      : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-stone-900">
                      Pedido #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        order.orderType === 'delivery'
                          ? 'bg-blue-100 text-blue-900'
                          : order.orderType === 'retirada'
                          ? 'bg-orange-100 text-orange-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}
                    >
                      {order.orderType === 'delivery'
                        ? '🛵 Delivery'
                        : order.orderType === 'retirada'
                        ? '🥡 Balcão'
                        : `🍽️ ${order.tableNumber || 'Salão'}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRelativeTime(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm">
                        {order.customerName}
                      </h4>
                      {order.customerPhone && (
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-600">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{order.customerPhone}</span>
                          <a
                            href={`https://wa.me/55${cleanPhoneForWhatsApp(order.customerPhone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold border border-emerald-200 transition-colors"
                          >
                            <MessageCircle className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                        isPending
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : isPrep
                          ? 'bg-amber-100 text-amber-900'
                          : isDelivery
                          ? 'bg-blue-100 text-blue-900'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isPending
                        ? 'Pendente'
                        : isPrep
                        ? 'Em Preparo'
                        : isDelivery
                        ? 'Em Entrega'
                        : isCompleted
                        ? 'Concluído'
                        : 'Cancelado'}
                    </span>
                  </div>

                  {/* Delivery Address if Delivery */}
                  {order.deliveryAddress && (
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start gap-2 text-xs text-stone-700">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-[11px] text-stone-500 uppercase">
                          Endereço de Entrega
                        </span>
                        <span>{order.deliveryAddress}</span>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="border border-stone-100 rounded-xl overflow-hidden divide-y divide-stone-100 bg-stone-50/50">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="p-2.5 flex items-start justify-between text-xs">
                        <div className="flex-1">
                          <span className="font-bold text-amber-950">
                            {it.quantity}x
                          </span>{' '}
                          <span className="font-medium text-stone-800">{it.name}</span>
                          {it.notes && (
                            <p className="text-[11px] text-amber-800 italic mt-0.5 font-medium">
                              • Obs: {it.notes}
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-stone-700 shrink-0 ml-2">
                          R$ {it.subtotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer General Notes */}
                  {order.notes && (
                    <div className="text-xs text-stone-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                      <strong className="text-amber-900">Nota do cliente:</strong> {order.notes}
                    </div>
                  )}

                  {/* Payment & Totals */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="text-stone-500">
                      <span>Pagamento: </span>
                      <strong className="text-stone-800 uppercase">
                        {order.paymentMethod}
                      </strong>
                      <span className="text-emerald-700 ml-1 font-semibold">
                        ({order.paymentStatus})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-stone-500 text-[11px] mr-1">Total:</span>
                      <span className="text-base font-bold font-display text-stone-900">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Workflow Footer */}
                <div className="px-5 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => printOrderTicket(order)}
                      title="Imprimir comanda térmica"
                      className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {!isCompleted && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Deseja realmente cancelar este pedido?')) {
                            onUpdateStatus(order.id, 'cancelado');
                          }
                        }}
                        title="Cancelar pedido"
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Stage Transition Action */}
                  <div>
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'em_preparo')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Aceitar & Iniciar Preparo</span>
                      </button>
                    )}

                    {isPrep && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(
                            order.id,
                            order.orderType === 'delivery' ? 'saiu_entrega' : 'concluido'
                          )
                        }
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {order.orderType === 'delivery' ? (
                          <>
                            <Truck className="w-3.5 h-3.5" />
                            <span>Saiu para Entrega</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pronto / Entregue</span>
                          </>
                        )}
                      </button>
                    )}

                    {isDelivery && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'concluido')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmar Entrega</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Finalizado</span>
                      </span>
                    )}

                    {isCancelled && (
                      <span className="text-xs font-semibold text-rose-600">
                        Pedido Cancelado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
