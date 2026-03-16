/**
 * Hermes Hunter Icon
 * A brutalist strike mark - representing precision vulnerability discovery
 */

export default function HermesIcon({ className = '', size = 40 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Strike blade - sharp, downward strike */}
      <path 
        d="M20 2V22" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      
      {/* Crossguard - angular, brutal */}
      <path 
        d="M12 14H28" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="square"
      />
      
      {/* Handle grip */}
      <path 
        d="M20 22V30" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="square"
      />
      
      {/* Pommel - solid base */}
      <rect 
        x="17" 
        y="30" 
        width="6" 
        height="4" 
        fill="currentColor"
      />
      
      {/* Wing accents - speed, precision (subtle) */}
      <path 
        d="M8 14L4 10" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="square"
        opacity="0.6"
      />
      <path 
        d="M32 14L36 10" 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="square"
        opacity="0.6"
      />
    </svg>
  )
}
