import React from 'react';

/**
 * BRANDSCOPE Official Logo Component
 * Exact design from the official brand identity specification:
 * - 4-blade dynamic aperture / scope motif
 * - Bold geometric "BRANDSCOPE" wordmark
 * - Subtitle "WHERE BRANDS GET DISCOVERED"
 */
export const Logo = ({
  size = 36,
  showWordmark = true,
  showTagline = false,
  light = false,
  className = ''
}) => {
  const textColor = light ? '#FFFFFF' : '#10243A';
  const taglineColor = light ? '#94A3B8' : '#64748B';

  // Harmonized blade colors from the official BRANDSCOPE aperture palette
  const topBladeColor = light ? '#60A5FA' : '#4778F5';      // Discovery Blue
  const rightBladeColor = light ? '#93C5FD' : '#2563EB';    // Royal Blue
  const bottomBladeColor = light ? '#FFFFFF' : '#10243A';   // Pure White on dark / Midnight Navy on light
  const leftBladeColor = light ? '#38BDF8' : '#0284C7';     // Electric Cyan

  return (
    <div
      className={`brandscope-logo-wrap ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.max(8, size * 0.28)}px`,
        textDecoration: 'none'
      }}
    >
      {/* 4-Blade Pinwheel / Aperture Symbol */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Blade 1 (Top) */}
        <path
          d="M 100,26 C 118,27 131,39 141,58 C 129,69 119,79 112,90 C 108,82 99,73 89,68 C 76,62 67,65 63,70 C 63,65 72,43 90,30 C 94,27 97,26 100,26 Z"
          fill={topBladeColor}
        />

        {/* Blade 2 (Right - 90 deg rotation) */}
        <g transform="rotate(90 100 100)">
          <path
            d="M 100,26 C 118,27 131,39 141,58 C 129,69 119,79 112,90 C 108,82 99,73 89,68 C 76,62 67,65 63,70 C 63,65 72,43 90,30 C 94,27 97,26 100,26 Z"
            fill={rightBladeColor}
          />
        </g>

        {/* Blade 3 (Bottom - 180 deg rotation) */}
        <g transform="rotate(180 100 100)">
          <path
            d="M 100,26 C 118,27 131,39 141,58 C 129,69 119,79 112,90 C 108,82 99,73 89,68 C 76,62 67,65 63,70 C 63,65 72,43 90,30 C 94,27 97,26 100,26 Z"
            fill={bottomBladeColor}
          />
        </g>

        {/* Blade 4 (Left - 270 deg rotation) */}
        <g transform="rotate(270 100 100)">
          <path
            d="M 100,26 C 118,27 131,39 141,58 C 129,69 119,79 112,90 C 108,82 99,73 89,68 C 76,62 67,65 63,70 C 63,65 72,43 90,30 C 94,27 97,26 100,26 Z"
            fill={leftBladeColor}
          />
        </g>

        {/* Center Aperture Focus Dot */}
        <circle
          cx="100"
          cy="100"
          r="10"
          fill={light ? '#38BDF8' : '#2563EB'}
          fillOpacity={light ? '0.9' : '0.8'}
        />
      </svg>

      {/* Wordmark and Tagline */}
      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span
            style={{
              fontFamily: "var(--font-heading, 'Outfit', sans-serif)",
              fontSize: `${Math.max(16, size * 0.54)}px`,
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: textColor,
              textTransform: 'uppercase'
            }}
          >
            BRANDSCOPE
          </span>

          {showTagline && (
            <span
              style={{
                fontFamily: "var(--font-body, 'Inter', sans-serif)",
                fontSize: `${Math.max(9, size * 0.22)}px`,
                fontWeight: 600,
                letterSpacing: '0.18em',
                color: taglineColor,
                textTransform: 'uppercase',
                marginTop: '3px'
              }}
            >
              WHERE BRANDS GET DISCOVERED
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
