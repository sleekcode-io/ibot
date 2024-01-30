// Session.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import TextToSpeech from "./TextToSpeech";
import WebcamRecorder from "./WebcamRecorder";
import JobForm from "./JobDescription";
import Chat from "./Chat";
import "../App.css";
import "../styles/Sessions.css";
import { TranscriptMessageProps } from "./Interfaces";

const Session: React.FC = () => {
  // const [botResponse, setBotResponse] = useState<string>("");
  // const [language, setLanguage] = useState("en-US");
  // const [cancelSpeaking, setCancelSpeaking] = useState<boolean>(false);

  const [userResponse, setUserResponse] = useState<string>("");
  const [sessionId, setSessionId] = useState<number>(-1);
  const [sessionStatus, setSessionStatus] = useState<boolean>(false);
  const [showJobWindow, setJobWindow] = useState<boolean>(false);
  const [showChatWindow, setChatWindow] = useState<boolean>(false);
  const [showWebcamWindow, setWebcamWindow] = useState<boolean>(false);
  const [transcriptMessages, setTranscriptMessages] = useState<
    TranscriptMessageProps[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  let curSessionId = -1;

  // Invoked on component mount
  useEffect(() => {
    console.log(
      "Session: status " + sessionStatus + ", sessionId " + sessionId
    );
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
      // Remove the event listener to avoid memory leaks
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
    // Add the event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function for componentWillUnmount
    return () => {
      // DO NOT Remove the event listener here or current session will not be closed.
      // window.removeEventListener("beforeunload", handleBeforeUnload);
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
      curSessionId = -1;
      let msg =
        error +
        ". Check your Internet connection and reload web browser to restart. ";
      setErrorMessage(msg);
      //alert(msg);
      return;
    }
    setSessionId(response.data.sessionId);
    curSessionId = response.data.sessionId;
    setUserResponse("");
    //setBotResponse("");
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
    //setBotResponse("");
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

  // const handleToggleJobWindow = () => {
  //   console.log("handleToggleJobWindow: " + showJobWindow);
  //   if (!showJobWindow) {
  //     // Close chat display, if it is open
  //     if (showChatWindow) {
  //       setChatWindow((prevShowChatWindows) => !prevShowChatWindows);
  //     }
  //     // Close webcam display, if it is open
  //     if (showWebcamWindow) {
  //       setWebcamWindow((prevShowWebcamWindows) => !prevShowWebcamWindows);
  //     }
  //   }
  //   setJobWindow((prevShowJobWindow) => !prevShowJobWindow);
  // };

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

  const addTranscriptMessage = (owner: string, message: string) => {
    console.log("addTranscriptMessage: %s>%s", owner, message);
    let msg = { from: owner, msg: message, processed: false };
    setTranscriptMessages((prevMessages) => [msg, ...prevMessages]);
  };

  const handleUserResponse = async (response: string) => {
    console.log("handleUserResponse: " + response);
    if (sessionId < 0) {
      return; // there is no session open, do nothing...
    } else if (response === "done-speaking" || response === "done-typing") {
      // User pressed stop speaking button
      console.log("Session id: %d userResponse", sessionId, userResponse);

      if (userResponse === "") return;

      // Save user's response to conversation transcript
      addTranscriptMessage("You", userResponse);

      // Send user's response to bot
      let botResponse = null;
      try {
        botResponse = await axios.post("http://localhost:5205/user-message", {
          id: sessionId,
          content: userResponse,
        });

        // Success, process bot's response
        setUserResponse(""); // Clear user's response buffer

        // TODO: Handle bot feedback as needed ...
        // if (showWebcamWindow) {
        //   // User is interacting with voice and webcam
        //   setBotResponse(botResponse.data.response); // Speak bot response
        // }
        // Save bot response to conversation transcript
        addTranscriptMessage("iBot", botResponse.data.response);
      } catch (e: unknown) {
        let error = "";
        if (typeof e === "string") {
          error = e.toUpperCase();
        } else if (e instanceof Error) {
          error = e.message;
        }
        console.error("handleUserResponse error: " + error);
        let msg =
          error + ". Check your connection and/or restart web browser. ";
        setErrorMessage(msg);
      }
    } else {
      setUserResponse(response); // Save user's response so far
    }
  };

  // Handle language/voice change in TextToSpeech component
  // const handleLangChanged = async (lang: string) => {
  //   console.log("handleLangChanged: old %s new %s", language, lang);
  //   setLanguage(lang);
  //   //setBotResponse(""); // Clear bot's response buffer
  // };

  // const handleFormSubmit = async (jobTitle: string, jobDescription: string) => {
  //   console.log("handleFormSubmit: " + jobTitle);
  //   if (sessionId < 0) {
  //     return; // there is no session open, do nothing...
  //   }
  //   // Send job data to bot
  //   let botResponse = null;
  //   try {
  //     botResponse = await axios.post("http://localhost:5205/job-data", {
  //       id: sessionId,
  //       content: jobTitle + ", " + jobDescription,
  //     });
  //   } catch (e: unknown) {
  //     let error = "";
  //     if (typeof e === "string") {
  //       error = e.toUpperCase();
  //     } else if (e instanceof Error) {
  //       error = e.message;
  //     }
  //     console.error("handleUserResponse error: " + error);
  //     let msg =
  //       error + ". Check your connection and/or reload browser to restart. ";
  //     setErrorMessage(msg);
  //   }
  // };

  return (
    <div className="display-vertical" style={{ marginTop: "0vh" }}>
      <div
        className="error-message"
        style={{
          backgroundColor: errorMessage !== "" ? "orange" : "#ccc",
          padding: errorMessage !== "" ? "5px 10px 20px 10px" : "5px",
          //visibility: errorMessage !== "" ? "visible" : "hidden",
        }}
      >
        {errorMessage !== "" ? errorMessage : " "}
      </div>
      <div className="session-container">
        {/* <TextToSpeech
          cancelSpeaking={false}
          text={botResponse}
          onLangChanged={handleLangChanged}
        /> */}
        {/*
        <button
          className="job-toggle-button"
          onClick={handleToggleJobWindow}
          style={{
            background: showJobWindow ? "#96419c" : "#803d84",
          }}
        >
          Job Details
        </button>
        <JobForm
          sessionId={sessionId}
          mode={"submission"}
          showJobWindow={showJobWindow}
          errorMessage={errorMessage}
          onClose={handleToggleJobWindow}
        /> */}

        <div className="display-horizontal">
          <button
            className="toggle-button"
            onClick={handleToggleChat}
            style={{
              background: showChatWindow ? "#96419c" : "#803d84",
            }}
          >
            Chat
          </button>
          <button
            className="toggle-button"
            onClick={handleToggleWebcam}
            style={{
              background: showWebcamWindow ? "#96419c" : "#803d84",
            }}
          >
            Voice
          </button>
        </div>

        <Chat
          sessionStatus={sessionStatus}
          showChat={showChatWindow}
          chatMessages={transcriptMessages}
          onUserInput={handleUserResponse}
        />

        <WebcamRecorder
          sessionId={sessionId}
          showWebcam={showWebcamWindow}
          //botResponse={botResponse}
          transcriptMessages={transcriptMessages}
          onUserInput={handleUserResponse}
        />
      </div>
    </div>
  );
};

export default Session;
