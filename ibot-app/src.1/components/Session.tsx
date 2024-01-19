// Session.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import TextToSpeech from "./TextToSpeech";
import SpeechToText from "./SpeechToText";
//import WebcamImage from "../images/webcam.png";

const WebcamComponent = () => {
  const videoRef = useRef(null);

  useEffect(() => {
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
      // TODO: Stop the video stream when the component is unmounted
    };
  }, []);

  return <video ref={videoRef} autoPlay playsInline />;
};

const Session: React.FC = () => {
  const [textArea, setTextArea] = useState("");
  const [botResponse, setBotResponse] = useState("");
  const [userResponse, setUserResponse] = useState("");
  const [sessionId, setSessionId] = useState(-1);
  const [sessionStatus, setSessionStatus] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [showVideo, setShowVideo] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  let curSessionId = -1;

  // Invoked on component mount
  useEffect(() => {
    console.log("Session: status " + sessionStatus);
    // Keep session alive at all times
    if (!sessionStatus) {
      startSession();
    }
  }, [sessionStatus]);

  const handleToggleVideo = () => {
    setShowVideo((prevShowVideo) => !prevShowVideo);
  };

  const handleToggleShowTranscript = () => {
    if (showTranscript) {
      setTextArea(""); // Clear text area
    }
    setShowTranscript((prevShowTranscript) => !prevShowTranscript);
  };

  const handleSendTextEvent = () => {
    if (!showTranscript) {
      if (textArea.trim()) {
        sendText();
      }
    } else {
      handleToggleShowTranscript();
    }
  };

  // Cleanup hooks when user closes tab or browser or navigate away. ---------
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("INTEVIEW: reload page");
      event.preventDefault();
      // Custom logic to handle the refresh
      // Display a confirmation message or perform necessary actions
      endSession();
    };
    // Add the event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function for componentWillUnmount
    return () => {
      // Remove the event listener to avoid memory leaks
      console.log(">> Remove beforeUnload event listener");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []); // Empty dependency array ensures the effect runs only once (on mount) and cleans up on unmount

  // End cleanup code ---------------------------------------------------------------------------

  const startSession = async () => {
    // Start the session
    if (curSessionId >= 0) {
      return; // There is already a session open, do nothing...
    }
    curSessionId = 0; // Set to 0 to indicate session is starting to prevent multiple start

    try {
      const response = await axios.post("http://localhost:5205/start-session", {
        content: "",
      });

      setSessionId(response.data.sessionId);
      curSessionId = response.data.sessionId;
      setUserResponse("");
      setBotResponse("");
      setSessionStatus(true);
      console.log("startSession: STARTED (sessionId: %d)", curSessionId);
      console.log(">> user response: " + userResponse);
      console.log(">> bot response: " + botResponse);
    } catch (error) {
      console.error("startSession error: " + error);
    }
  };

  const endSession = async () => {
    // End current session
    //console.log("Session ended %d", curSessionId);
    if (curSessionId < 0) {
      return; // there is no session open, do nothing...
    }
    console.log("endSession: ENDED session %d", curSessionId);
    setUserResponse("");
    setBotResponse("");
    let sessId = curSessionId;
    curSessionId = -1;

    // Will cancel ongoing speech, stop listening here ...
    await axios.post("http://localhost:5205/end-session", {
      id: sessId,
    });
    curSessionId = -1;
    setSessionId(-1);
    setSessionStatus(false);
  };

  const sendText = async () => {
    // Send job description to bot
    if (sessionId < 0) {
      return; // there is no session open, do nothing...
    }

    // Send job description to the backend
    const botResponse = await axios.post("http://localhost:5205/user-message", {
      id: sessionId,
      content: textArea,
    });
    setTextArea(""); // Send ok, clear text area
    setBotResponse(botResponse.data.response); // Speak
  };

  const handleUserResponse = async (response: string) => {
    console.log("handleUserResponse: " + response);
    if (sessionId < 0) {
      return; // there is no session open, do nothing...
    } else if (response === ".") {
      // User pressed stop speaking button
      console.log("Session id: %d userResponse", sessionId, userResponse);

      if (userResponse === "") return;

      if (showTranscript) {
        setTextArea("user> " + userResponse); // Update text area
      }
      // Send user's response to bot
      const botResponse = await axios.post(
        "http://localhost:5205/user-message",
        {
          id: sessionId,
          content: userResponse,
        }
      );
      // Handle bot feedback as needed ...
      setBotResponse(botResponse.data.response); // Speak
      if (showTranscript) {
        setTextArea("iBot> " + botResponse.data.response); // Update text area
      }
    } else {
      setUserResponse(response);
    }
  };

  // Handle language/voice change in TextToSpeech component
  const handleLangChanged = async (lang: string) => {
    console.log("handleLangChanged: old %s new %s", language, lang);
    setLanguage(lang);
    setBotResponse(""); // Clear bot's response buffer
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "50px",
      }}
    >
      <div style={{ marginTop: "0px" }}>
        <TextToSpeech
          text={botResponse}
          sessionStatus={sessionStatus}
          onLangChanged={handleLangChanged}
        />
      </div>

      <div className="display">
        <textarea
          //onClick={handleToggleShowTranscript}
          style={{
            background: "#403d84",
            color: "#ddd",
            borderRadius: "5px",
            width: "50%", // Adjusted width
            height: "480px", // Adjusted height
            padding: "10px",
            marginBottom: "20px",
            marginTop: "20px",
            justifyContent: "flex-start",
            fontSize: "16px",
            resize: "horizontal", // Allow both horizontal and vertical resizing
            overflow: "auto", // Enable scrolling if the content exceeds the box size
          }}
          value={textArea}
          onChange={(e) => setTextArea(e.target.value)}
          placeholder={showTranscript ? "Transcript ..." : "Send Text ..."}
        />
        <div
          onClick={handleToggleVideo}
          style={{
            background: "#803d84",
            color: "#ddd",
            //transform: "rotateY(180deg)",
            borderRadius: "5px",
            width: showVideo ? "45%" : "1%", // Adjusted width
            height: "480px", // Adjusted height
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            padding: "10px",
            marginBottom: "20px",
            marginTop: "20px",
            fontSize: "18px",
            justifyContent: "flex-end",
            resize: "horizontal", // Allow both horizontal resizing
            overflow: "auto", // Enable scrolling if the content exceeds the box size
          }}
        >
          {showVideo ? <WebcamComponent /> : "Webcam"}
        </div>
        {/* <textarea
          onClick={handleToggleUserInputArea}
          style={{
            background: "#803d84",
            color: "#ddd",
            //transform: "rotateY(180deg)",
            borderRadius: "5px",
            width: showUserInputArea ? "45%" : "1%", // Adjusted width
            height: "480px", // Adjusted height
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            padding: "10px",
            marginBottom: "20px",
            marginTop: "20px",
            fontSize: "18px",
            justifyContent: "flex-end",
            resize: "horizontal", // Allow both horizontal resizing
            overflow: "auto", // Enable scrolling if the content exceeds the box size
          }}
          value={userInputArea}
          onChange={(e) => setUserInputArea(e.target.value)}
          //placeholder="When prompted, copy and paste job description and requirements here, then select Submit button ..."
        >
          {showUserInputArea && "Send Text"}
        </textarea> */}
      </div>
      <div className="row">
        <button
          //onClick={sendText}
          onClick={handleSendTextEvent}
          style={{
            padding: "10px 30px",
            cursor: "pointer",
            borderRadius: "35px 0px 0px 35px",
            fontWeight: "800",
            fontSize: "18px",
            backgroundColor: showTranscript ? "#ff6f95" : "#ff2963",
            color: "#fff",
            outline: "0",
          }}
          //disabled={!textArea.trim()}
        >
          Send Text
        </button>
        <button
          onClick={handleToggleShowTranscript}
          style={{
            padding: "10px 30px",
            cursor: "pointer",
            borderRadius: "0px 35px 35px 0px",
            fontWeight: "800",
            fontSize: "18px",
            backgroundColor: showTranscript ? "#ff2963" : "#ff6f95",
            color: "#fff",
            outline: "0",
            //marginLeft: "20px",
          }}
        >
          Transcript
        </button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <SpeechToText
          onTextCaptured={handleUserResponse}
          selectedLanguage={language}
          sessionStatus={sessionStatus}
        />
      </div>
    </div>
  );
};

export default Session;
