import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem } from '../types/inventory';

// Default initial items for the sisters' restaurant
export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'prato-1',
    name: 'Moqueca Baiana com Peixe Fresco & Camarão',
    category: 'prato',
    quantity: 14,
    unit: 'porções',
    price: 68.0,
    minStockAlert: 5,
    description: 'Receita de família com leite de coco artesanal, azeite de dendê e coentro fresco.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prato-2',
    name: 'Nhoque da Nona com Ragu de Costela Desfiada',
    category: 'prato',
    quantity: 18,
    unit: 'porções',
    price: 54.0,
    minStockAlert: 6,
    description: 'Massa artesanal de batata que derrete na boca, molho de tomate cozido lentamente.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prato-3',
    name: 'Frango Caipira com Quiabo & Polenta Cremosa',
    category: 'prato',
    quantity: 9,
    unit: 'porções',
    price: 49.0,
    minStockAlert: 4,
    description: 'Frango marinado em ervas frescas do nosso canteiro, acompanhado de polenta no tacho.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prato-4',
    name: 'Escondidinho de Carne Seca com Purê de Mandioca',
    category: 'prato',
    quantity: 3,
    unit: 'porções',
    price: 46.0,
    minStockAlert: 5,
    description: 'Carne seca artesanal puxada na manteiga de garrafa e gratinada com queijo coalho.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prato-5',
    name: 'Lasanha Quatro Queijos das Irmãs',
    category: 'prato',
    quantity: 0,
    unit: 'porções',
    price: 52.0,
    minStockAlert: 4,
    description: 'Massa fresca intercalada com parmesão curado, gorgonzola, provolone e muçarela.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bebida-1',
    name: 'Suco Natural de Maracujá com Capim-Santo (Jarra 750ml)',
    category: 'bebida',
    quantity: 12,
    unit: 'jarras',
    price: 22.0,
    minStockAlert: 5,
    description: 'Refrescância pura, colhido na nossa horta e batido na hora do pedido.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bebida-2',
    name: 'Limonada Suíça com Hortelã Fresca',
    category: 'bebida',
    quantity: 20,
    unit: 'copos',
    price: 14.0,
    minStockAlert: 8,
    description: 'Feita com limões taiti selecionados, leite condensado e folhas de hortelã.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bebida-3',
    name: 'Cerveja Artesanal das Irmãs (Pilsen 600ml)',
    category: 'bebida',
    quantity: 28,
    unit: 'garrafas',
    price: 26.0,
    minStockAlert: 10,
    description: 'Produção local com maltes nobres e notas florais delicadas.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bebida-4',
    name: 'Água Mineral com Gás (500ml)',
    category: 'bebida',
    quantity: 42,
    unit: 'garrafas',
    price: 7.0,
    minStockAlert: 15,
    description: 'Água pura da serra, servida bem gelada com fatia de limão.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sobremesa-1',
    name: 'Pudim de Leite Condensado com Calda Dourada',
    category: 'sobremesa',
    quantity: 11,
    unit: 'fatias',
    price: 18.0,
    minStockAlert: 4,
    description: 'Textura aveludada sem furinhos, receita secreta da nossa avó.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sobremesa-2',
    name: 'Torta de Maçã Quentinha com Canela & Especiarias',
    category: 'sobremesa',
    quantity: 2,
    unit: 'fatias',
    price: 21.0,
    minStockAlert: 4,
    description: 'Massa crocante folhada, recheada com maçãs caramelizadas na canela.',
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'irmas_restaurante_estoque_v1';
const DB_CONFIG_KEY = 'irmas_restaurante_db_config';

// Initialize client if credentials are configured
function getClient(): SupabaseClient | null {
  try {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (envUrl && envKey) {
      return createClient(envUrl, envKey);
    }

    // Also check saved credentials in storage if provided
    const storedConfig = localStorage.getItem(DB_CONFIG_KEY);
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      if (parsed.url && parsed.key) {
        return createClient(parsed.url, parsed.key);
      }
    }
  } catch (err) {
    console.warn('Storage sync initialized in local mode:', err);
  }
  return null;
}

// Local Storage helpers
function getLocalItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ITEMS;
  } catch (err) {
    console.error('Error reading local inventory:', err);
    return INITIAL_ITEMS;
  }
}

function saveLocalItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving local inventory:', err);
  }
}

export const StorageService = {
  // Fetch all items
  async getItems(): Promise<InventoryItem[]> {
    const client = getClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('itens_estoque')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          // Normalize fields if needed
          const mapped: InventoryItem[] = data.map((d: any) => ({
            id: String(d.id),
            name: d.name,
            category: d.category || 'prato',
            quantity: Number(d.quantity) || 0,
            unit: d.unit || 'porções',
            price: Number(d.price) || 0,
            minStockAlert: Number(d.min_stock_alert ?? d.minStockAlert) || 5,
            description: d.description || '',
            imageUrl: d.image_url ?? d.imageUrl,
            updatedAt: d.updated_at ?? d.updatedAt ?? new Date().toISOString(),
          }));
          saveLocalItems(mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Database sync fallbacked to local data store:', e);
      }
    }

    return getLocalItems();
  },

  // Add new item
  async addItem(itemData: Omit<InventoryItem, 'id' | 'updatedAt'>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      ...itemData,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      updatedAt: new Date().toISOString(),
    };

    // Save locally
    const current = getLocalItems();
    const updated = [newItem, ...current];
    saveLocalItems(updated);

    // Try cloud sync silently if client exists
    const client = getClient();
    if (client) {
      try {
        await client.from('itens_estoque').insert({
          id: newItem.id,
          name: newItem.name,
          category: newItem.category,
          quantity: newItem.quantity,
          unit: newItem.unit,
          price: newItem.price,
          min_stock_alert: newItem.minStockAlert,
          description: newItem.description,
          updated_at: newItem.updatedAt,
        });
      } catch (e) {
        console.warn('Silent sync error:', e);
      }
    }

    return newItem;
  },

  // Update existing item
  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const current = getLocalItems();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Item não encontrado.');
    }

    const updatedItem: InventoryItem = {
      ...current[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    current[index] = updatedItem;
    saveLocalItems(current);

    // Try cloud sync silently
    const client = getClient();
    if (client) {
      try {
        await client
          .from('itens_estoque')
          .update({
            name: updatedItem.name,
            category: updatedItem.category,
            quantity: updatedItem.quantity,
            unit: updatedItem.unit,
            price: updatedItem.price,
            min_stock_alert: updatedItem.minStockAlert,
            description: updatedItem.description,
            updated_at: updatedItem.updatedAt,
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Silent sync error:', e);
      }
    }

    return updatedItem;
  },

  // Delete item
  async deleteItem(id: string): Promise<void> {
    const current = getLocalItems();
    const filtered = current.filter((item) => item.id !== id);
    saveLocalItems(filtered);

    // Try cloud sync silently
    const client = getClient();
    if (client) {
      try {
        await client.from('itens_estoque').delete().eq('id', id);
      } catch (e) {
        console.warn('Silent sync error:', e);
      }
    }
  },

  // Quick quantity increment/decrement
  async adjustQuantity(id: string, delta: number): Promise<InventoryItem> {
    const current = getLocalItems();
    const item = current.find((i) => i.id === id);
    if (!item) {
      throw new Error('Item não encontrado.');
    }

    const newQty = Math.max(0, item.quantity + delta);
    return this.updateItem(id, { quantity: newQty });
  },

  // Reset to original restaurant sample list
  resetToSampleData(): InventoryItem[] {
    saveLocalItems(INITIAL_ITEMS);
    return INITIAL_ITEMS;
  },

  // Check if connection credentials are configured
  hasCloudConnection(): boolean {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (envUrl && envKey) return true;

    const storedConfig = localStorage.getItem(DB_CONFIG_KEY);
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        return Boolean(parsed.url && parsed.key);
      } catch {
        return false;
      }
    }
    return false;
  },

  // Save connection credentials privately without displaying database branding
  saveConnectionConfig(url: string, key: string): void {
    if (!url || !key) {
      localStorage.removeItem(DB_CONFIG_KEY);
    } else {
      localStorage.setItem(DB_CONFIG_KEY, JSON.stringify({ url: url.trim(), key: key.trim() }));
    }
  },

  getConnectionConfig(): { url: string; key: string } {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    if (envUrl && envKey) return { url: envUrl, key: envKey };

    try {
      const stored = localStorage.getItem(DB_CONFIG_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { url: '', key: '' };
  },
};
