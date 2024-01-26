// SpeechToText.tsx

import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Microphone from "../images/microphone.png";

interface SpeechToTextProps {
  sessionId: number;
  onTextCaptured: (text: string) => void;
  selectedLanguage: string;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({
  sessionId,
  onTextCaptured,
  selectedLanguage,
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
  //
  // NOTE: SpeechRecognition does not provide support for speechend event
  //   while setTimeout in useEffect() does not work correctly.
  //   So we use microphone off to trigger speech end event.
  //
  useEffect(() => {
    console.log(
      "SpeechToText: TEXT %s doneSpeaking %s",
      transcript,
      doneSpeaking
    );
    if (doneSpeaking) {
      // Stop speaking button is pressed, process prev transcript
      onTextCaptured("done-speaking");
      //toggleListeningHandler(); // Back to listening again
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
    console.log("SpeechToText: SESSION " + sessionId);

    // Regardless of session starts or closes, stop listening
    if (listening) {
      toggleListeningHandler(); // Stop listening
    }
  }, [sessionId]);

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

  return (
    <div>
      <button
        className="microphone-button"
        onClick={toggleListeningHandler}
        style={{
          backgroundColor: listening ? "red" : "green",
        }}
      >
        <div className="tooltip">
          <img src={Microphone} width="32px" height="32px" alt="Microphone" />
          {listening ? (
            <span className="tooltiptext">Click on stop speaking</span>
          ) : (
            <span className="tooltiptext">Click to speak</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default SpeechToText;
