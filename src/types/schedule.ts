export interface TimeSlot {
  id: string;
  label: string; // e.g. 'Turno do Almoço', 'Turno do Jantar', 'Atendimento Contínuo'
  enabled: boolean;
  startTime: string; // "11:30" (HH:mm)
  endTime: string;   // "15:30" (HH:mm)
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  dayName: string;
  isOpenDay: boolean;
  slots: TimeSlot[];
}

export interface RestaurantScheduleConfig {
  mode: 'auto' | 'force_open' | 'force_closed';
  // Common quick schedule
  lunchSlot: {
    enabled: boolean;
    startTime: string; // e.g. "11:30"
    endTime: string;   // e.g. "15:30"
  };
  dinnerSlot: {
    enabled: boolean;
    startTime: string; // e.g. "18:30"
    endTime: string;   // e.g. "23:00"
  };
  // Days open: 0 = Domingo, 1 = Segunda, etc.
  openDays: number[]; // e.g. [2, 3, 4, 5, 6, 0] (Terça a Domingo)
}

export interface KitchenStatusResult {
  isOpen: boolean;
  statusLabel: 'Cozinha Aberta' | 'Cozinha Fechada';
  detailMessage: string;
  nextChangeText?: string;
  isForced: boolean;
  currentMode: 'auto' | 'force_open' | 'force_closed';
}
