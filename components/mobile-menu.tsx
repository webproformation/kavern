'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { User, LogOut, Shield, Play, ChevronRight } from 'lucide-react';
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
      <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-gray-900 border-gray-800 p-0">
        <div className="flex flex-col h-full">
          {/* LOGO KAVERN DANS LE HEADER DU MENU */}
          <div className="p-6 border-b border-gray-800 bg-gray-900/50">
            <SheetTitle className="text-3xl font-black text-white tracking-[0.2em] uppercase">
              KAVERN
            </SheetTitle>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => {
                if (!category.children || category.children.length === 0) {
                  return (
                    <div key={category.id} className="py-3">
                      <Link
                        href={`/category/${category.slug}`}
                        className="text-lg font-semibold text-gray-200 hover:text-[#D4AF37] transition-colors"
                        onClick={onClose}
                      >
                        {decodeHtmlEntities(category.name)}
                      </Link>
                    </div>
                  );
                }

                return (
                  <AccordionItem key={category.id} value={category.id} className="border-gray-800">
                    <AccordionTrigger className="text-lg font-semibold text-gray-200 hover:text-[#D4AF37] hover:no-underline py-3">
                      {decodeHtmlEntities(category.name)}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      {category.children.map((cat2) => (
                        <div key={cat2.id} className="mb-4">
                          <Link
                            href={`/category/${cat2.slug}`}
                            className="flex items-center gap-2 text-base font-medium text-gray-300 hover:text-[#D4AF37] mb-2 px-2"
                            onClick={onClose}
                          >
                            <ChevronRight className="h-4 w-4 text-[#D4AF37]" />
                            {decodeHtmlEntities(cat2.name)}
                          </Link>
                          
                          {cat2.children && cat2.children.length > 0 && (
                            <div className="grid grid-cols-1 gap-1 ml-6 border-l border-gray-800">
                              {cat2.children.map((cat3) => (
                                <Link
                                  key={cat3.id}
                                  href={`/category/${cat3.slug}`}
                                  className="py-2 px-4 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all"
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

              <div className="border-t border-gray-800 my-4"></div>

              {/* LIENS COMPLÉMENTAIRES HARMONISÉS */}
              <div className="py-3">
                <Link href="/live" className="flex items-center gap-2 text-base font-bold text-[#D4AF37] hover:text-[#C5A028] transition-colors" onClick={onClose}>
                  <Play className="h-4 w-4 fill-current" />
                  Live Shopping et Replay
                </Link>
              </div>
              <div className="py-3">
                <Link href="/carte-cadeau" className="block text-base font-medium text-gray-200 hover:text-[#D4AF37] transition-colors" onClick={onClose}>
                  Carte cadeau
                </Link>
              </div>
              <div className="py-3">
                {/* Remplacement du Carnet de Morgane par Actus */}
                <Link href="/actualites" className="block text-base font-medium text-gray-200 hover:text-[#D4AF37] transition-colors" onClick={onClose}>
                  Actus
                </Link>
              </div>
            </Accordion>
          </div>

          {/* SECTION UTILISATEUR */}
          <div className="p-6 border-t border-gray-800 bg-gray-900/50">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                    {profile?.first_name?.[0] || user.email?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {profile?.first_name || 'Mon Compte'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button asChild variant="outline" className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800" onClick={onClose}>
                    <Link href="/account"><User className="mr-2 h-4 w-4" /> Mon profil</Link>
                  </Button>
                  {profile?.is_admin && (
                    <Button asChild variant="outline" className="w-full justify-start border-red-900/50 text-red-400 hover:bg-red-900/20" onClick={onClose}>
                      <Link href="/admin"><Shield className="mr-2 h-4 w-4" /> Administration</Link>
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-900/20" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                  </Button>
                </div>
              </div>
            ) : (
              <Button asChild className="w-full bg-[#D4AF37] hover:bg-[#C5A028] text-black font-bold">
                <Link href="/login" onClick={onClose}>Se connecter</Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}