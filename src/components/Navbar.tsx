import React from 'react';
import { Plus, LogOut, Printer, RefreshCw, Clock } from 'lucide-react';
import { AuthUser } from '../services/authService';
import { KitchenStatusResult } from '../types/schedule';
import sistersImg from '../assets/images/duas_irmas_restaurante_1791393415864.jpg';

interface NavbarProps {
  user: AuthUser;
  kitchenStatus: KitchenStatusResult;
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
  onOpenScheduleModal,
  onLogout,
  onOpenNewItemModal,
  onRefresh,
  onPrint,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
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
                Controle de pratos, bebidas e sobremesas do dia
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Schedule Adjustment Button (Mobile & Desktop) */}
            <button
              onClick={onOpenScheduleModal}
              title="Ajustar horários de atendimento"
              className="p-2 sm:px-3 sm:py-2 text-stone-700 hover:text-amber-800 hover:bg-amber-50 rounded-xl border border-stone-200/80 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-700" />
              <span className="hidden md:inline">Horários</span>
            </button>

            {/* Sync / Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Atualizar lista"
              className="p-2 sm:px-3 sm:py-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-xl border border-stone-200/80 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-700' : ''}`} />
              <span className="hidden lg:inline">Atualizar</span>
            </button>

            {/* Print list */}
            <button
              onClick={onPrint}
              title="Imprimir lista para o quadro da cozinha"
              className="p-2 sm:px-3 sm:py-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200/80 transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline">Imprimir</span>
            </button>

            {/* Primary Add Button */}
            <button
              onClick={onOpenNewItemModal}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white rounded-xl shadow-sm shadow-orange-900/20 text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Incluir Item</span>
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
      </div>
    </header>
  );
};
