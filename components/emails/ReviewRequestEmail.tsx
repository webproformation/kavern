import { Heading, Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './EmailLayout';

interface ReviewRequestEmailProps {
  firstName: string;
}

export const ReviewRequestEmail = ({ firstName }: ReviewRequestEmailProps) => {
  return (
    <EmailLayout preview={`Alors, heureuse ? Ton avis vaut de l'or... litteralement !`}>
      <Heading style={h1}>Alors, heureuse ?</Heading>

      <Text style={paragraph}>
        Coucou {firstName},
      </Text>

      <Text style={paragraph}>
        J&apos;ai vu que ton colis KAVERN &eacute;tait bien arriv&eacute; &agrave; destination !
        J&apos;esp&egrave;re que le d&eacute;ballage a &eacute;t&eacute; &agrave; la hauteur de tes attentes
        et que tu as ressenti ce petit effet &quot;matin de No&euml;l&quot; que j&apos;aime tant pr&eacute;parer.
      </Text>

      <Text style={paragraph}>
        Tes retours sont pr&eacute;cieux pour moi. Ce sont eux qui font vivre la boutique et qui
        m&apos;aident &agrave; d&eacute;nicher de nouvelles merveilles pour toi.
      </Text>

      <Section style={rewardBox}>
        <Text style={rewardTitle}>Ton avis vaut de l&apos;or... litt&eacute;ralement !</Text>
        <Text style={rewardText}>
          Prends 2 petites minutes pour me raconter ton exp&eacute;rience sur notre <strong>Livre d&apos;Or</strong>
          (un petit mot, ou encore mieux, une photo de ton colis ou de tes produits chez toi !).
        </Text>
        <Text style={rewardHighlight}>
          D&egrave;s que ton petit mot est publi&eacute;, je cr&eacute;dite automatiquement
          <strong> 0,20 &euro;</strong> sur ta cagnotte KAVERN pour tes prochains craquages.
        </Text>
      </Section>

      <Button href={`${process.env.NEXT_PUBLIC_SITE_URL}/livre-dor`} style={button}>
        Laisser mon avis et cagnotter 0,20 &euro;
      </Button>

      <Text style={paragraph}>
        Si jamais le moindre petit d&eacute;tail n&apos;allait pas avec ta commande, n&apos;h&eacute;site
        pas &agrave; me contacter en r&eacute;pondant &agrave; ce mail. Je m&apos;occupe de tout.
      </Text>

      <Text style={noteText}>
        P.S. : Si tu as &eacute;t&eacute; plus rapide que l&apos;&eacute;clair et que tu as d&eacute;j&agrave;
        laiss&eacute; ton avis sur le site, un immense merci ! Ta cagnotte a d&ucirc; &ecirc;tre
        cr&eacute;dit&eacute;e, et tu peux bien s&ucirc;r ignorer ce message.
      </Text>

      <Text style={signature}>
        Merci de faire partie de l&apos;aventure !<br /><br />
        <strong>Andr&eacute;</strong><br />
        Cr&eacute;ateur cirier &amp; Fondateur de KAVERN<br />
        L&apos;Artisanat et l&apos;Inattendu
      </Text>
    </EmailLayout>
  );
};

const h1 = { color: '#333', fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' as const };
const paragraph = { color: '#333', fontSize: '16px', lineHeight: '1.6', margin: '16px 0' };
const rewardBox = { backgroundColor: '#FFF9E6', border: '2px solid #D4AF37', borderRadius: '8px', padding: '25px', margin: '25px 0', textAlign: 'center' as const };
const rewardTitle = { fontSize: '20px', fontWeight: 'bold', color: '#D4AF37', margin: '0 0 15px 0' };
const rewardText = { fontSize: '16px', color: '#333', lineHeight: '1.6', margin: '0 0 10px 0' };
const rewardHighlight = { fontSize: '16px', color: '#333', lineHeight: '1.6', margin: '10px 0 0 0', fontWeight: 'bold' };
const noteText = { fontSize: '14px', color: '#999', lineHeight: '1.6', margin: '20px 0', fontStyle: 'italic' };
const button = { backgroundColor: '#D4AF37', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '12px 30px', margin: '20px 0' };
const signature = { color: '#666', fontSize: '16px', lineHeight: '1.6', margin: '30px 0 0 0' };

export default ReviewRequestEmail;
