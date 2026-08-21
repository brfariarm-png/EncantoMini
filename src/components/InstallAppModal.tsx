import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Sparkles, 
  CheckCircle2, 
  Laptop,
  ArrowRight,
  Heart
} from 'lucide-react';
import { ENCANTO_LOGO } from '../assets/logo';
import { StoreSettings } from '../types';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreSettings;
  deferredPrompt: any;
  onInstalled?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  store,
  deferredPrompt,
  onInstalled,
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
      const isAndroidDevice = /android/.test(userAgent);
      
      setIsIOS(isIphoneOrIpad);
      setIsAndroid(isAndroidDevice);

      // Check if already in standalone PWA mode
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        if (onInstalled) onInstalled();
      }
    } else if (isAndroid) {
      alert('Para instalar no Android: Toque nos 3 pontinhos (⋮) do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-pink-900/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-stone-100">
        
        {/* Header with App Logo */}
        <div className="relative bg-gradient-to-b from-pink-950/60 to-stone-950 p-6 pb-4 text-center border-b border-stone-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo Badge */}
          <div className="w-24 h-24 mx-auto mb-3 rounded-2xl overflow-hidden shadow-xl shadow-pink-500/20 border-2 border-pink-400/60 bg-white p-1 flex items-center justify-center">
            <img
              src={ENCANTO_LOGO}
              alt="Logo Encanto Mini"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <h2 className="font-heading font-black text-xl text-white">
            Baixar Aplicativo Encanto Mini
          </h2>
          <p className="text-xs text-pink-300 font-semibold mt-0.5">
            Doces Gourmet & Brownies na Palma da sua Mão
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Perks list */}
          <div className="space-y-2 bg-stone-950/70 p-3.5 rounded-2xl border border-stone-800">
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Acesso rápido em 1 toque direto na tela inicial</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Acompanhe o status do seu pedido em tempo real</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
              <span>Não ocupa memória nem precisa da Play Store ou App Store</span>
            </div>
          </div>

          {/* iOS Instructions */}
          {isIOS ? (
            <div className="bg-pink-950/40 border border-pink-800/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-pink-300 font-bold text-xs">
                <Smartphone className="w-4 h-4 text-pink-400" />
                <span>Como instalar no iPhone / iPad:</span>
              </div>
              <ol className="space-y-2 text-xs text-stone-300 pl-1 list-decimal list-inside">
                <li>
                  Toque no botão <strong className="text-white">Compartilhar</strong> (ícone do quadradinho com seta para cima <Share2 className="w-3.5 h-3.5 inline text-pink-400" /> no Safari).
                </li>
                <li>
                  Role para baixo e selecione <strong className="text-pink-300">"Adicionar à Tela de Início"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-pink-400" />.
                </li>
                <li>
                  Toque em <strong className="text-white">"Adicionar"</strong> no canto superior direito.
                </li>
              </ol>
            </div>
          ) : (
            /* Android / PC Direct Action */
            <div className="space-y-3">
              {deferredPrompt ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-heading font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5 animate-bounce" />
                  <span>Instalar Aplicativo Agora</span>
                </button>
              ) : (
                <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                  <div className="font-bold text-xs text-pink-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>Como adicionar à Tela Inicial no Android / Chrome:</span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Toque nos <strong className="text-white">três pontinhos (⋮)</strong> no topo do seu navegador e clique em <strong className="text-pink-300">"Instalar aplicativo"</strong> ou <strong className="text-pink-300">"Adicionar à tela inicial"</strong>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick confirmation note */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1">
              <span>Feito com amor por</span>
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500 inline" />
              <strong className="text-stone-400">{store.name}</strong>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
