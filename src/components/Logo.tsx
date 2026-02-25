export const Logo = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FACC15" />
        <stop offset="100%" stopColor="#EAB308" />
      </linearGradient>
    </defs>
    <path d="M20 80 L50 20 L80 80" stroke="url(#logo-grad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="45" r="12" fill="url(#logo-grad)" />
    <path d="M35 65 H65" stroke="#0a0a2e" strokeWidth="4" strokeLinecap="round" />
  </svg>
);
