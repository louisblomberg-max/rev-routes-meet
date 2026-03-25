import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import revnetLogo from '@/assets/revnet-logo-auth.png';
import BackButton from '@/components/BackButton';

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

const AuthSignup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const passwordStrength = () => {
    if (!password) return null;
    const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
    if (passed <= 1) return { label: 'Weak', color: 'bg-red-500', pct: 25 };
    if (passed === 2) return { label: 'Fair', color: 'bg-amber-500', pct: 50 };
    if (passed === 3) return { label: 'Good', color: 'bg-primary', pct: 75 };
    return { label: 'Strong', color: 'bg-primary', pct: 100 };
  };

  const handleCreateAccount = async () => {
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (!isValidEmail(email)) { toast.error('Please enter a valid email address'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(password)) { toast.error('Password must contain at least one uppercase letter'); return; }
    if (!/[0-9]/.test(password)) { toast.error('Password must contain at least one number'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { display_name: email.split('@')[0] } },
      });
      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('User already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          navigate('/auth/login');
          return;
        }
        toast.error(error.message || 'Could not create account. Please try again.');
        return;
      }
      if (data.user) {
        navigate('/onboarding', { replace: true });
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) toast.error('Google sign up failed. Please try again.');
  };

  const handleAppleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (error) toast.error('Apple sign up is coming soon.');
  };

  const str = passwordStrength();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8', color: '#171717' }}>
      <div className="flex-1 px-6 py-8 overflow-y-auto pb-40">
        {/* Back + Logo */}
        <div className="flex items-center gap-3 mb-4">
          <BackButton fallbackPath="/auth" />
          <img src={revnetLogo} alt="RevNet" className="h-10 w-auto" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-center mb-2 text-black">
          Create Your Account
        </h1>
        <p className="text-sm text-center mb-8 text-black/60">
          Almost there. Set up your login details.
        </p>

        {/* Form */}
        <div className="space-y-3">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <Input
              type="email"
              placeholder="Email address"
              className="pl-11 rounded-2xl h-13 bg-white text-black border-black/10 text-sm placeholder:text-black/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="pl-11 pr-11 rounded-2xl h-13 bg-white text-black border-black/10 text-sm placeholder:text-black/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {str && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${str.color} rounded-full transition-all duration-300`}
                    style={{ width: `${str.pct}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-black/50">{str.label}</span>
              </div>
              <div className="space-y-1 pl-1">
                {PASSWORD_RULES.map((rule, i) => {
                  const pass = rule.test(password);
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      {pass ? <Check className="w-3 h-3 text-primary" /> : <X className="w-3 h-3 text-black/30" />}
                      <span className={`text-[11px] ${pass ? 'text-primary' : 'text-black/40'}`}>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirm password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <Input
              type="password"
              placeholder="Confirm password"
              className="pl-11 rounded-2xl h-13 bg-white text-black border-black/10 text-sm placeholder:text-black/40"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {confirmPassword && password === confirmPassword && (
            <p className="text-xs text-primary pl-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> Passwords match
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-xs text-black/40">or</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        {/* Social sign-up buttons */}
        <div className="space-y-2.5">
          <Button
            className="w-full h-12 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 border border-black/10"
            onClick={handleAppleSignUp}
          >
            <svg className="w-5 h-5 mr-2.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Sign Up with Apple
          </Button>
          <Button
            className="w-full h-12 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 border border-black/10"
            onClick={handleGoogleSignUp}
          >
            <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign Up with Google
          </Button>
        </div>

        <p className="text-[11px] text-black/40 text-center mt-6">
          By creating an account you agree to our{' '}
          <button className="underline text-black/50">Terms</button> and{' '}
          <button className="underline text-black/50">Privacy Policy</button>.
        </p>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button
          onClick={handleCreateAccount}
          disabled={isSubmitting}
          className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-black text-white hover:bg-black/90"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Creating...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
        <p className="text-sm text-black/50 text-center mt-3">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-black font-semibold underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthSignup;
