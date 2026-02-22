import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Compass, Users, ShoppingBag, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import revnetLogo from '@/assets/revnet-logo-full.jpg';

const slides = [
  {
    icon: Compass,
    title: 'Discover',
    description: 'Find events, routes, and services near you — all on a live map.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Join clubs, chat with enthusiasts, and share your passion.',
    color: 'text-clubs',
    bg: 'bg-clubs/10',
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    description: 'Buy, sell, and trade parts, vehicles, and accessories.',
    color: 'text-services',
    bg: 'bg-services/10',
  },
  {
    icon: Shield,
    title: 'Stay Safe',
    description: 'Live location sharing, breakdown help, and emergency alerts.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const isLast = current === slides.length - 1;
  const slide = slides[current];
  const Icon = slide.icon;

  const next = () => {
    if (isLast) {
      navigate('/register');
    } else {
      setCurrent(c => c + 1);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex justify-center pt-16 safe-top">
        <img src={revnetLogo} alt="RevNet" className="h-10 w-auto" />
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className={`w-24 h-24 rounded-2xl ${slide.bg} flex items-center justify-center mb-8 animate-scale-up`} key={current}>
          <Icon className={`w-12 h-12 ${slide.color}`} />
        </div>
        <h2 className="heading-display text-foreground mb-3 animate-fade-up" key={`t-${current}`}>
          {slide.title}
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[280px] animate-fade-up" key={`d-${current}`}>
          {slide.description}
        </p>
      </div>

      {/* Dots + buttons */}
      <div className="px-6 pb-12 safe-bottom space-y-6">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <Button onClick={next} className="w-full h-12 text-base font-semibold gap-2">
          {isLast ? 'Get Started' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>

        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">Already have an account?</span>
          <button onClick={() => navigate('/login')} className="text-sm text-primary font-semibold">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
