'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { User, LogOut, Shield, Play, ChevronRight, ShoppingBag, Heart } from 'lucide-react';
import { supabase, ProductCategory } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { decodeHtmlEntities } from '@/lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryLevel1 extends ProductCategory {
  children?: CategoryLevel2[];
}

interface CategoryLevel2 extends ProductCategory {
  children?: ProductCategory[];
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [categories, setCategories] = useState<CategoryLevel1[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const { data: allCategories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const level1 = allCategories.filter(c => !c.parent_id);
      const categoriesTree = level1.map(cat1 => {
        const children2 = allCategories.filter(c => c.parent_id === cat1.id);
        return {
          ...cat1,
          children: children2.map(cat2 => ({
            ...cat2,
            children: allCategories.filter(c => c.parent_id === cat2.id)
          }))
        };
      });

      setCategories(categoriesTree);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[85%] sm:w-[400px] bg-[#FDFCFB] border-r border-amber-100 p-0 overflow-hidden flex flex-col">
        
        {/* HEADER DU MENU : Élégant & Lumineux */}
        <div className="p-8 border-b border-amber-50 bg-white">
          <SheetTitle className="text-3xl font-black text-[#C6A15B] tracking-[0.3em] uppercase italic">
            KAVERN
          </SheetTitle>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 italic">L&apos;Artisanat & L&apos;Inattendu</p>
        </div>

        {/* CORPS DU MENU */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <Accordion type="single" collapsible className="w-full space-y-2">
            
            {/* LIEN BOUTIQUE COMPLÈTE */}
            <div className="py-2 px-2">
              <Link href="/shop" onClick={onClose} className="text-lg font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-[#C6A15B]" /> La Boutique
              </Link>
            </div>

            {categories.map((category) => {
              if (!category.children || category.children.length === 0) {
                return (
                  <div key={category.id} className="py-2 px-2 border-b border-gray-50">
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-base font-bold text-gray-700 hover:text-[#C6A15B] transition-colors"
                      onClick={onClose}
                    >
                      {decodeHtmlEntities(category.name)}
                    </Link>
                  </div>
                );
              }

              return (
                <AccordionItem key={category.id} value={category.id} className="border-b border-gray-50 px-2">
                  <AccordionTrigger className="text-base font-bold text-gray-700 hover:text-[#C6A15B] hover:no-underline py-4 uppercase tracking-tight">
                    {decodeHtmlEntities(category.name)}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 space-y-4">
                    {category.children.map((cat2) => (
                      <div key={cat2.id} className="space-y-3">
                        <Link
                          href={`/category/${cat2.slug}`}
                          className="flex items-center justify-between text-sm font-black text-[#C6A15B] uppercase tracking-widest bg-amber-50/50 p-2 rounded-lg"
                          onClick={onClose}
                        >
                          {decodeHtmlEntities(cat2.name)}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                        
                        {cat2.children && cat2.children.length > 0 && (
                          <div className="grid grid-cols-1 gap-1 ml-4 border-l-2 border-amber-100 pl-4">
                            {cat2.children.map((cat3) => (
                              <Link
                                key={cat3.id}
                                href={`/category/${cat3.slug}`}
                                className="py-2 text-sm text-gray-500 hover:text-gray-900 transition-all font-medium"
                                onClick={onClose}
                              >
                                {decodeHtmlEntities(cat3.name)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}

            {/* LIENS SPÉCIAUX */}
            <div className="pt-6 space-y-4">
              <Link href="/live" className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-[#D4AF37] text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-amber-200" onClick={onClose}>
                <div className="h-2 w-2 bg-white rounded-full animate-ping" />
                Live Shopping & Replay
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/actualites" className="flex items-center justify-center p-3 rounded-xl border border-amber-100 text-[10px] font-black uppercase text-gray-500 hover:bg-amber-50 transition-colors" onClick={onClose}>Actus</Link>
                <Link href="/carte-cadeau" className="flex items-center justify-center p-3 rounded-xl border border-amber-100 text-[10px] font-black uppercase text-gray-500 hover:bg-amber-50 transition-colors" onClick={onClose}>Cadeau</Link>
              </div>
            </div>
          </Accordion>
        </div>

        {/* FOOTER DU MENU : Espace Client Raffiné */}
        <div className="p-6 bg-white border-t border-amber-100">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C6A15B] flex items-center justify-center text-white font-bold shadow-md">
                  {profile?.first_name?.[0] || user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 uppercase truncate">
                    {profile?.first_name || 'Mon Compte'}
                  </p>
                  <p className="text-[10px] text-[#C6A15B] font-bold uppercase tracking-widest">Membre Kavern</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Button asChild variant="ghost" className="w-full justify-start font-bold text-gray-600 hover:text-[#C6A15B] hover:bg-amber-50" onClick={onClose}>
                  <Link href="/account"><User className="mr-3 h-5 w-5" /> Mon Profil & Fidélité</Link>
                </Button>
                
                {profile?.is_admin && (
                  <Button asChild variant="ghost" className="w-full justify-start font-bold text-red-600 hover:bg-red-50" onClick={onClose}>
                    <Link href="/admin"><Shield className="mr-3 h-5 w-5" /> Admin</Link>
                  </Button>
                )}

                <Button variant="ghost" className="w-full justify-start font-bold text-gray-400 hover:text-red-500" onClick={handleSignOut}>
                  <LogOut className="mr-3 h-5 w-5" /> Déconnexion
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button asChild className="w-full bg-[#C6A15B] hover:bg-gray-900 text-white font-black uppercase tracking-widest h-12 rounded-xl shadow-lg shadow-amber-100">
                <Link href="/auth/login" onClick={onClose}>Se connecter</Link>
              </Button>
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Pas encore de compte ? <Link href="/auth/register" className="text-[#C6A15B] underline" onClick={onClose}>Rejoindre la KAVERN</Link></p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}