import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, StoreSettings } from '../types';
import { formatCurrency, generatePixPayload } from '../utils/formatters';

interface PixModalProps {
  order: Order | null;
  store: StoreSettings;
  onClose: () => void;
  onPaymentConfirmed: (orderId: string) => void;
  onOpenTracker: () => void;
}

export const PixModal: React.FC<PixModalProps> = ({
  order,
  store,
  onClose,
  onPaymentConfirmed,
  onOpenTracker,
}) => {
  if (!order) return null;

  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 min timer

  const pixPayload = generatePixPayload(
    store.pixKey,
    store.pixReceiverName,
    store.city,
    order.total,
    `PED${order.orderNumber}`
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPaid = () => {
    setConfirmed(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onPaymentConfirmed(order.id);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pixPayload)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg sm:text-xl leading-tight">
                Pagamento via PIX
              </h3>
              <p className="text-xs text-emerald-200">
                Pedido #{order.orderNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Price & Timer Alert */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                Valor Total do Pix
              </span>
              <span className="text-xl font-heading font-black text-emerald-950">
                {formatCurrency(order.total)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-stone-500 block">Tempo Restante</span>
              <span className="font-mono font-bold text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-stone-50 border border-stone-200 rounded-2xl">
            <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <img
                src={qrImageUrl}
                alt="QR Code PIX"
                className="w-44 h-44 object-contain rounded-lg"
              />
            </div>
            <span className="mt-2 text-[11px] text-stone-500 font-medium">
              Aponte a câmera do app do seu banco para pagar
            </span>
          </div>

          {/* Copia e Cola Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 block">
              Pix Copia e Cola (Chave Payload)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={pixPayload}
                className="w-full px-3 py-2 text-xs font-mono bg-stone-100 border border-stone-200 rounded-xl text-stone-600 truncate outline-none select-all"
              />
              <button
                onClick={handleCopyPix}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Beneficiary details */}
          <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 space-y-0.5 border border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Favorecido:</span>
              <span className="font-semibold text-stone-800">{store.pixReceiverName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Chave Pix Direta:</span>
              <span className="font-semibold text-stone-800">{store.pixKey}</span>
            </div>
          </div>

          {/* Confirmation Action */}
          <div className="pt-2 space-y-2">
            {!confirmed ? (
              <button
                onClick={handleConfirmPaid}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Já Realizei o Pagamento via Pix</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Pagamento Notificado! Pedido em Preparação.</span>
              </div>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenTracker();
              }}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Acompanhar Status do Pedido</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
