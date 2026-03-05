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
  LogOut,
  Play,
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

// --- MISE À JOUR : UNIQUEMENT LIVE, CADEAU ET NOUVEAUTÉS ---
const STATIC_LINKS = [
  { name: 'Live Shopping et Replay', href: '/live', slug: 'live', hasMegaMenu: false },
  { name: 'Carte cadeau', href: '/carte-cadeau', slug: 'carte-cadeau', hasMegaMenu: false },
  { name: 'Nouveautés', href: '/nouveautes', slug: 'nouveautes', hasMegaMenu: false },
];

interface NavigationItem {
  name: string;
  href: string;
  slug: string;
  hasMegaMenu: boolean;
  showInMain?: boolean;
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
  const [loading, setLoading] = useState(true);

  const [topBarText, setTopBarText] = useState('Bienvenue dans la KAVERN');
  const [topBarIsActive, setTopBarIsActive] = useState(true);

  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNavigationCategories();
    loadSiteSettings();
  }, []);

  async function loadSiteSettings() {
    const { data } = await supabase
      .from('site_settings')
      .select('top_bar_text, top_bar_is_active')
      .eq('id', 'general')
      .maybeSingle();
    
    if (data) {
      if (data.top_bar_text) setTopBarText(data.top_bar_text);
      setTopBarIsActive(data.top_bar_is_active);
    }
  }

  async function loadNavigationCategories() {
    try {
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
              href: `/category/${cat.slug}`,
              slug: cat.slug,
              hasMegaMenu: hasSubCategories,
              showInMain: cat.show_in_main_menu
            };
          })
        );

        // On ne garde que les catégories marquées pour le menu principal
        const mainNav = processedCategories.filter(c => c.showInMain);

        setNavigation([...mainNav, ...STATIC_LINKS]);
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
      {topBarIsActive && (
        <div className="bg-[#D4AF37] text-black py-1.5 overflow-hidden border-b border-black/5">
          <div className="animate-marquee whitespace-nowrap flex gap-12 font-bold text-[10px] uppercase tracking-widest">
            <span>✨ {topBarText} ✨</span>
            {!user && <span>🎁 Crée ton compte et reçois 5€ de bienvenue 🎁</span>}
            <span>🚚 Livraison offerte dès 80€ d&apos;achats</span>
            <span>🎥 Rejoignez-nous pour le prochain Live Shopping</span>
            <span>✨ {topBarText} ✨</span>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[100] bg-white shadow-sm border-b border-amber-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24 md:h-28">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-900 hover:text-[#C6A15B] hover:bg-amber-50"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>

              <Link href="/" className="flex-shrink-0">
                <img
                  src="/kavern-logo.png"
                  alt="Kavern"
                  className="h-14 md:h-20 w-auto"
                />
              </Link>
            </div>

            {/* NAVIGATION CENTRÉE ET ÉPURÉE (SANS "...") */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-8 flex-1 justify-center px-4">
              {loading ? (
                <div className="text-gray-400 text-[9px] font-bold uppercase tracking-widest animate-pulse text-center">Chargement...</div>
              ) : (
                <>
                  {navigation.map((item) => (
                    <div
                      key={item.slug}
                      className="relative h-full flex items-center"
                      onMouseEnter={() => item.hasMegaMenu && handleMouseEnter(item.slug)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        href={item.href}
                        className={`flex flex-col items-center justify-center text-center gap-1 text-[9px] lg:text-[10px] font-extrabold uppercase tracking-tight transition-all duration-300 hover:scale-105 max-w-[120px] leading-tight ${
                          item.slug === 'live' || item.slug === 'nouveautes'
                            ? 'text-[#D4AF37] hover:text-gray-900'
                            : pathname === item.href || pathname.startsWith(item.href + '/')
                            ? 'text-[#D4AF37]'
                            : 'text-gray-600 hover:text-[#D4AF37]'
                        }`}
                      >
                        {item.slug === 'live' && <Play className="h-2.5 w-2.5 fill-current mb-0.5" />}
                        <span className="block whitespace-normal">{item.name}</span>
                        {(pathname === item.href || pathname.startsWith(item.href + '/')) && (
                          <div className="h-0.5 w-3 bg-[#D4AF37] mt-0.5 rounded-full" />
                        )}
                      </Link>
                    </div>
                  ))}
                </>
              )}
            </nav>

            <div className="flex items-center gap-1 md:gap-3">
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
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-[#D4AF37] text-black text-[10px] font-black border-2 border-white">
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
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border border-amber-50">
                  {user ? (
                    <>
                      <DropdownMenuLabel className="pb-3 px-3 pt-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#C6A15B]">Ma Fidélité</p>
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {profile?.first_name || 'Mon Compte'}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-amber-50" />
                      {profile?.is_admin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center w-full cursor-pointer bg-red-50 text-red-600 font-bold rounded-xl mb-1 px-4 py-3">
                            <Shield className="mr-2 h-4 w-4" /> Administration
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/account" className="flex items-center w-full cursor-pointer font-bold text-gray-700 px-4 py-3">
                          <User className="mr-3 h-4 w-4 text-[#C6A15B]" /> Mon Profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/account/orders" className="flex items-center w-full cursor-pointer font-bold text-gray-700 px-4 py-3">
                          <Package className="mr-3 h-4 w-4 text-[#C6A15B]" /> Mes Commandes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-amber-50" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-red-500 font-bold cursor-pointer rounded-xl px-4 py-3 focus:bg-red-50"
                      >
                        <LogOut className="mr-3 h-4 w-4" /> Déconnexion
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="p-2 space-y-2">
                      <Button asChild className="w-full bg-[#C6A15B] hover:bg-gray-900 rounded-xl h-10 font-bold uppercase text-[10px] tracking-widest">
                        <Link href="/auth/login">Se connecter</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full border-amber-100 text-[#C6A15B] rounded-xl h-10 font-bold uppercase text-[10px] tracking-widest">
                        <Link href="/auth/register">Créer un compte</Link>
                      </Button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/cart">
                <Button
                  variant="ghost"
                  className="relative text-gray-900 hover:text-[#D4AF37] hover:bg-transparent gap-2 px-3 sm:px-4"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="hidden lg:inline text-[11px] font-black uppercase tracking-widest">{CUSTOM_TEXTS.buttons.cart}</span>
                  {(cartItemCount || 0) > 0 && (
                    <Badge className="absolute -top-2 -right-1 sm:relative sm:top-0 sm:right-0 h-5 w-5 flex items-center justify-center p-0 bg-[#D4AF37] text-black text-[10px] font-black border-2 border-white md:border-none">
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