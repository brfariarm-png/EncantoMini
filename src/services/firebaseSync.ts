import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
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
 * Save new order to Firebase Cloud Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(orderRef, {
      ...order,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao salvar pedido no Firestore:', error);
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
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
  }
}

/**
 * Delete order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
  }
}

/**
 * Subscribe to real-time orders from Firestore
 */
export function subscribeToOrders(
  onOrdersUpdated: (orders: Order[]) => void
): () => void {
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as Order);
        });
        onOrdersUpdated(orders);
      },
      (error) => {
        console.warn('Alerta de conexão Firestore (pedidos):', error);
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
      await setDoc(prodRef, {
        ...product,
        updatedAt: new Date().toISOString(),
      });
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
    await setDoc(prodRef, {
      ...product,
      updatedAt: new Date().toISOString(),
    });
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
            prods.push(docSnap.data() as Product);
          });
          onProductsUpdated(prods);
        }
      },
      (error) => {
        console.warn('Alerta de conexão Firestore (produtos):', error);
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
    await setDoc(storeRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
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
        console.warn('Alerta de conexão Firestore (configurações):', error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}
