interface RetratoProps {
  id: string;
  color: string;
  size?: number;
}

/** Retrato ilustrado (SVG) de cada personaje, en la paleta andina de la página. */
export default function Retrato({ id, color, size = 96 }: RetratoProps) {
  const skin = '#b98056';
  const dark = '#0c0904';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-hidden="true">
      <defs>
        <radialGradient id={`bg-${id}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#3a2810" />
          <stop offset="100%" stopColor="#120c06" />
        </radialGradient>
        <clipPath id={`clip-${id}`}><circle cx="50" cy="50" r="48" /></clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="100" height="100" fill={`url(#bg-${id})`} />
        {/* montañas */}
        <path d="M0,70 L22,42 L40,62 L62,34 L100,72 L100,100 L0,100Z" fill="#2d5a3d" opacity="0.45" />

        {id === 'comunidad' ? (
          <>
            {[24, 50, 76].map((x, i) => (
              <g key={x} transform={`translate(0 ${i === 1 ? -4 : 4})`}>
                <circle cx={x} cy="46" r="9" fill={skin} />
                <path d={`M${x - 10},43 Q${x},30 ${x + 10},43 L${x + 10},40 Q${x},26 ${x - 10},40Z`} fill={i === 1 ? '#6b3f2a' : '#8c5a3a'} />
                <path d={`M${x - 15},100 Q${x - 13},64 ${x},60 Q${x + 13},64 ${x + 15},100Z`} fill={i === 1 ? '#9a3a2a' : '#4a7c59'} />
              </g>
            ))}
          </>
        ) : (
          <>
            {/* torso */}
            {id === 'andres' && <path d="M14,100 Q16,66 50,62 Q84,66 86,100Z" fill="#9a3a2a" />}
            {id === 'cunshi' && <path d="M14,100 Q16,66 50,62 Q84,66 86,100Z" fill="#4a7c59" />}
            {id === 'alfonso' && <path d="M14,100 Q16,66 50,62 Q84,66 86,100Z" fill="#1a1208" />}
            {id === 'julio' && <path d="M14,100 Q16,66 50,62 Q84,66 86,100Z" fill="#3a2810" />}
            {id === 'cura' && <path d="M14,100 Q16,66 50,62 Q84,66 86,100Z" fill="#141010" />}
            {/* cuello y cabeza */}
            <rect x="44" y="54" width="12" height="12" fill={skin} />
            <ellipse cx="50" cy="42" rx="14" ry="16" fill={skin} />
            {/* ojos */}
            <circle cx="44.5" cy="42" r="1.4" fill={dark} />
            <circle cx="55.5" cy="42" r="1.4" fill={dark} />
            <path d="M45,50 Q50,53 55,50" stroke={dark} strokeWidth="1.2" fill="none" />

            {id === 'andres' && (
              <>
                <path d="M34,38 Q50,10 66,38 Q50,30 34,38Z" fill="#6b3f2a" />
                <ellipse cx="50" cy="35" rx="22" ry="4" fill="#4a2a18" />
                <path d="M40,62 L50,76 L60,62Z" fill="#c9a227" opacity="0.8" />
              </>
            )}
            {id === 'cunshi' && (
              <>
                <path d="M35,42 Q33,22 50,22 Q67,22 65,42 Q62,30 50,30 Q38,30 35,42Z" fill={dark} />
                <path d="M35,40 Q30,60 36,78" stroke={dark} strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M65,40 Q70,60 64,78" stroke={dark} strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M30,66 L70,66 L66,74 L34,74Z" fill="#c9a227" opacity="0.85" />
              </>
            )}
            {id === 'alfonso' && (
              <>
                <rect x="38" y="12" width="24" height="18" rx="2" fill={dark} />
                <ellipse cx="50" cy="31" rx="22" ry="4" fill={dark} />
                <rect x="38" y="25" width="24" height="3" fill="#c9a227" />
                <path d="M44,50 Q50,47 56,50 Q50,52 44,50Z" fill={dark} />
                <path d="M46,62 L50,72 L54,62Z" fill="#e8d5b0" />
              </>
            )}
            {id === 'julio' && (
              <>
                <path d="M36,36 Q50,18 64,36 Q50,28 36,36Z" fill="#c9c4b8" />
                <path d="M44,49 Q50,45 56,49 Q50,54 44,49Z" fill="#c9c4b8" />
                <path d="M46,62 L50,72 L54,62Z" fill="#e8d5b0" />
              </>
            )}
            {id === 'cura' && (
              <>
                <path d="M36,36 Q50,20 64,36 Q50,30 36,36Z" fill="#3a3a3a" />
                <ellipse cx="50" cy="27" rx="5" ry="2.5" fill={skin} />
                <rect x="44" y="60" width="12" height="6" fill="#f2ead8" />
                <rect x="49" y="70" width="2.5" height="14" fill="#c9a227" />
                <rect x="45" y="74" width="10" height="2.5" fill="#c9a227" />
              </>
            )}
          </>
        )}
      </g>
      <circle cx="50" cy="50" r="47.5" fill="none" stroke={color === '#1a1208' || color === '#2d2010' || color === '#3a2810' ? '#c9a227' : color} strokeWidth="2" opacity="0.8" />
    </svg>
  );
}
