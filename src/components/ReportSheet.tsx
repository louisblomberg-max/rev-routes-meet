import { useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface ReportSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'event' | 'route' | 'service' | 'post' | 'listing' | 'user' | 'club';
  contentId?: string;
}

const REASONS = [
  'Spam or misleading',
  'Harassment or hate speech',
  'Inappropriate content',
  'Scam or fraud',
  'Safety concern',
  'Incorrect information',
  'Other',
];

const ReportSheet = ({ open, onOpenChange, contentType }: ReportSheetProps) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) return;
    setSubmitted(true);
    setTimeout(() => {
      toast.success('Report submitted — our team will review it');
      onOpenChange(false);
      setSubmitted(false);
      setSelectedReason(null);
      setDetails('');
    }, 1000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Flag className="w-4 h-4 text-destructive" />
            </div>
            <SheetTitle className="heading-md">Report {contentType}</SheetTitle>
          </div>
        </SheetHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <AlertTriangle className="w-10 h-10 text-primary mb-3" />
            <p className="heading-sm text-foreground">Submitting report…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Why are you reporting this?</p>

            <div className="space-y-2">
              {REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedReason === reason
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border/50 bg-card text-muted-foreground hover:border-border'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Additional details (optional)</p>
              <Textarea
                placeholder="Tell us more..."
                rows={3}
                value={details}
                onChange={e => setDetails(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedReason}
              className="w-full h-11"
              variant="destructive"
            >
              Submit Report
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ReportSheet;
