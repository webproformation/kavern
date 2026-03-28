import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Conditions Générales de Vente
            </h1>
            <p className="text-xl text-[#C6A15B] font-semibold">KAVERN</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Article 1 — Objet</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-3">
              <p>
                Les présentes CGV régissent les ventes réalisées sur le site kavern-france.fr par la société KAVERN
                (ci-après &quot;le Vendeur&quot;) auprès d&apos;acheteurs non professionnels (ci-après &quot;le Client&quot;).
                Elles s&apos;appliquent à tous les produits : artisanat, épicerie, accessoires, etc.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article 2 — Produits et Disponibilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Les produits sont décrits avec la plus grande exactitude possible. S&apos;agissant en partie de produits
                artisanaux (notamment les bougies de L&apos;Atelier d&apos;André), de légères variations (couleur, poids)
                peuvent exister et ne sauraient constituer un défaut.
              </p>
              <p>
                Les offres sont valables tant qu&apos;elles sont visibles sur le site et dans la limite des stocks disponibles.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article 3 — Prix et Paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Les prix sont indiqués en euros, toutes taxes comprises (TTC), hors frais de livraison.
                Le Vendeur se réserve le droit de modifier ses prix à tout moment, mais le produit sera facturé
                sur la base du tarif en vigueur au moment de la validation de la commande.
              </p>
              <p>
                Le paiement est exigible immédiatement à la commande. Il peut s&apos;effectuer par carte bancaire (via Stripe),
                PayPal (incluant le paiement en 4x sans frais selon éligibilité par PayPal), ou virement bancaire instantané.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-[#C6A15B]">
            <CardHeader>
              <CardTitle>Article 4 — Le &quot;Colis Ouvert&quot; (Spécificité KAVERN)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                KAVERN propose un service exclusif de &quot;Colis Ouvert&quot; permettant au Client de grouper ses achats
                (réalisés sur le site ou lors des &quot;Lives Shopping&quot;) pour mutualiser les frais de livraison.
              </p>
              <div>
                <p className="font-semibold mb-2">Ouverture et Frais de port</p>
                <p className="text-sm text-gray-700">
                  L&apos;ouverture d&apos;un &quot;Colis Ouvert&quot; se fait lors d&apos;une première commande.
                  Les frais de port forfaitaires applicables à l&apos;expédition finale sont réglés intégralement
                  par le Client lors de cette commande initiale.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Ajouts d&apos;articles</p>
                <p className="text-sm text-gray-700">
                  Le Client peut ajouter de nouveaux articles à son colis en cours pendant une durée maximale
                  de <strong>7 jours calendaires</strong> à compter de la première commande. Lors de ces commandes
                  supplémentaires, le Client sélectionne l&apos;option de livraison &quot;Ajout au Colis Ouvert&quot;,
                  lui permettant de ne régler que le prix des articles (frais de port à 0 €). Les articles sont
                  alors réservés et stockés par le Vendeur.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Clôture et Expédition</p>
                <p className="text-sm text-gray-700">
                  Le Client peut demander l&apos;expédition de son colis à tout moment depuis son espace client.
                  Passé le délai de 7 jours, le Vendeur clôturera et expédiera automatiquement le colis à
                  l&apos;adresse indiquée lors de la commande initiale, sans aucun frais supplémentaire à régler par le Client.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mt-4">
                <p>
                  Le délai de rétractation légal de 14 jours pour l&apos;ensemble des articles d&apos;un Colis Ouvert
                  ne commence à courir qu&apos;à compter de la réception physique du colis final consolidé par le Client.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article 5 — Livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Le montant minimum pour valider une commande sur le site est fixé à 10,00 € TTC.
                Ce montant s&apos;entend hors frais de port et après déduction des éventuelles remises,
                codes promotionnels ou cagnottes de fidélité.
              </p>
              <p>
                Les livraisons sont assurées par nos partenaires transporteurs (via Sendcloud) à l&apos;adresse
                indiquée par le Client. Les délais de livraison sont donnés à titre indicatif. KAVERN ne saurait
                être tenu responsable d&apos;un retard imputable au transporteur.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article 6 — Droit de Rétractation et Exceptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Conformément à la loi, le Client dispose d&apos;un délai de <strong>14 jours</strong> à compter de la
                réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motifs.
                Les articles doivent être retournés dans leur état d&apos;origine, neufs, non utilisés et dans leur emballage.
                Les frais de retour sont à la charge du Client.
              </p>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="font-semibold mb-2">Commandes avec cadeau offert</p>
                <p className="text-sm text-gray-700">
                  Si la commande initiale incluait un cadeau offert sous condition d&apos;un montant d&apos;achat minimum
                  (ex : dès 69 € d&apos;achat), et que le retour partiel fait passer le montant total des articles
                  conservés en dessous de ce seuil, le cadeau devra être retourné avec le reste des articles.
                  À défaut, la valeur commerciale du cadeau sera déduite du remboursement ou de l&apos;avoir généré.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Exceptions (Art. L221-28 Code de la consommation)</p>
                <p className="text-sm text-gray-700">
                  Le droit de rétractation ne s&apos;applique pas aux denrées périssables (produits d&apos;épicerie, terrines,
                  snacks, etc.) ni aux produits descellés par le client après la livraison qui ne peuvent être renvoyés
                  pour des raisons d&apos;hygiène ou de protection de la santé (ex : cosmétiques, parfums d&apos;ambiance,
                  sous-vêtements, boucles d&apos;oreilles). Les articles personnalisés sont également exclus.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article 7 — Programme de Fidélité, Avis et &quot;Cagnotte&quot;</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Le Client peut accumuler des euros sur sa &quot;Cagnotte&quot; virtuelle KAVERN via différentes actions
                détaillées sur le site (cashback, participation aux lives, etc.). Notamment, le dépôt d&apos;un avis
                validé sur le &quot;Livre d&apos;Or&quot; génère un crédit de 0,20 € sur la cagnotte du Client.
              </p>
              <p>
                KAVERN se réserve le droit de modérer et de refuser la publication d&apos;un avis (et donc l&apos;octroi
                de la prime) s&apos;il est jugé inapproprié, injurieux, ou ne correspondant pas à une véritable expérience d&apos;achat.
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                La cagnotte est utilisable uniquement sur le site KAVERN et ne peut en aucun cas être convertie
                en monnaie fiduciaire ou faire l&apos;objet d&apos;un virement bancaire.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article 8 — Données personnelles (RGPD) et Litiges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Pour plus d&apos;informations, consultez notre{' '}
                <Link href="/politique-confidentialite" className="text-[#C6A15B] hover:underline font-semibold">
                  Politique de Confidentialité
                </Link>.
              </p>
              <p>
                En cas de litige, une solution amiable sera recherchée en priorité via notre service client
                &quot;Allo André&quot;. À défaut, les tribunaux français seront seuls compétents.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
                <p>
                  Conformément aux articles L.616-1 et R.616-1 du code de la consommation, nous proposons un
                  dispositif de médiation de la consommation. En cas de litige non résolu par notre service client,
                  le consommateur peut faire appel au service de médiation CM2C accessible via{' '}
                  <a href="https://www.cm2c.net/" target="_blank" rel="noopener noreferrer" className="text-[#C6A15B] hover:underline">cm2c.net</a>.
                </p>
                <p>
                  La Commission Européenne met à disposition une plateforme de résolution des litiges (RLL) accessible à{' '}
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#C6A15B] hover:underline">
                    ec.europa.eu/consumers/odr
                  </a>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
