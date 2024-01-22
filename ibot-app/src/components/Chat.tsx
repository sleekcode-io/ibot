// Session.tsx
import React, { useEffect, useState } from "react";
//import "../styles/Sessions.css";
import "../styles/Chat.css";
import TranscriptDownloadImage from "../images/transcript-download.png";
import iBotAvatar from "../images/ibotai.png";
import userAvatar from "../images/user-avatar.png";
import SendImage from "../images/send-message.png";

interface ChatProps {
  sessionStatus: boolean;
  chatWindowStatus: boolean;
  selectedLanguage: string;
  chatMessages: string[];
  onUserInput: (text: string) => void;
  onChatWindowStatus: (chatWindowStatus: boolean) => void;
}

const Chat: React.FC<ChatProps> = ({
  sessionStatus,
  chatWindowStatus,
  selectedLanguage,
  chatMessages,
  onUserInput,
  // Remove the duplicate declaration of 'onChatWindowStatus'
  onChatWindowStatus,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Invoked on component mount
  useEffect(() => {
    console.log(
      "Chat: sessionStatus " +
        sessionStatus +
        ", chatWindowStatus " +
        chatWindowStatus
    );

    setShowChat(chatWindowStatus);
  }, [sessionStatus, chatWindowStatus]);

  const handleToggleShowChatWindow = () => {
    console.log("handleToggleChat");
    if (showChat) {
      // Clear chat display
      closeChatWindow();
      onChatWindowStatus(false);
    } else {
      // Show chat display
      showChatWindow();
      onChatWindowStatus(true);
    }
    setShowChat((prevShowChat) => !prevShowChat);
  };

  // const handleToggleShowTranscript = () => {
  //   console.log("handleToggleShowTranscript");
  //   if (showTranscript) {
  //     // Clear transcript display
  //   }
  //   setShowTranscript((prevShowTranscript) => !prevShowTranscript);
  // };

  const handleDownloadTranscript = () => {
    console.log("handleDownloadTranscript");
    if (chatMessages.length === 0) {
      // No transcript to download
      return;
    }
    // Download transcript
    const element = document.createElement("a");
    const file = new Blob([chatMessages.reverse().join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  // This function does not pick up Enter key press, only text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleInputChange: " + e.target.value);
    if (!showTranscript) {
      setShowTranscript(true); // user uses text input, enable show transcript
    }
    // pick up user's kb input here ...
    setUserInput(e.target.value);
    onUserInput(e.target.value);
  };

  // This function picks up Enter key press as well as text input (skipped here)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("handleKeyPress: " + e.key);
    if (e.key === "Enter") {
      // User pressed the Enter key
      if (userInput.trim() !== "") {
        // User entered a non-empty string, send to bot for processing
        // and clear the input field
        onUserInput(".");
        setUserInput("");
      }
    }
  };

  // This function is triggered when user clicks on Send button
  const handleSend = () => {
    console.log("handleSend");
    if (userInput.trim() !== "") {
      // Send user input to bot for processing and responding
      // Also, clear the input field
      onUserInput(".");
      setUserInput("");
    }
  };

  const handleMessageDisplay = (message: string) => {
    console.log("handleMessageDisplay: " + message);
    if (message === "") {
      return;
    }
    // Display message
    if (message.startsWith("iBot>")) {
      // Bot's message
      return (
        <div
          className="bot-message-container"
          // style={{
          //   display: "flex",
          //   justifyContent: "start",
          //   marginLeft: "10px",
          //   marginRight: "10px",
          //   alignItems: "top",
          //   marginBottom: "10px",
          // }}
        >
          <div
            className="bot-avatar"
            // style={
            //   {
            //     //marginLeft: "0px",
            //     marginTop: "0px",
            //     padding: "0px 8px",
            //     alignItems: "center",
            //   }
            // }
          >
            <img src={iBotAvatar} alt="iBot" width="50px" height="50px" />
          </div>
          <div
            className="bot-message"
            // style={{
            //   display: "flex",
            //   marginTop: "20px",
            //   marginRight: "65px",
            //   padding: "8px 8px",
            //   border: "none",
            //   borderRadius: "0px 15px 15px 15px",
            //   backgroundColor: "#803d84",
            //   justifyContent: "start",
            //   color: "#fff",
            // }}
          >
            {message.slice(5)}
          </div>
        </div>
      );
    } else {
      return (
        <div
          className="user-message-container"
          // style={
          //   {
          //     display: "flex",
          //     justifyContent: "end",
          //     marginLeft: "10px",
          //     marginRight: "10px",
          //     alignItems: "top",
          //     marginBottom: "10px",
          //     //marginTop: "10px",
          //   }
          // }
        >
          <div
            className="user-message"
            // style={{
            //   display: "flex",
            //   marginTop: "20px",
            //   marginLeft: "65px",
            //   padding: "8px 8px",
            //   border: "none",
            //   borderRadius: "15px 0px 15px 15px",
            //   backgroundColor: "#7a69f5",
            //   justifyContent: "start",
            //   color: "#fff",
            // }}
          >
            {message.slice(5)}
          </div>
          <div
            className="user-avatar"
            // style={{
            //   marginLeft: "10px",
            //   padding: "0px 8px",
            //   alignItems: "center",
            // }}
          >
            <img src={userAvatar} alt="iBot" width="40px" height="40px" />
          </div>
        </div>
      );
    }
  };

  const closeChatWindow = (): void => {
    console.log("closeChatWindow");
  };

  const showChatWindow = () => {
    console.log("showChatWindow");
    return (
      <div className="chat-window">
        <div className="chat-message-container">
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
            placeholder="Type your message..."
          />
          <button
            className="chat-button"
            onClick={handleSend}
            style={{
              backgroundColor: userInput !== "" ? "#fff" : "#d8d8d8",
            }}
          >
            <div className="tooltip">
              <img src={SendImage} alt="S" width="18px" height="18px" />
              {userInput !== "" ? (
                <span className="tooltiptext">Send user input</span>
              ) : (
                <span className="tooltiptext">No input data to send</span>
              )}
            </div>
          </button>
          <button
            className="chat-button"
            onClick={handleDownloadTranscript}
            style={{
              backgroundColor: chatMessages.length ? "#fff" : "#d8d8d8",
            }}
          >
            <div className="tooltip">
              <img
                src={TranscriptDownloadImage}
                alt="D"
                width="18px"
                height="18px"
              />
              {chatMessages.length === 0 ? (
                <span className="tooltiptext">
                  No transcript data for download
                </span>
              ) : (
                <span className="tooltiptext">Download transcript</span>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  };

  // main return
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="display-vertical">
        <button
          className="chat-button"
          onClick={handleToggleShowChatWindow}
          style={{
            marginTop: "20px",
            background: showChat ? "#96419c" : "#803d84",
            color: "#ddd",
            borderRadius: "50px",
            border: "none",
            width: "600px",
            height: "50px",
            writingMode: "inherit",
            padding: "10px",
            alignItems: "top",
            fontSize: "20px",
            fontWeight: "700",
          }}
        >
          Chat
        </button>
        {showChat && (
          <div className="chat-window-container">{showChatWindow()}</div>
        )}
      </div>
    </div>
  );
};

export default Chat;
