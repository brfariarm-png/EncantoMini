import React, { useState } from 'react';
import { 
  X, 
  Store, 
  ShoppingBag, 
  Package, 
  Settings, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Bike, 
  ChefHat, 
  Trash2, 
  Edit3, 
  Plus, 
  Save, 
  AlertTriangle,
  Phone,
  Power,
  DollarSign,
  Tag,
  MapPin,
  MessageCircle,
  Printer,
  Copy,
  ExternalLink,
  Sparkles,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Coupon, NeighborhoodFee, Order, OrderStatus, Product, ProductCategory, StoreSettings } from '../types';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';
import { ProductItemEditor, CURATED_PHOTO_GALLERY, QUICK_ADDON_SUGGESTIONS } from './ProductItemEditor';
import { ENCANTO_LOGO } from '../assets/logo';

interface StoreAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  store: StoreSettings;
  onUpdateStoreSettings: (settings: StoreSettings) => void;
  coupons?: Coupon[];
  onUpdateCoupons?: (coupons: Coupon[]) => void;
  neighborhoods?: NeighborhoodFee[];
  onUpdateNeighborhoods?: (neighborhoods: NeighborhoodFee[]) => void;
  onOpenThermalTicket?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const StoreAdminModal: React.FC<StoreAdminModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderStatus,
  products,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  store,
  onUpdateStoreSettings,
  coupons = [],
  onUpdateCoupons,
  neighborhoods = [],
  onUpdateNeighborhoods,
  onOpenThermalTicket,
  onDeleteOrder,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'coupons' | 'delivery' | 'metrics'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed'>('active');

  // Settings form
  const [storeForm, setStoreForm] = useState<StoreSettings>({ ...store });
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Edit Product Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('copo_brownie');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdPromoPrice, setNewProdPromoPrice] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdBadge, setNewProdBadge] = useState('');

  // New Coupon state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed' | 'free_shipping'>('percentage');
  const [newCouponMin, setNewCouponMin] = useState('20');

  // New Neighborhood state
  const [newNeighName, setNewNeighName] = useState('');
  const [newNeighFee, setNewNeighFee] = useState('');
  const [newNeighTime, setNewNeighTime] = useState('25-35 min');

  // Copied alert state
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'active') return ord.status !== 'finalizado' && ord.status !== 'cancelado';
    if (orderFilter === 'completed') return ord.status === 'finalizado' || ord.status === 'cancelado';
    return true;
  });

  // Calculate metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, o) => acc + o.total, 0);
  const completedCount = orders.filter((o) => o.status === 'finalizado').length;
  const activeCount = orders.filter((o) => o.status !== 'finalizado' && o.status !== 'cancelado').length;
  const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings(storeForm);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const parsedPrice = parseFloat(newProdPrice.replace(',', '.'));
    const parsedPromo = newProdPromoPrice ? parseFloat(newProdPromoPrice.replace(',', '.')) : undefined;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName.trim(),
      category: newProdCategory,
      price: parsedPrice,
      promoPrice: parsedPromo,
      shortDescription: newProdDesc.trim() || 'Preparado com ingredientes selecionados.',
      fullDescription: newProdDesc.trim() || 'Delicioso item artesanal preparado com carinho.',
      image: newProdImage.trim() || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
      badge: newProdBadge.trim() || undefined,
      isAvailable: true,
      allowsAddons: true,
    };

    onAddProduct(newProd);
    setShowAddProduct(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdPromoPrice('');
    setNewProdDesc('');
    setNewProdImage('');
    setNewProdBadge('');
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !onUpdateCoupons) return;
    const newC: Coupon = {
      id: `coup-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc.trim() || 'Desconto no pedido',
      discountType: newCouponType,
      discountValue: parseFloat(newCouponValue.replace(',', '.')) || 0,
      minOrderValue: parseFloat(newCouponMin.replace(',', '.')) || 0,
      isActive: true,
    };
    onUpdateCoupons([...coupons, newC]);
    setNewCouponCode('');
    setNewCouponDesc('');
    setNewCouponValue('');
  };

  const handleToggleCoupon = (code: string) => {
    if (!onUpdateCoupons) return;
    onUpdateCoupons(
      coupons.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteCoupon = (code: string) => {
    if (!onUpdateCoupons) return;
    onUpdateCoupons(coupons.filter((c) => c.code !== code));
  };

  const handleCreateNeighborhood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeighName || !newNeighFee || !onUpdateNeighborhoods) return;
    const newN: NeighborhoodFee = {
      id: `neigh-${Date.now()}`,
      name: newNeighName.trim(),
      fee: parseFloat(newNeighFee.replace(',', '.')) || 0,
      estimatedTime: newNeighTime.trim() || '30-45 min',
    };
    onUpdateNeighborhoods([...neighborhoods, newN]);
    setNewNeighName('');
    setNewNeighFee('');
    setNewNeighTime('25-35 min');
  };

  const handleDeleteNeighborhood = (name: string) => {
    if (!onUpdateNeighborhoods) return;
    onUpdateNeighborhoods(neighborhoods.filter((n) => n.name !== name));
  };

  const copyOrderReceipt = (order: Order) => {
    const lines = [
      `*PEDIDO #${order.orderNumber} - ${store.name}*`,
      `📅 ${new Date(order.createdAt).toLocaleString('pt-BR')}`,
      `👤 Cliente: ${order.customer.name}`,
      `📱 Tel: ${order.customer.phone}`,
      `🛵 Tipo: ${order.deliveryType.toUpperCase()}`,
    ];
    if (order.deliveryType === 'delivery' && order.address) {
      lines.push(`📍 Endereço: ${order.address.street}, ${order.address.number} - ${order.address.neighborhood}`);
      if (order.address.complement) lines.push(`ℹ️ Compl: ${order.address.complement}`);
      if (order.address.reference) lines.push(`📌 Ref: ${order.address.reference}`);
    }
    if (order.deliveryType === 'mesa' && order.tableNumber) {
      lines.push(`🪑 Mesa: ${order.tableNumber}`);
    }
    lines.push('--- ITENS ---');
    order.items.forEach((it) => {
      let itemLine = `${it.quantity}x ${it.product.name} - ${formatCurrency(it.totalPrice)}`;
      if (it.selectedFlavors && it.selectedFlavors.length > 0) {
        itemLine += `\n  Opção: ${it.selectedFlavors.map((f) => f.flavorName).join(', ')}`;
      }
      if (it.selectedAddons && it.selectedAddons.length > 0) {
        itemLine += `\n  Adicionais: ${it.selectedAddons.map((a) => `${a.quantity}x ${a.name}`).join(', ')}`;
      }
      if (it.notes) {
        itemLine += `\n  Obs: ${it.notes}`;
      }
      lines.push(itemLine);
    });
    lines.push('-------------');
    lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`);
    if (order.deliveryFee > 0) lines.push(`Taxa de Entrega: ${formatCurrency(order.deliveryFee)}`);
    if (order.discount > 0) lines.push(`Desconto (${order.couponCode || 'Cupom'}): -${formatCurrency(order.discount)}`);
    lines.push(`*TOTAL: ${formatCurrency(order.total)}*`);
    lines.push(`Pagamento: ${order.paymentMethod.toUpperCase()}`);
    if (order.changeFor) lines.push(`Troco para: ${order.changeFor}`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-5xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between shrink-0 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-0.5 border border-pink-400 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
              <img
                src={ENCANTO_LOGO}
                alt={store.name}
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg sm:text-xl leading-tight">
                  Painel do Lojista — {store.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  store.isOpen ? 'bg-emerald-500 text-stone-950' : 'bg-red-500 text-white'
                }`}>
                  {store.isOpen ? 'ABERTO' : 'FECHADO'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Gerenciamento total de pedidos, cardápio, cupons, taxas e horários
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-100 px-4 sm:px-6 border-b border-stone-200 flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos Ao Vivo</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Cardápio & Produtos</span>
            <span className="text-stone-400 text-xs">({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupons de Desconto</span>
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'delivery'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Taxas de Bairros</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações da Loja</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Faturamento & Métricas</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Filter subtabs */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1.5 bg-stone-100 p-1 rounded-xl">
                  <button
                    onClick={() => setOrderFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      orderFilter === 'active' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Ativos ({activeCount})
                  </button>
                  <button
                    onClick={() => setOrderFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      orderFilter === 'completed' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Concluídos ({completedCount})
                  </button>
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      orderFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    Todos ({orders.length})
                  </button>
                </div>

                <div className="text-xs text-stone-500 font-medium">
                  {filteredOrders.length} pedido(s) listado(s)
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-stone-200 rounded-3xl">
                  <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-heading font-bold text-stone-700 text-sm">Nenhum pedido nesta categoria</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Os novos pedidos feitos pelos clientes entrarão aqui automaticamente!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        order.status === 'recebido'
                          ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20'
                          : order.status === 'preparando'
                          ? 'border-orange-300 bg-orange-50/30'
                          : order.status === 'em_entrega' || order.status === 'pronto_retirada'
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header of Order Card */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-heading font-black text-sm text-stone-900">
                                Pedido #{order.orderNumber}
                              </span>
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-stone-900 text-white">
                                {order.deliveryType}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-500 block">
                              {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-heading font-black text-amber-700 block">
                              {formatCurrency(order.total)}
                            </span>
                            <span className="text-[10px] text-stone-500 font-semibold uppercase">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Customer details */}
                        <div className="text-xs bg-white/90 p-2.5 rounded-xl border border-stone-200 space-y-1">
                          <p className="font-bold text-stone-800">{order.customer.name}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-stone-600">{formatPhoneNumber(order.customer.phone)}</span>
                            <a
                              href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(order.customer.name)}!%20Estamos%20falando%20da%20${encodeURIComponent(store.name)}%20sobre%20o%20seu%20pedido%20%23${order.orderNumber}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                          </div>

                          {order.deliveryType === 'delivery' && order.address && (
                            <p className="text-stone-600 text-[11px] pt-1 border-t border-stone-100">
                              📍 {order.address.street}, {order.address.number} ({order.address.neighborhood})
                              {order.address.complement && ` - Compl: ${order.address.complement}`}
                            </p>
                          )}
                          {order.deliveryType === 'mesa' && order.tableNumber && (
                            <p className="text-amber-800 font-bold text-[11px]">🪑 Mesa: {order.tableNumber}</p>
                          )}
                        </div>

                        {/* Order Items */}
                        <div className="text-xs space-y-1.5 py-1 max-h-36 overflow-y-auto">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-stone-700 border-b border-stone-100 pb-1">
                              <div>
                                <span className="font-bold text-stone-900">{it.quantity}x</span> {it.product.name}
                                {it.selectedFlavors && it.selectedFlavors.length > 0 && (
                                  <span className="text-[10px] text-stone-500 block">
                                    • {it.selectedFlavors.map((f) => f.flavorName).join(', ')}
                                  </span>
                                )}
                                {it.selectedAddons && it.selectedAddons.length > 0 && (
                                  <span className="text-[10px] text-amber-700 block">
                                    • Adicionais: {it.selectedAddons.map((a) => `${a.quantity}x ${a.name}`).join(', ')}
                                  </span>
                                )}
                                {it.notes && (
                                  <span className="text-[10px] text-pink-700 italic block">
                                    Obs: {it.notes}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold shrink-0">{formatCurrency(it.totalPrice)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons on card */}
                        <div className="pt-2 flex items-center justify-between text-xs gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            {onOpenThermalTicket && (
                              <button
                                type="button"
                                onClick={() => onOpenThermalTicket(order)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-700 hover:text-pink-900 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200 transition-colors cursor-pointer"
                                title="Imprimir cupom para impressora térmica 58mm/80mm"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Térmica</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => copyOrderReceipt(order)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedOrderId === order.id ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>

                          {onDeleteOrder && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Excluir pedido #${order.orderNumber}?`)) {
                                  onDeleteOrder(order.id);
                                }
                              }}
                              className="text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Excluir Pedido"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status advancement actions */}
                      <div className="pt-3 border-t border-stone-200 mt-3 space-y-1.5">
                        <div className="flex gap-1.5">
                          {order.status === 'recebido' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'preparando')}
                              className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ChefHat className="w-3.5 h-3.5" />
                              <span>Iniciar Preparo</span>
                            </button>
                          )}

                          {order.status === 'preparando' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, order.deliveryType === 'retirada' ? 'pronto_retirada' : 'em_entrega')}
                              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Bike className="w-3.5 h-3.5" />
                              <span>{order.deliveryType === 'retirada' ? 'Pronto p/ Retirada' : 'Despachar Entrega'}</span>
                            </button>
                          )}

                          {(order.status === 'em_entrega' || order.status === 'pronto_retirada') && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'finalizado')}
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Finalizar Pedido</span>
                            </button>
                          )}

                          {order.status !== 'finalizado' && order.status !== 'cancelado' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'cancelado')}
                              className="py-2 px-2.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 font-bold text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer"
                              title="Cancelar pedido"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                <div>
                  <h4 className="font-heading font-black text-sm text-stone-900 flex items-center gap-2">
                    <span>Cardápio & Personalização de Itens</span>
                    <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200">
                      {products.length} itens
                    </span>
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Troque fotos (upload ou galeria), adicione complementos com preço e altere valores facilmente.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm shadow-pink-600/20 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Novo Produto</span>
                </button>
              </div>

              {/* Add Product Form */}
              {showAddProduct && (
                <form onSubmit={handleCreateProduct} className="p-4 sm:p-5 bg-gradient-to-br from-pink-50/80 via-white to-pink-50/30 border border-pink-300 rounded-3xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-pink-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        +
                      </div>
                      <div>
                        <h5 className="font-heading font-black text-sm text-stone-900">Cadastrar Novo Item no Cardápio</h5>
                        <p className="text-[11px] text-stone-500">Preencha os dados e escolha a foto do produto</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="text-stone-400 hover:text-stone-700 text-xs font-bold p-1"
                    >
                      ✕ Fechar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">Nome do Produto *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Copo Brownie Supremo"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">Categoria *</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      >
                        <option value="copo_brownie">Copo de Brownie</option>
                        <option value="tapiocas_salgadas">Tapiocas Salgadas</option>
                        <option value="tapioca_doce">Tapioca Doce</option>
                        <option value="bebidas">Bebidas & Sucos</option>
                        <option value="destaques">Destaques</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">Preço Normal (R$) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 12.00"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">Preço Promocional (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: 10.00"
                        value={newProdPromoPrice}
                        onChange={(e) => setNewProdPromoPrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">Selo / Badge (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Mais Pedido, Novidade"
                        value={newProdBadge}
                        onChange={(e) => setNewProdBadge(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">URL da Imagem / Foto</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Photo Selector for New Product */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-stone-700 block">
                      Ou escolha uma foto rápida da galeria:
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                      {CURATED_PHOTO_GALLERY.slice(0, 10).map((pic, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setNewProdImage(pic.url)}
                          className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all p-0.5 bg-white cursor-pointer ${
                            newProdImage === pic.url ? 'border-pink-600 scale-105 shadow-xs' : 'border-stone-200 opacity-75 hover:opacity-100'
                          }`}
                          title={pic.title}
                        >
                          <img src={pic.url} alt={pic.title} className="w-full h-full object-cover rounded-lg" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Descrição</label>
                    <textarea
                      placeholder="Descreva os ingredientes selecionados e detalhes do preparo..."
                      rows={2}
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-4 py-2 bg-stone-200 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                    >
                      Salvar Item
                    </button>
                  </div>
                </form>
              )}

              {/* Dedicated Product Item Editor Modal */}
              {editingProduct && (
                <ProductItemEditor
                  product={editingProduct}
                  isOpen={!!editingProduct}
                  onClose={() => setEditingProduct(null)}
                  onSave={(updated) => {
                    onUpdateProduct(updated);
                    setEditingProduct(null);
                  }}
                />
              )}

              {/* Products Table List */}
              <div className="border border-pink-100 rounded-3xl overflow-hidden divide-y divide-pink-50 bg-white shadow-2xs">
                {products.map((prod) => (
                  <div key={prod.id} className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-pink-50/30 transition-colors">
                    
                    {/* Media + Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-pink-200 shrink-0 bg-stone-100 group shadow-2xs">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setEditingProduct(prod)}
                          className="absolute inset-0 bg-stone-950/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          title="Alterar foto"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-black text-stone-900 text-sm truncate">
                            {prod.name}
                          </span>
                          {!prod.isAvailable && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                              Pausado
                            </span>
                          )}
                          {prod.badge && (
                            <span className="text-[10px] font-extrabold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200 hidden sm:inline">
                              {prod.badge}
                            </span>
                          )}
                          {prod.allowsAddons && (prod.availableAddons?.length ?? 0) > 0 && (
                            <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                              +{prod.availableAddons?.length} adicionais
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 truncate max-w-sm sm:max-w-md mt-0.5">
                          {prod.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Price and Action Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 shrink-0">
                      <div className="text-left sm:text-right mr-1">
                        <span className="text-sm font-black text-stone-900 block">
                          {formatCurrency(prod.promoPrice ?? prod.price)}
                        </span>
                        {prod.promoPrice && (
                          <span className="text-[10px] text-stone-400 line-through block">
                            {formatCurrency(prod.price)}
                          </span>
                        )}
                      </div>

                      {/* Main Edit Button */}
                      <button
                        onClick={() => setEditingProduct(prod)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        title="Editar foto, adicionais e preço"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {/* Toggle Availability */}
                      <button
                        onClick={() => onUpdateProduct({ ...prod, isAvailable: !prod.isAvailable })}
                        className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                          prod.isAvailable
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                        title="Alternar disponibilidade"
                      >
                        {prod.isAvailable ? 'Ativo' : 'Pausado'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente remover o produto "${prod.name}" do cardápio?`)) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-stone-200"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 3: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Cupons de Desconto Ativos
                  </h4>
                  <p className="text-xs text-stone-500">Crie campanhas para incentivar novos pedidos.</p>
                </div>
              </div>

              {/* Add Coupon Form */}
              <form onSubmit={handleCreateCoupon} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <h5 className="font-heading font-black text-xs uppercase tracking-wider text-stone-800">
                  Criar Novo Cupom
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Código do Cupom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: PROMO20"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 font-mono font-bold uppercase outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Tipo de Desconto</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-500"
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                      <option value="free_shipping">Frete Grátis</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Valor do Desconto</label>
                    <input
                      type="text"
                      placeholder={newCouponType === 'percentage' ? '10' : '5.00'}
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Pedido Mínimo (R$)</label>
                    <input
                      type="text"
                      placeholder="20"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Adicionar Cupom
                </button>
              </form>

              {/* Coupons List */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                {coupons.map((c) => (
                  <div key={c.code} className="p-3.5 bg-white flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                          {c.code}
                        </span>
                        <span className="text-xs text-stone-700 font-semibold">{c.description}</span>
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-1">
                        Pedido mínimo: {formatCurrency(c.minOrderValue)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCoupon(c.code)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          c.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {c.isActive ? 'Ativo' : 'Inativo'}
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(c.code)}
                        className="p-1 text-stone-400 hover:text-red-700"
                        title="Excluir cupom"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DELIVERY RATES */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Bairros Atendidos & Taxas de Entrega
                  </h4>
                  <p className="text-xs text-stone-500">Configure os valores cobrados por região.</p>
                </div>
              </div>

              {/* Add Neighborhood */}
              <form onSubmit={handleCreateNeighborhood} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <h5 className="font-heading font-black text-xs uppercase tracking-wider text-stone-800">
                  Adicionar Bairro / Região
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Nome do Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jardim dos Sonhos"
                      value={newNeighName}
                      onChange={(e) => setNewNeighName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Taxa de Entrega (R$) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 5.00"
                      value={newNeighFee}
                      onChange={(e) => setNewNeighFee(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Tempo Estimado</label>
                    <input
                      type="text"
                      placeholder="Ex: 20-35 min"
                      value={newNeighTime}
                      onChange={(e) => setNewNeighTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-300 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Salvar Bairro
                </button>
              </form>

              {/* Neighborhoods List */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
                {neighborhoods.map((n) => (
                  <div key={n.name} className="p-3.5 bg-white flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-xs text-stone-900 block">{n.name}</span>
                      <span className="text-[11px] text-stone-500">Tempo estimado: {n.estimatedTime}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {formatCurrency(n.fee)}
                      </span>

                      <button
                        onClick={() => handleDeleteNeighborhood(n.name)}
                        className="p-1 text-stone-400 hover:text-red-700"
                        title="Excluir bairro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STORE SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Dados, Horários & Pagamentos da Loja
                  </h4>
                  <p className="text-xs text-stone-500">Mantenha as informações do seu negócio sempre atualizadas.</p>
                </div>

                {settingsSavedMsg && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-bounce">
                    ✓ Informações salvas com sucesso!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Nome do Estabelecimento *</label>
                  <input
                    type="text"
                    required
                    value={storeForm.name}
                    onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Status de Funcionamento</label>
                  <button
                    type="button"
                    onClick={() => setStoreForm({ ...storeForm, isOpen: !storeForm.isOpen })}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      storeForm.isOpen
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>{storeForm.isOpen ? 'Loja ABERTA para pedidos' : 'Loja FECHADA temporariamente'}</span>
                  </button>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Slogan / Texto de Apresentação (Bio)</label>
                  <textarea
                    rows={2}
                    value={storeForm.tagline}
                    onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Horário de Atendimento Textual</label>
                  <input
                    type="text"
                    value={storeForm.openingHoursText}
                    onChange={(e) => setStoreForm({ ...storeForm, openingHoursText: e.target.value })}
                    placeholder="Ex: Hoje: 10:00–18:09"
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">WhatsApp para Receber Pedidos (somente números com DDD)</label>
                  <input
                    type="text"
                    value={storeForm.whatsappNumber}
                    onChange={(e) => setStoreForm({ ...storeForm, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Chave PIX Oficial</label>
                  <input
                    type="text"
                    value={storeForm.pixKey}
                    onChange={(e) => setStoreForm({ ...storeForm, pixKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Nome do Titular da Chave PIX</label>
                  <input
                    type="text"
                    value={storeForm.pixReceiverName}
                    onChange={(e) => setStoreForm({ ...storeForm, pixReceiverName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Pedido Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={storeForm.minOrderValue}
                    onChange={(e) => setStoreForm({ ...storeForm, minOrderValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={storeForm.instagram}
                    onChange={(e) => setStoreForm({ ...storeForm, instagram: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Endereço Físico</label>
                  <input
                    type="text"
                    value={storeForm.address}
                    onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Link do Google Maps ("Como chegar")</label>
                  <input
                    type="url"
                    value={storeForm.mapsUrl}
                    onChange={(e) => setStoreForm({ ...storeForm, mapsUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-stone-700 block mb-1">Banner de Aviso no Topo da Página</label>
                  <input
                    type="text"
                    value={storeForm.announcementBanner}
                    onChange={(e) => setStoreForm({ ...storeForm, announcementBanner: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Todas as Configurações</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Resumo Operacional & Vendas
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Faturamento Total</span>
                  <span className="text-xl font-heading font-black text-emerald-950 mt-1 block">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Total de Pedidos</span>
                  <span className="text-xl font-heading font-black text-amber-950 mt-1 block">
                    {orders.length}
                  </span>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">Ticket Médio</span>
                  <span className="text-xl font-heading font-black text-blue-950 mt-1 block">
                    {formatCurrency(averageTicket)}
                  </span>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Concluídos</span>
                  <span className="text-xl font-heading font-black text-purple-950 mt-1 block">
                    {completedCount}
                  </span>
                </div>
              </div>

              {/* Tips & Recommendations */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-600 space-y-2">
                <h5 className="font-bold text-stone-900">💡 Dica de Faturamento para Brownies & Tapiocas:</h5>
                <p>
                  Oferecer combinações como o Afogadinho de Ninho com Morango e Sucos Naturais gelados eleva o ticket médio dos clientes. Ative o cupom promocional no topo da tela para atrair novos clientes da sua região!
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
