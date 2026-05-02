import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { toast } from 'sonner'
import { X, Copy, Share2, Download } from 'lucide-react'

export default function ClubShareSheet({
  clubId,
  clubName,
  inviteCode,
  open,
  onClose,
}: {
  clubId: string
  clubName: string
  inviteCode?: string | null
  open: boolean
  onClose: () => void
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/club/${clubId}`
    : `/club/${clubId}`
  const upperCode = inviteCode ? inviteCode.toUpperCase() : null

  useEffect(() => {
    if (!open) return
    let cancelled = false
    QRCode.toDataURL(shareUrl, { width: 320, margin: 1, color: { dark: '#111111', light: '#FFFFFF' } })
      .then(url => { if (!cancelled) setQrDataUrl(url) })
      .catch(() => { if (!cancelled) setQrDataUrl(null) })
    return () => { cancelled = true }
  }, [open, shareUrl])

  if (!open) return null

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error('Could not copy')
    }
  }

  const share = async () => {
    const text = upperCode
      ? `Join ${clubName} on RevNet — invite code ${upperCode}`
      : `Join ${clubName} on RevNet`
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({ title: clubName, text, url: shareUrl })
        return
      } catch {/* user cancelled */}
    }
    copy(shareUrl, 'Link')
  }

  const downloadQr = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `${clubName.replace(/[^\w-]+/g, '_').toLowerCase()}-qr.png`
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-background rounded-t-2xl md:rounded-2xl p-5 space-y-4 safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-bold text-foreground">Share club</p>
            <p className="text-sm text-muted-foreground truncate max-w-[260px]">{clubName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex justify-center">
          <div className="w-56 h-56 rounded-2xl bg-white border border-border/50 flex items-center justify-center overflow-hidden">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Club QR code" className="w-full h-full" />
            ) : (
              <div className="w-full h-full bg-muted/30 animate-pulse" />
            )}
          </div>
        </div>

        {qrDataUrl && (
          <button
            onClick={downloadQr}
            className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-muted-foreground border border-border/50 hover:bg-muted/30"
          >
            <Download className="w-3.5 h-3.5" />
            Save QR image
          </button>
        )}

        {upperCode && (
          <button
            onClick={() => copy(upperCode, 'Invite code')}
            className="w-full bg-muted/40 border border-border/50 rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Invite code</p>
              <p className="text-base font-mono font-bold text-foreground tracking-widest">{upperCode}</p>
            </div>
            <Copy className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <button
          onClick={() => copy(shareUrl, 'Link')}
          className="w-full bg-muted/40 border border-border/50 rounded-xl px-4 py-3 flex items-center justify-between"
        >
          <div className="text-left min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Link</p>
            <p className="text-sm text-foreground truncate">{shareUrl}</p>
          </div>
          <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-3" />
        </button>

        <button
          onClick={share}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background text-sm font-semibold"
        >
          <Share2 className="w-4 h-4" />
          Share…
        </button>
      </div>
    </div>
  )
}
