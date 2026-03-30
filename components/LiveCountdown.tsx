'use client';

import { useState, useEffect } from 'react';

interface LiveCountdownProps {
  scheduledStart: string;
}

export function LiveCountdown({ scheduledStart }: LiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const target = new Date(scheduledStart).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [scheduledStart]);

  const items = [
    { val: timeLeft.days, label: 'Jours' },
    { val: timeLeft.hours, label: 'Heures' },
    { val: timeLeft.minutes, label: 'Minutes' },
    { val: timeLeft.seconds, label: 'Secondes' },
  ];

  return (
    <div className="flex justify-center gap-4 md:gap-8 py-4">
      {items.map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-[#D4AF37] text-black font-black text-2xl md:text-4xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl shadow-lg">
            {String(val).padStart(2, '0')}
          </div>
          <span className="text-white/60 text-xs mt-2 uppercase tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}
