import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, Product, StoreSettings, OrderStatus } from '../types';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const STORE_COLLECTION = 'storeSettings';
const STORE_DOC_ID = 'main_config';

/**
 * Deeply clean payload to ensure no `undefined` values exist before Firestore write
 */
function cleanPayload<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as unknown as T;
  }
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      if (value === undefined) return undefined; // JSON.stringify will omit this key in objects
      return value;
    })
  );
}

/**
 * Save new order to Firebase Cloud Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<boolean> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    const sanitizedOrder = cleanPayload({
      ...order,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(orderRef, sanitizedOrder, { merge: true });
    console.log(`[Firestore] Pedido #${order.orderNumber} (${order.id}) salvo com sucesso na nuvem.`);
    return true;
  } catch (error) {
    console.error('Erro ao salvar pedido no Firestore:', error);
    return false;
  }
}

/**
 * Sync multiple local orders to Firestore (useful for recovering pending offline orders)
 */
export async function syncPendingOrdersToFirestore(orders: Order[]): Promise<void> {
  try {
    for (const order of orders) {
      if (order && order.id) {
        const orderRef = doc(db, ORDERS_COLLECTION, order.id);
        const sanitized = cleanPayload({
          ...order,
          updatedAt: order.updatedAt || new Date().toISOString(),
        });
        await setDoc(orderRef, sanitized, { merge: true });
      }
    }
    console.log(`[Firestore] ${orders.length} pedidos sincronizados.`);
  } catch (error) {
    console.error('Erro na sincronização em lote de pedidos:', error);
  }
}

/**
 * Update order status in Firebase
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus,
  adminNotes?: string
): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    await updateDoc(orderRef, cleanPayload(updateData));
    console.log(`[Firestore] Status do pedido ${orderId} atualizado para ${status}.`);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido no Firestore:', error);
  }
}

/**
 * Delete order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
    console.log(`[Firestore] Pedido ${orderId} removido.`);
  } catch (error) {
    console.error('Erro ao excluir pedido no Firestore:', error);
  }
}

/**
 * Subscribe to real-time orders from Firestore across all connected devices
 */
export function subscribeToOrders(
  onOrdersUpdated: (orders: Order[]) => void
): () => void {
  try {
    const ordersColl = collection(db, ORDERS_COLLECTION);

    const unsubscribe = onSnapshot(
      ordersColl,
      (snapshot) => {
        const ordersList: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Order;
          if (data && data.id) {
            ordersList.push(data);
          }
        });

        // Sort descending by date in memory (ensures instant delivery across devices with zero index delay)
        ordersList.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        onOrdersUpdated(ordersList);
      },
      (error) => {
        console.warn('Aviso na conexão Firestore (pedidos):', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Não foi possível iniciar realtime de pedidos:', error);
    return () => {};
  }
}

/**
 * Sync entire products list to Firestore
 */
export async function syncProductsToFirestore(products: Product[]): Promise<void> {
  try {
    for (const product of products) {
      const prodRef = doc(db, PRODUCTS_COLLECTION, product.id);
      await setDoc(
        prodRef,
        cleanPayload({
          ...product,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    }
  } catch (error) {
    console.error('Erro ao sincronizar produtos no Firestore:', error);
  }
}

/**
 * Save or update a single product in Firestore
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(
      prodRef,
      cleanPayload({
        ...product,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
    console.log(`[Firestore] Produto ${product.name} salvo.`);
  } catch (error) {
    console.error('Erro ao salvar produto no Firestore:', error);
  }
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    const prodRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(prodRef);
    console.log(`[Firestore] Produto ${productId} removido.`);
  } catch (error) {
    console.error('Erro ao excluir produto no Firestore:', error);
  }
}

/**
 * Subscribe to real-time products updates
 */
export function subscribeToProducts(
  onProductsUpdated: (products: Product[]) => void
): () => void {
  try {
    const productsColl = collection(db, PRODUCTS_COLLECTION);
    const unsubscribe = onSnapshot(
      productsColl,
      (snapshot) => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            if (data && data.id) {
              prods.push(data);
            }
          });
          onProductsUpdated(prods);
        }
      },
      (error) => {
        console.warn('Aviso de conexão Firestore (produtos):', error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}

/**
 * Save store settings to Firestore
 */
export async function saveStoreSettingsToFirestore(
  settings: StoreSettings
): Promise<void> {
  try {
    const storeRef = doc(db, STORE_COLLECTION, STORE_DOC_ID);
    await setDoc(
      storeRef,
      cleanPayload({
        ...settings,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
    console.log('[Firestore] Configurações da loja salvas.');
  } catch (error) {
    console.error('Erro ao salvar configurações no Firestore:', error);
  }
}

/**
 * Subscribe to store settings in real time
 */
export function subscribeToStoreSettings(
  onSettingsUpdated: (settings: StoreSettings) => void
): () => void {
  try {
    const storeRef = doc(db, STORE_COLLECTION, STORE_DOC_ID);
    const unsubscribe = onSnapshot(
      storeRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onSettingsUpdated(docSnap.data() as StoreSettings);
        }
      },
      (error) => {
        console.warn('Aviso de conexão Firestore (configurações):', error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}
