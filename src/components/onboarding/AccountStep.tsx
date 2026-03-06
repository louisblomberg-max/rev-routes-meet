import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { toast } from 'sonner';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

interface Props {
  onComplete: () => Promise<void>;
}

const AccountStep = ({ onComplete }: Props) => {
  const { data, updateData, back } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = () => {
    if (!data.password) return null;
    const passed = PASSWORD_RULES.filter(r => r.test(data.password)).length;
    if (passed <= 1) return { label: 'Weak', color: 'bg-destructive', pct: 25 };
    if (passed === 2) return { label: 'Fair', color: 'bg-amber-500', pct: 50 };
    if (passed === 3) return { label: 'Good', color: 'bg-primary', pct: 75 };
    return { label: 'Strong', color: 'bg-primary', pct: 100 };
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!data.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = 'Enter a valid email';
    if (!data.password) errs.password = 'Password is required';
    else if (!PASSWORD_RULES.every(r => r.test(data.password))) errs.password = 'Password does not meet requirements';
    if (data.password !== confirmPassword) errs.confirm = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onComplete();
      toast.success('Account created!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const str = strength();

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full bg-primary`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto pb-40">
        <h1 className="text-3xl font-black text-foreground tracking-tight text-center mb-2 animate-fade-up">
          Create Your RevNet Account
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8 animate-fade-up">
          Almost there. Set up your login details.
        </p>

        {/* Social buttons */}
        <div className="space-y-2.5 mb-6 animate-fade-up">
          <Button
            variant="outline"
            className="w-full h-12 rounded-full text-sm font-medium border-border/50 text-foreground hover:bg-accent"
            onClick={handleSubmit}
          >
            <svg className="w-5 h-5 mr-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continue with Apple
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-full text-sm font-medium border-border/50 text-foreground hover:bg-accent"
            onClick={handleSubmit}
          >
            <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Email */}
        <div className="space-y-3 animate-fade-up">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              className="pl-11 rounded-2xl h-13 bg-card border-border/50 text-sm"
              value={data.email}
              onChange={e => { updateData({ email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })); }}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive pl-1">{errors.email}</p>}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pl-11 pr-11 rounded-2xl h-13 bg-card border-border/50 text-sm"
              value={data.password}
              onChange={e => { updateData({ password: e.target.value }); setErrors(prev => ({ ...prev, password: '' })); }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {str && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${str.color} rounded-full transition-all duration-300`} style={{ width: `${str.pct}%` }} />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{str.label}</span>
              </div>
              <div className="space-y-1 pl-1">
                {PASSWORD_RULES.map((rule, i) => {
                  const pass = rule.test(data.password);
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      {pass ? <Check className="w-3 h-3 text-primary" /> : <X className="w-3 h-3 text-muted-foreground" />}
                      <span className={`text-[11px] ${pass ? 'text-primary' : 'text-muted-foreground'}`}>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {errors.password && <p className="text-xs text-destructive pl-1">{errors.password}</p>}

          {/* Confirm */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Confirm password"
              className="pl-11 rounded-2xl h-13 bg-card border-border/50 text-sm"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirm: '' })); }}
            />
          </div>
          {confirmPassword && data.password === confirmPassword && (
            <p className="text-xs text-primary pl-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
          )}
          {errors.confirm && <p className="text-xs text-destructive pl-1">{errors.confirm}</p>}
        </div>

        <p className="text-[11px] text-muted-foreground/50 text-center mt-6">
          By creating an account you agree to our <button className="underline text-muted-foreground/70">Terms</button> and <button className="underline text-muted-foreground/70">Privacy Policy</button>.
        </p>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 text-base font-semibold rounded-full gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Creating...</span>
          ) : 'Create Account'}
        </Button>
        <button onClick={back} className="w-full text-sm text-muted-foreground mt-2 py-2">Back</button>
      </div>
    </div>
  );
};

export default AccountStep;
