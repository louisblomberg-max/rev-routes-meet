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

const FeatureSlide = ({ title, description, highlights, gradient, slideIndex, totalSlides }: Props) => {
  const { next, back, step } = useOnboarding();
  const Icon = SLIDE_ICONS[slideIndex];

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Background gradient overlay — placeholder for future imagery */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`} />

      {/* Progress dots */}
      <div className="px-6 pt-10 safe-top relative z-10">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                i <= slideIndex ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 animate-scale-up" key={slideIndex}>
          <Icon className="w-10 h-10 text-primary" />
        </div>

        <h2 className="text-3xl font-black text-foreground tracking-tight leading-tight mb-3 animate-fade-up" key={`t-${slideIndex}`}>
          {title}
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-[300px] mb-8 animate-fade-up" key={`d-${slideIndex}`}>
          {description}
        </p>

        <div className="space-y-3 w-full max-w-[280px] animate-fade-up" key={`h-${slideIndex}`}>
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-3 text-left">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-sm text-foreground/80">{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8 safe-bottom relative z-10 space-y-3">
        <Button onClick={next} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Next
          <ChevronRight className="w-5 h-5" />
        </Button>
        {step > 1 && (
          <button onClick={back} className="w-full text-sm text-muted-foreground py-2">
            Back
          </button>
        )}
      </div>
    </div>
  );
};

export default FeatureSlide;
