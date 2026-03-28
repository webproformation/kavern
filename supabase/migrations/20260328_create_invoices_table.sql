-- Table des factures avec numérotation séquentielle inviolable
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id uuid REFERENCES orders(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  type TEXT NOT NULL DEFAULT 'invoice' CHECK (type IN ('invoice', 'credit_note')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'cancelled')),
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Séquence pour numérotation automatique
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS credit_note_seq START 1;

-- Fonction pour générer le numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'invoice' THEN
    NEW.invoice_number := 'FAV-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(nextval('invoice_seq')::text, 4, '0');
  ELSIF NEW.type = 'credit_note' THEN
    NEW.invoice_number := 'AVO-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(nextval('credit_note_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invoice_number ON invoices;
CREATE TRIGGER trigger_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- Empêcher la suppression de factures
CREATE OR REPLACE FUNCTION prevent_invoice_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'La suppression de factures est interdite (obligation légale)';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_invoice_delete ON invoices;
CREATE TRIGGER trigger_prevent_invoice_delete
  BEFORE DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION prevent_invoice_delete();

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access invoices"
  ON invoices FOR ALL TO service_role
  USING (true) WITH CHECK (true);
