import { AlertCircle } from 'lucide-react';

interface HelpButtonProps {
  onClick: () => void;
}

const HelpButton = ({ onClick }: HelpButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-full bg-red-500 shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      aria-label="Get help"
    >
      <AlertCircle className="w-6 h-6 text-white" />
    </button>
  );
};

export default HelpButton;
