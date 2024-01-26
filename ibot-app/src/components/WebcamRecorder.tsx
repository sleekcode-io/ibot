import React, { useState, useRef, useEffect } from "react";
import TranscriptDownloadImage from "../images/transcript-download.png";
//import VideoDownloadImage from "../images/video-download.png";
import CaptionImage from "../images/subtitles.png";
import CancelSpeakingImage from "../images/cancel-speaking.png";
//import JobDescriptionImage from "../images/job-description.png";
import SpeechToText from "./SpeechToText";
import "../styles/WebcamRecorder.css";
import "../App.css";

// TODO: The recording-related code is not used in the current version of the app.
// It is commented out and kept here for future reference.

interface WebcamRecorderProps {
  sessionId: number;
  showWebcam: boolean;
  selectedLanguage: string;
  transcriptMessages: string[];
  onUserInput: (text: string) => void;
  errorMessage: string;
}

const WebcamRecorder: React.FC<WebcamRecorderProps> = ({
  sessionId,
  showWebcam,
  selectedLanguage,
  transcriptMessages,
  onUserInput,
  errorMessage,
}) => {
  const [caption, setCaption] = useState(false);
  const [captionText, setCaptionText] = useState<string>("Caption ON");

  const [recording, setRecording] = useState(false);
  //const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);

  // const [width, setWidth] = useState(400); // Initial width
  // const [height, setHeight] = useState(300); // Initial height

  const videoRef = useRef<HTMLVideoElement | null>(null);
  //const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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

    // Cleanup function for componentWillUnmount
    return () => {
      // Stop the recording if it's still in progress
      // if (
      //   mediaRecorderRef.current &&
      //   mediaRecorderRef.current.state === "recording"
      // ) {
      //   mediaRecorderRef.current.stop();
      // }
    };
  }, [showWebcam]);

  useEffect(() => {
    console.log("WebcamRecorder: transcriptMessage:" + transcriptMessages[0]);

    if (transcriptMessages.length > 0) {
      if (caption) {
        console.log("transcriptMessage:" + transcriptMessages[0].slice(5));
        setCaptionText(transcriptMessages[0].slice(5));
      }
      // if (
      //   transcriptMessages[0].includes("job description") ||
      //   transcriptMessages[0].includes("details of the job")
      // ) {
      //   console.log("WebcamRecorder: showJobWindow");
      //   setShowWebcamWindow(false);
      //   setShowJobWindow(true);
      // }
    }
  }, [transcriptMessages, caption]);

  const handleToggleCaption = () => {
    console.log("handleToggleCaption");
    setCaption((prevCaption) => !prevCaption);
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
    onUserInput("cancel-speaking");
  };

  // Video recording code ---------------------------------------------
  // const chunksRef = useRef<Blob[]>([]);

  // const startRecording = () => {
  //   console.log("startRecording");
  //   try {
  //     const stream = (videoRef.current as HTMLVideoElement)
  //       .srcObject as MediaStream;
  //     mediaRecorderRef.current = new MediaRecorder(stream);
  //     mediaRecorderRef.current.ondataavailable = handleDataAvailable;
  //     mediaRecorderRef.current.onstop = handleStop;

  //     chunksRef.current = []; // Clear any previous chunks
  //     mediaRecorderRef.current.start();
  //     setRecording(true);
  //     //setCaptionText("Recording...");
  //   } catch (error) {
  //     console.error("Error accessing webcam:", error);
  //   }
  // };

  // const stopRecording = () => {
  //   console.log("stopRecording");
  //   if (mediaRecorderRef.current) {
  //     mediaRecorderRef.current.stop();
  //   }
  //   setRecording(false);
  // };

  // const handleDataAvailable = (event: BlobEvent) => {
  //   console.log("handleDataAvailable");
  //   if (event.data.size > 0) {
  //     chunksRef.current.push(event.data as never);
  //   }
  // };

  // const handleStop = () => {
  //   console.log("handleStop: recording " + recording);
  //   const blob = new Blob(chunksRef.current, { type: "video/webm" });
  //   const videoURL = URL.createObjectURL(blob);

  //   // Do something with the recorded video URL (e.g., save to server or display)
  //   console.log("Recorded video URL:", videoURL);

  //   // Update state with the recorded video URL
  //   setRecordedVideoURL(videoURL);

  //   // Reset state and chunks
  //   setRecording(false);
  //   //setCaptionText("Recording complete. Click 'Download' to save.");
  //   chunksRef.current = [];

  //   // Restart recording if needed
  //   // if (mediaRecorderRef.current) {
  //   //   mediaRecorderRef.current.start();
  //   //   setRecording(true);
  //   // }
  // };

  // const handleVideoDownload = () => {
  //   console.log("handleDownload");
  //   if (!recordedVideoURL) {
  //     // No video available to download
  //     return;
  //   }
  //   // Create a temporary anchor element
  //   const downloadLink = document.createElement("a");
  //   downloadLink.href = recordedVideoURL || "";
  //   downloadLink.download = "recorded-video.webm"; // Set the file name

  //   // Trigger a click on the anchor to start the download
  //   document.body.appendChild(downloadLink);
  //   downloadLink.click();

  //   // Remove the anchor from the DOM
  //   document.body.removeChild(downloadLink);
  // };

  // const closeWebcamWindow = () => {
  //   console.log("closeWebcamWindow");
  //   // Cleanup ongoing recording & Set webcam window invisible
  //   if (recording) {
  //     stopRecording();
  //   }
  // };

  // End video recording related code

  const webcamWindow = () => {
    console.log("webcamWindow");
    // Set webcam window visible
    return (
      <div
        className="webcam-container"
        style={{
          backgroundColor: "#96419c",
        }}
      >
        <div className="display-vertical">
          <div
            className="error-message"
            style={{
              visibility: errorMessage !== "" ? "visible" : "hidden",
            }}
          >
            {errorMessage}
          </div>
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={!recording}
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
          <div
            className="caption-text"
            style={{ visibility: caption ? "visible" : "hidden" }}
          >
            {caption && captionText}
          </div>
          <div
            className="display-horizontal"
            style={{ marginTop: "2vh", marginBottom: "3vh" }}
          >
            {/* {recording ? (
                <button
                  className="webcam-button"
                  onClick={stopRecording}
                  style={{
                    backgroundColor: "#fff",
                  }}
                >
                  <div className="tooltip">
                    <div className="recording-circle"></div>
                    <span className="tooltiptext">Stop recording</span>
                  </div>
                </button>
              ) : (
                <button
                  className="webcam-button"
                  onClick={startRecording}
                  style={{
                    backgroundColor: "#fff",
                  }}
                >
                  <div className="tooltip">
                    <div className="no-recording-circle"></div>
                    <span className="tooltiptext">Start recording</span>
                  </div>
                </button>
              )}
              <button
                className="webcam-button"
                onClick={handleVideoDownload}
                style={{
                  backgroundColor: recordedVideoURL ? "#fff" : "#ccc",
                }}
              >
                <div className="tooltip">
                  <img
                    src={VideoDownloadImage}
                    alt="D"
                    width="24px"
                    height="24px"
                  />
                  {recordedVideoURL ? (
                    <span className="tooltiptext">Download recorded video</span>
                  ) : (
                    <span className="tooltiptext">
                      No video available for download
                    </span>
                  )}
                </div>
              </button> */}
            <button
              className="webcam-button"
              onClick={handleDownloadTranscript}
              style={{
                backgroundColor: transcriptMessages.length ? "#fff" : "#ccc",
              }}
            >
              <div className="tooltip">
                <img
                  src={TranscriptDownloadImage}
                  alt="D"
                  width="24px"
                  height="24px"
                />
                {transcriptMessages.length ? (
                  <span className="tooltiptext">
                    Download conversation transcript
                  </span>
                ) : (
                  <span className="tooltiptext">
                    No transcript data for download
                  </span>
                )}
              </div>
            </button>
            <button
              className="webcam-button"
              onClick={handleToggleCaption}
              style={{
                backgroundColor: caption ? "#fff" : "#ccc",
              }}
            >
              <div className="tooltip">
                <img src={CaptionImage} alt="D" width="28px" height="28px" />
                {caption ? (
                  <span className="tooltiptext">Caption OFF</span>
                ) : (
                  <span className="tooltiptext">Caption ON</span>
                )}
              </div>
            </button>
            <SpeechToText
              sessionId={sessionId}
              onTextCaptured={onUserInput}
              selectedLanguage={selectedLanguage}
            />
            <button
              //className="webcam-button"
              onClick={handleCancelSpeaking}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "2px 0px 0px 0px",
              }}
            >
              <img
                src={CancelSpeakingImage}
                alt="S"
                width="58px"
                height="58px"
              />
            </button>
            {/* <button
              //className="webcam-button"
              onClick={handleToggleJobWindow}
              style={{
                backgroundColor: "transparent",
                border: "none",
                padding: "2px 0px 0px 0px",
              }}
            >
              <div className="tooltip">
                <img
                  src={JobDescriptionImage}
                  alt="J"
                  width="46px"
                  height="46px"
                />
                <span className="tooltiptext">Send job description</span>
              </div>
            </button> */}
          </div>
        </div>
      </div>
    );
  };

  return <div>{showWebcam && webcamWindow()}</div>;
};

export default WebcamRecorder;
