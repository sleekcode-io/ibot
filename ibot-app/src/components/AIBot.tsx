import React, { useState, useRef, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import SpeechToText from "./SpeechToText";
import TextToSpeech from "./TextToSpeech";
import {
  AIBotProps,
  IsoLanguageProps,
  TranscriptMessageProps,
} from "./Interfaces";
/* Images */
import iBotAvatar from "../images/ibotai.png";
import userAvatar from "../images/user-avatar.png";
import SendImage from "../images/send.png";
import TranscriptDownloadImage from "../images/download-file.png";
import CaptionImage from "../images/cc.png";
import CancelSpeakingImage from "../images/silent-blue-1.png";
import VideoImage from "../images/video-camera.png";
import TextImage from "../images/chat.png";
/* Styles */
import "../App.css";
import "../styles/Chat.css";
import "../styles/AIBot.css";

const AIBot: React.FC<AIBotProps> = ({
  sessionId,
  transcriptMessages,
  onUserInput,
}) => {
  const [showCaption, setShowCaption] = useState<boolean>(false);
  const [captionText, setCaptionText] = useState<string>("Caption ON");
  const [language, setLanguage] = useState<string>("en-US");
  const [showWebcamVideo, setShowWebcamVideo] = useState<boolean>(true);
  const [userInput, setUserInput] = useState<string>("");
  const [botResponse, setBotResponse] = useState<string>("");
  const [botSpeaking, setBotSpeaking] = useState<boolean>(false);
  const [cancelBotSpeaking, setCancelBotSpeaking] = useState<boolean>(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    console.log("AIBot: FETCH_MEDIA");

    const startWebcam = async () => {
      try {
        // Get user media (camera) stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Set the video stream as the source for the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("AIBot: Error accessing webcam:", error);
      }
    };
    // If speechRecognition is support, start webcam for full video/voice/chat support
    if (browserSupportsSpeechRecognition) {
      startWebcam();
    } else {
      setShowWebcamVideo(false);
      alert(
        "Browser does not support speech recognition. Continue with Chat conversation only. Try Chrome or Safari web browser for voice conversation."
      );
    }

    setBotResponse(""); // Clear bot response to avoid repeat speaking of last response
  }, []);

  // Handle new bot response message for speaking and caption display.
  useEffect(() => {
    console.log("AIBot: transcriptMessage: %d", transcriptMessages.length);

    if (transcriptMessages.length > 0) {
      console.log("AIBot: spoken: " + transcriptMessages[0].spoken);
      if (
        transcriptMessages[0].from === "iBot" &&
        transcriptMessages[0].spoken === false
      ) {
        // TODO: last bot response to keep repeating if we leave and switch back to webcam window
        setBotResponse(transcriptMessages[0].msg);
        transcriptMessages[0].spoken = true;
      }
      if (showCaption) {
        console.log("AIBot: transcriptMessage:" + transcriptMessages[0].msg);
        if (transcriptMessages[0].from === "iBot")
          setCaptionText(transcriptMessages[0].msg);
      }
    }
  }, [transcriptMessages]);

  const handleToggleCaption = () => {
    console.log("AIBot->handleToggleCaption");
    setShowCaption((prevShowCaption) => !prevShowCaption);
  };

  const handleToggleWebcamVideo = () => {
    console.log("AIBot->handleToggleWebcamVideo");
    setShowWebcamVideo((prevShowWebcamVideo) => !prevShowWebcamVideo);
  };

  const handleDownloadTranscript = () => {
    console.log("AIBot->handleDownloadTranscript");
    if (!transcriptMessages.length) {
      // No transcript available to download
      return;
    }
    // Download transcript
    let dlTranscript: string[] = [];
    transcriptMessages.forEach((x) => dlTranscript.push(x.from + "> " + x.msg));
    const element = document.createElement("a");
    const file = new Blob([dlTranscript.reverse().join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });

    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  // Send Cancel bot speaking event to TextToSpeech component
  const handleCancelBotSpeaking = () => {
    console.log("AIBot->handleCancelBotSpeaking");
    setCancelBotSpeaking(true);
    setBotResponse("");
  };

  // Bot start/stop speaking events from Text2Speech component
  const handleBotSpeaking = async (speaking: boolean) => {
    //console.log("handleBotSpeaking: SPEAKING " + speaking);
    setBotSpeaking(speaking);
  };

  // This function does not pick up Enter key press, only text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("AIBot->handleInputChange: " + e.target.value);

    // pick up user's kb input here ...
    setUserInput(e.target.value);
    onUserInput(e.target.value);
  };

  // This function picks up Enter key press as well as text input (skipped here)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("AIBot->handleKeyPress: " + e.key);
    if (e.key === "Enter") {
      // User pressed the Enter key
      if (userInput.trim() !== "") {
        // User entered a non-empty string, send to bot for processing
        // and clear the input field
        onUserInput("done-typing");
        setUserInput("");
      }
    }
  };

  const handleSend = () => {
    console.log("AIBot->handleSend");
    if (userInput.trim() !== "") {
      // Send user input to bot for processing and responding
      // Also, clear the input field
      onUserInput("done-typing");
      setUserInput("");
    }
  };

  // Display bot's and user's messages on chat window
  const handleMessageDisplay = (
    index: number,
    message: TranscriptMessageProps
  ) => {
    console.log("AIBot->handleMessageDisplay: %d", index);
    if (showWebcamVideo || message === null || message === undefined) {
      return;
    }

    console.log(
      "AIBot->handleMessageDisplay: " +
        index +
        ":" +
        message.from +
        ">" +
        message.msg
    );
    // Display message
    message.chatOutput = true;

    console.log("timeLater: " + message.timeDelta);
    let hours = Math.floor(message.timeDelta / 3600);
    let minutes = Math.floor(message.timeDelta / 60) - hours * 60;
    let seconds = Math.floor(message.timeDelta - (hours * 3600 + minutes * 60));

    let laterMessage =
      (hours ? hours + "h " : "") +
      (minutes ? minutes + "m " : "") +
      seconds +
      "s later ...";

    if (message.from === "iBot") {
      // Bot's message
      return (
        <div>
          <div className="bot-timestamp-message">{laterMessage}</div>
          <div className="bot-message-container">
            <div className="bot-avatar">
              <img src={iBotAvatar} alt="iBot" width="50px" height="50px" />
            </div>
            <div className="bot-message">{message.msg}</div>
          </div>
        </div>
      );
    } else if (message.from === "You") {
      //let msg = message.msg.replace(/\n/g, "&#10;").replace(/\t/g, "&#9;");
      return (
        <div>
          <div className="user-timestamp-message">{laterMessage}</div>
          <div className="user-message-container">
            <div className="user-message">{message.msg}</div>
            <div className="user-avatar">
              <img src={userAvatar} alt="iBot" width="40px" height="40px" />
            </div>
          </div>
        </div>
      );
    } else if (message.from === "System") {
      return <div className="system-message">{message.msg}</div>;
    } else {
      console.log(
        "AIBot->handleMessageDisplay: Invalid message source: " + message.from
      );
    }
  };

  const handleLanguageChange = (selectLanguage: IsoLanguageProps) => {
    console.log("handleLanguageChange: language: ", selectLanguage.name);
  };

  // TODO: This message list is re-rendered on every user input.
  // Need to check if there is change in message list to render again.
  // Also, restructure chat-message-container to render only the new message
  // instead of the whole list.
  //
  const webcamWindow = () => {
    return (
      <div
        className="display-container"
        style={{
          height: "100%",
          backgroundColor: "#96419c",
        }}
      >
        <div className="display-vertical">
          <div
            className="wrapper"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              paddingTop: "2vh",
              paddingBottom: "2vh",
              paddingLeft: "2vw",
              paddingRight: "2vw",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                visibility: showWebcamVideo ? "hidden" : "visible",
              }}
            >
              <div
                style={{
                  marginBottom: "3vh",
                }}
              ></div>
              <div
                className="chat-window"
                style={{
                  height: "90%",
                  width: "88%",
                  marginLeft: "2.6vw",
                }}
              >
                <div className="chat-message-container">
                  {transcriptMessages.map(
                    (message: TranscriptMessageProps, index: number) => (
                      <div key={index} className="chat-message">
                        {handleMessageDisplay(index, message)}
                      </div>
                    )
                  )}
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="input-text"
                    placeholder="Type your message..."
                  />
                  <button
                    className="chat-button"
                    onClick={handleSend}
                    style={{
                      backgroundColor: userInput !== "" ? "#fff" : "#d8d8d8",
                    }}
                  >
                    <div className="tooltip">
                      <img src={SendImage} alt="S" width="18px" height="18px" />
                      {userInput !== "" ? (
                        <span className="tooltiptext">Send user input</span>
                      ) : (
                        <span className="tooltiptext">
                          No input data to send
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div
              className="display-vertical"
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                visibility: showWebcamVideo ? "visible" : "hidden",
              }}
            >
              <TextToSpeech
                cancelSpeaking={cancelBotSpeaking}
                text={botResponse}
                onLangChanged={handleLanguageChange}
                //onBotSpeaking={handleBotSpeaking}
              />

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={true}
                width="98%"
                height="98%"
              >
                <track
                  kind="captions"
                  // srcLang={selectedLanguage}
                  // label="English"
                />
              </video>
            </div>
          </div>
          <div
            className="caption-container"
            style={{
              marginTop: "-5.5vh",
              visibility: showCaption && showWebcamVideo ? "visible" : "hidden",
            }}
          >
            <div id="scroll-text">{captionText}</div>
          </div>
          <div
            className="display-horizontal"
            style={{
              marginTop: "3vh",
              marginLeft: "2vw",
              marginBottom: "5vh",
              gap: "2%",
            }}
          >
            <button
              onClick={handleDownloadTranscript}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "12px 0px 0px 0px",
                opacity: transcriptMessages.length ? 1 : 0.6,
                cursor: transcriptMessages.length ? "pointer" : "not-allowed",
              }}
            >
              <div className="tooltip">
                <img
                  src={TranscriptDownloadImage}
                  alt="D"
                  width="50px"
                  height="50px"
                />
                <span className="tooltiptext">
                  Download conversation transcript
                </span>
              </div>
            </button>
            <button
              onClick={handleToggleCaption}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "12px 0px 0px 0px",
                opacity: showWebcamVideo ? 1 : 0.6,
                cursor: showWebcamVideo ? "pointer" : "not-allowed",
              }}
            >
              <div className="tooltip">
                <img src={CaptionImage} alt="D" width="48px" height="48px" />
                <span className="tooltiptext">Toggle caption</span>
              </div>
            </button>
            <SpeechToText
              sessionId={sessionId}
              onTextCaptured={onUserInput}
              selectedLanguage={language}
              showMicrophoneButton={true}
            />
            <button
              onClick={handleCancelBotSpeaking}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "12px 0px 0px 0px",
                opacity: botResponse !== "" ? 1 : 0.6,
                cursor: botResponse !== "" ? "pointer" : "not-allowed",
              }}
            >
              <div className="tooltip">
                <img
                  src={CancelSpeakingImage}
                  alt="S"
                  width="46px"
                  height="46px"
                />
                <span className="tooltiptext">Cancel bot speech</span>
              </div>
            </button>
            <button
              onClick={handleToggleWebcamVideo}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "12px 0px 0px 0px",
              }}
            >
              <div className="tooltip">
                {showWebcamVideo ? (
                  <div>
                    <img src={TextImage} alt="T" width="46px" height="46px" />
                    <span className="tooltiptext">Show text input area</span>
                  </div>
                ) : (
                  <div>
                    <img src={VideoImage} alt="V" width="46px" height="46px" />
                    <span className="tooltiptext">Show webcam video</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const chatWindow = () => {
    return (
      <div
        className="display-container"
        style={{
          backgroundColor: "#96419c",
        }}
      >
        <div className="display-vertical">
          <div
            className="wrapper"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              paddingTop: "2vh",
              paddingBottom: "2vh",
              paddingLeft: "2vw",
              paddingRight: "2vw",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                alignContent: "center",
              }}
            >
              <div
                className="chat-window"
                style={{
                  height: "90%",
                  width: "88%",
                  alignItems: "center",
                  marginLeft: "3vw",
                }}
              >
                <div className="chat-message-container">
                  {transcriptMessages.map(
                    (message: TranscriptMessageProps, index: number) => (
                      <div key={index} className="chat-message">
                        {handleMessageDisplay(index, message)}
                      </div>
                    )
                  )}
                </div>
                <div className="input-container">
                  <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="input-text"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleSend}
                    style={{
                      backgroundColor: "transparent",
                      justifyItems: "top",
                      border: "none",
                      opacity: userInput !== "" ? 1 : 0.6,
                      cursor: userInput !== "" ? "pointer" : "not-allowed",
                    }}
                  >
                    <div className="tooltip">
                      <img src={SendImage} alt="S" width="38px" height="38px" />
                      {userInput !== "" ? (
                        <span className="tooltiptext">Send user input</span>
                      ) : (
                        <span className="tooltiptext">
                          No input data to send
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={handleDownloadTranscript}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      justifyItems: "top",
                      opacity: transcriptMessages.length > 0 ? 1 : 0.6,
                      cursor: transcriptMessages.length
                        ? "pointer"
                        : "not-allowed",
                    }}
                  >
                    <div className="tooltip">
                      <img
                        src={TranscriptDownloadImage}
                        alt="D"
                        width="40px"
                        height="40px"
                      />
                      <span className="tooltiptext">
                        Download conversation transcript
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (browserSupportsSpeechRecognition) return <div>{webcamWindow()}</div>;
  else return <div>{chatWindow()}</div>;
};

export default AIBot;
