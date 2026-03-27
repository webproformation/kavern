import { Heading, Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface ShippingEmailProps {
  firstName: string;
  trackingNumber: string;
  trackingUrl?: string;
  carrierName?: string;
}

export const ShippingEmail = ({
  firstName,
  trackingNumber,
  trackingUrl,
  carrierName = 'notre transporteur'
}: ShippingEmailProps) => {
  return (
    <EmailLayout preview={`Bonne nouvelle ! Ton colis KAVERN est en route`}>
      <Heading style={h1}>Bonne nouvelle ! Ton colis est en route !</Heading>

      <Text style={paragraph}>
        Coucou {firstName},
      </Text>

      <Text style={paragraph}>
        Le grand moment approche ! Je viens tout juste de confier ton colis &agrave; {carrierName}.
      </Text>

      <Text style={paragraph}>
        Ta malle aux tr&eacute;sors est officiellement en route vers toi. J&apos;ai pris un soin tout
        particulier &agrave; tout emballer pour que tes produits voyagent en toute s&eacute;curit&eacute;
        et que l&apos;ouverture soit un vrai petit moment de bonheur.
      </Text>

      <Section style={trackingBox}>
        <Text style={trackingIcon}>📦</Text>
        <Text style={trackingTitle}>Suis le voyage de ton colis en direct :</Text>
        <Text style={trackingNum}>
          N&deg; de suivi : <strong>{trackingNumber}</strong>
        </Text>
        {trackingUrl ? (
          <Button href={trackingUrl} style={trackingButton}>
            Suivre mon colis
          </Button>
        ) : (
          <Text style={trackingNote}>
            (Il faut parfois patienter quelques heures pour que le lien de suivi s&apos;active chez le transporteur, pas de panique !)
          </Text>
        )}
      </Section>

      <Text style={paragraph}>
        Pr&eacute;pare-toi pour l&apos;unboxing (le d&eacute;ballage) ! Et surtout, n&apos;h&eacute;site pas &agrave;
        partager tes trouvailles sur notre page Facebook ou &agrave; me faire un petit retour,
        &ccedil;a me fait toujours chaud au c&oelig;ur.
      </Text>

      <Text style={signature}>
        Bonne r&eacute;ception et &agrave; tr&egrave;s bient&ocirc;t pour le prochain Live !<br /><br />
        <strong>Andr&eacute;</strong><br />
        Cr&eacute;ateur cirier &amp; Fondateur de KAVERN<br />
        L&apos;Artisanat et l&apos;Inattendu
      </Text>
    </EmailLayout>
  );
};

const h1 = { color: '#333', fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' as const };
const paragraph = { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '16px 0' };
const trackingBox = { backgroundColor: '#FFF9E6', border: '2px solid #D4AF37', borderRadius: '8px', padding: '30px', margin: '30px 0', textAlign: 'center' as const };
const trackingIcon = { fontSize: '48px', margin: '0 0 10px 0' };
const trackingTitle = { color: '#D4AF37', fontSize: '20px', fontWeight: 'bold', margin: '10px 0' };
const trackingNum = { color: '#333', fontSize: '16px', margin: '15px 0' };
const trackingButton = { backgroundColor: '#D4AF37', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '12px 30px', margin: '15px 0' };
const trackingNote = { fontSize: '14px', color: '#666', fontStyle: 'italic', margin: '15px 0 0 0' };
const signature = { color: '#666', fontSize: '16px', lineHeight: '1.6', margin: '30px 0 0 0' };

export default ShippingEmail;
