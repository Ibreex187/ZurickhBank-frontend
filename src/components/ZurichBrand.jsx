import PropTypes from 'prop-types';

export const ZurichLogoMark = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 164 188"
    width="28"
    height="32"
    role="img"
    aria-label="Zurich Bank ZK logo"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* 3D Drop Shadow for depth */}
      <filter id="premium-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
      </filter>

      {/* Champagne Gold Metallic Gradient for the Z (Exotic Premium) */}
      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FDE047" />    {/* Bright Gold */}
        <stop offset="25%" stopColor="#F59E0B" />   {/* Rich Amber Gold */}
        <stop offset="60%" stopColor="#D97706" />   {/* Deep Gold */}
        <stop offset="100%" stopColor="#B45309" />  {/* Burnished Bronze */}
      </linearGradient>

      {/* Bright Platinum/Steel Metallic Gradient for the K */}
      <linearGradient id="platinum-grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#CBD5E1" />    {/* Silver */}
        <stop offset="50%" stopColor="#F8FAFC" />   {/* Bright Platinum */}
        <stop offset="100%" stopColor="#FFFFFF" />   {/* Pure White Specular */}
      </linearGradient>

      {/* Electric Blue Edge Highlight */}
      <linearGradient id="accent-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>

      {/* Inner specular highlight to simulate 3D bevel */}
      <linearGradient id="bevel-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
        <stop offset="15%" stopColor="rgba(255,255,255,0.2)" />
        <stop offset="85%" stopColor="rgba(0,0,0,0.15)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
      </linearGradient>
    </defs>

    {/* The 'Z' element (Background/Base Layer) styled as Champagne Gold */}
    <g filter="url(#premium-shadow)">
      {/* Main Z body */}
      <path
        d="M20 30 L130 30 L60 158 L144 158"
        fill="none"
        stroke="url(#gold-grad)"
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 3D Bevel overlay for Z */}
      <path
        d="M20 30 L130 30 L60 158 L144 158"
        fill="none"
        stroke="url(#bevel-highlight)"
        strokeWidth="38"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ mixBlendMode: 'overlay' }}
      />
      {/* Electric Blue accent wireframe running through the Z */}
      <path
        d="M30 30 L120 30 L60 158 L134 158"
        fill="none"
        stroke="url(#accent-highlight)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* The 'K' element (Foreground Layer) styled as Platinum overlapping the Z */}
    <g filter="url(#premium-shadow)">
      {/* K Vertical Stem */}
      <line x1="72" y1="40" x2="72" y2="148" stroke="url(#platinum-grad)" strokeWidth="32" strokeLinecap="round" />
      {/* K Bevel for Stem */}
      <line x1="72" y1="40" x2="72" y2="148" stroke="url(#bevel-highlight)" strokeWidth="32" strokeLinecap="round" style={{ mixBlendMode: 'overlay' }} />

      {/* K Top Arm */}
      <path d="M72 90 L130 40" fill="none" stroke="url(#platinum-grad)" strokeWidth="28" strokeLinecap="round" />
      <path d="M72 90 L130 40" fill="none" stroke="url(#bevel-highlight)" strokeWidth="28" strokeLinecap="round" style={{ mixBlendMode: 'overlay' }} />

      {/* K Bottom Arm (Electric Blue Accent to tie it together) */}
      <path d="M72 90 L138 148" fill="none" stroke="url(#accent-highlight)" strokeWidth="28" strokeLinecap="round" />
      <path d="M72 90 L138 148" fill="none" stroke="url(#bevel-highlight)" strokeWidth="28" strokeLinecap="round" style={{ mixBlendMode: 'overlay' }} />
    </g>
  </svg>
);

ZurichLogoMark.propTypes = {
  className: PropTypes.string,
};

const ZurichBrand = ({ className = '', showText = true, text = 'ZURICH BANK' }) => (
  <span className={`zurich-brand ${className}`.trim()} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
    <ZurichLogoMark className="logo-mark" />
    {showText && (
      <span className="brand-text" style={{
        fontFamily: '"Cinzel", "Georgia", serif',
        fontSize: '1.25rem',
        fontWeight: '600',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        lineHeight: '1.1',
        color: 'var(--white, inherit)'
      }}>
        {text}
      </span>
    )}
  </span>
);

ZurichBrand.propTypes = {
  className: PropTypes.string,
  showText: PropTypes.bool,
  text: PropTypes.string,
};

export default ZurichBrand;
