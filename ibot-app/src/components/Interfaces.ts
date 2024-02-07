// Component interfaces

export interface TranscriptMessageProps {
  timestamp: string;
  from: string; // owner
  msg: string; // message content
  spoken: boolean; // has spoken
  chatOutput: boolean; // has output to chat screen
}

export interface ChatProps {
  sessionStatus: boolean;
  chatMessages: TranscriptMessageProps[];
  onUserInput: (text: string) => void;
}

export interface AIBotProps {
  sessionId: number;
  transcriptMessages: TranscriptMessageProps[];
  onUserInput: (text: string) => void;
}

export interface TextToSpeechProps {
  cancelSpeaking: boolean;
  text: string;
  onLangChanged: (text: string) => void;
  onBotSpeaking?: (speaking: boolean) => void;
}

export interface JobFormProps {
  sessionId: number;
  mode: string;
  showJobWindow: boolean;
  errorMessage: string;
  onClose: () => void;
}
