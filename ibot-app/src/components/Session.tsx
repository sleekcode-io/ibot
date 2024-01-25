// Session.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import TextToSpeech from "./TextToSpeech";
import WebcamRecorder from "./WebcamRecorder";
import JobForm from "./JobDescription";
import Chat from "./Chat";
import "../styles/Sessions.css";

const Session: React.FC = () => {
  const [botResponse, setBotResponse] = useState<string>("");
  const [userResponse, setUserResponse] = useState<string>("");
  const [sessionId, setSessionId] = useState<number>(-1);
  const [sessionStatus, setSessionStatus] = useState<boolean>(false);
  const [showJobWindow, setJobWindow] = useState<boolean>(false);
  const [showChatWindow, setChatWindow] = useState<boolean>(false);
  const [showWebcamWindow, setWebcamWindow] = useState<boolean>(false);
  const [language, setLanguage] = useState("en-US");
  const [transcriptMessages, setTranscriptMessages] = useState<string[]>([]);
  const [cancelSpeaking, setCancelSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  let curSessionId = -1;

  // Invoked on component mount
  useEffect(() => {
    console.log("Session: status " + sessionStatus);
    // Keep session alive at all times
    if (!sessionStatus) {
      startSession();
    }
  });

  // Cleanup hooks when user closes tab or browser or navigate away. ---------
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log("handleBeforeUnload: reload page");
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
      //window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }); // Empty dependency array ensures the effect runs only once (on mount) and cleans up on unmount

  // End cleanup code ---------------------------------------------------------------------------

  const startSession = async () => {
    // Start the session
    if (curSessionId >= 0) {
      return; // There is already a session open, do nothing...
    }
    curSessionId = 0; // Set to 0 to indicate session is starting to prevent multiple start
    let response = null;
    try {
      response = await axios.post("http://localhost:5205/start-session", {
        content: "",
      });
    } catch (e: unknown) {
      let error = "";
      if (typeof e === "string") {
        error = e.toUpperCase();
      } else if (e instanceof Error) {
        error = e.message;
      }
      console.error("startSession error: " + error);
      setErrorMessage(error);
      curSessionId = -1;
      let msg =
        "Error connecting with server (" +
        error +
        "). Check your connection and/or reload browaser. ";
      setErrorMessage(msg);
      return;
    }
    setSessionId(response.data.sessionId);
    curSessionId = response.data.sessionId;
    setUserResponse("");
    setBotResponse("");
    setErrorMessage(""); // Clear error message
    setSessionStatus(true);
    console.log("startSession: STARTED (sessionId: %d)", curSessionId);
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

  const handleToggleJobWindow = () => {
    console.log("handleToggleJobWindow: " + showJobWindow);
    if (!showJobWindow) {
      // Close chat display, if it is open
      if (showChatWindow) {
        setChatWindow((prevShowChatWindows) => !prevShowChatWindows);
      }
      // Close webcam display, if it is open
      if (showWebcamWindow) {
        setWebcamWindow((prevShowWebcamWindows) => !prevShowWebcamWindows);
      }
    }
    setJobWindow((prevShowJobWindow) => !prevShowJobWindow);
  };

  const handleToggleChat = () => {
    console.log("handleToggleChat: " + showChatWindow);
    if (!showChatWindow) {
      // Close Webcam display, if it is open
      if (showWebcamWindow) {
        setWebcamWindow((prevShowWebcamWindows) => !prevShowWebcamWindows);
      }
      // Close Job display, if it is open
      if (showJobWindow) {
        setJobWindow((prevShowJobWindow) => !prevShowJobWindow);
      }
    }
    setChatWindow((prevShowChatWindows) => !prevShowChatWindows);
  };

  const handleToggleWebcam = () => {
    console.log("handleToggleWebcam: " + showWebcamWindow);
    if (!showWebcamWindow) {
      // Close chat display, if it is open
      if (showChatWindow) {
        setChatWindow((prevShowChatWindows) => !prevShowChatWindows);
      }
      // Close Job display, if it is open
      if (showJobWindow) {
        setJobWindow((prevShowJobWindow) => !prevShowJobWindow);
      }
    }
    setWebcamWindow((prevShowWebcamWindows) => !prevShowWebcamWindows);
  };

  const addTranscriptMessage = (message: string) => {
    console.log("addTranscriptMessages: " + message);
    setTranscriptMessages((prevMessages) => [message, ...prevMessages]);
  };

  const handleUserResponse = async (response: string) => {
    console.log("handleUserResponse: " + response);
    if (sessionId < 0) {
      return; // there is no session open, do nothing...
    } else if (response === "done-speaking") {
      // User pressed stop speaking button
      console.log("Session id: %d userResponse", sessionId, userResponse);

      if (userResponse === "") return;

      let message = "You> " + userResponse;
      addTranscriptMessage(message);
      setCancelSpeaking(false); // reset cancel speaking flag

      // Send user's response to bot
      let botResponse = null;
      try {
        botResponse = await axios.post("http://localhost:5205/user-message", {
          id: sessionId,
          content: userResponse,
        });
      } catch (e: unknown) {
        let error = "";
        if (typeof e === "string") {
          error = e.toUpperCase();
        } else if (e instanceof Error) {
          error = e.message;
        }
        console.error("handleUserResponse error: " + error);
        let msg =
          "Error communicating with server (" +
          error +
          "). Check your connection and/or reload browser to restart. ";
        setErrorMessage(msg);
        return;
      }
      setUserResponse(""); // Clear user's response buffer

      // Handle bot feedback as needed ...
      if (showWebcamWindow) {
        setBotResponse(botResponse.data.response); // Speak
      }
      message = "iBot> " + botResponse.data.response;
      addTranscriptMessage(message);
      // }
    } else if (response === "cancel-speaking") {
      setCancelSpeaking(true); // stop speaking
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

  const handleFormSubmit = (data: any) => {
    console.log("handleFormSubmit: " + data);
  };

  return (
    <div className="display-vertical">
      <div className="session-container">
        <TextToSpeech
          cancelSpeaking={cancelSpeaking}
          text={botResponse}
          onLangChanged={handleLangChanged}
        />
        <button
          className="job-toggle-button"
          onClick={handleToggleJobWindow}
          style={{
            background: showJobWindow ? "#96419c" : "#803d84",
          }}
        >
          Job Tittle and Description
        </button>

        <JobForm
          showJobWindow={showJobWindow}
          onSubmit={handleFormSubmit}
          errorMessage={errorMessage}
        />

        <div
          className="display-horizontal"
          style={{ marginTop: showJobWindow ? "6.5vh" : "2vh" }}
        >
          <button
            className="chat-toggle-button"
            onClick={handleToggleChat}
            style={{
              background: showChatWindow ? "#96419c" : "#803d84",
            }}
          >
            Chat
          </button>
          <button
            className="webcam-toggle-button"
            onClick={handleToggleWebcam}
            style={{
              background: showWebcamWindow ? "#96419c" : "#803d84",
            }}
          >
            Webcam
          </button>
        </div>

        <Chat
          sessionStatus={sessionStatus}
          showChat={showChatWindow}
          selectedLanguage={language}
          chatMessages={transcriptMessages}
          onUserInput={handleUserResponse}
          errorMessage={errorMessage}
        />

        <WebcamRecorder
          sessionStatus={sessionStatus}
          showWebcam={showWebcamWindow}
          selectedLanguage={language}
          transcriptMessages={transcriptMessages}
          onUserInput={handleUserResponse}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
};

export default Session;
