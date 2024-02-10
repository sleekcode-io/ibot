import React, { useState, useEffect } from "react";
import axios from "axios";
import isoLangs from "../isoLanguages.json";
import "../App.css";
import "../styles/TextToSpeech.css";
import { TextToSpeechProps } from "./Interfaces";

interface IsoLanguageProps {
  code: string;
  name: string;
  nativeName: string;
  greeting: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({
  cancelSpeaking,
  text,
  onLangChanged,
  onBotSpeaking,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice>();

  useEffect(() => {
    console.log("TextToSpeech: FETCH_VOICE");
    let excludedVoices = [
      "Grandpa",
      "Grandma",
      "Princess",
      "Albert",
      "Bad News",
      "Good News",
      "Bahh",
      "Bells",
      "Boing",
      "Bubbles",
      "Cellos",
      "Organ",
      "Superstar",
      "Trinoids",
      "Whisper",
      "Wobble",
      "Zarvox",
    ];

    const fetchVoices = () => {
      const synth = window.speechSynthesis;
      const availableVoices = synth.getVoices();
      const usableVoices = availableVoices.filter(
        (voice) => !excludedVoices.includes(voice.name)
      );

      setVoices(usableVoices);

      // Set a default voice, or you can let the user choose one
      setSelectedVoice(usableVoices[0]);
    };

    fetchVoices();

    window.speechSynthesis.addEventListener("voiceschanged", fetchVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", fetchVoices);
    };
  }, []); // Empty dependency array ensures the effect runs only once (on mount) and cleans up on unmount

  // Handle bot's and user's response speech
  useEffect(() => {
    console.log("TextToSpeech: select voice: " + selectedVoice);

    if (selectedVoice) {
      // Do this only when session is active and a voice is selected
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      // utterance.addEventListener("start", () => {
      //   console.log("TextToSpeech: SPEAKING_START");
      //   if (onBotSpeaking) {
      //     onBotSpeaking(true);
      //   }
      // });

      // utterance.addEventListener("end", () => {
      //   console.log("TextToSpeech: SPEAKING_END");
      //   if (onBotSpeaking) {
      //     onBotSpeaking(false);
      //   }
      // });
      window.speechSynthesis.speak(utterance);
      // return () => {
      //   //window.speechSynthesis.cancel();
      // };
    }
  }, [text, selectedVoice]);

  // Handle cancelling ongoing bot's response speech when user clicks on Stop Speaking button
  useEffect(() => {
    console.log("TextToSpeech: CANCEL_SPEAKING");
    if (cancelSpeaking) {
      window.speechSynthesis.cancel();
    }
  }, [cancelSpeaking]);

  // Handle voice change from user's selection. This can be done even if session is not active.
  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceName = event.target.value;
    const selectedVoice = voices.find(
      (voice) => voice.name === selectedVoiceName
    );
    const getGreetingMessage = (lang: string) => {
      const languages: IsoLanguageProps[] = isoLangs;
      const match = lang.match(/\b([a-z]{2})-[A-Z]{2}\b/);
      const langCode = match ? match[1] : null; // Extract the language code

      if (langCode == null) {
        console.log("getGreetingMessage: language code not found.");
        return "";
      }
      for (const i in languages) {
        if (languages[i].code === langCode) {
          return languages[i].greeting;
        }
      }
      console.log("getGreetingMessage: unknown language code (%s)", langCode);
      return "";
    };

    if (selectedVoice) {
      console.log("TextToSpeech: selected language: " + selectedVoice.lang);

      text = getGreetingMessage(selectedVoice.lang);

      onLangChanged(selectedVoice.lang); // invoke callback to handle language change
      window.speechSynthesis.cancel(); // cutting short of any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      window.speechSynthesis.speak(utterance); // speak greeting message
      setSelectedVoice(selectedVoice);
    }
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "3vh",
        }}
      >
        <select
          className="display-select"
          id="voices"
          onChange={handleVoiceChange}
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {`${voice.name} - ${voice.lang}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TextToSpeech;
