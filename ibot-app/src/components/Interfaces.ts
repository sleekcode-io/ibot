// Component interfaces

export interface TranscriptMessageProps {
  timestamp: number;
  timeDelta: number; // different in seconds between messages
  from: string; // user, bot, system
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
  onLangChanged: (selectLang: IsoLanguageProps) => void;
  //onBotSpeaking?: (speaking: boolean) => void;
}

export interface SpeechToTextProps {
  sessionId: number;
  onTextCaptured: (text: string) => void;
  selectedLanguage: string;
  showMicrophoneButton: boolean;
}

export interface JobFormProps {
  sessionId: number;
  mode: string;
  showJobWindow: boolean;
  errorMessage: string;
  onClose: () => void;
}

export interface IsoLanguageProps {
  code: string;
  name: string;
  nativeName: string;
  greeting: string;
  availVoices: number;
}
