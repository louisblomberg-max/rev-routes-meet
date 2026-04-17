import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopAppHeaderProps {
  variant?: 'solid' | 'floating';
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
}

const TopAppHeader = ({ variant = 'solid', onSearchClick, onNotificationsClick }: TopAppHeaderProps) => {
  const navigate = useNavigate();

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
        justifyContent: 'space-between',
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
      <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', lineHeight: 1 }}>
        <span style={{ color: '#CC2B2B' }}>REV</span>
        <span style={{ color: '#111111' }}>NET</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          aria-label="Search"
          onClick={onSearchClick ?? (() => navigate('/search'))}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Search size={22} strokeWidth={2} color="#4A443D" />
        </button>
        <button
          aria-label="Notifications"
          onClick={onNotificationsClick ?? (() => navigate('/notifications'))}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Bell size={22} strokeWidth={2} color="#4A443D" />
        </button>
      </div>
    </header>
  );
};

export default TopAppHeader;
