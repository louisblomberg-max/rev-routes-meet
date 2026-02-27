import { ChevronRight, Check, AlertCircle, Smartphone, Monitor, Shield, Apple, Mail } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const AccountSettings = () => {
  const navigate = useNavigate();

  // Mock user data
  const [userData] = useState({
    firstName: 'Louis',
    lastName: 'Blomberg',
    username: '@louis.revnet',
    email: 'louis@email.com',
    emailVerified: true,
    phone: '+44 7•• ••• •••',
    plan: 'Free',
  });

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Connected accounts
  const [appleConnected] = useState(false);
  const [googleConnected] = useState(true);

  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDownloadData = () => {
    toast({
      title: "Data request submitted",
      description: "You'll receive an email with your data within 48 hours.",
    });
  };

  const handleDeactivate = () => {
    toast({
      title: "Account deactivated",
      description: "Your profile is now hidden. You can reactivate anytime by logging in.",
    });
  };

  const handleDelete = () => {
    if (deleteConfirmText === 'DELETE') {
      toast({
        title: "Account deletion requested",
        description: "Your account will be permanently deleted within 30 days.",
        variant: "destructive",
      });
      setDeleteConfirmText('');
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Account</h1>
            <p className="text-xs text-muted-foreground">Manage your personal details and account access</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 space-y-4">
        {/* 1. Account Details */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Account Details</h2>
          </div>

          <div className="divide-y divide-border/30">
            {/* Name */}
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Name</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{userData.firstName} {userData.lastName}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>

            {/* Username */}
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Username</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{userData.username}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>

            {/* Email */}
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Email address</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{userData.email}</span>
                {userData.emailVerified ? (
                  <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    <AlertCircle className="w-3 h-3" />
                    Not verified
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>

            {/* Phone */}
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Phone number</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{userData.phone}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>
          </div>
        </div>

        {/* 2. Security */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Security</h2>
          </div>

          <div className="divide-y divide-border/30">
            {/* Change password */}
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Change password</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </button>

            {/* 2FA */}
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-foreground">Two-factor authentication</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Adds an extra layer of security to your account</p>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
            </div>

            {/* Active sessions */}
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
              <span className="text-sm text-foreground">Active sessions</span>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </div>
            </button>
          </div>
        </div>

        {/* 3. Connected Accounts */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Connected Accounts</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Link accounts to sign in faster</p>
          </div>

          <div className="divide-y divide-border/30">
            {/* Apple */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <Apple className="w-4 h-4 text-background" />
                </div>
                <span className="text-sm text-foreground">Apple</span>
              </div>
              {appleConnected ? (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Connected</span>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs">Connect</Button>
              )}
            </div>

            {/* Google */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-sm text-foreground">Google</span>
              </div>
              {googleConnected ? (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">Connected</span>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs">Connect</Button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Account Plan */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Plan & Billing</h2>
          </div>

          <button 
            onClick={() => navigate('/settings/billing')}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm text-foreground">Current plan</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-medium">{userData.plan}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </div>
          </button>
        </div>

        {/* 5. Data & Account Control */}
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <h2 className="text-sm font-semibold text-foreground">Data & Account</h2>
          </div>

          <div className="divide-y divide-border/30">
            {/* Download data */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <span className="text-sm text-foreground">Download my data</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Request a copy of your account data</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Download your data</AlertDialogTitle>
                  <AlertDialogDescription>
                    We'll prepare a copy of your account data and send it to your email address. This usually takes up to 48 hours.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDownloadData}>Request data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Deactivate */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground">Deactivate account</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your profile will be hidden from other users, but your data will be kept safe. You can reactivate your account anytime by logging back in.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-destructive/5 transition-colors">
                  <span className="text-sm text-destructive">Delete account</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account permanently?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>This action cannot be undone. All your data, including your profile, vehicles, routes, and posts will be permanently removed.</p>
                    <p className="text-sm">To confirm, type <span className="font-mono font-semibold">DELETE</span> below:</p>
                    <Input 
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="font-mono"
                    />
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={deleteConfirmText !== 'DELETE'}
                    className="bg-destructive hover:bg-destructive/90 disabled:opacity-50"
                  >
                    Delete permanently
                  </AlertDialogAction>
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
