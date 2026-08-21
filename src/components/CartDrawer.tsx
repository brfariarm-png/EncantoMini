import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Bike, 
  Store, 
  UtensilsCrossed, 
  Calendar, 
  Tag, 
  CreditCard, 
  DollarSign, 
  QrCode, 
  CheckCircle2, 
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  CartItem, 
  DeliveryType, 
  PaymentMethod, 
  StoreSettings, 
  Order, 
  NeighborhoodFee,
  Coupon
} from '../types';
import { formatCurrency, generateOrderWhatsAppMessage } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  store: StoreSettings;
  neighborhoods: NeighborhoodFee[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  onCreateOrder: (order: Order, sendWhatsApp: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  store,
  neighborhoods,
  coupons,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onCreateOrder,
}) => {
  if (!isOpen) return null;

  // Form states
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');

  // Address
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhoods[0]?.name || '');
  const [reference, setReference] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  // Scheduling
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Coupon input
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [validationError, setValidationError] = useState('');

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  const currentNeighborhoodObj = neighborhoods.find((n) => n.name === selectedNeighborhood);
  const rawDeliveryFee = deliveryType === 'delivery' ? (currentNeighborhoodObj?.fee ?? 6.0) : 0;

  let discount = 0;
  let deliveryFee = rawDeliveryFee;

  if (appliedCoupon && appliedCoupon.isActive && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === 'fixed') {
      discount = Math.min(subtotal, appliedCoupon.discountValue);
    } else if (appliedCoupon.discountType === 'free_shipping') {
      discount = rawDeliveryFee;
      deliveryFee = 0;
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - (appliedCoupon?.discountType === 'free_shipping' ? 0 : discount));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const success = onApplyCoupon(couponInput.trim().toUpperCase());
    if (success) {
      setCouponSuccess('Cupom aplicado com sucesso!');
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido ou valor mínimo não atingido.');
    }
  };

  const validateAndSubmit = (sendViaWhatsApp: boolean) => {
    setValidationError('');

    if (items.length === 0) {
      setValidationError('Seu carrinho está vazio.');
      return;
    }

    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome completo.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setValidationError('Por favor, informe um telefone de WhatsApp válido.');
      return;
    }

    if (subtotal < store.minOrderValue) {
      setValidationError(`O valor mínimo para pedidos é de ${formatCurrency(store.minOrderValue)}.`);
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street.trim() || !number.trim() || !selectedNeighborhood) {
        setValidationError('Por favor, preencha rua, número e bairro para a entrega.');
        return;
      }
    }

    if (deliveryType === 'mesa' && !tableNumber.trim()) {
      setValidationError('Por favor, informe o número da mesa.');
      return;
    }

    if (isScheduled && (!scheduledDate || !scheduledTime)) {
      setValidationError('Por favor, informe a data e horário agendados para a festa.');
      return;
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000).toString();

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      items: [...items],
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        cpf: customerCpf.trim() || undefined,
      },
      deliveryType,
      tableNumber: deliveryType === 'mesa' ? tableNumber.trim() : undefined,
      address: deliveryType === 'delivery' ? {
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim() || undefined,
        neighborhood: selectedNeighborhood,
        city: store.city,
        reference: reference.trim() || undefined,
      } : undefined,
      deliveryFee,
      subtotal,
      discount,
      couponCode: appliedCoupon?.code,
      total,
      paymentMethod,
      changeFor: paymentMethod === 'dinheiro' && changeFor.trim() ? changeFor.trim() : undefined,
      status: 'recebido',
      estimatedTimeMinutes: deliveryType === 'delivery' ? 40 : 25,
      isScheduled,
      scheduledDate: isScheduled ? scheduledDate : undefined,
      scheduledTime: isScheduled ? scheduledTime : undefined,
    };

    onCreateOrder(order, sendViaWhatsApp);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-stone-950 text-white flex items-center justify-between shrink-0 border-b border-pink-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-lg sm:text-xl leading-tight">
                Seu Carrinho
              </h2>
              <p className="text-xs text-pink-200/80">
                {items.length} {items.length === 1 ? 'item adicionado' : 'itens adicionados'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center text-3xl mb-4 shadow-xs">
              🍫
            </div>
            <h3 className="font-heading font-black text-lg text-stone-800">
              Seu carrinho está vazio
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mt-1 leading-relaxed">
              Explore nossos deliciosos copos de brownie cremoso, afogadinhos, tapiocas salgadas, tapiocas doces e sucos naturais!
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            
            {/* Validation Error Toast */}
            {validationError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Itens Selecionados
                </h4>
                <button
                  onClick={onClearCart}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Esvaziar
                </button>
              </div>

              <div className="divide-y divide-pink-50 border border-pink-100 rounded-2xl overflow-hidden bg-pink-50/20">
                {items.map((item) => (
                  <div key={item.id} className="p-3.5 flex gap-3 items-start bg-white">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-pink-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h5 className="font-heading font-black text-stone-900 text-xs sm:text-sm leading-tight">
                          {item.product.name}
                        </h5>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          title="Remover item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Details */}
                      <div className="mt-1 space-y-0.5 text-[11px] text-stone-500">
                        {item.preparation && (
                          <div className="text-pink-800 font-medium">
                            • {item.preparation === 'frito' ? 'Frito na hora' : 'Congelado'}
                          </div>
                        )}
                        {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                          <div className="line-clamp-2 text-pink-900 font-medium">
                            • Sabores: {item.selectedFlavors.map((f) => f.flavorName).join(', ')}
                          </div>
                        )}
                        {item.selectedAddons && item.selectedAddons.length > 0 && (
                          <div className="text-emerald-700 font-medium">
                            • Extras: {item.selectedAddons.map((a) => `${a.quantity}x ${a.name}`).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="italic text-stone-400">
                            Obs: "{item.notes}"
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded bg-white hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-stone-900">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Type Switcher */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Forma de Entrega
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    deliveryType === 'delivery'
                      ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold ring-1 ring-pink-500/30'
                      : 'border-stone-200 hover:border-pink-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  <Bike className="w-4 h-4 text-pink-600" />
                  <span className="text-xs">Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('retirada')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    deliveryType === 'retirada'
                      ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold ring-1 ring-pink-500/30'
                      : 'border-stone-200 hover:border-pink-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  <Store className="w-4 h-4 text-pink-600" />
                  <span className="text-xs">Retirada</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('mesa')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    deliveryType === 'mesa'
                      ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold ring-1 ring-pink-500/30'
                      : 'border-stone-200 hover:border-pink-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 text-pink-600" />
                  <span className="text-xs">No Local</span>
                </button>
              </div>
            </div>

            {/* Address Fields (for Delivery) */}
            {deliveryType === 'delivery' && (
              <div className="p-3.5 bg-pink-50/40 border border-pink-200 rounded-2xl space-y-3">
                <h5 className="text-xs font-bold text-pink-900 uppercase tracking-wider">
                  Endereço de Entrega
                </h5>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Rua / Logradouro *</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Ayrton Senna"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:border-pink-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Número *</label>
                    <input
                      type="text"
                      placeholder="Ex: 123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Bairro *</label>
                    <select
                      value={selectedNeighborhood}
                      onChange={(e) => setSelectedNeighborhood(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:border-pink-500 outline-none font-medium"
                    >
                      {neighborhoods.map((n) => (
                        <option key={n.name} value={n.name}>
                          {n.name} (+{formatCurrency(n.fee)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto 42, Bloco B"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    placeholder="Ex: Próximo à praça, portão rosa"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Store Pickup Address Info */}
            {deliveryType === 'retirada' && (
              <div className="p-3 bg-pink-50/60 border border-pink-200 rounded-xl text-xs text-stone-700 space-y-1">
                <span className="font-bold text-stone-900 block">Endereço para Retirada:</span>
                <p className="text-stone-600">{store.address} - {store.city}</p>
                <p className="text-pink-700 font-semibold">Tempo estimado para preparo: {store.averagePickupMinutes}</p>
              </div>
            )}

            {/* Table Number */}
            {deliveryType === 'mesa' && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl">
                <label className="text-xs font-bold text-pink-900 block mb-1">Número da Mesa *</label>
                <input
                  type="text"
                  placeholder="Ex: Mesa 04"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white rounded-lg border border-pink-300 focus:border-pink-500 outline-none font-bold"
                />
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Seus Dados
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">WhatsApp / Celular *</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">CPF na Nota (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-pink-500 outline-none"
                />
              </div>
            </div>

            {/* Event Scheduling Option */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-600" />
                  Agendar pedido para Festa ou Evento futuro
                </span>
              </label>

              {isScheduled && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Data do Evento</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:border-pink-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-600 block mb-1">Horário Desejado</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-stone-300 focus:border-pink-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Coupon Code Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Cupom de Desconto
              </h4>

              {appliedCoupon ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block">
                        Cupom {appliedCoupon.code} Ativo!
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        {appliedCoupon.description}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onRemoveCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Código do cupom (Ex: BEMVINDO10)"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs uppercase font-mono rounded-xl border border-stone-200 focus:border-pink-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer font-heading"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Forma de Pagamento
              </h4>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'pix'
                      ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold ring-1 ring-pink-500/30'
                      : 'border-stone-200 hover:border-pink-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs">PIX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cartao_entrega')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'cartao_entrega'
                      ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold ring-1 ring-pink-500/30'
                      : 'border-stone-200 hover:border-pink-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-xs">Cartão</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    paymentMethod === 'dinheiro'
                      ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold ring-1 ring-pink-500/30'
                      : 'border-stone-200 hover:border-pink-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs">Dinheiro</span>
                </button>
              </div>

              {paymentMethod === 'dinheiro' && (
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Precisa de troco para quanto? (Deixe em branco se não precisar)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Troco para R$ 50,00"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-pink-500 outline-none"
                  />
                </div>
              )}
            </div>

            {/* Totals Summary */}
            <div className="p-4 bg-pink-50/30 rounded-2xl border border-pink-100 space-y-2">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">{formatCurrency(subtotal)}</span>
              </div>

              {deliveryType === 'delivery' && (
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Taxa de Entrega ({selectedNeighborhood})</span>
                  <span className="font-semibold text-stone-800">{formatCurrency(deliveryFee)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Desconto ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-pink-200/80 flex justify-between items-baseline">
                <span className="font-heading font-black text-sm text-stone-900">Total</span>
                <span className="font-heading font-black text-xl text-pink-700">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Drawer Action Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-stone-200 space-y-2 shrink-0">
            {/* WhatsApp Checkout Button */}
            <button
              onClick={() => validateAndSubmit(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer font-heading"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Pedido pelo WhatsApp</span>
              <span className="ml-1 opacity-90">({formatCurrency(total)})</span>
            </button>

            {/* Direct Digital Order Button */}
            <button
              onClick={() => validateAndSubmit(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-pink-50 hover:bg-pink-100 text-pink-900 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-pink-200"
            >
              <span>Concluir Pedido Online</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
