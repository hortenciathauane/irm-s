import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Order, OrderItem, OrderStatus } from '../types/orders';
import { StorageService } from './storageService';

const ORDERS_STORAGE_KEY = 'irmas_restaurante_pedidos_v1';
const DB_CONFIG_KEY = 'irmas_restaurante_db_config';

function getClient(): SupabaseClient | null {
  try {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (envUrl && envKey) return createClient(envUrl, envKey);

    const storedConfig = localStorage.getItem(DB_CONFIG_KEY);
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      if (parsed.url && parsed.key) return createClient(parsed.url, parsed.key);
    }
  } catch (err) {
    console.warn('Storage sync error:', err);
  }
  return null;
}

// Initial realistic orders to showcase the receiving workflow
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'PED-1025',
    orderNumber: 1025,
    customerName: 'Mariana Souza',
    customerPhone: '(11) 98765-4321',
    orderType: 'delivery',
    deliveryAddress: 'Rua das Flores, 142, Apto 32 - Bairro Jardim',
    items: [
      {
        itemId: 'prato-1',
        name: 'Moqueca Baiana com Peixe Fresco & Camarão',
        category: 'prato',
        quantity: 2,
        unitPrice: 68.0,
        subtotal: 136.0,
        notes: 'Sem coentro em uma das porções, por favor.',
      },
      {
        itemId: 'bebida-1',
        name: 'Suco Natural de Maracujá com Capim-Santo (Jarra 750ml)',
        category: 'bebida',
        quantity: 1,
        unitPrice: 22.0,
        subtotal: 22.0,
      },
      {
        itemId: 'sobremesa-1',
        name: 'Pudim de Leite Condensado com Calda Dourada',
        category: 'sobremesa',
        quantity: 2,
        unitPrice: 18.0,
        subtotal: 36.0,
      },
    ],
    subtotal: 194.0,
    deliveryFee: 10.0,
    total: 204.0,
    paymentMethod: 'pix',
    paymentStatus: 'pago',
    notes: 'Campainha pode tocar, portaria autorizada.',
    status: 'pendente',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 min ago
    updatedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 'PED-1024',
    orderNumber: 1024,
    customerName: 'Carlos Eduardo Mendes',
    customerPhone: '(11) 97123-8899',
    orderType: 'retirada',
    items: [
      {
        itemId: 'prato-2',
        name: 'Nhoque da Nona com Ragu de Costela Desfiada',
        category: 'prato',
        quantity: 1,
        unitPrice: 54.0,
        subtotal: 54.0,
        notes: 'Caprichar no queijo ralado.',
      },
      {
        itemId: 'bebida-3',
        name: 'Cerveja Artesanal das Irmãs (Pilsen 600ml)',
        category: 'bebida',
        quantity: 2,
        unitPrice: 26.0,
        subtotal: 52.0,
      },
    ],
    subtotal: 106.0,
    deliveryFee: 0,
    total: 106.0,
    paymentMethod: 'cartao_credito',
    paymentStatus: 'pago',
    notes: 'Vou retirar às 13:00 no balcão.',
    status: 'em_preparo',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 min ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'PED-1023',
    orderNumber: 1023,
    customerName: 'Beatriz Almeida',
    customerPhone: '(11) 99456-1122',
    orderType: 'salao',
    tableNumber: 'Mesa 04',
    items: [
      {
        itemId: 'prato-3',
        name: 'Frango Caipira com Quiabo & Polenta Cremosa',
        category: 'prato',
        quantity: 1,
        unitPrice: 49.0,
        subtotal: 49.0,
      },
      {
        itemId: 'bebida-2',
        name: 'Limonada Suíça com Hortelã Fresca',
        category: 'bebida',
        quantity: 1,
        unitPrice: 14.0,
        subtotal: 14.0,
      },
    ],
    subtotal: 63.0,
    deliveryFee: 0,
    total: 63.0,
    paymentMethod: 'pix',
    paymentStatus: 'pago',
    status: 'concluido',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ORDERS;
  } catch (err) {
    console.error('Error reading local orders:', err);
    return INITIAL_ORDERS;
  }
}

function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Error saving local orders:', err);
  }
}

// Gentle pleasant kitchen chime using Web Audio API
export function playOrderNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880.0, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880.0, now);
    osc2.frequency.setValueAtTime(1174.66, now + 0.15); // D6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.75);
    osc2.stop(now + 0.75);
  } catch {
    // Audio might be blocked by browser policy until user interacts
  }
}

export const OrderService = {
  async getOrders(): Promise<Order[]> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('pedidos')
          .select('*, itens_pedido(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Order[] = data.map((d: any) => ({
            id: d.id,
            orderNumber: d.order_number || Number(d.id.replace(/\D/g, '')) || 1000,
            customerName: d.customer_name || d.cliente_nome,
            customerPhone: d.customer_phone || d.cliente_telefone || '',
            orderType: d.order_type || d.tipo_entrega || 'delivery',
            deliveryAddress: d.delivery_address || d.endereco_entrega,
            tableNumber: d.table_number || d.numero_mesa,
            items: (d.itens_pedido || []).map((it: any) => ({
              id: it.id,
              itemId: it.item_id,
              name: it.item_name || it.name,
              category: it.category || 'prato',
              quantity: Number(it.quantity) || 1,
              unitPrice: Number(it.unit_price) || 0,
              subtotal: (Number(it.quantity) || 1) * (Number(it.unit_price) || 0),
              notes: it.notes || it.observacoes,
            })),
            subtotal: Number(d.subtotal) || Number(d.total) || 0,
            deliveryFee: Number(d.delivery_fee) || 0,
            total: Number(d.total) || 0,
            paymentMethod: d.payment_method || d.forma_pagamento || 'pix',
            paymentStatus: d.payment_status || 'pago',
            notes: d.notes || d.observacoes,
            status: d.status || 'pendente',
            createdAt: d.created_at || new Date().toISOString(),
            updatedAt: d.updated_at || new Date().toISOString(),
          }));
          saveLocalOrders(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Silent database sync fallback to local orders:', err);
      }
    }

    return getLocalOrders();
  },

  async createOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    const currentOrders = getLocalOrders();
    const highestNum = currentOrders.reduce((max, o) => Math.max(max, o.orderNumber || 0), 1025);
    const newOrderNumber = highestNum + 1;
    const newId = `PED-${newOrderNumber}`;

    const newOrder: Order = {
      ...orderData,
      id: newId,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save locally
    const updated = [newOrder, ...currentOrders];
    saveLocalOrders(updated);

    // Automatically deduct items from inventory
    for (const item of newOrder.items) {
      try {
        await StorageService.adjustQuantity(item.itemId, -item.quantity);
      } catch (e) {
        console.warn(`Could not adjust stock for item ${item.name}:`, e);
      }
    }

    // Try silent cloud sync
    const client = getClient();
    if (client) {
      try {
        await client.from('pedidos').insert({
          id: newOrder.id,
          order_number: newOrder.orderNumber,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          order_type: newOrder.orderType,
          delivery_address: newOrder.deliveryAddress,
          table_number: newOrder.tableNumber,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.deliveryFee,
          total: newOrder.total,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          notes: newOrder.notes,
          status: newOrder.status,
          created_at: newOrder.createdAt,
          updated_at: newOrder.updatedAt,
        });

        // Insert items
        if (newOrder.items.length > 0) {
          const rows = newOrder.items.map((it) => ({
            pedido_id: newOrder.id,
            item_id: it.itemId,
            item_name: it.name,
            category: it.category,
            quantity: it.quantity,
            unit_price: it.unitPrice,
            notes: it.notes,
          }));
          await client.from('itens_pedido').insert(rows);
        }
      } catch (e) {
        console.warn('Silent sync error:', e);
      }
    }

    playOrderNotificationSound();
    return newOrder;
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<Order> {
    const currentOrders = getLocalOrders();
    const index = currentOrders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      throw new Error('Pedido não encontrado.');
    }

    const updatedOrder: Order = {
      ...currentOrders[index],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    currentOrders[index] = updatedOrder;
    saveLocalOrders(currentOrders);

    // Silent sync
    const client = getClient();
    if (client) {
      try {
        await client
          .from('pedidos')
          .update({
            status: newStatus,
            updated_at: updatedOrder.updatedAt,
          })
          .eq('id', orderId);
      } catch (e) {
        console.warn('Silent sync error:', e);
      }
    }

    return updatedOrder;
  },

  async deleteOrder(orderId: string): Promise<void> {
    const currentOrders = getLocalOrders();
    const filtered = currentOrders.filter((o) => o.id !== orderId);
    saveLocalOrders(filtered);

    const client = getClient();
    if (client) {
      try {
        await client.from('pedidos').delete().eq('id', orderId);
      } catch (e) {
        console.warn('Silent sync error:', e);
      }
    }
  },

  // Helper to simulate an order arriving from the other client app
  async simulateCustomerOrder(): Promise<Order> {
    const sampleCustomers = [
      { name: 'Ana Paula Ferreira', phone: '(11) 98112-3344', address: 'Av. Paulista, 1200 - Apto 81' },
      { name: 'Rodrigo Lima', phone: '(11) 97554-9988', address: 'Rua Bela Cintra, 450 - Casa 2' },
      { name: 'Juliana Castro', phone: '(11) 99223-1100', address: 'Rua Augusta, 890 - Apto 104' },
      { name: 'Marcelo Ribeiro', phone: '(11) 96332-4455', address: 'Al. Lorena, 310' },
    ];

    const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const inventory = await StorageService.getItems();
    const availablePratos = inventory.filter((i) => i.category === 'prato' && i.quantity > 0);
    const availableBebidas = inventory.filter((i) => i.category === 'bebida' && i.quantity > 0);

    const prato = availablePratos.length > 0
      ? availablePratos[Math.floor(Math.random() * availablePratos.length)]
      : inventory[0];

    const bebida = availableBebidas.length > 0
      ? availableBebidas[Math.floor(Math.random() * availableBebidas.length)]
      : null;

    const items: OrderItem[] = [
      {
        itemId: prato.id,
        name: prato.name,
        category: prato.category,
        quantity: Math.floor(Math.random() * 2) + 1,
        unitPrice: prato.price,
        subtotal: prato.price * 1,
        notes: Math.random() > 0.5 ? 'Por favor mandar talheres descartáveis.' : undefined,
      },
    ];

    if (bebida) {
      items.push({
        itemId: bebida.id,
        name: bebida.name,
        category: bebida.category,
        quantity: Math.floor(Math.random() * 2) + 1,
        unitPrice: bebida.price,
        subtotal: bebida.price * 1,
      });
    }

    const subtotal = items.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
    const isDelivery = Math.random() > 0.3;
    const deliveryFee = isDelivery ? 10.0 : 0;

    return this.createOrder({
      customerName: customer.name,
      customerPhone: customer.phone,
      orderType: isDelivery ? 'delivery' : 'retirada',
      deliveryAddress: isDelivery ? customer.address : undefined,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: Math.random() > 0.5 ? 'pix' : 'cartao_credito',
      paymentStatus: 'pago',
      status: 'pendente',
      notes: isDelivery ? 'Pedido realizado pelo App do Cliente' : 'Retirada no Balcão pelo App do Cliente',
    });
  },
};
