export type Settings = {
  id: number;
  storeName: string;
  whatsappNumber: string;
  openHoursText: string;
  isOpen: boolean;
  messageTemplate: string;
};

export type Category = {
  id: string;
  name: string;
  isActive: boolean;
  products?: Product[];
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  priceCents?: number | null;
  imageUrl: string;
  isActive: boolean;
  category?: Category;
};

export type MenuResponse = {
  settings: Settings;
  categories: Category[];
};