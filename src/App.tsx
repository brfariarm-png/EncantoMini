import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  STORE_SETTINGS, 
  INITIAL_PRODUCTS, 
  COUPONS, 
  NEIGHBORHOODS,
  CATEGORIES_LIST
} from './data/initialData';
import { ENCANTO_LOGO } from './assets/logo';
import { 
  CartItem, 
  Coupon, 
  NeighborhoodFee, 
  Order, 
  OrderStatus, 
  Product, 
  ProductCategory, 
  StoreSettings 
} from './types';
import { openWhatsAppWithOrder } from './utils/formatters';
import { soundAlert } from './utils/audioAlert';
import { 
  saveOrderToFirestore, 
  updateOrderStatusInFirestore, 
  deleteOrderFromFirestore, 
  subscribeToOrders,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToProducts,
  saveStoreSettingsToFirestore,
  subscribeToStoreSettings,
  syncProductsToFirestore
} from './services/firebaseSync';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { ProductItemEditor } from './components/ProductItemEditor';
import { CartDrawer } from './components/CartDrawer';
import { PixModal } from './components/PixModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { StoreAdminModal } from './components/StoreAdminModal';
import { OrdersManagerModal } from './components/OrdersManagerModal';
import { ThermalTicketModal } from './components/ThermalTicketModal';
import { SalesReportModal } from './components/SalesReportModal';
import { InstallAppModal } from './components/InstallAppModal';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { FloatingCartBar } from './components/FloatingCartBar';
import { SearchX, CheckCircle2, Bell, ChefHat, Printer } from 'lucide-react';

export default function App() {
  // State initialization with localStorage fallback
  const [store, setStore] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('encanto_store_settings');
    if (!saved) return STORE_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return { ...STORE_SETTINGS, ...parsed };
    } catch {
      return STORE_SETTINGS;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('encanto_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => ({
            ...p,
            image: (!p.image || p.image.includes('images.unsplash.com')) ? ENCANTO_LOGO : p.image,
          }));
        }
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('encanto_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('encanto_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('encanto_coupons');
    return saved ? JSON.parse(saved) : COUPONS;
  });

  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodFee[]>(() => {
    const saved = localStorage.getItem('encanto_neighborhoods');
    return saved ? JSON.parse(saved) : NEIGHBORHOODS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Active UI filters
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [editingProductDirectly, setEditingProductDirectly] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersManagerOpen, setIsOrdersManagerOpen] = useState(false);
  const [isSalesReportOpen, setIsSalesReportOpen] = useState(false);
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [ticketPrintOrder, setTicketPrintOrder] = useState<Order | null>(null);
  const [pixModalOrder, setPixModalOrder] = useState<Order | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Quick Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Capture beforeinstallprompt for PWA App download
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Keep track of order IDs seen to trigger sound chime on truly new orders
  const knownOrderIdsRef = useRef<Set<string>>(new Set(orders.map((o) => o.id)));
  const isInitialOrderSync = useRef(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('encanto_store_settings', JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    localStorage.setItem('encanto_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('encanto_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('encanto_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('encanto_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('encanto_neighborhoods', JSON.stringify(neighborhoods));
  }, [neighborhoods]);

  // Real-time Firebase Firestore Sync
  useEffect(() => {
    // 1. Subscribe to Cloud Orders
    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders.length > 0) {
        // Check for new incoming orders to play chime alert
        if (!isInitialOrderSync.current) {
          const newOrders = cloudOrders.filter((o) => !knownOrderIdsRef.current.has(o.id));
          if (newOrders.length > 0) {
            soundAlert.playOrderChime();
            showToast(`🔔 Novo Pedido #${newOrders[0].orderNumber} de ${newOrders[0].customer.name}!`);
          }
        }
        
        // Update seen IDs
        cloudOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
        isInitialOrderSync.current = false;
        setOrders(cloudOrders);
      } else {
        isInitialOrderSync.current = false;
      }
    });

    // 2. Subscribe to Cloud Products
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts.length > 0) {
        const sanitized = cloudProducts.map((p) => ({
          ...p,
          image: (!p.image || p.image.includes('images.unsplash.com')) ? ENCANTO_LOGO : p.image,
        }));
        setProducts(sanitized);
      } else {
        // Seed initial products to Firestore
        syncProductsToFirestore(products);
      }
    });

    // 3. Subscribe to Store Settings
    const unsubStore = subscribeToStoreSettings((cloudSettings) => {
      if (cloudSettings && cloudSettings.name) {
        setStore((prev) => ({ ...prev, ...cloudSettings }));
      }
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubStore();
    };
  }, []);

  // Cart total & counts
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'recebido').length;
  }, [orders]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      if (p.badge || p.promoPrice || p.category === 'destaques') {
        counts['destaques'] = (counts['destaques'] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory === 'destaques') {
        const isHighlight = Boolean(product.badge) || Boolean(product.promoPrice) || product.category === 'destaques';
        if (!isHighlight) return false;
      } else if (selectedCategory !== 'todos') {
        if (product.category !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.shortDescription.toLowerCase().includes(q);
        const matchesFlavors = product.availableFlavors?.some((f) => f.name.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesFlavors) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const handleAddToCart = (cartItem: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === cartItem.product.id &&
          item.preparation === cartItem.preparation &&
          item.notes === cartItem.notes &&
          JSON.stringify(item.selectedFlavors) === JSON.stringify(cartItem.selectedFlavors) &&
          JSON.stringify(item.selectedAddons) === JSON.stringify(cartItem.selectedAddons)
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const exist = updated[existingIdx];
        const newQty = exist.quantity + cartItem.quantity;
        updated[existingIdx] = {
          ...exist,
          quantity: newQty,
          totalPrice: exist.unitPrice * newQty,
        };
        return updated;
      }

      return [...prev, cartItem];
    });

    showToast(`"${cartItem.product.name}" adicionado ao pedido! ✨`);
  };

  const handleQuickAdd = (product: Product) => {
    const basePrice = product.promoPrice ?? product.price;
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      quantity: 1,
      unitPrice: basePrice,
      totalPrice: basePrice,
    };
    handleAddToCart(cartItem);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: item.unitPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Coupon handling
  const handleApplyCoupon = (code: string): boolean => {
    const found = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!found) return false;
    if (cartTotal < found.minOrderValue) return false;

    setAppliedCoupon(found);
    showToast(`Cupom "${found.code}" aplicado com sucesso! 🎉`);
    return true;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Create Order (Saves locally + Cloud Firestore)
  const handleCreateOrder = (newOrder: Order, sendWhatsApp: boolean) => {
    knownOrderIdsRef.current.add(newOrder.id);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    setIsCartOpen(false);
    setActiveOrderId(newOrder.id);

    // Save to Firebase in the background
    saveOrderToFirestore(newOrder);

    // Play chime sound
    soundAlert.playOrderChime();

    // Confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (sendWhatsApp) {
      openWhatsAppWithOrder(newOrder, store);
    }

    if (newOrder.paymentMethod === 'pix') {
      setPixModalOrder(newOrder);
    } else {
      setIsTrackerOpen(true);
    }
  };

  // Admin order status update
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    updateOrderStatusInFirestore(orderId, newStatus);
  };

  // Admin order delete
  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    deleteOrderFromFirestore(orderId);
    showToast('Pedido excluído com sucesso.');
  };

  // Admin product update / add / delete
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    saveProductToFirestore(updatedProduct);
    showToast(`Produto "${updatedProduct.name}" atualizado e salvo na nuvem!`);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    saveProductToFirestore(newProduct);
    showToast(`Novo item "${newProduct.name}" adicionado e salvo na nuvem!`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductFromFirestore(productId);
    showToast(`Produto removido do cardápio.`);
  };

  // Store Settings Update
  const handleUpdateStoreSettings = (newSettings: StoreSettings) => {
    setStore(newSettings);
    saveStoreSettingsToFirestore(newSettings);
  };

  // Group products by category when in 'todos' view
  const categorySections = useMemo(() => {
    if (selectedCategory !== 'todos' || searchQuery.trim()) {
      return null;
    }

    const sections = [
      { id: 'destaques', title: '⭐ Destaques da Casa & Mais Pedidos', items: products.filter((p) => p.badge || p.promoPrice || p.category === 'destaques') },
      { id: 'copo_brownie', title: '🍫 Copos de Brownie & Afogadinhos', items: products.filter((p) => p.category === 'copo_brownie') },
      { id: 'tapiocas_salgadas', title: '🧀 Tapiocas Salgadas', items: products.filter((p) => p.category === 'tapiocas_salgadas') },
      { id: 'tapioca_doce', title: '🍓 Tapiocas Doces', items: products.filter((p) => p.category === 'tapioca_doce') },
      { id: 'bebidas', title: '🥤 Bebidas & Sucos Naturais', items: products.filter((p) => p.category === 'bebidas') },
    ];

    // Also include any custom category added by admin
    const knownCategories = new Set<string>(['copo_brownie', 'tapiocas_salgadas', 'tapioca_doce', 'bebidas', 'destaques', 'todos']);
    const customCategories = Array.from<string>(new Set(products.map((p) => String(p.category)))).filter((cat: string) => !knownCategories.has(cat));

    customCategories.forEach((cat: string) => {
      sections.push({
        id: cat,
        title: `✨ ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
        items: products.filter((p) => p.category === cat),
      });
    });

    return sections.filter((sec) => sec.items.length > 0);
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/20 text-stone-900 selection:bg-pink-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        store={store}
        cartCount={cartItemsCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOrdersManager={() => setIsOrdersManagerOpen(true)}
        onOpenSalesReport={() => setIsSalesReportOpen(true)}
        onOpenInstallApp={() => setIsInstallAppOpen(true)}
        ordersCount={orders.length}
        pendingOrdersCount={pendingOrdersCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Showcase */}
      <HeroBanner
        store={store}
        products={products}
        onApplyCouponCode={(code) => {
          handleApplyCoupon(code);
          setIsCartOpen(true);
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onSelectProduct={(product) => setModalProduct(product)}
        onOpenInstallApp={() => setIsInstallAppOpen(true)}
      />

      {/* Category Navigation Pills */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Main Catalog Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* If searching or single category filtered */}
        {categorySections === null ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 capitalize">
                  {searchQuery 
                    ? `Resultados para "${searchQuery}"` 
                    : (CATEGORIES_LIST.find((c) => c.id === selectedCategory)?.label || selectedCategory)}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'delícia encontrada' : 'delícias encontradas'}
                </p>
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-pink-700 hover:text-pink-800 bg-pink-100/70 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Limpar busca
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 max-w-md mx-auto">
                <SearchX className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="font-heading font-black text-lg text-stone-800">
                  Nenhum produto encontrado
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Tente buscar por outro termo ou escolha outra categoria acima.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenProduct={setModalProduct}
                    onQuickAdd={handleQuickAdd}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Grouped Catalog View for all items */
          <div className="space-y-12">
            {categorySections.map((section) => (
              <section key={section.id} className="scroll-mt-36">
                <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-amber-200/60 pb-2.5">
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-stone-900 tracking-tight">
                    {section.title}
                  </h2>
                  <span className="text-xs font-bold text-stone-500">
                    {section.items.length} {section.items.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {section.items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenProduct={setModalProduct}
                      onQuickAdd={handleQuickAdd}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

      </main>

      {/* Customer Reviews & Testimonials */}
      <CustomerReviews />

      {/* Footer */}
      <Footer 
        store={store} 
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenInstallApp={() => setIsInstallAppOpen(true)}
      />

      {/* Floating Bottom Cart Bar for Mobile */}
      <FloatingCartBar
        itemCount={cartItemsCount}
        totalPrice={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Modals */}
      <InstallAppModal
        isOpen={isInstallAppOpen}
        onClose={() => setIsInstallAppOpen(false)}
        store={store}
        deferredPrompt={deferredPrompt}
        onInstalled={() => {
          setIsInstallAppOpen(false);
          showToast('Aplicativo instalado com sucesso!');
        }}
      />
      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCart}
        onEditProduct={(p) => setEditingProductDirectly(p)}
      />

      {/* Direct Item Editor Modal */}
      {editingProductDirectly && (
        <ProductItemEditor
          product={editingProductDirectly}
          isOpen={!!editingProductDirectly}
          onClose={() => setEditingProductDirectly(null)}
          onSave={(updated) => {
            handleUpdateProduct(updated);
            setEditingProductDirectly(null);
          }}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        store={store}
        neighborhoods={neighborhoods}
        coupons={coupons}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onCreateOrder={handleCreateOrder}
      />

      {/* PIX Modal */}
      <PixModal
        order={pixModalOrder}
        store={store}
        onClose={() => setPixModalOrder(null)}
        onPaymentConfirmed={(orderId) => {
          handleUpdateOrderStatus(orderId, 'preparando');
          showToast('Pagamento Pix confirmado! Cozinha iniciou o preparo.');
        }}
        onOpenTracker={() => {
          setPixModalOrder(null);
          setIsTrackerOpen(true);
        }}
      />

      {/* Order Tracker Modal for Customer */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        orders={orders}
        activeOrderId={activeOrderId}
        onSelectOrder={setActiveOrderId}
        store={store}
        onReorder={(order) => {
          setCart(order.items);
          setIsCartOpen(true);
          showToast('Itens do pedido anterior carregados no carrinho!');
        }}
      />

      {/* Realtime Kitchen KDS / Orders Manager */}
      <OrdersManagerModal
        isOpen={isOrdersManagerOpen}
        onClose={() => setIsOrdersManagerOpen(false)}
        orders={orders}
        store={store}
        onUpdateStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onOpenTicketPrint={(order) => setTicketPrintOrder(order)}
        onOpenSalesReport={() => {
          setIsOrdersManagerOpen(false);
          setIsSalesReportOpen(true);
        }}
      />

      {/* Thermal Receipt Print Modal (58mm / 80mm) */}
      <ThermalTicketModal
        order={ticketPrintOrder}
        store={store}
        isOpen={!!ticketPrintOrder}
        onClose={() => setTicketPrintOrder(null)}
      />

      {/* Financial Sales Report Modal */}
      <SalesReportModal
        isOpen={isSalesReportOpen}
        onClose={() => setIsSalesReportOpen(false)}
        orders={orders}
        products={products}
        store={store}
      />

      {/* Full Merchant Admin Modal */}
      <StoreAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        products={products}
        onUpdateProduct={handleUpdateProduct}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        store={store}
        onUpdateStoreSettings={handleUpdateStoreSettings}
        coupons={coupons}
        onUpdateCoupons={setCoupons}
        neighborhoods={neighborhoods}
        onUpdateNeighborhoods={setNeighborhoods}
        onOpenThermalTicket={(order) => setTicketPrintOrder(order)}
        onDeleteOrder={handleDeleteOrder}
      />

    </div>
  );
}
