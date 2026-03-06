import { useState, useEffect } from 'react';
import { AtSign, Check, X, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboarding } from '@/contexts/OnboardingContext';

const TAKEN_USERNAMES = ['admin', 'revnet', 'driver', 'test'];

const UsernameStep = () => {
  const { data, updateData, next, back } = useOnboarding();
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const username = data.username;

  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailable(null);
      setError('');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Only letters, numbers and underscores');
      setAvailable(null);
      return;
    }
    setError('');
    setChecking(true);
    const timer = setTimeout(() => {
      const isTaken = TAKEN_USERNAMES.includes(username.toLowerCase());
      setAvailable(!isTaken);
      setChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [username]);

  const canContinue = username.length >= 3 && available === true;

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= 1 ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-10 flex flex-col items-center">
        <h1 className="text-3xl font-black text-foreground tracking-tight text-center mb-2 animate-fade-up">
          Choose a Username
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-10 animate-fade-up">
          This will be your public name in the RevNet community.
        </p>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="username"
              className="pl-12 pr-12 rounded-2xl h-14 bg-card border-border/50 text-base font-medium"
              value={username}
              onChange={e => updateData({ username: e.target.value.replace(/\s/g, '') })}
              maxLength={20}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {checking && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
              {!checking && available === true && <Check className="w-5 h-5 text-green-500" />}
              {!checking && available === false && <X className="w-5 h-5 text-destructive" />}
            </div>
          </div>

          {error && <p className="text-xs text-destructive mt-2 pl-1">{error}</p>}
          {!checking && available === false && (
            <p className="text-xs text-destructive mt-2 pl-1">This username is taken</p>
          )}
          {!checking && available === true && (
            <p className="text-xs text-green-500 mt-2 pl-1">Username available!</p>
          )}
          {!error && available === null && username.length > 0 && username.length < 3 && (
            <p className="text-xs text-muted-foreground mt-2 pl-1">Minimum 3 characters</p>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8 safe-bottom space-y-3">
        <Button
          onClick={next}
          disabled={!canContinue}
          className="w-full h-14 text-base font-semibold rounded-full gap-2"
        >
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={back} className="w-full text-sm text-muted-foreground py-2">Back</button>
      </div>
    </div>
  );
};

export default UsernameStep;
