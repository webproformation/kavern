import * as React from 'react';

interface BirthdayEmailProps {
  firstName: string;
  amount: number;
}

export function BirthdayEmail({ firstName, amount }: BirthdayEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#000' }}>
      {/* Header festif */}
      <div style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4E5B0 50%, #D4AF37 100%)', padding: '40px 20px', textAlign: 'center' as const }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎂</div>
        <h1 style={{ color: '#000', fontSize: '28px', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
          Joyeux Anniversaire {firstName} !
        </h1>
      </div>

      {/* Contenu */}
      <div style={{ padding: '40px 30px', backgroundColor: '#fff' }}>
        <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6' }}>
          Bonjour <strong>{firstName}</strong>,
        </p>
        <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6' }}>
          C'est ton jour ! Pour fêter ça, André et toute l'équipe KAVERN t'offrent un petit cadeau :
        </p>

        {/* Cadeau */}
        <div style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C6A15B 100%)', borderRadius: '16px', padding: '30px', textAlign: 'center' as const, margin: '30px 0' }}>
          <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#fff' }}>
            {amount.toFixed(2)} €
          </div>
          <div style={{ fontSize: '14px', color: '#fff', opacity: 0.9, marginTop: '8px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
            Crédités sur ta cagnotte
          </div>
        </div>

        <p style={{ fontSize: '16px', color: '#333', lineHeight: '1.6' }}>
          Ce montant est déjà disponible sur ta cagnotte et sera automatiquement déduit de ta prochaine commande. Pas de code à rentrer, c'est automatique !
        </p>

        {/* CTA */}
        <div style={{ textAlign: 'center' as const, margin: '30px 0' }}>
          <a href="https://kavern-france.fr/shop" style={{
            display: 'inline-block', backgroundColor: '#D4AF37', color: '#000',
            padding: '16px 40px', borderRadius: '50px', textDecoration: 'none',
            fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' as const,
            letterSpacing: '1px'
          }}>
            Découvrir les nouveautés
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', fontStyle: 'italic' }}>
          Passe une merveilleuse journée ! 🎉
        </p>

        <p style={{ fontSize: '16px', color: '#333', marginTop: '20px' }}>
          André<br />
          <span style={{ fontSize: '13px', color: '#999' }}>Fondateur de KAVERN</span>
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center' as const, backgroundColor: '#f8f8f8', borderTop: '1px solid #eee' }}>
        <p style={{ fontSize: '11px', color: '#999', margin: '0' }}>
          KAVERN — Le Concept Store en Live<br />
          contact@kavern-france.fr
        </p>
      </div>
    </div>
  );
}
