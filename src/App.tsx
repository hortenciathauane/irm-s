/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  ArrowUpDown,
  Utensils,
  GlassWater,
  CakeSlice,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Settings,
  Bell,
} from 'lucide-react';
import {
  InventoryItem,
  FilterCategory,
  StockStatusFilter,
  SortOption,
  ViewMode,
} from './types/inventory';
import { RestaurantScheduleConfig, KitchenStatusResult } from './types/schedule';
import { Order, OrderStatus } from './types/orders';
import { StorageService } from './services/storageService';
import { AuthService, AuthUser } from './services/authService';
import { ScheduleService } from './services/scheduleService';
import { OrderService, playOrderNotificationSound } from './services/orderService';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { InventorySummary } from './components/InventorySummary';
import { InventoryCard } from './components/InventoryCard';
import { InventoryTable } from './components/InventoryTable';
import { ItemModal } from './components/ItemModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ScheduleModal } from './components/ScheduleModal';
import { OrdersView } from './components/OrdersView';
import { ManualOrderModal } from './components/ManualOrderModal';
import sistersImg from './assets/images/duas_irmas_restaurante_1791393415864.jpg';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => AuthService.getCurrentUser());

  // Active Main Tab: 'estoque' or 'pedidos'
  const [currentTab, setCurrentTab] = useState<'estoque' | 'pedidos'>('estoque');

  // Inventory state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);
  const previousPendingCountRef = useRef(0);

  // Operating Hours Schedule state
  const [scheduleConfig, setScheduleConfig] = useState<RestaurantScheduleConfig>(() =>
    ScheduleService.getConfig()
  );
  const [kitchenStatus, setKitchenStatus] = useState<KitchenStatusResult>(() =>
    ScheduleService.evaluateStatus(new Date(), ScheduleService.getConfig())
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() =>
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );

  // Automatic schedule re-evaluator interval
  useEffect(() => {
    const updateSchedule = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      );
      setKitchenStatus(ScheduleService.evaluateStatus(now, scheduleConfig));
    };

    updateSchedule();
    const timer = setInterval(updateSchedule, 10000); // Check every 10 seconds
    return () => clearInterval(timer);
  }, [scheduleConfig]);

  // Filters & display state (inventory)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('todos');
  const [selectedStatus, setSelectedStatus] = useState<StockStatusFilter>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('nome-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 3500);
  };

  // Load items & orders
  const loadData = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [inventoryData, ordersData] = await Promise.all([
        StorageService.getItems(),
        OrderService.getOrders(),
      ]);
      setItems(inventoryData);
      setOrders(ordersData);

      // Check if new pending orders arrived
      const newPending = ordersData.filter((o) => o.status === 'pendente').length;
      if (newPending > previousPendingCountRef.current && previousPendingCountRef.current !== 0) {
        playOrderNotificationSound();
        showToast('Novo pedido recebido do cliente!', 'info');
      }
      previousPendingCountRef.current = newPending;
    } catch (err) {
      console.error('Error loading restaurant data:', err);
    } finally {
      if (showLoadingIndicator) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
      // Periodically poll for incoming orders from the customer app
      const ordersPoll = setInterval(() => {
        OrderService.getOrders().then((latestOrders) => {
          setOrders(latestOrders);
          const pendingCount = latestOrders.filter((o) => o.status === 'pendente').length;
          if (pendingCount > previousPendingCountRef.current) {
            playOrderNotificationSound();
            showToast('Novo pedido recebido!', 'info');
          }
          previousPendingCountRef.current = pendingCount;
        });
      }, 12000); // Poll every 12 seconds
      return () => clearInterval(ordersPoll);
    }
  }, [currentUser]);

  // Auth handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    showToast(`Bem-vindas, ${user.name}! Cozinha e recepção ativas.`);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  // Schedule update handler
  const handleSaveSchedule = (newConfig: RestaurantScheduleConfig) => {
    setScheduleConfig(newConfig);
    ScheduleService.saveConfig(newConfig);
    const updatedStatus = ScheduleService.evaluateStatus(new Date(), newConfig);
    setKitchenStatus(updatedStatus);
    showToast(
      `Horários atualizados: ${updatedStatus.statusLabel} (${updatedStatus.detailMessage})`
    );
  };

  // Item CRUD
  const handleOpenNewItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (
    itemData: Omit<InventoryItem, 'id' | 'updatedAt'>
  ) => {
    if (itemToEdit) {
      const updated = await StorageService.updateItem(itemToEdit.id, itemData);
      setItems((prev) => prev.map((i) => (i.id === itemToEdit.id ? updated : i)));
      showToast(`"${updated.name}" foi alterado com sucesso!`);
    } else {
      const created = await StorageService.addItem(itemData);
      setItems((prev) => [created, ...prev]);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#d97706', '#ea580c', '#15803d'],
        });
      } catch {
        // fallback
      }
      showToast(`"${created.name}" incluído na lista com sucesso!`);
    }
  };

  const handleOpenDeleteItem = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await StorageService.deleteItem(itemToDelete.id);
      setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      showToast(`"${itemToDelete.name}" foi removido do estoque.`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir item.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick adjust quantity (+ / - buttons)
  const handleAdjustQuantity = async (id: string, delta: number) => {
    try {
      const updated = await StorageService.adjustQuantity(id, delta);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (updated.quantity === 0) {
        showToast(`Atenção: "${updated.name}" ficou esgotado!`, 'info');
      }
    } catch (err: any) {
      console.error('Error adjusting quantity:', err);
    }
  };

  const handleResetSampleData = () => {
    if (window.confirm('Deseja restaurar a lista inicial sugerida das irmãs com pratos e bebidas?')) {
      const initial = StorageService.resetToSampleData();
      setItems(initial);
      showToast('Estoque restaurado para o cardápio padrão das irmãs!');
    }
  };

  // Orders Workflow Handlers
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await OrderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      const statusLabels: Record<OrderStatus, string> = {
        pendente: 'Pendente',
        em_preparo: 'Em Preparo no Fogão',
        saiu_entrega: 'Saiu para Entrega / Pronto',
        concluido: 'Concluído e Entregue',
        cancelado: 'Cancelado',
      };
      showToast(`Pedido #${updated.orderNumber}: ${statusLabels[newStatus]}`);
    } catch (err: any) {
      alert(err?.message || 'Erro ao atualizar status do pedido.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await OrderService.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Pedido removido.');
    } catch (err: any) {
      alert(err?.message || 'Erro ao remover pedido.');
    }
  };

  const handleSimulateCustomerOrder = async () => {
    setIsSimulatingOrder(true);
    try {
      const newOrder = await OrderService.simulateCustomerOrder();
      setOrders((prev) => [newOrder, ...prev]);
      // Also refresh stock as quantities were deducted
      const refreshedStock = await StorageService.getItems();
      setItems(refreshedStock);
      showToast(`Novo pedido recebido de ${newOrder.customerName} (R$ ${newOrder.total.toFixed(2)})!`);
      // Switch to pedidos tab so they see it
      setCurrentTab('pedidos');
    } catch (err) {
      console.error('Error simulating order:', err);
    } finally {
      setIsSimulatingOrder(false);
    }
  };

  const handleCreateManualOrder = async (
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ) => {
    const created = await OrderService.createOrder(orderData);
    setOrders((prev) => [created, ...prev]);
    // Refresh stock
    const refreshedStock = await StorageService.getItems();
    setItems(refreshedStock);
    showToast(`Pedido #${created.orderNumber} lançado com sucesso!`);
    setCurrentTab('pedidos');
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered and sorted inventory items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(query);
          const matchDesc = item.description?.toLowerCase().includes(query);
          const matchUnit = item.unit.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchUnit) return false;
        }

        if (selectedCategory !== 'todos' && item.category !== selectedCategory) {
          return false;
        }

        if (selectedStatus === 'baixo') {
          if (item.quantity > item.minStockAlert) return false;
        } else if (selectedStatus === 'esgotado') {
          if (item.quantity !== 0) return false;
        } else if (selectedStatus === 'disponivel') {
          if (item.quantity <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'nome-asc':
            return a.name.localeCompare(b.name);
          case 'qtd-asc':
            return a.quantity - b.quantity;
          case 'qtd-desc':
            return b.quantity - a.quantity;
          case 'preco-asc':
            return a.price - b.price;
          case 'preco-desc':
            return b.price - a.price;
          default:
            return 0;
        }
      });
  }, [items, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pendente').length;

  // If not authenticated, show clean login view
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-800 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-medium border ${
              toastMessage.type === 'info'
                ? 'bg-amber-900 text-white border-amber-800'
                : 'bg-stone-900 text-white border-stone-800'
            }`}
          >
            {toastMessage.type === 'info' ? (
              <AlertCircle className="w-5 h-5 text-amber-300 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        user={currentUser}
        kitchenStatus={kitchenStatus}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingOrdersCount={pendingOrdersCount}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        onLogout={handleLogout}
        onOpenNewItemModal={handleOpenNewItem}
        onRefresh={() => loadData(false)}
        onPrint={handlePrint}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Render Tab Content */}
        {currentTab === 'pedidos' ? (
          /* Orders Reception View */
          <OrdersView
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSimulateCustomerOrder={handleSimulateCustomerOrder}
            onOpenManualOrderModal={() => setIsManualOrderModalOpen(true)}
            isSimulating={isSimulatingOrder}
          />
        ) : (
          /* Inventory Management View */
          <>
            {/* Welcome Banner with Sisters Aesthetic & Automatic Kitchen Hours Badge */}
            <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-amber-950/15 mb-6 sm:mb-8 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 right-48 w-48 h-48 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  <div className="hidden sm:block w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-200/50 shadow-md shrink-0 bg-amber-900">
                    <img
                      src={sistersImg}
                      alt="Irmãs"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/60 text-amber-200 text-xs font-medium mb-2 border border-amber-600/40">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cozinha Familiar & Artesanal</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                      Painel de Estoque & Cardápio
                    </h2>
                    <p className="mt-1 text-amber-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                      Gerencie pratos do dia, porções disponíveis e bebidas em tempo real. O status da cozinha é atualizado automaticamente conforme os horários programados.
                    </p>
                  </div>
                </div>

                {/* Live Kitchen Status Box & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {/* Dynamic Status Interactive Pill */}
                  <div
                    onClick={() => setIsScheduleModalOpen(true)}
                    className={`p-3.5 sm:px-4 sm:py-3 rounded-2xl border backdrop-blur-md cursor-pointer transition-all hover:scale-102 flex items-center justify-between sm:justify-start gap-3.5 shadow-sm ${
                      kitchenStatus.isOpen
                        ? 'bg-emerald-950/60 border-emerald-400/50 text-white'
                        : 'bg-stone-900/60 border-stone-400/40 text-white'
                    }`}
                    title="Clique para ajustar os horários da cozinha"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-3.5 h-3.5 rounded-full ${
                          kitchenStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-stone-400'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold tracking-wide">
                            {kitchenStatus.statusLabel}
                          </span>
                          <span className="text-[10px] text-amber-200/80 font-medium">
                            ({currentTimeStr})
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-200 block leading-tight">
                          {kitchenStatus.detailMessage}
                        </span>
                      </div>
                    </div>
                    <div className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors">
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <button
                    onClick={handleOpenNewItem}
                    className="px-5 py-3 rounded-2xl bg-white text-amber-900 hover:bg-amber-50 font-semibold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-700" />
                    <span>Cadastrar Item</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Summary Cards */}
            <InventorySummary
              items={items}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
            />

            {/* Filter and Control Bar */}
            <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs mb-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por prato, suco, vinho, ingrediente..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-stone-400 hover:text-stone-600"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* View Mode Toggle & Sort */}
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-stone-700 font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="nome-asc">Nome (A - Z)</option>
                      <option value="qtd-asc">Menor Quantidade</option>
                      <option value="qtd-desc">Maior Quantidade</option>
                      <option value="preco-desc">Maior Preço</option>
                      <option value="preco-asc">Menor Preço</option>
                    </select>
                  </div>

                  <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setViewMode('cards')}
                      title="Visualização em Cartões"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'cards'
                          ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      title="Visualização em Tabela Compacta"
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-white text-amber-800 shadow-2xs font-semibold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Tabs & Quick Status Filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('todos')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === 'todos'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
                    }`}
                  >
                    Todos ({items.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('prato')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedCategory === 'prato'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Pratos Principais</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('bebida')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedCategory === 'bebida'
                        ? 'bg-orange-700 text-white shadow-xs'
                        : 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200/60'
                    }`}
                  >
                    <GlassWater className="w-3.5 h-3.5" />
                    <span>Bebidas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('sobremesa')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedCategory === 'sobremesa'
                        ? 'bg-yellow-700 text-white shadow-xs'
                        : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200/60'
                    }`}
                  >
                    <CakeSlice className="w-3.5 h-3.5" />
                    <span>Sobremesas</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <span className="text-[11px] font-medium hidden sm:inline">Status:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                      selectedStatus === 'todos'
                        ? 'bg-stone-200 text-stone-800 font-semibold'
                        : 'hover:bg-stone-100 text-stone-500'
                    }`}
                  >
                    Qualquer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('disponivel')}
                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                      selectedStatus === 'disponivel'
                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                        : 'hover:bg-emerald-50 text-stone-500'
                    }`}
                  >
                    Disponíveis
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('baixo')}
                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                      selectedStatus === 'baixo'
                        ? 'bg-amber-100 text-amber-800 font-semibold'
                        : 'hover:bg-amber-50 text-stone-500'
                    }`}
                  >
                    Baixo Estoque
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('esgotado')}
                    className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer ${
                      selectedStatus === 'esgotado'
                        ? 'bg-rose-100 text-rose-800 font-semibold'
                        : 'hover:bg-rose-50 text-stone-500'
                    }`}
                  >
                    Esgotados
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section: Grid or Table */}
            {isLoading ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-stone-200">
                <div className="w-10 h-10 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-stone-600">
                  Carregando estoque do Restaurante das Irmãs...
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/90 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-display font-bold text-stone-900 mb-1">
                  Nenhum item encontrado
                </h3>
                <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                  Não encontramos nenhum prato ou bebida com os filtros atuais. Experimente limpar a busca ou cadastrar um novo item.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(searchQuery || selectedCategory !== 'todos' || selectedStatus !== 'todos') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('todos');
                        setSelectedStatus('todos');
                      }}
                      className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
                    >
                      Limpar Todos os Filtros
                    </button>
                  )}
                  <button
                    onClick={handleOpenNewItem}
                    className="px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Incluir Item Agora</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredItems.map((item) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEditItem}
                    onDelete={handleOpenDeleteItem}
                    onAdjustQty={handleAdjustQuantity}
                  />
                ))}
              </div>
            ) : (
              <InventoryTable
                items={filteredItems}
                onEdit={handleOpenEditItem}
                onDelete={handleOpenDeleteItem}
                onAdjustQty={handleAdjustQuantity}
              />
            )}
          </>
        )}

        {/* Footer Actions & Sisters Warm Signature */}
        <div className="mt-12 pt-8 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-stone-800">
              Restaurante das Irmãs
            </span>
            <span>• Feito com carinho para o dia a dia da cozinha</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="text-stone-500 hover:text-amber-800 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Horários de atendimento</span>
            </button>
            <span className="text-stone-300">•</span>
            <button
              onClick={handleResetSampleData}
              className="text-stone-400 hover:text-amber-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Restaurar pratos e bebidas sugeridos originais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar cardápio padrão</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modal for Inclusão / Alteração de Item */}
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      {/* Modal for Exclusão de Item */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        item={itemToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Modal for Horários de Atendimento */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        config={scheduleConfig}
        onSave={handleSaveSchedule}
      />

      {/* Modal for Manual Order Insertion */}
      <ManualOrderModal
        isOpen={isManualOrderModalOpen}
        onClose={() => setIsManualOrderModalOpen(false)}
        inventory={items}
        onCreateOrder={handleCreateManualOrder}
      />
    </div>
  );
}
