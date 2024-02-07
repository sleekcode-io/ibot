import React, { useState, useEffect } from "react";
import "../App.css";
import "../styles/TextToSpeech.css";
import { TextToSpeechProps } from "./Interfaces";

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

    if (selectedVoice) {
      console.log("TextToSpeech: selected language: " + selectedVoice.lang);

      if (selectedVoice.lang.includes("en-"))
        text = "Hi, Welcome to iBot. We speak English."; // English
      else if (selectedVoice.lang.includes("vi-VN"))
        // Vietnamese
        text = "Xin chào, Chào mừng đến với iBot. Chúng tôi nói tiếng Việt.";
      else if (selectedVoice.lang.includes("zh-CN"))
        text = "您好，欢迎来到 iBot。我们说中文。"; // China
      else if (selectedVoice.lang.includes("zh-TW"))
        // Taiwan
        text = "您好，歡迎來到 iBot。我們說中文。";
      // else if (selectedVoice.lang.includes("zh-HK"))
      //   // Hongkong
      //   text = "Hi, Welcome to iBot. We speak Cantonese.";
      else if (selectedVoice.lang.includes("fr-"))
        // French
        text = "Bonjour, bienvenue sur iBot. On parle francais.";
      else if (selectedVoice.lang.includes("it-"))
        // Italian
        text = "Ciao, benvenuto in iBot. Noi parliamo italiano.";
      else if (selectedVoice.lang.includes("de-"))
        // German
        text = "Hallo, willkommen bei iBot. Wir sprechen Deutsch.";
      else if (selectedVoice.lang.includes("es-"))
        // Spanish
        text = "Hola, bienvenido a iBot. Hablamos español.";
      else if (selectedVoice.lang.includes("fi-"))
        // Finish
        text = "Hei, tervetuloa iBotiin. Puhumme suomea.";
      else if (selectedVoice.lang.includes("da-"))
        // Danish
        text = "Hej, velkommen til iBot. Vi taler dansk.";
      else if (selectedVoice.lang.includes("nl-"))
        // Dutch
        text = "Hallo, welkom bij iBot. Wij spreken Nederlands.";
      else if (
        selectedVoice.lang.includes("no-") ||
        selectedVoice.lang.includes("nn-") ||
        selectedVoice.lang.includes("nb-")
      )
        // Norwegian
        text = "Hei, Velkommen til iBot. Vi snakker norsk.";
      else if (selectedVoice.lang.includes("pl-"))
        // Polish
        text = "Cześć, witaj w iBocie. Mówimy po polsku.";
      else if (selectedVoice.lang.includes("ru-"))
        // Russian
        text = "Привет, добро пожаловать в iBot. Мы говорим по-русски.";
      else if (selectedVoice.lang.includes("pt-"))
        // porturgese
        text = "Olá, bem-vindo ao iBot. Falamos português.";
      else if (selectedVoice.lang.includes("ja-"))
        // japan
        text = "こんにちは、iBot へようこそ。私たちは日本語を話します。";
      else if (selectedVoice.lang.includes("ko-"))
        // korean
        text = "안녕하세요, iBot에 오신 것을 환영합니다. 우리는 한국어를 해요.";
      else if (selectedVoice.lang.includes("id-"))
        // indonesian
        text = "Hai, Selamat datang di iBot. Kami berbicara bahasa Indonesia.";
      else if (selectedVoice.lang.includes("hi-"))
        // Hindi
        text = "नमस्ते, आईबॉट में आपका स्वागत है। हम हिंदी बोलते हैं.";
      else if (selectedVoice.lang.includes("ar-"))
        // Arabic
        text = "مرحبًا، مرحبًا بك في iBot. نحن نتكلم العربية.";
      else if (selectedVoice.lang.includes("th-"))
        // Thai
        text = "สวัสดี ยินดีต้อนรับสู่ iBot เราพูดภาษาไทย";
      else if (selectedVoice.lang.includes("hu-"))
        // Hungarian
        text = "Üdvözöljük az iBot-ban. magyarul beszélünk.";
      else if (selectedVoice.lang.includes("hr-"))
        // Croatian
        text = "Pozdrav, dobrodošli u iBot. Govorimo hrvatski.";
      else if (selectedVoice.lang.includes("ro-"))
        // Romanian
        text = "Bună, bun venit la iBot. Vorbim romana.";
      else if (selectedVoice.lang.includes("he-"))
        // Hebrew
        text = "היי, ברוכים הבאים ל-iBot. אנחנו מדברים עברית.";
      else if (selectedVoice.lang.includes("bg-"))
        // Bulgarian
        text = "Здравейте, добре дошли в iBot. Говорим български.";

      console.log(
        "selectedVoice: " + selectedVoice.name + ", lang: " + selectedVoice.lang
      );

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
          // alignItems: "center",
          // justifyContent: "center",
          // marginTop: "0vh",
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
      {/* <div className={`caption-box ${isSpeaking ? "scroll-text" : ""}`}>
        {text}
      </div> */}
    </div>
  );
};

export default TextToSpeech;
