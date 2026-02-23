export type Settings = {
  id: number;
  storeName: string;
  whatsappNumber: string;
  openHoursText: string;
  isOpen: boolean;
  messageTemplate: string;
  logoUrl?: string | null;

  scheduleEnabled?: boolean;
  openDays?: string | null;   // "1,2,3"
  openTime?: string | null;   // "18:00"
  closeTime?: string | null;  // "23:30"
  timezone?: string | null;   // "America/Sao_Paulo"
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

