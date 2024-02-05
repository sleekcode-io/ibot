// Component interfaces

export interface TranscriptMessageProps {
  from: string;
  msg: string;
  spoken: boolean;
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
}

export interface JobFormProps {
  sessionId: number;
  mode: string;
  showJobWindow: boolean;
  errorMessage: string;
  onClose: () => void;
}
