"use client";

import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ProductVariationSelector({
  attributes,
  variations,
  onVariationSelect,
}: any) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [dbColors, setDbColors] = useState<Record<string, string>>({});

  const getCleanKey = (k: string) => {
    if (!k) return "";
    return String(k).toLowerCase().replace(/^(attribute_pa_|attribute_|pa_)/, '').trim();
  };

  // 1. RÉCUPÉRATION GLOBALE DES COULEURS DEPUIS TA BASE DE DONNÉES
  // On charge tout une seule fois pour éviter les bugs de casse (majuscules/minuscules)
  useEffect(() => {
    async function loadDbColors() {
      try {
        const { data, error } = await supabase
          .from("product_attribute_terms")
          .select("name, color_code");

        if (data) {
          const map: Record<string, string> = {};
          data.forEach(term => {
            if (term.name && term.color_code && term.color_code.trim() !== "") {
              // On uniformise totalement le texte pour la correspondance
              map[term.name.toLowerCase().trim()] = term.color_code;
            }
          });
          setDbColors(map);
        }
      } catch (err) {
        console.error("Erreur de chargement des couleurs :", err);
      }
    }
    loadDbColors();
  }, []);

  // 2. DICTIONNAIRE DE SECOURS (Si la BDD est lente ou hors-ligne)
  const fallbackMap: Record<string, string> = {
    "noir": "#111111", "blanc": "#ffffff", "rouge": "#ef4444", 
    "bleu": "#3b82f6", "vert": "#22c55e", "jaune": "#eab308", 
    "or": "#d4af37", "doré": "#d4af37", "argent": "#c0c0c0", "argenté": "#c0c0c0",
    "rose": "#ec4899", "beige": "#f5f5dc", "marron": "#8b4513", "camel": "#C19A6B", 
    "gris": "#9ca3af", "anthracite": "#334155", "violet": "#8b5cf6", "orange": "#f97316", 
    "turquoise": "#40e0d0", "marine": "#1e3a8a", "bordeaux": "#800020", "saumon": "#fa8072",
    "améthyste": "#9333ea", "lapis lazuli": "#1e40af", "onyx": "#111111", "oeil de tigre": "#b45309", 
    "quartz rose": "#fbcfe8", "aventurine": "#22c55e", "amazonite": "#4ade80", "citrine": "#fef08a", 
    "obsidienne": "#111111", "jaspe": "#b91c1c", "pierre de lune": "#f8fafc", "howlite": "#f1f5f9", 
    "labradorite": "#475569", "hématite": "#334155", "agate": "#d97706", "jade": "#16a34a",
    "malachite": "#15803d", "transparent": "transparent",
    "multicolore": "conic-gradient(red, yellow, green, blue, magenta, red)"
  };

  // 3. DÉCODAGE ET NETTOYAGE DES ATTRIBUTS DU PRODUIT
  const normalizedAttributes = useMemo(() => {
    let raw = attributes;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch(e) {}
    }
    if (!raw) return [];
    
    let parsedAttrs: any[] = [];
    if (Array.isArray(raw)) {
      parsedAttrs = raw;
    } else if (typeof raw === 'object') {
      parsedAttrs = Object.entries(raw).map(([k, v]) => ({
        name: k,
        options: Array.isArray(v) ? v : [v]
      }));
    }

    const variationAxes = new Set<string>();
    (variations || []).forEach((v: any) => {
      let vAttrs = v.attributes;
      if (typeof vAttrs === 'string') { try { vAttrs = JSON.parse(vAttrs); } catch(e) {} }
      if (Array.isArray(vAttrs)) {
        vAttrs.forEach((a: any) => { if (a.name) variationAxes.add(getCleanKey(a.name)); });
      } else if (vAttrs && typeof vAttrs === 'object') {
        Object.keys(vAttrs).forEach(k => variationAxes.add(getCleanKey(k)));
      }
    });

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const whitelist = ['couleur', 'color', 'pierre', 'taille', 'size', 'pointure', 'dimension', 'modèle', 'modele', 'type', 'variante', 'variant', 'poids', 'format', 'choix'];

    return parsedAttrs.map((attr: any) => {
      const cleanName = getCleanKey(attr.name);
      
      let keep = false;
      if (variationAxes.has(cleanName)) keep = true;
      if (whitelist.some(w => cleanName.includes(w))) keep = true;
      
      if (uuidRegex.test(attr.name)) keep = false;
      if (['instant créatif', 'trouvaille du monde', 'nouveauté', 'matière', 'collection', 'prix'].some(w => cleanName.includes(w))) keep = false;

      if (!keep) return null;

      const cleanOptions = (attr.options || []).map((o: any) => {
        if (typeof o === 'object' && o !== null) return String(o.name || o.value || '');
        return String(o);
      }).filter((o: string) => o && !uuidRegex.test(o));

      if (cleanOptions.length === 0) return null;

      let displayName = attr.name.replace(/^(attribute_pa_|attribute_|pa_)/i, '');
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      return {
        name: attr.name,
        displayName,
        cleanName,
        options: cleanOptions
      };
    }).filter(Boolean);

  }, [attributes, variations]);

  // Initialisation du premier choix
  useEffect(() => {
    if (normalizedAttributes.length > 0 && Object.keys(selectedOptions).length === 0) {
      const initial: Record<string, string> = {};
      normalizedAttributes.forEach((attr: any) => {
        initial[attr.name] = attr.options[0];
      });
      setSelectedOptions(initial);
      triggerMatch(initial);
    }
  }, [normalizedAttributes]);

  const triggerMatch = (currentSelection: Record<string, string>) => {
    const matched = variations?.find((v: any) => {
      let vAttrs: Record<string, any> = {};
      let rawV = v.attributes;
      if (typeof rawV === 'string') { try { rawV = JSON.parse(rawV); } catch(e) {} }
      if (Array.isArray(rawV)) {
        rawV.forEach((a: any) => { if (a.name) vAttrs[a.name] = a.option || a.value; });
      } else if (rawV && typeof rawV === 'object') {
        vAttrs = rawV;
      }

      return Object.entries(currentSelection).every(([selKey, selVal]) => {
        const cleanSelKey = getCleanKey(selKey);
        for (const [vKey, vVal] of Object.entries(vAttrs)) {
          if (getCleanKey(vKey) === cleanSelKey && String(vVal).toLowerCase().trim() === String(selVal).toLowerCase().trim()) {
            return true;
          }
        }
        return false;
      });
    });

    if (onVariationSelect) onVariationSelect(matched || null);
  };

  const handleSelect = (attrName: string, option: string) => {
    const newSelected = { ...selectedOptions, [attrName]: option };
    setSelectedOptions(newSelected);
    triggerMatch(newSelected);
  };

  if (!normalizedAttributes || normalizedAttributes.length === 0) return null;

  return (
    <div className="space-y-6">
      {normalizedAttributes.map((attr: any) => {
        
        // C'est une couleur si c'est indiqué dans le nom, ou si l'une des options a une correspondance en BDD ou dans le dico.
        const isColor = attr.cleanName.includes("couleur") || 
                        attr.cleanName.includes("color") || 
                        attr.cleanName.includes("pierre") || 
                        attr.options.some((opt: string) => dbColors[String(opt).toLowerCase().trim()] || Object.keys(fallbackMap).some(k => String(opt).toLowerCase().trim().includes(k)));

        return (
          <div key={attr.name} className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                {attr.displayName}
              </Label>
              {selectedOptions[attr.name] && (
                <span className="text-xs text-[#b8933d] font-medium">
                  {selectedOptions[attr.name]}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {attr.options.map((option: string, idx: number) => {
                const isSelected = selectedOptions[attr.name] === String(option);

                // Vérifie le stock
                const isAvailable = variations?.some((v: any) => {
                  let vAttrs: Record<string, any> = {};
                  let rawV = v.attributes;
                  if (typeof rawV === 'string') { try { rawV = JSON.parse(rawV); } catch(e) {} }
                  if (Array.isArray(rawV)) {
                    rawV.forEach((a: any) => { if (a.name) vAttrs[a.name] = a.option || a.value; });
                  } else if (rawV && typeof rawV === 'object') {
                    vAttrs = rawV;
                  }
                  for (const [vKey, vVal] of Object.entries(vAttrs)) {
                    if (getCleanKey(vKey) === attr.cleanName && String(vVal).toLowerCase().trim() === String(option).toLowerCase().trim()) {
                      return true;
                    }
                  }
                  return false;
                });

                // --- RENDU SPÉCIAL POUR LES COULEURS ET PIERRES ---
                if (isColor) {
                  const cleanOptionName = String(option).toLowerCase().trim();
                  
                  // 1. On cherche d'abord la vraie couleur depuis Supabase
                  let colorCode = dbColors[cleanOptionName];
                  
                  // 2. Si ça échoue, on cherche dans le dico de secours
                  if (!colorCode) {
                    if (fallbackMap[cleanOptionName]) {
                      colorCode = fallbackMap[cleanOptionName];
                    } else {
                      const foundKey = Object.keys(fallbackMap).sort((a,b) => b.length - a.length).find(k => cleanOptionName.includes(k));
                      colorCode = foundKey ? fallbackMap[foundKey] : "#e5e7eb";
                    }
                  }
                  
                  const bgStyle = colorCode.includes("gradient") 
                    ? { backgroundImage: colorCode } 
                    : { backgroundColor: colorCode };

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(attr.name, option)}
                      title={option}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ring-1 ring-gray-200",
                        isSelected
                          ? "ring-2 ring-offset-2 ring-[#b8933d] scale-110 shadow-lg"
                          : isAvailable 
                            ? "hover:scale-105 hover:shadow-md opacity-90 hover:opacity-100"
                            : "opacity-30 grayscale cursor-not-allowed"
                      )}
                      style={bgStyle}
                    >
                      {isSelected && (
                        <span className={['#ffffff', '#f5f5dc', 'transparent'].includes(colorCode.toLowerCase()) ? "text-gray-900 drop-shadow-md" : "text-white drop-shadow-md"}>
                          <Check className="w-5 h-5" />
                        </span>
                      )}
                      <span className="sr-only">{option}</span>
                    </button>
                  );
                }

                // --- RENDU TEXTE STANDARD (Pour les Tailles, Modèles, etc.) ---
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(attr.name, option)}
                    className={cn(
                      "px-4 py-2 text-sm font-black border-2 rounded-xl transition-all duration-200 min-w-[3.5rem] uppercase tracking-tighter",
                      isSelected
                        ? "border-[#b8933d] bg-[#b8933d] text-white shadow-lg" 
                        : isAvailable
                          ? "border-gray-100 bg-white text-gray-700 hover:border-[#b8933d] hover:text-[#b8933d]"
                          : "opacity-30 border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}