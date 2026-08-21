import React, { useMemo, useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  PieChart, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  CreditCard, 
  Zap, 
  Bike, 
  Store as StoreIcon, 
  ChevronRight,
  Download,
  Printer
} from 'lucide-react';
import { Order, Product, StoreSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  products: Product[];
  store: StoreSettings;
}

export const SalesReportModal: React.FC<SalesReportModalProps> = ({
  isOpen,
  onClose,
  orders,
  products,
  store,
}) => {
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('today');

  if (!isOpen) return null;

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    if (order.status === 'cancelado') return false;

    if (dateFilter === 'all') return true;

    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (dateFilter === 'today') {
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === '7days') {
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    if (dateFilter === '30days') {
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }

    return true;
  });

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSubtotal = filteredOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalDeliveryFees = filteredOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const totalDiscounts = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Delivery vs Balcão
  const deliveryCount = filteredOrders.filter((o) => o.deliveryType === 'delivery').length;
  const pickupCount = filteredOrders.filter((o) => o.deliveryType === 'pickup').length;

  // Payment methods breakdown
  const paymentBreakdown = {
    pix: filteredOrders.filter((o) => o.paymentMethod === 'pix').reduce((s, o) => s + o.total, 0),
    cartao: filteredOrders.filter((o) => o.paymentMethod === 'cartao_entrega').reduce((s, o) => s + o.total, 0),
    dinheiro: filteredOrders.filter((o) => o.paymentMethod === 'dinheiro').reduce((s, o) => s + o.total, 0),
  };

  // Top Selling Items Calculation
  const itemSalesMap = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();

  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const prodId = item.product.id;
      const existing = itemSalesMap.get(prodId) || {
        name: item.product.name,
        category: item.product.category,
        quantity: 0,
        revenue: 0,
      };
      existing.quantity += item.quantity;
      existing.revenue += item.totalPrice;
      itemSalesMap.set(prodId, existing);
    });
  });

  const topSellingItems = Array.from(itemSalesMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const totalItemsSold = Array.from(itemSalesMap.values()).reduce((sum, i) => sum + i.quantity, 0);

  const exportCSV = () => {
    const headers = ['Numero_Pedido', 'Data_Hora', 'Cliente', 'Telefone', 'Tipo', 'Forma_Pagamento', 'Subtotal', 'Taxa_Entrega', 'Desconto', 'Total_Geral', 'Status'];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString('pt-BR'),
      `"${o.customer.name}"`,
      o.customer.phone,
      o.deliveryType === 'delivery' ? 'Entrega' : 'Retirada',
      o.paymentMethod,
      o.subtotal.toFixed(2),
      o.deliveryFee.toFixed(2),
      o.discount.toFixed(2),
      o.total.toFixed(2),
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_vendas_encanto_mini_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-white text-lg sm:text-xl">
                Relatório Financeiro & Vendas
              </h2>
              <p className="text-xs text-stone-400">
                Desempenho da {store.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Filter & Export Row */}
        <div className="p-3 sm:p-4 bg-stone-950/60 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-2xl border border-stone-800">
            {[
              { id: 'today', label: 'Hoje' },
              { id: '7days', label: 'Últimos 7 dias' },
              { id: '30days', label: 'Últimos 30 dias' },
              { id: 'all', label: 'Todo o Período' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateFilter(tab.id as 'today' | '7days' | '30days' | 'all')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dateFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="py-2 px-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Baixar planilha CSV com os pedidos do período"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar CSV</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-950/40 space-y-6">
          
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Faturamento</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="font-heading font-black text-xl sm:text-2xl text-emerald-300">
                {formatCurrency(totalRevenue)}
              </div>
              <span className="text-[11px] text-emerald-400/80 mt-1 block">
                {totalOrdersCount} {totalOrdersCount === 1 ? 'pedido realizado' : 'pedidos realizados'}
              </span>
            </div>

            <div className="p-4 bg-pink-950/40 border border-pink-800/50 rounded-2xl">
              <div className="flex items-center justify-between text-pink-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Ticket Médio</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="font-heading font-black text-xl sm:text-2xl text-pink-300">
                {formatCurrency(averageTicket)}
              </div>
              <span className="text-[11px] text-pink-300/80 mt-1 block">
                Média por compra
              </span>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-800/50 rounded-2xl">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Itens Vendidos</span>
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="font-heading font-black text-xl sm:text-2xl text-amber-300">
                {totalItemsSold} un
              </div>
              <span className="text-[11px] text-amber-300/80 mt-1 block">
                Doces & Tapiocas
              </span>
            </div>

            <div className="p-4 bg-blue-950/40 border border-blue-800/50 rounded-2xl">
              <div className="flex items-center justify-between text-blue-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">Taxas de Entrega</span>
                <Bike className="w-4 h-4" />
              </div>
              <div className="font-heading font-black text-xl sm:text-2xl text-blue-300">
                {formatCurrency(totalDeliveryFees)}
              </div>
              <span className="text-[11px] text-blue-300/80 mt-1 block">
                {deliveryCount} entregas realizadas
              </span>
            </div>
          </div>

          {/* Breakdown Section: Payment Methods + Delivery Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Payment Methods */}
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Formas de Pagamento</span>
              </h3>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-200 mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>PIX Instantâneo</span>
                    </span>
                    <span>{formatCurrency(paymentBreakdown.pix)}</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${totalRevenue > 0 ? (paymentBreakdown.pix / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-200 mb-1">
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                      <span>Cartão na Entrega</span>
                    </span>
                    <span>{formatCurrency(paymentBreakdown.cartao)}</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full" 
                      style={{ width: `${totalRevenue > 0 ? (paymentBreakdown.cartao / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-200 mb-1">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dinheiro</span>
                    </span>
                    <span>{formatCurrency(paymentBreakdown.dinheiro)}</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${totalRevenue > 0 ? (paymentBreakdown.dinheiro / totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery vs Balcão */}
            <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
              <h3 className="font-heading font-black text-xs uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-pink-400" />
                <span>Modalidade de Pedido</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80 text-center">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Entrega (Delivery)</span>
                  <span className="font-heading font-black text-xl text-pink-400 mt-1 block">
                    {deliveryCount}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {totalOrdersCount > 0 ? Math.round((deliveryCount / totalOrdersCount) * 100) : 0}% dos pedidos
                  </span>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80 text-center">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">Retirada Balcão</span>
                  <span className="font-heading font-black text-xl text-amber-400 mt-1 block">
                    {pickupCount}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {totalOrdersCount > 0 ? Math.round((pickupCount / totalOrdersCount) * 100) : 0}% dos pedidos
                  </span>
                </div>
              </div>

              {totalDiscounts > 0 && (
                <div className="pt-1 text-xs text-stone-400 flex justify-between">
                  <span>Total de Descontos concedidos:</span>
                  <span className="font-bold text-emerald-400">-{formatCurrency(totalDiscounts)}</span>
                </div>
              )}
            </div>

          </div>

          {/* Top Selling Products Ranking */}
          <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top 5 Produtos Mais Vendidos</span>
            </h3>

            {topSellingItems.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-3 text-center">
                Nenhum produto vendido no período selecionado.
              </p>
            ) : (
              <div className="divide-y divide-stone-800/80">
                {topSellingItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                        idx === 0 ? 'bg-amber-400 text-stone-950' : idx === 1 ? 'bg-stone-300 text-stone-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-heading font-bold text-xs text-white block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {item.quantity} unidades vendidas
                        </span>
                      </div>
                    </div>

                    <div className="font-bold text-xs text-emerald-400">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
