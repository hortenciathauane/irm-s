export type ItemCategory = 'prato' | 'bebida' | 'sobremesa';

export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string; // e.g. 'porções', 'unidades', 'garrafas', 'latas', 'litros', 'fatias'
  price: number; // Preço em Reais
  minStockAlert: number; // Limite para alerta de estoque baixo
  description?: string;
  imageUrl?: string;
  updatedAt: string;
}

export type ViewMode = 'cards' | 'table';
export type FilterCategory = 'todos' | 'prato' | 'bebida' | 'sobremesa';
export type StockStatusFilter = 'todos' | 'baixo' | 'esgotado' | 'disponivel';
export type SortOption = 'nome-asc' | 'qtd-asc' | 'qtd-desc' | 'preco-desc' | 'preco-asc';
