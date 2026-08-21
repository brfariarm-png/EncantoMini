import React, { useState, useEffect } from 'react';
import { 
  X, 
  Flame, 
  Snowflake, 
  Check, 
  Plus, 
  Minus, 
  Sparkles, 
  ShoppingBag, 
  Info,
  Edit3
} from 'lucide-react';
import { Product, CartItem, CartItemFlavor, CartItemAddon } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onEditProduct,
}) => {
  if (!product) return null;

  const basePrice = product.promoPrice ?? product.price;

  const [quantity, setQuantity] = useState<number>(1);
  const [preparation, setPreparation] = useState<'frito' | 'congelado'>('frito');
  const [selectedFlavors, setSelectedFlavors] = useState<Record<string, number>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Reset state when opening product
  useEffect(() => {
    setQuantity(1);
    setPreparation('frito');
    setSelectedFlavors({});
    setSelectedAddons({});
    setNotes('');
    setErrorMsg('');
  }, [product]);

  const maxFlavors = product.maxFlavors ?? 1;
  const availableFlavors = product.availableFlavors ?? [];
  const totalFlavorsCount = Object.values(selectedFlavors).reduce((a: number, b: number) => a + b, 0);

  const toggleFlavor = (flavorId: string) => {
    setErrorMsg('');
    setSelectedFlavors((prev) => {
      const current = prev[flavorId] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[flavorId];
        return copy;
      } else {
        // If single flavor selection or already reached max distinct flavors
        const selectedCount = Object.keys(prev).length;
        if (selectedCount >= maxFlavors) {
          if (maxFlavors === 1) {
            return { [flavorId]: 1 };
          }
          setErrorMsg(`Você pode escolher no máximo ${maxFlavors} sabores.`);
          return prev;
        }
        return { ...prev, [flavorId]: 1 };
      }
    });
  };

  const updateAddonQty = (addonId: string, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return { ...prev, [addonId]: next };
    });
  };

  // Calculate total unit price including addons
  const addonsTotalUnit = Object.entries(selectedAddons).reduce((acc, [addonId, qty]) => {
    const addon = product.availableAddons?.find((a) => a.id === addonId);
    const quantityNum = Number(qty) || 0;
    return acc + (addon ? addon.price * quantityNum : 0);
  }, 0);

  const unitPrice = basePrice + addonsTotalUnit;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    // Validate flavors if mandatory
    if (product.allowsFlavors && availableFlavors.length > 0) {
      const chosenCount = Object.keys(selectedFlavors).length;
      if (chosenCount === 0) {
        setErrorMsg(`Por favor, escolha pelo menos 1 sabor.`);
        return;
      }
    }

    const flavorsArray: CartItemFlavor[] = Object.entries(selectedFlavors).map(([id, qty]) => {
      const fl = availableFlavors.find((f) => f.id === id);
      return {
        flavorId: id,
        flavorName: fl?.name || id,
        quantity: Number(qty) || 1,
      };
    });

    const addonsArray: CartItemAddon[] = Object.entries(selectedAddons).map(([id, qty]) => {
      const ad = product.availableAddons?.find((a) => a.id === id);
      return {
        addonId: id,
        name: ad?.name || id,
        price: ad?.price || 0,
        quantity: Number(qty) || 1,
      };
    });

    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      product,
      quantity,
      preparation: product.allowsPreparationChoice ? preparation : undefined,
      selectedFlavors: flavorsArray.length > 0 ? flavorsArray : undefined,
      selectedAddons: addonsArray.length > 0 ? addonsArray : undefined,
      notes: notes.trim() || undefined,
      unitPrice,
      totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Media */}
        <div className="relative h-48 sm:h-56 bg-stone-900 shrink-0">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'}
            alt={product.name}
            className="w-full h-full object-cover opacity-90"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600';
              if (target.src !== fallback) {
                target.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

          {/* Top Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {onEditProduct && (
              <button
                type="button"
                onClick={() => {
                  onEditProduct(product);
                  onClose();
                }}
                className="px-2.5 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-900 text-pink-200 hover:text-white flex items-center gap-1.5 backdrop-blur-xs border border-pink-400/30 transition-all cursor-pointer text-xs font-bold shadow-xs"
                title="Editar foto e adicionais deste produto"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                <span>Editar Item</span>
              </button>
            )}
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title on media */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            {product.badge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-pink-600 to-rose-600 text-white mb-1.5 shadow-xs">
                <Sparkles className="w-3 h-3 text-pink-200" />
                {product.badge}
              </span>
            )}
            <h2 className="font-heading font-black text-xl sm:text-2xl leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg sm:text-xl font-extrabold text-pink-300">
                {formatCurrency(basePrice)}
              </span>
              {product.promoPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-pink-50">
          
          {/* Description */}
          <div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              {product.fullDescription}
            </p>
          </div>

          {/* Preparation Mode (Frito vs Congelado) */}
          {product.allowsPreparationChoice && (
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <span>Como você deseja receber?</span>
                </h4>
                <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  Obrigatório
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreparation('frito')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    preparation === 'frito'
                      ? 'border-pink-600 bg-pink-50/80 ring-2 ring-pink-500/20'
                      : 'border-stone-200 hover:border-pink-300 bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Flame className={`w-5 h-5 ${preparation === 'frito' ? 'text-pink-600' : 'text-stone-400'}`} />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      preparation === 'frito' ? 'border-pink-600 bg-pink-600 text-white' : 'border-stone-300'
                    }`}>
                      {preparation === 'frito' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs sm:text-sm font-bold text-stone-900 block">Frito na Hora</span>
                    <span className="text-[11px] text-stone-500">Quentinho e super crocante</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPreparation('congelado')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    preparation === 'congelado'
                      ? 'border-pink-600 bg-pink-50/80 ring-2 ring-pink-500/20'
                      : 'border-stone-200 hover:border-pink-300 bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Snowflake className={`w-5 h-5 ${preparation === 'congelado' ? 'text-cyan-600' : 'text-stone-400'}`} />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      preparation === 'congelado' ? 'border-pink-600 bg-pink-600 text-white' : 'border-stone-300'
                    }`}>
                      {preparation === 'congelado' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs sm:text-sm font-bold text-stone-900 block">Congelado</span>
                    <span className="text-[11px] text-stone-500">Pronto para fritar em casa</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Flavors / Fruit / Daily Flavor Selection */}
          {product.allowsFlavors && availableFlavors.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {product.flavorsTitle || 'Escolha a Opção / Sabor'}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Selecione até {maxFlavors} {maxFlavors === 1 ? 'opção' : 'opções'}
                  </p>
                </div>
                <span className="text-xs font-bold text-pink-700 bg-pink-100/70 px-2 py-0.5 rounded-full">
                  {Object.keys(selectedFlavors).length}/{maxFlavors} selecionada(s)
                </span>
              </div>

              {errorMsg && (
                <div className="mb-2.5 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableFlavors.map((flavor) => {
                  const isChecked = Boolean(selectedFlavors[flavor.id]);

                  return (
                    <div
                      key={flavor.id}
                      onClick={() => toggleFlavor(flavor.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold shadow-xs'
                          : 'border-stone-200 hover:border-pink-300 text-stone-700 bg-stone-50/40'
                      }`}
                    >
                      <span className="text-xs">{flavor.name}</span>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-pink-600 border-pink-600 text-white' : 'border-stone-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons & Caldas Extras */}
          {product.allowsAddons && product.availableAddons && product.availableAddons.length > 0 && (
            <div className="pt-4">
              <div className="mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Adicionais & Caldas Extras
                </h4>
                <p className="text-[11px] text-stone-500">Turbine sua sobremesa ou tapioca</p>
              </div>

              <div className="space-y-2">
                {product.availableAddons.map((addon) => {
                  const qty = selectedAddons[addon.id] || 0;

                  return (
                    <div
                      key={addon.id}
                      className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/40 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-xs font-semibold text-stone-800 block">
                          {addon.name}
                        </span>
                        <span className="text-[11px] font-bold text-pink-700">
                          +{formatCurrency(addon.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => updateAddonQty(addon.id, -1)}
                              className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-stone-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateAddonQty(addon.id, 1)}
                              className="w-6 h-6 rounded-md bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center font-bold text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateAddonQty(addon.id, 1)}
                            className="px-2.5 py-1 text-xs font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors cursor-pointer border border-pink-200"
                          >
                            + Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Observações do Item
            </label>
            <input
              type="text"
              placeholder="Ex: Mandar bem quentinho, caprichar na calda..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none"
              maxLength={120}
            />
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-pink-50/40 border-t border-pink-100 flex items-center justify-between gap-3 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-extrabold text-sm text-stone-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-[0.98] text-white font-extrabold rounded-2xl shadow-md shadow-pink-600/25 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ShoppingBag className="w-4 h-4" />
              Adicionar ao Pedido
            </span>
            <span className="text-sm sm:text-base font-black">
              {formatCurrency(totalPrice)}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
