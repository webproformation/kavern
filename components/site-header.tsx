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
  Play
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
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const { items: wishlistItems } = useWishlist();
  const { items: cartItems } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    loadCategories();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_visible', true)
      .is('parent_id', null)
      .order('display_order', { ascending: true });
    
    if (data) setCategories(data);
  }

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

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      {/* BANNIÈRE DÉFILANTE INFO */}
      <div className="bg-[#D4AF37] text-black py-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-8 font-bold text-xs uppercase tracking-widest">
          <span>✨ Bienvenue dans la KAVERN - L'artisanat et l'inattendu ✨</span>
          <span>🚚 Livraison offerte dès 80€ d'achats</span>
          <span>🎁 Une surprise dans chaque colis</span>
          <span>🎥 Rejoignez-nous pour le prochain Live Shopping</span>
          {/* Duplicate for seamless loop */}
          <span>✨ Bienvenue dans la KAVERN - L'artisanat et l'inattendu ✨</span>
          <span>🚚 Livraison offerte dès 80€ d'achats</span>
          <span>🎁 Une surprise dans chaque colis</span>
          <span>🎥 Rejoignez-nous pour le prochain Live Shopping</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-900"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* LOGO KAVERN - VERSION DESKTOP & MOBILE */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl md:text-3xl font-black tracking-[0.2em] text-gray-900 group-hover:text-[#D4AF37] transition-colors uppercase">
                KAVERN
              </span>
            </Link>
          </div>

          {/* NAVIGATION PRINCIPALE */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category.slug)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className={`px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors hover:text-[#D4AF37] ${
                    pathname.includes(category.slug) ? 'text-[#D4AF37]' : 'text-gray-900'
                  }`}
                >
                  {decodeHtmlEntities(category.name)}
                </Link>
              </div>
            ))}
            
            {STATIC_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2 ${
                  pathname === link.href ? 'text-[#D4AF37]' : link.slug === 'live' ? 'text-[#D4AF37] hover:text-[#b8933d]' : 'text-gray-900 hover:text-[#D4AF37]'
                }`}
              >
                {link.slug === 'live' && <Play className="h-4 w-4 fill-current animate-pulse" />}
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ACTIONS UTILISATEUR */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-900 hover:text-[#D4AF37] hover:bg-transparent"
              onClick={() => setSearchModalOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-900 hover:text-[#D4AF37] hover:bg-transparent"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-[#D4AF37] text-black text-[10px] font-bold">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              {user ? (
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
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#D4AF37]">
                          {profile?.first_name || 'Mon compte'}
                        </span>
                        <span className="text-xs text-gray-500 font-normal truncate">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer flex items-center gap-2">
                        <User className="h-4 w-4" /> Profil & Fidélité
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="cursor-pointer flex items-center gap-2">
                        <Package className="h-4 w-4" /> Mes commandes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/my-packages" className="cursor-pointer flex items-center gap-2">
                        <Package className="h-4 w-4" /> Colis Ouverts
                      </Link>
                    </DropdownMenuItem>
                    {profile?.is_admin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-red-600">
                          <Link href="/admin" className="cursor-pointer flex items-center gap-2">
                            <Shield className="h-4 w-4" /> Administration
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" /> Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-900 hover:text-[#D4AF37] hover:bg-transparent"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>

            <Link href="/cart">
              <Button
                variant="ghost"
                className="relative text-gray-900 hover:text-[#D4AF37] hover:bg-transparent gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden md:inline text-sm font-bold">{CUSTOM_TEXTS.buttons.cart}</span>
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 md:relative md:top-0 md:right-0 h-5 w-5 flex items-center justify-center p-0 bg-[#D4AF37] text-black text-xs font-bold">
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

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </header>
  );
}