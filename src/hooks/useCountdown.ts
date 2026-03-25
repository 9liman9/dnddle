import { useState, useEffect } from 'react';

function getTimeUntilMidnightUTC(): { hours: number; minutes: number; seconds: number; total: number } {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  const total = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  return { hours, minutes, seconds, total };
}

export function useCountdown() {
  const [time, setTime] = useState(getTimeUntilMidnightUTC);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntilMidnightUTC());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;

  return { ...time, formatted };
}
