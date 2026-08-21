import React from 'react';
import { 
  ShoppingBag, 
  Clock, 
  Search, 
  ReceiptText, 
  Store, 
  Sparkles, 
  PhoneCall, 
  ChefHat,
  TrendingUp,
  Download
} from 'lucide-react';
import { StoreSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ENCANTO_LOGO } from '../assets/logo';

interface NavbarProps {
  store: StoreSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenTracker: () => void;
  onOpenAdmin: () => void;
  onOpenOrdersManager?: () => void;
  onOpenSalesReport?: () => void;
  onOpenInstallApp?: () => void;
  ordersCount: number;
  pendingOrdersCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  store,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenTracker,
  onOpenAdmin,
  onOpenOrdersManager,
  onOpenSalesReport,
  onOpenInstallApp,
  ordersCount,
  pendingOrdersCount = 0,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100/90 shadow-xs">
      {/* Top promotional bar */}
      {store.announcementBanner && (
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 text-white text-xs sm:text-sm font-medium py-1.5 px-3 text-center flex items-center justify-center gap-1.5 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-pink-200" />
          <span className="truncate">{store.announcementBanner}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Brand Zone */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <div className="relative">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white flex items-center justify-center shadow-md shadow-pink-500/20 border-2 border-pink-300 p-0.5 overflow-hidden">
                <img
                  src={ENCANTO_LOGO}
                  alt={store.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${store.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} title={store.isOpen ? 'Aberto Agora' : 'Fechado no Momento'} />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-lg sm:text-2xl text-stone-900 tracking-tight">
                  {store.name}
                </span>
                <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  store.isOpen 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}>
                  {store.isOpen ? '● Aberto' : '○ Fechado'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-pink-600 font-bold flex items-center gap-1">
                <span>Doces Gourmet & Tapiocas</span>
                <span className="text-stone-300 hidden sm:inline">•</span>
                <span className="text-stone-500 font-normal hidden sm:inline">{store.openingHoursText}</span>
              </p>
            </div>
          </div>

          {/* Search bar (desktop and tablet) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar brownies, tapiocas, sucos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-pink-50/40 hover:bg-pink-50/80 focus:bg-white text-stone-800 text-sm rounded-xl border border-pink-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Zone */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Install / Download App Button */}
            {onOpenInstallApp && (
              <button
                type="button"
                onClick={onOpenInstallApp}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold text-pink-700 bg-pink-100/80 hover:bg-pink-200/80 border border-pink-300/80 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                title="Baixar Aplicativo da Loja no Celular ou PC"
              >
                <Download className="w-4 h-4 text-pink-600 animate-pulse" />
                <span className="hidden md:inline">Baixar App</span>
              </button>
            )}

            {/* Direct WhatsApp Call */}
            <a
              href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=Ol%C3%A1!%20Vim%20pelo%20card%C3%A1pio%20online%20da%20Encanto%20Mini.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              title="Falar no WhatsApp"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* Orders Tracker Button */}
            <button
              onClick={onOpenTracker}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-semibold text-stone-700 bg-pink-50/60 hover:bg-pink-100/70 border border-pink-200/60 rounded-xl transition-colors cursor-pointer"
              title="Acompanhar meus pedidos"
            >
              <ReceiptText className="w-4 h-4 text-pink-600" />
              <span className="hidden sm:inline">Meus Pedidos</span>
              {ordersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* Live Kitchen KDS / Orders Button */}
            {onOpenOrdersManager && (
              <button
                type="button"
                onClick={onOpenOrdersManager}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  pendingOrdersCount > 0
                    ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30 animate-pulse'
                    : 'bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300/80'
                }`}
                title="Gestor de Pedidos & Cozinha em Tempo Real"
              >
                <ChefHat className="w-4 h-4" />
                <span className="hidden sm:inline">Cozinha</span>
                {pendingOrdersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-pink-700 text-[10px] font-black flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Sales & Financial Report Button */}
            {onOpenSalesReport && (
              <button
                type="button"
                onClick={onOpenSalesReport}
                className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-xl transition-colors cursor-pointer"
                title="Relatório Financeiro e Vendas do Dia"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Vendas</span>
              </button>
            )}

            {/* Merchant Admin Toggle */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors cursor-pointer"
              title="Painel do Lojista / Pedidos"
            >
              <Store className="w-4 h-4 text-stone-500" />
              <span className="hidden xl:inline">Painel Lojista</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-pink-600/25 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[11px] sm:text-xs font-medium text-pink-100">
                  {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                </span>
                <span className="text-xs sm:text-sm font-extrabold">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-950 border-2 border-white text-white text-[11px] font-black flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Mobile search bar */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar brownies, tapiocas, sucos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-pink-50/50 focus:bg-white text-stone-800 text-xs rounded-xl border border-pink-100 focus:border-pink-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
