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
              background: '#FAFAFA',
              borderBottom: '2px solid #E5E5E5',
            }
          : {
              position: 'relative',
              background: '#FAFAFA',
              borderBottom: '2px solid #E5E5E5',
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
