import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

const CODE_LENGTH = 6;

const AuthVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dest = searchParams.get('dest') || '';
  const { verifyCode, requestVerificationCode, isLoading } = useAuth();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(30);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    const newCode = [...code];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    const next = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[next]?.focus();
  };

  const handleVerify = async () => {
    const full = code.join('');
    if (full.length < CODE_LENGTH) {
      toast.error('Enter the full 6-digit code');
      return;
    }
    const valid = await verifyCode(full);
    if (valid) {
      toast.success('Verified!');
      navigate('/choose-plan');
    } else {
      toast.error('Invalid code. Try again.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    await requestVerificationCode(dest);
    setCountdown(30);
    toast.success('Code resent');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 safe-top">
        {/* Header */}
        <div className="flex items-center mb-8">
          <BackButton fallbackPath="/auth/signup" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-7xl mb-6">🔐</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Verify your account</h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-[300px]">
            Enter the 6-digit code sent to{' '}
            <span className="font-semibold text-foreground">{dest || 'your email/phone'}</span>
          </p>

          {/* Code inputs */}
          <div className="flex gap-2.5 mb-8" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-muted border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            ))}
          </div>

          <Button onClick={handleVerify} className="w-full max-w-xs h-14 text-base font-semibold rounded-full mb-4" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>

          {countdown > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in <span className="font-semibold text-foreground">{countdown}s</span>
            </p>
          ) : (
            <button onClick={handleResend} className="text-sm text-primary font-semibold">
              Resend code
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthVerify;
