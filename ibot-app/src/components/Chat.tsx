// Session.tsx
import React, { useEffect, useState } from "react";
import TranscriptDownloadImage from "../images/transcript-download.png";
import iBotAvatar from "../images/ibotai.png";
import userAvatar from "../images/user-avatar.png";
import SendImage from "../images/send-message.png";
import "../styles/Chat.css";
import "../App.css";

interface ChatProps {
  sessionStatus: boolean;
  showChat: boolean;
  selectedLanguage: string;
  chatMessages: string[];
  onUserInput: (text: string) => void;
  errorMessage: string;
}

const Chat: React.FC<ChatProps> = ({
  sessionStatus,
  showChat,
  selectedLanguage,
  chatMessages,
  onUserInput,
  errorMessage,
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  const [userInput, setUserInput] = useState("");

  // Invoked on component mount
  useEffect(() => {
    console.log(
      "Chat: sessionStatus " + sessionStatus + ", showChat " + showChat
    );
  }, [sessionStatus, showChat]);

  // This function is triggered when user clicks on Download Transcript button
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
        onUserInput("done-typing");
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
      onUserInput("done-typing");
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
        <div className="bot-message-container">
          <div className="bot-avatar">
            <img src={iBotAvatar} alt="iBot" width="50px" height="50px" />
          </div>
          <div className="bot-message">{message.slice(5)}</div>
        </div>
      );
    } else {
      return (
        <div className="user-message-container">
          <div className="user-message">{message.slice(5)}</div>
          <div className="user-avatar">
            <img src={userAvatar} alt="iBot" width="40px" height="40px" />
          </div>
        </div>
      );
    }
  };

  const showChatWindow = () => {
    console.log("showChatWindow");
    return (
      <div className="display-vertical">
        <div
          className="error-message"
          style={{
            visibility: errorMessage !== "" ? "visible" : "hidden",
          }}
        >
          {errorMessage}
        </div>
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
      </div>
    );
  };

  // main return
  return (
    <div>
      {showChat && (
        <div
          className="chat-container"
          style={{
            backgroundColor: "#96419c",
          }}
        >
          {showChatWindow()}
        </div>
      )}
    </div>
  );
};

export default Chat;
