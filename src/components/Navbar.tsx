import React from 'react';
import { Plus, LogOut, Printer, RefreshCw, Clock, Utensils, Bell } from 'lucide-react';
import { AuthUser } from '../services/authService';
import { KitchenStatusResult } from '../types/schedule';
import sistersImg from '../assets/images/duas_irmas_restaurante_1791393415864.jpg';

interface NavbarProps {
  user: AuthUser;
  kitchenStatus: KitchenStatusResult;
  currentTab: 'estoque' | 'pedidos';
  onTabChange: (tab: 'estoque' | 'pedidos') => void;
  pendingOrdersCount: number;
  onOpenScheduleModal: () => void;
  onLogout: () => void;
  onOpenNewItemModal: () => void;
  onRefresh: () => void;
  onPrint: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  kitchenStatus,
  currentTab,
  onTabChange,
  pendingOrdersCount,
  onOpenScheduleModal,
  onLogout,
  onOpenNewItemModal,
  onRefresh,
  onPrint,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Sisters Avatar */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-amber-600/40 shadow-sm shadow-amber-900/10 bg-amber-50">
                <img
                  src={sistersImg}
                  alt="Irmãs Proprietárias"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {/* Dynamic Status Indicator Dot */}
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ring-1 ${
                  kitchenStatus.isOpen
                    ? 'bg-emerald-500 ring-emerald-600/30'
                    : 'bg-stone-400 ring-stone-500/30'
                }`}
                title={kitchenStatus.statusLabel}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-stone-900 tracking-tight">
                  Restaurante das Irmãs
                </h1>
                {/* Kitchen Status Pill Button on Navbar */}
                <button
                  type="button"
                  onClick={onOpenScheduleModal}
                  title="Clique para ajustar horários de atendimento"
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                    kitchenStatus.isOpen
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      kitchenStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                    }`}
                  />
                  <span>{kitchenStatus.statusLabel}</span>
                  {kitchenStatus.nextChangeText && (
                    <span className="font-normal opacity-80">
                      • {kitchenStatus.nextChangeText}
                    </span>
                  )}
                </button>
              </div>
              <p className="text-xs text-stone-500 font-sans hidden xs:block">
                Controle de estoque e recepção de pedidos
              </p>
            </div>
          </div>

          {/* Navigation View Switcher (Estoque vs Pedidos) */}
          <div className="hidden md:flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200/90 shadow-2xs">
            <button
              type="button"
              onClick={() => onTabChange('estoque')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === 'estoque'
                  ? 'bg-white text-amber-900 shadow-sm border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Estoque & Cardápio</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('pedidos')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative cursor-pointer ${
                currentTab === 'pedidos'
                  ? 'bg-white text-amber-900 shadow-sm border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Pedidos Recebidos</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-bounce">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Schedule Adjustment Button */}
            <button
              onClick={onOpenScheduleModal}
              title="Ajustar horários de atendimento"
              className="p-2 sm:px-3 sm:py-2 text-stone-700 hover:text-amber-800 hover:bg-amber-50 rounded-xl border border-stone-200/80 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-700" />
              <span className="hidden lg:inline">Horários</span>
            </button>

            {/* Sync / Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Atualizar lista"
              className="p-2 sm:px-3 sm:py-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl border border-stone-200/80 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-700' : ''}`} />
              <span className="hidden xl:inline">Atualizar</span>
            </button>

            {/* Primary Action Button (Changes depending on Tab) */}
            {currentTab === 'estoque' ? (
              <button
                onClick={onOpenNewItemModal}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white rounded-xl shadow-sm text-xs sm:text-sm font-semibold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Incluir Item</span>
              </button>
            ) : null}

            {/* Print list */}
            <button
              onClick={onPrint}
              title="Imprimir quadro ou comanda"
              className="p-2 sm:px-3 sm:py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200/80 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden xl:inline">Imprimir</span>
            </button>

            {/* User Profile & Logout */}
            <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block" />

            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-stone-800 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                Cozinha & Salão
              </span>
            </div>

            <button
              onClick={onLogout}
              title="Sair do sistema"
              className="p-2 sm:px-3 sm:py-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-stone-200/80 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Tab Bar */}
        <div className="flex md:hidden items-center justify-center gap-2 py-2.5 border-t border-stone-100">
          <button
            type="button"
            onClick={() => onTabChange('estoque')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              currentTab === 'estoque'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Estoque & Cardápio</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('pedidos')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
              currentTab === 'pedidos'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pedidos</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
