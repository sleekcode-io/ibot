// SpeechToText.tsx
import { on } from "events";
import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface SpeechToTextProps {
  onTextCaptured: (text: string) => void;
  selectedLanguage: string;
  sessionStatus: boolean;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
  onTextCaptured,
  selectedLanguage,
  sessionStatus,
}) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const [doneSpeaking, setDoneSpeaking] = useState<boolean>(false);

  const toggleListeningHandler = () => {
    console.log(
      "Toggle listening... " + listening + ", doneSpeaking " + doneSpeaking
    );
    if (listening) {
      // If listening was on, stop listening
      console.log("Stop listening...");
      SpeechRecognition.stopListening(); // Will cause listening state to change
      setDoneSpeaking(true); // Set done speaking for user's response processing
    } else {
      // If listen was off, start listening
      console.log("Start listening... " + selectedLanguage);
      SpeechRecognition.startListening({
        continuous: true,
        language: selectedLanguage,
      }); // Will cause listening state to change

      resetTranscript(); // Restart with a clean slate for transcript
      setDoneSpeaking(false); // Reset done speaking flag
    }
  };

  // This function is triggered when there are transcript data from speech recognition
  // or Stop speaking button is pressed.
  // We do a callback (onTextCaptured) to report transcript availability event

  useEffect(() => {
    console.log(
      "SpeechToText: TEXT %s doneSpeaking %s",
      transcript,
      doneSpeaking ? "true" : "false"
    );
    if (doneSpeaking) {
      // Stop speaking button is pressed, process prev transcript
      onTextCaptured(".");
      //setDoneSpeaking(false); // Reset flag
      toggleListeningHandler(); // Back to listening again
    } else {
      if (transcript !== "") {
        onTextCaptured(transcript); // invoke callback to handle user's response
      }
    }
    // Dont add onTextCaptured and toggleListeningHandler as dependency,
    // they will cause repeat hook triggering
  }, [transcript, doneSpeaking]);

  // Handle session status change event from parent
  useEffect(() => {
    console.log("SpeechToText: SESSION status change " + sessionStatus);

    // Regardless of session starts or closes, stop listening
    if (listening) {
      toggleListeningHandler(); // Stop listening
    }
  }, [sessionStatus]);

  if (!browserSupportsSpeechRecognition) {
    console.log(
      "Browser does not support speech recognition. Try Chrome desktop browser ..."
    );
    return null;
  }
  if (!isMicrophoneAvailable) {
    console.log(
      "Microphone is not available! Please check system and browser settings."
    );
    return null;
  }

  let showTranscript = false; // Show/DontShow transcript on browser screen
  return (
    <div>
      {showTranscript && <p>{transcript}</p>}
      {sessionStatus && (
        <button
          onClick={toggleListeningHandler}
          style={{
            marginTop: "30px",
            padding: "10px 30px",
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: "800",
            borderRadius: "35px",
            backgroundColor: listening ? "red" : "green",
            color: "white",
          }}
        >
          {listening ? "Stop Speaking" : "Start Speaking"}
        </button>
      )}
    </div>
  );
};

export default SpeechToText;
