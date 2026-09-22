export function Logo({ className = "h-8 w-8" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="lf-bg-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b7cff" />
          <stop offset="50%" stopColor="#6f5cf6" />
          <stop offset="100%" stopColor="#5544d6" />
        </linearGradient>
        <linearGradient id="lf-accent-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe177" />
          <stop offset="100%" stopColor="#f5c451" />
        </linearGradient>
        <linearGradient id="lf-inner-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8e9ff" />
        </linearGradient>
      </defs>
      
      {/* Outer Rounded Squircle */}
      <rect x="4" y="4" width="92" height="92" rx="26" fill="url(#lf-bg-logo)" />
      <rect x="4" y="4" width="92" height="92" rx="26" stroke="#a396ff" strokeWidth="1.5" strokeOpacity="0.4" />
      
      {/* L Stem */}
      <path d="M28 26C28 23.7909 29.7909 22 32 22H38C40.2091 22 42 23.7909 42 26V74C42 76.2091 40.2091 78 38 78H32C29.7909 78 28 76.2091 28 74V26Z" fill="url(#lf-inner-logo)" />
      
      {/* L Base */}
      <path d="M38 64H64C66.2091 64 68 65.7909 68 68V74C68 76.2091 66.2091 78 64 78H38V64Z" fill="url(#lf-inner-logo)" />
      
      {/* F Top Bar */}
      <path d="M38 22H66C68.2091 22 70 23.7909 70 26V32C70 34.2091 68.2091 36 66 36H38V22Z" fill="url(#lf-inner-logo)" />
      
      {/* F Mid Bar */}
      <path d="M38 43H58C60.2091 43 62 44.7909 62 47V51C62 53.2091 60.2091 55 58 55H38V43Z" fill="url(#lf-inner-logo)" opacity="0.95" />
      
      {/* Golden Forge Spark / Star */}
      <path d="M74 18L76.8 27.2L86 30L76.8 32.8L74 42L71.2 32.8L62 30L71.2 27.2L74 18Z" fill="url(#lf-accent-logo)" />
      <circle cx="74" cy="30" r="2.2" fill="#ffffff" />
    </svg>
  )
}
