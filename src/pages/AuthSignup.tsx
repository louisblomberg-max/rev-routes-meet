import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Phone, User, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

const AuthSignup = () => {
  const navigate = useNavigate();
  const { register, registerPhone, isLoading } = useAuth();

  const [method, setMethod] = useState<'email' | 'phone'>('email');
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
        <div className="flex items-center mb-8">
          <BackButton fallbackPath="/auth" />
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-1">Create Account</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Join the RevNet community</p>

        {/* Toggle */}
        <div className="flex bg-muted rounded-2xl p-1 mb-6">
          <button
            onClick={() => setMethod('email')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${method === 'email' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            <Mail className="w-4 h-4 inline mr-1.5" />Email
          </button>
          <button
            onClick={() => setMethod('phone')}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${method === 'phone' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
          >
            <Phone className="w-4 h-4 inline mr-1.5" />Phone
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          {method === 'email' ? (
            <>
              <div className="space-y-1.5">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Display Name" className="pl-11 rounded-2xl h-12 bg-muted border-0 text-sm" value={form.displayName} onChange={e => update('displayName', e.target.value)} />
                </div>
                {errors.displayName && <p className="text-xs text-destructive pl-1">{errors.displayName}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="Email address" className="pl-11 rounded-2xl h-12 bg-muted border-0 text-sm" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                {errors.email && <p className="text-xs text-destructive pl-1">{errors.email}</p>}
              </div>

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
                {form.password && (
                  <div className="space-y-1 mt-2 pl-1">
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
                {errors.password && <p className="text-xs text-destructive pl-1">{errors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="Confirm password" className="pl-11 rounded-2xl h-12 bg-muted border-0 text-sm" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive pl-1">{errors.confirmPassword}</p>}
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="tel" placeholder="+44 7700 000000" className="pl-11 rounded-2xl h-12 bg-muted border-0 text-sm" value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              {errors.phone && <p className="text-xs text-destructive pl-1">{errors.phone}</p>}
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
              I am 16+ and agree to the <button type="button" className="text-primary underline">Terms</button> & <button type="button" className="text-primary underline">Privacy Policy</button>
            </label>
          </div>
          {errors.agreed && <p className="text-xs text-destructive pl-1">{errors.agreed}</p>}
        </form>

        {/* Bottom */}
        <div className="pt-4 space-y-3">
          <Button onClick={handleSubmit as any} className="w-full h-14 text-base font-semibold rounded-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : method === 'email' ? 'Create Account' : 'Send Code'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSignup;
