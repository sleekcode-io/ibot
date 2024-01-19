import React, { useState, useRef } from "react";

const WebcamRecorder = () => {
  const [recording, setRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        (videoRef.current as HTMLVideoElement).srcObject = stream;

        const mediaRecorderRef = useRef<MediaRecorder | null>(null);
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.ondataavailable = handleDataAvailable;
          mediaRecorderRef.current.onstop = handleStop;
          mediaRecorderRef.current.start();
        }
        setRecording(true);
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data as never);
    }
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const videoURL = URL.createObjectURL(blob);

    // Do something with the recorded video URL (e.g., save to server or display)
    console.log("Recorded video URL:", videoURL);

    // Reset state and chunks
    setRecording(false);
    chunksRef.current = [];

    // Reset video element source
    if (videoRef.current) {
      (videoRef.current as HTMLVideoElement).srcObject = null;
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted={!recording} />
      <div>
        {recording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>
    </div>
  );
};

export default WebcamRecorder;
