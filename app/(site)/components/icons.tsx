export function SproutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-4 3-7 8-7 0 4-3 7-8 7Z" />
      <path d="M12 13c0-3-2.5-5.5-6.5-5.5C5.5 10.5 8 13 12 13Z" />
    </svg>
  );
}

export function InfinityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className={className}>
      <path d="M6.5 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5c3.5 0 7.5 7 11 7 1.9 0 3.5-1.6 3.5-3.5S19.4 8.5 17.5 8.5c-1.7 0-3.4 1.6-5.5 3.5" />
    </svg>
  );
}

export function GaugeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 14a8 8 0 1 1 16 0" />
      <path d="M12 14l4-4" />
      <path d="M2.5 18h19" />
    </svg>
  );
}

export function LeafShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 42C6 20 20 6 42 6c0 22-14 36-36 36Z" opacity=".9" />
    </svg>
  );
}
