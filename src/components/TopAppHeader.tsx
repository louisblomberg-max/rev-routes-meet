interface TopAppHeaderProps {
  variant?: 'solid' | 'floating';
}

const TopAppHeader = ({ variant = 'solid' }: TopAppHeaderProps) => {
  const isFloating = variant === 'floating';

  return (
    <header
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 10px)',
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...(isFloating
          ? {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(232, 228, 220, 0.6)',
            }
          : {
              position: 'relative',
              background: '#FFFFFF',
              borderBottom: '1px solid #E8E4DC',
            }),
      }}
    >
      <div style={{
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: '-0.4px',
        lineHeight: 1,
      }}>
        <span style={{ color: '#CC2B2B' }}>REV</span>
        <span style={{ color: '#111111' }}>NET</span>
      </div>
    </header>
  );
};

export default TopAppHeader;
