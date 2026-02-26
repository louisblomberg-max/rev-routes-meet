import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Phone, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import revnetLogo from '@/assets/revnet-logo-full.jpg';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

const AuthSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMethod = searchParams.get('method') === 'phone' ? 'phone' : 'email';
  const { register, registerPhone, isLoading } = useAuth();

  const [method, setMethod] = useState<'email' | 'phone'>(initialMethod);
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (method === 'email') {
      if (!form.displayName.trim()) errs.displayName = 'Name is required';
      if (!form.email.trim()) errs.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
      if (!form.password) errs.password = 'Password is required';
      else if (!PASSWORD_RULES.every(r => r.test(form.password))) errs.password = 'Password does not meet requirements';
      if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    } else {
      if (!form.phone.trim()) errs.phone = 'Phone number is required';
      else if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid phone number';
    }
    if (!agreed) errs.agreed = 'You must agree to continue';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (method === 'email') {
        await register(form.email, form.password, form.displayName);
        toast.success('Account created! Verify your email.');
        navigate('/auth/verify?dest=' + encodeURIComponent(form.email));
      } else {
        await registerPhone(form.phone);
        toast.success('Code sent to your phone');
        navigate('/auth/verify?dest=' + encodeURIComponent(form.phone));
      }
    } catch {
      toast.error('Registration failed');
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 safe-top">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <img src={revnetLogo} alt="RevNet" className="h-8 w-auto" />
        </div>

        <h1 className="heading-lg text-foreground mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">Join the RevNet community</p>

        {/* Toggle */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          <button
            onClick={() => setMethod('email')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${method === 'email' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            <Mail className="w-4 h-4 inline mr-1.5" />Email
          </button>
          <button
            onClick={() => setMethod('phone')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${method === 'phone' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            <Phone className="w-4 h-4 inline mr-1.5" />Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          {method === 'email' ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Display Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Your name" className="pl-10 rounded-xl h-11" value={form.displayName} onChange={e => update('displayName', e.target.value)} />
                </div>
                {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="you@example.com" className="pl-10 rounded-xl h-11" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create password"
                    className="pl-10 pr-10 rounded-xl h-11"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password rules */}
                {form.password && (
                  <div className="space-y-1 mt-2">
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
                )}
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="Confirm password" className="pl-10 rounded-xl h-11" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="+44 7700 000000" className="pl-10 rounded-xl h-11" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
          )}

          {/* Agreement */}
          <div className="flex items-start gap-2.5 pt-1">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(v) => { setAgreed(v as boolean); setErrors(prev => ({ ...prev, agreed: '' })); }}
              className="mt-0.5"
            />
            <label htmlFor="agree" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I am 16+ and agree to the <button className="text-primary underline">Terms</button> & <button className="text-primary underline">Privacy Policy</button>
            </label>
          </div>
          {errors.agreed && <p className="text-xs text-destructive">{errors.agreed}</p>}

          <div className="pt-2">
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
              {isLoading ? 'Creating...' : method === 'email' ? 'Create Account' : 'Send Code'}
            </Button>
          </div>
        </form>

        <p className="text-sm text-muted-foreground text-center pt-6 pb-4">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default AuthSignup;
