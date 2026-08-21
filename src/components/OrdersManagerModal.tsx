import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Volume2, 
  VolumeX, 
  Bell, 
  Clock, 
  Bike, 
  ShoppingBag, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  ChefHat, 
  Trash2, 
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { soundAlert } from '../utils/audioAlert';

interface OrdersManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  store: StoreSettings;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenTicketPrint: (order: Order) => void;
  onOpenSalesReport?: () => void;
}

export const OrdersManagerModal: React.FC<OrdersManagerModalProps> = ({
  isOpen,
  onClose,
  orders,
  store,
  onUpdateStatus,
  onDeleteOrder,
  onOpenTicketPrint,
  onOpenSalesReport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(() => soundAlert.isSoundMuted());

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const newState = soundAlert.toggleMute();
    setIsMuted(newState);
  };

  const handleTestSound = () => {
    soundAlert.playOrderChime();
  };

  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (filterStatus !== 'todos' && order.status !== filterStatus) {
      return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customer.name.toLowerCase().includes(q);
      const matchPhone = order.customer.phone.includes(q);
      const matchItem = order.items.some((i) => i.product.name.toLowerCase().includes(q));
      return matchNumber || matchCustomer || matchPhone || matchItem;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'recebido':
        return {
          label: 'Novo Pedido',
          bg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          dot: 'bg-pink-500 animate-ping',
        };
      case 'preparando':
        return {
          label: 'Em Preparo',
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'em_entrega':
        return {
          label: 'Saiu p/ Entrega',
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          dot: 'bg-blue-500',
        };
      case 'pronto_retirada':
        return {
          label: 'Pronto p/ Retirada',
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-500',
        };
      case 'finalizado':
        return {
          label: 'Concluído',
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-500',
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          bg: 'bg-stone-800 text-stone-400 border-stone-700',
          dot: 'bg-stone-500',
        };
      default:
        return {
          label: status,
          bg: 'bg-stone-800 text-stone-300 border-stone-700',
          dot: 'bg-stone-400',
        };
    }
  };

  const sendWhatsAppStatusUpdate = (order: Order, newStatus: OrderStatus) => {
    let cleanPhone = order.customer.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    let statusMsg = '';
    if (newStatus === 'preparando') {
      statusMsg = `Olá ${order.customer.name}! 🍓 Seu pedido *#${order.orderNumber}* na *${store.name}* já está sendo preparado com muito carinho!`;
    } else if (newStatus === 'em_entrega') {
      statusMsg = `Olá ${order.customer.name}! 🛵 Oba! Seu pedido *#${order.orderNumber}* acabou de sair para entrega! Em breve o entregador chegará no seu endereço.`;
    } else if (newStatus === 'pronto_retirada') {
      statusMsg = `Olá ${order.customer.name}! 🛍️ Seu pedido *#${order.orderNumber}* já está pronto e embalado aguardando sua retirada no balcão da *${store.name}*!`;
    } else if (newStatus === 'finalizado') {
      statusMsg = `Olá ${order.customer.name}! ✨ Seu pedido *#${order.orderNumber}* foi finalizado. Agradecemos muito a sua preferência e bom apetite! ❤️`;
    } else {
      statusMsg = `Olá ${order.customer.name}! Atualização do seu pedido *#${order.orderNumber}* na *${store.name}*.`;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(statusMsg)}`;
    window.open(url, '_blank');
  };

  const countPending = orders.filter((o) => o.status === 'recebido').length;
  const countPreparing = orders.filter((o) => o.status === 'preparando').length;
  const countInTransit = orders.filter(
    (o) => o.status === 'em_entrega' || o.status === 'pronto_retirada'
  ).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col h-[94vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-white text-lg sm:text-xl">
                  Gestor de Pedidos em Tempo Real
                </h2>
                {countPending > 0 && (
                  <span className="bg-pink-500 text-stone-950 font-black text-xs px-2 py-0.5 rounded-full animate-bounce">
                    {countPending} novo(s)
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Sincronizado na Nuvem via Firebase Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Financial Sales Report */}
            {onOpenSalesReport && (
              <button
                type="button"
                onClick={onOpenSalesReport}
                className="py-2 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Abrir Relatório Financeiro e Vendas"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Relatório</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMuted
                  ? 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                  : 'bg-pink-500/20 border-pink-500/50 text-pink-300 hover:bg-pink-500/30'
              }`}
              title={isMuted ? 'Ativar som de novo pedido' : 'Desativar som de novo pedido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isMuted ? 'Som Desativado' : 'Som Ativo'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleTestSound}
              className="py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors cursor-pointer"
              title="Testar toque sonoro"
            >
              🔔 Testar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-3 sm:p-4 bg-stone-950/60 border-b border-stone-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos', count: orders.length },
              { id: 'recebido', label: 'Novos', count: countPending, highlight: countPending > 0 },
              { id: 'preparando', label: 'Preparo', count: countPreparing },
              { id: 'em_entrega', label: 'Em Entrega', count: orders.filter((o) => o.status === 'em_entrega').length },
              { id: 'pronto_retirada', label: 'Balcão', count: orders.filter((o) => o.status === 'pronto_retirada').length },
              { id: 'finalizado', label: 'Finalizados', count: orders.filter((o) => o.status === 'finalizado').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-stone-800/90 text-stone-300 hover:bg-stone-700 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      tab.highlight
                        ? 'bg-pink-400 text-stone-950 animate-pulse'
                        : 'bg-stone-900/80 text-stone-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, pedido, item..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-pink-500"
            />
          </div>

        </div>

        {/* Orders Grid / List */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-stone-950/40">
          {filteredOrders.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-stone-800 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-stone-900 flex items-center justify-center text-stone-600 mb-3">
                <ChefHat className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-black text-stone-300 text-base">
                Nenhum pedido encontrado
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mt-1">
                {orders.length === 0
                  ? 'Assim que um cliente fizer um pedido pelo cardápio, ele aparecerá aqui instantaneamente com alerta sonoro!'
                  : 'Nenhum pedido corresponde ao filtro selecionado.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const badge = getStatusBadge(order.status);
                const orderTime = new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const totalItemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

                return (
                  <div
                    key={order.id}
                    className="bg-stone-900/90 border border-stone-800 hover:border-pink-900/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all"
                  >
                    {/* Top Row: #Order, Time, Status */}
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-sm text-white bg-stone-800 px-2 py-0.5 rounded-lg">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{orderTime}</span>
                          </span>
                        </div>

                        <div className={`px-2 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="pt-3 pb-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-black text-white text-sm">
                            {order.customer.name}
                          </span>
                          <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                            {order.deliveryType === 'delivery' ? (
                              <>
                                <Bike className="w-3.5 h-3.5 text-pink-400" />
                                <span className="text-pink-300">Entrega</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-amber-300">Retirada</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="text-xs text-stone-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{order.customer.phone}</span>
                        </div>

                        {order.deliveryType === 'delivery' && order.address && (
                          <div className="text-[11px] text-stone-300 bg-stone-950/80 p-2 rounded-xl border border-stone-800/60 mt-1">
                            <span className="font-bold text-stone-400 block text-[10px]">ENDEREÇO:</span>
                            {order.address.street}, {order.address.number}
                            {order.address.complement && ` (${order.address.complement})`}
                            <span className="block text-stone-400 font-semibold mt-0.5">
                              {order.address.neighborhood} - {order.address.city}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="py-2.5 border-t border-stone-800/80 space-y-1.5">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                          Itens ({totalItemsCount} un):
                        </div>
                        {order.items.map((item, iIdx) => (
                          <div key={iIdx} className="text-xs bg-stone-950/40 p-1.5 rounded-lg">
                            <div className="flex justify-between font-bold text-stone-200">
                              <span>
                                {item.quantity}x {item.product.name}
                              </span>
                              <span className="text-stone-400">{formatCurrency(item.totalPrice)}</span>
                            </div>
                            {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                              <div className="text-[10px] text-stone-400">
                                Sabor: {item.selectedFlavors.map((f) => f.flavorName).join(', ')}
                              </div>
                            )}
                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                              <div className="text-[10px] text-pink-300/80">
                                + {item.selectedAddons.map((a) => a.name).join(', ')}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-[10px] text-amber-300/90 italic">
                                Obs: "{item.notes}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Payment & Total */}
                      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase block font-bold">
                            Pagamento:
                          </span>
                          <span className="font-bold text-stone-300 capitalize">
                            {order.paymentMethod === 'pix' && '⚡ PIX'}
                            {order.paymentMethod === 'cartao_entrega' && '💳 Cartão Entrega'}
                            {order.paymentMethod === 'dinheiro' && `💵 Dinheiro ${order.changeFor ? `(Troco p/ ${order.changeFor})` : ''}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 uppercase block font-bold">
                            Total Geral:
                          </span>
                          <span className="font-heading font-black text-sm text-pink-300">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
                      
                      {/* Step Advancement Buttons */}
                      <div className="flex gap-1.5">
                        {order.status === 'recebido' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateStatus(order.id, 'preparando');
                              sendWhatsAppStatusUpdate(order, 'preparando');
                            }}
                            className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                          >
                            <ChefHat className="w-3.5 h-3.5" />
                            <span>Iniciar Preparo</span>
                          </button>
                        )}

                        {order.status === 'preparando' && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextStatus = order.deliveryType === 'delivery' ? 'em_entrega' : 'pronto_retirada';
                              onUpdateStatus(order.id, nextStatus);
                              sendWhatsAppStatusUpdate(order, nextStatus);
                            }}
                            className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-400 text-white font-heading font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                          >
                            {order.deliveryType === 'delivery' ? <Bike className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                            <span>{order.deliveryType === 'delivery' ? 'Enviar para Entrega' : 'Pronto para Retirada'}</span>
                          </button>
                        )}

                        {(order.status === 'em_entrega' || order.status === 'pronto_retirada') && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateStatus(order.id, 'finalizado');
                              sendWhatsAppStatusUpdate(order, 'finalizado');
                            }}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Concluir Pedido</span>
                          </button>
                        )}

                        {order.status === 'finalizado' && (
                          <div className="flex-1 py-1.5 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            ✓ Pedido Concluído
                          </div>
                        )}
                      </div>

                      {/* Secondary Buttons: Thermal Print, WhatsApp, Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenTicketPrint(order)}
                          className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          title="Imprimir Comanda Térmica (58mm/80mm)"
                        >
                          <Printer className="w-3.5 h-3.5 text-pink-400" />
                          <span>Comanda</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => sendWhatsAppStatusUpdate(order, order.status)}
                          className="py-1.5 px-2.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                          title="Conversar com o Cliente no WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Zap</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Deseja excluir o pedido #${order.orderNumber}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-2 bg-stone-800/70 hover:bg-red-500/20 hover:text-red-400 text-stone-500 text-xs rounded-xl transition-colors cursor-pointer"
                          title="Excluir Pedido"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
