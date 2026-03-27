import { Heading, Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface AbandonedCartEmailProps {
  firstName: string;
}

export const AbandonedCartEmail = ({ firstName }: AbandonedCartEmailProps) => {
  return (
    <EmailLayout preview={`Oups ${firstName}... Tu as oublié ces beautés ? 😱`}>
      <Heading style={h1}>Oups... Tu as oublié quelque chose ! 😱</Heading>

      <Text style={paragraph}>
        Re-coucou {firstName} !
      </Text>

      <Text style={paragraph}>
        Je crois que tu es partie un peu vite... Tes pépites sont restées dans ton panier et elles s'ennuient sans toi !
      </Text>

      <Section style={warningBox}>
        <Text style={warningIcon}>⚠️</Text>
        <Text style={warningText}>
          <strong>Attention</strong>, les stocks fondent vite par ici, ce serait dommage qu'une autre copine te les pique. 🏃‍♀️
        </Text>
      </Section>

      <Button href={`${process.env.NEXT_PUBLIC_SITE_URL}/cart`} style={button}>
        🛒 Je retrouve mon panier
      </Button>

      <Text style={helpText}>
        Si tu as une question ou un doute sur la taille, envoie-moi un message !
      </Text>

      <Text style={signature}>
        Bisous,<br />
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

const warningBox = {
  backgroundColor: '#FFF3E0',
  border: '2px solid #FF9800',
  borderRadius: '8px',
  padding: '25px',
  margin: '25px 0',
  textAlign: 'center' as const,
};

const warningIcon = {
  fontSize: '48px',
  margin: '0 0 10px 0',
};

const warningText = {
  fontSize: '16px',
  color: '#333',
  lineHeight: '1.6',
  margin: '10px 0',
};

const button = {
  backgroundColor: '#D4AF37',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 30px',
  margin: '20px 0',
};

const helpText = {
  fontSize: '15px',
  color: '#666',
  textAlign: 'center' as const,
  fontStyle: 'italic',
  margin: '20px 0',
};

const signature = {
  color: '#666',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '30px 0 0 0',
  fontStyle: 'italic',
};

export default AbandonedCartEmail;
