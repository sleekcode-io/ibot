// Session.tsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import AIBot from "./AIBot";
import "../App.css";
import "../styles/Sessions.css";
import { TranscriptMessageProps } from "./Interfaces";

const Session: React.FC = () => {
  const [userResponse, setUserResponse] = useState<string>("");
  const [sessionId, setSessionId] = useState<number>(-1);
  const [sessionStatus, setSessionStatus] = useState<boolean>(false);
  const [transcriptMessages, setTranscriptMessages] = useState<
    TranscriptMessageProps[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<number>(0);

  let iBotRoles: {
    title: string;
    id: number;
    help: string;
  }[] = [
    {
      title: "Mock (Job) Interview",
      id: 0,
      help: "Prepare you for your next job interview based on your job description with mock interview.",
    },
    {
      title: "Practice A Language",
      id: 1,
      help: "Learn a language of your choice fast by practicing conversation with aiBot, speaking or writing.",
    },
  ];

  let curSessionId = -1;

  // Invoked on component mount
  useEffect(() => {
    console.log(
      "Session: status " + sessionStatus + ", sessionId " + sessionId
    );
    // Keep session alive at all times
    if (!sessionStatus) {
      startSession(selectedRole);
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
      // Comment out this code or the session will not close.
      // window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }); // Empty dependency array ensures the effect runs only once (on mount) and cleans up on unmount

  // End cleanup code ---------------------------------------------------------------------------

  const startSession = async (role: number) => {
    // Start the session
    if (curSessionId >= 0) {
      return; // There is already a session open, do nothing...
    }
    curSessionId = 0; // Set to 0 to indicate session is starting to prevent multiple start
    let response = null;
    try {
      response = await axios.post(
        "http://localhost:5205/conversation/v1/start",
        {
          roleid: role,
        }
      );
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
        "startConversation: " +
        error +
        ". Check your Internet connection and reload web browser to restart. ";
      setErrorMessage(msg);
      return;
    }
    setSessionId(response.data.conversationId);
    curSessionId = response.data.conversationId;
    setUserResponse("");
    setErrorMessage(""); // Clear error message
    setSessionStatus(true);
    console.log("startSession: STARTED (sessionId: %d)", curSessionId);
  };

  const endSession = async () => {
    // End current session
    console.log("Session ended %d", curSessionId);
    if (curSessionId < 0) {
      return; // there is no session open, do nothing...
    }
    console.log("endSession: ENDED session %d", curSessionId);
    setUserResponse("");
    //setBotResponse("");
    let sessId = curSessionId;
    curSessionId = -1;

    // Will cancel ongoing speech, stop listening here ...
    await axios.post("http://localhost:5205/conversation/v1/end", {
      id: sessId,
    });
    curSessionId = -1;
    setSessionId(-1);
    setSessionStatus(false);
  };

  const addTranscriptMessage = (owner: string, message: string) => {
    const getTimestamp = () => {
      const pad = (n: number, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
      const d = new Date();

      return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };
    console.log("addTranscriptMessage: %s>%s", owner, message);
    let msg = {
      timestamp: getTimestamp() + "\n",
      from: owner,
      msg: message,
      spoken: false,
      chatOutput: false,
    };
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
        botResponse = await axios.post(
          "http://localhost:5205/conversation/v1/message",
          {
            id: sessionId,
            content: userResponse,
          }
        );

        // Success, process bot's response
        setUserResponse(""); // Clear user's response buffer

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
          "sendMessage: " +
          error +
          ". Check your connection and/or restart web browser. ";
        setErrorMessage(msg);
      }
    } else {
      setUserResponse(response); // Save user's response so far
    }
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = parseInt(event.target.value, 10);
    setSelectedRole(selectedValue);
    if (selectedValue !== selectedRole) {
      // Restart session
      endSession();
      startSession(selectedValue);
    }

    // You can perform additional actions based on the selected role if needed
    console.log(`Selected Role: ${selectedValue}`);
  };

  return (
    <div className="display-vertical" style={{ marginTop: "0vh" }}>
      <div
        className="error-message"
        style={{
          width: "70vh",
          backgroundColor: errorMessage !== "" ? "orange" : "#ccc",
          padding: errorMessage !== "" ? "5px 10px 20px 10px" : "5px",
          //visibility: errorMessage !== "" ? "visible" : "hidden",
        }}
      >
        {errorMessage !== "" ? errorMessage : " "}
      </div>
      <div
        className="display-horizontal"
        style={{
          width: "80vh",
          marginTop: "2vh",
          marginBottom: "1vh",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: "500" }}>
          What do you want to do today?
        </div>
        <select
          className="display-select"
          style={
            {
              //borderRadius: "0px 35px 35px 0px",
            }
          }
          onChange={handleRoleChange}
          value={selectedRole}
        >
          {iBotRoles.map((role) => (
            <option key={role.title} value={role.id}>
              {role.title}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          width: "10vx",
          color: "#999",
          fontSize: "18px",
          fontWeight: "400",
          marginTop: "1vh",
          marginBottom: "2vh",
          overflowWrap: "anywhere",
        }}
      >
        {`${iBotRoles[selectedRole].help}`}
      </div>
      <div className="session-container">
        <AIBot
          sessionId={sessionId}
          transcriptMessages={transcriptMessages}
          onUserInput={handleUserResponse}
        />
      </div>
    </div>
  );
};

export default Session;
