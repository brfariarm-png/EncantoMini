export type ProductCategory =
  | 'todos'
  | 'destaques'
  | 'copo_brownie'
  | 'tapiocas_salgadas'
  | 'tapioca_doce'
  | 'bebidas'
  | string;

export interface FlavorOption {
  id: string;
  name: string;
  category?: 'salgado' | 'doce' | 'fruta' | 'especial';
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  promoPrice?: number;
  category: ProductCategory;
  image: string;
  badge?: string;
  servesCount?: string;
  isAvailable: boolean;
  allowsFlavors?: boolean;
  flavorsTitle?: string;
  maxFlavors?: number;
  availableFlavors?: FlavorOption[];
  allowsPreparationChoice?: boolean;
  allowsAddons?: boolean;
  availableAddons?: AddonOption[];
}

export interface CartItemFlavor {
  flavorId: string;
  flavorName: string;
  quantity: number;
}

export interface CartItemAddon {
  addonId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  preparation?: string;
  selectedFlavors?: CartItemFlavor[];
  selectedAddons?: CartItemAddon[];
  notes?: string;
  unitPrice: number;
  totalPrice: number;
}

export type DeliveryType = 'delivery' | 'retirada' | 'mesa';

export type PaymentMethod = 'pix' | 'cartao_entrega' | 'dinheiro';

export type OrderStatus =
  | 'recebido'
  | 'preparando'
  | 'em_entrega'
  | 'pronto_retirada'
  | 'finalizado'
  | 'cancelado';

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  reference?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  cpf?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  customer: CustomerInfo;
  deliveryType: DeliveryType;
  tableNumber?: string;
  address?: DeliveryAddress;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  changeFor?: string;
  status: OrderStatus;
  estimatedTimeMinutes: number;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  adminNotes?: string;
}

export interface Coupon {
  id?: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
}

export interface NeighborhoodFee {
  id?: string;
  name: string;
  fee: number;
  estimatedTime: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  whatsappNumber: string;
  phoneDisplay: string;
  address: string;
  city: string;
  mapsUrl: string;
  instagram: string;
  pixKey: string;
  pixKeyType: string;
  pixReceiverName: string;
  minOrderValue: number;
  isOpen: boolean;
  openingHoursText: string;
  announcementBanner: string;
  averageDeliveryMinutes: string;
  averagePickupMinutes: string;
}
