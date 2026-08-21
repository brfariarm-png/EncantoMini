import { Order, StoreSettings } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4);
    const num1 = cleaned.slice(4, 9);
    const num2 = cleaned.slice(9);
    return `(${ddd}) ${num1}-${num2}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('55')) {
    const ddd = cleaned.slice(2, 4);
    const num1 = cleaned.slice(4, 8);
    const num2 = cleaned.slice(8);
    return `(${ddd}) ${num1}-${num2}`;
  }
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function getCleanWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `55${cleaned}`;
  }
  return cleaned;
}

export function generateOrderWhatsAppMessage(order: Order, store: StoreSettings): string {
  const dateFormatted = new Date(order.createdAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `✨ *PEDIDO #${order.orderNumber} - ${store.name.toUpperCase()}*\n`;
  message += `📅 Data: ${dateFormatted}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `👤 *DADOS DO CLIENTE:*\n`;
  message += `• Nome: ${order.customer.name}\n`;
  message += `• Telefone: ${order.customer.phone}\n`;
  if (order.customer.cpf) {
    message += `• CPF na Nota: ${order.customer.cpf}\n`;
  }

  message += `\n📦 *TIPO DE PEDIDO:*\n`;
  if (order.deliveryType === 'delivery') {
    message += `🛵 *DELIVERY (Entrega em domicílio)*\n`;
    if (order.address) {
      message += `📍 Endereço: ${order.address.street}, Nº ${order.address.number}\n`;
      if (order.address.complement) {
        message += `🏢 Compl.: ${order.address.complement}\n`;
      }
      message += `🏘️ Bairro: ${order.address.neighborhood} - ${order.address.city}\n`;
      if (order.address.reference) {
        message += `🗺️ Ref.: ${order.address.reference}\n`;
      }
    }
  } else if (order.deliveryType === 'retirada') {
    message += `🏬 *RETIRADA NO BALCÃO*\n`;
    message += `📍 Endereço da Loja: ${store.address}\n`;
  } else {
    message += `🍽️ *CONSUMO NO LOCAL*\n`;
    if (order.tableNumber) {
      message += `🪑 Mesa: Nº ${order.tableNumber}\n`;
    }
  }

  if (order.isScheduled && order.scheduledDate && order.scheduledTime) {
    message += `⏰ *AGENDAMENTO DE FESTA/EVENTO:*\n`;
    message += `📅 Data do Evento: ${order.scheduledDate} às ${order.scheduledTime}\n`;
  }

  message += `\n🛒 *ITENS DO PEDIDO:*\n`;
  order.items.forEach((item, index) => {
    message += `\n*${index + 1}. ${item.quantity}x ${item.product.name}* (${formatCurrency(item.totalPrice)})\n`;
    
    if (item.preparation) {
      message += `   🔥 Preparo: ${item.preparation === 'frito' ? 'Frito na Hora (Quentinho)' : 'Congelado (Para Fritar)'}\n`;
    }

    if (item.selectedFlavors && item.selectedFlavors.length > 0) {
      const flavorStr = item.selectedFlavors.map(f => `${f.quantity}x ${f.flavorName}`).join(', ');
      message += `   🥟 Sabores: ${flavorStr}\n`;
    }

    if (item.selectedAddons && item.selectedAddons.length > 0) {
      const addonStr = item.selectedAddons.map(a => `${a.quantity}x ${a.name} (+${formatCurrency(a.price * a.quantity)})`).join(', ');
      message += `   🥫 Adicionais: ${addonStr}\n`;
    }

    if (item.notes) {
      message += `   📝 Obs: "${item.notes}"\n`;
    }
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *RESUMO DE VALORES:*\n`;
  message += `• Subtotal: ${formatCurrency(order.subtotal)}\n`;
  
  if (order.deliveryType === 'delivery') {
    message += `• Taxa de Entrega: ${formatCurrency(order.deliveryFee)}\n`;
  }

  if (order.discount > 0) {
    message += `• Desconto (${order.couponCode || 'Cupom'}): -${formatCurrency(order.discount)}\n`;
  }

  message += `*• TOTAL A PAGAR: ${formatCurrency(order.total)}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `💳 *FORMA DE PAGAMENTO:*\n`;
  if (order.paymentMethod === 'pix') {
    message += `💠 *PIX* (Chave: ${store.pixKey})\n`;
    message += `_O comprovante do Pix pode ser enviado logo após esta mensagem._\n`;
  } else if (order.paymentMethod === 'cartao_entrega') {
    message += `💳 *Cartão de Crédito/Débito* (Levar maquininha)\n`;
  } else {
    message += `💵 *Dinheiro*\n`;
    if (order.changeFor) {
      message += `• Precisa de troco para: ${order.changeFor}\n`;
    } else {
      message += `• Não precisa de troco (Valor exato)\n`;
    }
  }

  message += `\n✨ _Pedido gerado pelo Cardápio Digital Encanto Mini._\n`;
  message += `Aguardando a confirmação da cozinha! 🙏`;

  return message;
}

export function getWhatsAppOrderUrl(order: Order, store: StoreSettings): string {
  const message = generateOrderWhatsAppMessage(order, store);
  const encoded = encodeURIComponent(message);
  const cleanPhone = getCleanWhatsAppNumber(store.whatsappNumber);
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}

export function openWhatsAppWithOrder(order: Order, store: StoreSettings) {
  const url = getWhatsAppOrderUrl(order, store);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    window.open(url, '_blank');
  }
}

/**
 * Generates an authentic EMVCo BR Code (PIX Copia e Cola) standard string
 */
export function generatePixPayload(key: string, name: string, city: string, amount: number, txid: string = '***'): string {
  const cleanKey = key.trim();
  const cleanName = name.slice(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const cleanCity = city.slice(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  const formattedAmount = amount.toFixed(2);

  const formatField = (id: string, value: string) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  // Merchant Account Info
  const gui = formatField('00', 'BR.GOV.BCB.PIX');
  const keyField = formatField('01', cleanKey);
  const accountInfo = formatField('26', `${gui}${keyField}`);

  // Category & Currency
  const categoryCode = formatField('52', '0000');
  const currencyCode = formatField('53', '986');
  const transactionAmount = formatField('54', formattedAmount);
  const countryCode = formatField('58', 'BR');
  const merchantName = formatField('59', cleanName);
  const merchantCity = formatField('60', cleanCity);

  // Additional Data (txid)
  const txField = formatField('05', txid || '***');
  const additionalData = formatField('62', txField);

  const rawPayload = `000201${accountInfo}${categoryCode}${currencyCode}${transactionAmount}${countryCode}${merchantName}${merchantCity}${additionalData}6304`;

  // Calculate CRC16 (CCITT-FALSE)
  let crc = 0xffff;
  for (let i = 0; i < rawPayload.length; i++) {
    crc ^= rawPayload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  const crcString = crc.toString(16).toUpperCase().padStart(4, '0');

  return `${rawPayload}${crcString}`;
}
