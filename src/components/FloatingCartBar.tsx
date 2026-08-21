import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface FloatingCartBarProps {
  itemCount: number;
  totalPrice: number;
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  itemCount,
  totalPrice,
  onOpenCart,
}) => {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-in slide-in-from-bottom-5 duration-200">
      <button
        onClick={onOpenCart}
        className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-pink-600 to-rose-600 active:from-pink-700 active:to-rose-700 text-white rounded-2xl shadow-xl shadow-pink-950/30 border border-pink-400/40 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-950/40 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4 text-pink-100" />
          </div>
          <div className="text-left">
            <span className="text-[11px] text-pink-100 font-medium block">
              {itemCount} {itemCount === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>
            <span className="text-sm font-black">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-xs bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
          <span>Ver Carrinho</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
};
