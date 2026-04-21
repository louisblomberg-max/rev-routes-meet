import revnetLogo from '@/assets/revnet-logo-clean.png';

interface TopAppHeaderProps {
  variant?: 'solid' | 'floating';
}

const TopAppHeader = ({ variant = 'solid' }: TopAppHeaderProps) => {
  const isFloating = variant === 'floating';

  return (
    <header
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 10px)',
        paddingBottom: 10,
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
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderBottom: '1px solid #F0F0F0',
            }
          : {
              position: 'relative',
              background: '#FFFFFF',
              borderBottom: '1px solid #F0F0F0',
            }),
      }}
    >
      <img
        src={revnetLogo}
        alt="RevNet"
        style={{ height: 28, width: 'auto' }}
      />
    </header>
  );
};

export default TopAppHeader;
