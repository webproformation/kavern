'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, User, Package, MapPin, Heart, LogOut, Shield, Ruler, Gift, Ticket, PackageOpen, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

// Liste de base (sans l'admin)
const baseNavItems = [
  { href: '/account', label: 'Mon profil', icon: User },
  { href: '/account/orders', label: 'Mes commandes', icon: Package },
  { href: '/account/coupons', label: 'Mes coupons', icon: Ticket },
  { href: '/account/gift-cards', label: 'Mes cartes cadeaux', icon: CreditCard },
  { href: '/account/my-packages', label: 'Mes colis ouverts', icon: PackageOpen },
  { href: '/account/addresses', label: 'Mes adresses', icon: MapPin },
  // { href: '/account/measurements', label: 'Mes mensurations', icon: Ruler }, // Module masqué - Facile à restaurer
  { href: '/account/referral', label: 'Code parrainage', icon: Gift },
  { href: '/wishlist', label: 'Ma liste de souhaits', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setIsAdmin(profile.is_admin || false);
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  if (!user) return null;

  // Initialisation des items de navigation
  const navItems = [...baseNavItems];
  
  if (isAdmin) {
    navItems.unshift({ href: '/admin', label: 'Administration', icon: Shield });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#b8933d] to-[#d4af37] flex items-center justify-center text-white text-xl font-bold">
                {profile?.first_name?.[0] || user.email?.[0].toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 line-clamp-1">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-1">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                if (item.href === '/account') {
                  return (
                    <div key={item.href} className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive ? 'bg-[#D4AF37] text-white' : 'text-gray-700 hover:bg-gray-100'
                    )}>
                      <Link 
                        href="/account" 
                        className="hover:scale-110 hover:text-[#D4AF37] transition-all p-1 -ml-1 cursor-pointer"
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                      <Link href={item.href} className="font-medium flex-1 cursor-pointer">
                        {item.label}
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors', 
                      isActive ? 'bg-[#D4AF37] text-white' : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-3 px-4 py-3 h-auto hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Déconnexion</span>
              </Button>
            </nav>
          </div>
        </aside>
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}