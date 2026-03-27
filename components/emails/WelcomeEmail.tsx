import { Heading, Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface WelcomeEmailProps {
  firstName: string;
}

export const WelcomeEmail = ({ firstName }: WelcomeEmailProps) => {
  return (
    <EmailLayout preview={`Bienvenue dans la KAVERN, ${firstName} ! Ton cadeau de 5 € t'attend...`}>
      <Heading style={h1}>Bienvenue dans la KAVERN !</Heading>

      <Text style={paragraph}>
        Coucou {firstName},
      </Text>

      <Text style={paragraph}>
        Je suis ravi de t&apos;accueillir officiellement dans notre communaut&eacute; !
      </Text>

      <Text style={paragraph}>
        Si tu es l&agrave;, c&apos;est que tu aimes les belles choses, l&apos;artisanat, le cocooning et les petites
        p&eacute;pites inattendues. Et &ccedil;a tombe bien, car c&apos;est exactement ce que je te r&eacute;serve.
      </Text>

      <Text style={paragraph}>
        Ton compte est bien cr&eacute;&eacute; et activ&eacute;. Et pour f&ecirc;ter l&apos;ouverture du site
        (et ton arriv&eacute;e parmi nous), j&apos;ai une petite surprise pour toi...
      </Text>

      {/* Bloc temporaire 5€ — désactivable */}
      <Section style={promoBox}>
        <Text style={promoTitle}>TON CADEAU DE BIENVENUE : 5 &euro; OFFERTS !</Text>
        <Text style={promoText}>
          Pour te remercier de ta confiance, voici un bon d&apos;achat de 5 &euro; valable imm&eacute;diatement
          sur ta premi&egrave;re commande.
        </Text>
        <Text style={promoCode}>
          Code : <strong>BIENVENUE5</strong>
        </Text>
        <Text style={promoNote}>(Code &agrave; usage unique)</Text>
      </Section>

      <Section style={box}>
        <Text style={boxTitle}>&Agrave; partir d&apos;aujourd&apos;hui, profite de l&apos;exp&eacute;rience KAVERN &agrave; 100 % :</Text>
        <Text style={paragraph}>
          📦 <strong>Ton fameux &quot;Colis Ouvert&quot;</strong> : Fini de payer les frais de port &agrave; chaque coup de c&oelig;ur !
          Tu peux grouper tes trouvailles du site et de nos Lives Shopping pendant 7 jours, et ne payer
          l&apos;exp&eacute;dition qu&apos;une seule fois.<br /><br />
          💰 <strong>Ta Cagnotte de Fid&eacute;lit&eacute;</strong> : Chaque action compte ! D&egrave;s ton premier achat et
          tes premiers avis, tu vas commencer &agrave; cumuler des euros pour tes prochaines envies.
        </Text>
      </Section>

      <Text style={paragraph}>
        Je t&apos;invite &agrave; jeter un &oelig;il &agrave; nos derni&egrave;res nouveaut&eacute;s (et particuli&egrave;rement
        aux cr&eacute;ations de l&apos;Atelier, coul&eacute;es avec amour).
      </Text>

      <Button href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://kavern-france.fr'}/category/nouveautes`} style={button}>
        Utiliser mes 5 &euro; sur la boutique
      </Button>

      <Text style={paragraph}>
        Un doute ? Une question ? Tu n&apos;es jamais seule. Tu peux me r&eacute;pondre directement &agrave; cet email,
        je me ferai un plaisir de t&apos;aider (c&apos;est &ccedil;a, le service &quot;Allo Andr&eacute;&quot; !).
      </Text>

      <Text style={signature}>
        &Agrave; tr&egrave;s vite (et peut-&ecirc;tre au prochain Live !),<br /><br />
        <strong>Andr&eacute;</strong><br />
        Cr&eacute;ateur cirier &amp; Fondateur de KAVERN<br />
        L&apos;Artisanat et l&apos;Inattendu
      </Text>
    </EmailLayout>
  );
};

const h1 = { color: '#333', fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' as const };
const paragraph = { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '16px 0' };
const box = { backgroundColor: '#FFF9E6', border: '2px solid #D4AF37', borderRadius: '8px', padding: '20px', margin: '20px 0' };
const boxTitle = { color: '#D4AF37', fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' };
const promoBox = { backgroundColor: '#000', borderRadius: '8px', padding: '25px', margin: '25px 0', textAlign: 'center' as const };
const promoTitle = { color: '#D4AF37', fontSize: '20px', fontWeight: 'bold', margin: '0 0 10px 0' };
const promoText = { color: '#fff', fontSize: '16px', lineHeight: '1.6', margin: '10px 0' };
const promoCode = { color: '#D4AF37', fontSize: '24px', fontWeight: 'bold', margin: '15px 0 5px 0', letterSpacing: '2px' };
const promoNote = { color: '#999', fontSize: '13px', margin: '0' };
const button = { backgroundColor: '#D4AF37', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '12px 30px', margin: '20px 0' };
const signature = { color: '#666', fontSize: '16px', lineHeight: '1.6', margin: '30px 0 0 0' };

export default WelcomeEmail;
