import React, { useState, useRef, useEffect } from "react";
import TranscriptDownloadImage from "../images/download-file.png";
import CaptionImage from "../images/cc.png";
import CancelSpeakingImage from "../images/silent-blue-1.png";
import VideoImage from "../images/video-camera.png";
import TextImage from "../images/text.png";
import closeButtonImage from "../images/cross.png";
import sendButtonImage from "../images/send.png";
import SpeechToText from "./SpeechToText";
import TextToSpeech from "./TextToSpeech";
import "../App.css";
import "../styles/WebcamRecorder.css";
import { WebcamRecorderProps } from "./Interfaces";

const WebcamRecorder: React.FC<WebcamRecorderProps> = ({
  sessionId,
  showWebcam,
  //botResponse,
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
    setBotResponse(""); // Clear bot response to avoid repeat speaking
  }, [showWebcam]);

  useEffect(() => {
    console.log(
      "WebcamRecorder: transcriptMessage: %d",
      transcriptMessages.length
    );

    if (transcriptMessages.length > 0) {
      console.log(
        "WebcamRecorder: processed: " + transcriptMessages[0].processed
      );
      if (
        transcriptMessages[0].from === "iBot" &&
        transcriptMessages[0].processed === false
      ) {
        // TODO: last bot response to keep repeating if we leave and switch back to webcam window
        setBotResponse(transcriptMessages[0].msg);
        transcriptMessages[0].processed = true;
      }
      if (caption) {
        console.log("transcriptMessage:" + transcriptMessages[0].msg);
        setCaptionText(transcriptMessages[0].msg);
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
    onUserInput("Here is the job description: " + jobDescription);
    onUserInput("done-speaking");
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
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                placeholder="Copy and paste job description here... and click 'Send' button."
                style={{
                  width: "90%",
                  height: "80%",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "4vh",
                  marginRight: "4vh",
                  marginTop: "2vh",
                  marginBottom: "5vh",
                  overflow: "auto",
                }}
              />
              <div className="display-horizontal" style={{ gap: "5%" }}>
                <button
                  onClick={handleToggleWebcamVideo}
                  // className="button"
                  // style={{
                  //   backgroundColor: "#fff",
                  //   gap: "2vw",
                  // }}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "12px 0px 0px 0px",
                    //visibility: showWebcamVideo ? "visible" : "hidden",
                  }}
                >
                  <img
                    src={closeButtonImage}
                    alt="D"
                    width="60px"
                    height="60px"
                  />
                </button>
                <button
                  onClick={handleSendJobDescription}
                  // className="button"
                  // style={{
                  //   backgroundColor: jobDescription !== "" ? "#fff" : "#d8d8d8",
                  //   cursor: jobDescription !== "" ? "pointer" : "not-allowed",
                  // }}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: "12px 0px 0px 0px",
                    opacity: jobDescription !== "" ? 1 : 0.7,
                    cursor: jobDescription !== "" ? "pointer" : "not-allowed",
                    //visibility: showWebcamVideo ? "visible" : "hidden",
                  }}
                  type="submit"
                >
                  <img
                    src={sendButtonImage}
                    alt="D"
                    width="50px"
                    height="50px"
                  />
                </button>
              </div>
            </div>
            <div
              style={{
                //position: "absolute",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
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
              marginTop: "-5vh",
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
                opacity: botResponse !== "" ? 1 : 0.6,
                cursor: botResponse !== "" ? "pointer" : "not-allowed",
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
