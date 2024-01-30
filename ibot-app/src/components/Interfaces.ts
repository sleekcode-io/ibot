// Component interfaces

export interface TranscriptMessageProps {
  from: string;
  msg: string;
  processed: boolean;
}

export interface ChatProps {
  sessionStatus: boolean;
  showChat: boolean;
  //selectedLanguage: string;
  chatMessages: TranscriptMessageProps[];
  onUserInput: (text: string) => void;
}

export interface WebcamRecorderProps {
  sessionId: number;
  showWebcam: boolean;
  //botResponse: string;
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
