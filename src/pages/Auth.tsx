import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'landing' | 'signin' | 'signup';

const LOGO_URL = 'https://zwfbncnephciqywnmdns.supabase.co/storage/v1/object/public/logo/logo.png';

const FEATURE_PILLS = ['Map', 'Events', 'Routes', 'Clubs', 'Convoy', 'SOS'];

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [mode, setMode] = useState<AuthMode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !password) return;
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(email, password, displayName.trim());
      toast.success('Account created! Check your email to verify.');
    } catch (err: any) {
      toast.error(err.message || 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed');
    }
  };

  const handleApple = async () => {
    try {
      await signInWithApple();
    } catch (err: any) {
      toast.error(err.message || 'Apple sign in failed');
    }
  };

  if (mode === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-4" style={{ backgroundColor: '#f3f3e8' }}>
        <div className="w-full max-w-sm flex flex-col items-center gap-3">
          <div className="flex flex-col items-center">
            <img src={LOGO_URL} alt="RevNet logo" className="w-64 h-64 rounded-2xl object-contain" />
            <p className="text-muted-foreground text-sm">Everything for drivers and riders</p>
          </div>


          <div className="w-full flex flex-col gap-3 mt-1">
            <Button onClick={() => setMode('signup')} className="w-full h-12 rounded-2xl text-sm font-semibold">
              Create Account
            </Button>
            <Button onClick={() => setMode('signin')} variant="outline" className="w-full h-12 rounded-2xl text-sm font-semibold">
              Sign In
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-[#f3f3e8] px-3 text-muted-foreground">or</span></div>
            </div>

            <Button onClick={handleGoogle} variant="outline" className="w-full h-12 rounded-2xl text-sm font-semibold gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>
            <Button onClick={handleApple} variant="outline" className="w-full h-12 rounded-2xl text-sm font-semibold gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.24 16.7 4.89 10.97 8.83 10.7c1.23.07 2.08.72 2.8.75.99-.2 1.93-.79 2.99-.71 1.31.1 2.29.63 2.93 1.6-2.68 1.6-2.04 5.12.5 6.1-.6 1.57-1.38 3.1-3 3.84zM12.03 10.64C11.88 8.55 13.57 6.83 15.55 6.68c.29 2.35-2.14 4.12-3.52 3.96z"/></svg>
              Continue with Apple
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            You must be 16 or over to use RevNet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="w-full max-w-sm">
        <button
          onClick={() => setMode('landing')}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <img src={LOGO_URL} alt="RevNet" className="w-10 h-10 rounded-xl object-contain" />
            <h2 className="text-lg font-bold text-foreground">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>
          </div>

          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 rounded-xl mt-2">
              {isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleGoogle} variant="outline" className="w-full h-11 rounded-xl text-sm gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {mode === 'signup' ? 'Sign Up with Google' : 'Continue with Google'}
            </Button>
            <Button onClick={handleApple} variant="outline" className="w-full h-11 rounded-xl text-sm gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.24 16.7 4.89 10.97 8.83 10.7c1.23.07 2.08.72 2.8.75.99-.2 1.93-.79 2.99-.71 1.31.1 2.29.63 2.93 1.6-2.68 1.6-2.04 5.12.5 6.1-.6 1.57-1.38 3.1-3 3.84zM12.03 10.64C11.88 8.55 13.57 6.83 15.55 6.68c.29 2.35-2.14 4.12-3.52 3.96z"/></svg>
              {mode === 'signup' ? 'Sign Up with Apple' : 'Continue with Apple'}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-5">
            {mode === 'signin' ? (
              <>Don&apos;t have an account?{' '}<button onClick={() => setMode('signup')} className="text-primary font-semibold hover:underline">Create Account</button></>
            ) : (
              <>Already have an account?{' '}<button onClick={() => setMode('signin')} className="text-primary font-semibold hover:underline">Sign In</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
