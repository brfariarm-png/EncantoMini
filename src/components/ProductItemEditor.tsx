import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Layers, 
  Tag, 
  DollarSign, 
  Eye, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { Product, ProductCategory, AddonOption, FlavorOption } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProductItemEditorProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

// Preset gallery for Encanto Mini
export const CURATED_PHOTO_GALLERY = [
  {
    title: 'Copo Brownie Tradicional',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Brownie Doce de Leite',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Brownie Ninho com Morango',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Brownie Beijinho de Coco',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Afogadinho de Brownie Especial',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Afogadinho Ninho & Morango',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Afogadinho Beijinho Supremo',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Brownie Gourmet com Calda',
    category: 'copo_brownie',
    url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Queijo Mussarela',
    category: 'tapiocas_salgadas',
    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Queijo e Ovo Mexido',
    category: 'tapiocas_salgadas',
    url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Queijo e Tomate',
    category: 'tapiocas_salgadas',
    url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Especial Recheada',
    category: 'tapiocas_salgadas',
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Ninho & Morango Doce',
    category: 'tapioca_doce',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Ninho & Uva Verde',
    category: 'tapioca_doce',
    url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Coco & Leite Condensado',
    category: 'tapioca_doce',
    url: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Banana & Canela',
    category: 'tapioca_doce',
    url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tapioca Nutella Gourmet',
    category: 'tapioca_doce',
    url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Suco de Maracujá Fresco',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Suco de Morango Natural',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Suco de Laranja Fresco',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Suco de Abacaxi com Hortelã',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1546173159-315724a31d9b?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Refrigerante Lata Geladinho',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
  },
  {
    title: 'Água Mineral Gelada',
    category: 'bebidas',
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
  },
];

// Preset additions suggestions
export const QUICK_ADDON_SUGGESTIONS = [
  { name: 'Morangos frescos picados', price: 3.5, icon: '🍓', group: 'Doces' },
  { name: 'Uvas verdes selecionadas', price: 3.0, icon: '🍇', group: 'Doces' },
  { name: 'Calda extra de Ninho Cremoso', price: 3.5, icon: '🥛', group: 'Doces' },
  { name: 'Calda extra de Doce de Leite', price: 3.5, icon: '🍯', group: 'Doces' },
  { name: 'Calda extra de Beijinho de Coco', price: 3.5, icon: '🥥', group: 'Doces' },
  { name: 'Nutella Pura Original (Pote 50g)', price: 4.5, icon: '🍫', group: 'Doces' },
  { name: 'Oreo crocante triturado', price: 2.5, icon: '🍪', group: 'Doces' },
  { name: 'Leite condensado extra', price: 2.0, icon: '🥛', group: 'Doces' },
  { name: 'Coco ralado fresco adicional', price: 2.0, icon: '🥥', group: 'Doces' },
  { name: 'Banana fatiada com canela', price: 2.5, icon: '🍌', group: 'Doces' },
  { name: 'Queijo mussarela derretido extra', price: 3.5, icon: '🧀', group: 'Salgados' },
  { name: 'Ovo mexido cremoso adicional', price: 2.5, icon: '🍳', group: 'Salgados' },
  { name: 'Requeijão Cremoso Catupiry', price: 3.0, icon: '🧈', group: 'Salgados' },
  { name: 'Tomate com orégano e azeite', price: 2.0, icon: '🍅', group: 'Salgados' },
  { name: 'Bacon crocante em cubos', price: 3.5, icon: '🥓', group: 'Salgados' },
];

export const ProductItemEditor: React.FC<ProductItemEditorProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'photo' | 'addons' | 'info' | 'flavors'>('photo');

  // Form State
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [price, setPrice] = useState<number>(product.price);
  const [promoPrice, setPromoPrice] = useState<number | undefined>(product.promoPrice);
  const [badge, setBadge] = useState<string>(product.badge || '');
  const [shortDescription, setShortDescription] = useState(product.shortDescription);
  const [fullDescription, setFullDescription] = useState(product.fullDescription || product.shortDescription);
  const [image, setImage] = useState<string>(product.image);
  const [isAvailable, setIsAvailable] = useState<boolean>(product.isAvailable ?? true);

  // Addons State
  const [allowsAddons, setAllowsAddons] = useState<boolean>(product.allowsAddons ?? true);
  const [addonsList, setAddonsList] = useState<AddonOption[]>(product.availableAddons || []);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  // Flavors State
  const [allowsFlavors, setAllowsFlavors] = useState<boolean>(product.allowsFlavors ?? false);
  const [flavorsTitle, setFlavorsTitle] = useState<string>(product.flavorsTitle || 'Escolha a opção');
  const [maxFlavors, setMaxFlavors] = useState<number>(product.maxFlavors || 1);
  const [flavorsList, setFlavorsList] = useState<FlavorOption[]>(product.availableFlavors || []);
  const [newFlavorName, setNewFlavorName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload with auto-compression for high mobile compatibility
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const maxDim = 800;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImage(dataUrl);
      } else {
        const fallbackReader = new FileReader();
        fallbackReader.onload = () => {
          if (typeof fallbackReader.result === 'string') {
            setImage(fallbackReader.result);
          }
        };
        fallbackReader.readAsDataURL(file);
      }
      URL.revokeObjectURL(objectUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const fallbackReader = new FileReader();
      fallbackReader.onload = () => {
        if (typeof fallbackReader.result === 'string') {
          setImage(fallbackReader.result);
        }
      };
      fallbackReader.readAsDataURL(file);
    };

    img.src = objectUrl;
  };

  // Add custom addon
  const handleAddCustomAddon = () => {
    if (!newAddonName.trim()) return;
    const parsedPrice = parseFloat(newAddonPrice.replace(',', '.')) || 0;
    const newAddon: AddonOption = {
      id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newAddonName.trim(),
      price: parsedPrice,
    };
    setAddonsList([...addonsList, newAddon]);
    setNewAddonName('');
    setNewAddonPrice('');
  };

  // Add preset addon
  const handleAddPresetAddon = (preset: { name: string; price: number }) => {
    const exists = addonsList.some((a) => a.name.toLowerCase() === preset.name.toLowerCase());
    if (exists) {
      alert(`O adicional "${preset.name}" já está na lista deste produto.`);
      return;
    }
    const newAddon: AddonOption = {
      id: `ad-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: preset.name,
      price: preset.price,
    };
    setAddonsList([...addonsList, newAddon]);
  };

  // Remove addon
  const handleRemoveAddon = (id: string) => {
    setAddonsList(addonsList.filter((a) => a.id !== id));
  };

  // Update existing addon
  const handleUpdateAddon = (id: string, field: 'name' | 'price', value: string | number) => {
    setAddonsList(
      addonsList.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: value };
        }
        return a;
      })
    );
  };

  // Add flavor
  const handleAddFlavor = () => {
    if (!newFlavorName.trim()) return;
    const newFl: FlavorOption = {
      id: `fl-${Date.now()}`,
      name: newFlavorName.trim(),
    };
    setFlavorsList([...flavorsList, newFl]);
    setNewFlavorName('');
  };

  // Remove flavor
  const handleRemoveFlavor = (id: string) => {
    setFlavorsList(flavorsList.filter((f) => f.id !== id));
  };

  // Save changes
  const handleSave = () => {
    const updated: Product = {
      ...product,
      name: name.trim(),
      category,
      price: Number(price) || 0,
      promoPrice: promoPrice !== undefined && promoPrice > 0 ? Number(promoPrice) : undefined,
      badge: badge.trim() || undefined,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim() || shortDescription.trim(),
      image: image.trim(),
      isAvailable,
      allowsAddons,
      availableAddons: allowsAddons ? addonsList : undefined,
      allowsFlavors,
      flavorsTitle: allowsFlavors ? flavorsTitle.trim() : undefined,
      maxFlavors: allowsFlavors ? maxFlavors : undefined,
      availableFlavors: allowsFlavors ? flavorsList : undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-pink-100 flex flex-col overflow-hidden my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-pink-950 text-white flex items-center justify-between shrink-0 border-b border-pink-900/40">
          <div className="flex items-center gap-3">
            <img
              src={image || 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200&auto=format&fit=crop&q=80'}
              alt="Preview"
              className="w-11 h-11 rounded-xl object-cover border border-pink-400/40 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base sm:text-lg text-white line-clamp-1">
                  {name || 'Editar Item'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/30">
                  {formatCurrency(promoPrice ?? price)}
                </span>
              </div>
              <p className="text-xs text-pink-200/80">
                Altere a foto, adicione complementos e ajuste os dados deste produto
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center border-b border-pink-100 bg-pink-50/40 px-3 sm:px-4 shrink-0 overflow-x-auto no-scrollbar gap-1 pt-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('photo')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'photo'
                ? 'border-pink-600 text-pink-700 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-pink-600'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>📸 Foto do Produto</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('addons')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'addons'
                ? 'border-pink-600 text-pink-700 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-pink-600'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>✨ Adicionais ({addonsList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('info')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'info'
                ? 'border-pink-600 text-pink-700 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-pink-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>🏷️ Dados & Preço</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('flavors')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'flavors'
                ? 'border-pink-600 text-pink-700 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-pink-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🍓 Sabores / Frutas</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* ==================================================== */}
          {/* TAB 1: FOTO DO PRODUTO (Upload, Galeria e URL) */}
          {/* ==================================================== */}
          {activeSubTab === 'photo' && (
            <div className="space-y-5">
              {/* Live Preview Card */}
              <div className="p-4 bg-pink-50/50 border border-pink-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-pink-300 shadow-md shrink-0 bg-stone-100">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 bg-stone-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Foto Atual
                  </span>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="font-heading font-black text-sm text-stone-900">
                    Como você deseja alterar a foto?
                  </h4>
                  <p className="text-xs text-stone-600">
                    Você pode escolher uma foto do seu dispositivo (celular/computador), selecionar uma foto pronta da nossa galeria de doces e tapiocas, ou colar um link da internet.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Enviar do Celular / Computador</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Paste URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>Ou digite o link direto da imagem (URL)</span>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80')}
                      className="text-[10px] text-stone-400 hover:text-stone-700"
                    >
                      Restaurar padrão
                    </button>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none"
                  />
                </div>
              </div>

              {/* Curated Gallery Section */}
              <div className="space-y-2.5 pt-2 border-t border-pink-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-black text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    <span>Galeria Sugerida (Clique para aplicar na hora)</span>
                  </h4>
                  <span className="text-[11px] text-stone-500">{CURATED_PHOTO_GALLERY.length} fotos disponíveis</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1">
                  {CURATED_PHOTO_GALLERY.map((item, idx) => {
                    const isSelected = image === item.url;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setImage(item.url)}
                        className={`group relative rounded-xl overflow-hidden border text-left transition-all p-1 bg-white cursor-pointer ${
                          isSelected
                            ? 'border-pink-600 ring-2 ring-pink-500 shadow-sm bg-pink-50'
                            : 'border-stone-200 hover:border-pink-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="h-20 w-full rounded-lg overflow-hidden relative bg-stone-100">
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-pink-600/40 flex items-center justify-center text-white">
                              <Check className="w-5 h-5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="mt-1 block text-[10px] font-bold text-stone-800 truncate px-1">
                          {item.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: ADICIONAIS & COMPLEMENTOS */}
          {/* ==================================================== */}
          {activeSubTab === 'addons' && (
            <div className="space-y-5">
              
              {/* Toggle Addons Active */}
              <div className="p-3.5 bg-pink-50/60 border border-pink-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-xs sm:text-sm text-stone-900">
                    Permitir adicionais e complementos neste item?
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    O cliente poderá marcar e adicionar porções extras no pedido (ex: Morango, Nutella, Queijo extra).
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsAddons}
                    onChange={(e) => setAllowsAddons(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              {allowsAddons && (
                <>
                  {/* Quick Addon Suggestions */}
                  <div className="space-y-2">
                    <h5 className="font-heading font-black text-xs uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      <span>Sugestões Rápidas de Adicionais (Clique para incluir)</span>
                    </h5>

                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_ADDON_SUGGESTIONS.map((sug, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleAddPresetAddon(sug)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-pink-50 text-stone-700 hover:text-pink-900 border border-stone-200 hover:border-pink-300 shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>{sug.icon}</span>
                          <span>{sug.name}</span>
                          <span className="font-bold text-pink-700">+{formatCurrency(sug.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Custom Addon Row */}
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                    <h5 className="font-heading font-bold text-xs text-stone-800">
                      Cadastrar Novo Adicional Personalizado
                    </h5>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Nome do adicional (ex: Calda de Chocolate Belga)"
                        value={newAddonName}
                        onChange={(e) => setNewAddonName(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Valor R$ (ex: 3.50)"
                          value={newAddonPrice}
                          onChange={(e) => setNewAddonPrice(e.target.value)}
                          className="w-28 px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomAddon}
                          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                          + Incluir
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Addons List */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-heading font-black text-xs uppercase tracking-wider text-stone-800">
                        Adicionais Ativos neste Produto ({addonsList.length})
                      </h5>
                      {addonsList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAddonsList([])}
                          className="text-[11px] text-red-600 hover:underline cursor-pointer"
                        >
                          Limpar todos
                        </button>
                      )}
                    </div>

                    {addonsList.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-2xl text-stone-500 text-xs">
                        Nenhum adicional cadastrado para este item. Adicione acima para que o cliente possa personalizar!
                      </div>
                    ) : (
                      <div className="border border-pink-100 rounded-2xl overflow-hidden divide-y divide-pink-50">
                        {addonsList.map((addon) => (
                          <div
                            key={addon.id}
                            className="p-2.5 bg-white flex items-center justify-between gap-3 hover:bg-pink-50/30 transition-colors"
                          >
                            <div className="flex-1">
                              <input
                                type="text"
                                value={addon.name}
                                onChange={(e) => handleUpdateAddon(addon.id, 'name', e.target.value)}
                                className="w-full text-xs font-semibold text-stone-800 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-pink-500 focus:bg-white px-1.5 py-0.5 rounded outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-lg border border-stone-200">
                                <span className="text-[11px] text-stone-500 font-bold">R$</span>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={addon.price}
                                  onChange={(e) => handleUpdateAddon(addon.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-14 text-xs font-bold text-pink-700 bg-transparent outline-none text-right"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveAddon(addon.id)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Remover adicional"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: DADOS GERAIS & PREÇO */}
          {/* ==================================================== */}
          {activeSubTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                  >
                    <option value="copo_brownie">Copo de Brownie</option>
                    <option value="tapiocas_salgadas">Tapiocas Salgadas</option>
                    <option value="tapioca_doce">Tapioca Doce</option>
                    <option value="bebidas">Bebidas & Sucos</option>
                    <option value="destaques">Destaques</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Selo / Badge (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Mais Pedido, Especial"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Preço Promocional (R$ - Opcional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 9.90"
                    value={promoPrice ?? ''}
                    onChange={(e) => setPromoPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">Descrição Curta (Exibida no Card)</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-stone-700 block mb-1">Descrição Completa</label>
                  <textarea
                    rows={2}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                  />
                </div>
              </div>

              {/* Availability Switch */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">Status do Item no Cardápio</span>
                  <span className="text-[11px] text-stone-500">
                    {isAvailable ? 'Item ativo e visível para pedidos dos clientes' : 'Item pausado / esgotado temporariamente'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    isAvailable
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                >
                  {isAvailable ? '✓ Disponível' : '✕ Esgotado'}
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: SABORES & VARIAÇÕES */}
          {/* ==================================================== */}
          {activeSubTab === 'flavors' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-pink-50/60 border border-pink-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-xs sm:text-sm text-stone-900">
                    Permitir escolha de Sabores / Frutas?
                  </h4>
                  <p className="text-[11px] text-stone-600">
                    Usado em itens onde o cliente precisa escolher opções (ex: Morango ou Uva na tapioca de Ninho, ou sabor do suco).
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowsFlavors}
                    onChange={(e) => setAllowsFlavors(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              {allowsFlavors && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Título da Pergunta</label>
                      <input
                        type="text"
                        value={flavorsTitle}
                        onChange={(e) => setFlavorsTitle(e.target.value)}
                        placeholder="Ex: Escolha a Fruta"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Máximo de Opções Escolhidas</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={maxFlavors}
                        onChange={(e) => setMaxFlavors(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                    <h5 className="font-heading font-bold text-xs text-stone-800">
                      Adicionar Nova Opção / Sabor
                    </h5>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Morango Fresco 🍓"
                        value={newFlavorName}
                        onChange={(e) => setNewFlavorName(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white rounded-xl border border-stone-300 focus:border-pink-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddFlavor}
                        className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        + Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Flavors list */}
                  <div className="space-y-1.5">
                    {flavorsList.map((fl) => (
                      <div
                        key={fl.id}
                        className="p-2 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-stone-800">{fl.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFlavor(fl.id)}
                          className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-pink-50/40 border-t border-pink-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-pink-600/25 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Salvar Alterações do Item</span>
          </button>
        </div>

      </div>
    </div>
  );
};
