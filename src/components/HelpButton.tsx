import { AlertCircle } from 'lucide-react';

interface HelpButtonProps {
  onClick: () => void;
}

const HelpButton = ({ onClick }: HelpButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 active:scale-95"
      aria-label="Get help"
    >
      <AlertCircle className="w-5 h-5 text-white" />
    </button>
  );
};

export default HelpButton;
