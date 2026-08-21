import React, { useState } from 'react';
import { 
  X, 
  ReceiptText, 
  Clock, 
  CheckCircle2, 
  Bike, 
  ChefHat, 
  Phone, 
  Share2, 
  Copy, 
  Check, 
  RotateCw,
  ShoppingBag,
  MapPin,
  UtensilsCrossed
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../types';
import { formatCurrency, formatPhoneNumber, generateOrderWhatsAppMessage } from '../utils/formatters';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  activeOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  store: StoreSettings;
  onReorder: (order: Order) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  activeOrderId,
  onSelectOrder,
  store,
  onReorder,
}) => {
  if (!isOpen) return null;

  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const selectedOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  const getStepStatus = (orderStatus: OrderStatus, step: number) => {
    const statusMap: Record<OrderStatus, number> = {
      recebido: 1,
      preparando: 2,
      em_entrega: 3,
      pronto_retirada: 3,
      finalizado: 4,
      cancelado: 0,
    };

    const currentStep = statusMap[orderStatus] || 1;
    if (orderStatus === 'cancelado') return 'cancelled';
    if (currentStep > step) return 'completed';
    if (currentStep === step) return 'current';
    return 'upcoming';
  };

  const handleCopyReceipt = () => {
    if (!selectedOrder) return;
    const text = generateOrderWhatsAppMessage(selectedOrder, store);
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-950 text-white flex items-center justify-between shrink-0 border-b border-pink-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl leading-tight">
                Acompanhar Pedidos
              </h3>
              <p className="text-xs text-pink-200/80">
                {orders.length} {orders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-2xl flex items-center justify-center mb-3">
              🍰
            </div>
            <h4 className="font-heading font-bold text-base text-stone-800">
              Nenhum pedido encontrado
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Assim que você realizar um pedido, ele aparecerá aqui com acompanhamento em tempo real!
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Orders list tabs if multiple */}
            {orders.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => onSelectOrder(ord.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedOrder?.id === ord.id
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-pink-50 border border-stone-200'
                    }`}
                  >
                    Pedido #{ord.orderNumber} ({formatCurrency(ord.total)})
                  </button>
                ))}
              </div>
            )}

            {selectedOrder && (
              <div className="space-y-6">
                
                {/* Status Hero Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-pink-500/5 to-transparent border border-pink-200">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-pink-900 bg-pink-100 px-2.5 py-0.5 rounded-full">
                        Pedido #{selectedOrder.orderNumber}
                      </span>
                      <h4 className="font-heading font-black text-lg sm:text-xl text-stone-900 mt-1.5">
                        {selectedOrder.status === 'recebido' && 'Recebido pela Cozinha 📋'}
                        {selectedOrder.status === 'preparando' && 'Em Preparação com Carinho 💕'}
                        {selectedOrder.status === 'em_entrega' && 'Saiu para Entrega! 🛵'}
                        {selectedOrder.status === 'pronto_retirada' && 'Pronto para Retirada! 🏬'}
                        {selectedOrder.status === 'finalizado' && 'Pedido Entregue e Concluído! ✨'}
                        {selectedOrder.status === 'cancelado' && 'Pedido Cancelado ❌'}
                      </h4>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Realizado em {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(selectedOrder.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-stone-500 block">Total</span>
                      <span className="text-lg font-heading font-black text-pink-700">
                        {formatCurrency(selectedOrder.total)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  <div className="mt-6 pt-4 border-t border-pink-200/60">
                    <div className="grid grid-cols-4 gap-2 relative">
                      
                      {/* Step 1 */}
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                          getStepStatus(selectedOrder.status, 1) === 'completed' || getStepStatus(selectedOrder.status, 1) === 'current'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-stone-200 text-stone-500'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-800">1. Recebido</span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                          getStepStatus(selectedOrder.status, 2) === 'completed' || getStepStatus(selectedOrder.status, 2) === 'current'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-stone-200 text-stone-500'
                        }`}>
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-800">2. Na Cozinha</span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                          getStepStatus(selectedOrder.status, 3) === 'completed' || getStepStatus(selectedOrder.status, 3) === 'current'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-stone-200 text-stone-500'
                        }`}>
                          <Bike className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-800">
                          {selectedOrder.deliveryType === 'retirada' ? '3. Pronto' : '3. A Caminho'}
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-colors ${
                          getStepStatus(selectedOrder.status, 4) === 'completed' || getStepStatus(selectedOrder.status, 4) === 'current'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-200 text-stone-500'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-800">4. Entregue</span>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Delivery & Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-pink-600" />
                      Destino da Entrega
                    </span>
                    {selectedOrder.deliveryType === 'delivery' && selectedOrder.address ? (
                      <div className="text-stone-600 space-y-0.5">
                        <p className="font-medium text-stone-800">
                          {selectedOrder.address.street}, Nº {selectedOrder.address.number}
                        </p>
                        {selectedOrder.address.complement && (
                          <p>{selectedOrder.address.complement}</p>
                        )}
                        <p>{selectedOrder.address.neighborhood} - {selectedOrder.address.city}</p>
                        {selectedOrder.address.reference && (
                          <p className="italic text-stone-500">Ref: {selectedOrder.address.reference}</p>
                        )}
                      </div>
                    ) : selectedOrder.deliveryType === 'retirada' ? (
                      <p className="text-stone-600">Retirada no Balcão da loja: {store.address}</p>
                    ) : (
                      <p className="text-stone-600">Mesa: {selectedOrder.tableNumber || 'Salão'}</p>
                    )}
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                    <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-pink-600" />
                      Dados do Cliente
                    </span>
                    <p className="font-medium text-stone-800">{selectedOrder.customer.name}</p>
                    <p className="text-stone-600">{formatPhoneNumber(selectedOrder.customer.phone)}</p>
                    <p className="text-stone-600">
                      Pagamento: <span className="font-semibold uppercase">{selectedOrder.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                {/* Items Summary Table */}
                <div className="border border-pink-100 rounded-2xl overflow-hidden">
                  <div className="bg-pink-50/50 px-4 py-2.5 border-b border-pink-100">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-pink-950">
                      Itens do Pedido
                    </h5>
                  </div>

                  <div className="divide-y divide-pink-50 p-3 space-y-2">
                    {selectedOrder.items.map((it, idx) => (
                      <div key={idx} className="pt-2 flex justify-between items-start text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-stone-900">
                            {it.quantity}x {it.product.name}
                          </span>
                          {it.preparation && (
                            <p className="text-[11px] text-pink-800 font-medium">
                              • {it.preparation === 'frito' ? 'Frito na hora' : 'Congelado'}
                            </p>
                          )}
                          {it.selectedFlavors && (
                            <p className="text-[11px] text-stone-500">
                              • Sabores: {it.selectedFlavors.map((f) => f.flavorName).join(', ')}
                            </p>
                          )}
                          {it.selectedAddons && (
                            <p className="text-[11px] text-emerald-700">
                              • Adicionais: {it.selectedAddons.map((a) => a.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-stone-900 shrink-0">
                          {formatCurrency(it.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-pink-50/30 p-3.5 border-t border-pink-100 text-xs space-y-1.5">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Taxa de Entrega</span>
                        <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                      </div>
                    )}
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Desconto ({selectedOrder.couponCode || 'Cupom'})</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-pink-200/80 flex justify-between items-baseline font-bold text-stone-900">
                      <span className="text-sm">Total Pago</span>
                      <span className="text-base text-pink-700 font-black">
                        {formatCurrency(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <a
                    href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, gostaria de saber sobre o meu Pedido #${selectedOrder.orderNumber}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Falar com a Loja no WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      onReorder(selectedOrder);
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Pedir Novamente</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
