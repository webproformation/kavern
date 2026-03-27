import { Heading, Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface ShippingEmailProps {
  firstName: string;
  trackingNumber: string;
  trackingUrl?: string;
}

export const ShippingEmail = ({
  firstName,
  trackingNumber,
  trackingUrl
}: ShippingEmailProps) => {
  return (
    <EmailLayout preview={`Ça y est ! Ton bonheur est en route 🚚`}>
      <Heading style={h1}>Ça y est ! Ton bonheur est en route 🚚</Heading>

      <Text style={paragraph}>
        Youpi {firstName} !
      </Text>

      <Text style={paragraph}>
        Ton colis est fermé, scotché et il vient de quitter l'atelier !
      </Text>

      <Text style={paragraph}>
        On y a mis tout notre cœur, on espère que tes nouveaux trésors vont te plaire.
      </Text>

      <Section style={trackingBox}>
        <Text style={trackingIcon}>🧐</Text>
        <Text style={trackingTitle}>Pour suivre ton colis</Text>
        <Text style={trackingNumber as any}>
          N° de suivi :<br />
          <strong>{trackingNumber}</strong>
        </Text>
        {trackingUrl ? (
          <Button href={trackingUrl} style={trackingButton}>
            Suivre mon colis
          </Button>
        ) : (
          <Text style={trackingNote}>
            Tu pourras suivre ton colis via le site du transporteur dans quelques heures
          </Text>
        )}
      </Section>

      <Section style={socialBox}>
        <Text style={socialText}>
          📸 N'hésite pas à nous envoyer une petite photo quand tu l'auras reçu ou à nous identifier sur Facebook, on adore ça !
        </Text>
      </Section>

      <Text style={signature}>
        Bonne réception et à très vite,<br />
        <strong>L'équipe KAVERN</strong> ✨
      </Text>
    </EmailLayout>
  );
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const trackingBox = {
  backgroundColor: '#E8F4FD',
  border: '2px solid #4A90E2',
  borderRadius: '8px',
  padding: '30px',
  margin: '30px 0',
  textAlign: 'center' as const,
};

const trackingIcon = {
  fontSize: '48px',
  margin: '0 0 10px 0',
};

const trackingTitle = {
  color: '#4A90E2',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '10px 0',
};

const trackingNumber = {
  color: '#333',
  fontSize: '16px',
  margin: '15px 0',
} as const;

const trackingButton = {
  backgroundColor: '#4A90E2',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
  margin: '15px 0',
};

const trackingNote = {
  fontSize: '14px',
  color: '#666',
  fontStyle: 'italic',
  margin: '15px 0 0 0',
};

const socialBox = {
  backgroundColor: '#FFF9E6',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const socialText = {
  fontSize: '15px',
  color: '#666',
  lineHeight: '1.6',
  margin: '0',
};

const signature = {
  color: '#666',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '30px 0 0 0',
  fontStyle: 'italic',
};

export default ShippingEmail;
