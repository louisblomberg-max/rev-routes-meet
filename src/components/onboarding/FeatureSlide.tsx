import { Calendar, MapPin, Wrench, Users, AlertTriangle } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';

const SLIDE_ICONS = [Calendar, MapPin, Wrench, Users, AlertTriangle];

interface Props {
  title: string;
  description: string;
  highlights: string[];
  gradient: string;
  slideIndex: number;
  totalSlides: number;
}

const FeatureSlide = ({ title, description, highlights, slideIndex, totalSlides }: Props) => {
  const { next, back, step } = useOnboarding();
  const Icon = SLIDE_ICONS[slideIndex];

  return (
    <div className="flex-1 flex flex-col relative" style={{ backgroundColor: '#ffffff' }}>
      {/* Progress dots */}
      <div className="px-6 pt-10 safe-top relative z-10">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) =>
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                i <= slideIndex ? 'bg-primary' : 'bg-black/10'
              }`}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
        <div className="w-20 h-20 rounded-2xl border flex items-center justify-center mb-8 animate-scale-up bg-white border-black/10" key={slideIndex}>
          <Icon className="w-10 h-10 text-primary" />
        </div>

        <h2 className="text-3xl font-black tracking-tight leading-tight mb-3 animate-fade-up text-black" key={`t-${slideIndex}`}>
          {title}
        </h2>
        <p className="text-base leading-relaxed max-w-[300px] mb-8 animate-fade-up text-black/70" key={`d-${slideIndex}`}>
          {description}
        </p>

        <div className="space-y-3 w-full max-w-[280px] animate-fade-up" key={`h-${slideIndex}`}>
          {highlights.map((h, i) =>
            <div key={i} className="flex items-center gap-3 text-left">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-sm text-black/70">{h}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8 safe-bottom relative z-10 space-y-3">
        <Button onClick={next} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          Next
          <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={back} className="w-full text-sm text-black/50 py-2">
          Back
        </button>
      </div>
    </div>
  );
};

export default FeatureSlide;
