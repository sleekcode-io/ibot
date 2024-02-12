import React, { useState, useEffect } from "react";
import axios from "axios";
import isoLanguages from "../isoLanguages.json";
import "../App.css";
import "../styles/TextToSpeech.css";
import { TextToSpeechProps, IsoLanguageProps } from "./Interfaces";

const TextToSpeech: React.FC<TextToSpeechProps> = ({
  cancelSpeaking,
  text,
  onLangChanged,
  //onBotSpeaking,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice>();
  const [languages, setLanguages] = useState<IsoLanguageProps[]>([]);
  const [selectLang, setSelectLang] = useState<IsoLanguageProps>();

  const excludedVoices = [
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
    "Fred",
    "Jester",
    "Junior",
    "Organ",
    "Sandy",
    "Superstar",
    "Trinoids",
    "Whisper",
    "Wobble",
    "Zarvox",
  ];

  // Generate list of voices for particular language
  const getVoiceList = (langCode: string, greeting: string) => {
    console.log("getVoiceList: language %s", langCode);
    const synth = window.speechSynthesis;
    const availableVoices = synth.getVoices(); // List of avail voices offered by browser
    console.log("availableVoices %d", availableVoices.length);
    // Filter out weird voices
    const usableVoices = availableVoices.filter(
      (voice) => !excludedVoices.includes(voice.name)
    );
    console.log("usableVoices %d", usableVoices.length);
    // Filter out voice for specified language
    const filteredVoices = usableVoices.filter((voice) =>
      voice.lang.includes(langCode)
    );
    console.log("getVoiceList: filter voices: %d", filteredVoices.length);

    // Reset available voice list matching specified language
    setVoices(filteredVoices);

    // Set a default voice
    if (filteredVoices.length > 0) {
      let defaultVoice = filteredVoices[0];

      console.log("TextToSpeech: selected voice: " + defaultVoice.name);
      let defaultGreeting = "Hello, welcome to iBot. Please select a language.";
      let text = greeting ? greeting : defaultGreeting;

      window.speechSynthesis.cancel(); // cutting short of any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = defaultVoice;
      window.speechSynthesis.speak(utterance); // speak greeting message
      setSelectedVoice(defaultVoice);
    }
  };

  // Init: load supported language list

  useEffect(() => {
    console.log("TextToSpeech: FETCH_LANG");

    const fetchLanguages = () => {
      console.log(
        "fetchVoices: language %s",
        selectLang ? selectLang.code : "?"
      );

      const synth = window.speechSynthesis;
      const availableVoices = synth.getVoices(); // List of avail voices offered by browser
      console.log("availableVoices %d", availableVoices.length);

      const usableVoices = availableVoices.filter(
        // Exclude weird voices
        (voice) => !excludedVoices.includes(voice.name)
      );
      console.log("usableVoices %d", usableVoices.length);

      const availableLanguages: IsoLanguageProps[] = isoLanguages.filter(
        (lang) =>
          lang.greeting != null ||
          lang.greeting != undefined ||
          lang.greeting != ""
      );
      // Now, update availableLanguages with voice count
      for (const i in availableLanguages) {
        let voiceList = usableVoices.filter((voice) =>
          voice.lang.includes(availableLanguages[i].code)
        );
        availableLanguages[i].availVoices = voiceList.length;
      }
      const langWithVoiceList = availableLanguages.filter(
        (lang) => lang.availVoices > 0
      );

      // At beginning, on available languages is set for selection.
      // Voice list will be set when a language is selected by user
      setLanguages(langWithVoiceList);
    };

    fetchLanguages();

    // When original voice list is changed, update language list.
    window.speechSynthesis.addEventListener("voiceschanged", fetchLanguages);

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        fetchLanguages
      );
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
    }
  }, [text, selectedVoice]);

  // Handle cancelling ongoing bot's response speech when user clicks on Stop Speaking button
  useEffect(() => {
    console.log("TextToSpeech: CANCEL_SPEAKING");
    if (cancelSpeaking) {
      window.speechSynthesis.cancel();
    }
  }, [cancelSpeaking]);

  // Handle language/voice change in TextToSpeech component
  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLangName = event.target.value; // lang.name (lang.code)
    const selectedLang = languages.find((lang) =>
      selectedLangName.includes(lang.name)
    );
    if (selectedLang) {
      setSelectLang(selectedLang);
      getVoiceList(selectedLang.code, selectedLang.greeting); // Update voice list based on selected language

      // onLangChanged(selectedLang); // invoke callback
    }
  };

  // Handle voice change from user's selection. This can be done even if session is not active.
  // TODO: use selectLang to id greeting message instead of matching.
  //
  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoiceName = event.target.value;
    const selectedVoice = voices.find(
      (voice) => voice.name === selectedVoiceName
    );

    if (selectedVoice) {
      console.log("TextToSpeech: selected voice: " + selectedVoice.name);
      let defaultGreeting = "Hello, welcome to iBot. Please select a language.";

      text = selectLang ? selectLang.greeting : defaultGreeting;

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
        className="display-horizontal"
        style={{
          marginBottom: "3vh",
        }}
      >
        <select
          className="display-select"
          style={{ width: "80%" }}
          id="languages"
          onChange={handleLanguageChange}
        >
          <option value="" selected disabled hidden>
            Select Language
          </option>
          {languages.map((language) => (
            <option key={language.name} value={language.name}>
              {`${language.name} (${language.code})`}
            </option>
          ))}
        </select>
        <select
          className="display-select"
          style={{ width: "80%" }}
          id="voices"
          onChange={handleVoiceChange}
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {`${voice.name}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TextToSpeech;
