import { useState, useEffect } from 'react';
import { AtSign, Check, X, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboarding, TOTAL_ONBOARDING_STEPS } from '@/contexts/OnboardingContext';
import { supabase } from '@/integrations/supabase/client';

const UsernameStep = () => {
  const { data, updateData, next, back } = useOnboarding();
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  const username = data.username;

  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailable(null);
      setError(username && username.length > 0 && username.length < 3 ? '' : '');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Only letters, numbers and underscores');
      setAvailable(null);
      return;
    }
    setError('');
    setChecking(true);
    const timer = setTimeout(async () => {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .maybeSingle();
      setAvailable(!existing);
      setChecking(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const canContinue = username.length >= 3 && available === true;

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) =>
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= 1 ? 'bg-primary' : 'bg-black/10'}`} />
          )}
        </div>
      </div>

      <div className="flex-1 px-6 py-10 flex flex-col items-center">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2 animate-fade-up text-black">
          Choose a Username
        </h1>
        <p className="text-sm text-center mb-10 animate-fade-up text-black/60">
          This will be your public name in the RevNet community.
        </p>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="relative">
            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <Input
              placeholder="username"
              className="pl-12 pr-12 rounded-2xl h-14 bg-white text-black border-black/10 text-base font-medium placeholder:text-black/40"
              value={username}
              onChange={(e) => updateData({ username: e.target.value.replace(/\s/g, '') })}
              maxLength={20}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {checking && <Loader2 className="w-5 h-5 text-black/40 animate-spin" />}
              {!checking && available === true && <Check className="w-5 h-5 text-green-600" />}
              {!checking && available === false && <X className="w-5 h-5 text-red-500" />}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mt-2 pl-1">{error}</p>}
          {!checking && available === false &&
            <p className="text-xs text-red-500 mt-2 pl-1">This username is already taken</p>
          }
          {!checking && available === true &&
            <p className="text-xs text-green-600 mt-2 pl-1">Username available!</p>
          }
          {!error && available === null && username.length > 0 && username.length < 3 &&
            <p className="text-xs text-black/40 mt-2 pl-1">Minimum 3 characters</p>
          }
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-8 safe-bottom space-y-3">
        <Button
          onClick={next}
          disabled={!canContinue}
          className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={back} className="w-full text-sm text-black/50 py-2">Back</button>
      </div>
    </div>
  );
};

export default UsernameStep;
