import { Heading, Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface DiamondFoundEmailProps {
  firstName: string;
  amount: number;
}

export const DiamondFoundEmail = ({ firstName, amount }: DiamondFoundEmailProps) => {
  return (
    <EmailLayout preview={`BRAVO ! Tu as trouvé un Diamant ! 💎`}>
      <Heading style={h1}>BRAVO ! 💎</Heading>

      <Text style={paragraph}>
        Félicitations {firstName} !
      </Text>

      <Section style={diamondBox}>
        <Text style={diamondIcon}>💎</Text>
        <Text style={diamondTitle}>Tu as l'œil !</Text>
        <Text style={diamondText}>
          Tu viens de dénicher un <strong>Diamant caché</strong> sur le site.
        </Text>
      </Section>

      <Section style={rewardBox}>
        <Text style={rewardTitle}>🎁 Ton Gain</Text>
        <Text style={rewardAmount}>
          {amount.toFixed(2)}€
        </Text>
        <Text style={rewardText}>
          ont été ajoutés à ta cagnotte fidélité !
        </Text>
      </Section>

      <Text style={hintText}>
        Continue de fouiller, d'autres trésors se cachent peut-être... 👀
      </Text>

      <Button href={process.env.NEXT_PUBLIC_SITE_URL || 'https://kavern.fr'} style={button}>
        Continuer ma chasse au trésor
      </Button>

      <Text style={signature}>
        <strong>L'équipe KAVERN</strong> ✨
      </Text>
    </EmailLayout>
  );
};

const h1 = {
  color: '#333',
  fontSize: '32px',
  fontWeight: 'bold',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#333',
  fontSize: '18px',
  lineHeight: '1.6',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const diamondBox = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '12px',
  padding: '40px',
  margin: '30px 0',
  textAlign: 'center' as const,
};

const diamondIcon = {
  fontSize: '64px',
  margin: '0 0 15px 0',
  filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))',
};

const diamondTitle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '10px 0',
};

const diamondText = {
  fontSize: '18px',
  color: '#ffffff',
  lineHeight: '1.6',
  margin: '15px 0 0 0',
};

const rewardBox = {
  backgroundColor: '#FFF9E6',
  border: '3px solid #D4AF37',
  borderRadius: '8px',
  padding: '30px',
  margin: '30px 0',
  textAlign: 'center' as const,
};

const rewardTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#D4AF37',
  margin: '0 0 15px 0',
};

const rewardAmount = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#D4AF37',
  margin: '10px 0',
  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
};

const rewardText = {
  fontSize: '18px',
  color: '#333',
  margin: '10px 0 0 0',
};

const hintText = {
  fontSize: '16px',
  color: '#666',
  textAlign: 'center' as const,
  fontStyle: 'italic',
  margin: '25px 0',
};

const button = {
  backgroundColor: '#667eea',
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

const signature = {
  color: '#666',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '30px 0 0 0',
  fontStyle: 'italic',
  textAlign: 'center' as const,
};

export default DiamondFoundEmail;
