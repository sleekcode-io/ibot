import React, { useState, useRef, useEffect } from "react";
import TranscriptDownloadImage from "../images/download-file.png";
import CaptionImage from "../images/cc.png";
import CancelSpeakingImage from "../images/silent-blue-1.png";
import VideoImage from "../images/video-camera.png";
import TextImage from "../images/text.png";
import SpeechToText from "./SpeechToText";
import TextToSpeech from "./TextToSpeech";
import "../styles/WebcamRecorder.css";
import "../App.css";

// TODO: The recording-related code is not used in the current version of the app.
// It is commented out and kept here for future reference.

interface WebcamRecorderProps {
  sessionId: number;
  showWebcam: boolean;
  transcriptMessages: string[];
  onUserInput: (text: string) => void;
}

const WebcamRecorder: React.FC<WebcamRecorderProps> = ({
  sessionId,
  showWebcam,
  transcriptMessages,
  onUserInput,
}) => {
  const [caption, setCaption] = useState(false);
  const [captionText, setCaptionText] = useState<string>("Caption ON");
  const [language, setLanguage] = useState("en-US");
  const [cancelSpeaking, setCancelSpeaking] = useState<boolean>(false);
  const [botResponse, setBotResponse] = useState<string>("");
  const [showWebcamVideo, setShowWebcamVideo] = useState(true);
  const [jobDescription, setJobDescription] = useState<string>("");

  // const [width, setWidth] = useState(400); // Initial width
  // const [height, setHeight] = useState(300); // Initial height

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    console.log("WebcamRecorder: FETCH_MEDIA");
    console.log("WebcamRecorder: showWebcam:" + showWebcam);

    const startWebcam = async () => {
      try {
        // Get user media (camera) stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Set the video stream as the source for the video element
        if (videoRef.current) {
          (videoRef.current as HTMLVideoElement).srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startWebcam();
  }, [showWebcam]);

  useEffect(() => {
    console.log("WebcamRecorder: transcriptMessage:" + transcriptMessages[0]);

    if (transcriptMessages.length > 0) {
      if (transcriptMessages[0].includes("iBot>")) {
        // TODO: last bot response to keep repeating if we leave and switch back to webcam window
        setBotResponse(transcriptMessages[0].slice(5));
      }
      if (caption) {
        console.log("transcriptMessage:" + transcriptMessages[0].slice(5));
        setCaptionText(transcriptMessages[0].slice(5));
      }
    }
  }, [transcriptMessages, caption]);

  const handleToggleCaption = () => {
    console.log("handleToggleCaption");
    setCaption((prevCaption) => !prevCaption);
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
    const element = document.createElement("a");
    const file = new Blob([transcriptMessages.reverse().join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const handleCancelSpeaking = () => {
    console.log("handleCancelSpeaking");
    // onUserInput("cancel-speaking");
    setCancelSpeaking(true);
    setBotResponse("");
  };

  // Handle language/voice change in TextToSpeech component
  const handleLangChanged = async (lang: string) => {
    console.log("handleLangChanged: old %s new %s", language, lang);
    setLanguage(lang);
  };

  const handleSendJobDescription = async () => {
    console.log("handleSendJobDescription");
    onUserInput(jobDescription);
    setJobDescription("");
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
        <TextToSpeech
          cancelSpeaking={cancelSpeaking}
          text={botResponse}
          onLangChanged={handleLangChanged}
        />
        <div className="display-vertical">
          <div
            className="wrapper"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              paddingTop: "2vh",
              paddingBottom: "2vh",
              paddingLeft: "3vw",
              paddingRight: "2vw",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                visibility: showWebcamVideo ? "hidden" : "visible",
              }}
            >
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                placeholder="Copy and paste job description here... and click 'Send' button."
                style={{
                  width: "51.5vw",
                  height: "50vh",
                  marginLeft: "5vh",
                  marginTop: "2vh",
                  overflow: "auto",
                }}
              />
              <div className="display-horizontal">
                <button
                  className="button"
                  onClick={handleToggleWebcamVideo}
                  style={{
                    backgroundColor: "#fff",
                    marginTop: "1vh",
                    marginLeft: "6vw",
                    gap: "2vw",
                  }}
                >
                  Close
                </button>
                <button
                  className="button"
                  onClick={handleSendJobDescription}
                  style={{
                    marginTop: "1vh",
                    backgroundColor: jobDescription !== "" ? "#fff" : "#d8d8d8",
                    cursor: jobDescription !== "" ? "pointer" : "not-allowed",
                  }}
                  type="submit"
                >
                  Send
                </button>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                visibility: showWebcamVideo ? "visible" : "hidden",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={true}
                width="100%"
                height="100%"
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
            className="caption-text"
            style={{
              marginTop: "52vh",
              width: "51vw",
              visibility: caption && showWebcamVideo ? "visible" : "hidden",
            }}
          >
            {captionText}
          </div>
          <div
            className="display-horizontal"
            style={{
              marginTop: "5vh",
              marginLeft: "2vw",
              marginBottom: "0vh",
            }}
          >
            <button
              onClick={handleDownloadTranscript}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "12px 0px 0px 0px",
                visibility: showWebcamVideo ? "visible" : "hidden",
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
                visibility: showWebcamVideo ? "visible" : "hidden",
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
              showMicrophoneButton={showWebcamVideo}
            />
            <button
              onClick={handleCancelSpeaking}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "12px 0px 0px 0px",
                visibility: showWebcamVideo ? "visible" : "hidden",
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
                visibility: showWebcamVideo ? "visible" : "hidden",
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

  return <div>{showWebcam && webcamWindow()}</div>;
};

export default WebcamRecorder;
