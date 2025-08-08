interface LogoIconProps {
  className?: string
  size?: number
}

export function LogoIcon({ className = "", size = 40 }: LogoIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 80 80" 
      className={className} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGradientIcon" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#0052CC" />
        </linearGradient>
      </defs>

      {/* Shield Shape - centered and scaled */}
      <path
        d="M15,10 L65,10 C70,10 75,15 75,20 L75,40 C75,55 45,75 40,75 C35,75 5,55 5,40 L5,20 C5,15 10,10 15,10 Z"
        fill="url(#shieldGradientIcon)"
      />

      {/* Growth Bars */}
      <rect x="18" y="45" width="8" height="15" rx="1" fill="#00D4AA" />
      <rect x="30" y="35" width="8" height="25" rx="1" fill="#00D4AA" />
      <rect x="42" y="25" width="8" height="35" rx="1" fill="#00D4AA" />
    </svg>
  )
}