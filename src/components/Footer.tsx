import React from 'react';
import { Phone, MapPin, Clock, Instagram, Heart, Sparkles, ShieldCheck, Navigation } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  store: StoreSettings;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ store, onOpenAdmin }) => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-12 pb-24 sm:pb-12 border-t border-stone-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-amber-600 text-white flex items-center justify-center font-bold text-lg font-heading shadow-md">
                ✨
              </div>
              <span className="font-heading font-black text-xl text-white tracking-tight">
                {store.name}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Pequenos encantos, grandes sabores! 💕 Brownies, sucos naturais e tapiocas preparados com carinho para deixar seu dia ainda mais gostoso.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-pink-400 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Tudo feito com muito amor para você! 🥰</span>
            </div>
          </div>

          {/* Col 2: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Endereço & Atendimento
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-200 block font-medium">{store.address}</span>
                  <a
                    href={store.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <Navigation className="w-3 h-3" />
                    Como chegar (Google Maps)
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {store.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="text-stone-300">{store.instagram}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Policy */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Horário de Atendimento
            </h4>
            <div className="space-y-1.5 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-stone-200 font-bold">{store.openingHoursText}</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                Pedidos preparados na hora com ingredientes frescos. Atendimento para retirada e delivery.
              </p>
            </div>
          </div>

          {/* Col 4: Payment & Admin */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Pagamento & Gestão
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 border border-stone-700">💠 PIX Instantâneo</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 border border-stone-700">💳 Cartão de Crédito</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 border border-stone-700">💳 Cartão de Débito</span>
              <span className="px-2 py-1 rounded bg-stone-800 text-stone-300 border border-stone-700">💵 Dinheiro</span>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="text-xs text-pink-400 hover:text-pink-300 underline font-semibold cursor-pointer"
              >
                ⚙️ Gerenciar Cardápio & Configurações da Loja
              </button>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-stone-800 text-center text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {store.name}. Todos os direitos reservados.</p>
          
          {/* Cardapily Signature Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 font-medium">
            <span>Feito com</span>
            <span className="text-emerald-400 font-bold">💚</span>
            <span>no</span>
            <a 
              href="https://cardapily.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              Cardapily
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
