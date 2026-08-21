import React from 'react';
import { Phone, MapPin, Clock, Instagram, Heart, Sparkles, ShieldCheck, Navigation, Download, ExternalLink } from 'lucide-react';
import { StoreSettings } from '../types';
import { ENCANTO_LOGO } from '../assets/logo';
import { formatPhoneNumber, getCleanWhatsAppNumber } from '../utils/formatters';

interface FooterProps {
  store: StoreSettings;
  onOpenAdmin: () => void;
  onOpenInstallApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ store, onOpenAdmin, onOpenInstallApp }) => {
  // Format phone number & WhatsApp url cleanly
  const cleanPhone = getCleanWhatsAppNumber(store.whatsappNumber || store.phoneDisplay || '');
  const displayPhone = store.phoneDisplay || formatPhoneNumber(store.whatsappNumber) || '(11) 99999-8888';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Olá! Vim pelo cardápio online da ${store.name}.`)}`;

  // Parse Instagram handle & direct URL
  const rawInsta = (store.instagram || '@encanto.mini').trim();
  const cleanHandle = rawInsta
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
  const instagramUrl = `https://www.instagram.com/${cleanHandle}`;
  const instagramDisplayText = `@${cleanHandle}`;

  return (
    <footer className="bg-stone-950 text-stone-300 pt-12 pb-24 sm:pb-12 border-t border-stone-800 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-pink-400 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={ENCANTO_LOGO}
                  alt={store.name}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="font-heading font-black text-xl text-white tracking-tight">
                {store.name}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Doces Gourmet, Copos de Brownie, Afogadinhos e Tapiocas artesanais preparados com muito carinho para adoçar seus dias. 💕
            </p>
            {onOpenInstallApp && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenInstallApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-900/60 hover:bg-pink-800 border border-pink-700/60 text-pink-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Aplicativo no Celular</span>
                </button>
              </div>
            )}
          </div>

          {/* Col 2: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-white">
              Endereço & Atendimento
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
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
              <li className="flex items-center gap-2 pt-0.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-200 hover:text-emerald-400 font-medium transition-colors inline-flex items-center gap-1.5"
                  title="Falar no WhatsApp / Ligar"
                >
                  <span>{displayPhone}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.5 rounded">WhatsApp</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-200 hover:text-pink-400 font-medium transition-colors inline-flex items-center gap-1"
                  title="Abrir perfil no Instagram"
                >
                  <span>{instagramDisplayText}</span>
                  <ExternalLink className="w-3 h-3 opacity-70 text-pink-400" />
                </a>
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
          <p className="text-stone-500 text-[11px]">Cardápio Digital Oficial</p>
        </div>
      </div>
    </footer>
  );
};
