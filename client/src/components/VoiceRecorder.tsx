import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onUploadAudio: (audioBlob: Blob) => Promise<string>; // Returns S3 URL
  onTranscribe: (audioUrl: string) => Promise<{ text: string; language: string; duration: number }>;
}

export function VoiceRecorder({ onTranscriptionComplete, onUploadAudio, onTranscribe }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder with supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm'
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Process the recorded audio
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Failed to access microphone. Please check your permissions.");
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    
    try {
      // Create audio blob from chunks
      const mimeType = audioChunksRef.current[0]?.type || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      
      // Check file size (16MB limit)
      const sizeMB = audioBlob.size / (1024 * 1024);
      if (sizeMB > 16) {
        throw new Error(`Audio file is too large (${sizeMB.toFixed(2)}MB). Maximum size is 16MB.`);
      }

      toast.info("Uploading audio...");
      
      // Upload to S3
      const audioUrl = await onUploadAudio(audioBlob);
      
      toast.info("Transcribing audio...");
      
      // Transcribe
      const result = await onTranscribe(audioUrl);
      
      // Return transcribed text
      onTranscriptionComplete(result.text);
      
      toast.success(`Transcription complete (${result.duration.toFixed(1)}s)`);
      
      // Reset
      audioChunksRef.current = [];
      setRecordingTime(0);
    } catch (err: any) {
      console.error("Error processing recording:", err);
      setError(err.message || "Failed to process recording");
      toast.error(err.message || "Failed to transcribe audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      {!isRecording && !isProcessing && (
        <Button
          type="button"
          onClick={startRecording}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Mic className="w-4 h-4" />
          Record Voice
        </Button>
      )}

      {isRecording && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="gap-2 animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop ({formatTime(recordingTime)})
          </Button>
          <div className="flex items-center gap-1 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            Recording...
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing audio...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
