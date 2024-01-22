// Session.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import TextToSpeech from "./TextToSpeech";
import SpeechToText from "./SpeechToText";
import "../styles/Sessions.css";
import WebcamRecorder from "./WebcamRecorder";
import Chat from "./Chat";
import { on } from "events";
//import Webcam from "react-webcam";

const Session: React.FC = () => {
  const [botResponse, setBotResponse] = useState<string>("");
  const [userResponse, setUserResponse] = useState<string>("");
  const [sessionId, setSessionId] = useState(-1);
  const [sessionStatus, setSessionStatus] = useState(false);
  const [chatWindowStatus, setChatWindowStatus] = useState(false);
  const [webcamWindowStatus, setWebcamWindowStatus] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [transcriptMessages, setTranscriptMessages] = useState<string[]>([]);

  let curSessionId = -1;

  // Invoked on component mount
  useEffect(() => {
    console.log("Session: status " + sessionStatus);
    // Keep session alive at all times
    if (!sessionStatus) {
      startSession();
    }
  }, [sessionStatus]);

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

  const onChatWindowStatus = async (status: boolean) => {
    console.log("onChatWindowStatus: " + status);
    setChatWindowStatus(status);
    if (status) {
      // If chat window is open, close Webcam window
      setWebcamWindowStatus(false);
    }
  };

  const onWebcamWindowStatus = async (status: boolean) => {
    console.log("onWebcamWindowStatus: " + status);
    setWebcamWindowStatus(status);
    if (status) {
      // If webcam window is open, close Chat window
      setChatWindowStatus(false);
    }
  };

  const handleToggleChatWindowStatus = () => {
    console.log("handleToggleChatWindowStatus: " + chatWindowStatus);
    setChatWindowStatus(!chatWindowStatus);
  };

  const handleToggleWebcamWindowStatus = () => {
    console.log("handleToggleWebcamWindowStatus: " + webcamWindowStatus);
    setWebcamWindowStatus(!webcamWindowStatus);
  };

  const addTranscriptMessage = (message: string) => {
    console.log("addTranscriptMessages: " + message);
    setTranscriptMessages((prevMessages) => [message, ...prevMessages]);
  };

  const handleUserResponse = async (response: string) => {
    console.log("handleUserResponse: " + response);
    if (sessionId < 0) {
      return; // there is no session open, do nothing...
    } else if (response === ".") {
      // User pressed stop speaking button
      console.log("Session id: %d userResponse", sessionId, userResponse);

      if (userResponse === "") return;

      let message = "You> " + userResponse;
      addTranscriptMessage(message);

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
      if (webcamWindowStatus) {
        setBotResponse(botResponse.data.response); // Speak
      }
      message = "iBot> " + botResponse.data.response;
      addTranscriptMessage(message);
      // }
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
        marginTop: "30px",
      }}
    >
      <div style={{ marginTop: "0px" }}>
        <TextToSpeech
          text={botResponse}
          sessionStatus={sessionStatus}
          onLangChanged={handleLangChanged}
        />

        <Chat
          sessionStatus={sessionStatus}
          chatWindowStatus={chatWindowStatus}
          selectedLanguage={language}
          chatMessages={transcriptMessages}
          onUserInput={handleUserResponse}
          onChatWindowStatus={onChatWindowStatus}
        />
        <WebcamRecorder
          sessionStatus={sessionStatus}
          webcamWindowStatus={webcamWindowStatus}
          selectedLanguage={language}
          transcriptMessages={transcriptMessages}
          onUserInput={handleUserResponse}
          onWebcamWindowStatus={onWebcamWindowStatus}
        />
      </div>
    </div>
  );
};

export default Session;
