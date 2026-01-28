import { User } from 'lucide-react';

interface ProfileAvatarProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileAvatar = ({ onClick, size = 'sm' }: ProfileAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <button 
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors`}
    >
      <User className={`${iconSizes[size]} text-muted-foreground`} />
    </button>
  );
};

export default ProfileAvatar;
