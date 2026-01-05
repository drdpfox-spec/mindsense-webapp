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
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

interface EmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: "trends" | "journal" | "comprehensive";
  onGeneratePDF: () => Promise<string>; // Returns base64 data URL
}

export default function EmailDialog({ open, onOpenChange, reportType, onGeneratePDF }: EmailDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendEmail = trpc.email.sendReport.useMutation({
    onSuccess: () => {
      toast.success("Email sent successfully");
      handleClose();
    },
    onError: (error) => {
      toast.error("Failed to send email: " + error.message);
      setIsSending(false);
    },
  });

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error("Please enter recipient email");
      return;
    }

    setIsSending(true);
    try {
      // Generate PDF
      const pdfDataUrl = await onGeneratePDF();

      // Send email
      await sendEmail.mutateAsync({
        recipientEmail,
        recipientName: recipientName || undefined,
        reportType,
        pdfDataUrl,
      });
    } catch (error) {
      toast.error("Failed to generate or send report");
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setRecipientEmail("");
    setRecipientName("");
    setIsSending(false);
    onOpenChange(false);
  };

  const reportTypeLabels = {
    trends: "Biomarker Trends Report",
    journal: "Patient Journal Report",
    comprehensive: "Comprehensive Health Report",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal-600" />
            Email Report
          </DialogTitle>
          <DialogDescription>
            Send {reportTypeLabels[reportType]} to a healthcare provider
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient-email">Recipient Email *</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="doctor@hospital.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div>
            <Label htmlFor="recipient-name">Recipient Name (Optional)</Label>
            <Input
              id="recipient-name"
              placeholder="Dr. Smith"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              disabled={isSending}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              The PDF report will be generated and sent via email. The recipient will receive
              a professional summary with your health data attached.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || !recipientEmail}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
