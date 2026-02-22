'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  User,
  ShoppingCart,
  Menu,
  Shield,
  Package,
  MapPin,
  LogOut,
  Play,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MegaMenu } from '@/components/mega-menu';
import { MobileMenu } from '@/components/mobile-menu';
import { SearchModal } from '@/components/search-modal';
import { useAuthStore } from '@/stores/auth-store';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { decodeHtmlEntities } from '@/lib/utils';
import { CUSTOM_TEXTS } from '@/lib/texts';

const STATIC_LINKS = [
  { name: 'Live Shopping et Replay', href: '/live', slug: 'live', hasMegaMenu: false },
  { name: 'Carte cadeau', href: '/carte-cadeau', slug: 'carte-cadeau', hasMegaMenu: false },
  { name: 'Actus', href: '/actualites', slug: 'actualites', hasMegaMenu: false },
];

interface NavigationItem {
  name: string;
  href: string;
  slug: string;
  hasMegaMenu: boolean;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut: authStoreSignOut } = useAuthStore();
  const { wishlistCount } = useWishlist();
  const { cartItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [otherCategories, setOtherCategories] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNavigationCategories();
  }, []);

  async function loadNavigationCategories() {
    try {
      // On récupère TOUTES les catégories parentes visibles
      const { data: allParentCategories } = await supabase
        .from('categories')
        .select('id, name, slug, display_order, show_in_main_menu')
        .is('parent_id', null)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (allParentCategories) {
        const processedCategories = await Promise.all(
          allParentCategories.map(async (cat) => {
            const { count } = await supabase
              .from('categories')
              .select('id', { count: 'exact', head: true })
              .eq('parent_id', cat.id)
              .eq('is_visible', true);

            const hasSubCategories = (count || 0) > 0;

            return {
              name: decodeHtmlEntities(cat.name),
              href: `/categorie/${cat.slug}`,
              slug: cat.slug,
              hasMegaMenu: hasSubCategories,
              showInMain: cat.show_in_main_menu
            };
          })
        );

        // On filtre : celles pour le menu principal et les autres
        const mainNav = processedCategories.filter(c => c.showInMain);
        const others = processedCategories.filter(c => !c.showInMain);

        setNavigation([...mainNav, ...STATIC_LINKS]);
        setOtherCategories(others);
      }
    } catch (error) {
      console.error('Error loading navigation categories:', error);
      setNavigation(STATIC_LINKS);
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    await authStoreSignOut();
    router.push('/');
  };

  const handleMouseEnter = (slug: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenMegaMenu(slug);
  };

  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setOpenMegaMenu(null);
    }, 300);
  };

  return (
    <>
      <div className="bg-[#D4AF37] text-black py-1.5 overflow-hidden border-b border-black/5">
        <div className="animate-marquee whitespace-nowrap flex gap-12 font-bold text-[10px] uppercase tracking-widest">
          <span>✨ Bienvenue dans la KAVERN ✨</span>
          <span>🚚 Livraison offerte dès 80€ d&apos;achats</span>
          <span>🎥 Rejoignez-nous pour le prochain Live Shopping</span>
          <span>✨ Bienvenue dans la KAVERN ✨</span>
          <span>🚚 Livraison offerte dès 80€ d&apos;achats</span>
        </div>
      </div>

      <header className="sticky top-0 z-[100] bg-gradient-to-b from-white to-gray-50 shadow-md border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-900 hover:text-[#D4AF37] hover:bg-transparent"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>

              <Link href="/" className="flex-shrink-0">
                <img
                  src="/kavern-logo.png"
                  alt="Kavern"
                  className="h-12 md:h-16 w-auto"
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-3 lg:gap-4 flex-1 justify-center">
              {loading ? (
                <div className="text-gray-400 text-xs">Chargement...</div>
              ) : (
                <>
                  {navigation.map((item) => (
                    <div
                      key={item.slug}
                      className="relative"
                      onMouseEnter={() => item.hasMegaMenu && handleMouseEnter(item.slug)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-1.5 text-center text-xs lg:text-sm font-medium leading-tight transition-colors ${
                          item.slug === 'live'
                            ? 'text-[#D4AF37] hover:text-[#C5A028] font-bold'
                            : pathname === item.href || pathname.startsWith(item.href + '/')
                            ? 'text-[#D4AF37]'
                            : 'text-gray-900 hover:text-[#D4AF37]'
                        }`}
                      >
                        {item.slug === 'live' && <Play className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-current" />}
                        {item.name}
                      </Link>
                    </div>
                  ))}

                  {/* BOUTON 3 PETITS POINTS - NAVIGATION ÉTENDUE */}
                  {otherCategories.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-amber-50 text-gray-400 hover:text-[#D4AF37] transition-all">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="w-64 rounded-[2rem] p-4 shadow-2xl border-none bg-white/95 backdrop-blur-md animate-in slide-in-from-top-2">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-2">
                          Autres Collections
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <div className="max-h-[60vh] overflow-y-auto py-2">
                          {otherCategories.map((cat) => (
                            <DropdownMenuItem key={cat.slug} asChild className="rounded-2xl focus:bg-amber-50 mb-1">
                              <Link href={cat.href} className="flex items-center justify-between w-full px-4 py-3 cursor-pointer group">
                                <span className="font-bold text-gray-800 group-hover:text-[#D4AF37] transition-colors text-sm">
                                  {cat.name}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#D4AF37] transition-transform group-hover:translate-x-1" />
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem asChild className="rounded-2xl focus:bg-amber-50 mt-1">
                          <Link href="/shop" className="flex items-center gap-2 w-full px-4 py-3 font-black text-[10px] uppercase tracking-widest text-[#D4AF37]">
                            Voir toute la boutique
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchModalOpen(true)}
                className="hidden md:flex text-gray-900 hover:text-[#D4AF37] hover:bg-transparent"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-900 hover:text-[#D4AF37] hover:bg-transparent"
                >
                  <Heart className="h-5 w-5" />
                  {(wishlistCount || 0) > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#D4AF37] text-black text-xs font-black">
                      {wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-900 hover:text-[#D4AF37] hover:bg-transparent"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-none">
                  {user ? (
                    <>
                      <DropdownMenuLabel className="pb-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-black uppercase text-[#D4AF37]">
                            {profile?.first_name || 'Mon Compte'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {profile?.is_admin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center w-full cursor-pointer bg-red-50 text-red-600 font-bold rounded-lg mb-1">
                            <Shield className="mr-2 h-4 w-4" /> Administration
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="flex items-center w-full cursor-pointer font-semibold">
                          <User className="mr-2 h-4 w-4" /> Mon profil & Fidélité
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/account/orders" className="flex items-center w-full cursor-pointer font-semibold">
                          <Package className="mr-2 h-4 w-4" /> Mes commandes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-500 font-bold cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/login" className="flex items-center w-full cursor-pointer font-bold uppercase text-xs tracking-widest">Se connecter</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/auth/register" className="flex items-center w-full cursor-pointer font-bold uppercase text-xs tracking-widest text-[#D4AF37]">Créer un compte</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/cart">
                <Button
                  variant="ghost"
                  className="relative text-gray-900 hover:text-[#D4AF37] hover:bg-transparent gap-2 px-4"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="hidden md:inline text-xs font-black uppercase tracking-widest">{CUSTOM_TEXTS.buttons.cart}</span>
                  {(cartItemCount || 0) > 0 && (
                    <Badge className="absolute -top-2 -right-2 md:relative md:top-0 md:right-0 h-5 w-5 flex items-center justify-center p-0 bg-[#D4AF37] text-black text-xs font-black">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {openMegaMenu && (
          <div
            onMouseEnter={() => {
              if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
                closeTimerRef.current = null;
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
            <MegaMenu
              isOpen={true}
              categorySlug={openMegaMenu}
              onClose={() => setOpenMegaMenu(null)}
            />
          </div>
        )}
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}