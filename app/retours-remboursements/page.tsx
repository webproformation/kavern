import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Retours et Remboursements',
  description: 'Politique de retours KAVERN : echange ou remboursement sous 14 jours. Satisfait ou rembourse.',
  alternates: {
    canonical: '/retours-remboursements',
  },
};

export default function RetoursRemboursementsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Politique de Retours et Remboursements
            </h1>
            <p className="text-gray-600">
              Chez KAVERN, nous mettons un point d&apos;honneur à vous proposer des pépites artisanales de haute qualité.
              Si toutefois vous changiez d&apos;avis, voici les modalités pour nous retourner vos articles en toute sérénité.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1. Le Délai de Rétractation (14 jours)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Conformément à la législation en vigueur (Loi Hamon), vous disposez d&apos;un délai de <strong>14 jours francs</strong> à
                compter de la date de réception physique de votre colis pour exercer votre droit de rétractation.
              </p>
              <p className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm">
                Dans le cas de l&apos;option &laquo; Colis Ouvert &raquo;, ce délai débute à la réception du colis regroupé.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Les Exceptions au Droit de Rétractation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Pour des raisons d&apos;hygiène et de sécurité, le droit de rétractation ne s&apos;applique pas aux
                (Article L221-28 du Code de la consommation) :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Produits cosmétiques</strong> (savons, bains moussants...) dont l&apos;emballage ou le scellé a été ouvert.</li>
                <li><strong>Produits d&apos;épicerie fine</strong> dont l&apos;emballage a été ouvert.</li>
                <li><strong>Cartes cadeaux</strong> (non remboursables en espèces).</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                Les bougies peuvent être retournées à condition qu&apos;elles n&apos;aient jamais été allumées et que leurs mèches soient intactes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Procédure de Retour</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Connectez-vous à votre compte, allez dans &laquo; Mes commandes &raquo;, et signalez votre retour (ou par e-mail).</li>
                <li>Replacez les articles dans leur emballage d&apos;origine, parfaitement calés (KAVERN ne pourra rembourser un produit arrivant brisé suite à un mauvais emballage).</li>
                <li>Renvoyez le colis à : <strong>KAVERN, 1062 Rue d&apos;Armentières, 59850 Nieppe</strong>.</li>
              </ol>
              <p className="text-sm text-gray-600 mt-4">
                Les frais d&apos;expédition pour le retour sont à la charge du client.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Remboursement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Après réception et validation de l&apos;état des articles, le remboursement s&apos;effectuera sous <strong>14 jours</strong> via
                le moyen de paiement initial.
              </p>
              <p className="text-sm text-gray-600">
                Si la commande initiale bénéficiait des frais de port offerts et que le retour fait tomber le total sous
                ce seuil, les frais de port initiaux seront déduits du remboursement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>5. Casse à la réception</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                En cas de produit reçu endommagé, contactez-nous sous <strong>24h</strong> avec des photos à{' '}
                <a href="mailto:contact@kavern-france.fr" className="text-[#C6A15B] hover:underline">contact@kavern-france.fr</a>.
                Une enquête transporteur sera ouverte pour indemnisation.
              </p>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-500">
            <p>
              Pour toute question, contactez notre service client &laquo; Allo André &raquo; :{' '}
              <a href="mailto:contact@kavern-france.fr" className="text-[#C6A15B] hover:underline">contact@kavern-france.fr</a>
              {' '}ou au{' '}
              <a href="tel:+33603489662" className="text-[#C6A15B] hover:underline">06 03 48 96 62</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
