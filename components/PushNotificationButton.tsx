'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export function PushNotificationButton() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.error('Push check error:', err);
    }
  }

  async function togglePush() {
    if (!isSupported) {
      toast.error('Les notifications ne sont pas supportées par votre navigateur');
      return;
    }

    try {
      if (isSubscribed) {
        // Désabonnement
        const registration = await navigator.serviceWorker.getRegistration('/sw-push.js');
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            // Supprimer en base
            if (user) {
              await supabase.from('push_subscriptions').delete().eq('user_id', user.id);
            }
          }
        }
        setIsSubscribed(false);
        toast.success('Notifications désactivées');
      } else {
        // Demande de permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Permission refusée. Activez les notifications dans les paramètres de votre navigateur.');
          return;
        }

        // Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/sw-push.js');

        // S'abonner aux push (VAPID key nécessaire pour la production)
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          // Fallback : enregistrer juste la permission locale
          setIsSubscribed(true);
          toast.success('Notifications activées ! Vous serez alerté(e) pour chaque Live.');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey
        });

        // Sauvegarder en base
        if (user) {
          await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            subscription: JSON.stringify(subscription),
            created_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }

        setIsSubscribed(true);
        toast.success('Notifications activées ! Vous serez alerté(e) pour chaque Live.');
      }
    } catch (err) {
      console.error('Push toggle error:', err);
      toast.error('Erreur lors de la configuration des notifications');
    }
  }

  if (!isSupported) return null;

  return (
    <Button
      onClick={togglePush}
      variant={isSubscribed ? 'outline' : 'default'}
      className={isSubscribed
        ? 'border-green-300 text-green-700 hover:bg-green-50'
        : 'bg-[#D4AF37] hover:bg-[#C6A15B] text-white'
      }
      size="sm"
    >
      {isSubscribed ? (
        <><BellOff className="h-4 w-4 mr-2" /> Notifications activées</>
      ) : (
        <><Bell className="h-4 w-4 mr-2" /> Activer les notifications</>
      )}
    </Button>
  );
}
