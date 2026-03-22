import { ChevronRight, Check, AlertCircle, Smartphone, Monitor, Shield, Apple, Mail } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('Free');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('display_name, username, avatar_url').eq('id', user.id).single();
      setDisplayName(profile?.display_name || '');
      setUsername(profile?.username || '');
      setEmail(authUser?.email || '');
      setPhone(authUser?.phone || '');
      setPlan(user.membershipPlan === 'pro' ? 'Pro Driver' : user.membershipPlan === 'club' ? 'Club / Business' : 'Free');
      setIsLoading(false);
    })();
  }, [user?.id]);

  const handleChangePassword = async () => {
    const newPassword = prompt('Enter new password (min 8 chars):');
    if (!newPassword || newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else toast.success('Password updated successfully');
  };

  const handleDownloadData = () => toast.info('Download my data coming soon');
  const handleDeactivate = async () => {
    await supabase.auth.updateUser({ data: { deactivated: true } });
    toast.success('Account deactivated. Log in again to reactivate.');
  };
  const handleDelete = () => {
    if (deleteConfirmText === 'DELETE') {
      toast.info('Account deletion requires a server-side call. Coming soon.');
      setDeleteConfirmText('');
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen pb-8">
        <div className="px-4 pt-4 pb-2 safe-top">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
            <div><h1 className="text-lg font-bold text-foreground">Account</h1></div>
          </div>
        </div>
        <div className="px-4 pt-3 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-card rounded-xl border border-border/30 p-4 space-y-3"><Skeleton className="h-5 w-32" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen pb-8">
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
          <div><h1 className="text-lg font-bold text-foreground">Account</h1><p className="text-xs text-muted-foreground">Manage your personal details and account access</p></div>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-4">
        {/* Account Details */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30"><h2 className="text-sm font-semibold text-foreground">Account Details</h2></div>
          <div className="divide-y divide-border/30">
            <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-foreground">Name</span><span className="text-sm text-muted-foreground">{displayName}</span></div>
            <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-foreground">Username</span><span className="text-sm text-muted-foreground">@{username}</span></div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-foreground">Email</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{email}</span>
                <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded"><Check className="w-3 h-3" />Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3"><span className="text-sm text-foreground">Phone</span><span className="text-sm text-muted-foreground">{phone || 'Not set'}</span></div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30"><h2 className="text-sm font-semibold text-foreground">Security</h2></div>
          <div className="divide-y divide-border/30">
            <button onClick={handleChangePassword} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Change password</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </button>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div><span className="text-sm text-foreground">Two-factor authentication</span><p className="text-xs text-muted-foreground mt-0.5">Adds an extra layer of security</p></div>
                <Switch checked={false} onCheckedChange={() => toast.info('2FA coming soon')} />
              </div>
            </div>
            <button onClick={() => toast.info('Active sessions coming soon')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Active sessions</span>
              <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-muted-foreground" /><ChevronRight className="w-4 h-4 text-muted-foreground/50" /></div>
            </button>
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30"><h2 className="text-sm font-semibold text-foreground">Connected Accounts</h2></div>
          <div className="divide-y divide-border/30">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center"><Apple className="w-4 h-4 text-background" /></div><span className="text-sm text-foreground">Apple</span></div>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.info('Coming soon')}>Connect</Button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><Mail className="w-4 h-4 text-foreground" /></div><span className="text-sm text-foreground">Google</span></div>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.info('Coming soon')}>Connect</Button>
            </div>
          </div>
        </div>

        {/* Plan */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30"><h2 className="text-sm font-semibold text-foreground">Plan & Billing</h2></div>
          <button onClick={() => navigate('/settings/billing')} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
            <span className="text-sm text-foreground">Current plan</span>
            <div className="flex items-center gap-2"><span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-medium">{plan}</span><ChevronRight className="w-4 h-4 text-muted-foreground/50" /></div>
          </button>
        </div>

        {/* Data & Account Control */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30"><h2 className="text-sm font-semibold text-foreground">Data & Account</h2></div>
          <div className="divide-y divide-border/30">
            <button onClick={handleDownloadData} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <div><span className="text-sm text-foreground">Download my data</span><p className="text-xs text-muted-foreground mt-0.5">Request a copy of your account data</p></div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"><span className="text-sm text-muted-foreground">Deactivate account</span><ChevronRight className="w-4 h-4 text-muted-foreground/50" /></button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Deactivate your account?</AlertDialogTitle><AlertDialogDescription>Your profile will be hidden. You can reactivate anytime by logging back in.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-destructive/5 transition-colors"><span className="text-sm text-destructive">Delete account</span><ChevronRight className="w-4 h-4 text-muted-foreground/50" /></button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>This action cannot be undone. All your data will be permanently removed.</p>
                    <p className="text-sm">Type <span className="font-mono font-semibold">DELETE</span> below:</p>
                    <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE to confirm" className="font-mono" />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleteConfirmText !== 'DELETE'} className="bg-destructive hover:bg-destructive/90 disabled:opacity-50">Delete permanently</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
