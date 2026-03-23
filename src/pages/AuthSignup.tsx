import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Check, X, Loader2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'AE', name: 'United Arab Emirates' },
];

const AuthSignup = () => {
  const navigate = useNavigate();
  const { register, isLoading, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && user.onboardingComplete) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'GB',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const passwordStrength = () => {
    const passed = PASSWORD_RULES.filter(r => r.test(form.password)).length;
    if (passed <= 1) return { label: 'Weak', color: 'bg-destructive', pct: 25 };
    if (passed === 2) return { label: 'Fair', color: 'bg-amber-500', pct: 50 };
    if (passed === 3) return { label: 'Good', color: 'bg-services', pct: 75 };
    return { label: 'Strong', color: 'bg-services', pct: 100 };
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim()) errs.displayName = 'First name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (!PASSWORD_RULES.every(r => r.test(form.password))) errs.password = 'Password does not meet requirements';
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!agreed) errs.agreed = 'You must agree to continue';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register(form.email, form.password, form.displayName);
      toast.success('Account created!');
      navigate('/onboarding', { replace: true });
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error('Could not create account. Please try again.');
      }
    }
  };

  const strength = form.password ? passwordStrength() : null;

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 safe-top overflow-y-auto pb-32">
        <div className="flex items-center mb-6">
          <BackButton fallbackPath="/auth" />
        </div>

        {/* Progress: step 1 of 4 */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-6">Step 1 of 4 — The basics</p>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          {/* First name */}
          <div className="space-y-1.5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="First name" className="pl-11 rounded-2xl h-12 bg-muted border-0 text-sm" value={form.displayName} onChange={e => update('displayName', e.target.value)} />
            </div>
            {errors.displayName && <p className="text-xs text-destructive pl-1">{errors.displayName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Email address" className="pl-11 rounded-2xl h-12 bg-muted border-0 text-sm" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            {errors.email && <p className="text-xs text-destructive pl-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="pl-11 pr-11 rounded-2xl h-12 bg-muted border-0 text-sm"
                value={form.password}
                onChange={e => update('password', e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {strength && (
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: `${strength.pct}%` }} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{strength.label}</span>
                </div>
                <div className="space-y-1 pl-1">
                  {PASSWORD_RULES.map((rule, i) => {
                    const pass = rule.test(form.password);
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        {pass ? <Check className="w-3 h-3 text-services" /> : <X className="w-3 h-3 text-muted-foreground" />}
                        <span className={`text-[11px] ${pass ? 'text-services' : 'text-muted-foreground'}`}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {errors.password && <p className="text-xs text-destructive pl-1">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder="Confirm password" className="pl-11 rounded-2xl h-12 bg-muted border-0 text-sm" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
            </div>
            {form.confirmPassword && form.password === form.confirmPassword && (
              <p className="text-xs text-services pl-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
            )}
            {errors.confirmPassword && <p className="text-xs text-destructive pl-1">{errors.confirmPassword}</p>}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <Select value={form.country} onValueChange={v => update('country', v)}>
              <SelectTrigger className="rounded-2xl h-12 bg-muted border-0 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Country" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-2.5 pt-1">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(v) => { setAgreed(v as boolean); setErrors(prev => ({ ...prev, agreed: '' })); }}
              className="mt-0.5"
            />
            <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I am 16+ and agree to the <button type="button" className="text-primary underline">Terms</button> & <button type="button" className="text-primary underline">Privacy Policy</button>
            </label>
          </div>
          {errors.agreed && <p className="text-xs text-destructive pl-1">{errors.agreed}</p>}
        </form>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button onClick={handleSubmit as any} className="w-full h-14 text-base font-semibold rounded-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Creating...</span>
          ) : 'Continue'}
        </Button>
        <p className="text-sm text-muted-foreground text-center mt-3">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default AuthSignup;
