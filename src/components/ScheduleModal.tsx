import React, { useState } from 'react';
import { X, Clock, Sun, Moon, Calendar, Check, Save, RotateCcw } from 'lucide-react';
import { RestaurantScheduleConfig } from '../types/schedule';
import { DEFAULT_SCHEDULE_CONFIG, DAY_NAMES, ScheduleService } from '../services/scheduleService';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RestaurantScheduleConfig;
  onSave: (newConfig: RestaurantScheduleConfig) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  config: initialConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<RestaurantScheduleConfig>(initialConfig);

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    setConfig((prev) => {
      const exists = prev.openDays.includes(dayIndex);
      return {
        ...prev,
        openDays: exists
          ? prev.openDays.filter((d) => d !== dayIndex)
          : [...prev.openDays, dayIndex].sort(),
      };
    });
  };

  const handleReset = () => {
    setConfig(DEFAULT_SCHEDULE_CONFIG);
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  // Preview current status with configured options
  const previewStatus = ScheduleService.evaluateStatus(new Date(), config);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden transform transition-all max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-stone-900">
                Horários de Atendimento
              </h3>
              <p className="text-xs text-stone-500">
                Atualização automática de Cozinha Aberta e Fechada
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

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Live Status Preview Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              previewStatus.isOpen
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-stone-100/90 border-stone-200 text-stone-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  previewStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
                }`}
              />
              <div>
                <span className="text-sm font-bold block">
                  {previewStatus.statusLabel}
                </span>
                <span className="text-xs text-stone-600">
                  {previewStatus.detailMessage}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold uppercase px-2 py-1 rounded-md bg-white/80 border border-stone-200/60 text-stone-600">
              Agora
            </span>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Modo de Operação
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'auto' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  config.mode === 'auto'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50/50'
                }`}
              >
                Automático (Relógio)
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'force_open' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  config.mode === 'force_open'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-emerald-50/50'
                }`}
              >
                Forçar Aberta
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'force_closed' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  config.mode === 'force_closed'
                    ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Forçar Fechada
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              No modo automático, o sistema alterna sozinho de acordo com os horários programados abaixo.
            </p>
          </div>

          {/* Turno do Almoço */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Turno do Almoço
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.lunchSlot.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      lunchSlot: { ...config.lunchSlot, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>Ativo</span>
              </label>
            </div>

            {config.lunchSlot.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-stone-500 font-medium mb-1">
                    Horário de Abertura
                  </label>
                  <input
                    type="time"
                    value={config.lunchSlot.startTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lunchSlot: { ...config.lunchSlot, startTime: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 font-medium mb-1">
                    Horário de Fechamento
                  </label>
                  <input
                    type="time"
                    value={config.lunchSlot.endTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lunchSlot: { ...config.lunchSlot, endTime: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Turno do Jantar */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                  Turno do Jantar
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dinnerSlot.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      dinnerSlot: { ...config.dinnerSlot, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span>Ativo</span>
              </label>
            </div>

            {config.dinnerSlot.enabled && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-stone-500 font-medium mb-1">
                    Horário de Abertura
                  </label>
                  <input
                    type="time"
                    value={config.dinnerSlot.startTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        dinnerSlot: { ...config.dinnerSlot, startTime: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 font-medium mb-1">
                    Horário de Fechamento
                  </label>
                  <input
                    type="time"
                    value={config.dinnerSlot.endTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        dinnerSlot: { ...config.dinnerSlot, endTime: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Dias de Funcionamento */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Dias com Atendimento</span>
              </label>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAY_NAMES.map((name, index) => {
                const isSelected = config.openDays.includes(index);
                const shortLabel = name.substring(0, 3);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
                        : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
                    }`}
                    title={name}
                  >
                    <div>{shortLabel}</div>
                    {isSelected && (
                      <Check className="w-3 h-3 mx-auto mt-0.5 text-amber-800" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              Dias desmarcados serão exibidos automaticamente como Cozinha Fechada.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrão</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Horários</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
