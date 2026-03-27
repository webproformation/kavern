import { Heading, Text, Button, Section, Row, Column, Img } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface OrderItem {
  image_url: string | null;
  product_name: string;
  sku?: string;
  variation_details?: any;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  firstName: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  isOpenPackage?: boolean;
}

export const OrderConfirmationEmail = ({
  firstName,
  orderNumber,
  items,
  total,
  isOpenPackage = false
}: OrderConfirmationEmailProps) => {
  return (
    <EmailLayout preview={`Youpi ! Ta commande KAVERN est bien validee (N° ${orderNumber})`}>
      <Heading style={h1}>Youpi ! Ta commande est validee !</Heading>

      <Text style={paragraph}>
        Coucou {firstName},
      </Text>

      <Text style={paragraph}>
        Un immense merci pour ta commande ! C&apos;est toujours une joie de voir que mes p&eacute;pites
        (et les cr&eacute;ations de l&apos;Atelier) trouvent une nouvelle maison.
      </Text>

      <Text style={paragraph}>
        Ton paiement a bien &eacute;t&eacute; valid&eacute; et ta commande n&deg; <strong>{orderNumber}</strong> est
        d&eacute;sormais entre mes mains.
      </Text>

      <Section style={orderBox}>
        <Text style={boxTitle}>R&eacute;capitulatif de ta commande :</Text>

        {items.map((item, index) => (
          <Row key={index} style={itemRow}>
            <Column style={{ width: '80px' }}>
              {item.image_url && (
                <Img src={item.image_url} width="70" height="70" style={itemImage} alt={item.product_name} />
              )}
            </Column>
            <Column style={{ paddingLeft: '10px' }}>
              <Text style={itemName}>{item.product_name}</Text>
              {item.sku && <Text style={itemSKU}>UGS: {item.sku}</Text>}
              {item.variation_details && (
                <Text style={itemDetails}>
                  {Object.entries(item.variation_details).map(([key, value]) =>
                    `${key}: ${value}`
                  ).join(' - ')}
                </Text>
              )}
              <Text style={itemQuantity}>Quantit&eacute; : {item.quantity}</Text>
            </Column>
            <Column style={{ textAlign: 'right', width: '80px' }}>
              <Text style={itemPrice}>{(item.price * item.quantity).toFixed(2)} &euro;</Text>
            </Column>
          </Row>
        ))}

        <Row style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #D4AF37' }}>
          <Column><Text style={totalLabel}>Total</Text></Column>
          <Column style={{ textAlign: 'right' }}><Text style={totalPrice}>{total.toFixed(2)} &euro;</Text></Column>
        </Row>
      </Section>

      {/* Affichage conditionnel selon le type de commande */}
      <Section style={deliveryBox}>
        <Text style={deliveryTitle}>Concernant la livraison :</Text>
        {isOpenPackage ? (
          <Text style={paragraph}>
            Tes trouvailles sont bien au chaud dans ta malle &agrave; l&apos;atelier ! N&apos;oublie pas :
            tu as jusqu&apos;&agrave; <strong>7 jours</strong> (apr&egrave;s l&apos;ouverture de ce colis) pour y ajouter
            de nouveaux coups de c&oelig;ur lors de nos Lives ou sur le site, <strong>sans repayer de frais de port</strong>.
            D&egrave;s que tu es pr&ecirc;te, il te suffira de cliquer sur &quot;Fermer mon Colis Ouvert&quot; dans ton espace client
            pour que je te l&apos;exp&eacute;die.
          </Text>
        ) : (
          <Text style={paragraph}>
            Je pr&eacute;pare ton colis avec le plus grand soin. Tu recevras un nouvel e-mail avec ton
            num&eacute;ro de suivi d&egrave;s qu&apos;il quittera l&apos;atelier (sous 24 &agrave; 48h) !
          </Text>
        )}
      </Section>

      <Text style={paragraph}>
        Si tu rep&egrave;res la moindre erreur dans ton adresse ou ta commande, r&eacute;ponds vite &agrave; cet e-mail
        pour que je puisse corriger &ccedil;a avant l&apos;envoi (Allo Andr&eacute; est l&agrave; pour &ccedil;a !).
      </Text>

      <Button href={`${process.env.NEXT_PUBLIC_SITE_URL}/account/orders`} style={button}>
        Voir ma commande
      </Button>

      <Text style={signature}>
        &Agrave; tr&egrave;s vite,<br /><br />
        <strong>Andr&eacute;</strong><br />
        Cr&eacute;ateur cirier &amp; Fondateur de KAVERN<br />
        L&apos;Artisanat et l&apos;Inattendu
      </Text>
    </EmailLayout>
  );
};

const h1 = { color: '#333', fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' as const };
const paragraph = { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '16px 0' };
const orderBox = { backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', margin: '20px 0' };
const boxTitle = { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' };
const deliveryBox = { backgroundColor: '#FFF9E6', border: '2px solid #D4AF37', borderRadius: '8px', padding: '20px', margin: '20px 0' };
const deliveryTitle = { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' };
const itemRow = { marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e0e0e0' };
const itemImage = { borderRadius: '4px', objectFit: 'cover' as const };
const itemName = { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 5px 0' };
const itemSKU = { fontSize: '12px', color: '#999', margin: '0 0 5px 0', fontStyle: 'italic' as const };
const itemDetails = { fontSize: '14px', color: '#666', margin: '0 0 5px 0' };
const itemQuantity = { fontSize: '14px', color: '#666', margin: '0' };
const itemPrice = { fontSize: '16px', fontWeight: 'bold', color: '#D4AF37', margin: '0' };
const totalLabel = { fontSize: '20px', fontWeight: 'bold', color: '#333', margin: '0' };
const totalPrice = { fontSize: '24px', fontWeight: 'bold', color: '#D4AF37', margin: '0' };
const button = { backgroundColor: '#D4AF37', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '12px 30px', margin: '20px 0' };
const signature = { color: '#666', fontSize: '16px', lineHeight: '1.6', margin: '30px 0 0 0' };

export default OrderConfirmationEmail;
