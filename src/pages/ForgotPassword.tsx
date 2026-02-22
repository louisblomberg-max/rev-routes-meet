import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import revnetLogo from '@/assets/revnet-logo-full.jpg';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    await resetPassword(email);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground">We sent a reset link to <strong className="text-foreground">{email}</strong></p>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/login')}>Back to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-4 py-3 safe-top">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <div className="flex justify-center mb-10">
          <img src={revnetLogo} alt="RevNet" className="h-12 w-auto" />
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">Reset password</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">Enter your email and we'll send you a reset link</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-8">
          Remember your password?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
