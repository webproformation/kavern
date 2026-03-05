'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings2, Tag } from 'lucide-react';

interface AttributeTerm {
  id: string;
  name: string;
  slug: string;
  value: string;
}

interface ProductAttribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  terms: AttributeTerm[];
}

interface GeneralAttributesSelectorProps {
  selectedAttributes: Record<string, string[]>;
  variationAxes: string[]; // Nouveau pour gérer les parfums/tailles
  onAttributesChange: (attributes: Record<string, string[]>, termIds: Record<string, string>) => void;
  onVariationAxesChange: (axes: string[]) => void;
}

export default function GeneralAttributesSelector({
  selectedAttributes,
  variationAxes = [],
  onAttributesChange,
  onVariationAxesChange,
}: GeneralAttributesSelectorProps) {
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTermIds, setAllTermIds] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      const { data: attributesData, error: attrError } = await supabase
        .from('product_attributes')
        .select('*')
        .order('name');

      if (attrError) throw attrError;

      if (attributesData) {
        const idMap: Record<string, string> = {};
        const attributesWithTerms = await Promise.all(
          attributesData.map(async (attr) => {
            const { data: termsData, error: termsError } = await supabase
              .from('product_attribute_terms')
              .select('id, name, slug, value')
              .eq('attribute_id', attr.id)
              .is('parent_id', null)
              .order('order_by');

            if (termsError) return { ...attr, terms: [] };
            
            if (termsData) {
              termsData.forEach(t => { idMap[t.name] = t.id; });
            }
            
            return { ...attr, terms: termsData || [] };
          })
        );

        setAllTermIds(idMap);
        setAttributes(attributesWithTerms.filter(attr => attr.terms.length > 0));
      }
    } catch (error) {
      console.error('Error loading attributes:', error);
      toast.error('Erreur lors du chargement des attributs');
    } finally {
      setLoading(false);
    }
  };

  const handleTermToggle = (attributeId: string, attributeName: string, termName: string) => {
    const currentTerms = selectedAttributes[attributeName] || [];
    const newTerms = currentTerms.includes(termName)
      ? currentTerms.filter(t => t !== termName)
      : [...currentTerms, termName];

    const newAttributes = { ...selectedAttributes };
    if (newTerms.length === 0) {
      delete newAttributes[attributeName];
    } else {
      newAttributes[attributeName] = newTerms;
    }

    onAttributesChange(newAttributes, allTermIds);
  };

  const toggleVariationAxis = (attributeName: string) => {
    const newAxes = variationAxes.includes(attributeName)
      ? variationAxes.filter(a => a !== attributeName)
      : [...variationAxes, attributeName];
    onVariationAxesChange(newAxes);
  };

  const getTotalSelectedTerms = () => {
    return Object.values(selectedAttributes).reduce((sum, terms) => sum + terms.length, 0);
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8"><p className="text-center text-gray-500">Chargement des attributs...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-amber-100 shadow-sm">
      <CardHeader className="border-b bg-gray-50/30">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-[#d4af37]" />
          <CardTitle className="text-[#d4af37] uppercase tracking-tighter font-black">Attributs & Choix des Variantes</CardTitle>
        </div>
        <CardDescription>
          Sélectionnez les termes et activez le <strong>Mode Variante</strong> pour permettre au client de choisir (Parfum, Taille...).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {attributes.map((attribute) => {
          const selectedTermsForAttr = selectedAttributes[attribute.name] || [];
          const isVariationAxis = variationAxes.includes(attribute.name);

          return (
            <div key={attribute.id} className={`space-y-4 p-4 rounded-2xl border-2 transition-all ${isVariationAxis ? 'border-purple-200 bg-purple-50/20' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-black text-gray-900 uppercase tracking-tight">
                    {attribute.name}
                  </Label>
                  {selectedTermsForAttr.length > 0 && (
                    <Badge className="bg-[#d4af37] text-white">
                      {selectedTermsForAttr.length}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-purple-100">
                  <Switch 
                    checked={isVariationAxis} 
                    onCheckedChange={() => toggleVariationAxis(attribute.name)} 
                  />
                  <Label className="text-[10px] font-black text-purple-700 uppercase tracking-widest cursor-pointer">
                    Mode Variante
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {attribute.terms.map((term) => {
                  const isSelected = selectedTermsForAttr.includes(term.name);

                  return (
                    <div
                      key={term.id}
                      className={`
                        flex items-center space-x-2 p-3 rounded-xl border-2 transition-all cursor-pointer
                        ${isSelected
                          ? 'border-[#d4af37] bg-amber-50 shadow-sm'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleTermToggle(attribute.id, attribute.name, term.name)}
                    >
                      <Checkbox
                        id={`term-${term.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleTermToggle(attribute.id, attribute.name, term.name)}
                        className="data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                      />
                      <Label
                        htmlFor={`term-${term.id}`}
                        className="cursor-pointer text-xs font-bold flex-1 uppercase tracking-tighter"
                      >
                        {term.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {getTotalSelectedTerms() > 0 && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full"><Tag className="h-4 w-4 text-green-600" /></div>
            <p className="text-sm text-green-900 font-bold">
              {getTotalSelectedTerms()} caractéristique(s) active(s) sur cette pépite.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}