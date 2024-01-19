import React, { useState, useRef, useEffect } from "react";
import "../styles/WebcamRecorder.css";
import "../App.css";
import DownloadImage from "../images/downloads.png";
import closeWebcamImage from "../images/exit.png";
import { start } from "repl";

interface WebcamRecorderProps {
  onCloseWebcam: () => void;
}

const WebcamRecorder: React.FC<WebcamRecorderProps> = ({ onCloseWebcam }) => {
  const [recording, setRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    console.log("WebcamRecorder: FETCH_MEDIA");
    const startWebcam = async () => {
      try {
        // Get user media (camera) stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
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
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Close webcam window
  const closeWebcam = () => {
    onCloseWebcam();
  };

  const startRecording = () => {
    console.log("startRecording");
    try {
      const stream = (videoRef.current as HTMLVideoElement)
        .srcObject as MediaStream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = handleStop;

      chunksRef.current = []; // Clear any previous chunks
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopRecording = () => {
    console.log("stopRecording");
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleDataAvailable = (event: BlobEvent) => {
    console.log("handleDataAvailable");
    if (event.data.size > 0) {
      chunksRef.current.push(event.data as never);
    }
  };

  const handleStop = () => {
    console.log("handleStop: recording " + recording);
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const videoURL = URL.createObjectURL(blob);

    // Do something with the recorded video URL (e.g., save to server or display)
    console.log("Recorded video URL:", videoURL);

    // Update state with the recorded video URL
    setRecordedVideoURL(videoURL);

    // Reset state and chunks
    setRecording(false);
    chunksRef.current = [];

    // Restart recording if needed
    // if (mediaRecorderRef.current) {
    //   mediaRecorderRef.current.start();
    //   setRecording(true);
    // }
  };

  const handleDownload = () => {
    console.log("handleDownload");
    // Create a temporary anchor element
    const downloadLink = document.createElement("a");
    downloadLink.href = recordedVideoURL || "";
    downloadLink.download = "recorded-video.webm"; // Set the file name

    // Trigger a click on the anchor to start the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Remove the anchor from the DOM
    document.body.removeChild(downloadLink);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted={!recording}>
        <track kind="captions" />
      </video>
      <div className="row" style={{ marginTop: "5px" }}>
        {recording ? (
          <button
            onClick={stopRecording}
            style={{
              backgroundColor: "#fff",
              border: "none",
              width: "33px",
              height: "33px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            <div className="tooltip">
              <div className="recording-circle"></div>
              <span className="tooltiptext">Stop recording</span>
            </div>
          </button>
        ) : (
          <button
            onClick={startRecording}
            style={{
              backgroundColor: "#fff",
              paddingTop: "px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
            }}
          >
            <div className="tooltip">
              <div className="no-recording-circle"></div>
              <span className="tooltiptext">Start recording</span>
            </div>
          </button>
        )}
        <button
          onClick={handleDownload}
          style={{
            backgroundColor: recordedVideoURL ? "#fff" : "#ccc",
            border: "none",
            cursor: "pointer",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
          }}
        >
          <div className="tooltip">
            <img src={DownloadImage} alt="D" width="16px" height="16px" />
            <span className="tooltiptext">Download recorded video</span>
          </div>
        </button>
        <button
          onClick={closeWebcam}
          style={{
            backgroundColor: "#fff",
            border: "none",
            cursor: "pointer",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
          }}
        >
          <div className="tooltip">
            <img src={closeWebcamImage} alt="D" width="16px" height="16px" />
            <span className="tooltiptext">Close webcam</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default WebcamRecorder;
