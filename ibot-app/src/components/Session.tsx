// Session.tsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import TextToSpeech from "./TextToSpeech";
import SpeechToText from "./SpeechToText";
import "../styles/Sessions.css";
import TranscriptImage from "../images/text-file.png";
import DownloadImage from "../images/downloads.png";
import { send } from "process";
import MicrophoneImage from "../images/mic.png";
import iBotAvatar from "../images/robot-avatar-2.png";
import userAvatar from "../images/user-avatar.png";
import WebcamRecorder from "./WebcamRecorder";
import Webcam from "react-webcam";

// const WebcamComponent = () => {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     const startWebcam = async () => {
//       try {
//         // Get user media (camera) stream
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//         });

//         // Set the video stream as the source for the video element
//         if (videoRef.current) {
//           (videoRef.current as HTMLVideoElement).srcObject = stream;
//         }
//       } catch (error) {
//         console.error("Error accessing webcam:", error);
//       }
//     };

//     startWebcam();

//     // Cleanup function for componentWillUnmount
//     return () => {
//       // TODO: Stop the video stream when the component is unmounted
//     };
//   }, []);

//   return <video ref={videoRef} autoPlay playsInline />;
// };

const Session: React.FC = () => {
  const [botResponse, setBotResponse] = useState<string>("");
  const [userResponse, setUserResponse] = useState<string>("");
  const [sessionId, setSessionId] = useState(-1);
  const [sessionStatus, setSessionStatus] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [showVideo, setShowVideo] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [mute, setMute] = useState(false);

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
    console.log("handleToggleVideo");
    setShowVideo((prevShowVideo) => !prevShowVideo);
  };

  const handleToggleShowTranscript = () => {
    if (showTranscript) {
      // Clear transcript display
    }
    setShowTranscript((prevShowTranscript) => !prevShowTranscript);
  };

  const handleDownloadTranscript = () => {
    console.log("handleDownloadTranscript");
    // Download transcript
    const element = document.createElement("a");
    const file = new Blob([chatMessages.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const addChatMessages = (message: string) => {
    setChatMessages((prevMessages) => [message, ...prevMessages]);
  };

  // This function does not pick up Enter key press, only text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //console.log("handleInputChange: " + e.target.value);
    if (!showTranscript) {
      setShowTranscript(true); // user uses text input, enable show transcript
    }
    // pick up user's kb input here ...
    setUserInput(e.target.value);
    setUserResponse(e.target.value);
  };

  // This function picks up Enter key press as well as text input (skipped here)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //console.log("handleKeyPress: " + e.key + "," + handleUserResponse);
    if (e.key === "Enter") {
      // User pressed the Enter key
      if (userInput.trim() !== "") {
        // User entered a non-empty string, send to bot for processing
        // and clear the input field
        handleUserResponse(".");
      }
    }
  };

  const handleToggleMicrophone = () => {
    console.log("handleToggleMicrophone");
    // Toggle microphone on/off
    setMute((prevMute) => !prevMute);
  };

  const handleMessageDisplay = (message: string) => {
    console.log("handleMessageDisplay: " + message);
    // Display message
    if (message.slice(0, 5) === "iBot>") {
      // Bot's message
      return (
        <div
          className="bot-message-container"
          style={{
            display: "flex",
            justifyContent: "start",
            alignItems: "top",
            marginBottom: "10px",
          }}
        >
          <div
            className="bot-avatar"
            style={{
              marginLeft: "0px",
              marginTop: "0px",
              padding: "0px 8px",
              alignItems: "center",
            }}
          >
            <img src={iBotAvatar} alt="iBot" width="40px" height="40px" />
          </div>
          <div
            className="bot-message"
            style={{
              display: "flex",
              marginTop: "20px",
              padding: "8px 8px",
              border: "none",
              borderRadius: "0px 15px 15px 15px",
              backgroundColor: "#803d84",
              justifyContent: "start",
              color: "#fff",
            }}
          >
            {message}
          </div>
        </div>
      );
    } else {
      return (
        <div
          className="user-message-container"
          style={{
            display: "flex",
            justifyContent: "end",
            alignItems: "top",
            marginBottom: "10px",
            //marginTop: "10px",
          }}
        >
          <div
            className="user-message"
            style={{
              display: "flex",
              marginTop: "20px",
              padding: "8px 8px",
              border: "none",
              borderRadius: "15px 0px 15px 15px",
              backgroundColor: "#7a69f5",
              justifyContent: "start",
              color: "#fff",
            }}
          >
            {message}
          </div>
          <div
            className="user-avatar"
            style={{
              marginLeft: "0px",
              padding: "0px 8px",
              alignItems: "center",
            }}
          >
            <img src={userAvatar} alt="iBot" width="40px" height="40px" />
          </div>
        </div>
      );
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

  const handleUserResponse = async (response: string) => {
    console.log("handleUserResponse: " + response);
    if (sessionId < 0) {
      return; // there is no session open, do nothing...
    } else if (response === ".") {
      // User pressed stop speaking button
      console.log("Session id: %d userResponse", sessionId, userResponse);

      if (userResponse === "") return;

      if (showTranscript) {
        let message = "You> " + userResponse;
        addChatMessages(message);
      }
      setUserInput(""); // Clear text input field
      // Send user's response to bot
      const botResponse = await axios.post(
        "http://localhost:5205/user-message",
        {
          id: sessionId,
          content: userResponse,
        }
      );
      setUserResponse(""); // Clear user's response buffer

      // Handle bot feedback as needed ...
      setBotResponse(botResponse.data.response); // Speak
      if (showTranscript) {
        let message = "iBot> " + botResponse.data.response;
        addChatMessages(message);
      }
    } else {
      setUserResponse(response);
      setUserInput(response);
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
        //alignItems: "center",
        marginTop: "30px",
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
        <div
          className="chat-window"
          style={{
            background: "#403d84",
            color: "#ddd",
            borderRadius: "5px",
            width: "50%", // Adjusted width
            height: "520px", // Adjusted height
            padding: "10px",
            marginBottom: "20px",
            marginTop: "20px",
            textAlign: "start",
            lineHeight: "1.5",
            fontSize: "16px",
            overflow: "auto", // Enable scrolling if the content exceeds the box size
            resize: "horizontal", // Allow both horizontal and vertical resizing
          }}
        >
          <div
            className="chat-messages-container"
            style={{
              padding: "0px",
              display: "flex",
              flexDirection: "column-reverse",
              height: "485px",
              overflowY: "auto",
              //flex: 1,
            }}
          >
            {chatMessages.map((message: string, index: number) => (
              <div key={index} className="chat-message">
                {handleMessageDisplay(message)}
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="input-text"
              placeholder="Type your message...press [Enter] to send"
            />
            <button
              onClick={handleToggleMicrophone}
              style={{
                padding: "6px 10px",
                backgroundColor: mute ? "white" : "#d8d8d8",
                border: "none",
                cursor: "pointer",
                borderRadius: "20px",
              }}
            >
              <div className="tooltip">
                <img src={MicrophoneImage} alt="T" width="16px" height="16px" />
                {mute ? (
                  <span className="tooltiptext">Mute</span>
                ) : (
                  <span className="tooltiptext">Unmute</span>
                )}
              </div>
            </button>
            <button
              onClick={handleToggleShowTranscript}
              style={{
                padding: "6px 10px",
                backgroundColor: showTranscript ? "white" : "#d8d8d8",
                border: "none",
                cursor: "pointer",
                borderRadius: "16px",
              }}
            >
              <div className="tooltip">
                <img src={TranscriptImage} alt="T" width="16px" height="16px" />
                {showTranscript ? (
                  <span className="tooltiptext">Hide transcript</span>
                ) : (
                  <span className="tooltiptext">Show transcript</span>
                )}
              </div>
            </button>
            <button
              onClick={handleDownloadTranscript}
              style={{
                padding: "6px 9.5px",
                backgroundColor: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: "16px",
              }}
            >
              <div className="tooltip">
                <img src={DownloadImage} alt="D" width="16px" height="16px" />
                <span className="tooltiptext">Download transcript</span>
              </div>
            </button>
          </div>
        </div>
        {
          // Show webcam video if showVideo is true
          showVideo ? (
            <div
              style={{
                background: "#803d84",
                color: "#ddd",
                borderRadius: "5px",
                width: "50%", // Adjusted width
                maxWidth: "640px",
                height: "520px", // Adjusted height
                writingMode: "inherit",
                textOrientation: "mixed",
                padding: "10px",
                marginBottom: "10px",
                marginTop: "10px",
                marginLeft: "10px",
                alignItems: "top",
                fontSize: "20px",
                fontWeight: "700",
                resize: "horizontal", // Allow both horizontal resizing
                overflow: "auto", // Enable scrolling if the content exceeds the box size
              }}
            >
              <WebcamRecorder onCloseWebcam={handleToggleVideo} />
            </div>
          ) : (
            <div
              onClick={handleToggleVideo}
              style={{
                background: "#803d84",
                color: "#ddd",
                borderRadius: "5px",
                width: "2%", // Adjusted width
                maxWidth: "640px",
                height: "520px", // Adjusted height
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                padding: "10px",
                marginBottom: "10px",
                marginTop: "10px",
                marginLeft: "10px",
                alignItems: "top",
                fontSize: "20px",
                fontWeight: "700",
                resize: "horizontal", // Allow both horizontal resizing
                overflow: "auto", // Enable scrolling if the content exceeds the box size
              }}
            >
              Webcam
            </div>
          )
        }
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
