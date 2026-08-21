import React, { useRef, useState } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  Store, 
  Bike, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Order, StoreSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ENCANTO_LOGO } from '../assets/logo';

interface ThermalTicketModalProps {
  order: Order | null;
  store: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
}

export const ThermalTicketModal: React.FC<ThermalTicketModalProps> = ({
  order,
  store,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const orderDate = new Date(order.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const generatePlainTextReceipt = (): string => {
    const lines: string[] = [];
    lines.push('================================');
    lines.push(`     ${store.name.toUpperCase()}     `);
    lines.push('  Brownies & Tapiocas Artesanais');
    lines.push('================================');
    lines.push(`PEDIDO: #${order.orderNumber}`);
    lines.push(`DATA: ${orderDate}`);
    lines.push(`TIPO: ${order.deliveryType === 'delivery' ? 'ENTREGA (DELIVERY)' : 'RETIRADA NO BALCAO'}`);
    lines.push('--------------------------------');
    lines.push('CLIENTE:');
    lines.push(`Nome: ${order.customer.name}`);
    lines.push(`Tel: ${order.customer.phone}`);
    if (order.customer.cpf) {
      lines.push(`CPF: ${order.customer.cpf}`);
    }
    
    if (order.deliveryType === 'delivery' && order.address) {
      lines.push('--------------------------------');
      lines.push('ENDERECO DE ENTREGA:');
      lines.push(`${order.address.street}, ${order.address.number}`);
      if (order.address.complement) lines.push(`Compl: ${order.address.complement}`);
      lines.push(`Bairro: ${order.address.neighborhood}`);
      lines.push(`Cidade: ${order.address.city}`);
      if (order.address.reference) lines.push(`Ref: ${order.address.reference}`);
    }

    lines.push('================================');
    lines.push('ITENS DO PEDIDO:');
    lines.push('--------------------------------');

    order.items.forEach((item, idx) => {
      lines.push(`${idx + 1}. [${item.quantity}x] ${item.product.name} - ${formatCurrency(item.totalPrice)}`);
      
      if (item.selectedFlavors && item.selectedFlavors.length > 0) {
        const flavors = item.selectedFlavors.map((f) => f.flavorName).join(', ');
        lines.push(`   Sabor: ${flavors}`);
      }
      
      if (item.selectedAddons && item.selectedAddons.length > 0) {
        item.selectedAddons.forEach((addon) => {
          lines.push(`   + ${addon.quantity > 1 ? `${addon.quantity}x ` : ''}${addon.name} (${formatCurrency(addon.price)})`);
        });
      }

      if (item.notes) {
        lines.push(`   Obs: "${item.notes}"`);
      }
      lines.push('');
    });

    lines.push('================================');
    lines.push(`Subtotal:         ${formatCurrency(order.subtotal)}`);
    if (order.deliveryType === 'delivery') {
      lines.push(`Taxa de Entrega:  ${formatCurrency(order.deliveryFee)}`);
    }
    if (order.discount > 0) {
      lines.push(`Desconto (${order.couponCode || 'Cupom'}): -${formatCurrency(order.discount)}`);
    }
    lines.push('--------------------------------');
    lines.push(`TOTAL GERAL:      ${formatCurrency(order.total)}`);
    lines.push('================================');
    
    const paymentNames: Record<string, string> = {
      pix: 'PIX (Chave Cadastrada)',
      cartao_entrega: 'Cartao na Entrega (Maquininha)',
      dinheiro: 'Dinheiro',
    };
    lines.push(`PAGAMENTO: ${paymentNames[order.paymentMethod] || order.paymentMethod}`);
    if (order.paymentMethod === 'dinheiro' && order.changeFor) {
      lines.push(`Troco para: ${formatCurrency(Number(order.changeFor) || 0)}`);
    }
    lines.push('================================');
    lines.push('     Encanto Mini Agradece!     ');
    lines.push('================================');

    return lines.join('\n');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generatePlainTextReceipt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      
      {/* Styles for direct print to 58mm/80mm thermal receipt printers */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-print-area, #thermal-print-area * {
            visibility: visible;
          }
          #thermal-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 78mm;
            max-width: 80mm;
            margin: 0;
            padding: 4mm;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 12px !important;
            line-height: 1.25 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header (No print) */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-black text-white text-base">
                Comanda de Impressão #{order.orderNumber}
              </h2>
              <p className="text-xs text-stone-400">Formato Térmico (58mm / 80mm)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-950 flex justify-center">
          
          {/* Printable Ticket Container */}
          <div
            id="thermal-print-area"
            ref={printRef}
            className="bg-amber-50 text-stone-950 font-mono text-xs w-full max-w-[340px] p-5 rounded-2xl shadow-md border border-amber-200/80 leading-snug"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-stone-400">
              <div className="w-14 h-14 mx-auto mb-1.5 rounded-full overflow-hidden bg-white p-0.5 border border-stone-300 flex items-center justify-center">
                <img
                  src={ENCANTO_LOGO}
                  alt={store.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="font-bold text-base tracking-tight uppercase">
                {store.name}
              </h1>
              <p className="text-[11px] text-stone-600">Doces Gourmet, Brownies & Tapiocas</p>
              <p className="text-[10px] text-stone-500 mt-0.5">WhatsApp: {store.phoneDisplay || store.whatsappNumber}</p>
            </div>

            {/* Order metadata */}
            <div className="py-2.5 border-b-2 border-dashed border-stone-400 space-y-1">
              <div className="flex justify-between items-center text-sm font-black">
                <span>PEDIDO:</span>
                <span className="bg-stone-900 text-white px-2 py-0.5 rounded text-xs">
                  #{order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-700">
                <span>Data/Hora:</span>
                <span>{orderDate}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-stone-900">
                <span>Tipo:</span>
                <span className="uppercase">
                  {order.deliveryType === 'delivery' ? '🏍️ ENTREGA (DELIVERY)' : '🛍️ RETIRADA NO BALCÃO'}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="py-2.5 border-b-2 border-dashed border-stone-400 space-y-1">
              <div className="font-bold text-[11px] uppercase tracking-wider text-stone-800">
                Dados do Cliente:
              </div>
              <div className="text-xs">
                <span className="font-bold">{order.customer.name}</span>
              </div>
              <div className="text-[11px] text-stone-700">
                Tel: {order.customer.phone}
              </div>
              {order.customer.cpf && (
                <div className="text-[11px] text-stone-600">
                  CPF: {order.customer.cpf}
                </div>
              )}
            </div>

            {/* Address if Delivery */}
            {order.deliveryType === 'delivery' && order.address && (
              <div className="py-2.5 border-b-2 border-dashed border-stone-400 space-y-1 bg-amber-100/50 p-2 rounded -mx-1">
                <div className="font-bold text-[11px] uppercase tracking-wider text-stone-900 flex items-center gap-1">
                  <span>📍 Endereço de Entrega:</span>
                </div>
                <div className="text-xs font-bold text-stone-950">
                  {order.address.street}, {order.address.number}
                </div>
                {order.address.complement && (
                  <div className="text-[11px] text-stone-700">
                    Compl: {order.address.complement}
                  </div>
                )}
                <div className="text-[11px] font-semibold text-stone-800">
                  Bairro: {order.address.neighborhood} - {order.address.city}
                </div>
                {order.address.reference && (
                  <div className="text-[11px] text-stone-600 italic">
                    Ref: {order.address.reference}
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="py-3 border-b-2 border-dashed border-stone-400 space-y-3">
              <div className="font-bold text-[11px] uppercase tracking-wider text-stone-900">
                Itens ({order.items.reduce((acc, i) => acc + i.quantity, 0)} un):
              </div>

              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5 border-b border-stone-300 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex justify-between font-bold text-xs">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>

                  {/* Flavors */}
                  {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                    <div className="text-[10px] text-stone-700 pl-2 font-medium">
                      • Sabor: {item.selectedFlavors.map((f) => f.flavorName).join(', ')}
                    </div>
                  )}

                  {/* Addons */}
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <div className="text-[10px] text-stone-700 pl-2 space-y-0.5">
                      {item.selectedAddons.map((ad, adIdx) => (
                        <div key={adIdx} className="flex justify-between">
                          <span>+ {ad.quantity > 1 ? `${ad.quantity}x ` : ''}{ad.name}</span>
                          <span>{formatCurrency(ad.price * ad.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <div className="text-[10px] text-amber-900 bg-amber-200/60 px-1.5 py-0.5 rounded italic mt-0.5">
                      Obs: "{item.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="py-2.5 border-b-2 border-dashed border-stone-400 space-y-1">
              <div className="flex justify-between text-[11px] text-stone-700">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.deliveryType === 'delivery' && (
                <div className="flex justify-between text-[11px] text-stone-700">
                  <span>Taxa de Entrega:</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}

              {order.discount > 0 && (
                <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                  <span>Desconto ({order.couponCode || 'Cupom'}):</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black pt-1 border-t border-stone-300 text-stone-950">
                <span>TOTAL:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="py-2.5 border-b-2 border-dashed border-stone-400 space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>FORMA DE PAGAMENTO:</span>
              </div>
              <div className="text-xs font-black uppercase text-stone-900">
                {order.paymentMethod === 'pix' && '⚡ PIX'}
                {order.paymentMethod === 'cartao_entrega' && '💳 CARTÃO NA ENTREGA (MAQUININHA)'}
                {order.paymentMethod === 'dinheiro' && '💵 DINHEIRO'}
              </div>

              {order.paymentMethod === 'dinheiro' && order.changeFor && (
                <div className="text-[11px] text-stone-800 font-semibold bg-amber-200/50 p-1 rounded">
                  Troco para: {formatCurrency(Number(order.changeFor) || 0)}
                  <span className="block text-[10px] text-stone-600 font-normal">
                    (Levar troco de {formatCurrency(Math.max(0, (Number(order.changeFor) || 0) - order.total))})
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-3 text-[10px] text-stone-600">
              <p className="font-bold">*** ENCANTO MINI AGRADECE ***</p>
              <p className="mt-0.5">Feito com muito carinho e doçura!</p>
            </div>

          </div>

        </div>

        {/* Action Controls (No print) */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 no-print flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-heading font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda Térmica</span>
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-heading font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Texto Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
