import React, { useState, useRef, useEffect } from "react";
import TranscriptDownloadImage from "../images/download-file.png";
import CaptionImage from "../images/cc.png";
import CancelSpeakingImage from "../images/silent-blue-1.png";
import VideoImage from "../images/video-camera.png";
import TextImage from "../images/chat.png";
import SpeechToText from "./SpeechToText";
import TextToSpeech from "./TextToSpeech";
import { AIBotProps, TranscriptMessageProps } from "./Interfaces";
import iBotAvatar from "../images/ibotai.png";
import userAvatar from "../images/user-avatar.png";
import SendImage from "../images/send-message.png";
import "../App.css";
import "../styles/Chat.css";
import "../styles/WebcamRecorder.css";

const AIBot: React.FC<AIBotProps> = ({
  sessionId,
  transcriptMessages,
  onUserInput,
}) => {
  const [showCaption, setShowCaption] = useState(false);
  const [captionText, setCaptionText] = useState<string>("Caption ON");
  const [language, setLanguage] = useState("en-US");
  const [cancelSpeaking, setCancelSpeaking] = useState<boolean>(false);
  const [botResponse, setBotResponse] = useState<string>("");
  const [showWebcamVideo, setShowWebcamVideo] = useState(true);
  const [userInput, setUserInput] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    console.log("WebcamRecorder: FETCH_MEDIA");
    //console.log("WebcamRecorder: showWebcam:" + showWebcam);

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
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();
    setBotResponse(""); // Clear bot response to avoid repeat speaking of last response
  });

  useEffect(() => {
    console.log(
      "WebcamRecorder: transcriptMessage: %d",
      transcriptMessages.length
    );

    if (transcriptMessages.length > 0) {
      console.log("WebcamRecorder: spoken: " + transcriptMessages[0].spoken);
      if (
        transcriptMessages[0].from === "iBot" &&
        transcriptMessages[0].spoken === false
      ) {
        // TODO: last bot response to keep repeating if we leave and switch back to webcam window
        setBotResponse(transcriptMessages[0].msg);
        transcriptMessages[0].spoken = true;
      }
      if (showCaption) {
        console.log("transcriptMessage:" + transcriptMessages[0].msg);
        if (transcriptMessages[0].from === "iBot")
          setCaptionText(transcriptMessages[0].msg);
      }
    }
  }, [transcriptMessages, showCaption]);

  const handleToggleCaption = () => {
    console.log("handleToggleCaption");
    setShowCaption((prevShowCaption) => !prevShowCaption);
  };

  const handleToggleWebcamVideo = () => {
    console.log("handleToggleWebcamVideo");
    setShowWebcamVideo((prevShowWebcamVideo) => !prevShowWebcamVideo);
  };

  const handleDownloadTranscript = () => {
    console.log("handleDownloadTranscript");
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

  const handleCancelSpeaking = () => {
    console.log("handleCancelSpeaking");
    setCancelSpeaking(true);
    setBotResponse("");
  };

  // Handle language/voice change in TextToSpeech component
  const handleLangChanged = async (lang: string) => {
    console.log("handleLangChanged: old %s new %s", language, lang);
    setLanguage(lang);
  };

  // This function does not pick up Enter key press, only text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleInputChange: " + e.target.value);

    // pick up user's kb input here ...
    setUserInput(e.target.value);
    onUserInput(e.target.value);
  };

  // This function picks up Enter key press as well as text input (skipped here)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("handleKeyPress: " + e.key);
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
    console.log("handleSend");
    if (userInput.trim() !== "") {
      // Send user input to bot for processing and responding
      // Also, clear the input field
      onUserInput("done-typing");
      setUserInput("");
    }
  };

  const handleMessageDisplay = (message: TranscriptMessageProps) => {
    console.log("handleMessageDisplay: " + message);
    if (message === null || message === undefined) {
      return;
    }

    // Display message
    if (message.from === "iBot") {
      // Bot's message
      return (
        <div className="bot-message-container">
          <div className="bot-avatar">
            <img src={iBotAvatar} alt="iBot" width="50px" height="50px" />
          </div>
          <div className="bot-message">{message.msg}</div>
        </div>
      );
    } else if (message.from === "You") {
      return (
        <div className="user-message-container">
          <div className="user-message">{message.msg}</div>
          <div className="user-avatar">
            <img src={userAvatar} alt="iBot" width="40px" height="40px" />
          </div>
        </div>
      );
    } else {
      console.log(
        "handleMessageDisplay: Invalid message source: " + message.from
      );
      return;
    }
  };

  const webcamWindow = () => {
    console.log("webcamWindow");
    // Set webcam window visible
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
              }}
            >
              <div
                className="chat-window"
                style={{
                  height: "90%",
                  width: "88%",
                  marginLeft: "2.6vw",
                  visibility: showWebcamVideo ? "hidden" : "visible",
                }}
              >
                <div className="chat-message-container">
                  {transcriptMessages.map(
                    (message: TranscriptMessageProps, index: number) => (
                      <div key={index} className="chat-message">
                        {handleMessageDisplay(message)}
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
                //position: "absolute",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                visibility: showWebcamVideo ? "visible" : "hidden",
              }}
            >
              <TextToSpeech
                cancelSpeaking={cancelSpeaking}
                text={botResponse}
                onLangChanged={handleLangChanged}
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
              <div
                id="scroll-container"
                className="caption-text"
                style={{
                  marginTop: "0vh",
                  visibility:
                    showCaption && showWebcamVideo ? "visible" : "hidden",
                }}
              >
                <div id="scroll-text">{captionText}</div>
              </div>
            </div>
          </div>
          <div
            className="display-horizontal"
            style={{
              //position: "absolute",
              marginTop: "-3vh",
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
                //visibility: showWebcamVideo ? "visible" : "hidden",
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
                //visibility: showWebcamVideo ? "visible" : "hidden",
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
              onClick={handleCancelSpeaking}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "12px 0px 0px 0px",
                opacity: botResponse !== "" ? 1 : 0.6,
                cursor: botResponse !== "" ? "pointer" : "not-allowed",
                //visibility: showWebcamVideo ? "visible" : "hidden",
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
                //visibility: showWebcamVideo ? "visible" : "hidden",
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

  return <div>{webcamWindow()}</div>;
};

export default AIBot;
