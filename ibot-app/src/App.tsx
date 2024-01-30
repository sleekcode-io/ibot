// App.tsx
import React from "react";
import Session from "./components/Session";
import iBotImage from "./images/ibotai.png";
import "./App.css";
import "./styles/Sessions.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="App-title-row">
        <img src={iBotImage} width="150px" height="150px" alt="Robot" />
        <div
          //className="display-vertical"
          style={{
            fontFamily: "HomemadeRobot",
            fontSize: "50px",
            marginBottom: "2vh",
          }}
        >
          I B O T
        </div>
      </div>
      <div
        //className="display-vertical"
        style={{
          color: "#ccc",
          fontFamily: "Poppins, sans-serif",
          fontSize: "0.6em",
          fontWeight: "500",
          marginBottom: "2vh",
        }}
      >
        A Conversational AI Bot for Job Interviews
      </div>
      <div>
        <Session />
      </div>
    </div>
  );
};

export default App;
