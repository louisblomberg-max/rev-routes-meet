import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import revnetLogo from '@/assets/revnet-logo-new.png';

const AuthForgot = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + '/auth/reset',
      });
      if (resetError) {
        setError('Could not send reset link. Please try again.');
        return;
      }
      setSent(true);
    } catch {
      setError('Could not send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-services/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-services" />
        </div>
        <h2 className="heading-lg text-foreground mb-2">Check your email</h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-[280px]">
          We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>
        </p>
        <Button onClick={() => navigate('/auth/login')} className="w-full max-w-xs h-12 text-base font-semibold">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 safe-top">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <img src={revnetLogo} alt="RevNet" className="h-8 w-auto" />
        </div>

        <h1 className="heading-lg text-foreground mb-1">Forgot password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your email and we'll send a reset link</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-10 rounded-xl h-11"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthForgot;
