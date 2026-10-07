import { RestaurantScheduleConfig, KitchenStatusResult } from '../types/schedule';

const SCHEDULE_CONFIG_KEY = 'irmas_restaurante_schedule_v1';

export const DEFAULT_SCHEDULE_CONFIG: RestaurantScheduleConfig = {
  mode: 'auto',
  lunchSlot: {
    enabled: true,
    startTime: '11:30',
    endTime: '15:30',
  },
  dinnerSlot: {
    enabled: true,
    startTime: '18:30',
    endTime: '23:00',
  },
  openDays: [0, 2, 3, 4, 5, 6], // Terça a Domingo (Segunda-feira folga das irmãs)
};

export const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export const ScheduleService = {
  getConfig(): RestaurantScheduleConfig {
    try {
      const raw = localStorage.getItem(SCHEDULE_CONFIG_KEY);
      if (!raw) {
        localStorage.setItem(SCHEDULE_CONFIG_KEY, JSON.stringify(DEFAULT_SCHEDULE_CONFIG));
        return DEFAULT_SCHEDULE_CONFIG;
      }
      return { ...DEFAULT_SCHEDULE_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SCHEDULE_CONFIG;
    }
  },

  saveConfig(config: RestaurantScheduleConfig): void {
    try {
      localStorage.setItem(SCHEDULE_CONFIG_KEY, JSON.stringify(config));
    } catch (err) {
      console.error('Error saving schedule config:', err);
    }
  },

  evaluateStatus(date: Date = new Date(), config?: RestaurantScheduleConfig): KitchenStatusResult {
    const activeConfig = config || this.getConfig();

    if (activeConfig.mode === 'force_open') {
      return {
        isOpen: true,
        statusLabel: 'Cozinha Aberta',
        detailMessage: 'Aberta manualmente pelas proprietárias',
        isForced: true,
        currentMode: 'force_open',
      };
    }

    if (activeConfig.mode === 'force_closed') {
      return {
        isOpen: true,
        statusLabel: 'Cozinha Fechada',
        detailMessage: 'Fechada manualmente pelas proprietárias',
        isForced: true,
        currentMode: 'force_closed',
      };
    }

    // Auto mode based on real clock
    const dayOfWeek = date.getDay(); // 0 to 6
    const isDayOpen = activeConfig.openDays.includes(dayOfWeek);
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    if (!isDayOpen) {
      return {
        isOpen: false,
        statusLabel: 'Cozinha Fechada',
        detailMessage: `Hoje (${DAY_NAMES[dayOfWeek]}) o restaurante não abre para atendimento`,
        isForced: false,
        currentMode: 'auto',
      };
    }

    const { lunchSlot, dinnerSlot } = activeConfig;
    const lunchStart = timeToMinutes(lunchSlot.startTime);
    const lunchEnd = timeToMinutes(lunchSlot.endTime);
    const dinnerStart = timeToMinutes(dinnerSlot.startTime);
    const dinnerEnd = timeToMinutes(dinnerSlot.endTime);

    // Check lunch
    if (lunchSlot.enabled && currentMinutes >= lunchStart && currentMinutes < lunchEnd) {
      return {
        isOpen: true,
        statusLabel: 'Cozinha Aberta',
        detailMessage: `Turno do Almoço em andamento (Fecha às ${lunchSlot.endTime})`,
        nextChangeText: `Fecha às ${lunchSlot.endTime}`,
        isForced: false,
        currentMode: 'auto',
      };
    }

    // Check dinner
    if (dinnerSlot.enabled && currentMinutes >= dinnerStart && currentMinutes < dinnerEnd) {
      return {
        isOpen: true,
        statusLabel: 'Cozinha Aberta',
        detailMessage: `Turno do Jantar em andamento (Fecha às ${dinnerSlot.endTime})`,
        nextChangeText: `Fecha às ${dinnerSlot.endTime}`,
        isForced: false,
        currentMode: 'auto',
      };
    }

    // Closed, find next opening
    if (lunchSlot.enabled && currentMinutes < lunchStart) {
      return {
        isOpen: false,
        statusLabel: 'Cozinha Fechada',
        detailMessage: `Abre hoje para o Almoço às ${lunchSlot.startTime}`,
        nextChangeText: `Abre às ${lunchSlot.startTime}`,
        isForced: false,
        currentMode: 'auto',
      };
    }

    if (dinnerSlot.enabled && currentMinutes < dinnerStart && (!lunchSlot.enabled || currentMinutes >= lunchEnd)) {
      return {
        isOpen: false,
        statusLabel: 'Cozinha Fechada',
        detailMessage: `Intervalo da tarde • Abre para o Jantar às ${dinnerSlot.startTime}`,
        nextChangeText: `Abre às ${dinnerSlot.startTime}`,
        isForced: false,
        currentMode: 'auto',
      };
    }

    return {
      isOpen: false,
      statusLabel: 'Cozinha Fechada',
      detailMessage: 'Horário de atendimento de hoje encerrado',
      nextChangeText: 'Encerrado por hoje',
      isForced: false,
      currentMode: 'auto',
    };
  },
};
