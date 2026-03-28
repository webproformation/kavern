-- Colonnes pour le système de réservation Live + 3 strikes
DO $$
BEGIN
  -- Panier live: marquer les items comme réservation live
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'is_live_reservation'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN is_live_reservation BOOLEAN DEFAULT false;
  END IF;

  -- Profil: compteur de strikes + blocage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'live_cart_strikes'
  ) THEN
    ALTER TABLE profiles ADD COLUMN live_cart_strikes INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'live_cart_blocked'
  ) THEN
    ALTER TABLE profiles ADD COLUMN live_cart_blocked BOOLEAN DEFAULT false;
  END IF;

  -- Profil: flag première commande (badge "Nouveau")
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_first_order'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_first_order BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Fonction pour incrémenter le stock produit
CREATE OR REPLACE FUNCTION increment_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET stock_quantity = COALESCE(stock_quantity, 0) + p_quantity WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter le stock variation
CREATE OR REPLACE FUNCTION increment_variation_stock(p_variation_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variations SET stock_quantity = COALESCE(stock_quantity, 0) + p_quantity WHERE id = p_variation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
