"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid'; // Import pour générer une clé unique

interface CartItem {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  price: string;
  image?: { sourceUrl: string };
  quantity: number;
  variationId?: string | null;
  variationPrice?: string | null;
  variationImage?: any;
  selectedAttributes?: Record<string, string>;
  // AJOUTS POUR LES PACKS (LOTS)
  isPack?: boolean;
  packItems?: any[] | null;
  // Clé unique pour éviter le warning React "two children with the same key"
  cartItemId?: string; 
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    const cleaned = price.replace(/[^0-9.,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const loadCartFromLocalStorage = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  };

  const saveCartToLocalStorage = (cartItems: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  };

  const loadCartFromSupabase = async (abortSignal?: AbortSignal) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .abortSignal(abortSignal as any); // Sécurisation contre l'AbortError

      if (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading cart from Supabase:', error);
        }
        return [];
      }

      return (data || []).map(item => ({
        id: item.product_id,
        name: item.product_name,
        slug: item.product_slug,
        price: item.product_price,
        image: item.product_image_url ? { sourceUrl: item.product_image_url } : undefined,
        quantity: item.quantity,
        variationId: item.variation_id === 'default' ? null : item.variation_id,
        variationPrice: item.variation_data?.price || null,
        variationImage: item.variation_data?.image || null,
        selectedAttributes: item.variation_data?.attributes || {},
        // RÉCUPÉRATION DES DONNÉES PACK DEPUIS SUPABASE
        isPack: item.variation_data?.isPack || false,
        packItems: item.variation_data?.packItems || null,
        cartItemId: uuidv4(), // Assure l'unicité à la récupération
      }));
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error in loadCartFromSupabase:', error);
      }
      return [];
    }
  };

  const syncCartToSupabase = useCallback(async (cartItems: CartItem[], showToast = false) => {
    if (!user) return;

    try {
      const itemsToUpsert = cartItems.map(item => ({
        user_id: user.id,
        product_id: item.id,
        product_name: item.name,
        product_slug: item.slug,
        product_price: item.price,
        product_image_url: item.image?.sourceUrl || null,
        quantity: item.quantity,
        variation_id: item.variationId || 'default',
        variation_data: {
          price: item.variationPrice,
          image: item.variationImage,
          attributes: item.selectedAttributes,
          // SAUVEGARDE DES DONNÉES PACK DANS LE JSONB
          isPack: item.isPack,
          packItems: item.packItems
        },
        updated_at: new Date().toISOString(),
      }));

      if (itemsToUpsert.length > 0) {
        const { error } = await supabase
          .from('cart_items')
          .upsert(itemsToUpsert, {
            onConflict: 'user_id,product_id,variation_id',
          });

        if (error) {
          console.error('Error syncing cart to Supabase:', error);
          throw error;
        }
      }

      const cartProductIds = cartItems.map(item => item.id);

      if (cartProductIds.length > 0) {
        // Nettoyage des items qui ne sont plus dans le panier local
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .not('product_id', 'in', `(${cartProductIds.map(id => `"${id}"`).join(',')})`);

        if (deleteError) {
          console.error('Error cleaning up cart items:', deleteError);
        }
      } else {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      }

      if (showToast) {
        toast.success('Panier sauvegardé', {
          position: 'bottom-right',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [user]);

  useEffect(() => {
    const abortController = new AbortController();

    const initCart = async () => {
      setLoading(true);

      if (user) {
        const supabaseCart = await loadCartFromSupabase(abortController.signal);
        const localCart = loadCartFromLocalStorage();

        const mergedCart: CartItem[] = [...supabaseCart];
        let hasMerged = false;

        localCart.forEach(localItem => {
          // Un lot est unique par sa composition
          const localPackKey = localItem.isPack ? JSON.stringify(localItem.packItems) : "";
          
          const existingIndex = mergedCart.findIndex(
            item => {
              const itemPackKey = item.isPack ? JSON.stringify(item.packItems) : "";
              return item.id === localItem.id && 
                     item.variationId === localItem.variationId && 
                     itemPackKey === localPackKey;
            }
          );

          if (existingIndex >= 0) {
            mergedCart[existingIndex].quantity += localItem.quantity;
            hasMerged = true;
          } else {
            // Assigner un ID unique lors de la fusion pour React
            mergedCart.push({ ...localItem, cartItemId: uuidv4() } as CartItem);
            hasMerged = true;
          }
        });

        // On ne met à jour le state que si la requête n'a pas été annulée
        if (!abortController.signal.aborted) {
          setCart(mergedCart);
          // Retarder la synchro pour éviter le conflit 400 immédiat
          setTimeout(() => {
            syncCartToSupabase(mergedCart, hasMerged || mergedCart.length > 0);
          }, 500);
          localStorage.removeItem('cart');
        }
      } else {
        const localCart = loadCartFromLocalStorage();
        setCart(localCart.map(item => ({ ...item, cartItemId: item.cartItemId || uuidv4() })));
      }

      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    };

    initCart();

    return () => {
      abortController.abort(); // Annule la requête en cours si le composant est démonté
    };
  }, [user, syncCartToSupabase]); // J'ai ajouté syncCartToSupabase aux dépendances pour être propre

  useEffect(() => {
    if (loading) return;

    const timeoutId = setTimeout(() => {
      if (user) {
        syncCartToSupabase(cart, false);
      } else {
        saveCartToLocalStorage(cart);
      }
    }, 1000); // J'ai passé le délai de debounce à 1s pour soulager Supabase

    return () => clearTimeout(timeoutId);
  }, [cart, user, loading, syncCartToSupabase]);

  const addToCart = (product: any, quantity: number = 1) => {
    setCart(prevCart => {
      // Pour les packs, la composition définit l'unicité
      const newPackKey = product.isPack ? JSON.stringify(product.packItems) : "";
      
      const existingIndex = prevCart.findIndex(
        item => {
          const itemPackKey = item.isPack ? JSON.stringify(item.packItems) : "";
          return item.id === product.id && 
                 item.variationId === product.variationId && 
                 itemPackKey === newPackKey;
        }
      );

      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += quantity;
        toast.success('Quantité mise à jour', {
          position: 'bottom-right',
        });
        return updatedCart;
      } else {
        toast.success('Article ajouté au panier', {
          position: 'bottom-right',
        });
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku || null,
          price: product.price,
          image: product.image,
          quantity,
          variationId: product.variationId || null,
          variationPrice: product.variationPrice || null,
          variationImage: product.variationImage || null,
          selectedAttributes: product.selectedAttributes || {},
          // DONNÉES DU PACK
          isPack: product.isPack || false,
          packItems: product.packItems || null,
          cartItemId: uuidv4(), // Génération de la clé unique pour React
        };
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    // cartItemId peut être id ou id-variationId, on gère les deux cas de figure
    setCart(prevCart => {
      const newCart = prevCart.filter(item => {
        // Si l'item a un cartItemId unique, on l'utilise, sinon on fallback sur l'ancienne méthode
        if (item.cartItemId) {
            return item.cartItemId !== cartItemId && 
                   (item.variationId ? `${item.id}-${item.variationId}` : item.id) !== cartItemId;
        }
        const itemId = item.variationId ? `${item.id}-${item.variationId}` : item.id;
        return itemId !== cartItemId;
      });
      toast.success('Article retiré du panier', {
        position: 'bottom-right',
      });
      return newCart;
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    setCart(prevCart => {
      return prevCart.map(item => {
        const itemId = item.variationId ? `${item.id}-${item.variationId}` : item.id;
        // On check le cartItemId (nouvelle méthode) ou l'itemId composite (ancienne méthode)
        if (item.cartItemId === cartItemId || itemId === cartItemId) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('cart');

    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    }

    toast.success('Panier vidé', {
      position: 'bottom-right',
    });
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = parsePrice(item.variationPrice || item.price);
    return total + (price * item.quantity);
  }, 0);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}