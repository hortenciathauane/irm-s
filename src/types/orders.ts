export type OrderStatus =
  | 'pendente'
  | 'em_preparo'
  | 'saiu_entrega'
  | 'concluido'
  | 'cancelado';

export type OrderType = 'delivery' | 'retirada' | 'salao';

export type PaymentMethod =
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro';

export interface OrderItem {
  id?: string;
  itemId: string;
  name: string;
  category: 'prato' | 'bebida' | 'sobremesa';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string; // e.g. "PED-1024"
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string;
  tableNumber?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pago' | 'pendente_na_entrega';
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type OrderFilterStatus = 'todos' | 'pendente' | 'em_preparo' | 'saiu_entrega' | 'concluido' | 'cancelado';
