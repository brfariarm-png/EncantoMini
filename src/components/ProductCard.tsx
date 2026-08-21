import React, { useState } from 'react';
import { Plus, Sparkles, Users, Utensils } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ENCANTO_LOGO } from '../assets/logo';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenProduct,
  onQuickAdd,
}) => {
  const hasCustomization =
    product.allowsFlavors ||
    product.allowsPreparationChoice ||
    (product.allowsAddons && (product.availableAddons?.length ?? 0) > 0);

  const displayPrice = product.promoPrice ?? product.price;
  const hasDiscount = product.promoPrice !== undefined && product.promoPrice < product.price;

  const [imgSrc, setImgSrc] = useState(product.image || ENCANTO_LOGO);

  React.useEffect(() => {
    setImgSrc(product.image || ENCANTO_LOGO);
  }, [product.image]);

  return (
    <div className="group bg-white rounded-2xl border border-pink-100/90 shadow-xs hover:shadow-md hover:border-pink-300 transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Media & Badges */}
      <div 
        onClick={() => onOpenProduct(product)}
        className="relative h-44 sm:h-48 overflow-hidden bg-pink-50/30 cursor-pointer flex items-center justify-center"
      >
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          onError={() => {
            if (imgSrc !== ENCANTO_LOGO) {
              setImgSrc(ENCANTO_LOGO);
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-xs">
              <Sparkles className="w-3 h-3 text-pink-200" />
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-stone-900 text-white shadow-xs">
              DESCONTO
            </span>
          )}
        </div>

        {/* Serves badge on bottom image */}
        {product.servesCount && (
          <div className="absolute bottom-2 left-2.5 z-10 flex items-center gap-1 text-[11px] font-semibold text-stone-100 bg-stone-900/75 backdrop-blur-xs px-2 py-0.5 rounded-md">
            <Users className="w-3 h-3 text-pink-300" />
            <span>{product.servesCount}</span>
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div 
          onClick={() => onOpenProduct(product)}
          className="cursor-pointer"
        >
          <h3 className="font-heading font-black text-stone-900 text-base sm:text-lg group-hover:text-pink-600 transition-colors leading-snug line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed font-normal">
            {product.shortDescription}
          </p>

          {/* Flavor options indicator */}
          {product.allowsFlavors && product.maxFlavors && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-pink-900 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200/80 w-fit font-medium">
              <Utensils className="w-3 h-3 text-pink-600" />
              <span>Opção de sabores disponíveis</span>
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between gap-2">
          <div>
            {hasDiscount && (
              <span className="text-[11px] text-stone-400 line-through block font-medium">
                {formatCurrency(product.price)}
              </span>
            )}
            <div className="text-base sm:text-lg font-heading font-black text-stone-900">
              {formatCurrency(displayPrice)}
            </div>
          </div>

          <button
            onClick={() => (hasCustomization ? onOpenProduct(product) : onQuickAdd(product))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              hasCustomization
                ? 'bg-pink-50 hover:bg-pink-600 text-pink-900 hover:text-white border border-pink-200 hover:border-pink-600'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-xs shadow-pink-600/20 active:scale-95'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{hasCustomization ? 'Opções' : 'Adicionar'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
