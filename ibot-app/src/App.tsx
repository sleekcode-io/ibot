// App.tsx
import React from "react";
import Session from "./components/Session";
import iBotImage from "./images/ibotai.png";
import "./App.css";
import "./styles/Sessions.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="App-header">A I B O T</div>
      <div className="App-title-row" style={{ marginTop: "10vh" }}>
        <img src={iBotImage} width="150px" height="150px" alt="Robot" />
        <div
          //className="display-vertical"
          style={{
            fontFamily: "HomemadeRobot",
            fontSize: "50px",
            marginBottom: "2vh",
          }}
        >
          A I B O T
        </div>
      </div>
      <div
        //className="display-vertical"
        style={{
          color: "#ccc",
          fontFamily: "Poppins, sans-serif",
          fontSize: "30px",
          fontWeight: "500",
          marginBottom: "2vh",
        }}
      >
        A Conversational AI Bot
      </div>
      <div>
        <Session />
      </div>
    </div>
  );
};

export default App;
