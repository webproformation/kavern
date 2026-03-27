import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F2F2E8]">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Politique de Confidentialité
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-4">
              <p>
                La présente Politique de Confidentialité décrit la manière dont vos données personnelles sont collectées,
                utilisées et partagées lorsque vous visitez ou effectuez un achat sur kavern-france.fr (le « Site »).
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Responsable du traitement :</p>
                <p>KAVERN (SAS au capital de 1 000,00 €)</p>
                <p>RCS Dunkerque 102 355 443</p>
                <p>Président : OLIVARES André Dany</p>
                <p>Adresse : 1062 Rue d&apos;Armentières, 59850 Nieppe, France</p>
                <p>Email : <a href="mailto:contact@kavern-france.fr" className="text-[#C6A15B] hover:underline">contact@kavern-france.fr</a></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Données personnelles collectées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Nous collectons les types de données personnelles suivantes :</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Informations d&apos;identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                <li><strong>Informations de livraison :</strong> adresse postale, ville, code postal, pays</li>
                <li><strong>Informations de commande :</strong> produits commandés, montant, mode de paiement</li>
                <li><strong>Données liées au concept KAVERN :</strong> sauvegarde des paniers pour le service &quot;Colis Ouvert&quot; (retenue de 7 jours), historique des avis laissés sur le &quot;Livre d&apos;Or&quot; et solde de votre &quot;Cagnotte&quot; fidélité</li>
                <li><strong>Données de navigation :</strong> adresse IP, type de navigateur, pages visitées, durée de visite</li>
                <li><strong>Cookies :</strong> préférences de navigation, maintien de la session</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Finalités de la collecte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Vos données personnelles sont collectées pour les finalités suivantes :</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Gérer votre compte client et vos commandes classiques</li>
                <li>Gérer techniquement et logistiquement le service &quot;Colis Ouvert&quot;</li>
                <li>Animer votre programme de fidélité (&quot;Cagnotte&quot;) et publier vos retours sur le Livre d&apos;Or</li>
                <li>Traiter et livrer vos commandes via nos transporteurs</li>
                <li>Vous contacter concernant vos commandes (Service Client &quot;Allo André&quot;)</li>
                <li>Vous envoyer nos actualités et annonces de nos Lives Shopping (avec votre consentement)</li>
                <li>Prévenir les fraudes et assurer la sécurité du site</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Base légale du traitement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Le traitement de vos données repose sur :</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>L&apos;exécution d&apos;un contrat :</strong> pour traiter vos commandes et votre Colis Ouvert</li>
                <li><strong>Votre consentement :</strong> pour les communications marketing et les cookies non essentiels</li>
                <li><strong>L&apos;intérêt légitime :</strong> pour améliorer nos services et modérer le Livre d&apos;Or</li>
                <li><strong>Une obligation légale :</strong> pour la facturation et la comptabilité</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Durée de conservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-gray-700">
                <li><strong>Données de compte et de fidélité (Cagnotte) :</strong> Durée de vie du compte + 3 ans après la dernière activité</li>
                <li><strong>Données de commande :</strong> 10 ans (obligation légale comptable et fiscale)</li>
                <li><strong>Communications (Email/Newsletter) :</strong> Jusqu&apos;à désinscription + 3 ans</li>
                <li><strong>Cookies :</strong> Maximum 13 mois</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Vos droits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Droit d&apos;accès :</strong> obtenir la confirmation et une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l&apos;effacement :</strong> supprimer vos données</li>
                <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
                <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
                <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="font-semibold mb-2">Pour exercer vos droits :</p>
                <p>Email : <a href="mailto:contact@kavern-france.fr" className="text-[#C6A15B] hover:underline">contact@kavern-france.fr</a></p>
                <p>Téléphone : <a href="tel:+33603489662" className="text-[#C6A15B] hover:underline">+33 6 03 48 96 62</a></p>
                <p>Courrier : KAVERN, 1062 Rue d&apos;Armentières, 59850 Nieppe, France</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Droit de réclamation :</strong> Vous pouvez introduire une réclamation auprès de la CNIL
                (Commission Nationale de l&apos;Informatique et des Libertés) si vous estimez que vos droits ne sont pas respectés.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>6. Sécurité des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger
                vos données personnelles contre la perte, l&apos;utilisation abusive, l&apos;accès non autorisé ou la divulgation.
              </p>
              <div className="bg-white p-4 rounded mt-3">
                <p className="font-semibold mb-2">Hébergement sécurisé :</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• O2SWITCH (France) — Certification ISO 27001</li>
                  <li>• Vercel Inc. — Conformité RGPD (DPO : <a href="mailto:privacy@vercel.com" className="text-[#C6A15B] hover:underline">privacy@vercel.com</a>)</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Nos prestataires de paiement (Stripe, PayPal) assurent le cryptage intégral de vos données bancaires.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Nous utilisons des cookies pour assurer le bon fonctionnement de notre site (notamment pour la
                mémorisation de votre Colis Ouvert) et améliorer votre expérience.
              </p>
              <p>
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
