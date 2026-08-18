import { useEffect, useState } from 'react';

/**
 * Live clock. Re-renders the caller on minute boundaries so status-bar time
 * and the home greeting stay accurate without a ticking interval per consumer.
 * Uses the device's local timezone (zh-CN formatting).
 */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    // Align to the next minute boundary, then fire every 60s.
    const msToNextMinute = 60000 - (Date.now() % 60000);
    const first = setTimeout(() => {
      tick();
      const interval = setInterval(tick, 60000);
      // stash cleanup on the timeout closure
      (first as unknown as { _interval?: ReturnType<typeof setInterval> })._interval = interval;
    }, msToNextMinute);
    return () => {
      clearTimeout(first);
      const interval = (first as unknown as { _interval?: ReturnType<typeof setInterval> })._interval;
      if (interval) clearInterval(interval);
    };
  }, []);

  return now;
}

/** e.g. "9:41" (24h would be "14:05" — prototype shows 9:41 style without leading zero). */
export function formatStatusBarTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m < 10 ? '0' + m : m}`;
}

/** e.g. "周三 · 6月4日" */
export function formatGreetingDate(d: Date): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${weekdays[d.getDay()]} · ${d.getMonth() + 1}月${d.getDate()}日`;
}
