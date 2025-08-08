interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "", width = 400, height = 100 }: LogoProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 400 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#0052CC" />
        </linearGradient>
      </defs>

      {/* Shield Shape */}
      <path
        d="M15,20 L65,20 C70,20 75,25 75,30 L75,50 C75,65 45,85 40,85 C35,85 5,65 5,50 L5,30 C5,25 10,20 15,20 Z"
        fill="url(#shieldGradient)"
      />

      {/* Growth Bars */}
      <rect x="18" y="55" width="8" height="15" rx="1" fill="#00D4AA" />
      <rect x="30" y="45" width="8" height="25" rx="1" fill="#00D4AA" />
      <rect x="42" y="35" width="8" height="35" rx="1" fill="#00D4AA" />

      {/* Main Text "FightYourTax" */}
      <text
        x="95"
        y="55"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="36"
        fontWeight="700"
        fill="#2D3748"
        letterSpacing="-1px"
      >
        FightYourTax
      </text>

      {/* Tagline */}
      <text
        x="95"
        y="75"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="14"
        fontWeight="500"
        fill="#718096"
        letterSpacing="2px"
      >
        AI-POWERED TAX OPTIMIZATION
      </text>
    </svg>
  )
}