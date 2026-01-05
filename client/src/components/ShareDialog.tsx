import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy, Check, Loader2, Share2 } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [accessType, setAccessType] = useState<"full" | "trends_only" | "journal_only">("full");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const createToken = trpc.sharing.createAccessToken.useMutation({
    onSuccess: (data) => {
      setShareUrl(data.shareUrl);
      toast.success("Share link created successfully");
    },
    onError: () => {
      toast.error("Failed to create share link");
    },
  });

  const handleCreate = () => {
    createToken.mutate({
      expiresInDays: parseInt(expiresInDays),
      accessType,
      recipientEmail: recipientEmail || undefined,
      recipientName: recipientName || undefined,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShareUrl("");
    setRecipientName("");
    setRecipientEmail("");
    setExpiresInDays("30");
    setAccessType("full");
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-teal-600" />
            Share Your Health Data
          </DialogTitle>
          <DialogDescription>
            Create a secure, time-limited link to share your data with healthcare providers
          </DialogDescription>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient-name">Recipient Name (Optional)</Label>
              <Input
                id="recipient-name"
                placeholder="Dr. Smith"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="recipient-email">Recipient Email (Optional)</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="doctor@hospital.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="access-type">Access Type</Label>
              <Select value={accessType} onValueChange={(v: any) => setAccessType(v)}>
                <SelectTrigger id="access-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access (Trends + Journal)</SelectItem>
                  <SelectItem value="trends_only">Biomarker Trends Only</SelectItem>
                  <SelectItem value="journal_only">Journal Entries Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expires">Link Expires In</Label>
              <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                <SelectTrigger id="expires">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Privacy Notice:</strong> The link will provide read-only access to your
                selected data. You can revoke access at any time from your Profile settings.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-900">
                ✓ Share link created successfully! Send this link to your healthcare provider.
                They can access your data until it expires.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {!shareUrl ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createToken.isPending}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {createToken.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Share Link"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
