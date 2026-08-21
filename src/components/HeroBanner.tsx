import React from 'react';
import { 
  Star, 
  Clock, 
  MapPin, 
  Navigation, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  Tag, 
  ExternalLink, 
  Store, 
  Bike,
  Flame,
  ArrowRight,
  Download
} from 'lucide-react';
import { Product, ProductCategory, StoreSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ENCANTO_LOGO } from '../assets/logo';

interface HeroBannerProps {
  store: StoreSettings;
  products: Product[];
  onApplyCouponCode: (code: string) => void;
  onSelectCategory: (cat: ProductCategory) => void;
  onSelectProduct: (product: Product) => void;
  onOpenInstallApp?: () => void;
}

const getCategoryEmoji = (category: ProductCategory): string => {
  switch (category) {
    case 'copo_brownie':
      return '🍫';
    case 'tapiocas_salgadas':
      return '🧀';
    case 'tapioca_doce':
      return '🍓';
    case 'bebidas':
      return '🥤';
    case 'destaques':
    default:
      return '⭐';
  }
};

const getBadgeColor = (index: number, badge?: string) => {
  if (badge?.toLowerCase().includes('mais pedido')) {
    return 'bg-amber-400 text-stone-950';
  }
  if (badge?.toLowerCase().includes('promo') || badge?.toLowerCase().includes('especial')) {
    return 'bg-pink-500 text-white';
  }
  
  const colors = [
    'bg-pink-500 text-white',
    'bg-amber-400 text-stone-950',
    'bg-rose-500 text-white',
    'bg-emerald-400 text-stone-950',
  ];
  return colors[index % colors.length];
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  store,
  products,
  onApplyCouponCode,
  onSelectCategory,
  onSelectProduct,
  onOpenInstallApp,
}) => {
  // Dynamically compute the 4 featured showcase items:
  // 1. Items with category === 'destaques'
  // 2. Items with a badge or promoPrice
  // 3. Fallback to other available products
  const featuredCards = React.useMemo(() => {
    const explicitDestaques = products.filter((p) => p.category === 'destaques');
    const withBadgesOrPromo = products.filter(
      (p) => p.category !== 'destaques' && (p.badge || p.promoPrice)
    );
    const otherProducts = products.filter(
      (p) => p.category !== 'destaques' && !p.badge && !p.promoPrice
    );

    const merged = [...explicitDestaques, ...withBadgesOrPromo, ...otherProducts];
    return merged.slice(0, 4);
  }, [products]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-rose-950/70 to-stone-950 text-white pt-6 pb-8 px-4 sm:px-6 lg:px-8 border-b border-pink-900/30">
      
      {/* Soft warm confectionery background glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Info Box */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Status & Highlights row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                store.isOpen 
                  ? 'bg-emerald-500 text-stone-950' 
                  : 'bg-red-500 text-white'
              }`}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {store.isOpen ? 'Aberto Agora' : 'Fechado no Momento'}
              </span>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-900/90 text-amber-300 border border-pink-900/40">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white">4.9</span>
                <span className="text-pink-200/80">(Amado pelos clientes)</span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-950/70 text-pink-300 border border-pink-700/50">
                <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                Feito com Amor 💕
              </span>
            </div>

            {/* Title & Authentic Slogan with Brand Logo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-2xl shadow-pink-500/30 border-2 border-pink-400/80 shrink-0 overflow-hidden">
                <img
                  src={ENCANTO_LOGO}
                  alt={store.name}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-widest text-pink-400 bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-800/60">
                    Confeitaria & Tapiocaria Artesanal
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-white leading-tight">
                  {store.name}
                </h1>
                <p className="mt-1 text-sm sm:text-base text-pink-100/90 max-w-2xl font-normal leading-relaxed">
                  {store.tagline}
                </p>
              </div>
            </div>

            {/* Schedule, Address & Como Chegar */}
            <div className="p-3.5 bg-stone-900/90 border border-pink-900/40 rounded-2xl space-y-2.5 text-xs text-stone-300 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2 text-pink-300 font-semibold">
                  <Clock className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="text-stone-100 font-bold">{store.openingHoursText}</span>
                </div>

                <div className="flex items-center gap-2 text-stone-300">
                  <Bike className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Entrega rápida: {store.averageDeliveryMinutes}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-stone-200">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="truncate">{store.address}</span>
                </div>

                <a
                  href={store.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Como chegar</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>

            {/* Coupon pill & Install App Button */}
            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/25 to-rose-500/25 border border-pink-400/40 rounded-xl px-3.5 py-2 text-xs">
                <Tag className="w-3.5 h-3.5 text-pink-300 shrink-0" />
                <span className="text-pink-100">
                  Cupom de 10% OFF: <span className="font-mono font-bold text-white bg-pink-900/90 px-1.5 py-0.5 rounded border border-pink-400/50">BEMVINDO10</span>
                </span>
                <button
                  type="button"
                  onClick={() => onApplyCouponCode('BEMVINDO10')}
                  className="text-xs font-bold text-pink-300 hover:text-white underline cursor-pointer ml-1 font-heading"
                >
                  Aplicar Desconto
                </button>
              </div>

              {onOpenInstallApp && (
                <button
                  type="button"
                  onClick={onOpenInstallApp}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl border border-pink-400/40 transition-all shadow-md shadow-pink-600/30 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar App no Celular</span>
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Featured Product Cards (Clickable to customize & order) */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-heading font-black uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Destaques da Casa</span>
              </span>
              <button
                type="button"
                onClick={() => onSelectCategory('destaques')}
                className="text-[11px] font-bold text-pink-300 hover:text-white transition-colors cursor-pointer"
              >
                Ver todos ⭐
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {featuredCards.map((item, idx) => {
                const badgeText =
                  item.badge ||
                  (item.category === 'destaques'
                    ? 'Destaque'
                    : item.category === 'copo_brownie'
                    ? 'Copo Brownie'
                    : item.category === 'tapiocas_salgadas'
                    ? 'Tapioca Salgada'
                    : item.category === 'tapioca_doce'
                    ? 'Tapioca Doce'
                    : 'Bebidas');

                const badgeStyle = getBadgeColor(idx, item.badge);
                const emoji = getCategoryEmoji(item.category);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectProduct(item)}
                    className="group cursor-pointer relative rounded-2xl overflow-hidden bg-stone-900 border border-pink-900/40 hover:border-pink-400 hover:scale-[1.02] active:scale-[0.98] transition-all p-3.5 flex flex-col justify-between h-44 shadow-lg hover:shadow-pink-500/25"
                    title={`Clique para personalizar e pedir ${item.name}`}
                  >
                    {/* Background product photo */}
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-stone-950/20" />

                    {/* Top Row: Badge and Category Emoji */}
                    <div className="relative z-10 flex justify-between items-start gap-1">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs truncate max-w-[120px] ${badgeStyle}`}
                      >
                        {badgeText}
                      </span>
                      <span className="text-xs bg-stone-950/60 backdrop-blur-xs p-1 rounded-md border border-white/10 shrink-0">
                        {emoji}
                      </span>
                    </div>

                    {/* Bottom Area: Info & Price */}
                    <div className="relative z-10">
                      <h3 className="font-heading font-black text-sm text-white group-hover:text-pink-300 transition-colors line-clamp-1 leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-pink-200/80 line-clamp-1 mt-0.5">
                        {item.shortDescription}
                      </p>

                      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-1.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-black text-amber-300">
                            {formatCurrency(item.promoPrice ?? item.price)}
                          </span>
                          {item.promoPrice && (
                            <span className="text-[10px] text-stone-400 line-through">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-pink-200 group-hover:text-white flex items-center gap-0.5 bg-pink-600/60 group-hover:bg-pink-600 px-2 py-0.5 rounded-md transition-colors shadow-2xs">
                          <span>Pedir</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
